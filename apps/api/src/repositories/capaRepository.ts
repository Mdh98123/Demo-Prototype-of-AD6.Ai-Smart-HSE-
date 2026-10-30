/**
 * CAPA Repository Interface and PostgreSQL Implementation
 * Enforces Segregation of Duties (Action Owner cannot self-verify and close action).
 */

import { withTenantContext } from '../db/connection';
import { CapaRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';

export interface ICapaRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string; priority?: string }): Promise<{ items: CapaRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<CapaRecord | null>;
  create(tenantId: string, data: Omit<CapaRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<CapaRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<CapaRecord, 'id' | 'tenant_id' | 'created_at'>>): Promise<CapaRecord | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class PostgresCapaRepository implements ICapaRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string; priority?: string } = {}
  ): Promise<{ items: CapaRecord[]; total: number }> {
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
      if (options.priority) {
        whereClause += ` AND priority = $${paramIndex++}`;
        params.push(options.priority);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM capas ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM capas 
        ${whereClause} 
        ORDER BY due_date ASC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<CapaRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<CapaRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<CapaRecord>(
        'SELECT * FROM capas WHERE (id::text = $1 OR action_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<CapaRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<CapaRecord> {
    // SoD Check
    if (data.status === 'Closed' && data.owner_name && data.verified_by_name) {
      if (data.owner_name.trim().toLowerCase() === data.verified_by_name.trim().toLowerCase()) {
        throw new Error('Segregation of Duties (SoD) Invariant Violation: Action Owner cannot verify and close their own action.');
      }
    }

    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const action_number = data.action_number || data.id || `CAPA-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const query = `
        INSERT INTO capas (
          id, tenant_id, action_number, title, description, priority, status,
          owner_name, verified_by_name, due_date, hierarchy, details, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        action_number,
        data.title,
        data.description || '',
        data.priority || 'P2 - High',
        data.status || 'Open',
        data.owner_name,
        data.verified_by_name || null,
        data.due_date,
        data.hierarchy || 'Engineering',
        JSON.stringify(data.details || {})
      ];
      const res = await client.query<CapaRecord>(query, params);
      return res.rows[0];
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<CapaRecord, 'id' | 'tenant_id' | 'created_at'>>
  ): Promise<CapaRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      if (merged.status === 'Closed' && merged.owner_name && merged.verified_by_name) {
        if (merged.owner_name.trim().toLowerCase() === merged.verified_by_name.trim().toLowerCase()) {
          throw new Error('Segregation of Duties (SoD) Invariant Violation: Action Owner cannot verify and close their own action.');
        }
      }

      const query = `
        UPDATE capas SET
          title = $1, description = $2, priority = $3, status = $4,
          owner_name = $5, verified_by_name = $6, due_date = $7,
          hierarchy = $8, details = $9, updated_at = NOW()
        WHERE id = $10 AND tenant_id = $11
        RETURNING *
      `;
      const params = [
        merged.title,
        merged.description,
        merged.priority,
        merged.status,
        merged.owner_name,
        merged.verified_by_name || null,
        merged.due_date,
        merged.hierarchy,
        JSON.stringify(merged.details || {}),
        existing.id,
        tenantId
      ];
      const res = await client.query<CapaRecord>(query, params);
      return res.rows[0] || null;
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query(
        'DELETE FROM capas WHERE (id::text = $1 OR action_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rowCount > 0;
    });
  }
}

export const capaRepository = new PostgresCapaRepository();
