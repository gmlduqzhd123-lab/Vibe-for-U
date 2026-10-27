import { test, expect } from "@playwright/test";

test("같은 작품을 두 탭에서 열면 한 탭만 편집하고 다른 탭은 읽기 전용이다", async ({
  context,
}) => {
  const a = await context.newPage();
  await a.goto("#/mission/quiz-1");
  await a
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const title = a.getByLabel("작품 제목", { exact: true });
  await expect(title).toBeEditable();
  await expect(a.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const url = a.url();

  const b = await context.newPage();
  await b.goto(url);
  const lockB = b.locator(".tab-lock");
  await expect(lockB).toContainText("다른 탭에서 이 작품을 편집하고 있어요");
  await expect(b.getByLabel("작품 제목", { exact: true })).toBeDisabled();

  // 편집 중인 탭의 저장 내용이 읽기 전용 탭에도 반영된다.
  await title.fill("두 탭 검사");
  await expect(a.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await expect(b.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "두 탭 검사",
  );

  // 읽기 전용 탭에서 편집을 넘겨받으면 처음 탭이 읽기 전용이 된다.
  await lockB.getByRole("button", { name: "이 탭에서 편집하기" }).click();
  await expect(lockB).toBeHidden();
  await expect(b.getByLabel("작품 제목", { exact: true })).toBeEditable();
  await expect(a.locator(".tab-lock")).toBeVisible();
  await expect(title).toBeDisabled();

  // 편집 중인 탭이 작품을 떠나면 남은 탭이 이어받는다.
  await b.goto(url.replace(/#.*$/, "#/library"));
  await expect(a.locator(".tab-lock")).toBeHidden();
  await expect(title).toBeEditable();
});
