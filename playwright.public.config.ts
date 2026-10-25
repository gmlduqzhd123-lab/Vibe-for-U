import { defineConfig } from "@playwright/test";
import local from "./playwright.config";
export default defineConfig({
  ...local,
  webServer: undefined,
  use: {
    ...local.use,
    baseURL: "https://gmlduqzhd123-lab.github.io/Vibe-for-U/",
  },
  outputDir: "test-results/public",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/public" }],
  ],
});
