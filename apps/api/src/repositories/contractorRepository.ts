/**
 * Contractor Repository Interface and PostgreSQL Implementation
 * Integrated with append-only hash-chained audit trail.
 */

import { withTenantContext } from '../db/connection';
import { ContractorRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';
import { writeAudit } from '../audit/writeAudit';

export interface IContractorRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string; compliance_status?: string; trade?: string }): Promise<{ items: ContractorRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<ContractorRecord | null>;
  create(tenantId: string, data: Omit<ContractorRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }, actorId?: string): Promise<ContractorRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<ContractorRecord, 'id' | 'tenant_id' | 'created_at'>>, actorId?: string): Promise<ContractorRecord | null>;
  delete(tenantId: string, id: string, actorId?: string): Promise<boolean>;
}

export class PostgresContractorRepository implements IContractorRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string; compliance_status?: string; trade?: string } = {}
  ): Promise<{ items: ContractorRecord[]; total: number }> {
    return withTenantContext(tenantId, async (client) => {
      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;

      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      const statusFilter = options.status || options.compliance_status;
      if (statusFilter) {
        whereClause += ` AND compliance_status = $${paramIndex++}`;
        params.push(statusFilter);
      }
      if (options.trade) {
        whereClause += ` AND trade = $${paramIndex++}`;
        params.push(options.trade);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM contractors ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM contractors 
        ${whereClause} 
        ORDER BY company_name ASC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<ContractorRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<ContractorRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<ContractorRecord>(
        'SELECT * FROM contractors WHERE id::text = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<ContractorRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string },
    actorId?: string
  ): Promise<ContractorRecord> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const query = `
        INSERT INTO contractors (
          id, tenant_id, company_name, trade, contact_email,
          contact_phone, compliance_status, cr_number, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        data.company_name,
        data.trade,
        data.contact_email || null,
        data.contact_phone || null,
        data.compliance_status || 'Approved',
        data.cr_number || null
      ];
      const res = await client.query<ContractorRecord>(query, params);
      const created = res.rows[0];

      await writeAudit({
        tenantId,
        actorId: actorId || 'system',
        action: 'CONTRACTOR_CREATED',
        entityType: 'CONTRACTOR',
        entityId: created.id,
        afterState: created,
        metadata: { company_name: created.company_name, trade: created.trade }
      });

      return created;
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<ContractorRecord, 'id' | 'tenant_id' | 'created_at'>>,
    actorId?: string
  ): Promise<ContractorRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const query = `
        UPDATE contractors SET
          company_name = $1, trade = $2, contact_email = $3,
          contact_phone = $4, compliance_status = $5, cr_number = $6, updated_at = NOW()
        WHERE id::text = $7 AND tenant_id = $8
        RETURNING *
      `;
      const params = [
        merged.company_name,
        merged.trade,
        merged.contact_email || null,
        merged.contact_phone || null,
        merged.compliance_status,
        merged.cr_number || null,
        existing.id,
        tenantId
      ];
      const res = await client.query<ContractorRecord>(query, params);
      const updated = res.rows[0] || null;

      if (updated) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'CONTRACTOR_UPDATED',
          entityType: 'CONTRACTOR',
          entityId: updated.id,
          beforeState: existing,
          afterState: updated,
          metadata: { company_name: updated.company_name, compliance_status: updated.compliance_status }
        });
      }

      return updated;
    });
  }

  public async delete(tenantId: string, id: string, actorId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return false;

      const res = await client.query('DELETE FROM contractors WHERE id::text = $1 AND tenant_id = $2', [id, tenantId]);
      const deleted = res.rowCount > 0;

      if (deleted) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'CONTRACTOR_DELETED',
          entityType: 'CONTRACTOR',
          entityId: existing.id,
          beforeState: existing,
          metadata: { company_name: existing.company_name }
        });
      }

      return deleted;
    });
  }
}

export const contractorRepository = new PostgresContractorRepository();
