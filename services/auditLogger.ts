
import { GlobalAuditLog, UserRole } from '../types';
import { SecureStorage } from './storageService';

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
      ipHash: 'simulated-ip-hash-x8d9s' // In real app, this comes from backend
    };

    // Load existing logs (decrypt), append, save (encrypt)
    const existingLogs = (await SecureStorage.getItem<GlobalAuditLog[]>(AUDIT_STORAGE_KEY)) || [];
    const updatedLogs = [newLog, ...existingLogs];
    
    // In production, this would be a fire-and-forget API call to a WORM (Write Once Read Many) storage
    await SecureStorage.setItem(AUDIT_STORAGE_KEY, updatedLogs);
    
    console.log(`[AUDIT] ${action} by ${actorName}: ${status}`);
  },

  getLogs: async (): Promise<GlobalAuditLog[]> => {
    return (await SecureStorage.getItem<GlobalAuditLog[]>(AUDIT_STORAGE_KEY)) || [];
  }
};
