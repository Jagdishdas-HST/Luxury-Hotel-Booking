import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateToken, comparePassword, hashPassword, requireAuth, type AuthRequest } from "./auth";
import { getUserByEmail, getUserById, createUser, upsertProviderUser } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";

const SSO_BASE = "https://auth.joylo.cloud";
const CLIENT_ID = process.env.VITE_JOYLO_CLOUD_SSO_CLIENT_ID || "";
const CLIENT_SECRET = process.env.VITE_JOYLO_CLOUD_SSO_CLIENT_SECRET || "";

export async function registerRoutes(app: Express): Promise<Server> {

  // --- Email/password register ---
  app.post("/api/auth/register", async (req, res) => {
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

  // --- Email/password login ---
  app.post("/api/auth/login", async (req, res) => {
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

  // --- SSO callback (Google etc.) ---
  app.post("/api/auth/:provider/callback", async (req, res) => {
    const { provider } = req.params;
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      return res.status(400).json({ message: "Missing code or redirectUri." });
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ message: "SSO not configured on server." });
    }

    try {
      // Exchange code for token
      const tokenRes = await fetch(`${SSO_BASE}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("[sso token exchange]", tokenRes.status, errBody);
        return res.status(tokenRes.status).json({ message: errBody });
      }

      const tokenData = await tokenRes.json() as { access_token: string };

      // Get user info
      const userInfoRes = await fetch(`${SSO_BASE}/oauth/userinfo`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        const errBody = await userInfoRes.text();
        return res.status(userInfoRes.status).json({ message: errBody });
      }

      const userInfo = await userInfoRes.json() as {
        sub: string; email: string; name?: string; picture?: string; email_verified?: boolean;
      };

      const user = await upsertProviderUser({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider,
        providerId: userInfo.sub,
        emailVerified: userInfo.email_verified,
      });

      const token = generateToken(user.id);
      const { password: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    } catch (err) {
      console.error("[sso callback]", err);
      return res.status(500).json({ message: "SSO authentication failed." });
    }
  });

  // --- Get current user ---
  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getUserById(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found." });
      const { password: _, ...safeUser } = user;
      return res.json(safeUser);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch user." });
    }
  });

  return createServer(app);
}