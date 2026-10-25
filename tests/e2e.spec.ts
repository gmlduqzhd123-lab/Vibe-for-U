import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const mission = async (
  page: import("@playwright/test").Page,
  id = "quiz-3",
  normal = false,
) => {
  await page.goto(`#/mission/${id}`);
  await page
    .getByRole("button", {
      name: normal ? "정상 규칙의 새 작품 만들기" : "이 미션 시작하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("navigation", { name: "학습 단계" }),
  ).toBeVisible();
};
const step = async (page: import("@playwright/test").Page, n: number) => {
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(n)
    .click();
};
const saved = async (page: import("@playwright/test").Page) => {
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
};
test("첫 방문 → 요청·예상 → 중복 점수 발견·수정 → 재검사 → 버전·성찰·새로고침", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("");
  await page
    .getByRole("button", { name: "첫 작품 만들기", exact: true })
    .click();
  await expect(page.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "선택이 정답을 만났을 때",
  );
  await page.getByRole("button", { name: "미션 공작대", exact: true }).click();
  await page
    .getByRole("button", { name: /어라\? 점수가 또 올라가요!/ })
    .click();
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await step(page, 1);
  await page
    .getByLabel("내가 처음 쓴 요청문 (원문)", { exact: true })
    .fill("친구가 쓸 퀴즈. 같은 정답은 한 번만 채점해 줘.");
  await page
    .getByRole("button", { name: "만들기 약속으로 요청문 정리", exact: true })
    .click();
  await expect(
    page.getByLabel("정리한 제작 요청문", { exact: true }),
  ).toHaveValue(/우리 반 친구/);
  await step(page, 2);
  await page
    .getByLabel("실행 전 나의 예상", { exact: true })
    .fill("정답을 세 번 눌러도 1점이어야 해요.");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
  await expect(page.getByTestId("score")).toHaveText("3점");
  await step(page, 3);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".check-card.fail").first()).toContainText("3점");
  await page
    .getByLabel("왜 이렇게 수정했나요?", { exact: true })
    .fill("이미 답한 문제인지 기억해야 중복 점수를 막을 수 있어요.");
  await page.getByLabel("기대한 결과", { exact: true }).fill("1점");
  await page.getByLabel("실제 결과", { exact: true }).fill("3점");
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  await page.getByLabel("이번 버전 이름", { exact: true }).fill("수정 전 검사");
  await page
    .getByRole("button", { name: "현재 편집본을 버전으로 저장", exact: true })
    .click();
  await step(page, 2);
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
  await expect(page.getByTestId("score")).toHaveText("1점");
  await page.getByLabel("안내 모드", { exact: true }).selectOption("adult");
  await expect(page.getByTestId("score")).toHaveText("1점");
  await expect(
    page.getByLabel("실행 전 나의 예상", { exact: true }),
  ).toHaveValue("정답을 세 번 눌러도 1점이어야 해요.");
  await step(page, 3);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".check-card.fail")).toHaveCount(0);
  await page
    .getByRole("button", { name: "미션 직접 확인 카드 추가", exact: true })
    .click();
  const self = page
    .locator(".check-card")
    .filter({ hasText: "학습자 직접 확인" });
  for (const card of await self.all()) {
    await card
      .locator("textarea")
      .last()
      .fill("같은 정답 세 번을 눌렀고 1점이 유지되는 것을 직접 보았어요.");
    await card.locator("select").selectOption("pass");
  }
  await step(page, 4);
  await page
    .getByLabel("작동 원리와 배운 점", { exact: true })
    .fill("선택 → 이미 답했는지 확인 → 점수와 응답 상태 기억 → 점수 표시.");
  await page
    .getByLabel("친구·교사·도구에게 도움받은 내용", { exact: true })
    .fill("친구가 같은 답을 다시 눌러 보자고 제안했어요.");
  await page
    .getByRole("button", { name: "이 과정 버전으로 저장", exact: true })
    .click();
  await saved(page);
  const url = page.url();
  await page.reload();
  await expect(
    page.getByLabel("작동 원리와 배운 점", { exact: true }),
  ).toHaveValue(/선택/);
  await expect(page.getByLabel("안내 모드", { exact: true })).toHaveValue(
    "adult",
  );
  await page
    .getByRole("button", { name: "과정 포트폴리오", exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "03. 기대와 실제 · 검사 기록" }),
  ).toBeVisible();
  await expect(page.locator(".portfolio")).toContainText("수정 전 검사");
  await expect(page.locator(".portfolio")).toContainText("3점");
  await expect(page.locator(".portfolio")).toContainText("1점");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".topbar")).toBeHidden();
  await page.pdf({
    path: "test-results/evidence/portfolio-check.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.goto(url);
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  await page
    .locator(".version-list>div")
    .nth(1)
    .getByRole("button", { name: "이 버전 복원" })
    .click();
  await step(page, 2);
  for (let i = 0; i < 2; i++)
    await page.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
  await expect(page.getByTestId("score")).toHaveText("2점");
  await page.getByText("수정 버전 · 비교와 복원", { exact: true }).click();
  const versionCount = await page.locator(".version-list>div").count();
  await page
    .locator(".version-list>div")
    .last()
    .getByRole("button", { name: "이 버전 삭제", exact: true })
    .click();
  await page.getByRole("button", { name: "대상 삭제", exact: true }).click();
  await expect(page.locator(".version-list>div")).toHaveCount(versionCount - 1);
  await expect(page.getByTestId("score")).toHaveText("2점");
  expect(errors).toEqual([]);
});
test("정상 퀴즈 정답·오답·결과·초기화", async ({ page }) => {
  await mission(page, "quiz-1", true);
  await page.getByRole("button", { name: /2\s*리모컨/ }).click();
  await expect(page.getByTestId("score")).toHaveText("0점");
  await page.getByRole("button", { name: "다음 문제", exact: true }).click();
  await page.getByRole("button", { name: /2\s*생각을 나누고/ }).click();
  await expect(page.getByTestId("score")).toHaveText("1점");
  await page.getByRole("button", { name: "결과 보기", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "퀴즈를 모두 풀었어요!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "↺ 다시 시작", exact: true }).click();
  await expect(page.getByTestId("score")).toHaveText("0점");
  await expect(page.getByText("문제 1 / 2", { exact: true })).toBeVisible();
});
test("이야기 잘못된 유효 연결 → 수정 → 두 결말 → 처음으로", async ({
  page,
}) => {
  await mission(page, "story-3");
  await page
    .getByRole("button", { name: "햇빛이 비치는 쪽으로", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "나무 도서관", exact: true }),
  ).toBeVisible();
  await step(page, 2);
  await page
    .getByRole("combobox", { name: "도착 장면 2", exact: true })
    .selectOption("sun");
  await page
    .getByRole("button", { name: "햇빛이 비치는 쪽으로", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "햇살 정원", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "↺ 처음으로 돌아가기", exact: true })
    .click();
  await page
    .getByRole("button", { name: "커다란 나무 쪽으로", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "나무 도서관", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "↺ 처음으로 돌아가기", exact: true })
    .click();
  await expect(page.locator(".trace")).toContainText("지나온 길 0개");
});
test("타이머 시작·멈춤·재개·백그라운드 경과·종료 한 번·이동 정리", async ({
  page,
}) => {
  await page.clock.install();
  await mission(page, "timer-1", true);
  await step(page, 2);
  await page.getByLabel("제한 시간 (1~3,600초)", { exact: true }).fill("3");
  await page.getByRole("button", { name: "시작", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "시작", exact: true }),
  ).toBeDisabled();
  await page.clock.runFor(1000);
  await expect(page.getByTestId("remaining")).toHaveText("00:02");
  await page.getByRole("button", { name: "일시정지", exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.getByTestId("remaining")).toHaveText("00:02");
  await page.getByRole("button", { name: "재개", exact: true }).click();
  await page.clock.fastForward(5000);
  await expect(page.getByTestId("remaining")).toHaveText("00:00");
  await expect(page.locator(".timer-end")).toContainText(
    "약속한 시간이 끝났어요",
  );
  await expect(page.locator(".trace")).toContainText("안내 횟수1");
  await page.clock.runFor(2000);
  await expect(page.locator(".trace")).toContainText("안내 횟수1");
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(page.getByTestId("remaining")).toHaveText("00:03");
  await page.getByRole("button", { name: "시작", exact: true }).click();
  const url = page.url();
  await page.getByRole("button", { name: "내 작품 선반", exact: true }).click();
  await page.clock.runFor(5000);
  await page.goto(url);
  await expect(page.getByTestId("remaining")).toHaveText("00:03");
  await expect(page.getByText("멈춘 상태", { exact: true })).toBeVisible();
});
test("JSON 내보내기·가져오기 왕복과 오류 보존", async ({ page }) => {
  await mission(page, "story-1");
  await page.getByLabel("작품 제목", { exact: true }).fill("파일 왕복 작품");
  await saved(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "파일 백업", exact: true }).click();
  const file = await download;
  const path = await file.path();
  expect(path).toBeTruthy();
  await page.getByRole("button", { name: "내 작품 선반", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(page.locator(".work-card")).toHaveCount(2);
  await page.locator("input[type=file]").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{wrong"),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "가져오지 못했어요" }),
  ).toBeVisible();
  await expect(page.locator(".work-card")).toHaveCount(2);
  await page.locator("input[type=file]").setInputFiles({
    name: "unsupported.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "ttukttak-vibe-backup",
        schemaVersion: 99,
        works: [],
      }),
    ),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "스키마 버전 1" }),
  ).toBeVisible();
  await expect(page.locator(".work-card")).toHaveCount(2);
});
test("저장 실패는 편집을 유지하고 내보내기로 복구한다", async ({ page }) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("QA: quota full", "QuotaExceededError");
    };
  });
  await mission(page);
  await page
    .getByLabel("작품 제목", { exact: true })
    .fill("저장 실패해도 남는 편집");
  await expect(page.getByRole("alert")).toContainText("저장하지 못했어요");
  await expect(page.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "저장 실패해도 남는 편집",
  );
  await expect(
    page.getByText("저장 실패 · 편집 내용 유지 중", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "편집 내용 파일로 내보내기", exact: true })
    .click();
  const file = await download;
  const raw = await fs.readFile((await file.path())!, "utf8");
  expect(raw).toContain("저장 실패해도 남는 편집");
});
test("다음 사용자·선택 삭제·전체 삭제가 다른 앱의 데이터를 보존한다", async ({
  page,
}) => {
  await mission(page);
  await saved(page);
  await page.evaluate(() => localStorage.setItem("another-app:keep", "safe"));
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("another-app:db", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("items");
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const tx = r.result.transaction("items", "readwrite");
          tx.objectStore("items").put("safe", "keep");
          tx.oncomplete = () => {
            r.result.close();
            resolve();
          };
        };
      }),
  );
  await page.getByRole("button", { name: "내 작품 선반", exact: true }).click();
  await page
    .getByRole("button", { name: "다음 사용자 시작", exact: true })
    .click();
  await page
    .getByRole("button", { name: "다음 사용자로 시작", exact: true })
    .click();
  await page
    .getByRole("button", { name: "이어서 학습하기", exact: true })
    .click();
  await expect(page.locator(".work-card")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".work-card")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "공용 기기 기록을 명시적으로 열기",
      exact: true,
    })
    .click();
  await expect(page.locator(".work-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "이 앱의 데이터 전체 삭제", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("작품 1개");
  await page.getByRole("button", { name: "대상 삭제", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "오늘은 어떤 생각을 만들어 볼까요?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("another-app:keep")),
  ).toBe("safe");
  expect(
    await page.evaluate(
      () =>
        new Promise<string>((resolve, reject) => {
          const r = indexedDB.open("another-app:db", 1);
          r.onerror = () => reject(r.error);
          r.onsuccess = () => {
            const tx = r.result.transaction("items");
            const request = tx.objectStore("items").get("keep");
            tx.oncomplete = () => {
              r.result.close();
              resolve(request.result);
            };
          };
        }),
    ),
  ).toBe("safe");
});
test("실제 AI는 복사·모드 전환만으로 완료가 되지 않는다", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await mission(page);
  await page
    .getByRole("button", { name: "실제 AI 제작 기록", exact: true })
    .click();
  await expect(page.locator(".ai-panel")).toContainText("실제 결과 미기록");
  await page
    .getByRole("button", { name: "제작 요청문 복사", exact: true })
    .click();
  await expect(page.locator(".ai-panel")).toContainText("실제 결과 미기록");
  await page
    .getByLabel("실제로 사용한 외부 AI 도구명", { exact: true })
    .fill("교사가 사용한 도구");
  await page
    .getByLabel("외부 실행 전 예상", { exact: true })
    .fill("정답을 한 번 채점");
  await page
    .getByLabel("외부 결과의 검사 기준", { exact: true })
    .fill("반복 클릭 점수 유지");
  await page
    .getByLabel("실제로 실행하여 관찰한 결과", { exact: true })
    .fill("교사 화면에서 1점 유지를 보았어요");
  await page
    .getByRole("combobox", { name: "내가 확인한 외부 결과", exact: true })
    .selectOption("pass");
  await expect(page.locator(".ai-panel")).toContainText("관찰 기록 있음");
});
test("클립보드 실패는 직접 선택 대체 UI를 연다", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "같은 미션 링크 복사", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("직접 선택해서 복사");
  await expect(page.getByLabel("복사할 내용", { exact: true })).toHaveValue(
    /#\/mission\/quiz-1$/,
  );
  await page
    .getByRole("button", { name: "내용 전체 선택", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("12개 미션·8차시·검사표·평가표·공유 경로", async ({ page }) => {
  await page.goto("#/missions");
  await expect(page.locator(".mission-card")).toHaveCount(12);
  await page.goto("#/teacher");
  await expect(page.locator(".lesson")).toHaveCount(8);
  await page.pdf({
    path: "test-results/evidence/teacher-check.pdf",
    format: "A4",
    printBackground: true,
  });
  await page
    .getByRole("button", { name: "검사표 · 짝 활동", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "인쇄용 검사 카드", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "과정 평가표", exact: true }).click();
  await expect(page.locator("table tbody tr")).toHaveCount(4);
  await page.goto("#/mission/timer-3");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "0초가 되면 알려 줘요", exact: true }),
  ).toBeVisible();
});
for (const size of [
  { width: 360, height: 640 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
])
  test(`${size.width}px 반응형·가로 넘침·화면 접근성`, async ({ page }) => {
    await page.setViewportSize(size);
    const external: string[] = [];
    page.on("request", (req) => {
      if (!req.url().startsWith("http://127.0.0.1:4173"))
        external.push(req.url());
    });
    await page.goto("");
    await expect(
      page.getByRole("button", { name: "첫 작품 만들기", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/evidence/home-${size.width}.png`,
      fullPage: true,
    });
    const homeAudit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(homeAudit.violations).toEqual([]);
    await mission(page);
    await step(page, 2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/evidence/workshop-${size.width}.png`,
      fullPage: true,
    });
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    expect(external).toEqual([]);
  });
test("키보드로 시작하고 입력·단계 이동", async ({ page }) => {
  await page.goto("");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "본문으로 건너뛰기" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const first = page.getByRole("button", {
    name: "첫 작품 만들기",
    exact: true,
  });
  await first.focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("작품 제목", { exact: true }).focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("keyboard project");
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(1)
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel("내가 처음 쓴 요청문 (원문)", { exact: true }),
  ).toBeVisible();
});
test("직접 검사 작성·선택 기록 삭제·작품 삭제 범위와 대화상자 접근성", async ({
  page,
}) => {
  await mission(page);
  await step(page, 3);
  await page
    .getByRole("button", { name: "나의 검사 추가", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "검사 이름", exact: true })
    .fill("친구의 반복 클릭");
  await page
    .getByRole("textbox", { name: "친구의 반복 클릭 기대한 결과", exact: true })
    .fill("점수가 한 번만 오른다");
  await page
    .getByRole("textbox", { name: "친구의 반복 클릭 실제 결과", exact: true })
    .fill("세 번 올랐다");
  await page
    .getByRole("combobox", { name: "친구의 반복 클릭 확인 상태", exact: true })
    .selectOption("fail");
  await page
    .getByRole("checkbox", { name: "친구의 반복 클릭 기록 선택", exact: true })
    .check();
  await page
    .getByRole("button", { name: "선택한 학습 기록 1개 삭제", exact: true })
    .click();
  let audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole("button", { name: "대상 삭제", exact: true }).click();
  await expect(page.locator(".check-card")).toHaveCount(0);
  await saved(page);
  await page.getByRole("button", { name: "내 작품 선반", exact: true }).click();
  await page.locator(".work-card .danger-text").click();
  await expect(page.getByRole("dialog")).toContainText("버전 1개");
  await page.getByRole("button", { name: "취소", exact: true }).click();
  await expect(page.locator(".work-card")).toHaveCount(1);
  await page.locator(".work-card .danger-text").click();
  await page.getByRole("button", { name: "대상 삭제", exact: true }).click();
  await expect(page.locator(".work-card")).toHaveCount(0);
});
test("나머지 화면의 접근성과 모드 전환 시 기록 유지", async ({ page }) => {
  await mission(page, "quiz-1");
  const workURL = page.url().replace(/\/0$/, "");
  for (const s of [0, 1, 3, 4]) {
    await step(page, s);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await step(page, 1);
  await page
    .getByRole("textbox", { name: "내가 처음 쓴 요청문 (원문)", exact: true })
    .fill("<img src=x onerror=alert(1)>실행하지 않는 원문");
  await page
    .getByRole("combobox", { name: "안내 모드", exact: true })
    .selectOption("adult");
  await expect(
    page.getByRole("textbox", {
      name: "내가 처음 쓴 요청문 (원문)",
      exact: true,
    }),
  ).toHaveValue(/<img/);
  const id = workURL.split("/").at(-1);
  for (const hash of [
    "#/library",
    `#/portfolio/${id}`,
    "#/teacher",
    "#/mission/story-3",
  ]) {
    await page.goto(hash);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
