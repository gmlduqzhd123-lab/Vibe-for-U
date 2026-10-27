import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

test("교사가 학생 파일을 모아 단계 표를 보고 평가를 학생에게 돌려준다", async ({
  page,
  browser,
}) => {
  // 테스트용 Chromium은 한글 파일 이름을 "download"로 바꾸므로, 앱이 붙인 이름을 따로 기록한다.
  await page.addInitScript(() => {
    const names: string[] = [];
    (window as unknown as { names: string[] }).names = names;
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) names.push(this.download);
      return click.call(this);
    };
  });
  const lastName = () =>
    page.evaluate(() =>
      (window as unknown as { names: string[] }).names.at(-1),
    );
  // 학생 작품 하나를 만들어 파일로 내보낸다.
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("민서의 퀴즈");
  await page
    .getByRole("button", { name: "이 약속으로 만들기", exact: true })
    .click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const exported = page.waitForEvent("download");
  await page.getByRole("button", { name: "파일 백업", exact: true }).click();
  const studentFile = await (await exported).path();
  const student = await fs.readFile(studentFile!);

  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles([
    { name: "07-민서.json", mimeType: "application/json", buffer: student },
    {
      name: "깨진.json",
      mimeType: "application/json",
      buffer: Buffer.from("{"),
    },
  ]);
  await expect(page.locator(".warning")).toContainText("깨진.json");
  const table = page.locator(".class-table");
  await expect(table).toContainText("07-민서.json");
  await expect(table).toContainText("민서의 퀴즈");
  await expect(
    table.locator("tbody tr").first().locator("td").nth(1),
  ).toHaveText("✓ 완료");
  await expect(table).toContainText("평가 전");

  const card = page.locator(".review-card").first();
  await card.locator("summary").click();
  for (const legend of [
    "문제와 요구사항",
    "작동 원리 이해",
    "검사와 수정",
    "설명과 새로운 과제에 적용",
  ])
    await card
      .getByRole("group", { name: legend })
      .getByRole("radio", { name: /^수행/ })
      .check();
  await card.getByLabel("확인한 근거와 다음 도움").fill("약속을 고쳐 썼어요.");
  await expect(table).toContainText("평가 완료");

  const accessibility = await new AxeBuilder({ page })
    .include(".class-review")
    .analyze();
  expect(accessibility.violations).toEqual([]);

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "표 CSV로 내려받기" }).click();
  const csvD = await csvDownload;
  expect(await lastName()).toMatch(/^뚝딱-학급-평가-.*\.csv$/);
  const csv = await fs.readFile((await csvD.path())!, "utf8");
  expect(csv).toContain("07-민서.json");
  expect(csv).toContain("수행,수행,수행,수행,약속을 고쳐 썼어요.");

  const returned = page.waitForEvent("download");
  await card
    .getByRole("button", { name: "평가를 넣은 작품 파일 내려받기" })
    .click();
  const back = await returned;
  expect(await lastName()).toBe("07-민서-평가.json");

  // 다른 기기의 학생이 평가 파일을 가져오면 포트폴리오에서 평가를 본다.
  const studentDevice = await browser.newContext();
  const home = await studentDevice.newPage();
  await home.goto("#/library");
  await home.locator("input[type=file]").setInputFiles((await back.path())!);
  await expect(home.locator(".work-card")).toHaveCount(1);
  await home.getByRole("button", { name: "포트폴리오" }).click();
  const feedback = home.locator(".teacher-feedback");
  await expect(feedback).toContainText("선생님의 과정 평가");
  await expect(feedback).toContainText("수행");
  await expect(feedback).toContainText("약속을 고쳐 썼어요.");
  await studentDevice.close();
});
