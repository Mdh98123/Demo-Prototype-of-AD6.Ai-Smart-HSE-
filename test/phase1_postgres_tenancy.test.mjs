import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { newDb } from 'pg-mem';
import {
  withTenantContext,
  checkDatabaseHealth,
  getDatabaseClient
} from '../apps/api/src/db/connection.ts';
import {
  incidentRepository,
  capaRepository,
  permitRepository,
  inspectionRepository,
  observationRepository,
  contractorRepository,
  documentRepository,
  trainingRepository,
  migrationImporterRepository
} from '../apps/api/src/repositories/index.ts';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const TENANT_B = '22222222-2222-2222-2222-222222222222';

// =============================================================================
// TEST SUITE 1: MIGRATION UP & DOWN LIFECYCLE (EMPTY AND SEEDED DB)
// =============================================================================
test('Phase 1 Migration UP and DOWN executes cleanly on empty and seeded schemas', () => {
  const upSqlPath = path.resolve(process.cwd(), 'migrations/0002_phase1_full_schema.up.sql');
  const downSqlPath = path.resolve(process.cwd(), 'migrations/0002_phase1_full_schema.down.sql');

  assert.ok(fs.existsSync(upSqlPath), '0002_phase1_full_schema.up.sql must exist');
  assert.ok(fs.existsSync(downSqlPath), '0002_phase1_full_schema.down.sql must exist');

  const upSql = fs.readFileSync(upSqlPath, 'utf8');
  const downSql = fs.readFileSync(downSqlPath, 'utf8');

  // Verify all 34 required tables are defined in UP migration
  const requiredTables = [
    'tenants', 'sites', 'users', 'roles', 'role_assignments', 'contractors',
    'contractor_documents', 'competency_records', 'incidents', 'incident_evidence',
    'investigations', 'whys', 'fishbone_nodes', 'bowtie_nodes', 'capas',
    'capa_evidence', 'permits', 'permit_approvals', 'permit_isolations',
    'gas_tests', 'twl_readings', 'twl_breaches', 'inspections', 'inspection_items',
    'observations', 'hazard_reports', 'training_records', 'documents',
    'document_revisions', 'regulatory_obligations', 'control_mappings',
    'submissions', 'audit_log', 'ai_outputs'
  ];

  for (const table of requiredTables) {
    assert.match(
      upSql,
      new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'),
      `Migration UP must create table ${table}`
    );
    assert.match(
      downSql,
      new RegExp(`DROP TABLE IF EXISTS ${table} CASCADE`, 'i'),
      `Migration DOWN must drop table ${table}`
    );

    if (table !== 'tenants') {
      // Must have tenant_id NOT NULL
      assert.match(
        upSql,
        new RegExp(`tenant_id UUID NOT NULL REFERENCES tenants\\(id\\)`, 'i'),
        `Table ${table} must define tenant_id foreign key referencing tenants(id)`
      );
      // Must have index on tenant_id
      assert.match(
        upSql,
        new RegExp(`CREATE INDEX IF NOT EXISTS idx_${table}_tenant_id ON ${table}\\(tenant_id\\)`, 'i'),
        `Table ${table} must have index on tenant_id`
      );
      // Must have RLS enabled
      assert.match(
        upSql,
        new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, 'i'),
        `Table ${table} must have ENABLE ROW LEVEL SECURITY`
      );
      // Must have RLS policy
      assert.match(
        upSql,
        new RegExp(`CREATE POLICY tenant_isolation_${table} ON ${table}\\s+FOR ALL\\s+USING \\(tenant_id = current_setting\\('app\\.tenant_id'\\)::uuid\\);`, 'i'),
        `Table ${table} must have RLS policy USING (tenant_id = current_setting('app.tenant_id')::uuid)`
      );
    }
  }

  // Execute migration runner dry-run check
  const runnerOutput = execSync('node infra/migrations-runner.mjs --dry-run', { encoding: 'utf8' });
  assert.ok(runnerOutput.includes('All schemas verified'), 'Migration runner must pass dry-run verification');
});

// =============================================================================
// TEST SUITE 2: MULTI-TENANT ROW-LEVEL SECURITY (RLS) STRICT ISOLATION
// =============================================================================
test('PostgreSQL RLS strict isolation: Cross-tenant query returns zero rows', async () => {
  // Setup: Create tenant records
  await withTenantContext(TENANT_A, async (client) => {
    await client.query(`
      INSERT INTO tenants (id, code, name, jurisdiction, cr_number)
      VALUES ($1, 'TEN-A', 'Tenant Alpha Energy LLC', 'OMAN', 'CR-1001')
      ON CONFLICT (id) DO NOTHING
    `, [TENANT_A]);
  });

  await withTenantContext(TENANT_B, async (client) => {
    await client.query(`
      INSERT INTO tenants (id, code, name, jurisdiction, cr_number)
      VALUES ($1, 'TEN-B', 'Tenant Beta Industrial LLC', 'OMAN', 'CR-1002')
      ON CONFLICT (id) DO NOTHING
    `, [TENANT_B]);
  });

  // Action 1: Write incident under Tenant A
  const incA = await incidentRepository.create(TENANT_A, {
    incident_number: 'INC-2026-ALPHA-001',
    title: 'Alpha High Pressure Header Venting',
    description: 'Controlled venting at Alpha gas plant',
    severity: 'High',
    status: 'Open',
    location: 'Fahud North'
  });
  assert.equal(incA.tenant_id, TENANT_A);

  // Assert 1: Query incidents under Tenant B MUST return zero rows for Tenant A's record
  const resB = await incidentRepository.findMany(TENANT_B);
  assert.ok(!resB.items.some(i => i.id === incA.id), 'Tenant B must NOT see Tenant A incident');

  // Assert 2: Direct findById under Tenant B must return null
  const directReadFromB = await incidentRepository.findById(TENANT_B, incA.id);
  assert.equal(directReadFromB, null, 'Tenant B querying Tenant A incident by ID must return null');

  // Action 2: Write permit under Tenant A
  const permitA = await permitRepository.create(TENANT_A, {
    permit_number: 'PTW-ALPHA-900',
    permit_type: 'Hot Work',
    status: 'Active',
    zone: 'Zone 1 Process',
    exact_location: 'Alpha Header Skid',
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 28800000).toISOString(),
    issuer_name: 'Ahmed Al-Maskari',
    receiver_name: 'Salim Al-Busaidi'
  });
  assert.equal(permitA.tenant_id, TENANT_A);

  // Assert 3: Query permits under Tenant B returns 0 of Tenant A's permits
  const permitsB = await permitRepository.findMany(TENANT_B);
  assert.ok(!permitsB.items.some(p => p.id === permitA.id), 'Tenant B must NOT see Tenant A permit');

  // Action 3: Write CAPA under Tenant B
  const capaB = await capaRepository.create(TENANT_B, {
    action_number: 'CAPA-BETA-001',
    title: 'Replace beta isolation valve seal',
    description: 'Scheduled preventive replacement',
    priority: 'P2 - High',
    status: 'Open',
    owner_name: 'Fatima Al-Riyami',
    due_date: '2026-12-15'
  });
  assert.equal(capaB.tenant_id, TENANT_B);

  // Assert 4: Query CAPAs under Tenant A returns 0 of Tenant B's CAPAs
  const capasA = await capaRepository.findMany(TENANT_A);
  assert.ok(!capasA.items.some(c => c.id === capaB.id), 'Tenant A must NOT see Tenant B CAPA');
});

// =============================================================================
// TEST SUITE 3: DOMAIN REPOSITORIES FULL CRUD COVERAGE
// =============================================================================
test('Domain Repositories CRUD: Incidents, CAPAs, Permits, Inspections, Observations, Contractors, Documents, Training', async () => {
  const tenant = TENANT_A;

  // 1. Incidents CRUD
  const inc = await incidentRepository.create(tenant, {
    title: 'Hydraulic Oil Drip on Skid',
    description: 'Minor drip identified during morning walkaround',
    severity: 'Low',
    status: 'Open',
    location: 'Compressor Station C'
  });
  assert.ok(inc.id);

  const updatedInc = await incidentRepository.update(tenant, inc.id, { status: 'Closed' });
  assert.equal(updatedInc?.status, 'Closed');

  const fetchedInc = await incidentRepository.findById(tenant, inc.id);
  assert.equal(fetchedInc?.status, 'Closed');

  // 2. CAPAs CRUD & SoD Invariant
  const capa = await capaRepository.create(tenant, {
    title: 'Install secondary drip pan',
    description: 'Under hydraulic fitting',
    priority: 'P3 - Medium',
    status: 'Open',
    owner_name: 'Nasser Al-Harthy',
    due_date: '2026-11-20'
  });
  assert.ok(capa.id);

  // Test SoD Violation: Owner tries to self-verify and close
  await assert.rejects(
    async () => {
      await capaRepository.update(tenant, capa.id, {
        status: 'Closed',
        verified_by_name: 'Nasser Al-Harthy' // Self-verification violation
      });
    },
    /Segregation of Duties \(SoD\) Invariant Violation/,
    'Action Owner cannot self-verify and close their own action'
  );

  // Legitimate closure by different verifier passes
  const closedCapa = await capaRepository.update(tenant, capa.id, {
    status: 'Closed',
    verified_by_name: 'Eng. Mansoor Al-Ketbi'
  });
  assert.equal(closedCapa?.status, 'Closed');

  // 3. Permits CRUD & SoD Invariant
  // Test SoD Violation: Receiver tries to self-authorize as Area Authority
  await assert.rejects(
    async () => {
      await permitRepository.create(tenant, {
        permit_type: 'Confined Space Entry',
        exact_location: 'Vessel V-102',
        valid_to: new Date(Date.now() + 3600000).toISOString(),
        issuer_name: 'Hamdan Al-Hinai',
        receiver_name: 'Hamdan Al-Hinai' // Self-authorization violation
      });
    },
    /Segregation of Duties \(SoD\) Invariant Violation/,
    'Permit Receiver cannot self-authorize as Permit Issuer'
  );

  const validPermit = await permitRepository.create(tenant, {
    permit_type: 'Confined Space Entry',
    exact_location: 'Vessel V-102',
    valid_to: new Date(Date.now() + 3600000).toISOString(),
    issuer_name: 'Hamdan Al-Hinai',
    receiver_name: 'Suleiman Al-Habsi'
  });
  assert.ok(validPermit.id);

  // 4. Inspections CRUD
  const insp = await inspectionRepository.create(tenant, {
    title: 'Weekly Scaffold Safety Audit',
    template_type: 'Scaffolding',
    site_name: 'Mina Al Fahal',
    inspector_name: 'Tariq Al-Hashemi',
    score: 95.5
  });
  assert.ok(insp.id);
  const inspList = await inspectionRepository.findMany(tenant);
  assert.ok(inspList.items.some(i => i.id === insp.id));

  // 5. Observations CRUD
  const obs = await observationRepository.create(tenant, {
    observer_name: 'Said Al-Rawahi',
    observation_type: 'Positive Recognition',
    location: 'Fabrication Yard',
    description: 'Worker properly tethered tools while working on elevated grating'
  });
  assert.ok(obs.id);
  const obsList = await observationRepository.findMany(tenant);
  assert.ok(obsList.items.some(o => o.id === obs.id));

  // 6. Contractors CRUD
  const cont = await contractorRepository.create(tenant, {
    company_name: 'Oman Industrial Piping LLC',
    trade: 'Mechanical Piping',
    contact_email: 'safety@omanpiping.om',
    compliance_status: 'Approved'
  });
  assert.ok(cont.id);
  const contList = await contractorRepository.findMany(tenant);
  assert.ok(contList.items.some(c => c.id === cont.id));

  // 7. Documents CRUD
  const doc = await documentRepository.create(tenant, {
    title: 'Hot Work Safety Standard Operating Procedure',
    category: 'SOP',
    owner_name: 'HSE Directorate',
    file_url: 'https://docs.enterprise.om/sop/hot-work-rev2.pdf'
  });
  assert.ok(doc.id);
  const docList = await documentRepository.findMany(tenant);
  assert.ok(docList.items.some(d => d.id === doc.id));

  // 8. Training Records CRUD
  const trn = await trainingRepository.create(tenant, {
    course_title: 'H2S Awareness & Escape Hood Operation',
    course_code: 'PDO-H2S-001',
    trainee_name: 'Rashid Al-Kiyumi',
    civil_id: 'OMN-98127364',
    completion_date: '2026-10-15',
    score: 100
  });
  assert.ok(trn.id);
  const trnList = await trainingRepository.findMany(tenant);
  assert.ok(trnList.items.some(t => t.id === trn.id));

  // Test Cleanup / Deletion
  const deleted = await incidentRepository.delete(tenant, inc.id);
  assert.equal(deleted, true);
  const postDelete = await incidentRepository.findById(tenant, inc.id);
  assert.equal(postDelete, null);
});

// =============================================================================
// TEST SUITE 4: HEALTH / READY CONNECTIVITY CHECK (GET /health/ready)
// =============================================================================
test('checkDatabaseHealth reports connected database state for /health/ready probe', async () => {
  const health = await checkDatabaseHealth();
  assert.equal(health.connected, true, 'Database health check must report connected: true');
  assert.ok(typeof health.latencyMs === 'number', 'Must report numeric latency');
  assert.ok(health.version.length > 0, 'Must report database engine version');
  assert.ok(['postgres', 'in-memory-pg'].includes(health.engine), 'Engine must be postgres or in-memory-pg');
});

// =============================================================================
// TEST SUITE 5: ONE-TIME LOCALSTORAGE DATA MIGRATION IMPORTER
// =============================================================================
test('migrationImporterRepository imports legacy client payload and returns read-only token', async () => {
  const legacyPayload = {
    incidents: [
      {
        id: 'inc-legacy-001',
        title: 'Legacy valve leak',
        description: 'Migrated from client cache',
        severity: 'Medium',
        location: 'Tank Farm 4',
        status: 'Open'
      }
    ],
    permits: [
      {
        id: 'ptw-legacy-001',
        permitNumber: 'PTW-LEG-01',
        type: 'Cold Work',
        exactLocation: 'Warehouse 2',
        status: 'Active',
        validTo: new Date(Date.now() + 86400000).toISOString()
      }
    ],
    capas: [
      {
        id: 'capa-legacy-001',
        title: 'Replace seal',
        ownerName: 'Salim Al-Busaidi',
        dueDate: '2026-11-30',
        status: 'Open'
      }
    ]
  };

  const result = await migrationImporterRepository.importLegacyPayload(TENANT_A, legacyPayload);
  assert.equal(result.success, true);
  assert.ok(result.imported.incidents >= 1);
  assert.ok(result.imported.permits >= 1);
  assert.ok(result.imported.capas >= 1);
  assert.equal(result.clientStoreReadOnly, true, 'Must flag client store as read-only');
  assert.ok(result.readOnlyMigrationToken.startsWith('ad6-migrated-'), 'Must provide migration receipt token');

  // Verify imported incident exists in Postgres repository
  const importedInc = await incidentRepository.findById(TENANT_A, 'inc-legacy-001');
  assert.ok(importedInc, 'Legacy incident must now be persisted in repository');
  assert.equal(importedInc.title, 'Legacy valve leak');
});

// =============================================================================
// TEST SUITE 6: GUARDRAIL G-1 LOCALSTORAGE VERIFICATION IN APPS/WEB/SRC
// =============================================================================
test('Guardrail G-1: grep for localStorage in apps/web/src matches only UI prefs and offline queue stub', () => {
  const webSrcDir = path.resolve(process.cwd(), 'apps/web/src');
  
  function scanFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(scanFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('localStorage')) {
          results.push(path.relative(process.cwd(), fullPath));
        }
      }
    }
    return results;
  }

  const matchingFiles = scanFiles(webSrcDir);
  const normalized = matchingFiles.map(f => f.replace(/\\/g, '/'));

  assert.ok(normalized.length === 2, `Expected exactly 2 files matching localStorage, found ${normalized.length}: ${normalized.join(', ')}`);
  assert.ok(normalized.includes('apps/web/src/services/uiPreferences.ts'), 'Must include uiPreferences.ts');
  assert.ok(normalized.includes('apps/web/src/services/offlineQueueStub.ts'), 'Must include offlineQueueStub.ts');
});
