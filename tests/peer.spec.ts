import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

test("친구 검사 요청 파일을 다른 기기에서 검사하고 결과를 가져와 기록으로 더한다", async ({
  page,
  browser,
}) => {
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(3)
    .click();
  const requested = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "친구 검사 요청 파일 만들기" })
    .click();
  const requestFile = await (await requested).path();

  // 친구의 기기
  const friendDevice = await browser.newContext();
  const friend = await friendDevice.newPage();
  await friend.goto("#/library");
  await friend.getByRole("button", { name: "친구 작품 검사하기" }).click();
  await expect(friend.getByRole("heading", { level: 1 })).toHaveText(
    "친구 작품 검사하기",
  );
  await friend.getByLabel("친구 검사 요청 파일").setInputFiles(requestFile!);
  await expect(friend.getByRole("heading", { level: 2 }).first()).toHaveText(
    "어라? 점수가 또 올라가요!",
  );
  for (let i = 0; i < 3; i++)
    await friend.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
  await expect(friend.getByTestId("score")).toHaveText("3점");
  await friend.getByLabel("검사한 친구 (이름이나 별명)").fill("민준");
  await friend
    .getByLabel("같은 정답 세 번 누르기 · 실제로 본 결과")
    .fill("세 번 눌렀더니 3점이 됐어요.");
  await friend.getByLabel("같은 정답 세 번 누르기 · 판정").selectOption("fail");
  await friend
    .getByLabel("이해된 점과 헷갈린 점")
    .fill("점수가 빨리 올라가요.");
  const audit = await new AxeBuilder({ page: friend })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  const responded = friend.waitForEvent("download");
  await friend.getByRole("button", { name: "검사 결과 파일 내려받기" }).click();
  // 친구 기기를 닫으면 내려받은 파일도 지워지므로 내용을 보관한다.
  const responseText = await fs.readFile(
    (await (await responded).path())!,
    "utf8",
  );
  const response = JSON.parse(responseText);
  expect(response.format).toBe("ttukttak-vibe-peer-response");
  // 친구 기기에는 작품이 저장되지 않는다.
  await friend.goto("#/library");
  await expect(friend.locator(".work-card")).toHaveCount(0);
  await friendDevice.close();

  // 원래 학생이 결과를 가져온다.
  await page.goto("#/library");
  // 테스트용 Chromium은 한글이 든 경로의 파일을 넣지 못해 내용으로 넘긴다.
  await page.locator("input[type=file]").setInputFiles({
    name: "친구검사결과.json",
    mimeType: "application/json",
    buffer: Buffer.from(responseText),
  });
  await expect(page).toHaveURL(/#\/work\/.+\/3$/);
  const peer = page
    .locator(".check-card")
    .filter({ hasText: "같은 정답 세 번 누르기 · 민준" });
  await expect(peer).toBeVisible();
  await expect(peer).toContainText("친구·교사 의견");
  await expect(
    page.getByRole("status").filter({ hasText: "민준의 검사 결과" }),
  ).toBeVisible();
});

test("요청한 작품을 찾지 못하면 붙일 작품을 고르고, 같은 미션 작품을 먼저 보여 준다", async ({
  page,
}) => {
  for (const id of ["timer-1", "quiz-3"]) {
    await page.goto(`#/mission/${id}`);
    await page
      .getByRole("button", { name: "이 미션 시작하기", exact: true })
      .click();
    await expect(
      page.getByText("기기에 저장됨", { exact: true }),
    ).toBeVisible();
  }
  // 작품을 파일로 옮겨 이름표가 바뀐 뒤 받은 결과 파일
  const response = {
    format: "ttukttak-vibe-peer-response",
    version: 1,
    workId: "moved-away",
    revision: "old-revision",
    reviewer: "서연",
    results: [
      {
        label: "같은 정답 세 번 누르기",
        expected: "한 번만",
        actual: "3점이 됐어요",
        status: "fail",
      },
    ],
    comment: "",
    at: new Date().toISOString(),
    missionId: "quiz-3",
    title: "어라? 점수가 또 올라가요!",
  };
  await page.goto("#/library");
  await page.locator("input[type=file]").setInputFiles({
    name: "친구검사결과.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(response)),
  });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "검사 결과를 붙일 작품 고르기",
  );
  const first = page.locator(".peer-apply-list li").first();
  await expect(first).toContainText("어라? 점수가 또 올라가요!");
  await expect(first).toContainText("같은 미션");
  await first.getByRole("button", { name: /검사 결과 합치기/ }).click();
  await expect(page).toHaveURL(/#\/work\/.+\/3$/);
  // 결과는 옛 설정 버전의 검사라 작업실이 아닌 포트폴리오의 검사 기록에 나온다.
  await expect(
    page.getByRole("status").filter({ hasText: "서연의 검사 결과" }),
  ).toBeVisible();
  await expect(page.getByText(/이전 설정의 검사 1개/)).toBeVisible();
  await page.getByRole("button", { name: "과정 포트폴리오" }).click();
  await expect(page.locator(".portfolio")).toContainText(
    "같은 정답 세 번 누르기 · 서연",
  );
});
