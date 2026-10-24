import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import path from "node:path";

export default defineConfig(({ command }) => ({
  server: { host: true, port: 8080 },
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Use src/server.ts (SSR error wrapper) as the server entry.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Nitro only for production builds:
    //  - on Vercel (VERCEL=1 is set automatically) → .vercel/output (serverless functions + static files)
    //  - everywhere else → a plain Node server in .output/ (pnpm start)
    //  - NITRO_PRESET overrides both (e.g. "netlify", "cloudflare-module")
    ...(command === "build" ? [nitro({ preset: process.env['NITRO_PRESET'] || (process.env['VERCEL'] ? "vercel" : "node-server") })] : []),
    viteReact(),
  ],
}));
