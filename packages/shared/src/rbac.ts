/**
 * AD6.Ai Smart HSE Platform — Enterprise RBAC & Segregation of Duties (SoD) Constants
 * Target Standards: Oman Ministry of Labour MD 286/2008 & PDO SP-1143
 */

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
  INCIDENT_SELF_APPROVAL: 'Incident reporter cannot approve their own high-potential incident investigation.',
} as const;

export interface UserContextPersona {
  id: string;
  name: string;
  email: string;
  role: HseRole;
  department: string;
  tenantId: string;
}

export const PERMISSION_MATRIX: Record<HseRole, string[]> = {
  [HSE_ROLES.WORKER]: ['incident:report', 'task:view', 'observation:create'],
  [HSE_ROLES.PERMIT_RECEIVER]: ['incident:report', 'permit:request', 'permit:accept', 'task:update'],
  [HSE_ROLES.SUPERVISOR]: ['incident:report', 'incident:review', 'permit:endorse', 'task:assign', 'jsa:approve'],
  [HSE_ROLES.HSE_OFFICER]: ['incident:investigate', 'audit:conduct', 'capa:create', 'capa:update', 'twl:monitor'],
  [HSE_ROLES.SITE_HSE_MANAGER]: ['incident:close', 'audit:approve', 'capa:verify', 'statutory:submit', 'analytics:view'],
  [HSE_ROLES.AREA_AUTHORITY]: ['permit:issue', 'permit:suspend', 'permit:cancel', 'simops:manage'],
  [HSE_ROLES.AUDITOR]: ['audit:plan', 'audit:conduct', 'audit:report', 'findings:record'],
  [HSE_ROLES.EXECUTIVE]: ['analytics:view', 'executive:dashboard', 'statutory:overview', 'audit:view'],
  [HSE_ROLES.ADMIN]: ['*'],
};
