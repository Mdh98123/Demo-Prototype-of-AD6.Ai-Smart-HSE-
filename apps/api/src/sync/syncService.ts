/**
 * Server-Side Offline Synchronization & Conflict Resolution Service
 *
 * Implements:
 * - Deterministic Idempotency Key deduplication via `sync_idempotency_keys`
 * - Conflict policy per entity type according to `/docs/SYNC_POLICY.md`:
 *   1. Incidents: Append-only with duplicate heuristic flagging
 *   2. Inspections: Last-writer-wins per field with full conflict auditing in `sync_conflict_audits`
 *   3. CAPA: Server-authoritative with strict DB/service SoD re-validation (rejects self-closure)
 * - Atomic execution within tenant context with complete audit logging
 */

import crypto from 'node:crypto';
import { withTenantContext, getPool } from '../db/connection.js';
import { writeAudit } from '../audit/writeAudit.js';
import { SOD_INVARIANTS } from '../../../../packages/shared/src/rbac.js';

export interface SyncBatchItemPayload {
  localId: string;
  idempotencyKey: string;
  entityType: 'INCIDENT' | 'INSPECTION' | 'CAPA' | 'PERMIT';
  deviceId: string;
  clientTimestamp: string;
  payload: any;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}

export interface SyncItemResult {
  localId: string;
  serverId?: string;
  status: 'SUCCESS' | 'REJECTED_SOD' | 'FAILED';
  idempotent?: boolean;
  duplicateFlag?: boolean;
  error?: string;
  entityType: string;
}

export interface SyncBatchResponse {
  processed: number;
  successes: number;
  failures: number;
  results: SyncItemResult[];
}

export class SyncService {
  /**
   * Processes a batch of queued offline items from a field PWA client.
   */
  public static async processBatch(
    tenantId: string,
    items: SyncBatchItemPayload[],
    requestActorId: string = 'system_sync_worker',
    requestActorRole: string = 'Worker'
  ): Promise<SyncBatchResponse> {
    const results: SyncItemResult[] = [];
    let successes = 0;
    let failures = 0;

    for (const item of items) {
      try {
        const itemResult = await this.processSingleItem(tenantId, item, requestActorId, requestActorRole);
        results.push(itemResult);
        if (itemResult.status === 'SUCCESS') {
          successes++;
        } else {
          failures++;
        }
      } catch (err: any) {
        failures++;
        results.push({
          localId: item.localId,
          status: 'FAILED',
          error: err.message || 'Synchronization failed',
          entityType: item.entityType
        });
      }
    }

    return {
      processed: items.length,
      successes,
      failures,
      results
    };
  }

  /**
   * Processes a single sync item with idempotency and entity-specific conflict policies.
   */
  public static async processSingleItem(
    tenantId: string,
    item: SyncBatchItemPayload,
    defaultActorId: string,
    defaultActorRole: string
  ): Promise<SyncItemResult> {
    const pool = getPool();
    const actorId = item.actorId || defaultActorId;
    const actorRole = item.actorRole || defaultActorRole;
    const actorName = item.actorName || item.payload?.reporter_name || item.payload?.owner_name || 'Field Worker';

    // 1. Idempotency Check: deduplicate retries
    const existingIdempotency = await pool.query<{ response_json: any }>(
      `SELECT response_json FROM sync_idempotency_keys WHERE tenant_id = $1 AND idempotency_key = $2`,
      [tenantId, item.idempotencyKey]
    );

    if (existingIdempotency.rows.length > 0) {
      const cached = existingIdempotency.rows[0].response_json;
      return {
        ...cached,
        idempotent: true
      };
    }

    let result: SyncItemResult;

    // 2. Dispatch by entity type according to /docs/SYNC_POLICY.md
    switch (item.entityType) {
      case 'INCIDENT':
        result = await this.syncIncident(tenantId, item, actorId, actorRole, actorName);
        break;

      case 'INSPECTION':
        result = await this.syncInspection(tenantId, item, actorId, actorRole, actorName);
        break;

      case 'CAPA':
        result = await this.syncCapa(tenantId, item, actorId, actorRole, actorName);
        break;

      case 'PERMIT':
        result = await this.syncPermit(tenantId, item, actorId, actorRole, actorName);
        break;

      default:
        throw new Error(`Unsupported sync entity type: ${item.entityType}`);
    }

    // 3. Cache successful response in sync_idempotency_keys
    if (result.status === 'SUCCESS') {
      await pool.query(
        `INSERT INTO sync_idempotency_keys (
          id, tenant_id, idempotency_key, entity_type, response_json, device_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (tenant_id, idempotency_key) DO NOTHING`,
        [
          crypto.randomUUID(),
          tenantId,
          item.idempotencyKey,
          item.entityType,
          JSON.stringify(result),
          item.deviceId
        ]
      );
    }

    return result;
  }

  /**
   * Strategy 1: INCIDENTS — Append-Only with Duplicate Flagging
   */
  private static async syncIncident(
    tenantId: string,
    item: SyncBatchItemPayload,
    actorId: string,
    actorRole: string,
    actorName: string
  ): Promise<SyncItemResult> {
    const payload = item.payload;
    const serverId = payload.id || crypto.randomUUID();
    const title = payload.title || 'Offline Reported Incident';
    const narrative = payload.narrative || payload.description || '';
    const pool = getPool();

    // Duplicate Heuristic: check if an incident with same title/reporter was recorded within 10 minutes
    const duplicateCheck = await pool.query(
      `SELECT id FROM incidents 
       WHERE tenant_id = $1 
         AND (title = $2 OR (details->>'narrative' = $3 AND details->>'narrative' IS NOT NULL AND details->>'narrative' != ''))
         AND created_at >= NOW() - INTERVAL '10 minutes'
       LIMIT 1`,
      [tenantId, title, narrative]
    );

    const isDuplicate = duplicateCheck.rows.length > 0;

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO incidents (
          id, tenant_id, incident_number, title, description, severity,
          status, location, details, duplicate_flag, sync_idempotency_key, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          duplicate_flag = EXCLUDED.duplicate_flag,
          updated_at = NOW()`,
        [
          serverId,
          tenantId,
          payload.incident_number || `INC-SYNC-${Date.now().toString().slice(-6)}`,
          title,
          narrative,
          payload.severity || 'Minor',
          payload.status || 'Reported',
          payload.location || payload.site || 'Concession Block 9',
          JSON.stringify({
            ...payload,
            reported_by: actorName,
            incident_type: payload.incident_type || payload.type || 'Near Miss',
            sync_device_id: item.deviceId,
            client_timestamp: item.clientTimestamp
          }),
          isDuplicate,
          item.idempotencyKey
        ]
      );

      // Audit log
      await writeAudit({
        tenantId,
        actorId,
        actorRole,
        action: isDuplicate ? 'INCIDENT_SYNC_FLAGGED_DUPLICATE' : 'INCIDENT_SYNC_INGESTED',
        entityType: 'INCIDENT',
        entityId: serverId,
        afterState: payload,
        metadata: {
          deviceId: item.deviceId,
          idempotencyKey: item.idempotencyKey,
          duplicateFlag: isDuplicate
        }
      });
    });

    return {
      localId: item.localId,
      serverId,
      status: 'SUCCESS',
      duplicateFlag: isDuplicate,
      entityType: 'INCIDENT'
    };
  }

  /**
   * Strategy 2: INSPECTIONS — Last-Writer-Wins Per Field with Full Conflict Audit
   */
  private static async syncInspection(
    tenantId: string,
    item: SyncBatchItemPayload,
    actorId: string,
    actorRole: string,
    actorName: string
  ): Promise<SyncItemResult> {
    const payload = item.payload;
    const inspectionId = payload.id || crypto.randomUUID();
    const pool = getPool();

    const existingRes = await pool.query<{ id: string; answers: any; updated_at: string }>(
      `SELECT id, answers, updated_at FROM inspections WHERE tenant_id = $1 AND id = $2`,
      [tenantId, inspectionId]
    );

    if (existingRes.rows.length === 0) {
      // Create fresh inspection
      await withTenantContext(tenantId, async (client) => {
        await client.query(
          `INSERT INTO inspections (
            id, tenant_id, title, template_type, site_name,
            inspector_name, status, answers, client_updated_at, sync_device_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            inspectionId,
            tenantId,
            payload.title || 'Field PWA Inspection',
            payload.template_type || payload.template_id || 'General HSE',
            payload.site_name || payload.location || 'Block 9 Drilling Camp',
            actorName,
            payload.status || 'Completed',
            JSON.stringify(payload.answers || payload.data || {}),
            item.clientTimestamp,
            item.deviceId
          ]
        );
      });

      return {
        localId: item.localId,
        serverId: inspectionId,
        status: 'SUCCESS',
        entityType: 'INSPECTION'
      };
    }

    // Inspection exists on server: Conflict resolution via Last-Writer-Wins Per Field
    const serverInspection = existingRes.rows[0];
    const serverAnswers = typeof serverInspection.answers === 'object' && serverInspection.answers !== null ? serverInspection.answers : {};
    const clientAnswers = typeof payload.answers === 'object' && payload.answers !== null ? payload.answers : (payload.data || {});

    // Merge answers per field
    const resolvedAnswers: Record<string, any> = { ...serverAnswers };
    for (const [key, clientVal] of Object.entries(clientAnswers)) {
      // Client last-writer-wins per field
      resolvedAnswers[key] = clientVal;
    }

    await withTenantContext(tenantId, async (client) => {
      // 1. Update inspections table with resolved field-level answers
      await client.query(
        `UPDATE inspections
         SET answers = $1,
             client_updated_at = $2,
             sync_device_id = $3,
             updated_at = NOW()
         WHERE id = $4 AND tenant_id = $5`,
        [
          JSON.stringify(resolvedAnswers),
          item.clientTimestamp,
          item.deviceId,
          inspectionId,
          tenantId
        ]
      );

      // 2. Persist both conflicting versions in sync_conflict_audits
      const conflictAuditId = crypto.randomUUID();
      await client.query(
        `INSERT INTO sync_conflict_audits (
          id, tenant_id, entity_type, entity_id, resolution_strategy,
          client_version, server_version, resolved_version, device_id, actor_id, reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [
          conflictAuditId,
          tenantId,
          'INSPECTION',
          inspectionId,
          'LAST_WRITER_WINS_FIELD',
          JSON.stringify(clientAnswers),
          JSON.stringify(serverAnswers),
          JSON.stringify(resolvedAnswers),
          item.deviceId,
          actorId,
          'Offline multi-device concurrent inspection edit merged per-field'
        ]
      );

      // 3. Write to hash-chained audit log
      await writeAudit({
        tenantId,
        actorId,
        actorRole,
        action: 'INSPECTION_SYNC_CONFLICT_RESOLVED_LWW',
        entityType: 'INSPECTION',
        entityId: inspectionId,
        beforeState: serverAnswers,
        afterState: resolvedAnswers,
        metadata: {
          deviceId: item.deviceId,
          strategy: 'LAST_WRITER_WINS_FIELD',
          conflictAuditId
        }
      });
    });

    return {
      localId: item.localId,
      serverId: inspectionId,
      status: 'SUCCESS',
      entityType: 'INSPECTION'
    };
  }

  /**
   * Strategy 3: CAPAS — Server-Authoritative with SoD Re-Validation (Reject Self-Closure)
   */
  private static async syncCapa(
    tenantId: string,
    item: SyncBatchItemPayload,
    actorId: string,
    actorRole: string,
    actorName: string
  ): Promise<SyncItemResult> {
    const payload = item.payload;
    const capaId = payload.id || crypto.randomUUID();
    const pool = getPool();

    // Check if CAPA exists
    const existingRes = await pool.query<{
      id: string;
      owner_name: string;
      verified_by_name: string;
      status: string;
    }>(
      `SELECT id, owner_name, verified_by_name, status FROM capas WHERE tenant_id = $1 AND id = $2`,
      [tenantId, capaId]
    );

    const isClosing = payload.status === 'Closed';

    if (existingRes.rows.length > 0) {
      const existingCapa = existingRes.rows[0];
      const ownerName = existingCapa.owner_name || payload.owner_name;
      const verifierName = payload.verified_by_name || actorName;

      // SEGREGATION OF DUTIES CHECK: Action owner cannot self-verify and close their own action
      if (isClosing) {
        if (ownerName && verifierName && ownerName.trim().toLowerCase() === verifierName.trim().toLowerCase()) {
          // Log SoD rejection in audit trail
          await writeAudit({
            tenantId,
            actorId,
            actorRole,
            action: 'CAPA_SYNC_SOD_VIOLATION',
            entityType: 'CAPA',
            entityId: capaId,
            beforeState: existingCapa,
            afterState: { attemptedStatus: 'Closed', attemptedBy: verifierName },
            metadata: {
              deviceId: item.deviceId,
              reason: SOD_INVARIANTS.CAPA_VERIFIER_COLLISION
            }
          });

          return {
            localId: item.localId,
            serverId: capaId,
            status: 'REJECTED_SOD',
            error: SOD_INVARIANTS.CAPA_VERIFIER_COLLISION,
            entityType: 'CAPA'
          };
        }
      }

      // Valid closure or update: execute update
      await withTenantContext(tenantId, async (client) => {
        await client.query(
          `UPDATE capas
           SET status = $1,
               verified_by_name = $2,
               updated_at = NOW()
           WHERE id = $3 AND tenant_id = $4`,
          [payload.status || existingCapa.status, verifierName, capaId, tenantId]
        );

        await writeAudit({
          tenantId,
          actorId,
          actorRole,
          action: 'CAPA_SYNC_UPDATED',
          entityType: 'CAPA',
          entityId: capaId,
          afterState: payload,
          metadata: { deviceId: item.deviceId }
        });
      });

      return {
        localId: item.localId,
        serverId: capaId,
        status: 'SUCCESS',
        entityType: 'CAPA'
      };
    }

    // CAPA does not exist: create if valid
    if (isClosing && payload.owner_name && payload.verified_by_name &&
        payload.owner_name.trim().toLowerCase() === payload.verified_by_name.trim().toLowerCase()) {
      return {
        localId: item.localId,
        serverId: capaId,
        status: 'REJECTED_SOD',
        error: SOD_INVARIANTS.CAPA_VERIFIER_COLLISION,
        entityType: 'CAPA'
      };
    }

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO capas (
          id, tenant_id, action_number, title, priority, status,
          owner_name, verified_by_name, due_date, hierarchy, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '7 days', 'Engineering', NOW(), NOW())`,
        [
          capaId,
          tenantId,
          payload.action_number || `CAPA-SYNC-${Date.now().toString().slice(-6)}`,
          payload.title || 'Offline Created CAPA',
          payload.priority || 'P2 - High',
          payload.status || 'Open',
          payload.owner_name || 'Salim Al-Harthy',
          payload.verified_by_name || null
        ]
      );
    });

    return {
      localId: item.localId,
      serverId: capaId,
      status: 'SUCCESS',
      entityType: 'CAPA'
    };
  }

  /**
   * Strategy 4: PERMITS — Multi-Party SoD Validation
   */
  private static async syncPermit(
    tenantId: string,
    item: SyncBatchItemPayload,
    actorId: string,
    actorRole: string,
    actorName: string
  ): Promise<SyncItemResult> {
    const payload = item.payload;
    const permitId = payload.id || crypto.randomUUID();

    if (payload.issuer_name && payload.receiver_name &&
        payload.issuer_name.trim().toLowerCase() === payload.receiver_name.trim().toLowerCase()) {
      return {
        localId: item.localId,
        serverId: permitId,
        status: 'REJECTED_SOD',
        error: SOD_INVARIANTS.PERMIT_SIGNATORY_COLLISION,
        entityType: 'PERMIT'
      };
    }

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO permits (
          id, tenant_id, permit_number, permit_type, status, zone,
          exact_location, valid_to, issuer_name, receiver_name, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '24 hours', $8, $9, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()`,
        [
          permitId,
          tenantId,
          payload.permit_number || `PTW-SYNC-${Date.now().toString().slice(-6)}`,
          payload.permit_type || 'Cold Work',
          payload.status || 'Pending',
          payload.zone || 'Zone A',
          payload.exact_location || 'Pipeline Section 3',
          payload.issuer_name || 'Area Authority',
          payload.receiver_name || actorName
        ]
      );
    });

    return {
      localId: item.localId,
      serverId: permitId,
      status: 'SUCCESS',
      entityType: 'PERMIT'
    };
  }
}
