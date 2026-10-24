-- OSHAD-SF Framework PostgreSQL Enterprise Schema
-- Features: Row-Level Security (RLS), Versioning, Append-Only Tamper-Evident Audit Logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TENANT & CONFIGURATION LAYER
-- ==========================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE oshad_mechanisms (
    id SERIAL PRIMARY KEY,
    mechanism_number INT NOT NULL, -- e.g., 1 to 11
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    version_tag VARCHAR(50) NOT NULL,
    effective_date DATE NOT NULL
);

CREATE TABLE tenant_mechanism_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    mechanism_id INT REFERENCES oshad_mechanisms(id),
    is_enabled BOOLEAN DEFAULT TRUE,
    custom_workflow_json JSONB, -- Stores the workflow designer sequence
    UNIQUE(tenant_id, mechanism_id)
);

-- ==========================================
-- 2. WORKFLOW & ENFORCEMENT LAYER
-- ==========================================
CREATE TABLE mechanism_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mechanism_id INT REFERENCES oshad_mechanisms(id),
    requirement_code VARCHAR(100) NOT NULL, -- e.g., "OSHAD-M1-R2"
    description TEXT NOT NULL,
    is_hard_gate BOOLEAN DEFAULT TRUE, -- TRUE = Cannot proceed without it
    mandatory_evidence_types JSONB
);

CREATE TABLE workflow_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    mechanism_id INT REFERENCES oshad_mechanisms(id),
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    due_date TIMESTAMP WITH TIME ZONE,
    payload JSONB, -- Dynamic data specific to mechanism (e.g. 5x5 matrix risk score)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES workflow_tasks(id),
    requirement_id UUID REFERENCES mechanism_requirements(id),
    file_url VARCHAR(1024),
    justification_override TEXT, -- If hard gate is bypassed via approval
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. ROW-LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE tenant_mechanism_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

-- Tenants can only see their own config
CREATE POLICY tenant_isolation_config ON tenant_mechanism_config
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Users see tasks for their tenant, or assigned specifically to them
CREATE POLICY tenant_isolation_tasks ON workflow_tasks
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ==========================================
-- 4. TAMPER-EVIDENT AUDIT LOG LAYER
-- ==========================================
CREATE TABLE audit_logs (
    sequence_id BIGSERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL,
    tenant_id UUID,
    user_id UUID,
    action_type VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    previous_hash TEXT, -- Cryptographic link to previous record
    record_hash TEXT NOT NULL -- Hash of (previous_hash + payload)
);

-- Ensure append-only immutability at the database level
CREATE OR REPLACE FUNCTION prevent_audit_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_mutation
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE PROCEDURE prevent_audit_update_delete();
