import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Runs against the docker compose stack, which must already be up.
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:9001",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
