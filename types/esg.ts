// Comprehensive ESG (Environmental, Social, Governance) Domain Types
// Compliant with Oman (MSX, MSX, Oman MoL MD 286/2008, SCA) & Oman (MSX, Environment Authority, Vision 2040) Standards

export type ESGJurisdiction = 'OMAN' | 'GCC_CONSOLIDATED';

export type ESGStandard = 
  | 'MSX_OMAN'       // Muscat Stock Exchange ESG Reporting Guidelines (32 Indicators)
  | 'GRI_UNIVERSAL' // Global Reporting Initiative 2021 Universal Standards
  | 'ISSB_IFRS';    // IFRS S1 General & S2 Climate-related Disclosures

export type Scope1Category = 
  | 'Stationary_Combustion'   // Natural gas, Diesel generators, Boilers
  | 'Mobile_Combustion'       // Corporate fleet, heavy machinery, diesel trucks
  | 'Process_Emissions'       // Chemical reactions, cement, smelting
  | 'Fugitive_Refrigerants'   // HVAC chilling, R-134a, R-410A leakage
  | 'Flaring_and_Venting';    // O&G flaring, flare gas recovery, sour gas venting (Oman PDO / Oman PDO)

export type Scope2Category = 
  | 'Grid_Electricity'        // Nama Electricity (Oman), Nama Power (Muscat), Nama Power (Oman)
  | 'District_Cooling'        // Empower, Tabreed, National Central Cooling
  | 'Purchased_Steam';        // Industrial co-generation steam

export type Scope3Category = 
  | 'Cat1_Purchased_Goods'    // Raw materials, cement, steel, chemicals
  | 'Cat2_Capital_Goods'      // Heavy equipment, machinery, buildings
  | 'Cat3_Fuel_Energy'        // Upstream emissions from purchased fuels
  | 'Cat4_Upstream_Transport' // Freight, maritime logistics, air cargo
  | 'Cat5_Waste_Operations'   // Hazardous waste, industrial landfill (Be'ah (Oman) / Be'ah)
  | 'Cat6_Business_Travel'    // Flights, regional rail/road business trips
  | 'Cat7_Employee_Commute'   // Workforce bus shuttles, personal vehicle commuting
  | 'Cat9_Downstream_Transport'; // Distribution to customers in GCC

export type AssuranceLevel = 
  | 'UNAUDITED'
  | 'INTERNAL_AUDIT_VERIFIED'
  | 'LIMITED_ASSURANCE_ISAE3000'
  | 'REASONABLE_ASSURANCE';

export interface ESGFacility {
  id: string;
  name: string;
  code: string;
  jurisdiction: 'OMAN' | 'OMAN';
  location: string;
  emirateOrGovernorate: string; // e.g., 'Muscat', 'Sohar', 'Muscat', 'Sohar', 'Duqm'
  sector: 'Oil_and_Gas' | 'Manufacturing' | 'Construction' | 'Logistics_Ports' | 'Utilities';
  coordinates: [number, number];
  grossFloorAreaM2: number;
  workforceCount: number;
  nationalQuotaTargetPct: number; // Omanisation or Omanisation required %
  gridProvider: 'Nama Power' | 'Nama Power' | 'Nama_Oman' | 'Majan_Oman';
}

export interface DetailedEmissionRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  jurisdiction: 'OMAN' | 'OMAN';
  date: string;
  reportingPeriod: string; // e.g., '2024-Q1', '2024-Q2', '2024-Annual'
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: Scope1Category | Scope2Category | Scope3Category;
  source: string;
  activityData: number;
  unit: string;
  emissionFactor: number; // kgCO2e / unit
  emissionFactorSource: string; // 'Nama Power 2024', 'Nama Power 2024', 'Nama Oman 2024', 'IPCC AR6', 'DEFRA 2024'
  calculatedCO2eTonnes: number;
  verificationStatus: 'PENDING' | 'VALIDATED' | 'FLAGGED_ANOMALY';
  manifestOrInvoiceRef?: string; // Be'ah (Oman) manifest ID or Utility invoice number
  notes?: string;
}

export interface WaterEffluentRecord {
  id: string;
  facilityId: string;
  jurisdiction: 'OMAN' | 'OMAN';
  period: string;
  municipalWithdrawalM3: number;
  groundwaterAbstractionM3: number;
  recycledTSEWaterM3: number;
  totalConsumptionM3: number;
  waterIntensityM3PerFTE: number;
  industrialEffluentDischargedM3: number;
  effluentCompliancePct: number; // 100% compliant with EAD / Oman EA limits
  zeroLiquidDischargeActive: boolean;
}

export interface WasteManagementRecord {
  id: string;
  facilityId: string;
  jurisdiction: 'OMAN' | 'OMAN';
  period: string;
  hazardousWasteTonnes: number;
  hazardousWasteManifestSystem: 'Beah_Manifest_Oman' | 'Beah_Manifest_Oman' | 'Sohar_Municipality';
  hazardousManifestVerified: boolean;
  nonHazardousWasteTonnes: number;
  recycledWasteTonnes: number;
  wasteDivertedFromLandfillPct: number;
  compostingTonnes: number;
  circularityScorePct: number;
}

export interface NationalisationMetrics {
  jurisdiction: 'OMAN' | 'OMAN';
  frameworkName: string; // 'Omanisation (Ministry of Labour)' or 'Omanisation (Omanisation / Oman Ministry of Labour)'
  statutoryTargetPct: number;
  currentActualPct: number;
  totalHeadcount: number;
  nationalEmployees: number;
  managementNationalPct: number; // Executive & managerial level
  technicalNationalPct: number;  // Engineers & technical roles
  operationalNationalPct: number;// Operations & admin
  femaleNationalEmployees: number;
  nafisOrRiyadaParticipation: boolean;
  complianceStatus: 'COMPLIANT' | 'WARNING_NEAR_THRESHOLD' | 'NON_COMPLIANT_DEFICIT';
  deficitPenaltyRiskAmountOMRorOMR: number;
}

export interface InCountryValueMetrics {
  jurisdiction: 'OMAN' | 'OMAN';
  programName: string; // 'Oman In-Country Value Program (MEM / OIA)' or 'Tawreed / In-Country Value (Oman MoEM)'
  certifiedScorePct: number; // Certified ICV percentage score
  totalProcurementSpend: number; // In OMR
  localProcurementSpend: number;
  localProcurementPct: number;
  smeSpendAllocationPct: number; // Riyada (Oman) or Khalifa Fund / SME (Oman)
  localSubcontractorDevelopmentBudget: number;
  certificateExpiryDate: string;
  issuingCertifyingBody: string; // e.g., 'PDO / MoIAT Certified' or 'Oman MoEM / Deloitte Verified'
}

export interface SocialSafetyMetrics {
  reportingYear: number;
  totalManHoursWorked: number;
  fatalitiesCount: number; // Mandatory 0 target
  lostTimeInjuriesCount: number;
  ltifrRate: number; // LTIFR per 1,000,000 hours
  trirRate: number;  // Total Recordable Incident Rate
  nearMissesLogged: number;
  highPotentialEvents: number;
  occupationalIllnessCases: number;
  femaleWorkforcePct: number;
  femaleLeadershipPct: number;
  genderPayRatio: number; // Female-to-Male base compensation ratio (target 1.0)
  employeeTurnoverPct: number;
  trainingHoursPerEmployee: number;
  wageProtectionSystemCompliancePct: number; // Oman/Oman WPS (mandated 100%)
  middaySummerWorkBanBreaches: number;       // Mandated 0 breaches (12:30-15:00 summer ban)
  workerWelfareAccommodationAuditsPct: number;
}

export interface GovernanceMetrics {
  reportingYear: number;
  boardMembersTotal: number;
  independentDirectorsCount: number;
  independentDirectorsPct: number;
  femaleBoardDirectorsCount: number; // Oman CMA requires min 1 female director on listed boards
  femaleBoardDirectorsPct: number;
  boardEsgCommitteeExists: boolean;
  chiefSustainabilityOfficerReportToBoard: boolean;
  executivePayLinkedToEsgPct: number; // % of variable executive compensation tied to ESG/climate
  codeOfConductTrainingCompletionPct: number;
  antiBriberyAntiCorruptionAudited: boolean;
  whistleblowerCasesReceived: number;
  whistleblowerCasesResolved: number;
  whistleblowerRetaliationIncidents: number;
  dataPrivacyBreachesReported: number; // Oman Data Protection Law / Oman PDPL
  regulatoryFinesIncurredAmount: number; // Target 0
  assuranceLevel: AssuranceLevel;
  externalAssuranceProvider?: string; // e.g., 'KPMG', 'PwC', 'DNV'
}

export interface DecarbonizationInitiative {
  id: string;
  title: string;
  facility: string;
  category: 'Renewable_Energy' | 'Energy_Efficiency' | 'Fleet_Electrification' | 'Flaring_Abatement' | 'CCUS_Offset';
  capexInvestmentOMRorOMR: number;
  annualOpexSavingsOMRorOMR: number;
  abatementCO2eTonnesPerYear: number;
  marginalAbatementCostPerTonne: number; // Net cost or saving per tCO2e
  paybackPeriodYears: number;
  implementationStage: 'Feasibility' | 'Approved' | 'Under_Execution' | 'Commissioned';
  alignmentWithNetZero: string; // 'Oman Vision 2040 Decarbonization' | 'Oman Vision 2040 Decarbonization'
}

export interface ESGValidationIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  category: 'ANOMALY_DETECTION' | 'REGULATORY_BREACH' | 'MISSING_DATA' | 'EMISSION_FACTOR_MISMATCH' | 'ASSURANCE_GAP';
  title: string;
  description: string;
  affectedMetric: string;
  jurisdiction: 'OMAN' | 'OMAN' | 'GCC';
  regulatoryStandardRef: string; // e.g. 'MSX E1.1', 'MSX S3', 'Oman Ministry of Labour Quota', 'Oman MoL MD 286/2008 Element 7'
  recommendedAction: string;
  owner: string;
  timeline: string;
  resolved: boolean;
}

export interface ESGDisclosureItem {
  code: string;
  title: string;
  standard: ESGStandard;
  pillar: 'Environmental' | 'Social' | 'Governance';
  unit: string;
  fy2022Value: string | number;
  fy2023Value: string | number;
  fy2024Value: string | number;
  target2030Value: string | number;
  griReference: string;
  sdgAlignment: string[];
  status: 'DISCLOSED' | 'PARTIAL' | 'NOT_MATERIAL';
  explanationNotes: string;
}
