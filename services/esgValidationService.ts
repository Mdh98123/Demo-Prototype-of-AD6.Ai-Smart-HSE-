// Logical Validation Engine for Sultanate of Oman ESG Reporting
// Enforces regulatory requirements from:
// - Oman: MSX ESG Guidance, MSX ESG Guide, SCA Board Governance Rules, Oman Ministry of Labour Omanisation, Beah (Oman) Waste Regulations
// - Oman: MSX ESG Guidelines, CMA Code of Corporate Governance, Ministry of Labour Omanisation, Beah Manifests

import { 
  DetailedEmissionRecord, 
  NationalisationMetrics, 
  InCountryValueMetrics,
  SocialSafetyMetrics, 
  GovernanceMetrics, 
  ESGValidationIssue, 
  ESGFacility,
  WasteManagementRecord,
  WaterEffluentRecord
} from '../types/esg';
import { REGIONAL_EMISSION_FACTORS } from './esgEmissionFactors';

export interface ValidationSummary {
  overallHealthScore: number;       // 0 - 100
  auditReadinessScore: number;      // 0 - 100
  criticalDeficitsCount: number;
  highSeverityCount: number;
  totalIssuesCount: number;
  issues: ESGValidationIssue[];
  status: 'AUDIT_READY' | 'ACTION_REQUIRED' | 'NON_COMPLIANT';
  jurisdictionSummary: {
    omanCompliant: boolean;
  };
}

export function runFullESGValidation(params: {
  emissions: DetailedEmissionRecord[];
  facilities: ESGFacility[];
  omanisation: NationalisationMetrics;
  icvOman: InCountryValueMetrics;
  socialSafety: SocialSafetyMetrics;
  governance: GovernanceMetrics;
  wasteRecords?: WasteManagementRecord[];
  waterRecords?: WaterEffluentRecord[];
}): ValidationSummary {
  const issues: ESGValidationIssue[] = [];

  // =========================================================================
  // 1. EMISSION LOGICAL VALIDATIONS (Scope 1, 2, 3)
  // =========================================================================
  params.emissions.forEach((record) => {
    // Check non-zero & positive activity data
    if (record.activityData <= 0) {
      issues.push({
        id: `VAL-EM-01-${record.id}`,
        severity: 'CRITICAL',
        category: 'MISSING_DATA',
        title: `Zero or Negative Activity Data in ${record.source}`,
        description: `Emission entry ID ${record.id} for facility ${record.facilityName} has an activity value of ${record.activityData} ${record.unit}. Activity data cannot be zero or negative.`,
        affectedMetric: `${record.scope}: ${record.source}`,
        jurisdiction: record.jurisdiction,
        regulatoryStandardRef: 'GHG Protocol Corporate Standard Section 6',
        recommendedAction: 'Verify billing meter readings or fuel consumption logs and re-enter authentic data.',
        owner: 'Site Environmental Engineer',
        timeline: 'Within 24 Hours',
        resolved: false
      });
    }

    // Check Grid Electricity Factor Mismatch (Jurisdiction Consistency)
    if (record.category === 'Grid_Electricity') {
      const facility = params.facilities.find(f => f.id === record.facilityId);
      if (facility) {
        if (facility.jurisdiction === 'OMAN' && record.emissionFactorSource.includes('Nama Oman')) {
          issues.push({
            id: `VAL-EF-MISMATCH-${record.id}`,
            severity: 'HIGH',
            category: 'EMISSION_FACTOR_MISMATCH',
            title: `Incorrect Grid Emission Factor Applied to Oman Facility`,
            description: `Facility ${facility.name} located in ${facility.emirateOrGovernorate} (Oman) is using Oman Nama grid factor (${record.emissionFactor} kgCO2e/kWh) instead of Nama Power (0.395) or Nama Power (0.416).`,
            affectedMetric: 'Scope 2: Grid Electricity',
            jurisdiction: 'OMAN',
            regulatoryStandardRef: 'MSX E1.2 / MSX E1 Grid Factor Specification',
            recommendedAction: 'Recalculate Scope 2 using official Nama Power or Nama Power 2024 grid factor.',
            owner: 'HSE Data Analyst',
            timeline: 'Immediate',
            resolved: false
          });
        }

        if (facility.jurisdiction === 'OMAN' && (record.emissionFactorSource.includes('Nama Power') || record.emissionFactorSource.includes('Nama Power'))) {
          issues.push({
            id: `VAL-EF-MISMATCH-OM-${record.id}`,
            severity: 'HIGH',
            category: 'EMISSION_FACTOR_MISMATCH',
            title: `Incorrect Grid Emission Factor Applied to Oman Facility`,
            description: `Facility ${facility.name} located in ${facility.emirateOrGovernorate} (Oman) is using Oman grid factor instead of Nama Power PWP grid factor (0.468 kgCO2e/kWh).`,
            affectedMetric: 'Scope 2: Grid Electricity',
            jurisdiction: 'OMAN',
            regulatoryStandardRef: 'MSX Oman ESG Metric E1 / Oman Environment Authority',
            recommendedAction: 'Apply Nama PWP 2024 grid factor to reflect Omani power generation mix.',
            owner: 'Oman Environmental Officer',
            timeline: 'Immediate',
            resolved: false
          });
        }
      }
    }

    // Missing Audit Traceability: Utility / Fuel Invoices
    if (!record.manifestOrInvoiceRef || record.manifestOrInvoiceRef.trim() === '') {
      issues.push({
        id: `VAL-AUDIT-REF-${record.id}`,
        severity: 'MODERATE',
        category: 'ASSURANCE_GAP',
        title: `Missing Source Document Reference in ${record.source}`,
        description: `Scope entry for ${record.source} (${record.calculatedCO2eTonnes} tCO2e) has no associated invoice, meter ID, or manifest voucher reference. This prevents limited external assurance (ISAE 3000).`,
        affectedMetric: `${record.scope}: Source Documentation`,
        jurisdiction: record.jurisdiction,
        regulatoryStandardRef: 'ISAE 3000 / AA1000AS Assurance Trail Standard',
        recommendedAction: 'Upload or cross-reference the utility or supplier delivery manifest voucher.',
        owner: 'Sustainability Lead',
        timeline: 'Within 3 Business Days',
        resolved: false
      });
    }

    // High Emission Outlier Detection (>500 tCO2e without verification)
    if (record.calculatedCO2eTonnes > 500 && record.verificationStatus === 'FLAGGED_ANOMALY') {
      issues.push({
        id: `VAL-ANOMALY-${record.id}`,
        severity: 'HIGH',
        category: 'ANOMALY_DETECTION',
        title: `Emission Spike Anomaly in ${record.source}`,
        description: `Unusual emission intensity detected (${record.calculatedCO2eTonnes} tCO2e). Exceeds 2-sigma threshold compared to previous seasonal quarters.`,
        affectedMetric: `${record.scope}: ${record.source}`,
        jurisdiction: record.jurisdiction,
        regulatoryStandardRef: 'GRI 305-1 / 305-2 Data Integrity Verification',
        recommendedAction: 'Perform engineering root-cause review on boiler/furnace efficiency and verify meter calibration.',
        owner: 'Process Operations Lead',
        timeline: 'Within 48 Hours',
        resolved: false
      });
    }
  });

  // =========================================================================
  // 2. SOCIAL & NATIONALISATION LOGICAL VALIDATIONS
  // =========================================================================
  
  // Omanisation Check against Ministry of Labour statutory target
  if (params.omanisation.currentActualPct < params.omanisation.statutoryTargetPct) {
    const deficit = Math.round((params.omanisation.statutoryTargetPct - params.omanisation.currentActualPct) * 10) / 10;
    issues.push({
      id: 'VAL-OMANISATION-DEFICIT',
      severity: 'CRITICAL',
      category: 'REGULATORY_BREACH',
      title: `Omanisation Ratio Deficit (-${deficit}% below Ministry of Labour Quota)`,
      description: `Current Omanisation stands at ${params.omanisation.currentActualPct}% against the statutory requirement of ${params.omanisation.statutoryTargetPct}% for this sector. Organization faces potential visa sanctions and financial levy of approx. ${params.omanisation.deficitPenaltyRiskAmountOMRorOMR.toLocaleString()} OMR.`,
      affectedMetric: 'Social: Omanisation Quota (S3)',
      jurisdiction: 'OMAN',
      regulatoryStandardRef: 'Oman Ministry of Labour Ministerial Decision / MSX S11 Indicator',
      recommendedAction: 'Accelerate national graduate development scheme and prioritize local technical talent recruitment.',
      owner: 'Head of Human Resources (Oman)',
      timeline: 'Immediate (Next 30 Days)',
      resolved: false
    });
  }

  // Omanisation Check against Omanisation / Oman Ministry of Labour Quota
  if (params.omanisation.currentActualPct < params.omanisation.statutoryTargetPct) {
    const deficit = Math.round((params.omanisation.statutoryTargetPct - params.omanisation.currentActualPct) * 10) / 10;
    issues.push({
      id: 'VAL-OMANISATION-DEFICIT',
      severity: 'CRITICAL',
      category: 'REGULATORY_BREACH',
      title: `Omanisation Ratio Below Oman Ministry of Labour Statutory Threshold (-${deficit}%)`,
      description: `Current Omanisation is ${params.omanisation.currentActualPct}% vs statutory target of ${params.omanisation.statutoryTargetPct}%. Oman Ministry of Labour non-compliance penalty risk is estimated at ${params.omanisation.deficitPenaltyRiskAmountOMRorOMR.toLocaleString()} OMR.`,
      affectedMetric: 'Social: Omanisation (MSX S11)',
      jurisdiction: 'OMAN',
      regulatoryStandardRef: 'Oman Ministry of Labour Ministerial Decision on Omanisation Quotas (RD 53/2023)',
      recommendedAction: 'Engage with Ministry of Labour National Employment portal and partner with Sultan Qaboos University for engineering apprenticeships.',
      owner: 'Head of Talent Acquisition (Oman)',
      timeline: 'Immediate',
      resolved: false
    });
  }

  // Wage Protection System (WPS) Compliance Check (Mandatory 100%)
  if (params.socialSafety.wageProtectionSystemCompliancePct < 100) {
    issues.push({
      id: 'VAL-WPS-NONCOMPLIANCE',
      severity: 'CRITICAL',
      category: 'REGULATORY_BREACH',
      title: `Wage Protection System (WPS) Deficit (${params.socialSafety.wageProtectionSystemCompliancePct}%)`,
      description: `WPS salary disbursement is at ${params.socialSafety.wageProtectionSystemCompliancePct}%. Sultanate of Oman labour ministries mandate 100% electronic payroll processing through Central Bank licensed systems.`,
      affectedMetric: 'Social: Fair Labour & Human Rights (GRI 408 / 409)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'Oman Oman Ministry of Labour WPS Ministerial Decree / Oman Central Bank WPS Mandate',
      recommendedAction: 'Reconcile outstanding contractor/subcontractor payroll files and re-submit through banking portal.',
      owner: 'Payroll & Compliance Director',
      timeline: 'Within 24 Hours',
      resolved: false
    });
  }

  // Summer Midday Work Ban Compliance Check (Mandatory 0 Breaches)
  if (params.socialSafety.middaySummerWorkBanBreaches > 0) {
    issues.push({
      id: 'VAL-MIDDAY-WORK-BAN',
      severity: 'CRITICAL',
      category: 'REGULATORY_BREACH',
      title: `Summer Midday Work Ban Violation Logged (${params.socialSafety.middaySummerWorkBanBreaches} Incidents)`,
      description: `Field inspection recorded outdoor work during the mandatory 12:30 PM - 3:00 PM summer rest period (June-September). Violates worker heat stress protection laws.`,
      affectedMetric: 'Social: Occupational Health & Safety (Oman MoL MD 286/2008 / ISO 45001)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'Oman Oman Ministry of Labour Summer Ban Decision / Oman Ministerial Decision No. 286/2008',
      recommendedAction: 'Enforce automatic gate lockout and thermal index alarms on outdoor worksites.',
      owner: 'Site HSE Director',
      timeline: 'Immediate Cessation',
      resolved: false
    });
  }

  // Lost Time Injury Frequency Rate (LTIFR) Threshold Check
  if (params.socialSafety.ltifrRate > 0.5) {
    issues.push({
      id: 'VAL-LTIFR-ELEVATED',
      severity: 'HIGH',
      category: 'REGULATORY_BREACH',
      title: `Elevated LTIFR Rate (${params.socialSafety.ltifrRate} per million man-hours)`,
      description: `LTIFR exceeds industry gold standard benchmark of < 0.25. ${params.socialSafety.lostTimeInjuriesCount} lost-time incidents recorded YTD across operations.`,
      affectedMetric: 'Social: Workforce Safety (MSX S7 / MSX S7 / GRI 403-9)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'PDO SP-1143 / MSX ESG Health & Safety Standards',
      recommendedAction: 'Initiate mandatory Life-Saving Rules re-training and contractor safety stand-down.',
      owner: 'Group VP HSE',
      timeline: 'Within 7 Days',
      resolved: false
    });
  }

  // =========================================================================
  // 3. GOVERNANCE & ASSURANCE LOGICAL VALIDATIONS
  // =========================================================================
  
  // Oman CMA Rule: Minimum 1 Female Director on Listed Boards
  if (params.governance.femaleBoardDirectorsCount < 1) {
    issues.push({
      id: 'VAL-GOV-FEMALE-DIRECTOR',
      severity: 'HIGH',
      category: 'REGULATORY_BREACH',
      title: 'Zero Female Directors on Board of Directors',
      description: 'The Board currently has 0 female directors. Oman Securities and Commodities Authority (SCA) mandates at least one female director on all listed PJSC boards.',
      affectedMetric: 'Governance: Board Diversity (MSX G1 / MSX G1 / SCA Decision 3/RM 2020)',
      jurisdiction: 'OMAN',
      regulatoryStandardRef: 'Oman CMA Governance Code Article 9 Clause 3',
      recommendedAction: 'Engage nomination committee to shortlist qualified female non-executive director candidates for AGM approval.',
      owner: 'Board Nomination Committee Chair',
      timeline: 'Prior to Annual General Meeting',
      resolved: false
    });
  }

  // Board Independence Ratio Check (Minimum 33%)
  if (params.governance.independentDirectorsPct < 33.3) {
    issues.push({
      id: 'VAL-GOV-INDEPENDENCE',
      severity: 'MODERATE',
      category: 'REGULATORY_BREACH',
      title: `Low Board Independence Ratio (${params.governance.independentDirectorsPct}%)`,
      description: 'Independent non-executive directors represent less than one-third of total board seats. GCC corporate governance codes recommend at least 33-50% independence.',
      affectedMetric: 'Governance: Board Independence (MSX G2 / MSX G2)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'Oman CMA Code of Corporate Governance / Oman CMA Corporate Governance Code',
      recommendedAction: 'Rebalance board composition with independent sector experts.',
      owner: 'Corporate Secretary',
      timeline: 'Next Board Election Cycle',
      resolved: false
    });
  }

  // Assurance Gap: Unaudited Status
  if (params.governance.assuranceLevel === 'UNAUDITED') {
    issues.push({
      id: 'VAL-GOV-ASSURANCE-GAP',
      severity: 'MODERATE',
      category: 'ASSURANCE_GAP',
      title: 'ESG Data Pack Has Not Undergone Third-Party Assurance',
      description: 'Current disclosures are self-declared. MSX and MSX guidance recommend independent third-party limited assurance (ISAE 3000) for Tier-1 corporate disclosures.',
      affectedMetric: 'Governance: External Assurance (MSX G8 / MSX G8)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'ISAE 3000 (Revised) Assurance Engagements on Non-Financial Info',
      recommendedAction: 'Engage accredited assurance auditor to execute sampling and verification testing.',
      owner: 'Head of Internal Audit & Compliance',
      timeline: 'Within 45 Days',
      resolved: false
    });
  }

  // Executive Compensation Linked to ESG Check
  if (params.governance.executivePayLinkedToEsgPct <= 0) {
    issues.push({
      id: 'VAL-GOV-EXEC-INCENTIVE',
      severity: 'LOW',
      category: 'ASSURANCE_GAP',
      title: 'No Executive Compensation Tied to Sustainability / Net Zero KPIs',
      description: 'Variable remuneration for C-suite does not include measurable ESG, carbon reduction, or safety performance targets.',
      affectedMetric: 'Governance: Incentivized Pay (MSX G3 / MSX G3 / MSX G3)',
      jurisdiction: 'GCC',
      regulatoryStandardRef: 'GRI 2-19 / MSX Governance Guidance Indicator G3',
      recommendedAction: 'Formulate 15-20% ESG scorecard weighting in annual executive performance bonus pool.',
      owner: 'Board Remuneration Committee',
      timeline: 'Next Compensation Review',
      resolved: false
    });
  }

  // Calculate Scores
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const modCount = issues.filter(i => i.severity === 'MODERATE').length;
  const lowCount = issues.filter(i => i.severity === 'LOW').length;

  // Health Score computation
  let healthScore = 100 - (criticalCount * 25) - (highCount * 12) - (modCount * 5) - (lowCount * 2);
  healthScore = Math.max(10, Math.min(100, healthScore));

  // Audit Readiness computation (takes into account documentation, assurance level, and verified records)
  let auditReadiness = healthScore;
  if (params.governance.assuranceLevel === 'LIMITED_ASSURANCE_ISAE3000') {
    auditReadiness += 5;
  } else if (params.governance.assuranceLevel === 'UNAUDITED') {
    auditReadiness -= 15;
  }
  auditReadiness = Math.max(15, Math.min(100, auditReadiness));

  const uaeIssues = issues.filter(i => i.jurisdiction === 'OMAN' && (i.severity === 'CRITICAL' || i.severity === 'HIGH'));
  const omanIssues = issues.filter(i => i.jurisdiction === 'OMAN' && (i.severity === 'CRITICAL' || i.severity === 'HIGH'));

  return {
    overallHealthScore: Math.round(healthScore),
    auditReadinessScore: Math.round(auditReadiness),
    criticalDeficitsCount: criticalCount,
    highSeverityCount: highCount,
    totalIssuesCount: issues.length,
    issues,
    status: criticalCount > 0 ? 'NON_COMPLIANT' : highCount > 0 ? 'ACTION_REQUIRED' : 'AUDIT_READY',
    jurisdictionSummary: {
      omanCompliant: omanIssues.length === 0
    }
  };
}
