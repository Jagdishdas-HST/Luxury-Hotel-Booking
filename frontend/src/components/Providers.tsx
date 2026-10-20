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

// QueryClientProvider, TooltipProvider and the toasters all call useSyncExternalStore
// without a getServerSnapshot, which crashes SSR renderToString. This wrapper defers
// all of them to the client — children are always rendered so SSR still produces markup.
function ClientShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function Providers({ children, helmetContext }: ProvidersProps) {
  return (
    <HelmetProvider {...(helmetContext ? { context: helmetContext } : {})}>
      <ClientShell>{children}</ClientShell>
    </HelmetProvider>
  );
}

export default Providers;