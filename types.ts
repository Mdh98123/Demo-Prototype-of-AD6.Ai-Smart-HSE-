
export type UserRole = 'ADMIN' | 'Board_Director' | 'CEO' | 'Head_Group_HSE' | 'Regional_HSE_Director' | 'Site_HSE_Manager' | 'HSE_Officer' | 'Environmental_Officer' | 'Project_Manager' | 'Internal_Auditor' | 'Site_Supervisor' | 'Worker' | 'HR_Coordinator' | 'Legal_Team' | 'Transport_Manager' | 'Security_Officer' | 'Store_Keeper' | 'Maintenance_Lead';

export type ComplianceFramework = 'ADNOC_COP' | 'OSHAD_SF' | 'DM_CODE' | 'ISO_45001' | 'FEDERAL_MOHRE';

export type Language = 'en' | 'ar';

export enum View {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  COMPLIANCE = 'COMPLIANCE',
  INCIDENTS = 'INCIDENTS',
  OBSERVATIONS = 'OBSERVATIONS',
  PERMITS = 'PERMITS',
  TRAINING = 'TRAINING',
  INSPECTIONS = 'INSPECTIONS',
  AUDITS = 'AUDITS',
  MAINTENANCE = 'MAINTENANCE',
  TOOLBOX = 'TOOLBOX',
  CONTRACTORS = 'CONTRACTORS',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  EMERGENCY = 'EMERGENCY',
  HEALTH = 'HEALTH',
  PLANNING = 'PLANNING',
  RAMS = 'RAMS',
  DMS = 'DMS',
  GOVERNANCE = 'GOVERNANCE',
  IAM = 'IAM',
  SYSTEM_LOGS = 'SYSTEM_LOGS',
  TRANSPORT = 'TRANSPORT',
  PPE = 'PPE',
  LIFTING = 'LIFTING',
  SECURITY = 'SECURITY',
  CHEMICALS = 'CHEMICALS',
  MOC = 'MOC',
  COMPLY_FLOW = 'COMPLY_FLOW',
  PROJECTS = 'PROJECTS',
  PREDICTIVE_RISK = 'PREDICTIVE_RISK',
  AR_PROCEDURES = 'AR_PROCEDURES',
  INTEGRATIONS = 'INTEGRATIONS',
  ESG = 'ESG',
  DIGITAL_TWIN = 'DIGITAL_TWIN',
  CONNECTED_WORKER = 'CONNECTED_WORKER',
  RCA_TOOL = 'RCA_TOOL',
  EXCAVATION = 'EXCAVATION'
}

// ... (Keep existing interfaces: HSEPerformanceMetrics, UserProfile, etc. - assume they are here to save space in this diff, I will append new ones)

export interface HSEPerformanceMetrics {
  manHours: { total: number; safe: number; thisMonth: number };
  lagging: { fatality: number; lti: number; rwc: number; mtc: number; fac: number; nearMiss: number; propertyDamage: number; envSpill: number };
  leading: { unsafeActs: number; unsafeConditions: number; tbtConducted: number; inspectionsClosed: number; drillsConducted: number };
  rates: { ltif: number; trir: number };
  actions: { total: number; closed: number; open: number; overdue: number };
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  department: string;
  safetyScore: number;
  recentIncidents: string[];
  observations: any[];
  certifications: { name: string; status: string; expiryDate: string }[];
  achievements: { id: string; title: string; description: string; dateEarned: string; icon: string; tier: string }[];
}

export interface SecureUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: string[];
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  lastMaintenanceDate: string;
  operationalHours: number;
  sensors: { temperature: number; vibration: number; oilLevel?: number; pressure?: number };
  status: 'Operational' | 'Warning' | 'Critical' | 'Maintenance';
  relatedIncidents?: string[];
  prediction?: MaintenancePrediction;
}

export interface MaintenancePrediction {
  failureProbability: number;
  predictedFailureDate: string;
  rootCauseSuspect: string;
  recommendedAction: string;
  maintenanceSchedule: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'General' | 'Inspection' | 'Audit' | 'Maintenance' | 'Permit' | 'Training';
  status: 'ToDo' | 'InProgress' | 'Done';
  dueDate: string;
  reminderDate?: string;
  dependencies?: string[];
  createdAt: string;
  createdBy: string;
}

export interface ComplianceAlert {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Permit' | 'Inspection' | 'Training' | 'Maintenance' | 'Other';
  actionLink?: string;
}

export interface AuditLog {
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Review' | 'Investigation' | 'Closed';
  timestamp: string;
  reportedBy: string;
  reportedByName: string;
  reportDeadline?: string;
  images: string[];
  coordinates?: { lat: number; lng: number };
  auditLog: AuditLog[];
}

export interface IncidentReportOptions {
  format: 'OSHAD_Form_E' | 'ADNOC_Flash_Report' | 'Internal_Memo';
  tone: string;
  includeRca: boolean;
  includeEvidence: boolean;
  includeAuditTrail: boolean;
  includeWeather: boolean;
  includeWitness: boolean;
}

export interface AIIncidentAnalysis {
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
}

export interface RootCauseAnalysis {
  rootCauses: string[];
  correctiveActions: string[];
}

export interface IncidentRCA {
  suggested_root_causes: { cause: string; confidence: number }[];
  corrective_actions: string[];
  similar_incidents?: string[];
}

export interface AIRiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  hazards: string[];
  controls: string[];
  requiredPPE: string[];
}

export interface RAMS {
  id: string;
  title: string;
  activity: string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Archived';
  probability: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  hazards: string[];
  controls: string[];
  briefingLogs: { workerName: string; signedAt: string; signatureHash: string }[];
  revisionHistory: RAMSRevision[];
}

export interface RAMSRevision {
  version: string;
  date: string;
  changedBy: string;
  changeDescription: string;
  previousRiskScore: number;
  snapshot: Partial<RAMS>;
}

export interface InspectionItem {
  id: string;
  question: string;
  regulationReference: string;
  status: 'Pending' | 'Pass' | 'Fail' | 'NA';
  image?: string;
  icon?: string;
  ncrId?: string;
}

export interface NCR {
  id: string;
  inspectionId: string;
  itemId: string;
  description: string;
  severity: 'Minor' | 'Major' | 'Critical';
  assignedTo: string;
  dueDate: string;
  status: 'Open' | 'Closed';
  correctiveAction?: string;
}

export interface SafetyObservation {
  id: string;
  type: 'Positive' | 'Improvement';
  description: string;
  location: string;
  timestamp: string;
  status: 'Submitted' | 'Reviewed' | 'Actioned';
  isAnonymous: boolean;
  reportedBy?: string;
  images?: string[];
  analysis?: AISafetyObservationAnalysis;
  history?: AuditLog[];
}

export interface AISafetyObservationAnalysis {
  category: string;
  sentiment: string;
  priority: string;
  tags: string[];
  summary: string;
  suggestedAction: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TrainingRecommendation {
  title: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  skillGap: string;
  reason: string;
  estimatedDuration: string;
}

export interface TeamSkillAnalysis {
  skillGap: string;
  severity: 'Critical' | 'Moderate' | 'Low';
  affectedCount: number;
  recommendedAction: string;
}

export interface Audit {
  id: string;
  title: string;
  standard: string;
  location: string;
  scheduledDate: string;
  auditorId: string;
  auditorName: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  score?: number;
  findings: AuditFinding[];
  checklist: InspectionItem[];
}

export interface AuditFinding {
  id: string;
  checklistRefId: string;
  description: string;
  location: string;
  category: string;
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'Open' | 'Closed';
  correctiveAction: string;
  ncrStatement: string;
  rootCause: string;
  preventiveAction: string;
  suggestedPPE: string[];
  dueDate: string;
  history: AuditLog[];
  reviewerComment?: string;
}

export interface ToolboxTalk {
  id: string;
  topic: string;
  location: string;
  date: string;
  presenter: string;
  attendeesCount: number;
  summary: string;
  aiSuggestedTopic: boolean;
  keyPoints?: string[];
}

export interface Contractor {
  id: string;
  name: string;
  category: string;
  riskScore: number;
  complianceStatus: 'Active' | 'Probation' | 'Suspended';
  personnelCount: number;
  documents: { type: string; expiryDate: string; status: 'Valid' | 'Expired' | 'Missing' }[];
}

export interface EnvironmentalReading {
  id: string;
  type: string;
  value: number;
  unit: string;
  location: string;
  timestamp: string;
  status: 'Within Limit' | 'Threshold Breach';
}

export interface EmergencyDrill {
  id: string;
  type: string;
  date: string;
  location: string;
  outcome: 'Successful' | 'Needs Improvement';
  timeTakenMinutes: number;
  participants: number;
}

export interface HealthMetricRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  bloodPressure: string;
  heartRate: number;
  bodyTemp: number;
  hydrationLevel: 'Optimal' | 'Low' | 'Critical';
  fitnessForDuty: 'Fit' | 'Restricted' | 'Unfit';
}

export interface OccupationalHealthIncident {
  id: string;
  type: string;
  description: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  timestamp: string;
  location: string;
  status: string;
}

export interface HSEPlan {
  id: string;
  title: string;
  type: 'PHSP' | 'ERP' | 'EMP';
  phase: string;
  status: 'Draft' | 'Client_Review' | 'Regulator_Review' | 'Approved';
  version: string;
  lastUpdated: string;
  approvals: { role: string; name: string; date: string }[];
}

export interface HSEDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  status: 'Active' | 'Archived' | 'Draft';
  author: string;
  retentionYears: number | string;
  criticality: 'High' | 'Medium' | 'Low';
  authority: string;
  portal: string;
  regulationRef: string;
  penaltyRisk?: string;
  auditLogs: AuditLog[];
}

export interface GlobalAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: 'User' | 'Permit' | 'Incident' | 'System' | 'Document';
  resourceId?: string;
  details: string;
  status: 'Success' | 'Failure' | 'Unauthorized';
  riskLevel: 'Low' | 'Medium' | 'High';
  ipHash: string;
}

export interface JourneyPlan {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  routeFrom: string;
  routeTo: string;
  departureTime: string;
  arrivalTime: string;
  passengers: string[];
  restStops: string[];
  status: 'Active' | 'Completed' | 'Delayed';
  nightDrivingApproval?: boolean;
}

export interface VehicleCheck {
  id: string;
  vehicleId: string;
  date: string;
  status: 'Pass' | 'Fail';
}

export interface TrafficViolation {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  points: number;
}

export interface PPEItem {
  id: string;
  name: string;
  type: 'Head' | 'Eye' | 'Hand' | 'Foot' | 'Body' | 'Respiratory';
  standard: string;
  stock: number;
  reorderLevel: number;
  lastIssued: string;
}

export interface PPEIssuance {
  id: string;
  userId: string;
  userName: string;
  items: { itemId: string; name: string; qty: number }[];
  date: string;
  signatureHash: string;
}

export interface LiftPlan {
  id: string;
  date: string;
  location: string;
  loadDescription: string;
  weightKg: number;
  craneCapacityKg: number;
  radiusMeters: number;
  boomLengthMeters: number;
  utilizationPercent: number;
  category: 'Simple' | 'Complex';
  riggerId: string;
  approverId: string;
  status: 'Draft' | 'Approved' | 'Rejected';
  windLimitSpeed: number;
}

export interface GatePass {
  id: string;
  visitorName: string;
  company: string;
  hostId: string;
  entryTime: string;
  exitTime?: string;
  type: 'Visitor' | 'Contractor' | 'Delivery';
  status: 'Active' | 'Closed';
  vehicleReg?: string;
  purpose: string;
}

export interface ChemicalInventory {
  id: string;
  name: string;
  msdsRef: string;
  location: string;
  quantity: number;
  unit: string;
  hazardClass: 'Flammable' | 'Corrosive' | 'Toxic' | 'Oxidizer' | 'Explosive';
  expiryDate: string;
  compatibilityGroup: string;
}

export interface MOCRequest {
  id: string;
  title: string;
  description: string;
  type: 'Permanent' | 'Temporary' | 'Emergency';
  category: 'Equipment' | 'Process' | 'Personnel' | 'Organization';
  initiator: string;
  date: string;
  riskAssessmentRef: string;
  status: 'Draft' | 'HSE_Review' | 'Tech_Review' | 'Approved' | 'Rejected';
  approvals: { role: string; name: string; date: string; status: string }[];
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  sourceAuthority: string;
  publicationDate: string;
  effectiveDate: string;
  summary: string;
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  domain: string;
  status: 'New' | 'Reviewing' | 'Acknowledged' | 'Implemented';
  actionRequired: boolean;
  impactScore?: number;
  affectedAssets?: string[];
}

export interface OperationalMapping {
  id: string;
  regulationId: string;
  activityName: string;
  complianceRule: string;
  evidenceRequired: string;
  ownerRole: string;
  deadline: string;
  status: 'Compliant' | 'At Risk';
}

export interface FineRisk {
  regulationId: string;
  violationType: string;
  potentialFineAED: number;
  probability: 'High' | 'Medium' | 'Low';
  preventionAction: string;
}

export interface DashboardInsights {
  trends: { title: string; analysis: string; trend: 'Up' | 'Down' | 'Stable' }[];
  risks: { area: string; riskLevel: 'Critical' | 'High' | 'Medium'; description: string }[];
  strategy: { recommendation: string; impact: string }[];
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Planning' | 'Completed' | 'OnHold';
  manager: string;
  budget: number;
  progress: number;
  hseScore: number;
  openIncidents: number;
}

export interface PredictiveRiskForecast {
  riskScore: number;
  predictedIncidents: {
    type: string;
    probability: number;
    contributingFactors: string[];
  }[];
  recommendedActions: {
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedRiskReduction: string;
  }[];
}

export interface ARProcedure {
  id: string;
  title: string;
  assetType: string;
  spatialAnchors: {
    id: string;
    position: [number, number, number];
    annotation: string;
    warning?: string;
  }[];
  requiredPPE: string[];
}

export interface IntegrationStatus {
  id: string;
  name: string; 
  status: 'Connected' | 'Error' | 'Syncing';
  lastSync: string;
  eventsProcessed: number;
  errorRate: number;
}

export interface IoTEvent {
  id: string;
  source: string;
  type: string;
  value: string;
  timestamp: string;
  isAnomaly: boolean;
}

// --- NEW TYPES FOR PHASE 1, 2, 3 ---

export interface EmissionRecord {
  id: string;
  date: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  source: string;
  activityData: number;
  unit: string;
  emissionFactor: number;
  calculatedCO2e: number; // tonnes
}

export interface DigitalTwinSensor {
  id: string;
  type: 'Gas' | 'Temp' | 'Vibration' | 'Flow';
  label: string;
  value: number;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
  coordinates: { x: number; y: number; z: number };
}

export interface ConnectedWorker {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Idle' | 'Distress' | 'Offline';
  heartRate: number;
  bodyTemp: number;
  location: { zone: string; coords: [number, number] };
  lastSync: string;
  hazards: string[];
  battery: number;
}

export interface RCAAnalysis {
  incidentId: string;
  method: '5-Whys' | 'Fishbone';
  data: any; // Flexible for graph structure
  aiSuggestions: string[];
}
