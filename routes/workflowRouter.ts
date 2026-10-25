import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { Namespace, Socket } from 'socket.io';
import { z } from 'zod';
import { getRoleChain, roleRankInChain } from '../config/workflowRules';
import { WorkflowService } from '../services/workflowService';
import { WORKFLOW_DEMO_SUPERVISION, WORKFLOW_DEMO_USERS } from '../services/workflowDemoUsers';
import type { WorkflowAction, WorkflowActor, WorkflowEvent, WorkflowRepository, WorkflowState } from '../types/workflow';
import type { UserRole } from '../types';

const WORKFLOW_ROLES = [
  'ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE', 'Regional_HSE_Director',
  'Site_HSE_Manager', 'HSE_Officer', 'Environmental_Officer', 'Project_Manager',
  'Internal_Auditor', 'QA_QC_Manager', 'QA_QC_Inspector', 'Site_Supervisor',
  'Worker', 'HR_Coordinator', 'Legal_Team', 'Transport_Manager',
  'Security_Officer', 'Store_Keeper', 'Maintenance_Lead'
] as const satisfies readonly UserRole[];

const roleSchema = z.enum(WORKFLOW_ROLES);
const recordTypeSchema = z.enum([
  'Incident', 'NearMiss', 'Observation', 'NCR', 'CAPA', 'Permit', 'Inspection',
  'Audit', 'Training', 'Investigation', 'StatutoryNotification', 'Medical', 'Calibration'
]);
const prioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);
const sessionSchema = z.object({
  userId: z.string().trim().min(1).max(100)
}).strict();
const createRecordSchema = z.object({
  recordType: recordTypeSchema,
  recordId: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(240),
  priority: prioritySchema.optional(),
  siteId: z.string().trim().max(100).optional(),
  department: z.string().trim().max(120).optional(),
  highPotential: z.boolean().optional(),
  serious: z.boolean().optional(),
  ownerRole: roleSchema.optional()
}).strict();

const targetActorSchema = z.object({
  id: z.string().trim().min(1).max(100)
}).strict();
const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('claim') }).strict(),
  z.object({ type: z.literal('takeover'), reason: z.string().trim().min(3).max(300) }).strict(),
  z.object({ type: z.literal('reassign'), reason: z.string().trim().min(3).max(300), target: targetActorSchema }).strict(),
  z.object({ type: z.literal('delegate'), note: z.string().trim().min(3).max(300), target: targetActorSchema }).strict(),
  z.object({ type: z.literal('complete') }).strict(),
  z.object({ type: z.literal('approve') }).strict(),
  z.object({ type: z.literal('reject'), reason: z.string().trim().min(3).max(300) }).strict(),
  z.object({ type: z.literal('return'), reason: z.string().trim().min(3).max(300) }).strict(),
  z.object({ type: z.literal('escalate'), reason: z.string().trim().min(3).max(300) }).strict()
]);

const ephemeralSecret = randomBytes(32);
const tokenSecret = process.env.WORKFLOW_DEMO_TOKEN_SECRET
  ? Buffer.from(process.env.WORKFLOW_DEMO_TOKEN_SECRET, 'utf8')
  : ephemeralSecret;
const tokenClaimsSchema = z.object({
  userId: z.string().trim().min(1).max(100),
  role: roleSchema,
  department: z.string().trim().min(1).max(120),
  siteId: z.string().trim().max(100).optional(),
  iss: z.literal('ad6-workflow-synthetic-demo'),
  exp: z.number().int()
}).strict();

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private state: WorkflowState = { workItems: [], events: [], notifications: [] };

  async read(): Promise<WorkflowState> {
    return structuredClone(this.state);
  }

  async write(state: WorkflowState): Promise<void> {
    this.state = structuredClone(state);
  }
}

export function createWorkflowRouter(workflowNamespace: Namespace) {
  const router = express.Router();
  const repository = new InMemoryWorkflowRepository();
  const service = new WorkflowService(repository);
  const pendingEvents = new Map<string, WorkflowEvent[]>();
  const socketLimiter = new FixedWindowLimiter(40, 60_000);
  if (workflowEnabled()) {
    const escalationInterval = setInterval(() => {
      void repository.read()
        .then(before => service.escalateOverdue().then(next => ({ before, next })))
        .then(({ before, next }) => emitNewEvents(workflowNamespace, pendingEvents, new Set(before.events.map(event => event.id)), next.events))
        .catch(error => console.error('[WORKFLOW] Automatic escalation failed:', error));
    }, 60_000);
    escalationInterval.unref();
  }

  workflowNamespace.use((socket, next) => {
    if (!workflowEnabled()) return next(new Error('Workflow linking is disabled.'));
    const address = socket.handshake.address || 'unknown';
    if (!socketLimiter.allow(address)) return next(new Error('Workflow connection rate limit exceeded.'));
    const claims = verifyWorkflowToken(socket.handshake.auth?.token);
    if (!claims) return next(new Error('A valid synthetic demo workflow token is required.'));
    socket.data.workflowActor = actorFromClaims(claims);
    next();
  });

  workflowNamespace.on('connection', (socket: Socket) => {
    const actor = socket.data.workflowActor as WorkflowActor;
    const rooms = actorRooms(actor);
    void socket.join(rooms);
    for (const room of rooms) {
      const queued = pendingEvents.get(room) ?? [];
      for (const event of queued) socket.emit('workflow:event', event);
      pendingEvents.delete(room);
    }
  });

  router.get('/status', limitRequests(60, 60_000), (_req, res) => {
    res.json({ enabled: workflowEnabled(), demoOnly: true });
  });

  router.post('/session', limitRequests(12, 60_000), (req, res) => {
    if (!workflowEnabled()) return res.status(404).json({ error: 'Workflow linking is disabled.' });
    const parsed = sessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid synthetic demo session.' });
    const demoUser = WORKFLOW_DEMO_USERS.find(user => user.id === parsed.data.userId);
    if (!demoUser) return res.status(403).json({ error: 'This profile is not in the synthetic Oman workflow demo.' });
    const claims = {
      userId: demoUser.id,
      role: demoUser.role,
      department: demoUser.department,
      siteId: 'site-sohar',
      iss: 'ad6-workflow-synthetic-demo' as const,
      exp: Date.now() + 8 * 60 * 60 * 1000
    };
    return res.json({ token: signWorkflowToken(claims), expiresAt: new Date(claims.exp).toISOString(), demoOnly: true });
  });

  router.use(limitRequests(60, 60_000));
  router.use(requireWorkflowEnabled);
  router.use(requireWorkflowToken);

  router.get('/state', async (req, res) => {
    const actor = req.workflowActor!;
    const state = await repository.read();
    return res.json(filterStateForActor(state, actor));
  });

  router.post('/records', async (req, res) => {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid workflow record payload.' });
    try {
      const actor = req.workflowActor!;
      const oldState = await repository.read();
      const nextState = await service.createForRecord({ ...parsed.data, createdBy: actor });
      emitNewEvents(workflowNamespace, pendingEvents, new Set(oldState.events.map(event => event.id)), nextState.events);
      return res.status(201).json(filterStateForActor(nextState, actor));
    } catch (error) {
      return sendWorkflowError(res, error);
    }
  });

  router.post('/items/:itemId/actions', async (req, res) => {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid workflow action payload.' });
    try {
      const actor = req.workflowActor!;
      const before = await repository.read();
      const action = resolveTargetActor(parsed.data);
      if (!action) return res.status(403).json({ error: 'The target profile is not in the synthetic Oman workflow demo.' });
      const nextState = await service.act(req.params.itemId, actor, action);
      emitNewEvents(workflowNamespace, pendingEvents, new Set(before.events.map(event => event.id)), nextState.events);
      return res.json(filterStateForActor(nextState, actor));
    } catch (error) {
      return sendWorkflowError(res, error);
    }
  });

  return router;
}

declare global {
  namespace Express {
    interface Request {
      workflowActor?: WorkflowActor;
    }
  }
}

function workflowEnabled(): boolean {
  return process.env.WORKFLOW_LINKING === 'true' && process.env.DEMO_MODE === 'true';
}

function limitRequests(limit: number, windowMs: number) {
  const limiter = new FixedWindowLimiter(limit, windowMs);
  return (req: Request, res: Response, next: NextFunction) => {
    if (!limiter.allow(req.ip || req.socket.remoteAddress || 'unknown')) {
      return res.status(429).json({ error: 'Workflow request rate limit exceeded.' });
    }
    next();
  };
}

class FixedWindowLimiter {
  private readonly entries = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly maxRequests: number, private readonly windowMs: number) {}

  allow(key: string): boolean {
    const now = Date.now();
    const entry = this.entries.get(key);
    if (!entry || entry.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.maxRequests) return false;
    entry.count += 1;
    return true;
  }
}

function requireWorkflowEnabled(_req: Request, res: Response, next: NextFunction) {
  if (!workflowEnabled()) return res.status(404).json({ error: 'Workflow linking is disabled.' });
  next();
}

function requireWorkflowToken(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const claims = verifyWorkflowToken(token);
  if (!claims) return res.status(401).json({ error: 'A valid synthetic demo workflow token is required.' });
  req.workflowActor = actorFromClaims(claims);
  next();
}

function signWorkflowToken(claims: z.infer<typeof tokenClaimsSchema>): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyWorkflowToken(token: unknown): z.infer<typeof tokenClaimsSchema> | null {
  if (typeof token !== 'string') return null;
  const [payload, suppliedSignature, ...rest] = token.split('.');
  if (!payload || !suppliedSignature || rest.length > 0) return null;
  const expectedSignature = createHmac('sha256', tokenSecret).update(payload).digest();
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(suppliedSignature, 'base64url');
  } catch {
    return null;
  }
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const claims = tokenClaimsSchema.safeParse(parsed);
    if (!claims.success || claims.data.exp <= Date.now()) return null;
    return claims.data;
  } catch {
    return null;
  }
}

function actorFromClaims(claims: z.infer<typeof tokenClaimsSchema>): WorkflowActor {
  return {
    id: claims.userId,
    role: claims.role,
    department: claims.department,
    siteId: claims.siteId,
    supervisedUserIds: WORKFLOW_DEMO_SUPERVISION[claims.userId] ?? []
  };
}

function resolveTargetActor(action: z.infer<typeof actionSchema>): WorkflowAction | null {
  if (action.type !== 'reassign' && action.type !== 'delegate') return action;
  const targetProfile = WORKFLOW_DEMO_USERS.find(user => user.id === action.target.id);
  if (!targetProfile) return null;
  return {
    ...action,
    target: {
      id: targetProfile.id,
      role: targetProfile.role,
      department: targetProfile.department,
      siteId: 'site-sohar',
      supervisedUserIds: WORKFLOW_DEMO_SUPERVISION[targetProfile.id] ?? []
    }
  };
}

function actorRooms(actor: WorkflowActor): string[] {
  return [
    `user:${actor.id}`,
    `role:${actor.role}`,
    ...(actor.siteId ? [`site:${actor.siteId}`] : [])
  ];
}

function emitNewEvents(
  namespace: Namespace,
  pending: Map<string, WorkflowEvent[]>,
  priorEventIds: Set<string>,
  events: WorkflowEvent[]
): void {
  for (const event of events.filter(candidate => !priorEventIds.has(candidate.id))) {
    const rooms = [
      ...event.targetUserIds.map(id => `user:${id}`),
      ...(event.targetRoles ?? []).map(role => `role:${role}`),
      ...(event.siteIds ?? []).map(siteId => `site:${siteId}`)
    ];
    for (const room of new Set(rooms)) {
      namespace.to(room).emit('workflow:event', event);
      const queued = pending.get(room) ?? [];
      queued.push(event);
      pending.set(room, queued.slice(-250));
    }
  }
}

function filterStateForActor(state: WorkflowState, actor: WorkflowActor): WorkflowState {
  const chain = getRoleChain(actor.role);
  const actorRank = chain ? roleRankInChain(actor.role, chain) : -1;
  const workItems = state.workItems.filter(item => {
    if (item.createdBy === actor.id || item.assignedToUser === actor.id || item.assignedToRole === actor.role || item.pool === actor.role || item.escalatedToRole === actor.role) return true;
    if (item.siteId && item.siteId === actor.siteId && actor.role === 'Site_Supervisor') return true;
    const itemChain = getRoleChain(item.assignedToRole);
    return Boolean(itemChain?.includes(actor.role) && actorRank > roleRankInChain(item.assignedToRole, itemChain));
  });
  const visibleIds = new Set(workItems.map(item => item.id));
  return {
    workItems,
    events: state.events.filter(event =>
      event.targetUserIds.includes(actor.id)
      || event.targetRoles?.includes(actor.role)
      || event.recordRef.workItemId && visibleIds.has(event.recordRef.workItemId)
    ),
    notifications: state.notifications.filter(notification => notification.userId === actor.id)
  };
}

function sendWorkflowError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'Workflow action failed.';
  const status = message.includes('not found') ? 404 : 403;
  return res.status(status).json({ error: message });
}
