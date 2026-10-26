import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";

const CLIENT_ID = import.meta.env.VITE_JOYLO_CLOUD_SSO_CLIENT_ID || "";

function LoginInner() {
  const { user, login, register, loginWithSSO } = useAuth();
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Handle SSO callback code in URL (when this page is the callback target)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("joyloLogin");
    if (provider) {
      params.delete("joyloLogin");
      const clean = window.location.pathname + (params.toString() ? "?" + params : "");
      window.history.replaceState({}, "", clean);
      startSSORedirect(provider);
      return;
    }

    const code = params.get("code");
    const pathProvider = window.location.pathname.match(/\/auth\/callback\/([^/]+)/)?.[1];
    if (code && pathProvider) {
      const redirectUri = `${window.location.origin}/auth/callback/${pathProvider}`;
      setLoading(true);
      loginWithSSO(pathProvider, code, redirectUri)
        .then(() => navigate("/"))
        .catch((e) => { setError(e.message); setLoading(false); });
    }
  }, []);

  function startSSORedirect(provider: string) {
    if (window.self !== window.top) {
      const url = new URL(window.location.href);
      url.searchParams.set("joyloLogin", provider);
      window.open(url.toString(), "_blank");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    window.location.href = `https://auth.joylo.cloud/api/auth/${provider}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="noise min-h-[100dvh] bg-[#f5efe5] text-[#143e35] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 mb-10">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d47d5b] text-[#d47d5b]">
            <span className="block h-2 w-2 rounded-full bg-current" />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-semibold tracking-[.22em]">LUMINA</span>
            <span className="mt-1 block font-mono text-[8px] uppercase tracking-[.18em] text-[#62736b]">Private hotels</span>
          </span>
        </a>

        <div className="border border-[#d9cdbd] bg-[#f8f2e8] p-8 shadow-[0_18px_50px_rgba(20,62,53,.10)]">
          <div className="eyebrow mb-2 flex items-center gap-3 text-[#527069]">
            <span className="text-[#d47d5b]">01</span>
            <span className="h-px w-8 bg-[#527069]/40" />
            <span>{mode === "login" ? "Welcome back" : "Create account"}</span>
          </div>
          <h1 className="serif text-5xl leading-[.9] mb-8">
            {mode === "login" ? <>Sign <em>in.</em></> : <>Join <em>Lumina.</em></>}
          </h1>

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => startSSORedirect("google")}
            className="w-full flex items-center justify-center gap-3 border border-[#d9cdbd] bg-white px-5 py-3 text-[13px] font-medium text-[#143e35] transition-colors hover:bg-[#f5efe5] mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <span className="h-px flex-1 bg-[#d9cdbd]" />
            <span className="eyebrow text-[#a7b1a8]">or</span>
            <span className="h-px flex-1 bg-[#d9cdbd]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <label className="block">
                <span className="eyebrow mb-2 block text-[#527069]">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b] placeholder:text-[#b9b8a9]"
                />
              </label>
            )}
            <label className="block">
              <span className="eyebrow mb-2 block text-[#527069]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b] placeholder:text-[#b9b8a9]"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block text-[#527069]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b] placeholder:text-[#b9b8a9]"
              />
            </label>

            {error && (
              <p className="text-sm text-[#c0392b] bg-[#fdf0ee] border border-[#f5c6c0] px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-between bg-[#143e35] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8] transition-colors hover:bg-[#d47d5b] disabled:opacity-60"
            >
              <span>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#527069]">
            {mode === "login" ? (
              <>No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-[#d47d5b] hover:underline">Create one</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-[#d47d5b] hover:underline">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#f5efe5]" />}>
      <LoginInner />
    </ClientOnly>
  );
}