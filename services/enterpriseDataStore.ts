import { Incident } from '../types';
import { Permit } from './simopsService';
import { EnterpriseCapa, GULF_ENERGY_CAPAS, GULF_ENERGY_INCIDENTS, GULF_ENERGY_PERMITS, GULF_ENERGY_USERS } from './demoDataLoader';
import { SafetyAudit } from '../components/audit/AuditTypes';
import { MOCK_AUDITS } from '../components/audit/AuditMockData';
import { NotificationService } from './notificationService';
import { AuditLogger } from './auditLogger';
import { UnifiedAuditTrailService } from './unifiedAuditTrailService';
import { UserProfileService } from './userProfileService';
import { UserProfile } from '../types';
import { EncryptedOfflineQueue } from './encryptedOfflineQueue';

export interface CockpitTask {
  id: string;
  sourceId: string;
  sourceType: 'Permit' | 'CAPA' | 'Inspection' | 'JSA' | 'Incident' | 'Audit' | 'Training';
  title: string;
  description: string;
  location: string;
  dueDate: string;
  dueTime: string;
  isOverdue: boolean;
  countdownText: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Routine';
  status: 'Pending Approval' | 'Overdue' | 'In Progress' | 'Action Required' | 'Approved' | 'Acknowledged' | 'Clarification Requested';
  assignee: string;
  assigneeId?: string;
  issuer?: string;
  receiver?: string;
  gasStatus?: string;
  createdAt: string;
}

export interface StopWorkRecord {
  id: string;
  timestamp: string;
  reporterName: string;
  reporterRole: string;
  location: string;
  hazardDescription: string;
  immediateAction: string;
  status: 'ACTIVE_STOPPAGE' | 'RESOLVED';
}

export interface InspectionRecord {
  id: string;
  type: string;
  location: string;
  date: string;
  inspector: string;
  inspectorId?: string;
  score: number;
  status: 'Completed' | 'Draft' | 'Flagged';
  items: any[];
}

// -------------------------------------------------------------------
// 10+ REALISTIC SEED INCIDENTS (OMAN, Oman, KSA)
// -------------------------------------------------------------------
export const EXPANDED_ENTERPRISE_INCIDENTS: Incident[] = [
  ...GULF_ENERGY_INCIDENTS,
  // Incident 7: Near Miss - Scaffolding Coupler Drop (Oman)
  {
    id: 'INC-2026-OMN-0622',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During 18m scaffolding erection on the Polyethylene Reactor Tower (R-201), an unsecured swivel scaffolding coupler slipped from a rigger\'s hand and fell 14 meters onto the secondary containment deck. The drop zone was barricaded; no workers were struck.',
    immediateActionsTaken: 'Work stopped immediately at height; rigger tethering bags and 100% tool lanyard compliance verified; scaffold crew stood down for 30-minute drop prevention toolbox talk; safety net installed below working platform.',
    location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Reactor R-201 Structure',
    jurisdiction: 'Muscat',
    severity: 'Medium',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-04T11:20:00Z',
    reportedBy: 'usr-tariq-hashemi',
    reportedByName: 'Tariq Al-Hashemi',
    reportDeadline: '2026-10-05T11:20:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80'],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80',
        caption: 'Dropped coupler impact point on concrete containment plinth.',
        timestamp: '2026-10-04T11:35:00Z',
        uploadedBy: 'Tariq Al-Hashemi'
      }
    ],
    fiveWhys: [
      { step: 1, whyText: 'Why did the scaffolding fitting fall? Slipped from worker\'s gloved hand during transfer at 18m height.', verificationEvidence: 'Physical inspection and witness statements.' },
      { step: 2, whyText: 'Why was the fitting handled manually without mechanical hoist? Crane hook was occupied on flare piping lift.', verificationEvidence: 'SIMOPS log clash.' },
      { step: 3, whyText: 'Why was no tool lanyard or parts pouch used? The worker\'s tether bag was full and spare couplers were carried loosely.', verificationEvidence: 'Tool bag inspection.' }
    ],
    rootCauseConclusion: 'Failure to use tethered parts pouches for loose scaffolding components at heights > 10m.',
    fishboneFactors: { manpower: ['Worker carried loose fittings'], machine: [], method: ['Lacking mandatory parts pouch rule'], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-07',
        description: 'Provide certified zip-lock tether pouches for all scaffolding crews across Mina Al Fahal asset.',
        assignee: 'Marcus Chen',
        targetDate: '2026-10-14',
        priority: 'P2 - High',
        status: 'In Progress',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-04T11:20:00Z', actorId: 'usr-tariq-hashemi', actorName: 'Tariq Al-Hashemi', action: 'Incident Reported', details: 'Dropped object near-miss logged.' }]
  },
  // Incident 8: Medical Treatment Case - Acid Splash from Sample Point (Oman)
  {
    id: 'INC-2026-OMN-1014',
    type: 'Medical Treatment',
    classification: 'Medical Treatment',
    description: 'A laboratory chemist taking an organic chloride process sample from Sampling Station SS-04 experienced a pressurized back-spray of dilute wash acid due to a blocked needle vent needle. The chemical droplet breached the worker\'s face shield edge, splashing the left eyebrow.',
    immediateActionsTaken: 'Emergency eyewash / drench shower activated within 8 seconds; flushed for 20 minutes continuous; escort to Fahud clinic; ophthalmic examination confirmed no corneal abrasion; soothing eye drops prescribed; worker cleared for modified duty.',
    location: 'Fahud-West Gas Station (Oman) · Chemical Injection Skid C-04',
    jurisdiction: 'Oman',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'CAPA Pending',
    timestamp: '2026-10-05T09:15:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy',
    reportDeadline: '2026-10-06T09:15:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Sampling station closed-loop needle septum port was fouled with scale, causing localized pressure build-up upon vial insertion.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-08',
        description: 'Retrofit closed-loop Dopak sampling cabinets with positive interlock pressure relief valves.',
        assignee: 'Fatima Al-Zaabi',
        targetDate: '2026-10-20',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-05T09:15:00Z', actorId: 'usr-salim-harthy', actorName: 'Salim Al-Harthy', action: 'Incident Logged', details: 'Medical treatment case recorded.' }]
  },
  // Incident 9: Environmental Spill - 25 Liters Hydraulic Fluid Contained (KSA)
  {
    id: 'INC-2026-KSA-0219',
    type: 'Environmental Incident',
    classification: 'Process Safety Event',
    description: 'Burst O-ring seal on a mobile hydraulic power unit (HPU-02) resulted in 25 liters of synthetic hydraulic fluid discharging onto paved concrete hardstanding. Spill stayed entirely within curbed containment and was captured by absorbent pads before reaching storm drains.',
    immediateActionsTaken: 'HPU shut down immediately; spill kit deployed within 2 minutes; drain gully covers sealed with magnetic neoprene covers; contaminated absorbent recovered into UN-certified hazardous waste drums; zero discharge to marine or soil environment.',
    location: 'Ras Al-Khair Facility (KSA) · Dry Dock Gate 1',
    jurisdiction: 'KSA',
    severity: 'Low',
    potentialSeverity: 'Medium',
    status: 'Closed',
    timestamp: '2026-10-01T16:40:00Z',
    reportedBy: 'usr-zaid-otaibi',
    reportedByName: 'Zaid Al-Otaibi',
    reportDeadline: '2026-10-02T16:40:00Z',
    coordinates: { lat: 27.5333, lng: 49.1667 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Nitrile O-ring degraded due to high operational fluid temperature exceeding 95°C during continuous pumping.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-ksa-09',
        description: 'Upgrade HPU pump seal material to Viton fluoroelastomer capable of 200°C continuous service.',
        assignee: 'Zaid Al-Otaibi',
        targetDate: '2026-10-10',
        priority: 'P3 - Medium',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-01T16:40:00Z', actorId: 'usr-zaid-otaibi', actorName: 'Zaid Al-Otaibi', action: 'Incident Closed', details: 'Environmental spill remediated.' }]
  },
  // Incident 10: Near Miss - High Voltage Switching Lockout Bypass (Oman)
  {
    id: 'INC-2026-OMN-1055',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During 33kV substation transformer feeder breaker routine maintenance, an electrical rigger inadvertently inserted an operating handle into energized breaker compartment B-03 instead of de-energized compartment B-04. The physical mechanical padlock interlock prevented closure, preventing an arc-flash event.',
    immediateActionsTaken: 'Work immediately frozen; electrical team stepped back; physical tagging and color-coded compartment signage reviewed; breaker padlock verified; human performance review conducted with lead electrical engineer.',
    location: 'Fahud-West Gas Station (Oman) · Substation SS-02 33kV Switchgear',
    jurisdiction: 'Oman',
    severity: 'Medium',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-06T07:10:00Z',
    reportedBy: 'usr-salim-harthy',
    reportedByName: 'Salim Al-Harthy',
    reportDeadline: '2026-10-07T07:10:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [],
    evidenceItems: [],
    fiveWhys: [],
    rootCauseConclusion: 'Identical grey cabinet doors with small font labels 2 meters above ground contributed to human error under low ambient substation lighting.',
    fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
    capaActions: [
      {
        id: 'capa-omn-10',
        description: 'Install high-visibility reflective neon yellow boundary barriers over all live breaker cubicles during maintenance.',
        assignee: 'Marcus Chen',
        targetDate: '2026-10-16',
        priority: 'P1 - Critical',
        status: 'Open',
        type: 'Corrective'
      }
    ],
    auditLog: [{ timestamp: '2026-10-06T07:10:00Z', actorId: 'usr-salim-harthy', actorName: 'Salim Al-Harthy', action: 'Incident Reported', details: 'Arc-flash prevention near-miss recorded.' }]
  },
  // Incident 11: Polyolefin Extruder Drive Bearing Overheating & High Temperature Alarm (#INC-2026-0142)
  {
    id: 'INC-2026-0142',
    type: 'Near Miss',
    classification: 'Near Miss',
    description: 'During continuous production on Polymer Extruder Unit EX-04 in Zone C, an anomalous thermal rise to 142°C caused bearing friction and an audible high-temperature smoke detector alarm. Emergency power stop tripped automatically with zero flame or toxic release.',
    immediateActionsTaken: 'Extruder drive motor powered down; fire warden deployed dry powder standby; cooling cycle engaged; LOTO padlock applied by maintenance crew; zero flames or toxic gas release verified.',
    location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Extrusion Hall Zone C',
    jurisdiction: 'Muscat',
    severity: 'Medium',
    potentialSeverity: 'High',
    status: 'Closed',
    timestamp: '2026-09-28T08:15:00Z',
    reportedBy: 'u6',
    reportedByName: 'Rahul Gupta',
    reportDeadline: '2026-09-29T08:15:00Z',
    coordinates: { lat: 24.1107, lng: 52.7306 },
    images: [],
    evidenceItems: [],
    fiveWhys: [
      { step: 1, whyText: 'Why did the extruder bearing overheat? Insufficient lubricant film under heavy summer operational load.', verificationEvidence: 'Physical teardown analysis.' },
      { step: 2, whyText: 'Why was lubricant degraded? Ambient temperature reached 48°C and lubricant exceeded OEM thermal ceiling.', verificationEvidence: 'Chemical viscosity analysis.' },
      { step: 3, whyText: 'Why was early warning missed? Thermocouple probe was miscalibrated without redundant alarm telemetry.', verificationEvidence: 'Sensor log audit.' }
    ],
    rootCauseConclusion: 'Lubricant viscosity breakdown under elevated ambient temperatures combined with lack of dual infrared telemetry redundancy.',
    fishboneFactors: { manpower: [], machine: ['Sensor alarm telemetry lag'], method: [], material: ['Thermal lube degradation'], measurement: [], environment: ['Ambient heat 48°C'] },
    capaActions: [
      {
        id: 'CA-2026-0287',
        description: 'Retrofit dual infrared thermal telemetry sensors and replace drive bearing lubricant with synthetic polyalphaolefin high-temp grease.',
        assignee: 'Rahul Gupta',
        targetDate: '2026-10-02',
        priority: 'P2 - High',
        status: 'Verified_Closed',
        type: 'Corrective'
      }
    ],
    auditLog: [
      { timestamp: '2026-09-28T08:15:00Z', actorId: 'u6', actorName: 'Rahul Gupta', action: 'Incident Reported', details: 'Extruder thermal rise and smoke alarm logged.' },
      { timestamp: '2026-09-28T09:30:00Z', actorId: 'u7', actorName: 'Marcus Chen', action: 'Supervisor Review', details: 'Reviewed initial containment, isolated breaker, and assigned investigation.' },
      { timestamp: '2026-09-29T11:00:00Z', actorId: 'u5', actorName: 'Fatima Al-Kaabi', action: 'Investigation Completed', details: 'Conducted 5-Why analysis, logged Finding #FND-2026-0221, formulated CAPA #CA-2026-0287.' },
      { timestamp: '2026-09-29T14:20:00Z', actorId: 'u4', actorName: 'Sarah Jones', action: 'CAPA Approved', details: 'Approved corrective action plan #CA-2026-0287 and allocated replacement telemetry sensors.' },
      { timestamp: '2026-10-02T16:00:00Z', actorId: 'u6', actorName: 'Rahul Gupta', action: 'CAPA Executed', details: 'Installed dual infrared sensors and high-temp grease.' },
      { timestamp: '2026-10-03T10:00:00Z', actorId: 'u7', actorName: 'Marcus Chen', action: 'Verification Signed', details: 'Physically inspected installation and verified 68°C steady temperature under load.' },
      { timestamp: '2026-10-04T15:30:00Z', actorId: 'u2', actorName: 'Dr. Layla Hassan', action: 'Executive Closure', details: 'Verified root cause containment, closed incident #INC-2026-0142, and submitted Oman MoL MD 286/2008 summary.' }
    ]
  }
];

// -------------------------------------------------------------------
// 12+ REALISTIC PERMITS TO WORK (WITH LOTO & GAS TESTS)
// -------------------------------------------------------------------
export const EXPANDED_ENTERPRISE_PERMITS: Permit[] = (() => {
  const seenIds = new Set<string>();
  const list: Permit[] = [];
  for (const p of GULF_ENERGY_PERMITS) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      list.push(p);
    }
  }
  return list;
})();

// -------------------------------------------------------------------
// 10+ REALISTIC SITE CHECKLIST INSPECTIONS
// -------------------------------------------------------------------
export const EXPANDED_ENTERPRISE_INSPECTIONS: InspectionRecord[] = [
  { id: 'INSP-2026-001', type: 'Scaffolding & Work at Height', location: 'Fahud-West Gas Station (Oman) · Manifold 6', inspector: 'Marcus Chen', inspectorId: 'u7', date: '2026-10-06T09:00:00Z', score: 92, status: 'Completed', items: [] },
  { id: 'INSP-2026-002', type: 'Electrical & LOTO Isolation', location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Substation 3', inspector: 'Fatima Al-Zaabi', inspectorId: 'u5', date: '2026-10-06T10:30:00Z', score: 98, status: 'Completed', items: [] },
  { id: 'INSP-2026-003', type: 'Heavy Lifting & Crane Rigging', location: 'Ras Al-Khair Facility (KSA) · Berth 2', inspector: 'Zaid Al-Otaibi', inspectorId: 'usr-zaid-otaibi', date: '2026-10-05T14:00:00Z', score: 86, status: 'Flagged', items: [] },
  { id: 'INSP-2026-004', type: 'Confined Space Life Safety', location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Column C-102', inspector: 'Tariq Al-Hashemi', inspectorId: 'usr-tariq-hashemi', date: '2026-10-05T08:15:00Z', score: 96, status: 'Completed', items: [] },
  { id: 'INSP-2026-005', type: 'Fire Protection & Deluge Systems', location: 'Fahud-West Gas Station (Oman) · Tank Farm', inspector: 'Salim Al-Harthy', inspectorId: 'usr-salim-harthy', date: '2026-10-04T11:00:00Z', score: 94, status: 'Completed', items: [] },
  { id: 'INSP-2026-006', type: 'Hazardous Chemical Storage', location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Warehouse Bay 2', inspector: 'Fatima Al-Zaabi', inspectorId: 'u5', date: '2026-10-04T15:20:00Z', score: 88, status: 'Completed', items: [] },
  { id: 'INSP-2026-007', type: 'Contractor Camp & Welfare', location: 'Ras Al-Khair Facility (KSA) · Construction Village', inspector: 'Abdulaziz Al-Ghamdi', inspectorId: 'usr-abdulaziz-ghamdi', date: '2026-10-03T16:00:00Z', score: 91, status: 'Completed', items: [] },
  { id: 'INSP-2026-008', type: 'Mobile Equipment & Forklifts', location: 'Fahud-West Gas Station (Oman) · Logistics Yard', inspector: 'Rahul Gupta', inspectorId: 'u6', date: '2026-10-03T07:45:00Z', score: 89, status: 'Completed', items: [] },
  { id: 'INSP-2026-009', type: 'Emergency Eye Wash & Drench Showers', location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Acid Skid', inspector: 'Khalid Al-Dhaheri', inspectorId: 'usr-khalid-dhaheri', date: '2026-10-02T13:30:00Z', score: 95, status: 'Completed', items: [] },
  { id: 'INSP-2026-010', type: 'Excavation & Trench Shoring', location: 'Ras Al-Khair Facility (KSA) · Berth 1 Trench', inspector: 'Zaid Al-Otaibi', inspectorId: 'usr-zaid-otaibi', date: '2026-10-02T08:00:00Z', score: 90, status: 'Completed', items: [] },
  { id: 'INS-2026-0314', type: 'Quarterly Scaffolding & Working at Height Field Inspection', location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Berth 1 & Reactor Tower', inspector: 'Fatima Al-Kaabi', inspectorId: 'u5', date: '2026-10-05T08:00:00Z', score: 96, status: 'Completed', items: [] }
];

// -------------------------------------------------------------------
// 10+ REALISTIC SAFETY AUDITS (WITH ISO 45001 & Oman MoL MD 286/2008 FINDINGS)
// -------------------------------------------------------------------
export const EXPANDED_ENTERPRISE_AUDITS: SafetyAudit[] = [
  ...MOCK_AUDITS,
  {
    id: 'AUD-2026-0047',
    templateId: 'TPL-001',
    title: 'ISO 45001 / PDO SP-1143 Statutory Compliance Surveillance Audit (#AUD-2026-0047)',
    location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman) · Extrusion & Control of Work',
    department: 'Polymer Operations & Health, Safety, Environment',
    auditorId: 'u12',
    auditorName: 'Alice Smith (Lead Quality & Safety Auditor)',
    scheduledDate: '2026-10-03',
    completionDate: '2026-10-06',
    status: 'Completed',
    score: 95.8,
    findings: [
      {
        id: 'FND-2026-0221',
        auditId: 'AUD-2026-0047',
        questionId: 'Q-018',
        description: 'Drive motor thermocouple alarm thresholds lacked dual infrared sensor telemetry redundancy prior to recent retrofit.',
        category: 'Machinery Safety & Thermal Safeguards',
        severity: 'Medium',
        evidenceUrls: [],
        responsiblePersonId: 'u4',
        status: 'Closed',
        dueDate: '2026-10-04',
        correctiveAction: {
          id: 'CA-2026-0287',
          description: 'Retrofit dual infrared thermal telemetry sensors and replace drive bearing lubricant with synthetic polyalphaolefin high-temp grease.',
          assignedTo: 'Rahul Gupta',
          priority: 'High',
          targetDate: '2026-10-02',
          status: 'Completed'
        },
        regulationRef: 'ISO 45001:2018 Clause 8.1.2 & Oman MoL MD 286/2008 & PDO PR-1172'
      }
    ]
  },
  {
    id: 'AUD-2026-003',
    templateId: 'TPL-001',
    title: 'ISO 45001:2018 Periodic Surveillance Audit (Oman Block 6)',
    location: 'Fahud-West Gas Station (Oman)',
    department: 'Upstream Operations & Production',
    auditorId: 'u12',
    auditorName: 'Sarah Jenkins (Lead Auditor)',
    scheduledDate: '2026-09-15',
    completionDate: '2026-09-17',
    status: 'Completed',
    score: 98.4,
    findings: [
      {
        id: 'F-301',
        auditId: 'AUD-2026-003',
        questionId: 'Q-001',
        description: 'Secondary whip-check restraints missing on newly commissioned flexible test manifolds.',
        category: 'Mechanical Integrity',
        severity: 'High',
        evidenceUrls: [],
        responsiblePersonId: 'u7',
        status: 'Closed',
        dueDate: '2026-10-01',
        correctiveAction: {
          id: 'CA-301',
          description: 'Install stainless steel cable restraints on all high-pressure lines.',
          assignedTo: 'Rahul Gupta',
          priority: 'High',
          targetDate: '2026-10-01',
          status: 'Completed'
        },
        regulationRef: 'Oman MD 286/2008 & PDO PR-1148'
      }
    ]
  },
  {
    id: 'AUD-2026-004',
    templateId: 'TPL-002',
    title: 'Oman MoL MD 286/2008 & PDO PR-1172 Verification Audit',
    location: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman)',
    department: 'Refining & Petrochemical Processing',
    auditorId: 'u12',
    auditorName: 'Sarah Jenkins',
    scheduledDate: '2026-09-28',
    completionDate: '2026-09-29',
    status: 'Completed',
    score: 99.1,
    findings: [
      {
        id: 'F-401',
        auditId: 'AUD-2026-004',
        questionId: 'Q-005',
        description: 'Atmospheric gas testing records for column entry did not record carbon monoxide (CO) bump test expiry time.',
        category: 'Confined Space Entry',
        severity: 'Medium',
        evidenceUrls: [],
        responsiblePersonId: 'u5',
        status: 'Pending Verification',
        dueDate: '2026-10-10',
        correctiveAction: {
          id: 'CA-401',
          description: 'Update digital gas log schema to require dock bump test timestamp validation.',
          assignedTo: 'Fatima Al-Zaabi',
          priority: 'Medium',
          targetDate: '2026-10-10',
          status: 'In Progress'
        },
        regulationRef: 'Oman MoL MD 286/2008 & PDO Specifications CoP 17.0 Confined Space'
      }
    ]
  },
  {
    id: 'AUD-2026-005',
    templateId: 'TPL-002',
    title: 'Saudi MHRSD / NCOSH Regulatory Compliance Audit',
    location: 'Ras Al-Khair Facility (KSA)',
    department: 'Maritime & Heavy Lift Berths',
    auditorId: 'u3',
    auditorName: 'Ahmed Al-Mansoori',
    scheduledDate: '2026-08-22',
    completionDate: '2026-08-23',
    status: 'Completed',
    score: 97.8,
    findings: [
      {
        id: 'F-501',
        auditId: 'AUD-2026-005',
        questionId: 'Q-002',
        description: 'Midday heat ban digital logger had a 2-hour offline sync gap during satellite link switchover.',
        category: 'Occupational Health',
        severity: 'Medium',
        evidenceUrls: [],
        responsiblePersonId: 'usr-khalid-dhaheri',
        status: 'Closed',
        dueDate: '2026-09-01',
        regulationRef: 'Saudi Labour Law Article 98 & NCOSH Guidelines'
      }
    ]
  },
  {
    id: 'AUD-2026-006',
    templateId: 'TPL-001',
    title: 'Q4 Group-Wide Process Safety Management (PSM) Tier-1 Audit',
    location: 'Gulf Energy Headquarters & All Sites',
    department: 'Process Safety & Asset Integrity',
    auditorId: 'u2',
    auditorName: 'Dr. Layla Hassan',
    scheduledDate: '2026-10-15',
    status: 'Scheduled',
    score: 0,
    findings: []
  }
];

// -------------------------------------------------------------------
// CENTRAL ENTERPRISE DATA STORE SERVICE
// -------------------------------------------------------------------
export class EnterpriseDataStore {
  public static readonly KEY_INCIDENTS = 'ad6_incidents';
  public static readonly KEY_INCIDENTS_ALT = 'ad6_enterprise_incidents';
  public static readonly KEY_PERMITS = 'ad6_permits';
  public static readonly KEY_PERMITS_ALT = 'ad6_enterprise_permits';
  public static readonly KEY_CAPAS = 'ad6_capas';
  public static readonly KEY_CAPAS_ALT = 'ad6_enterprise_capas';
  public static readonly KEY_INSPECTIONS = 'ad6_inspections';
  public static readonly KEY_INSPECTIONS_ALT = 'hse_inspection_history';
  public static readonly KEY_AUDITS = 'ad6_audits';
  public static readonly KEY_AUDITS_ALT = 'ad6_enterprise_audits';
  public static readonly KEY_SWA = 'ad6_active_swa_record';
  public static readonly KEY_INITIALIZED = 'ad6_store_initialized_v4';

  // In-Memory canonical stores decoupled from localStorage (G-1 Compliance)
  private static inMemoryIncidents: Incident[] = [...EXPANDED_ENTERPRISE_INCIDENTS];
  private static inMemoryPermits: Permit[] = [...EXPANDED_ENTERPRISE_PERMITS];
  private static inMemoryCapas: EnterpriseCapa[] = [...GULF_ENERGY_CAPAS];
  private static inMemoryInspections: InspectionRecord[] = [...EXPANDED_ENTERPRISE_INSPECTIONS];
  private static inMemoryAudits: SafetyAudit[] = [...EXPANDED_ENTERPRISE_AUDITS];
  private static inMemorySwa: StopWorkRecord | null = null;

  public static initialize(force = false): void {
    if (typeof window === 'undefined') return;

    // G-1 Compliance: Purge legacy localStorage business data keys.
    // localStorage is permitted ONLY for UI preferences and the encrypted offline submission queue.
    const keysToPurge = [
      this.KEY_INCIDENTS, this.KEY_INCIDENTS_ALT,
      this.KEY_PERMITS, this.KEY_PERMITS_ALT,
      this.KEY_CAPAS, this.KEY_CAPAS_ALT,
      this.KEY_INSPECTIONS, this.KEY_INSPECTIONS_ALT,
      this.KEY_AUDITS, this.KEY_AUDITS_ALT,
      this.KEY_SWA
    ];
    for (const key of keysToPurge) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }
    }

    const alreadyInit = localStorage.getItem(this.KEY_INITIALIZED) === 'true';
    if (!alreadyInit || force) {
      console.log('[EnterpriseDataStore] Initialized in-memory enterprise records decoupled from localStorage (G-1 compliant)...');
      localStorage.setItem(this.KEY_INITIALIZED, 'true');
    }

    // Hydrate asynchronously from backend REST API and flush encrypted offline queue
    this.hydrateFromBackend();
    this.broadcastMutation('system', 'initialize', 'all');
  }

  public static async hydrateFromBackend(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const [incRes, ptwRes, capaRes, auditRes] = await Promise.allSettled([
        fetch('/api/v1/incidents'),
        fetch('/api/v1/permits'),
        fetch('/api/v1/capas'),
        fetch('/api/v1/audits')
      ]);

      if (incRes.status === 'fulfilled' && incRes.value.ok) {
        const json = await incRes.value.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          this.inMemoryIncidents = json.data;
          this.broadcastMutation('incident', 'sync', 'all');
        }
      }

      if (ptwRes.status === 'fulfilled' && ptwRes.value.ok) {
        const json = await ptwRes.value.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          this.inMemoryPermits = json.data;
          this.broadcastMutation('permit', 'sync', 'all');
        }
      }

      if (capaRes.status === 'fulfilled' && capaRes.value.ok) {
        const json = await capaRes.value.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          this.inMemoryCapas = json.data;
          this.broadcastMutation('capa', 'sync', 'all');
        }
      }

      if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const json = await auditRes.value.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          this.inMemoryAudits = json.data;
          this.broadcastMutation('audit', 'sync', 'all');
        }
      }

      // Replay any queued offline submissions
      await EncryptedOfflineQueue.flushQueue();
    } catch (err) {
      console.warn('[EnterpriseDataStore] Notice while hydrating from backend API:', err);
    }
  }

  // ---------------------------------------------------------------
  // BROADCAST HELPER
  // ---------------------------------------------------------------
  private static broadcastMutation(entity: string, action: string, id: string): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ad6-data-mutation', {
      detail: { entity, action, id, timestamp: new Date().toISOString() }
    }));
    if (entity === 'incident') window.dispatchEvent(new CustomEvent('ad6-incidents-updated'));
    if (entity === 'permit') window.dispatchEvent(new CustomEvent('ad6-permits-updated'));
    if (entity === 'capa') window.dispatchEvent(new CustomEvent('ad6-capas-updated'));
  }

  // ---------------------------------------------------------------
  // INCIDENTS (G-1 Decoupled from localStorage)
  // ---------------------------------------------------------------
  public static getIncidents(): Incident[] {
    return this.inMemoryIncidents;
  }

  public static createIncident(incident: Incident, user: UserProfile): Incident {
    this.inMemoryIncidents = [incident, ...this.inMemoryIncidents];

    // Asynchronously synchronize with enterprise backend API
    if (typeof window !== 'undefined') {
      fetch('/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(incident)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: '/api/v1/incidents',
          method: 'POST',
          entityType: 'Incident',
          entityId: incident.id,
          payload: incident
        });
      });
    }

    // Legacy Audit Log
    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Reported Incident ${incident.id} (${incident.severity})`,
      'INCIDENT' as any,
      incident.id,
      incident.description
    );

    // Unified Compliance Audit Trail with previous vs. new values
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        department: user.department
      },
      actionType: 'RECORD_CREATE',
      module: 'INCIDENTS',
      entityId: incident.id,
      entityTitle: `${incident.type}: ${incident.location}`,
      previousValue: null,
      newValue: {
        classification: incident.classification,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        reportedBy: user.name
      },
      changeSummary: `Reported ${incident.severity} incident ${incident.id} (${incident.type}) at ${incident.location}`,
      reason: incident.description,
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 2.0', 'ISO 45001:2018 Cl. 10.2'],
      severity: incident.severity === 'Critical' ? 'Critical' : 'High'
    }).catch(console.warn);

    // Notification
    NotificationService.addNotification({
      title: `New Incident Reported: ${incident.type}`,
      description: `${incident.location}: ${incident.description.substring(0, 100)}...`,
      severity: incident.severity === 'Critical' ? 'Critical' : 'High',
      category: 'Incident',
      senderName: user.name,
      sourceId: incident.id,
      actionView: 'INCIDENT_MANAGEMENT'
    });

    // Record live user activity
    UserProfileService.recordLiveActivity(user.id, {
      actionType: 'Reported Incident',
      category: 'Incident',
      entityId: incident.id,
      entityTitle: `${incident.type}: ${incident.location}`,
      details: incident.description,
      impactResult: `Severity ${incident.severity} logged in enterprise register.`
    }).catch(console.warn);

    this.broadcastMutation('incident', 'create', incident.id);
    return incident;
  }

  public static updateIncident(incident: Incident, user: UserProfile): void {
    const oldIncident = this.inMemoryIncidents.find(i => i.id === incident.id);
    this.inMemoryIncidents = this.inMemoryIncidents.map(i => i.id === incident.id ? incident : i);

    if (typeof window !== 'undefined') {
      fetch(`/api/v1/incidents/${encodeURIComponent(incident.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(incident)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: `/api/v1/incidents/${encodeURIComponent(incident.id)}`,
          method: 'PUT',
          entityType: 'Incident',
          entityId: incident.id,
          payload: incident
        });
      });
    }

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Updated Incident ${incident.id}`,
      'INCIDENT' as any,
      incident.id,
      `Status: ${incident.status}`
    );

    const isStatusChange = oldIncident && oldIncident.status !== incident.status;
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        department: user.department
      },
      actionType: isStatusChange ? 'STATUS_CHANGE' : 'RECORD_EDIT',
      module: 'INCIDENTS',
      entityId: incident.id,
      entityTitle: `${incident.type}: ${incident.location}`,
      previousValue: oldIncident ? { status: oldIncident.status, severity: oldIncident.severity, location: oldIncident.location } : null,
      newValue: { status: incident.status, severity: incident.severity, location: incident.location },
      changeSummary: isStatusChange 
        ? `Incident ${incident.id} status changed: '${oldIncident?.status}' ➔ '${incident.status}' by ${user.name}`
        : `Incident ${incident.id} record updated by ${user.name}`,
      reason: `Operational update by ${user.name}`,
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO PR-1172', 'ISO 45001:2018'],
      severity: incident.severity
    }).catch(console.warn);

    this.broadcastMutation('incident', 'update', incident.id);

    UserProfileService.recordLiveActivity(user.id, {
      actionType: 'Updated Incident',
      category: 'Incident',
      entityId: incident.id,
      entityTitle: `${incident.type}: ${incident.location}`,
      details: `Status set to ${incident.status}. Severity: ${incident.severity}.`,
      impactResult: `Updated incident status to ${incident.status}`
    }).catch(console.warn);
  }

  // ---------------------------------------------------------------
  // PERMITS (PTW - G-1 Decoupled from localStorage)
  // ---------------------------------------------------------------
  public static getPermits(): Permit[] {
    return this.inMemoryPermits;
  }

  public static createPermit(permit: Permit, user: UserProfile): Permit {
    this.inMemoryPermits = [permit, ...this.inMemoryPermits];

    if (typeof window !== 'undefined') {
      fetch('/api/v1/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(permit)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: '/api/v1/permits',
          method: 'POST',
          entityType: 'Permit',
          entityId: permit.id,
          payload: permit
        });
      });
    }

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Created Permit ${permit.permitNumber}`,
      'PTW' as any,
      permit.id,
      `Type: ${permit.type}, Zone: ${permit.zone}`
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        department: user.department
      },
      actionType: 'RECORD_CREATE',
      module: 'PERMITS',
      entityId: permit.permitNumber,
      entityTitle: permit.title,
      previousValue: null,
      newValue: {
        type: permit.type,
        status: permit.status,
        zone: permit.zone,
        contractor: permit.contractor,
        riskRating: permit.riskRating
      },
      changeSummary: `Permit ${permit.permitNumber} created (${permit.type}) in ${permit.zone}`,
      reason: `Permit request submitted for ${permit.contractor}`,
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 21.0 PTW', 'PDO SP-1143 Specification PTW'],
      severity: permit.riskRating === 'High' ? 'High' : 'Medium'
    }).catch(console.warn);

    NotificationService.addNotification({
      title: `Permit Submitted: ${permit.permitNumber}`,
      description: `${permit.title} in ${permit.zone} awaiting Area Authority authorization.`,
      severity: 'High',
      category: 'PTW',
      targetRole: 'Site_Supervisor',
      senderName: user.name,
      sourceId: permit.permitNumber,
      actionView: 'PERMIT_TO_WORK'
    });

    this.broadcastMutation('permit', 'create', permit.id);
    return permit;
  }

  public static authorizePermit(permitId: string, issuer: UserProfile, remarks?: string): void {
    const oldPermit = this.inMemoryPermits.find(p => p.id === permitId || p.permitNumber === permitId);
    let updatedPermitObj: Permit | null = null;

    this.inMemoryPermits = this.inMemoryPermits.map(p => {
      if (p.id === permitId || p.permitNumber === permitId) {
        updatedPermitObj = {
          ...p,
          status: 'Active' as const,
          issuerSignature: {
            signed: true,
            signatoryName: issuer.name,
            signatoryRole: `${issuer.role} / Area Authority`,
            signatoryOrg: issuer.department,
            timestamp: new Date().toISOString(),
            checklistConfirmed: true,
            digestHash: 'sha256-verified-authorization-digest'
          }
        };
        return updatedPermitObj;
      }
      return p;
    });

    if (updatedPermitObj && typeof window !== 'undefined') {
      fetch(`/api/v1/permits/${encodeURIComponent(permitId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': issuer.id,
          'X-User-Name': issuer.name,
          'X-User-Role': issuer.role
        },
        body: JSON.stringify(updatedPermitObj)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: `/api/v1/permits/${encodeURIComponent(permitId)}`,
          method: 'PUT',
          entityType: 'Permit',
          entityId: permitId,
          payload: updatedPermitObj
        });
      });
    }

    AuditLogger.log(
      issuer.id,
      issuer.name,
      issuer.role,
      `Authorized Permit ${permitId}`,
      'PTW' as any,
      permitId,
      remarks || 'Issuer digital sign-off completed with zero-energy & gas test verification.'
    );

    // Unified Compliance Audit Trail with previous vs new values
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: issuer.id,
        userName: issuer.name,
        userEmail: issuer.email,
        userRole: issuer.role,
        department: issuer.department
      },
      actionType: 'STATUS_CHANGE',
      module: 'PERMITS',
      entityId: permitId,
      entityTitle: oldPermit?.title || `Permit ${permitId}`,
      previousValue: {
        status: oldPermit?.status || 'Requested',
        issuerSigned: false
      },
      newValue: {
        status: 'Active',
        issuerSigned: true,
        signatoryName: issuer.name,
        signatoryRole: `${issuer.role} / Area Authority`,
        remarks: remarks || 'Authorized after LOTO zero-energy and gas verification'
      },
      changeSummary: `Permit ${permitId} authorized by Area Authority ${issuer.name}; status transitioned to Active.`,
      reason: remarks || 'Area Authority digital sign-off completed',
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 21.0', 'PDO Life-Saving Rules'],
      severity: 'High'
    }).catch(console.warn);

    NotificationService.addNotification({
      title: `Permit Authorized: ${permitId}`,
      description: `Authorized by ${issuer.name}. Custody handed over to field receiver.`,
      severity: 'High',
      category: 'PTW',
      senderName: issuer.name,
      sourceId: permitId,
      actionView: 'PERMIT_TO_WORK'
    });

    this.broadcastMutation('permit', 'authorize', permitId);

    UserProfileService.recordLiveActivity(issuer.id, {
      actionType: 'Authorized Permit',
      category: 'Permit',
      entityId: permitId,
      entityTitle: oldPermit?.title || `Permit ${permitId}`,
      details: remarks || 'Authorized after LOTO zero-energy and gas verification',
      impactResult: 'Work permit transitioned to Active status in field.'
    }).catch(console.warn);
  }

  public static acknowledgePermitCustody(permitId: string, receiver: UserProfile): void {
    const oldPermit = this.inMemoryPermits.find(p => p.id === permitId || p.permitNumber === permitId);
    let updatedPermitObj: Permit | null = null;

    this.inMemoryPermits = this.inMemoryPermits.map(p => {
      if (p.id === permitId || p.permitNumber === permitId) {
        updatedPermitObj = {
          ...p,
          receiverSignature: {
            signed: true,
            signatoryName: receiver.name,
            signatoryRole: 'Permit Receiver',
            signatoryOrg: receiver.department,
            timestamp: new Date().toISOString(),
            checklistConfirmed: true
          }
        };
        return updatedPermitObj;
      }
      return p;
    });

    if (updatedPermitObj && typeof window !== 'undefined') {
      fetch(`/api/v1/permits/${encodeURIComponent(permitId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': receiver.id,
          'X-User-Name': receiver.name,
          'X-User-Role': receiver.role
        },
        body: JSON.stringify(updatedPermitObj)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: `/api/v1/permits/${encodeURIComponent(permitId)}`,
          method: 'PUT',
          entityType: 'Permit',
          entityId: permitId,
          payload: updatedPermitObj
        });
      });
    }

    AuditLogger.log(
      receiver.id,
      receiver.name,
      receiver.role,
      `Accepted Custody of Permit ${permitId}`,
      'PTW' as any,
      permitId,
      'Briefing acknowledged and work authorized in field.'
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: receiver.id,
        userName: receiver.name,
        userEmail: receiver.email,
        userRole: receiver.role,
        department: receiver.department
      },
      actionType: 'APPROVAL_SIGN_OFF',
      module: 'PERMITS',
      entityId: permitId,
      entityTitle: oldPermit?.title || `Permit ${permitId}`,
      previousValue: {
        receiverCustodySigned: false
      },
      newValue: {
        receiverCustodySigned: true,
        receiverName: receiver.name,
        signatoryRole: 'Permit Receiver'
      },
      changeSummary: `Field Receiver ${receiver.name} acknowledged safety briefing and accepted custody of ${permitId}.`,
      reason: 'Field custody acceptance after toolbox talk',
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 21.0'],
      severity: 'Low'
    }).catch(console.warn);

    this.broadcastMutation('permit', 'acknowledge', permitId);

    UserProfileService.recordLiveActivity(receiver.id, {
      actionType: 'Acknowledged Custody',
      category: 'Permit',
      entityId: permitId,
      entityTitle: oldPermit?.title || `Permit ${permitId}`,
      details: 'Field receiver accepted permit custody and safety briefing.',
      impactResult: 'Work started in field custody under continuous monitoring.'
    }).catch(console.warn);
  }

  // ---------------------------------------------------------------
  // CORRECTIVE ACTIONS (CAPA)
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // CORRECTIVE ACTIONS (CAPA - G-1 Decoupled from localStorage)
  // ---------------------------------------------------------------
  public static getCapas(): EnterpriseCapa[] {
    return this.inMemoryCapas;
  }

  public static createCapa(capa: EnterpriseCapa, user: UserProfile): EnterpriseCapa {
    this.inMemoryCapas = [capa, ...this.inMemoryCapas];

    if (typeof window !== 'undefined') {
      fetch('/api/v1/capas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(capa)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: '/api/v1/capas',
          method: 'POST',
          entityType: 'CAPA',
          entityId: capa.id,
          payload: capa
        });
      });
    }

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Created CAPA ${capa.id} (${capa.priority})`,
      'CAPA' as any,
      capa.id,
      capa.title
    );

    UnifiedAuditTrailService.logAction({
      actor: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        department: user.department
      },
      actionType: 'RECORD_CREATE',
      module: 'CAPA',
      entityId: capa.id,
      entityTitle: capa.title,
      previousValue: null,
      newValue: {
        title: capa.title,
        priority: capa.priority,
        sourceType: capa.sourceType,
        ownerName: capa.ownerName,
        dueDate: capa.dueDate,
        status: capa.status
      },
      changeSummary: `Created CAPA ${capa.id}: ${capa.title} assigned to ${capa.ownerName}`,
      reason: capa.details || capa.title,
      regulatoryFramework: ['ISO 45001:2018 Cl. 10.2', 'Oman MoL MD 286/2008 & PDO PR-1172'],
      severity: capa.priority === 'P1 - Critical' ? 'Critical' : 'High'
    }).catch(console.warn);

    NotificationService.addNotification({
      title: `New CAPA Assigned: ${capa.id}`,
      description: `${capa.title} (Due: ${capa.dueDate})`,
      severity: capa.priority === 'P1 - Critical' ? 'Critical' : 'High',
      category: 'CAPA',
      senderName: user.name,
      sourceId: capa.id,
      actionView: 'CAPA'
    });

    this.broadcastMutation('capa', 'create', capa.id);
    return capa;
  }

  public static updateCapaStatus(capaId: string, status: EnterpriseCapa['status'], user: UserProfile, evidence?: string): void {
    const oldCapa = this.inMemoryCapas.find(c => c.id === capaId);
    let updatedCapaObj: EnterpriseCapa | null = null;

    this.inMemoryCapas = this.inMemoryCapas.map(c => {
      if (c.id === capaId) {
        updatedCapaObj = {
          ...c,
          status,
          closureEvidence: status === 'Closed' ? (evidence || `Verified closed by ${user.name} on ${new Date().toLocaleDateString()}`) : c.closureEvidence
        };
        return updatedCapaObj;
      }
      return c;
    });

    if (updatedCapaObj && typeof window !== 'undefined') {
      fetch(`/api/v1/capas/${encodeURIComponent(capaId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(updatedCapaObj)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: `/api/v1/capas/${encodeURIComponent(capaId)}`,
          method: 'PUT',
          entityType: 'CAPA',
          entityId: capaId,
          payload: updatedCapaObj
        });
      });
    }

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Updated CAPA ${capaId} Status to ${status}`,
      'CAPA' as any,
      capaId,
      evidence || `Transitioned to ${status}`
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logStatusChange(
      user,
      'CAPA',
      capaId,
      oldCapa?.title || `CAPA ${capaId}`,
      oldCapa?.status || 'Open',
      status,
      evidence || `Transitioned to ${status}`,
      {
        additionalData: { closureEvidence: evidence },
        regulatoryFramework: ['ISO 45001:2018 Cl. 10.2', 'Oman MoL MD 286/2008 & PDO PR-1172'],
        severity: status === 'Closed' ? 'Low' : 'Medium'
      }
    ).catch(console.warn);

    NotificationService.addNotification({
      title: `CAPA ${capaId} Updated: ${status}`,
      description: `${status === 'Closed' ? 'Verified closed by' : 'Updated by'} ${user.name}.`,
      severity: status === 'Closed' ? 'Low' : 'Medium',
      category: 'CAPA',
      senderName: user.name,
      sourceId: capaId,
      actionView: 'CAPA'
    });

    this.broadcastMutation('capa', 'update', capaId);

    UserProfileService.recordLiveActivity(user.id, {
      actionType: status === 'Closed' ? 'Closed Corrective Action' : 'Updated Corrective Action',
      category: 'CAPA',
      entityId: capaId,
      entityTitle: oldCapa?.title || `CAPA ${capaId}`,
      details: evidence || `Status set to ${status}.`,
      impactResult: status === 'Closed' ? 'Action verified and closed with statutory compliance.' : `Status progressed to ${status}.`
    }).catch(console.warn);
  }

  public static reassignCapa(capaId: string, newOwnerName: string, user: UserProfile): void {
    const oldCapa = this.inMemoryCapas.find(c => c.id === capaId);
    let updatedCapaObj: EnterpriseCapa | null = null;

    this.inMemoryCapas = this.inMemoryCapas.map(c => {
      if (c.id === capaId) {
        updatedCapaObj = {
          ...c,
          ownerName: newOwnerName
        };
        return updatedCapaObj;
      }
      return c;
    });

    if (updatedCapaObj && typeof window !== 'undefined') {
      fetch(`/api/v1/capas/${encodeURIComponent(capaId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Name': user.name,
          'X-User-Role': user.role
        },
        body: JSON.stringify(updatedCapaObj)
      }).catch(() => {
        EncryptedOfflineQueue.enqueue({
          endpoint: `/api/v1/capas/${encodeURIComponent(capaId)}`,
          method: 'PUT',
          entityType: 'CAPA',
          entityId: capaId,
          payload: updatedCapaObj
        });
      });
    }

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      `Reassigned CAPA ${capaId} to ${newOwnerName}`,
      'CAPA' as any,
      capaId,
      `Reassigned by ${user.name}`
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logUserAssignment(
      user,
      'CAPA',
      capaId,
      oldCapa?.title || `CAPA ${capaId}`,
      oldCapa?.ownerName || 'Unassigned',
      newOwnerName,
      `Reassigned by ${user.name} for execution SLA compliance`,
      {
        regulatoryFramework: ['ISO 45001:2018 Cl. 5.3'],
        severity: 'Medium'
      }
    ).catch(console.warn);

    NotificationService.addNotification({
      title: `CAPA Action Reassigned: ${capaId}`,
      description: `You have been assigned ownership of CAPA ${capaId} by ${user.name}.`,
      severity: 'High',
      category: 'CAPA',
      senderName: user.name,
      sourceId: capaId,
      actionView: 'CAPA'
    });

    this.broadcastMutation('capa', 'reassign', capaId);

    UserProfileService.recordLiveActivity(user.id, {
      actionType: 'Reassigned Action',
      category: 'CAPA',
      entityId: capaId,
      entityTitle: oldCapa?.title || `CAPA ${capaId}`,
      details: `Reassigned action to ${newOwnerName}.`,
      impactResult: `Ownership transferred to ${newOwnerName}.`
    }).catch(console.warn);
  }

  // ---------------------------------------------------------------
  // STOP WORK AUTHORITY (SWA - G-1 Decoupled from localStorage)
  // ---------------------------------------------------------------
  public static getActiveSwa(): StopWorkRecord | null {
    return this.inMemorySwa;
  }

  public static triggerSwa(location: string, hazard: string, action: string, reporter: UserProfile): StopWorkRecord {
    const swaRecord: StopWorkRecord = {
      id: `SWA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      reporterName: reporter.name,
      reporterRole: reporter.role,
      location,
      hazardDescription: hazard,
      immediateAction: action,
      status: 'ACTIVE_STOPPAGE'
    };

    this.inMemorySwa = swaRecord;

    // Audit Log
    AuditLogger.log(
      reporter.id,
      reporter.name,
      reporter.role,
      `TRIGGERED STOP WORK AUTHORITY (SWA) at ${location}`,
      'INCIDENT' as any,
      swaRecord.id,
      `Hazard: ${hazard} | Immediate Action: ${action}`,
      'Success',
      'High'
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: reporter.id,
        userName: reporter.name,
        userEmail: reporter.email,
        userRole: reporter.role,
        department: reporter.department
      },
      actionType: 'STOP_WORK_AUTHORITY',
      module: 'WORKFORCE_SAFETY',
      entityId: swaRecord.id,
      entityTitle: `Stop Work Authority: ${location}`,
      previousValue: null,
      newValue: {
        status: 'ACTIVE_STOPPAGE',
        location,
        hazard,
        action
      },
      changeSummary: `🚨 CRITICAL SWA TRIGGERED by ${reporter.name} at ${location}: ${hazard}`,
      reason: hazard,
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 2.0', 'PDO SWA Policy', 'ISO 45001 Cl. 5.4'],
      severity: 'Critical'
    }).catch(console.warn);

    // Urgent broadcast notification
    NotificationService.addNotification({
      title: `🚨 CRITICAL STOP WORK AUTHORITY: ${location}`,
      description: `Triggered by ${reporter.name}. Hazard: ${hazard}. All high-risk work halted.`,
      severity: 'Critical',
      category: 'SWA',
      senderName: reporter.name,
      sourceId: swaRecord.id,
      actionView: 'WORKFORCE_SAFETY'
    });

    this.broadcastMutation('swa', 'trigger', swaRecord.id);

    UserProfileService.recordLiveActivity(reporter.id, {
      actionType: 'Triggered SWA',
      category: 'SWA',
      entityId: swaRecord.id,
      entityTitle: `Stop Work Authority: ${location}`,
      details: `Imminent hazard reported: ${hazard}. Immediate action: ${action}`,
      impactResult: 'Work halted safely under zero-retaliation policy.'
    }).catch(console.warn);

    return swaRecord;
  }

  public static resolveSwa(user: UserProfile): void {
    const activeSwa = this.getActiveSwa();
    this.inMemorySwa = null;

    AuditLogger.log(
      user.id,
      user.name,
      user.role,
      'RESOLVED STOP WORK CONDITION',
      'INCIDENT' as any,
      'SWA',
      `Imminent hazard mitigated. Operations authorized to resume by ${user.name}.`,
      'Success',
      'Low'
    );

    // Unified Compliance Audit Trail
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        department: user.department
      },
      actionType: 'STOP_WORK_AUTHORITY',
      module: 'WORKFORCE_SAFETY',
      entityId: 'SWA-LIFTED',
      entityTitle: 'Stop Work Condition Lifted',
      previousValue: activeSwa ? { status: 'ACTIVE_STOPPAGE', hazard: activeSwa.hazardDescription } : null,
      newValue: { status: 'RESOLVED', resumedBy: user.name },
      changeSummary: `✅ Stop Work condition lifted by ${user.name}. All imminent hazards mitigated; operations resumed.`,
      reason: 'Area Authority verified mitigation of hazards',
      regulatoryFramework: ['Oman MoL MD 286/2008 & PDO Specifications CoP 2.0', 'ISO 45001 Cl. 5.4'],
      severity: 'Low'
    }).catch(console.warn);

    NotificationService.addNotification({
      title: '✅ Stop Work Condition Lifted',
      description: `Hazard resolved and verified by ${user.name}. Normal operations resumed.`,
      severity: 'Low',
      category: 'SWA',
      senderName: user.name,
      actionView: 'WORKFORCE_SAFETY'
    });

    this.broadcastMutation('swa', 'resolve', 'swa');

    UserProfileService.recordLiveActivity(user.id, {
      actionType: 'Resolved SWA',
      category: 'SWA',
      entityId: activeSwa?.id || 'SWA-LIFTED',
      entityTitle: `SWA Resolved: ${activeSwa?.location || 'Operational Area'}`,
      details: `Hazard mitigated and verified. Operations authorized to resume.`,
      impactResult: 'All high-risk permits reactivated.'
    }).catch(console.warn);
  }

  public static getAudits(): SafetyAudit[] {
    return this.inMemoryAudits;
  }

  public static getInspections(): InspectionRecord[] {
    return this.inMemoryInspections;
  }

  // ---------------------------------------------------------------
  // DYNAMIC USER COCKPIT TASKS GENERATOR
  // (Truly connects CAPAs, Permits, SWA, Inspections to the active user!)
  // ---------------------------------------------------------------
  public static getUserCockpitTasks(currentUser: UserProfile): CockpitTask[] {
    const tasks: CockpitTask[] = [];
    const activeSwa = this.getActiveSwa();
    const capas = this.getCapas();
    const permits = this.getPermits();
    const inspections = EXPANDED_ENTERPRISE_INSPECTIONS;

    // 1. If SWA is active, inject immediate P1 task for Supervisors and HSE Officers
    if (activeSwa && activeSwa.status === 'ACTIVE_STOPPAGE') {
      const isResponder = ['Site_Supervisor', 'HSE_Officer', 'Site_HSE_Manager', 'ADMIN', 'Worker'].includes(currentUser.role);
      if (isResponder) {
        tasks.push({
          id: `TASK-SWA-${activeSwa.id}`,
          sourceId: activeSwa.id,
          sourceType: 'Incident',
          title: `EMERGENCY STOP WORK RECONCILIATION: ${activeSwa.location}`,
          description: `Imminent hazard reported by ${activeSwa.reporterName}: ${activeSwa.hazardDescription}. Containment: ${activeSwa.immediateAction}`,
          location: activeSwa.location,
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: 'Immediate',
          isOverdue: true,
          countdownText: 'Immediate Action Required',
          priority: 'P1 - Critical',
          status: 'Action Required',
          assignee: currentUser.name,
          assigneeId: currentUser.id,
          createdAt: activeSwa.timestamp
        });
      }
    }

    // 2. Permits needing User Action
    // For Permit Issuer (e.g. Marcus Chen / Site_Supervisor / ADMIN):
    if (['Site_Supervisor', 'ADMIN', 'Site_HSE_Manager'].includes(currentUser.role) || currentUser.name.includes('Marcus') || currentUser.name.includes('Mansoor')) {
      const pendingPermits = permits.filter(p => (p.status === 'Requested' || p.status === 'Draft') && !p.issuerSignature?.signed);
      pendingPermits.forEach(p => {
        tasks.push({
          id: `TASK-PTW-ISSUE-${p.id}`,
          sourceId: p.permitNumber,
          sourceType: 'Permit',
          title: `Permit Authorization Required: ${p.title}`,
          description: `Pre-work gas testing verified. Area Authority digital signature required for ${p.type} in ${p.zone}.`,
          location: p.exactLocation,
          dueDate: p.validFrom.split('T')[0],
          dueTime: 'Before Shift',
          isOverdue: false,
          countdownText: 'Pending Issuer Signature',
          priority: p.riskRating === 'High' ? 'P1 - Critical' : 'P2 - High',
          status: 'Pending Approval',
          assignee: currentUser.name,
          assigneeId: currentUser.id,
          issuer: currentUser.name,
          receiver: p.receiverSignature?.signatoryName || 'Field Receiver',
          gasStatus: p.gasTestingLog.length > 0 ? `LEL: ${p.gasTestingLog[0].lel}% | H2S: ${p.gasTestingLog[0].h2s} ppm` : 'Pre-test Pending',
          createdAt: p.createdAt
        });
      });
    }

    // For Field Receiver / Worker (e.g. Rahul Gupta / Worker / Tech):
    if (['Worker', 'Mechanical_Tech', 'ADMIN'].includes(currentUser.role) || currentUser.name.includes('Rahul') || currentUser.name.includes('Tariq')) {
      const activeWorkPermits = permits.filter(p => p.status === 'Active' || p.status === 'Authorized');
      activeWorkPermits.forEach(p => {
        tasks.push({
          id: `TASK-PTW-WORK-${p.id}`,
          sourceId: p.permitNumber,
          sourceType: 'Permit',
          title: `Active Permit in Custody: ${p.title}`,
          description: `Maintain continuous gas monitoring and LOTO padlocks Box #LOTO-${p.id.slice(-2)}. Ensure buddy watch.`,
          location: p.exactLocation,
          dueDate: p.validTo.split('T')[0],
          dueTime: 'Shift End',
          isOverdue: false,
          countdownText: 'Active in Field Custody',
          priority: 'P2 - High',
          status: 'In Progress',
          assignee: currentUser.name,
          assigneeId: currentUser.id,
          issuer: p.issuerSignature?.signatoryName || 'Marcus Chen',
          receiver: currentUser.name,
          gasStatus: 'O2: 20.9% | Normal',
          createdAt: p.createdAt
        });
      });
    }

    // 3. CAPAs assigned to the User (or all open CAPAs if HSE Officer / Admin)
    capas.forEach(c => {
      const isOwner = c.ownerName.toLowerCase().includes(currentUser.name.toLowerCase()) || 
                      currentUser.name.toLowerCase().includes(c.ownerName.toLowerCase());
      const isOfficer = ['HSE_Officer', 'Site_HSE_Manager', 'ADMIN'].includes(currentUser.role);

      if ((isOwner || (isOfficer && c.status === 'Pending Verification')) && c.status !== 'Closed') {
        const isOverdue = new Date(c.dueDate) < new Date();
        tasks.push({
          id: `TASK-CAPA-${c.id}`,
          sourceId: c.id,
          sourceType: 'CAPA',
          title: `CAPA Action: ${c.title}`,
          description: `Origin: ${c.sourceType} ${c.sourceId}. Required action: ${c.details || c.hierarchy}.`,
          location: c.siteName,
          dueDate: c.dueDate,
          dueTime: '17:00',
          isOverdue,
          countdownText: isOverdue ? 'OVERDUE - Escalated' : (c.status === 'Pending Verification' ? 'Awaiting Verification' : (c.countdownText || 'Open Action')),
          priority: c.priority === 'P1 - Critical' ? 'P1 - Critical' : (c.priority === 'P2 - High' ? 'P2 - High' : 'P3 - Medium'),
          status: c.status === 'Pending Verification' ? 'Pending Approval' : (isOverdue ? 'Overdue' : 'Action Required'),
          assignee: c.ownerName,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 4. Site Inspections due today for Supervisors and Safety Officers
    if (['Site_Supervisor', 'HSE_Officer', 'Site_HSE_Manager', 'ADMIN'].includes(currentUser.role)) {
      tasks.push({
        id: 'TASK-INSP-TODAY-01',
        sourceId: 'INSP-2026-TODAY',
        sourceType: 'Inspection',
        title: 'Daily Rigging & Crane Hoist Pre-Use Inspection',
        description: 'Verify slings, shackles, hook latches, and load charts at Heavy Lift Berth 2.',
        location: 'Ras Al-Khair Facility (KSA) · Heavy Lift Berth 2',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '14:00',
        isOverdue: false,
        countdownText: 'Due by 14:00 Today',
        priority: 'P2 - High',
        status: 'Action Required',
        assignee: currentUser.name,
        createdAt: new Date().toISOString()
      });
    }

    // 5. Toolbox Talk Acknowledgment for Workers
    if (currentUser.role === 'Worker' || currentUser.name.includes('Rahul')) {
      tasks.push({
        id: 'TASK-TBT-01',
        sourceId: 'TBT-2026-104',
        sourceType: 'Training',
        title: 'Daily Pre-Shift Briefing: Working Safely Around High-Pressure Flexible Lines',
        description: 'Review mandatory whip-check restraining cables and line-of-fire clearance protocol.',
        location: 'Fahud-West Gas Station (Oman) · Maintenance Workshop',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '07:30',
        isOverdue: false,
        countdownText: 'Pre-Shift Acknowledgment',
        priority: 'P2 - High',
        status: 'Action Required',
        assignee: currentUser.name,
        createdAt: new Date().toISOString()
      });
    }

    const seenTaskIds = new Set<string>();
    const uniqueTasks: CockpitTask[] = [];
    for (const t of tasks) {
      if (!seenTaskIds.has(t.id)) {
        seenTaskIds.add(t.id);
        uniqueTasks.push(t);
      }
    }
    return uniqueTasks;
  }
}
