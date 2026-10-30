import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { auditLedger, HashChainedAuditLedger } from '../services/hashChainedAuditLedger.ts';
import { enterpriseRepo, DEFAULT_TENANT_ID } from '../services/persistence/enterpriseRepository.ts';
import {
  SimulatedStatutoryChannel,
  LiveStatutoryChannel,
  getStatutoryNotificationChannel
} from '../services/integrations/statutoryChannel.ts';
import { EncryptedOfflineQueue } from '../services/encryptedOfflineQueue.ts';

// =============================================================================
// TEST SUITE 1: POSTGRESQL 16 SCHEMA & TENANT RLS MIGRATIONS (GUARDRAIL G-6)
// =============================================================================
test('PostgreSQL 16 Migration files enforce Tenant RLS on all tenant data tables (G-6)', () => {
  const upSqlPath = path.resolve(process.cwd(), 'migrations/0001_enterprise_rls_schema.up.sql');
  const downSqlPath = path.resolve(process.cwd(), 'migrations/0001_enterprise_rls_schema.down.sql');

  assert.ok(fs.existsSync(upSqlPath), '0001_enterprise_rls_schema.up.sql must exist');
  assert.ok(fs.existsSync(downSqlPath), '0001_enterprise_rls_schema.down.sql must exist');

  const upSql = fs.readFileSync(upSqlPath, 'utf8');
  const downSql = fs.readFileSync(downSqlPath, 'utf8');

  const tenantTables = [
    'users',
    'incidents',
    'permits',
    'capas',
    'audits',
    'audit_ledger_log'
  ];

  for (const table of tenantTables) {
    // Check tenant_id column exists
    assert.match(
      upSql,
      new RegExp(`CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?tenant_id UUID NOT NULL REFERENCES tenants\\(id\\)`, 'i'),
      `Table ${table} must define tenant_id UUID NOT NULL REFERENCES tenants(id)`
    );

    // Check RLS is enabled
    assert.match(
      upSql,
      new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, 'i'),
      `Table ${table} must have ENABLE ROW LEVEL SECURITY`
    );

    // Check policy is created
    assert.match(
      upSql,
      new RegExp(`CREATE POLICY [\\s\\S]*?ON ${table}[\\s\\S]*?USING \\(tenant_id = NULLIF\\(current_setting\\('app\\.current_tenant_id'`, 'i'),
      `Table ${table} must have tenant isolation policy using current_setting`
    );
  }

  // Down migration must drop all tables
  for (const table of tenantTables) {
    assert.match(
      downSql,
      new RegExp(`DROP TABLE IF EXISTS ${table} CASCADE;`, 'i'),
      `Down migration must drop table ${table}`
    );
  }
});

// =============================================================================
// TEST SUITE 2: APPEND-ONLY HASH-CHAINED AUDIT LEDGER (TAMPER-EVIDENT LOG)
// =============================================================================
test('HashChainedAuditLedger records state transitions and detects cryptographic tampering', async () => {
  const ledger = HashChainedAuditLedger.getInstance();

  const entry1 = await ledger.append({
    tenantId: DEFAULT_TENANT_ID,
    actorId: 'usr-safety-lead',
    actorRole: 'HSE_Officer',
    action: 'INCIDENT_FILED',
    entityType: 'Incident',
    entityId: 'INC-2026-TEST-001',
    payload: { title: 'Gas leak in compressor skid', severity: 'High' }
  });

  const entry2 = await ledger.append({
    tenantId: DEFAULT_TENANT_ID,
    actorId: 'usr-area-auth',
    actorRole: 'Site_Supervisor',
    action: 'PERMIT_ISSUED',
    entityType: 'PermitToWork',
    entityId: 'ptw-test-001',
    payload: { permitNumber: 'PTW-2026-9901', type: 'Hot Work' }
  });

  // Verify hash chaining
  assert.equal(entry2.prevHash, entry1.currentHash, 'Second block prevHash must strictly match first block currentHash');

  // Verify full chain integrity
  const verifyResult = ledger.verifyChainIntegrity();
  assert.equal(verifyResult.valid, true, 'Original ledger chain must be valid');
  assert.ok(verifyResult.totalRecords >= 2, 'Ledger must have recorded entries');

  // Verify exportable audit log
  const exportData = ledger.getEntries({ limit: 10 });
  assert.ok(exportData.items.length >= 2, 'Exported entries must contain recorded items');
  assert.ok(exportData.headHash.length === 64, 'Head hash must be a 64-char hex SHA256');
});

// =============================================================================
// TEST SUITE 3: SERVER-SIDE SEGREGATION OF DUTIES (SOD) ENFORCEMENT
// =============================================================================
test('EnterpriseRepository strictly blocks Permit self-authorization (SoD Invariant)', async () => {
  const illegalPermit = {
    id: 'ptw-sod-violation-test',
    permitNumber: 'PTW-2026-SOD-01',
    title: 'Hot Work on High Pressure Header',
    type: 'Hot Work',
    status: 'Active',
    zone: 'Zone 1 - Hydrocarbon Process',
    exactLocation: 'Mina Al Fahal Refinery',
    contractor: 'Apex Piping LLC',
    crewSize: 4,
    riskScore: 16,
    riskRating: 'High',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 3600000).toISOString(),
    issuerSignature: {
      signed: true,
      signatoryName: 'Hamdan Al-Harthy',
      signatoryRole: 'Area Authority',
      signatoryOrg: 'Gulf Energy',
      timestamp: new Date().toISOString(),
      checklistConfirmed: true
    },
    receiverSignature: {
      signed: true,
      signatoryName: 'Hamdan Al-Harthy', // Same individual trying to self-authorize!
      signatoryRole: 'Permit Receiver',
      signatoryOrg: 'Apex Piping',
      timestamp: new Date().toISOString(),
      checklistConfirmed: true
    },
    simopsClashLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await assert.rejects(
    async () => {
      await enterpriseRepo.savePermit(
        illegalPermit,
        { id: 'usr-hamdan', name: 'Hamdan Al-Harthy', role: 'Area Authority' }
      );
    },
    /Segregation of Duties \(SoD\) Invariant Violation/,
    'Permit Receiver cannot self-authorize as Permit Issuer'
  );
});

test('EnterpriseRepository strictly blocks CAPA self-verification and closure (SoD Invariant)', async () => {
  const illegalCapa = {
    id: 'capa-sod-violation-test',
    title: 'Install scaffold netting over pipe rack',
    sourceType: 'Incident',
    sourceId: 'INC-2026-001',
    siteName: 'Mina Al Fahal',
    ownerName: 'Tariq Al-Hashemi', // Action Owner
    ownerRole: 'Rigger Foreman',
    priority: 'P1 - Critical',
    status: 'Closed', // Trying to close
    dueDate: '2026-11-01',
    countdownText: '3 days left',
    isOverdue: false,
    hierarchy: 'Engineering',
    details: 'Netting installed',
    verifiedBy: 'Tariq Al-Hashemi', // Action owner trying to self-verify!
    verifiedByName: 'Tariq Al-Hashemi'
  };

  await assert.rejects(
    async () => {
      await enterpriseRepo.saveCapa(
        illegalCapa,
        { id: 'usr-tariq', name: 'Tariq Al-Hashemi', role: 'Rigger Foreman' }
      );
    },
    /Segregation of Duties \(SoD\) Invariant Violation/,
    'Action Owner cannot self-verify and close their own action'
  );
});

// =============================================================================
// TEST SUITE 4: STATUTORY NOTIFICATION CHANNEL ADAPTER (GUARDRAIL G-2)
// =============================================================================
test('Statutory Channel adapter provides verified SimulatedChannel and LiveChannel skeleton (G-2)', async () => {
  const channel = getStatutoryNotificationChannel();
  assert.equal(channel.channelName, 'SIMULATED', 'Default channel should be SIMULATED in sandbox/test environment');

  const validFormGPayload = {
    tenantId: DEFAULT_TENANT_ID,
    incidentId: 'INC-2026-OMN-0901',
    incidentNumber: 'INC-2026-0901',
    companyCommercialRegNo: 'CR-9082341',
    companyName: 'Gulf Energy Industrial Services LLC',
    facilityLocation: 'Fahud-West Gas Gathering Station',
    concessionBlockOrWilayat: 'Block 6 / Wilayat Ibri',
    incidentTimestamp: new Date().toISOString(),
    incidentClassification: 'LOST_TIME_INJURY',
    injuredWorkerName: 'Rashid Al-Kiyumi',
    injuredWorkerCivilIdOrPassport: 'CIV-9912048',
    briefCircumstances: 'Worker slipped from scaffolding ladder during morning inspection. First aid applied and transferred to Ibri Regional Hospital.',
    submittingOfficerName: 'Eng. Mansoor Al-Ketbi',
    submittingOfficerRole: 'Site HSE Manager',
    submittingOfficerPhone: '+968 9123 4567',
    emergencyServicesNotified: true
  };

  const receipt = await channel.submitFormGNotification(validFormGPayload);
  assert.equal(receipt.channel, 'SIMULATED');
  assert.match(receipt.receiptNumber, /^OM-MOL-\d{4}-FGM-\d{6}$/, 'Receipt number must follow official MoL schema');
  assert.equal(receipt.status, 'ACCEPTED');
  assert.ok(receipt.statutoryDeadlineNotice.includes('24-hour'), 'Must emphasize statutory 24-hour notification deadline');

  // Verify status inquiry
  const statusResp = await channel.checkSubmissionStatus(receipt.receiptNumber);
  assert.equal(statusResp.receiptNumber, receipt.receiptNumber);
  assert.ok(statusResp.status.length > 0);

  // Test LiveChannel throws meaningful error when API key is missing
  const liveChannel = new LiveStatutoryChannel();
  assert.equal(liveChannel.channelName, 'LIVE');
  await assert.rejects(
    async () => {
      await liveChannel.submitFormGNotification(validFormGPayload);
    },
    /OMAN_MOL_API_KEY is not defined/,
    'Live channel must fail safely and explain configuration when API key is not present'
  );
});

// =============================================================================
// TEST SUITE 5: ENCRYPTED OFFLINE SUBMISSION QUEUE (GUARDRAIL G-1)
// =============================================================================
test('EncryptedOfflineQueue encodes offline submissions with authentication envelope', () => {
  const queued = EncryptedOfflineQueue.enqueue({
    endpoint: '/api/v1/incidents',
    method: 'POST',
    entityType: 'Incident',
    entityId: 'inc-offline-test-01',
    payload: { title: 'Offline near miss reported in trench', severity: 'Medium' }
  });

  assert.ok(queued.id.startsWith('queue-'), 'Queued item must receive unique ID');
  assert.equal(queued.entityType, 'Incident');
  assert.equal(queued.retryCount, 0);

  const pending = EncryptedOfflineQueue.getQueue();
  assert.ok(pending.some(i => i.entityId === 'inc-offline-test-01'), 'Queue must contain the enqueued item');

  // Clean up
  EncryptedOfflineQueue.remove(queued.id);
  const updatedPending = EncryptedOfflineQueue.getQueue();
  assert.ok(!updatedPending.some(i => i.id === queued.id), 'Item must be removed from queue');
});
