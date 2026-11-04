import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

console.log("🚀 Starting SQL runner...");

neonConfig.webSocketConstructor = ws;
console.log("✅ WebSocket constructor set");

console.log("🔍 Checking environment variables...");
const databaseUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL exists:", !!databaseUrl);
if (databaseUrl) {
  console.log(
    "DATABASE_URL starts with:",
    databaseUrl.substring(0, 30) + "..."
  );
  console.log("DATABASE_URL contains 'neon':", databaseUrl.includes("neon"));
}

if (!databaseUrl) {
  console.error(
    "❌ DATABASE_URL must be set. Did you forget to provision a database?"
  );
  process.exit(2);
}

const query = process.argv[2];
console.log("🔍 Command line args:", process.argv);
console.log("🔍 Received query:", JSON.stringify(query));
console.log("🔍 Query length:", query?.length || 0);

if (!query) {
  console.error('❌ Usage: tsx scripts/run-sql-neon.ts "<SQL HERE>"');
  process.exit(2);
}

(async () => {
  let pool;

  try {
    console.log("🔍 Creating connection pool...");
    pool = new Pool({ connectionString: databaseUrl });
    console.log("✅ Pool created successfully");

    console.log("🔍 Creating Drizzle instance...");
    const db = drizzle({ client: pool, schema: {} });
    console.log("✅ Drizzle instance created");

    console.log("🔍 Preparing to execute SQL...");
    console.log("SQL to execute:", query);

    console.log("🔍 Executing query...");
    const startTime = Date.now();
    const result = await db.execute(sql.raw(query));
    const endTime = Date.now();

    console.log(`✅ SQL executed successfully in ${endTime - startTime}ms`);
    console.log("Query:", query);

    // Show results if it's a SELECT query
    if (query.trim().toUpperCase().startsWith("SELECT")) {
      console.log("📊 Results:", result);
      console.log(
        "📊 Row count:",
        Array.isArray(result) ? result.length : "N/A"
      );
    } else {
      console.log("📊 Result type:", typeof result);
      if (result && typeof result === "object") {
        console.log("📊 Result keys:", Object.keys(result));
        if ("rowCount" in result) {
          console.log("📊 Rows affected:", (result as any).rowCount);
        }
      }
    }
  } catch (err: any) {
    console.error("❌ SQL execution failed!");
    console.error("Error message:", err?.message);
    console.error("Error name:", err?.name);
    console.error("Error code:", err?.code);
    console.error("Error detail:", err?.detail);
    console.error("Error hint:", err?.hint);
    console.error("Error constraint:", err?.constraint);
    console.error("Full error object:", err);

    if (err?.stack) {
      console.error("Stack trace:", err.stack);
    }

    process.exit(1);
  } finally {
    if (pool) {
      console.log("🔍 Closing connection pool...");
      try {
        await pool.end();
        console.log("✅ Pool closed successfully");
      } catch (closeErr) {
        console.error("⚠️ Error closing pool:", closeErr);
      }
    }
  }
})();
