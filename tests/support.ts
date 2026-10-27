import type { Page } from "@playwright/test";
const engine = (page: Page) => page.context().browser()?.browserType().name();
// PDF 증거 파일은 Chromium만 만들 수 있다. 다른 엔진에서는 인쇄 화면 검사만 한다.
export async function savePdf(page: Page, path: string) {
  if (engine(page) !== "chromium") return;
  await page.pdf({ path, format: "A4", printBackground: true });
}
// Chromium은 실제 클립보드 권한을 쓰고, 권한 이름을 모르는 WebKit 등은 복사한 글을 기록해 읽는다.
export async function useClipboard(page: Page) {
  if (engine(page) === "chromium")
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
  else
    await page.addInitScript(() => {
      let last = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (t: string) => {
            last = t;
          },
          readText: async () => last,
        },
      });
    });
  return () => page.evaluate(() => navigator.clipboard.readText());
}
