-- =============================================================================
-- Migration: 0004_phase4_auth_rbac_sod_delegation.down.sql
-- Description: Phase 4 Rollback Script
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_enforce_role_assignment_sod ON role_assignments;
DROP FUNCTION IF EXISTS enforce_role_assignment_sod();

DROP TRIGGER IF EXISTS trg_enforce_investigation_sod ON investigations;
DROP FUNCTION IF EXISTS enforce_investigation_sod();

DROP TRIGGER IF EXISTS trg_enforce_capa_sod ON capas;
DROP FUNCTION IF EXISTS enforce_capa_sod();

DROP TRIGGER IF EXISTS trg_enforce_permit_sod ON permits;
DROP FUNCTION IF EXISTS enforce_permit_sod();

-- Drop policies
DROP POLICY IF EXISTS tenant_isolation_escalation_rules ON escalation_rules;
DROP POLICY IF EXISTS tenant_isolation_role_delegations ON role_delegations;
DROP POLICY IF EXISTS tenant_isolation_sod_rules ON sod_rules;
DROP POLICY IF EXISTS tenant_isolation_auth_sessions ON auth_sessions;

-- Drop tables
DROP TABLE IF EXISTS escalation_rules CASCADE;
DROP TABLE IF EXISTS role_delegations CASCADE;
DROP TABLE IF EXISTS sod_rules CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
