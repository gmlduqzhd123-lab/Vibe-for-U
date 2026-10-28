import { test, expect } from "@playwright/test";
const step = async (page: import("@playwright/test").Page, n: number) =>
  page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(n)
    .click();

test("되돌리기·다시 하기: 버튼과 단축키로 편집을 되돌리고 실행 기록은 넣지 않는다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const undo = page.getByRole("button", { name: "↶ 되돌리기" });
  const redo = page.getByRole("button", { name: "↷ 다시 하기" });
  await expect(undo).toBeDisabled();
  const title = page.getByLabel("작품 제목", { exact: true });
  await title.fill("첫 제목");
  await expect(undo).toBeEnabled();

  await step(page, 2);
  const scoring = page.getByRole("combobox", {
    name: "채점 규칙",
    exact: true,
  });
  await scoring.selectOption("once");
  // 실행 화면을 눌러도 되돌리기 대상이 늘지 않는다.
  await page.getByRole("button", { name: /1\s*햇빛과 물/ }).click();

  await undo.click();
  await expect(scoring).toHaveValue("attempt");
  await expect(redo).toBeEnabled();
  await redo.click();
  await expect(scoring).toHaveValue("once");

  // 입력 칸 밖에서는 Ctrl+Z가 앱의 되돌리기로 동작한다.
  await page.locator(".workspace-heading h1").click();
  await page.keyboard.press("Control+z");
  await expect(scoring).toHaveValue("attempt");
  await page.keyboard.press("Control+z");
  await step(page, 0);
  await expect(title).toHaveValue("어라? 점수가 또 올라가요!");
  await expect(undo).toBeDisabled();
  await page.keyboard.press("Control+Shift+z");
  await expect(title).toHaveValue("첫 제목");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.reload();
  await expect(title).toHaveValue("첫 제목");
});
