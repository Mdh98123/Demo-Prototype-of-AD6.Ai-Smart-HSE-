-- =============================================================================
-- Migration: 0006_phase6_offline_sync.down.sql
-- Description: Rollback Phase 6 Field PWA Offline Sync
-- =============================================================================

ALTER TABLE inspections DROP COLUMN IF EXISTS sync_device_id;
ALTER TABLE inspections DROP COLUMN IF EXISTS client_updated_at;
ALTER TABLE inspections DROP COLUMN IF EXISTS answers;
ALTER TABLE incidents DROP COLUMN IF EXISTS sync_idempotency_key;
ALTER TABLE incidents DROP COLUMN IF EXISTS duplicate_flag;

DROP POLICY IF EXISTS tenant_isolation_sync_conflict_audits ON sync_conflict_audits;
DROP TABLE IF EXISTS sync_conflict_audits CASCADE;

DROP POLICY IF EXISTS tenant_isolation_sync_idempotency ON sync_idempotency_keys;
DROP TABLE IF EXISTS sync_idempotency_keys CASCADE;
