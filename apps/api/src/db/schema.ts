/**
 * PostgreSQL 16 Schema Definitions & TypeScript Types
 * Mirrors migrations/0002_phase1_full_schema.up.sql
 */

export interface TenantRecord {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  cr_number: string;
  data_residency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteRecord {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
}

export interface UserRecord {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  sso_subject_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RoleRecord {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleAssignmentRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  created_at: string;
}

export interface ContractorRecord {
  id: string;
  tenant_id: string;
  company_name: string;
  trade: string;
  contact_email?: string;
  contact_phone?: string;
  compliance_status: string;
  cr_number?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractorDocumentRecord {
  id: string;
  tenant_id: string;
  contractor_id: string;
  doc_type: string;
  title: string;
  file_url: string;
  expiry_date?: string;
  status: string;
  created_at: string;
}

export interface CompetencyRecord {
  id: string;
  tenant_id: string;
  worker_name: string;
  civil_id: string;
  trade: string;
  certification: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  verified: boolean;
  created_at: string;
}

export interface IncidentRecord {
  id: string;
  tenant_id: string;
  incident_number: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  location: string;
  incident_timestamp: string;
  form_g_submitted: boolean;
  form_g_receipt_number?: string;
  form_g_deadline?: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IncidentEvidenceRecord {
  id: string;
  tenant_id: string;
  incident_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface InvestigationRecord {
  id: string;
  tenant_id: string;
  incident_id: string;
  lead_investigator: string;
  status: string;
  root_cause_summary?: string;
  methodology: string;
  created_at: string;
  updated_at: string;
}

export interface WhyRecord {
  id: string;
  tenant_id: string;
  investigation_id: string;
  level: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface FishboneNodeRecord {
  id: string;
  tenant_id: string;
  investigation_id: string;
  category: string;
  cause: string;
  created_at: string;
}

export interface BowtieNodeRecord {
  id: string;
  tenant_id: string;
  investigation_id: string;
  node_type: string;
  description: string;
  barrier_type?: string;
  status: string;
  created_at: string;
}

export interface CapaRecord {
  id: string;
  tenant_id: string;
  action_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  owner_name: string;
  verified_by_name?: string;
  due_date: string;
  hierarchy: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CapaEvidenceRecord {
  id: string;
  tenant_id: string;
  capa_id: string;
  file_url: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface PermitRecord {
  id: string;
  tenant_id: string;
  permit_number: string;
  permit_type: string;
  status: string;
  zone: string;
  exact_location: string;
  valid_from: string;
  valid_to: string;
  issuer_name?: string;
  receiver_name?: string;
  issuer_signature?: Record<string, any>;
  receiver_signature?: Record<string, any>;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PermitApprovalRecord {
  id: string;
  tenant_id: string;
  permit_id: string;
  approver_name: string;
  approver_role: string;
  status: string;
  comments?: string;
  signed_at: string;
  created_at: string;
}

export interface PermitIsolationRecord {
  id: string;
  tenant_id: string;
  permit_id: string;
  isolation_type: string;
  tag_number: string;
  isolated_by: string;
  verified_by?: string;
  status: string;
  created_at: string;
}

export interface GasTestRecord {
  id: string;
  tenant_id: string;
  permit_id: string;
  tester_name: string;
  oxygen_pct: number;
  lel_pct: number;
  h2s_ppm: number;
  co_ppm: number;
  passed: boolean;
  tested_at: string;
  created_at: string;
}

export interface TwlReadingRecord {
  id: string;
  tenant_id: string;
  site_id?: string;
  location: string;
  dry_bulb_c: number;
  wet_bulb_c: number;
  globe_temp_c: number;
  twl_w_m2: number;
  work_rest_regime: string;
  flag_color: string;
  recorded_at: string;
  created_at: string;
}

export interface TwlBreachRecord {
  id: string;
  tenant_id: string;
  site_id?: string;
  reading_id?: string;
  twl_value: number;
  breach_type: string;
  stop_work_triggered: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface InspectionRecord {
  id: string;
  tenant_id: string;
  title: string;
  template_type: string;
  site_name: string;
  inspector_name: string;
  status: string;
  score?: number;
  completed_at?: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InspectionItemRecord {
  id: string;
  tenant_id: string;
  inspection_id: string;
  category: string;
  item_text: string;
  status: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface ObservationRecord {
  id: string;
  tenant_id: string;
  observation_number: string;
  observer_name: string;
  observation_type: string;
  location: string;
  description: string;
  immediate_action?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HazardReportRecord {
  id: string;
  tenant_id: string;
  hazard_number: string;
  reporter_name: string;
  hazard_category: string;
  risk_level: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingRecordEntity {
  id: string;
  tenant_id: string;
  course_title: string;
  course_code: string;
  trainee_name: string;
  civil_id: string;
  completion_date: string;
  expiry_date?: string;
  score?: number;
  certificate_url?: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  tenant_id: string;
  doc_number: string;
  title: string;
  category: string;
  status: string;
  current_version: string;
  owner_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRevisionRecord {
  id: string;
  tenant_id: string;
  document_id: string;
  version_string: string;
  change_summary: string;
  author_name: string;
  file_url: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface RegulatoryObligationRecord {
  id: string;
  tenant_id: string;
  standard_code: string;
  title: string;
  issuing_body: string;
  jurisdiction: string;
  compliance_level: string;
  review_frequency: string;
  last_audited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlMappingRecord {
  id: string;
  tenant_id: string;
  obligation_id?: string;
  internal_control_ref: string;
  control_description: string;
  verification_frequency: string;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  tenant_id: string;
  submission_type: string;
  reference_number: string;
  target_authority: string;
  payload: Record<string, any>;
  receipt?: Record<string, any>;
  status: string;
  submitted_at: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: number;
  tenant_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload_hash: string;
  entry_hash: string;
  signature?: string;
  timestamp: string;
  created_at: string;
}

export interface AiOutputRecord {
  id: string;
  tenant_id: string;
  model_alias: string;
  prompt_hash: string;
  output_text: string;
  confidence_score?: number;
  hitl_status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}
