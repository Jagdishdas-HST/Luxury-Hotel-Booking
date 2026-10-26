import { db } from "./db";
import { users, type User, type InsertUser } from "@shared/schema";
import { eq, or } from "drizzle-orm";

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
    .where(eq(users.providerId, providerId));
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