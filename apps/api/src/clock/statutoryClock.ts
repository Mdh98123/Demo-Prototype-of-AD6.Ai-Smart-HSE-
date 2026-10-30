/**
 * Oman Statutory Clock Service
 * 
 * Juridical Scope:
 * - Sultanate of Oman Ministry of Labour MD 286/2008 (Occupational Health & Safety Regulations)
 * - Royal Decree 53/2023 (Labour Law)
 * - 24-hour mandatory statutory notification window for serious/critical industrial incidents
 */

import { withTenantContext } from '../db/connection';
import { IncidentStatutoryClockRecord } from '../db/schema';
import { writeAudit } from '../audit/writeAudit';
import { ensureUuid } from '../utils/uuid';

export interface StartClockInput {
  incidentId: string;
  tenantId: string;
  severity: string;
  startedAt?: string;
  actorId?: string;
}

export interface AcknowledgeClockInput {
  clockId?: string;
  incidentId?: string;
  tenantId: string;
  acknowledgedBy: string;
  actorId?: string;
  notes?: string;
}

export const STATUTORY_NOTIFICATION_HOURS = 24;

/**
 * Initiates the 24-hour statutory countdown clock for a confirmed serious/critical incident.
 * Clock starts strictly on incident confirmation (server-side), not on draft creation.
 */
export async function startStatutoryClock(input: StartClockInput): Promise<IncidentStatutoryClockRecord> {
  const tenantId = input.tenantId;
  const startedAt = input.startedAt ? new Date(input.startedAt).toISOString() : new Date().toISOString();
  
  // Calculate immutable statutory deadline: precisely started_at + 24 hours per Oman MD 286/2008
  const startedTime = new Date(startedAt).getTime();
  const dueAt = new Date(startedTime + STATUTORY_NOTIFICATION_HOURS * 60 * 60 * 1000).toISOString();

  return withTenantContext(tenantId, async (client) => {
    // Check if a statutory clock is already active or exists for this incident
    const existing = await client.query<IncidentStatutoryClockRecord>(
      'SELECT * FROM incident_statutory_clock WHERE tenant_id = $1 AND (incident_id = $2 OR incident_id::text = $2) LIMIT 1',
      [tenantId, input.incidentId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const query = `
      INSERT INTO incident_statutory_clock (
        tenant_id, incident_id, started_at, due_at, severity, status,
        escalation_stage, details, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'RUNNING',
        'INITIAL', $6, NOW(), NOW()
      ) RETURNING *
    `;

    const details = {
      jurisdiction: 'OMAN_MOL_MD_286_2008',
      form: 'FORM_G_SERIOUS_INCIDENT',
      totalHours: STATUTORY_NOTIFICATION_HOURS,
      initialSeverity: input.severity
    };

    const res = await client.query<IncidentStatutoryClockRecord>(query, [
      tenantId,
      ensureUuid(input.incidentId),
      startedAt,
      dueAt,
      input.severity,
      JSON.stringify(details)
    ]);

    const created = res.rows[0];

    // Audit trail write (append-only hash-chained)
    await writeAudit({
      tenantId,
      actorId: input.actorId || 'system',
      actorRole: 'System',
      action: 'STATUTORY_CLOCK_STARTED',
      entityType: 'INCIDENT_STATUTORY_CLOCK',
      entityId: created.id,
      afterState: created,
      metadata: {
        incidentId: input.incidentId,
        startedAt,
        dueAt,
        jurisdiction: 'OMAN_MD_286_2008'
      }
    });

    return created;
  });
}

/**
 * Acknowledges the statutory countdown by an authorized HSE officer or legal authority.
 */
export async function acknowledgeStatutoryClock(input: AcknowledgeClockInput): Promise<IncidentStatutoryClockRecord> {
  const tenantId = input.tenantId;

  return withTenantContext(tenantId, async (client) => {
    let lookupQuery = 'SELECT * FROM incident_statutory_clock WHERE tenant_id = $1';
    const params: any[] = [tenantId];

    if (input.clockId) {
      lookupQuery += ' AND (id = $2 OR id::text = $2)';
      params.push(input.clockId);
    } else if (input.incidentId) {
      lookupQuery += ' AND (incident_id = $2 OR incident_id::text = $2)';
      params.push(input.incidentId);
    } else {
      throw new Error('Must provide either clockId or incidentId to acknowledge statutory clock');
    }

    const currentRes = await client.query<IncidentStatutoryClockRecord>(lookupQuery, params);
    const current = currentRes.rows[0];

    if (!current) {
      throw new Error('Statutory clock record not found');
    }

    const acknowledgedAt = new Date().toISOString();
    const updateQuery = `
      UPDATE incident_statutory_clock
      SET status = 'ACKNOWLEDGED',
          acknowledged_at = $1,
          acknowledged_by = $2,
          updated_at = NOW()
      WHERE id = $3 AND tenant_id = $4
      RETURNING *
    `;

    const res = await client.query<IncidentStatutoryClockRecord>(updateQuery, [
      acknowledgedAt,
      input.acknowledgedBy,
      current.id,
      tenantId
    ]);

    const updated = res.rows[0];

    // Audit trail write
    await writeAudit({
      tenantId,
      actorId: input.actorId || input.acknowledgedBy,
      actorRole: 'HSE_Officer',
      action: 'STATUTORY_CLOCK_ACKNOWLEDGED',
      entityType: 'INCIDENT_STATUTORY_CLOCK',
      entityId: updated.id,
      beforeState: current,
      afterState: updated,
      metadata: {
        acknowledgedBy: input.acknowledgedBy,
        acknowledgedAt,
        notes: input.notes
      }
    });

    return updated;
  });
}

/**
 * Retrieves the statutory clock record for a given incident.
 */
export async function getClockForIncident(incidentId: string, tenantId: string): Promise<IncidentStatutoryClockRecord | null> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query<IncidentStatutoryClockRecord>(
      'SELECT * FROM incident_statutory_clock WHERE tenant_id = $1 AND (incident_id = $2 OR incident_id::text = $2) ORDER BY created_at DESC LIMIT 1',
      [tenantId, incidentId]
    );
    return res.rows[0] || null;
  });
}

/**
 * Lists all statutory clocks for a tenant.
 */
export async function listStatutoryClocks(tenantId: string, status?: string): Promise<IncidentStatutoryClockRecord[]> {
  return withTenantContext(tenantId, async (client) => {
    let query = 'SELECT * FROM incident_statutory_clock WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }
    query += ' ORDER BY due_at ASC';
    const res = await client.query<IncidentStatutoryClockRecord>(query, params);
    return res.rows;
  });
}
