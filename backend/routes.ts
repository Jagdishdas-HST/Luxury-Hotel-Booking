import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./src/routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Original API server middleware + router (previously mounted in src/app.ts)
  app.use("/api", cors());
  app.use("/api", cookieParser());
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}