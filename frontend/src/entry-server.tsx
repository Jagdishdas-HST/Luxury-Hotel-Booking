import { renderToString } from "react-dom/server";
import App from "./App";
import * as ProvidersModule from "@/components/Providers";
import { SiteUrlContext } from "@/lib/site-url";

const Providers = (ProvidersModule as Record<string, any>)["Providers"] ?? (ProvidersModule as Record<string, any>)["default"];

export function render(url: string, origin = "") {
  const helmetContext: Record<string, any> = {};

  renderToString(
    <Providers helmetContext={helmetContext}>
      <SiteUrlContext.Provider value={origin}>
        <App />
      </SiteUrlContext.Provider>
    </Providers>,
  );

  return { helmetContext };
}