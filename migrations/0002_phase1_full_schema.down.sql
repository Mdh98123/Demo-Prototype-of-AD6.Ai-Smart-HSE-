-- =============================================================================
-- Migration: 0002_phase1_full_schema.down.sql
-- Description: Phase 1 PostgreSQL 16 Rollback Script
-- =============================================================================

-- Drop policies
DROP POLICY IF EXISTS tenant_isolation_ai_outputs ON ai_outputs;
DROP POLICY IF EXISTS tenant_isolation_audit_log ON audit_log;
DROP POLICY IF EXISTS tenant_isolation_submissions ON submissions;
DROP POLICY IF EXISTS tenant_isolation_control_mappings ON control_mappings;
DROP POLICY IF EXISTS tenant_isolation_regulatory_obligations ON regulatory_obligations;
DROP POLICY IF EXISTS tenant_isolation_document_revisions ON document_revisions;
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
DROP POLICY IF EXISTS tenant_isolation_training_records ON training_records;
DROP POLICY IF EXISTS tenant_isolation_hazard_reports ON hazard_reports;
DROP POLICY IF EXISTS tenant_isolation_observations ON observations;
DROP POLICY IF EXISTS tenant_isolation_inspection_items ON inspection_items;
DROP POLICY IF EXISTS tenant_isolation_inspections ON inspections;
DROP POLICY IF EXISTS tenant_isolation_twl_breaches ON twl_breaches;
DROP POLICY IF EXISTS tenant_isolation_twl_readings ON twl_readings;
DROP POLICY IF EXISTS tenant_isolation_gas_tests ON gas_tests;
DROP POLICY IF EXISTS tenant_isolation_permit_isolations ON permit_isolations;
DROP POLICY IF EXISTS tenant_isolation_permit_approvals ON permit_approvals;
DROP POLICY IF EXISTS tenant_isolation_permits ON permits;
DROP POLICY IF EXISTS tenant_isolation_capa_evidence ON capa_evidence;
DROP POLICY IF EXISTS tenant_isolation_capas ON capas;
DROP POLICY IF EXISTS tenant_isolation_bowtie_nodes ON bowtie_nodes;
DROP POLICY IF EXISTS tenant_isolation_fishbone_nodes ON fishbone_nodes;
DROP POLICY IF EXISTS tenant_isolation_whys ON whys;
DROP POLICY IF EXISTS tenant_isolation_investigations ON investigations;
DROP POLICY IF EXISTS tenant_isolation_incident_evidence ON incident_evidence;
DROP POLICY IF EXISTS tenant_isolation_incidents ON incidents;
DROP POLICY IF EXISTS tenant_isolation_competency_records ON competency_records;
DROP POLICY IF EXISTS tenant_isolation_contractor_documents ON contractor_documents;
DROP POLICY IF EXISTS tenant_isolation_contractors ON contractors;
DROP POLICY IF EXISTS tenant_isolation_role_assignments ON role_assignments;
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_sites ON sites;

-- Drop tables in reverse foreign key order
DROP TABLE IF EXISTS ai_outputs CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS control_mappings CASCADE;
DROP TABLE IF EXISTS regulatory_obligations CASCADE;
DROP TABLE IF EXISTS document_revisions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS training_records CASCADE;
DROP TABLE IF EXISTS hazard_reports CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS inspection_items CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS twl_breaches CASCADE;
DROP TABLE IF EXISTS twl_readings CASCADE;
DROP TABLE IF EXISTS gas_tests CASCADE;
DROP TABLE IF EXISTS permit_isolations CASCADE;
DROP TABLE IF EXISTS permit_approvals CASCADE;
DROP TABLE IF EXISTS permits CASCADE;
DROP TABLE IF EXISTS capa_evidence CASCADE;
DROP TABLE IF EXISTS capas CASCADE;
DROP TABLE IF EXISTS bowtie_nodes CASCADE;
DROP TABLE IF EXISTS fishbone_nodes CASCADE;
DROP TABLE IF EXISTS whys CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS incident_evidence CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS competency_records CASCADE;
DROP TABLE IF EXISTS contractor_documents CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS role_assignments CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
