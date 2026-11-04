-- =============================================================================
-- Migration: 0006_phase6_offline_sync.up.sql
-- Description: Phase 6 Field PWA Offline Sync, Idempotency Cache & Conflict Audit
-- Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143)
-- Guardrails: G-1 (No plain localStorage), G-5 (No auto-approval), G-6 (Multi-tenant RLS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SYNC IDEMPOTENCY KEYS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    response_json JSONB NOT NULL,
    device_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sync_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_sync_idempotency_tenant ON sync_idempotency_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_idempotency_key ON sync_idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_sync_idempotency_created ON sync_idempotency_keys(created_at DESC);

ALTER TABLE sync_idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sync_idempotency ON sync_idempotency_keys
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 2. SYNC CONFLICT AUDITS (Preserves All Versions for Auditing)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_conflict_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    resolution_strategy VARCHAR(64) NOT NULL,
    client_version JSONB NOT NULL,
    server_version JSONB NOT NULL,
    resolved_version JSONB NOT NULL,
    device_id VARCHAR(128),
    actor_id VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflict_tenant ON sync_conflict_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflict_entity ON sync_conflict_audits(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflict_created ON sync_conflict_audits(created_at DESC);

ALTER TABLE sync_conflict_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sync_conflict_audits ON sync_conflict_audits
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 3. SCHEMA EXTENSIONS FOR OFFLINE SYNC (Metadata Columns)
-- -----------------------------------------------------------------------------
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS duplicate_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sync_idempotency_key VARCHAR(255);
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS client_updated_at TIMESTAMPTZ;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS sync_device_id VARCHAR(128);
