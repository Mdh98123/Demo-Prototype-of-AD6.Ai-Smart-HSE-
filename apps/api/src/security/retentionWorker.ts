/**
 * Enterprise Data Classification & Retention Worker
 * 
 * Target Standards:
 * - Sultanate of Oman Ministry of Labour MD 286/2008 (Occupational safety and health retention)
 * - Sultanate of Oman Royal Decree 53/2023 (Labour Law)
 * - Sultanate of Oman Personal Data Protection Law (RD 6/2022)
 * - Petroleum Development Oman (PDO SP-1143 PTW, PDO SP-1170 TWL)
 * - Saudi Arabia Personal Data Protection Law (Royal Decree M/19)
 * 
 * Rules:
 * 1. Data Classification: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED across all tables.
 * 2. Immutable Legal Hold: Any record with `legal_hold = true` MUST NEVER be purged.
 * 3. Auditable Purges: Every purge execution appends an entry to the hash-chained audit ledger.
 */

import { withTenantContext } from '../db/connection.js';
import { writeAudit } from '../audit/writeAudit.js';

export type DataClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface TableClassification {
  tableName: string;
  level: DataClassificationLevel;
  containsPii: boolean;
  containsMedical: boolean;
  regulatorySchedule: string;
  retentionDays: number;
}

export const DATA_CLASSIFICATION_REGISTRY: TableClassification[] = [
  {
    tableName: 'tenants',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'Permanent / Concession Lifetime',
    retentionDays: 36500
  },
  {
    tableName: 'sites',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'Permanent / Asset Lifetime',
    retentionDays: 36500
  },
  {
    tableName: 'users',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Oman RD 6/2022 PDPL / 5 years post-employment',
    retentionDays: 1825
  },
  {
    tableName: 'scim_users',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Oman RD 6/2022 PDPL / IdP Sync',
    retentionDays: 1825
  },
  {
    tableName: 'competency_records',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Oman Labour Law RD 53/2023 / 5 years',
    retentionDays: 1825
  },
  {
    tableName: 'incidents',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: true,
    regulatorySchedule: 'Oman MoL MD 286/2008 Form G (5 yrs fatal/serious, 10 yrs occupational diseases)',
    retentionDays: 1825
  },
  {
    tableName: 'incident_evidence',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Oman MoL MD 286/2008 (5 years)',
    retentionDays: 1825
  },
  {
    tableName: 'permits',
    level: 'CONFIDENTIAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'PDO SP-1143 Permit to Work (1 year post-closure)',
    retentionDays: 365
  },
  {
    tableName: 'capas',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'Oman MoL MD 286/2008 & ISO 45001 (5 years)',
    retentionDays: 1825
  },
  {
    tableName: 'inspections',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'ISO 45001 / GCC Operator HSE (3 years)',
    retentionDays: 1095
  },
  {
    tableName: 'twl_readings',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'PDO SP-1170 Thermal Work Limit (3 years)',
    retentionDays: 1095
  },
  {
    tableName: 'twl_breaches',
    level: 'INTERNAL',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'PDO SP-1170 Stop-Work Orders (5 years)',
    retentionDays: 1825
  },
  {
    tableName: 'notification_outbox',
    level: 'CONFIDENTIAL',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Transient notification delivery logs (90 days)',
    retentionDays: 90
  },
  {
    tableName: 'audit_log',
    level: 'RESTRICTED',
    containsPii: true,
    containsMedical: false,
    regulatorySchedule: 'Immutable Audit Trail / 10 years statutory',
    retentionDays: 3650
  },
  {
    tableName: 'audit_ledger',
    level: 'RESTRICTED',
    containsPii: false,
    containsMedical: false,
    regulatorySchedule: 'Cryptographic Hash-Chained Ledger / Permanent',
    retentionDays: 36500
  }
];

export interface EntityPurgeResult {
  entityType: string;
  tableName: string;
  retentionDays: number;
  recordsEvaluated: number;
  recordsPurged: number;
  legalHoldsSkipped: number;
}

export interface PurgeSummary {
  tenantId: string;
  executionTimestamp: string;
  dryRun: boolean;
  totalPurged: number;
  totalProtectedByLegalHold: number;
  breakdown: EntityPurgeResult[];
  auditLogId?: string;
}

export class RetentionWorker {
  /**
   * Evaluates and purges expired records older than their statutory retention period.
   * NEVER purges records with `legal_hold = true`.
   * Records every purge execution in the hash-chained audit log.
   */
  public static async executeRetentionPurge(
    tenantId: string,
    options: {
      dryRun?: boolean;
      simulatedCurrentDate?: Date;
      actorId?: string;
    } = {}
  ): Promise<PurgeSummary> {
    const dryRun = Boolean(options.dryRun);
    const currentDate = options.simulatedCurrentDate || new Date();
    const actorId = options.actorId || '00000000-0000-0000-0000-000000000000';

    const breakdown: EntityPurgeResult[] = [];
    let totalPurged = 0;
    let totalProtectedByLegalHold = 0;

    await withTenantContext(tenantId, async (client) => {
      // 1. Purge expired Notification Outbox (90-day retention)
      const outboxThreshold = new Date(currentDate.getTime() - (90 * 24 * 60 * 60 * 1000));
      const outboxCandidates = await client.query(
        `SELECT COUNT(*)::int as cnt FROM notification_outbox WHERE tenant_id = $1 AND created_at < $2`,
        [tenantId, outboxThreshold.toISOString()]
      );
      const outboxCount = Number(outboxCandidates.rows[0]?.cnt || 0);
      let outboxPurged = 0;
      if (!dryRun && outboxCount > 0) {
        const delRes = await client.query(
          `DELETE FROM notification_outbox WHERE tenant_id = $1 AND created_at < $2`,
          [tenantId, outboxThreshold.toISOString()]
        );
        outboxPurged = delRes.rowCount || outboxCount;
      } else if (dryRun) {
        outboxPurged = outboxCount;
      }
      breakdown.push({
        entityType: 'notification_outbox',
        tableName: 'notification_outbox',
        retentionDays: 90,
        recordsEvaluated: outboxCount,
        recordsPurged: outboxPurged,
        legalHoldsSkipped: 0
      });
      totalPurged += outboxPurged;

      // 2. Purge expired closed Permits (PDO SP-1143: 365 days)
      const permitDays = 365;
      const permitThreshold = new Date(currentDate.getTime() - (permitDays * 24 * 60 * 60 * 1000));
      
      const permitHoldRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM permits WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND legal_hold = true`,
        [tenantId, permitThreshold.toISOString()]
      );
      const permitHolds = Number(permitHoldRes.rows[0]?.cnt || 0);

      const permitExpiredRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM permits WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
        [tenantId, permitThreshold.toISOString()]
      );
      const permitExpiredCount = Number(permitExpiredRes.rows[0]?.cnt || 0);
      let permitsPurged = 0;

      if (!dryRun && permitExpiredCount > 0) {
        const delPermits = await client.query(
          `DELETE FROM permits WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
          [tenantId, permitThreshold.toISOString()]
        );
        permitsPurged = delPermits.rowCount || permitExpiredCount;
      } else if (dryRun) {
        permitsPurged = permitExpiredCount;
      }

      breakdown.push({
        entityType: 'permit',
        tableName: 'permits',
        retentionDays: permitDays,
        recordsEvaluated: permitExpiredCount + permitHolds,
        recordsPurged: permitsPurged,
        legalHoldsSkipped: permitHolds
      });
      totalPurged += permitsPurged;
      totalProtectedByLegalHold += permitHolds;

      // 3. Purge expired closed CAPAs (5 years: 1825 days)
      const capaDays = 1825;
      const capaThreshold = new Date(currentDate.getTime() - (capaDays * 24 * 60 * 60 * 1000));

      const capaHoldRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM capas WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND legal_hold = true`,
        [tenantId, capaThreshold.toISOString()]
      );
      const capaHolds = Number(capaHoldRes.rows[0]?.cnt || 0);

      const capaExpiredRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM capas WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
        [tenantId, capaThreshold.toISOString()]
      );
      const capaExpiredCount = Number(capaExpiredRes.rows[0]?.cnt || 0);
      let capasPurged = 0;

      if (!dryRun && capaExpiredCount > 0) {
        const delCapas = await client.query(
          `DELETE FROM capas WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
          [tenantId, capaThreshold.toISOString()]
        );
        capasPurged = delCapas.rowCount || capaExpiredCount;
      } else if (dryRun) {
        capasPurged = capaExpiredCount;
      }

      breakdown.push({
        entityType: 'capa',
        tableName: 'capas',
        retentionDays: capaDays,
        recordsEvaluated: capaExpiredCount + capaHolds,
        recordsPurged: capasPurged,
        legalHoldsSkipped: capaHolds
      });
      totalPurged += capasPurged;
      totalProtectedByLegalHold += capaHolds;

      // 4. Purge expired Incidents (Oman MoL MD 286/2008: 5 years for non-fatal/non-disease)
      const incidentDays = 1825;
      const incidentThreshold = new Date(currentDate.getTime() - (incidentDays * 24 * 60 * 60 * 1000));

      const incHoldRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM incidents WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND legal_hold = true`,
        [tenantId, incidentThreshold.toISOString()]
      );
      const incHolds = Number(incHoldRes.rows[0]?.cnt || 0);

      const incExpiredRes = await client.query(
        `SELECT COUNT(*)::int as cnt FROM incidents WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
        [tenantId, incidentThreshold.toISOString()]
      );
      const incExpiredCount = Number(incExpiredRes.rows[0]?.cnt || 0);
      let incPurged = 0;

      if (!dryRun && incExpiredCount > 0) {
        const delInc = await client.query(
          `DELETE FROM incidents WHERE tenant_id = $1 AND status = 'Closed' AND created_at < $2 AND (legal_hold IS FALSE OR legal_hold IS NULL)`,
          [tenantId, incidentThreshold.toISOString()]
        );
        incPurged = delInc.rowCount || incExpiredCount;
      } else if (dryRun) {
        incPurged = incExpiredCount;
      }

      breakdown.push({
        entityType: 'incident',
        tableName: 'incidents',
        retentionDays: incidentDays,
        recordsEvaluated: incExpiredCount + incHolds,
        recordsPurged: incPurged,
        legalHoldsSkipped: incHolds
      });
      totalPurged += incPurged;
      totalProtectedByLegalHold += incHolds;
    });

    // Write audit log entry for this retention execution
    const auditRes = await writeAudit({
      tenantId,
      actorId,
      action: 'RETENTION_PURGE_EXECUTED',
      entityType: 'retention_policy',
      entityId: tenantId,
      metadata: {
        severity: 'INFO',
        dryRun,
        totalPurged,
        totalProtectedByLegalHold,
        breakdown,
        regulatoryFrameworks: [
          'Oman MoL MD 286/2008',
          'Oman RD 53/2023',
          'Oman RD 6/2022 PDPL',
          'PDO SP-1143',
          'PDO SP-1170'
        ]
      }
    });

    return {
      tenantId,
      executionTimestamp: currentDate.toISOString(),
      dryRun,
      totalPurged,
      totalProtectedByLegalHold,
      breakdown,
      auditLogId: auditRes?.id ? String(auditRes.id) : undefined
    };
  }

  /**
   * Sets or clears legal hold on an enterprise entity.
   */
  public static async setLegalHold(
    tenantId: string,
    entityType: 'incident' | 'permit' | 'capa',
    entityId: string,
    holdStatus: boolean,
    reason: string,
    actorId?: string
  ): Promise<boolean> {
    const table = entityType === 'incident' ? 'incidents' : entityType === 'permit' ? 'permits' : 'capas';

    let updated = false;
    await withTenantContext(tenantId, async (client) => {
      const res = await client.query(
        `UPDATE ${table} SET legal_hold = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3 RETURNING id`,
        [holdStatus, tenantId, entityId]
      );
      updated = (res.rowCount || 0) > 0;
    });

    if (updated) {
      await writeAudit({
        tenantId,
        actorId: actorId || '00000000-0000-0000-0000-000000000000',
        action: holdStatus ? 'LEGAL_HOLD_APPLIED' : 'LEGAL_HOLD_RELEASED',
        entityType,
        entityId,
        metadata: {
          severity: 'SECURITY',
          holdStatus,
          reason,
          entityType,
          table
        }
      });
    }

    return updated;
  }
}
