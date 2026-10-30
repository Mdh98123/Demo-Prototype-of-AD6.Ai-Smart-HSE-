-- =============================================================================
-- Migration: 0001_enterprise_rls_schema.up.sql
-- Description: Core Enterprise HSE Schema with Multi-Tenancy & Row-Level Security
-- Target: PostgreSQL 16 (Supabase-compatible)
-- Compliance: Oman MoL MD 286/2008, Royal Decree 53/2023, PDO SP-1143, PDO SP-1170
-- Guardrail: G-6 (Every tenant table MUST have tenant_id, RLS enabled, and policy)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TENANTS & ORGANIZATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_entity VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT 'OM', -- OM (Oman), AE (UAE), SA (KSA)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Note: Tenants table is global, but RLS is enabled to prevent cross-tenant enumeration
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self_isolation_policy ON tenants;
CREATE POLICY tenant_self_isolation_policy ON tenants
    FOR ALL
    USING (id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 2. USERS & IDENTITY (RBAC & SoD)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sso_sub VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(tenant_id, role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_tenant_isolation_policy ON users;
CREATE POLICY users_tenant_isolation_policy ON users
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 3. INCIDENTS & STATUTORY INVESTIGATIONS (Oman MD 286/2008 Form G)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'Lost Time Injury (LTI)', 'Medical Treatment Case (MTC)', 'Near Miss', etc.
    classification VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    potential_severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- 'Open', 'Under Investigation', 'Pending Review', 'Closed'
    description TEXT NOT NULL,
    immediate_actions TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Muscat',
    coordinates JSONB,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_by_name VARCHAR(255) NOT NULL,
    five_whys JSONB,
    fishbone JSONB,
    bowtie JSONB,
    form_g_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_incident_number UNIQUE (tenant_id, incident_number)
);

CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(tenant_id, severity);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS incidents_tenant_isolation_policy ON incidents;
CREATE POLICY incidents_tenant_isolation_policy ON incidents
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 4. PERMITS TO WORK (PTW & PDO SP-1143 Control of Work)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permit_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'Hot Work (Class 1)', 'Confined Space Entry', 'Working at Height', etc.
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Pending Signatures', 'Active', 'Suspended', 'Closed'
    zone VARCHAR(100) NOT NULL,
    exact_location VARCHAR(255) NOT NULL,
    contractor VARCHAR(255) NOT NULL,
    crew_size INT NOT NULL DEFAULT 1,
    risk_score INT NOT NULL DEFAULT 1,
    risk_rating VARCHAR(50) NOT NULL DEFAULT 'Low',
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    issuer_signatory JSONB,
    receiver_signatory JSONB,
    gas_testing_log JSONB,
    loto_isolations JSONB,
    simops_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_permit_number UNIQUE (tenant_id, permit_number)
);

CREATE INDEX IF NOT EXISTS idx_permits_tenant_id ON permits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_permits_valid_dates ON permits(tenant_id, valid_from, valid_to);

ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permits_tenant_isolation_policy ON permits;
CREATE POLICY permits_tenant_isolation_policy ON permits
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 5. CORRECTIVE AND PREVENTIVE ACTIONS (CAPA)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    capa_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL, -- 'P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Routine'
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Under Review', 'Closed', 'Overdue'
    source_type VARCHAR(100) NOT NULL, -- 'Incident', 'Audit', 'Inspection', 'Regulatory'
    source_id VARCHAR(100),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_name VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_by_name VARCHAR(255),
    closed_at TIMESTAMPTZ,
    sla_hours INT NOT NULL DEFAULT 72,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_capa_number UNIQUE (tenant_id, capa_number)
);

CREATE INDEX IF NOT EXISTS idx_capas_tenant_id ON capas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_capas_status ON capas(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_capas_owner ON capas(tenant_id, owner_id);

ALTER TABLE capas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS capas_tenant_isolation_policy ON capas;
CREATE POLICY capas_tenant_isolation_policy ON capas
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 6. SAFETY AUDITS & ASSESSMENTS (ISO 45001 & MoL MD 286/2008)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    audit_number VARCHAR(100) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    auditor_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    findings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_audit_number UNIQUE (tenant_id, audit_number)
);

CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(tenant_id, status);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audits_tenant_isolation_policy ON audits;
CREATE POLICY audits_tenant_isolation_policy ON audits
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- -----------------------------------------------------------------------------
-- 7. APPEND-ONLY HASH-CHAINED AUDIT LOG (Tamper-Evident Ledger)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_ledger_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    seq_num BIGINT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    signature TEXT,
    metadata JSONB,
    CONSTRAINT uq_tenant_audit_seq UNIQUE (tenant_id, seq_num)
);

CREATE INDEX IF NOT EXISTS idx_audit_ledger_tenant ON audit_ledger_log(tenant_id, seq_num);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_entity ON audit_ledger_log(tenant_id, entity_type, entity_id);

ALTER TABLE audit_ledger_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_ledger_tenant_isolation_policy ON audit_ledger_log;
CREATE POLICY audit_ledger_tenant_isolation_policy ON audit_ledger_log
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
