import { renderToString } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import App from "./App";
import * as ProvidersModule from "@/components/Providers";
import { SiteUrlContext } from "@/lib/site-url";

// SSR entry. Uses wouter's ssrPath prop for server-side routing.
// Providers is shared, so any provider added there is present here automatically.
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