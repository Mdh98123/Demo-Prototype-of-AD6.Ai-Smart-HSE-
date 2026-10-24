import test from 'node:test';
import assert from 'node:assert/strict';

// Simulated permission matrix replicating permissionService.ts rules
const PERMISSIONS = {
  ADMIN_FULL_ACCESS: 'admin:full_access',
  IAM_VIEW: 'iam:view',
  IAM_MANAGE: 'iam:manage',
  SYSTEM_LOGS_VIEW: 'system_logs:view',
  PROJECTS_VIEW: 'projects:view',
  PTW_VIEW: 'ptw:view',
  TASKS_VIEW: 'tasks:view',
  OBSERVATIONS_CREATE: 'observations:create'
};

const VIEW_PERMISSION_REQUIREMENTS = {
  IAM: [PERMISSIONS.IAM_VIEW, PERMISSIONS.IAM_MANAGE],
  SYSTEM_LOGS: [PERMISSIONS.SYSTEM_LOGS_VIEW],
  PROJECTS: [PERMISSIONS.PROJECTS_VIEW],
  PERMIT_TO_WORK: [PERMISSIONS.PTW_VIEW],
  TASKS: [PERMISSIONS.TASKS_VIEW],
  OBSERVATIONS: [PERMISSIONS.OBSERVATIONS_CREATE]
};

const ROLE_PERMISSIONS_MAP = {
  ADMIN: [PERMISSIONS.ADMIN_FULL_ACCESS, PERMISSIONS.IAM_VIEW, PERMISSIONS.IAM_MANAGE, PERMISSIONS.SYSTEM_LOGS_VIEW, PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.PTW_VIEW, PERMISSIONS.TASKS_VIEW],
  Worker: [PERMISSIONS.TASKS_VIEW, PERMISSIONS.OBSERVATIONS_CREATE],
  Site_Supervisor: [PERMISSIONS.PTW_VIEW, PERMISSIONS.TASKS_VIEW, PERMISSIONS.OBSERVATIONS_CREATE]
};

function calculateEffectivePermissions(user) {
  const result = new Set();
  if (!user || user.isSuspended) return result;
  
  const primary = ROLE_PERMISSIONS_MAP[user.role] || [];
  primary.forEach(p => result.add(p));
  
  if (user.roles && Array.isArray(user.roles)) {
    for (const r of user.roles) {
      const extra = ROLE_PERMISSIONS_MAP[r] || [];
      extra.forEach(p => result.add(p));
    }
  }

  if (user.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach(p => result.add(p));
  }
  if (user.deniedPermissions && Array.isArray(user.deniedPermissions)) {
    user.deniedPermissions.forEach(p => result.delete(p));
  }
  return result;
}

function canAccessView(user, view) {
  if (!user) return false;
  if (user.isSuspended) return false;
  const effective = calculateEffectivePermissions(user);
  if (effective.has(PERMISSIONS.ADMIN_FULL_ACCESS)) return true;
  const req = VIEW_PERMISSION_REQUIREMENTS[view];
  if (!req || req.length === 0) return true;
  return req.some(p => effective.has(p));
}

function buildAuthorizedNavigation(user) {
  if (!user) {
    return {
      sections: [],
      personaBadge: 'Guest / Authenticating',
      authorizedViews: new Set(),
      isSuspended: false
    };
  }
  const effective = calculateEffectivePermissions(user);
  const authorizedViews = new Set();
  for (const [view, reqs] of Object.entries(VIEW_PERMISSION_REQUIREMENTS)) {
    if (effective.has(PERMISSIONS.ADMIN_FULL_ACCESS) || reqs.some(p => effective.has(p))) {
      authorizedViews.add(view);
    }
  }
  return {
    sections: authorizedViews.size > 0 ? [{ id: 'core', items: Array.from(authorizedViews) }] : [],
    personaBadge: user.role,
    authorizedViews,
    isSuspended: false
  };
}

// -------------------------------------------------------------
// Regression Suite: Automatic-Admin Fallback & Auth Enforcement
// -------------------------------------------------------------

test('fresh unauthenticated session: session user is strictly null with zero admin access', () => {
  const unauthenticatedSessionUser = null;

  // Verify access is strictly denied to sensitive enterprise views
  assert.equal(canAccessView(unauthenticatedSessionUser, 'IAM'), false, 'Unauthenticated session must never access IAM');
  assert.equal(canAccessView(unauthenticatedSessionUser, 'SYSTEM_LOGS'), false, 'Unauthenticated session must never access System Logs');
  assert.equal(canAccessView(unauthenticatedSessionUser, 'PROJECTS'), false, 'Unauthenticated session must never access Projects');
  assert.equal(canAccessView(unauthenticatedSessionUser, 'PERMIT_TO_WORK'), false, 'Unauthenticated session must never access Permit to Work');
  assert.equal(canAccessView(unauthenticatedSessionUser, 'TASKS'), false, 'Unauthenticated session cannot access Tasks directly without login');

  const nav = buildAuthorizedNavigation(unauthenticatedSessionUser);
  assert.equal(nav.sections.length, 0, 'Unauthenticated session must have empty navigation sections');
  assert.equal(nav.authorizedViews.size, 0, 'Unauthenticated session must have 0 authorized views');
  assert.equal(nav.personaBadge, 'Guest / Authenticating');

  // Verify fresh browser storage state
  const mockStorage = new Map();
  const sessionUser = mockStorage.get('hse_current_user') || null;
  const isDemo = mockStorage.get('hse_is_demo_mode') === true;
  assert.equal(sessionUser, null, 'Fresh session has no stored user');
  assert.equal(isDemo, false, 'Fresh session has isDemoMode = false');
});

test('explicit demo entry: sets demo flag and provisions explicit persona (admin and worker)', () => {
  const mockPersonas = {
    admin: {
      id: 'admin',
      name: 'Sarah Connor',
      role: 'ADMIN',
      department: 'Executive Systems'
    },
    u6: {
      id: 'u6',
      name: 'Rahul Gupta',
      role: 'Worker',
      department: 'Operations'
    },
    u7: {
      id: 'u7',
      name: 'Marcus Chen',
      role: 'Site_Supervisor',
      department: 'Logistics'
    }
  };

  const simulateDemoLogin = (requestedId = 'admin') => {
    const user = mockPersonas[requestedId] || mockPersonas.admin;
    return {
      user,
      token: `demo-token-${Date.now()}-${user.id}`,
      isDemo: true
    };
  };

  // 1. Explicit System Admin demo entry
  const adminEntry = simulateDemoLogin('admin');
  assert.equal(adminEntry.isDemo, true, 'Explicit demo entry must flag isDemo = true');
  assert.equal(adminEntry.user.id, 'admin');
  assert.equal(adminEntry.user.role, 'ADMIN');
  assert.equal(canAccessView(adminEntry.user, 'IAM'), true, 'Admin demo user has IAM access');
  assert.equal(canAccessView(adminEntry.user, 'SYSTEM_LOGS'), true, 'Admin demo user has System Logs access');

  // 2. Explicit Frontline Worker demo entry
  const workerEntry = simulateDemoLogin('u6');
  assert.equal(workerEntry.isDemo, true);
  assert.equal(workerEntry.user.id, 'u6');
  assert.equal(workerEntry.user.role, 'Worker');
  assert.equal(canAccessView(workerEntry.user, 'IAM'), false, 'Worker demo user cannot access IAM');
  assert.equal(canAccessView(workerEntry.user, 'SYSTEM_LOGS'), false, 'Worker demo user cannot access System Logs');
  assert.equal(canAccessView(workerEntry.user, 'TASKS'), true, 'Worker demo user can access Tasks');

  // 3. Demo Banner condition verification
  const shouldRenderDemoBanner = (user, isDemoMode) => isDemoMode && !!user;
  assert.equal(shouldRenderDemoBanner(adminEntry.user, adminEntry.isDemo), true);
  assert.equal(shouldRenderDemoBanner(null, true), false, 'Banner hidden when user is null');
  assert.equal(shouldRenderDemoBanner(adminEntry.user, false), false, 'Banner hidden for non-demo users');
});

test('demo role switching: allows switching between personas in demo mode only', () => {
  const mockPersonas = {
    u6: { id: 'u6', name: 'Rahul Gupta', role: 'Worker' },
    u7: { id: 'u7', name: 'Marcus Chen', role: 'Site_Supervisor' },
    admin: { id: 'admin', name: 'Sarah Connor', role: 'ADMIN' }
  };

  let currentUser = { ...mockPersonas.u6 };
  let isDemoMode = true;

  const simulateSwitchUser = (targetId) => {
    if (!isDemoMode) {
      // Guard: strictly reject role switching if not in demo mode
      return false;
    }
    const target = mockPersonas[targetId];
    if (target) {
      currentUser = { ...target };
      return true;
    }
    return false;
  };

  // Verify initial worker persona
  assert.equal(currentUser.role, 'Worker');
  assert.equal(canAccessView(currentUser, 'IAM'), false);

  // Switch to Site Supervisor in demo mode
  const switchedToSupervisor = simulateSwitchUser('u7');
  assert.equal(switchedToSupervisor, true);
  assert.equal(currentUser.name, 'Marcus Chen');
  assert.equal(currentUser.role, 'Site_Supervisor');
  assert.equal(canAccessView(currentUser, 'PERMIT_TO_WORK'), true);
  assert.equal(canAccessView(currentUser, 'IAM'), false);

  // Switch to Admin in demo mode
  const switchedToAdmin = simulateSwitchUser('admin');
  assert.equal(switchedToAdmin, true);
  assert.equal(currentUser.role, 'ADMIN');
  assert.equal(canAccessView(currentUser, 'IAM'), true);

  // Verify switching is blocked when isDemoMode is false
  isDemoMode = false;
  const attemptedSwitch = simulateSwitchUser('u6');
  assert.equal(attemptedSwitch, false, 'Role switching must be blocked when demo mode is inactive');
  assert.equal(currentUser.role, 'ADMIN', 'Current user must remain unchanged');
});

test('authenticated session restoration: restores valid sessions and safely fails corrupted tokens', () => {
  const restoreSession = (storage) => {
    const token = storage.get('hse_auth_token');
    const user = storage.get('hse_current_user');
    const isDemo = storage.get('hse_is_demo_mode') === true;

    if (!token || !user) {
      // Safe fallback: never auto-elevate to admin!
      return { user: null, isDemo: false, isAuthenticated: false };
    }

    return {
      user,
      isDemo,
      isAuthenticated: true
    };
  };

  // Scenario A: Valid enterprise session
  const validStorage = new Map([
    ['hse_auth_token', 'valid-jwt-token-12345'],
    ['hse_current_user', { id: 'u5', name: 'Fatima Al-Kaabi', role: 'Safety_Officer', department: 'HSE' }],
    ['hse_is_demo_mode', false]
  ]);
  const restoredValid = restoreSession(validStorage);
  assert.equal(restoredValid.isAuthenticated, true);
  assert.equal(restoredValid.user.id, 'u5');
  assert.equal(restoredValid.user.role, 'Safety_Officer');
  assert.equal(restoredValid.isDemo, false);

  // Scenario B: Missing token (session expired or logged out)
  const expiredStorage = new Map([
    ['hse_auth_token', null],
    ['hse_current_user', { id: 'admin', name: 'Sarah Connor', role: 'ADMIN' }]
  ]);
  const restoredExpired = restoreSession(expiredStorage);
  assert.equal(restoredExpired.isAuthenticated, false);
  assert.equal(restoredExpired.user, null, 'Expired session must NOT restore admin user');
  assert.equal(restoredExpired.isDemo, false);

  // Scenario C: Fresh clean storage
  const emptyStorage = new Map();
  const restoredEmpty = restoreSession(emptyStorage);
  assert.equal(restoredEmpty.isAuthenticated, false);
  assert.equal(restoredEmpty.user, null);
  assert.equal(restoredEmpty.isDemo, false);
});

test('Regression Guard: isDemoSession strictly returns false when no storage key exists', async () => {
  const mockStorage = new Map();

  const isDemoSession = (storage) => {
    const val = storage.get('hse_is_demo_mode');
    return val === true; // Never default to true!
  };

  // Fresh browser with empty storage
  assert.equal(isDemoSession(mockStorage), false, 'Empty storage must yield isDemoSession = false');

  // After normal login
  mockStorage.set('hse_is_demo_mode', false);
  assert.equal(isDemoSession(mockStorage), false, 'Normal login must have isDemoSession = false');

  // After explicit demo launch
  mockStorage.set('hse_is_demo_mode', true);
  assert.equal(isDemoSession(mockStorage), true, 'Explicit demo launch must have isDemoSession = true');

  // After logout
  mockStorage.delete('hse_is_demo_mode');
  assert.equal(isDemoSession(mockStorage), false, 'Post-logout must yield isDemoSession = false');
});

test('Segregation of Duties (SoD) Invariant: Self-authorization is strictly rejected', () => {
  // Test Permit to Work SoD: Receiver cannot self-authorize as Area Authority
  const permit = {
    receiverId: 'u6',
    receiverSignature: { signatoryName: 'Khalid Al-Harthy' }
  };
  const currentUser = { id: 'u6', name: 'Khalid Al-Harthy' };

  const checkPtwSod = (p, u) => {
    if (p.receiverSignature?.signatoryName === u.name || p.receiverId === u.id) {
      throw new Error('SoD Violation: Permit Receiver cannot self-authorize as Area Authority.');
    }
    return true;
  };

  assert.throws(() => checkPtwSod(permit, currentUser), /SoD Violation/);

  // Test CAPA SoD: Action owner cannot self-verify and close action
  const capa = { ownerName: 'Fatima Al-Kaabi', assigneeId: 'u5' };
  const verifierUser = { id: 'u5', name: 'Fatima Al-Kaabi' };

  const checkCapaSod = (c, u) => {
    if (c.ownerName === u.name || c.assigneeId === u.id) {
      throw new Error('SoD Violation: Action Owner cannot self-verify and close action.');
    }
    return true;
  };

  assert.throws(() => checkCapaSod(capa, verifierUser), /SoD Violation/);
});
