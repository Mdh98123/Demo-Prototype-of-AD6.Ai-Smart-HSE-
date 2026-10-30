/**
 * Permit (PTW) Repository Interface and PostgreSQL Implementation
 * Enforces Segregation of Duties (Permit Receiver cannot self-authorize as Permit Issuer).
 * Integrated with append-only hash-chained audit trail.
 */

import { withTenantContext } from '../db/connection';
import { PermitRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';
import { writeAudit } from '../audit/writeAudit';

export interface IPermitRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string; permit_type?: string }): Promise<{ items: PermitRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<PermitRecord | null>;
  create(tenantId: string, data: Omit<PermitRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }, actorId?: string): Promise<PermitRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<PermitRecord, 'id' | 'tenant_id' | 'created_at'>>, actorId?: string, auditMetadata?: Record<string, any>): Promise<PermitRecord | null>;
  delete(tenantId: string, id: string, actorId?: string): Promise<boolean>;
}

export class PostgresPermitRepository implements IPermitRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string; permit_type?: string } = {}
  ): Promise<{ items: PermitRecord[]; total: number }> {
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
      if (options.permit_type) {
        whereClause += ` AND permit_type = $${paramIndex++}`;
        params.push(options.permit_type);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM permits ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM permits 
        ${whereClause} 
        ORDER BY valid_from DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<PermitRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<PermitRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<PermitRecord>(
        'SELECT * FROM permits WHERE (id::text = $1 OR permit_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<PermitRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string },
    actorId?: string
  ): Promise<PermitRecord> {
    const issuer = data.issuer_name || data.issuer_signature?.signatoryName;
    const receiver = data.receiver_name || data.receiver_signature?.signatoryName;
    if (issuer && receiver && issuer.trim().toLowerCase() === receiver.trim().toLowerCase()) {
      throw new Error('Segregation of Duties (SoD) Invariant Violation: The Permit Receiver cannot self-authorize as the Permit Issuer/Area Authority.');
    }

    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const permit_number = data.permit_number || data.id || `ptw-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const query = `
        INSERT INTO permits (
          id, tenant_id, permit_number, permit_type, status, zone,
          exact_location, valid_from, valid_to, issuer_name, receiver_name,
          issuer_signature, receiver_signature, details, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        permit_number,
        data.permit_type,
        data.status || 'Pending',
        data.zone || 'General Area',
        data.exact_location,
        data.valid_from || new Date().toISOString(),
        data.valid_to,
        issuer || null,
        receiver || null,
        data.issuer_signature ? JSON.stringify(data.issuer_signature) : null,
        data.receiver_signature ? JSON.stringify(data.receiver_signature) : null,
        JSON.stringify(data.details || {})
      ];
      const res = await client.query<PermitRecord>(query, params);
      const created = res.rows[0];

      await writeAudit({
        tenantId,
        actorId: actorId || 'system',
        action: 'PERMIT_CREATED',
        entityType: 'PERMIT',
        entityId: created.id,
        afterState: created,
        metadata: { permit_number: created.permit_number, permit_type: created.permit_type }
      });

      return created;
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<PermitRecord, 'id' | 'tenant_id' | 'created_at'>>,
    actorId?: string,
    auditMetadata?: Record<string, any>
  ): Promise<PermitRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const issuer = merged.issuer_name || merged.issuer_signature?.signatoryName;
      const receiver = merged.receiver_name || merged.receiver_signature?.signatoryName;
      if (issuer && receiver && issuer.trim().toLowerCase() === receiver.trim().toLowerCase()) {
        throw new Error('Segregation of Duties (SoD) Invariant Violation: The Permit Receiver cannot self-authorize as the Permit Issuer/Area Authority.');
      }

      const query = `
        UPDATE permits SET
          permit_number = $1, permit_type = $2, status = $3, zone = $4,
          exact_location = $5, valid_from = $6, valid_to = $7,
          issuer_name = $8, receiver_name = $9, issuer_signature = $10,
          receiver_signature = $11, details = $12, updated_at = NOW()
        WHERE id = $13 AND tenant_id = $14
        RETURNING *
      `;
      const params = [
        merged.permit_number,
        merged.permit_type,
        merged.status,
        merged.zone,
        merged.exact_location,
        merged.valid_from,
        merged.valid_to,
        issuer || null,
        receiver || null,
        merged.issuer_signature ? JSON.stringify(merged.issuer_signature) : null,
        merged.receiver_signature ? JSON.stringify(merged.receiver_signature) : null,
        JSON.stringify(merged.details || {}),
        existing.id,
        tenantId
      ];
      const res = await client.query<PermitRecord>(query, params);
      const updated = res.rows[0] || null;

      if (updated) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'PERMIT_UPDATED',
          entityType: 'PERMIT',
          entityId: updated.id,
          beforeState: existing,
          afterState: updated,
          metadata: { permit_number: updated.permit_number, status: updated.status, ...(auditMetadata || {}) }
        });
      }

      return updated;
    });
  }

  public async delete(tenantId: string, id: string, actorId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return false;

      const res = await client.query(
        'DELETE FROM permits WHERE (id::text = $1 OR permit_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      const deleted = res.rowCount > 0;

      if (deleted) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'PERMIT_DELETED',
          entityType: 'PERMIT',
          entityId: existing.id,
          beforeState: existing,
          metadata: { permit_number: existing.permit_number }
        });
      }

      return deleted;
    });
  }
}

export const permitRepository = new PostgresPermitRepository();
