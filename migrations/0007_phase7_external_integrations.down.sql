-- =============================================================================
-- Migration: 0007_phase7_external_integrations.down.sql
-- Description: Rollback Phase 7 External Integrations
-- =============================================================================

DROP POLICY IF EXISTS tenant_isolation_scim_users ON scim_users;
DROP TABLE IF EXISTS scim_users CASCADE;

DROP POLICY IF EXISTS tenant_isolation_erp_sync_logs ON erp_sync_logs;
DROP TABLE IF EXISTS erp_sync_logs CASCADE;

DROP POLICY IF EXISTS tenant_isolation_notification_outbox ON notification_outbox;
DROP TABLE IF EXISTS notification_outbox CASCADE;
