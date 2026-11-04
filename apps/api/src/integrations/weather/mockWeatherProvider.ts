/**
 * AD6.Ai Smart HSE Platform — Mock Weather Provider
 *
 * Provides deterministic environmental readings for unit/integration testing:
 * - 'SAFE': Mild winter day (TWL ~190 W/m², Green flag)
 * - 'AMBER': Warm shoulder season (TWL ~128 W/m², Amber flag)
 * - 'BREACH': Scorching summer midday in desert (TWL ~98 W/m² < 115 W/m², Red flag / Stop Work)
 */

import { WeatherProvider, WeatherReading, calculateWetBulb } from './weatherAdapter.js';

export type MockWeatherScenario = 'SAFE' | 'AMBER' | 'BREACH';

export class MockWeatherProvider implements WeatherProvider {
  public readonly providerName = 'MockWeatherProvider';
  private scenario: MockWeatherScenario = 'SAFE';

  constructor(initialScenario: MockWeatherScenario = 'SAFE') {
    this.scenario = initialScenario;
  }

  public setScenario(scenario: MockWeatherScenario): void {
    this.scenario = scenario;
  }

  public async fetchWeather(siteId: string, location = 'Rig Floor North Concession'): Promise<WeatherReading> {
    let dryBulbC = 28.0;
    let relativeHumidityPct = 40.0;
    let windSpeedMps = 3.5;
    let globeTempC = 30.0;

    if (this.scenario === 'AMBER') {
      dryBulbC = 39.0;
      relativeHumidityPct = 35.0;
      windSpeedMps = 2.0;
      globeTempC = 44.0;
    } else if (this.scenario === 'BREACH') {
      // Extreme summer condition triggering TWL < 115 W/m² (Stop-Work threshold per PDO SP-1170)
      dryBulbC = 47.5;
      relativeHumidityPct = 48.0; // High humidity + extreme heat = dangerous wet bulb
      windSpeedMps = 0.5; // Stagnant air
      globeTempC = 56.0; // Intense solar radiation
    }

    const wetBulbC = calculateWetBulb(dryBulbC, relativeHumidityPct);

    return {
      stationId: `WX-MOCK-${this.scenario}-${siteId.slice(0, 6)}`,
      location,
      dryBulbC,
      relativeHumidityPct,
      wetBulbC,
      globeTempC,
      windSpeedMps,
      solarRadiationWm2: this.scenario === 'BREACH' ? 950 : 450,
      timestamp: new Date().toISOString()
    };
  }
}
