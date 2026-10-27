import { defineConfig } from "@playwright/test";
import local from "./playwright.config";
export default defineConfig({
  ...local,
  webServer: undefined,
  use: {
    ...local.use,
    // 배포 워크플로는 PUBLIC_URL로 방금 배포한 주소를 넘긴다.
    baseURL:
      process.env.PUBLIC_URL ?? "https://gmlduqzhd123-lab.github.io/Vibe-for-U/",
  },
  outputDir: "test-results/public",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/public" }],
  ],
});
