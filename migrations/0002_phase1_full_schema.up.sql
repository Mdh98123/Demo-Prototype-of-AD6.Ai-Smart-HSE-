-- =============================================================================
-- Migration: 0002_phase1_full_schema.up.sql
-- Description: Phase 1 PostgreSQL 16 Data Layer & Multi-Tenant Row-Level Security (RLS)
-- Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143, PDO SP-1170) & GCC
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ROOT MULTI-TENANCY TABLE (No tenant_id reference to self)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(32) NOT NULL DEFAULT 'OMAN',
    cr_number VARCHAR(128) NOT NULL,
    data_residency VARCHAR(64) NOT NULL DEFAULT 'OMAN_CLOUD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. SITES & FACILITIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sites ON sites
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 3. USERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL,
    department VARCHAR(128),
    sso_subject_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 4. ROLES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_roles ON roles
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 5. ROLE ASSIGNMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_role_assignments_tenant_id ON role_assignments(tenant_id);
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_role_assignments ON role_assignments
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 6. CONTRACTORS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    trade VARCHAR(128) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(64),
    compliance_status VARCHAR(64) NOT NULL DEFAULT 'Approved',
    cr_number VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractors_tenant_id ON contractors(tenant_id);
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contractors ON contractors
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 7. CONTRACTOR DOCUMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contractor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    doc_type VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    expiry_date DATE,
    status VARCHAR(64) NOT NULL DEFAULT 'Valid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_tenant_id ON contractor_documents(tenant_id);
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_contractor_documents ON contractor_documents
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 8. COMPETENCY RECORDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competency_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    worker_name VARCHAR(255) NOT NULL,
    civil_id VARCHAR(128) NOT NULL,
    trade VARCHAR(128) NOT NULL,
    certification VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_competency_records_tenant_id ON competency_records(tenant_id);
ALTER TABLE competency_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_competency_records ON competency_records
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 9. INCIDENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_number VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    severity VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Open',
    location VARCHAR(255) NOT NULL,
    incident_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    form_g_submitted BOOLEAN NOT NULL DEFAULT false,
    form_g_receipt_number VARCHAR(128),
    form_g_deadline TIMESTAMPTZ,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON incidents(tenant_id);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_incidents ON incidents
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 10. INCIDENT EVIDENCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    caption TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incident_evidence_tenant_id ON incident_evidence(tenant_id);
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_incident_evidence ON incident_evidence
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 11. INVESTIGATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    lead_investigator VARCHAR(255) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'In Progress',
    root_cause_summary TEXT,
    methodology VARCHAR(128) NOT NULL DEFAULT '5-Whys and Fishbone',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_investigations_tenant_id ON investigations(tenant_id);
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_investigations ON investigations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 12. WHYS (5-Whys Analysis)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    level INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_whys_tenant_id ON whys(tenant_id);
ALTER TABLE whys ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whys ON whys
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 13. FISHBONE NODES (Ishikawa Diagram)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fishbone_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    cause TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fishbone_nodes_tenant_id ON fishbone_nodes(tenant_id);
ALTER TABLE fishbone_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fishbone_nodes ON fishbone_nodes
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 14. BOWTIE NODES (Barrier Analysis)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bowtie_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    node_type VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    barrier_type VARCHAR(64),
    status VARCHAR(64) NOT NULL DEFAULT 'Effective',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bowtie_nodes_tenant_id ON bowtie_nodes(tenant_id);
ALTER TABLE bowtie_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_bowtie_nodes ON bowtie_nodes
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 15. CAPAS (Corrective and Preventive Actions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_number VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority VARCHAR(32) NOT NULL DEFAULT 'P2 - High',
    status VARCHAR(32) NOT NULL DEFAULT 'Open',
    owner_name VARCHAR(255) NOT NULL,
    verified_by_name VARCHAR(255),
    due_date DATE NOT NULL,
    hierarchy VARCHAR(64) NOT NULL DEFAULT 'Engineering',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_capa_sod_owner_not_verifier CHECK (
        status <> 'Closed' OR verified_by_name IS NULL OR owner_name <> verified_by_name
    )
);
CREATE INDEX IF NOT EXISTS idx_capas_tenant_id ON capas(tenant_id);
ALTER TABLE capas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_capas ON capas
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 16. CAPA EVIDENCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capa_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    capa_id UUID NOT NULL REFERENCES capas(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_capa_evidence_tenant_id ON capa_evidence(tenant_id);
ALTER TABLE capa_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_capa_evidence ON capa_evidence
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 17. PERMITS (PTW / Safe Systems of Work)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permit_number VARCHAR(64) NOT NULL,
    permit_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    zone VARCHAR(128) NOT NULL DEFAULT 'General Area',
    exact_location VARCHAR(255) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL,
    issuer_name VARCHAR(255),
    receiver_name VARCHAR(255),
    issuer_signature JSONB,
    receiver_signature JSONB,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_permit_sod_receiver_not_issuer CHECK (
        issuer_name IS NULL OR receiver_name IS NULL OR issuer_name <> receiver_name
    )
);
CREATE INDEX IF NOT EXISTS idx_permits_tenant_id ON permits(tenant_id);
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_permits ON permits
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 18. PERMIT APPROVALS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permit_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    approver_name VARCHAR(255) NOT NULL,
    approver_role VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Approved',
    comments TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_permit_approvals_tenant_id ON permit_approvals(tenant_id);
ALTER TABLE permit_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_permit_approvals ON permit_approvals
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 19. PERMIT ISOLATIONS (LOTO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permit_isolations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    isolation_type VARCHAR(64) NOT NULL,
    tag_number VARCHAR(128) NOT NULL,
    isolated_by VARCHAR(255) NOT NULL,
    verified_by VARCHAR(255),
    status VARCHAR(64) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_permit_isolations_tenant_id ON permit_isolations(tenant_id);
ALTER TABLE permit_isolations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_permit_isolations ON permit_isolations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 20. GAS TESTS (Atmospheric Testing)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gas_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    tester_name VARCHAR(255) NOT NULL,
    oxygen_pct NUMERIC(4,2) NOT NULL,
    lel_pct NUMERIC(4,2) NOT NULL,
    h2s_ppm NUMERIC(5,2) NOT NULL,
    co_ppm NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT true,
    tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gas_tests_tenant_id ON gas_tests(tenant_id);
ALTER TABLE gas_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_gas_tests ON gas_tests
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 21. TWL READINGS (Thermal Work Limit PDO SP-1170)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS twl_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    location VARCHAR(255) NOT NULL,
    dry_bulb_c NUMERIC(4,1) NOT NULL,
    wet_bulb_c NUMERIC(4,1) NOT NULL,
    globe_temp_c NUMERIC(4,1) NOT NULL,
    twl_w_m2 NUMERIC(5,1) NOT NULL,
    work_rest_regime VARCHAR(128) NOT NULL,
    flag_color VARCHAR(32) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_twl_readings_tenant_id ON twl_readings(tenant_id);
ALTER TABLE twl_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_twl_readings ON twl_readings
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 22. TWL BREACHES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS twl_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    reading_id UUID REFERENCES twl_readings(id) ON DELETE SET NULL,
    twl_value NUMERIC(5,1) NOT NULL,
    breach_type VARCHAR(64) NOT NULL,
    stop_work_triggered BOOLEAN NOT NULL DEFAULT true,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_twl_breaches_tenant_id ON twl_breaches(tenant_id);
ALTER TABLE twl_breaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_twl_breaches ON twl_breaches
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 23. INSPECTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    template_type VARCHAR(128) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Scheduled',
    score NUMERIC(5,2),
    completed_at TIMESTAMPTZ,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspections_tenant_id ON inspections(tenant_id);
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inspections ON inspections
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 24. INSPECTION ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    category VARCHAR(128) NOT NULL,
    item_text TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Compliant',
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspection_items_tenant_id ON inspection_items(tenant_id);
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inspection_items ON inspection_items
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 25. OBSERVATIONS (Behavior Based Safety BBS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    observation_number VARCHAR(64) NOT NULL,
    observer_name VARCHAR(255) NOT NULL,
    observation_type VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    immediate_action TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'Logged',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_observations_tenant_id ON observations(tenant_id);
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_observations ON observations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 26. HAZARD REPORTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hazard_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hazard_number VARCHAR(64) NOT NULL,
    reporter_name VARCHAR(255) NOT NULL,
    hazard_category VARCHAR(128) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_tenant_id ON hazard_reports(tenant_id);
ALTER TABLE hazard_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hazard_reports ON hazard_reports
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 27. TRAINING RECORDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    course_code VARCHAR(64) NOT NULL,
    trainee_name VARCHAR(255) NOT NULL,
    civil_id VARCHAR(128) NOT NULL,
    completion_date DATE NOT NULL,
    expiry_date DATE,
    score NUMERIC(5,2),
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_training_records_tenant_id ON training_records(tenant_id);
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_training_records ON training_records
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 28. DOCUMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    doc_number VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    current_version VARCHAR(32) NOT NULL DEFAULT '1.0',
    owner_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_documents ON documents
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 29. DOCUMENT REVISIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_string VARCHAR(32) NOT NULL,
    change_summary TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_revisions_tenant_id ON document_revisions(tenant_id);
ALTER TABLE document_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_document_revisions ON document_revisions
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 30. REGULATORY OBLIGATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regulatory_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    standard_code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    issuing_body VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(32) NOT NULL DEFAULT 'OMAN',
    compliance_level VARCHAR(64) NOT NULL DEFAULT 'Full Compliance',
    review_frequency VARCHAR(64) NOT NULL DEFAULT 'Annual',
    last_audited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_regulatory_obligations_tenant_id ON regulatory_obligations(tenant_id);
ALTER TABLE regulatory_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_regulatory_obligations ON regulatory_obligations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 31. CONTROL MAPPINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS control_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES regulatory_obligations(id) ON DELETE CASCADE,
    internal_control_ref VARCHAR(128) NOT NULL,
    control_description TEXT NOT NULL,
    verification_frequency VARCHAR(64) NOT NULL DEFAULT 'Monthly',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_control_mappings_tenant_id ON control_mappings(tenant_id);
ALTER TABLE control_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_control_mappings ON control_mappings
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 32. SUBMISSIONS (Phase 2 will own writers; table only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    submission_type VARCHAR(64) NOT NULL,
    reference_number VARCHAR(128) NOT NULL,
    target_authority VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    receipt JSONB,
    status VARCHAR(64) NOT NULL DEFAULT 'Submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_tenant_id ON submissions(tenant_id);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_submissions ON submissions
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 33. AUDIT LOG (Phase 2 will own writers; table only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id VARCHAR(128) NOT NULL,
    actor_role VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    entry_hash VARCHAR(64) NOT NULL,
    signature VARCHAR(256),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit_log ON audit_log
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 34. AI OUTPUTS (Phase 5 will own writers; table only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    model_alias VARCHAR(128) NOT NULL,
    prompt_hash VARCHAR(64) NOT NULL,
    output_text TEXT NOT NULL,
    confidence_score NUMERIC(5,4),
    hitl_status VARCHAR(64) NOT NULL DEFAULT 'Pending_Review',
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_tenant_id ON ai_outputs(tenant_id);
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ai_outputs ON ai_outputs
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
