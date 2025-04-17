"use client";

import { useState } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import Favorites from "./components/Favorites";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import ToggleSwitch from "./components/ToggleSwitch";
import DetailedView from "./components/DetailedView";
import { useWeatherContext } from "./context/WeatherContext";
import { Location } from "./services/weatherService";

const libraries: Libraries = ["places"];

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const {
    isCelsius,
    favorites,
    selectedLocation,
    apiError,
    toggleTemperatureUnit,
    addFavorite,
    removeFavorite,
    selectLocation,
    clearSelectedLocation,
    getWeatherByCoords,
  } = useWeatherContext();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries,
  });

  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
    selectLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  if (!googleMapsApiKey) {
    return (
      <div
        style={{
          color: "red",
          padding: "20px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Error: Google Maps API key is missing
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          color: "red",
          padding: "20px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>
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
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#d32f2f",
          padding: "30px",
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "8px",
          margin: "20px",
          maxWidth: "90%",
          width: "500px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
        }}
      >
        <h2 style={{ marginTop: 0, color: "#d32f2f" }}>Error</h2>
        <p style={{ marginBottom: "20px" }}>{apiError}</p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          If you're seeing an API key error, please add your API keys to the
          .env.local file:
          <br />
          <code
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              color: "#333",
              textAlign: "left",
              fontFamily: "monospace",
            }}
          >
            NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
            <br />
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
          </code>
        </p>
        <button
          onClick={() => window.location.reload()}
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
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gridTemplateRows: "60px repeat(7, 1fr)", // Fixed height for first row
        gap: "15px",
        width: "100%",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#f0f8ff", // Light blue background
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Map
        style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}
        onLocationSelect={handleMapLocationSelect}
        selectedLocation={mapCenter}
        isLoaded={isLoaded}
        isCelsius={isCelsius}
        addFavorite={async (city, lat, lng) => {
          await addFavorite(city, lat, lng);
        }}
        fetchWeatherByCoords={async (lat, lng, city) => {
          return (await getWeatherByCoords(
            lat,
            lng,
            city
          )) as unknown as Location;
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          display: "flex",
          gap: "10px",
          zIndex: 60,
        }}
      >
        <div style={{ flex: 1 }}>
          <SearchBar
            onLocationSelect={handleMapLocationSelect}
            isLoaded={isLoaded}
          />
        </div>
        <div style={{ width: "auto" }}>
          <ToggleSwitch
            isCelsius={isCelsius}
            onToggle={toggleTemperatureUnit}
          />
        </div>
      </div>
      <Favorites
        isCelsius={isCelsius}
        favorites={favorites}
        removeFavorite={removeFavorite}
        onFavoriteSelect={handleFavoriteSelect}
      />
      {selectedLocation && (
        <DetailedView
          location={selectedLocation}
          isCelsius={isCelsius}
          onClose={clearSelectedLocation}
          style={{
            position: "absolute",
            top: "80px", // Same as favorites list
            left: "10px",
            width: "calc(100vw - 340px)", // Full width minus favorites list width and margins
            height: "calc(100vh - 200px)", // Same height as favorites list
            margin: "0",
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
}
