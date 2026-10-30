/**
 * Observation Repository Interface and PostgreSQL Implementation
 */

import { withTenantContext } from '../db/connection';
import { ObservationRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';

export interface IObservationRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string; observation_type?: string }): Promise<{ items: ObservationRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<ObservationRecord | null>;
  create(tenantId: string, data: Omit<ObservationRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<ObservationRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<ObservationRecord, 'id' | 'tenant_id' | 'created_at'>>): Promise<ObservationRecord | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class PostgresObservationRepository implements IObservationRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string; observation_type?: string } = {}
  ): Promise<{ items: ObservationRecord[]; total: number }> {
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
      if (options.observation_type) {
        whereClause += ` AND observation_type = $${paramIndex++}`;
        params.push(options.observation_type);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM observations ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM observations 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<ObservationRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<ObservationRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<ObservationRecord>(
        'SELECT * FROM observations WHERE (id::text = $1 OR observation_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<ObservationRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<ObservationRecord> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const observation_number = data.observation_number || data.id || `OBS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const query = `
        INSERT INTO observations (
          id, tenant_id, observation_number, observer_name, observation_type,
          location, description, immediate_action, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        observation_number,
        data.observer_name,
        data.observation_type,
        data.location,
        data.description,
        data.immediate_action || null,
        data.status || 'Logged'
      ];
      const res = await client.query<ObservationRecord>(query, params);
      return res.rows[0];
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<ObservationRecord, 'id' | 'tenant_id' | 'created_at'>>
  ): Promise<ObservationRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const query = `
        UPDATE observations SET
          observation_number = $1, observer_name = $2, observation_type = $3,
          location = $4, description = $5, immediate_action = $6, status = $7, updated_at = NOW()
        WHERE id::text = $8 AND tenant_id = $9
        RETURNING *
      `;
      const params = [
        merged.observation_number,
        merged.observer_name,
        merged.observation_type,
        merged.location,
        merged.description,
        merged.immediate_action || null,
        merged.status,
        existing.id,
        tenantId
      ];
      const res = await client.query<ObservationRecord>(query, params);
      return res.rows[0] || null;
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query(
        'DELETE FROM observations WHERE (id::text = $1 OR observation_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rowCount > 0;
    });
  }
}

export const observationRepository = new PostgresObservationRepository();
