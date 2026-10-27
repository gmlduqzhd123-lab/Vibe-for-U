import { defineConfig } from "@playwright/test";
// 기본은 Windows Edge. CI·다른 환경은 PW_BROWSER=chromium|webkit, PW_EXECUTABLE=실행 파일 경로로 바꾼다.
const browser = process.env.PW_BROWSER ?? "msedge";
const engine =
  browser === "webkit"
    ? { browserName: "webkit" as const }
    : browser === "chromium"
      ? {
          browserName: "chromium" as const,
          launchOptions: process.env.PW_EXECUTABLE
            ? { executablePath: process.env.PW_EXECUTABLE }
            : {},
        }
      : { channel: "msedge" };
export default defineConfig({
  testDir: "./tests",
  testMatch: ["*.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: "http://127.0.0.1:4173/pages-check/",
    ...engine,
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
