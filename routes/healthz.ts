import express, { type Request, type Response } from "express";

export const healthRouter = express.Router();

/**
 * Dedicated health check endpoint for Cloud Run and container orchestration
 * Complies with specification: {"status": "healthy", "timestamp": "...", "version": "1.0.0"}
 */
healthRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

export default healthRouter;
