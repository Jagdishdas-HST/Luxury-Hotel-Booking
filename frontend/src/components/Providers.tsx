import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";

// Imported app: it keeps its own providers (query client, toasts, theme); this only adds the HelmetProvider <SEO> needs.
interface ProvidersProps {
  children: ReactNode;
  helmetContext?: Record<string, any>;
}

export function Providers({ children, helmetContext }: ProvidersProps) {
  return <HelmetProvider {...(helmetContext ? { context: helmetContext } : {})}>{children}</HelmetProvider>;
}

export default Providers;
