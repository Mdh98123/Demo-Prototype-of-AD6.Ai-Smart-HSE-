/**
 * AD6.Ai Smart HSE Platform — Operator Monthly HSE Statistics Fixture
 *
 * Official Operator Return Template per PDO SP-1143 & Oman Ministry of Labour guidelines.
 * Used for byte-for-byte deterministic export verification.
 */

export const OPERATOR_HSE_STATS_FIXTURE_JSON = JSON.stringify({
  reportHeader: {
    operator: 'Petroleum Development Oman (PDO)',
    specification: 'PDO SP-1143 / SP-1170 Monthly HSE Return',
    concessionBlock: 'Block 9 Fahud Interior',
    reportingPeriod: '2026-10',
    jurisdiction: 'Sultanate of Oman (MD 286/2008 & RD 53/2023)'
  },
  safetyLaggingMetrics: {
    fatalities: 0,
    lostTimeInjuries: 0,
    medicalTreatmentCases: 1,
    firstAidCases: 3,
    nearMissReports: 14,
    totalRecordableIncidents: 1,
    lostTimeInjuryFrequencyRate: 0.0,
    totalRecordableIncidentRate: 0.82
  },
  manpowerExposure: {
    totalDirectEmployees: 420,
    totalContractorPersonnel: 1180,
    monthlyExposureHours: 243600,
    cumulativeSafeManHoursWithoutLTI: 4850000
  },
  leadingIndicatorsAndControlOfWork: {
    permitsIssued: 182,
    coldWorkPermits: 110,
    hotWorkPermits: 48,
    confinedSpacePermits: 24,
    ptwSimopsClashesPrevented: 6,
    safetyInspectionsCompleted: 45,
    capasClosedWithinSla: 38,
    twlThermalStopWorkBreaches: 2,
    formGStatutoryNotificationsSubmitted: 1
  },
  complianceCertification: {
    certifiedRole: 'Group HSE Director',
    declaration: 'True and accurate record conforming to Oman Labour Law RD 53/2023 and MD 286/2008.',
    sha256Seal: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
  }
}, null, 2);
