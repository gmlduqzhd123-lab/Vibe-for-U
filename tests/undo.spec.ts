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

test("버전 복원도 되돌릴 수 있고, 같은 탭에서는 새로고침해도 되돌리기가 남는다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const title = page.getByLabel("작품 제목", { exact: true });
  await title.fill("복원 전 제목");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  const versions = page.locator(".version-list > div");
  await expect(versions).toHaveCount(1);
  await page.getByRole("button", { name: "이 버전 복원" }).first().click();
  await expect(title).toHaveValue("선택이 정답을 만났을 때");
  await expect(versions).toHaveCount(2);

  await page.reload();
  const undo = page.getByRole("button", { name: "↶ 되돌리기" });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(title).toHaveValue("복원 전 제목");
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  await expect(versions).toHaveCount(1);
  await page.getByRole("button", { name: "↷ 다시 하기" }).click();
  await expect(title).toHaveValue("선택이 정답을 만났을 때");
  await expect(versions).toHaveCount(2);
});
