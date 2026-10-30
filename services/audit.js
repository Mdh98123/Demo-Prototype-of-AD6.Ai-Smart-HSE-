/**
 * Audit Trail Service - PostgreSQL Hash-Chained Durable Audit Writer
 * 
 * Replaces legacy in-memory buffer with append-only hash-chained PostgreSQL persistence.
 */

import { writeAudit } from '../apps/api/src/audit/writeAudit';
import { withTenantContext } from '../apps/api/src/db/connection';

let cloudLogger = null;
let cloudLoggingDisabled = process.env.ENABLE_CLOUD_LOGGING !== 'true';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function logAccess(userId, operation, payload = {}) {
  const tenantId = (payload && payload.tenantId) || DEFAULT_TENANT_ID;

  try {
    // Durable, append-only hash-chained audit record in PostgreSQL
    await writeAudit({
      tenantId,
      actorId: userId || 'anonymous',
      action: operation || 'SYSTEM_ACTION',
      entityType: (payload && payload.entityType) || 'SYSTEM',
      entityId: (payload && (payload.entityId || payload.id)) || `sys-${Date.now()}`,
      metadata: payload || {}
    });
  } catch (err) {
    console.warn('[AUDIT] Failed to persist audit record to database:', err);
  }

  // Attempt Google Cloud Logging only if explicitly enabled
  if (!cloudLoggingDisabled && process.env.ENABLE_CLOUD_LOGGING === 'true') {
    try {
      if (!cloudLogger) {
        const { Logging } = await import('@google-cloud/logging');
        cloudLogger = new Logging().log('pdpl-audit');
      }

      const entry = cloudLogger.entry(
        { resource: { type: 'global' } },
        {
          userId: userId || 'anonymous',
          operation: operation || 'SYSTEM_ACTION',
          payload: payload || {},
          timestamp: new Date().toISOString()
        }
      );
      await cloudLogger.write(entry);
    } catch (error) {
      cloudLoggingDisabled = true;
      console.info('[AUDIT] Cloud Logging API disabled. Persisting to PostgreSQL hash-chained ledger only.');
    }
  }

  // Structured audit event to stdout for standard container logging
  console.log(`[AUDIT] ${new Date().toISOString()} - ${operation || 'SYSTEM_ACTION'} by ${userId || 'anonymous'}`);
}

export async function getAuditLogs(limit = 100, tenantId = DEFAULT_TENANT_ID) {
  try {
    return await withTenantContext(tenantId, async (client) => {
      const res = await client.query(
        'SELECT * FROM audit_log WHERE tenant_id = $1 ORDER BY id DESC LIMIT $2',
        [tenantId, limit]
      );
      return res.rows;
    });
  } catch (err) {
    console.warn('[AUDIT] Failed to query audit log table:', err);
    return [];
  }
}
