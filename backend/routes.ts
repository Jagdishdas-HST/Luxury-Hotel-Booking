import type { Express } from "express";
import { createServer, type Server } from "http";
import router from "./src/routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount the original API router (health check etc.) under /api
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}