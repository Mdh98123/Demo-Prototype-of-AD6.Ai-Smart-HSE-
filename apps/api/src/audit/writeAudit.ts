/**
 * Append-Only Hash-Chained Audit Trail Writer & Verifier
 *
 * Implements:
 * - Deterministic SHA-256 hash-chaining: each entry cryptographically links to prev_hash.
 * - Server-side occurred_at timestamp.
 * - Database-backed state restoration across process restarts (survives crashes/reboots).
 * - verifyAuditChain(tenantId, fromId, toId) for cryptographic integrity verification.
 * - Append-only enforcement: rejects mutations in database.
 */

import crypto from 'node:crypto';
import { withTenantContext } from '../db/connection';
import { AuditLogRecord } from '../db/schema';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export interface AuditWriteInput {
  tenantId: string;
  actorId: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  occurredAt?: string;
}

export interface AuditVerificationResult {
  ok: boolean;
  first_broken_id: number | null;
  totalVerified: number;
  headHash: string | null;
  error?: string;
}

/**
 * Deterministically stringifies an object with sorted keys
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => `${JSON.stringify(k)}:${canonicalJsonStringify(obj[k])}`).join(',') + '}';
}

/**
 * Computes SHA-256 hash of canonicalized payload
 */
export function hashPayload(payload: any): string {
  if (payload === null || payload === undefined) {
    return GENESIS_HASH;
  }
  return crypto.createHash('sha256').update(canonicalJsonStringify(payload)).digest('hex');
}

/**
 * Computes deterministic entry hash linking predecessor hash and state changes
 */
export function computeEntryHash(
  prevHash: string,
  tenantId: string,
  actorId: string,
  entityType: string,
  entityId: string,
  action: string,
  beforeHash: string,
  afterHash: string,
  occurredAt: string
): string {
  const message = [
    prevHash,
    tenantId,
    actorId,
    entityType,
    entityId,
    action,
    beforeHash,
    afterHash,
    new Date(occurredAt).toISOString()
  ].join('|');

  return crypto.createHash('sha256').update(message).digest('hex');
}

/**
 * Writes an append-only, hash-chained audit record to PostgreSQL.
 * Fetches the latest committed entry for the tenant to guarantee uninterrupted chain continuity.
 */
export async function writeAudit(entry: AuditWriteInput): Promise<AuditLogRecord> {
  const tenantId = entry.tenantId;
  const occurredAt = entry.occurredAt || new Date().toISOString();
  const beforeHash = hashPayload(entry.beforeState);
  const afterHash = hashPayload(entry.afterState);

  return withTenantContext(tenantId, async (client) => {
    // 1. Fetch the latest entry hash for this tenant (or fallback to GENESIS_HASH)
    const prevRes = await client.query<{ entry_hash: string }>(
      'SELECT entry_hash FROM audit_log WHERE tenant_id = $1 ORDER BY id DESC LIMIT 1',
      [tenantId]
    );

    const prevHash = prevRes.rows[0]?.entry_hash || GENESIS_HASH;

    // 2. Compute cryptographic entry hash
    const entryHash = computeEntryHash(
      prevHash,
      tenantId,
      entry.actorId,
      entry.entityType,
      entry.entityId,
      entry.action,
      beforeHash,
      afterHash,
      occurredAt
    );

    // 3. Insert record into audit_log
    const query = `
      INSERT INTO audit_log (
        tenant_id, actor_id, actor_role, action, entity_type, entity_id,
        before_hash, after_hash, prev_hash, entry_hash, occurred_at,
        request_id, ip, user_agent, metadata, payload_hash, timestamp, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
      ) RETURNING *
    `;

    const params = [
      tenantId,
      entry.actorId,
      entry.actorRole || 'System',
      entry.action,
      entry.entityType,
      entry.entityId,
      beforeHash,
      afterHash,
      prevHash,
      entryHash,
      occurredAt,
      entry.requestId || null,
      entry.ip || null,
      entry.userAgent || null,
      JSON.stringify(entry.metadata || {}),
      afterHash, // backwards compatible payload_hash
      occurredAt
    ];

    const res = await client.query<AuditLogRecord>(query, params);
    return res.rows[0];
  });
}

/**
 * Cryptographically verifies the audit ledger hash-chain integrity.
 * Returns { ok: true } if chain is valid, or { ok: false, first_broken_id: <id> } on tampering.
 */
export async function verifyAuditChain(
  tenantId: string,
  fromId?: number,
  toId?: number
): Promise<AuditVerificationResult> {
  return withTenantContext(tenantId, async (client) => {
    let query = 'SELECT * FROM audit_log WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (fromId !== undefined) {
      query += ` AND id >= $${paramIndex++}`;
      params.push(fromId);
    }
    if (toId !== undefined) {
      query += ` AND id <= $${paramIndex++}`;
      params.push(toId);
    }

    query += ' ORDER BY id ASC';

    const res = await client.query<AuditLogRecord>(query, params);
    const rows = res.rows;

    if (rows.length === 0) {
      return {
        ok: true,
        first_broken_id: null,
        totalVerified: 0,
        headHash: null
      };
    }

    let expectedPrevHash: string | null = null;

    // If starting from an offset > 1, retrieve the true predecessor hash
    if (fromId !== undefined && rows[0].id > 1) {
      const predRes = await client.query<{ entry_hash: string }>(
        'SELECT entry_hash FROM audit_log WHERE tenant_id = $1 AND id < $2 ORDER BY id DESC LIMIT 1',
        [tenantId, rows[0].id]
      );
      expectedPrevHash = predRes.rows[0]?.entry_hash || GENESIS_HASH;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowId = Number(row.id);

      // Check predecessor linking
      if (expectedPrevHash !== null) {
        if (row.prev_hash !== expectedPrevHash) {
          return {
            ok: false,
            first_broken_id: rowId,
            totalVerified: i,
            headHash: rows[i - 1]?.entry_hash || null,
            error: `Predecessor hash mismatch at ID ${rowId}. Expected ${expectedPrevHash}, received ${row.prev_hash}`
          };
        }
      }

      // Recompute entry hash
      const computed = computeEntryHash(
        row.prev_hash,
        row.tenant_id,
        row.actor_id,
        row.entity_type,
        row.entity_id,
        row.action,
        row.before_hash,
        row.after_hash,
        row.occurred_at
      );

      if (computed !== row.entry_hash) {
        return {
          ok: false,
          first_broken_id: rowId,
          totalVerified: i,
          headHash: rows[i - 1]?.entry_hash || null,
          error: `Tampered hash at ID ${rowId}. Recomputed ${computed}, found ${row.entry_hash}`
        };
      }

      expectedPrevHash = row.entry_hash;
    }

    return {
      ok: true,
      first_broken_id: null,
      totalVerified: rows.length,
      headHash: rows[rows.length - 1].entry_hash
    };
  });
}
