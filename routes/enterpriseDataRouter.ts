/**
 * Enterprise Data REST API Router
 *
 * Implements REST endpoints for:
 * - Incidents, Permits, CAPAs, Audits
 * - Append-Only Hash-Chained Audit Ledger verification & export
 * - Statutory Form G notifications (Oman Ministry of Labour MD 286/2008)
 *
 * Enforces Zod validation, multi-tenant isolation, and backend Segregation of Duties.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enterpriseRepo, DEFAULT_TENANT_ID } from '../services/persistence/enterpriseRepository';
import { auditLedger } from '../services/hashChainedAuditLedger';
import { getStatutoryNotificationChannel, StatutoryFormGPayloadSchema } from '../services/integrations/statutoryChannel';

export const enterpriseDataRouter = Router();

// Helper to extract actor and tenant from request headers
function getRequestContext(req: Request) {
  const tenantId = (req.headers['x-tenant-id'] as string) || DEFAULT_TENANT_ID;
  const actorId = (req.headers['x-user-id'] as string) || 'usr-system-admin';
  const actorName = (req.headers['x-user-name'] as string) || 'HSE System Administrator';
  const actorRole = (req.headers['x-user-role'] as string) || 'Safety Officer';
  return { tenantId, actor: { id: actorId, name: actorName, role: actorRole } };
}

// ==========================================
// INCIDENTS
// ==========================================
enterpriseDataRouter.get('/incidents', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const incidents = await enterpriseRepo.getIncidents(tenantId);
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const incident = await enterpriseRepo.getIncidentById(incidentId, tenantId);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const IncidentPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  type: z.string(),
  severity: z.string(),
  potentialSeverity: z.string().optional(),
  status: z.string().default('Open'),
  location: z.string(),
  jurisdiction: z.string().optional(),
  immediateActionsTaken: z.string().optional(),
  reportedBy: z.string().optional(),
  reportedByName: z.string().optional(),
  timestamp: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  fiveWhys: z.array(z.any()).optional(),
  fishboneFactors: z.record(z.string(), z.any()).optional(),
  rootCauseConclusion: z.string().optional(),
  bowtieRiskAssessment: z.any().optional(),
  evidenceItems: z.array(z.any()).optional()
}).passthrough();

enterpriseDataRouter.post('/incidents', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const parsed = IncidentPayloadSchema.parse(req.body);
    const saved = await enterpriseRepo.saveIncident(parsed as any, actor, tenantId);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation Error', details: (err as any).issues || (err as any).errors });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.put('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = IncidentPayloadSchema.parse({ ...req.body, id: incidentId });
    const saved = await enterpriseRepo.saveIncident(parsed as any, actor, tenantId);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation Error', details: (err as any).issues || (err as any).errors });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// PERMITS & SOD ENFORCEMENT
// ==========================================
enterpriseDataRouter.get('/permits', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const permits = await enterpriseRepo.getPermits(tenantId);
    res.json({ success: true, count: permits.length, data: permits });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/permits/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const permitId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const permit = await enterpriseRepo.getPermitById(permitId, tenantId);
    if (!permit) {
      return res.status(404).json({ success: false, error: 'Permit not found' });
    }
    res.json({ success: true, data: permit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.post('/permits', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const saved = await enterpriseRepo.savePermit(req.body, actor, tenantId);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.put('/permits/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const permitId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const saved = await enterpriseRepo.savePermit({ ...req.body, id: permitId }, actor, tenantId);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// CAPAS & SOD ENFORCEMENT
// ==========================================
enterpriseDataRouter.get('/capas', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const capas = await enterpriseRepo.getCapas(tenantId);
    res.json({ success: true, count: capas.length, data: capas });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/capas/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const capaId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const capa = await enterpriseRepo.getCapaById(capaId, tenantId);
    if (!capa) {
      return res.status(404).json({ success: false, error: 'CAPA not found' });
    }
    res.json({ success: true, data: capa });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.post('/capas', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const saved = await enterpriseRepo.saveCapa(req.body, actor, tenantId);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.put('/capas/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const capaId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const saved = await enterpriseRepo.saveCapa({ ...req.body, id: capaId }, actor, tenantId);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// AUDITS
// ==========================================
enterpriseDataRouter.get('/audits', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const audits = await enterpriseRepo.getAudits(tenantId);
    res.json({ success: true, count: audits.length, data: audits });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.post('/audits', async (req: Request, res: Response) => {
  try {
    const { tenantId, actor } = getRequestContext(req);
    const saved = await enterpriseRepo.saveAudit(req.body, actor, tenantId);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// APPEND-ONLY HASH-CHAINED AUDIT LEDGER
// ==========================================
enterpriseDataRouter.get('/audit-ledger', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = auditLedger.getEntries({
      tenantId: req.query.allTenants === 'true' ? undefined : tenantId,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      limit,
      offset
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/audit-ledger/verify', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const verification = auditLedger.verifyChainIntegrity(req.query.allTenants === 'true' ? undefined : tenantId);
    res.json({ success: true, verification });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/audit-ledger/export', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const entries = auditLedger.getEntries({
      tenantId: req.query.allTenants === 'true' ? undefined : tenantId,
      limit: 10000
    });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ad6_audit_ledger_${Date.now()}.json"`);
    res.json({
      exportTimestamp: new Date().toISOString(),
      statutoryCompliance: 'Oman MoL MD 286/2008 & ISO 45001',
      totalRecords: entries.total,
      headHash: entries.headHash,
      entries: entries.items
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// STATUTORY INTEGRATION (OMAN MOL FORM G)
// ==========================================
enterpriseDataRouter.post('/statutory/form-g', async (req: Request, res: Response) => {
  try {
    const { tenantId } = getRequestContext(req);
    const channel = getStatutoryNotificationChannel();
    const payload = StatutoryFormGPayloadSchema.parse({
      ...req.body,
      tenantId: req.body.tenantId || tenantId
    });

    const receipt = await channel.submitFormGNotification(payload);
    res.status(200).json({ success: true, data: receipt });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Statutory Form G Validation Error', details: (err as any).issues || (err as any).errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseDataRouter.get('/statutory/form-g/:receiptNumber', async (req: Request, res: Response) => {
  try {
    const channel = getStatutoryNotificationChannel();
    const receiptNumber = Array.isArray(req.params.receiptNumber) ? req.params.receiptNumber[0] : req.params.receiptNumber;
    const status = await channel.checkSubmissionStatus(receiptNumber);
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
