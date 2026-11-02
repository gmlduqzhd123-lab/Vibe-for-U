import { test, expect } from "@playwright/test";

test("버그 탐정 무한 연습: 숨은 버그를 맞춤 힌트로 찾고 고치면 고친 도전으로 센다", async ({
  page,
}) => {
  await page.goto("#/bughunt");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "버그 탐정 무한 연습",
  );
  await expect(page.getByText("찾아 고친 버그 0개 / 도전 0개")).toBeVisible();
  await page.getByRole("button", { name: "퀴즈", exact: true }).click();
  await expect(page).toHaveURL(/#\/work\/.+\/2$/);
  await expect(page.getByLabel("작품 제목", { exact: true })).toHaveCount(0);
  const id = page.url().split("/work/")[1].split("/")[0];

  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(page.locator(".smart-hints")).toBeVisible();

  // 정상 규칙으로 고친다(숨은 버그가 무엇이든 두 규칙을 모두 바로잡는다).
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("채점 규칙").selectOption("once");
  await page.getByLabel("다시 시작할 때 점수 초기화").check();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(page.getByText("모두 통과했어요")).toBeVisible();
  await expect(page.locator(".smart-hints")).toHaveCount(0);

  await page.goto("#/bughunt");
  await expect(page.getByText("찾아 고친 버그 1개 / 도전 1개")).toBeVisible();
  await expect(page.locator(".bug-hunt-list")).toContainText("고쳤어요");
});
