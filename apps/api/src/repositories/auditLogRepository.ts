/**
 * Audit Log & Submissions Repositories (Phase 2 Placeholders)
 * Table creation in DB schema; interfaces provided for Phase 2 writers.
 */

import { withTenantContext } from '../db/connection';
import { AuditLogRecord, SubmissionRecord } from '../db/schema';

export interface IAuditLogRepository {
  findMany(tenantId: string, limit?: number): Promise<AuditLogRecord[]>;
}

export class PostgresAuditLogRepository implements IAuditLogRepository {
  public async findMany(tenantId: string, limit: number = 50): Promise<AuditLogRecord[]> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<AuditLogRecord>(
        'SELECT * FROM audit_log WHERE tenant_id = $1 ORDER BY timestamp DESC LIMIT $2',
        [tenantId, limit]
      );
      return res.rows;
    });
  }
}

export interface ISubmissionRepository {
  findMany(tenantId: string): Promise<SubmissionRecord[]>;
}

export class PostgresSubmissionRepository implements ISubmissionRepository {
  public async findMany(tenantId: string): Promise<SubmissionRecord[]> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<SubmissionRecord>(
        'SELECT * FROM submissions WHERE tenant_id = $1 ORDER BY submitted_at DESC',
        [tenantId]
      );
      return res.rows;
    });
  }
}

export const auditLogRepository = new PostgresAuditLogRepository();
export const submissionRepository = new PostgresSubmissionRepository();
