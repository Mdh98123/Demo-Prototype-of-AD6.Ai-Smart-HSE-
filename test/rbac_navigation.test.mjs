import test from 'node:test';
import assert from 'node:assert/strict';

// Import our permission service logic using tsx or node dynamic import
import { 
  ROLE_PERMISSIONS_MAP, 
  PERMISSIONS, 
  calculateEffectivePermissions, 
  canAccessView, 
  canAccessPermission,
  isUserSuspended, 
  buildAuthorizedNavigation, 
  getDefaultLandingView 
} from '../services/permissionService.ts';
import { View } from '../types.ts';

test('Scenario 1: User with standard permissions (Worker)', () => {
  const workerUser = {
    id: 'u6',
    name: 'Rahul Gupta',
    role: 'Worker',
    department: 'Mechanical Maintenance',
    safetyScore: 450,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(workerUser);
  assert.equal(nav.isSuspended, false);
  assert.equal(nav.personaBadge, 'Frontline Worker');

  // Verify visible views
  assert.ok(nav.authorizedViews.has(View.TASKS), 'Worker must see My Work');
  assert.ok(nav.authorizedViews.has(View.OBSERVATIONS), 'Worker must see Safety Observations');
  assert.ok(nav.authorizedViews.has(View.TOOLBOX), 'Worker must see Toolbox Talks');
  assert.ok(nav.authorizedViews.has(View.WORKFORCE_SAFETY), 'Worker must see SWA');

  // Verify restricted views are NOT visible
  assert.equal(nav.authorizedViews.has(View.IAM), false, 'Worker must NOT see IAM');
  assert.equal(nav.authorizedViews.has(View.PROJECTS), false, 'Worker must NOT see Tenant Settings');
  assert.equal(nav.authorizedViews.has(View.SYSTEM_LOGS), false, 'Worker must NOT see Audit Logs');
  assert.equal(nav.authorizedViews.has(View.PERMIT_TO_WORK), false, 'Worker must NOT see Permit Approvals');

  // Verify route guard returns false
  assert.equal(canAccessView(workerUser, View.IAM), false);
  assert.equal(canAccessView(workerUser, View.SYSTEM_LOGS), false);
  assert.equal(canAccessView(workerUser, View.TASKS), true);
});

test('Scenario 2: User with administrative privileges (ADMIN)', () => {
  const adminUser = {
    id: 'admin',
    name: 'System Admin',
    role: 'ADMIN',
    department: 'Digital Safety Infrastructure',
    safetyScore: 2500,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(adminUser);
  assert.equal(nav.isSuspended, false);
  assert.equal(nav.personaBadge, 'System Admin');

  // Admin must see all key sections
  assert.ok(nav.authorizedViews.has(View.IAM));
  assert.ok(nav.authorizedViews.has(View.PROJECTS));
  assert.ok(nav.authorizedViews.has(View.SYSTEM_LOGS));
  assert.ok(nav.authorizedViews.has(View.EXECUTIVE_DASHBOARD));
  assert.ok(nav.authorizedViews.has(View.PERMIT_TO_WORK));

  assert.equal(canAccessView(adminUser, View.IAM), true);
  assert.equal(canAccessView(adminUser, View.SYSTEM_LOGS), true);
});

test('Scenario 3: User with restricted privileges (Security Officer & Store Keeper)', () => {
  const securityUser = {
    id: 'sec_1',
    name: 'Tariq Al-Hashemi',
    role: 'Security_Officer',
    department: 'Asset Protection',
    safetyScore: 300,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(securityUser);
  // Security officer sees gate access and emergency, but NOT financial ESG or PTW approvals
  assert.ok(nav.authorizedViews.has(View.CONTRACTOR_PORTAL));
  assert.ok(nav.authorizedViews.has(View.GIS_MAP));
  assert.equal(nav.authorizedViews.has(View.IAM), false);
  assert.equal(nav.authorizedViews.has(View.ESG), false);
  assert.equal(nav.authorizedViews.has(View.PERMIT_TO_WORK), false);
});

test('Scenario 4: User with multiple assigned roles (Worker + Site_Supervisor)', () => {
  const multiRoleUser = {
    id: 'u_multi',
    name: 'Multi Role Lead',
    role: 'Worker',
    roles: ['Worker', 'Site_Supervisor'],
    department: 'Field Operations',
    safetyScore: 500,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(multiRoleUser);
  // Must inherit from BOTH Worker AND Site_Supervisor
  assert.ok(nav.authorizedViews.has(View.TASKS), 'Inherited from Worker');
  assert.ok(nav.authorizedViews.has(View.PERMIT_TO_WORK), 'Inherited from Site_Supervisor');
  assert.ok(nav.authorizedViews.has(View.LOTO), 'Inherited from Site_Supervisor');
  assert.ok(nav.authorizedViews.has(View.SIMOPS_VIEW || View.ADNOC_OSHAD), 'Inherited from Site_Supervisor');

  // But still cannot access ADMIN views
  assert.equal(nav.authorizedViews.has(View.IAM), false);
  assert.equal(nav.authorizedViews.has(View.PROJECTS), false);
});

test('Scenario 5: User with a newly granted permission', () => {
  const workerWithPtw = {
    id: 'u6_upgraded',
    name: 'Rahul Gupta',
    role: 'Worker',
    permissions: [PERMISSIONS.PTW_APPROVE],
    department: 'Mechanical Maintenance',
    safetyScore: 450,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(workerWithPtw);
  // User should now be granted access to PTW
  assert.ok(nav.authorizedViews.has(View.PERMIT_TO_WORK), 'Explicitly granted PTW_APPROVE allows access');
  assert.equal(canAccessView(workerWithPtw, View.PERMIT_TO_WORK), true);

  // Still denied IAM
  assert.equal(canAccessView(workerWithPtw, View.IAM), false);
});

test('Scenario 6: User whose permission has been revoked / explicitly denied', () => {
  const supervisorRevoked = {
    id: 'u7_revoked',
    name: 'Marcus Chen',
    role: 'Site_Supervisor',
    deniedPermissions: [PERMISSIONS.PTW_APPROVE],
    department: 'Infrastructure & Power',
    safetyScore: 820,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const effective = calculateEffectivePermissions(supervisorRevoked);
  assert.equal(effective.has(PERMISSIONS.PTW_APPROVE), false, 'PTW_APPROVE must be removed by denial');
});

test('Scenario 7: User with an inactive or suspended account', () => {
  const suspendedUser = {
    id: 'u_suspended',
    name: 'Suspended Worker',
    role: 'Worker',
    isSuspended: true,
    employmentStatus: 'Suspended',
    department: 'Maintenance',
    safetyScore: 0,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  assert.equal(isUserSuspended(suspendedUser), true);
  const effective = calculateEffectivePermissions(suspendedUser);
  assert.equal(effective.size, 0, 'Suspended user must receive ZERO effective permissions');

  const nav = buildAuthorizedNavigation(suspendedUser);
  assert.equal(nav.isSuspended, true);
  assert.equal(nav.sections.length, 0, 'Suspended user must have 0 visible sections');
  assert.equal(canAccessView(suspendedUser, View.TASKS), false, 'Suspended user route access must be blocked');
});

test('Scenario 8: Direct route guard enforcement for unauthorized URL', () => {
  const workerUser = {
    id: 'u6',
    name: 'Rahul Gupta',
    role: 'Worker',
    department: 'Mechanical Maintenance',
    safetyScore: 450,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  // Attempt to access admin routes directly
  assert.equal(canAccessView(workerUser, View.IAM), false);
  assert.equal(canAccessView(workerUser, View.SYSTEM_LOGS), false);
  assert.equal(canAccessView(workerUser, View.PROJECTS), false);
  assert.equal(canAccessView(workerUser, View.EXECUTIVE_DASHBOARD), false);

  // Check default safe landing
  assert.equal(getDefaultLandingView(workerUser), View.TASKS);
});

test('Scenario 9: Internal Auditor role permissions boundary', () => {
  const auditorUser = {
    id: 'u12',
    name: 'Alice Smith',
    role: 'Internal_Auditor',
    department: 'Quality Assurance',
    safetyScore: 280,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(auditorUser);
  // Auditor can see Audits, Inspections, CAPA, Incident records, System Logs, Compliance
  assert.ok(nav.authorizedViews.has(View.SAFETY_AUDIT));
  assert.ok(nav.authorizedViews.has(View.INSPECTIONS));
  assert.ok(nav.authorizedViews.has(View.CAPA));
  assert.ok(nav.authorizedViews.has(View.INCIDENT_MANAGEMENT));
  assert.ok(nav.authorizedViews.has(View.SYSTEM_LOGS));
  assert.ok(nav.authorizedViews.has(View.COMPLY_FLOW));

  // Auditor CANNOT issue/approve PTW permits or manage IAM/Tenants
  assert.equal(nav.authorizedViews.has(View.PERMIT_TO_WORK), false);
  assert.equal(nav.authorizedViews.has(View.IAM), false);
  assert.equal(nav.authorizedViews.has(View.PROJECTS), false);

  assert.equal(getDefaultLandingView(auditorUser), View.SAFETY_AUDIT);
});

test('Scenario 10: Environmental Officer specialized permissions', () => {
  const envUser = {
    id: 'u10',
    name: 'Khalid Al-Dhaheri',
    role: 'Environmental_Officer',
    department: 'Sustainability & Compliance',
    safetyScore: 420,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  };

  const nav = buildAuthorizedNavigation(envUser);
  // Sees ESG & Carbon, Environmental, Heat Stress, Chemicals
  assert.ok(nav.authorizedViews.has(View.ESG));
  assert.ok(nav.authorizedViews.has(View.CHEMICALS));
  assert.ok(nav.authorizedViews.has(View.PREDICTIVE_RISK));

  // Does NOT see crane lifting, excavation permits, or IAM
  assert.equal(nav.authorizedViews.has(View.LIFTING), false);
  assert.equal(nav.authorizedViews.has(View.EXCAVATION), false);
  assert.equal(nav.authorizedViews.has(View.IAM), false);

  assert.equal(getDefaultLandingView(envUser), View.ESG);
});

test('Scenario 11: Server-side authorization check simulation', () => {
  const verifyAccessServerSide = (user, requestedView, requestedPermission) => {
    if (!user || isUserSuspended(user)) {
      return { status: 403, authorized: false, reason: 'Suspended' };
    }
    if (user.role === 'ADMIN' && (!user.deniedPermissions || !user.deniedPermissions.includes(requestedPermission))) {
      return { status: 200, authorized: true, role: user.role };
    }
    const effective = calculateEffectivePermissions(user);
    if (requestedPermission) {
      if (effective.has(requestedPermission) || effective.has('admin:full_access')) {
        return { status: 200, authorized: true };
      }
      return { status: 403, authorized: false, reason: 'Forbidden' };
    }
    if (requestedView) {
      if (canAccessView(user, requestedView)) {
        return { status: 200, authorized: true };
      }
      return { status: 403, authorized: false, reason: 'Forbidden' };
    }
    return { status: 200, authorized: true };
  };

  const worker = { id: 'u6', name: 'Rahul', role: 'Worker' };
  const admin = { id: 'adm', name: 'Admin', role: 'ADMIN' };

  // Worker accessing IAM -> 403
  assert.equal(verifyAccessServerSide(worker, View.IAM, PERMISSIONS.IAM_MANAGE).status, 403);
  assert.equal(verifyAccessServerSide(worker, View.IAM, PERMISSIONS.IAM_MANAGE).authorized, false);

  // Worker accessing Tasks -> 200
  assert.equal(verifyAccessServerSide(worker, View.TASKS, PERMISSIONS.TASKS_VIEW).status, 200);
  assert.equal(verifyAccessServerSide(worker, View.TASKS, PERMISSIONS.TASKS_VIEW).authorized, true);

  // Admin accessing IAM -> 200
  assert.equal(verifyAccessServerSide(admin, View.IAM, PERMISSIONS.IAM_MANAGE).status, 200);
  assert.equal(verifyAccessServerSide(admin, View.IAM, PERMISSIONS.IAM_MANAGE).authorized, true);
});

test('Scenario 12: Empty section suppression rule', () => {
  const workerUser = { id: 'u6', name: 'Worker', role: 'Worker' };
  const nav = buildAuthorizedNavigation(workerUser);

  // For a frontline worker, 'enterprise-admin' section has 0 permitted items and MUST be omitted!
  const hasAdminSection = nav.sections.some(sec => sec.id === 'enterprise-admin');
  assert.equal(hasAdminSection, false, 'Parent menu group enterprise-admin must be suppressed when 0 child items permitted');

  // Verify all returned sections have at least 1 item
  for (const sec of nav.sections) {
    assert.ok(sec.items.length > 0, `Section ${sec.id} must not be empty`);
  }
});

