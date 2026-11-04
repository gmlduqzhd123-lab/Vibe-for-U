import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("내가 설계한 검사: 누르는 방법과 예상을 적으면 앱이 대신 눌러 보고 카드로 비교한다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  const design = page.locator(".design-check");
  await design.locator("summary").click();
  await design
    .getByLabel("어떻게 눌러 볼까요?")
    .selectOption({ label: "문제 □에서 정답을 두 번 고르기 → 점수" });
  await expect(design).toContainText(
    "실험할 것: 문제 1에서 정답을 두 번 고르기",
  );
  await design.getByLabel("예상 결과 (숫자나 문구)").fill("점수 1");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".design-check")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await design.getByRole("button", { name: "실험하고 기록하기" }).click();
  // 학습용 오류(시도할 때마다 채점)라 2점이 되어 예상과 다르다.
  await expect(page.locator(".toast")).toContainText("예상과 달랐어요");
  const card = page.locator(".check-card.fail").filter({
    hasText: "내가 설계한 검사",
  });
  await expect(card).toContainText("문제 1에서 정답을 두 번 고르기");
  await expect(card).toContainText("점수 1");
  await expect(card).toContainText("앱이 대신 눌러 봤어요: 점수 2");
  await expect(card.locator("select")).toHaveValue("fail");

  // 규칙을 고치면(한 번만 채점) 같은 실험이 예상대로 된다.
  await page.goto(`#/work/${id}/2`);
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  await page.goto(`#/work/${id}/3`);
  await design.locator("summary").click();
  await design
    .getByLabel("어떻게 눌러 볼까요?")
    .selectOption({ label: "문제 □에서 정답을 두 번 고르기 → 점수" });
  await design.getByLabel("예상 결과 (숫자나 문구)").fill("1");
  await design.getByRole("button", { name: "실험하고 기록하기" }).click();
  await expect(page.locator(".toast")).toContainText("예상대로였어요");
  await expect(
    page.locator(".check-card.pass").filter({ hasText: "내가 설계한 검사" }),
  ).toContainText("점수 1");
});
