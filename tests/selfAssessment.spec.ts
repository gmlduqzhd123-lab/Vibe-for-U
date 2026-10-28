import { test, expect } from "@playwright/test";
const step = async (page: import("@playwright/test").Page, n: number) =>
  page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(n)
    .click();

test("힌트를 열면 기록되고, 자기 평가는 포트폴리오에서 선생님 평가와 나란히 나온다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-2");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await step(page, 2);
  await page.getByText("막히면 힌트를 열어 보세요").click();
  await page.getByText("힌트 2", { exact: true }).click();
  await page.getByText("힌트 1", { exact: true }).click();

  await step(page, 4);
  const self = page.locator(".self-assessment");
  await self
    .getByRole("group", { name: "검사와 수정" })
    .getByRole("radio", { name: /^수행/ })
    .check();
  await self
    .getByLabel("스스로 돌아보며 다음에 해 볼 것")
    .fill("다음에는 예상을 먼저 적을래요.");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    self
      .getByRole("group", { name: "검사와 수정" })
      .getByRole("radio", { name: /^수행/ }),
  ).toBeChecked();

  await page.getByRole("button", { name: "포트폴리오 모아 보기" }).click();
  const portfolio = page.locator(".portfolio");
  await expect(portfolio).toContainText("미션 힌트: 2번째 힌트까지 열어 봄");
  const table = portfolio.locator(".teacher-feedback table");
  const row = table.locator("tbody tr").filter({ hasText: "검사와 수정" });
  await expect(row.locator("td").nth(1)).toContainText("수행");
  await expect(row.locator("td").nth(2)).toContainText("미평가");
  await expect(portfolio).toContainText("다음에는 예상을 먼저 적을래요.");
});
