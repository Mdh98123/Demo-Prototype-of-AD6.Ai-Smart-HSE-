// Authoritative ESG Data Store for Sultanate of Oman Operations
// High-fidelity industrial HSE and Sustainability datasets

import { 
  ESGFacility, 
  DetailedEmissionRecord, 
  WaterEffluentRecord, 
  WasteManagementRecord,
  NationalisationMetrics,
  InCountryValueMetrics,
  SocialSafetyMetrics,
  GovernanceMetrics,
  DecarbonizationInitiative,
  ESGDisclosureItem
} from '../types/esg';

export const INITIAL_ESG_FACILITIES: ESGFacility[] = [
  {
    id: 'FAC-OMN-01',
    name: 'Muscat Corporate HQ & Technology Center',
    code: 'MCT-HQ-01',
    jurisdiction: 'OMAN',
    location: 'Mina Al Fahal Industrial Area, Muscat',
    emirateOrGovernorate: 'Muscat',
    sector: 'Commercial/Facilities' as any,
    coordinates: [24.4988, 54.3891],
    grossFloorAreaM2: 45000,
    workforceCount: 850,
    nationalQuotaTargetPct: 12.0, // Omanisation quota
    gridProvider: 'Nama Power'
  },
  {
    id: 'FAC-OMN-02',
    name: 'Mina Al Fahal Refinery & Chemical Complex',
    code: 'MAF-REF-02',
    jurisdiction: 'OMAN',
    location: 'Al Dhafra Region, Muscat',
    emirateOrGovernorate: 'Muscat',
    sector: 'Oil_and_Gas',
    coordinates: [24.1107, 52.7306],
    grossFloorAreaM2: 480000,
    workforceCount: 3200,
    nationalQuotaTargetPct: 15.0,
    gridProvider: 'Nama Power'
  },
  {
    id: 'FAC-OMN-03',
    name: 'Sohar Freezone Industrial Logistics Hub',
    code: 'SOH-LOG-03',
    jurisdiction: 'OMAN',
    location: 'Khalifa Economic Zones Muscat (Sohar Freezone)',
    emirateOrGovernorate: 'Muscat',
    sector: 'Logistics_Ports',
    coordinates: [24.7869, 54.6854],
    grossFloorAreaM2: 185000,
    workforceCount: 940,
    nationalQuotaTargetPct: 10.0,
    gridProvider: 'Nama Power'
  },
  {
    id: 'FAC-OMN-04',
    name: 'Duqm Industrial Port Marine & Heavy Fabrication Yard',
    code: 'SOH-JAFZA-04',
    jurisdiction: 'OMAN',
    location: 'Duqm Industrial Port Free Zone, Sohar',
    emirateOrGovernorate: 'Sohar',
    sector: 'Manufacturing',
    coordinates: [25.0112, 55.0617],
    grossFloorAreaM2: 220000,
    workforceCount: 1650,
    nationalQuotaTargetPct: 8.0,
    gridProvider: 'Nama Power'
  },
  {
    id: 'FAC-OMN-01',
    name: 'Sohar Industrial Port Terminal & Petrochem',
    code: 'SOH-PRT-01',
    jurisdiction: 'OMAN',
    location: 'Sohar Port & Freezone, Al Batinah North',
    emirateOrGovernorate: 'Sohar',
    sector: 'Oil_and_Gas',
    coordinates: [24.4980, 56.6340],
    grossFloorAreaM2: 310000,
    workforceCount: 2100,
    nationalQuotaTargetPct: 65.0, // Omanisation target for O&G / Petrochem
    gridProvider: 'Nama_Oman'
  },
  {
    id: 'FAC-OMN-02',
    name: 'Duqm Special Economic Zone Heavy Plant',
    code: 'DQM-SEZ-02',
    jurisdiction: 'OMAN',
    location: 'SEZAD, Al Wusta Governorate',
    emirateOrGovernorate: 'Duqm',
    sector: 'Manufacturing',
    coordinates: [19.6738, 57.7042],
    grossFloorAreaM2: 410000,
    workforceCount: 1850,
    nationalQuotaTargetPct: 55.0, // Omanisation industrial quota
    gridProvider: 'Nama_Oman'
  },
  {
    id: 'FAC-OMN-03',
    name: 'Mina Al Fahal Logistics & Terminal',
    code: 'MAF-TRM-03',
    jurisdiction: 'OMAN',
    location: 'Mina Al Fahal, Muscat Governorate',
    emirateOrGovernorate: 'Muscat',
    sector: 'Logistics_Ports',
    coordinates: [23.6300, 58.5140],
    grossFloorAreaM2: 125000,
    workforceCount: 780,
    nationalQuotaTargetPct: 75.0,
    gridProvider: 'Nama_Oman'
  }
];

export const INITIAL_EMISSIONS_RECORDS: DetailedEmissionRecord[] = [
  // --- Oman Scope 1 ---
  {
    id: 'EM-Oman-001',
    facilityId: 'FAC-OMN-02',
    facilityName: 'Mina Al Fahal Refinery & Chemical Complex',
    jurisdiction: 'OMAN',
    date: '2024-06-15',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Stationary_Combustion',
    source: 'Natural Gas Boilers & Process Furnaces',
    activityData: 420000,
    unit: 'm3',
    emissionFactor: 2.02,
    emissionFactorSource: 'IPCC AR6 / Oman MOCCAE Guidelines',
    calculatedCO2eTonnes: 848.4,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'PDO-GAS-INV-2024-8841',
    notes: 'Primary heating furnace fuel metering certified by third-party calibration.'
  },
  {
    id: 'EM-Oman-002',
    facilityId: 'FAC-OMN-03',
    facilityName: 'Sohar Freezone Industrial Logistics Hub',
    jurisdiction: 'OMAN',
    date: '2024-06-18',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Mobile_Combustion',
    source: 'Heavy Transport Logistics Fleet (Diesel)',
    activityData: 64000,
    unit: 'Litre',
    emissionFactor: 2.687,
    emissionFactorSource: 'DEFRA 2024 Commercial Transport',
    calculatedCO2eTonnes: 171.97,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'PDO-DIST-FUEL-0914',
    notes: 'Telematics fleet fuel log verified across 42 logistics prime movers.'
  },
  {
    id: 'EM-Oman-003',
    facilityId: 'FAC-OMN-04',
    facilityName: 'Duqm Industrial Port Marine & Heavy Fabrication Yard',
    jurisdiction: 'OMAN',
    date: '2024-05-22',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Fugitive_Refrigerants',
    source: 'Commercial Marine Chiller Leakage (R-134a)',
    activityData: 45,
    unit: 'kg',
    emissionFactor: 1430.0,
    emissionFactorSource: 'IPCC AR6 Global Warming Potential (GWP-100)',
    calculatedCO2eTonnes: 64.35,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'JAFZA-HVAC-REP-4402',
    notes: 'Annual HVAC gas servicing top-up following compressor seal replacement.'
  },

  // --- Oman Scope 2 ---
  {
    id: 'EM-Oman-004',
    facilityId: 'FAC-OMN-01',
    facilityName: 'Muscat Corporate HQ & Technology Center',
    jurisdiction: 'OMAN',
    date: '2024-06-30',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 2',
    category: 'Grid_Electricity',
    source: 'Nama Power Clean Grid Electricity (Barakah Nuclear + Al Dhafra Solar Mix)',
    activityData: 280000,
    unit: 'kWh',
    emissionFactor: 0.395,
    emissionFactorSource: 'Nama Power Clean Energy Grid Factor 2024',
    calculatedCO2eTonnes: 110.6,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'TAQA-ADDC-INV-0624-9102',
    notes: 'Smart meter telemetry integrated into AD6 EMS platform.'
  },
  {
    id: 'EM-Oman-005',
    facilityId: 'FAC-OMN-04',
    facilityName: 'Duqm Industrial Port Marine & Heavy Fabrication Yard',
    jurisdiction: 'OMAN',
    date: '2024-06-30',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 2',
    category: 'Grid_Electricity',
    source: 'Nama Power Grid Electricity (Sohar)',
    activityData: 520000,
    unit: 'kWh',
    emissionFactor: 0.416,
    emissionFactorSource: 'Nama Power Sustainability Report 2024',
    calculatedCO2eTonnes: 216.32,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'Nama Power-ACCT-0091823-Q2',
    notes: 'Includes fabrication gantry crane peak usage cycles.'
  },
  {
    id: 'EM-Oman-006',
    facilityId: 'FAC-OMN-01',
    facilityName: 'Muscat Corporate HQ & Technology Center',
    jurisdiction: 'OMAN',
    date: '2024-06-30',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 2',
    category: 'District_Cooling',
    source: 'District Cooling Chilled Water (Tabreed Al Maryah)',
    activityData: 165000,
    unit: 'Ton-Hour',
    emissionFactor: 0.185,
    emissionFactorSource: 'Tabreed Environmental Factsheet 2024',
    calculatedCO2eTonnes: 30.53,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'TABREED-INV-2024-06',
    notes: 'Chilled water supply for corporate campus cooling.'
  },

  // --- Oman Scope 3 ---
  {
    id: 'EM-Oman-007',
    facilityId: 'FAC-OMN-02',
    facilityName: 'Mina Al Fahal Refinery & Chemical Complex',
    jurisdiction: 'OMAN',
    date: '2024-06-25',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 3',
    category: 'Cat5_Waste_Operations',
    source: 'Hazardous Chemical Sludge to Beah (Oman) Treatment',
    activityData: 32000,
    unit: 'kg',
    emissionFactor: 1.84,
    emissionFactorSource: 'Beah (Oman) Industrial Hazardous Waste Benchmark',
    calculatedCO2eTonnes: 58.88,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'TADWEER-BOLISAT-2024-004921',
    notes: 'Fully manifested through Muscat Beah (Oman) electronic tracking system.'
  },

  // --- OMAN Scope 1 ---
  {
    id: 'EM-OMN-001',
    facilityId: 'FAC-OMN-01',
    facilityName: 'Sohar Industrial Port Terminal & Petrochem',
    jurisdiction: 'OMAN',
    date: '2024-06-12',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Stationary_Combustion',
    source: 'Industrial Steam Reboiler Gas Turbines',
    activityData: 395000,
    unit: 'm3',
    emissionFactor: 2.02,
    emissionFactorSource: 'IPCC AR6 / Oman Environment Authority',
    calculatedCO2eTonnes: 797.9,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'OQ-GAS-NET-OM-7712',
    notes: 'Custody transfer gas meter verified under Ministry of Energy and Minerals standards.'
  },
  {
    id: 'EM-OMN-002',
    facilityId: 'FAC-OMN-01',
    facilityName: 'Sohar Industrial Port Terminal & Petrochem',
    jurisdiction: 'OMAN',
    date: '2024-06-20',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Flaring_and_Venting',
    source: 'Associated Gas Flaring & Sour Purge (Sohar Plant)',
    activityData: 48000,
    unit: 'm3',
    emissionFactor: 2.85,
    emissionFactorSource: 'Oman PDO Zero Routine Flaring by 2030 Standard',
    calculatedCO2eTonnes: 136.8,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'SOHAR-FLR-AUDIT-2024-Q2',
    notes: 'Optical gas imaging (OGI) verified flare combustion efficiency at 98.4%.'
  },
  {
    id: 'EM-OMN-003',
    facilityId: 'FAC-OMN-02',
    facilityName: 'Duqm Special Economic Zone Heavy Plant',
    jurisdiction: 'OMAN',
    date: '2024-06-08',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 1',
    category: 'Mobile_Combustion',
    source: 'Duqm Heavy Haul Dump Trucks & Shovels (Diesel)',
    activityData: 78000,
    unit: 'Litre',
    emissionFactor: 2.687,
    emissionFactorSource: 'DEFRA 2024 Commercial Transport',
    calculatedCO2eTonnes: 209.59,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'AL-MAHA-OM-FUEL-81923',
    notes: 'Al Maha Petroleum bulk delivery invoice matched with fuel dispenser telematics.'
  },

  // --- OMAN Scope 2 ---
  {
    id: 'EM-OMN-004',
    facilityId: 'FAC-OMN-01',
    facilityName: 'Sohar Industrial Port Terminal & Petrochem',
    jurisdiction: 'OMAN',
    date: '2024-06-30',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 2',
    category: 'Grid_Electricity',
    source: 'Nama Power Grid (Oman Main Interconnected System - MIS)',
    activityData: 740000,
    unit: 'kWh',
    emissionFactor: 0.468,
    emissionFactorSource: 'Nama Power and Water Procurement Co. (PWP Oman) 2024',
    calculatedCO2eTonnes: 346.32,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'NAMA-ELEC-ACCT-OM-99238',
    notes: 'Power drawn from MIS grid under Sohar Port industrial tariff.'
  },
  {
    id: 'EM-OMN-005',
    facilityId: 'FAC-OMN-03',
    facilityName: 'Mina Al Fahal Logistics & Terminal',
    jurisdiction: 'OMAN',
    date: '2024-06-30',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 2',
    category: 'Grid_Electricity',
    source: 'Nama Electricity Distribution (Muscat Grid)',
    activityData: 195000,
    unit: 'kWh',
    emissionFactor: 0.468,
    emissionFactorSource: 'Nama Power and Water Procurement Co. (PWP Oman) 2024',
    calculatedCO2eTonnes: 91.26,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'MEDC-NAMA-INV-2024-06',
    notes: 'Verified against Muscat Electricity Distribution Company billing statement.'
  },

  // --- OMAN Scope 3 ---
  {
    id: 'EM-OMN-006',
    facilityId: 'FAC-OMN-02',
    facilityName: 'Duqm Special Economic Zone Heavy Plant',
    jurisdiction: 'OMAN',
    date: '2024-06-28',
    reportingPeriod: '2024-Q2',
    scope: 'Scope 3',
    category: 'Cat5_Waste_Operations',
    source: 'Industrial Oily Sand & Sludge to Be\'ah Engineered Cell',
    activityData: 28500,
    unit: 'kg',
    emissionFactor: 1.84,
    emissionFactorSource: 'Be\'ah Oman Industrial Hazardous Waste Facility Benchmark',
    calculatedCO2eTonnes: 52.44,
    verificationStatus: 'VALIDATED',
    manifestOrInvoiceRef: 'BEAH-OMAN-MNFST-2024-0982',
    notes: 'Approved through Oman Environmental Services Holding Company (Be\'ah) digital portal.'
  }
];

export const INITIAL_OMANISATION_METRICS: NationalisationMetrics = {
  jurisdiction: 'OMAN',
  frameworkName: 'Omanisation (Ministry of Labour & MSX S11)',
  statutoryTargetPct: 65.0, // Target for O&G / Petrochem operations
  currentActualPct: 68.4,   // Over-performing statutory baseline
  totalHeadcount: 4730,
  nationalEmployees: 3235,
  managementNationalPct: 62.0,
  technicalNationalPct: 71.5,
  operationalNationalPct: 69.2,
  femaleNationalEmployees: 615,
  nafisOrRiyadaParticipation: true,
  complianceStatus: 'COMPLIANT',
  deficitPenaltyRiskAmountOMRorOMR: 0
};

export const INITIAL_ICV_OMAN: InCountryValueMetrics = {
  jurisdiction: 'OMAN',
  programName: 'In-Country Value (ICV Oman - MoEM & Tawreed Framework)',
  certifiedScorePct: 54.8, // Certified score out of 100%
  totalProcurementSpend: 42500000, // in OMR
  localProcurementSpend: 23290000,
  localProcurementPct: 54.8,
  smeSpendAllocationPct: 18.2, // Dedicated to Riyada (Oman SME) certified suppliers
  localSubcontractorDevelopmentBudget: 1850000,
  certificateExpiryDate: '2025-12-31',
  issuingCertifyingBody: 'Deloitte & Touche (M.E.) / MoEM Approved Audit'
};

export const INITIAL_SOCIAL_SAFETY_METRICS: SocialSafetyMetrics = {
  reportingYear: 2024,
  totalManHoursWorked: 23480000, // Combined Sultanate of Oman man-hours
  fatalitiesCount: 0,            // Zero Harm target achieved
  lostTimeInjuriesCount: 2,
  ltifrRate: 0.085,              // Gold standard < 0.15
  trirRate: 0.38,
  nearMissesLogged: 1420,
  highPotentialEvents: 6,
  occupationalIllnessCases: 0,
  femaleWorkforcePct: 22.4,
  femaleLeadershipPct: 18.5,
  genderPayRatio: 0.98,          // Near parity
  employeeTurnoverPct: 4.8,
  trainingHoursPerEmployee: 44.5,
  wageProtectionSystemCompliancePct: 100.0, // 100% electronic WPS
  middaySummerWorkBanBreaches: 0,           // Zero tolerance maintained
  workerWelfareAccommodationAuditsPct: 98.5
};

export const INITIAL_GOVERNANCE_METRICS: GovernanceMetrics = {
  reportingYear: 2024,
  boardMembersTotal: 9,
  independentDirectorsCount: 4,
  independentDirectorsPct: 44.4,     // Above 33% GCC governance minimum
  femaleBoardDirectorsCount: 2,      // Compliant with Oman CMA mandatory min 1
  femaleBoardDirectorsPct: 22.2,
  boardEsgCommitteeExists: true,
  chiefSustainabilityOfficerReportToBoard: true,
  executivePayLinkedToEsgPct: 18.0,  // 18% of C-suite bonus tied to Net Zero & Safety
  codeOfConductTrainingCompletionPct: 100.0,
  antiBriberyAntiCorruptionAudited: true,
  whistleblowerCasesReceived: 8,
  whistleblowerCasesResolved: 8,
  whistleblowerRetaliationIncidents: 0,
  dataPrivacyBreachesReported: 0,     // Full compliance with Oman PDPL & Oman RD 6/2022
  regulatoryFinesIncurredAmount: 0,   // Zero regulatory fines
  assuranceLevel: 'LIMITED_ASSURANCE_ISAE3000',
  externalAssuranceProvider: 'KPMG ESG Assurance & Verification Services'
};

export const INITIAL_DECARBONIZATION_INITIATIVES: DecarbonizationInitiative[] = [
  {
    id: 'DEC-01',
    title: 'Mina Al Fahal Refinery Solar PV Rooftop & Carport PPA (15 MWp)',
    facility: 'Mina Al Fahal Refinery Complex (Oman)',
    category: 'Renewable_Energy',
    capexInvestmentOMRorOMR: 28000000,
    annualOpexSavingsOMRorOMR: 4200000,
    abatementCO2eTonnesPerYear: 9850,
    marginalAbatementCostPerTonne: -42.5, // Negative cost = Net economic saving
    paybackPeriodYears: 5.2,
    implementationStage: 'Commissioned',
    alignmentWithNetZero: 'Oman Vision 2040 Decarbonization'
  },
  {
    id: 'DEC-02',
    title: 'Sohar Port Flare Gas Recovery System (FGRU Unit 4)',
    facility: 'Sohar Industrial Port Terminal (Oman)',
    category: 'Flaring_Abatement',
    capexInvestmentOMRorOMR: 3400000, // in OMR
    annualOpexSavingsOMRorOMR: 620000,
    abatementCO2eTonnesPerYear: 14200,
    marginalAbatementCostPerTonne: -18.2,
    paybackPeriodYears: 4.8,
    implementationStage: 'Under_Execution',
    alignmentWithNetZero: 'Oman Vision 2040 Decarbonization'
  },
  {
    id: 'DEC-03',
    title: 'Sohar Freezone & Duqm Industrial Port Logistics Fleet Electrification (40 Heavy e-Trucks)',
    facility: 'Sohar Freezone & Duqm Industrial Port Yards (Oman)',
    category: 'Fleet_Electrification',
    capexInvestmentOMRorOMR: 19500000,
    annualOpexSavingsOMRorOMR: 2400000,
    abatementCO2eTonnesPerYear: 3100,
    marginalAbatementCostPerTonne: 12.0,
    paybackPeriodYears: 6.5,
    implementationStage: 'Approved',
    alignmentWithNetZero: 'Oman Vision 2040 Decarbonization'
  },
  {
    id: 'DEC-04',
    title: 'Duqm Heavy Plant Waste Heat Recovery Steam Generator (WHRSG)',
    facility: 'Duqm Heavy Plant (Oman)',
    category: 'Energy_Efficiency',
    capexInvestmentOMRorOMR: 4800000, // in OMR
    annualOpexSavingsOMRorOMR: 850000,
    abatementCO2eTonnesPerYear: 8900,
    marginalAbatementCostPerTonne: -22.0,
    paybackPeriodYears: 5.1,
    implementationStage: 'Feasibility',
    alignmentWithNetZero: 'Oman Vision 2040 Decarbonization'
  }
];

export const INITIAL_WATER_RECORDS: WaterEffluentRecord[] = [
  {
    id: 'WAT-Oman-01',
    facilityId: 'FAC-OMN-02',
    jurisdiction: 'OMAN',
    period: '2024-Q2',
    municipalWithdrawalM3: 45000,
    groundwaterAbstractionM3: 0, // Zero groundwater depletion policy
    recycledTSEWaterM3: 28000,   // 38% TSE reuse
    totalConsumptionM3: 45000,
    waterIntensityM3PerFTE: 14.0,
    industrialEffluentDischargedM3: 16500,
    effluentCompliancePct: 100.0,
    zeroLiquidDischargeActive: false
  },
  {
    id: 'WAT-OMN-01',
    facilityId: 'FAC-OMN-01',
    jurisdiction: 'OMAN',
    period: '2024-Q2',
    municipalWithdrawalM3: 38000,
    groundwaterAbstractionM3: 0,
    recycledTSEWaterM3: 22500,
    totalConsumptionM3: 38000,
    waterIntensityM3PerFTE: 18.1,
    industrialEffluentDischargedM3: 12000,
    effluentCompliancePct: 100.0,
    zeroLiquidDischargeActive: true // ZLD unit running in Sohar
  }
];

export const INITIAL_WASTE_RECORDS: WasteManagementRecord[] = [
  {
    id: 'WST-Oman-01',
    facilityId: 'FAC-OMN-02',
    jurisdiction: 'OMAN',
    period: '2024-Q2',
    hazardousWasteTonnes: 142.5,
    hazardousWasteManifestSystem: 'Beah_Manifest_Oman',
    hazardousManifestVerified: true,
    nonHazardousWasteTonnes: 680.0,
    recycledWasteTonnes: 495.0,
    wasteDivertedFromLandfillPct: 72.8,
    compostingTonnes: 45.0,
    circularityScorePct: 74.2
  },
  {
    id: 'WST-OMN-01',
    facilityId: 'FAC-OMN-01',
    jurisdiction: 'OMAN',
    period: '2024-Q2',
    hazardousWasteTonnes: 118.0,
    hazardousWasteManifestSystem: 'Beah_Manifest_Oman',
    hazardousManifestVerified: true,
    nonHazardousWasteTonnes: 540.0,
    recycledWasteTonnes: 385.0,
    wasteDivertedFromLandfillPct: 71.3,
    compostingTonnes: 32.0,
    circularityScorePct: 73.0
  }
];

// Standardized Indicators mapped to MSX, MSX & MSX Oman frameworks
export const MSX_ESG_INDICATORS: ESGDisclosureItem[] = [
  {
    code: 'E1.1',
    title: 'GHG Emissions - Scope 1 (Direct)',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e',
    fy2022Value: '14,200',
    fy2023Value: '12,850',
    fy2024Value: '11,420',
    target2030Value: '7,500',
    griReference: 'GRI 305-1',
    sdgAlignment: ['SDG 13 Climate Action'],
    status: 'DISCLOSED',
    explanationNotes: 'Calculated using IPCC AR6 stationary and mobile combustion coefficients.'
  },
  {
    code: 'E1.2',
    title: 'GHG Emissions - Scope 2 (Location-Based Electricity)',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e',
    fy2022Value: '6,450',
    fy2023Value: '5,820',
    fy2024Value: '4,980',
    target2030Value: '2,800',
    griReference: 'GRI 305-2',
    sdgAlignment: ['SDG 7 Clean Energy', 'SDG 13 Climate Action'],
    status: 'DISCLOSED',
    explanationNotes: 'Includes Nama Power (Muscat) and Nama Electricity (Oman) verified utility grid factors.'
  },
  {
    code: 'E1.3',
    title: 'GHG Emissions - Scope 3 (Value Chain)',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e',
    fy2022Value: '8,900',
    fy2023Value: '8,100',
    fy2024Value: '7,450',
    target2030Value: '5,000',
    griReference: 'GRI 305-3',
    sdgAlignment: ['SDG 12 Responsible Consumption', 'SDG 13'],
    status: 'DISCLOSED',
    explanationNotes: 'Covers upstream transport, operational waste, and business travel.'
  },
  {
    code: 'E2.1',
    title: 'Emissions Intensity Ratio',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e / million OMR revenue',
    fy2022Value: '18.4',
    fy2023Value: '15.2',
    fy2024Value: '12.8',
    target2030Value: '7.2',
    griReference: 'GRI 305-4',
    sdgAlignment: ['SDG 13'],
    status: 'DISCLOSED',
    explanationNotes: 'Continuous decoupling of economic growth from carbon intensity.'
  },
  {
    code: 'E3.1',
    title: 'Renewable Energy Consumption Ratio',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: '%',
    fy2022Value: '8.5%',
    fy2023Value: '14.2%',
    fy2024Value: '23.8%',
    target2030Value: '50.0%',
    griReference: 'GRI 302-1',
    sdgAlignment: ['SDG 7 Clean Energy'],
    status: 'DISCLOSED',
    explanationNotes: 'Driven by Mina Al Fahal on-site solar PPA and Nama Power clean energy certificates.'
  },
  {
    code: 'E5.1',
    title: 'Water Withdrawal & Recycled TSE Ratio',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: '% TSE Reused',
    fy2022Value: '22.0%',
    fy2023Value: '31.5%',
    fy2024Value: '38.2%',
    target2030Value: '60.0%',
    griReference: 'GRI 303-3',
    sdgAlignment: ['SDG 6 Clean Water & Sanitation'],
    status: 'DISCLOSED',
    explanationNotes: 'Treated Sewage Effluent (TSE) utilized for industrial landscaping and cooling towers.'
  },
  {
    code: 'S7.1',
    title: 'Workforce Safety - Lost Time Injury Frequency Rate (LTIFR)',
    standard: 'MSX_OMAN',
    pillar: 'Social',
    unit: 'Per 1M man-hours',
    fy2022Value: '0.14',
    fy2023Value: '0.11',
    fy2024Value: '0.085',
    target2030Value: '0.000',
    griReference: 'GRI 403-9',
    sdgAlignment: ['SDG 8 Decent Work & Economic Growth', 'SDG 3 Good Health'],
    status: 'DISCLOSED',
    explanationNotes: 'Governed under Oman MoL MD 286/2008 & PDO Specifications v4.0 framework with mandatory Life-Saving Rules.'
  },
  {
    code: 'S11.1',
    title: 'Omanisation / National Workforce Ratio',
    standard: 'MSX_OMAN',
    pillar: 'Social',
    unit: '% of workforce',
    fy2022Value: '8.4%',
    fy2023Value: '10.1%',
    fy2024Value: '11.8%',
    target2030Value: '20.0%',
    griReference: 'Local Nationalisation Index',
    sdgAlignment: ['SDG 8 Decent Work'],
    status: 'DISCLOSED',
    explanationNotes: 'Fully aligned with Oman Ministry of Labour Omanisation and Oman Nafis national talent program.'
  },
  {
    code: 'G1.1',
    title: 'Board Diversity - Female Directors',
    standard: 'MSX_OMAN',
    pillar: 'Governance',
    unit: 'Count / %',
    fy2022Value: '1 (11.1%)',
    fy2023Value: '2 (22.2%)',
    fy2024Value: '2 (22.2%)',
    target2030Value: '3 (33.3%)',
    griReference: 'GRI 2-9',
    sdgAlignment: ['SDG 5 Gender Equality', 'SDG 16 Peace, Justice, Strong Institutions'],
    status: 'DISCLOSED',
    explanationNotes: 'Exceeds Oman CMA statutory mandate requiring minimum one female director.'
  },
  {
    code: 'G8.1',
    title: 'Sustainability External Assurance',
    standard: 'MSX_OMAN',
    pillar: 'Governance',
    unit: 'Standard',
    fy2022Value: 'Internal Audit',
    fy2023Value: 'ISAE 3000 Limited',
    fy2024Value: 'ISAE 3000 Limited',
    target2030Value: 'Reasonable Assurance',
    griReference: 'GRI 2-5',
    sdgAlignment: ['SDG 16'],
    status: 'DISCLOSED',
    explanationNotes: 'Independent assurance statement issued by KPMG Lower Gulf.'
  }
];

export const MSX_OMAN_ESG_INDICATORS: ESGDisclosureItem[] = [
  {
    code: 'MSX-E1',
    title: 'GHG Emissions - Gross Scope 1, 2 & 3',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e',
    fy2022Value: '19,800',
    fy2023Value: '18,120',
    fy2024Value: '16,240',
    target2030Value: '10,500',
    griReference: 'GRI 305-1, 305-2, 305-3',
    sdgAlignment: ['SDG 13 Climate Action'],
    status: 'DISCLOSED',
    explanationNotes: 'Covers Sohar Port, Duqm SEZ, and Mina Al Fahal operations in Oman.'
  },
  {
    code: 'MSX-E4',
    title: 'Flaring & Venting Emissions (O&G Assets)',
    standard: 'MSX_OMAN',
    pillar: 'Environmental',
    unit: 'tCO2e / m3 flared',
    fy2022Value: '1,850',
    fy2023Value: '1,240',
    fy2024Value: '547',
    target2030Value: '0 (Zero Flaring)',
    griReference: 'GRI 305-5 / OG6',
    sdgAlignment: ['SDG 13 Climate Action'],
    status: 'DISCLOSED',
    explanationNotes: 'Committed to World Bank & Oman Zero Routine Flaring by 2030 initiative.'
  },
  {
    code: 'MSX-S1',
    title: 'Omanisation Ratio vs Ministry of Labour Quota',
    standard: 'MSX_OMAN',
    pillar: 'Social',
    unit: '% of workforce',
    fy2022Value: '62.4%',
    fy2023Value: '65.8%',
    fy2024Value: '68.4%',
    target2030Value: '80.0%',
    griReference: 'Oman Vision 2040 Labour Pillar',
    sdgAlignment: ['SDG 8 Decent Work'],
    status: 'DISCLOSED',
    explanationNotes: 'Statutory quota of 65% exceeded; 62% in managerial roles and 71.5% in engineering.'
  },
  {
    code: 'MSX-S2',
    title: 'In-Country Value (ICV Oman) Certified Score',
    standard: 'MSX_OMAN',
    pillar: 'Social',
    unit: '% Score',
    fy2022Value: '46.2%',
    fy2023Value: '50.8%',
    fy2024Value: '54.8%',
    target2030Value: '70.0%',
    griReference: 'Ministry of Energy and Minerals ICV Blueprint',
    sdgAlignment: ['SDG 8 Decent Work', 'SDG 9 Industry & Innovation'],
    status: 'DISCLOSED',
    explanationNotes: 'Verified spend with Riyada-registered Omani SMEs and local supply chain.'
  },
  {
    code: 'MSX-S7',
    title: 'Occupational Health & Safety (Fatalities & LTIFR)',
    standard: 'MSX_OMAN',
    pillar: 'Social',
    unit: 'Fatalities / LTIFR',
    fy2022Value: '0 / 0.12',
    fy2023Value: '0 / 0.09',
    fy2024Value: '0 / 0.085',
    target2030Value: '0 / 0.00',
    griReference: 'GRI 403-9',
    sdgAlignment: ['SDG 3 Health & Well-Being', 'SDG 8'],
    status: 'DISCLOSED',
    explanationNotes: 'Zero fatalities maintained across all Oman concession operations.'
  },
  {
    code: 'MSX-G1',
    title: 'Board Independence & Committee Oversight',
    standard: 'MSX_OMAN',
    pillar: 'Governance',
    unit: '% Independent',
    fy2022Value: '33.3%',
    fy2023Value: '44.4%',
    fy2024Value: '44.4%',
    target2030Value: '55.5%',
    griReference: 'Oman CMA Code of Corporate Governance',
    sdgAlignment: ['SDG 16 Strong Institutions'],
    status: 'DISCLOSED',
    explanationNotes: '4 out of 9 directors are independent non-executives with dedicated ESG committee.'
  }
];
