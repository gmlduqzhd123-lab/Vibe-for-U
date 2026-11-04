import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
// 키보드만으로(Tab·방향키·Enter·글자 입력) 미션 시작부터 다섯 단계 기록 완료까지 간다.
// 마우스를 쓸 수 없는 학생과 스위치 입력 기기를 위한 검사다. 초점이 어딘가에 갇히면 tabTo가 실패한다.
const focused = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { name: "", tag: "" };
    const labelled = el.id
      ? document.querySelector(`label[for="${el.id}"]`)?.textContent
      : null;
    const name =
      el.getAttribute("aria-label") ||
      labelled ||
      el.closest("label")?.querySelector("span")?.textContent ||
      el.textContent ||
      "";
    return { name: name.replace(/\s+/g, " ").trim(), tag: el.tagName };
  });
async function tabTo(page: Page, name: string | RegExp, limit = 120) {
  for (let i = 0; i < limit; i++) {
    const f = await focused(page);
    if (typeof name === "string" ? f.name.startsWith(name) : name.test(f.name))
      return f;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab ${limit}번 안에 「${name}」에 닿지 못했어요.`);
}
const type = async (page: Page, name: string, text: string) => {
  await tabTo(page, name);
  await page.keyboard.press("Control+a");
  await page.keyboard.type(text);
};
test("키보드만으로 미션 시작부터 다섯 단계 기록 완료까지 간다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-3");
  await page.locator("body").focus();
  await tabTo(page, "정상 규칙의 새 작품 만들기");
  await page.keyboard.press("Enter");
  const nav = page.getByRole("navigation", { name: "학습 단계" });
  await expect(nav).toBeVisible();
  const stage = (n: number) => nav.getByRole("button").nth(n);

  // 1. 목표 정하기: 약속 칸은 채워져 있으니 확인하고 다음 단계로.
  await tabTo(page, "이 약속으로 만들기");
  await page.keyboard.press("Enter");
  await expect(stage(0)).toContainText("기록 완료");
  await expect(stage(1)).toHaveAttribute("aria-current", "step");

  // 2. 요청 작성하기
  await type(
    page,
    "내가 처음 쓴 요청문 (원문)",
    "같은 정답은 한 번만 채점해 줘.",
  );
  await tabTo(page, "만들기 약속으로 요청문 정리");
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel("정리한 제작 요청문", { exact: true }),
  ).toHaveValue(/우리 반 친구/);
  await expect(stage(1)).toContainText("기록 완료");

  // 3. 예상하고 실행: 단계 메뉴를 키보드로 고르고, 답 버튼을 Enter로 누른다.
  await tabTo(page, /^3\s*예상하고 실행/);
  await page.keyboard.press("Enter");
  await type(page, "실행 전 나의 예상", "세 번 눌러도 1점일 거예요.");
  await tabTo(page, /^1\s*햇빛과 물/);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("score")).toHaveText("1점");
  await expect(stage(2)).toContainText("기록 완료");

  // 4. 검사하고 수정: 자동 검사 → 직접 확인 카드 채우기 → 확인 상태 → 수정 이유
  await tabTo(page, /^4\s*검사하고 수정/);
  await page.keyboard.press("Enter");
  await tabTo(page, "현재 설정 자동 검사");
  await page.keyboard.press("Enter");
  await expect(page.locator(".check-card.fail")).toHaveCount(0);
  const self = page
    .locator(".check-card")
    .filter({ hasText: "학습자 직접 확인" });
  const n = await self.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await tabTo(page, /실제 결과$/);
    await page.keyboard.type("직접 눌러 보니 1점이 유지됐어요.");
    await tabTo(page, /확인 상태$/);
    await page.keyboard.press("ArrowDown");
  }
  for (const s of await self.locator("select").all())
    await expect(s).toHaveValue("pass");
  await type(page, "왜 이렇게 수정했나요?", "답한 문제를 기억해야 해요.");
  await expect(stage(3)).toContainText("기록 완료");

  // 5. 설명하고 저장
  await tabTo(page, /^5\s*설명하고 저장/);
  await page.keyboard.press("Enter");
  await type(page, "작동 원리와 배운 점", "선택 → 확인 → 기억 → 표시.");
  await type(page, "친구·교사·도구에게 도움받은 내용", "혼자 했어요.");
  await expect(stage(4)).toContainText("기록 완료");
  await tabTo(page, "이 과정 버전으로 저장");
  await page.keyboard.press("Enter");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await expect(nav.getByText("기록 완료")).toHaveCount(5);
});
