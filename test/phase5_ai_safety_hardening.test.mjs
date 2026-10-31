/**
 * Phase 5 Acceptance Test Suite — AI Safety Hardening (Gap G4)
 *
 * Covers:
 * 1. API Gate Enforcement: bypassing gate or saving unconfirmed AI draft returns 403 Forbidden.
 * 2. Audit Trail Rejection Logging: rejected unconfirmed AI draft writes AI_GATE_REJECTION to audit_log.
 * 3. Human-In-The-Loop Confirmation Flow: authorized role accepts/edits AI output, diff is computed,
 *    audit log records review decision, and domain record save succeeds.
 * 4. Segregation of Duties / Role Restriction for AI Review: unauthorized role (e.g. field_worker)
 *    cannot approve AI drafts (403 Forbidden).
 * 5. Runtime Confidence Guardrails: confidence score below threshold actively suppresses suggestion
 *    and flags manual_entry_required: true.
 * 6. AI Evaluation Harness: golden datasets pass all 6 safety thresholds (Agreement >=85%,
 *    RCA edit distance <=0.35, WER clean <=10%, moderate <=18%, heavy <=30%, Citation precision >=95%).
 * 7. Copy Audit: 0 occurrences of "predictive analytics" or "100% alignment" across repo.
 * 8. Model Card Audit: /docs/ai/MODEL_CARD.md documents all 4 use cases with explicit prohibitions.
 * 9. Feature Flag Activation: aiGates flag evaluates correctly under FeatureFlagRegistry.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { withTenantContext } from '../apps/api/src/db/connection.ts';
import { AiSafetyService, AI_USE_CASES } from '../apps/api/src/ai/aiSafetyService.ts';
import { runFullAiEvaluation } from '../tools/ai-eval/runEval.ts';
import { FeatureFlagRegistry } from '../packages/shared/src/featureFlags.ts';

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

test('Phase 5 AI Gate 1: Attempt to save unconfirmed AI draft is rejected with 403 AI_CONFIRMATION_REQUIRED', async () => {
  await setupBaseline();

  // Create an AI draft output with pending status
  const { record: pendingOutput } = await AiSafetyService.createOutput({
    tenantId: TENANT_ID,
    useCase: AI_USE_CASES.INCIDENT_CLASSIFICATION,
    model: 'gemini-2.5-flash',
    prompt: 'Classify incident: worker touched ungrounded conductor at substation 4',
    input: { description: 'Ungrounded conductor contact at Substation 4' },
    output: { category: 'Electrical Contact', severity: 'MAJOR', statutory_reportable: true },
    confidence: 0.91
  });

  assert.equal(pendingOutput.review_decision, 'pending');

  // Attempt to verify confirmation gate while status is pending
  await assert.rejects(
    async () => {
      await AiSafetyService.verifyConfirmationGate({
        tenantId: TENANT_ID,
        aiOutputId: pendingOutput.id,
        actor: 'field_user_1',
        actorRole: 'field_worker',
        entityType: 'incident',
        payload: {
          title: 'Substation Electrical Contact',
          category: 'Electrical Contact',
          severity: 'MAJOR',
          ai_output_id: pendingOutput.id,
          is_ai_draft: true
        }
      });
    },
    (err) => {
      assert.equal(err.code, 'AI_CONFIRMATION_REQUIRED');
      assert.equal(err.statusCode, 403);
      assert(err.message.includes('Human confirmation by an authorized role is mandatory'));
      return true;
    }
  );
});

test('Phase 5 AI Gate 2: Unconfirmed AI draft attempt writes AI_GATE_REJECTION to audit trail', async () => {
  await setupBaseline();

  // Query audit_log for AI_GATE_REJECTION events generated in test 1
  await withTenantContext(TENANT_ID, async (client) => {
    const res = await client.query(
      `SELECT * FROM audit_log
       WHERE tenant_id = $1 AND action = 'AI_GATE_REJECTION'
       ORDER BY id DESC LIMIT 1`,
      [TENANT_ID]
    );

    assert(res.rows.length > 0, 'Expected at least one AI_GATE_REJECTION audit log entry');
    const entry = res.rows[0];
    assert.equal(entry.action, 'AI_GATE_REJECTION');
    assert.equal(entry.entity_type, 'incident');

    const metadata = typeof entry.metadata === 'string' ? JSON.parse(entry.metadata) : entry.metadata;
    assert(metadata.reason.includes('Attempted to save unconfirmed AI draft') || metadata.reason.includes('AI-generated'));
  });
});

test('Phase 5 AI Gate 3: Authorized human confirmation allows record saving and logs review decision & diff', async () => {
  await setupBaseline();

  // 1. Create AI draft
  const { record: aiDraft } = await AiSafetyService.createOutput({
    tenantId: TENANT_ID,
    useCase: AI_USE_CASES.RCA_DRAFTING,
    model: 'gemini-2.5-pro',
    prompt: 'Generate 5-Whys for crane wire rope snap',
    input: { event: 'Wire rope severed on gantry crane' },
    output: {
      root_cause: 'Fatigue failure of wire rope',
      five_whys: ['Why 1: High tension', 'Why 2: Excessive cycle fatigue']
    },
    confidence: 0.89
  });

  // 2. Lead Investigator reviews and edits draft
  const editedPayload = {
    root_cause: 'Corrosion-assisted fatigue failure and exceeded replacement cycle',
    five_whys: [
      'Why 1: High operational tension during tandem lift',
      'Why 2: Excessive cycle fatigue without intermediate non-destructive testing'
    ]
  };

  const confirmedRecord = await AiSafetyService.confirmOutput({
    tenantId: TENANT_ID,
    aiOutputId: aiDraft.id,
    reviewedBy: 'Tariq Al-Busaidi (Lead Investigator)',
    reviewerRole: 'hse_officer',
    decision: 'edited',
    editedOutput: editedPayload,
    reviewNotes: 'Updated causal mechanism with metallurgical test findings.'
  });

  assert.equal(confirmedRecord.review_decision, 'edited');
  assert.equal(confirmedRecord.reviewed_by, 'Tariq Al-Busaidi (Lead Investigator)');
  assert(confirmedRecord.reviewed_at !== null);

  const editDiff = typeof confirmedRecord.edit_diff === 'string' ? JSON.parse(confirmedRecord.edit_diff) : confirmedRecord.edit_diff;
  assert(editDiff.root_cause !== undefined, 'edit_diff must capture root_cause modification');

  // 3. Verifying gate with confirmed AI output succeeds without throwing
  const gateResult = await AiSafetyService.verifyConfirmationGate({
    tenantId: TENANT_ID,
    aiOutputId: aiDraft.id,
    actor: 'Tariq Al-Busaidi',
    actorRole: 'hse_officer',
    entityType: 'investigation',
    payload: {
      ai_output_id: aiDraft.id,
      is_ai_draft: true
    }
  });

  assert.equal(gateResult.verified, true);
  assert.equal(gateResult.aiRecord?.review_decision, 'edited');
});

test('Phase 5 AI Gate 4: Segregation of Duties — Unauthorized role cannot confirm safety-critical AI drafts', async () => {
  await setupBaseline();

  const { record: draft } = await AiSafetyService.createOutput({
    tenantId: TENANT_ID,
    useCase: AI_USE_CASES.INCIDENT_CLASSIFICATION,
    model: 'gemini-2.5-flash',
    prompt: 'Classify minor slip',
    input: { desc: 'Slip on wet floor in mess hall' },
    output: { category: 'Slip/Trip', severity: 'MINOR' },
    confidence: 0.82
  });

  // A field_worker attempts to self-confirm the AI draft
  await assert.rejects(
    async () => {
      await AiSafetyService.confirmOutput({
        tenantId: TENANT_ID,
        aiOutputId: draft.id,
        reviewedBy: 'Worker A',
        reviewerRole: 'field_worker', // Unauthorized role
        decision: 'accepted'
      });
    },
    (err) => {
      assert(err.message.includes('Forbidden: Role') && err.message.includes('not authorized to approve'));
      return true;
    }
  );
});

test('Phase 5 AI Gate 5: Runtime Confidence Guardrail actively suppresses suggestions below threshold', async () => {
  await setupBaseline();

  // Classification threshold is 0.75. Passing 0.62 should trigger suppression
  const result = await AiSafetyService.createOutput({
    tenantId: TENANT_ID,
    useCase: AI_USE_CASES.INCIDENT_CLASSIFICATION,
    model: 'gemini-2.5-flash',
    prompt: 'Ambiguous noise in pipe rack',
    input: { text: 'Some vibration or rumble heard' },
    output: { category: 'Pressure Release', severity: 'MODERATE' },
    confidence: 0.62 // Below 0.75 threshold
  });

  assert.equal(result.manualEntryRequired, true);
  assert(result.reason?.includes('Confidence score (0.62) is below safety threshold (0.75)'));
  assert(result.reason?.includes('Manual entry is required'));
});

test('Phase 5 AI Gate 6: Evaluation Harness runs end-to-end and meets all 6 safety thresholds', () => {
  const report = runFullAiEvaluation();

  assert.equal(report.overallPassed, true);
  assert.equal(report.canEnableAiGates, true);

  // Check individual metric assertions
  assert(report.metrics.classification_agreement.actual >= 0.85);
  assert(report.metrics.rca_edit_distance.actual <= 0.35);
  assert(report.metrics.wer_clean.actual <= 0.10);
  assert(report.metrics.wer_moderate.actual <= 0.18);
  assert(report.metrics.wer_heavy.actual <= 0.30);
  assert(report.metrics.statutory_citation_precision.actual >= 0.95);
});

test('Phase 5 AI Gate 7: Zero occurrences of forbidden strings ("predictive analytics", "100% alignment")', () => {
  const rootDir = process.cwd();
  const forbiddenPatterns = [/predictive analytics/i, /100% alignment/i];

  function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (['node_modules', '.git', 'dist', 'coverage'].includes(f)) continue;
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|mjs|json|md|html|yaml|yml)$/.test(f)) {
        // Exclude test suite itself and Phase report where historical rules are quoted
        if (f.includes('phase5_ai_safety_hardening.test.mjs') || f.includes('PHASE_REPORT.md')) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
          const match = pattern.exec(content);
          assert.equal(
            match,
            null,
            `Forbidden string '${pattern}' found in file: ${fullPath}`
          );
        }
      }
    }
  }

  searchDir(rootDir);
});

test('Phase 5 AI Gate 8: /docs/ai/MODEL_CARD.md exists and contains explicit prohibitions for all 4 use cases', () => {
  const modelCardPath = path.resolve(process.cwd(), 'docs/ai/MODEL_CARD.md');
  assert(fs.existsSync(modelCardPath), '/docs/ai/MODEL_CARD.md must exist');

  const content = fs.readFileSync(modelCardPath, 'utf8');
  assert(content.includes('incident_classification'), 'Must document incident_classification');
  assert(content.includes('rca_drafting'), 'Must document rca_drafting');
  assert(content.includes('voice_structured_fields'), 'Must document voice_structured_fields');
  assert(content.includes('regulatory_citation'), 'Must document regulatory_citation');
  assert(content.includes('Explicit Prohibitions'), 'Must list Explicit Prohibitions');
  assert(content.includes('PROHIBITED'), 'Must contain PROHIBITED statements');
});

test('Phase 5 AI Gate 9: FeatureFlagRegistry activates aiGates flag via FEATURE_FLAG_AI_GATES', () => {
  // Test baseline false
  FeatureFlagRegistry.resetOverrides();
  const baseline = FeatureFlagRegistry.getAllFlags({});
  assert.equal(baseline.aiGates, false);

  // Test environment variable flip
  const envFlipped = FeatureFlagRegistry.getAllFlags({
    FEATURE_FLAG_AI_GATES: 'true'
  });
  assert.equal(envFlipped.aiGates, true);

  // Test programmatic override
  FeatureFlagRegistry.setOverride('aiGates', true);
  const overridden = FeatureFlagRegistry.getAllFlags();
  assert.equal(overridden.aiGates, true);
  FeatureFlagRegistry.resetOverrides();
});
