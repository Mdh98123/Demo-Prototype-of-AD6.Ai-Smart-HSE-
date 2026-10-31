-- =============================================================================
-- Migration: 0005_phase5_ai_safety_hardening.down.sql
-- Description: Rollback Phase 5 AI Safety Hardening
-- =============================================================================

DROP POLICY IF EXISTS tenant_isolation_ai_outputs ON ai_outputs;
DROP TABLE IF EXISTS ai_outputs CASCADE;
