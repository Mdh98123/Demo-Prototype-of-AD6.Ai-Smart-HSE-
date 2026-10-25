/**
 * Enterprise Regulatory Intelligence, HSE, ESG, and Workforce Compliance Service
 * Sultanate of Oman (Ministry of Labour MD 286/2008, RD 53/2023, PDO Specifications, CDAA, Environment Authority).
 */

import { GeminiClientService, GroundingSource } from './geminiClientService';

export interface OfficialGovernmentSource {
  id: string;
  name: string;
  nameAr?: string;
  jurisdiction: 'Oman' | 'International (ISO)';
  code: string;
  officialPortalUrl: string;
  enforcementAuthority: string;
  statutoryScope: string;
  activeRegulationsCount: number;
  lastSynchronized: string;
  verificationStatus: 'Active' | 'Under Revision' | 'Draft';
  contactHotline?: string;
}

export interface LiveRegulatoryNotice {
  id: string;
  title: string;
  titleAr?: string;
  authorityId: string;
  authorityName: string;
  jurisdiction: string;
  category: 'Labor & Workforce' | 'Heat Stress & Environment' | 'Process Safety & Fire' | 'Hazardous Chemicals & Waste' | 'Maritime & Offsites';
  publicationDate: string;
  effectiveDate: string;
  gracePeriodDays: number;
  enforceabilityStatus: 'Mandatory Law' | 'Circular' | 'Advisory' | 'Inspection Focus';
  statutoryFineAed: number; // Stored penalty amount in currency units (OMR in Oman context)
  summary: string;
  keyObligations: string[];
  sourceUrl?: string;
  searchCitations?: GroundingSource[];
  isAcknowledged?: boolean;
}

export interface EmployeeCertificationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  siteLocation: string;
  certificationName: string;
  issuingBody: 'OPITO' | 'NEBOSH' | 'IOSH' | 'CISRS' | 'Oman CDAA' | 'PDO Approved' | 'OPAL' | 'MOH';
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Suspended';
  statutoryRequirementLevel: 'Mandatory Statutory' | 'Operational Policy' | 'Recommended';
  verificationDocUrl?: string;
  escalationStatus: 'Normal' | 'Supervisor Alerted' | 'Site Access Restricted';
}

export interface HseEsgMetricRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  reportingPeriod: string;
  scope1EmissionsTons: number;
  scope2EmissionsTons: number;
  scope3EmissionsTons: number;
  renewableEnergyPercent: number;
  hazardousWasteGeneratedTons: number;
  hazardousWasteRecycledTons: number;
  waterRecycledPercent: number;
  environmentalPermitStatus: 'Compliant' | 'Pending Renewal' | 'Condition Attached';
  esgGovernanceScore: number;
  flaringReductionM3: number;
  lastAuditDate: string;
}

export interface RegulatoryObligation {
  id: string;
  regulationId: string;
  regulationTitle: string;
  authority: string;
  obligationText: string;
  operationalCategory: 'Workforce Safety' | 'Plant & Machinery' | 'Environmental ESG' | 'Reporting & Audit';
  penaltyExposureAed: number; // Penalty exposure in OMR
  responsibleRole: string;
  assignedSite: string;
  complianceStatus: 'Fully Compliant' | 'Partially Compliant' | 'At Risk / Non-Compliant';
  verificationEvidenceId?: string;
  nextAuditDueDate: string;
  linkedCapaId?: string;
  closureNotes?: string;
}

export interface ComplianceScorecard {
  facilityId: string;
  facilityName: string;
  overallScore: number;
  laborScore: number;
  fireSafetyScore: number;
  environmentalEsgScore: number;
  workforceCertScore: number;
  contractorScore: number;
  riskTier: 'Low Risk' | 'Medium Risk' | 'Critical Exposure';
  trend: string;
  unresolvedGaps: number;
}

export interface ComplianceEscalationRule {
  id: string;
  name: string;
  triggerType: 'Certification Expiry' | 'Statutory Report Deadline' | 'Audit Non-Compliance' | 'ESG Limit Exceeded';
  thresholdDays: number;
  targetRoles: string[];
  escalationChannel: 'In-App Alert' | 'Email Notification' | 'Gate Pass Restraint';
  enabled: boolean;
}

export interface RegulatoryAuditEvidence {
  id: string;
  obligationId: string;
  title: string;
  documentType: 'Statutory Permit' | 'Third-Party Inspection' | 'Bump Test Log' | 'MOH Medical Report' | 'Civil Defence Certificate';
  fileUrl: string;
  uploadDate: string;
  certifiedBy: string;
  verifiedStatus: 'Approved' | 'Pending Review' | 'Flagged';
  expiryDate?: string;
}

// Initial Official Sources - Sultanate of Oman
const INITIAL_GOV_SOURCES: OfficialGovernmentSource[] = [
  {
    id: 'SRC-OMAN-MOL',
    name: 'Ministry of Labour (MoL) - Sultanate of Oman',
    nameAr: 'وزارة العمل - سلطنة عمان',
    jurisdiction: 'Oman',
    code: 'OMN-MOL-RD-53-2023',
    officialPortalUrl: 'https://mol.gov.om',
    enforcementAuthority: 'Directorate General of Labour Inspection & Occupational Health',
    statutoryScope: 'Oman Labour Law RD 53/2023, Ministerial Decision 286/2008 OSH Regulations, Midday Summer Work Ban (12:30-15:30), 24h Serious Incident Annex 1 Notice',
    activeRegulationsCount: 34,
    lastSynchronized: '2026-10-10T12:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '+968 2434 4444'
  },
  {
    id: 'SRC-OMAN-PDO',
    name: 'Petroleum Development Oman (PDO) Code of Practice',
    nameAr: 'شركة تنمية نفط عمان - لائحة معايير الصحة والسلامة',
    jurisdiction: 'Oman',
    code: 'PDO-HSE-SP-1143',
    officialPortalUrl: 'https://pdo.co.om',
    enforcementAuthority: 'PDO Corporate HSE Directorate',
    statutoryScope: 'PDO SP-1143 (PTW), SP-1170 (Heat Stress TWL), SP-1231 (LOTO), SP-1232 (Heights & Scaffolding), PR-1172 (Incident Reporting)',
    activeRegulationsCount: 42,
    lastSynchronized: '2026-10-10T08:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '+968 2467 8100'
  },
  {
    id: 'SRC-OMAN-CDAA',
    name: 'Civil Defence and Ambulance Authority (CDAA)',
    nameAr: 'هيئة الدفاع المدني والإسعاف - سلطنة عمان',
    jurisdiction: 'Oman',
    code: 'OMN-CDAA-FIRE-2024',
    officialPortalUrl: 'https://cdaa.gov.om',
    enforcementAuthority: 'CDAA Directorate of Fire Prevention',
    statutoryScope: 'Industrial Fire Protection, Hazardous Chemical Storage Permits, Hydrocarbon Firefighting Deluge Systems, 24/7 Operations Monitoring',
    activeRegulationsCount: 26,
    lastSynchronized: '2026-10-09T14:30:00Z',
    verificationStatus: 'Active',
    contactHotline: '9999'
  },
  {
    id: 'SRC-OMAN-EA',
    name: 'Environment Authority (EA) - Sultanate of Oman',
    nameAr: 'هيئة البيئة - سلطنة عمان',
    jurisdiction: 'Oman',
    code: 'OMN-EA-RD-114-2001',
    officialPortalUrl: 'https://ea.gov.om',
    enforcementAuthority: 'Environmental Inspection & Permitting Directorate',
    statutoryScope: 'Royal Decree 114/2001 (Environment Protection & Pollution Control), Hazardous Waste Consignment Manifests with be\'ah, Air Emissions Quality',
    activeRegulationsCount: 31,
    lastSynchronized: '2026-10-10T09:15:00Z',
    verificationStatus: 'Active',
    contactHotline: '+968 2469 2453'
  },
  {
    id: 'SRC-OMAN-OPAL',
    name: 'Oman Society for Petroleum Services (OPAL)',
    nameAr: 'الجمعية العمانية للخدمات النفطية - أوبال',
    jurisdiction: 'Oman',
    code: 'OPAL-CAMS-2024',
    officialPortalUrl: 'https://opaloman.org',
    enforcementAuthority: 'OPAL Standards Committee',
    statutoryScope: 'OPAL Unified HSE Competency Framework, Defensive Driving Verification, Scaffold Inspection Passports, Contractor Pre-qualification',
    activeRegulationsCount: 18,
    lastSynchronized: '2026-10-08T16:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '+968 2460 5700'
  },
  {
    id: 'SRC-ISO',
    name: 'International Organization for Standardization (ISO)',
    nameAr: 'المنظمة الدولية للمعايير',
    jurisdiction: 'International (ISO)',
    code: 'ISO-45001-14001',
    officialPortalUrl: 'https://iso.org',
    enforcementAuthority: 'Accredited Certification Bodies (BSI / DNV / TUV)',
    statutoryScope: 'ISO 45001:2018 (Occupational Health & Safety), ISO 14001:2015 (Environmental Management), ISO 50001 (Energy)',
    activeRegulationsCount: 15,
    lastSynchronized: '2026-10-07T11:00:00Z',
    verificationStatus: 'Active'
  }
];

// Initial Live Regulatory Notices - Sultanate of Oman
const INITIAL_NOTICES: LiveRegulatoryNotice[] = [
  {
    id: 'NOT-2026-081',
    title: 'MoL Ministerial Decision 286/2008 Art. 16 Summer Midday Work Ban & TWL Monitoring',
    titleAr: 'قرار وزاري رقم 286/2008 بشأن حظر العمل وقت الظهيرة وإجراءات الإجهاد الحراري',
    authorityId: 'SRC-OMAN-MOL',
    authorityName: 'Ministry of Labour (MoL) - Sultanate of Oman',
    jurisdiction: 'Oman',
    category: 'Heat Stress & Environment',
    publicationDate: '2026-05-15',
    effectiveDate: '2026-06-01',
    gracePeriodDays: 15,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 5000,
    summary: 'Strict prohibition of outdoor work between 12:30 PM and 3:30 PM during summer months (June through August) per MD 286/2008 Art. 16. Operations must deploy Thermal Work Limit (TWL) monitoring; stop outdoor work when TWL < 115 W/m².',
    keyObligations: [
      'Cease all open-air tasks from 12:30 PM to 3:30 PM daily during June, July, and August',
      'Provide shaded cooling shelters equipped with misting fans and certified potable cold water with electrolytes',
      'Deploy calibrated Thermal Work Limit (TWL in W/m²) monitors per PDO SP-1170 and enforce work-rest cycles',
      'Display multilingual heat stress symptom charts (Arabic, English, Hindi, Urdu) across all project gates'
    ],
    sourceUrl: 'https://mol.gov.om'
  },
  {
    id: 'NOT-2026-074',
    title: 'PDO SP-1232 Specification: Revised Working at Height & Scaffold Tagging Verification',
    titleAr: 'المواصفة الفنية SP-1232: تحديث معايير العمل على الارتفاع وأنظمة ترخيص السقالات',
    authorityId: 'SRC-OMAN-PDO',
    authorityName: 'Petroleum Development Oman (PDO) Code of Practice',
    jurisdiction: 'Oman',
    category: 'Labor & Workforce',
    publicationDate: '2026-06-01',
    effectiveDate: '2026-07-01',
    gracePeriodDays: 30,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 7500,
    summary: 'Updated PDO SP-1232 requiring 100% tie-off above 1.8 meters, certified OPAL/CISRS scaffold inspection tags renewed every 7 days, and mandatory drop-prevention tool tethering on all elevated platforms.',
    keyObligations: [
      'Enforce certified scaffold inspection tagging (Green/Red) by certified OPAL/CISRS Scaffold Inspectors every 7 days',
      'Mandatory secondary shock-absorbing fall arrest harnesses for all work platforms above 1.8m',
      'Implement 100% tool tethering (anti-drop lanyards) on structural pipe racks and hydrocarbon towers',
      'Submit third-party load test certificates for all suspended personnel cradles'
    ],
    sourceUrl: 'https://pdo.co.om'
  },
  {
    id: 'NOT-2026-069',
    title: 'CDAA 2026 Industrial Fire Directive: Hazardous Material Storage & Fire Protection Approval',
    titleAr: 'توجيهات هيئة الدفاع المدني والإسعاف 2026: اشتراطات تخزين المواد الخطرة وحماية المنشآت',
    authorityId: 'SRC-OMAN-CDAA',
    authorityName: 'Civil Defence and Ambulance Authority (CDAA)',
    jurisdiction: 'Oman',
    category: 'Process Safety & Fire',
    publicationDate: '2026-04-20',
    effectiveDate: '2026-05-30',
    gracePeriodDays: 40,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 10000,
    summary: 'All Class-A industrial chemical warehouses and refinery offsite facilities must maintain valid CDAA Fire Safety Approval and direct connection to industrial emergency command.',
    keyObligations: [
      'Maintain certified 24/7 operational link to CDAA industrial fire alarm dispatch center',
      'Conduct bi-annual hydrostatic testing on all stationary foam deluge and hydrants',
      'Maintain maximum 50m separation between class-1 flammable storage tanks and administrative offices',
      'Validate fire wardens training certifications with CDAA Academy every 24 months'
    ],
    sourceUrl: 'https://cdaa.gov.om'
  },
  {
    id: 'NOT-2026-062',
    title: 'Environment Authority (EA): Royal Decree 114/2001 Hazardous Waste Manifests & be\'ah Consignment',
    titleAr: 'هيئة البيئة: المرسوم السلطاني 114/2001 بشأن إدارة النفايات الخطرة ومنظومة بيئة',
    authorityId: 'SRC-OMAN-EA',
    authorityName: 'Environment Authority (EA) - Sultanate of Oman',
    jurisdiction: 'Oman',
    category: 'Hazardous Chemicals & Waste',
    publicationDate: '2026-05-02',
    effectiveDate: '2026-06-01',
    gracePeriodDays: 30,
    enforceabilityStatus: 'Inspection Focus',
    statutoryFineAed: 15000,
    summary: 'Requires digital consignment tracking for all industrial chemical waste transported within Oman via authorized be\'ah hazardous waste treatment facilities per RD 114/2001.',
    keyObligations: [
      'Upload electronic waste manifest consignment notes into EA portal prior to tanker dispatch',
      'Equip vapor recovery units (VRU) on all hydrocarbon loading racks with continuous FID monitoring',
      'Secondary containment bunding required for 110% of largest chemical storage tank volume'
    ],
    sourceUrl: 'https://ea.gov.om'
  },
  {
    id: 'NOT-2026-055',
    title: 'PDO SP-1143 & MoL: Industrial Gas Testing & Authorized Gas Tester (AGT) Certification',
    titleAr: 'المواصفة SP-1143 ووزارة العمل: فحص الغازات الصناعية واعتماد فاحصي الغازات',
    authorityId: 'SRC-OMAN-PDO',
    authorityName: 'Petroleum Development Oman (PDO) Code of Practice',
    jurisdiction: 'Oman',
    category: 'Process Safety & Fire',
    publicationDate: '2026-03-10',
    effectiveDate: '2026-04-01',
    gracePeriodDays: 20,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 4500,
    summary: 'Mandates OPITO/PDO certified Authorized Gas Tester (AGT) clearance before opening manways on hydrocarbon vessels. Daily bump-test calibration logs must be archived for 5 years.',
    keyObligations: [
      'Pre-entry continuous 4-gas testing (O2, LEL, H2S, CO) signed off by AGT Level 1/2',
      'Dedicated standby rescue sentry equipped with positive-pressure SCBA at all vessel entry points',
      'Calibrate gas detectors with certified calibration gas mixtures every 30 days'
    ],
    sourceUrl: 'https://pdo.co.om'
  }
];

// Initial Employee Certification Records - Oman Operations
const INITIAL_WORKFORCE_CERTS: EmployeeCertificationRecord[] = [
  {
    id: 'CERT-001',
    employeeId: 'u6',
    employeeName: 'Rahul Gupta',
    employeeRole: 'Mechanical Technician / Frontline Worker',
    department: 'Mechanical Maintenance',
    siteLocation: 'Mina Al Fahal Refinery Complex (Muscat)',
    certificationName: 'H2S Awareness & Escape Breathing Apparatus (OPITO / PDO)',
    issuingBody: 'OPITO',
    certificateNumber: 'OPITO-H2S-88219',
    issueDate: '2025-05-10',
    expiryDate: '2027-05-10',
    daysRemaining: 211,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/h2s-rahul.pdf',
    escalationStatus: 'Normal'
  },
  {
    id: 'CERT-002',
    employeeId: 'u6',
    employeeName: 'Rahul Gupta',
    employeeRole: 'Mechanical Technician / Frontline Worker',
    department: 'Mechanical Maintenance',
    siteLocation: 'Mina Al Fahal Refinery Complex (Muscat)',
    certificationName: 'Working at Heights & Fall Arrest Level 2 (OPAL Certified)',
    issuingBody: 'CISRS',
    certificateNumber: 'CISRS-WAH-44102',
    issueDate: '2024-11-05',
    expiryDate: '2026-11-05',
    daysRemaining: 25,
    status: 'Expiring Soon',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/wah-rahul.pdf',
    escalationStatus: 'Supervisor Alerted'
  },
  {
    id: 'CERT-003',
    employeeId: 'u7',
    employeeName: 'Marcus Chen',
    employeeRole: 'Site Supervisor / Permit Issuer',
    department: 'Infrastructure & Power',
    siteLocation: 'Fahud Field - Gathering Station Block 6',
    certificationName: 'Authorized Gas Tester Level 1 & 2 (PDO SP-1143)',
    issuingBody: 'PDO Approved',
    certificateNumber: 'AGT-PDO-77192',
    issueDate: '2025-01-15',
    expiryDate: '2027-01-15',
    daysRemaining: 96,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/agt-marcus.pdf',
    escalationStatus: 'Normal'
  },
  {
    id: 'CERT-004',
    employeeId: 'u7',
    employeeName: 'Marcus Chen',
    employeeRole: 'Site Supervisor / Permit Issuer',
    department: 'Infrastructure & Power',
    siteLocation: 'Fahud Field - Gathering Station Block 6',
    certificationName: 'First Aid at Work & Industrial Trauma Response',
    issuingBody: 'Oman CDAA',
    certificateNumber: 'CDAA-FA-99023',
    issueDate: '2024-10-12',
    expiryDate: '2026-10-12',
    daysRemaining: 1,
    status: 'Expiring Soon',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/fa-marcus.pdf',
    escalationStatus: 'Supervisor Alerted'
  },
  {
    id: 'CERT-005',
    employeeId: 'u5',
    employeeName: 'Fatima Al-Kaabi',
    employeeRole: 'Site HSE Officer',
    department: 'Field Safety Inspection',
    siteLocation: 'Khazzan Gas Processing Complex (Block 61)',
    certificationName: 'NEBOSH International General Certificate (IGC)',
    issuingBody: 'NEBOSH',
    certificateNumber: 'NEBOSH-IGC-009182',
    issueDate: '2024-03-20',
    expiryDate: '2029-03-20',
    daysRemaining: 890,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/nebosh-fatima.pdf',
    escalationStatus: 'Normal'
  },
  {
    id: 'CERT-006',
    employeeId: 'u4',
    employeeName: 'Sarah Jones',
    employeeRole: 'Site HSE Manager',
    department: 'HSE Management',
    siteLocation: 'Mina Al Fahal Refinery Complex (Muscat)',
    certificationName: 'ISO 45001:2018 Lead Auditor (IRCA Certified)',
    issuingBody: 'PDO Approved',
    certificateNumber: 'IRCA-OHS-33291',
    issueDate: '2023-09-14',
    expiryDate: '2026-09-14',
    daysRemaining: -27,
    status: 'Expired',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/irca-sarah.pdf',
    escalationStatus: 'Site Access Restricted'
  },
  {
    id: 'CERT-007',
    employeeId: 'u10',
    employeeName: 'Khalid Al-Dhaheri',
    employeeRole: 'Environmental Officer',
    department: 'Sustainability & ESG',
    siteLocation: 'Sohar Industrial Port Terminal',
    certificationName: 'ISO 14001:2015 Lead Environmental Auditor',
    issuingBody: 'PDO Approved',
    certificateNumber: 'IRCA-ENV-55102',
    issueDate: '2024-08-10',
    expiryDate: '2027-08-10',
    daysRemaining: 303,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/env-khalid.pdf',
    escalationStatus: 'Normal'
  },
  {
    id: 'CERT-008',
    employeeId: 'u12',
    employeeName: 'Alice Smith',
    employeeRole: 'Lead Internal Auditor',
    department: 'Quality & Compliance',
    siteLocation: 'Group Corporate HQ (Muscat)',
    certificationName: 'Oman MoL / PDO Certified OSH Practitioner',
    issuingBody: 'OPAL',
    certificateNumber: 'OPAL-PRAC-1192',
    issueDate: '2025-02-18',
    expiryDate: '2027-02-18',
    daysRemaining: 130,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/oshad-alice.pdf',
    escalationStatus: 'Normal'
  }
];

// Initial ESG Metrics Records - Sultanate of Oman
const INITIAL_ESG_RECORDS: HseEsgMetricRecord[] = [
  {
    id: 'ESG-MAF-2026',
    facilityId: 'FAC-MAF-01',
    facilityName: 'Mina Al Fahal Refinery & Terminal (Oman)',
    reportingPeriod: 'Q3 2026',
    scope1EmissionsTons: 14250,
    scope2EmissionsTons: 6840,
    scope3EmissionsTons: 22100,
    renewableEnergyPercent: 24.5,
    hazardousWasteGeneratedTons: 48.2,
    hazardousWasteRecycledTons: 42.1,
    waterRecycledPercent: 78.4,
    environmentalPermitStatus: 'Compliant',
    esgGovernanceScore: 94.2,
    flaringReductionM3: 185000,
    lastAuditDate: '2026-09-18'
  },
  {
    id: 'ESG-KHZ-2026',
    facilityId: 'FAC-KHZ-02',
    facilityName: 'Khazzan Gas Processing Complex (Block 61)',
    reportingPeriod: 'Q3 2026',
    scope1EmissionsTons: 31200,
    scope2EmissionsTons: 11400,
    scope3EmissionsTons: 45600,
    renewableEnergyPercent: 18.2,
    hazardousWasteGeneratedTons: 92.5,
    hazardousWasteRecycledTons: 76.0,
    waterRecycledPercent: 64.2,
    environmentalPermitStatus: 'Compliant',
    esgGovernanceScore: 91.8,
    flaringReductionM3: 420000,
    lastAuditDate: '2026-08-25'
  },
  {
    id: 'ESG-SOH-2026',
    facilityId: 'FAC-SOH-03',
    facilityName: 'Sohar Industrial Port Terminal',
    reportingPeriod: 'Q3 2026',
    scope1EmissionsTons: 5400,
    scope2EmissionsTons: 4100,
    scope3EmissionsTons: 12500,
    renewableEnergyPercent: 32.0,
    hazardousWasteGeneratedTons: 18.4,
    hazardousWasteRecycledTons: 17.8,
    waterRecycledPercent: 88.0,
    environmentalPermitStatus: 'Compliant',
    esgGovernanceScore: 96.5,
    flaringReductionM3: 0,
    lastAuditDate: '2026-09-02'
  },
  {
    id: 'ESG-FHD-2026',
    facilityId: 'FAC-FHD-04',
    facilityName: 'Fahud Concession Field Block 6 (Oman)',
    reportingPeriod: 'Q3 2026',
    scope1EmissionsTons: 28400,
    scope2EmissionsTons: 9800,
    scope3EmissionsTons: 38900,
    renewableEnergyPercent: 14.5,
    hazardousWasteGeneratedTons: 64.1,
    hazardousWasteRecycledTons: 51.3,
    waterRecycledPercent: 58.0,
    environmentalPermitStatus: 'Condition Attached',
    esgGovernanceScore: 88.4,
    flaringReductionM3: 210000,
    lastAuditDate: '2026-07-30'
  }
];

// Initial Regulatory Obligations - Sultanate of Oman
const INITIAL_OBLIGATIONS: RegulatoryObligation[] = [
  {
    id: 'OBL-001',
    regulationId: 'NOT-2026-081',
    regulationTitle: 'Oman MoL Midday Work Ban & TWL Heat Stress Monitoring',
    authority: 'Oman Ministry of Labour',
    obligationText: 'Deploy calibrated TWL heat stress monitors, shaded hydration stations, and cease outdoor work between 12:30 PM - 3:30 PM.',
    operationalCategory: 'Workforce Safety',
    penaltyExposureAed: 5000,
    responsibleRole: 'Site HSE Officer / Supervisor',
    assignedSite: 'Mina Al Fahal Refinery & Terminal',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-TWL-01',
    nextAuditDueDate: '2026-10-25'
  },
  {
    id: 'OBL-002',
    regulationId: 'NOT-2026-074',
    regulationTitle: 'PDO SP-1232 Scaffold Inspection Cycle (7 Days)',
    authority: 'Petroleum Development Oman (PDO)',
    obligationText: 'All access scaffolding must have green tagging renewed every 7 calendar days by certified OPAL/CISRS scaffold inspector.',
    operationalCategory: 'Plant & Machinery',
    penaltyExposureAed: 7500,
    responsibleRole: 'Scaffolding Supervisor',
    assignedSite: 'Khazzan Gas Processing Complex',
    complianceStatus: 'Partially Compliant',
    verificationEvidenceId: 'EVD-SCAF-04',
    nextAuditDueDate: '2026-10-18',
    linkedCapaId: 'CAPA-2026-089'
  },
  {
    id: 'OBL-003',
    regulationId: 'NOT-2026-069',
    regulationTitle: 'CDAA Industrial Fire Alarm & Emergency Telemetry Link',
    authority: 'Civil Defence and Ambulance Authority (CDAA)',
    obligationText: 'Maintain uninterrupted alarm panel linkage with CDAA industrial emergency command.',
    operationalCategory: 'Plant & Machinery',
    penaltyExposureAed: 10000,
    responsibleRole: 'Maintenance Lead / HSE Manager',
    assignedSite: 'Sohar Industrial Port Terminal',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-CDAA-99',
    nextAuditDueDate: '2026-11-15'
  },
  {
    id: 'OBL-004',
    regulationId: 'NOT-2026-062',
    regulationTitle: 'Environment Authority Hazardous Waste Manifests & be\'ah Consignment',
    authority: 'Environment Authority (Oman)',
    obligationText: 'Consignment manifest codes for chemical sludge and oily residue must be verified with be\'ah prior to transportation.',
    operationalCategory: 'Environmental ESG',
    penaltyExposureAed: 15000,
    responsibleRole: 'Environmental Officer',
    assignedSite: 'Duqm Special Economic Zone (SEZAD)',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-EA-31',
    nextAuditDueDate: '2026-11-01'
  },
  {
    id: 'OBL-005',
    regulationId: 'NOT-2026-055',
    regulationTitle: 'PDO SP-1143 & MoL MD 286/2008 Gas Testing Sentry',
    authority: 'Petroleum Development Oman (PDO)',
    obligationText: 'Confined space entry permits must feature verified AGT atmospheric test sheet and constant entry sentry with SCBA pack.',
    operationalCategory: 'Workforce Safety',
    penaltyExposureAed: 4500,
    responsibleRole: 'Site Supervisor',
    assignedSite: 'Fahud Concession Field Block 6',
    complianceStatus: 'At Risk / Non-Compliant',
    nextAuditDueDate: '2026-10-15',
    linkedCapaId: 'CAPA-2026-102',
    closureNotes: 'Overdue sentry logbook check pending verification by Field Superintendent.'
  }
];

// Initial Site Scorecards - Sultanate of Oman
const INITIAL_SCORECARDS: ComplianceScorecard[] = [
  {
    facilityId: 'FAC-MAF-01',
    facilityName: 'Mina Al Fahal Refinery & Terminal (Oman)',
    overallScore: 98.4,
    laborScore: 99.0,
    fireSafetyScore: 97.5,
    environmentalEsgScore: 98.2,
    workforceCertScore: 98.9,
    contractorScore: 98.6,
    riskTier: 'Low Risk',
    trend: '+1.4%',
    unresolvedGaps: 1
  },
  {
    facilityId: 'FAC-SOH-03',
    facilityName: 'Sohar Industrial Port Terminal (Oman)',
    overallScore: 97.2,
    laborScore: 98.5,
    fireSafetyScore: 96.8,
    environmentalEsgScore: 96.0,
    workforceCertScore: 97.5,
    contractorScore: 97.2,
    riskTier: 'Low Risk',
    trend: '+2.1%',
    unresolvedGaps: 2
  },
  {
    facilityId: 'FAC-KHZ-02',
    facilityName: 'Khazzan Gas Processing Complex (Oman)',
    overallScore: 94.8,
    laborScore: 95.0,
    fireSafetyScore: 95.2,
    environmentalEsgScore: 93.4,
    workforceCertScore: 94.6,
    contractorScore: 95.8,
    riskTier: 'Medium Risk',
    trend: '-0.8%',
    unresolvedGaps: 4
  },
  {
    facilityId: 'FAC-FHD-04',
    facilityName: 'Fahud Concession Field Block 6 (Oman)',
    overallScore: 92.1,
    laborScore: 91.5,
    fireSafetyScore: 93.0,
    environmentalEsgScore: 89.2,
    workforceCertScore: 92.8,
    contractorScore: 94.0,
    riskTier: 'Medium Risk',
    trend: '+0.5%',
    unresolvedGaps: 5
  }
];

// Initial Escalation Rules
const INITIAL_ESCALATION_RULES: ComplianceEscalationRule[] = [
  {
    id: 'ESC-001',
    name: 'Workforce Mandatory Certificate 30-Day Warning',
    triggerType: 'Certification Expiry',
    thresholdDays: 30,
    targetRoles: ['Site Supervisor', 'HSE Officer'],
    escalationChannel: 'In-App Alert',
    enabled: true
  },
  {
    id: 'ESC-002',
    name: 'Workforce Expired Certificate Immediate Access Restraint',
    triggerType: 'Certification Expiry',
    thresholdDays: 0,
    targetRoles: ['Site Security', 'Site HSE Manager'],
    escalationChannel: 'Gate Pass Restraint',
    enabled: true
  },
  {
    id: 'ESC-003',
    name: 'Statutory Obligation SLA Non-Compliance Escalation',
    triggerType: 'Statutory Report Deadline',
    thresholdDays: 5,
    targetRoles: ['Regional HSE Director', 'Legal Team'],
    escalationChannel: 'Email Notification',
    enabled: true
  },
  {
    id: 'ESC-004',
    name: 'Hazardous Waste Consignment Discrepancy Alert',
    triggerType: 'ESG Limit Exceeded',
    thresholdDays: 2,
    targetRoles: ['Environmental Officer', 'Head Group HSE'],
    escalationChannel: 'In-App Alert',
    enabled: true
  }
];

// Initial Audit Evidence - Sultanate of Oman
const INITIAL_AUDIT_EVIDENCE: RegulatoryAuditEvidence[] = [
  {
    id: 'EVD-TWL-01',
    obligationId: 'OBL-001',
    title: 'MoL Midday Heat Stress TWL Calibrated Monitoring Log - Mina Al Fahal Berth 1',
    documentType: 'Bump Test Log',
    fileUrl: '/evidence/twl-oct-2026.pdf',
    uploadDate: '2026-10-10',
    certifiedBy: 'Rashid Al-Kharusi (HSE Lead)',
    verifiedStatus: 'Approved',
    expiryDate: '2026-11-10'
  },
  {
    id: 'EVD-SCAF-04',
    obligationId: 'OBL-002',
    title: '7-Day Scaffold Inspection Certificate - Khazzan Flare Line Header Platform',
    documentType: 'Third-Party Inspection',
    fileUrl: '/evidence/scaffold-tag-khz-04.pdf',
    uploadDate: '2026-10-09',
    certifiedBy: 'Salim Al-Busaidi (HSE Officer)',
    verifiedStatus: 'Approved',
    expiryDate: '2026-10-16'
  },
  {
    id: 'EVD-CDAA-99',
    obligationId: 'OBL-003',
    title: 'Civil Defence & Ambulance Authority (CDAA) Fire Safety Compliance Certificate',
    documentType: 'Civil Defence Certificate',
    fileUrl: '/evidence/cdaa-cert-2026.pdf',
    uploadDate: '2026-09-01',
    certifiedBy: 'CDAA Directorate of Fire Prevention',
    verifiedStatus: 'Approved',
    expiryDate: '2027-09-01'
  },
  {
    id: 'EVD-EA-31',
    obligationId: 'OBL-004',
    title: 'Environment Authority Hazardous Chemical Waste Transport Manifest #WM-99120',
    documentType: 'Statutory Permit',
    fileUrl: '/evidence/ea-manifest-99120.pdf',
    uploadDate: '2026-10-08',
    certifiedBy: 'Nasser Al-Harthy (Environmental Officer)',
    verifiedStatus: 'Approved'
  }
];

const STORAGE_KEYS = {
  SOURCES: 'ad6_reg_sources',
  NOTICES: 'ad6_reg_notices',
  WORKFORCE_CERTS: 'ad6_workforce_certs',
  ESG: 'ad6_esg_metrics',
  OBLIGATIONS: 'ad6_reg_obligations',
  SCORECARDS: 'ad6_reg_scorecards',
  ESCALATIONS: 'ad6_reg_escalations',
  EVIDENCE: 'ad6_reg_evidence'
};

export class RegulatoryIntelligenceService {
  // 1. Official Government Sources
  static getGovernmentSources(): OfficialGovernmentSource[] {
    if (typeof window === 'undefined') return INITIAL_GOV_SOURCES;
    const stored = localStorage.getItem(STORAGE_KEYS.SOURCES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(INITIAL_GOV_SOURCES));
      return INITIAL_GOV_SOURCES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_GOV_SOURCES;
    }
  }

  // 2. Live Regulatory Notices
  static getRegulatoryNotices(): LiveRegulatoryNotice[] {
    if (typeof window === 'undefined') return INITIAL_NOTICES;
    const stored = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
      return INITIAL_NOTICES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_NOTICES;
    }
  }

  static acknowledgeNotice(noticeId: string): void {
    if (typeof window === 'undefined') return;
    const notices = this.getRegulatoryNotices();
    const updated = notices.map(n => n.id === noticeId ? { ...n, isAcknowledged: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
  }

  // Live Grounded Search for Real-Time Statutory Updates using Gemini
  static async searchLiveStatutoryUpdates(query: string, jurisdiction = 'Sultanate of Oman'): Promise<{
    text: string;
    sources: GroundingSource[];
  }> {
    const res = await GeminiClientService.querySearchGrounding({
      query: `${query} (Official Sultanate of Oman Ministry of Labour, PDO Specifications, CDAA, or Environment Authority regulatory decrees)`,
      jurisdiction
    });
    return {
      text: res.text,
      sources: res.sources || []
    };
  }

  // 3. Employee Certification and Document Tracker
  static getEmployeeCertifications(): EmployeeCertificationRecord[] {
    if (typeof window === 'undefined') return INITIAL_WORKFORCE_CERTS;
    const stored = localStorage.getItem(STORAGE_KEYS.WORKFORCE_CERTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.WORKFORCE_CERTS, JSON.stringify(INITIAL_WORKFORCE_CERTS));
      return INITIAL_WORKFORCE_CERTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_WORKFORCE_CERTS;
    }
  }

  static renewCertification(certId: string, newExpiryDate: string, newCertNum?: string): EmployeeCertificationRecord[] {
    const certs = this.getEmployeeCertifications();
    const updated = certs.map(c => {
      if (c.id === certId) {
        return {
          ...c,
          expiryDate: newExpiryDate,
          certificateNumber: newCertNum || c.certificateNumber,
          daysRemaining: 730,
          status: 'Valid' as const,
          escalationStatus: 'Normal' as const
        };
      }
      return c;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WORKFORCE_CERTS, JSON.stringify(updated));
    }
    return updated;
  }

  // 4. HSE and ESG Compliance Center
  static getEsgRecords(): HseEsgMetricRecord[] {
    if (typeof window === 'undefined') return INITIAL_ESG_RECORDS;
    const stored = localStorage.getItem(STORAGE_KEYS.ESG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ESG, JSON.stringify(INITIAL_ESG_RECORDS));
      return INITIAL_ESG_RECORDS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ESG_RECORDS;
    }
  }

  // 5. Regulatory Obligations and Corrective Action Manager
  static getRegulatoryObligations(): RegulatoryObligation[] {
    if (typeof window === 'undefined') return INITIAL_OBLIGATIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.OBLIGATIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.OBLIGATIONS, JSON.stringify(INITIAL_OBLIGATIONS));
      return INITIAL_OBLIGATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_OBLIGATIONS;
    }
  }

  static updateObligationStatus(obligationId: string, status: RegulatoryObligation['complianceStatus'], notes?: string): void {
    const obligations = this.getRegulatoryObligations();
    const updated = obligations.map(o => o.id === obligationId ? { ...o, complianceStatus: status, closureNotes: notes || o.closureNotes } : o);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.OBLIGATIONS, JSON.stringify(updated));
    }
  }

  // 6. Compliance Scorecards
  static getComplianceScorecards(): ComplianceScorecard[] {
    if (typeof window === 'undefined') return INITIAL_SCORECARDS;
    const stored = localStorage.getItem(STORAGE_KEYS.SCORECARDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SCORECARDS, JSON.stringify(INITIAL_SCORECARDS));
      return INITIAL_SCORECARDS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SCORECARDS;
    }
  }

  // 7. Notification and Escalation Rules
  static getEscalationRules(): ComplianceEscalationRule[] {
    if (typeof window === 'undefined') return INITIAL_ESCALATION_RULES;
    const stored = localStorage.getItem(STORAGE_KEYS.ESCALATIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ESCALATIONS, JSON.stringify(INITIAL_ESCALATION_RULES));
      return INITIAL_ESCALATION_RULES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ESCALATION_RULES;
    }
  }

  static toggleEscalationRule(ruleId: string): ComplianceEscalationRule[] {
    const rules = this.getEscalationRules();
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ESCALATIONS, JSON.stringify(updated));
    }
    return updated;
  }

  // 8. Regulatory Audit and Evidence Center
  static getAuditEvidence(): RegulatoryAuditEvidence[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_EVIDENCE;
    const stored = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(INITIAL_AUDIT_EVIDENCE));
      return INITIAL_AUDIT_EVIDENCE;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_AUDIT_EVIDENCE;
    }
  }

  static addAuditEvidence(evidence: Omit<RegulatoryAuditEvidence, 'id' | 'uploadDate'>): RegulatoryAuditEvidence {
    const list = this.getAuditEvidence();
    const newEntry: RegulatoryAuditEvidence = {
      ...evidence,
      id: `EVD-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    list.unshift(newEntry);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(list));
    }
    return newEntry;
  }
}
