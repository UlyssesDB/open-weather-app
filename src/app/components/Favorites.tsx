"use client";

interface Favorite {
  city: string;
  lat: number;
  lng: number;
  temp: number; // Pre-converted temp
}

interface FavoritesProps {
  isCelsius: boolean;
  favorites?: Favorite[]; // Made optional to handle undefined
  removeFavorite: (city: string) => void;
  onFavoriteSelect: (location: {
    lat: number;
    lng: number;
    city?: string;
  }) => void;
}

export default function Favorites({
  isCelsius,
  favorites = [], // Default to empty array if undefined
  removeFavorite,
  onFavoriteSelect,
}: FavoritesProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        opacity: "80%",
        gridColumnStart: "7",
        gridColumnEnd: "-1",
        gridRowStart: "1",
        gridRowEnd: "7",
        padding: "10px",
      }}
    >
      <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>Favorites</h3>
      {favorites.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            padding: "0",
            margin: "0",
          }}
        >
          {favorites.map((fav) => (
            <li
              key={fav.city}
              onClick={() =>
                onFavoriteSelect({ lat: fav.lat, lng: fav.lng, city: fav.city })
              }
              style={{
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              <span>
                {fav.city}: {fav.temp.toFixed(1)}°{isCelsius ? "C" : "F"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.city);
                }}
                style={{
                  padding: "2px 6px",
                  backgroundColor: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "14px", margin: "0" }}>No favorites yet</p>
      )}
    </div>
  );
}
