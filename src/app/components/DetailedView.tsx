"use client";

import { useState, useEffect } from "react";
import { convertTemp, formatTemp, getTempColor } from "../utils/convertTemp";
import {
  fetchWeatherByCoords,
  fetchForecastByCoords,
  WeatherData,
  ForecastData,
} from "../services/weatherService";

interface DetailedViewProps {
  location: { lat: number; lng: number; city?: string };
  isCelsius: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}

export default function DetailedView({
  location,
  isCelsius,
  onClose,
  style,
}: DetailedViewProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "hourly" | "daily">(
    "current"
  );
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!apiKey) {
        setError(
          "Missing API key. Please add your OpenWeatherMap API key to the .env.local file."
        );
        setLoading(false);
        return;
      }

      if (!location.lat || !location.lng) {
        setError(
          "Missing location data. Please try selecting a different location."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          `Fetching weather data for: ${
            location.city || `${location.lat}, ${location.lng}`
          }`
        );

        // Use our service functions to fetch data
        const weatherData = await fetchWeatherByCoords(
          location.lat,
          location.lng,
          apiKey,
          location.city
        );

        // Validate the weather data structure
        if (!weatherData || typeof weatherData !== "object") {
          throw new Error("Invalid weather data received");
        }

        // Convert to WeatherData format
        const weatherDataFormatted: WeatherData = {
          coord: {
            lat: weatherData.lat || location.lat,
            lon: weatherData.lng || location.lng,
          },
          main: {
            temp: weatherData.tempKelvin || 0,
            humidity: 0,
            pressure: 0,
            feels_like: 0,
            temp_min: 0,
            temp_max: 0,
          },
          weather: [
            {
              id: 0,
              main: "",
              description: weatherData.weather || "Unknown",
              icon: weatherData.icon
                ? weatherData.icon.split("/").pop()?.replace(".png", "") || ""
                : "",
            },
          ],
          wind: { speed: 0, deg: 0 },
          clouds: { all: 0 },
          name: weatherData.city || "",
          dt: Date.now() / 1000,
          sys: {
            country: "",
            sunrise: Date.now() / 1000,
            sunset: Date.now() / 1000 + 43200, // 12 hours later
          },
        };

        // Try to fetch forecast data
        let forecastData;
        try {
          forecastData = await fetchForecastByCoords(
            location.lat,
            location.lng,
            apiKey
          );
        } catch (forecastErr) {
          console.error("Error fetching forecast data:", forecastErr);
          // Create a minimal forecast structure
          forecastData = {
            list: [],
            city: {
              id: 0,
              name: weatherData.city || "",
              coord: { lat: location.lat, lon: location.lng },
              country: "",
              sunrise: Date.now() / 1000,
              sunset: Date.now() / 1000 + 43200,
            },
          };
        }

        console.log("Weather data fetched successfully");
        setCurrentWeather(weatherDataFormatted);
        setForecast(forecastData);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error fetching weather data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location.lat, location.lng, location.city, apiKey]);

  // Format date for forecast display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Group forecast by day
  const getDailyForecast = () => {
    if (!forecast) return [];

    interface DailyData {
      date: string;
      temps: number[];
      icons: string[];
      descriptions: string[];
    }

    const dailyData: Record<string, DailyData> = {};

    forecast.list.forEach((item) => {
      const date = new Date(item.dt_txt);
      const day = date.toISOString().split("T")[0];

      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          temps: [],
          icons: [],
          descriptions: [],
        };
      }

      dailyData[day].temps.push(item.main.temp);
      dailyData[day].icons.push(item.weather[0].icon);
      dailyData[day].descriptions.push(item.weather[0].description);
    });

    return Object.values(dailyData).map((day) => ({
      date: new Date(day.date),
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps),
      // Use the most frequent icon and description
      icon: getMostFrequent(day.icons),
      description: getMostFrequent(day.descriptions),
    }));
  };

  // Helper to get most frequent item in array
  const getMostFrequent = (arr: string[]) => {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
  };

  if (loading) {
    return (
      <div
        style={{
          position: style ? "relative" : "fixed",
          top: style ? "auto" : "50%",
          left: style ? "auto" : "50%",
          transform: style ? "none" : "translate(-50%, -50%)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          padding: "20px",
          zIndex: style?.zIndex || 100,
          textAlign: "center",
          minWidth: style ? "100%" : "300px",
          height: style ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...style,
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2196F3",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation: "spin 2s linear infinite",
            }}
          />
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
        <h2 style={{ margin: "0", fontSize: "18px", color: "#333" }}>
          Loading weather data...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: style ? "relative" : "fixed",
          top: style ? "auto" : "50%",
          left: style ? "auto" : "50%",
          transform: style ? "none" : "translate(-50%, -50%)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          padding: "20px",
          zIndex: style?.zIndex || 100,
          color: "#d32f2f",
          minWidth: style ? "100%" : "300px",
          height: style ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ...style,
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Error</h2>
        <p style={{ margin: "0", fontSize: "14px" }}>{error}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: "15px",
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: style ? "relative" : "fixed",
        top: style ? "auto" : "50%",
        left: style ? "auto" : "50%",
        transform: style ? "none" : "translate(-50%, -50%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        padding: "0",
        overflowY: "auto",
        zIndex: style?.zIndex || 100,
        color: "#333",
        maxWidth: style ? "100%" : "90%",
        width: style ? "100%" : "600px",
        height: style ? "100%" : "auto",
        maxHeight: style ? "100%" : "90vh",
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #eee",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          zIndex: 1,
        }}
      >
        <h2 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "bold" }}>
          {location.city ||
            `Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`}
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "8px",
            backgroundColor: "transparent",
            color: "#666",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #eee",
          backgroundColor: "#f9f9f9",
        }}
      >
        <button
          onClick={() => setActiveTab("current")}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: activeTab === "current" ? "#fff" : "transparent",
            color: activeTab === "current" ? "#2196F3" : "#666",
            border: "none",
            borderBottom:
              activeTab === "current" ? "2px solid #2196F3" : "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === "current" ? "bold" : "normal",
          }}
        >
          Current
        </button>
        <button
          onClick={() => setActiveTab("hourly")}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: activeTab === "hourly" ? "#fff" : "transparent",
            color: activeTab === "hourly" ? "#2196F3" : "#666",
            border: "none",
            borderBottom: activeTab === "hourly" ? "2px solid #2196F3" : "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === "hourly" ? "bold" : "normal",
          }}
        >
          Hourly
        </button>
        <button
          onClick={() => setActiveTab("daily")}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: activeTab === "daily" ? "#fff" : "transparent",
            color: activeTab === "daily" ? "#2196F3" : "#666",
            border: "none",
            borderBottom: activeTab === "daily" ? "2px solid #2196F3" : "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === "daily" ? "bold" : "normal",
          }}
        >
          Daily
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px",
          height: "400px" /* Fixed height */,
          overflowY: "auto",
          boxSizing: "border-box" as const,
        }}
      >
        <div>
          {activeTab === "current" &&
            currentWeather &&
            currentWeather.main &&
            currentWeather.weather &&
            currentWeather.weather[0] && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  {currentWeather.weather[0].icon && (
                    <img
                      src={`https://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`}
                      alt={currentWeather.weather[0].description}
                      style={{ width: "80px", height: "80px" }}
                    />
                  )}
                  <h3
                    style={{
                      fontSize: "2.5rem",
                      margin: "10px 0",
                      color: getTempColor(
                        convertTemp(currentWeather.main.temp, isCelsius),
                        isCelsius
                      ),
                      fontWeight: "bold",
                    }}
                  >
                    {formatTemp(
                      convertTemp(currentWeather.main.temp, isCelsius),
                      isCelsius
                    )}
                  </h3>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      margin: "0",
                      textTransform: "capitalize",
                      color: "#555",
                    }}
                  >
                    {currentWeather.weather[0].description}
                  </p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      margin: "5px 0 0 0",
                      color: "#777",
                    }}
                  >
                    Feels like{" "}
                    {formatTemp(
                      convertTemp(currentWeather.main.feels_like, isCelsius),
                      isCelsius
                    )}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "15px",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      HUMIDITY
                    </h4>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      {currentWeather.main.humidity}%
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      WIND
                    </h4>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      {currentWeather.wind.speed} m/s
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      PRESSURE
                    </h4>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      {currentWeather.main.pressure} hPa
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      CLOUDS
                    </h4>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    >
                      {currentWeather.clouds.all}%
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 5px 0",
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        SUNRISE
                      </h4>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(
                          currentWeather.sys.sunrise * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: "0 0 5px 0",
                          fontSize: "0.9rem",
                          color: "#666",
                          textAlign: "right",
                        }}
                      >
                        SUNSET
                      </h4>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {new Date(
                          currentWeather.sys.sunset * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {activeTab === "hourly" && forecast && (
            <div style={{ minHeight: "400px" }}>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                }}
              >
                {forecast.list.slice(0, 24).map((item, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: "1" }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        {formatDate(item.dt_txt)}
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "0.85rem",
                          color: "#777",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.weather[0].description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: "100px",
                        justifyContent: "flex-end",
                      }}
                    >
                      {item.weather[0].icon && (
                        <img
                          src={`https://openweathermap.org/img/w/${item.weather[0].icon}.png`}
                          alt={item.weather[0].description}
                          style={{
                            width: "40px",
                            height: "40px",
                            marginRight: "8px",
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          color: getTempColor(
                            convertTemp(item.main.temp, isCelsius),
                            isCelsius
                          ),
                        }}
                      >
                        {formatTemp(
                          convertTemp(item.main.temp, isCelsius),
                          isCelsius
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "daily" && forecast && (
            <div style={{ minHeight: "400px" }}>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "0",
                }}
              >
                {getDailyForecast().map((day, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: "1" }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#444",
                        }}
                      >
                        {day.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "0.9rem",
                          color: "#777",
                          textTransform: "capitalize",
                        }}
                      >
                        {day.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: "140px",
                        justifyContent: "flex-end",
                      }}
                    >
                      {day.icon && (
                        <img
                          src={`https://openweathermap.org/img/w/${day.icon}.png`}
                          alt={day.description}
                          style={{
                            width: "40px",
                            height: "40px",
                            marginRight: "10px",
                          }}
                        />
                      )}
                      <div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            color: getTempColor(
                              convertTemp(day.maxTemp, isCelsius),
                              isCelsius
                            ),
                            textAlign: "right",
                          }}
                        >
                          {formatTemp(
                            convertTemp(day.maxTemp, isCelsius),
                            isCelsius
                          )}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.9rem",
                            color: "#666",
                            textAlign: "right",
                          }}
                        >
                          {formatTemp(
                            convertTemp(day.minTemp, isCelsius),
                            isCelsius
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
