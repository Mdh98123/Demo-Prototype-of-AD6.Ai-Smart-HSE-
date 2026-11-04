-- =============================================================================
-- Migration: 0008_phase8_security_privacy_hardening.up.sql
-- Description: Phase 8 Security, Privacy, Retention & Compliance Hardening
-- Regulatory Framework:
--   - Sultanate of Oman Ministry of Labour MD 286/2008 & Royal Decree 53/2023
--   - Sultanate of Oman Personal Data Protection Law (RD 6/2022)
--   - Saudi Arabia Personal Data Protection Law (Royal Decree M/19 1443H)
--   - Petroleum Development Oman (PDO SP-1143 PTW, PDO SP-1170 TWL)
-- Guardrails: G-1 (No plain localStorage), G-5 (No auto-approval), G-6 (Multi-tenant RLS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. DATA RETENTION POLICIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    retention_period_days INT NOT NULL,
    regulatory_basis VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_tenant ON data_retention_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_entity ON data_retention_policies(entity_type);

ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_data_retention_policies ON data_retention_policies
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 2. DATA SUBJECT ACCESS REQUESTS (SAR / PDPL / GDPR) TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subject_id VARCHAR(255) NOT NULL,
    subject_email VARCHAR(255) NOT NULL,
    request_type VARCHAR(64) NOT NULL DEFAULT 'ACCESS',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    export_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_tenant ON data_subject_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_subject ON data_subject_requests(subject_id);

ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_data_subject_requests ON data_subject_requests
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 3. LEGAL HOLD AND FIELD ENCRYPTION EXTENSIONS
-- -----------------------------------------------------------------------------
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS medical_notes_encrypted TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(64);

ALTER TABLE capas ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_incidents_legal_hold ON incidents(tenant_id, legal_hold);
CREATE INDEX IF NOT EXISTS idx_capas_legal_hold ON capas(tenant_id, legal_hold);
CREATE INDEX IF NOT EXISTS idx_permits_legal_hold ON permits(tenant_id, legal_hold);
