/**
 * AI Confirmation Gate Middleware (Phase 5 - Gap G4)
 *
 * Enforces mandatory human confirmation on safety-critical endpoints
 * (Incident Classification, RCA, Voice extraction, Regulatory citations)
 * at the API layer.
 */

import { Request, Response, NextFunction } from 'express';
import { AiSafetyService } from '../ai/aiSafetyService.js';

export function requireAiGate(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req as any).user?.tenantId || '00000000-0000-0000-0000-000000000001';
      const actor = (req as any).user?.name || (req.headers['x-user-name'] as string) || 'anonymous';
      const actorRole = (req as any).user?.role || (req.headers['x-user-role'] as string) || 'field_worker';
      const entityId = req.params?.id || (req.body && req.body.id);

      await AiSafetyService.verifyConfirmationGate({
        tenantId,
        aiOutputId: req.body?.ai_output_id || req.body?.metadata?.ai_output_id,
        isAiGenerated: req.body?.is_ai_generated || req.body?.is_ai_draft || req.headers['x-ai-draft'] === 'true',
        actor,
        actorRole,
        entityType,
        entityId,
        payload: req.body
      });

      next();
    } catch (err: any) {
      if (err.code === 'AI_CONFIRMATION_REQUIRED' || err.statusCode === 403) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AI_CONFIRMATION_REQUIRED',
            message: err.message
          }
        });
      }
      next(err);
    }
  };
}
