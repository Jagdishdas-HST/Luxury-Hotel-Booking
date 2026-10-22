import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { reservations, insertReservationSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/reservations - list all reservations
  app.get("/api/reservations", async (req, res) => {
    try {
      const all = await db.select().from(reservations).orderBy(reservations.createdAt);
      res.json(all);
    } catch (err) {
      console.error("[GET /api/reservations]", err);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  // POST /api/reservations - create a reservation
  app.post("/api/reservations", async (req, res) => {
    try {
      const parsed = insertReservationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const [created] = await db.insert(reservations).values(parsed.data).returning();
      res.status(201).json(created);
    } catch (err) {
      console.error("[POST /api/reservations]", err);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  // PATCH /api/reservations/:id/cancel - cancel a reservation
  app.patch("/api/reservations/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const [updated] = await db
        .update(reservations)
        .set({ status: "cancelled" })
        .where(eq(reservations.id, id))
        .returning();
      if (!updated) return res.status(404).json({ message: "Reservation not found" });
      res.json(updated);
    } catch (err) {
      console.error("[PATCH /api/reservations/:id/cancel]", err);
      res.status(500).json({ message: "Failed to cancel reservation" });
    }
  });

  // DELETE /api/reservations/:id - delete a reservation
  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const [deleted] = await db
        .delete(reservations)
        .where(eq(reservations.id, id))
        .returning();
      if (!deleted) return res.status(404).json({ message: "Reservation not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error("[DELETE /api/reservations/:id]", err);
      res.status(500).json({ message: "Failed to delete reservation" });
    }
  });

  return createServer(app);
}