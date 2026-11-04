-- =============================================================================
-- Migration: 0008_phase8_security_privacy_hardening.down.sql
-- Description: Rollback Phase 8 Security, Privacy, Retention & Compliance Hardening
-- =============================================================================

DROP POLICY IF EXISTS tenant_isolation_data_subject_requests ON data_subject_requests;
DROP TABLE IF EXISTS data_subject_requests CASCADE;

DROP POLICY IF EXISTS tenant_isolation_data_retention_policies ON data_retention_policies;
DROP TABLE IF EXISTS data_retention_policies CASCADE;

ALTER TABLE incidents DROP COLUMN IF EXISTS legal_hold;
ALTER TABLE incidents DROP COLUMN IF EXISTS medical_notes_encrypted;
ALTER TABLE incidents DROP COLUMN IF EXISTS encryption_key_id;

ALTER TABLE capas DROP COLUMN IF EXISTS legal_hold;
ALTER TABLE permits DROP COLUMN IF EXISTS legal_hold;
