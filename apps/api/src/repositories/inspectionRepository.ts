/**
 * Inspection Repository Interface and PostgreSQL Implementation
 * Integrated with append-only hash-chained audit trail.
 */

import { withTenantContext } from '../db/connection';
import { InspectionRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';
import { writeAudit } from '../audit/writeAudit';

export interface IInspectionRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string }): Promise<{ items: InspectionRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<InspectionRecord | null>;
  create(tenantId: string, data: Omit<InspectionRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }, actorId?: string): Promise<InspectionRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<InspectionRecord, 'id' | 'tenant_id' | 'created_at'>>, actorId?: string): Promise<InspectionRecord | null>;
  delete(tenantId: string, id: string, actorId?: string): Promise<boolean>;
}

export class PostgresInspectionRepository implements IInspectionRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string } = {}
  ): Promise<{ items: InspectionRecord[]; total: number }> {
    return withTenantContext(tenantId, async (client) => {
      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;

      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (options.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(options.status);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM inspections ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM inspections 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<InspectionRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<InspectionRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<InspectionRecord>(
        'SELECT * FROM inspections WHERE id::text = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<InspectionRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string },
    actorId?: string
  ): Promise<InspectionRecord> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const query = `
        INSERT INTO inspections (
          id, tenant_id, title, template_type, site_name, inspector_name,
          status, score, completed_at, details, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        data.title,
        data.template_type,
        data.site_name,
        data.inspector_name,
        data.status || 'Scheduled',
        data.score ?? null,
        data.completed_at || null,
        JSON.stringify(data.details || {})
      ];
      const res = await client.query<InspectionRecord>(query, params);
      const created = res.rows[0];

      await writeAudit({
        tenantId,
        actorId: actorId || 'system',
        action: 'INSPECTION_CREATED',
        entityType: 'INSPECTION',
        entityId: created.id,
        afterState: created,
        metadata: { title: created.title, template_type: created.template_type }
      });

      return created;
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<InspectionRecord, 'id' | 'tenant_id' | 'created_at'>>,
    actorId?: string
  ): Promise<InspectionRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const query = `
        UPDATE inspections SET
          title = $1, template_type = $2, site_name = $3, inspector_name = $4,
          status = $5, score = $6, completed_at = $7, details = $8, updated_at = NOW()
        WHERE id::text = $9 AND tenant_id = $10
        RETURNING *
      `;
      const params = [
        merged.title,
        merged.template_type,
        merged.site_name,
        merged.inspector_name,
        merged.status,
        merged.score ?? null,
        merged.completed_at || null,
        JSON.stringify(merged.details || {}),
        existing.id,
        tenantId
      ];
      const res = await client.query<InspectionRecord>(query, params);
      const updated = res.rows[0] || null;

      if (updated) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'INSPECTION_UPDATED',
          entityType: 'INSPECTION',
          entityId: updated.id,
          beforeState: existing,
          afterState: updated,
          metadata: { title: updated.title, status: updated.status }
        });
      }

      return updated;
    });
  }

  public async delete(tenantId: string, id: string, actorId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return false;

      const res = await client.query('DELETE FROM inspections WHERE id::text = $1 AND tenant_id = $2', [id, tenantId]);
      const deleted = res.rowCount > 0;

      if (deleted) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'INSPECTION_DELETED',
          entityType: 'INSPECTION',
          entityId: existing.id,
          beforeState: existing,
          metadata: { title: existing.title }
        });
      }

      return deleted;
    });
  }
}

export const inspectionRepository = new PostgresInspectionRepository();
