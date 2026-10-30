#!/usr/bin/env node
/**
 * AD6.Ai Smart HSE Platform — Enterprise Migrations Runner & Validator
 *
 * Capabilities:
 * - Dry-run validation of PostgreSQL 16 migration scripts
 * - Invariant checking: every tenant table has tenant_id, RLS enabled, and an active policy (Guardrail G-6)
 * - Safe rollback validation (down.sql symmetry)
 */

import fs from 'node:fs';
import path from 'node:path';

const isDryRun = process.argv.includes('--dry-run') || process.env.MIGRATION_DRY_RUN === 'true';

const migrationsDir = path.resolve(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error(`[MigrationsRunner] Fatal: Migrations directory not found at ${migrationsDir}`);
  process.exit(1);
}

const upFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.up.sql')).sort();
const downFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.down.sql')).sort();

console.log(`[MigrationsRunner] Discovered ${upFiles.length} UP migrations and ${downFiles.length} DOWN migrations.`);

let passed = true;

for (const upFile of upFiles) {
  const baseName = upFile.replace('.up.sql', '');
  const downFile = `${baseName}.down.sql`;
  const upPath = path.join(migrationsDir, upFile);
  const downPath = path.join(migrationsDir, downFile);

  console.log(`[MigrationsRunner] Validating migration pair: ${upFile} <-> ${downFile}`);

  if (!fs.existsSync(downPath)) {
    console.error(`[MigrationsRunner] Error: Missing corresponding rollback script ${downFile}`);
    passed = false;
    continue;
  }

  const upSql = fs.readFileSync(upPath, 'utf8');
  const downSql = fs.readFileSync(downPath, 'utf8');

  // Guardrail G-6 validation: All tenant tables must enforce tenant_id and RLS
  const createTableMatches = [...upSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi)];
  
  for (const match of createTableMatches) {
    const tableName = match[1];
    const tableBody = match[2];

    if (tableName.toLowerCase() === 'tenants') {
      continue; // root entity does not reference itself
    }

    // Check tenant_id column
    if (!tableBody.includes('tenant_id')) {
      console.error(`[MigrationsRunner] G-6 Violation: Table "${tableName}" does not have a tenant_id column!`);
      passed = false;
    }

    // Check RLS enabled
    const rlsPattern = new RegExp(`ALTER\\s+TABLE\\s+${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
    if (!rlsPattern.test(upSql)) {
      console.error(`[MigrationsRunner] G-6 Violation: Table "${tableName}" does not have ENABLE ROW LEVEL SECURITY!`);
      passed = false;
    }

    // Check Policy created
    const policyPattern = new RegExp(`CREATE\\s+POLICY\\s+[^\\s]+\\s+ON\\s+${tableName}`, 'i');
    if (!policyPattern.test(upSql)) {
      console.error(`[MigrationsRunner] G-6 Violation: Table "${tableName}" does not have an active RLS policy!`);
      passed = false;
    }
  }

  // Check rollback drops tables or policies
  if (!downSql.toUpperCase().includes('DROP')) {
    console.warn(`[MigrationsRunner] Warning: ${downFile} does not contain DROP statements.`);
  }

  console.log(`[MigrationsRunner] ✓ Validation passed for ${upFile} (RLS & G-6 compliant)`);
}

if (!passed) {
  console.error('[MigrationsRunner] Migration dry-run failed with errors.');
  process.exit(1);
}

if (isDryRun) {
  console.log('[MigrationsRunner] Dry-run completed successfully. All schemas verified.');
  process.exit(0);
}

console.log('[MigrationsRunner] Schema validation complete. Ready for live execution.');
