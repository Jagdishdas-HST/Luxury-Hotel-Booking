import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  destination: text('destination').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  guests: integer('guests').notNull().default(2),
  status: text('status').notNull().default('confirmed'), // confirmed | cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

export const insertReservationSchema = z.object({
  guestName: z.string().min(1, 'Name is required'),
  guestEmail: z.string().email('Valid email required'),
  destination: z.string().min(1, 'Destination is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().int().min(1).max(8).default(2),
});