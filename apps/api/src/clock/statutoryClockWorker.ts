/**
 * Oman Statutory Clock Escalation Worker
 *
 * Implements:
 * - Deterministic escalation thresholds: T-18h, T-12h, T-6h, T-2h, T-0, and T+1h breach.
 * - Writes notification events to notification_outbox table.
 * - Updates incident_statutory_clock escalation stage and breach status.
 * - Auditable via writeAudit.
 * - Testable with arbitrary simulated/virtual timestamps.
 */

import crypto from 'node:crypto';
import { withTenantContext, getPool } from '../db/connection';
import { IncidentStatutoryClockRecord } from '../db/schema';
import { writeAudit } from '../audit/writeAudit';

export interface EscalationThresholdDef {
  stage: string;
  eventType: string;
  recipientRole: string;
  triggerTime: (dueAtMs: number) => number;
  marksBreach?: boolean;
}

export const ESCALATION_STAGES: EscalationThresholdDef[] = [
  {
    stage: 'T_18H',
    eventType: 'STATUTORY_CLOCK_T_18H',
    recipientRole: 'Site_Supervisor',
    triggerTime: (due) => due - 18 * 60 * 60 * 1000
  },
  {
    stage: 'T_12H',
    eventType: 'STATUTORY_CLOCK_T_12H',
    recipientRole: 'HSE_Officer',
    triggerTime: (due) => due - 12 * 60 * 60 * 1000
  },
  {
    stage: 'T_6H',
    eventType: 'STATUTORY_CLOCK_T_6H',
    recipientRole: 'Site_HSE_Manager',
    triggerTime: (due) => due - 6 * 60 * 60 * 1000
  },
  {
    stage: 'T_2H',
    eventType: 'STATUTORY_CLOCK_T_2H',
    recipientRole: 'Head_Group_HSE',
    triggerTime: (due) => due - 2 * 60 * 60 * 1000
  },
  {
    stage: 'T_0',
    eventType: 'STATUTORY_CLOCK_T_0',
    recipientRole: 'Executive_HSE_Directorate',
    triggerTime: (due) => due
  },
  {
    stage: 'BREACH_T_PLUS_1H',
    eventType: 'STATUTORY_CLOCK_BREACH_T_PLUS_1H',
    recipientRole: 'CEO_and_Legal',
    triggerTime: (due) => due + 1 * 60 * 60 * 1000,
    marksBreach: true
  }
];

export interface OutboxEvaluationResult {
  evaluatedClocks: number;
  notificationsEmitted: number;
  breachesDetected: number;
}

/**
 * Evaluates all active statutory clocks across all tenants and produces escalation outbox records.
 * Can be called with a virtual reference time for deterministic testing.
 */
export async function evaluateStatutoryClocks(referenceTime?: Date): Promise<OutboxEvaluationResult> {
  const now = referenceTime || new Date();
  const nowMs = now.getTime();
  const pool = getPool();

  // Find all tenants with active/running clocks
  const tenantsRes = await pool.query<{ tenant_id: string }>(
    `SELECT DISTINCT tenant_id FROM incident_statutory_clock WHERE status IN ('RUNNING', 'ACKNOWLEDGED')`
  );

  let totalEmitted = 0;
  let totalBreaches = 0;
  let totalClocks = 0;

  for (const t of tenantsRes.rows) {
    const tenantId = t.tenant_id;

    await withTenantContext(tenantId, async (client) => {
      const clocksRes = await client.query<IncidentStatutoryClockRecord>(
        `SELECT * FROM incident_statutory_clock WHERE tenant_id = $1 AND status IN ('RUNNING', 'ACKNOWLEDGED') ORDER BY due_at ASC`,
        [tenantId]
      );

      for (const clock of clocksRes.rows) {
        totalClocks++;
        const dueMs = new Date(clock.due_at).getTime();
        const details = typeof clock.details === 'object' && clock.details !== null ? { ...clock.details } : {};
        const emittedStages: string[] = Array.isArray(details.emittedStages) ? details.emittedStages : [];

        for (const threshold of ESCALATION_STAGES) {
          const triggerAtMs = threshold.triggerTime(dueMs);

          // Check if threshold has been reached and not yet emitted
          if (nowMs >= triggerAtMs && !emittedStages.includes(threshold.stage)) {
            // If already acknowledged and this is a breach threshold, skip marking breach if desired,
            // but statutory notice still emits notification record
            const isBreach = threshold.marksBreach && clock.status === 'RUNNING';

            // 1. Insert notification into notification_outbox
            const payload = {
              clockId: clock.id,
              incidentId: clock.incident_id,
              startedAt: clock.started_at,
              dueAt: clock.due_at,
              severity: clock.severity,
              stage: threshold.stage,
              eventType: threshold.eventType,
              evaluatedAt: now.toISOString(),
              hoursRemaining: (dueMs - nowMs) / (60 * 60 * 1000)
            };

            const outboxId = crypto.randomUUID();
            await client.query(
              `INSERT INTO notification_outbox (
                id, tenant_id, event_type, entity_type, entity_id,
                recipient_role, payload, status, scheduled_for, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, NOW())`,
              [
                outboxId,
                tenantId,
                threshold.eventType,
                'INCIDENT_STATUTORY_CLOCK',
                clock.id,
                threshold.recipientRole,
                JSON.stringify(payload),
                now.toISOString()
              ]
            );

            emittedStages.push(threshold.stage);
            details.emittedStages = emittedStages;

            // 2. Update clock escalation stage and breach status if applicable
            let nextStatus = clock.status;
            if (isBreach) {
              nextStatus = 'BREACHED';
              totalBreaches++;
            }

            await client.query(
              `UPDATE incident_statutory_clock
               SET escalation_stage = $1,
                   status = $2,
                   last_escalated_at = $3,
                   details = $4,
                   updated_at = NOW()
               WHERE id = $5 AND tenant_id = $6`,
              [
                threshold.stage,
                nextStatus,
                now.toISOString(),
                JSON.stringify(details),
                clock.id,
                tenantId
              ]
            );

            // 3. Audit trail record
            await writeAudit({
              tenantId,
              actorId: 'system_clock_worker',
              actorRole: 'System',
              action: isBreach ? 'STATUTORY_CLOCK_BREACHED' : 'STATUTORY_CLOCK_ESCALATED',
              entityType: 'INCIDENT_STATUTORY_CLOCK',
              entityId: clock.id,
              beforeState: clock,
              afterState: {
                ...clock,
                escalation_stage: threshold.stage,
                status: nextStatus
              },
              metadata: {
                eventType: threshold.eventType,
                stage: threshold.stage,
                hoursRemaining: (dueMs - nowMs) / (60 * 60 * 1000)
              }
            });

            totalEmitted++;
          }
        }
      }
    });
  }

  return {
    evaluatedClocks: totalClocks,
    notificationsEmitted: totalEmitted,
    breachesDetected: totalBreaches
  };
}

let workerIntervalHandle: NodeJS.Timeout | null = null;

/**
 * Starts the background statutory clock escalation worker.
 */
export function startStatutoryClockWorker(intervalMs: number = 60000) {
  if (workerIntervalHandle) {
    clearInterval(workerIntervalHandle);
  }

  workerIntervalHandle = setInterval(async () => {
    try {
      await evaluateStatutoryClocks();
    } catch (err) {
      console.error('[STATUTORY WORKER] Error evaluating clocks:', err);
    }
  }, intervalMs);

  // Do not block process exit
  if (workerIntervalHandle.unref) {
    workerIntervalHandle.unref();
  }

  return {
    stop: () => {
      if (workerIntervalHandle) {
        clearInterval(workerIntervalHandle);
        workerIntervalHandle = null;
      }
    },
    runOnce: (referenceTime?: Date) => evaluateStatutoryClocks(referenceTime)
  };
}

export function stopStatutoryClockWorker() {
  if (workerIntervalHandle) {
    clearInterval(workerIntervalHandle);
    workerIntervalHandle = null;
  }
}
