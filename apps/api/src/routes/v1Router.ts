/**
 * Phase 1 REST API Router (/api/v1)
 *
 * Implements Zod-validated, paginated CRUD endpoints with consistent envelope:
 * - /health/ready (PostgreSQL connectivity check)
 * - /import/localstorage (One-time migration importer)
 * - /incidents
 * - /capas
 * - /permits
 * - /inspections
 * - /observations
 * - /contractors
 * - /documents
 * - /training
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { checkDatabaseHealth } from '../db/connection';
import {
  incidentRepository,
  capaRepository,
  permitRepository,
  inspectionRepository,
  observationRepository,
  contractorRepository,
  documentRepository,
  trainingRepository,
  migrationImporterRepository
} from '../repositories';

export const v1Router = Router();

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

function getTenantId(req: Request): string {
  const header = req.headers['x-tenant-id'];
  if (Array.isArray(header)) return header[0] || DEFAULT_TENANT_ID;
  return header || DEFAULT_TENANT_ID;
}

function parsePagination(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function sendSuccess(res: Response, data: any, statusCode: number = 200, pagination?: { page: number; limit: number; total: number }) {
  if (pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages
      }
    });
  }
  return res.status(statusCode).json({
    success: true,
    data
  });
}

function sendError(res: Response, code: string, message: string, statusCode: number = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
}

// =============================================================================
// HEALTH / READY (PostgreSQL connectivity)
// =============================================================================
v1Router.get('/health/ready', async (req: Request, res: Response) => {
  const health = await checkDatabaseHealth();
  if (health.connected) {
    return res.status(200).json({
      status: 'ready',
      database: health
    });
  }
  return res.status(503).json({
    status: 'unready',
    database: health
  });
});

// =============================================================================
// ONE-TIME LOCALSTORAGE DATA MIGRATION
// =============================================================================
const LocalStorageImportSchema = z.object({
  incidents: z.array(z.any()).optional(),
  permits: z.array(z.any()).optional(),
  capas: z.array(z.any()).optional(),
  inspections: z.array(z.any()).optional(),
  contractors: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),
  training: z.array(z.any()).optional(),
  clientStorageVersion: z.string().optional()
});

v1Router.post('/import/localstorage', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = LocalStorageImportSchema.parse(req.body);
    const result = await migrationImporterRepository.importLegacyPayload(tenantId, parsed);
    return sendSuccess(res, result, 200);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid migration payload', 400, err.issues);
    }
    return sendError(res, 'IMPORT_FAILED', err.message, 500);
  }
});

// =============================================================================
// INCIDENTS CRUD
// =============================================================================
const IncidentCreateSchema = z.object({
  id: z.string().optional(),
  incident_number: z.string().optional(),
  title: z.string().min(3),
  description: z.string().default(''),
  severity: z.string(),
  status: z.string().default('Open'),
  location: z.string().min(2),
  incident_timestamp: z.string().optional(),
  form_g_submitted: z.boolean().optional(),
  form_g_receipt_number: z.string().optional(),
  form_g_deadline: z.string().optional(),
  details: z.record(z.string(), z.any()).optional()
});

v1Router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const status = req.query.status as string;
    const severity = req.query.severity as string;

    const { items, total } = await incidentRepository.findMany(tenantId, { limit, offset, status, severity });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await incidentRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Incident not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/incidents', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = IncidentCreateSchema.parse(req.body);
    const created = await incidentRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = IncidentCreateSchema.partial().parse(req.body);
    const updated = await incidentRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Incident not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await incidentRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Incident not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// CAPAS CRUD (Segregation of Duties enforcement)
// =============================================================================
const CapaCreateSchema = z.object({
  id: z.string().optional(),
  action_number: z.string().optional(),
  title: z.string().min(3),
  description: z.string().default(''),
  priority: z.string().default('P2 - High'),
  status: z.string().default('Open'),
  owner_name: z.string().min(2),
  verified_by_name: z.string().optional(),
  due_date: z.string(),
  hierarchy: z.string().default('Engineering'),
  details: z.record(z.string(), z.any()).optional()
});

v1Router.get('/capas', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const status = req.query.status as string;
    const priority = req.query.priority as string;

    const { items, total } = await capaRepository.findMany(tenantId, { limit, offset, status, priority });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/capas/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await capaRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'CAPA not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/capas', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = CapaCreateSchema.parse(req.body);
    const created = await capaRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    if (err.message.includes('Segregation of Duties')) {
      return sendError(res, 'FORBIDDEN_SOD', err.message, 403);
    }
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/capas/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = CapaCreateSchema.partial().parse(req.body);
    const updated = await capaRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'CAPA not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    if (err.message.includes('Segregation of Duties')) {
      return sendError(res, 'FORBIDDEN_SOD', err.message, 403);
    }
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/capas/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await capaRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'CAPA not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// PERMITS CRUD (Segregation of Duties enforcement)
// =============================================================================
const PermitCreateSchema = z.object({
  id: z.string().optional(),
  permit_number: z.string().optional(),
  permit_type: z.string(),
  status: z.string().default('Pending'),
  zone: z.string().default('General Area'),
  exact_location: z.string().min(2),
  valid_from: z.string().optional(),
  valid_to: z.string(),
  issuer_name: z.string().optional(),
  receiver_name: z.string().optional(),
  issuer_signature: z.any().optional(),
  receiver_signature: z.any().optional(),
  details: z.record(z.string(), z.any()).optional()
});

v1Router.get('/permits', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const status = req.query.status as string;
    const permit_type = req.query.permit_type as string;

    const { items, total } = await permitRepository.findMany(tenantId, { limit, offset, status, permit_type });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/permits/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await permitRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Permit not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/permits', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = PermitCreateSchema.parse(req.body);
    const created = await permitRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    if (err.message.includes('Segregation of Duties')) {
      return sendError(res, 'FORBIDDEN_SOD', err.message, 403);
    }
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/permits/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = PermitCreateSchema.partial().parse(req.body);
    const updated = await permitRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Permit not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    if (err.message.includes('Segregation of Duties')) {
      return sendError(res, 'FORBIDDEN_SOD', err.message, 403);
    }
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/permits/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await permitRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Permit not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// INSPECTIONS CRUD
// =============================================================================
const InspectionCreateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  template_type: z.string(),
  site_name: z.string(),
  inspector_name: z.string(),
  status: z.string().default('Scheduled'),
  score: z.number().optional(),
  completed_at: z.string().optional(),
  details: z.record(z.string(), z.any()).optional()
});

v1Router.get('/inspections', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const status = req.query.status as string;

    const { items, total } = await inspectionRepository.findMany(tenantId, { limit, offset, status });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/inspections/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await inspectionRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Inspection not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/inspections', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = InspectionCreateSchema.parse(req.body);
    const created = await inspectionRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/inspections/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = InspectionCreateSchema.partial().parse(req.body);
    const updated = await inspectionRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Inspection not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/inspections/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await inspectionRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Inspection not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// OBSERVATIONS CRUD
// =============================================================================
const ObservationCreateSchema = z.object({
  id: z.string().optional(),
  observation_number: z.string().optional(),
  observer_name: z.string().min(2),
  observation_type: z.string(),
  location: z.string(),
  description: z.string().min(3),
  immediate_action: z.string().optional(),
  status: z.string().default('Logged')
});

v1Router.get('/observations', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const status = req.query.status as string;
    const observation_type = req.query.observation_type as string;

    const { items, total } = await observationRepository.findMany(tenantId, { limit, offset, status, observation_type });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/observations/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await observationRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Observation not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/observations', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = ObservationCreateSchema.parse(req.body);
    const created = await observationRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/observations/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = ObservationCreateSchema.partial().parse(req.body);
    const updated = await observationRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Observation not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/observations/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await observationRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Observation not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// CONTRACTORS CRUD
// =============================================================================
const ContractorCreateSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(2),
  trade: z.string(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  compliance_status: z.string().default('Approved'),
  cr_number: z.string().optional()
});

v1Router.get('/contractors', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const compliance_status = req.query.compliance_status as string;
    const trade = req.query.trade as string;

    const { items, total } = await contractorRepository.findMany(tenantId, { limit, offset, compliance_status, trade });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/contractors/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await contractorRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Contractor not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/contractors', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = ContractorCreateSchema.parse(req.body);
    const created = await contractorRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/contractors/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = ContractorCreateSchema.partial().parse(req.body);
    const updated = await contractorRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Contractor not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/contractors/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await contractorRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Contractor not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// DOCUMENTS CRUD
// =============================================================================
const DocumentCreateSchema = z.object({
  id: z.string().optional(),
  doc_number: z.string().optional(),
  title: z.string().min(3),
  category: z.string(),
  status: z.string().default('Active'),
  current_version: z.string().default('1.0'),
  owner_name: z.string(),
  file_url: z.string()
});

v1Router.get('/documents', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const category = req.query.category as string;
    const status = req.query.status as string;

    const { items, total } = await documentRepository.findMany(tenantId, { limit, offset, category, status });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/documents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await documentRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Document not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/documents', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = DocumentCreateSchema.parse(req.body);
    const created = await documentRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/documents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = DocumentCreateSchema.partial().parse(req.body);
    const updated = await documentRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Document not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await documentRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Document not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

// =============================================================================
// TRAINING RECORDS CRUD
// =============================================================================
const TrainingCreateSchema = z.object({
  id: z.string().optional(),
  course_title: z.string().min(3),
  course_code: z.string(),
  trainee_name: z.string(),
  civil_id: z.string(),
  completion_date: z.string(),
  expiry_date: z.string().optional(),
  score: z.number().optional(),
  certificate_url: z.string().optional()
});

v1Router.get('/training', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { page, limit, offset } = parsePagination(req);
    const course_code = req.query.course_code as string;
    const trainee_name = req.query.trainee_name as string;

    const { items, total } = await trainingRepository.findMany(tenantId, { limit, offset, course_code, trainee_name });
    return sendSuccess(res, items, 200, { page, limit, total });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.get('/training/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await trainingRepository.findById(tenantId, id);
    if (!item) return sendError(res, 'NOT_FOUND', 'Training record not found', 404);
    return sendSuccess(res, item);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.post('/training', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const parsed = TrainingCreateSchema.parse(req.body);
    const created = await trainingRepository.create(tenantId, parsed as any);
    return sendSuccess(res, created, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.put('/training/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = TrainingCreateSchema.partial().parse(req.body);
    const updated = await trainingRepository.update(tenantId, id, parsed as any);
    if (!updated) return sendError(res, 'NOT_FOUND', 'Training record not found', 404);
    return sendSuccess(res, updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return sendError(res, 'VALIDATION_ERROR', 'Validation error', 400, err.issues);
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});

v1Router.delete('/training/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await trainingRepository.delete(tenantId, id);
    if (!deleted) return sendError(res, 'NOT_FOUND', 'Training record not found', 404);
    return sendSuccess(res, { deleted: true });
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err.message, 500);
  }
});
