-- =============================================================================
-- Migration: 0004_phase4_auth_rbac_sod_delegation.up.sql
-- Description: Phase 4 Auth, RBAC, DB-Enforced Segregation of Duties (SoD), Delegation & Escalation
-- Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143 Section 4.2)
-- Guardrails: G-3 (SoD), G-6 (Multi-tenant RLS on all tenant data tables)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. AUTH SESSIONS & REVOCATION
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_method VARCHAR(32),
    ip_address VARCHAR(64),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by VARCHAR(255),
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_tenant ON auth_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_auth_sessions ON auth_sessions
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 2. SEGREGATION OF DUTIES (SOD) RULES (Machine-Checkable Predicates)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sod_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rule_code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    predicate_sql TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'CRITICAL',
    error_message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sod_rule_tenant_code UNIQUE (tenant_id, rule_code)
);
CREATE INDEX IF NOT EXISTS idx_sod_rules_tenant ON sod_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sod_rules_entity ON sod_rules(entity_type);
ALTER TABLE sod_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sod_rules ON sod_rules
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 3. ROLE DELEGATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    delegator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_role_delegations_tenant ON role_delegations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_delegations_delegate ON role_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_role_delegations_delegator ON role_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_role_delegations_window ON role_delegations(starts_at, ends_at);
ALTER TABLE role_delegations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_role_delegations ON role_delegations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 4. ESCALATION RULES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rule_code VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    condition VARCHAR(64) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    target_role VARCHAR(64) NOT NULL,
    delay_minutes INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_escalation_rules_tenant_code UNIQUE (tenant_id, rule_code)
);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_tenant ON escalation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_entity ON escalation_rules(entity_type);
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_escalation_rules ON escalation_rules
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- -----------------------------------------------------------------------------
-- 5. DATABASE-LEVEL SOD TRIGGERS & ENFORCEMENT FUNCTIONS
-- -----------------------------------------------------------------------------

-- 5.1 Permit to Work SoD: Permit Receiver cannot self-authorize as Issuer / Area Authority
CREATE OR REPLACE FUNCTION enforce_permit_sod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.issuer_name IS NOT NULL AND NEW.receiver_name IS NOT NULL THEN
    IF LOWER(TRIM(NEW.issuer_name)) = LOWER(TRIM(NEW.receiver_name)) THEN
      RAISE EXCEPTION 'SoD Violation: Permit Receiver cannot self-authorize as Permit Issuer/Area Authority (PDO SP-1143 Section 4.2).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_permit_sod ON permits;
CREATE TRIGGER trg_enforce_permit_sod
BEFORE INSERT OR UPDATE ON permits
FOR EACH ROW EXECUTE FUNCTION enforce_permit_sod();

-- 5.2 CAPA SoD: Action Owner cannot self-verify and close action
CREATE OR REPLACE FUNCTION enforce_capa_sod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Closed' AND NEW.owner_name IS NOT NULL AND NEW.verified_by_name IS NOT NULL THEN
    IF LOWER(TRIM(NEW.owner_name)) = LOWER(TRIM(NEW.verified_by_name)) THEN
      RAISE EXCEPTION 'SoD Violation: Action Owner cannot self-verify and close their own action (ISO 45001 / GCC Safety Standard).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_capa_sod ON capas;
CREATE TRIGGER trg_enforce_capa_sod
BEFORE INSERT OR UPDATE ON capas
FOR EACH ROW EXECUTE FUNCTION enforce_capa_sod();

-- 5.3 Investigation SoD: Incident reporter cannot approve own investigation
CREATE OR REPLACE FUNCTION enforce_investigation_sod()
RETURNS TRIGGER AS $$
DECLARE
  v_incident_reporter VARCHAR(255);
BEGIN
  -- If status is being marked Approved or Closed, check incident reporter
  IF NEW.status IN ('Approved', 'Closed') THEN
    SELECT details->>'reported_by' INTO v_incident_reporter
    FROM incidents
    WHERE id = NEW.incident_id;

    IF v_incident_reporter IS NOT NULL AND NEW.lead_investigator IS NOT NULL THEN
      IF LOWER(TRIM(v_incident_reporter)) = LOWER(TRIM(NEW.lead_investigator)) THEN
        RAISE EXCEPTION 'SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_investigation_sod ON investigations;
CREATE TRIGGER trg_enforce_investigation_sod
BEFORE INSERT OR UPDATE ON investigations
FOR EACH ROW EXECUTE FUNCTION enforce_investigation_sod();

-- 5.4 Role Assignment SoD: User cannot grant themselves a role
CREATE OR REPLACE FUNCTION enforce_role_assignment_sod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.granted_by IS NOT NULL AND NEW.user_id IS NOT NULL THEN
    IF NEW.granted_by::text = NEW.user_id::text THEN
      RAISE EXCEPTION 'SoD Violation: Users cannot grant themselves a security role (Principle of Least Privilege).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_role_assignment_sod ON role_assignments;
CREATE TRIGGER trg_enforce_role_assignment_sod
BEFORE INSERT OR UPDATE ON role_assignments
FOR EACH ROW EXECUTE FUNCTION enforce_role_assignment_sod();
