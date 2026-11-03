// 영어 안내 그림: 작업실 다섯 단계를 한국어 그림과 같은 너비(603px)로 찍는다.
// 사용: npm run build && (node scripts/serve.mjs &) && node scripts/guide-shots.mjs
// 그 뒤 PNG를 WebP로도 저장한다(README의 안내 그림 절 참고).
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/pages-check/";
const browser = await chromium.launch({
  executablePath: process.env.PW_EXECUTABLE,
});
const context = await browser.newContext({
  viewport: { width: 603, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.addInitScript(() =>
  localStorage.setItem("ttukttak-vibe:lang", JSON.stringify("en")),
);
await page.goto(`${base}#/mission/quiz-3`);
await page
  .getByRole("button", { name: "Start this mission", exact: true })
  .click();
await page.waitForURL(/#\/work\//);
const id = page.url().split("/work/")[1].split("/")[0];
await page.getByLabel("Work title", { exact: true }).fill("My friend's quiz");
for (let step = 0; step < 5; step++) {
  await page.goto(`${base}#/work/${id}/${step}`);
  await page.locator("main h2:visible").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page
    .locator("main")
    .screenshot({ path: `public/guide/step-${step + 1}-en.png` });
  console.log("step", step + 1);
}
await browser.close();
