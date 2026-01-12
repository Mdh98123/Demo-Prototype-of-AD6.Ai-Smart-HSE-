
export type UserRole = 'ADMIN' | 'Board_Director' | 'CEO' | 'Head_Group_HSE' | 'Regional_HSE_Director' | 'Site_HSE_Manager' | 'HSE_Officer' | 'Environmental_Officer' | 'Project_Manager' | 'Internal_Auditor' | 'Site_Supervisor' | 'Worker' | 'HR_Coordinator' | 'Legal_Team';

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
  IAM = 'IAM'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'General' | 'Inspection' | 'Maintenance' | 'Audit' | 'Training';
  status: 'ToDo' | 'InProgress' | 'Done';
  dueDate: string;
  reminderDate?: string;
  dependencies?: string[]; // Array of Task IDs that must be completed first
  createdAt: string;
  createdBy: string;
}

export interface IncidentReportOptions {
  format: 'OSHAD_Form_E' | 'ADNOC_Flash_Report' | 'Internal_Memo' | 'Police_Summary';
  tone: 'Technical' | 'Executive' | 'Neutral';
  includeRca: boolean;
  includeEvidence: boolean;
  includeAuditTrail: boolean;
  includeWeather: boolean;
  includeWitness: boolean;
}

export interface AIIncidentAnalysis {
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendations: string[];
}

export interface RootCauseAnalysis {
  rootCauses: string[];
  correctiveActions: string[];
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
  type?: string;
  description: string;
  location: string;
  timestamp: string;
  reportedBy: string;
  reportedByName: string;
  status: 'Reported' | 'Investigating' | 'RCA_Pending' | 'Review' | 'Closed';
  reportDeadline: string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  images: string[];
  coordinates?: { lat: number; lng: number };
  aiAnalysis?: AIIncidentAnalysis;
  rca?: RootCauseAnalysis;
  auditLog: AuditLog[];
  regulatoryNotifications?: { authority: string; notifiedAt: string; referenceNumber: string; status: 'Pending' | 'Completed' }[];
}

export interface AIRiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  hazards: string[];
  controls: string[];
  requiredPPE: string[];
}

export interface GasReading {
  id: string;
  gas: 'O2' | 'H2S' | 'CO' | 'LEL';
  value: number;
  unit: string;
  timestamp: string;
  testedBy: string;
  status: 'Safe' | 'Unsafe';
}

export interface FireWatchLog {
  watcherName: string;
  designationTime: string;
  equipmentCheck: boolean;
}

export interface ApprovalStep {
  role: UserRole;
  label: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Overridden';
  approverName?: string;
  timestamp?: string;
  signatureHash?: string;
  comments?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TrainingRecommendation {
  title: string;
  type: 'Workshop' | 'Online' | 'Drill';
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

export interface MaintenancePrediction {
  failureProbability: number;
  predictedFailureDate: string;
  rootCauseSuspect: string;
  recommendedAction: string;
  maintenanceSchedule: string;
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

export interface SafetyObservation {
  id: string;
  type: 'Positive' | 'Improvement';
  description: string;
  location: string;
  timestamp: string;
  status: 'Submitted' | 'Reviewed';
  isAnonymous: boolean;
  reportedBy?: string;
  images?: string[];
  analysis?: AISafetyObservationAnalysis;
  history?: AuditLog[];
}

export interface AISafetyObservationAnalysis {
  category: 'PPE' | 'Housekeeping' | 'Behavior' | 'Environment' | 'Procedure' | 'Leadership' | 'Hazard';
  sentiment: 'Positive' | 'Neutral' | 'Constructive';
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  summary: string;
  suggestedAction?: string;
}

// NCR (Non-Conformance Report) Interface - Essential for Real Inspections
export interface NCR {
  id: string;
  inspectionId: string;
  itemId: string;
  description: string;
  severity: 'Major' | 'Minor';
  assignedTo: string; // User ID or Role
  dueDate: string;
  status: 'Open' | 'Pending_Verification' | 'Closed' | 'Overdue';
  correctiveAction?: string;
  evidenceClosed?: string; // Image of fix
  closedBy?: string;
  closedAt?: string;
}

export interface InspectionItem {
  id: string;
  question: string;
  regulationReference: string;
  status: 'Pass' | 'Fail' | 'NA' | 'Pending';
  comment?: string;
  reviewerComment?: string;
  image?: string;
  detectedHazards?: string[];
  suggestedPPE?: string[];
  requiredPPE?: string[];
  failurePPE?: string[];
  icon?: string;
  // Link to NCR if failed
  ncrId?: string;
}

export interface ComplianceAlert {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Permit' | 'Inspection' | 'Training' | 'Maintenance' | 'Other';
  actionLink?: string;
}

export interface AuditFinding {
  id: string;
  checklistRefId: string;
  description: string;
  location: string;
  category: 'Major' | 'Minor' | 'OFI';
  severity: 'Major' | 'Minor' | 'Observation';
  status: 'Open' | 'Closed' | 'Awaiting Review';
  correctiveAction: string;
  ncrStatement: string;
  rootCause: string;
  preventiveAction: string;
  suggestedPPE: string[];
  dueDate: string;
  reviewerComment?: string;
  history?: AuditLog[];
}

export interface Audit {
  id: string;
  title: string;
  standard: string;
  location: string;
  scheduledDate: string;
  auditorId: string;
  auditorName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  score?: number;
  findings: AuditFinding[];
  executiveSummary?: string;
  checklist: InspectionItem[];
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
}

export interface Contractor {
  id: string;
  name: string;
  category: string;
  riskScore: number;
  complianceStatus: 'Active' | 'Probation' | 'Suspended';
  personnelCount: number;
  documents: { type: string; expiryDate: string; status: 'Valid' | 'Expired' }[];
}

export interface EnvironmentalReading {
  id: string;
  type: 'Air Quality' | 'Noise' | 'Emissions' | 'Water Quality';
  value: number;
  unit: string;
  location: string;
  timestamp: string;
  status: 'Within Limit' | 'Threshold Breach' | 'Warning';
}

export interface EmergencyDrill {
  id: string;
  type: string;
  date: string;
  location: string;
  outcome: 'Successful' | 'Needs Improvement' | 'Failed';
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
  status: 'Resolved' | 'Under Observation' | 'Active';
}

export interface HSEPlan {
  id: string;
  title: string;
  type: 'PHSP' | 'ERP' | 'EMP';
  phase: string;
  status: 'Approved' | 'Client_Review' | 'Regulator_Review' | 'Draft';
  version: string;
  lastUpdated: string;
  approvals: { role: string; name: string; date: string }[];
}

export interface RAMS {
  id: string;
  title: string;
  activity: string;
  version: string;
  status: 'Approved' | 'Under Review' | 'Draft' | 'Rejected';
  probability: 1|2|3|4|5;
  severity: 1|2|3|4|5;
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
}

export interface HSEDocument {
  id: string;
  title: string;
  category: 'Plan' | 'RAMS' | 'Permit' | 'Certificate' | 'Report' | 'Other';
  version: string;
  status: 'Active' | 'Archived' | 'Expired';
  author: string;
  retentionYears: number | string;
  criticality: 'High' | 'Medium' | 'Low';
  authority: string;
  portal?: string;
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
  resourceType: 'User' | 'Document' | 'Permit' | 'Incident' | 'System';
  resourceId?: string;
  details: string;
  status: 'Success' | 'Failure' | 'Unauthorized';
  riskLevel: 'Low' | 'Medium' | 'High';
  ipHash?: string;
}

export interface SecureUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  safetyScore: number;
  recentIncidents: string[];
  observations: any[];
  certifications: { name: string; status: 'Valid' | 'Expiring Soon' | 'Expired'; expiryDate: string }[];
  achievements: { id: string; title: string; description: string; dateEarned: string; icon: string; tier: 'Gold' | 'Silver' | 'Bronze' }[];
}

// AI Dashboard Types
export interface DashboardInsightItem {
  title: string;
  analysis: string;
  trend: 'Up' | 'Down' | 'Stable';
}

export interface DashboardRiskItem {
  area: string;
  riskLevel: 'Critical' | 'High' | 'Medium';
  description: string;
}

export interface DashboardStrategyItem {
  recommendation: string;
  impact: string;
}

export interface DashboardInsights {
  trends: DashboardInsightItem[];
  risks: DashboardRiskItem[];
  strategy: DashboardStrategyItem[];
}
