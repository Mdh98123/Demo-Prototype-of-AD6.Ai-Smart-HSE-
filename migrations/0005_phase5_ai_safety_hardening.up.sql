-- =============================================================================
-- Migration: 0005_phase5_ai_safety_hardening.up.sql
-- Description: Phase 5 AI Safety Hardening (Gap G4) - Auditable AI Outputs & Confirmation Gates
-- Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143 Section 4.2)
-- Guardrails: G-4 (AI Safety & Human-in-the-Loop Confirmation Gate), G-6 (Multi-tenant RLS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    use_case VARCHAR(64) NOT NULL DEFAULT 'incident_classification',
    model VARCHAR(128) NOT NULL DEFAULT 'gemini-2.5-flash',
    prompt_hash VARCHAR(64) NOT NULL,
    input_hash VARCHAR(64) NOT NULL DEFAULT '',
    output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC(5,4) NOT NULL DEFAULT 0.8500,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    review_decision VARCHAR(32) NOT NULL DEFAULT 'pending',
    edit_diff JSONB,
    model_alias VARCHAR(128),
    output_text TEXT,
    confidence_score NUMERIC(5,4),
    hitl_status VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_ai_outputs_tenant ON ai_outputs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_use_case ON ai_outputs(use_case);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_prompt_hash ON ai_outputs(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_review_decision ON ai_outputs(review_decision);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_created_at ON ai_outputs(created_at);

ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_ai_outputs ON ai_outputs
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
