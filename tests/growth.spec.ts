import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";

test("학기말 성장 포트폴리오: 작품들을 모아 처음과 마지막 자기 평가를 비교하고 인쇄한다", async ({
  page,
  browserName,
}) => {
  const works = [0, 1, 2].map((i) => {
    const w = makeWork(missions[i * 4]);
    w.draft.title = `작품 ${i + 1}`;
    w.draft.reflection = `배운 점 ${i + 1}`;
    w.createdAt = new Date(2026, 8, 1 + i * 20).toISOString();
    w.selfAssessment = {
      levels: i === 0 ? [1, 1, 1, 1] : [3, 2, 2, 1],
      note: "",
      at: w.createdAt,
    };
    return w;
  });
  await page.goto("#/library");
  await page.locator("input[type=file]").setInputFiles({
    name: "all.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportJSON(works)),
  });
  await expect(page.locator(".work-card")).toHaveCount(3);
  await page.getByRole("button", { name: "학기말 성장 포트폴리오" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "내가 만들고 고쳐 온 길",
  );
  await expect(page.locator(".growth-cover")).toContainText("작품 3개");
  const compare = page.locator(".growth-compare");
  await expect(compare).toContainText("처음 · 작품 1");
  await expect(compare).toContainText("마지막 · 작품 3");
  await expect(compare).toContainText("↑ 자랐어요");
  await expect(page.locator(".growth-work")).toHaveCount(3);
  await expect(page.locator(".growth-work").first()).toContainText("배운 점 1");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".growth")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  if (browserName === "chromium") {
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "A4" });
    // 표지 한 쪽 + 작품 기록
    expect(
      (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length,
    ).toBeGreaterThanOrEqual(2);
  }
});
