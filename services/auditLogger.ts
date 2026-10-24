import { GlobalAuditLog, UserRole } from '../types';
import { SecureStorage } from './storageService';
import { UnifiedAuditTrailService, AuditActionType, AuditModuleType } from './unifiedAuditTrailService';

const AUDIT_STORAGE_KEY = 'hse_global_audit_trail';

export const AuditLogger = {
  log: async (
    actorId: string,
    actorName: string,
    actorRole: UserRole,
    action: string,
    resourceType: GlobalAuditLog['resourceType'],
    resourceId: string | undefined,
    details: string,
    status: 'Success' | 'Failure' | 'Unauthorized' = 'Success',
    riskLevel: GlobalAuditLog['riskLevel'] = 'Low'
  ) => {
    const newLog: GlobalAuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorName,
      actorRole,
      action,
      resourceType,
      resourceId,
      details,
      status,
      riskLevel,
      ipHash: 'simulated-ip-hash-x8d9s'
    };

    // Save legacy entry
    try {
      const existingLogs = (await SecureStorage.getItem<GlobalAuditLog[]>(AUDIT_STORAGE_KEY)) || [];
      const updatedLogs = [newLog, ...existingLogs];
      await SecureStorage.setItem(AUDIT_STORAGE_KEY, updatedLogs);
    } catch (e) {
      console.warn('[AUDIT] Failed to save legacy audit log:', e);
    }

    // Map resourceType to AuditModuleType
    const moduleMap: Record<string, AuditModuleType> = {
      'Permit': 'PERMITS',
      'Incident': 'INCIDENTS',
      'System': 'SYSTEM_ADMIN',
      'User': 'SECURITY_IAM',
      'Document': 'RAMS',
      'PTW': 'PERMITS',
      'CAPA': 'CAPA'
    };

    const targetModule = moduleMap[resourceType as string] || 'SYSTEM_ADMIN';
    const actionUpper = action.toUpperCase();

    let actionType: AuditActionType = 'RECORD_EDIT';
    if (actionUpper.includes('REPORT') || actionUpper.includes('CREATE')) {
      actionType = 'RECORD_CREATE';
    } else if (actionUpper.includes('STATUS') || actionUpper.includes('AUTHORIZED') || actionUpper.includes('CLOSE')) {
      actionType = 'STATUS_CHANGE';
    } else if (actionUpper.includes('REASSIGN') || actionUpper.includes('ASSIGN')) {
      actionType = 'USER_ASSIGNMENT';
    } else if (actionUpper.includes('SIGN') || actionUpper.includes('ACKNOWLEDGE')) {
      actionType = 'APPROVAL_SIGN_OFF';
    } else if (actionUpper.includes('STOP WORK') || actionUpper.includes('SWA')) {
      actionType = 'STOP_WORK_AUTHORITY';
    }

    // Forward to unified ledger
    UnifiedAuditTrailService.logAction({
      actor: {
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        department: 'Operations'
      },
      actionType,
      module: targetModule,
      entityId: resourceId || 'SYS-EVENT',
      entityTitle: action,
      previousValue: null,
      newValue: { details, status },
      changeSummary: `${action}: ${details}`,
      reason: details,
      severity: riskLevel,
      regulatoryFramework: ['ISO 45001:2018', 'UAE PDPL Art. 24']
    }).catch(err => console.warn('[AUDIT] Unified logger bridge notice:', err));

    console.log(`[AUDIT] ${action} by ${actorName}: ${status}`);
  },

  getLogs: async (): Promise<GlobalAuditLog[]> => {
    return (await SecureStorage.getItem<GlobalAuditLog[]>(AUDIT_STORAGE_KEY)) || [];
  }
};
