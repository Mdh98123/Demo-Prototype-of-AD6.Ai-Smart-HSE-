/**
 * Incident Repository Interface and PostgreSQL Implementation
 * Integrated with append-only hash-chained audit trail and Oman statutory clock.
 */

import { withTenantContext } from '../db/connection';
import { IncidentRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';
import { writeAudit } from '../audit/writeAudit';
import { startStatutoryClock } from '../clock/statutoryClock';

export interface IIncidentRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; status?: string; severity?: string }): Promise<{ items: IncidentRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<IncidentRecord | null>;
  create(tenantId: string, data: Omit<IncidentRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }, actorId?: string): Promise<IncidentRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<IncidentRecord, 'id' | 'tenant_id' | 'created_at'>>, actorId?: string): Promise<IncidentRecord | null>;
  delete(tenantId: string, id: string, actorId?: string): Promise<boolean>;
}

const SERIOUS_SEVERITIES = new Set([
  'Critical', 'Major', 'High', 'Fatal', 'Level 4', 'Level 5', 'Catastrophic', 'Tier 1'
]);

export class PostgresIncidentRepository implements IIncidentRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; status?: string; severity?: string } = {}
  ): Promise<{ items: IncidentRecord[]; total: number }> {
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
      if (options.severity) {
        whereClause += ` AND severity = $${paramIndex++}`;
        params.push(options.severity);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM incidents ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM incidents 
        ${whereClause} 
        ORDER BY incident_timestamp DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<IncidentRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<IncidentRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<IncidentRecord>(
        'SELECT * FROM incidents WHERE (id::text = $1 OR incident_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<IncidentRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string },
    actorId?: string
  ): Promise<IncidentRecord> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const incident_number = data.incident_number || data.id || `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const query = `
        INSERT INTO incidents (
          id, tenant_id, incident_number, title, description, severity, status,
          location, incident_timestamp, form_g_submitted, form_g_receipt_number,
          form_g_deadline, details, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        incident_number,
        data.title,
        data.description || '',
        data.severity,
        data.status || 'Open',
        data.location,
        data.incident_timestamp || new Date().toISOString(),
        data.form_g_submitted || false,
        data.form_g_receipt_number || null,
        data.form_g_deadline || null,
        JSON.stringify(data.details || {})
      ];
      const res = await client.query<IncidentRecord>(query, params);
      const created = res.rows[0];

      // Audit trail write (append-only hash-chained)
      await writeAudit({
        tenantId,
        actorId: actorId || 'system',
        action: 'INCIDENT_CREATED',
        entityType: 'INCIDENT',
        entityId: created.id,
        afterState: created,
        metadata: { incident_number: created.incident_number, severity: created.severity }
      });

      // Statutory clock initiation per Oman MD 286/2008
      // Clock starts strictly on incident confirmation (not on draft creation)
      const isConfirmed = created.status !== 'Draft';
      const isSerious = SERIOUS_SEVERITIES.has(created.severity);
      if (isConfirmed && isSerious) {
        try {
          await startStatutoryClock({
            incidentId: created.id,
            tenantId,
            severity: created.severity,
            startedAt: created.incident_timestamp,
            actorId: actorId || 'system'
          });
        } catch (clockErr) {
          console.warn('[INCIDENT REPO] Could not start statutory clock:', clockErr);
        }
      }

      return created;
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<IncidentRecord, 'id' | 'tenant_id' | 'created_at'>>,
    actorId?: string
  ): Promise<IncidentRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
      const query = `
        UPDATE incidents SET
          title = $1, description = $2, severity = $3, status = $4,
          location = $5, incident_timestamp = $6, form_g_submitted = $7,
          form_g_receipt_number = $8, form_g_deadline = $9, details = $10,
          updated_at = NOW()
        WHERE id = $11 AND tenant_id = $12
        RETURNING *
      `;
      const params = [
        updated.title,
        updated.description,
        updated.severity,
        updated.status,
        updated.location,
        updated.incident_timestamp,
        updated.form_g_submitted,
        updated.form_g_receipt_number || null,
        updated.form_g_deadline || null,
        JSON.stringify(updated.details || {}),
        existing.id,
        tenantId
      ];
      const res = await client.query<IncidentRecord>(query, params);
      const result = res.rows[0] || null;

      if (result) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'INCIDENT_UPDATED',
          entityType: 'INCIDENT',
          entityId: result.id,
          beforeState: existing,
          afterState: result,
          metadata: { incident_number: result.incident_number, statusTransition: `${existing.status} -> ${result.status}` }
        });

        // If transitioning from Draft to Confirmed/Open, or newly marked serious
        if (existing.status === 'Draft' && result.status !== 'Draft' && SERIOUS_SEVERITIES.has(result.severity)) {
          try {
            await startStatutoryClock({
              incidentId: result.id,
              tenantId,
              severity: result.severity,
              startedAt: result.incident_timestamp,
              actorId: actorId || 'system'
            });
          } catch (clockErr) {
            console.warn('[INCIDENT REPO] Could not start statutory clock on update:', clockErr);
          }
        }
      }

      return result;
    });
  }

  public async delete(tenantId: string, id: string, actorId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return false;

      const res = await client.query(
        'DELETE FROM incidents WHERE (id::text = $1 OR incident_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      const deleted = res.rowCount > 0;

      if (deleted) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'INCIDENT_DELETED',
          entityType: 'INCIDENT',
          entityId: existing.id,
          beforeState: existing,
          metadata: { incident_number: existing.incident_number }
        });
      }

      return deleted;
    });
  }
}

export const incidentRepository = new PostgresIncidentRepository();
