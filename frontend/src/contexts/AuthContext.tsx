import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  picture?: string | null;
  provider?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithSSO: (provider: string, code: string, redirectUri: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lumina_token");
    if (stored) {
      setToken(stored);
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setUser(data);
          else localStorage.removeItem("lumina_token");
        })
        .catch(() => localStorage.removeItem("lumina_token"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  function saveSession(token: string, user: AuthUser) {
    localStorage.setItem("lumina_token", token);
    setToken(token);
    setUser(user);
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    saveSession(data.token, data.user);
  }

  async function register(email: string, password: string, name: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    saveSession(data.token, data.user);
  }

  async function loginWithSSO(provider: string, code: string, redirectUri: string) {
    const res = await fetch(`/api/auth/${provider}/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "SSO login failed");
    saveSession(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem("lumina_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithSSO, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}