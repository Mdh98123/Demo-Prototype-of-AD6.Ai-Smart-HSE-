/**
 * Role Delegation Service
 *
 * Implements:
 * - Time-bound delegation lifecycle (starts_at, ends_at)
 * - Active delegation query with reference time support for deterministic testing
 * - Revocation of active delegations
 * - Dual-identity resolution (delegate acting on behalf of delegator)
 */

import { withTenantContext, getPool } from '../db/connection.js';
import type { RoleDelegationRecord } from '../db/schema.js';
import crypto from 'node:crypto';

export interface CreateDelegationParams {
  tenantId: string;
  delegatorId: string;
  delegateId: string;
  role: string;
  startsAt: Date | string;
  endsAt: Date | string;
  reason: string;
}

export class DelegationService {
  /**
   * Creates a time-bound role delegation.
   */
  public static async createDelegation(params: CreateDelegationParams): Promise<RoleDelegationRecord> {
    const startsAt = new Date(params.startsAt).toISOString();
    const endsAt = new Date(params.endsAt).toISOString();
    const id = crypto.randomUUID();

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      throw new Error('Delegation ends_at must be strictly after starts_at.');
    }

    if (params.delegatorId === params.delegateId) {
      throw new Error('Cannot delegate a role to oneself.');
    }

    return await withTenantContext(params.tenantId, async (client) => {
      const res = await client.query<RoleDelegationRecord>(
        `INSERT INTO role_delegations (
          id, tenant_id, delegator_id, delegate_id, role,
          starts_at, ends_at, reason, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())
        RETURNING *`,
        [
          id,
          params.tenantId,
          params.delegatorId,
          params.delegateId,
          params.role,
          startsAt,
          endsAt,
          params.reason
        ]
      );
      return res.rows[0];
    });
  }

  /**
   * Retrieves all active delegations for a delegate within the valid time window.
   */
  public static async getActiveDelegationsForUser(
    tenantId: string,
    delegateId: string,
    referenceTime: Date = new Date()
  ): Promise<RoleDelegationRecord[]> {
    const timeIso = referenceTime.toISOString();
    const pool = getPool();

    const res = await pool.query<RoleDelegationRecord>(
      `SELECT * FROM role_delegations
       WHERE tenant_id = $1
         AND delegate_id = $2
         AND is_active = TRUE
         AND revoked_at IS NULL
         AND starts_at <= $3
         AND ends_at > $3`,
      [tenantId, delegateId, timeIso]
    );

    return res.rows;
  }

  /**
   * Lists all delegations for a tenant.
   */
  public static async listDelegations(tenantId: string): Promise<RoleDelegationRecord[]> {
    const pool = getPool();
    const res = await pool.query<RoleDelegationRecord>(
      `SELECT * FROM role_delegations WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    return res.rows;
  }

  /**
   * Revokes a delegation prematurely.
   */
  public static async revokeDelegation(tenantId: string, delegationId: string): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query(
      `UPDATE role_delegations
       SET is_active = FALSE, revoked_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 AND revoked_at IS NULL
       RETURNING id`,
      [delegationId, tenantId]
    );
    return res.rowCount > 0;
  }
}
