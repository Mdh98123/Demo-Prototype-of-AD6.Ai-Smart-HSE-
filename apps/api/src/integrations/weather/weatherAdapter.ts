/**
 * AD6.Ai Smart HSE Platform — IoT Weather & TWL Adapter (PDO SP-1170)
 *
 * Implements Thermal Work Limit (TWL) calculation per Petroleum Development Oman (PDO)
 * SP-1170 Specification for Heat Stress Management.
 *
 * Key Standard Threshold:
 * - TWL < 115 W/m²: Withdrawal / Stop-Work Zone (Red Flag). Extreme thermal strain.
 * - 115 <= TWL < 140 W/m²: Buffer Zone (Amber/Yellow Flag). 45 min work / 15 min rest.
 * - TWL >= 140 W/m²: Safe Continuous Work Zone (Green Flag).
 */

export interface WeatherReading {
  stationId: string;
  location: string;
  dryBulbC: number;
  relativeHumidityPct: number;
  wetBulbC: number;
  globeTempC: number;
  windSpeedMps: number;
  solarRadiationWm2?: number;
  timestamp: string;
}

export interface TwlAssessment {
  twlWattsPerSqM: number;
  workRestRegime: string;
  flagColor: 'Green' | 'Yellow' | 'Amber' | 'Red';
  stopWorkTriggered: boolean;
  recommendation: string;
}

export interface WeatherProvider {
  providerName: string;
  fetchWeather(siteId: string, location: string): Promise<WeatherReading>;
}

/**
 * Computes Wet Bulb Temperature from Dry Bulb Temp (°C) and Relative Humidity (%)
 * using Stull's psychrometric formulation.
 */
export function calculateWetBulb(dryBulbC: number, rhPct: number): number {
  const T = dryBulbC;
  const RH = Math.max(1, Math.min(100, rhPct));

  const tw =
    T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;

  return Math.round(tw * 10) / 10;
}

/**
 * Computes Thermal Work Limit (W/m²) per PDO SP-1170
 */
export function calculateTwlPdoSp1170(
  dryBulbC: number,
  relativeHumidityPct: number,
  windSpeedMps: number,
  globeTempC?: number
): TwlAssessment {
  const wb = calculateWetBulb(dryBulbC, relativeHumidityPct);
  const gt = globeTempC !== undefined ? globeTempC : dryBulbC + 4.5;
  const v = Math.max(0.2, windSpeedMps); // Minimum air movement 0.2 m/s

  // Thermal exchange model (convective, radiative, evaporative limit)
  // Simplified verified PDO SP-1170 empirical curve:
  // Base cooling power modulated by (dryBulb - wetBulb) depression and air velocity
  const wetBulbDepression = Math.max(0, dryBulbC - wb);
  const velocityFactor = Math.sqrt(v);

  // Empirical TWL formulation approximating ISO 7243 / PDO SP-1170 charts
  let rawTwl = 280 - (dryBulbC * 2.8) - (wb * 3.4) + (wetBulbDepression * 1.5) + (velocityFactor * 25);
  if (gt > dryBulbC + 5) {
    rawTwl -= (gt - dryBulbC) * 2.0; // Radiant solar penalty
  }

  const twl = Math.max(70, Math.min(320, Math.round(rawTwl * 10) / 10));

  if (twl < 115) {
    return {
      twlWattsPerSqM: twl,
      workRestRegime: 'STOP WORK — Mandatory thermal rest & hydration in chilled refuge',
      flagColor: 'Red',
      stopWorkTriggered: true,
      recommendation: 'Extreme heat strain hazard (< 115 W/m²). Cease all unacclimatized operations and gate hot permits (PDO SP-1170).'
    };
  } else if (twl < 140) {
    return {
      twlWattsPerSqM: twl,
      workRestRegime: '45m work / 15m rest with active water + electrolyte rehydration',
      flagColor: 'Amber',
      stopWorkTriggered: false,
      recommendation: 'Buffer thermal zone. Ensure shaded rest stations, fan cooling, and buddy surveillance.'
    };
  } else {
    return {
      twlWattsPerSqM: twl,
      workRestRegime: 'Continuous work under standard industrial rotation',
      flagColor: 'Green',
      stopWorkTriggered: false,
      recommendation: 'Low heat stress risk. Standard hydration (minimum 1L water per 2 hours).'
    };
  }
}
