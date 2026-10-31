/**
 * AD6.Ai Smart HSE Platform — Enterprise RBAC & Segregation of Duties (SoD) Constants
 * Target Standards: Oman Ministry of Labour MD 286/2008, Royal Decree 53/2023, & PDO SP-1143
 */

export enum EnterpriseRole {
  FIELD_WORKER = 'field_worker',
  SUPERVISOR = 'supervisor',
  HSE_OFFICER = 'hse_officer',
  CONTRACTOR_ADMIN = 'contractor_admin',
  SITE_MANAGER = 'site_manager',
  GROUP_HSE_DIRECTOR = 'group_hse_director',
  AUDITOR_READONLY = 'auditor_readonly',
  TENANT_ADMIN = 'tenant_admin'
}

export enum Permission {
  // Incidents
  INCIDENT_READ = 'incident:read',
  INCIDENT_CREATE = 'incident:create',
  INCIDENT_UPDATE = 'incident:update',
  INCIDENT_DELETE = 'incident:delete',
  INCIDENT_APPROVE = 'incident:approve',

  // CAPA
  CAPA_READ = 'capa:read',
  CAPA_CREATE = 'capa:create',
  CAPA_UPDATE = 'capa:update',
  CAPA_DELETE = 'capa:delete',
  CAPA_CLOSE = 'capa:close',

  // PTW
  PERMIT_READ = 'permit:read',
  PERMIT_CREATE = 'permit:create',
  PERMIT_UPDATE = 'permit:update',
  PERMIT_DELETE = 'permit:delete',
  PERMIT_ISSUE = 'permit:issue',

  // Inspections
  INSPECTION_READ = 'inspection:read',
  INSPECTION_CREATE = 'inspection:create',
  INSPECTION_UPDATE = 'inspection:update',
  INSPECTION_DELETE = 'inspection:delete',

  // Contractors
  CONTRACTOR_READ = 'contractor:read',
  CONTRACTOR_CREATE = 'contractor:create',
  CONTRACTOR_UPDATE = 'contractor:update',
  CONTRACTOR_DELETE = 'contractor:delete',

  // Documents
  DOCUMENT_READ = 'document:read',
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',

  // Training
  TRAINING_READ = 'training:read',
  TRAINING_CREATE = 'training:create',
  TRAINING_UPDATE = 'training:update',
  TRAINING_DELETE = 'training:delete',

  // Observations
  OBSERVATION_READ = 'observation:read',
  OBSERVATION_CREATE = 'observation:create',

  // Statutory & Compliance
  STATUTORY_CLOCK_ACKNOWLEDGE = 'statutory:acknowledge',
  STATUTORY_SUBMIT = 'statutory:submit',

  // RBAC & Administration
  RBAC_ASSIGN = 'rbac:assign',
  DELEGATION_MANAGE = 'delegation:manage',
  SOD_MANAGE = 'sod:manage',
  ESCALATION_MANAGE = 'escalation:manage',
  AUDIT_READ = 'audit:read',
  AUDIT_VERIFY = 'audit:verify',
  AI_OUTPUT_READ = 'ai:read',
  AI_OUTPUT_CREATE = 'ai:create',
  AI_GATE_CONFIRM = 'ai:confirm',
  ADMIN_FULL_ACCESS = '*'
}

export const MFA_REQUIRED_ROLES = new Set<string>([
  EnterpriseRole.TENANT_ADMIN,
  EnterpriseRole.GROUP_HSE_DIRECTOR,
  EnterpriseRole.SITE_MANAGER,
  'Admin',
  'ADMIN',
  'tenant_admin',
  'group_hse_director',
  'site_manager'
]);

export const ROLE_PERMISSIONS_MAPPING: Record<EnterpriseRole, Permission[]> = {
  [EnterpriseRole.FIELD_WORKER]: [
    Permission.INCIDENT_READ,
    Permission.INCIDENT_CREATE,
    Permission.OBSERVATION_READ,
    Permission.OBSERVATION_CREATE,
    Permission.PERMIT_READ,
    Permission.DOCUMENT_READ,
    Permission.TRAINING_READ,
    Permission.AI_OUTPUT_READ
  ],
  [EnterpriseRole.SUPERVISOR]: [
    Permission.INCIDENT_READ,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_UPDATE,
    Permission.OBSERVATION_READ,
    Permission.OBSERVATION_CREATE,
    Permission.PERMIT_READ,
    Permission.PERMIT_CREATE,
    Permission.PERMIT_UPDATE,
    Permission.PERMIT_ISSUE,
    Permission.INSPECTION_READ,
    Permission.INSPECTION_CREATE,
    Permission.DOCUMENT_READ,
    Permission.TRAINING_READ,
    Permission.AI_OUTPUT_READ,
    Permission.AI_OUTPUT_CREATE,
    Permission.AI_GATE_CONFIRM
  ],
  [EnterpriseRole.HSE_OFFICER]: [
    Permission.INCIDENT_READ,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_UPDATE,
    Permission.CAPA_READ,
    Permission.CAPA_CREATE,
    Permission.CAPA_UPDATE,
    Permission.PERMIT_READ,
    Permission.INSPECTION_READ,
    Permission.INSPECTION_CREATE,
    Permission.INSPECTION_UPDATE,
    Permission.CONTRACTOR_READ,
    Permission.DOCUMENT_READ,
    Permission.TRAINING_READ,
    Permission.TRAINING_CREATE,
    Permission.STATUTORY_CLOCK_ACKNOWLEDGE,
    Permission.AUDIT_READ,
    Permission.AI_OUTPUT_READ,
    Permission.AI_OUTPUT_CREATE,
    Permission.AI_GATE_CONFIRM
  ],
  [EnterpriseRole.CONTRACTOR_ADMIN]: [
    Permission.CONTRACTOR_READ,
    Permission.CONTRACTOR_CREATE,
    Permission.CONTRACTOR_UPDATE,
    Permission.TRAINING_READ,
    Permission.TRAINING_CREATE,
    Permission.DOCUMENT_READ,
    Permission.INCIDENT_CREATE,
    Permission.PERMIT_READ,
    Permission.AI_OUTPUT_READ
  ],
  [EnterpriseRole.SITE_MANAGER]: [
    Permission.INCIDENT_READ,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_UPDATE,
    Permission.INCIDENT_APPROVE,
    Permission.CAPA_READ,
    Permission.CAPA_CREATE,
    Permission.CAPA_UPDATE,
    Permission.CAPA_CLOSE,
    Permission.PERMIT_READ,
    Permission.PERMIT_CREATE,
    Permission.PERMIT_UPDATE,
    Permission.PERMIT_ISSUE,
    Permission.INSPECTION_READ,
    Permission.INSPECTION_CREATE,
    Permission.INSPECTION_UPDATE,
    Permission.CONTRACTOR_READ,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_CREATE,
    Permission.TRAINING_READ,
    Permission.STATUTORY_CLOCK_ACKNOWLEDGE,
    Permission.DELEGATION_MANAGE,
    Permission.AUDIT_READ,
    Permission.AI_OUTPUT_READ,
    Permission.AI_OUTPUT_CREATE,
    Permission.AI_GATE_CONFIRM
  ],
  [EnterpriseRole.GROUP_HSE_DIRECTOR]: [
    Permission.INCIDENT_READ,
    Permission.INCIDENT_APPROVE,
    Permission.CAPA_READ,
    Permission.CAPA_CLOSE,
    Permission.PERMIT_READ,
    Permission.INSPECTION_READ,
    Permission.CONTRACTOR_READ,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_UPDATE,
    Permission.TRAINING_READ,
    Permission.STATUTORY_CLOCK_ACKNOWLEDGE,
    Permission.STATUTORY_SUBMIT,
    Permission.DELEGATION_MANAGE,
    Permission.ESCALATION_MANAGE,
    Permission.SOD_MANAGE,
    Permission.AUDIT_READ,
    Permission.AUDIT_VERIFY,
    Permission.AI_OUTPUT_READ,
    Permission.AI_OUTPUT_CREATE,
    Permission.AI_GATE_CONFIRM
  ],
  [EnterpriseRole.AUDITOR_READONLY]: [
    Permission.INCIDENT_READ,
    Permission.CAPA_READ,
    Permission.PERMIT_READ,
    Permission.INSPECTION_READ,
    Permission.CONTRACTOR_READ,
    Permission.DOCUMENT_READ,
    Permission.TRAINING_READ,
    Permission.AUDIT_READ,
    Permission.AUDIT_VERIFY,
    Permission.AI_OUTPUT_READ
  ],
  [EnterpriseRole.TENANT_ADMIN]: [
    Permission.ADMIN_FULL_ACCESS
  ]
};

// Backwards-compatible legacy role aliases
export const HSE_ROLES = {
  WORKER: 'Worker',
  SUPERVISOR: 'Supervisor',
  HSE_OFFICER: 'HSE Officer',
  SITE_HSE_MANAGER: 'Site HSE Manager',
  AREA_AUTHORITY: 'Area Authority',
  PERMIT_RECEIVER: 'Permit Receiver',
  AUDITOR: 'Auditor',
  EXECUTIVE: 'Executive',
  ADMIN: 'Admin',
} as const;

export type HseRole = typeof HSE_ROLES[keyof typeof HSE_ROLES];

export const SOD_INVARIANTS = {
  PERMIT_SIGNATORY_COLLISION: 'Permit Receiver cannot self-authorize as Area Authority / Issuer (PDO SP-1143 Section 4.2).',
  CAPA_VERIFIER_COLLISION: 'Action Owner cannot self-verify and close their own CAPA (ISO 45001 / GCC Enterprise Safety Standard).',
  INCIDENT_SELF_APPROVAL: 'Incident reporter cannot approve their own high-potential incident investigation (Oman MD 286/2008).',
  ROLE_SELF_GRANT: 'Users cannot grant themselves a security role (Principle of Least Privilege).',
} as const;

export interface UserContextPersona {
  id: string;
  name: string;
  email: string;
  role: HseRole | EnterpriseRole | string;
  department: string;
  tenantId: string;
}

export const PERMISSION_MATRIX: Record<string, string[]> = {
  [HSE_ROLES.WORKER]: ['incident:report', 'task:view', 'observation:create', 'incident:read', 'permit:read', 'document:read', 'training:read'],
  [HSE_ROLES.PERMIT_RECEIVER]: ['incident:report', 'permit:request', 'permit:accept', 'task:update', 'incident:read', 'permit:read', 'document:read'],
  [HSE_ROLES.SUPERVISOR]: ['incident:report', 'incident:review', 'permit:endorse', 'task:assign', 'jsa:approve', 'incident:read', 'incident:create', 'incident:update', 'permit:read', 'permit:create', 'permit:update', 'permit:issue', 'inspection:read', 'inspection:create', 'document:read', 'training:read'],
  [HSE_ROLES.HSE_OFFICER]: ['incident:investigate', 'audit:conduct', 'capa:create', 'capa:update', 'twl:monitor', 'incident:read', 'incident:create', 'incident:update', 'capa:read', 'permit:read', 'inspection:read', 'inspection:create', 'inspection:update', 'contractor:read', 'document:read', 'training:read', 'training:create', 'statutory:acknowledge', 'audit:read'],
  [HSE_ROLES.SITE_HSE_MANAGER]: ['incident:close', 'audit:approve', 'capa:verify', 'statutory:submit', 'analytics:view', 'incident:read', 'incident:create', 'incident:update', 'incident:approve', 'capa:read', 'capa:create', 'capa:update', 'capa:close', 'permit:read', 'permit:create', 'permit:update', 'permit:issue', 'inspection:read', 'inspection:create', 'inspection:update', 'contractor:read', 'document:read', 'document:create', 'training:read', 'statutory:acknowledge', 'delegation:manage', 'audit:read'],
  [HSE_ROLES.AREA_AUTHORITY]: ['permit:issue', 'permit:suspend', 'permit:cancel', 'simops:manage', 'permit:read', 'permit:update'],
  [HSE_ROLES.AUDITOR]: ['audit:plan', 'audit:conduct', 'audit:report', 'findings:record', 'incident:read', 'capa:read', 'permit:read', 'inspection:read', 'contractor:read', 'document:read', 'training:read', 'audit:read', 'audit:verify'],
  [HSE_ROLES.EXECUTIVE]: ['analytics:view', 'executive:dashboard', 'statutory:overview', 'audit:view', 'incident:read', 'incident:approve', 'capa:read', 'capa:close', 'permit:read', 'inspection:read', 'contractor:read', 'document:read', 'training:read', 'statutory:acknowledge', 'statutory:submit', 'delegation:manage', 'escalation:manage', 'sod:manage', 'audit:read', 'audit:verify'],
  [HSE_ROLES.ADMIN]: ['*'],
  ...Object.fromEntries(
    Object.entries(ROLE_PERMISSIONS_MAPPING).map(([role, perms]) => [role, perms as string[]])
  )
};
