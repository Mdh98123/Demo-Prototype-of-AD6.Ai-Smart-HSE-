/**
 * AD6.Ai Smart HSE Platform — SCIM 2.0 User Provisioning Service (RFC 7643 / RFC 7644)
 *
 * Implements enterprise SCIM 2.0 endpoints for automated identity lifecycle management
 * from Microsoft Entra ID, Okta SCIM, or Keycloak.
 */

import crypto from 'node:crypto';
import { getPool, withTenantContext } from '../../db/connection.js';
import { ScimUserRecord } from '../../db/schema.js';
import { EnterpriseRole } from '../../../../../packages/shared/src/rbac.js';

export interface ScimUserResource {
  schemas: string[];
  id: string;
  externalId?: string;
  userName: string;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
  };
  displayName?: string;
  emails: Array<{
    value: string;
    primary?: boolean;
    type?: string;
  }>;
  roles?: Array<{
    value: string;
    primary?: boolean;
  }>;
  active: boolean;
  meta: {
    resourceType: 'User';
    created: string;
    lastModified: string;
    location: string;
  };
}

export class ScimService {
  private static readonly SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';

  public static toScimResource(record: ScimUserRecord, baseUrl = '/api/v1/scim/v2/Users'): ScimUserResource {
    return {
      schemas: [this.SCIM_USER_SCHEMA],
      id: record.id,
      externalId: record.external_id,
      userName: record.user_name,
      displayName: record.display_name || record.user_name,
      emails: [
        {
          value: record.email,
          primary: true,
          type: 'work'
        }
      ],
      roles: [
        {
          value: record.role,
          primary: true
        }
      ],
      active: record.active,
      meta: {
        resourceType: 'User',
        created: record.created_at,
        lastModified: record.updated_at,
        location: `${baseUrl}/${record.id}`
      }
    };
  }

  /**
   * List users with SCIM pagination (startIndex 1-based, count)
   */
  public static async listUsers(
    tenantId: string,
    startIndex = 1,
    count = 50
  ): Promise<{
    schemas: string[];
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
    Resources: ScimUserResource[];
  }> {
    const pool = getPool();
    const offset = Math.max(0, startIndex - 1);
    const limit = Math.min(100, Math.max(1, count));

    const totalRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM scim_users WHERE tenant_id = $1`,
      [tenantId]
    );
    const totalResults = parseInt(totalRes.rows[0]?.count || '0', 10);

    const rowsRes = await pool.query<ScimUserRecord>(
      `SELECT * FROM scim_users WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults,
      startIndex,
      itemsPerPage: rowsRes.rows.length,
      Resources: rowsRes.rows.map(r => this.toScimResource(r))
    };
  }

  /**
   * Get single user by ID
   */
  public static async getUser(tenantId: string, id: string): Promise<ScimUserResource | null> {
    const pool = getPool();
    const res = await pool.query<ScimUserRecord>(
      `SELECT * FROM scim_users WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id]
    );

    if (res.rows.length === 0) return null;
    return this.toScimResource(res.rows[0]);
  }

  /**
   * Provision a new user via SCIM POST
   */
  public static async createUser(
    tenantId: string,
    payload: any,
    idpType = 'azure_ad'
  ): Promise<ScimUserResource> {
    const id = crypto.randomUUID();
    const externalId = payload.externalId || `ext_${crypto.randomUUID().slice(0, 8)}`;
    const userName = payload.userName || payload.emails?.[0]?.value || `user_${Date.now()}`;
    const email = payload.emails?.[0]?.value || payload.email || `${userName}@concession.om`;
    const displayName = payload.displayName || payload.name?.formatted || userName;
    const role = payload.roles?.[0]?.value || EnterpriseRole.FIELD_WORKER;
    const active = payload.active !== undefined ? Boolean(payload.active) : true;

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO scim_users (
          id, tenant_id, external_id, user_name, email, display_name,
          role, active, idp_type, meta, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (tenant_id, user_name) DO UPDATE SET
          external_id = EXCLUDED.external_id,
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          active = EXCLUDED.active,
          updated_at = NOW()`,
        [
          id,
          tenantId,
          externalId,
          userName,
          email,
          displayName,
          role,
          active,
          idpType,
          JSON.stringify({ rawScim: payload })
        ]
      );
    });

    const user = await this.getUser(tenantId, id);
    if (!user) throw new Error('SCIM Error: Failed to retrieve user after creation');
    return user;
  }

  /**
   * Replace user via SCIM PUT
   */
  public static async updateUser(
    tenantId: string,
    id: string,
    payload: any
  ): Promise<ScimUserResource | null> {
    const email = payload.emails?.[0]?.value || payload.email;
    const displayName = payload.displayName || payload.name?.formatted;
    const role = payload.roles?.[0]?.value;
    const active = payload.active !== undefined ? Boolean(payload.active) : undefined;

    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `UPDATE scim_users
         SET email = COALESCE($1, email),
             display_name = COALESCE($2, display_name),
             role = COALESCE($3, role),
             active = COALESCE($4, active),
             updated_at = NOW()
         WHERE tenant_id = $5 AND id = $6`,
        [email, displayName, role, active, tenantId, id]
      );
    });

    return this.getUser(tenantId, id);
  }

  /**
   * Patch user attributes (e.g., active: false on deprovisioning)
   */
  public static async patchUser(
    tenantId: string,
    id: string,
    patchOperations: any
  ): Promise<ScimUserResource | null> {
    const operations = Array.isArray(patchOperations.Operations) ? patchOperations.Operations : [];
    let newActive: boolean | undefined = undefined;

    for (const op of operations) {
      if (op.op?.toLowerCase() === 'replace') {
        if (op.value?.active !== undefined) {
          newActive = Boolean(op.value.active);
        } else if (typeof op.value === 'boolean' && op.path === 'active') {
          newActive = op.value;
        }
      }
    }

    if (newActive !== undefined) {
      await withTenantContext(tenantId, async (client) => {
        await client.query(
          `UPDATE scim_users SET active = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`,
          [newActive, tenantId, id]
        );
      });
    }

    return this.getUser(tenantId, id);
  }

  /**
   * Delete user (deactivates user per SCIM soft-delete standard)
   */
  public static async deleteUser(tenantId: string, id: string): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query(
      `UPDATE scim_users SET active = false, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id]
    );
    return (res.rowCount || 0) > 0;
  }
}
