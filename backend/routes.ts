import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  return createServer(app);
}