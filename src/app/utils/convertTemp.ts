/**
 * Convert temperature from Kelvin to Celsius or Fahrenheit
 * @param tempKelvin Temperature in Kelvin
 * @param isCelsius Whether to convert to Celsius (true) or Fahrenheit (false)
 * @returns Converted temperature
 */
export const convertTemp = (tempKelvin: number, isCelsius: boolean): number => {
  // Validate input
  if (tempKelvin < 0 || tempKelvin > 1000) {
    console.error(`Invalid temperature detected: ${tempKelvin}K`);
    return 0;
  }

  // Convert from Kelvin to Celsius
  const tempCelsius = tempKelvin - 273.15;

  // Convert to Celsius or Fahrenheit based on the flag
  const converted = isCelsius ? tempCelsius : (tempCelsius * 9) / 5 + 32;

  return converted;
};

/**
 * Format temperature with the appropriate unit symbol
 * @param temp Temperature value
 * @param isCelsius Whether the temperature is in Celsius
 * @param decimals Number of decimal places to display
 * @returns Formatted temperature string with unit
 */
export const formatTemp = (
  temp: number,
  isCelsius: boolean,
  decimals: number = 1
): string => {
  return `${temp.toFixed(decimals)}°${isCelsius ? "C" : "F"}`;
};

/**
 * Get a color representing the temperature range
 * @param temp Temperature value
 * @param isCelsius Whether the temperature is in Celsius
 * @returns CSS color string
 */
export const getTempColor = (temp: number, isCelsius: boolean): string => {
  // Convert to Celsius for consistent comparison if needed
  const tempC = isCelsius ? temp : ((temp - 32) * 5) / 9;

  // Color ranges based on Celsius
  if (tempC < 0) return "#9CC0FF"; // Very cold (light blue)
  if (tempC < 10) return "#00BFFF"; // Cold (deep sky blue)
  if (tempC < 20) return "#90EE90"; // Cool (light green)
  if (tempC < 30) return "#FFFF00"; // Warm (yellow)
  if (tempC < 35) return "#FFA500"; // Hot (orange)
  return "#FF4500"; // Very hot (red-orange)
};
