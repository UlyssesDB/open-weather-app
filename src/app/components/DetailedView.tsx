"use client";

import { useState, useEffect } from "react";
import { convertTemp } from "../utils/convertTemp";

interface DetailedViewProps {
  location: { lat: number; lng: number; city?: string };
  isCelsius: boolean;
  onClose: () => void;
}

interface WeatherData {
  main: { temp: number; humidity: number; pressure: number };
  weather: { description: string }[];
  wind: { speed: number; deg: number };
  clouds: { all: number };
  rain?: { "3h"?: number };
}

interface ForecastData {
  list: {
    dt_txt: string;
    main: { temp: number };
    weather: { description: string }[];
    wind: { speed: number };
    clouds: { all: number };
    rain?: { "3h"?: number };
  }[];
}

export default function DetailedView({
  location,
  isCelsius,
  onClose,
}: DetailedViewProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const [cache, setCache] = useState<
    Record<string, { current: WeatherData; forecast: ForecastData }>
  >({});

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!apiKey || !location.lat || !location.lng) {
        setError("Missing API key or location data");
        setLoading(false);
        return;
      }

      const cacheKey = `${location.lat},${location.lng}`;
      if (cache[cacheKey]) {
        setCurrentWeather(cache[cacheKey].current);
        setForecast(cache[cacheKey].forecast);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const currentResponse = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}`
        );
        if (!currentResponse.ok)
          throw new Error("Failed to fetch current weather");
        const currentData = await currentResponse.json();
        setCurrentWeather(currentData);

        const forecastResponse = await fetch(
          `http://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}`
        );
        if (!forecastResponse.ok) throw new Error("Failed to fetch forecast");
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);

        setCache((prev) => ({
          ...prev,
          [cacheKey]: { current: currentData, forecast: forecastData },
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location.lat, location.lng, apiKey]);

  if (loading) {
    return (
      <div
        style={{
          gridColumn: "2 / 6",
          gridRow: "1 / 8",
          backgroundColor: "white",
          padding: "10px",
          zIndex: 10,
          color: "black",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          gridColumn: "2 / 6",
          gridRow: "1 / 8",
          backgroundColor: "white",
          padding: "10px",
          zIndex: 10,
          color: "black",
        }}
      >
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        gridColumn: "1 / 7",
        gridRow: "2 / -1",
        backgroundColor: "white",
        padding: "10px",
        overflowY: "auto",
        zIndex: 10,
        margin: "-50px 0px 10px 10px",
        color: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "18px" }}>
          Details for {location.city || `${location.lat}, ${location.lng}`}
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "5px 10px",
            backgroundColor: "#ff4444",
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
      {currentWeather && (
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "16px", margin: "0 0 5px 0" }}>
            Current Weather
          </h3>
          <p>
            Temperature:{" "}
            {convertTemp(currentWeather.main.temp, isCelsius).toFixed(1)}°
            {isCelsius ? "C" : "F"}
          </p>
          <p>Condition: {currentWeather.weather[0].description}</p>
          <p>Humidity: {currentWeather.main.humidity}%</p>
          <p>Pressure: {currentWeather.main.pressure} hPa</p>
          <p>
            Wind: {currentWeather.wind.speed} m/s, {currentWeather.wind.deg}°
          </p>
          <p>Clouds: {currentWeather.clouds.all}%</p>
          {currentWeather.rain && currentWeather.rain["3h"] && (
            <p>Rain (3h): {currentWeather.rain["3h"]} mm</p>
          )}
        </div>
      )}
      {forecast && (
        <div>
          <h3 style={{ fontSize: "16px", margin: "0 0 5px 0" }}>
            5-Day Forecast (3-Hour Intervals)
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: "0",
              margin: "0",
            }}
          >
            {forecast.list.slice(0, 40).map((item, index) => (
              <li
                key={index}
                style={{
                  padding: "5px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px",
                }}
              >
                <span>
                  {new Date(item.dt_txt).toLocaleString()}:{" "}
                  {convertTemp(item.main.temp, isCelsius).toFixed(1)}°
                  {isCelsius ? "C" : "F"}, {item.weather[0].description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
