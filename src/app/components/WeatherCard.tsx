"use client";

import { useState } from "react";
import { convertTemp, formatTemp, getTempColor } from "../utils/convertTemp";
import { Location } from "../services/weatherService";

interface WeatherCardProps {
  location: Location;
  isCelsius: boolean;
  onSelect?: () => void;
  onAddFavorite?: () => void;
  onRemoveFavorite?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
}

export default function WeatherCard({
  location,
  isCelsius,
  onSelect,
  onAddFavorite,
  onRemoveFavorite,
  isFavorite = false,
  compact = false,
}: WeatherCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Convert temperature
  const temperature = convertTemp(location.tempKelvin, isCelsius);
  const formattedTemp = formatTemp(temperature, isCelsius);
  const tempColor = getTempColor(temperature, isCelsius);

  // Card styles
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: isHovered
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: compact ? "10px" : "12px", // Slightly more padding for compact cards
    transition: "all 0.3s ease",
    cursor: onSelect ? "pointer" : "default",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    width: compact ? "100%" : "100%",
    maxWidth: compact ? "100%" : "auto",
    height: compact ? "200px" : "120px", // Fixed height for compact cards
    minHeight: compact ? "200px" : "120px", // Fixed minimum height for compact cards
    maxHeight: compact ? "200px" : "120px", // Fixed maximum height for compact cards
    border: isHovered && onSelect ? "2px solid #2196F3" : "1px solid #e0e0e0",
    position: "relative" as const,
    boxSizing: "border-box" as const, // Include padding in the height calculation
  };

  // Temperature styles
  const tempStyle = {
    fontSize: compact ? "1.5rem" : "2rem",
    fontWeight: "bold",
    color: tempColor,
    margin: compact ? "4px 0" : "8px 0",
  };

  // Button styles
  const buttonStyle = {
    marginTop: compact ? "4px" : "8px",
    padding: "6px 12px",
    backgroundColor: isFavorite ? "#ff0000" : "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: compact ? "0.75rem" : "0.875rem",
    transition: "background-color 0.3s ease",
    display: "block", // Always visible
    width: "100%", // Full width
    fontWeight: "bold" as const,
    marginBottom: "4px",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      aria-label={
        onSelect
          ? `View details for ${location.city || "this location"}`
          : undefined
      }
    >
      {onSelect && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            backgroundColor: isHovered ? "#2196F3" : "rgba(33, 150, 243, 0.7)",
            color: "white",
            borderRadius: "4px",
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          View Details {isHovered ? "→" : ""}
        </div>
      )}
      {location.icon && (
        <img
          src={location.icon}
          alt={location.weather || "weather icon"}
          style={{ width: compact ? "40px" : "50px", height: "auto" }}
        />
      )}

      <h3
        style={{
          margin: compact ? "2px 0" : "4px 0",
          fontSize: compact ? "1rem" : "1.25rem",
          fontWeight: "bold",
          textAlign: "center",
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          color: "#333",
          backgroundColor: location.city ? "transparent" : "#ffeeee",
          padding: "4px",
          borderRadius: "4px",
          border: "none",
        }}
        title={location.city || "Unknown Location"}
      >
        {location.city || "Unknown Location"}
      </h3>

      <div style={tempStyle}>{formattedTemp}</div>

      {location.weather && (
        <p
          style={{
            margin: compact ? "2px 0" : "4px 0",
            fontSize: compact ? "0.75rem" : "0.875rem",
            textAlign: "center",
            color: "#666",
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {location.weather}
        </p>
      )}

      {(onAddFavorite || onRemoveFavorite) && (
        <div style={{ marginTop: "auto", width: "100%" }}>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              if (isFavorite && onRemoveFavorite) {
                onRemoveFavorite();
              } else if (!isFavorite && onAddFavorite) {
                onAddFavorite();
              }
            }}
          >
            {isFavorite ? "REMOVE" : "Add to Favorites"}
          </button>
        </div>
      )}
    </div>
  );
}
