import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";
type P = import("@playwright/test").Page;
const axe = async (page: P, sel: string) =>
  expect(
    (
      await new AxeBuilder({ page })
        .include(sel)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
const start = async (page: P, id: string) => {
  await page.goto(`#/mission/${id}`);
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  return page.url().split("/work/")[1].split("/")[0];
};
const saved = (page: P) =>
  expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();

test("반복 계산기: 한 번 더 도는 반복을 찾아 고치고, 실행 기록으로 설명 틀을 채운다", async ({
  page,
}) => {
  const id = await start(page, "loop-3");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "한 번 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("10");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("60");
  await expect(preview.locator(".loop-dots li.on")).toHaveCount(6);
  await axe(page, ".preview-panel");
  await page.goto(`#/work/${id}/3`);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".smart-hints")).toContainText(
    "5번만 반복해야 하는데 6번 반복해요.",
  );
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("반복 세는 방법").selectOption("exact");
  await page.getByLabel("실행 전 나의 예상").fill("50개에서 멈출 거예요.");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("50");
  await expect(preview.locator(".rule-message")).toHaveText("줄넘기 50개 끝!");
  await axe(page, ".settings");

  // 설명 도우미: 증거가 없으면 안내하고, 증거를 남기면 틀을 채운다.
  await page.goto(`#/work/${id}/4`);
  await page
    .getByRole("button", { name: "실행 기록으로 설명 틀 채우기" })
    .click();
  await expect(page.locator(".toast")).toContainText("이 기록을 증거로 남기기");
  await page.goto(`#/work/${id}/2`);
  // 실행 화면은 단계를 오가도 그대로라, 처음으로 돌린 뒤 다시 끝까지 반복한다.
  await preview.getByRole("button", { name: "↺ 처음으로" }).click();
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await preview
    .getByRole("button", { name: /이 기록을 증거로 남기기/ })
    .click();
  await saved(page);
  await page.goto(`#/work/${id}/4`);
  await page
    .getByRole("button", { name: "실행 기록으로 설명 틀 채우기" })
    .click();
  const text = page.getByLabel("작동 원리와 배운 점", { exact: true });
  await expect(text).toHaveValue(/내가 누른 것: 끝까지 반복/);
  await expect(text).toHaveValue(/앱이 기억한 값: 줄넘기\(개\) 0 → 50/);
});

test("미션 추천과 작품 나란히 비교", async ({ page }) => {
  await page.goto("#/missions");
  const picks = page.locator(".mission-picks");
  await expect(picks.locator("li")).toHaveCount(1);
  await expect(picks).toContainText("처음이라면 여기서 시작해요.");
  await start(page, "quiz-1");
  await saved(page);
  await start(page, "quiz-3");
  await saved(page);
  await page.goto("#/missions");
  await expect(picks.locator("li").first()).toContainText(
    "하던 미션을 이어서 해요.",
  );
  await expect(picks).toContainText("아직 안 해 본 종류예요.");
  await axe(page, ".mission-picks");

  await page.goto("#/library");
  await page.getByRole("button", { name: "작품 나란히 비교" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "작품 나란히 비교",
  );
  // 퀴즈 1(한 번만 채점)과 퀴즈 3(누를 때마다 채점)은 채점 규칙이 다르다.
  await expect(page.locator(".compare-pick")).toContainText("규칙이 다른 곳");
  const sides = page.locator(".compare-works > section");
  await expect(sides).toHaveCount(2);
  await expect(
    sides.locator(".compare-rules li.changed").first(),
  ).toContainText("다른 곳");
  // 나란히 눌러 보면 한쪽만 점수가 계속 오른다.
  for (const side of await sides.all()) {
    const answer = side.locator(".answers button").first();
    await answer.click();
    await answer.click();
  }
  const scores = await sides.getByTestId("score").allTextContents();
  expect([...scores].sort()).toEqual(["1점", "2점"]);
  await axe(page, ".compare-works");
});

test("수업 진행 화면: 오늘 미션 QR과 타이머에 맞춘 지금 할 일", async ({
  page,
}) => {
  await page.goto("#/present/quiz-1/1");
  await expect(
    page.getByRole("img", { name: "오늘 미션을 여는 QR 코드" }),
  ).toBeVisible();
  await expect(page.locator(".present-now")).toHaveCount(0);
  await page
    .getByRole("button", { name: "시작", exact: false })
    .first()
    .click();
  await expect(page.locator(".present-now")).toContainText(
    "지금 할 일 1 / 3 · 목표와 사용할 사람 정하기",
  );
  await page.getByRole("button", { name: "다음 →" }).click();
  await expect(
    page.getByRole("img", { name: "오늘 미션을 여는 QR 코드" }),
  ).toHaveCount(0);
});

test("평가 기준 맞춤·걸러 보기·학기 요약 한 장", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {
      (window as unknown as { printed: string }).printed =
        document.documentElement.dataset.print ?? "";
    };
  });
  await page.goto("#/teacher");
  await page.getByRole("button", { name: "과정 평가표", exact: true }).click();
  const editor = page.locator(".rubric-editor");
  await editor.locator("summary").click();
  await editor.getByLabel("항목 1 이름").fill("문제 찾기");
  await editor.getByLabel("항목 1 이름").press("Tab");
  await axe(page, ".rubric-editor");
  await editor.getByRole("button", { name: "평가표 저장" }).click();
  await expect(page.locator(".toast")).toContainText(
    "고친 평가표를 이 기기에 저장했어요.",
  );
  // 위의 표와, 새로고침 뒤의 평가 카드에도 고친 이름이 나온다.
  await expect(page.locator(".printable table")).toContainText("문제 찾기");
  await page.reload();

  const a = makeWork(missions.find((m) => m.id === "quiz-3")!);
  const b = makeWork(
    missions.find((m) => m.id === "quiz-1")!,
    true,
  );
  b.feedback = { levels: [3, 2, 2, 1], note: "", at: b.createdAt };
  b.selfAssessment = { levels: [2, 2, 2, 2], note: "", at: b.createdAt };
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    [a, b].map((w, i) => ({
      name: `${i + 1}번.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const rows = page.locator(".class-table tbody tr:not(.class-total)");
  await expect(rows).toHaveCount(2);
  await expect(page.locator(".review-card").first()).toContainText("문제 찾기");
  const filter = page.getByLabel("걸러 보기");
  await expect(filter.locator("option")).toContainText([
    "모든 작품 (2)",
    "평가 전인 작품 (1)",
    "다섯 단계를 다 기록하지 않은 작품 (2)",
    "지금 버그가 남은 작품 (1)",
  ]);
  await filter.selectOption("bugs");
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText("1번.json");
  await expect(page.locator(".review-card")).toHaveCount(1);
  await expect(
    page.getByText("작품 2개 가운데 1개를 보고 있어요."),
  ).toBeVisible();
  await axe(page, ".class-filter");
  await filter.selectOption("all");

  await page.getByRole("button", { name: "학기 요약 한 장 인쇄" }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { printed: string }).printed,
    ),
  ).toBe("term");
  await page.emulateMedia({ media: "print" });
  const sheet = page.locator(".term-summary");
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("학급 과정 평가 요약");
  await expect(sheet).toContainText("같은 정답에 점수가 또 올라요");
  await expect(sheet).toContainText("문제 찾기");
  await expect(sheet).not.toContainText("1번.json");
  await expect(page.locator(".class-table")).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  // 기본 평가표로 되돌린다.
  await page.getByRole("button", { name: "과정 평가표", exact: true }).click();
  await page.locator(".rubric-editor summary").click();
  await page.getByRole("button", { name: "기본 평가표로 되돌리기" }).click();
  await expect(page.locator(".printable table")).toContainText(
    "문제와 요구사항",
  );
});
