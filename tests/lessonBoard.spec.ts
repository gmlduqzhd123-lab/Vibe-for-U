import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";

test("차시별 진행 대시보드: 차시마다 작품 수·완료·많이 멈춘 단계를 보여 준다", async ({
  page,
}) => {
  const quiz1 = missions.find((m) => m.id === "quiz-1")!;
  const story1 = missions.find((m) => m.id === "story-1")!;
  const works = [quiz1, quiz1, story1].map((m, i) => {
    const w = makeWork(m);
    w.draft.title = `학생 ${i + 1}`;
    if (i === 0) {
      // 1번 학생은 목표를 확인하고 요청까지 적어 '예상하고 실행'에서 멈춘다.
      w.draft.goalReviewed = true;
      w.draft.originalPrompt = "요청";
      w.draft.arrangedPrompt = "정리한 요청";
    }
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
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const board = page.locator(".lesson-board");
  await expect(board).toContainText("차시별 진행");
  const rows = board.locator("tbody tr");
  await expect(rows).toHaveCount(8);
  // 1차시(퀴즈 1): 작품 2개, 완료 0, 가장 많이 멈춘 단계는 1번 학생(예상하고 실행)과 2번 학생(목표 정하기)이 하나씩이라 앞 단계가 먼저다.
  await expect(rows.nth(0)).toContainText("1차시");
  await expect(rows.nth(0)).toContainText("2개");
  await expect(rows.nth(0)).toContainText("0 / 2");
  await expect(rows.nth(0)).toContainText("목표 정하기 · 1명");
  // 3차시(이야기 1): 작품 1개
  await expect(rows.nth(2)).toContainText("3차시");
  await expect(rows.nth(2)).toContainText("1개");
  // 8차시(타이머 4): 작품이 없어 흐리게 나온다.
  await expect(rows.nth(7)).toHaveClass(/lesson-empty/);
  await expect(rows.nth(7)).toContainText("0개");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".lesson-board")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
