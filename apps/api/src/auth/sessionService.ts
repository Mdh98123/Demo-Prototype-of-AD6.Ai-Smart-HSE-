/**
 * Enterprise Auth Session Service & Revocation Store
 *
 * Enforces:
 * - Persistent session tracking in `auth_sessions` table
 * - Instant cryptographic session revocation
 * - Multi-tenant scoping and RLS compliance
 * - MFA verification tracking per session
 */

import { withTenantContext, getPool } from '../db/connection.js';
import type { AuthSessionRecord } from '../db/schema.js';
import crypto from 'node:crypto';

export interface CreateSessionParams {
  tenantId: string;
  userId: string;
  sessionToken?: string;
  mfaVerified?: boolean;
  mfaMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  durationHours?: number;
}

export class SessionService {
  /**
   * Generates a secure random session token.
   */
  public static generateToken(): string {
    return 'ad6_sess_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a new persistent auth session in the database.
   */
  public static async createSession(params: CreateSessionParams): Promise<AuthSessionRecord> {
    const token = params.sessionToken || this.generateToken();
    const duration = params.durationHours || 24;
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000).toISOString();
    const id = crypto.randomUUID();

    return await withTenantContext(params.tenantId, async (client) => {
      const res = await client.query<AuthSessionRecord>(
        `INSERT INTO auth_sessions (
          id, tenant_id, user_id, session_token, mfa_verified, mfa_method,
          ip_address, user_agent, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *`,
        [
          id,
          params.tenantId,
          params.userId,
          token,
          Boolean(params.mfaVerified),
          params.mfaMethod || (params.mfaVerified ? 'totp' : null),
          params.ipAddress || '127.0.0.1',
          params.userAgent || 'AD6-Enterprise-Client',
          expiresAt
        ]
      );
      return res.rows[0];
    });
  }

  /**
   * Retrieves a session by its token, verifying expiry and revocation status.
   */
  public static async validateSession(
    token: string,
    tenantId?: string
  ): Promise<{ valid: boolean; session?: AuthSessionRecord; reason?: string }> {
    if (!token) {
      return { valid: false, reason: 'Token missing' };
    }

    const pool = getPool();
    const res = await pool.query<AuthSessionRecord>(
      `SELECT * FROM auth_sessions WHERE session_token = $1`,
      [token]
    );

    if (res.rows.length === 0) {
      return { valid: false, reason: 'Session not found' };
    }

    const session = res.rows[0];

    if (session.revoked_at) {
      return {
        valid: false,
        session,
        reason: `Session revoked at ${session.revoked_at}: ${session.revocation_reason || 'Administrative action'}`
      };
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return { valid: false, session, reason: 'Session expired' };
    }

    if (tenantId && session.tenant_id !== tenantId) {
      return { valid: false, session, reason: 'Tenant mismatch' };
    }

    return { valid: true, session };
  }

  /**
   * Revokes a single session immediately.
   */
  public static async revokeSession(
    token: string,
    revokedBy: string,
    reason: string = 'User initiated logout or security revocation'
  ): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query(
      `UPDATE auth_sessions 
       SET revoked_at = NOW(), revoked_by = $1, revocation_reason = $2 
       WHERE session_token = $3 AND revoked_at IS NULL
       RETURNING id`,
      [revokedBy, reason, token]
    );
    return res.rowCount > 0;
  }

  /**
   * Revokes all active sessions for a specific user (e.g. on role change or compromise).
   */
  public static async revokeAllUserSessions(
    userId: string,
    revokedBy: string,
    reason: string = 'Security reset / all sessions revoked'
  ): Promise<number> {
    const pool = getPool();
    const res = await pool.query(
      `UPDATE auth_sessions 
       SET revoked_at = NOW(), revoked_by = $1, revocation_reason = $2 
       WHERE user_id = $3 AND revoked_at IS NULL`,
      [revokedBy, reason, userId]
    );
    return res.rowCount;
  }
}
