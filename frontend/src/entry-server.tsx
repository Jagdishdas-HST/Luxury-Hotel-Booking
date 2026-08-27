import { renderToString } from "react-dom/server";
import App from "./App";
import { Providers } from "@/components/Providers";
import { SiteUrlContext } from "@/lib/site-url";

// SSR entry. Uses wouter's memoryLocation to match the client-side WouterRouter in App.tsx.
// Providers is shared, so any provider added there is present here automatically — never add
// providers to this file.
export function render(url: string, origin = "") {
  const helmetContext: Record<string, any> = {};

  renderToString(
    <Providers helmetContext={helmetContext}>
      <SiteUrlContext.Provider value={origin}>
        <App ssrUrl={url} />
      </SiteUrlContext.Provider>
    </Providers>,
  );

  return { helmetContext };
}