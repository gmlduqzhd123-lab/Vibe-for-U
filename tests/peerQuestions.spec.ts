import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("친구 검사 요청에 질문을 붙이면 친구가 답을 적고, 답이 검사 기록으로 돌아온다", async ({
  page,
  browser,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  await page
    .getByLabel("친구에게 물어볼 것 (선택 · 한 줄에 하나, 5개까지)")
    .fill("점수가 두 번 오르는지 확인해 줘\n안내 문장이 읽기 쉬워?");
  const requested = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "친구 검사 요청 파일 만들기" })
    .click();
  const requestFile = await (await requested).path();
  const request = JSON.parse(await fs.readFile(requestFile!, "utf8"));
  expect(request.questions).toEqual([
    "점수가 두 번 오르는지 확인해 줘",
    "안내 문장이 읽기 쉬워?",
  ]);

  const friendDevice = await browser.newContext();
  const friend = await friendDevice.newPage();
  await friend.goto("#/library");
  await friend.getByRole("button", { name: "친구 작품 검사하기" }).click();
  await friend.getByLabel("친구 검사 요청 파일").setInputFiles(requestFile!);
  const questions = friend.getByRole("group", { name: "친구가 물어본 것" });
  await expect(questions).toContainText(
    "질문 1: 점수가 두 번 오르는지 확인해 줘",
  );
  await friend.getByLabel("검사한 친구 (이름이나 별명)").fill("수아");
  await friend
    .getByLabel("질문 1: 점수가 두 번 오르는지 확인해 줘")
    .fill("응, 세 번 누르니 3점이 됐어.");
  const responded = friend.waitForEvent("download");
  await friend.getByRole("button", { name: "검사 결과 파일 내려받기" }).click();
  const responseText = await fs.readFile(
    (await (await responded).path())!,
    "utf8",
  );
  await friendDevice.close();

  await page.goto("#/library");
  await page.locator("input[type=file]").setInputFiles({
    name: "친구검사결과.json",
    mimeType: "application/json",
    buffer: Buffer.from(responseText),
  });
  await expect(page).toHaveURL(/#\/work\/.+\/3$/);
  const card = page.locator(".check-card").filter({ hasText: "질문 · 수아" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("점수가 두 번 오르는지 확인해 줘");
  await expect(card).toContainText("응, 세 번 누르니 3점이 됐어.");
  // 답을 비운 질문은 기록으로 만들지 않는다.
  await expect(
    page.locator(".check-card").filter({ hasText: "질문 · 수아" }),
  ).toHaveCount(1);
});
