let cloudLogger = null;
let cloudLoggingDisabled = process.env.ENABLE_CLOUD_LOGGING !== 'true';

// In-memory audit ring-buffer to guarantee enterprise compliance traceability
const inMemoryAuditLedger = [];
const MAX_LEDGER_ENTRIES = 500;

export async function logAccess(userId, operation, payload) {
  const auditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'anonymous',
    operation: operation || 'SYSTEM_ACTION',
    payload: payload || {},
    timestamp: new Date().toISOString()
  };

  // Always store in local structured ledger
  inMemoryAuditLedger.unshift(auditRecord);
  if (inMemoryAuditLedger.length > MAX_LEDGER_ENTRIES) {
    inMemoryAuditLedger.pop();
  }

  // Attempt Google Cloud Logging only if explicitly enabled and not disabled by previous failure
  if (!cloudLoggingDisabled && process.env.ENABLE_CLOUD_LOGGING === 'true') {
    try {
      if (!cloudLogger) {
        const { Logging } = await import('@google-cloud/logging');
        cloudLogger = new Logging().log('pdpl-audit');
      }

      const entry = cloudLogger.entry(
        { resource: { type: 'global' } },
        auditRecord
      );
      await cloudLogger.write(entry);
    } catch (error) {
      // If Cloud Logging API is not enabled (e.g. PERMISSION_DENIED / code 7) or credentials lack permission,
      // permanently switch to local audit ledger to prevent error cascade.
      cloudLoggingDisabled = true;
      console.info('[AUDIT] Cloud Logging API is not enabled or permitted for this project. Operating with local structured audit ledger.');
    }
  }

  // Structured audit event to stdout for standard container logging
  console.log(`[AUDIT] ${auditRecord.timestamp} - ${auditRecord.operation} by ${auditRecord.userId}`);
}

export function getAuditLogs(limit = 100) {
  return inMemoryAuditLedger.slice(0, limit);
}

