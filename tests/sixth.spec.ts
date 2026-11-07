import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
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

test("버그 탐정 일지: 네 칸을 다 적으면 선반에 표시되고 성장 포트폴리오에 모인다", async ({
  page,
}) => {
  await page.goto("#/bughunt");
  await page.getByRole("button", { name: "분류하기" }).click();
  await expect(page).toHaveURL(/#\/work\/.+\/2/);
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  const journal = page.locator(".debug-log");
  await expect(journal).toContainText("버그 탐정 일지");
  await journal.getByLabel("의심한 곳").fill("바구니 순서가 이상해요.");
  await journal.getByLabel("해 본 실험").fill("모두 넣기를 눌렀어요.");
  await journal.getByLabel("실험 결과").fill("한 바구니가 비었어요.");
  await journal.getByLabel("고친 것").fill("좁은 조건을 위로 올렸어요.");
  await axe(page, ".debug-log");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto("#/bughunt");
  await expect(page.locator(".bug-hunt-list")).toContainText("일지 다 적음");
  await page.goto("#/growth");
  const growth = page.locator(".growth-journal");
  await expect(growth).toContainText("버그 탐정 일지 1편");
  await expect(growth).toContainText("좁은 조건을 위로 올렸어요.");
});

test("짝 활동: 역할을 바꾼 기록이 포트폴리오에 남는다", async ({ page }) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  const panel = page.locator(".pair-panel");
  await panel.locator("summary").click();
  await panel.getByRole("button", { name: "짝 활동 시작" }).click();
  await panel.getByLabel("짝 1 이름이나 별명").fill("별");
  await panel.getByLabel("짝 2 이름이나 별명").fill("달");
  await expect(panel.locator("summary")).toContainText("조종사 별 · 길잡이 달");
  await axe(page, ".pair-panel");
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(2)
    .click();
  await panel.getByRole("button", { name: "역할 바꾸기" }).click();
  await expect(page.locator(".toast")).toContainText(
    "이제 달 님이 조종사예요.",
  );
  await expect(panel).toContainText("역할을 바꾼 기록 1번");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  const record = page.locator(".pair-record");
  await expect(record.locator("li")).toHaveCount(2);
  await expect(record.locator("li").nth(1)).toContainText(
    "예상하고 실행 · 조종사 달 · 길잡이 별",
  );
});

test("보호자용 소개 한 장: 그 한 장만 인쇄하고 QR이 함께 나온다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.print = () => {
      (window as unknown as { printed: string }).printed =
        document.documentElement.dataset.print ?? "";
    };
  });
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("우리 집 퀴즈");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/portfolio/${id}`);
  await expect(page.locator(".family-sheet")).toBeHidden();
  await page.getByRole("button", { name: "보호자용 소개 한 장" }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { printed: string }).printed,
    ),
  ).toBe("family");
  await page.emulateMedia({ media: "print" });
  const card = page.locator(".family-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("우리 집 퀴즈");
  await expect(card).toContainText("고친 점과 이유");
  await expect(
    card.getByRole("img", { name: "작품을 열어 보는 QR 코드" }),
  ).toBeVisible();
  await expect(page.locator(".portfolio")).toBeHidden();
  await page.emulateMedia({ media: "screen" });
});

test("백업 알림: 바뀐 작품이 많으면 선반에서 권하고, 백업하면 사라진다", async ({
  page,
}) => {
  for (const id of ["quiz-1", "story-1", "timer-1"]) {
    await page.goto(`#/mission/${id}`);
    await page
      .getByRole("button", { name: "이 미션 시작하기", exact: true })
      .click();
    await expect(
      page.getByText("기기에 저장됨", { exact: true }),
    ).toBeVisible();
  }
  await page.goto("#/library");
  const reminder = page.locator(".backup-reminder");
  await expect(reminder).toContainText(
    "작품 3개가 마지막 백업 뒤에 바뀌었어요.",
  );
  await axe(page, ".backup-reminder");
  const download = page.waitForEvent("download");
  await reminder.getByRole("button", { name: "지금 목록 백업" }).click();
  await download;
  await expect(reminder).toHaveCount(0);
});

test("학급 모으기: 많이 만난 버그를 세고, 의견 문장을 눌러 넣고 내 문장을 저장한다", async ({
  page,
}) => {
  const bugged = missions.find((m) => m.id === "quiz-3")!;
  const a = makeWork(bugged);
  const b = makeWork(bugged);
  if (b.draft.config.kind === "quiz") b.draft.config.scoring = "once";
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    [a, b].map((w, i) => ({
      name: `${i + 1}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const bugs = page.locator(".bug-board");
  await expect(bugs.locator("tbody tr").first()).toContainText(
    "같은 정답에 점수가 또 올라요",
  );
  await expect(bugs.locator("tbody tr").first()).toContainText("2명");
  await expect(bugs.locator("tbody tr").first()).toContainText("1 / 2");
  await axe(page, ".bug-board");

  const card = page.locator(".review-card").first();
  await card.locator("summary").first().click();
  const bank = card.locator(".phrase-bank");
  await bank.locator("summary").click();
  await bank
    .getByRole("button", { name: "바꾼 이유를 자기 말로 설명했어요." })
    .click();
  const note = card.getByLabel("확인한 근거와 다음 도움");
  await expect(note).toHaveValue("바꾼 이유를 자기 말로 설명했어요.");
  await bank.getByLabel("새 문장").fill("검사 기록이 꼼꼼해요.");
  await bank.getByRole("button", { name: "내 문장으로 저장" }).click();
  await bank
    .getByRole("button", { name: "검사 기록이 꼼꼼해요.", exact: true })
    .click();
  await expect(note).toHaveValue(
    "바꾼 이유를 자기 말로 설명했어요.\n검사 기록이 꼼꼼해요.",
  );
  await axe(page, ".phrase-bank");
  // 내 문장은 새로고침해도 남는다.
  await page.reload();
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  const again = page.locator(".review-card").first();
  await again.locator("summary").first().click();
  await again.locator(".phrase-bank summary").click();
  await expect(
    again.getByRole("button", { name: "검사 기록이 꼼꼼해요.", exact: true }),
  ).toBeVisible();
});

test("영어 번역 고치기: 고친 문장이 영어 화면에 바로 나오고 원래대로 되돌릴 수 있다", async ({
  page,
}) => {
  await page.goto("#/teacher");
  await page.getByRole("button", { name: "영어 번역 고치기" }).click();
  const fix = page.locator(".translation-fix");
  await fix.getByLabel("한국어나 영어로 찾기").fill("미션 공작대");
  const row = fix.locator(".fix-list li").filter({
    has: page.locator('p[lang="ko"]', { hasText: /^미션 공작대$/ }),
  });
  await expect(row).toHaveCount(1);
  await row.getByLabel("영어 문장").fill("Mission Lab");
  await row.getByRole("button", { name: "고친 번역 저장" }).click();
  await expect(page.locator(".toast")).toContainText("번역을 고쳤어요");
  // 값 자리를 빠뜨리면 저장하지 않는다.
  await fix.getByLabel("한국어나 영어로 찾기").fill("버전 {n}개");
  const slot = fix.locator(".fix-list li").first();
  await slot.getByLabel("영어 문장").fill("versions");
  await slot.getByRole("button", { name: "고친 번역 저장" }).click();
  await expect(page.locator(".toast")).toContainText("같은 {값} 자리");
  await axe(page, ".translation-fix");

  await page.getByLabel("언어 · Language").selectOption("en");
  const nav = page.getByRole("navigation", { name: "Main menu" });
  await expect(nav.getByRole("button", { name: "Mission Lab" })).toBeVisible();
  // 새로고침해도 고친 번역이 남는다.
  await page.reload();
  await expect(nav.getByRole("button", { name: "Mission Lab" })).toBeVisible();
  await page.getByRole("button", { name: "Fix English translations" }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: /Download 1 fixed sentences/ })
    .click();
  const file = await (await download).path();
  const data = JSON.parse(
    await (await import("node:fs/promises")).readFile(file!, "utf8"),
  );
  expect(data).toEqual({
    format: "ttukttak-vibe-en-fixes",
    version: 1,
    fixes: { "미션 공작대": "Mission Lab" },
  });
  await page.getByLabel("Search in Korean or English").fill("");
  await page.getByRole("button", { name: "Restore original" }).click();
  await expect(nav.getByRole("button", { name: "Missions" })).toBeVisible();
});
