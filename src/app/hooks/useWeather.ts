import useSWR from 'swr';
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecastByCoords, Location, WeatherData, ForecastData } from '../services/weatherService';

// Custom hook for fetching weather data
export function useWeather(apiKey: string | undefined) {
  // Error state for API key
  const apiKeyError = !apiKey ? 'Weather API key is missing' : null;

  // Fetch weather by city
  const getWeatherByCity = async (city: string) => {
    if (!apiKey) throw new Error('Weather API key is missing');
    return fetchWeatherByCity(city, apiKey);
  };

  // Fetch weather by coordinates
  const getWeatherByCoords = async (lat: number, lng: number, city?: string) => {
    if (!apiKey) throw new Error('Weather API key is missing');
    return fetchWeatherByCoords(lat, lng, apiKey, city);
  };

  // Fetch forecast by coordinates
  const getForecastByCoords = async (lat: number, lng: number) => {
    if (!apiKey) throw new Error('Weather API key is missing');
    return fetchForecastByCoords(lat, lng, apiKey);
  };

  // Use SWR to fetch weather data for a city
  const useWeatherByCity = (city: string) => {
    return useSWR<Location, Error>(
      city ? ['weather', city] : null,
      () => getWeatherByCity(city),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 30 * 60 * 1000, // 30 minutes
        errorRetryCount: 2,
      }
    );
  };

  // Use SWR to fetch weather data for coordinates
  const useWeatherByCoords = (lat: number | null, lng: number | null, city?: string) => {
    return useSWR<Location, Error>(
      lat !== null && lng !== null ? ['weather', lat, lng] : null,
      () => getWeatherByCoords(lat!, lng!, city),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 30 * 60 * 1000, // 30 minutes
        errorRetryCount: 2,
      }
    );
  };

  // Use SWR to fetch forecast data for coordinates
  const useForecastByCoords = (lat: number | null, lng: number | null) => {
    return useSWR<ForecastData, Error>(
      lat !== null && lng !== null ? ['forecast', lat, lng] : null,
      () => getForecastByCoords(lat!, lng!),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 30 * 60 * 1000, // 30 minutes
        errorRetryCount: 2,
      }
    );
  };

  return {
    apiKeyError,
    getWeatherByCity,
    getWeatherByCoords,
    getForecastByCoords,
    useWeatherByCity,
    useWeatherByCoords,
    useForecastByCoords,
  };
}
