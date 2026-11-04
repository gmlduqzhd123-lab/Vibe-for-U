import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { useClipboard } from "./support";

test("학급 모으기에서 평가를 QR로 돌려주면 학생이 비춰 바로 받는다", async ({
  page,
  browser,
}) => {
  // 학생: 작품을 만들어 파일로 낸다.
  const studentDevice = await browser.newContext();
  const student = await studentDevice.newPage();
  await student.goto("#/mission/quiz-1");
  await student
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await student.getByLabel("작품 제목", { exact: true }).fill("QR 평가 작품");
  await expect(
    student.getByText("기기에 저장됨", { exact: true }),
  ).toBeVisible();
  const exported = student.waitForEvent("download");
  await student.getByRole("button", { name: "파일 백업", exact: true }).click();
  const work = await fs.readFile((await (await exported).path())!);

  // 교사: 모아서 평가하고 QR로 돌려준다.
  const read = await useClipboard(page);
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page
    .getByLabel("학생 작품 JSON 파일 여러 개")
    .setInputFiles([
      { name: "12-수아.json", mimeType: "application/json", buffer: work },
    ]);
  const card = page.locator(".review-card").first();
  await card.locator("summary").click();
  await expect(
    card.getByRole("button", { name: "평가를 QR로 돌려주기" }),
  ).toHaveCount(0);
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
  await card.getByLabel("확인한 근거와 다음 도움").fill("QR로 보낸 평가예요.");
  await card.getByRole("button", { name: "평가를 QR로 돌려주기" }).click();
  const dialog = page.getByRole("dialog", { name: "평가를 QR로 돌려주기" });
  await dialog.getByRole("button", { name: "주소 복사" }).click();
  const url = await read();
  expect(url).toContain("#/receive/");

  // 학생: 주소를 열면 평가가 포트폴리오에 들어간다.
  await student.goto(url);
  await expect(student.getByRole("heading", { level: 1 })).toContainText(
    "선생님 평가가 왔어요",
  );
  await student.getByRole("button", { name: "평가 받기" }).click();
  await expect(student).toHaveURL(/#\/portfolio\//);
  await expect(student.locator(".teacher-feedback")).toContainText(
    "QR로 보낸 평가예요.",
  );
  await expect(student.locator(".teacher-feedback")).toContainText("수행");

  // 작품이 없는 기기에서는 받지 못한다고 알린다.
  const other = await browser.newContext();
  const stranger = await other.newPage();
  await stranger.goto(url);
  await stranger.getByRole("button", { name: "평가 받기" }).click();
  await expect(stranger.getByRole("alert")).toContainText("작품이 없어요");
  await other.close();
  await studentDevice.close();
});
