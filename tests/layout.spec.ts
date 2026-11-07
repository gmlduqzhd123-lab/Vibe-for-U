import { test, expect } from "@playwright/test";
import { problems } from "./support";
// 화면 모습 검사: 주요 화면을 휴대전화·태블릿·PC 크기와 한국어·영어로 열어
// 가로 넘침, 상자 밖으로 잘린 글자, 서로 겹친 버튼이 없는지 본다.
// 글꼴이 다른 기기에서도 같은 기준이 되도록 픽셀 비교 대신 배치를 검사하고, 사진은 함께 남긴다.
const sizes = [
  { name: "phone", width: 360, height: 740 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "pc", width: 1440, height: 1000 },
];
const pages = [
  "home",
  "missions",
  "mission/quiz-3",
  "work/0",
  "work/2",
  "work/3",
  "library",
  "try",
  "wrapup",
  "bughunt",
  "map",
  "growth",
  "teacher",
];
for (const lang of ["ko", "en"] as const)
  for (const size of sizes)
    test(`화면 모습: ${lang} · ${size.name} ${size.width}px`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.setViewportSize(size);
      await page.addInitScript((l) => {
        localStorage.setItem("ttukttak-vibe:lang", JSON.stringify(l));
      }, lang);
      // 작품 화면을 보려고 퀴즈 3 작품을 하나 만든다.
      await page.goto("#/mission/quiz-3");
      await page.locator(".detail-layout .primary").first().click();
      await expect(page).toHaveURL(/#\/work\//);
      const id = page.url().split("/work/")[1].split("/")[0];
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
            .outputPath(`${lang}-${size.name}-${path.replace(/\//g, "-")}.png`),
          fullPage: true,
        });
      }
      expect(found).toEqual([]);
    });
