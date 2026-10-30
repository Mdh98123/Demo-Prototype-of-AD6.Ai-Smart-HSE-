/**
 * Escalation Service & Scheduled Evaluation Worker
 *
 * Implements:
 * - Deterministic evaluation of `escalation_rules` for permits and CAPAs
 * - Permits pending approval > delay_minutes: triggers escalation notification into outbox
 * - CAPAs overdue > delay_minutes or past due_date: triggers escalation notification into outbox
 * - Deduplication so the same rule and entity are not repeatedly spammed
 */

import { getPool, withTenantContext } from '../db/connection.js';
import type { EscalationRuleRecord, NotificationOutboxRecord, PermitRecord, CapaRecord } from '../db/schema.js';
import crypto from 'node:crypto';

export interface EscalationEvaluationResult {
  permitsEvaluated: number;
  capasEvaluated: number;
  escalationEventsCreated: number;
  events: NotificationOutboxRecord[];
}

export class EscalationWorker {
  /**
   * Deterministically evaluates escalation rules against pending permits and overdue CAPAs.
   */
  public static async evaluateRules(
    tenantId: string = '00000000-0000-0000-0000-000000000001',
    referenceTime: Date = new Date()
  ): Promise<EscalationEvaluationResult> {
    const pool = getPool();
    const nowMs = referenceTime.getTime();
    const createdEvents: NotificationOutboxRecord[] = [];

    // 1. Fetch active escalation rules for tenant
    const rulesRes = await pool.query<EscalationRuleRecord>(
      `SELECT * FROM escalation_rules WHERE tenant_id = $1 AND is_active = TRUE`,
      [tenantId]
    );
    const rules = rulesRes.rows;

    // 2. Evaluate PERMIT rules (e.g. pending_approval)
    const permitRules = rules.filter(r => r.entity_type.toLowerCase() === 'permit');
    let permitsEvaluated = 0;

    if (permitRules.length > 0) {
      const permitsRes = await pool.query<PermitRecord>(
        `SELECT * FROM permits 
         WHERE tenant_id = $1 
           AND status IN ('Pending', 'Submitted', 'Pending_Approval', 'Draft')`,
        [tenantId]
      );
      permitsEvaluated = permitsRes.rows.length;

      for (const permit of permitsRes.rows) {
        const permitAgeMinutes = Math.floor((nowMs - new Date(permit.created_at).getTime()) / (60 * 1000));

        for (const rule of permitRules) {
          if (permitAgeMinutes >= rule.delay_minutes) {
            // Check if already escalated for this permit and rule level
            const existingOutbox = await pool.query(
              `SELECT id FROM notification_outbox 
               WHERE tenant_id = $1 
                 AND entity_type = 'permit' 
                 AND entity_id = $2 
                 AND event_type = $3`,
              [tenantId, permit.id, `ESCALATION_LEVEL_${rule.level}`]
            );

            if (existingOutbox.rows.length === 0) {
              const outboxId = crypto.randomUUID();
              const payload = {
                permit_id: permit.id,
                permit_number: permit.permit_number,
                rule_code: rule.rule_code,
                escalation_level: rule.level,
                delay_minutes: rule.delay_minutes,
                actual_delay_minutes: permitAgeMinutes,
                target_role: rule.target_role,
                escalated_at: referenceTime.toISOString(),
                reason: `Permit pending approval for ${permitAgeMinutes}m exceeds threshold of ${rule.delay_minutes}m.`
              };

              await withTenantContext(tenantId, async (client) => {
                const inserted = await client.query<NotificationOutboxRecord>(
                  `INSERT INTO notification_outbox (
                    id, tenant_id, event_type, entity_type, entity_id,
                    recipient_role, payload, status, scheduled_for, created_at
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, NOW())
                  RETURNING *`,
                  [
                    outboxId,
                    tenantId,
                    `ESCALATION_LEVEL_${rule.level}`,
                    'permit',
                    permit.id,
                    rule.target_role,
                    payload,
                    referenceTime.toISOString()
                  ]
                );
                createdEvents.push(inserted.rows[0]);
              });
            }
          }
        }
      }
    }

    // 3. Evaluate CAPA rules (e.g. overdue)
    const capaRules = rules.filter(r => r.entity_type.toLowerCase() === 'capa');
    let capasEvaluated = 0;

    if (capaRules.length > 0) {
      const capasRes = await pool.query<CapaRecord>(
        `SELECT * FROM capas 
         WHERE tenant_id = $1 
           AND status != 'Closed'`,
        [tenantId]
      );
      capasEvaluated = capasRes.rows.length;

      for (const capa of capasRes.rows) {
        const dueDate = new Date(capa.due_date).getTime();
        const isOverdue = nowMs > dueDate;
        const overdueMinutes = isOverdue ? Math.floor((nowMs - dueDate) / (60 * 1000)) : 0;

        for (const rule of capaRules) {
          if (isOverdue && overdueMinutes >= rule.delay_minutes) {
            const existingOutbox = await pool.query(
              `SELECT id FROM notification_outbox 
               WHERE tenant_id = $1 
                 AND entity_type = 'capa' 
                 AND entity_id = $2 
                 AND event_type = $3`,
              [tenantId, capa.id, `ESCALATION_LEVEL_${rule.level}`]
            );

            if (existingOutbox.rows.length === 0) {
              const outboxId = crypto.randomUUID();
              const payload = {
                capa_id: capa.id,
                action_number: capa.action_number,
                rule_code: rule.rule_code,
                escalation_level: rule.level,
                delay_minutes: rule.delay_minutes,
                overdue_minutes: overdueMinutes,
                target_role: rule.target_role,
                escalated_at: referenceTime.toISOString(),
                reason: `CAPA ${capa.action_number} overdue by ${overdueMinutes}m exceeds threshold of ${rule.delay_minutes}m.`
              };

              await withTenantContext(tenantId, async (client) => {
                const inserted = await client.query<NotificationOutboxRecord>(
                  `INSERT INTO notification_outbox (
                    id, tenant_id, event_type, entity_type, entity_id,
                    recipient_role, payload, status, scheduled_for, created_at
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, NOW())
                  RETURNING *`,
                  [
                    outboxId,
                    tenantId,
                    `ESCALATION_LEVEL_${rule.level}`,
                    'capa',
                    capa.id,
                    rule.target_role,
                    payload,
                    referenceTime.toISOString()
                  ]
                );
                createdEvents.push(inserted.rows[0]);
              });
            }
          }
        }
      }
    }

    return {
      permitsEvaluated,
      capasEvaluated,
      escalationEventsCreated: createdEvents.length,
      events: createdEvents
    };
  }
}
