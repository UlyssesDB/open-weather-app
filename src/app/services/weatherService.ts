// Weather API service

export interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  name: string;
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface ForecastData {
  list: {
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
      pressure: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
      deg: number;
    };
    clouds: {
      all: number;
    };
    rain?: {
      "3h"?: number;
    };
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface Location {
  city?: string;
  lat: number;
  lng: number;
  tempKelvin: number;
  weather?: string;
  icon?: string;
}

// Cache for weather data
let weatherCache: Record<string, WeatherData> = {};
let forecastCache: Record<string, ForecastData> = {};

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;
const cacheTimestamps: Record<string, number> = {};

/**
 * Clear expired cache entries
 */
const clearExpiredCache = () => {
  const now = Date.now();
  Object.keys(cacheTimestamps).forEach(key => {
    if (now - cacheTimestamps[key] > CACHE_EXPIRATION) {
      delete weatherCache[key];
      delete forecastCache[key];
      delete cacheTimestamps[key];
    }
  });
};

/**
 * Fetch weather data by city name
 */
export const fetchWeatherByCity = async (city: string, apiKey: string): Promise<Location> => {
  // Clear expired cache entries
  clearExpiredCache();

  // Check if we have cached data
  if (weatherCache[city]) {
    console.log(`Using cached weather data for ${city}`);
    const cached = weatherCache[city];
    return {
      city,
      lat: cached.coord.lat,
      lng: cached.coord.lon,
      tempKelvin: cached.main.temp,
      weather: cached.weather[0]?.description,
      icon: cached.weather[0]?.icon
        ? `https://openweathermap.org/img/w/${cached.weather[0].icon}.png`
        : undefined,
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
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
    console.log(`Fetched ${city} raw temp (Kelvin): ${data.main.temp}`);
    
    // Cache the data
    weatherCache[city] = data;
    cacheTimestamps[city] = Date.now();
    
    return {
      city,
      lat: data.coord.lat,
      lng: data.coord.lon,
      tempKelvin: data.main.temp,
      weather: data.weather[0]?.description,
      icon: data.weather[0]?.icon
        ? `https://openweathermap.org/img/w/${data.weather[0].icon}.png`
        : undefined,
    };
  } catch (error) {
    console.error(`Error in fetchWeatherByCity for ${city}:`, error);
    throw error;
  }
};

/**
 * Fetch weather data by coordinates
 */
export const fetchWeatherByCoords = async (
  lat: number,
  lng: number,
  apiKey: string,
  city?: string
): Promise<Location> => {
  // Clear expired cache entries
  clearExpiredCache();

  // Create a cache key for the coordinates
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  // Check if we have cached data
  if (weatherCache[cacheKey]) {
    console.log(`Using cached weather data for ${cacheKey}`);
    const cached = weatherCache[cacheKey];
    return {
      city: cached.name || city,
      lat: cached.coord.lat,
      lng: cached.coord.lon,
      tempKelvin: cached.main.temp,
      weather: cached.weather[0]?.description,
      icon: cached.weather[0]?.icon
        ? `https://openweathermap.org/img/w/${cached.weather[0].icon}.png`
        : undefined,
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`
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
    console.log(`Fetched ${city || cacheKey} raw temp (Kelvin): ${data.main.temp}`);
    
    // Cache the data
    weatherCache[cacheKey] = data;
    cacheTimestamps[cacheKey] = Date.now();
    if (city) {
      weatherCache[city] = data;
      cacheTimestamps[city] = Date.now();
    }
    
    return {
      city: data.name || city,
      lat: data.coord.lat,
      lng: data.coord.lon,
      tempKelvin: data.main.temp,
      weather: data.weather[0]?.description,
      icon: data.weather[0]?.icon
        ? `https://openweathermap.org/img/w/${data.weather[0].icon}.png`
        : undefined,
    };
  } catch (error) {
    console.error(`Error in fetchWeatherByCoords for ${lat},${lng}:`, error);
    throw error;
  }
};

/**
 * Fetch forecast data by coordinates
 */
export const fetchForecastByCoords = async (
  lat: number,
  lng: number,
  apiKey: string
): Promise<ForecastData> => {
  // Clear expired cache entries
  clearExpiredCache();

  // Create a cache key for the coordinates
  const cacheKey = `forecast_${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  // Check if we have cached data
  if (forecastCache[cacheKey]) {
    console.log(`Using cached forecast data for ${cacheKey}`);
    return forecastCache[cacheKey];
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}`
    );
    
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        `Failed to fetch forecast for ${lat},${lng}: ${errorData.message} (Status: ${response.status})`
      );
    }
    
    const data: ForecastData = await response.json();
    console.log(`Fetched forecast for ${lat},${lng}`);
    
    // Cache the data
    forecastCache[cacheKey] = data;
    cacheTimestamps[cacheKey] = Date.now();
    
    return data;
  } catch (error) {
    console.error(`Error in fetchForecastByCoords for ${lat},${lng}:`, error);
    throw error;
  }
};
