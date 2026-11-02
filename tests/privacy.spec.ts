import { test, expect } from "@playwright/test";

test("내보내기 전에 개인정보처럼 보이는 글을 알리고, 확인해야 보낸다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page
    .getByLabel("작품 제목", { exact: true })
    .fill("민서 퀴즈 010-1234-5678");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  let downloads = 0;
  page.on("download", () => downloads++);

  await page.getByRole("button", { name: "파일 백업", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("보내기 전에 확인해요");
  await expect(dialog).toContainText("전화번호(작품 제목");
  // 경고 창에 번호 전체를 다시 보여 주지 않는다.
  await expect(dialog).not.toContainText("1234-5678");
  await dialog.getByRole("button", { name: "취소" }).click();
  await expect(dialog).toBeHidden();
  expect(downloads).toBe(0);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "앱 파일로 내보내기" }).click();
  await dialog.getByRole("button", { name: "그대로 보내기" }).click();
  await download;
  expect(downloads).toBe(1);

  // 개인정보를 지우면 바로 보낸다.
  await page.getByLabel("작품 제목", { exact: true }).fill("민서 퀴즈");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const second = page.waitForEvent("download");
  await page.getByRole("button", { name: "파일 백업", exact: true }).click();
  await second;
  await expect(dialog).toBeHidden();
});
