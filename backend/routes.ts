import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import router from "./src/routes";
import { logger } from "./src/lib/logger";

export async function registerRoutes(app: Express): Promise<Server> {
  // Original API server middleware (src/app.ts) and router, mounted under /api.
  app.use("/api", cors());
  app.use("/api", router);

  logger.info("Original API router mounted at /api");

  const httpServer = createServer(app);
  return httpServer;
}