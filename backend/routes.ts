import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes go here

  const httpServer = createServer(app);
  return httpServer;
}