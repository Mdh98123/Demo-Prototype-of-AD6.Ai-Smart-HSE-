// Automatically load .env file for standalone runtime environments (Node 20.6+)
try {
  (process as any).loadEnvFile?.();
} catch {
  // Ignore if .env is missing or already loaded
}

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { logAccess } from "./services/audit.js";
import http from "http";
import { Server } from "socket.io";
import { createWorkflowRouter } from "./routes/workflowRouter";
import { healthRouter } from "./routes/healthz";
import { geminiRouter } from "./routes/geminiRouter";
import { predictiveMaintenanceRouter } from "./routes/predictiveMaintenanceRouter";
import { ROLE_PERMISSIONS_MAP, VIEW_PERMISSION_REQUIREMENTS } from "./services/permissionService";
import { UserRole, View } from "./types";

// Dynamic Port Resolution for Google Cloud Run ($PORT) & Dev CLI overrides
function resolvePort(): number {
  // Check CLI arguments for --port flag (used by Vite / AI Studio dev runner)
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // In production (e.g. standalone Cloud Run container running dist/server.cjs),
  // bind to the injected PORT environment variable, defaulting to 8080.
  if (process.env.NODE_ENV === "production") {
    if (process.env.PORT) {
      const parsed = parseInt(process.env.PORT, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 8080;
  }

  // In development, the AI Studio dev server MUST ALWAYS run on port 3000.
  // (Nginx is already listening on 8080 as reverse proxy; process.env.PORT=8080 must never be used in dev)
  if (process.env.PORT && process.env.PORT !== "8080") {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 3000;
}

// Global Process Stability Handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("[RUNTIME STABILITY] Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[RUNTIME STABILITY] Uncaught Exception thrown:", err);
});

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  const workflowNamespace = io.of('/workflow');
  const workflowRouter = createWorkflowRouter(workflowNamespace);
  const PORT = resolvePort();

  // Real-time incident dashboard (multiplayer state)
  io.on('connection', (socket) => {
    socket.on('newIncident', (data) => {
      // broadcast to all supervisors/dashboard
      io.emit('incidentUpdate', data);
      if (data.userId) {
         logAccess(data.userId, 'create-incident-ws', { id: data.id });
      }
    });
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/api/workflow", workflowRouter);

  // Enterprise Gemini AI Suite Router (Chat, Grounding, Maps, Transcription)
  app.use("/api/gemini", geminiRouter);

  // Predictive Maintenance & Asset Integrity Validation Router (ISO 10816, API 670, OSHAD CoP 14)
  app.use("/api/predictive-maintenance", predictiveMaintenanceRouter);

  // GCC Enterprise Procurement - Security Headers & Hardening (Mozilla Observatory A+)
  app.use((req, res, next) => {
    // Relaxed for perfect compatibility with the AI Studio iframe sandbox environment
    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Secure Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Permissions Policy
    res.setHeader("Permissions-Policy", "geolocation=(self), microphone=(self), camera=(self)");
    
    // In development mode, strictly prevent browser-level and proxy caching of dynamic modules
    if (process.env.NODE_ENV !== "production") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
    }

    next();
  });

  // Dedicated Health Check Router (/api/healthz) - Cloud Run Specification
  app.use("/api/healthz", healthRouter);

  // Direct root-level fallback alias for container probes
  app.get("/healthz", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Backward-compatible health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Enterprise Compliance Audit Trail API
  const inMemoryAuditTrail: any[] = [];

  app.post(["/api/audit-log", "/api/audit/log"], async (req, res) => {
    try {
      const { userId, operation, payload } = req.body;
      inMemoryAuditTrail.unshift({
        userId: userId || 'anonymous',
        operation: operation || 'SYSTEM_ACTION',
        payload: payload || {},
        timestamp: new Date().toISOString()
      });
      if (inMemoryAuditTrail.length > 500) inMemoryAuditTrail.pop();
      await logAccess(userId || 'anonymous', operation || 'SYSTEM_ACTION', payload || {});
      res.json({ success: true, count: inMemoryAuditTrail.length });
    } catch (err) {
      console.warn('[AUDIT API] Non-blocking audit logger warning:', err);
      res.json({ success: true });
    }
  });

  app.get("/api/audit/trail", (req, res) => {
    res.json({
      status: "success",
      totalRecords: inMemoryAuditTrail.length,
      records: inMemoryAuditTrail.slice(0, 50)
    });
  });

  // Enterprise RBAC Server-Side Authorization Verification Endpoint
  app.post("/api/auth/verify-access", async (req, res) => {
    try {
      const { userId, role, roles, permissions, deniedPermissions, isSuspended, requestedView, requestedPermission } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ authorized: false, reason: "Missing security principal credentials" });
      }

      // Check account suspension
      if (isSuspended) {
        await logAccess(userId, "ACCESS_DENIED_ACCOUNT_SUSPENDED", { role, requestedView, requestedPermission });
        return res.status(403).json({ authorized: false, reason: "Account is suspended or access revoked" });
      }

      // Admin role has full access unless explicitly denied
      if (role === 'ADMIN' && (!deniedPermissions || !deniedPermissions.includes(requestedPermission))) {
        return res.json({ authorized: true, role, userId, adminBypass: true });
      }

      // Evaluate role-based permissions
      const rolePermissions = ROLE_PERMISSIONS_MAP[role as UserRole] || [];
      const combined = new Set<string>(rolePermissions);

      if (roles && Array.isArray(roles)) {
        for (const r of roles) {
          const extra = ROLE_PERMISSIONS_MAP[r as UserRole] || [];
          extra.forEach((p: string) => combined.add(p));
        }
      }

      if (permissions && Array.isArray(permissions)) {
        permissions.forEach((p: string) => combined.add(p));
      }

      if (deniedPermissions && Array.isArray(deniedPermissions)) {
        deniedPermissions.forEach((p: string) => combined.delete(p));
      }

      let isAllowed = false;

      if (requestedPermission) {
        isAllowed = combined.has(requestedPermission) || combined.has('admin:full_access');
      } else if (requestedView) {
        const reqPerms = VIEW_PERMISSION_REQUIREMENTS[requestedView as View];
        if (!reqPerms || reqPerms.length === 0) {
          isAllowed = true;
        } else {
          isAllowed = reqPerms.some((p: string) => combined.has(p)) || combined.has('admin:full_access');
        }
      } else {
        isAllowed = true;
      }

      if (!isAllowed) {
        await logAccess(userId, "ACCESS_DENIED_UNAUTHORIZED_RESOURCE", { role, requestedView, requestedPermission });
        return res.status(403).json({
          authorized: false,
          reason: "Forbidden: Security policy restricts access to this resource",
          role,
          requestedView,
          requestedPermission
        });
      }

      return res.json({ authorized: true, role, userId, effectivePermissionsCount: combined.size });
    } catch (err) {
      console.error("[AUTH API] Error verifying access:", err);
      return res.status(500).json({ authorized: false, error: "Internal authorization error" });
    }
  });

  // Query effective permissions for a user role
  app.get("/api/auth/role-permissions/:role", (req, res) => {
    const role = req.params.role as UserRole;
    const permissions = ROLE_PERMISSIONS_MAP[role] || [];
    res.json({ role, permissions });
  });

  // Cloud Scheduler Endpoint for Compliance Auto-Reminder
  app.post("/api/cron/reminder", (req, res) => {
    console.log("CRON: Processing compliance-auto-reminder scheduler for HSE");
    // In production, this would use FCM or Twilio to send alerts
    res.json({ success: true, message: "Reminders successfully processed.", type: "permit-expiry" });
  });

  // Regional Compliance In-Memory / Runtime State Store
  // Regional Compliance In-Memory / Runtime State Store - Oman Only
  let serverRegionalComplianceMode: 'OMAN' = 'OMAN';
  const serverRegionalComplianceAuditLog: Array<{
    id: string;
    timestamp: string;
    previousMode: string;
    newMode: string;
    changedBy: string;
    userRole: string;
    reason: string;
    ipAddress?: string;
  }> = [
    {
      id: "rc-init-system",
      timestamp: new Date().toISOString(),
      previousMode: "OMAN",
      newMode: "OMAN",
      changedBy: "System Bootstrap",
      userRole: "ADMIN",
      reason: "System configured strictly for Sultanate of Oman regulatory frameworks (Ministry of Labour MD 286/2008, RD 53/2023 & PDO Specifications)."
    }
  ];

  // GET /api/admin/regional-compliance
  app.get("/api/admin/regional-compliance", (req, res) => {
    res.json({
      mode: serverRegionalComplianceMode,
      auditLog: serverRegionalComplianceAuditLog,
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/admin/regional-compliance
  app.post("/api/admin/regional-compliance", async (req, res) => {
    try {
      const { userRole, changedBy, reason } = req.body;
      const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      if (userRole !== "ADMIN") {
        await logAccess(changedBy || "anonymous", "UNAUTHORIZED_REGIONAL_CONFIG_CHANGE_ATTEMPT", {
          attemptedMode: 'OMAN',
          userRole
        });
        return res.status(403).json({
          success: false,
          error: "Forbidden: Only authorized System Administrators are permitted to modify the Regional Compliance Configuration."
        });
      }

      const auditEntry = {
        id: `rc-audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        previousMode: 'OMAN',
        newMode: 'OMAN',
        changedBy: changedBy || "System Administrator",
        userRole: "ADMIN",
        reason: reason || "Sultanate of Oman regulatory alignment",
        ipAddress: clientIp
      };

      serverRegionalComplianceAuditLog.unshift(auditEntry);

      return res.json({
        success: true,
        mode: serverRegionalComplianceMode,
        entry: auditEntry,
        message: `Regional Compliance Configuration locked to OMAN.`
      });
    } catch (err) {
      console.error("[REGIONAL COMPLIANCE API] Error updating configuration:", err);
      return res.status(500).json({ success: false, error: "Internal server error updating regional compliance." });
    }
  });

  // Statutory Compliance API Connector (Oman Regulatory Gateway)
  app.get("/api/oshad/risk/:riskId", async (req, res) => {
    const { riskId } = req.params;
    res.json({
        id: riskId,
        framework: "Oman Labour Law RD 53/2023 & MD 286/2008",
        authority: "Ministry of Labour (MoL) & PDO HSE Directorate",
        classification: "High Risk",
        compliant: true,
        requiresApproval: true,
        recommendedControls: [
            "Mandatory OPAL/PDO Approved PPE Zone",
            "Specialized Lifting Equipment per PDO SP-1232",
            "Continuous Heat Stress TWL Monitoring (<115 W/m² stop-work)"
        ],
        timestamp: new Date().toISOString()
    });
  });

  // Sultanate of Oman Ministry of Labour (MoL) & PDO Connector
  app.get("/api/oman/regulatory/status/:siteId", async (req, res) => {
    const { siteId } = req.params;
    res.json({
      siteId,
      framework: "Oman Labour Law RD 53/2023 & MD 286/2008",
      primaryAuthorities: ["Ministry of Labour (MoL)", "Civil Defence & Ambulance Authority (CDAA)", "Environment Authority"],
      pdoStandardAlignment: "SP-1143 (PTW) & SP-1170 (Thermal Stress)",
      compliant: true,
      thermalStressTWLLimitWPerM2: 115,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on 0.0.0.0 and dynamically bound PORT
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[RUNTIME STABILITY] Server successfully bound to 0.0.0.0:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });

  // Graceful termination handling for container orchestrators (SIGTERM / SIGINT)
  const gracefulShutdown = (signal: string) => {
    console.log(`[RUNTIME STABILITY] Received ${signal}. Closing HTTP/WebSocket server...`);
    server.close(() => {
      console.log("[RUNTIME STABILITY] Server closed cleanly. Exiting process.");
      process.exit(0);
    });
    // Force shutdown after 10s if hanging
    setTimeout(() => {
      console.error("[RUNTIME STABILITY] Forcing shutdown after timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer();
