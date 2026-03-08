import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: [["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  timeout: process.env.CI ? 90000 : 30000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:8080",
    headless: true,
    locale: "en-US",
    trace: "retain-on-failure",
  },
});
