/**
 * AuditLogger.ts
 * Append-only immutable log pattern with simulated cryptographic chaining.
 */

import { UnifiedAuditTrailService, AuditActionType, AuditModuleType } from './unifiedAuditTrailService';

// In-Memory Hash Chain Database for Frontend Demo purposes
const MOCK_AUDIT_LEDGER: AuditLogEntry[] = [];

export interface AuditLogEntry {
  sequenceId: number;
  tenantId: string;
  userId: string;
  actionType: string;
  targetTable: string;
  targetId: string;
  timestamp: string;
  beforeState: any;
  afterState: any;
  previousHash: string;
  recordHash: string;
}

export class ImmutableAuditLogger {
  
  // Utilizes Web Crypto API (Standard in all modern browsers natively)
  private static async generateHash(payload: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Fallback
    }
    return Math.random().toString(16).padStart(64, '0');
  }

  public static async logAction(
    tenantId: string,
    userId: string,
    actionType: 'UPDATE' | 'INSERT' | 'DELETE' | 'BYPASS_GATE',
    targetTable: string,
    targetId: string,
    beforeState: any,
    afterState: any
  ): Promise<AuditLogEntry> {
    
    // Retrieve previous hash (Blockchain style ledger chaining)
    const previousEntry = MOCK_AUDIT_LEDGER[MOCK_AUDIT_LEDGER.length - 1];
    const previousHash = previousEntry ? previousEntry.recordHash : '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash

    const timestamp = new Date().toISOString();
    
    // Construct payload strictly enforcing data sequencing
    const payloadToHash = JSON.stringify({
      tenantId,
      userId,
      actionType,
      targetTable,
      targetId,
      timestamp,
      beforeState,
      afterState,
      previousHash
    });

    const recordHash = await this.generateHash(payloadToHash);

    const newLog: AuditLogEntry = {
      sequenceId: MOCK_AUDIT_LEDGER.length + 1,
      tenantId,
      userId,
      actionType,
      targetTable,
      targetId,
      timestamp,
      beforeState,
      afterState,
      previousHash,
      recordHash
    };

    MOCK_AUDIT_LEDGER.push(newLog);

    // Map to Unified Audit Trail Service
    const mappedAction: AuditActionType = 
      actionType === 'INSERT' ? 'RECORD_CREATE' :
      actionType === 'DELETE' ? 'RECORD_DELETE' :
      actionType === 'BYPASS_GATE' ? 'COMPLIANCE_OVERRIDE' : 'RECORD_EDIT';

    const mappedModule: AuditModuleType = 
      targetTable.includes('permit') ? 'PERMITS' :
      targetTable.includes('incident') ? 'INCIDENTS' :
      targetTable.includes('capa') ? 'CAPA' :
      targetTable.includes('oshad') ? 'SAFETY_AUDIT' : 'SYSTEM_ADMIN';

    UnifiedAuditTrailService.logAction({
      actor: {
        userId,
        userName: userId.includes('@') ? userId.split('@')[0] : userId,
        userRole: 'ADMIN'
      },
      actionType: mappedAction,
      module: mappedModule,
      entityId: targetId,
      entityTitle: `${targetTable} record ${targetId}`,
      previousValue: beforeState,
      newValue: afterState,
      tenantId,
      severity: actionType === 'BYPASS_GATE' ? 'Critical' : 'Medium'
    }).catch(() => {});

    return newLog;
  }

  public static getLedger() {
    return MOCK_AUDIT_LEDGER;
  }
}
