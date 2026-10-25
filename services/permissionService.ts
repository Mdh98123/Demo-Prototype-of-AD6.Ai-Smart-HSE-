// services/permissionService.ts
// Enterprise Role-Based Access Control (RBAC), Permission Matrix & Dynamic Navigation Engine

import { 
  CheckSquare, Eye, BookOpen, FileText,
  Compass, LayoutDashboard, Activity, Thermometer, Box, Wifi,
  FileSignature, Lock, Flame, Anchor, Layers, ClipboardCheck,
  ShieldAlert, GitPullRequest, Scale, GitMerge, Globe, Leaf, Shield,
  AlertOctagon, ShieldCheck, Smartphone, GraduationCap,
  Briefcase, HeartPulse, HardHat, Truck,
  Building2, Landmark, FolderTree, FileClock, ChevronDown, ChevronRight,
  Search, X, Zap, Users, User, ArrowRight, TrendingUp, BarChart3, Settings, MapPin,
  Wrench, FlaskConical, AlertTriangle, Key
} from 'lucide-react';
import { UserRole, View, UserProfile } from '../types';

// ============================================================================
// 1. GRANULAR PERMISSION CONSTANTS
// ============================================================================

export const PERMISSIONS = {
  // Frontline & Daily Work
  TASKS_VIEW: 'tasks:view',
  TASKS_MANAGE: 'tasks:manage',
  OBSERVATIONS_CREATE: 'observations:create',
  OBSERVATIONS_VIEW: 'observations:view',
  OBSERVATIONS_REVIEW: 'observations:review',
  TOOLBOX_VIEW: 'toolbox:view',
  TOOLBOX_CONDUCT: 'toolbox:conduct',
  SWA_TRIGGER: 'swa:trigger',
  SWA_MANAGE: 'swa:manage',
  FORMS_BUILDER_VIEW: 'forms:view',
  FORMS_BUILDER_MANAGE: 'forms:manage',

  // Command Center & Analytics
  EXECUTIVE_BI_VIEW: 'executive:bi:view',
  EXECUTIVE_BOARD_REPORT: 'executive:board:report',
  DASHBOARD_VIEW: 'dashboard:view',
  GIS_MAP_VIEW: 'gis:view',
  SIMOPS_VIEW: 'simops:view',
  SIMOPS_MANAGE: 'simops:manage',
  HEAT_STRESS_VIEW: 'heat_stress:view',
  HEAT_STRESS_ENFORCE: 'heat_stress:enforce',
  DIGITAL_TWIN_VIEW: 'digital_twin:view',
  IOT_TELEMETRY_VIEW: 'iot:telemetry:view',
  IOT_TELEMETRY_MANAGE: 'iot:telemetry:manage',

  // Control of Work
  PTW_VIEW: 'ptw:view',
  PTW_CREATE: 'ptw:create',
  PTW_APPROVE: 'ptw:approve',
  LOTO_VIEW: 'loto:view',
  LOTO_MANAGE: 'loto:manage',
  LIFTING_VIEW: 'lifting:view',
  LIFTING_APPROVE: 'lifting:approve',
  EXCAVATION_VIEW: 'excavation:view',
  EXCAVATION_APPROVE: 'excavation:approve',
  RAMS_VIEW: 'rams:view',
  RAMS_MANAGE: 'rams:manage',
  JSA_VIEW: 'jsa:view',
  JSA_MANAGE: 'jsa:manage',

  // Risk & Governance
  HAZARDS_VIEW: 'hazards:view',
  HAZARDS_MANAGE: 'hazards:manage',
  COMPLY_FLOW_VIEW: 'comply_flow:view',
  COMPLY_FLOW_MANAGE: 'comply_flow:manage',
  BOWTIE_VIEW: 'bowtie:view',
  BOWTIE_MANAGE: 'bowtie:manage',
  MOC_VIEW: 'moc:view',
  MOC_MANAGE: 'moc:manage',
  ESG_VIEW: 'esg:view',
  ESG_MANAGE: 'esg:manage',
  BCMS_VIEW: 'bcms:view',
  BCMS_MANAGE: 'bcms:manage',

  // Incidents & Assurance
  INCIDENTS_VIEW: 'incidents:view',
  INCIDENTS_REPORT: 'incidents:report',
  INCIDENTS_INVESTIGATE: 'incidents:investigate',
  INCIDENTS_SIGN_OFF: 'incidents:sign_off',
  PREDICTIVE_SAFETY_VIEW: 'predictive_safety:view',
  RCA_VIEW: 'rca:view',
  RCA_EXECUTE: 'rca:execute',
  CAPA_VIEW: 'capa:view',
  CAPA_MANAGE: 'capa:manage',
  AUDITS_VIEW: 'audits:view',
  AUDITS_MANAGE: 'audits:manage',
  INSPECTIONS_VIEW: 'inspections:view',
  INSPECTIONS_EXECUTE: 'inspections:execute',
  PWA_INSPECTIONS_VIEW: 'pwa_inspections:view',
  LESSONS_LEARNED_VIEW: 'lessons_learned:view',
  LESSONS_LEARNED_MANAGE: 'lessons_learned:manage',

  // Workforce & Health
  CONTRACTOR_PORTAL_VIEW: 'contractor:portal:view',
  CONTRACTOR_PORTAL_MANAGE: 'contractor:portal:manage',
  TRAINING_VIEW: 'training:view',
  TRAINING_MANAGE: 'training:manage',
  HEALTH_VIEW: 'health:view',
  HEALTH_CLINICAL_VIEW: 'health:clinical:view',
  CONNECTED_WORKER_VIEW: 'connected_worker:view',
  PPE_VIEW: 'ppe:view',
  PPE_MANAGE: 'ppe:manage',
  TRANSPORT_VIEW: 'transport:view',
  TRANSPORT_MANAGE: 'transport:manage',
  CHEMICALS_VIEW: 'chemicals:view',
  CHEMICALS_MANAGE: 'chemicals:manage',
  AR_PROCEDURES_VIEW: 'ar_procedures:view',

  // Maintenance & Asset Integrity
  MAINTENANCE_VIEW: 'maintenance:view',
  MAINTENANCE_MANAGE: 'maintenance:manage',

  // Enterprise Admin
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_MANAGE: 'projects:manage',
  IAM_VIEW: 'iam:view',
  IAM_MANAGE: 'iam:manage',
  INTEGRATIONS_VIEW: 'integrations:view',
  INTEGRATIONS_MANAGE: 'integrations:manage',
  SYSTEM_LOGS_VIEW: 'system_logs:view',
  DESIGN_SYSTEM_VIEW: 'design_system:view',
  PRICING_GTM_VIEW: 'pricing_gtm:view',
  PDO_MOL_WORKFLOW_VIEW: 'pdo_mol_workflow:view',
  COMPLIANCE_ASSISTANT_VIEW: 'compliance_assistant:view',

  // Full administrative bypass
  ADMIN_FULL_ACCESS: 'admin:full_access'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// 2. ROLE-TO-PERMISSION MAPPINGS (ALL 18 SUPPORTED ROLES)
// ============================================================================

export const ROLE_PERMISSIONS_MAP: Record<UserRole, Permission[]> = {
  // 1. Full System Admin
  ADMIN: [
    PERMISSIONS.ADMIN_FULL_ACCESS,
    PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE, PERMISSIONS.OBSERVATIONS_VIEW, PERMISSIONS.OBSERVATIONS_REVIEW,
    PERMISSIONS.TOOLBOX_VIEW, PERMISSIONS.TOOLBOX_CONDUCT,
    PERMISSIONS.SWA_TRIGGER, PERMISSIONS.SWA_MANAGE,
    PERMISSIONS.FORMS_BUILDER_VIEW, PERMISSIONS.FORMS_BUILDER_MANAGE,
    PERMISSIONS.EXECUTIVE_BI_VIEW, PERMISSIONS.EXECUTIVE_BOARD_REPORT,
    PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SIMOPS_VIEW, PERMISSIONS.SIMOPS_MANAGE,
    PERMISSIONS.HEAT_STRESS_VIEW, PERMISSIONS.HEAT_STRESS_ENFORCE,
    PERMISSIONS.DIGITAL_TWIN_VIEW, PERMISSIONS.IOT_TELEMETRY_VIEW, PERMISSIONS.IOT_TELEMETRY_MANAGE,
    PERMISSIONS.PTW_VIEW, PERMISSIONS.PTW_CREATE, PERMISSIONS.PTW_APPROVE,
    PERMISSIONS.LOTO_VIEW, PERMISSIONS.LOTO_MANAGE,
    PERMISSIONS.LIFTING_VIEW, PERMISSIONS.LIFTING_APPROVE,
    PERMISSIONS.EXCAVATION_VIEW, PERMISSIONS.EXCAVATION_APPROVE,
    PERMISSIONS.RAMS_VIEW, PERMISSIONS.RAMS_MANAGE,
    PERMISSIONS.JSA_VIEW, PERMISSIONS.JSA_MANAGE,
    PERMISSIONS.HAZARDS_VIEW, PERMISSIONS.HAZARDS_MANAGE,
    PERMISSIONS.COMPLY_FLOW_VIEW, PERMISSIONS.COMPLY_FLOW_MANAGE,
    PERMISSIONS.BOWTIE_VIEW, PERMISSIONS.BOWTIE_MANAGE,
    PERMISSIONS.MOC_VIEW, PERMISSIONS.MOC_MANAGE,
    PERMISSIONS.ESG_VIEW, PERMISSIONS.ESG_MANAGE,
    PERMISSIONS.BCMS_VIEW, PERMISSIONS.BCMS_MANAGE,
    PERMISSIONS.INCIDENTS_VIEW, PERMISSIONS.INCIDENTS_REPORT, PERMISSIONS.INCIDENTS_INVESTIGATE, PERMISSIONS.INCIDENTS_SIGN_OFF,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW, PERMISSIONS.RCA_VIEW, PERMISSIONS.RCA_EXECUTE,
    PERMISSIONS.CAPA_VIEW, PERMISSIONS.CAPA_MANAGE,
    PERMISSIONS.AUDITS_VIEW, PERMISSIONS.AUDITS_MANAGE,
    PERMISSIONS.INSPECTIONS_VIEW, PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.PWA_INSPECTIONS_VIEW, PERMISSIONS.LESSONS_LEARNED_VIEW, PERMISSIONS.LESSONS_LEARNED_MANAGE,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW, PERMISSIONS.CONTRACTOR_PORTAL_MANAGE,
    PERMISSIONS.TRAINING_VIEW, PERMISSIONS.TRAINING_MANAGE,
    PERMISSIONS.HEALTH_VIEW, PERMISSIONS.HEALTH_CLINICAL_VIEW,
    PERMISSIONS.CONNECTED_WORKER_VIEW, PERMISSIONS.PPE_VIEW, PERMISSIONS.PPE_MANAGE,
    PERMISSIONS.TRANSPORT_VIEW, PERMISSIONS.TRANSPORT_MANAGE,
    PERMISSIONS.CHEMICALS_VIEW, PERMISSIONS.CHEMICALS_MANAGE,
    PERMISSIONS.AR_PROCEDURES_VIEW, PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_MANAGE,
    PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.IAM_VIEW, PERMISSIONS.IAM_MANAGE,
    PERMISSIONS.INTEGRATIONS_VIEW, PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.SYSTEM_LOGS_VIEW, PERMISSIONS.DESIGN_SYSTEM_VIEW,
    PERMISSIONS.PRICING_GTM_VIEW, PERMISSIONS.PDO_MOL_WORKFLOW_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 2. Board Director
  Board_Director: [
    PERMISSIONS.EXECUTIVE_BI_VIEW,
    PERMISSIONS.EXECUTIVE_BOARD_REPORT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.ESG_VIEW,
    PERMISSIONS.BCMS_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.SYSTEM_LOGS_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 3. Chief Executive Officer (CEO)
  CEO: [
    PERMISSIONS.EXECUTIVE_BI_VIEW,
    PERMISSIONS.EXECUTIVE_BOARD_REPORT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.ESG_VIEW,
    PERMISSIONS.BCMS_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.SWA_TRIGGER,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.SYSTEM_LOGS_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 4. Head of Group HSE
  Head_Group_HSE: [
    PERMISSIONS.EXECUTIVE_BI_VIEW,
    PERMISSIONS.EXECUTIVE_BOARD_REPORT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SIMOPS_VIEW,
    PERMISSIONS.SIMOPS_MANAGE,
    PERMISSIONS.HEAT_STRESS_VIEW,
    PERMISSIONS.HEAT_STRESS_ENFORCE,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.HAZARDS_MANAGE,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.COMPLY_FLOW_MANAGE,
    PERMISSIONS.BOWTIE_VIEW,
    PERMISSIONS.BOWTIE_MANAGE,
    PERMISSIONS.MOC_VIEW,
    PERMISSIONS.MOC_MANAGE,
    PERMISSIONS.ESG_VIEW,
    PERMISSIONS.ESG_MANAGE,
    PERMISSIONS.BCMS_VIEW,
    PERMISSIONS.BCMS_MANAGE,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.INCIDENTS_INVESTIGATE,
    PERMISSIONS.INCIDENTS_SIGN_OFF,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.RCA_VIEW,
    PERMISSIONS.RCA_EXECUTE,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.CAPA_MANAGE,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.AUDITS_MANAGE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_MANAGE,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.CONNECTED_WORKER_VIEW,
    PERMISSIONS.SYSTEM_LOGS_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.LESSONS_LEARNED_MANAGE,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW,
    PERMISSIONS.PDO_MOL_WORKFLOW_VIEW
  ],

  // 5. Regional HSE Director
  Regional_HSE_Director: [
    PERMISSIONS.EXECUTIVE_BI_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SIMOPS_VIEW,
    PERMISSIONS.HEAT_STRESS_VIEW,
    PERMISSIONS.HEAT_STRESS_ENFORCE,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.HAZARDS_MANAGE,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.BOWTIE_VIEW,
    PERMISSIONS.MOC_VIEW,
    PERMISSIONS.ESG_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_INVESTIGATE,
    PERMISSIONS.INCIDENTS_SIGN_OFF,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.RCA_VIEW,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.CAPA_MANAGE,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.AUDITS_MANAGE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.CONNECTED_WORKER_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW,
    PERMISSIONS.PDO_MOL_WORKFLOW_VIEW
  ],

  // 6. Site HSE Manager
  Site_HSE_Manager: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.OBSERVATIONS_VIEW,
    PERMISSIONS.OBSERVATIONS_REVIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SIMOPS_VIEW,
    PERMISSIONS.SIMOPS_MANAGE,
    PERMISSIONS.HEAT_STRESS_VIEW,
    PERMISSIONS.HEAT_STRESS_ENFORCE,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.PTW_APPROVE,
    PERMISSIONS.LOTO_VIEW,
    PERMISSIONS.LOTO_MANAGE,
    PERMISSIONS.LIFTING_VIEW,
    PERMISSIONS.LIFTING_APPROVE,
    PERMISSIONS.EXCAVATION_VIEW,
    PERMISSIONS.EXCAVATION_APPROVE,
    PERMISSIONS.RAMS_VIEW,
    PERMISSIONS.RAMS_MANAGE,
    PERMISSIONS.JSA_VIEW,
    PERMISSIONS.JSA_MANAGE,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.HAZARDS_MANAGE,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.BOWTIE_VIEW,
    PERMISSIONS.MOC_VIEW,
    PERMISSIONS.MOC_MANAGE,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.INCIDENTS_INVESTIGATE,
    PERMISSIONS.INCIDENTS_SIGN_OFF,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.RCA_VIEW,
    PERMISSIONS.RCA_EXECUTE,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.CAPA_MANAGE,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.AUDITS_MANAGE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.PWA_INSPECTIONS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_MANAGE,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.CONNECTED_WORKER_VIEW,
    PERMISSIONS.CHEMICALS_VIEW,
    PERMISSIONS.CHEMICALS_MANAGE,
    PERMISSIONS.PPE_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.LESSONS_LEARNED_MANAGE,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW,
    PERMISSIONS.PDO_MOL_WORKFLOW_VIEW
  ],

  // 7. Field HSE Officer
  HSE_Officer: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.OBSERVATIONS_VIEW,
    PERMISSIONS.OBSERVATIONS_REVIEW,
    PERMISSIONS.TOOLBOX_VIEW,
    PERMISSIONS.TOOLBOX_CONDUCT,
    PERMISSIONS.SWA_TRIGGER,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.HEAT_STRESS_VIEW,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.LOTO_VIEW,
    PERMISSIONS.JSA_VIEW,
    PERMISSIONS.JSA_MANAGE,
    PERMISSIONS.RAMS_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.HAZARDS_MANAGE,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.INCIDENTS_INVESTIGATE,
    PERMISSIONS.PREDICTIVE_SAFETY_VIEW,
    PERMISSIONS.RCA_VIEW,
    PERMISSIONS.RCA_EXECUTE,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.CAPA_MANAGE,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.PWA_INSPECTIONS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.PPE_VIEW,
    PERMISSIONS.PPE_MANAGE,
    PERMISSIONS.CHEMICALS_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 8. Environmental Officer
  Environmental_Officer: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.OBSERVATIONS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.HEAT_STRESS_VIEW,
    PERMISSIONS.HEAT_STRESS_ENFORCE,
    PERMISSIONS.ESG_VIEW,
    PERMISSIONS.ESG_MANAGE,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.PWA_INSPECTIONS_VIEW,
    PERMISSIONS.CHEMICALS_VIEW,
    PERMISSIONS.CHEMICALS_MANAGE,
    PERMISSIONS.IOT_TELEMETRY_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 9. Project Manager
  Project_Manager: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.OBSERVATIONS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.PTW_CREATE,
    PERMISSIONS.RAMS_VIEW,
    PERMISSIONS.RAMS_MANAGE,
    PERMISSIONS.JSA_VIEW,
    PERMISSIONS.LIFTING_VIEW,
    PERMISSIONS.EXCAVATION_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_MANAGE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.SWA_TRIGGER,
    PERMISSIONS.LESSONS_LEARNED_VIEW
  ],

  // 10. Internal Auditor
  Internal_Auditor: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.AUDITS_MANAGE,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.CAPA_VIEW,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.RCA_VIEW,
    PERMISSIONS.HAZARDS_VIEW,
    PERMISSIONS.BOWTIE_VIEW,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.SYSTEM_LOGS_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 11. Site Supervisor (Permit Issuer)
  Site_Supervisor: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.OBSERVATIONS_VIEW,
    PERMISSIONS.TOOLBOX_VIEW,
    PERMISSIONS.TOOLBOX_CONDUCT,
    PERMISSIONS.SWA_TRIGGER,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SIMOPS_VIEW,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.PTW_APPROVE,
    PERMISSIONS.LOTO_VIEW,
    PERMISSIONS.LOTO_MANAGE,
    PERMISSIONS.LIFTING_VIEW,
    PERMISSIONS.EXCAVATION_VIEW,
    PERMISSIONS.JSA_VIEW,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.PWA_INSPECTIONS_VIEW,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.HEAT_STRESS_VIEW
  ],

  // 12. Frontline Worker
  Worker: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.TOOLBOX_VIEW,
    PERMISSIONS.SWA_TRIGGER,
    PERMISSIONS.PPE_VIEW,
    PERMISSIONS.PWA_INSPECTIONS_VIEW
  ],

  // 13. HR Coordinator
  HR_Coordinator: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.TRAINING_MANAGE,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.LESSONS_LEARNED_VIEW
  ],

  // 14. Legal Team
  Legal_Team: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.COMPLY_FLOW_VIEW,
    PERMISSIONS.COMPLY_FLOW_MANAGE,
    PERMISSIONS.INCIDENTS_VIEW,
    PERMISSIONS.AUDITS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.SYSTEM_LOGS_VIEW,
    PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW
  ],

  // 15. Transport Manager
  Transport_Manager: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TRANSPORT_VIEW,
    PERMISSIONS.TRANSPORT_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.INSPECTIONS_VIEW,
    PERMISSIONS.INSPECTIONS_EXECUTE,
    PERMISSIONS.GIS_MAP_VIEW
  ],

  // 16. Security Officer
  Security_Officer: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.CONTRACTOR_PORTAL_VIEW,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.INCIDENTS_REPORT,
    PERMISSIONS.GIS_MAP_VIEW,
    PERMISSIONS.SWA_TRIGGER
  ],

  // 17. Store Keeper
  Store_Keeper: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.PPE_VIEW,
    PERMISSIONS.PPE_MANAGE,
    PERMISSIONS.CHEMICALS_VIEW,
    PERMISSIONS.CHEMICALS_MANAGE,
    PERMISSIONS.OBSERVATIONS_CREATE
  ],

  // 18. Maintenance Lead
  Maintenance_Lead: [
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_MANAGE,
    PERMISSIONS.LOTO_VIEW,
    PERMISSIONS.LOTO_MANAGE,
    PERMISSIONS.PTW_VIEW,
    PERMISSIONS.PTW_CREATE,
    PERMISSIONS.IOT_TELEMETRY_VIEW,
    PERMISSIONS.DIGITAL_TWIN_VIEW,
    PERMISSIONS.OBSERVATIONS_CREATE,
    PERMISSIONS.SWA_TRIGGER
  ]
};

// ============================================================================
// 3. CENTRAL NAVIGATION DEFINITIONS
// ============================================================================

export interface CentralNavItem {
  id: string;
  view: View;
  labelKey: string;
  subtitle?: string;
  icon: any;
  sectionId: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  requiredPermissions: Permission[];
  permissionMode?: 'any' | 'all'; // Default is 'any'
  badge?: string | number;
  badgeColor?: 'emerald' | 'amber' | 'red' | 'blue';
  params?: any;
  order: number;
  children?: CentralNavItem[];
}

export interface NavSection {
  id: string;
  labelKey: string;
  subtitle?: string;
  items: CentralNavItem[];
}

export const MASTER_NAVIGATION_ITEMS: CentralNavItem[] = [
  // 1. Frontline: My Work & Actions
  {
    id: 'nav-my-work',
    view: View.TASKS,
    icon: CheckSquare,
    labelKey: 'My Work Cockpit',
    subtitle: 'Daily operational tasks, pending approvals & shift handovers',
    sectionId: 'frontline-actions',
    sectionTitle: 'Frontline: My Work & Actions',
    sectionSubtitle: 'Daily tasks, digital forms & Stop Work Authority',
    requiredPermissions: [PERMISSIONS.TASKS_VIEW],
    badge: 'Daily',
    badgeColor: 'blue',
    order: 10
  },
  {
    id: 'nav-swa',
    view: View.WORKFORCE_SAFETY,
    icon: AlertOctagon,
    labelKey: 'Stop Work Authority (SWA)',
    subtitle: 'Immediate dangerous condition stop trigger & escalation',
    sectionId: 'frontline-actions',
    sectionTitle: 'Frontline: My Work & Actions',
    requiredPermissions: [PERMISSIONS.SWA_TRIGGER],
    badge: 'SWA Active',
    badgeColor: 'red',
    order: 20
  },
  {
    id: 'nav-toolbox',
    view: View.TOOLBOX,
    icon: BookOpen,
    labelKey: 'Toolbox Briefings (TBT)',
    subtitle: 'Pre-shift safety briefings & worker sign-off register',
    sectionId: 'frontline-actions',
    sectionTitle: 'Frontline: My Work & Actions',
    requiredPermissions: [PERMISSIONS.TOOLBOX_VIEW],
    badge: 'Shift',
    badgeColor: 'emerald',
    order: 30
  },
  {
    id: 'nav-forms',
    view: View.FORMS_BUILDER,
    icon: FileText,
    labelKey: 'Digital Forms & Submissions',
    subtitle: 'Dynamic safety checklists and field submissions',
    sectionId: 'frontline-actions',
    sectionTitle: 'Frontline: My Work & Actions',
    requiredPermissions: [PERMISSIONS.FORMS_BUILDER_VIEW],
    order: 40
  },

  // 2. HSE Lifecycle: IDENTIFY (Hazards & Unsafe Conditions)
  {
    id: 'nav-hazards',
    view: View.HAZARDS,
    icon: ShieldAlert,
    labelKey: 'Hazard Register',
    subtitle: 'Enterprise hazard database, 5x5 scoring & initial controls',
    sectionId: 'hse-identify',
    sectionTitle: 'Identify: Hazards & Conditions',
    sectionSubtitle: 'Hazard registry, observations, GIS telemetry & live sensors',
    requiredPermissions: [PERMISSIONS.HAZARDS_VIEW],
    badge: 'Active',
    badgeColor: 'red',
    order: 100
  },
  {
    id: 'nav-observations',
    view: View.OBSERVATIONS,
    icon: Eye,
    labelKey: 'Safety Observations',
    subtitle: 'Safe acts, unsafe conditions & positive interventions',
    sectionId: 'hse-identify',
    sectionTitle: 'Identify: Hazards & Conditions',
    requiredPermissions: [PERMISSIONS.OBSERVATIONS_CREATE, PERMISSIONS.OBSERVATIONS_VIEW],
    badge: 'Log',
    badgeColor: 'amber',
    order: 110
  },
  {
    id: 'nav-gis-map',
    view: View.GIS_MAP,
    icon: Compass,
    labelKey: 'Active SIMOPS Map',
    subtitle: 'Multi-site GIS telemetry, asset geofences & hot work zones',
    sectionId: 'hse-identify',
    sectionTitle: 'Identify: Hazards & Conditions',
    requiredPermissions: [PERMISSIONS.GIS_MAP_VIEW],
    badge: 'Live',
    badgeColor: 'emerald',
    order: 120
  },
  {
    id: 'nav-predictive-risk',
    view: View.PREDICTIVE_RISK,
    icon: Thermometer,
    labelKey: 'Heat Stress & Risk Monitor',
    subtitle: 'Thermal index forecasting & mid-day work ban enforcement',
    sectionId: 'hse-identify',
    sectionTitle: 'Identify: Hazards & Conditions',
    requiredPermissions: [PERMISSIONS.HEAT_STRESS_VIEW],
    badge: 'Thermal',
    badgeColor: 'amber',
    order: 130
  },
  {
    id: 'nav-iot-status',
    view: View.IOT_STATUS,
    icon: Wifi,
    labelKey: 'IoT Sensor Telemetry',
    subtitle: 'Fixed H2S gas sensors, noise & environmental gateways',
    sectionId: 'hse-identify',
    sectionTitle: 'Identify: Hazards & Conditions',
    requiredPermissions: [PERMISSIONS.IOT_TELEMETRY_VIEW],
    order: 140
  },

  // 3. HSE Lifecycle: ASSESS (Risk Analysis, SIF Precursors & RCA)
  {
    id: 'nav-predictive-safety',
    view: View.PREDICTIVE_SAFETY,
    icon: TrendingUp,
    labelKey: 'Predictive Safety (SIF Trends)',
    subtitle: 'Serious Injury & Fatality analytics, Campbell Institute pSIF',
    sectionId: 'hse-assess',
    sectionTitle: 'Assess: Risks & Analytics',
    sectionSubtitle: 'SIF predictive analytics, RAMS, JSA & Bowtie barriers',
    requiredPermissions: [PERMISSIONS.PREDICTIVE_SAFETY_VIEW],
    badge: 'SIF AI',
    badgeColor: 'red',
    order: 200
  },
  {
    id: 'nav-rams',
    view: View.RAMS,
    icon: FileText,
    labelKey: 'RAMS Method Statements',
    subtitle: 'Risk assessment method statement builder & reviewer',
    sectionId: 'hse-assess',
    sectionTitle: 'Assess: Risks & Analytics',
    requiredPermissions: [PERMISSIONS.RAMS_VIEW],
    order: 210
  },
  {
    id: 'nav-jsa',
    view: View.JSA,
    icon: ClipboardCheck,
    labelKey: 'Job Safety Analysis (JSA)',
    subtitle: 'Step-by-step task hazard breakdown & critical controls',
    sectionId: 'hse-assess',
    sectionTitle: 'Assess: Risks & Analytics',
    requiredPermissions: [PERMISSIONS.JSA_VIEW],
    order: 220
  },
  {
    id: 'nav-bowtie',
    view: View.BOWTIE,
    icon: GitPullRequest,
    labelKey: 'Bowtie Risk Visualizer',
    subtitle: 'Threat barrier analysis, escalation factors & consequence controls',
    sectionId: 'hse-assess',
    sectionTitle: 'Assess: Risks & Analytics',
    requiredPermissions: [PERMISSIONS.BOWTIE_VIEW],
    order: 230
  },
  {
    id: 'nav-rca',
    view: View.RCA_TOOL,
    icon: GitPullRequest,
    labelKey: 'Root Cause Analysis (RCA)',
    subtitle: '5-Why, Fishbone & TapRoot systematic causal tree',
    sectionId: 'hse-assess',
    sectionTitle: 'Assess: Risks & Analytics',
    requiredPermissions: [PERMISSIONS.RCA_VIEW],
    order: 240
  },

  // 4. HSE Lifecycle: CONTROL (Permits, Isolations & Contractors)
  {
    id: 'nav-permits',
    view: View.PERMIT_TO_WORK,
    icon: FileSignature,
    labelKey: 'Permit Approvals (PTW)',
    subtitle: 'Electronic permit issuance, hot work & confined space',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    sectionSubtitle: 'Permit to Work, LOTO Isolations, SIMOPS & Contractors',
    requiredPermissions: [PERMISSIONS.PTW_VIEW, PERMISSIONS.PTW_APPROVE],
    badge: '18',
    badgeColor: 'blue',
    order: 300,
    children: [
      {
        id: 'nav-loto',
        view: View.LOTO,
        icon: Lock,
        labelKey: 'LOTO Isolations',
        subtitle: 'Lockout/tagout registers, isolation certificates & boundary tracking',
        sectionId: 'hse-control',
        sectionTitle: 'Control: Permits & Isolations',
        requiredPermissions: [PERMISSIONS.LOTO_VIEW],
        order: 310
      },
      {
        id: 'nav-simops-clash',
        view: View.PDO_MOL_WORKFLOW,
        icon: Flame,
        labelKey: 'SIMOPS De-Confliction',
        subtitle: 'Simultaneous operations matrix & hazardous boundary clearance',
        sectionId: 'hse-control',
        sectionTitle: 'Control: Permits & Isolations',
        requiredPermissions: [PERMISSIONS.SIMOPS_VIEW],
        order: 320
      }
    ]
  },
  {
    id: 'nav-lifting',
    view: View.LIFTING,
    icon: Anchor,
    labelKey: 'Lifting Operations',
    subtitle: 'Critical crane lift plans, rigger competency & wind limits',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    requiredPermissions: [PERMISSIONS.LIFTING_VIEW],
    order: 330
  },
  {
    id: 'nav-excavation',
    view: View.EXCAVATION,
    icon: Layers,
    labelKey: 'Excavation Control',
    subtitle: 'Underground utility scans & deep trench safety permits',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    requiredPermissions: [PERMISSIONS.EXCAVATION_VIEW],
    order: 340
  },
  {
    id: 'nav-contractors',
    view: View.CONTRACTOR_PORTAL,
    icon: Briefcase,
    labelKey: 'Contractor Safety Portal',
    subtitle: 'Vendor HSE pre-qualification, gate access & insurance vetting',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    requiredPermissions: [PERMISSIONS.CONTRACTOR_PORTAL_VIEW],
    badge: 'Vetted',
    badgeColor: 'emerald',
    order: 350
  },
  {
    id: 'nav-chemicals',
    view: View.CHEMICALS,
    icon: FlaskConical,
    labelKey: 'Chemical Safety & COSHH',
    subtitle: 'Chemical inventories, SDS data sheets & GHS hazard classifications',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    requiredPermissions: [PERMISSIONS.CHEMICALS_VIEW],
    order: 360
  },
  {
    id: 'nav-ppe',
    view: View.PPE,
    icon: HardHat,
    labelKey: 'PPE Inventory & Allocation',
    subtitle: 'Protective gear lifecycle, replenishment & issuance logs',
    sectionId: 'hse-control',
    sectionTitle: 'Control: Permits & Isolations',
    requiredPermissions: [PERMISSIONS.PPE_VIEW],
    order: 370
  },

  // 5. HSE Lifecycle: MONITOR (Surveillance, Audits & Inspections)
  {
    id: 'nav-audits',
    view: View.SAFETY_AUDIT,
    icon: ShieldCheck,
    labelKey: 'Audits & Field Checks',
    subtitle: 'ISO 45001, Oman MoL MD 286/2008 & PDO Specifications & corporate compliance scoring',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    sectionSubtitle: 'Statutory audits, routine inspections, PWA & computer vision',
    requiredPermissions: [PERMISSIONS.AUDITS_VIEW],
    badge: '98%',
    badgeColor: 'emerald',
    order: 400
  },
  {
    id: 'nav-inspections',
    view: View.INSPECTIONS,
    icon: ClipboardCheck,
    labelKey: 'Site Inspections',
    subtitle: 'Routine facility, equipment & scaffolding walkthroughs',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    requiredPermissions: [PERMISSIONS.INSPECTIONS_VIEW],
    badge: 'Active',
    badgeColor: 'amber',
    order: 410
  },
  {
    id: 'nav-pwa-inspections',
    view: View.PWA_INSPECTIONS,
    icon: Smartphone,
    labelKey: 'Mobile Field Inspections (PWA)',
    subtitle: 'Offline field checklists, GIS heatmaps & camera evidence',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    requiredPermissions: [PERMISSIONS.PWA_INSPECTIONS_VIEW],
    badge: 'Offline',
    badgeColor: 'emerald',
    order: 420
  },
  {
    id: 'nav-wearables',
    view: View.CONNECTED_WORKER,
    icon: Activity,
    labelKey: 'Connected Worker & Vision AI',
    subtitle: 'Computer vision CCTV posture, biometric vitals & ergonomics',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    requiredPermissions: [PERMISSIONS.CONNECTED_WORKER_VIEW],
    badge: 'Vision',
    badgeColor: 'blue',
    order: 430
  },
  {
    id: 'nav-digital-twin',
    view: View.DIGITAL_TWIN,
    icon: Box,
    labelKey: 'Digital Twin 3D Simulator',
    subtitle: '3D facility spatial model & blast evacuation simulator',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    requiredPermissions: [PERMISSIONS.DIGITAL_TWIN_VIEW],
    order: 440
  },
  {
    id: 'nav-maintenance',
    view: View.MAINTENANCE,
    icon: Wrench,
    labelKey: 'Asset Integrity & RUL',
    subtitle: 'Vibration telemetry, predictive failure models & calibration',
    sectionId: 'hse-monitor',
    sectionTitle: 'Monitor: Audits & Surveillance',
    requiredPermissions: [PERMISSIONS.MAINTENANCE_VIEW],
    order: 450
  },

  // 6. HSE Lifecycle: REPORT & LEARN (Incidents, CAPA & Intelligence)
  {
    id: 'nav-incidents',
    view: View.INCIDENT_MANAGEMENT,
    icon: AlertOctagon,
    labelKey: 'Incidents & Triage',
    subtitle: 'Near-miss, injury & environmental release reporting',
    sectionId: 'hse-report-learn',
    sectionTitle: 'Report & Learn: Actions & BI',
    sectionSubtitle: 'Incident triage, CAPA actions, lessons learned & executive BI',
    requiredPermissions: [PERMISSIONS.INCIDENTS_VIEW, PERMISSIONS.INCIDENTS_REPORT],
    badge: 'Triage',
    badgeColor: 'amber',
    order: 500
  },
  {
    id: 'nav-capa',
    view: View.CAPA,
    icon: CheckSquare,
    labelKey: 'CAPA Action Register',
    subtitle: 'Corrective & preventive actions SLA tracking with escalations',
    sectionId: 'hse-report-learn',
    sectionTitle: 'Report & Learn: Actions & BI',
    requiredPermissions: [PERMISSIONS.CAPA_VIEW],
    badge: '5 Open',
    badgeColor: 'blue',
    order: 510
  },
  {
    id: 'nav-lessons-learned',
    view: View.LESSONS_LEARNED,
    icon: BookOpen,
    labelKey: 'Lessons Learned Vault',
    subtitle: 'Safety alerts, bulletin broadcasts & institutional memory',
    sectionId: 'hse-report-learn',
    sectionTitle: 'Report & Learn: Actions & BI',
    requiredPermissions: [PERMISSIONS.LESSONS_LEARNED_VIEW],
    order: 520
  },
  {
    id: 'nav-exec-dashboard',
    view: View.EXECUTIVE_DASHBOARD,
    icon: BarChart3,
    labelKey: 'Executive BI Analytics',
    subtitle: 'C-suite KPI cockpit, LTIFR, TRIR & board reports',
    sectionId: 'hse-report-learn',
    sectionTitle: 'Report & Learn: Actions & BI',
    requiredPermissions: [PERMISSIONS.EXECUTIVE_BI_VIEW],
    badge: 'BI',
    badgeColor: 'blue',
    order: 530
  },
  {
    id: 'nav-esg',
    view: View.ESG,
    icon: Globe,
    labelKey: 'ESG & Carbon Accounting',
    subtitle: 'MSX, MSX & MSX Scope 1, 2, 3 carbon accounting & Net Zero',
    sectionId: 'hse-report-learn',
    sectionTitle: 'Report & Learn: Actions & BI',
    requiredPermissions: [PERMISSIONS.ESG_VIEW],
    badge: 'NetZero',
    badgeColor: 'emerald',
    order: 540
  },

  // 7. Enterprise Governance & System Administration
  {
    id: 'nav-comply-flow',
    view: View.COMPLY_FLOW,
    icon: Scale,
    labelKey: 'Statutory Compliance Register',
    subtitle: 'Oman Royal Decrees & Labour Law, Oman MoL MD 286/2008 & PDO Specifications & Oman MD 286 statutory tracker',
    sectionId: 'enterprise-admin',
    sectionTitle: 'Enterprise Governance & System',
    sectionSubtitle: 'Statutory compliance, IAM, security audit logs & settings',
    requiredPermissions: [PERMISSIONS.COMPLY_FLOW_VIEW],
    badge: 'GCC Law',
    badgeColor: 'emerald',
    order: 600
  },
  {
    id: 'nav-projects',
    view: View.PROJECTS,
    icon: Building2,
    labelKey: 'Sites & Concessions',
    subtitle: 'Sites, concessions, operational zones & GPS boundaries',
    sectionId: 'enterprise-admin',
    sectionTitle: 'Enterprise Governance & System',
    requiredPermissions: [PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_MANAGE],
    order: 610,
    children: [
      {
        id: 'nav-iam',
        view: View.IAM,
        icon: Lock,
        labelKey: 'RBAC Matrix & Accounts',
        subtitle: 'Multi-tenant role-based access control, security policies & SSO',
        sectionId: 'enterprise-admin',
        sectionTitle: 'Enterprise Governance & System',
        requiredPermissions: [PERMISSIONS.IAM_VIEW, PERMISSIONS.IAM_MANAGE],
        badge: 'IAM',
        badgeColor: 'blue',
        order: 620
      },
      {
        id: 'nav-integrations',
        view: View.INTEGRATIONS,
        icon: Wifi,
        labelKey: 'API Integrations',
        subtitle: 'Hardware gateways, ERP and statutory data exchange',
        sectionId: 'enterprise-admin',
        sectionTitle: 'Enterprise Governance & System',
        requiredPermissions: [PERMISSIONS.INTEGRATIONS_VIEW, PERMISSIONS.INTEGRATIONS_MANAGE],
        badge: 'Active',
        badgeColor: 'emerald',
        order: 630
      },
      {
        id: 'nav-system-logs',
        view: View.SYSTEM_LOGS,
        icon: FileClock,
        labelKey: 'Audit Logs & Vault',
        subtitle: 'Tamper-evident operational audit trail & security events',
        sectionId: 'enterprise-admin',
        sectionTitle: 'Enterprise Governance & System',
        requiredPermissions: [PERMISSIONS.SYSTEM_LOGS_VIEW],
        badge: 'RLS',
        badgeColor: 'blue',
        order: 640
      },
      {
        id: 'nav-design-system',
        view: View.DESIGN_SYSTEM,
        icon: Layers,
        labelKey: 'Design System Gallery',
        subtitle: 'Enterprise UI component tokens, contrast guides & badges',
        sectionId: 'enterprise-admin',
        sectionTitle: 'Enterprise Governance & System',
        requiredPermissions: [PERMISSIONS.DESIGN_SYSTEM_VIEW],
        order: 650
      }
    ]
  }
];

// ============================================================================
// 4. CORE PERMISSION EVALUATION ENGINE
// ============================================================================

export function isUserSuspended(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.isSuspended) return true;
  if (user.employmentStatus === 'Suspended' || user.employmentStatus === 'Inactive') return true;
  return false;
}

export function calculateEffectivePermissions(user: UserProfile | null | undefined): Set<string> {
  const result = new Set<string>();
  if (!user) return result;

  // Suspended or inactive users receive ZERO permissions
  if (isUserSuspended(user)) {
    return result;
  }

  // 1. Collect from primary role
  const primaryRolePermissions = ROLE_PERMISSIONS_MAP[user.role] || [];
  primaryRolePermissions.forEach(p => result.add(p));

  // 2. Collect from multi-role assignments if present
  if (user.roles && Array.isArray(user.roles)) {
    for (const r of user.roles) {
      const extraPermissions = ROLE_PERMISSIONS_MAP[r] || [];
      extraPermissions.forEach(p => result.add(p));
    }
  }

  // 3. Add explicitly granted permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach(p => result.add(p));
  }

  // 4. Remove explicitly denied permissions
  if (user.deniedPermissions && Array.isArray(user.deniedPermissions)) {
    user.deniedPermissions.forEach(p => result.delete(p));
  }

  return result;
}

export function canAccessPermission(
  user: UserProfile | null | undefined,
  requiredPermission: Permission | Permission[],
  mode: 'any' | 'all' = 'any'
): boolean {
  if (!user) return false;
  if (isUserSuspended(user)) return false;

  const effective = calculateEffectivePermissions(user);

  // System admin bypass if granted
  if (effective.has(PERMISSIONS.ADMIN_FULL_ACCESS)) {
    return true;
  }

  const reqList = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
  if (reqList.length === 0) return true;

  if (mode === 'all') {
    return reqList.every(p => effective.has(p));
  }
  return reqList.some(p => effective.has(p));
}

// Map each View to its required permissions
export const VIEW_PERMISSION_REQUIREMENTS: Partial<Record<View, Permission[]>> = {
  [View.TASKS]: [PERMISSIONS.TASKS_VIEW],
  [View.OBSERVATIONS]: [PERMISSIONS.OBSERVATIONS_CREATE, PERMISSIONS.OBSERVATIONS_VIEW],
  [View.TOOLBOX]: [PERMISSIONS.TOOLBOX_VIEW],
  [View.WORKFORCE_SAFETY]: [PERMISSIONS.SWA_TRIGGER],
  [View.FORMS_BUILDER]: [PERMISSIONS.FORMS_BUILDER_VIEW],

  [View.EXECUTIVE_DASHBOARD]: [PERMISSIONS.EXECUTIVE_BI_VIEW],
  [View.EXECUTIVE_COMMAND_CENTER]: [PERMISSIONS.EXECUTIVE_BI_VIEW],
  [View.ANALYTICS_REPORTING]: [PERMISSIONS.EXECUTIVE_BI_VIEW],
  [View.GIS_MAP]: [PERMISSIONS.GIS_MAP_VIEW],
  [View.DASHBOARD]: [PERMISSIONS.DASHBOARD_VIEW],
  [View.HSE_OPERATIONS]: [PERMISSIONS.DASHBOARD_VIEW],
  [View.PREDICTIVE_RISK]: [PERMISSIONS.HEAT_STRESS_VIEW],
  [View.DIGITAL_TWIN]: [PERMISSIONS.DIGITAL_TWIN_VIEW],
  [View.IOT_STATUS]: [PERMISSIONS.IOT_TELEMETRY_VIEW],

  [View.PERMIT_TO_WORK]: [PERMISSIONS.PTW_VIEW, PERMISSIONS.PTW_CREATE, PERMISSIONS.PTW_APPROVE],
  [View.PERMITS]: [PERMISSIONS.PTW_VIEW, PERMISSIONS.PTW_CREATE, PERMISSIONS.PTW_APPROVE],
  [View.LOTO]: [PERMISSIONS.LOTO_VIEW],
  [View.PDO_MOL_WORKFLOW]: [PERMISSIONS.SIMOPS_VIEW, PERMISSIONS.PDO_MOL_WORKFLOW_VIEW],
  [View.LIFTING]: [PERMISSIONS.LIFTING_VIEW],
  [View.EXCAVATION]: [PERMISSIONS.EXCAVATION_VIEW],
  [View.RAMS]: [PERMISSIONS.RAMS_VIEW],
  [View.JSA]: [PERMISSIONS.JSA_VIEW],

  [View.HAZARDS]: [PERMISSIONS.HAZARDS_VIEW],
  [View.COMPLY_FLOW]: [PERMISSIONS.COMPLY_FLOW_VIEW],
  [View.COMPLIANCE]: [PERMISSIONS.COMPLY_FLOW_VIEW],
  [View.COMPLIANCE_INTELLIGENCE]: [PERMISSIONS.COMPLY_FLOW_VIEW],
  [View.BOWTIE]: [PERMISSIONS.BOWTIE_VIEW],
  [View.MOC]: [PERMISSIONS.MOC_VIEW],
  [View.ESG]: [PERMISSIONS.ESG_VIEW],
  [View.BUSINESS_CONTINUITY]: [PERMISSIONS.BCMS_VIEW],

  [View.INCIDENT_MANAGEMENT]: [PERMISSIONS.INCIDENTS_VIEW, PERMISSIONS.INCIDENTS_REPORT],
  [View.INCIDENTS]: [PERMISSIONS.INCIDENTS_VIEW, PERMISSIONS.INCIDENTS_REPORT],
  [View.PREDICTIVE_SAFETY]: [PERMISSIONS.PREDICTIVE_SAFETY_VIEW],
  [View.RCA_TOOL]: [PERMISSIONS.RCA_VIEW],
  [View.CAPA]: [PERMISSIONS.CAPA_VIEW],
  [View.SAFETY_AUDIT]: [PERMISSIONS.AUDITS_VIEW],
  [View.AUDITS]: [PERMISSIONS.AUDITS_VIEW],
  [View.INSPECTIONS]: [PERMISSIONS.INSPECTIONS_VIEW],
  [View.PWA_INSPECTIONS]: [PERMISSIONS.PWA_INSPECTIONS_VIEW],
  [View.LESSONS_LEARNED]: [PERMISSIONS.LESSONS_LEARNED_VIEW],

  [View.CONTRACTOR_PORTAL]: [PERMISSIONS.CONTRACTOR_PORTAL_VIEW],
  [View.CONTRACTORS]: [PERMISSIONS.CONTRACTOR_PORTAL_VIEW],
  [View.TRAINING_COMPETENCY]: [PERMISSIONS.TRAINING_VIEW],
  [View.TRAINING]: [PERMISSIONS.TRAINING_VIEW],
  [View.HEALTH]: [PERMISSIONS.HEALTH_VIEW],
  [View.CONNECTED_WORKER]: [PERMISSIONS.CONNECTED_WORKER_VIEW],
  [View.PPE]: [PERMISSIONS.PPE_VIEW],
  [View.TRANSPORT]: [PERMISSIONS.TRANSPORT_VIEW],
  [View.CHEMICALS]: [PERMISSIONS.CHEMICALS_VIEW],
  [View.MAINTENANCE]: [PERMISSIONS.MAINTENANCE_VIEW],
  [View.ENVIRONMENTAL]: [PERMISSIONS.ESG_VIEW, PERMISSIONS.CHEMICALS_VIEW],

  [View.PROJECTS]: [PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PROJECTS_MANAGE],
  [View.IAM]: [PERMISSIONS.IAM_VIEW, PERMISSIONS.IAM_MANAGE],
  [View.GOVERNANCE]: [PERMISSIONS.IAM_VIEW, PERMISSIONS.PROJECTS_VIEW],
  [View.INTEGRATIONS]: [PERMISSIONS.INTEGRATIONS_VIEW],
  [View.SYSTEM_LOGS]: [PERMISSIONS.SYSTEM_LOGS_VIEW],
  [View.DESIGN_SYSTEM]: [PERMISSIONS.DESIGN_SYSTEM_VIEW],
  [View.PRICING_GTM]: [PERMISSIONS.PRICING_GTM_VIEW],
  [View.COMPLIANCE_ASSISTANT]: [PERMISSIONS.COMPLIANCE_ASSISTANT_VIEW]
};

export function canAccessView(user: UserProfile | null | undefined, view: View): boolean {
  if (!user) return false;
  if (isUserSuspended(user)) return false;

  const effective = calculateEffectivePermissions(user);
  if (effective.has(PERMISSIONS.ADMIN_FULL_ACCESS)) {
    return true;
  }

  const req = VIEW_PERMISSION_REQUIREMENTS[view];
  if (!req || req.length === 0) {
    // If no specific requirement, default to true for authenticated active users
    return true;
  }

  // Any of the listed permissions grants view access
  return req.some(p => effective.has(p));
}

// Get the user's primary/default landing view
export function getDefaultLandingView(user: UserProfile | null | undefined): View {
  if (!user) return View.TASKS;

  if (['Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director'].includes(user.role)) {
    return View.EXECUTIVE_DASHBOARD;
  }
  if (user.role === 'Internal_Auditor') {
    return View.SAFETY_AUDIT;
  }
  if (user.role === 'Environmental_Officer') {
    return View.ESG;
  }
  if (user.role === 'Maintenance_Lead') {
    return View.MAINTENANCE;
  }
  if (user.role === 'Transport_Manager') {
    return View.TRANSPORT;
  }
  if (user.role === 'HR_Coordinator') {
    return View.TRAINING_COMPETENCY;
  }
  if (user.role === 'Legal_Team') {
    return View.COMPLY_FLOW;
  }
  if (user.role === 'Site_HSE_Manager') {
    return View.DASHBOARD;
  }
  if (user.role === 'Site_Supervisor') {
    return View.PERMIT_TO_WORK;
  }

  return View.TASKS;
}

// Recursive helper to filter an item and its child submenus by effective permissions
function filterAuthorizedNavItem(
  item: CentralNavItem,
  effective: Set<string>,
  authorizedViews: Set<View>
): CentralNavItem | null {
  const isAdmin = effective.has(PERMISSIONS.ADMIN_FULL_ACCESS);

  // 1. Recursively filter children if present
  let filteredChildren: CentralNavItem[] | undefined;
  if (item.children && item.children.length > 0) {
    filteredChildren = item.children
      .map(child => filterAuthorizedNavItem(child, effective, authorizedViews))
      .filter((child): child is CentralNavItem => child !== null);
  }

  // 2. Check parent's own permissions
  const mode = item.permissionMode || 'any';
  const hasParentPermission = isAdmin || (
    item.requiredPermissions.length === 0
      ? true
      : mode === 'all'
      ? item.requiredPermissions.every(p => effective.has(p))
      : item.requiredPermissions.some(p => effective.has(p))
  );

  const hasAccessibleChildren = !!(filteredChildren && filteredChildren.length > 0);

  // If item itself is authorized OR has at least one accessible child, keep it
  if (hasParentPermission || hasAccessibleChildren) {
    if (hasParentPermission) {
      authorizedViews.add(item.view);
    }
    return {
      ...item,
      children: hasAccessibleChildren ? filteredChildren : undefined
    };
  }

  return null;
}

// Build the authorized navigation sections for a user
export function buildAuthorizedNavigation(user: UserProfile | null | undefined): {
  sections: NavSection[];
  personaBadge: string;
  authorizedViews: Set<View>;
  defaultLandingView: View;
  isSuspended: boolean;
} {
  if (!user) {
    return {
      sections: [],
      personaBadge: 'Guest / Authenticating',
      authorizedViews: new Set<View>(),
      defaultLandingView: View.TASKS,
      isSuspended: false
    };
  }

  const suspended = isUserSuspended(user);
  if (suspended) {
    return {
      sections: [],
      personaBadge: `${(user.role || 'User').replace(/_/g, ' ')} (Suspended)`,
      authorizedViews: new Set<View>(),
      defaultLandingView: View.TASKS,
      isSuspended: true
    };
  }

  const effective = calculateEffectivePermissions(user);
  const authorizedViews = new Set<View>();

  // Filter master items recursively by user's effective permissions
  const authorizedItems: CentralNavItem[] = [];
  for (const item of MASTER_NAVIGATION_ITEMS) {
    const filtered = filterAuthorizedNavItem(item, effective, authorizedViews);
    if (filtered) {
      authorizedItems.push(filtered);
    }
  }

  // Group items into sections preserving order
  const sectionMap = new Map<string, NavSection>();

  for (const item of authorizedItems) {
    if (!sectionMap.has(item.sectionId)) {
      sectionMap.set(item.sectionId, {
        id: item.sectionId,
        labelKey: item.sectionTitle,
        subtitle: item.sectionSubtitle,
        items: []
      });
    }
    sectionMap.get(item.sectionId)!.items.push(item);
  }

  // Filter out any section that has 0 items (enforces clean, non-empty groups)
  const sections = Array.from(sectionMap.values()).filter(sec => sec.items.length > 0);

  // Derive persona badge
  const roleName = (user.role || 'User').replace(/_/g, ' ');
  let personaBadge = roleName;
  if (user.role === 'ADMIN') personaBadge = 'System Admin';
  else if (user.role === 'Worker') personaBadge = 'Frontline Worker';
  else if (user.role === 'Site_Supervisor') personaBadge = 'Permit Issuer / Supervisor';
  else if (user.role === 'HSE_Officer') personaBadge = 'Site HSE Officer';
  else if (user.role === 'Site_HSE_Manager') personaBadge = 'Site HSE Manager';
  else if (['Head_Group_HSE', 'Regional_HSE_Director'].includes(user.role)) personaBadge = 'Executive HSE Directorate';
  else if (['CEO', 'Board_Director'].includes(user.role)) personaBadge = 'C-Suite & Board Governance';

  if (user.roles && user.roles.length > 1) {
    personaBadge += ` (+${user.roles.length - 1} roles)`;
  }

  const defaultLandingView = getDefaultLandingView(user);

  return {
    sections,
    personaBadge,
    authorizedViews,
    defaultLandingView,
    isSuspended: false
  };
}
