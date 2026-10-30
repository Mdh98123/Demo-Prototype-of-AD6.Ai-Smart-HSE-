# /infra — Platform Infrastructure & Tooling

Contains container infrastructure, local orchestration, and migration execution engines.

## Components
- `docker-compose.yml`: Multi-container topology running `api`, `postgres` (PostGIS 16), and `minio` (S3 object storage).
- `migrations-runner.mjs`: Validates and runs PostgreSQL 16 migrations with dry-run checking and Guardrail G-6 RLS verification.

## Execution
```bash
# Validate migrations (dry run)
node infra/migrations-runner.mjs --dry-run

# Start local infrastructure stack
docker compose -f infra/docker-compose.yml up -d
```
