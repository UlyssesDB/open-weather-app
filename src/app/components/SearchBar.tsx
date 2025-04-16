"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchBarProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => void;
  isLoaded: boolean;
}

export default function SearchBar({
  onLocationSelect,
  isLoaded,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const onLoadAutocomplete = useCallback(() => {
    if (isLoaded && window.google) {
      setAutocomplete(new window.google.maps.places.AutocompleteService());
    }
  }, [isLoaded]);

  useEffect(() => {
    onLoadAutocomplete();
  }, [onLoadAutocomplete]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!autocomplete || !input.trim()) {
        setSuggestions([]);
        setHighlightedIndex(-1);
        return;
      }
      autocomplete.getPlacePredictions(
        { input, types: ["(cities)"] },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setHighlightedIndex(-1);
          } else {
            setSuggestions([]);
            setHighlightedIndex(-1);
          }
        }
      );
    },
    [autocomplete]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionSelect = async (description: string) => {
    if (!googleMapsApiKey) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const results = await new Promise<google.maps.GeocoderResult[]>(
        (resolve, reject) => {
          geocoder.geocode({ address: description }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error("Geocoding failed"));
            }
          });
        }
      );
      const [location] = results;
      const { lat, lng } = location.geometry.location;
      const city = description.split(",")[0];

      onLocationSelect({ lat: lat(), lng: lng(), city });
      setQuery(description);
      setSuggestions([]);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Failed to geocode suggestion:", error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || !apiKey) return;

    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=1&appid=${apiKey}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Geocoding API error");
      }
      const [location] = await response.json();
      if (!location) {
        console.error("No location found for query:", query);
        return;
      }

      const { lat, lon: lng, name: city } = location;
      onLocationSelect({ lat, lng, city });
      setQuery("");
      setSuggestions([]);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Failed to fetch location:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex].description);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setSuggestions([]);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        color: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            backgroundColor: "white",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.2s ease",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
          aria-label="Search for a city"
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(33, 150, 243, 0.2)",
          }}
          aria-label="Search"
        >
          Search
        </button>
      </div>
      {isLoaded && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% - 10px)",
            left: "16px",
            right: "16px",
            backgroundColor: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            listStyle: "none",
            padding: "8px 0",
            margin: "0",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionSelect(suggestion.description)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom:
                  index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                backgroundColor:
                  highlightedIndex === index ? "#f5f9ff" : "white",
                transition: "background-color 0.15s ease",
                fontSize: "15px",
                color: highlightedIndex === index ? "#2196F3" : "#333",
              }}
              onMouseOver={() => setHighlightedIndex(index)}
              onMouseOut={() => setHighlightedIndex(-1)}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
