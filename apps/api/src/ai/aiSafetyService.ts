/**
 * AI Safety Hardening Service (Phase 5 - Gap G4)
 *
 * Implements:
 * - Runtime Confidence Guardrails (suppresses suggestions when confidence < threshold)
 * - Cryptographic Prompt & Input Hashing (SHA-256)
 * - Human-In-The-Loop Confirmation Lifecycle (pending -> accepted | edited | rejected)
 * - Edit Diff Computation
 * - Segregation of Duties for AI Confirmation (Authorized roles only)
 * - Audit Trail Logging via writeAudit
 */

import crypto from 'node:crypto';
import { withTenantContext } from '../db/connection.js';
import { writeAudit } from '../audit/writeAudit.js';
import { AiOutputRecord } from '../db/schema.js';
import { FeatureFlagRegistry } from '../../../../packages/shared/src/featureFlags.js';

export const AI_USE_CASES = {
  INCIDENT_CLASSIFICATION: 'incident_classification',
  RCA_DRAFTING: 'rca_drafting',
  VOICE_STRUCTURED_FIELDS: 'voice_structured_fields',
  REGULATORY_CITATION: 'regulatory_citation'
} as const;

export type AiUseCase = typeof AI_USE_CASES[keyof typeof AI_USE_CASES];

export const AI_CONFIDENCE_THRESHOLDS: Record<string, number> = {
  [AI_USE_CASES.INCIDENT_CLASSIFICATION]: 0.75,
  [AI_USE_CASES.RCA_DRAFTING]: 0.70,
  [AI_USE_CASES.VOICE_STRUCTURED_FIELDS]: 0.70,
  [AI_USE_CASES.REGULATORY_CITATION]: 0.90
};

export const AI_AUTHORIZED_REVIEW_ROLES = new Set([
  'hse_officer',
  'site_manager',
  'group_hse_director',
  'supervisor',
  'tenant_admin'
]);

export interface CreateAiOutputParams {
  tenantId: string;
  useCase: string;
  model: string;
  prompt: string;
  input: any;
  output: any;
  confidence: number;
  evidenceRefs?: any[];
}

export interface ConfirmAiOutputParams {
  tenantId: string;
  aiOutputId: string;
  reviewedBy: string;
  reviewerRole: string;
  decision: 'accepted' | 'edited' | 'rejected';
  editedOutput?: any;
  reviewNotes?: string;
}

export interface VerifyGateParams {
  tenantId: string;
  aiOutputId?: string;
  isAiGenerated?: boolean;
  actor: string;
  actorRole: string;
  entityType: string;
  entityId?: string;
  payload: any;
}

export class AiSafetyService {
  /**
   * Hashes text or JSON input with SHA-256
   */
  public static hashContent(content: any): string {
    const text = typeof content === 'string' ? content : JSON.stringify(content || {});
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Computes a shallow/deep structural diff between original output and edited output
   */
  public static computeEditDiff(original: any, edited: any): Record<string, any> {
    if (!original || !edited) return { original, edited };
    const diff: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(original), ...Object.keys(edited)]);
    for (const key of allKeys) {
      if (JSON.stringify(original[key]) !== JSON.stringify(edited[key])) {
        diff[key] = {
          before: original[key],
          after: edited[key]
        };
      }
    }
    return diff;
  }

  /**
   * Creates an auditable AI output record in the database.
   * Enforces runtime confidence threshold: if confidence < threshold,
   * suppresses output as suggestion and returns manual_entry_required: true.
   */
  public static async createOutput(params: CreateAiOutputParams): Promise<{
    record: AiOutputRecord;
    manualEntryRequired: boolean;
    reason?: string;
  }> {
    const threshold = AI_CONFIDENCE_THRESHOLDS[params.useCase] || 0.70;
    const isBelowThreshold = params.confidence < threshold;

    const promptHash = this.hashContent(params.prompt);
    const inputHash = this.hashContent(params.input);
    const evidenceRefs = params.evidenceRefs || [];

    return withTenantContext(params.tenantId, async (client) => {
      const res = await client.query<AiOutputRecord>(
        `INSERT INTO ai_outputs (
          tenant_id, use_case, model, prompt_hash, input_hash,
          output_json, confidence, evidence_refs, review_decision, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW()
        ) RETURNING *`,
        [
          params.tenantId,
          params.useCase,
          params.model,
          promptHash,
          inputHash,
          JSON.stringify(params.output),
          params.confidence,
          JSON.stringify(evidenceRefs)
        ]
      );

      const record = res.rows[0];

      return {
        record,
        manualEntryRequired: isBelowThreshold,
        ...(isBelowThreshold ? {
          reason: `Confidence score (${params.confidence}) is below safety threshold (${threshold}) for use case '${params.useCase}'. Manual entry is required.`
        } : {})
      };
    });
  }

  /**
   * Submits a human review decision (accept, edit, or reject).
   * Verifies reviewer role authority and records audit trail.
   */
  public static async confirmOutput(params: ConfirmAiOutputParams): Promise<AiOutputRecord> {
    if (!AI_AUTHORIZED_REVIEW_ROLES.has(params.reviewerRole)) {
      throw new Error(`Forbidden: Role '${params.reviewerRole}' is not authorized to approve or review safety-critical AI drafts.`);
    }

    if (!['accepted', 'edited', 'rejected'].includes(params.decision)) {
      throw new Error(`Invalid decision '${params.decision}'. Must be 'accepted', 'edited', or 'rejected'.`);
    }

    return withTenantContext(params.tenantId, async (client) => {
      const existingRes = await client.query<AiOutputRecord>(
        `SELECT * FROM ai_outputs WHERE id = $1 AND tenant_id = $2`,
        [params.aiOutputId, params.tenantId]
      );

      if (existingRes.rows.length === 0) {
        throw new Error(`AI output record '${params.aiOutputId}' not found.`);
      }

      const existing = existingRes.rows[0];
      const originalJson = typeof existing.output_json === 'string'
        ? JSON.parse(existing.output_json)
        : existing.output_json;

      let editDiff = null;
      let finalOutputJson = originalJson;

      if (params.decision === 'edited') {
        if (!params.editedOutput) {
          throw new Error('Edited output payload must be provided when decision is edited.');
        }
        editDiff = this.computeEditDiff(originalJson, params.editedOutput);
        finalOutputJson = params.editedOutput;
      }

      const updateRes = await client.query<AiOutputRecord>(
        `UPDATE ai_outputs
         SET review_decision = $1,
             reviewed_by = $2,
             reviewed_at = NOW(),
             edit_diff = $3,
             output_json = $4
         WHERE id = $5 AND tenant_id = $6
         RETURNING *`,
        [
          params.decision,
          params.reviewedBy,
          editDiff ? JSON.stringify(editDiff) : null,
          JSON.stringify(finalOutputJson),
          params.aiOutputId,
          params.tenantId
        ]
      );

      const updated = updateRes.rows[0];

      // Audit trail logging
      await writeAudit({
        tenantId: params.tenantId,
        actorId: params.reviewedBy,
        actorRole: params.reviewerRole,
        action: `AI_OUTPUT_${params.decision.toUpperCase()}`,
        entityType: 'ai_output',
        entityId: params.aiOutputId,
        beforeState: { decision: existing.review_decision },
        afterState: {
          decision: updated.review_decision,
          reviewedBy: params.reviewedBy,
          editDiff
        },
        metadata: {
          is_ai_generated: true,
          use_case: existing.use_case,
          model: existing.model,
          review_notes: params.reviewNotes
        }
      });

      return updated;
    });
  }

  /**
   * Retrieves an AI output by ID
   */
  public static async getOutput(tenantId: string, id: string): Promise<AiOutputRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<AiOutputRecord>(
        `SELECT * FROM ai_outputs WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  /**
   * Verifies the mandatory confirmation gate before saving or submitting a domain record.
   * If unconfirmed, logs AI_GATE_REJECTION to audit log and throws 403 error.
   */
  public static async verifyConfirmationGate(params: VerifyGateParams): Promise<{ verified: boolean; aiRecord?: AiOutputRecord }> {
    const flags = FeatureFlagRegistry.getAllFlags();
    const isAiGateActive = flags.aiGates;

    // Detect if this payload incorporates AI-generated content
    const isAiDraft = Boolean(
      params.isAiGenerated ||
      params.payload?.is_ai_generated ||
      params.payload?.is_ai_draft ||
      params.payload?.ai_output_id ||
      params.payload?.metadata?.is_ai_generated ||
      params.payload?.metadata?.ai_output_id
    );

    const aiOutputId = params.aiOutputId || params.payload?.ai_output_id || params.payload?.metadata?.ai_output_id;

    // If neither gate is enabled nor AI draft detected, pass through
    if (!isAiGateActive && !isAiDraft && !aiOutputId) {
      return { verified: true };
    }

    // If marked as AI-generated or AI draft but missing AI Output tracking ID
    if (isAiDraft && !aiOutputId) {
      // Rejection log
      await writeAudit({
        tenantId: params.tenantId,
        actorId: params.actor,
        actorRole: params.actorRole,
        action: 'AI_GATE_REJECTION',
        entityType: params.entityType,
        entityId: params.entityId || 'draft',
        beforeState: null,
        afterState: null,
        metadata: {
          reason: 'AI-generated draft submitted without auditable ai_output_id.',
          is_ai_generated: true
        }
      });

      const err: any = new Error('AI Confirmation Required: AI-generated draft must be registered and human-reviewed before saving or submitting.');
      err.statusCode = 403;
      err.code = 'AI_CONFIRMATION_REQUIRED';
      throw err;
    }

    if (aiOutputId) {
      const aiRecord = await this.getOutput(params.tenantId, aiOutputId);

      if (!aiRecord) {
        await writeAudit({
          tenantId: params.tenantId,
          actorId: params.actor,
          actorRole: params.actorRole,
          action: 'AI_GATE_REJECTION',
          entityType: params.entityType,
          entityId: params.entityId || 'draft',
          beforeState: null,
          afterState: null,
          metadata: {
            reason: `Referenced ai_output_id '${aiOutputId}' not found.`,
            ai_output_id: aiOutputId
          }
        });

        const err: any = new Error(`AI Confirmation Required: Referenced AI output '${aiOutputId}' does not exist.`);
        err.statusCode = 403;
        err.code = 'AI_CONFIRMATION_REQUIRED';
        throw err;
      }

      if (aiRecord.review_decision !== 'accepted' && aiRecord.review_decision !== 'edited') {
        // Record unconfirmed rejection in audit log
        await writeAudit({
          tenantId: params.tenantId,
          actorId: params.actor,
          actorRole: params.actorRole,
          action: 'AI_GATE_REJECTION',
          entityType: params.entityType,
          entityId: params.entityId || 'draft',
          beforeState: { review_decision: aiRecord.review_decision },
          afterState: null,
          metadata: {
            reason: `Attempted to save unconfirmed AI draft. Current status: ${aiRecord.review_decision}`,
            ai_output_id: aiOutputId,
            use_case: aiRecord.use_case
          }
        });

        const err: any = new Error(`AI Confirmation Required: AI-generated ${aiRecord.use_case} (ID: ${aiOutputId}) has status '${aiRecord.review_decision}'. Human confirmation by an authorized role is mandatory before saving or submitting.`);
        err.statusCode = 403;
        err.code = 'AI_CONFIRMATION_REQUIRED';
        throw err;
      }

      return { verified: true, aiRecord };
    }

    return { verified: true };
  }
}
