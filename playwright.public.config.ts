import { defineConfig } from "@playwright/test";
import local from "./playwright.config";
export default defineConfig({
  ...local,
  webServer: undefined,
  // 공개 주소 검사는 파일 단위로 둘씩 나눠 돌려 병합 뒤 확인 시간을 줄인다(검사마다 저장소가 따로라 서로 섞이지 않는다).
  workers: 2,
  use: {
    ...local.use,
    // 배포 워크플로는 PUBLIC_URL로 방금 배포한 주소를 넘긴다.
    baseURL:
      process.env.PUBLIC_URL ??
      "https://gmlduqzhd123-lab.github.io/Vibe-for-U/",
  },
  outputDir: "test-results/public",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/public" }],
  ],
});
