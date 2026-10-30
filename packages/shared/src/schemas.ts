/**
 * AD6.Ai Smart HSE Platform — Shared Zod Validation Schemas
 * Compliant with Sultanate of Oman Ministry of Labour MD 286/2008 & Royal Decree 53/2023
 */

import { z } from 'zod';

export const IncidentClassificationEnum = z.enum([
  'FATALITY',
  'PERMANENT_DISABILITY',
  'LOST_TIME_INJURY',
  'MAJOR_FIRE_EXPLOSION',
  'DANGEROUS_OCCURRENCE',
  'NEAR_MISS',
  'ENVIRONMENTAL_SPILL',
  'FIRST_AID',
]);

export const IncidentSeverityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const StatutoryFormGSchema = z.object({
  tenantId: z.string().min(1),
  incidentId: z.string().min(1),
  incidentNumber: z.string().min(1),
  companyCommercialRegNo: z.string().min(3),
  companyName: z.string().min(2),
  facilityLocation: z.string().min(3),
  concessionBlockOrWilayat: z.string().min(2),
  incidentTimestamp: z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid ISO date timestamp' }),
  incidentClassification: z.enum([
    'FATALITY',
    'PERMANENT_DISABILITY',
    'LOST_TIME_INJURY',
    'MAJOR_FIRE_EXPLOSION',
    'DANGEROUS_OCCURRENCE'
  ]),
  injuredWorkerName: z.string().optional(),
  injuredWorkerCivilIdOrPassport: z.string().optional(),
  injuredWorkerNationality: z.string().optional(),
  medicalFacilityTransferredTo: z.string().optional(),
  briefCircumstances: z.string().min(10),
  submittingOfficerName: z.string().min(2),
  submittingOfficerRole: z.string().min(2),
  submittingOfficerPhone: z.string().min(6),
  emergencyServicesNotified: z.boolean(),
  evidenceUrls: z.array(z.string().url()).optional()
});

export const PermitSchema = z.object({
  id: z.string(),
  permitNumber: z.string(),
  title: z.string(),
  type: z.string(),
  status: z.enum(['Draft', 'Requested', 'Pending', 'Authorized', 'Active', 'Suspended', 'Closed', 'Archived']),
  zone: z.string(),
  exactLocation: z.string(),
  contractor: z.string(),
  crewSize: z.number().int().positive(),
  riskScore: z.number().int(),
  riskRating: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
  issuerSignature: z.object({
    signed: z.boolean(),
    signatoryName: z.string().optional(),
    signatoryRole: z.string().optional(),
    timestamp: z.string().optional()
  }).optional(),
  receiverSignature: z.object({
    signed: z.boolean(),
    signatoryName: z.string().optional(),
    signatoryRole: z.string().optional(),
    timestamp: z.string().optional()
  }).optional(),
  simopsClashLocked: z.boolean().optional()
});

export const CapaSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  sourceType: z.string(),
  sourceId: z.string(),
  siteName: z.string(),
  ownerName: z.string().min(1),
  priority: z.enum(['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low']),
  status: z.enum(['Open', 'In-Progress', 'Pending Verification', 'Closed', 'Overdue']),
  dueDate: z.string(),
  countdownText: z.string().optional(),
  isOverdue: z.boolean().optional(),
  hierarchy: z.string(),
  details: z.string(),
  verifiedByName: z.string().optional()
});
