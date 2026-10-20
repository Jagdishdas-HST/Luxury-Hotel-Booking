import { ReactNode } from "react";
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

// During SSR (helmetContext is provided), we render ONLY HelmetProvider with the context
// object — no other providers, no hooks, no useState. This avoids the
// "Missing getServerSnapshot" error from store-backed providers (QueryClient, TooltipProvider,
// Radix primitives) that call useSyncExternalStore without a server snapshot.
//
// On the client (helmetContext is undefined), all providers are rendered normally.
// The client entry (main.tsx) never passes helmetContext, so this branch is client-only.
export function Providers({ children, helmetContext }: ProvidersProps) {
  // SSR path: only HelmetProvider with context — nothing else touches the DOM or stores.
  if (helmetContext !== undefined) {
    return (
      <HelmetProvider context={helmetContext}>
        {children}
      </HelmetProvider>
    );
  }

  // Client path: full provider tree.
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

export default Providers;