import { db } from "./db";
import { users, reservations, type User, type InsertUser, type Reservation, type CreateReservationInput } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export async function createReservation(userId: number, data: CreateReservationInput): Promise<Reservation> {
  const [row] = await db.insert(reservations).values({ userId, ...data }).returning();
  return row;
}

export async function listReservationsForUser(userId: number): Promise<Reservation[]> {
  return db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserByProvider(provider: string, providerId: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.providerId, providerId), eq(users.provider, provider)));
  return user;
}

export async function createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function upsertProviderUser(data: {
  email: string;
  name?: string;
  picture?: string;
  provider: string;
  providerId: string;
  emailVerified?: boolean;
}): Promise<User> {
  const existing = await getUserByProvider(data.provider, data.providerId);
  if (existing) {
    const [updated] = await db
      .update(users)
      .set({ name: data.name, picture: data.picture, emailVerified: data.emailVerified })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      picture: data.picture,
      provider: data.provider,
      providerId: data.providerId,
      emailVerified: data.emailVerified ?? false,
    })
    .returning();
  return user;
}