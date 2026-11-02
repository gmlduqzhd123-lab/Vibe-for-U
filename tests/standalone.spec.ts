import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function exportApp(page: Page, mission: string, title: string) {
  await page.goto(`#/mission/${mission}`);
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill(title);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "앱 파일로 내보내기" }).click();
  const file = await download;
  // 내려받은 임시 파일에는 확장자가 없어 .html로 저장해 연다.
  const path = test.info().outputPath(`${mission}.html`);
  await file.saveAs(path);
  return path;
}

test("퀴즈 작품을 혼자 열리는 HTML로 내보내 앱 없이 풀어 본다", async ({
  page,
  context,
}) => {
  const title = "</script><img src=x onerror=alert(1)>우리 퀴즈";
  const path = await exportApp(page, "quiz-1", title);
  let dialogs = 0;
  const app = await context.newPage();
  app.on("dialog", (d) => {
    dialogs++;
    void d.dismiss();
  });
  // 외부 요청이 하나도 없어야 한다.
  const requests: string[] = [];
  app.on("request", (r) => {
    if (!r.url().startsWith("file:")) requests.push(r.url());
  });
  await app.goto(`file://${path}`);
  await expect(app.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(app.locator("img")).toHaveCount(0);
  const next = app.getByRole("button", { name: /다음 문제|결과 보기/ });
  await expect(next).toBeDisabled();
  await app.locator(".choices button").first().click();
  await expect(next).toBeEnabled();
  // 문제를 모두 넘기면 결과와 점수가 나온다.
  for (let i = 0; i < 10; i++) {
    const done = await app.getByRole("heading", { name: "결과" }).count();
    if (done) break;
    if (await next.isDisabled())
      await app.locator(".choices button").first().click();
    await next.click();
  }
  await expect(app.getByRole("heading", { name: "결과" })).toBeVisible();
  await expect(app.locator(".big")).toHaveText(/\d+점/);
  expect(dialogs).toBe(0);
  expect(requests).toEqual([]);
});

test("패턴 작품 HTML은 그리기를 누르면 앱과 같은 칸을 칠한다", async ({
  page,
  context,
}) => {
  const path = await exportApp(page, "pattern-1", "계단 그림");
  const app = await context.newPage();
  await app.goto(`file://${path}`);
  await expect(app.locator(".board span")).not.toHaveCount(0);
  await app.getByRole("button", { name: "그리기" }).click();
  await expect(app.getByRole("status")).toHaveText(
    "다 그렸어요. 목표 모양과 같아요!",
    { timeout: 10000 },
  );
  const painted = await app.locator(".board span.painted").count();
  const target = await app.locator(".board span.target").count();
  expect(painted).toBe(target);
});
