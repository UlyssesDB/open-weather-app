export const convertTemp = (tempKelvin: number, isCelsius: boolean): number => {
  console.log(`convertTemp - Raw Kelvin: ${tempKelvin}`);
  if (tempKelvin < 0 || tempKelvin > 1000) {
    console.error(`Invalid temperature detected: ${tempKelvin}K`);
    return 0;
  }
  const tempCelsius = tempKelvin - 273.15;
  const converted = isCelsius ? tempCelsius : (tempCelsius * 9) / 5 + 32;
  console.log(`convertTemp - Converted ${isCelsius ? "C" : "F"}: ${converted}`);
  return converted;
};
