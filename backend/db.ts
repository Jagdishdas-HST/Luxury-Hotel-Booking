import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "WARNING: DATABASE_URL is not set. Database operations will fail until it is configured."
  );
}

export const pool = new Pool({ connectionString: databaseUrl || "postgresql://placeholder:placeholder@localhost/placeholder" });
export const db = drizzle({ client: pool, schema });