import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { requireAuth, generateToken, comparePassword, type AuthRequest } from "./auth";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.pick({ email: true, name: true, password: true }).parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
      const user = await storage.createUser(data);
      const token = generateToken(user.id);
      res.json({ user, token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Register error:", err);
      const message = err instanceof Error ? err.message : "Registration failed.";
      res.status(500).json({ message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const valid = await comparePassword(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const { password: _, ...safeUser } = user;
      const token = generateToken(user.id);
      res.json({ user: safeUser, token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed." });
    }
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found." });
      res.json({ user });
    } catch (err) {
      console.error("Me error:", err);
      res.status(500).json({ message: "Failed to fetch user." });
    }
  });

  // Get points history
  app.get("/api/rewards/history", requireAuth, async (req: AuthRequest, res) => {
    try {
      const history = await storage.getPointsHistory(req.userId!);
      res.json({ history });
    } catch (err) {
      console.error("Points history error:", err);
      res.status(500).json({ message: "Failed to fetch points history." });
    }
  });

  // Award points (e.g. after booking)
  app.post("/api/rewards/add", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { points, reason } = z.object({
        points: z.number().int().positive(),
        reason: z.string().min(1),
      }).parse(req.body);
      const newTotal = await storage.addPoints(req.userId!, points, reason);
      res.json({ rewardPoints: newTotal });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Add points error:", err);
      res.status(500).json({ message: "Failed to add points." });
    }
  });

  return createServer(app);
}