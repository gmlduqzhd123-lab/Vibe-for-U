import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e.spec.ts", "onboarding.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: "http://127.0.0.1:4173/pages-check/",
    channel: "msedge",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4173/pages-check/",
    reuseExistingServer: true,
    timeout: 10000,
  },
});
