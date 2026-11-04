/**
 * Phase 7 Acceptance Test Suite — External Integrations (Gap G6)
 *
 * Covers:
 * 1. Live/Mock Weather Provider populates twl_readings; simulated TWL below 115 W/m² threshold
 *    creates twl_breaches and blocks permit activation (PDO SP-1170).
 * 2. Notification: statutory escalation event produces a delivered email in the test provider
 *    with a stored delivery receipt in notification_outbox.
 * 3. ERP: sandbox adapter syncs 10 contractor records and 10 documents.
 * 4. ERP: monthly statistics export matches the operator template byte-for-byte against a fixture.
 * 5. Live adapters fail closed with clear error when credentials are absent.
 * 6. SCIM 2.0 endpoint provisions, updates, and queries user records according to SCIM schema.
 * 7. FeatureFlagRegistry activates integrations flag via FEATURE_FLAG_INTEGRATIONS.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { withTenantContext, getPool } from '../apps/api/src/db/connection.ts';
import { FeatureFlagRegistry } from '../packages/shared/src/featureFlags.ts';
import { MockWeatherProvider } from '../apps/api/src/integrations/weather/mockWeatherProvider.ts';
import { PublicWeatherProvider } from '../apps/api/src/integrations/weather/publicWeatherProvider.ts';
import { TwlEvaluationWorker } from '../apps/api/src/integrations/weather/twlEvaluationWorker.ts';
import { SandboxErpAdapter } from '../apps/api/src/integrations/erp/sandboxErpAdapter.ts';
import { LiveErpAdapter } from '../apps/api/src/integrations/erp/liveErpAdapter.ts';
import { OPERATOR_HSE_STATS_FIXTURE_JSON } from '../apps/api/src/integrations/erp/fixtures/operatorHseStatsFixture.ts';
import { MockNotificationProvider } from '../apps/api/src/integrations/notification/mockNotificationProvider.ts';
import { LiveNotificationProvider } from '../apps/api/src/integrations/notification/liveNotificationProvider.ts';
import { TemplatedNotificationService } from '../apps/api/src/integrations/notification/templatedNotificationService.ts';
import { ScimService } from '../apps/api/src/integrations/identity/scimService.ts';

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
// TEST 1: LIVE & MOCK WEATHER INGESTION + TWL PERMIT GATING (PDO SP-1170)
// =============================================================================

test('Phase 7 Integration 1: Weather readings populate twl_readings; TWL < 115 creates breach that blocks permit activation', async () => {
  await setupBaseline();
  const pool = getPool();
  const siteLocation = 'Rig Site Marmul Cluster 4';

  // 1. Ingest normal reading via Public / Safe Weather Provider
  const safeProvider = new MockWeatherProvider('SAFE');
  const safeResult = await TwlEvaluationWorker.evaluateSite(
    TENANT_ID,
    crypto.randomUUID(),
    siteLocation,
    safeProvider
  );

  assert(safeResult.readingId, 'Normal reading persisted to twl_readings');
  assert(safeResult.twlValue >= 140, `Safe TWL value expected >= 140 W/m², got: ${safeResult.twlValue}`);
  assert.equal(safeResult.flagColor, 'Green', 'Green flag for safe conditions');
  assert.equal(safeResult.stopWorkTriggered, false, 'No stop work triggered under safe conditions');

  // Verify permit gate allows work under safe conditions
  const safeGate = await TwlEvaluationWorker.checkPermitThermalGate(TENANT_ID, siteLocation);
  assert.equal(safeGate.allowed, true, 'Permits allowed under safe conditions');

  // 2. Simulate desert summer extreme thermal stress (TWL < 115 W/m² Stop-Work threshold)
  const breachProvider = new MockWeatherProvider('BREACH');
  const breachResult = await TwlEvaluationWorker.evaluateSite(
    TENANT_ID,
    crypto.randomUUID(),
    siteLocation,
    breachProvider
  );

  assert(breachResult.twlValue < 115, `Expected breach TWL < 115 W/m², got: ${breachResult.twlValue}`);
  assert.equal(breachResult.flagColor, 'Red', 'Red flag mandatory for TWL < 115 W/m²');
  assert.equal(breachResult.stopWorkTriggered, true, 'Stop work flag must be true');
  assert(breachResult.breachId, 'Breach record must be created');

  // 3. Verify breach is stored in twl_breaches table
  const breachDb = await pool.query(
    `SELECT * FROM twl_breaches WHERE id = $1 AND tenant_id = $2`,
    [breachResult.breachId, TENANT_ID]
  );
  assert.equal(breachDb.rows.length, 1, 'Breach record exists in twl_breaches table');
  assert.equal(breachDb.rows[0].stop_work_triggered, true, 'stop_work_triggered is true');

  // 4. Verify permit thermal safety gate blocks permit activation at the site
  const gatedCheck = await TwlEvaluationWorker.checkPermitThermalGate(TENANT_ID, siteLocation);
  assert.equal(gatedCheck.allowed, false, 'Permit activation must be blocked during active TWL breach');
  assert(
    gatedCheck.reason && gatedCheck.reason.includes('Active Thermal Stop-Work breach'),
    `Reason must state thermal stop-work breach, got: ${gatedCheck.reason}`
  );
  assert(gatedCheck.reason.includes('PDO SP-1170'), 'Reason must cite PDO SP-1170 standard');
});

// =============================================================================
// TEST 2: NOTIFICATION DELIVERY & OUTBOX RECEIPT STORAGE
// =============================================================================

test('Phase 7 Integration 2: Statutory escalation produces delivered email with stored delivery receipt in outbox', async () => {
  await setupBaseline();
  const pool = getPool();
  const mockProvider = new MockNotificationProvider();
  mockProvider.clear();

  const recipient = 'compliance.lead@operator.om';
  const incidentNumber = 'INC-2026-092';
  const hoursRemaining = 2;
  const deadline = '2026-11-04T14:00:00.000Z';

  // Dispatch statutory clock escalation notice
  const dispatchResult = await TemplatedNotificationService.dispatch(
    TENANT_ID,
    recipient,
    'email',
    'statutory_clock_escalation',
    { incidentNumber, hoursRemaining, deadline },
    mockProvider
  );

  assert(dispatchResult.outboxId, 'Outbox ID generated');
  assert.equal(dispatchResult.receipt.status, 'DELIVERED', 'Email marked as delivered');
  assert.equal(mockProvider.getReceiptCount(), 1, 'Email delivered to mock provider');

  // Verify delivery record in notification_outbox table
  const outboxRes = await pool.query(
    `SELECT * FROM notification_outbox WHERE id = $1 AND tenant_id = $2`,
    [dispatchResult.outboxId, TENANT_ID]
  );
  assert.equal(outboxRes.rows.length, 1, 'Record persisted in notification_outbox');
  const record = outboxRes.rows[0];
  assert.equal(record.status, 'DELIVERED');
  assert.equal(record.channel, 'email');
  assert.equal(record.recipient, recipient);
  assert.equal(record.template_id, 'statutory_clock_escalation');
  assert(record.delivery_receipt.receiptId, 'Delivery receipt stored');
});

// =============================================================================
// TEST 3: ERP SANDBOX CONTRACTOR & DOCUMENT MASTER SYNC
// =============================================================================

test('Phase 7 Integration 3: Sandbox ERP adapter syncs 10 contractor records and 10 compliance documents', async () => {
  await setupBaseline();
  const pool = getPool();
  const adapter = new SandboxErpAdapter();

  // 1. Sync 10 contractor records
  const contractorResult = await adapter.syncContractorMaster(TENANT_ID);
  assert.equal(contractorResult.syncedCount, 10, 'Sandbox adapter returned exactly 10 contractors');

  // Verify contractors table contains the 10 synced records
  const cDb = await pool.query(
    `SELECT COUNT(*) as count FROM contractors WHERE tenant_id = $1`,
    [TENANT_ID]
  );
  assert(parseInt(cDb.rows[0].count, 10) >= 10, 'At least 10 contractors present in database');

  // 2. Sync 10 contractor compliance documents
  const documentResult = await adapter.syncDocumentExpiry(TENANT_ID);
  assert.equal(documentResult.syncedCount, 10, 'Sandbox adapter returned exactly 10 compliance documents');

  // Verify contractor_documents table contains the 10 synced records
  const dDb = await pool.query(
    `SELECT COUNT(*) as count FROM contractor_documents WHERE tenant_id = $1`,
    [TENANT_ID]
  );
  assert(parseInt(dDb.rows[0].count, 10) >= 10, 'At least 10 contractor documents present in database');

  // 3. Verify sync audit log in erp_sync_logs
  const logDb = await pool.query(
    `SELECT sync_type, records_synced, status FROM erp_sync_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 2`,
    [TENANT_ID]
  );
  assert(logDb.rows.length >= 2, 'Sync events recorded in erp_sync_logs');
  assert.equal(logDb.rows[0].status, 'SUCCESS');
});

// =============================================================================
// TEST 4: ERP MONTHLY HSE STATISTICS EXPORT — BYTE-FOR-BYTE FIXTURE MATCH
// =============================================================================

test('Phase 7 Integration 4: Monthly HSE statistics export matches official operator template byte-for-byte', async () => {
  await setupBaseline();
  const adapter = new SandboxErpAdapter();

  const exportResult = await adapter.exportMonthlyHseStatistics(TENANT_ID, '2026-10');

  // BYTE-FOR-BYTE exact equality check
  assert.equal(
    exportResult.exportPayload,
    OPERATOR_HSE_STATS_FIXTURE_JSON,
    'Export payload must match the operator fixture byte-for-byte'
  );

  // Buffer equality check
  const exportedBuf = Buffer.from(exportResult.exportPayload, 'utf8');
  const fixtureBuf = Buffer.from(OPERATOR_HSE_STATS_FIXTURE_JSON, 'utf8');
  assert.equal(exportedBuf.length, fixtureBuf.length, 'Payload byte length matches exactly');
  assert.equal(Buffer.compare(exportedBuf, fixtureBuf), 0, 'Byte buffers are identical (0 delta)');

  // Verify SHA-256 checksum
  const expectedHash = crypto.createHash('sha256').update(fixtureBuf).digest('hex');
  assert.equal(exportResult.checksum, expectedHash, 'Checksum matches fixture hash');
});

// =============================================================================
// TEST 5: LIVE ADAPTERS FAIL CLOSED WITHOUT CREDENTIALS
// =============================================================================

test('Phase 7 Integration 5: Live adapters fail closed with clear error when credentials are absent', async () => {
  // Ensure live env vars are cleared
  const origEndpoint = process.env.SAP_ODATA_ENDPOINT;
  const origSecret = process.env.SAP_CLIENT_SECRET;
  const origSendGrid = process.env.SENDGRID_API_KEY;
  const origTwilio = process.env.TWILIO_AUTH_TOKEN;

  delete process.env.SAP_ODATA_ENDPOINT;
  delete process.env.SAP_CLIENT_SECRET;
  delete process.env.SENDGRID_API_KEY;
  delete process.env.TWILIO_AUTH_TOKEN;

  try {
    // 1. Live ERP Adapter fails closed
    const liveErp = new LiveErpAdapter();
    await assert.rejects(
      async () => {
        await liveErp.syncContractorMaster(TENANT_ID);
      },
      /Missing mandatory SAP S\/4HANA credentials.*failing closed/i,
      'Live ERP adapter must fail closed with explicit message when credentials absent'
    );

    // 2. Live Notification Provider fails closed for email
    const liveNotification = new LiveNotificationProvider();
    await assert.rejects(
      async () => {
        await liveNotification.send({
          to: 'safety@site.om',
          body: 'Emergency alert',
          channel: 'email'
        });
      },
      /Missing SENDGRID_API_KEY credentials.*failing closed/i,
      'Live Notification provider must fail closed for email when credentials absent'
    );

    // 3. Live Notification Provider fails closed for SMS
    await assert.rejects(
      async () => {
        await liveNotification.send({
          to: '+96899112233',
          body: 'Emergency alert',
          channel: 'sms'
        });
      },
      /Missing TWILIO credentials.*failing closed/i,
      'Live Notification provider must fail closed for SMS when credentials absent'
    );
  } finally {
    // Restore
    if (origEndpoint) process.env.SAP_ODATA_ENDPOINT = origEndpoint;
    if (origSecret) process.env.SAP_CLIENT_SECRET = origSecret;
    if (origSendGrid) process.env.SENDGRID_API_KEY = origSendGrid;
    if (origTwilio) process.env.TWILIO_AUTH_TOKEN = origTwilio;
  }
});

// =============================================================================
// TEST 6: SCIM 2.0 USER LIFECYCLE MANAGEMENT (RFC 7643 / RFC 7644)
// =============================================================================

test('Phase 7 Integration 6: SCIM 2.0 endpoint provisions, queries, updates, and deactivates users', async () => {
  await setupBaseline();
  const userName = `worker_${crypto.randomUUID().slice(0, 8)}@operator.om`;

  // 1. Create user via SCIM
  const scimPayload = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    userName,
    displayName: 'Rashid Al-Kiyumi',
    emails: [{ value: userName, primary: true }],
    roles: [{ value: 'hse_officer' }],
    active: true
  };

  const createdUser = await ScimService.createUser(TENANT_ID, scimPayload, 'azure_ad');
  assert(createdUser.id, 'User created with SCIM ID');
  assert.equal(createdUser.userName, userName);
  assert.equal(createdUser.active, true);

  // 2. Query user by ID
  const retrievedUser = await ScimService.getUser(TENANT_ID, createdUser.id);
  assert(retrievedUser, 'User retrieved via SCIM');
  assert.equal(retrievedUser.displayName, 'Rashid Al-Kiyumi');

  // 3. List users
  const listRes = await ScimService.listUsers(TENANT_ID, 1, 10);
  assert(listRes.totalResults >= 1, 'Total results >= 1');
  assert(listRes.Resources.some(u => u.id === createdUser.id), 'Created user is in resource list');

  // 4. Deactivate user via SCIM Patch
  const patchRes = await ScimService.patchUser(TENANT_ID, createdUser.id, {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
    Operations: [{ op: 'replace', path: 'active', value: false }]
  });
  assert(patchRes, 'Patched user returned');
  assert.equal(patchRes.active, false, 'User successfully deactivated via SCIM');
});

// =============================================================================
// TEST 7: FEATURE FLAG REGISTRY (integrations)
// =============================================================================

test('Phase 7 Integration 7: FeatureFlagRegistry activates integrations flag via FEATURE_FLAG_INTEGRATIONS', () => {
  assert.equal(
    FeatureFlagRegistry.isEnabled('integrations', {}),
    false,
    'Default integrations flag is false'
  );

  const activeFlags = FeatureFlagRegistry.getAllFlags({
    FEATURE_FLAG_INTEGRATIONS: 'true'
  });
  assert.equal(activeFlags.integrations, true, 'integrations flag activated via env variable');
});
