import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";
const axe = async (page: import("@playwright/test").Page, sel: string) =>
  expect(
    (
      await new AxeBuilder({ page })
        .include(sel)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
const start = async (page: import("@playwright/test").Page, id: string) => {
  await page.goto(`#/mission/${id}`);
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  return page.url().split("/work/")[1].split("/")[0];
};

test("분류 앱 그리고·또는: 둘째 조건을 바꾸면 들어가는 바구니가 달라진다", async ({
  page,
}) => {
  const id = await start(page, "sort-5");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  await expect(preview).toContainText(
    "다음 카드: 「나비」 다리 수 6 · 날개 수 4",
  );
  await expect(preview.locator(".sort-bins li").first()).toContainText(
    "다리 수 6과 같으면 그리고 날개 수 1 이상이면",
  );
  await preview.getByRole("button", { name: "모두 넣기" }).click();
  const flying = preview.locator(".sort-bins li", { hasText: "나는 곤충" });
  await expect(flying).toContainText("나비");
  await expect(flying).toContainText("벌");
  await expect(flying).not.toContainText("참새");
  await expect(
    preview.locator(".sort-bins li", { hasText: "걷는 곤충" }),
  ).toContainText("개미");
  // '그리고'를 '또는'으로 바꾸면 날개만 있는 참새도 들어간다.
  await page.getByLabel("바구니 1 둘째 조건 잇기").selectOption("or");
  await preview.getByRole("button", { name: "모두 넣기" }).click();
  await expect(flying).toContainText("참새");
  await axe(page, ".settings");
  // 둘째 특징을 비우면 둘째 조건 칸이 사라지고 특징 하나로만 나눈다.
  await page
    .getByLabel("둘째 특징 이름 (비우면 특징 하나로만 나눠요)")
    .fill("");
  await expect(page.getByLabel("바구니 1 둘째 조건 잇기")).toHaveCount(0);
  await expect(preview).toContainText("다음 카드: 「나비」 다리 수 6");
});

test("포트폴리오의 빠진 기록 살펴보기: 비어 있는 기록을 알려 주고 그 단계로 간다", async ({
  page,
}) => {
  const id = await start(page, "quiz-1");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  const gaps = page.locator(".portfolio-gaps");
  await expect(gaps).toContainText(
    "「예상하고 실행」 단계에 기록할 내용이 남았어요.",
  );
  await expect(gaps).toContainText("스스로 평가를 아직 다 고르지 않았어요.");
  await axe(page, ".portfolio-gaps");
  await gaps
    .locator("li", { hasText: "예상하고 실행" })
    .getByRole("button", { name: "채우러 가기" })
    .click();
  await expect(page).toHaveURL(new RegExp(`#/work/${id}/2$`));
  // 예상을 적고 눌러 보면 '표시하지 않았어요'와 '증거가 없어요'가 새로 나온다.
  await page.getByLabel("실행 전 나의 예상").fill("정답이면 1점");
  await page.locator(".preview-panel .answers button").first().click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  await expect(gaps).not.toContainText("「예상하고 실행」");
  await expect(gaps).toContainText("예상이 맞았는지 아직 표시하지 않았어요.");
  await expect(gaps).toContainText("실행 기록 증거가 없어요.");
});

test("친구 검사: 친구가 눌러 본 순서를 증거로 담아 돌려주면 검사 기록으로 더해진다", async ({
  page,
  browser,
}) => {
  const id = await start(page, "quiz-3");
  await page.goto(`#/work/${id}/3`);
  const requested = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "친구 검사 요청 파일 만들기" })
    .click();
  const requestFile = await (await requested).path();
  const friendDevice = await browser.newContext();
  const friend = await friendDevice.newPage();
  await friend.goto("#/library");
  await friend.getByRole("button", { name: "친구 작품 검사하기" }).click();
  await friend.getByLabel("친구 검사 요청 파일").setInputFiles(requestFile!);
  await friend.getByLabel("검사한 친구 (이름이나 별명)").fill("달");
  const answer = friend.locator(".answers button").first();
  await answer.click();
  await answer.click();
  await friend.getByRole("button", { name: /이 기록을 증거로 남기기/ }).click();
  await expect(
    friend.getByText("검사 결과에 담을 실행 기록 2개"),
  ).toBeVisible();
  const responded = friend.waitForEvent("download");
  await friend.getByRole("button", { name: "검사 결과 파일 내려받기" }).click();
  const responseText = await fs.readFile(
    (await (await responded).path())!,
    "utf8",
  );
  await friendDevice.close();
  expect(JSON.parse(responseText).runLog).toHaveLength(2);
  await page.goto("#/library");
  await page.locator("input[type=file]").setInputFiles({
    name: "친구검사결과.json",
    mimeType: "application/json",
    buffer: Buffer.from(responseText),
  });
  await expect(page).toHaveURL(/#\/work\/.+\/3$/);
  const card = page
    .locator(".check-card")
    .filter({ hasText: "친구가 눌러 본 순서 · 달" });
  await expect(card).toContainText("1. 선택 1 → 점수 0 → 1");
  await expect(card).toContainText("2. 선택 1 → 점수 1 → 2");
});

test("학급 모으기: 짝·일지 표시, 보호자 카드 모두 인쇄, 평가 목록을 다른 기기로 옮기기", async ({
  page,
  browser,
}) => {
  await page.addInitScript(() => {
    window.print = () => {
      (window as unknown as { printed: string }).printed =
        document.documentElement.dataset.print ?? "";
    };
  });
  const a = makeWork(missions[0]);
  a.draft.title = "짝과 만든 퀴즈";
  a.draft.pair = {
    a: "별",
    b: "달",
    swaps: [
      { at: a.createdAt, driver: "a", stage: 0 },
      { at: a.createdAt, driver: "b", stage: 2 },
    ],
  };
  a.draft.debugLog = {
    suspect: "채점 규칙",
    experiment: "세 번 누름",
    result: "3점",
    fix: "한 번만 채점",
  };
  const b = makeWork(missions[1]);
  b.draft.title = "혼자 만든 퀴즈";
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    [a, b].map((w, i) => ({
      name: `${i + 1}번.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const rows = page.locator(".class-table tbody tr");
  await expect(rows.nth(0)).toContainText("역할 교대 1번 · 일지 적음");
  await expect(rows.nth(1)).toContainText("–");
  const card = page.locator(".review-card").first();
  await card.locator("summary").first().click();
  await expect(card).toContainText("의심한 곳: 채점 규칙");
  await expect(card).toContainText("별 · 달 · 역할 교대 1번");
  await card.getByLabel("확인한 근거와 다음 도움").fill("일지가 꼼꼼해요.");

  // 보호자 카드 모두 인쇄: 그 인쇄 때만 카드 두 장이 보인다.
  await page
    .getByRole("button", { name: "보호자용 소개 카드 모두 인쇄" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { printed: string }).printed),
    )
    .toBe("families");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".families-sheet .family-card")).toHaveCount(2);
  // 인쇄 창은 모든 카드의 QR이 그려진 뒤에 열린다.
  await expect(
    page
      .locator(".families-sheet")
      .getByRole("img", { name: "작품을 열어 보는 QR 코드" }),
  ).toHaveCount(2);
  await expect(page.locator(".families-sheet")).toContainText("짝과 만든 퀴즈");
  await expect(page.locator(".class-table")).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  // 평가 목록 옮기기: 다른 기기에서 열면 파일 이름과 평가 의견이 그대로 이어진다.
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "평가 목록 옮기기" }).click();
  const file = await (await download).path();
  const other = await browser.newContext();
  const teacher = await other.newPage();
  await teacher.goto(page.url().split("#")[0] + "#/teacher");
  await teacher
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await teacher.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(file!);
  await expect(teacher.locator(".class-table tbody tr").nth(0)).toContainText(
    "1번.json",
  );
  const moved = teacher.locator(".review-card").first();
  await moved.locator("summary").first().click();
  await expect(moved.getByLabel("확인한 근거와 다음 도움")).toHaveValue(
    "일지가 꼼꼼해요.",
  );
  await other.close();
});

test("영어 번역 고침 파일 가져오기: 다른 기기에서 받은 고침을 더하고 맞지 않는 문장은 넘어간다", async ({
  page,
}) => {
  await page.goto("#/teacher");
  await page.getByRole("button", { name: "영어 번역 고치기" }).click();
  const fix = page.locator(".translation-fix");
  await expect(fix.getByLabel("한국어나 영어로 찾기")).toBeVisible();
  await fix.getByLabel("고친 문장 JSON 파일").setInputFiles({
    name: "fixes.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "ttukttak-vibe-en-fixes",
        version: 1,
        fixes: {
          "미션 공작대": "Mission Lab",
          "버전 {n}개": "versions",
          "번역표에 없는 문장": "Nope",
        },
      }),
    ),
  });
  await expect(page.locator(".toast")).toContainText(
    "고친 문장 1개를 가져왔어요. 넘어간 문장 2개.",
  );
  await expect(fix.locator(".fix-list li.fixed")).toHaveCount(1);
  await page.getByLabel("언어 · Language").selectOption("en");
  await expect(
    page
      .getByRole("navigation", { name: "Main menu" })
      .getByRole("button", { name: "Mission Lab" }),
  ).toBeVisible();
});
