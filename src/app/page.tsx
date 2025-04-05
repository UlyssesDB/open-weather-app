"use client";

import { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import Favorites from "./components/Favorites";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import ToggleSwitch from "./components/ToggleSwitch";
import DetailedView from "./components/DetailedView";
import { convertTemp } from "./utils/convertTemp";

const libraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
)[] = ["places"];

interface WeatherData {
  coord: { lat: number; lon: number };
  main: { temp: number; humidity: number; pressure: number };
  weather: { description: string; icon: string }[];
  wind: { speed: number; deg: number };
  clouds: { all: number };
  rain?: { "3h"?: number };
}

interface Location {
  lat: number;
  lng: number;
  city?: string;
  temp: number;
  weather?: string;
  icon?: string;
}

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries,
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isCelsius, setIsCelsius] = useState(false);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [weatherCache, setWeatherCache] = useState<Record<string, WeatherData>>(
    {}
  );
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchWeatherByCity = async (city: string): Promise<Location> => {
    if (weatherCache[city]) {
      const cached = weatherCache[city];
      return {
        city,
        lat: cached.coord.lat,
        lng: cached.coord.lon,
        temp: convertTemp(cached.main.temp, isCelsius),
        weather: cached.weather[0]?.description,
        icon: cached.weather[0]?.icon
          ? `http://openweathermap.org/img/w/${cached.weather[0].icon}.png`
          : undefined,
      };
    }
    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to fetch weather for ${city}: ${errorData.message} (Status: ${response.status})`
        );
      }
      const data: WeatherData = await response.json();
      console.log(
        `page.tsx - Fetched ${city} raw temp (Kelvin): ${data.main.temp}`
      );
      setWeatherCache((prev) => ({ ...prev, [city]: data }));
      return {
        city,
        lat: data.coord.lat,
        lng: data.coord.lon,
        temp: convertTemp(data.main.temp, isCelsius),
        weather: data.weather[0]?.description,
        icon: data.weather[0]?.icon
          ? `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
          : undefined,
      };
    } catch (error) {
      console.error(
        `page.tsx - Error in fetchWeatherByCity for ${city}:`,
        error
      );
      setApiError(
        error instanceof Error ? error.message : "Unknown fetch error"
      );
      return { city, lat: 0, lng: 0, temp: 0 };
    }
  };

  const fetchWeatherByCoords = async (
    lat: number,
    lng: number,
    city?: string
  ): Promise<Location> => {
    const cacheKey = `${lat},${lng}`;
    if (weatherCache[cacheKey]) {
      const cached = weatherCache[cacheKey];
      return {
        city,
        lat: cached.coord.lat,
        lng: cached.coord.lon,
        temp: convertTemp(cached.main.temp, isCelsius),
        weather: cached.weather[0]?.description,
        icon: cached.weather[0]?.icon
          ? `http://openweathermap.org/img/w/${cached.weather[0].icon}.png`
          : undefined,
      };
    }
    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to fetch weather for ${lat},${lng}: ${errorData.message} (Status: ${response.status})`
        );
      }
      const data: WeatherData = await response.json();
      console.log(
        `page.tsx - Fetched ${city || cacheKey} raw temp (Kelvin): ${
          data.main.temp
        }`
      );
      setWeatherCache((prev) => ({
        ...prev,
        [cacheKey]: data,
        ...(city ? { [city]: data } : {}),
      }));
      return {
        city,
        lat: data.coord.lat,
        lng: data.coord.lon,
        temp: convertTemp(data.main.temp, isCelsius),
        weather: data.weather[0]?.description,
        icon: data.weather[0]?.icon
          ? `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
          : undefined,
      };
    } catch (error) {
      console.error(
        `page.tsx - Error in fetchWeatherByCoords for ${lat},${lng}:`,
        error
      );
      setApiError(
        error instanceof Error ? error.message : "Unknown fetch error"
      );
      return { city, lat, lng, temp: 0 };
    }
  };

  useEffect(() => {
    const fetchInitialFavorites = async () => {
      if (!apiKey) return;
      const sampleCities = ["London", "New York", "Tokyo"];
      try {
        const fetchedFavorites = await Promise.all(
          sampleCities.map(fetchWeatherByCity)
        );
        setFavorites(fetchedFavorites);
      } catch (error) {
        console.error("Error fetching initial favorites:", error);
      }
    };
    if (isLoaded && favorites.length === 0) {
      fetchInitialFavorites();
    }
  }, [isLoaded, apiKey]);

  const handleMapLocationSelect = (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => {
    console.log("Map selected location:", location);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const handleFavoriteSelect = (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => {
    console.log("Favorite selected location:", location);
    setSelectedLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const handleCloseDetailedView = () => {
    setSelectedLocation(null);
  };

  const handleToggleUnit = () => {
    console.log(
      "Toggling units, current favorites:",
      JSON.stringify(favorites)
    );
    setIsCelsius((prev) => {
      const newIsCelsius = !prev;
      setFavorites((prevFavorites) => {
        console.log(
          "Updating favorites with new unit:",
          newIsCelsius ? "C" : "F"
        );
        const updatedFavorites = prevFavorites.map((fav) => {
          const cached = weatherCache[fav.city!];
          const tempKelvin = cached?.main.temp;
          if (!tempKelvin) {
            console.warn(
              `No cached tempKelvin for ${fav.city}, keeping original temp: ${fav.temp}`
            );
            return fav;
          }
          return {
            ...fav,
            temp: convertTemp(tempKelvin, newIsCelsius),
          };
        });
        console.log(
          "Favorites after toggle:",
          JSON.stringify(updatedFavorites)
        );
        return updatedFavorites;
      });
      return newIsCelsius;
    });
  };

  const addFavorite = async (city: string, lat: number, lng: number) => {
    console.log(
      `page.tsx - Adding favorite: ${city}, lat: ${lat}, lng: ${lng}`
    );
    try {
      const weatherData = await fetchWeatherByCoords(lat, lng, city);
      setFavorites((prev) => {
        if (prev.some((fav) => fav.city?.toLowerCase() === city.toLowerCase()))
          return prev;
        const updatedFavorites = [...prev, weatherData];
        console.log(
          "Favorites after adding:",
          JSON.stringify(updatedFavorites)
        );
        return updatedFavorites;
      });
    } catch (error) {
      console.error(`Error adding favorite ${city}:`, error);
    }
  };

  const removeFavorite = (city: string) => {
    setFavorites((prev) => {
      const updatedFavorites = prev.filter((fav) => fav.city !== city);
      console.log(
        "Favorites after removing:",
        JSON.stringify(updatedFavorites)
      );
      return updatedFavorites;
    });
  };

  if (!googleMapsApiKey) {
    return (
      <div style={{ color: "red" }}>Error: Google Maps API key is missing</div>
    );
  }

  if (loadError) {
    return (
      <div style={{ color: "red" }}>
        Error loading Google Maps: ${loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  if (apiError) {
    return <div style={{ color: "red" }}>{apiError}</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gridTemplateRows: "repeat(8, 1fr)",
        gap: "10px",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Map
        style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}
        onLocationSelect={handleMapLocationSelect}
        selectedLocation={mapCenter}
        isLoaded={isLoaded}
        isCelsius={isCelsius}
        addFavorite={addFavorite}
        fetchWeatherByCoords={fetchWeatherByCoords}
      />
      <SearchBar
        onLocationSelect={handleMapLocationSelect}
        isLoaded={isLoaded}
      />
      <Favorites
        isCelsius={isCelsius}
        favorites={favorites}
        removeFavorite={removeFavorite}
        onFavoriteSelect={handleFavoriteSelect}
      />
      <ToggleSwitch isCelsius={isCelsius} onToggle={handleToggleUnit} />
      {selectedLocation && (
        <DetailedView
          location={selectedLocation}
          isCelsius={isCelsius}
          onClose={handleCloseDetailedView}
        />
      )}
    </div>
  );
}
