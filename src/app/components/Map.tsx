"use client";

import { useState, useEffect, useCallback } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { convertTemp } from "../utils/convertTemp";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 50,
  lng: -50,
};

interface MapProps {
  style?: React.CSSProperties;
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  isLoaded: boolean;
  isCelsius: boolean;
  addFavorite?: (city: string, lat: number, lng: number) => void;
  fetchWeatherByCoords: (
    lat: number,
    lng: number,
    city?: string
  ) => Promise<{
    city?: string;
    lat: number;
    lng: number;
    tempKelvin: number; // Expect raw Kelvin
    weather?: string;
    icon?: string;
  }>;
}

export default function Map({
  style,
  onLocationSelect,
  selectedLocation,
  isLoaded,
  isCelsius,
  addFavorite,
  fetchWeatherByCoords,
}: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geoJSON, setGeoJSON] = useState<{ type: string; features: any[] }>({
    type: "FeatureCollection",
    features: [],
  });
  const [gettingData, setGettingData] = useState(false);
  const [infoWindow, setInfoWindow] = useState<{
    lat: number;
    lng: number;
    city: string;
    tempKelvin: number; // Raw Kelvin from API
    weather: string;
    icon: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const checkIfDataRequested = useCallback(() => {
    if (gettingData || !map) return;
    getCoords();
  }, [gettingData, map]);

  const getCoords = useCallback(() => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    getWeather(ne.lat(), ne.lng(), sw.lat(), sw.lng());
  }, [map]);

  const getWeather = useCallback(
    debounce(
      async (
        northLat: number,
        eastLng: number,
        southLat: number,
        westLng: number
      ) => {
        if (!apiKey) {
          setError("OpenWeatherMap API key is missing");
          return;
        }
        if (gettingData) return;
        setGettingData(true);
        setError(null);
        const requestString = `http://api.openweathermap.org/data/2.5/box/city?bbox=${westLng},${northLat},${eastLng},${southLat},${map?.getZoom()}&cluster=yes&format=json&APPID=${apiKey}`;

        try {
          const response = await fetch(requestString);
          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: "Unknown error" }));
            throw new Error(
              `Weather API error: ${errorData.message} (Status: ${response.status})`
            );
          }
          const results = await response.json();
          if (results.list?.length > 0) {
            console.log("Map - Raw weather data from /box/city:", results.list);
            resetData();
            const newFeatures = results.list.map(jsonToGeoJson);
            setGeoJSON((prev) => ({ ...prev, features: newFeatures }));
            drawIcons(newFeatures);
          }
        } catch (error) {
          console.error("Map - Failed to fetch weather data:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Unknown error fetching weather data"
          );
        } finally {
          setGettingData(false);
        }
      },
      500
    ),
    [map, apiKey]
  );

  const jsonToGeoJson = (weatherItem: any): google.maps.Data.Feature => {
    const tempKelvin = weatherItem.main.temp;
    console.log(
      `Map - ${weatherItem.name} raw temp from API (Kelvin):`,
      tempKelvin
    );
    return new google.maps.Data.Feature({
      properties: {
        city: weatherItem.name,
        weather: weatherItem.weather[0].main,
        temperature: tempKelvin,
        icon: `http://openweathermap.org/img/w/${weatherItem.weather[0].icon}.png`,
      },
      geometry: new google.maps.Data.Point({
        lat: weatherItem.coord.Lat,
        lng: weatherItem.coord.Lon,
      }),
    });
  };

  const resetData = () => {
    setGeoJSON({ type: "FeatureCollection", features: [] });
    map?.data.forEach((feature) => map.data.remove(feature));
  };

  const drawIcons = (features: google.maps.Data.Feature[]) => {
    if (map) {
      features.forEach((feature) => map.data.add(feature));
    }
  };

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !onLocationSelect) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onLocationSelect({ lat, lng });
    },
    [onLocationSelect]
  );

  const handleAddFavorite = (city: string, lat: number, lng: number) => {
    console.log(
      `Map - HandleAddFavorite clicked for ${city}, lat: ${lat}, lng: ${lng}`
    );
    if (addFavorite) {
      addFavorite(city, lat, lng);
      setInfoWindow(null);
    }
  };

  useEffect(() => {
    if (map) {
      const idleListener = google.maps.event.addListener(
        map,
        "idle",
        checkIfDataRequested
      );
      const clickListener = google.maps.event.addListener(
        map,
        "click",
        handleMapClick
      );
      const dataClickListener = map.data.addListener(
        "click",
        async (event: google.maps.Data.MouseEvent) => {
          const feature = event.feature;
          const lat = event.latLng!.lat();
          const lng = event.latLng!.lng();
          const city = feature.getProperty("city") as string;
          const tempKelvin = feature.getProperty("temperature") as number;
          console.log(
            `Map - Clicked ${city}, tempKelvin from /box/city: ${tempKelvin}`
          );

          try {
            const weatherData = await fetchWeatherByCoords(lat, lng, city);
            setInfoWindow({
              lat,
              lng,
              city,
              tempKelvin: weatherData.tempKelvin, // Use raw Kelvin from fetch
              weather: weatherData.weather || "",
              icon: weatherData.icon || "",
            });
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, city });
            }
          } catch (error) {
            console.error(`Map - Error fetching weather for ${city}:`, error);
            setError("Failed to load weather data");
          }
        }
      );

      return () => {
        google.maps.event.removeListener(idleListener);
        google.maps.event.removeListener(clickListener);
        google.maps.event.removeListener(dataClickListener);
      };
    }
  }, [
    map,
    checkIfDataRequested,
    handleMapClick,
    onLocationSelect,
    addFavorite,
    fetchWeatherByCoords,
  ]);

  useEffect(() => {
    if (map && selectedLocation) {
      map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(10);
    }
  }, [map, selectedLocation]);

  const InfoWindowContent = ({
    city,
    lat,
    lng,
    tempKelvin,
    weather,
    icon,
  }: {
    city: string;
    lat: number;
    lng: number;
    tempKelvin: number;
    weather: string;
    icon: string;
  }) => (
    <div style={{ textAlign: "center" }}>
      <img src={icon} alt="weather icon" />
      <br />
      <strong>{city}</strong>
      <br />
      {convertTemp(tempKelvin, isCelsius).toFixed(1)}°{isCelsius ? "C" : "F"}
      <br />
      {weather}
      <br />
      <button
        onClick={() => handleAddFavorite(city, lat, lng)}
        style={{
          marginTop: "5px",
          padding: "5px 10px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add to Favorites
      </button>
    </div>
  );

  if (!apiKey) {
    console.error("Missing OpenWeatherMap API key");
    return (
      <div style={{ ...style, color: "red" }}>
        Error: Missing OpenWeatherMap API key
      </div>
    );
  }
  if (error) {
    return <div style={{ ...style, color: "red" }}>{error}</div>;
  }

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={4}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            draggable: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {infoWindow && (
            <InfoWindow
              position={{ lat: infoWindow.lat, lng: infoWindow.lng }}
              options={{ pixelOffset: new google.maps.Size(0, -15) }}
              onCloseClick={() => setInfoWindow(null)}
            >
              <InfoWindowContent
                city={infoWindow.city}
                lat={infoWindow.lat}
                lng={infoWindow.lng}
                tempKelvin={infoWindow.tempKelvin}
                weather={infoWindow.weather}
                icon={infoWindow.icon}
              />
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
