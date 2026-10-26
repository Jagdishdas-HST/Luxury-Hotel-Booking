import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";

function AuthCallbackInner({ provider }: { provider: string }) {
  const { loginWithSSO } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) {
      navigate("/login?error=missing_code");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    loginWithSSO(provider, code, redirectUri)
      .then(() => navigate("/"))
      .catch(() => navigate("/login?error=sso_failed"));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5efe5] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#143e35] border-t-transparent mb-4" />
        <p className="eyebrow text-[#527069]">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallback({ provider }: { provider: string }) {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#f5efe5]" />}>
      <AuthCallbackInner provider={provider} />
    </ClientOnly>
  );
}