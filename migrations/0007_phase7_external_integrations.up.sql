-- =============================================================================
-- Migration: 0007_phase7_external_integrations.up.sql
-- Description: Phase 7 External Integrations (Identity/SCIM, IoT TWL, ERP, Notifications)
-- Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1170, PDO SP-1143)
-- Guardrails: G-1 (No plain localStorage), G-5 (No auto-approval), G-6 (Multi-tenant RLS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NOTIFICATION OUTBOX TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL, -- 'email', 'sms', 'whatsapp'
    recipient VARCHAR(255) NOT NULL,
    template_id VARCHAR(64) NOT NULL,
    subject VARCHAR(255),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'DELIVERED', 'FAILED'
    delivery_receipt JSONB,
    error_message TEXT,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS channel VARCHAR(32) DEFAULT 'email';
ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS recipient VARCHAR(255) DEFAULT '';
ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS template_id VARCHAR(64) DEFAULT 'statutory_clock_escalation';
ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS delivery_receipt JSONB;
ALTER TABLE notification_outbox ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_notification_outbox_tenant ON notification_outbox(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_status ON notification_outbox(status);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_created ON notification_outbox(created_at DESC);

ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_notification_outbox ON notification_outbox
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 2. ERP SYNC LOGS & AUDIT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS erp_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    erp_system VARCHAR(64) NOT NULL, -- 'SAP_S4HANA', 'IBM_MAXIMO'
    sync_type VARCHAR(64) NOT NULL,   -- 'CONTRACTOR_SYNC', 'DOCUMENT_EXPIRY_SYNC', 'MONTHLY_HSE_STATS_EXPORT'
    records_synced INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    checksum VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_sync_logs_tenant ON erp_sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erp_sync_logs_created ON erp_sync_logs(created_at DESC);

ALTER TABLE erp_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_erp_sync_logs ON erp_sync_logs
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 3. SCIM 2.0 USERS REPOSITORY (Identity Connector)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scim_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(64) NOT NULL DEFAULT 'field_worker',
    active BOOLEAN NOT NULL DEFAULT true,
    idp_type VARCHAR(64) NOT NULL DEFAULT 'azure_ad',
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_scim_user UNIQUE (tenant_id, user_name)
);

CREATE INDEX IF NOT EXISTS idx_scim_users_tenant ON scim_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scim_users_external_id ON scim_users(external_id);
CREATE INDEX IF NOT EXISTS idx_scim_users_email ON scim_users(email);

ALTER TABLE scim_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_scim_users ON scim_users
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
