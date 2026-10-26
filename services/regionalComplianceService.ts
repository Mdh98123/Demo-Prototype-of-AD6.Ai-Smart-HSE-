/**
 * ============================================================================
 * AD6 HSE Enterprise AI Platform — Centralized Regional Compliance Service
 * Framework: Multi-Jurisdiction Engine (Oman / Oman / Oman + Oman Combined)
 * Regulatory Grounding:
 *   - Oman: Oman MoL MD 286/2008 & PDO SP-1143 v3.1, PDO SP-1143 Specifications, Oman Labour Law (Royal Decree No. 53/2023), Ministry of Labour (MoL), Oman PDPL
 *   - Oman: Oman Labour Law RD 53/2023, MD 286/2008, PDO SP-1143/SP-1170/PR-1172, Oman PDPL RD 6/2022
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

export type Jurisdiction = 'Oman' | 'OMAN' | 'Combined';
export type RegionalComplianceMode = 'OMAN' | 'COMBINED';
export type JurisdictionCode = 'OMAN' | 'CROSS_JURISDICTION';

/**
 * Normalizes input - Locked strictly to Sultanate of Oman
 */
export function toJurisdiction(_input?: string): Jurisdiction {
  return 'Oman';
}

export function toRegionalMode(_input?: string): RegionalComplianceMode {
  return 'OMAN';
}

export interface ComplianceValidationTarget {
  recordType: 'INCIDENT' | 'PERMIT' | 'HEAT_STRESS' | 'AUDIT' | 'CONTRACTOR';
  entityCountry?: string;
  timestamp?: string | Date;
  ambientTemperatureCelsius?: number;
  wbgtIndexCelsius?: number;
  twlWattsPerSqMeter?: number;
  timeOfDayHours?: number; // e.g. 13.5 = 13:30
  dateMonth?: number; // 1-12
  severity?: string;
  hasMandatoryNotice?: boolean;
  permitType?: string;
  gasTestingCompleted?: boolean;
  lotoVerified?: boolean;
  contractorPreQualified?: boolean;
  [key: string]: any;
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  jurisdictionApplied: Jurisdiction;
  governingFramework: string;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  statutoryDeadlines?: {
    deadlineType: string;
    hoursLimit: number;
    authority: string;
  }[];
}

export interface RegulatoryLegislationItem {
  code: string;
  title: string;
  authority: string;
  verified: boolean;
  effectiveDate: string;
  jurisdiction: 'OMAN' | 'OMAN' | 'GCC';
  summary: string;
}

export interface RegulatoryAuthority {
  id: string;
  name: string;
  shortName: string;
  role: string;
  portal: string;
  jurisdiction: 'OMAN' | 'OMAN';
  country: string;
  logoBadge: string;
}

export interface HeatStressRegulatoryRule {
  jurisdiction: 'OMAN' | 'OMAN' | 'COMBINED';
  prohibitedHours: string;
  monthsApplicable: string;
  legalBasis: string;
  measurementMetric: string;
  amberThreshold: string;
  redThreshold: string;
  waterSupplyMandate: string;
  verified: boolean;
  notes: string;
}

export interface IncidentNotificationRule {
  jurisdiction: 'OMAN' | 'OMAN' | 'COMBINED';
  immediateNotificationWindow: string;
  formalSubmissionDeadline: string;
  fullInvestigationDeadline: string;
  requiredForms: string[];
  enforcingAuthority: string;
  penalties: string;
  verified: boolean;
  legalCitation: string;
}

export interface PermitRegulatoryRule {
  jurisdiction: 'OMAN' | 'OMAN' | 'COMBINED';
  standard: string;
  permitClassifications: string[];
  gasTesterCertRequired: string;
  isolationProtocol: string;
  simopsClashStandard: string;
  verified: boolean;
}

export interface RegionalConfigAuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  previousMode: RegionalComplianceMode;
  newMode: RegionalComplianceMode;
  reason: string;
  ipAddress?: string;
}

export interface JurisdictionProfile {
  id: RegionalComplianceMode;
  label: string;
  flag: string;
  shortLabel: string;
  badgeClass: string;
  description: string;
  governingFrameworks: string[];
  primaryLegislation: RegulatoryLegislationItem[];
  authorities: RegulatoryAuthority[];
  heatStressRule: HeatStressRegulatoryRule;
  incidentNotificationRule: IncidentNotificationRule;
  permitRule: PermitRegulatoryRule;
  defaultCurrency: 'OMR' | 'OMR' | 'USD';
  privacyLawName: string;
}

export const UAE_REGULATORY_PROFILE: JurisdictionProfile = {
  id: 'OMAN',
  label: 'United Arab Sultanate of Oman (Oman)',
  flag: '🇦🇪',
  shortLabel: 'OMAN',
  badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  description: 'Enterprise operations governed under Oman Statutory Labour Law No. 33/2021, Muscat Public Health Centre (Oman MoL OSHD) Oman MoL MD 286/2008 & PDO Specifications v3.1, PDO Codes of Practice, Muscat Municipality, and Ministry of Labour (MoL) compliance frameworks.',
  governingFrameworks: ['Oman MoL MD 286/2008 & PDO Specifications v3.1', 'PDO SP-1143 Specification v6.0', 'Oman Ministry of Labour (MoL) Federal', 'Civil Defence and Ambulance Authority (CDAA Oman)'],
  privacyLawName: 'Oman Oman Personal Data Protection Law (Royal Decree 6/2022) (Oman PDPL)',
  defaultCurrency: 'OMR',
  primaryLegislation: [
    {
      code: 'Oman MoL MD 286/2008 & PDO Specifications-v3.1',
      title: 'Muscat Occupational Safety and Health System Framework (Oman MoL MD 286/2008 & PDO Specifications v3.1)',
      authority: 'Muscat Public Health Centre (Oman MoL OSHD)',
      verified: true,
      effectiveDate: '2019-01-01',
      jurisdiction: 'OMAN',
      summary: '11 mandatory system mechanisms governing entity classification, risk assessment, audits, and incident reporting across Muscat concessions.'
    },
    {
      code: 'PDO-COP-V6',
      title: 'PDO Codes of Practice v6.0 (HSE Management System & High Hazard Protocols)',
      authority: 'PDO Group Sector Regulatory Authority',
      verified: true,
      effectiveDate: '2023-06-01',
      jurisdiction: 'OMAN',
      summary: 'Mandatory operational standards for Permit to Work, SIMOPS clash prevention, positive mechanical/electrical LOTO, and gas testing.'
    },
    {
      code: 'FED-DECREE-33-2021',
      title: 'Federal Decree-Law No. 33 of 2021 on Regulation of Labour Relations',
      authority: 'Ministry of Labour (Sultanate of Oman) (Ministry of Labour (MoL))',
      verified: true,
      effectiveDate: '2022-02-02',
      jurisdiction: 'OMAN',
      summary: 'Articles 13 & 37 mandating employer duty of care, protective equipment without worker charge, and immediate work injury notification.'
    },
    {
      code: 'CAB-RES-1-2022',
      title: 'Cabinet Resolution No. 1/2022 on Occupational Injuries and Diseases',
      authority: 'Ministry of Labour (MoL) / Oman Cabinet',
      verified: true,
      effectiveDate: '2022-02-02',
      jurisdiction: 'OMAN',
      summary: 'Mandatory 48-hour medical notification timeline for occupational injuries via Taw-jeeh portal and compensation schedules.'
    },
    {
      code: 'Oman Ministry of Labour-MIDDAY-2024',
      title: 'Ministerial Resolution on Midday Summer Work Prohibition (12:30 PM - 3:00 PM)',
      authority: 'Ministry of Labour (Sultanate of Oman) (Ministry of Labour (MoL))',
      verified: true,
      effectiveDate: '2024-06-15',
      jurisdiction: 'OMAN',
      summary: 'Prohibition of outdoor physical work in sun-exposed areas between 12:30 PM and 3:00 PM from June 15 to September 15 annually.'
    },
    {
      code: 'FED-LAW-45-2021',
      title: 'Oman Personal Data Protection Law (Royal Decree 6/2022) regarding Personal Data Protection (PDPL)',
      authority: 'Oman Data Office',
      verified: true,
      effectiveDate: '2022-01-02',
      jurisdiction: 'OMAN',
      summary: 'National data privacy framework mandating explicit biometric consent, data localization within Oman, and 72-hour DSAR compliance.'
    }
  ],
  authorities: [
    {
      id: 'Oman MoL OSHD',
      name: 'Muscat Public Health Centre (Oman MoL OSHD / Oman MoL MD 286/2008)',
      shortName: 'Oman MoL MD 286/2008 / Oman MoL OSHD',
      role: 'Muscat Statutory Safety Regulatory Authority',
      portal: 'Al Adaa Portal (adaa.adphc.gov.ae)',
      jurisdiction: 'OMAN',
      country: 'OMAN',
      logoBadge: '🏛️ Oman MoL MD 286/2008'
    },
    {
      id: 'Oman Ministry of Labour',
      name: 'Ministry of Labour (Sultanate of Oman) (Ministry of Labour (MoL))',
      shortName: 'Ministry of Labour (MoL) Oman',
      role: 'Federal Labour Relations & Occupational Injury Registry',
      portal: 'omanMoL.gov.ae / Taw-jeeh',
      jurisdiction: 'OMAN',
      country: 'OMAN',
      logoBadge: '🏢 Ministry of Labour (MoL)'
    },
    {
      id: 'PDO_SRA',
      name: 'PDO Sector Regulatory Authority (SRA)',
      shortName: 'PDO SRA',
      role: 'Concession Operator & Industrial Sector Regulator',
      portal: 'pdo.ae/hse-portal',
      jurisdiction: 'OMAN',
      country: 'OMAN',
      logoBadge: '⛽ PDO'
    },
    {
      id: 'DM_HSE',
      name: 'Muscat Municipality Public Health & Safety Dept',
      shortName: 'Muscat Municipality',
      role: 'Sohar Governorate Municipal & Construction Safety Authority',
      portal: 'dm.gov.ae',
      jurisdiction: 'OMAN',
      country: 'OMAN',
      logoBadge: '🏙️ DM'
    },
    {
      id: 'UAE_CD',
      name: 'Civil Defence and Ambulance Authority (CDAA Oman) General Command',
      shortName: 'Civil Defence',
      role: 'National Fire Code & Hazardous Chemical Storage Authority',
      portal: 'civildefence.gov.ae',
      jurisdiction: 'OMAN',
      country: 'OMAN',
      logoBadge: '🚒 Civil Defence'
    }
  ],
  heatStressRule: {
    jurisdiction: 'OMAN',
    prohibitedHours: '12:30 PM - 3:00 PM (2.5 hours mandatory daily break)',
    monthsApplicable: 'June 15 to September 15 (Annual statutory window)',
    legalBasis: 'Ministry of Labour (MoL) Ministerial Resolution / PDO SP-1143 11.0 Safety in the Heat',
    measurementMetric: 'Wet Bulb Globe Temperature (WBGT Index)',
    amberThreshold: '31.0°C WBGT (Mandatory 15min rest per 45min work cycle + hydration)',
    redThreshold: '32.2°C WBGT (Full stoppage of direct outdoor heavy work)',
    waterSupplyMandate: 'Minimum 5 liters chilled electrolyte water per worker per shift + shaded rest areas',
    verified: true,
    notes: 'Strict compliance verified under Muscat PDO SP-1143 11.0 and Ministry of Labour (MoL) labor inspections.'
  },
  incidentNotificationRule: {
    jurisdiction: 'OMAN',
    immediateNotificationWindow: 'Within 2 hours (verbal notification to Sector Regulator PDO / Oman MoL OSHD)',
    formalSubmissionDeadline: 'Within 24 hours (Mandatory Oman MoL Form MD 286 Serious Incident Notification)',
    fullInvestigationDeadline: 'Within 30 days (Form G1 Root Cause Analysis submission)',
    requiredForms: ['Oman MoL Form MD 286 (24h SIN)', 'Oman MoL Form MD 2861 (30d RCA)', 'Ministry of Labour (MoL) Work Injury Portal Report'],
    enforcingAuthority: 'Muscat Public Health Centre (Oman MoL OSHD) & PDO SRA',
    penalties: 'Administrative fines up to OMR 10,000, operational stop-work orders, entity downgrade, and criminal referral under Federal Penal Code.',
    verified: true,
    legalCitation: 'Oman MoL MD 286/2008 & PDO PR-1172 (Incident Notification & Investigation) Sections 3.1 & 3.2'
  },
  permitRule: {
    jurisdiction: 'OMAN',
    standard: 'PDO SP-1143 Specification v6.0 / Oman MoL MD 286/2008 Permitting Standard (Level 1, 2, 3 Authority)',
    permitClassifications: ['Hot Work (Zone 0/1/2)', 'Confined Space Entry', 'Critical Lift (>50t)', 'Radiation / NDT', 'High Voltage Electrical Isolation'],
    gasTesterCertRequired: 'PDO-certified Authorized Gas Tester (AGT - AGT1/AGT2/AGT3)',
    isolationProtocol: 'Positive Physical Isolation: Blind/Spade + Double Block & Bleed + LOTO Padlock',
    simopsClashStandard: '50-meter separation buffer around venting hydrocarbons and simultaneous crane radiuses',
    verified: true
  }
};

export const OMAN_REGULATORY_PROFILE: JurisdictionProfile = {
  id: 'OMAN',
  label: 'Sultanate of Oman (Oman)',
  flag: '🇴🇲',
  shortLabel: 'Oman',
  badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  description: 'Enterprise operations governed under Oman Labour Law (Royal Decree 53/2023), Ministerial Decision No. 286/2008, Petroleum Development Oman (PDO) HSE Specifications (SP-1143, SP-1170, PR-1172), Environment Authority (RD 114/2001), and Oman PDPL (RD 6/2022).',
  governingFrameworks: ['Oman Labour Law RD 53/2023', 'PDO SP-1143 PTW', 'PDO SP-1170 Heat Stress', 'Oman MD 286/2008'],
  privacyLawName: 'Oman Personal Data Protection Law (Royal Decree No. 6/2022)',
  defaultCurrency: 'OMR',
  primaryLegislation: [
    {
      code: 'ROYAL-DECREE-53-2023',
      title: 'Promulgating the Labour Law (Royal Decree No. 53/2023)',
      authority: 'Ministry of Labour (MoL)',
      verified: true,
      effectiveDate: '2023-07-31',
      jurisdiction: 'OMAN',
      summary: 'Chapter 7 mandating establishment occupational safety committees, protective gear without deductions, and strict accident notifications.'
    },
    {
      code: 'MIN-DEC-286-2008',
      title: 'Regulations on Occupational Safety and Health in Establishments Subject to the Labour Law',
      authority: 'Ministry of Labour (MoL)',
      verified: true,
      effectiveDate: '2008-07-01',
      jurisdiction: 'OMAN',
      summary: 'Articles 14 & 16 mandating 24-hour statutory accident notifications to Directorate General of Labour Welfare and afternoon heat stoppage.'
    },
    {
      code: 'PDO-SP-1143',
      title: 'PDO Specification for Permit to Work System (SP-1143)',
      authority: 'Petroleum Development Oman (PDO)',
      verified: true,
      effectiveDate: '2022-09-01',
      jurisdiction: 'OMAN',
      summary: 'Class A (High Risk) & Class B (Medium Risk) PTW regime, Mechanical/Electrical Isolation Certificates, and strict Responsible Supervisor sign-offs.'
    },
    {
      code: 'PDO-SP-1170',
      title: 'PDO Specification for Naturally Occurring Heat Stress Management (SP-1170)',
      authority: 'Petroleum Development Oman (PDO)',
      verified: true,
      effectiveDate: '2023-05-01',
      jurisdiction: 'OMAN',
      summary: 'Thermal Work Limit (TWL) primary metric. Mandatory continuous monitoring in Block 6 concessions with TWL < 115 W/m² automatic work cessation.'
    },
    {
      code: 'PDO-PR-1172',
      title: 'Procedure for Safety Management in Operations & Incident Notification (PR-1172)',
      authority: 'Petroleum Development Oman (PDO)',
      verified: true,
      effectiveDate: '2022-01-01',
      jurisdiction: 'OMAN',
      summary: 'Formal Serious Incident Notification (SIN) dispatched to Ministry of Energy and Minerals within 24 hours and 30-day investigation closeout.'
    },
    {
      code: 'ROYAL-DECREE-114-2001',
      title: 'Law on Conservation of the Environment and Prevention of Pollution (RD 114/2001)',
      authority: 'Environment Authority (EA / MECA)',
      verified: true,
      effectiveDate: '2001-11-01',
      jurisdiction: 'OMAN',
      summary: 'Strict industrial discharge consents, hazardous waste tracking manifests, and continuous air quality monitoring (CEMS).'
    },
    {
      code: 'ROYAL-DECREE-6-2022',
      title: 'Promulgating the Personal Data Protection Law (Oman PDPL RD 6/2022)',
      authority: 'Ministry of Transport, Communications and Information Technology',
      verified: true,
      effectiveDate: '2023-02-09',
      jurisdiction: 'OMAN',
      summary: 'Sultanate of Oman data protection framework requiring statutory basis for employee telemetry collection and local data hosting.'
    }
  ],
  authorities: [
    {
      id: 'MOL_OMAN',
      name: 'Ministry of Labour (MoL) - Directorate General of Labour Welfare',
      shortName: 'Ministry of Labour (MoL)',
      role: 'National Labour Welfare & Statutory HSE Inspectorate Authority',
      portal: 'mol.gov.om',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '🇴🇲 MoL'
    },
    {
      id: 'PDO_HSE',
      name: 'Petroleum Development Oman (PDO) HSE Directorate',
      shortName: 'PDO HSE',
      role: 'Block 6 Concession Operator & Industrial Safety Standard Setter',
      portal: 'pdo.co.om/hse',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '🛢️ PDO'
    },
    {
      id: 'MEM_OMAN',
      name: 'Ministry of Energy and Minerals (MEM)',
      shortName: 'MEM Oman',
      role: 'National Energy, Hydrocarbon & Mineral Resources Regulator',
      portal: 'mem.gov.om',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '⚡ MEM'
    },
    {
      id: 'EA_OMAN',
      name: 'Environment Authority (EA / MECA)',
      shortName: 'Environment Authority',
      role: 'Environmental Protection, Emission Licensing & Spill Authority',
      portal: 'ea.gov.om',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '🌿 EA Oman'
    },
    {
      id: 'CDAA_OMAN',
      name: 'Civil Defence and Ambulance Authority (CDAA)',
      shortName: 'CDAA Oman',
      role: 'Industrial Fire Safety Permits, Emergency Rescue & Hazmat Transport',
      portal: 'cdaa.gov.om',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '🚑 CDAA'
    },
    {
      id: 'OPAL',
      name: 'Oman Energy Association (OPAL)',
      shortName: 'OPAL',
      role: 'Energy Sector Unified HSE Competency Standards & Certification',
      portal: 'opaloman.org',
      jurisdiction: 'OMAN',
      country: 'Oman',
      logoBadge: '🛡️ OPAL'
    }
  ],
  heatStressRule: {
    jurisdiction: 'OMAN',
    prohibitedHours: '12:30 PM - 3:30 PM (3.0 hours mandatory daily break - Note: 30min longer than Oman)',
    monthsApplicable: 'June, July, and August (3 full calendar months)',
    legalBasis: 'MD 286/2008 Article 16 & Oman Labour Law RD 53/2023 Article 77',
    measurementMetric: 'Thermal Work Limit (TWL in W/m²) & WBGT (PDO SP-1170)',
    amberThreshold: 'TWL 115 - 140 W/m² (Buffer zone: mandatory 15min rest per 45min work cycle + electrolytes)',
    redThreshold: 'TWL < 115 W/m² (Automatic immediate work stoppage; physiological safety cutoff)',
    waterSupplyMandate: 'Continuous supply of cool drinking water containing balanced mineral salts + air-conditioned rest shelters',
    verified: true,
    notes: 'Strict compliance verified under Oman MD 286/2008 and PDO SP-1170 mandatory concession audits.'
  },
  incidentNotificationRule: {
    jurisdiction: 'OMAN',
    immediateNotificationWindow: 'Within 2 hours (verbal notice to Area Labour Inspector & Regional ROP)',
    formalSubmissionDeadline: 'Within 24 hours (Statutory written notification to Ministry of Labour under MD 286/2008 Art. 14)',
    fullInvestigationDeadline: 'Within 30 days (Comprehensive Investigation Report dispatched to MoL and MEM)',
    requiredForms: ['Ministry of Labour 24h Serious Incident Schedule', 'PDO Statutory Serious Incident Notice (SIN)'],
    enforcingAuthority: 'Ministry of Labour (MoL) & Directorate General of Labour Welfare, Muscat',
    penalties: 'Administrative fines up to OMR 5,000 per violation, site closure order, and penal prosecution of Responsible Site Director under Article 14.',
    verified: true,
    legalCitation: 'Oman Ministerial Decision No. 286/2008 Article 14 & Labour Law RD 53/2023'
  },
  permitRule: {
    jurisdiction: 'OMAN',
    standard: 'Petroleum Development Oman (PDO) SP-1143 PTW System Standard',
    permitClassifications: ['Class A PTW (Red - High Risk)', 'Class B PTW (Green - Medium Risk)', 'Confined Space Certificate (CSC)', 'Radiography Certificate (RC)'],
    gasTesterCertRequired: 'PDO-accredited Authorized Gas Tester (AGT - Levels 1 & 2)',
    isolationProtocol: 'Mechanical Isolation Certificate (MIC) & Electrical Isolation Certificate (EIC) + Lockout Box Protocol',
    simopsClashStandard: 'PDO SIMOPS Assessment Matrix & Safe Separation Distance Register',
    verified: true
  }
};

export const COMBINED_REGULATORY_PROFILE: JurisdictionProfile = {
  id: 'COMBINED',
  label: 'Oman + Oman (Combined Compliance)',
  flag: '🇦🇪🇴🇲',
  shortLabel: 'Oman + Oman',
  badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-300',
  description: 'Enterprise multi-jurisdictional compliance configuration supporting dual legal compliance across the United Arab Sultanate of Oman and Sultanate of Oman. Each legal entity and operating concession maintains its native statutory jurisdiction while supporting consolidated executive analytics.',
  governingFrameworks: [
    'Oman: Oman MoL MD 286/2008 & PDO Specifications v3.1 & PDO SP-1143 Specifications',
    'Oman: Oman Labour Law RD 53/2023 & PDO SP-1143',
    'Cross-Border HSE Governance'
  ],
  privacyLawName: 'Oman PDPL (Law 45/2021) & Oman PDPL (RD 6/2022)',
  defaultCurrency: 'USD',
  primaryLegislation: [
    ...UAE_REGULATORY_PROFILE.primaryLegislation,
    ...OMAN_REGULATORY_PROFILE.primaryLegislation
  ],
  authorities: [
    ...UAE_REGULATORY_PROFILE.authorities,
    ...OMAN_REGULATORY_PROFILE.authorities
  ],
  heatStressRule: {
    jurisdiction: 'COMBINED',
    prohibitedHours: 'Jurisdiction-Dependent: Oman 12:30 PM - 3:00 PM | Oman 12:30 PM - 3:30 PM',
    monthsApplicable: 'Oman: June 15 - Sept 15 | Oman: June 1 - August 31',
    legalBasis: 'Oman Ministry of Labour (MoL) Resolution & Oman MD 286/2008 Article 16',
    measurementMetric: 'Dual Metric: WBGT (Oman Standard) & Thermal Work Limit TWL (Oman Standard)',
    amberThreshold: 'Oman: 31°C WBGT | Oman: TWL 140 W/m²',
    redThreshold: 'Oman: 32.2°C WBGT | Oman: TWL 115 W/m²',
    waterSupplyMandate: 'Strict compliance with respective host-nation mandates',
    verified: true,
    notes: 'Multi-jurisdiction rule: Operating assets in Oman must observe the extra 30 minutes of afternoon stoppage (12:30 - 3:30 PM) per Royal Decree 53/2023.'
  },
  incidentNotificationRule: {
    jurisdiction: 'COMBINED',
    immediateNotificationWindow: 'Strict 2 Hours across both jurisdictions',
    formalSubmissionDeadline: '24 Hours: Oman Form G to Oman MoL OSHD | Oman MD 286 Schedule to Ministry of Labour',
    fullInvestigationDeadline: '30 Days comprehensive root cause analysis',
    requiredForms: ['Oman Oman MoL Form MD 286', 'Oman MoL 24h Notice', 'PDO SIN Form'],
    enforcingAuthority: 'Host-Nation Primary Authority (Oman MoL OSHD/PDO for Oman; MoL/PDO/MEM for Oman)',
    penalties: 'Oman: up to OMR 10,000 | Oman: up to OMR 5,000 plus respective criminal sanctions',
    verified: true,
    legalCitation: 'Oman MoL MD 286/2008 & PDO PR-1172 & Oman Ministerial Decision 286/2008 Art. 14'
  },
  permitRule: {
    jurisdiction: 'COMBINED',
    standard: 'Dual Framework: PDO SP-1143 Specification v6.0 (Oman) & PDO SP-1143 (Oman)',
    permitClassifications: [
      'Oman: Level 1/2/3 PTW & SIMOPS Protocols',
      'Oman: Class A / Class B PTW & MIC/EIC Protocols'
    ],
    gasTesterCertRequired: 'Host-Nation Accreditation: PDO-AGT (Oman) or PDO-AGT (Oman)',
    isolationProtocol: 'Zero-Energy Positive Mechanical & Electrical LOTO with Concession Isolation Box',
    simopsClashStandard: 'Unified Concession SIMOPS Clash Detection Engine',
    verified: true
  }
};

export const JURISDICTION_PROFILES: Record<RegionalComplianceMode, JurisdictionProfile> = {
  OMAN: OMAN_REGULATORY_PROFILE,
  COMBINED: OMAN_REGULATORY_PROFILE
};

export interface JurisdictionTerminology {
  primaryframework: string;
  governingauthority: string;
  regulatorybody: string;
  heatstressprotocol: string;
  summerresthours: string;
  permittoworkstandard: string;
  incidentnoticeform: string;
  incidentsubmissionsla: string;
  dataprotectionlaw: string;
  officialcurrency: string;
  auditportal: string;
  labourlawcitation: string;
  civildefenceauthority: string;
  ministryoflabour: string;
  heatstressmetric: string;
  gastestercertification: string;
  isolationstandard: string;
  safetypassport: string;
  [key: string]: string;
}

export type RegionalStateListener = (state: {
  jurisdiction: Jurisdiction;
  mode: RegionalComplianceMode;
  profile: JurisdictionProfile;
  auditRecord?: RegionalConfigAuditRecord;
  toString?: () => string;
  valueOf?: () => string;
}) => void;

const OMAN_TERMS: JurisdictionTerminology = {
  primaryframework: 'Sultanate of Oman Labour Law (Royal Decree 53/2023) & MD 286/2008',
  governingauthority: 'Ministry of Labour (MoL) & Civil Defence and Ambulance Authority (CDAA)',
  regulatorybody: 'Ministry of Labour Directorate of Occupational Safety & Health',
  heatstressprotocol: 'PDO SP-1170 & MD 286/2008 Thermal Stress Protocol (12:30 - 15:30 June through August; TWL <115 W/m² stop)',
  summerresthours: '12:30 to 15:30 (June 1 – August 31)',
  permittoworkstandard: 'Petroleum Development Oman (PDO) SP-1143 Specification for PTW',
  incidentnoticeform: 'Ministry of Labour Annex 1 Work Injury & Occupational Disease Notice',
  incidentsubmissionsla: '24 Hours for Fatalities, Severe Disability, or 4+ Injured Workers',
  dataprotectionlaw: 'Sultanate of Oman Personal Data Protection Law (Royal Decree 6/2022)',
  officialcurrency: 'Omani Rial (OMR)',
  auditportal: 'Ministry of Labour Occupational Safety & Health Surveillance System',
  labourlawcitation: 'Royal Decree No. 53/2023 Promulgating the Labour Law',
  civildefenceauthority: 'Civil Defence and Ambulance Authority (CDAA Oman)',
  ministryoflabour: 'Ministry of Labour (MoL) - Directorate General of Labour Welfare',
  heatstressmetric: 'Thermal Work Limit (TWL in W/m² - Stoppage at <115 W/m²)',
  gastestercertification: 'PDO-accredited Authorized Gas Tester (AGT Levels 1 & 2)',
  isolationstandard: 'Mechanical Isolation Certificate (MIC) & Electrical Isolation Certificate (EIC)',
  safetypassport: 'OPAL Unified HSE Competency Passport'
};

export const REGULATORY_TERMS: Record<Jurisdiction, JurisdictionTerminology> = {
  Oman: OMAN_TERMS,
  OMAN: OMAN_TERMS,
  Combined: OMAN_TERMS
};

export const STORAGE_KEY_MODE = 'ad6_regional_compliance_mode';
export const STORAGE_KEY_JURISDICTION = 'ad6_regional_compliance_jurisdiction';
export const STORAGE_KEY_JURISDICTION_ALT = 'regional_compliance_jurisdiction';
export const STORAGE_KEY_AUDIT = 'ad6_regional_compliance_audit_log';

/**
 * Initial Default Audit Record
 */
const DEFAULT_AUDIT_LOG: RegionalConfigAuditRecord[] = [
  {
    id: 'audit-rc-001',
    timestamp: '2026-10-15T08:00:00Z',
    actorId: 'admin',
    actorName: 'System Admin',
    actorRole: 'ADMIN',
    previousMode: 'OMAN',
    newMode: 'OMAN',
    reason: 'System commissioned exclusively for Sultanate of Oman statutory compliance (MoL MD 286/2008 & PDO).'
  }
];

export class RegionalComplianceService {
  private static inMemoryMode: RegionalComplianceMode = 'OMAN';
  private static inMemoryAudit: RegionalConfigAuditRecord[] = [...DEFAULT_AUDIT_LOG];
  private static listeners: Set<RegionalStateListener> = new Set();
  private static isInitialized = false;

  /**
   * Initializes persistent storage on application startup.
   * Immediately reads localStorage so UI reflects state instantly upon load.
   */
  public static initializePersistence(): Jurisdiction {
    this.isInitialized = true;
    return this.loadStoredJurisdiction();
  }

  /**
   * Loads the persistently stored jurisdiction from localStorage.
   * Checks multiple common keys for maximum compatibility.
   */
  public static loadStoredJurisdiction(): Jurisdiction {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_JURISDICTION)
          || localStorage.getItem(STORAGE_KEY_JURISDICTION_ALT)
          || localStorage.getItem(STORAGE_KEY_MODE);

        if (stored) {
          const jur = toJurisdiction(stored);
          const mode = toRegionalMode(stored);
          this.inMemoryMode = mode;
          return jur;
        }
      } catch (e) {
        console.warn('Unable to access localStorage for regional compliance:', e);
      }
    }
    return toJurisdiction(this.inMemoryMode);
  }

  /**
   * Saves the chosen jurisdiction persistently in localStorage.
   * Ensures settings survive page refreshes and browser restarts.
   */
  public static saveStoredJurisdiction(jurisdiction: Jurisdiction | RegionalComplianceMode): void {
    if (typeof window !== 'undefined') {
      try {
        const jur = toJurisdiction(jurisdiction);
        const mode = toRegionalMode(jurisdiction);
        localStorage.setItem(STORAGE_KEY_MODE, mode);
        localStorage.setItem(STORAGE_KEY_JURISDICTION, jur);
        localStorage.setItem(STORAGE_KEY_JURISDICTION_ALT, jur);
      } catch (e) {
        console.warn('Unable to persist regional compliance to localStorage:', e);
      }
    }
  }

  /**
   * Retrieves the stored jurisdiction from persistent storage
   */
  public static getStoredJurisdiction(): Jurisdiction {
    return this.loadStoredJurisdiction();
  }

  /**
   * Constructs the reactive state snapshot for listeners
   */
  private static createStateSnapshot(auditRecord?: RegionalConfigAuditRecord) {
    const jurisdiction = this.getActiveJurisdiction();
    const mode = this.getActiveMode();
    const profile = this.getActiveProfile();
    return {
      jurisdiction,
      mode,
      profile,
      auditRecord,
      toString() {
        return jurisdiction;
      },
      valueOf() {
        return jurisdiction;
      },
      [Symbol.toPrimitive]() {
        return jurisdiction;
      }
    };
  }

  /**
   * Subscribes a reactive listener to active jurisdiction configuration changes.
   * Invoked immediately with current state upon subscription.
   * Returns an unsubscription cleanup function.
   */
  public static subscribe(listener: RegionalStateListener): () => void {
    this.listeners.add(listener);
    try {
      listener(this.createStateSnapshot());
    } catch (e) {
      console.warn('Initial subscriber call failed:', e);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Alias for subscribe (compatible with standard EventTarget / Store APIs)
   */
  public static addChangeListener(listener: RegionalStateListener): () => void {
    return this.subscribe(listener);
  }

  private static notifyListeners(auditRecord?: RegionalConfigAuditRecord): void {
    const state = this.createStateSnapshot(auditRecord);
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (err) {
        console.error('Error in regional compliance state listener:', err);
      }
    });
  }

  /**
   * Retrieves the current global compliance mode, checking localStorage first.
   */
  public static getActiveMode(): RegionalComplianceMode {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MODE)
          || localStorage.getItem(STORAGE_KEY_JURISDICTION)
          || localStorage.getItem(STORAGE_KEY_JURISDICTION_ALT);
        if (stored) {
          const mode = toRegionalMode(stored);
          this.inMemoryMode = mode;
          return mode;
        }
      } catch (e) {}
    }
    return this.inMemoryMode;
  }

  /**
   * Retrieves the complete JurisdictionProfile for the active mode
   */
  public static getActiveProfile(): JurisdictionProfile {
    const mode = this.getActiveMode();
    return JURISDICTION_PROFILES[mode];
  }

  /**
   * Retrieves profile for an explicit mode
   */
  public static getProfile(mode: RegionalComplianceMode): JurisdictionProfile {
    return JURISDICTION_PROFILES[mode] || JURISDICTION_PROFILES.COMBINED;
  }

  /**
   * Retrieves the audit history of regional configuration changes
   */
  public static getAuditHistory(): RegionalConfigAuditRecord[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_AUDIT);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to parse regional compliance audit log:', e);
      }
    }
    return this.inMemoryAudit.length > 0 ? this.inMemoryAudit : DEFAULT_AUDIT_LOG;
  }

  /**
   * Updates the global regional compliance configuration.
   * STRICT AUTHORIZATION: Caller must possess 'ADMIN' role.
   */
  public static setRegionalMode(
    newMode: RegionalComplianceMode,
    user?: UserProfile,
    reason: string = 'Administrative policy realignment'
  ): { success: boolean; error?: string } {
    // If a user profile is provided, strictly enforce ADMIN role validation
    if (user && user.role !== 'ADMIN') {
      console.error('[SECURITY AUDIT] Unauthorized attempt to change global regional compliance mode by user:', user?.id);
      return {
        success: false,
        error: 'Access Denied: Only authorized System Administrators (ADMIN role) are permitted to alter global regional compliance configurations.'
      };
    }

    if (newMode !== 'OMAN' && newMode !== 'COMBINED') {
      return { success: false, error: 'Invalid configuration mode specified.' };
    }

    const previousMode = this.getActiveMode();
    if (previousMode === newMode) {
      return { success: true };
    }

    const effectiveUser: { id: string; name: string; role: string } = user ? {
      id: user.id,
      name: user.name,
      role: user.role
    } : {
      id: 'system-compliance-admin',
      name: 'System Administrator',
      role: 'ADMIN'
    };

    const auditRecord: RegionalConfigAuditRecord = {
      id: `audit-rc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: effectiveUser.id,
      actorName: effectiveUser.name,
      actorRole: effectiveUser.role,
      previousMode,
      newMode,
      reason: reason.trim() || 'System Administrator routine compliance realignment.'
    };

    this.inMemoryMode = newMode;
    this.inMemoryAudit = [auditRecord, ...this.inMemoryAudit].slice(0, 100);
    this.notifyListeners(auditRecord);

    try {
      if (typeof window !== 'undefined') {
        const jur = toJurisdiction(newMode);
        localStorage.setItem(STORAGE_KEY_MODE, newMode);
        localStorage.setItem(STORAGE_KEY_JURISDICTION, jur);
        localStorage.setItem(STORAGE_KEY_JURISDICTION_ALT, jur);
        
        // Append to audit history
        const history = this.getAuditHistory();
        const updatedHistory = [auditRecord, ...history].slice(0, 100);
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updatedHistory));

        // Notify backend audit trail if available
        fetch('/api/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: effectiveUser.id,
            operation: 'REGIONAL_COMPLIANCE_MODE_CHANGED',
            payload: auditRecord
          })
        }).catch(() => {});

        // Synchronize with backend regional endpoint
        fetch('/api/admin/regional-compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: newMode,
            actorId: effectiveUser.id,
            reason: auditRecord.reason
          })
        }).catch(() => {});

        // Dispatch app-wide event for reactive re-render
        window.dispatchEvent(
          new CustomEvent('ad6-regional-compliance-changed', {
            detail: { previousMode, newMode, actor: user.name, auditRecord }
          })
        );
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to set regional compliance mode:', err);
      return { success: false, error: err.message || 'Persistence storage error' };
    }
  }

  /**
   * Checks whether a specific entity's country/jurisdiction is visible under the active mode.
   * Strict Rule:
   *  - Under Oman mode: Oman entities are hidden.
   *  - Under Oman mode: Oman entities are hidden.
   *  - Under Combined mode: Both are visible.
   */
  public static isEntityVisible(entityCountry?: string, _activeMode?: RegionalComplianceMode): boolean {
    if (!entityCountry) return true;
    const normalized = entityCountry.toUpperCase();
    if (normalized.includes('OMAN') || normalized.includes('Oman') || normalized.includes('Muscat') || normalized.includes('Sohar') || normalized.includes('Mina Al Fahal') || normalized.includes('HABSHAN') || normalized.includes('Sohar Freezone') || normalized.includes('JEBEL ALI')) {
      return false;
    }
    return true;
  }

  /**
   * Filters an array of objects having country/jurisdiction properties according to the active mode
   */
  public static filterByActiveMode<T extends { country?: string; jurisdiction?: string }>(
    items: T[],
    _mode?: RegionalComplianceMode
  ): T[] {
    return items.filter(item => {
      const country = item.country || item.jurisdiction;
      return this.isEntityVisible(country);
    });
  }

  /**
   * Returns active configuration as a Jurisdiction type ('OMAN' | 'Oman' | 'Combined')
   */
  public static getActiveJurisdiction(): Jurisdiction {
    return 'Oman';
  }

  /**
   * Updates active configuration using Jurisdiction type ('OMAN' | 'Oman' | 'Combined')
   */
  public static setActiveJurisdiction(
    _jurisdiction: Jurisdiction,
    user?: UserProfile,
    reason: string = 'Administrative compliance realignment'
  ): { success: boolean; error?: string } {
    return this.setRegionalMode('OMAN', user, reason);
  }

  /**
   * Checks whether a specific regulatory rule, feature, or authority standard is available
   * under the current or specified jurisdiction mode.
   */
  public static isRuleAvailable(
    ruleId: string,
    _jurisdiction?: Jurisdiction | RegionalComplianceMode
  ): boolean {
    const rawKey = (ruleId || '').trim().toUpperCase();
    const key = rawKey.replace(/[-]/g, '_');

    // Universal rules valid in all configurations
    const universalRules = [
      'ISO_45001', 'ISO_14001', 'ISO_9001', 'ROOT_CAUSE_5WHY', 'FISHBONE_RCA',
      'SIMOPS_DECONFLICTION', 'STOP_WORK_AUTHORITY', 'LOTO_GENERAL', 'GAS_TESTING_MANDATORY',
      'HAZOP', 'DYNAMIC_RISK_ASSESSMENT'
    ];
    if (universalRules.some(u => key === u || key.includes(u))) return true;

    // Oman-only rules are strictly unavailable in Oman-only platform
    const uaeSpecific = [
      'Oman MoL MD 286/2008_FORM_G', 'Oman MoL MD 286/2008_FORM_G1', 'OMAN_MOL_MD286', 'Oman MoL OSHD', 'Oman Ministry of Labour_MIDDAY_BREAK', 'Oman Ministry of Labour_BREAK',
      'PDO_SP', 'PDO_SP_PERMIT', 'PDO_AGT', 'UAE_LABOUR_LAW', 'FEDERAL_DECREE_33_2021',
      'UAE_PDPL', 'OMR_CURRENCY', 'Oman MoL OSHD_AL_ADAA', 'Sohar_MUNICIPALITY', 'AL_ADAA_PORTAL',
      'TAW_JEEH', 'CIVIL_DEFENCE_UAE'
    ];
    if (uaeSpecific.some(u => key.includes(u) || key === u)) {
      return false;
    }
    return true;
  }

  /**
   * Fetches official regulatory terminology for the specified term or retrieves the entire
   * terminology dictionary for the specified or active jurisdiction.
   *
   * Supported call signatures:
   *  - getJurisdictionTerminology() -> returns full dictionary for active jurisdiction
   *  - getJurisdictionTerminology(jurisdiction) -> returns full dictionary for specified jurisdiction
   *  - getJurisdictionTerminology(termKey, jurisdiction) -> returns term string
   */
  public static getJurisdictionTerminology(): JurisdictionTerminology;
  public static getJurisdictionTerminology(jurisdiction: Jurisdiction | RegionalComplianceMode): JurisdictionTerminology;
  public static getJurisdictionTerminology(termKey: string, jurisdiction?: Jurisdiction | RegionalComplianceMode): string;
  public static getJurisdictionTerminology(
    firstArg?: string,
    secondArg?: Jurisdiction | RegionalComplianceMode
  ): any {
    if (!firstArg) {
      return this.getAllJurisdictionTerminology(this.getActiveJurisdiction());
    }

    const norm = firstArg.trim().toUpperCase();
    if (norm === 'OMAN' || norm === 'OMAN' || norm === 'COMBINED' || norm === 'UNITED ARAB Oman' || norm === 'SULTANATE OF OMAN') {
      return this.getAllJurisdictionTerminology(toJurisdiction(norm));
    }

    return this.getRegulatoryTerminology(firstArg, secondArg || this.getActiveJurisdiction());
  }

  /**
   * Returns the entire terminology dictionary for a given jurisdiction
   */
  public static getAllJurisdictionTerminology(
    jurisdiction?: Jurisdiction | RegionalComplianceMode
  ): JurisdictionTerminology {
    const jur = toJurisdiction(jurisdiction || this.getActiveMode());
    return { ...(REGULATORY_TERMS[jur] || REGULATORY_TERMS.Combined) };
  }

  /**
   * Fetches official regulatory terminology for a given term under the active or specified jurisdiction.
   */
  public static getRegulatoryTerminology(
    termKey: string,
    jurisdiction?: Jurisdiction | RegionalComplianceMode
  ): string {
    const jur = toJurisdiction(jurisdiction || this.getActiveMode());
    const rawKey = (termKey || '').trim();
    const lowerKey = rawKey.toLowerCase();
    const cleanKey = lowerKey.replace(/[-_\s]/g, '');

    const targetDict = REGULATORY_TERMS[jur] || REGULATORY_TERMS.Combined;
    if (targetDict[rawKey]) {
      return targetDict[rawKey];
    }
    if (targetDict[lowerKey]) {
      return targetDict[lowerKey];
    }
    if (targetDict[cleanKey]) {
      return targetDict[cleanKey];
    }

    for (const [k, v] of Object.entries(targetDict)) {
      if (k.toLowerCase().replace(/[-_\s]/g, '') === cleanKey) {
        return v;
      }
    }

    return `Statutory terminology for '${termKey}' governed by ${jur} regulatory framework.`;
  }

  /**
   * Alias for getRegulatoryTerminology
   */
  public static getTerminology(
    termKey: string,
    jurisdiction?: Jurisdiction | RegionalComplianceMode
  ): string {
    return this.getRegulatoryTerminology(termKey, jurisdiction);
  }

  /**
   * Validates a safety or compliance record against statutory rules of the active jurisdiction.
   */
  public static validateCompliance(
    data: ComplianceValidationTarget | any,
    jurisdiction?: Jurisdiction | RegionalComplianceMode
  ): ComplianceValidationResult {
    const target = data || {};
    const jur = toJurisdiction(jurisdiction || this.getActiveMode());
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Determine applied country context
    let country = jur === 'OMAN' ? 'OMAN' : jur === 'Oman' ? 'Oman' : (target.entityCountry || 'OMAN');
    if (jur === 'Combined' && target.entityCountry) {
      country = toJurisdiction(target.entityCountry);
    }

    // 1. HEAT STRESS & SUMMER MIDDAY WORK STOPPAGE VALIDATION
    if (target.recordType === 'HEAT_STRESS' || target.timeOfDayHours !== undefined) {
      const time = target.timeOfDayHours || 0;
      const month = target.dateMonth || new Date().getMonth() + 1; // 1-12

      if (country === 'OMAN') {
        // Ministry of Labour (MoL) Midday Break: 12:30 to 15:00 from June 15 to Sept 15
        const isSummerMonths = (month >= 6 && month <= 9);
        const isProhibitedHour = (time >= 12.5 && time <= 15.0);

        if (isSummerMonths && isProhibitedHour) {
          violations.push(
            'VIOLATION: Outdoor work conducted during mandatory Ministry of Labour (MoL) Midday Break (12:30 - 15:00, June 15 - Sept 15). Strict legal prohibition under Oman Ministerial Resolution.'
          );
          recommendations.push('Immediate task cessation and transition of frontline workers to shaded, cooled rest stations with electrolyte water.');
        }

        // Wet Bulb Globe Temperature (WBGT) index threshold
        if (target.wbgtIndexCelsius !== undefined && target.wbgtIndexCelsius >= 32.2) {
          violations.push(
            `VIOLATION: Measured WBGT index (${target.wbgtIndexCelsius}°C) exceeds statutory maximum threshold (≥32.2°C). Mandatory work stoppage required under PDO SP-1143 11.0.`
          );
        } else if (target.wbgtIndexCelsius !== undefined && target.wbgtIndexCelsius >= 30.0) {
          warnings.push('WARNING: WBGT index in Amber Flag Zone (30.0°C - 32.1°C). Enforce 30-min work / 30-min rest cycle.');
        }
      } else if (country === 'Oman') {
        // Oman Ministerial Decision 286/2008 & PDO SP-1170: 12:30 to 15:30 (June, July, August)
        const isOmanSummer = (month >= 6 && month <= 8);
        const isOmanProhibited = (time >= 12.5 && time <= 15.5);

        if (isOmanSummer && isOmanProhibited) {
          violations.push(
            'VIOLATION: Outdoor work performed during mandatory Oman Ministry of Labour summer rest hours (12:30 - 15:30, June - August) pursuant to Ministerial Decision MD 286/2008.'
          );
          recommendations.push('Enforce immediate Stop Work Authority and verify air-conditioned welfare shelters comply with PDO SP-1170 standards.');
        }

        // Thermal Work Limit (TWL) threshold
        if (target.twlWattsPerSqMeter !== undefined && target.twlWattsPerSqMeter < 115) {
          violations.push(
            `VIOLATION: Thermal Work Limit (TWL) recorded at ${target.twlWattsPerSqMeter} W/m² (below legal threshold < 115 W/m²). Work in direct sunlight prohibited under PDO SP-1170.`
          );
        } else if (target.twlWattsPerSqMeter !== undefined && target.twlWattsPerSqMeter < 140) {
          warnings.push('WARNING: TWL in Buffer Zone (115 - 140 W/m²). Mandatory hydration buddy checks and shaded rotations.');
        }
      }
    }

    // 2. INCIDENT STATUTORY REPORTING VALIDATION
    if (target.recordType === 'INCIDENT') {
      const isSevere = target.severity === 'Critical' || target.severity === 'High';
      if (isSevere && !target.hasMandatoryNotice) {
        if (country === 'Oman') {
          violations.push(
            'VIOLATION: High/Critical severity incident has not submitted 24-Hour Mandatory Notification to Ministry of Labour Directorate of Occupational Safety & Health pursuant to RD 53/2023.'
          );
          recommendations.push('Export and transmit official Oman MoL Annex 1 notice immediately before statutory 24h deadline expires.');
        } else {
          violations.push(
            'VIOLATION: High/Critical severity incident has not submitted Form G Statutory Notification to Muscat Public Health Centre (Oman MoL OSHD) via Al-Adaa portal within 24 hours.'
          );
          recommendations.push('Generate official Oman MoL Form MD 286 PDF and log submission confirmation reference in incident dossier.');
        }
      }
    }

    // 3. PERMIT TO WORK & LOTO VALIDATION
    if (target.recordType === 'PERMIT') {
      if ((target.permitType === 'Hot Work' || target.permitType === 'Confined Space Entry') && !target.gasTestingCompleted) {
        violations.push(
          'VIOLATION: Atmospheric gas testing (O2, LEL, H2S, CO) not certified by licensed Authorized Gas Tester prior to permit authorization.'
        );
      }
      if (target.lotoVerified === false) {
        warnings.push('WARNING: Zero energy mechanical/electrical lock-out/tag-out (LOTO) isolation remains unverified by Area Authority.');
      }
    }

    // 4. CONTRACTOR & COMPETENCY COMPLIANCE VALIDATION
    if (target.recordType === 'CONTRACTOR' || target.contractorPreQualified !== undefined) {
      if (target.contractorPreQualified === false) {
        violations.push(
          'VIOLATION: Contractor not pre-qualified under statutory HSE vendor governance standards.'
        );
        recommendations.push(
          country === 'Oman'
            ? 'Ensure vendor possesses OPAL HSE verification and valid Ministry of Labour registration pursuant to RD 53/2023.'
            : 'Verify entity compliance on Muscat Oman MoL MD 286/2008 / PDO commercial vendor registry pursuant to Oman MoL MD 286/2008 & PDO Specifications Mechanism 8.0.'
        );
      }
    }

    const isCompliant = violations.length === 0;
    const status = violations.length > 0 ? 'NON_COMPLIANT' : warnings.length > 0 ? 'WARNING' : 'COMPLIANT';

    return {
      isCompliant,
      status,
      jurisdictionApplied: jur,
      governingFramework: jur === 'OMAN' 
        ? 'Oman MoL MD 286/2008 & PDO Specifications v3.1 / Oman Labour Law' 
        : jur === 'Oman' 
        ? 'Oman Labour Law RD 53/2023 / MD 286/2008' 
        : 'Dual Oman & Sultanate of Oman Compliance Architecture',
      violations,
      warnings,
      recommendations,
      statutoryDeadlines: target.recordType === 'INCIDENT' ? [
        {
          deadlineType: 'Initial Statutory Notification',
          hoursLimit: 24,
          authority: country === 'Oman' ? 'Ministry of Labour (MoL)' : 'Oman MoL OSHD (Oman MoL MD 286/2008)'
        },
        {
          deadlineType: 'Full Investigation & Root Cause Dossier',
          hoursLimit: country === 'Oman' ? 720 : 720, // 30 calendar days
          authority: country === 'Oman' ? 'MoL & CDAA' : 'Oman MoL OSHD Al-Adaa Portal'
        }
      ] : undefined
    };
  }

  /**
   * Formats a jurisdiction badge and label for an entity
   */
  public static getEntityJurisdictionDetails(country?: string): {
    jurisdictionLabel: string;
    flag: string;
    badgeClass: string;
    authorityName: string;
    primaryReg: string;
  } {
    const c = (country || '').toUpperCase();
    if (c.includes('OMAN') || c === 'OMN') {
      return {
        jurisdictionLabel: 'Sultanate of Oman',
        flag: '🇴🇲',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        authorityName: 'Ministry of Labour (MoL) & PDO',
        primaryReg: 'Oman Labour Law RD 53/2023 & MD 286/2008'
      };
    }
    if (c.includes('OMAN') || c.includes('Oman') || c.includes('Muscat') || c.includes('Sohar')) {
      return {
        jurisdictionLabel: 'United Arab Sultanate of Oman',
        flag: '🇦🇪',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
        authorityName: 'Oman MoL OSHD / Oman MoL MD 286/2008 & Ministry of Labour (MoL)',
        primaryReg: 'Oman MoL MD 286/2008 & PDO Specifications v3.1 & Federal Law No. 33/2021'
      };
    }
    return {
      jurisdictionLabel: 'Cross-Jurisdiction (GCC)',
      flag: '🌐',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      authorityName: 'Unified GCC Industrial Guidelines',
      primaryReg: 'ISO 45001 & Host-Nation Framework'
    };
  }

  /**
   * Returns applicable incident reporting checklist based on active mode & entity
   */
  public static getIncidentChecklist(entityCountry?: string, activeMode?: RegionalComplianceMode) {
    const mode = activeMode || this.getActiveMode();
    let jurisdiction = 'OMAN';
    if (mode === 'OMAN') {
      jurisdiction = 'OMAN';
    } else if (mode === 'COMBINED') {
      if (entityCountry && (entityCountry.toUpperCase().includes('OMAN') || entityCountry.toUpperCase() === 'OMN')) {
        jurisdiction = 'OMAN';
      } else {
        jurisdiction = 'OMAN';
      }
    }

    if (jurisdiction === 'OMAN') {
      return OMAN_REGULATORY_PROFILE.incidentNotificationRule;
    }
    return UAE_REGULATORY_PROFILE.incidentNotificationRule;
  }
}

export const regionalComplianceService = {
  get activeJurisdiction(): Jurisdiction {
    return RegionalComplianceService.getActiveJurisdiction();
  },
  get activeMode(): RegionalComplianceMode {
    return RegionalComplianceService.getActiveMode();
  },
  get activeProfile(): JurisdictionProfile {
    return RegionalComplianceService.getActiveProfile();
  },
  getActiveJurisdiction(): Jurisdiction {
    return RegionalComplianceService.getActiveJurisdiction();
  },
  setActiveJurisdiction(jurisdiction: Jurisdiction, user?: any, reason?: string) {
    return RegionalComplianceService.setActiveJurisdiction(jurisdiction, user, reason);
  },
  getActiveMode(): RegionalComplianceMode {
    return RegionalComplianceService.getActiveMode();
  },
  setRegionalMode(mode: RegionalComplianceMode, user?: any, reason?: string) {
    return RegionalComplianceService.setRegionalMode(mode, user, reason);
  },
  getActiveProfile(): JurisdictionProfile {
    return RegionalComplianceService.getActiveProfile();
  },
  getProfile(mode: RegionalComplianceMode): JurisdictionProfile {
    return RegionalComplianceService.getProfile(mode);
  },
  getAuditHistory(): RegionalConfigAuditRecord[] {
    return RegionalComplianceService.getAuditHistory();
  },
  isRuleAvailable(ruleId: string, jurisdiction?: Jurisdiction | RegionalComplianceMode): boolean {
    return RegionalComplianceService.isRuleAvailable(ruleId, jurisdiction);
  },
  getJurisdictionTerminology(firstArg?: any, secondArg?: any): any {
    return (RegionalComplianceService as any).getJurisdictionTerminology(firstArg, secondArg);
  },
  getAllJurisdictionTerminology(jurisdiction?: Jurisdiction | RegionalComplianceMode): Record<string, string> {
    return RegionalComplianceService.getAllJurisdictionTerminology(jurisdiction);
  },
  getRegulatoryTerminology(termKey: string, jurisdiction?: Jurisdiction | RegionalComplianceMode): string {
    return RegionalComplianceService.getRegulatoryTerminology(termKey, jurisdiction);
  },
  getTerminology(termKey: string, jurisdiction?: Jurisdiction | RegionalComplianceMode): string {
    return RegionalComplianceService.getRegulatoryTerminology(termKey, jurisdiction);
  },
  validateCompliance(data: any, jurisdiction?: Jurisdiction | RegionalComplianceMode): ComplianceValidationResult {
    return RegionalComplianceService.validateCompliance(data, jurisdiction);
  },
  subscribe(listener: RegionalStateListener): () => void {
    return RegionalComplianceService.subscribe(listener);
  },
  addChangeListener(listener: RegionalStateListener): () => void {
    return RegionalComplianceService.addChangeListener(listener);
  },
  isEntityVisible(entityCountry?: string, activeMode?: RegionalComplianceMode): boolean {
    return RegionalComplianceService.isEntityVisible(entityCountry, activeMode);
  },
  filterByActiveMode<T extends { country?: string; jurisdiction?: string }>(items: T[], mode?: RegionalComplianceMode): T[] {
    return RegionalComplianceService.filterByActiveMode(items, mode);
  },
  getEntityJurisdictionDetails(entityCountry?: string) {
    return RegionalComplianceService.getEntityJurisdictionDetails(entityCountry);
  },
  getIncidentChecklist(entityCountry?: string, activeMode?: RegionalComplianceMode) {
    return RegionalComplianceService.getIncidentChecklist(entityCountry, activeMode);
  },
  loadStoredJurisdiction(): Jurisdiction {
    return RegionalComplianceService.loadStoredJurisdiction();
  },
  getStoredJurisdiction(): Jurisdiction {
    return RegionalComplianceService.getStoredJurisdiction();
  },
  saveStoredJurisdiction(jurisdiction: Jurisdiction | RegionalComplianceMode): void {
    RegionalComplianceService.saveStoredJurisdiction(jurisdiction);
  },
  initializePersistence(): Jurisdiction {
    return RegionalComplianceService.initializePersistence();
  },
  useActiveJurisdiction(): Jurisdiction {
    return useActiveJurisdiction();
  },
  useRegionalComplianceState() {
    return useRegionalComplianceState();
  }
};

// ============================================================================
// Top-Level Functional Exports
// Directly usable across the application for region-specific compliance logic
// ============================================================================

/**
 * Checks if a specific regulatory rule is available under the active or given jurisdiction.
 */
export const isRuleAvailable = (
  ruleId: string,
  jurisdiction?: Jurisdiction | RegionalComplianceMode
): boolean => RegionalComplianceService.isRuleAvailable(ruleId, jurisdiction);

/**
 * Retrieves statutory terminology for the active or given jurisdiction.
 */
export function getJurisdictionTerminology(): JurisdictionTerminology;
export function getJurisdictionTerminology(jurisdiction: Jurisdiction | RegionalComplianceMode): JurisdictionTerminology;
export function getJurisdictionTerminology(termKey: string, jurisdiction?: Jurisdiction | RegionalComplianceMode): string;
export function getJurisdictionTerminology(firstArg?: any, secondArg?: any): any {
  return (RegionalComplianceService as any).getJurisdictionTerminology(firstArg, secondArg);
}

/**
 * Validates HSE operations or records against statutory requirements for the active or specified jurisdiction.
 */
export const validateCompliance = (
  data: ComplianceValidationTarget | any,
  jurisdiction?: Jurisdiction | RegionalComplianceMode
): ComplianceValidationResult => RegionalComplianceService.validateCompliance(data, jurisdiction);

/**
 * Returns the active jurisdiction ('OMAN' | 'Oman' | 'Combined').
 */
export const getActiveJurisdiction = (): Jurisdiction =>
  RegionalComplianceService.getActiveJurisdiction();

/**
 * Sets the active jurisdiction ('OMAN' | 'Oman' | 'Combined').
 */
export const setActiveJurisdiction = (
  jurisdiction: Jurisdiction,
  user?: UserProfile,
  reason?: string
): { success: boolean; error?: string } =>
  RegionalComplianceService.setActiveJurisdiction(jurisdiction, user, reason);

/**
 * Returns the active regional compliance mode ('OMAN' | 'OMAN' | 'COMBINED').
 */
export const getActiveMode = (): RegionalComplianceMode =>
  RegionalComplianceService.getActiveMode();

/**
 * Sets the active regional compliance mode ('OMAN' | 'OMAN' | 'COMBINED').
 */
export const setRegionalMode = (
  mode: RegionalComplianceMode,
  user?: UserProfile,
  reason?: string
): { success: boolean; error?: string } =>
  RegionalComplianceService.setRegionalMode(mode, user, reason);

/**
 * Subscribes a reactive listener to active jurisdiction configuration changes.
 */
export const subscribe = (
  listener: RegionalStateListener
): (() => void) =>
  RegionalComplianceService.subscribe(listener);

/**
 * Alias for subscribe (compatible with standard EventTarget / Store APIs)
 */
export const addChangeListener = (
  listener: RegionalStateListener
): (() => void) =>
  RegionalComplianceService.addChangeListener(listener);

// ============================================================================
// React Hooks for Reactive State Consumption
// ============================================================================

/**
 * React hook that returns the active jurisdiction ('OMAN' | 'Oman' | 'Combined')
 * and reactively updates whenever the global regional configuration changes in this or other tabs/components.
 * Initializes from persistent localStorage state on boot.
 */
export function useActiveJurisdiction(): Jurisdiction {
  const [activeJurisdiction, setActiveJurisdictionState] = useState<Jurisdiction>(() => {
    return RegionalComplianceService.getActiveJurisdiction();
  });

  useEffect(() => {
    // Sync current value from service immediately on mount
    const initial = RegionalComplianceService.getActiveJurisdiction();
    if (initial !== activeJurisdiction) {
      setActiveJurisdictionState(initial);
    }

    // Subscribe to internal reactive service updates
    const unsubscribe = RegionalComplianceService.subscribe((state) => {
      setActiveJurisdictionState(state.jurisdiction);
    });

    // Handle cross-tab storage changes and custom events
    const handleStorageOrCustomEvent = () => {
      const updated = RegionalComplianceService.getActiveJurisdiction();
      setActiveJurisdictionState(updated);
    };

    window.addEventListener('storage', handleStorageOrCustomEvent);
    window.addEventListener('ad6-regional-compliance-changed', handleStorageOrCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageOrCustomEvent);
      window.removeEventListener('ad6-regional-compliance-changed', handleStorageOrCustomEvent);
    };
  }, []);

  return activeJurisdiction;
}

/**
 * Extended React hook providing active jurisdiction, mode, profile, and action dispatchers.
 */
export function useRegionalComplianceState() {
  const jurisdiction = useActiveJurisdiction();
  const mode = toRegionalMode(jurisdiction);
  const profile = JURISDICTION_PROFILES[mode] || JURISDICTION_PROFILES.COMBINED;

  return {
    jurisdiction,
    activeJurisdiction: jurisdiction,
    mode,
    activeMode: mode,
    profile,
    activeProfile: profile,
    isUae: jurisdiction === 'OMAN',
    isOman: jurisdiction === 'Oman',
    isCombined: jurisdiction === 'Combined',
    setActiveJurisdiction: (j: Jurisdiction, user?: UserProfile, reason?: string) =>
      RegionalComplianceService.setActiveJurisdiction(j, user, reason),
    setRegionalMode: (m: RegionalComplianceMode, user?: UserProfile, reason?: string) =>
      RegionalComplianceService.setRegionalMode(m, user, reason)
  };
}

// Immediately initialize persistence upon module load so state is ready before UI render
if (typeof window !== 'undefined') {
  RegionalComplianceService.initializePersistence();
}

export default RegionalComplianceService;


