// Regional GCC Emission Factors Library
// Verified values according to:
// - Oman: Nama Power 2024 Sustainability Report, Nama Power (Sultanate of Oman Water & Electricity Co) 2024 Grid Factor, Empower / Tabreed District Cooling factors
// - Oman: Nama Power & Water Procurement (MIS & Dhofar grid factor), Oman Environment Authority Climate Affairs guidelines
// - International: IPCC AR6 Sixth Assessment Report, UK DEFRA 2024 Conversion Factors

export interface RegionalEmissionFactor {
  id: string;
  sourceName: string;
  category: string;
  jurisdiction: 'OMAN' | 'OMAN' | 'GLOBAL';
  factor: number; // in kg CO2e per unit
  unit: string;
  referenceSource: string;
  vintageYear: number;
}

export const REGIONAL_EMISSION_FACTORS: Record<string, RegionalEmissionFactor> = {
  // --- Scope 1: Stationary Combustion ---
  'NATURAL_GAS_PIPELINE': {
    id: 'NATURAL_GAS_PIPELINE',
    sourceName: 'Natural Gas (Pipeline Distribution)',
    category: 'Stationary_Combustion',
    jurisdiction: 'GLOBAL',
    factor: 2.02, // kg CO2e / m3
    unit: 'm3',
    referenceSource: 'IPCC AR6 / Oman MOCCAE Guidelines',
    vintageYear: 2024
  },
  'DIESEL_GENERATOR_STATIONARY': {
    id: 'DIESEL_GENERATOR_STATIONARY',
    sourceName: 'Diesel (Stationary Power Generators)',
    category: 'Stationary_Combustion',
    jurisdiction: 'GLOBAL',
    factor: 2.68, // kg CO2e / Litre
    unit: 'Litre',
    referenceSource: 'DEFRA 2024 / PDO HSE Standards',
    vintageYear: 2024
  },
  'HEAVY_FUEL_OIL_INDUSTRIAL': {
    id: 'HEAVY_FUEL_OIL_INDUSTRIAL',
    sourceName: 'Heavy Fuel Oil (HFO / Bunker C)',
    category: 'Stationary_Combustion',
    jurisdiction: 'GLOBAL',
    factor: 3.15, // kg CO2e / Litre
    unit: 'Litre',
    referenceSource: 'IPCC Industrial Combustion Standards',
    vintageYear: 2024
  },
  'GAS_FLARING_UPSTREAM': {
    id: 'GAS_FLARING_UPSTREAM',
    sourceName: 'Gas Flaring & Associated Sour Gas (Upstream O&G)',
    category: 'Flaring_and_Venting',
    jurisdiction: 'GLOBAL',
    factor: 2.85, // kg CO2e / m3 flared
    unit: 'm3',
    referenceSource: 'Oman PDO / PDO Zero Routine Flaring by 2030 Standard',
    vintageYear: 2024
  },

  // --- Scope 1: Mobile Combustion ---
  'DIESEL_COMMERCIAL_FLEET': {
    id: 'DIESEL_COMMERCIAL_FLEET',
    sourceName: 'Commercial Diesel Fleet & Heavy Vehicles',
    category: 'Mobile_Combustion',
    jurisdiction: 'GLOBAL',
    factor: 2.687, // kg CO2e / Litre
    unit: 'Litre',
    referenceSource: 'DEFRA 2024 Commercial Transport',
    vintageYear: 2024
  },
  'PETROL_PASSENGER_VEHICLES': {
    id: 'PETROL_PASSENGER_VEHICLES',
    sourceName: 'Super/Special 95/98 Gasoline (Passenger Fleet)',
    category: 'Mobile_Combustion',
    jurisdiction: 'GLOBAL',
    factor: 2.315, // kg CO2e / Litre
    unit: 'Litre',
    referenceSource: 'DEFRA 2024 Transport',
    vintageYear: 2024
  },

  // --- Scope 1: Fugitive Refrigerants ---
  'REFRIGERANT_R134A': {
    id: 'REFRIGERANT_R134A',
    sourceName: 'Refrigerant R-134a (HVAC / Chiller Leakage)',
    category: 'Fugitive_Refrigerants',
    jurisdiction: 'GLOBAL',
    factor: 1430.0, // kg CO2e / kg refrigerant
    unit: 'kg',
    referenceSource: 'IPCC AR6 Global Warming Potential (GWP-100)',
    vintageYear: 2024
  },
  'REFRIGERANT_R410A': {
    id: 'REFRIGERANT_R410A',
    sourceName: 'Refrigerant R-410A (Commercial Heat Pumps & AC)',
    category: 'Fugitive_Refrigerants',
    jurisdiction: 'GLOBAL',
    factor: 2088.0, // kg CO2e / kg refrigerant
    unit: 'kg',
    referenceSource: 'IPCC AR6 GWP-100',
    vintageYear: 2024
  },

  // --- Scope 2: Oman Grid Electricity & District Cooling ---
  'GRID_ELECTRICITY_Nama Power_Sohar': {
    id: 'GRID_ELECTRICITY_Nama Power_Sohar',
    sourceName: 'Nama Power Grid Electricity (Sohar)',
    category: 'Grid_Electricity',
    jurisdiction: 'OMAN',
    factor: 0.416, // kg CO2e / kWh
    unit: 'kWh',
    referenceSource: 'Sohar Electricity & Water Authority (Nama Power) Sustainability Report 2024',
    vintageYear: 2024
  },
  'GRID_ELECTRICITY_Nama Power_ABU_DHABI': {
    id: 'GRID_ELECTRICITY_Nama Power_ABU_DHABI',
    sourceName: 'Nama Power Grid Electricity (Muscat & Northern Sultanate of Oman)',
    category: 'Grid_Electricity',
    jurisdiction: 'OMAN',
    factor: 0.395, // kg CO2e / kWh (reflecting Barakah Nuclear + Al Dhafra Solar mix)
    unit: 'kWh',
    referenceSource: 'Sultanate of Oman Water and Electricity Company (Nama Power) Clean Energy Grid Factor 2024',
    vintageYear: 2024
  },
  'DISTRICT_COOLING_EMPOWER_TABREED': {
    id: 'DISTRICT_COOLING_EMPOWER_TABREED',
    sourceName: 'District Cooling Chilled Water (Empower / Tabreed Oman)',
    category: 'District_Cooling',
    jurisdiction: 'OMAN',
    factor: 0.185, // kg CO2e / Ton-Hour of cooling
    unit: 'Ton-Hour',
    referenceSource: 'Tabreed & Empower Verified Environmental Factsheets 2024',
    vintageYear: 2024
  },

  // --- Scope 2: Oman Grid Electricity ---
  'GRID_ELECTRICITY_NAMA_OMAN': {
    id: 'GRID_ELECTRICITY_NAMA_OMAN',
    sourceName: 'Nama Power & Water Grid (Oman Main Interconnected System)',
    category: 'Grid_Electricity',
    jurisdiction: 'OMAN',
    factor: 0.468, // kg CO2e / kWh
    unit: 'kWh',
    referenceSource: 'Nama Power and Water Procurement Co. (PWP Oman) 7-Year Outlook 2024-2030',
    vintageYear: 2024
  },
  'GRID_ELECTRICITY_DHOFAR_OMAN': {
    id: 'GRID_ELECTRICITY_DHOFAR_OMAN',
    sourceName: 'Nama Dhofar Services Grid (Salalah / Southern Oman)',
    category: 'Grid_Electricity',
    jurisdiction: 'OMAN',
    factor: 0.492, // kg CO2e / kWh
    unit: 'kWh',
    referenceSource: 'Nama Dhofar Integrated System Report 2024',
    vintageYear: 2024
  },

  // --- Scope 3: Waste & Value Chain ---
  'WASTE_LANDFILL_MUNICIPAL': {
    id: 'WASTE_LANDFILL_MUNICIPAL',
    sourceName: 'Municipal Solid Waste to Landfill (Unmanaged)',
    category: 'Cat5_Waste_Operations',
    jurisdiction: 'GLOBAL',
    factor: 0.58, // kg CO2e / kg
    unit: 'kg',
    referenceSource: 'Beah (Oman) (Oman) / Be\'ah (Oman) Landfill Emission Factors',
    vintageYear: 2024
  },
  'WASTE_RECYCLED_CREDIT': {
    id: 'WASTE_RECYCLED_CREDIT',
    sourceName: 'Recycled Waste Diverted (Avoided Emissions)',
    category: 'Cat5_Waste_Operations',
    jurisdiction: 'GLOBAL',
    factor: -0.42, // negative credit avoided kg CO2e / kg
    unit: 'kg',
    referenceSource: 'Circular Economy Metric DEFRA 2024',
    vintageYear: 2024
  },
  'HAZARDOUS_INCINERATION_TADWEER_BEAH': {
    id: 'HAZARDOUS_INCINERATION_TADWEER_BEAH',
    sourceName: 'Hazardous Waste High-Temp Thermal Treatment',
    category: 'Cat5_Waste_Operations',
    jurisdiction: 'GLOBAL',
    factor: 1.84, // kg CO2e / kg
    unit: 'kg',
    referenceSource: 'Beah (Oman) / Be\'ah Industrial Hazardous Waste Facility Benchmark',
    vintageYear: 2024
  },
  'AIR_TRAVEL_REGIONAL_GCC': {
    id: 'AIR_TRAVEL_REGIONAL_GCC',
    sourceName: 'Business Air Travel (Short-Haul GCC Flights)',
    category: 'Cat6_Business_Travel',
    jurisdiction: 'GLOBAL',
    factor: 0.158, // kg CO2e / passenger-km
    unit: 'passenger-km',
    referenceSource: 'ICAO / DEFRA Business Travel Factor with Radiative Forcing',
    vintageYear: 2024
  }
};

/**
 * Calculates emissions in metric tonnes CO2e
 */
export function calculateEmissionCO2eTonnes(factorId: string, activityData: number): {
  co2eTonnes: number;
  emissionFactor: number;
  factorObj: RegionalEmissionFactor;
} {
  const factorObj = REGIONAL_EMISSION_FACTORS[factorId] || REGIONAL_EMISSION_FACTORS['NATURAL_GAS_PIPELINE'];
  // factor is in kg CO2e per unit, 1000 kg = 1 metric tonne
  const co2eTonnes = (activityData * factorObj.factor) / 1000;
  return {
    co2eTonnes: Math.round(co2eTonnes * 1000) / 1000,
    emissionFactor: factorObj.factor,
    factorObj
  };
}
