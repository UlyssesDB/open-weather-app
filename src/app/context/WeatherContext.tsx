"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useWeather } from "../hooks/useWeather";
import {
  Location,
  WeatherData,
  ForecastData,
} from "../services/weatherService";

interface WeatherContextType {
  // State
  isCelsius: boolean;
  favorites: Location[];
  selectedLocation: Location | null;
  apiError: string | null;

  // Actions
  toggleTemperatureUnit: () => void;
  addFavorite: (city: string, lat: number, lng: number) => Promise<void>;
  removeFavorite: (city: string) => void;
  selectLocation: (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => void;
  clearSelectedLocation: () => void;

  // Weather data fetching
  getWeatherByCity: (city: string) => Promise<Location>;
  getWeatherByCoords: (
    lat: number,
    lng: number,
    city?: string
  ) => Promise<Location>;
  getForecastByCoords: (lat: number, lng: number) => Promise<ForecastData>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const {
    apiKeyError,
    getWeatherByCity,
    getWeatherByCoords,
    getForecastByCoords,
  } = useWeather(apiKey);

  // State
  const [isCelsius, setIsCelsius] = useState(false);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [apiError, setApiError] = useState<string | null>(apiKeyError);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem("weatherFavorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to parse saved favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
  }, [favorites]);

  // Toggle between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    setIsCelsius((prev) => !prev);
  };

  // Add a location to favorites
  const addFavorite = async (city: string, lat: number, lng: number) => {
    try {
      // Check if already in favorites
      if (favorites.some((fav) => fav.city === city)) {
        return;
      }

      // Fetch weather data for the location
      const locationData = await getWeatherByCoords(lat, lng, city);

      // Ensure the city property is set
      const favoriteLocation = {
        ...locationData,
        city:
          locationData.city ||
          city ||
          `Location at ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      };

      console.log("Adding favorite with city:", favoriteLocation.city);

      // Add to favorites
      setFavorites((prev) => [...prev, favoriteLocation]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      setApiError(
        error instanceof Error ? error.message : "Failed to add favorite"
      );
    }
  };

  // Remove a location from favorites
  const removeFavorite = (city: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.city !== city));
  };

  // Select a location to view details
  const selectLocation = async (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => {
    try {
      console.log(
        `Selecting location: ${
          location.city || `${location.lat}, ${location.lng}`
        }`
      );

      // Clear any previous errors
      setApiError(null);

      // If we don't have an API key, set a helpful error message
      if (!apiKey) {
        setApiError(
          "Weather API key is missing. Please add your OpenWeatherMap API key to the .env.local file."
        );
        return;
      }

      // Try to get weather data for the location
      const locationData = await getWeatherByCoords(
        location.lat,
        location.lng,
        location.city
      );

      // Set the selected location
      setSelectedLocation(locationData);
      console.log("Location selected successfully");
    } catch (error) {
      console.error("Error selecting location:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to select location. Please check your API key and try again."
      );
    }
  };

  // Clear the selected location
  const clearSelectedLocation = () => {
    setSelectedLocation(null);
  };

  // Context value
  const value: WeatherContextType = {
    isCelsius,
    favorites,
    selectedLocation,
    apiError,
    toggleTemperatureUnit,
    addFavorite,
    removeFavorite,
    selectLocation,
    clearSelectedLocation,
    getWeatherByCity,
    getWeatherByCoords,
    getForecastByCoords,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

// Custom hook to use the weather context
export function useWeatherContext() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeatherContext must be used within a WeatherProvider");
  }
  return context;
}
