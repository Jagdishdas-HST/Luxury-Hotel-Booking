import { ReactNode, useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

// SINGLE SOURCE OF TRUTH for every app-wide provider. Both entries (main.tsx client,
// entry-server.tsx SSR) render this exact tree, so a provider added here is automatically
// present during SSR. Adding a provider anywhere else creates a client/server mismatch and
// crashes the SSR render with "useX must be used within XProvider".
interface ProvidersProps {
  children: ReactNode;
  // Only supplied by entry-server.tsx during SSR, so react-helmet-async can collect head tags.
  helmetContext?: Record<string, any>;
}

// HelmetProvider, QueryClientProvider, TooltipProvider and the toasters all call
// useSyncExternalStore without a getServerSnapshot, which crashes SSR renderToString.
// During SSR (helmetContext is provided), we wrap with HelmetProvider only — no other
// providers are needed for head-tag collection. On the client, we mount everything after
// hydration via the mounted guard so the server HTML is never touched by these providers.
function ClientShell({ children, helmetContext }: { children: ReactNode; helmetContext?: Record<string, any> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR path: only HelmetProvider (with context) wraps children — no store-backed providers.
  if (helmetContext !== undefined) {
    return (
      <HelmetProvider context={helmetContext}>
        {children}
      </HelmetProvider>
    );
  }

  // Client path: defer all store-backed providers until after hydration.
  if (!mounted) return <>{children}</>;
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export function Providers({ children, helmetContext }: ProvidersProps) {
  return (
    <ClientShell helmetContext={helmetContext}>
      {children}
    </ClientShell>
  );
}

export default Providers;