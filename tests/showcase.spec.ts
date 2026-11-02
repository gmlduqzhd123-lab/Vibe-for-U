import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";

test("작품 발표 화면: 모은 작품을 차례로 실행하고 예상·고친 이유를 크게 보여 준다", async ({
  page,
  browserName,
}) => {
  const works = ["quiz-1", "timer-1"].map((id, i) => {
    const w = makeWork(missions.find((m) => m.id === id)!);
    w.draft.title = `발표 ${i + 1}`;
    w.draft.prediction = `예상 ${i + 1}: 세 번 눌러도 1점`;
    w.draft.change.reason = `까닭 ${i + 1}: 이미 답했는지 기억해야 해요`;
    return w;
  });
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    works.map((w, i) => ({
      name: `${i + 1}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w])),
    })),
  );
  await page.getByRole("button", { name: "작품 발표 화면" }).click();
  const show = page.getByRole("dialog", { name: "발표 1" });
  await expect(show).toBeVisible();
  await expect(show.locator(".preview-inner")).not.toHaveCount(0);
  expect(
    (
      await new AxeBuilder({ page })
        .include(".showcase")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("ArrowRight");
  await expect(show).toContainText("예상 1: 세 번 눌러도 1점");
  await page.keyboard.press("ArrowRight");
  await expect(show).toContainText("까닭 1: 이미 답했는지 기억해야 해요");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog", { name: "발표 2" })).toContainText(
    "작품 2 / 2",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".showcase")).toHaveCount(0);

  // 칭찬·질문 카드: 인쇄할 때 카드만 남는다.
  await page.evaluate(() => (document.documentElement.dataset.print = "cards"));
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".praise-card")).toHaveCount(2);
  await expect(page.locator(".praise-card").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "학급 작품 모으기" }),
  ).toBeHidden();
  if (browserName === "chromium") {
    const pdf = await page.pdf({ format: "A4" });
    expect(
      (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length,
    ).toBe(1);
  }
});
