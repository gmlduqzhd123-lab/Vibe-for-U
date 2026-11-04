import { test, expect } from "@playwright/test";

test("작품 파일에 최근 되돌리기 단계가 담겨 다른 기기에서도 되돌릴 수 있다", async ({
  page,
  browser,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const title = page.getByLabel("작품 제목", { exact: true });
  await title.fill("첫 제목");
  // 잇달아 치는 글자는 한 단계로 묶이므로 잠시 쉬고 다음 단계를 만든다.
  await page.waitForTimeout(900);
  await title.fill("둘째 제목");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "파일 백업", exact: true }).click();
  const file = await (await download).path();
  const { readFile } = await import("node:fs/promises");
  const data = JSON.parse(await readFile(file!, "utf8"));
  const steps = Object.values(data.undo as Record<string, unknown[]>)[0];
  expect(steps.length).toBeGreaterThanOrEqual(2);
  expect(steps.length).toBeLessThanOrEqual(5);

  // 다른 기기(새 브라우저 문맥): 가져온 복사본에서 되돌리기가 바로 된다.
  const other = await browser.newContext();
  const student = await other.newPage();
  await student.goto(page.url().split("#")[0] + "#/library");
  await student.locator("input[type=file]").setInputFiles(file!);
  await expect(student.locator(".toast")).toContainText(
    "최근 되돌리기 기록도 함께 왔어요",
  );
  await student.getByRole("button", { name: "작품 열기" }).first().click();
  const imported = student.getByLabel("작품 제목", { exact: true });
  await expect(imported).toHaveValue("둘째 제목");
  const undo = student.getByRole("button", { name: "↶ 되돌리기" });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(imported).toHaveValue("첫 제목");
  await undo.click();
  await expect(imported).toHaveValue("선택이 정답을 만났을 때");
  await other.close();
});
