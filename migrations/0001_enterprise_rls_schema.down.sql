-- =============================================================================
-- Migration: 0001_enterprise_rls_schema.down.sql
-- Description: Rollback for Core Enterprise HSE Schema with Multi-Tenancy & RLS
-- Target: PostgreSQL 16 (Supabase-compatible)
-- =============================================================================

DROP POLICY IF EXISTS audit_ledger_tenant_isolation_policy ON audit_ledger_log;
DROP TABLE IF EXISTS audit_ledger_log CASCADE;

DROP POLICY IF EXISTS audits_tenant_isolation_policy ON audits;
DROP TABLE IF EXISTS audits CASCADE;

DROP POLICY IF EXISTS capas_tenant_isolation_policy ON capas;
DROP TABLE IF EXISTS capas CASCADE;

DROP POLICY IF EXISTS permits_tenant_isolation_policy ON permits;
DROP TABLE IF EXISTS permits CASCADE;

DROP POLICY IF EXISTS incidents_tenant_isolation_policy ON incidents;
DROP TABLE IF EXISTS incidents CASCADE;

DROP POLICY IF EXISTS users_tenant_isolation_policy ON users;
DROP TABLE IF EXISTS users CASCADE;

DROP POLICY IF EXISTS tenant_self_isolation_policy ON tenants;
DROP TABLE IF EXISTS tenants CASCADE;
