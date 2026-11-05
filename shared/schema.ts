import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"),
  provider: text("provider").default("email"),
  providerId: text("provider_id"),
  picture: text("picture"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  destination: text("destination").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull().default(2),
  status: text("status").notNull().default("requested"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Reservation = typeof reservations.$inferSelect;

export const createReservationSchema = z
  .object({
    destination: z.string().min(1, "Please choose a destination"),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an arrival date"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a departure date"),
    guests: z.number().int().min(1).max(8),
  })
  .refine((v) => v.checkOut > v.checkIn, { message: "Departure must be after arrival", path: ["checkOut"] });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;