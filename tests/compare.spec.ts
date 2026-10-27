import { test, expect } from "@playwright/test";

test("두 버전의 바뀐 규칙을 표시하고 나란히 실행해 결과를 비교한다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(2)
    .click();
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  const diff = page.locator(".compare-diff");
  await expect(diff.locator(".diff-removed")).toHaveText(
    "이전에만 있음: 채점: 정답을 누를 때마다 (학습용 오류)",
  );
  await expect(diff.locator(".diff-added")).toHaveText(
    "다음에 새로 생김: 채점: 문제마다 한 번만",
  );

  await diff
    .getByRole("button", { name: "두 버전 나란히 실행해 보기" })
    .click();
  for (const [name, score] of [
    ["이전 버전 실행", "3점"],
    ["다음 버전 실행", "1점"],
  ]) {
    const run = page.getByRole("region", { name });
    for (let i = 0; i < 3; i++)
      await run.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
    await expect(run.getByTestId("score")).toHaveText(score);
  }
  // 비교 실행은 실행 기록으로 남지 않는다.
  await expect(page.locator(".prediction-nudge")).toBeVisible();
  await diff.getByRole("button", { name: "나란히 실행 닫기" }).click();
  await expect(
    page.getByRole("region", { name: "이전 버전 실행" }),
  ).toBeHidden();
});
