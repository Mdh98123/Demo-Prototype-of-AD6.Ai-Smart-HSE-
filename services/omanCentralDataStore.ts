/**
 * services/omanCentralDataStore.ts
 * ===============================================================================
 * CENTRAL TYPED REACTIVE DATA STORE FOR OMAN INDUSTRIAL QHSE & ESG OPERATIONS
 * ===============================================================================
 * Single Source of Truth for:
 * - Enterprise Organization & Sites (Sohar, Duqm, Fahud, Salalah)
 * - Users & Roles (10 Primary Roles)
 * - Contractors & In-Country Value (ICV) / Omanisation
 * - Permits to Work (PTW) with SIMOPS & Gating Checks
 * - Incidents, 5-Why Investigations & SIF Precursors
 * - Central CAPA Register & Escalation Engine
 * - Audits, Inspections & Statutory Compliance Items
 * - Environmental, Waste Manifests & ESG Metric Engine
 * - Cross-Module Dependency Automation Rules (1 through 7)
 * - LocalStorage Persistence with Instant Hydration & Reset
 */

import { UserRole, View, UserProfile } from '../types';

export interface OmaniSite {
  id: string;
  name: string;
  code: string;
  region: 'Al Batinah North' | 'Al Wusta (SEZAD)' | 'Ad Dhahirah (Block 6)' | 'Dhofar' | 'Muscat';
  coordinates: { lat: number; lng: number };
  facilityType: 'Refinery & Petrochemicals' | 'Industrial Port & Terminal' | 'Upstream Gas Processing' | 'Chemical Logistics';
  headcount: number;
  omanisationRate: number; // e.g. 84.5%
  heatStressLevel: 1 | 2 | 3 | 4;
  currentTempC: number;
  twlValueWm2: number; // Thermal Work Limit in W/m2 (PDO SP-1170 standard: < 115 is stop-work)
  middayWorkRestrictionActive: boolean; // 12:30 - 15:30 June-August [verify MD 286/2008]
  openIncidentsCount: number;
  activePermitsCount: number;
}

export interface OmaniContractor {
  id: string;
  name: string;
  crNumber: string; // Commercial Registration in Oman
  category: 'EPC Heavy Engineering' | 'Scaffolding & Rigging' | 'Non-Destructive Testing' | 'Industrial Tank Cleaning' | 'Hazardous Waste Logistics';
  prequalificationStatus: 'Approved' | 'Conditional' | 'Suspended' | 'Expired';
  safetyScore: number; // 0 - 100
  icvPercentage: number; // In-Country Value score
  omanisationPercentage: number;
  insuranceExpiryDate: string;
  iso45001Valid: boolean;
  activeWorkerCount: number;
  consecutiveDaysWithoutLTI: number;
  siteAccessGated: boolean;
  gatingReason?: string;
}

export interface OmaniWorkerCompetency {
  employeeId: string;
  fullName: string;
  role: string;
  employerId: string; // 'internal' or contractorId
  employerName: string;
  assignedSiteId: string;
  medicalFitnessStatus: 'Fit for Full Duty' | 'Fit with Restrictions' | 'Temporarily Unfit';
  medicalExpiryDate: string;
  h2sCertificateExpiry: string;
  confinedSpaceExpiry: string;
  workingAtHeightExpiry: string;
  authorizedGasTester: boolean;
  ptwHolderLevel: 'Level 1 Applicant' | 'Level 2 Area Authority' | 'Level 3 Issuing Authority' | 'None';
  siteAccessPermitted: boolean;
}

export interface OmaniPTW {
  id: string;
  permitNumber: string;
  type: 'Hot Work' | 'Confined Space Entry' | 'Working at Height' | 'Critical Lift' | 'Excavation' | 'Electrical Isolation / LOTO';
  title: string;
  siteId: string;
  siteName: string;
  exactLocation: string;
  zone: string;
  contractorId: string;
  contractorName: string;
  leadWorkerId: string;
  leadWorkerName: string;
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Active' | 'Suspended' | 'Closed';
  validFrom: string;
  validTo: string;
  riskAssessmentId: string;
  jsaAttached: boolean;
  gasTestingRequired: boolean;
  gasTestPassed: boolean;
  gasAtmosphereSummary?: string; // O2, LEL, H2S, CO
  isolationVerified: boolean;
  lotoTagNumber?: string;
  simopsConflictDetected: boolean;
  simopsConflictDetails?: string;
  gatingViolations: string[];
  issuedByRole?: string;
  issuerName?: string;
  authorizedAt?: string;
  emergencyStandbyRequired: boolean;
}

export interface OmaniIncident {
  id: string;
  referenceNumber: string;
  siteId: string;
  siteName: string;
  locationDetails: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'Near Miss' | 'First Aid' | 'Medical Treatment Case' | 'Lost Time Injury (LTI)' | 'SIF Potential' | 'Environmental Spill' | 'Road Traffic Incident' | 'Quality NCR';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  potentialSeverity: 'Low' | 'Medium' | 'High' | 'Critical (Life Threatening)';
  status: 'Reported' | 'Triage' | 'Investigation Active' | 'CAPA Implemented' | 'Verified Closed';
  reportedById: string;
  reportedByName: string;
  immediateActionsTaken: string;
  stopWorkTriggered: boolean;
  statutoryNotificationRequired: boolean; // Ministry of Labour (MoL) notice within 24h
  statutoryNotificationSent: boolean;
  statutoryDeadline: string;
  fiveWhys: Array<{ step: number; question: string; answer: string; evidence: string }>;
  fishboneFactors: {
    people: string[];
    process: string[];
    equipment: string[];
    environment: string[];
    materials: string[];
    management: string[];
  };
  rootCauseConclusion: string;
  assignedInvestigator: string;
  capaIds: string[];
  riskRegisterUpdated: boolean;
  trainingNeedIdentified: boolean;
  lostWorkDays: number;
}

export interface OmaniCAPA {
  id: string;
  sourceType: 'Incident Investigation' | 'Audit Finding' | 'Site Inspection' | 'Hazard Report' | 'Management of Change';
  sourceReference: string;
  siteId: string;
  siteName: string;
  title: string;
  actionDetails: string;
  priority: 'P1 - Critical (24h)' | 'P2 - High (7d)' | 'P3 - Medium (14d)' | 'P4 - Routine (30d)';
  hierarchyOfControl: 'Elimination' | 'Substitution' | 'Engineering Control' | 'Administrative' | 'PPE';
  assignedRole: string;
  ownerId: string;
  ownerName: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Pending Verification' | 'Verified Closed' | 'Overdue';
  escalatedToManager: boolean;
  verificationEvidence?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface OmaniAuditFinding {
  id: string;
  auditTitle: string;
  auditStandard: 'ISO 45001:2018' | 'ISO 14001:2015' | 'ISO 9001:2015' | 'Client Compliance (PDO/OQ)' | 'Ministry of Labour Safety Standard';
  clauseReference: string; // Marked [verify]
  siteId: string;
  siteName: string;
  findingType: 'Major Non-Conformance' | 'Minor Non-Conformance' | 'Observation' | 'Opportunity for Improvement';
  description: string;
  targetClosureDate: string;
  associatedCapaId?: string;
  status: 'Open' | 'CAPA In Progress' | 'Closed & Audited';
}

export interface OmaniESGMetric {
  reportingYear: number;
  reportingQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  scope1CO2eTonnes: number;
  scope2CO2eTonnes: number;
  scope3CO2eTonnes: number;
  flaringIntensityTonneHC: number;
  freshwaterWithdrawalM3: number;
  recycledWaterPercent: number;
  hazardousWasteTonnes: number;
  nonHazardousWasteRecycledTonnes: number;
  wasteManifestsClosedPercent: number;
  totalManHoursWorked: number;
  ltifrRate: number; // configurable basis
  trirRate: number;
  omanisationAchievedPercent: number;
  omanisationTargetPercent: number;
  inCountryValueSpentOMR: number; // Currency in OMR with 3 decimals
  communityInvestmentOMR: number;
  msxDisclosureScorePercent: number;
  humanReviewSignedBy?: string;
  narrativeSummary?: string;
}

export interface OmaniAuditTrailEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  entityType: 'PERMIT' | 'INCIDENT' | 'CAPA' | 'AUDIT' | 'CONTRACTOR' | 'ESG' | 'COMPETENCY';
  entityId: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
}

// ===============================================================================
// SEED DATA: FICTIONAL OMANI COMPANY — AL HAJAR INDUSTRIAL & ENERGY SOLUTIONS SAOC
// ===============================================================================
export const OMAN_COMPANY_NAME = "Al Hajar Industrial & Energy Solutions SAOC";

export const SEED_OMANI_SITES: OmaniSite[] = [
  {
    id: 'site-sohar',
    name: 'Sohar Industrial Port Petrochemical Complex',
    code: 'OMN-SOH-01',
    region: 'Al Batinah North',
    coordinates: { lat: 24.4980, lng: 56.6340 },
    facilityType: 'Refinery & Petrochemicals',
    headcount: 2450,
    omanisationRate: 86.4,
    heatStressLevel: 3,
    currentTempC: 41.5,
    twlValueWm2: 135,
    middayWorkRestrictionActive: true,
    openIncidentsCount: 1,
    activePermitsCount: 14
  },
  {
    id: 'site-duqm',
    name: 'Duqm Heavy Refining & Bunkering Terminal',
    code: 'OMN-DQM-02',
    region: 'Al Wusta (SEZAD)',
    coordinates: { lat: 19.6738, lng: 57.7042 },
    facilityType: 'Industrial Port & Terminal',
    headcount: 1890,
    omanisationRate: 79.2,
    heatStressLevel: 4,
    currentTempC: 44.2,
    twlValueWm2: 108, // Below 115 W/m2 triggers mandatory thermal work stoppage
    middayWorkRestrictionActive: true,
    openIncidentsCount: 2,
    activePermitsCount: 8
  },
  {
    id: 'site-fahud',
    name: 'Fahud Block-6 Central Gas Processing Plant',
    code: 'OMN-FHD-03',
    region: 'Ad Dhahirah (Block 6)',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    facilityType: 'Upstream Gas Processing',
    headcount: 1120,
    omanisationRate: 91.0,
    heatStressLevel: 3,
    currentTempC: 43.0,
    twlValueWm2: 122,
    middayWorkRestrictionActive: true,
    openIncidentsCount: 0,
    activePermitsCount: 11
  },
  {
    id: 'site-salalah',
    name: 'Salalah Free Zone Chemical Logistics Hub',
    code: 'OMN-SLL-04',
    region: 'Dhofar',
    coordinates: { lat: 17.0150, lng: 54.0924 },
    facilityType: 'Chemical Logistics',
    headcount: 760,
    omanisationRate: 88.5,
    heatStressLevel: 2,
    currentTempC: 34.0,
    twlValueWm2: 170,
    middayWorkRestrictionActive: false,
    openIncidentsCount: 0,
    activePermitsCount: 6
  }
];

export const SEED_OMANI_USERS: UserProfile[] = [
  {
    id: 'usr-qhse-director',
    name: 'Dr. Tariq Al-Busaidi',
    email: 'tariq.busaidi@alhajar-energy.om',
    role: 'Head_Group_HSE',
    jobTitle: 'Corporate QHSE & ESG Director',
    department: 'Corporate Safety & Sustainability',
    siteLocation: 'Muscat Corporate Headquarters · Knowledge Oasis',
    assignedSites: ['All Sites (Sohar, Duqm, Fahud, Salalah)'],
    safetyScore: 980,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'Chartered Safety Professional (IOSH/CFIOSH)', status: 'Valid', expiryDate: '2028-12-31' },
      { name: 'ISO 45001 & 14001 Lead Auditor', status: 'Valid', expiryDate: '2027-09-30' }
    ],
    achievements: []
  },
  {
    id: 'usr-hse-manager',
    name: 'Salim Al-Harthy',
    email: 'salim.harthy@alhajar-energy.om',
    role: 'Site_HSE_Manager',
    jobTitle: 'Sohar Complex HSE Manager',
    department: 'Sohar Operations Division',
    siteLocation: 'Sohar Industrial Port Terminal',
    assignedSites: ['Sohar Industrial Port Petrochemical Complex'],
    safetyScore: 940,
    recentIncidents: ['Investigated flare knock-out drum level anomaly'],
    observations: [],
    certifications: [
      { name: 'NEBOSH Diploma in Occupational Health & Safety', status: 'Valid', expiryDate: '2027-04-15' },
      { name: 'PDO Certified Incident Investigation Leader', status: 'Valid', expiryDate: '2026-11-20' }
    ],
    achievements: []
  },
  {
    id: 'usr-site-supervisor',
    name: 'Khalfan Al-Shehi',
    email: 'khalfan.shehi@alhajar-energy.om',
    role: 'Site_Supervisor',
    jobTitle: 'Duqm Field Safety Supervisor',
    department: 'Duqm Operations Support',
    siteLocation: 'Duqm Heavy Refining Terminal',
    assignedSites: ['Duqm Heavy Refining & Bunkering Terminal'],
    safetyScore: 890,
    recentIncidents: ['Triggered Stop Work Authority for heat stress index > 44°C'],
    observations: [],
    certifications: [
      { name: 'NEBOSH International General Certificate (IGC)', status: 'Valid', expiryDate: '2027-01-10' },
      { name: 'Thermal Stress & TWL Assessor (PDO SP-1170)', status: 'Valid', expiryDate: '2026-12-05' }
    ],
    achievements: []
  },
  {
    id: 'usr-quality-manager',
    name: 'Maryam Al-Balushi',
    email: 'maryam.balushi@alhajar-energy.om',
    role: 'Internal_Auditor',
    jobTitle: 'Corporate Quality Assurance Manager',
    department: 'Operational Excellence & Quality',
    siteLocation: 'Muscat Corporate HQ',
    assignedSites: ['All Sites (Sohar, Duqm, Fahud, Salalah)'],
    safetyScore: 920,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'ISO 9001:2015 Lead Quality Assessor', status: 'Valid', expiryDate: '2027-08-14' },
      { name: 'Six Sigma Black Belt (Industrial Processes)', status: 'Valid', expiryDate: '2029-05-18' }
    ],
    achievements: []
  },
  {
    id: 'usr-env-officer',
    name: 'Dr. Nasser Al-Ghafri',
    email: 'nasser.ghafri@alhajar-energy.om',
    role: 'Environmental_Officer',
    jobTitle: 'Environmental & Decarbonization Officer',
    department: 'ESG & Decarbonization Division',
    siteLocation: 'Fahud Processing Complex',
    assignedSites: ['Fahud Block-6 Central Gas Processing Plant'],
    safetyScore: 910,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'Certified Greenhouse Gas Accounting Practitioner (ISO 14064)', status: 'Valid', expiryDate: '2027-06-30' },
      { name: 'Oman Environment Authority Air Quality Compliance Specialist', status: 'Valid', expiryDate: '2028-02-15' }
    ],
    achievements: []
  },
  {
    id: 'usr-permit-authorizer',
    name: 'Ahmed Al-Kindi',
    email: 'ahmed.kindi@alhajar-energy.om',
    role: 'Project_Manager',
    jobTitle: 'Lead Permit Issuing Authority (Level 3 PTW)',
    department: 'Control of Work & Operations',
    siteLocation: 'Sohar Industrial Port Terminal',
    assignedSites: ['Sohar Industrial Port Petrochemical Complex'],
    safetyScore: 960,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'PDO SP-1143 Level 3 PTW Issuing Authority', status: 'Valid', expiryDate: '2027-03-31' },
      { name: 'Authorized Gas Testing Officer (AGT Level 1)', status: 'Valid', expiryDate: '2026-10-30' }
    ],
    achievements: []
  },
  {
    id: 'usr-contractor-rep',
    name: 'Rajesh Varma',
    email: 'rajesh.varma@galfar-oman.om',
    role: 'HSE_Officer',
    jobTitle: 'Contractor Lead HSE Manager (Galfar Engineering)',
    department: 'Galfar Industrial EPC Division',
    siteLocation: 'Duqm Heavy Refining Terminal',
    assignedSites: ['Duqm Heavy Refining & Bunkering Terminal'],
    safetyScore: 840,
    recentIncidents: ['Managed scaffold fall protection stand-down'],
    observations: [],
    certifications: [
      { name: 'NEBOSH International Diploma', status: 'Valid', expiryDate: '2027-05-12' },
      { name: 'Workmen Compensation Safety Coordinator', status: 'Valid', expiryDate: '2026-09-15' }
    ],
    achievements: []
  },
  {
    id: 'usr-auditor-inspector',
    name: 'Hilal Al-Rawahi',
    email: 'hilal.rawahi@qhse-auditors.om',
    role: 'Internal_Auditor',
    jobTitle: 'Lead Statutory & Standards Compliance Auditor',
    department: 'Assurance & Governance',
    siteLocation: 'Muscat Corporate HQ',
    assignedSites: ['All Concessions'],
    safetyScore: 950,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'IRCA Certified Lead Auditor (ISO 45001/14001/9001)', status: 'Valid', expiryDate: '2028-01-20' }
    ],
    achievements: []
  },
  {
    id: 'usr-operations-manager',
    name: 'Eng. Said Al-Maskari',
    email: 'said.maskari@alhajar-energy.om',
    role: 'Regional_HSE_Director',
    jobTitle: 'VP Operations & Asset Integrity',
    department: 'Executive Operations Division',
    siteLocation: 'Sohar Petrochemical Complex',
    assignedSites: ['All Concessions'],
    safetyScore: 970,
    recentIncidents: [],
    observations: [],
    certifications: [
      { name: 'Process Safety Leadership (IChemE)', status: 'Valid', expiryDate: '2028-04-10' }
    ],
    achievements: []
  },
  {
    id: 'usr-board-viewer',
    name: 'H.E. Sheikh Hilal Al-Maamari',
    email: 'hilal.maamari@alhajar-energy.om',
    role: 'Board_Director',
    jobTitle: 'Board Director & Safety Oversight Chair',
    department: 'Board Governance Committee',
    siteLocation: 'Muscat Corporate HQ',
    assignedSites: ['All Concessions'],
    safetyScore: 990,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  }
];

export const SEED_OMANI_CONTRACTORS: OmaniContractor[] = [
  {
    id: 'cnt-galfar',
    name: 'Galfar Engineering & Contracting SAOG',
    crNumber: 'CR-1029481',
    category: 'EPC Heavy Engineering',
    prequalificationStatus: 'Approved',
    safetyScore: 94,
    icvPercentage: 68.5,
    omanisationPercentage: 42.1,
    insuranceExpiryDate: '2027-03-31',
    iso45001Valid: true,
    activeWorkerCount: 420,
    consecutiveDaysWithoutLTI: 412,
    siteAccessGated: false
  },
  {
    id: 'cnt-sts',
    name: 'Special Technical Services (STS) Oman LLC',
    crNumber: 'CR-2083944',
    category: 'Scaffolding & Rigging',
    prequalificationStatus: 'Approved',
    safetyScore: 91,
    icvPercentage: 62.0,
    omanisationPercentage: 38.6,
    insuranceExpiryDate: '2026-12-15',
    iso45001Valid: true,
    activeWorkerCount: 260,
    consecutiveDaysWithoutLTI: 285,
    siteAccessGated: false
  },
  {
    id: 'cnt-arabian-ind',
    name: 'Arabian Industries Projects LLC',
    crNumber: 'CR-3849102',
    category: 'Non-Destructive Testing',
    prequalificationStatus: 'Approved',
    safetyScore: 96,
    icvPercentage: 71.0,
    omanisationPercentage: 45.0,
    insuranceExpiryDate: '2027-01-20',
    iso45001Valid: true,
    activeWorkerCount: 180,
    consecutiveDaysWithoutLTI: 630,
    siteAccessGated: false
  },
  {
    id: 'cnt-oman-clean',
    name: 'Al Duqm Industrial Tank Cleaning Services',
    crNumber: 'CR-4829103',
    category: 'Industrial Tank Cleaning',
    prequalificationStatus: 'Suspended',
    safetyScore: 58,
    icvPercentage: 54.0,
    omanisationPercentage: 22.0,
    insuranceExpiryDate: '2026-06-30', // Expired insurance
    iso45001Valid: false,
    activeWorkerCount: 45,
    consecutiveDaysWithoutLTI: 42,
    siteAccessGated: true,
    gatingReason: 'Workmen Compensation insurance expired & repeated confined space gas testing breach at Duqm.'
  },
  {
    id: 'cnt-beah-waste',
    name: 'Oman Environmental Services Holding (be\'ah Certified Logistics)',
    crNumber: 'CR-5918274',
    category: 'Hazardous Waste Logistics',
    prequalificationStatus: 'Approved',
    safetyScore: 98,
    icvPercentage: 84.0,
    omanisationPercentage: 78.0,
    insuranceExpiryDate: '2027-08-30',
    iso45001Valid: true,
    activeWorkerCount: 65,
    consecutiveDaysWithoutLTI: 890,
    siteAccessGated: false
  }
];

export const SEED_OMANI_WORKERS: OmaniWorkerCompetency[] = [
  {
    employeeId: 'wrk-001',
    fullName: 'Hamad Al-Ghafri',
    role: 'Senior Mechanical Technician',
    employerId: 'internal',
    employerName: OMAN_COMPANY_NAME,
    assignedSiteId: 'site-sohar',
    medicalFitnessStatus: 'Fit for Full Duty',
    medicalExpiryDate: '2027-04-10',
    h2sCertificateExpiry: '2027-02-15',
    confinedSpaceExpiry: '2026-11-20',
    workingAtHeightExpiry: '2027-01-15',
    authorizedGasTester: true,
    ptwHolderLevel: 'Level 2 Area Authority',
    siteAccessPermitted: true
  },
  {
    employeeId: 'wrk-002',
    fullName: 'Rajesh Kumar (Contractor)',
    role: 'Certified Welder & Pipefitter',
    employerId: 'cnt-galfar',
    employerName: 'Galfar Engineering & Contracting SAOG',
    assignedSiteId: 'site-duqm',
    medicalFitnessStatus: 'Fit for Full Duty',
    medicalExpiryDate: '2026-08-15', // EXPIRED MEDICAL FITNESS
    h2sCertificateExpiry: '2026-07-20', // EXPIRED H2S CERTIFICATE
    confinedSpaceExpiry: '2026-09-01',
    workingAtHeightExpiry: '2026-10-10',
    authorizedGasTester: false,
    ptwHolderLevel: 'Level 1 Applicant',
    siteAccessPermitted: false // Auto-gated due to expired mandatory H2S and medical
  },
  {
    employeeId: 'wrk-003',
    fullName: 'Said Al-Rawahi',
    role: 'Electrical & Instrumentation Specialist',
    employerId: 'internal',
    employerName: OMAN_COMPANY_NAME,
    assignedSiteId: 'site-fahud',
    medicalFitnessStatus: 'Fit for Full Duty',
    medicalExpiryDate: '2027-09-12',
    h2sCertificateExpiry: '2027-08-01',
    confinedSpaceExpiry: '2027-03-15',
    workingAtHeightExpiry: '2027-04-10',
    authorizedGasTester: true,
    ptwHolderLevel: 'Level 2 Area Authority',
    siteAccessPermitted: true
  },
  {
    employeeId: 'wrk-004',
    fullName: 'Mohammed Al-Shezawi',
    role: 'Rigger & Scaffolding Inspector',
    employerId: 'cnt-sts',
    employerName: 'Special Technical Services (STS) Oman LLC',
    assignedSiteId: 'site-sohar',
    medicalFitnessStatus: 'Fit for Full Duty',
    medicalExpiryDate: '2027-02-28',
    h2sCertificateExpiry: '2027-01-14',
    confinedSpaceExpiry: '2026-12-10',
    workingAtHeightExpiry: '2027-06-25',
    authorizedGasTester: false,
    ptwHolderLevel: 'Level 1 Applicant',
    siteAccessPermitted: true
  }
];

export const SEED_OMANI_PERMITS: OmaniPTW[] = [
  {
    id: 'ptw-soh-01',
    permitNumber: 'PTW-SOH-2026-0421',
    type: 'Hot Work',
    title: 'Off-gas Compressor Discharge Spool Welding & Tie-in',
    siteId: 'site-sohar',
    siteName: 'Sohar Industrial Port Petrochemical Complex',
    exactLocation: 'Process Unit 03 · Flare Header Tie-in Point',
    zone: 'Zone 1 (Classified Hazardous)',
    contractorId: 'cnt-galfar',
    contractorName: 'Galfar Engineering & Contracting SAOG',
    leadWorkerId: 'wrk-001',
    leadWorkerName: 'Hamad Al-Ghafri',
    status: 'Active',
    validFrom: '2026-10-22T06:00:00Z',
    validTo: '2026-10-22T18:00:00Z',
    riskAssessmentId: 'HIRA-SOH-082',
    jsaAttached: true,
    gasTestingRequired: true,
    gasTestPassed: true,
    gasAtmosphereSummary: 'O2: 20.9% | LEL: 0.0% | H2S: 0.0 ppm | CO: 0 ppm (Verified by AGT Ahmed Al-Kindi)',
    isolationVerified: true,
    lotoTagNumber: 'LOTO-SOH-9921 (Mechanical Spade + Electrical Lockout)',
    simopsConflictDetected: false,
    gatingViolations: [],
    issuedByRole: 'Level 3 Issuing Authority',
    issuerName: 'Ahmed Al-Kindi',
    authorizedAt: '2026-10-22T05:45:00Z',
    emergencyStandbyRequired: true
  },
  {
    id: 'ptw-duqm-02',
    permitNumber: 'PTW-DQM-2026-0718',
    type: 'Confined Space Entry',
    title: 'Crude Storage Tank TK-402 Internal De-sludging & Visual NDT',
    siteId: 'site-duqm',
    siteName: 'Duqm Heavy Refining & Bunkering Terminal',
    exactLocation: 'Tank Farm B · Crude Storage Tank TK-402',
    zone: 'Confined Hazardous Atmosphere',
    contractorId: 'cnt-oman-clean',
    contractorName: 'Al Duqm Industrial Tank Cleaning Services',
    leadWorkerId: 'wrk-002',
    leadWorkerName: 'Rajesh Kumar (Contractor)',
    status: 'Suspended',
    validFrom: '2026-10-22T07:00:00Z',
    validTo: '2026-10-22T15:00:00Z',
    riskAssessmentId: 'HIRA-DQM-104',
    jsaAttached: false, // JSA Missing
    gasTestingRequired: true,
    gasTestPassed: false, // Failed Gas test
    gasAtmosphereSummary: 'ALERT: LEL at 8.4% (Threshold < 1%) | H2S: 4.8 ppm (Safe Limit < 1.0 ppm)',
    isolationVerified: false,
    simopsConflictDetected: true,
    simopsConflictDetails: 'Clash with simultaneous hydro-testing of adjacent delivery pipeline P-102 (50m safety perimeter breached).',
    gatingViolations: [
      'Worker Rajesh Kumar has EXPIRED mandatory H2S and Medical Fitness certifications.',
      'Contractor Al Duqm Tank Cleaning has SUSPENDED status (Expired Workmen Compensation).',
      'Gas testing atmosphere FAILED safety thresholds (LEL > 1%, H2S > 1 ppm).',
      'SIMOPS Conflict with adjacent active pipeline pressure test.'
    ],
    emergencyStandbyRequired: true
  },
  {
    id: 'ptw-fahud-03',
    permitNumber: 'PTW-FHD-2026-0112',
    type: 'Electrical Isolation / LOTO',
    title: 'High-Voltage Switchgear Panel Breaker Maintenance (11kV)',
    siteId: 'site-fahud',
    siteName: 'Fahud Block-6 Central Gas Processing Plant',
    exactLocation: 'Substation SS-02 · Switchgear Bay 4',
    zone: 'High-Voltage Electrical Substation',
    contractorId: 'internal',
    contractorName: OMAN_COMPANY_NAME,
    leadWorkerId: 'wrk-003',
    leadWorkerName: 'Said Al-Rawahi',
    status: 'Approved',
    validFrom: '2026-10-22T08:00:00Z',
    validTo: '2026-10-22T16:00:00Z',
    riskAssessmentId: 'HIRA-FHD-044',
    jsaAttached: true,
    gasTestingRequired: false,
    gasTestPassed: true,
    isolationVerified: true,
    lotoTagNumber: 'LOTO-FHD-1104 (Padlock #88 + Danger Do Not Operate Tag)',
    simopsConflictDetected: false,
    gatingViolations: [],
    issuedByRole: 'Senior Electrical Authorized Person',
    issuerName: 'Said Al-Rawahi',
    authorizedAt: '2026-10-22T07:30:00Z',
    emergencyStandbyRequired: false
  }
];

export const SEED_OMANI_INCIDENTS: OmaniIncident[] = [
  {
    id: 'inc-omn-01',
    referenceNumber: 'INC-2026-OMN-0881',
    siteId: 'site-duqm',
    siteName: 'Duqm Heavy Refining & Bunkering Terminal',
    locationDetails: 'Jetty Area 4 · Marine Unloading Arm 2',
    title: 'Heat Stress Near-Miss: Scaffolder Dizziness at Midday Summer Peak',
    description: 'During dismantling of an elevated jetty scaffold at 13:10 GST in 44.5°C ambient heat and 68% relative humidity, a contractor scaffolder reported severe nausea, shivering, and blurred vision (Thermal Work Limit TWL measured at 98 W/m²). Co-workers intervened immediately under Stop Work Authority (SWA) and lowered the worker to the shaded jetty clinic.',
    timestamp: '2026-10-18T13:10:00Z',
    type: 'Near Miss',
    severity: 'Medium',
    potentialSeverity: 'Critical (Life Threatening)',
    status: 'CAPA Implemented',
    reportedById: 'usr-site-supervisor',
    reportedByName: 'Khalfan Al-Shehi (Safety Supervisor)',
    immediateActionsTaken: 'Immediate SWA called; 40-minute cold electrolyte rehydration administered; oral rehydration salt therapy applied; all outdoor work across Duqm Jetty halted until 15:30 in compliance with Oman summer midday work restrictions.',
    stopWorkTriggered: true,
    statutoryNotificationRequired: false, // Near miss did not require 24h MoL notice, but entered in internal register
    statutoryNotificationSent: false,
    statutoryDeadline: '2026-10-19T13:10:00Z',
    fiveWhys: [
      { step: 1, question: 'Why did the worker experience acute heat exhaustion?', answer: 'Body core temperature spiked while working on an unshaded steel jetty in 44.5°C heat.', evidence: 'Clinic medical log recorded temperature 38.6°C.' },
      { step: 2, question: 'Why was work proceeding at 13:10 during high heat index?', answer: 'The crew was attempting to complete scaffold removal before vessel docking deadline.', evidence: 'Vessel berthing schedule log.' },
      { step: 3, question: 'Why was the mandatory midday work suspension (12:30-15:30) breached?', answer: 'The contractor site charge-hand miscommunicated the midday break start time as 13:30.', evidence: 'Witness statements from contractor crew.' },
      { step: 4, question: 'Why did supervisor oversight fail to stop the work at 12:30?', answer: 'The thermal stress flag on the jetty was not raised because the weather station telemetry lost signal.', evidence: 'Weather sensor gateway communication log.' },
      { step: 5, question: 'What is the root cause?', answer: 'Lack of automated fail-safe audible siren for midday heat stoppage and contractor supervision failure on thermal stress procedures (PDO SP-1170 / MD 286/2008).', evidence: 'Root Cause Analysis Team consensus.' }
    ],
    fishboneFactors: {
      people: ['Contractor charge-hand pushed schedule over thermal rest guidelines', 'Worker had insufficient salt hydration'],
      process: ['Midday work stoppage procedure lacked automated siren trigger', 'Shift handover failed to record TWL index'],
      equipment: ['Remote jetty weather telemetry gateway experienced battery drop'],
      environment: ['Extreme ambient heat (44.5°C) and maritime humidity (68%) driving TWL < 100 W/m²'],
      materials: ['Dark non-breathable coveralls provided by contractor instead of lightweight high-visibility cotton'],
      management: ['Contractor supervisor failed to enforce mandatory water-rest cycles']
    },
    rootCauseConclusion: 'Contractor schedule pressure and failure of automated heat-stress alerting system led to outdoor work continuance during statutory prohibited midday hours.',
    assignedInvestigator: 'Salim Al-Harthy',
    capaIds: ['capa-omn-01', 'capa-omn-02'],
    riskRegisterUpdated: true,
    trainingNeedIdentified: true,
    lostWorkDays: 0
  },
  {
    id: 'inc-omn-02',
    referenceNumber: 'INC-2026-OMN-0902',
    siteId: 'site-sohar',
    siteName: 'Sohar Industrial Port Petrochemical Complex',
    locationDetails: 'Polymer Extrusion Line 2 · Granule Transfer Hopper',
    title: 'Hydraulic Hose Pin-hole Jet Leak - PPE Containment & SWA',
    description: 'During routine pressurization of the granule cutter hydraulic power pack (160 bar), an aging flexible rubber hose developed a micro pin-hole rupture. The high-pressure hydraulic fluid jet was intercepted by the newly installed ballistic sleeve, preventing worker injection injury.',
    timestamp: '2026-10-12T09:40:00Z',
    type: 'Near Miss',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'Verified Closed',
    reportedById: 'usr-hse-manager',
    reportedByName: 'Salim Al-Harthy',
    immediateActionsTaken: 'Emergency stop pushed; hydraulic circuit depressurized; 5m radius cordon placed; spill absorbent pads deployed.',
    stopWorkTriggered: true,
    statutoryNotificationRequired: false,
    statutoryNotificationSent: false,
    statutoryDeadline: '2026-10-13T09:40:00Z',
    fiveWhys: [
      { step: 1, question: 'Why did the pinhole leak occur?', answer: 'The inner elastomer tube of the high-pressure hose degraded from vibration cycles.', evidence: 'Metallurgical cross-section inspection.' },
      { step: 2, question: 'Why was the degraded hose in service?', answer: 'The hose was at 26 months service against a 24-month replacement guideline.', evidence: 'CMMS maintenance work order.' },
      { step: 3, question: 'Why did the CMMS not flag the overdue hose?', answer: 'Flexible hoses were inventoried as general fittings rather than safety-critical elements.', evidence: 'SAP Asset hierarchy review.' },
      { step: 4, question: 'Why did no injury occur?', answer: 'Ballistic burst containment sleeve successfully dissipated fluid energy.', evidence: 'Intact outer ballistic sheath.' },
      { step: 5, question: 'What is the root cause?', answer: 'Failure to register high-pressure hydraulic hoses as safety-critical equipment with scheduled lifecycle replacement in asset management system.', evidence: 'Investigation conclusion.' }
    ],
    fishboneFactors: {
      people: ['Maintenance planner relied on visual inspection rather than date code'],
      process: ['Preventive maintenance plan lacked time-based hose scrap policy'],
      equipment: ['Hydraulic power pack lacked anti-vibration dampers'],
      environment: ['Continuous 24/7 operating cycle with thermal expansion'],
      materials: ['OEM crimped hose exceeded manufacturer shelf life'],
      management: ['Asset tagging system did not classify fluid lines as Barrier Critical']
    },
    rootCauseConclusion: 'Lack of scheduled lifecycle replacement for safety-critical pressurized hoses in enterprise asset maintenance system.',
    assignedInvestigator: 'Ahmed Al-Kindi',
    capaIds: ['capa-omn-03'],
    riskRegisterUpdated: true,
    trainingNeedIdentified: false,
    lostWorkDays: 0
  }
];

export const SEED_OMANI_CAPAS: OmaniCAPA[] = [
  {
    id: 'capa-omn-01',
    sourceType: 'Incident Investigation',
    sourceReference: 'INC-2026-OMN-0881',
    siteId: 'site-duqm',
    siteName: 'Duqm Heavy Refining & Bunkering Terminal',
    title: 'Install Automated Thermal Stress Sirens & Red Visual Strobes across Duqm Jetty',
    actionDetails: 'Procure and commission solar-powered automated thermal stress horns triggered whenever jetty weather station registers ambient temperature ≥ 42°C or TWL < 115 W/m² (PDO SP-1170 [verify]). Must sound automatically at 12:25 GST prior to mandatory 12:30 midday work cessation.',
    priority: 'P1 - Critical (24h)',
    hierarchyOfControl: 'Engineering Control',
    assignedRole: 'Duqm Field Safety Supervisor',
    ownerId: 'usr-site-supervisor',
    ownerName: 'Khalfan Al-Shehi',
    dueDate: '2026-10-25',
    status: 'In Progress',
    escalatedToManager: false
  },
  {
    id: 'capa-omn-02',
    sourceType: 'Incident Investigation',
    sourceReference: 'INC-2026-OMN-0881',
    siteId: 'site-duqm',
    siteName: 'Duqm Heavy Refining & Bunkering Terminal',
    title: 'Mandatory Re-Induction on Thermal Stress & Electrolyte Protocols for Galfar Crews',
    actionDetails: 'Conduct mandatory 45-minute bilingual (Arabic, Hindi, Bengali) thermal illness prevention stand-downs for all 420 Galfar contractor personnel at Duqm, verifying understanding of urine hydration charts and mandatory 15-minute shaded rest intervals.',
    priority: 'P2 - High (7d)',
    hierarchyOfControl: 'Administrative',
    assignedRole: 'Contractor Lead HSE Manager',
    ownerId: 'usr-contractor-rep',
    ownerName: 'Rajesh Varma',
    dueDate: '2026-10-24',
    status: 'In Progress',
    escalatedToManager: false
  },
  {
    id: 'capa-omn-03',
    sourceType: 'Incident Investigation',
    sourceReference: 'INC-2026-OMN-0902',
    siteId: 'site-sohar',
    siteName: 'Sohar Industrial Port Petrochemical Complex',
    title: 'CMMS Re-tagging: Classify all Pressurized Flexible Hoses > 100 bar as Safety Critical',
    actionDetails: 'Audit and assign unique RFID tags and 24-month hard replacement deadlines for 340 high-pressure flexible hoses across Sohar extrusion and refinery units in SAP/CMMS.',
    priority: 'P2 - High (7d)',
    hierarchyOfControl: 'Administrative',
    assignedRole: 'Sohar Complex HSE Manager',
    ownerId: 'usr-hse-manager',
    ownerName: 'Salim Al-Harthy',
    dueDate: '2026-10-28',
    status: 'Verified Closed',
    escalatedToManager: false,
    verificationEvidence: 'CMMS database updated with 340 assets tagged with 24-month scrap dates; audited by Maryam Al-Balushi.',
    verifiedBy: 'Dr. Tariq Al-Busaidi',
    verifiedAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'capa-omn-04',
    sourceType: 'Audit Finding',
    sourceReference: 'AUD-2026-ISO45001-04',
    siteId: 'site-fahud',
    siteName: 'Fahud Block-6 Central Gas Processing Plant',
    title: 'Rectify Missing Secondary Containment on Chemical Injection Skid SK-04',
    actionDetails: 'Fabricate 110% capacity epoxy-coated bund containment wall around corrosion inhibitor storage skid to satisfy Environment Authority Royal Decree 114/2001 and ISO 14001:2015 Cl. 8.1 [verify].',
    priority: 'P3 - Medium (14d)',
    hierarchyOfControl: 'Engineering Control',
    assignedRole: 'Environmental & Decarbonization Officer',
    ownerId: 'usr-env-officer',
    ownerName: 'Dr. Nasser Al-Ghafri',
    dueDate: '2026-11-05',
    status: 'Open',
    escalatedToManager: false
  }
];

export const SEED_OMANI_AUDIT_FINDINGS: OmaniAuditFinding[] = [
  {
    id: 'find-01',
    auditTitle: 'Annual Integrated QHSE Certification Surveillance (ISO 45001 / ISO 14001)',
    auditStandard: 'ISO 45001:2018',
    clauseReference: 'Clause 8.1.2 (Hierarchy of Controls) [verify against current ISO standard]',
    siteId: 'site-duqm',
    siteName: 'Duqm Heavy Refining & Bunkering Terminal',
    findingType: 'Minor Non-Conformance',
    description: 'Workplace heat stress mitigation on elevated jetty scaffolding relied primarily on PPE coveralls rather than engineering shade and automated heat index telemetry.',
    targetClosureDate: '2026-11-15',
    associatedCapaId: 'capa-omn-01',
    status: 'CAPA In Progress'
  },
  {
    id: 'find-02',
    auditTitle: 'PDO Block-6 Pre-Qualification & Joint Concession HSE Audit',
    auditStandard: 'Client Compliance (PDO/OQ)',
    clauseReference: 'PDO SP-1143 Specification for Permit to Work Cl. 4.2 [verify against PDO guidelines]',
    siteId: 'site-fahud',
    siteName: 'Fahud Block-6 Central Gas Processing Plant',
    findingType: 'Observation',
    description: 'Calibration logs for portable 4-gas detectors in Substation SS-02 were updated within 30 days, but zero-bump testing frequency was not recorded before every daily shift.',
    targetClosureDate: '2026-11-01',
    status: 'Open'
  },
  {
    id: 'find-03',
    auditTitle: 'Environment Authority Statutory Hazardous Waste Compliance Inspection',
    auditStandard: 'Ministry of Labour Safety Standard',
    clauseReference: 'Oman Environment Authority Royal Decree 114/2001 (Pollution Control) [verify]',
    siteId: 'site-sohar',
    siteName: 'Sohar Industrial Port Petrochemical Complex',
    findingType: 'Major Non-Conformance',
    description: 'Waste manifest WM-2026-0419 for spent catalyst transport lacked destination landfill receipt verification by certified hazardous waste contractor be\'ah.',
    targetClosureDate: '2026-10-30',
    associatedCapaId: 'capa-omn-04',
    status: 'CAPA In Progress'
  }
];

export const SEED_OMANI_ESG_METRIC: OmaniESGMetric = {
  reportingYear: 2026,
  reportingQuarter: 'Q3',
  scope1CO2eTonnes: 142850.400,
  scope2CO2eTonnes: 38240.150,
  scope3CO2eTonnes: 92100.800,
  flaringIntensityTonneHC: 1.42,
  freshwaterWithdrawalM3: 412500,
  recycledWaterPercent: 88.4,
  hazardousWasteTonnes: 342.100,
  nonHazardousWasteRecycledTonnes: 1840.600,
  wasteManifestsClosedPercent: 98.2,
  totalManHoursWorked: 4850000, // 4.85 Million Hours across 4 Sites
  ltifrRate: 0.206, // 1 LTI in 4.85M hours = 0.206 per 1,000,000 hrs (or 0.041 per 200,000 hrs)
  trirRate: 0.824, // 4 Recordables (1 LTI, 1 MTC, 2 Restricted) in 4.85M hrs = 0.824 per 1,000,000 hrs
  omanisationAchievedPercent: 84.8, // National Target is 80% for energy & heavy industry
  omanisationTargetPercent: 80.0,
  inCountryValueSpentOMR: 14850250.750, // OMR 14,850,250.750
  communityInvestmentOMR: 450000.000, // OMR 450,000.000 (scholarships, community greening in Sohar & Duqm)
  msxDisclosureScorePercent: 94.5,
  humanReviewSignedBy: 'Dr. Tariq Al-Busaidi (QHSE & ESG Director)',
  narrativeSummary: 'Al Hajar Industrial & Energy Solutions SAOC demonstrated strong operational resilience in Q3 2026. Omanisation reached 84.8%, surpassing the national 80% quota. Water recycling achieved 88.4% across Sohar and Duqm facilities. SIF precursor near-misses prompted immediate engineering controls on heat stress and pressurized lines. Scope 1 and 2 emissions tracking aligns with Oman Vision 2040 and net-zero path.'
};

// ===============================================================================
// REACTIVE CENTRAL STORE CLASS WITH LOCALSTORAGE PERSISTENCE
// ===============================================================================
export class OmanCentralDataStore {
  private static readonly STORAGE_PREFIX = 'ad6_oman_qhse_';
  private static readonly KEY_SITES = `${this.STORAGE_PREFIX}sites`;
  private static readonly KEY_USERS = `${this.STORAGE_PREFIX}users`;
  private static readonly KEY_CONTRACTORS = `${this.STORAGE_PREFIX}contractors`;
  private static readonly KEY_WORKERS = `${this.STORAGE_PREFIX}workers`;
  private static readonly KEY_PERMITS = `${this.STORAGE_PREFIX}permits`;
  private static readonly KEY_INCIDENTS = `${this.STORAGE_PREFIX}incidents`;
  private static readonly KEY_CAPAS = `${this.STORAGE_PREFIX}capas`;
  private static readonly KEY_FINDINGS = `${this.STORAGE_PREFIX}findings`;
  private static readonly KEY_ESG = `${this.STORAGE_PREFIX}esg`;
  private static readonly KEY_AUDIT_TRAIL = `${this.STORAGE_PREFIX}audit_trail`;

  private static listeners: Set<(entityType: string, action: string, id?: string) => void> = new Set();

  public static subscribe(fn: (entityType: string, action: string, id?: string) => void): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private static notify(entityType: string, action: string, id?: string): void {
    this.listeners.forEach(fn => fn(entityType, action, id));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-oman-store-updated', { detail: { entityType, action, id } }));
    }
  }

  // -----------------------------------------------------------------------------
  // INITIALIZATION & RESET
  // -----------------------------------------------------------------------------
  public static initialize(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(this.KEY_SITES)) {
      this.resetToSeedData();
    }
  }

  public static resetToSeedData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.KEY_SITES, JSON.stringify(SEED_OMANI_SITES));
    localStorage.setItem(this.KEY_USERS, JSON.stringify(SEED_OMANI_USERS));
    localStorage.setItem(this.KEY_CONTRACTORS, JSON.stringify(SEED_OMANI_CONTRACTORS));
    localStorage.setItem(this.KEY_WORKERS, JSON.stringify(SEED_OMANI_WORKERS));
    localStorage.setItem(this.KEY_PERMITS, JSON.stringify(SEED_OMANI_PERMITS));
    localStorage.setItem(this.KEY_INCIDENTS, JSON.stringify(SEED_OMANI_INCIDENTS));
    localStorage.setItem(this.KEY_CAPAS, JSON.stringify(SEED_OMANI_CAPAS));
    localStorage.setItem(this.KEY_FINDINGS, JSON.stringify(SEED_OMANI_AUDIT_FINDINGS));
    localStorage.setItem(this.KEY_ESG, JSON.stringify(SEED_OMANI_ESG_METRIC));
    localStorage.setItem(this.KEY_AUDIT_TRAIL, JSON.stringify([
      {
        id: 'aud-init-01',
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'System Engine',
        actorRole: 'ADMIN',
        actionType: 'SYSTEM_RESET',
        entityType: 'PERMIT',
        entityId: 'ALL',
        summary: 'Demo dataset restored to Al Hajar Industrial & Energy Solutions SAOC baseline (Sohar, Duqm, Fahud, Salalah).'
      }
    ]));
    this.notify('all', 'reset');
  }

  // -----------------------------------------------------------------------------
  // GETTERS (SAFE FALLBACK)
  // -----------------------------------------------------------------------------
  public static getSites(): OmaniSite[] {
    try {
      const data = localStorage.getItem(this.KEY_SITES);
      return data ? JSON.parse(data) : SEED_OMANI_SITES;
    } catch {
      return SEED_OMANI_SITES;
    }
  }

  public static getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(this.KEY_USERS);
      return data ? JSON.parse(data) : SEED_OMANI_USERS;
    } catch {
      return SEED_OMANI_USERS;
    }
  }

  public static getContractors(): OmaniContractor[] {
    try {
      const data = localStorage.getItem(this.KEY_CONTRACTORS);
      return data ? JSON.parse(data) : SEED_OMANI_CONTRACTORS;
    } catch {
      return SEED_OMANI_CONTRACTORS;
    }
  }

  public static getWorkers(): OmaniWorkerCompetency[] {
    try {
      const data = localStorage.getItem(this.KEY_WORKERS);
      return data ? JSON.parse(data) : SEED_OMANI_WORKERS;
    } catch {
      return SEED_OMANI_WORKERS;
    }
  }

  public static getPermits(): OmaniPTW[] {
    try {
      const data = localStorage.getItem(this.KEY_PERMITS);
      return data ? JSON.parse(data) : SEED_OMANI_PERMITS;
    } catch {
      return SEED_OMANI_PERMITS;
    }
  }

  public static getIncidents(): OmaniIncident[] {
    try {
      const data = localStorage.getItem(this.KEY_INCIDENTS);
      return data ? JSON.parse(data) : SEED_OMANI_INCIDENTS;
    } catch {
      return SEED_OMANI_INCIDENTS;
    }
  }

  public static getCapas(): OmaniCAPA[] {
    try {
      const data = localStorage.getItem(this.KEY_CAPAS);
      return data ? JSON.parse(data) : SEED_OMANI_CAPAS;
    } catch {
      return SEED_OMANI_CAPAS;
    }
  }

  public static getFindings(): OmaniAuditFinding[] {
    try {
      const data = localStorage.getItem(this.KEY_FINDINGS);
      return data ? JSON.parse(data) : SEED_OMANI_AUDIT_FINDINGS;
    } catch {
      return SEED_OMANI_AUDIT_FINDINGS;
    }
  }

  public static getESG(): OmaniESGMetric {
    try {
      const data = localStorage.getItem(this.KEY_ESG);
      return data ? JSON.parse(data) : SEED_OMANI_ESG_METRIC;
    } catch {
      return SEED_OMANI_ESG_METRIC;
    }
  }

  public static getAuditTrail(): OmaniAuditTrailEntry[] {
    try {
      const data = localStorage.getItem(this.KEY_AUDIT_TRAIL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // -----------------------------------------------------------------------------
  // AUDIT TRAIL LOGGING (Rule 7)
  // -----------------------------------------------------------------------------
  public static logAudit(actor: UserProfile, actionType: string, entityType: OmaniAuditTrailEntry['entityType'], entityId: string, summary: string, prev?: string, next?: string): void {
    const trail = this.getAuditTrail();
    const entry: OmaniAuditTrailEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actionType,
      entityType,
      entityId,
      summary,
      previousValue: prev,
      newValue: next
    };
    trail.unshift(entry);
    if (trail.length > 500) trail.pop();
    localStorage.setItem(this.KEY_AUDIT_TRAIL, JSON.stringify(trail));
    this.notify('audit_trail', 'create', entry.id);
  }

  // -----------------------------------------------------------------------------
  // RULE 1: INCIDENT → INVESTIGATION → CAPA → RISK REGISTER → TRAINING → ESG
  // -----------------------------------------------------------------------------
  public static reportIncident(
    incidentData: Omit<OmaniIncident, 'id' | 'referenceNumber' | 'timestamp' | 'capaIds' | 'riskRegisterUpdated' | 'trainingNeedIdentified' | 'statutoryNotificationSent'>,
    actor: UserProfile
  ): OmaniIncident {
    const incidents = this.getIncidents();
    const newId = `inc-omn-${Date.now().toString().slice(-4)}`;
    const refNum = `INC-${new Date().getFullYear()}-OMN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: OmaniIncident = {
      ...incidentData,
      id: newId,
      referenceNumber: refNum,
      timestamp: new Date().toISOString(),
      capaIds: [],
      riskRegisterUpdated: false,
      trainingNeedIdentified: false,
      statutoryNotificationSent: false
    };

    incidents.unshift(newIncident);
    localStorage.setItem(this.KEY_INCIDENTS, JSON.stringify(incidents));

    // Audit Trail
    this.logAudit(actor, 'INCIDENT_REPORTED', 'INCIDENT', newId, `Reported ${newIncident.type} (${newIncident.severity}): ${newIncident.title}`);

    // If High/Critical SIF Potential, automatically trigger immediate Containment CAPA
    if (newIncident.severity === 'Critical' || newIncident.severity === 'High' || newIncident.type === 'Lost Time Injury (LTI)' || newIncident.type === 'SIF Potential') {
      const generatedCapa = this.createCapa({
        sourceType: 'Incident Investigation',
        sourceReference: refNum,
        siteId: newIncident.siteId,
        siteName: newIncident.siteName,
        title: `Immediate Containment: ${newIncident.title}`,
        actionDetails: `Implement immediate isolation and supervisory stand-down following ${refNum}: ${newIncident.immediateActionsTaken || 'Conduct stand-down and barrier check.'}`,
        priority: 'P1 - Critical (24h)',
        hierarchyOfControl: 'Engineering Control',
        assignedRole: 'Site_HSE_Manager',
        ownerId: 'usr-hse-manager',
        ownerName: 'Salim Al-Harthy',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // 24h
      }, actor);

      newIncident.capaIds.push(generatedCapa.id);
      newIncident.riskRegisterUpdated = true;
      newIncident.trainingNeedIdentified = true;
      localStorage.setItem(this.KEY_INCIDENTS, JSON.stringify(incidents));
    }

    // Update ESG safety rates if LTI was recorded
    if (newIncident.type === 'Lost Time Injury (LTI)') {
      this.recalculateESGSafetyMetrics();
    }

    this.notify('incident', 'create', newId);
    return newIncident;
  }

  // -----------------------------------------------------------------------------
  // RULE 2: AUDIT/INSPECTION FINDING → CAPA → VERIFICATION → CLOSURE
  // -----------------------------------------------------------------------------
  public static createFinding(finding: Omit<OmaniAuditFinding, 'id' | 'status'>, actor: UserProfile): OmaniAuditFinding {
    const findings = this.getFindings();
    const newId = `find-${Date.now().toString().slice(-4)}`;

    // Automatically spawn CAPA for Major/Minor Non-Conformances
    let capaId: string | undefined = undefined;
    if (finding.findingType.includes('Non-Conformance')) {
      const capa = this.createCapa({
        sourceType: 'Audit Finding',
        sourceReference: `${finding.auditTitle} (${finding.clauseReference})`,
        siteId: finding.siteId,
        siteName: finding.siteName,
        title: `Audit Non-Conformance Closure: ${finding.clauseReference}`,
        actionDetails: finding.description,
        priority: finding.findingType.startsWith('Major') ? 'P1 - Critical (24h)' : 'P2 - High (7d)',
        hierarchyOfControl: 'Engineering Control',
        assignedRole: 'Site_HSE_Manager',
        ownerId: 'usr-hse-manager',
        ownerName: 'Salim Al-Harthy',
        dueDate: finding.targetClosureDate
      }, actor);
      capaId = capa.id;
    }

    const newFinding: OmaniAuditFinding = {
      ...finding,
      id: newId,
      associatedCapaId: capaId,
      status: capaId ? 'CAPA In Progress' : 'Open'
    };

    findings.unshift(newFinding);
    localStorage.setItem(this.KEY_FINDINGS, JSON.stringify(findings));
    this.logAudit(actor, 'AUDIT_FINDING_LOGGED', 'AUDIT', newId, `Logged ${finding.findingType} on ${finding.clauseReference}`);
    this.notify('audit', 'create', newId);
    return newFinding;
  }

  // -----------------------------------------------------------------------------
  // RULE 3 & 4: PERMIT APPROVAL GATING & EXPIRY RESTRICTIONS
  // -----------------------------------------------------------------------------
  public static validatePermitGating(permit: OmaniPTW): { allowed: boolean; violations: string[] } {
    const violations: string[] = [];

    // 1. Contractor Prequalification Check
    if (permit.contractorId !== 'internal') {
      const contractors = this.getContractors();
      const contractor = contractors.find(c => c.id === permit.contractorId);
      if (!contractor) {
        violations.push(`Selected contractor '${permit.contractorName}' is not registered in system.`);
      } else {
        if (contractor.siteAccessGated || contractor.prequalificationStatus === 'Suspended') {
          violations.push(`CONTRACTOR GATED: ${contractor.name} is currently SUSPENDED. Reason: ${contractor.gatingReason || 'Regulatory or Insurance non-compliance'}.`);
        }
        if (new Date(contractor.insuranceExpiryDate) < new Date()) {
          violations.push(`CONTRACTOR INSURANCE EXPIRED: ${contractor.name} Workmen Compensation policy expired on ${contractor.insuranceExpiryDate}. Access blocked.`);
        }
      }
    }

    // 2. Worker Competency & Medical Fitness Check
    const workers = this.getWorkers();
    const worker = workers.find(w => w.employeeId === permit.leadWorkerId);
    if (!worker) {
      violations.push(`Lead worker ID '${permit.leadWorkerId}' not found in competency register.`);
    } else {
      if (!worker.siteAccessPermitted) {
        violations.push(`WORKER SITE ACCESS REVOKED: ${worker.fullName} has active safety restrictions.`);
      }
      if (new Date(worker.medicalExpiryDate) < new Date()) {
        violations.push(`WORKER MEDICAL FITNESS EXPIRED: ${worker.fullName} fitness expired on ${worker.medicalExpiryDate}.`);
      }
      if (new Date(worker.h2sCertificateExpiry) < new Date()) {
        violations.push(`MANDATORY H2S CERTIFICATE EXPIRED: ${worker.fullName} H2S card expired on ${worker.h2sCertificateExpiry}. Entrance prohibited.`);
      }
      if (permit.type === 'Confined Space Entry' && new Date(worker.confinedSpaceExpiry) < new Date()) {
        violations.push(`CONFINED SPACE CERTIFICATE EXPIRED: ${worker.fullName} cannot enter without valid certificate.`);
      }
      if (permit.type === 'Working at Height' && new Date(worker.workingAtHeightExpiry) < new Date()) {
        violations.push(`WORKING AT HEIGHT CERTIFICATE EXPIRED: ${worker.fullName} ticket expired.`);
      }
    }

    // 3. JSA & Risk Assessment Attached Check
    if (!permit.jsaAttached) {
      violations.push(`MANDATORY JSA MISSING: No signed Job Safety Analysis attached to permit.`);
    }

    // 4. Gas Testing & LOTO Isolation Check for Hazardous Permits
    if (permit.gasTestingRequired && !permit.gasTestPassed) {
      violations.push(`GAS ATMOSPHERE UNACCEPTABLE: Combustible LEL or Toxic H2S exceed safe statutory limits. Ventilation required.`);
    }

    if (permit.type === 'Electrical Isolation / LOTO' && !permit.isolationVerified) {
      violations.push(`ZERO ENERGY UNVERIFIED: Physical padlocks and electrical tag-out (LOTO) have not been field-verified.`);
    }

    // 5. SIMOPS Conflict Detection Check
    const activePermits = this.getPermits().filter(p => p.id !== permit.id && (p.status === 'Active' || p.status === 'Approved') && p.siteId === permit.siteId);
    for (const other of activePermits) {
      if (other.zone === permit.zone) {
        if ((permit.type === 'Hot Work' && other.type === 'Confined Space Entry') ||
            (permit.type === 'Confined Space Entry' && other.type === 'Hot Work') ||
            (permit.type === 'Critical Lift' && other.zone === permit.zone)) {
          violations.push(`SIMOPS CONFLICT DETECTED: Clash with active permit ${other.permitNumber} (${other.type}) in ${permit.zone}. Simultaneous high-risk operations prohibited.`);
          permit.simopsConflictDetected = true;
          permit.simopsConflictDetails = `Zone clash with ${other.permitNumber} (${other.title})`;
        }
      }
    }

    return {
      allowed: violations.length === 0,
      violations
    };
  }

  public static approvePermit(permitId: string, actor: UserProfile): { success: boolean; message: string; violations?: string[] } {
    const permits = this.getPermits();
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return { success: false, message: 'Permit not found.' };

    // Role check: Only Level 3 Issuing Authority, Site HSE Manager, Operations Manager, or Admin
    const canApprove = ['Project_Manager', 'Site_HSE_Manager', 'Regional_HSE_Director', 'Head_Group_HSE', 'ADMIN'].includes(actor.role);
    if (!canApprove) {
      return { success: false, message: `Access Denied: Role '${actor.role}' is not authorized to approve permits under PDO SP-1143.` };
    }

    const check = this.validatePermitGating(permit);
    if (!check.allowed) {
      permit.gatingViolations = check.violations;
      permit.status = 'Suspended';
      localStorage.setItem(this.KEY_PERMITS, JSON.stringify(permits));
      this.logAudit(actor, 'PERMIT_APPROVAL_BLOCKED', 'PERMIT', permitId, `Approval blocked by automated gating rule: ${check.violations.join('; ')}`);
      this.notify('permit', 'block', permitId);
      return { success: false, message: 'Permit Approval Blocked by Safety Gating Matrix.', violations: check.violations };
    }

    permit.status = 'Approved';
    permit.issuerName = actor.name;
    permit.issuedByRole = actor.jobTitle || actor.role;
    permit.authorizedAt = new Date().toISOString();
    permit.gatingViolations = [];
    localStorage.setItem(this.KEY_PERMITS, JSON.stringify(permits));

    this.logAudit(actor, 'PERMIT_APPROVED', 'PERMIT', permitId, `Approved ${permit.permitNumber} for execution.`);
    this.notify('permit', 'approve', permitId);
    return { success: true, message: `Permit ${permit.permitNumber} approved successfully.` };
  }

  public static activatePermit(permitId: string, actor: UserProfile): { success: boolean; message: string } {
    const permits = this.getPermits();
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return { success: false, message: 'Permit not found.' };

    if (permit.status !== 'Approved') {
      return { success: false, message: `Permit must be in 'Approved' state before activation. Current: ${permit.status}` };
    }

    // Re-verify gating before live activation
    const check = this.validatePermitGating(permit);
    if (!check.allowed) {
      permit.status = 'Suspended';
      permit.gatingViolations = check.violations;
      localStorage.setItem(this.KEY_PERMITS, JSON.stringify(permits));
      return { success: false, message: `Cannot activate: Field conditions compromised (${check.violations[0]})` };
    }

    permit.status = 'Active';
    localStorage.setItem(this.KEY_PERMITS, JSON.stringify(permits));
    this.logAudit(actor, 'PERMIT_ACTIVATED', 'PERMIT', permitId, `Activated work permit in ${permit.zone}`);
    this.notify('permit', 'activate', permitId);
    return { success: true, message: `Permit ${permit.permitNumber} is now ACTIVE in the field.` };
  }

  public static closePermit(permitId: string, actor: UserProfile): { success: boolean; message: string } {
    const permits = this.getPermits();
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return { success: false, message: 'Permit not found.' };

    permit.status = 'Closed';
    localStorage.setItem(this.KEY_PERMITS, JSON.stringify(permits));
    this.logAudit(actor, 'PERMIT_CLOSED', 'PERMIT', permitId, `Work completed and site de-isolated.`);
    this.notify('permit', 'close', permitId);
    return { success: true, message: `Permit ${permit.permitNumber} closed.` };
  }

  // -----------------------------------------------------------------------------
  // RULE 5: ESG CALCULATIONS & REPORT BUILDER RECONCILIATION
  // -----------------------------------------------------------------------------
  public static recalculateESGSafetyMetrics(): void {
    const esg = this.getESG();
    const incidents = this.getIncidents();

    const ltiCount = incidents.filter(i => i.type === 'Lost Time Injury (LTI)').length;
    const mtcCount = incidents.filter(i => i.type === 'Medical Treatment Case').length;
    const totalRecordable = ltiCount + mtcCount;

    const totalHours = esg.totalManHoursWorked || 4850000;
    // Standard PDO / OQ / GCC basis: per 1,000,000 hours
    esg.ltifrRate = Number(((ltiCount * 1000000) / totalHours).toFixed(3));
    esg.trirRate = Number(((totalRecordable * 1000000) / totalHours).toFixed(3));

    localStorage.setItem(this.KEY_ESG, JSON.stringify(esg));
    this.notify('esg', 'update');
  }

  public static updateESGMetric(updates: Partial<OmaniESGMetric>, actor: UserProfile): OmaniESGMetric {
    const current = this.getESG();
    const updated: OmaniESGMetric = {
      ...current,
      ...updates,
      humanReviewSignedBy: `${actor.name} (${actor.jobTitle || actor.role})`
    };
    localStorage.setItem(this.KEY_ESG, JSON.stringify(updated));
    this.logAudit(actor, 'ESG_DATA_UPDATED', 'ESG', `${updated.reportingYear}-${updated.reportingQuarter}`, `Updated ESG Scope 1/2/3 and workforce metrics.`);
    this.notify('esg', 'update');
    return updated;
  }

  // -----------------------------------------------------------------------------
  // RULE 6: CAPA MANAGEMENT & OVERDUE ROLE ESCALATION
  // -----------------------------------------------------------------------------
  public static createCapa(capaData: Omit<OmaniCAPA, 'id' | 'status' | 'escalatedToManager'>, actor: UserProfile): OmaniCAPA {
    const capas = this.getCapas();
    const newId = `capa-omn-${Date.now().toString().slice(-4)}`;

    const newCapa: OmaniCAPA = {
      ...capaData,
      id: newId,
      status: 'Open',
      escalatedToManager: false
    };

    capas.unshift(newCapa);
    localStorage.setItem(this.KEY_CAPAS, JSON.stringify(capas));
    this.logAudit(actor, 'CAPA_CREATED', 'CAPA', newId, `Assigned CAPA to ${newCapa.ownerName}: ${newCapa.title}`);
    this.notify('capa', 'create', newId);
    return newCapa;
  }

  public static updateCapaStatus(capaId: string, status: OmaniCAPA['status'], actor: UserProfile, evidence?: string): { success: boolean; message: string } {
    const capas = this.getCapas();
    const capa = capas.find(c => c.id === capaId);
    if (!capa) return { success: false, message: 'CAPA not found' };

    // Verification check: Only designated HSE Officers/Managers or Quality Managers can mark 'Verified Closed'
    if (status === 'Verified Closed') {
      const canVerify = ['Site_HSE_Manager', 'Head_Group_HSE', 'Internal_Auditor', 'ADMIN', 'Regional_HSE_Director'].includes(actor.role);
      if (!canVerify) {
        return { success: false, message: `Access Denied: Only HSE Managers or Quality Assurance can verify closure of CAPA.` };
      }
      capa.verifiedBy = actor.name;
      capa.verifiedAt = new Date().toISOString();
      capa.verificationEvidence = evidence || 'Physical inspection and documentation reviewed and verified.';

      // Check if this CAPA closes an associated Audit Finding (Rule 2)
      const findings = this.getFindings();
      const finding = findings.find(f => f.associatedCapaId === capaId);
      if (finding) {
        finding.status = 'Closed & Audited';
        localStorage.setItem(this.KEY_FINDINGS, JSON.stringify(findings));
        this.notify('audit', 'close', finding.id);
      }
    }

    capa.status = status;
    localStorage.setItem(this.KEY_CAPAS, JSON.stringify(capas));
    this.logAudit(actor, 'CAPA_STATUS_CHANGED', 'CAPA', capaId, `Status transitioned to '${status}' by ${actor.name}`);
    this.notify('capa', 'status', capaId);
    return { success: true, message: `CAPA ${capa.id} updated to ${status}.` };
  }

  public static checkAndEscalateOverdueCapas(actor: UserProfile): number {
    const capas = this.getCapas();
    const today = new Date().toISOString().split('T')[0];
    let escalatedCount = 0;

    for (const capa of capas) {
      if (capa.status !== 'Verified Closed' && capa.dueDate < today && !capa.escalatedToManager) {
        capa.status = 'Overdue';
        capa.escalatedToManager = true;
        escalatedCount++;
        this.logAudit(actor, 'CAPA_OVERDUE_ESCALATION', 'CAPA', capa.id, `🚨 SLA BREACH: CAPA ${capa.id} is overdue. Escalated to Corporate QHSE Director (Dr. Tariq Al-Busaidi).`);
      }
    }

    if (escalatedCount > 0) {
      localStorage.setItem(this.KEY_CAPAS, JSON.stringify(capas));
      this.notify('capa', 'escalate');
    }
    return escalatedCount;
  }
}

// Auto-initialize on module load if in browser
if (typeof window !== 'undefined') {
  OmanCentralDataStore.initialize();
}
