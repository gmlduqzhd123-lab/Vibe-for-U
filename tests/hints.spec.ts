import { test, expect } from "@playwright/test";

test("자동 검사가 실패하면 앱이 찾은 문제와 맞춤 힌트를 보여 준다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  const hints = page.locator(".smart-hints");
  await expect(hints).toHaveCount(0);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(hints).toContainText(
    "같은 정답을 여러 번 누르면 점수가 또 올라요.",
  );
  await expect(hints.getByText(/채점 규칙/)).toBeHidden();
  await hints.getByText("힌트 보기").click();
  await expect(hints.getByText(/채점 규칙/)).toBeVisible();
});

test("정상 규칙 작품은 자동 검사를 해도 맞춤 힌트가 나오지 않는다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(page.getByText("모두 통과했어요")).toBeVisible();
  await expect(page.locator(".smart-hints")).toHaveCount(0);
});
