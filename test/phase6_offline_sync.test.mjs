/**
 * Phase 6 Acceptance Test Suite — Offline Sync and Conflict Resolution (Gap G5)
 *
 * Covers:
 * 1. 8-hour offline simulation: 50 queued items (incidents, inspections, CAPAs), reconnection,
 *    zero data loss, all synced or explicitly flagged with a user-visible reason.
 * 2. Duplicate-submission test: same idempotency key sent 5 consecutive times produces exactly 1 record.
 * 3. Offline CAPA closure attempt with SoD violation: Action owner attempts to self-close offline;
 *    rejected on sync, field worker notified with reason, rejection logged in audit trail.
 * 4. Conflict resolution test: Two devices edit same inspection field concurrently offline;
 *    last-writer-wins per field applied; both versions preserved in audit_log and sync_conflict_audits.
 * 5. Incident append-only duplicate heuristic: Duplicate near-miss submissions flagged with duplicate_flag: true.
 * 6. Web Crypto AES-GCM queue encryption: Plaintext is encrypted in client queue before storage.
 * 7. FeatureFlagRegistry activates offlineSyncV2 flag via FEATURE_FLAG_OFFLINE_SYNC_V2.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { withTenantContext, getPool } from '../apps/api/src/db/connection.ts';
import { SyncService } from '../apps/api/src/sync/syncService.ts';
import { EncryptedQueueService } from '../services/encryptedQueueService.ts';
import { FeatureFlagRegistry } from '../packages/shared/src/featureFlags.ts';
import { SOD_INVARIANTS } from '../packages/shared/src/rbac.ts';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function setupBaseline() {
  await withTenantContext(TENANT_ID, async (client) => {
    await client.query(`
      INSERT INTO tenants (id, code, name, jurisdiction, cr_number)
      VALUES ($1, 'OMAN_ENERGY', 'Oman Energy Concession', 'OMAN', 'CR-9901')
      ON CONFLICT (id) DO NOTHING
    `, [TENANT_ID]);
  });
}

// =============================================================================
// TEST 1: 8-HOUR OFFLINE SIMULATION — 50 QUEUED ITEMS, ZERO DATA LOSS
// =============================================================================

test('Phase 6 Sync 1: 8-hour offline test — 50 queued items, reconnection, zero data loss', async () => {
  await setupBaseline();
  EncryptedQueueService.clearMemoryStore();

  const deviceId = 'pwa-rugged-tablet-field-01';
  const startTime = new Date(Date.now() - 8 * 60 * 60 * 1000); // 8 hours ago
  const queuedItems = [];

  // Enqueue 50 diverse field items in local encrypted queue over 8 hours
  for (let i = 1; i <= 50; i++) {
    const itemTime = new Date(startTime.getTime() + i * 9 * 60 * 1000).toISOString();
    const entityType = i % 3 === 0 ? 'INCIDENT' : i % 3 === 1 ? 'INSPECTION' : 'CAPA';
    const localId = `offline-local-${i}-${Date.now()}`;
    const idempotencyKey = `idemp-8hr-test-${i}-${Date.now()}`;

    let payload;
    if (entityType === 'INCIDENT') {
      payload = {
        title: `Near Miss in Block ${i}: Trip hazard near pipe rack`,
        narrative: `Worker noticed loose scaffolding plank at coordinate E-${i}`,
        severity: 'Low',
        location: `Wellhead-${i}`
      };
    } else if (entityType === 'INSPECTION') {
      payload = {
        title: `Daily Rig Floor Inspection #${i}`,
        answers: {
          scaffoldingCompliant: true,
          ppeWorn: true,
          twlValue: 125 - (i % 20)
        }
      };
    } else {
      payload = {
        title: `Action Item #${i}: Replace worn hydraulic hose`,
        owner_name: `Engineer-${i}`,
        verified_by_name: `HSE-Officer-${i}`, // Valid SoD
        status: 'Open'
      };
    }

    const encrypted = await EncryptedQueueService.enqueueItem({
      localId,
      idempotencyKey,
      entityType,
      deviceId,
      clientTimestamp: itemTime,
      payload
    });

    queuedItems.push({
      localId,
      idempotencyKey,
      entityType,
      deviceId,
      clientTimestamp: itemTime,
      payload
    });
  }

  assert.equal(queuedItems.length, 50, 'All 50 items successfully enqueued offline');

  // Simulate reconnection: Retrieve all pending decrypted items
  const pendingDecrypted = await EncryptedQueueService.getPendingItems();
  assert.equal(pendingDecrypted.length, 50, 'Decrypted queue holds exactly 50 pending records');

  // Ingest batch via Server-Side Sync Engine
  const syncResponse = await SyncService.processBatch(
    TENANT_ID,
    queuedItems,
    'field_worker_01',
    'Worker'
  );

  assert.equal(syncResponse.processed, 50, 'Server processed all 50 queued items');
  assert.equal(syncResponse.successes, 50, 'Zero data loss: 50/50 successfully ingested');
  assert.equal(syncResponse.failures, 0, 'Zero unexpected failures');

  // Verify all 50 items received server IDs
  for (const res of syncResponse.results) {
    assert(res.serverId, `Record ${res.localId} must receive an authoritative server ID`);
    assert.equal(res.status, 'SUCCESS');
    await EncryptedQueueService.updateItemStatus(res.localId, 'SYNCED');
  }

  // Queue stats after sync
  const stats = await EncryptedQueueService.getQueueStats();
  assert.equal(stats.pendingCount, 0, 'No items remaining pending');
  assert.equal(stats.syncedCount, 50, '50 items marked SYNCED');
});

// =============================================================================
// TEST 2: DUPLICATE-SUBMISSION TEST — SAME IDEMPOTENCY KEY SENT 5 TIMES
// =============================================================================

test('Phase 6 Sync 2: Duplicate-submission test — same idempotency key sent 5 times yields exactly one record', async () => {
  await setupBaseline();
  const pool = getPool();
  const idempotencyKey = `idemp-dup-test-${crypto.randomUUID()}`;
  const localId = `local-${crypto.randomUUID()}`;

  const item = {
    localId,
    idempotencyKey,
    entityType: 'INCIDENT',
    deviceId: 'device-test-dup',
    clientTimestamp: new Date().toISOString(),
    payload: {
      title: 'Gas Leak Flange 4B',
      narrative: 'Minor H2S trace detected (2ppm). Flange bolts retorqued.',
      severity: 'Minor',
      location: 'Manifold A'
    }
  };

  const results = [];

  // Submit the exact same item 5 consecutive times (simulating aggressive retry/reconnection)
  for (let i = 0; i < 5; i++) {
    const res = await SyncService.processSingleItem(
      TENANT_ID,
      item,
      'field_operator_02',
      'Worker'
    );
    results.push(res);
  }

  // Verify all 5 responses return the identical serverId
  const authoritativeServerId = results[0].serverId;
  assert(authoritativeServerId, 'First response generated server ID');

  for (let i = 1; i < 5; i++) {
    assert.equal(
      results[i].serverId,
      authoritativeServerId,
      `Retry #${i} must return identical server ID`
    );
    assert.equal(
      results[i].idempotent,
      true,
      `Retry #${i} must be flagged as idempotent cache hit`
    );
  }

  // Verify database contains EXACTLY ONE record in incidents table
  const dbCheck = await pool.query(
    `SELECT COUNT(*) as count FROM incidents WHERE tenant_id = $1 AND sync_idempotency_key = $2`,
    [TENANT_ID, idempotencyKey]
  );
  assert.equal(parseInt(dbCheck.rows[0].count, 10), 1, 'Exactly one row created in database');
});

// =============================================================================
// TEST 3: OFFLINE CAPA CLOSURE WITH SOD VIOLATION REJECTION & NOTIFICATION
// =============================================================================

test('Phase 6 Sync 3: Offline CAPA closure attempt by Action Owner is rejected on sync with SoD violation', async () => {
  await setupBaseline();
  const capaId = crypto.randomUUID();
  const pool = getPool();

  // Create an open CAPA on the server owned by "Salim Al-Harthy"
  await withTenantContext(TENANT_ID, async (client) => {
    await client.query(
      `INSERT INTO capas (
        id, tenant_id, action_number, title, priority, status,
        owner_name, verified_by_name, due_date, hierarchy
      ) VALUES ($1, $2, 'CAPA-SOD-OFFLINE-01', 'Repair high-pressure steam valve', 'P1 - Critical', 'Open',
        'Salim Al-Harthy', NULL, NOW() + INTERVAL '3 days', 'Engineering')`,
      [capaId, TENANT_ID]
    );
  });

  // Action Owner attempts to close their own CAPA while offline
  const offlineClosureItem = {
    localId: `capa-close-local-${crypto.randomUUID()}`,
    idempotencyKey: `idemp-capa-sod-${crypto.randomUUID()}`,
    entityType: 'CAPA',
    deviceId: 'device-salim-phone',
    clientTimestamp: new Date().toISOString(),
    payload: {
      id: capaId,
      status: 'Closed',
      owner_name: 'Salim Al-Harthy',
      verified_by_name: 'Salim Al-Harthy' // SOD COLLISION: Owner self-verifying
    },
    actorId: 'salim_id',
    actorName: 'Salim Al-Harthy',
    actorRole: 'Worker'
  };

  const syncResult = await SyncService.processSingleItem(
    TENANT_ID,
    offlineClosureItem,
    'salim_id',
    'Worker'
  );

  // Assert rejection
  assert.equal(syncResult.status, 'REJECTED_SOD', 'Sync must reject unauthorized self-closure');
  assert(
    syncResult.error && syncResult.error.includes('Action Owner cannot self-verify and close'),
    `Expected SoD violation message, got: ${syncResult.error}`
  );

  // Verify server CAPA status remained Open
  const capaDb = await pool.query(
    `SELECT status FROM capas WHERE id = $1 AND tenant_id = $2`,
    [capaId, TENANT_ID]
  );
  assert.equal(capaDb.rows[0].status, 'Open', 'CAPA must remain Open in database');

  // Verify audit log captured the rejected attempt
  const auditRes = await pool.query(
    `SELECT action, metadata FROM audit_log 
     WHERE tenant_id = $1 AND entity_id = $2 AND action = 'CAPA_SYNC_SOD_VIOLATION'
     ORDER BY timestamp DESC LIMIT 1`,
    [TENANT_ID, capaId]
  );
  assert.equal(auditRes.rows.length, 1, 'CAPA_SYNC_SOD_VIOLATION recorded in audit trail');
});

// =============================================================================
// TEST 4: CONCURRENT INSPECTION CONFLICT — LAST-WRITER-WINS PER FIELD
// =============================================================================

test('Phase 6 Sync 4: Two devices edit same inspection field offline; LWW-F merges with both versions audited', async () => {
  await setupBaseline();
  const pool = getPool();
  const inspectionId = crypto.randomUUID();

  // Initial inspection created by Device A
  await withTenantContext(TENANT_ID, async (client) => {
    await client.query(
      `INSERT INTO inspections (
        id, tenant_id, title, template_type, site_name, status,
        inspector_name, answers, client_updated_at, sync_device_id, created_at, updated_at
      ) VALUES ($1, $2, 'Compressor Station A Check', 'turbines', 'Station A', 'Completed',
        'Inspector Hamed', $3, '2026-11-03T10:00:00.000Z', 'device-A', NOW(), NOW())`,
      [
        inspectionId,
        TENANT_ID,
        JSON.stringify({
          lubeOilLevel: 'Optimal',
          vibrationMmSec: 2.1,
          guardrailCondition: 'Good'
        })
      ]
    );
  });

  // Device B performed concurrent offline inspection edit at 10:15:00
  const deviceBItem = {
    localId: `insp-dev-b-${crypto.randomUUID()}`,
    idempotencyKey: `idemp-insp-b-${crypto.randomUUID()}`,
    entityType: 'INSPECTION',
    deviceId: 'device-B',
    clientTimestamp: '2026-11-03T10:15:00.000Z',
    payload: {
      id: inspectionId,
      answers: {
        vibrationMmSec: 4.8, // Device B observed spike in vibration
        oilFilterDeltaP: '0.4 bar' // Device B added pressure drop reading
      }
    },
    actorId: 'inspector_khalfan',
    actorRole: 'HSE_Officer'
  };

  const syncResult = await SyncService.processSingleItem(
    TENANT_ID,
    deviceBItem,
    'inspector_khalfan',
    'HSE_Officer'
  );

  assert.equal(syncResult.status, 'SUCCESS');

  // Verify merged state in inspections table:
  // - lubeOilLevel & guardrailCondition preserved from Device A
  // - vibrationMmSec updated to 4.8 from Device B (Last-Writer-Wins)
  // - oilFilterDeltaP added from Device B
  const updatedInsp = await pool.query(
    `SELECT answers FROM inspections WHERE id = $1 AND tenant_id = $2`,
    [inspectionId, TENANT_ID]
  );

  const merged = updatedInsp.rows[0].answers;
  assert.equal(merged.lubeOilLevel, 'Optimal', 'Device A field preserved');
  assert.equal(merged.guardrailCondition, 'Good', 'Device A field preserved');
  assert.equal(merged.vibrationMmSec, 4.8, 'Device B later field won');
  assert.equal(merged.oilFilterDeltaP, '0.4 bar', 'Device B new field merged');

  // Verify both versions preserved in sync_conflict_audits table
  const conflictAudit = await pool.query(
    `SELECT * FROM sync_conflict_audits WHERE tenant_id = $1 AND entity_id = $2`,
    [TENANT_ID, inspectionId]
  );

  assert.equal(conflictAudit.rows.length, 1, 'Conflict record exists in sync_conflict_audits');
  assert.equal(conflictAudit.rows[0].resolution_strategy, 'LAST_WRITER_WINS_FIELD');
  assert.equal(conflictAudit.rows[0].server_version.vibrationMmSec, 2.1, 'Original version recorded');
  assert.equal(conflictAudit.rows[0].client_version.vibrationMmSec, 4.8, 'Incoming version recorded');
});

// =============================================================================
// TEST 5: INCIDENT APPEND-ONLY DUPLICATE FLAGGING
// =============================================================================

test('Phase 6 Sync 5: Near-miss duplicate reports are appended without data loss and flagged duplicate_flag: true', async () => {
  await setupBaseline();
  const pool = getPool();
  const title = `Chemical Tote Leaking Valve - Block 4`;
  const narrative = `Slight sulfuric acid drip (1 drop/min) onto containment bund.`;

  // First report
  const item1 = {
    localId: `inc-1-${crypto.randomUUID()}`,
    idempotencyKey: `idemp-inc-first-${crypto.randomUUID()}`,
    entityType: 'INCIDENT',
    deviceId: 'device-reporter-1',
    clientTimestamp: new Date().toISOString(),
    payload: { title, narrative, severity: 'Medium', location: 'Chemical Yard' }
  };

  const res1 = await SyncService.processSingleItem(TENANT_ID, item1, 'worker_1', 'Worker');
  assert.equal(res1.status, 'SUCCESS');
  assert.equal(res1.duplicateFlag, false, 'First submission is not duplicate');

  // Second duplicate report submitted 2 minutes later by a co-worker
  const item2 = {
    localId: `inc-2-${crypto.randomUUID()}`,
    idempotencyKey: `idemp-inc-second-${crypto.randomUUID()}`,
    entityType: 'INCIDENT',
    deviceId: 'device-reporter-2',
    clientTimestamp: new Date(Date.now() + 120000).toISOString(),
    payload: { title, narrative, severity: 'Medium', location: 'Chemical Yard' }
  };

  const res2 = await SyncService.processSingleItem(TENANT_ID, item2, 'worker_2', 'Worker');
  assert.equal(res2.status, 'SUCCESS');
  assert.equal(res2.duplicateFlag, true, 'Second submission flagged as duplicate for human review');
  assert.notEqual(res1.serverId, res2.serverId, 'Both incidents preserved with distinct IDs (no overwrite)');
});

// =============================================================================
// TEST 6: WEB CRYPTO AES-GCM QUEUE ENCRYPTION
// =============================================================================

test('Phase 6 Sync 6: EncryptedQueueService encrypts local items with AES-GCM and decrypts on demand', async () => {
  const plainPayload = {
    patientName: 'Confidential Worker Medical Log',
    incidentType: 'Heat Exhaustion Stage 2',
    twlReading: 104,
    rectalTemp: 38.6
  };

  const encrypted = await EncryptedQueueService.encryptPayload(plainPayload);
  assert(encrypted.ciphertext, 'Ciphertext generated');
  assert(encrypted.iv, 'IV generated');
  assert(!encrypted.ciphertext.includes('Confidential'), 'Plaintext must not appear in ciphertext');

  const decrypted = await EncryptedQueueService.decryptPayload(encrypted.ciphertext, encrypted.iv);
  assert.deepEqual(decrypted, plainPayload, 'Decrypted object exactly matches original payload');
});

// =============================================================================
// TEST 7: FEATURE FLAG REGISTRY (offlineSyncV2)
// =============================================================================

test('Phase 6 Sync 7: FeatureFlagRegistry activates offlineSyncV2 flag via FEATURE_FLAG_OFFLINE_SYNC_V2', () => {
  assert.equal(FeatureFlagRegistry.isEnabled('offlineSyncV2', {}), false, 'Default offlineSyncV2 is false');

  const activeFlags = FeatureFlagRegistry.getAllFlags({
    FEATURE_FLAG_OFFLINE_SYNC_V2: 'true'
  });
  assert.equal(activeFlags.offlineSyncV2, true, 'offlineSyncV2 activated via env');
});
