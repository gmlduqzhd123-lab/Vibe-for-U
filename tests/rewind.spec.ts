import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("실행 기록 되감기: 누른 순서와 값을 남기고 한 칸씩 되감아 본다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  await expect(preview.locator(".run-history")).toHaveCount(0);
  const first = preview.locator(".answers button").first();
  await first.click();
  await first.click();
  await first.click();
  const history = preview.locator(".run-history");
  await expect(history).toContainText("실행 기록 되감기 · 3번 눌렀어요");
  await expect(history.locator(".run-history-bar")).toContainText("3 / 3");
  await expect(history.locator(".run-history-step")).toContainText(
    "점수 2 → 3",
  );
  await history.getByRole("button", { name: "한 칸 앞으로 되감기" }).click();
  await history.getByRole("button", { name: "한 칸 앞으로 되감기" }).click();
  await expect(history.locator(".run-history-step")).toContainText(
    "점수 0 → 1",
  );
  await expect(history).toContainText("지난 기록을 보고 있어요");
  // 실행 화면은 지금 값(3점)을 그대로 보여 준다.
  await expect(preview.locator(".trace")).toContainText("3");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".preview-panel")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("예상과 실제: 눌러 본 뒤 예상이 맞았는지 표시하면 포트폴리오에 나란히 나온다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  await page
    .getByLabel("실행 전 나의 예상")
    .fill("세 번 눌러도 1점일 것 같아요");
  await expect(page.locator(".prediction-check")).toHaveCount(0);
  await page.locator(".preview-panel .answers button").first().click();
  const check = page.locator(".prediction-check");
  await expect(check).toBeVisible();
  await check.getByRole("button", { name: "예상과 달랐어요" }).click();
  await page
    .getByLabel("무엇이 달랐나요? 틀린 예상도 소중한 배움이에요")
    .fill("3점이 됐어요. 누를 때마다 더해요.");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  const compare = page.locator(".prediction-compare");
  await expect(compare).toContainText("세 번 눌러도 1점일 것 같아요");
  await expect(compare).toContainText("예상과 달랐어요");
  await expect(compare).toContainText("3점이 됐어요");
  // 앱 설정을 바꾸면(새 판) 지난 판의 표시는 비워지고, 다시 눌러 본 뒤 새로 고른다.
  await page.goto(`#/work/${id}/2`);
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  await expect(page.locator(".prediction-check")).toHaveCount(0);
  await page.locator(".preview-panel .answers button").first().click();
  await expect(
    page
      .locator(".prediction-check")
      .getByRole("button", { name: "예상과 달랐어요" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  await expect(compare).toContainText("아직 표시하지 않았어요.");
  await expect(compare).not.toContainText("3점이 됐어요");
  // 예상을 고치면 표시가 처음으로 돌아간다.
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("실행 전 나의 예상").fill("다시 예상");
  await expect(page.locator(".prediction-check")).toHaveCount(0);
});
