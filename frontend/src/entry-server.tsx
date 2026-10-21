import { renderToString } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import App from "./App";
import * as ProvidersModule from "@/components/Providers";
import { SiteUrlContext } from "@/lib/site-url";

// SSR entry. Mirrors main.tsx exactly except for the router (wouter ssrPath vs browser location).
// Providers is shared, so any provider added there is present here automatically — never add
// providers to this file.
// Namespace import: codegen flips Providers.tsx between named and default export; a named import would fail esbuild's dep scan at startup.
const Providers = (ProvidersModule as Record<string, any>)["Providers"] ?? (ProvidersModule as Record<string, any>)["default"];

export function render(url: string, origin = "") {
  const helmetContext: Record<string, any> = {};

  renderToString(
    <Providers helmetContext={helmetContext}>
      <SiteUrlContext.Provider value={origin}>
        <WouterRouter ssrPath={url}>
          <App />
        </WouterRouter>
      </SiteUrlContext.Provider>
    </Providers>,
  );

  return { helmetContext };
}