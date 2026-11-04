import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createRequire } from "module";
import joyloRuntimeOverlay from "vite-joylo-runtime-overlay";
import joyloEditor from "vite-plugin-joylo-editor";

// The overlay imports react-dom/client, which React 16 and 17 don't have; it left the page blank (UAT 1104, RealWorld).
function installedReactMajor() {
  try {
    return Number(createRequire(import.meta.url)("react/package.json").version.split(".")[0]) || 18;
  } catch {
    return 18;
  }
}
const runtimeErrorOverlay = () => (installedReactMajor() >= 18 ? joyloRuntimeOverlay() : null);

export default defineConfig(({ isSsrBuild }) => ({
  plugins: isSsrBuild
    ? [react(), tailwindcss()]
    : [joyloEditor(), runtimeErrorOverlay(), react(), tailwindcss()],
  // Browser code from Node-era packages reads `global`; Node itself has it, so only browser builds need it.
  define: isSsrBuild ? {} : { global: "globalThis" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "frontend/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "frontend"),
  build: {
    outDir: isSsrBuild
      ? path.resolve(import.meta.dirname, "dist/server")
      : path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
