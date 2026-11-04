/**
 * Subject Access Request (SAR) Service
 * 
 * Target Standards:
 * - Sultanate of Oman Personal Data Protection Law (RD 6/2022) Articles 18 & 19
 * - Saudi Arabia Personal Data Protection Law (Royal Decree M/19) Article 4
 * - ISO/IEC 27701 (Privacy Information Management)
 * 
 * Compiles a machine-readable, comprehensive data portability bundle for a data subject.
 */

import { withTenantContext } from '../db/connection.js';
import { FieldEncryption } from './fieldEncryption.js';
import { writeAudit } from '../audit/writeAudit.js';
import crypto from 'node:crypto';

export interface SubjectAccessBundle {
  requestId: string;
  tenantId: string;
  generatedAt: string;
  subjectIdentifier: string;
  complianceStandard: string;
  identity: Record<string, any> | null;
  scimIdentities: Record<string, any>[];
  competencies: Record<string, any>[];
  incidentsReported: Record<string, any>[];
  permitsAsReceiver: Record<string, any>[];
  permitsAsIssuer: Record<string, any>[];
  capasOwned: Record<string, any>[];
  capasVerified: Record<string, any>[];
  auditActivityTrail: Record<string, any>[];
}

export class SubjectAccessService {
  /**
   * Generates a complete machine-readable bundle of personal data associated with a subject.
   */
  public static async generateSubjectAccessBundle(
    tenantId: string,
    subjectIdentifier: string, // UUID or Email or Civil ID
    actorId?: string
  ): Promise<SubjectAccessBundle> {
    const requestId = crypto.randomUUID();
    let identity: Record<string, any> | null = null;
    let scimIdentities: Record<string, any>[] = [];
    let competencies: Record<string, any>[] = [];
    let incidentsReported: Record<string, any>[] = [];
    let permitsAsReceiver: Record<string, any>[] = [];
    let permitsAsIssuer: Record<string, any>[] = [];
    let capasOwned: Record<string, any>[] = [];
    let capasVerified: Record<string, any>[] = [];
    let auditActivityTrail: Record<string, any>[] = [];

    await withTenantContext(tenantId, async (client) => {
      // 1. Identity lookup
      const userRes = await client.query(
        `SELECT id, email, full_name, role, department, sso_subject_id, created_at, updated_at
         FROM users
         WHERE tenant_id = $1 AND (id::text = $2 OR email = $2 OR sso_subject_id = $2)`,
        [tenantId, subjectIdentifier]
      );
      if (userRes.rows.length > 0) {
        identity = userRes.rows[0];
      }

      // 2. SCIM Identities
      const scimRes = await client.query(
        `SELECT id, external_id, user_name, email, display_name, role, active, idp_type, meta, created_at
         FROM scim_users
         WHERE tenant_id = $1 AND (id::text = $2 OR email = $2 OR user_name = $2 OR external_id = $2)`,
        [tenantId, subjectIdentifier]
      );
      scimIdentities = scimRes.rows;

      const userName = identity?.full_name || (scimIdentities[0]?.display_name) || subjectIdentifier;
      const userEmail = identity?.email || (scimIdentities[0]?.email) || subjectIdentifier;
      const userId = identity?.id || subjectIdentifier;

      // 3. Competency Records
      const compRes = await client.query(
        `SELECT * FROM competency_records
         WHERE tenant_id = $1 AND (worker_name = $2 OR civil_id = $2)`,
        [tenantId, userName]
      );
      competencies = compRes.rows;

      // 4. Incidents (reported by user or mentioning user)
      const incRes = await client.query(
        `SELECT * FROM incidents WHERE tenant_id = $1`,
        [tenantId]
      );
      for (const row of incRes.rows) {
        const details = typeof row.details === 'object' ? row.details : {};
        if (
          row.reported_by === userId ||
          row.reported_by === userEmail ||
          details.reported_by === userName ||
          details.reporter_name === userName ||
          details.injured_worker === userName ||
          details.national_id === subjectIdentifier
        ) {
          const unprotected = await FieldEncryption.unprotectIncidentPayload(row);
          incidentsReported.push(unprotected);
        }
      }

      // 5. Permits
      const permitRecRes = await client.query(
        `SELECT * FROM permits WHERE tenant_id = $1 AND receiver_name = $2`,
        [tenantId, userName]
      );
      permitsAsReceiver = permitRecRes.rows;

      const permitIssRes = await client.query(
        `SELECT * FROM permits WHERE tenant_id = $1 AND issuer_name = $2`,
        [tenantId, userName]
      );
      permitsAsIssuer = permitIssRes.rows;

      // 6. CAPAs
      const capaOwnRes = await client.query(
        `SELECT * FROM capas WHERE tenant_id = $1 AND owner_name = $2`,
        [tenantId, userName]
      );
      capasOwned = capaOwnRes.rows;

      const capaVerRes = await client.query(
        `SELECT * FROM capas WHERE tenant_id = $1 AND verified_by_name = $2`,
        [tenantId, userName]
      );
      capasVerified = capaVerRes.rows;

      // 7. Audit activities
      const auditRes = await client.query(
        `SELECT id, actor_id, actor_role, action, entity_type, entity_id, timestamp, metadata
         FROM audit_log
         WHERE tenant_id = $1 AND actor_id = $2
         ORDER BY timestamp DESC LIMIT 50`,
        [tenantId, userId]
      );
      auditActivityTrail = auditRes.rows;

      // Store in data_subject_requests table
      await client.query(
        `INSERT INTO data_subject_requests (
           id, tenant_id, subject_id, subject_email, request_type, status, export_payload, completed_at
         ) VALUES ($1, $2, $3, $4, 'ACCESS', 'COMPLETED', $5, NOW())`,
        [
          requestId,
          tenantId,
          userId,
          userEmail,
          JSON.stringify({
            itemCount: competencies.length + incidentsReported.length + permitsAsReceiver.length + capasOwned.length,
            requestedAt: new Date().toISOString()
          })
        ]
      );
    });

    const bundle: SubjectAccessBundle = {
      requestId,
      tenantId,
      generatedAt: new Date().toISOString(),
      subjectIdentifier,
      complianceStandard: 'Oman RD 6/2022 PDPL & Saudi PDPL Article 4',
      identity,
      scimIdentities,
      competencies,
      incidentsReported,
      permitsAsReceiver,
      permitsAsIssuer,
      capasOwned,
      capasVerified,
      auditActivityTrail
    };

    // Log to immutable audit trail
    await writeAudit({
      tenantId,
      actorId: actorId || '00000000-0000-0000-0000-000000000000',
      action: 'SAR_EXPORT_GENERATED',
      entityType: 'subject_access_request',
      entityId: requestId,
      metadata: {
        severity: 'SECURITY',
        subjectIdentifier,
        recordsReturned: {
          scim: scimIdentities.length,
          competencies: competencies.length,
          incidents: incidentsReported.length,
          permits: permitsAsReceiver.length + permitsAsIssuer.length,
          capas: capasOwned.length + capasVerified.length
        }
      }
    });

    return bundle;
  }
}
