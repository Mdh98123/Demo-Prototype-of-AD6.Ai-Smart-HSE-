-- =============================================================================
-- Migration: 0003_phase2_audit_and_statutory_clock.down.sql
-- Description: Phase 2 Rollback Script
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_audit_log_prevent_delete ON audit_log;
DROP TRIGGER IF EXISTS trg_audit_log_prevent_update ON audit_log;
DROP FUNCTION IF EXISTS reject_audit_log_mutation();

-- Drop policies
DROP POLICY IF EXISTS tenant_isolation_notification_outbox ON notification_outbox;
DROP POLICY IF EXISTS tenant_isolation_incident_statutory_clock ON incident_statutory_clock;

-- Drop tables
DROP TABLE IF EXISTS notification_outbox CASCADE;
DROP TABLE IF EXISTS incident_statutory_clock CASCADE;

-- Drop added audit_log columns if necessary
ALTER TABLE audit_log DROP COLUMN IF EXISTS before_hash;
ALTER TABLE audit_log DROP COLUMN IF EXISTS after_hash;
ALTER TABLE audit_log DROP COLUMN IF EXISTS prev_hash;
ALTER TABLE audit_log DROP COLUMN IF EXISTS occurred_at;
ALTER TABLE audit_log DROP COLUMN IF EXISTS request_id;
ALTER TABLE audit_log DROP COLUMN IF EXISTS ip;
ALTER TABLE audit_log DROP COLUMN IF EXISTS user_agent;
ALTER TABLE audit_log DROP COLUMN IF EXISTS metadata;
