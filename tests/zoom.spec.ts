import { test, expect } from "@playwright/test";
import { problems } from "./support";
// 확대 200%·큰 글씨 화면 검사(실기기 점검표에서 손으로 보던 항목).
// - 확대 200%: 1280px 창을 200%로 키우면 화면 너비가 640px가 된다.
// - 큰 글씨: 브라우저 기본 글자 크기를 24px(보통의 1.5배)로 바꾼 것과 같게 한다. 글자 크기를 rem으로 써서 따라 커진다.
const pages = [
  "home",
  "missions",
  "mission/sort-1",
  "work/2",
  "work/3",
  "library",
  "teacher",
];
const cases = [
  { name: "zoom200", width: 640, height: 400, font: "" },
  { name: "bigtext", width: 1280, height: 800, font: "24px" },
  { name: "bigtext-tablet", width: 768, height: 1024, font: "24px" },
];
for (const c of cases)
  test(`확대·큰 글씨: ${c.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: c.width, height: c.height });
    if (c.font)
      await page.addInitScript((size) => {
        // 사용자가 정한 기본 글자 크기를 흉내 낸다(앱의 rem이 이 값을 따른다).
        // 문서 시작 때 넣은 스타일은 HTML을 읽으며 사라지므로 DOMContentLoaded에 넣는다.
        addEventListener("DOMContentLoaded", () => {
          const s = document.createElement("style");
          s.textContent = `html{font-size:${size}}`;
          document.head.append(s);
        });
      }, c.font);
    await page.goto("#/mission/quiz-3");
    await page.locator(".detail-layout .primary").first().click();
    await expect(page).toHaveURL(/#\/work\//);
    const id = page.url().split("/work/")[1].split("/")[0];
    if (c.font) {
      // 글자가 정말 커졌는지: 본문 글자가 기본(14px)의 1.5배 근처여야 한다.
      const size = await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).fontSize),
      );
      expect(size).toBeGreaterThan(19);
    }
    const found: string[] = [];
    for (const path of pages) {
      const route = path.startsWith("work/")
        ? `work/${id}/${path.split("/")[1]}`
        : path;
      await page.goto(`#/${route}`);
      await page.locator("main h1, main h2").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      for (const p of await problems(page)) found.push(`${path}: ${p}`);
      await page.screenshot({
        path: test
          .info()
          .outputPath(`${c.name}-${path.replace(/\//g, "-")}.png`),
        fullPage: true,
      });
    }
    expect(found).toEqual([]);
  });
