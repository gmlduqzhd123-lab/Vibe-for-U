import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const step = async (page: import("@playwright/test").Page, n: number) =>
  page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(n)
    .click();

test("패턴 그리기: 넘어가는 그림을 재현하고 가장자리 규칙을 고쳐 재검사한다", async ({
  page,
}) => {
  await page.goto("#/missions/pattern");
  await expect(page.locator(".mission-card")).toHaveCount(5);
  await page
    .getByRole("button", { name: /어라\? 그림이 반대편에서 나와요!/ })
    .click();
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(page.locator(".workspace-meta")).toContainText(
    "학습용 오류 규칙 포함",
  );
  await step(page, 2);
  await page
    .getByLabel("실행 전 나의 예상", { exact: true })
    .fill("계단 끝에서 멈춰야 하는데 반대편에 칠해질 것 같아요.");
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "한 칸씩 그리기" }).click();
  await expect(preview.getByTestId("painted")).toHaveText("2");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByRole("status")).toContainText("목표와 달라요");
  await expect(preview.getByTestId("painted")).toHaveText("10");

  await step(page, 3);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(
    page.locator(".check-card.fail").filter({ hasText: "판 가장자리" }),
  ).toContainText("반대편으로 2번 넘어감");

  await step(page, 2);
  await page
    .getByRole("combobox", { name: "판 가장자리 규칙" })
    .selectOption("stop");
  await expect(page.locator(".workspace-meta")).toContainText(
    "현재 설정으로 검사해 보세요",
  );
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByRole("status")).toContainText("목표 모양과 같아요");
  await step(page, 3);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".check-card.fail")).toHaveCount(0);
});

test("패턴 설정: 명령 추가와 목표 칸 고르기, 휴대전화 화면 접근성", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("#/mission/pattern-4");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await step(page, 2);
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByRole("status")).toContainText("빠진 칸 2개");
  await page.getByRole("button", { name: "명령 추가" }).click();
  await page.getByRole("combobox", { name: "명령 4 방향" }).selectOption("up");
  await page.getByRole("spinbutton", { name: "명령 4 칸 수" }).fill("2");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByRole("status")).toContainText("목표 모양과 같아요");
  const target = page.getByRole("button", { name: "목표 칸 2,2" });
  await target.click();
  await expect(target).toHaveAttribute("aria-pressed", "true");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByRole("status")).toContainText("빠진 칸 1개");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("패턴 조건: 막히면 오른쪽으로 돌기로 명령 하나로 테두리를 그린다", async ({
  page,
}) => {
  await page.goto("#/mission/pattern-5");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await step(page, 2);
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByTestId("painted")).toHaveText("5");
  await expect(preview.getByRole("status")).toContainText("빠진 칸 11개");
  await page.getByRole("combobox", { name: /조건 규칙/ }).selectOption("right");
  await preview.getByRole("button", { name: "모두 그리기" }).click();
  await expect(preview.getByTestId("painted")).toHaveText("16");
  await expect(preview.getByRole("status")).toContainText("목표 모양과 같아요");
  await expect(preview.locator(".trace")).toContainText("조건으로 돈 횟수3");
  await step(page, 3);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".check-card.fail")).toHaveCount(0);
});
