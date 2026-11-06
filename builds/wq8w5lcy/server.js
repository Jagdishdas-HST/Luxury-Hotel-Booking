var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// backend/server.ts
import "dotenv/config";
import express2 from "express";

// backend/routes.ts
import { createServer } from "http";

// backend/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
var JWT_SECRET = process.env.JWT_SECRET || "lumina-dev-secret-change-in-production";
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  req.userId = payload.userId;
  next();
}

// backend/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  createReservationSchema: () => createReservationSchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  reservations: () => reservations,
  users: () => users
});
import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"),
  provider: text("provider").default("email"),
  providerId: text("provider_id"),
  picture: text("picture"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required")
});
var reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  destination: text("destination").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull().default(2),
  status: text("status").notNull().default("requested"),
  createdAt: timestamp("created_at").defaultNow()
});
var createReservationSchema = z.object({
  destination: z.string().min(1, "Please choose a destination"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an arrival date"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a departure date"),
  guests: z.number().int().min(1).max(8)
}).refine((v) => v.checkOut > v.checkIn, { message: "Departure must be after arrival", path: ["checkOut"] });

// backend/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// backend/storage.ts
import { eq, desc, and } from "drizzle-orm";
async function createReservation(userId, data) {
  const [row] = await db.insert(reservations).values({ userId, ...data }).returning();
  return row;
}
async function listReservationsForUser(userId) {
  return db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
}
async function getUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
async function getUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
async function getUserByProvider(provider, providerId) {
  const [user] = await db.select().from(users).where(and(eq(users.providerId, providerId), eq(users.provider, provider)));
  return user;
}
async function createUser(data) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}
async function upsertProviderUser(data) {
  const existing = await getUserByProvider(data.provider, data.providerId);
  if (existing) {
    const [updated] = await db.update(users).set({ name: data.name, picture: data.picture, emailVerified: data.emailVerified }).where(eq(users.id, existing.id)).returning();
    return updated;
  }
  const [user] = await db.insert(users).values({
    email: data.email,
    name: data.name,
    picture: data.picture,
    provider: data.provider,
    providerId: data.providerId,
    emailVerified: data.emailVerified ?? false
  }).returning();
  return user;
}

// backend/routes.ts
var SSO_BASE = "https://auth.joylo.cloud";
var CLIENT_ID = process.env.VITE_JOYLO_CLOUD_SSO_CLIENT_ID || "";
var CLIENT_SECRET = process.env.JOYLO_CLOUD_SSO_CLIENT_SECRET || "";
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password, name } = parsed.data;
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
      const hashed = await hashPassword(password);
      const user = await createUser({ email, name, password: hashed, provider: "email" });
      const token = generateToken(user.id);
      const { password: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    } catch (err) {
      console.error("[register]", err);
      return res.status(500).json({ message: "Registration failed." });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;
      const user = await getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const token = generateToken(user.id);
      const { password: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    } catch (err) {
      console.error("[login]", err);
      return res.status(500).json({ message: "Login failed." });
    }
  });
  app2.post("/api/auth/:provider/callback", async (req, res) => {
    const { provider } = req.params;
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ message: "Missing code or redirectUri." });
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ message: "SSO not configured on server." });
    }
    try {
      const tokenRes = await fetch(`${SSO_BASE}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });
      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("[sso token exchange]", tokenRes.status, errBody);
        return res.status(tokenRes.status).json({ message: errBody });
      }
      const tokenData = await tokenRes.json();
      const userInfoRes = await fetch(`${SSO_BASE}/oauth/userinfo`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (!userInfoRes.ok) {
        const errBody = await userInfoRes.text();
        return res.status(userInfoRes.status).json({ message: errBody });
      }
      const userInfo = await userInfoRes.json();
      const user = await upsertProviderUser({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider,
        providerId: userInfo.sub,
        emailVerified: userInfo.email_verified
      });
      const token = generateToken(user.id);
      const { password: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    } catch (err) {
      console.error("[sso callback]", err);
      return res.status(500).json({ message: "SSO authentication failed." });
    }
  });
  app2.post("/api/reservations", requireAuth, async (req, res) => {
    try {
      const parsed = createReservationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const reservation = await createReservation(req.userId, parsed.data);
      return res.status(201).json(reservation);
    } catch (err) {
      console.error("[create reservation]", err);
      return res.status(500).json({ message: "Could not save your reservation." });
    }
  });
  app2.get("/api/reservations", requireAuth, async (req, res) => {
    try {
      return res.json(await listReservationsForUser(req.userId));
    } catch (err) {
      console.error("[list reservations]", err);
      return res.status(500).json({ message: "Failed to load reservations." });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await getUserById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found." });
      const { password: _, ...safeUser } = user;
      return res.json(safeUser);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch user." });
    }
  });
  return createServer(app2);
}

// backend/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "vite-joylo-runtime-overlay";
import joyloEditor from "vite-plugin-joylo-editor";
var vite_config_default = defineConfig(({ isSsrBuild }) => ({
  plugins: isSsrBuild ? [react(), tailwindcss()] : [joyloEditor(), runtimeErrorOverlay(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "frontend/src"),
      "@shared": path.resolve(import.meta.dirname, "shared")
    }
  },
  root: path.resolve(import.meta.dirname, "frontend"),
  build: {
    outDir: isSsrBuild ? path.resolve(import.meta.dirname, "dist/server") : path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
}));

// backend/ssr.ts
function requestOrigin(req) {
  const forwardedProto = req.headers["x-forwarded-proto"]?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol || "https";
  const host = req.get("host");
  return host ? `${proto}://${host}` : "";
}
function helmetHeadTags(helmetContext) {
  const helmet = helmetContext?.helmet;
  if (!helmet) return "";
  return [
    helmet.title?.toString(),
    helmet.meta?.toString(),
    helmet.link?.toString(),
    helmet.script?.toString()
  ].filter((tag) => tag && tag.trim()).join("\n  ");
}
function injectHead(template, headTags) {
  if (!headTags) return template;
  let html = template;
  if (/<title[\s>]/i.test(headTags)) {
    html = html.replace(/[ \t]*<title\b[^>]*>[\s\S]*?<\/title>\s*\n?/i, "");
  }
  const canonicalInHead = /<link[^>]*rel=["']canonical["']/i.test(headTags);
  if (canonicalInHead) {
    html = html.replace(/[ \t]*<link[^>]*rel=["']canonical["'][^>]*>\s*\n?/i, "");
  }
  const metaKeys = /* @__PURE__ */ new Set();
  const metaAttrRe = /<meta[^>]*\b(name|property)=["']([^"']+)["']/gi;
  let m;
  while ((m = metaAttrRe.exec(headTags)) !== null) {
    metaKeys.add(`${m[1].toLowerCase()}=${m[2].toLowerCase()}`);
  }
  if (metaKeys.size > 0) {
    html = html.replace(/[ \t]*<meta\b[^>]*>\s*\n?/gi, (tag) => {
      const attr = /\b(name|property)=["']([^"']+)["']/i.exec(tag);
      if (attr && metaKeys.has(`${attr[1].toLowerCase()}=${attr[2].toLowerCase()}`)) {
        return "";
      }
      return tag;
    });
  }
  return html.includes("<!--ssr-head-->") ? html.replace("<!--ssr-head-->", headTags) : html.replace("<head>", `<head>
  ${headTags}`);
}

// backend/vite.ts
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const resolvedConfig = typeof vite_config_default === "function" ? vite_config_default({ command: "serve", mode: "development" }) : vite_config_default;
  const vite = await createViteServer({
    ...resolvedConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("/*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "frontend",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const ENTRY_SCRIPT = `<script type="module" src="/src/main.tsx"></script>`;
      if (!template.includes(`src="/src/main.tsx"`) && !template.includes(`src='/src/main.tsx'`)) {
        template = template.replace(/<script[^>]*src=["'][^"']*main\.[^"']*["'][^>]*><\/script>/gi, "").replace("</body>", `  ${ENTRY_SCRIPT}
</body>`);
        log("Warning: entry script tag was missing or wrong \u2014 auto-restored");
      }
      let page = await vite.transformIndexHtml(url, template);
      try {
        const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
        const { helmetContext } = render(url, requestOrigin(req));
        page = injectHead(page, helmetHeadTags(helmetContext));
      } catch (ssrErr) {
        log(`Dev SSR head injection skipped for ${url}: ${ssrErr}`);
      }
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
  log("Vite development server setup complete");
}
async function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  const templatePath = path2.resolve(distPath, "index.html");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  let ssrRender = null;
  try {
    const mod = await import(path2.resolve(import.meta.dirname, "server/entry-server.js"));
    ssrRender = mod.render;
    log("SSR rendering enabled");
  } catch {
    log("SSR bundle not found, serving in SPA mode");
  }
  const template = fs.readFileSync(templatePath, "utf-8");
  const SSR_FAILURE_LIMIT = 5;
  let ssrFailures = 0;
  app2.use(express.static(distPath, { index: false }));
  app2.use("/*", async (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    if (!ssrRender) {
      return res.sendFile(templatePath);
    }
    try {
      const { helmetContext } = ssrRender(req.originalUrl, requestOrigin(req));
      const html = injectHead(template, helmetHeadTags(helmetContext));
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      ssrFailures += 1;
      log(`SSR render failed for ${req.originalUrl} (${ssrFailures}/${SSR_FAILURE_LIMIT}): ${e}`);
      if (ssrFailures >= SSR_FAILURE_LIMIT) {
        ssrRender = null;
        log("SSR disabled for this process after repeated failures \u2014 serving SPA");
      }
      res.sendFile(templatePath);
    }
  });
  log("Static file serving setup complete");
}

// backend/server.ts
var app = express2();
app.use(express2.json({ limit: "25mb" }));
app.use(express2.urlencoded({ extended: false, limit: "25mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJson;
  const originalJson = res.json;
  res.json = function(body, ...args) {
    capturedJson = body;
    return originalJson.call(this, body, ...args);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) {
        logLine += ` :: ${JSON.stringify(capturedJson)}`;
      }
      log(logLine);
    }
  });
  next();
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0"
  });
});
async function startServer() {
  try {
    const server = await registerRoutes(app);
    app.use((err, req, res, next) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    const nodeEnv = process.env.NODE_ENV || app.get("env");
    if (nodeEnv === "production") {
      await serveStatic(app);
    } else if (nodeEnv === "development") {
      await setupVite(app, server);
    } else {
      await serveStatic(app);
    }
    const PORT = process.env.PORT || 3e3;
    if (!process.env.PORT) {
      console.log("\u26A0\uFE0F  .env not loaded or PORT not set");
    }
    server.listen(
      {
        port: PORT,
        host: "0.0.0.0",
        reusePort: true
      },
      () => {
        log(`\u{1F680} Joylo fullstack app running on port ${PORT}`);
        log(`Environment: ${nodeEnv}`);
        if (nodeEnv === "development") {
          log("Frontend served via Vite dev server");
        } else {
          log("Frontend served as static files");
        }
      }
    );
  } catch (err) {
    console.error("\u274C Failed to start server:", err);
    process.exit(1);
  }
}
startServer();
