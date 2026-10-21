import { db } from "./db";
import { users, pointsHistory } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

type SafeUser = {
  id: string;
  email: string;
  name: string;
  rewardPoints: number;
  createdAt: Date | null;
};

export interface IStorage {
  getUserById(id: string): Promise<SafeUser | undefined>;
  getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(data: { email: string; name: string; password: string }): Promise<SafeUser>;
  addPoints(userId: string, points: number, reason: string): Promise<number>;
  getPointsHistory(userId: string): Promise<typeof pointsHistory.$inferSelect[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<SafeUser | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        rewardPoints: users.rewardPoints,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: { email: string; name: string; password: string }): Promise<SafeUser> {
    const hashed = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({ email: data.email, name: data.name, password: hashed, rewardPoints: 100 })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        rewardPoints: users.rewardPoints,
        createdAt: users.createdAt,
      });

    // Record welcome points in history
    await db.insert(pointsHistory).values({
      userId: user.id,
      points: 100,
      reason: "Welcome to Lumina",
    });

    return user;
  }

  async addPoints(userId: string, points: number, reason: string): Promise<number> {
    // Get current points
    const [current] = await db
      .select({ rewardPoints: users.rewardPoints })
      .from(users)
      .where(eq(users.id, userId));

    const newTotal = (current?.rewardPoints ?? 0) + points;

    // Update total and record history in parallel
    await Promise.all([
      db.update(users).set({ rewardPoints: newTotal }).where(eq(users.id, userId)),
      db.insert(pointsHistory).values({ userId, points, reason }),
    ]);

    return newTotal;
  }

  async getPointsHistory(userId: string) {
    return db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(pointsHistory.createdAt);
  }
}

export const storage = new DatabaseStorage();