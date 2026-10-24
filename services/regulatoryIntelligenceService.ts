/**
 * Enterprise Regulatory Intelligence, HSE, ESG, and Workforce Compliance Service
 * Additive module supporting UAE (OSHAD-SF, MoHRE, Civil Defence), Oman (MoL, PDO), and GCC regulations.
 */

import { GeminiClientService, GroundingSource } from './geminiClientService';

export interface OfficialGovernmentSource {
  id: string;
  name: string;
  nameAr?: string;
  jurisdiction: 'UAE Federal' | 'Abu Dhabi (OSHAD)' | 'Dubai' | 'Oman' | 'Saudi Arabia (HCIS)' | 'International (ISO)';
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
  statutoryFineAed: number;
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
  issuingBody: 'OPITO' | 'NEBOSH' | 'IOSH' | 'CISRS' | 'UAE Red Crescent' | 'MOH' | 'TUV' | 'ADNOC Certified' | 'Civil Defence';
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
  penaltyExposureAed: number;
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

// Initial Official Sources
const INITIAL_GOV_SOURCES: OfficialGovernmentSource[] = [
  {
    id: 'SRC-OSHAD',
    name: 'Abu Dhabi Public Health Center (ADPHC) / OSHAD-SF',
    nameAr: 'مركز أبوظبي للصحة العامة - إطار أوشاد',
    jurisdiction: 'Abu Dhabi (OSHAD)',
    code: 'OSHAD-SF-v3.1',
    officialPortalUrl: 'https://adphc.gov.ae',
    enforcementAuthority: 'OSHAD Regulatory Authority',
    statutoryScope: 'Mechanism 3.0, Mechanism 11.0 Incident Reporting, CoP 2.0 PPE, CoP 5.0 Work at Height, CoP 14.0 Confined Spaces',
    activeRegulationsCount: 38,
    lastSynchronized: '2026-10-10T08:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '+971 800 555'
  },
  {
    id: 'SRC-MOHRE',
    name: 'UAE Ministry of Human Resources & Emiratisation (MoHRE)',
    nameAr: 'وزارة الموارد البشرية والتوطين',
    jurisdiction: 'UAE Federal',
    code: 'UAE-LABOR-LAW-33-2021',
    officialPortalUrl: 'https://mohre.gov.ae',
    enforcementAuthority: 'Labour Inspection Affairs',
    statutoryScope: 'Midday Summer Outdoor Work Ban, Occupational Health, Mandatory Health Insurance & Wages Protection System',
    activeRegulationsCount: 24,
    lastSynchronized: '2026-10-10T12:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '600 590000'
  },
  {
    id: 'SRC-CD',
    name: 'UAE General Directorate of Civil Defence',
    nameAr: 'القيادة العامة للدفاع المدني',
    jurisdiction: 'UAE Federal',
    code: 'UAE-FIRE-SAFETY-CODE-2024',
    officialPortalUrl: 'https://moi.gov.ae',
    enforcementAuthority: 'Ministry of Interior / Civil Defence',
    statutoryScope: 'Fire Prevention, Combustible Cladding, Hazardous Chemical Storage & 24/7 Hassantuk Telemetry Connection',
    activeRegulationsCount: 19,
    lastSynchronized: '2026-10-09T14:30:00Z',
    verificationStatus: 'Active',
    contactHotline: '997'
  },
  {
    id: 'SRC-EAD',
    name: 'Environment Agency Abu Dhabi (EAD)',
    nameAr: 'هيئة البيئة - أبوظبي',
    jurisdiction: 'Abu Dhabi (OSHAD)',
    code: 'EAD-LAW-16-2005',
    officialPortalUrl: 'https://ead.gov.ae',
    enforcementAuthority: 'Environmental Quality & Permitting Sector',
    statutoryScope: 'Industrial Air Emissions, VOC Caps, Hazardous Waste Manifests & Marine Discharge Standards',
    activeRegulationsCount: 29,
    lastSynchronized: '2026-10-10T09:15:00Z',
    verificationStatus: 'Active',
    contactHotline: '+971 2 693 4444'
  },
  {
    id: 'SRC-OMAN-MOL',
    name: 'Oman Ministry of Labour & Civil Defence (Sultanate of Oman)',
    nameAr: 'وزارة العمل والدفاع المدني - سلطنة عمان',
    jurisdiction: 'Oman',
    code: 'OMN-MOL-RD-53-2023',
    officialPortalUrl: 'https://mol.gov.om',
    enforcementAuthority: 'Directorate General of Labour Inspection',
    statutoryScope: 'Ministerial Decision 286/2008 Occupational Safety, PDO PR-1172 Permit to Work, Midday Summer Heat Restrictions',
    activeRegulationsCount: 22,
    lastSynchronized: '2026-10-08T16:00:00Z',
    verificationStatus: 'Active',
    contactHotline: '+968 2434 4444'
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

// Initial Live Regulatory Notices
const INITIAL_NOTICES: LiveRegulatoryNotice[] = [
  {
    id: 'NOT-2026-081',
    title: 'MoHRE Ministerial Resolution on Summer Midday Work Ban & Heat Stress Protocols',
    titleAr: 'قرار وزاري بشأن حظر العمل وقت الظهيرة وإجراءات الإجهاد الحراري',
    authorityId: 'SRC-MOHRE',
    authorityName: 'UAE Ministry of Human Resources & Emiratisation (MoHRE)',
    jurisdiction: 'UAE Federal',
    category: 'Heat Stress & Environment',
    publicationDate: '2026-05-15',
    effectiveDate: '2026-06-15',
    gracePeriodDays: 30,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 50000,
    summary: 'Strict prohibition of outdoor work between 12:30 PM and 3:00 PM during summer months. Employers must provide shaded rest areas, certified electrolyte hydration, and continuous WBGT thermal monitoring.',
    keyObligations: [
      'Cease all open-air tasks from 12:30 PM to 3:00 PM daily during the designated ban window',
      'Provide shaded cooling shelters equipped with misting fans and certified potable cold water + electrolytes',
      'Deploy calibrated Wet Bulb Globe Temperature (WBGT) index flags and hourly heat stress supervisor rounds',
      'Display multilingual heat stress symptom charts (English, Arabic, Hindi, Urdu) across all project gates'
    ],
    sourceUrl: 'https://mohre.gov.ae/en/laws-and-regulations.aspx'
  },
  {
    id: 'NOT-2026-074',
    title: 'OSHAD-SF Technical Bulletin: Revised Working at Height & Fall Arrest Verification',
    titleAr: 'نشرة أوشاد الفنية: تحديث معايير العمل على الارتفاع وأنظمة الحماية من السقوط',
    authorityId: 'SRC-OSHAD',
    authorityName: 'Abu Dhabi Public Health Center (ADPHC) / OSHAD-SF',
    jurisdiction: 'Abu Dhabi (OSHAD)',
    category: 'Labor & Workforce',
    publicationDate: '2026-06-01',
    effectiveDate: '2026-07-01',
    gracePeriodDays: 30,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 75000,
    summary: 'Updated CoP 5.0 requiring dual-lanyard 100% tie-off above 1.8 meters, certified scaffold inspection tags renewed every 7 days, and mandatory drop-prevention tethering for all hand tools.',
    keyObligations: [
      'Enforce certified scaffold inspection tagging (Green/Red) by certified competent Scaffold Inspectors every 7 days',
      'Mandatory secondary shock-absorbing fall arrest harnesses for all work platforms above 1.8m',
      'Implement 100% tool tethering (anti-drop lanyards) on structural pipe racks and offshore towers',
      'Submit third-party load test certificates for all suspended personnel cradles'
    ],
    sourceUrl: 'https://adphc.gov.ae/en/oshad'
  },
  {
    id: 'NOT-2026-069',
    title: 'UAE Civil Defence 2026 Fire Safety Directive: Hassantuk IoT Telemetry Mandatory Link',
    titleAr: 'توجيهات الدفاع المدني 2026: إلزامية ربط أنظمة الإنذار بمنظومة حصنتك الذكية',
    authorityId: 'SRC-CD',
    authorityName: 'UAE General Directorate of Civil Defence',
    jurisdiction: 'UAE Federal',
    category: 'Process Safety & Fire',
    publicationDate: '2026-04-20',
    effectiveDate: '2026-05-30',
    gracePeriodDays: 40,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 100000,
    summary: 'All Class-A industrial chemical warehouses and refinery offsite facilities must establish 24/7 direct telemetry connection to Hassantuk Civil Defence central monitoring.',
    keyObligations: [
      'Maintain certified 24/7 operational link to Civil Defence Hassantuk smart alarm backbone',
      'Conduct bi-annual hydrostatic testing on all stationary foam deluge and hydrants',
      'Maintain maximum 50m separation between class-1 flammable storage tanks and administrative offices',
      'Validate fire wardens training certifications with Civil Defence Academy every 24 months'
    ]
  },
  {
    id: 'NOT-2026-062',
    title: 'Environment Agency Abu Dhabi: VOC Emissions Cap & Hazardous Waste Consignment Notes',
    titleAr: 'هيئة البيئة - أبوظبي: الحد الأقصى للمركبات العضوية المتطايرة وإدارة النفايات الخطرة',
    authorityId: 'SRC-EAD',
    authorityName: 'Environment Agency Abu Dhabi (EAD)',
    jurisdiction: 'Abu Dhabi (OSHAD)',
    category: 'Hazardous Chemicals & Waste',
    publicationDate: '2026-05-02',
    effectiveDate: '2026-06-01',
    gracePeriodDays: 30,
    enforceabilityStatus: 'Inspection Focus',
    statutoryFineAed: 150000,
    summary: 'Requires digital consignment tracking for all industrial chemical waste transported within Abu Dhabi. VOC emission monitors must log 15-minute averages with automated exceedance alarms.',
    keyObligations: [
      'Upload electronic waste manifest consignment notes into EAD portal prior to tanker dispatch',
      'Equip vapor recovery units (VRU) on all hydrocarbon loading racks with continuous FID monitoring',
      'Secondary containment bunding required for 110% of largest chemical storage tank volume'
    ]
  },
  {
    id: 'NOT-2026-055',
    title: 'Oman Ministry of Labour: Ministerial Decision on Industrial Gas Testing & Confined Spaces',
    titleAr: 'وزارة العمل العمانية: القرار الوزاري بشأن فحص الغازات ودخول الأماكن المغلقة',
    authorityId: 'SRC-OMAN-MOL',
    authorityName: 'Oman Ministry of Labour & Civil Defence',
    jurisdiction: 'Oman',
    category: 'Process Safety & Fire',
    publicationDate: '2026-03-10',
    effectiveDate: '2026-04-01',
    gracePeriodDays: 20,
    enforceabilityStatus: 'Mandatory Law',
    statutoryFineAed: 45000,
    summary: 'Mandates OPITO/PDO certified Authorized Gas Tester (AGT) clearance before opening manways on hydrocarbon vessels. Daily bump-test calibration logs must be archived for 5 years.',
    keyObligations: [
      'Pre-entry continuous 4-gas testing (O2, LEL, H2S, CO) signed off by AGT Level 1/2',
      'Dedicated standby rescue sentry equipped with positive-pressure SCBA at all vessel entry points',
      'Calibrate gas detectors with certified calibration gas mixtures every 30 days'
    ]
  }
];

// Initial Employee Certification Records
const INITIAL_WORKFORCE_CERTS: EmployeeCertificationRecord[] = [
  {
    id: 'CERT-001',
    employeeId: 'u6',
    employeeName: 'Rahul Gupta',
    employeeRole: 'Mechanical Technician / Frontline Worker',
    department: 'Mechanical Maintenance',
    siteLocation: 'Al-Ruwais Polyolefin Asset',
    certificationName: 'H2S Awareness & Escape Breathing Apparatus (OPITO)',
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
    siteLocation: 'Al-Ruwais Polyolefin Asset',
    certificationName: 'Working at Heights & Fall Arrest Level 2',
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
    siteLocation: 'Al-Ruwais Polyolefin Asset',
    certificationName: 'Authorized Gas Tester Level 1 & 2 (AGT)',
    issuingBody: 'ADNOC Certified',
    certificateNumber: 'AGT-ADNOC-77192',
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
    siteLocation: 'Al-Ruwais Polyolefin Asset',
    certificationName: 'First Aid at Work & CPR (UAE Red Crescent)',
    issuingBody: 'UAE Red Crescent',
    certificateNumber: 'RC-FA-99023',
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
    siteLocation: 'Habshan Gas Complex',
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
    siteLocation: 'Al-Ruwais Polyolefin Asset',
    certificationName: 'ISO 45001:2018 Lead Auditor (IRCA Certified)',
    issuingBody: 'ADNOC Certified',
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
    siteLocation: 'Musaffah Industrial Hub',
    certificationName: 'ISO 14001:2015 Lead Environmental Auditor',
    issuingBody: 'ADNOC Certified',
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
    siteLocation: 'Group Corporate HQ',
    certificationName: 'OSHAD-SF Certified General Safety Practitioner',
    issuingBody: 'Civil Defence',
    certificateNumber: 'OSHAD-PRAC-1192',
    issueDate: '2025-02-18',
    expiryDate: '2027-02-18',
    daysRemaining: 130,
    status: 'Valid',
    statutoryRequirementLevel: 'Mandatory Statutory',
    verificationDocUrl: '/docs/certs/oshad-alice.pdf',
    escalationStatus: 'Normal'
  }
];

// Initial ESG Metrics Records
const INITIAL_ESG_RECORDS: HseEsgMetricRecord[] = [
  {
    id: 'ESG-RUW-2026',
    facilityId: 'FAC-RUW-01',
    facilityName: 'Al-Ruwais Polyolefin Asset (UAE)',
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
    id: 'ESG-HBS-2026',
    facilityId: 'FAC-HBS-02',
    facilityName: 'Habshan Gas Sweetening Complex',
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
    id: 'ESG-MSF-2026',
    facilityId: 'FAC-MSF-03',
    facilityName: 'Musaffah Industrial Logistics Hub',
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

// Initial Regulatory Obligations
const INITIAL_OBLIGATIONS: RegulatoryObligation[] = [
  {
    id: 'OBL-001',
    regulationId: 'NOT-2026-081',
    regulationTitle: 'MoHRE Midday Work Ban & Heat Stress Monitoring',
    authority: 'UAE MoHRE',
    obligationText: 'Deploy calibrated WBGT heat stress flags, shaded hydration stations, and cease outdoor lifting between 12:30 PM - 3:00 PM.',
    operationalCategory: 'Workforce Safety',
    penaltyExposureAed: 50000,
    responsibleRole: 'Site HSE Officer / Supervisor',
    assignedSite: 'Al-Ruwais Polyolefin Asset',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-WBGT-01',
    nextAuditDueDate: '2026-10-25'
  },
  {
    id: 'OBL-002',
    regulationId: 'NOT-2026-074',
    regulationTitle: 'OSHAD-SF CoP 5.0 Scaffold Inspection Cycle',
    authority: 'Abu Dhabi OSHAD',
    obligationText: 'All access scaffolding must have green tagging renewed every 7 calendar days by certified CISRS/OSHA scaffold inspector.',
    operationalCategory: 'Plant & Machinery',
    penaltyExposureAed: 75000,
    responsibleRole: 'Scaffolding Supervisor',
    assignedSite: 'Habshan Gas Complex',
    complianceStatus: 'Partially Compliant',
    verificationEvidenceId: 'EVD-SCAF-04',
    nextAuditDueDate: '2026-10-18',
    linkedCapaId: 'CAPA-2026-089'
  },
  {
    id: 'OBL-003',
    regulationId: 'NOT-2026-069',
    regulationTitle: 'Civil Defence Hassantuk Industrial Fire Alarm Link',
    authority: 'UAE Civil Defence',
    obligationText: 'Maintain uninterrupted IoT tele-monitoring linkage between central master alarm panel and Civil Defence Operations Command.',
    operationalCategory: 'Plant & Machinery',
    penaltyExposureAed: 100000,
    responsibleRole: 'Maintenance Lead / HSE Manager',
    assignedSite: 'Musaffah Industrial Logistics Hub',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-CD-99',
    nextAuditDueDate: '2026-11-15'
  },
  {
    id: 'OBL-004',
    regulationId: 'NOT-2026-062',
    regulationTitle: 'EAD Hazardous Chemical Waste Consignment Manifests',
    authority: 'Environment Agency Abu Dhabi (EAD)',
    obligationText: 'Consignment manifest codes for chemical sludge and oily residue must be verified prior to transportation off-site.',
    operationalCategory: 'Environmental ESG',
    penaltyExposureAed: 150000,
    responsibleRole: 'Environmental Officer',
    assignedSite: 'Al-Ruwais Polyolefin Asset',
    complianceStatus: 'Fully Compliant',
    verificationEvidenceId: 'EVD-EAD-31',
    nextAuditDueDate: '2026-11-01'
  },
  {
    id: 'OBL-005',
    regulationId: 'NOT-2026-055',
    regulationTitle: 'Oman MoL Ministerial Decision 286/2008 Gas Testing Sentry',
    authority: 'Oman Ministry of Labour',
    obligationText: 'Confined space entry permits must feature verified AGT atmospheric test sheet and constant entry sentry with SCBA pack.',
    operationalCategory: 'Workforce Safety',
    penaltyExposureAed: 45000,
    responsibleRole: 'Site Supervisor',
    assignedSite: 'Fahud Concession Field Block 6',
    complianceStatus: 'At Risk / Non-Compliant',
    nextAuditDueDate: '2026-10-15',
    linkedCapaId: 'CAPA-2026-102',
    closureNotes: 'Overdue sentry logbook check pending verification by Field Superintendent.'
  }
];

// Initial Site Scorecards
const INITIAL_SCORECARDS: ComplianceScorecard[] = [
  {
    facilityId: 'FAC-RUW-01',
    facilityName: 'Al-Ruwais Polyolefin Asset (UAE)',
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
    facilityId: 'FAC-MSF-03',
    facilityName: 'Musaffah Industrial Logistics Hub (UAE)',
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
    facilityId: 'FAC-HBS-02',
    facilityName: 'Habshan Gas Sweetening Complex (UAE)',
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

// Initial Audit Evidence
const INITIAL_AUDIT_EVIDENCE: RegulatoryAuditEvidence[] = [
  {
    id: 'EVD-WBGT-01',
    obligationId: 'OBL-001',
    title: 'MoHRE Midday Heat Stress WBGT Calibrated Flag Log - Ruwais Berth 1',
    documentType: 'Bump Test Log',
    fileUrl: '/evidence/wbgt-oct-2026.pdf',
    uploadDate: '2026-10-10',
    certifiedBy: 'Marcus Chen (Site Supervisor)',
    verifiedStatus: 'Approved',
    expiryDate: '2026-11-10'
  },
  {
    id: 'EVD-SCAF-04',
    obligationId: 'OBL-002',
    title: '7-Day Scaffold Inspection Certificate - Flare Line Header Platform',
    documentType: 'Third-Party Inspection',
    fileUrl: '/evidence/scaffold-tag-hbs-04.pdf',
    uploadDate: '2026-10-09',
    certifiedBy: 'Fatima Al-Kaabi (HSE Officer)',
    verifiedStatus: 'Approved',
    expiryDate: '2026-10-16'
  },
  {
    id: 'EVD-CD-99',
    obligationId: 'OBL-003',
    title: 'Civil Defence Hassantuk 24/7 Smart Telemetry Compliance Certificate',
    documentType: 'Civil Defence Certificate',
    fileUrl: '/evidence/hassantuk-cert-2026.pdf',
    uploadDate: '2026-09-01',
    certifiedBy: 'General Directorate of Civil Defence',
    verifiedStatus: 'Approved',
    expiryDate: '2027-09-01'
  },
  {
    id: 'EVD-EAD-31',
    obligationId: 'OBL-004',
    title: 'EAD Hazardous Chemical Waste Transport Electronic Manifest #WM-99120',
    documentType: 'Statutory Permit',
    fileUrl: '/evidence/ead-manifest-99120.pdf',
    uploadDate: '2026-10-08',
    certifiedBy: 'Khalid Al-Dhaheri (Environmental Officer)',
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
  static async searchLiveStatutoryUpdates(query: string, jurisdiction = 'United Arab Emirates / GCC'): Promise<{
    text: string;
    sources: GroundingSource[];
  }> {
    const res = await GeminiClientService.querySearchGrounding({
      query: `${query} (Official UAE MoHRE, Abu Dhabi OSHAD, UAE Civil Defence, or Oman Ministry of Labour regulatory circulars)`,
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
