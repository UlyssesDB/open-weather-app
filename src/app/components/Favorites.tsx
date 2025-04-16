"use client";

import { Location } from "../services/weatherService";
import { convertTemp, formatTemp } from "../utils/convertTemp";

interface FavoritesProps {
  isCelsius: boolean;
  favorites: Location[];
  removeFavorite: (city: string) => void;
  onFavoriteSelect: (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => void;
}

export default function Favorites({
  isCelsius,
  favorites,
  removeFavorite,
  onFavoriteSelect,
}: FavoritesProps) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        position: "absolute",
        top: "80px", // Below search bar with more space
        right: "10px",
        width: "300px",
        padding: "16px",
        color: "black",
        zIndex: 10,
        border: "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        height: "auto", // Auto height
        maxHeight: "calc(100vh - 200px)", // Maximum height with more space for Google Maps buttons
        boxSizing: "border-box" as const,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: "1.25rem",
          fontWeight: "bold",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: "8px",
          width: "100%",
          flexShrink: 0,
        }}
      >
        Favorites
      </h2>

      {favorites.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto", // Enable vertical scrolling
            overflowX: "hidden",
            flex: 1,
            width: "100%",
          }}
        >
          {favorites.map((fav) => (
            <div
              key={fav.city}
              style={{
                width: "100%",
                marginBottom: "0",
              }}
            >
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "12px",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{fav.city}</h3>
                  {fav.icon && (
                    <img
                      src={fav.icon}
                      alt={fav.weather || "weather icon"}
                      style={{ width: "40px", height: "40px" }}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {formatTemp(
                      convertTemp(fav.tempKelvin, isCelsius),
                      isCelsius
                    )}
                  </div>
                  {fav.weather && (
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {fav.weather}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      onFavoriteSelect({
                        lat: fav.lat,
                        lng: fav.lng,
                        city: fav.city,
                      })
                    }
                    style={{
                      flex: 1,
                      padding: "6px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.city!)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      backgroundColor: "#ff0000",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: "#666",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontSize: "0.9rem", margin: "0" }}>
            No favorites yet. Add locations to your favorites to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
