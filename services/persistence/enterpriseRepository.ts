/**
 * Enterprise Repository Layer
 *
 * Implements server-side enterprise persistence with:
 * - Multi-tenant data segregation.
 * - Append-only hash-chained audit logging on every write.
 * - Server-side Segregation of Duties (SoD) invariant enforcement.
 * - Decoupled from browser localStorage (G-1 compliance).
 */

import { auditLedger } from '../hashChainedAuditLedger';
import { Incident } from '../../types';
import { Permit } from '../simopsService';
import { EnterpriseCapa, GULF_ENERGY_CAPAS, GULF_ENERGY_INCIDENTS, GULF_ENERGY_PERMITS } from '../demoDataLoader';
import { SafetyAudit } from '../../components/audit/AuditTypes';
import { MOCK_AUDITS } from '../../components/audit/AuditMockData';

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export class EnterpriseRepository {
  private static instance: EnterpriseRepository;

  // In-memory tenant stores backed by durable audit ledger
  private incidents: Map<string, Map<string, Incident>> = new Map();
  private permits: Map<string, Map<string, Permit>> = new Map();
  private capas: Map<string, Map<string, EnterpriseCapa>> = new Map();
  private audits: Map<string, Map<string, SafetyAudit>> = new Map();

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): EnterpriseRepository {
    if (!EnterpriseRepository.instance) {
      EnterpriseRepository.instance = new EnterpriseRepository();
    }
    return EnterpriseRepository.instance;
  }

  private seedDefaultData(): void {
    const defaultTenant = DEFAULT_TENANT_ID;

    // Seed incidents
    const incidentMap = new Map<string, Incident>();
    for (const inc of GULF_ENERGY_INCIDENTS) {
      incidentMap.set(inc.id, { ...inc });
    }
    this.incidents.set(defaultTenant, incidentMap);

    // Seed permits
    const permitMap = new Map<string, Permit>();
    for (const p of GULF_ENERGY_PERMITS) {
      permitMap.set(p.id, { ...p });
    }
    this.permits.set(defaultTenant, permitMap);

    // Seed CAPAs
    const capaMap = new Map<string, EnterpriseCapa>();
    for (const c of GULF_ENERGY_CAPAS) {
      capaMap.set(c.id, { ...c });
    }
    this.capas.set(defaultTenant, capaMap);

    // Seed Audits
    const auditMap = new Map<string, SafetyAudit>();
    for (const a of MOCK_AUDITS) {
      auditMap.set(a.id, { ...a });
    }
    this.audits.set(defaultTenant, auditMap);

    console.log('[EnterpriseRepository] Initialized multi-tenant repository with baseline GCC enterprise records.');
  }

  private getTenantMap<T>(store: Map<string, Map<string, T>>, tenantId: string): Map<string, T> {
    let map = store.get(tenantId);
    if (!map) {
      map = new Map<string, T>();
      store.set(tenantId, map);
    }
    return map;
  }

  // ==========================================
  // INCIDENTS
  // ==========================================
  public async getIncidents(tenantId: string = DEFAULT_TENANT_ID): Promise<Incident[]> {
    const map = this.getTenantMap(this.incidents, tenantId);
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async getIncidentById(id: string, tenantId: string = DEFAULT_TENANT_ID): Promise<Incident | null> {
    const map = this.getTenantMap(this.incidents, tenantId);
    return map.get(id) || null;
  }

  public async saveIncident(
    incident: Incident,
    actor: { id: string; name: string; role: string },
    tenantId: string = DEFAULT_TENANT_ID
  ): Promise<Incident> {
    const map = this.getTenantMap(this.incidents, tenantId);
    const isNew = !map.has(incident.id);
    const existing = map.get(incident.id);

    const updatedIncident: Incident = {
      ...existing,
      ...incident,
      id: incident.id || `INC-${new Date().getFullYear()}-OMN-${Math.floor(1000 + Math.random() * 9000)}`
    };

    map.set(updatedIncident.id, updatedIncident);

    // Record in hash-chained audit ledger
    await auditLedger.append({
      tenantId,
      actorId: actor.id || actor.name,
      actorRole: actor.role,
      action: isNew ? 'INCIDENT_CREATED' : 'INCIDENT_UPDATED',
      entityType: 'Incident',
      entityId: updatedIncident.id,
      payload: {
        title: (updatedIncident as any).title || updatedIncident.type,
        severity: updatedIncident.severity,
        status: updatedIncident.status,
        type: updatedIncident.type,
        location: updatedIncident.location
      }
    });

    return updatedIncident;
  }

  // ==========================================
  // PERMITS & SOD ENFORCEMENT
  // ==========================================
  public async getPermits(tenantId: string = DEFAULT_TENANT_ID): Promise<Permit[]> {
    const map = this.getTenantMap(this.permits, tenantId);
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
    );
  }

  public async getPermitById(id: string, tenantId: string = DEFAULT_TENANT_ID): Promise<Permit | null> {
    const map = this.getTenantMap(this.permits, tenantId);
    return map.get(id) || null;
  }

  public async savePermit(
    permit: Permit,
    actor: { id: string; name: string; role: string },
    tenantId: string = DEFAULT_TENANT_ID
  ): Promise<Permit> {
    const map = this.getTenantMap(this.permits, tenantId);

    // HARD SOD ENFORCEMENT: Permit Receiver cannot self-authorize as Area Authority / Issuer
    if (
      permit.issuerSignature?.signed &&
      permit.receiverSignature?.signed &&
      (permit.issuerSignature.signatoryName.trim().toLowerCase() === permit.receiverSignature.signatoryName.trim().toLowerCase() ||
       (permit as any).issuerId === (permit as any).receiverId)
    ) {
      throw new Error(
        'Segregation of Duties (SoD) Invariant Violation: The Permit Receiver cannot self-authorize as the Permit Issuer/Area Authority.'
      );
    }

    const isNew = !map.has(permit.id);
    const existing = map.get(permit.id);

    const updatedPermit: Permit = {
      ...existing,
      ...permit,
      id: permit.id || `ptw-${Date.now()}`
    };

    map.set(updatedPermit.id, updatedPermit);

    await auditLedger.append({
      tenantId,
      actorId: actor.id || actor.name,
      actorRole: actor.role,
      action: isNew ? 'PERMIT_CREATED' : 'PERMIT_UPDATED',
      entityType: 'PermitToWork',
      entityId: updatedPermit.id,
      payload: {
        permitNumber: updatedPermit.permitNumber,
        type: updatedPermit.type,
        status: updatedPermit.status,
        zone: updatedPermit.zone,
        riskRating: updatedPermit.riskRating,
        issuer: updatedPermit.issuerSignature?.signatoryName,
        receiver: updatedPermit.receiverSignature?.signatoryName
      }
    });

    return updatedPermit;
  }

  // ==========================================
  // CAPAS & SOD ENFORCEMENT
  // ==========================================
  public async getCapas(tenantId: string = DEFAULT_TENANT_ID): Promise<EnterpriseCapa[]> {
    const map = this.getTenantMap(this.capas, tenantId);
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }

  public async getCapaById(id: string, tenantId: string = DEFAULT_TENANT_ID): Promise<EnterpriseCapa | null> {
    const map = this.getTenantMap(this.capas, tenantId);
    return map.get(id) || null;
  }

  public async saveCapa(
    capa: EnterpriseCapa,
    actor: { id: string; name: string; role: string },
    tenantId: string = DEFAULT_TENANT_ID
  ): Promise<EnterpriseCapa> {
    const map = this.getTenantMap(this.capas, tenantId);
    const existing = map.get(capa.id);

    // HARD SOD ENFORCEMENT: Action Owner cannot verify and close their own action
    if (capa.status === 'Closed' || (capa as any).verifiedBy) {
      const ownerName = (capa.ownerName || existing?.ownerName || '').trim().toLowerCase();
      const verifierName = ((capa as any).verifiedByName || (capa as any).verifiedBy || actor.name || '').trim().toLowerCase();
      const ownerId = (capa as any).ownerId || (capa as any).assigneeId || existing?.ownerName;
      const verifierId = actor.id || (capa as any).verifierId;

      if ((ownerName && verifierName && ownerName === verifierName) || (ownerId && verifierId && ownerId === verifierId)) {
        throw new Error(
          'Segregation of Duties (SoD) Invariant Violation: The Action Owner cannot verify and close their own corrective action.'
        );
      }
    }

    const isNew = !map.has(capa.id);
    const updatedCapa: EnterpriseCapa = {
      ...existing,
      ...capa,
      id: capa.id || `capa-${Date.now()}`
    };

    map.set(updatedCapa.id, updatedCapa);

    await auditLedger.append({
      tenantId,
      actorId: actor.id || actor.name,
      actorRole: actor.role,
      action: isNew ? 'CAPA_CREATED' : 'CAPA_UPDATED',
      entityType: 'CAPA',
      entityId: updatedCapa.id,
      payload: {
        title: updatedCapa.title,
        priority: updatedCapa.priority,
        status: updatedCapa.status,
        owner: updatedCapa.ownerName,
        dueDate: updatedCapa.dueDate
      }
    });

    return updatedCapa;
  }

  // ==========================================
  // AUDITS
  // ==========================================
  public async getAudits(tenantId: string = DEFAULT_TENANT_ID): Promise<SafetyAudit[]> {
    const map = this.getTenantMap(this.audits, tenantId);
    return Array.from(map.values());
  }

  public async getAuditById(id: string, tenantId: string = DEFAULT_TENANT_ID): Promise<SafetyAudit | null> {
    const map = this.getTenantMap(this.audits, tenantId);
    return map.get(id) || null;
  }

  public async saveAudit(
    audit: SafetyAudit,
    actor: { id: string; name: string; role: string },
    tenantId: string = DEFAULT_TENANT_ID
  ): Promise<SafetyAudit> {
    const map = this.getTenantMap(this.audits, tenantId);
    const isNew = !map.has(audit.id);
    const existing = map.get(audit.id);

    const updatedAudit: SafetyAudit = {
      ...existing,
      ...audit,
      id: audit.id || `AUD-${Date.now()}`
    };

    map.set(updatedAudit.id, updatedAudit);

    await auditLedger.append({
      tenantId,
      actorId: actor.id || actor.name,
      actorRole: actor.role,
      action: isNew ? 'AUDIT_CREATED' : 'AUDIT_UPDATED',
      entityType: 'Audit',
      entityId: updatedAudit.id,
      payload: {
        title: updatedAudit.title,
        status: updatedAudit.status,
        score: updatedAudit.score,
        auditor: updatedAudit.auditorName
      }
    });

    return updatedAudit;
  }
}

export const enterpriseRepo = EnterpriseRepository.getInstance();
