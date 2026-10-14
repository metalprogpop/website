import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      shared: path.resolve(__dirname, "../shared/src/index.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    watch: { usePolling: true },
    // The browser calls /api on the client's own origin and Vite forwards it
    // to the server: no CORS in dev, and the site works from any device that
    // can reach this port. In docker compose the server is http://server:3001.
    proxy: {
      "/api": process.env.API_PROXY_TARGET ?? "http://localhost:13001",
    },
  },
});
