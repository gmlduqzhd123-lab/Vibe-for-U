import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
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
];
// 화면 안에서 문제를 찾아 사람이 읽을 수 있는 설명으로 돌려준다.
async function problems(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const name = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} “${(el.textContent ?? "").trim().slice(0, 30)}”`;
    if (document.documentElement.scrollWidth > innerWidth + 1)
      out.push(
        `가로 넘침 ${document.documentElement.scrollWidth}px > ${innerWidth}px`,
      );
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        !el.closest(
          "[hidden], dialog:not([open]), details:not([open]) > :not(summary), .sr-only",
        )
      );
    };
    // 넘친 글자를 숨기는 상자(overflow hidden/clip)에서 글자가 잘렸는지
    for (const el of document.querySelectorAll<HTMLElement>(
      "main *, .topbar *",
    )) {
      if (!visible(el) || !el.textContent?.trim()) continue;
      const s = getComputedStyle(el);
      const clips = s.overflowX === "hidden" || s.overflowX === "clip";
      if (
        clips &&
        el.scrollWidth > el.clientWidth + 2 &&
        s.textOverflow !== "ellipsis"
      )
        out.push(`잘린 글자: ${name(el)}`);
    }
    // 버튼·링크·입력 칸끼리 3px 넘게 겹치는지(안에 든 것끼리는 제외)
    const controls = [
      ...document.querySelectorAll<HTMLElement>(
        "main button, main a, main input, main select, main textarea, .topbar button, .topbar select, .topbar summary",
      ),
    ].filter(visible);
    for (let i = 0; i < controls.length; i++)
      for (let j = i + 1; j < controls.length; j++) {
        const a = controls[i];
        const b = controls[j];
        if (a.contains(b) || b.contains(a)) continue;
        const r = a.getBoundingClientRect();
        const q = b.getBoundingClientRect();
        const w = Math.min(r.right, q.right) - Math.max(r.left, q.left);
        const h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        if (w > 3 && h > 3) out.push(`겹친 버튼: ${name(a)} ↔ ${name(b)}`);
      }
    return out;
  });
}
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
