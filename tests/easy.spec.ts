import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const step = async (page: import("@playwright/test").Page, n: number) =>
  page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(n)
    .click();

test("쉬운 모드: 낱말 블록으로 원문을 만들고 안내를 소리로 듣는다", async ({
  page,
}) => {
  // 테스트 브라우저에는 음성이 없으므로 읽은 문장만 기록한다.
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    // WebKit은 speechSynthesis 객체를 다시 만들 수 있어 프로토타입에 바꿔 둔다.
    SpeechSynthesis.prototype.speak = function (u: SpeechSynthesisUtterance) {
      spoken.push(`${u.lang}|${u.text}`);
    };
  });
  await page.goto("#/mission/quiz-3");
  await page.getByRole("button", { name: "미션 안내 듣기" }).click();
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("안내 모드", { exact: true }).selectOption("easy");
  await expect(page.locator(".app")).toHaveClass(/mode-easy/);
  await step(page, 1);
  const blocks = page.locator(".block-prompt");
  await blocks
    .getByRole("group", { name: "꼭 지킬 약속" })
    .getByRole("button", { name: /같은 답을 여러 번/ })
    .click();
  await blocks.getByRole("button", { name: "우리 반 친구가 쓸" }).click();
  await blocks.getByRole("button", { name: "퀴즈를 만들고 싶어요." }).click();
  await expect(blocks.locator(".block-sentence")).toHaveText(
    "우리 반 친구가 쓸 퀴즈를 만들고 싶어요. 같은 답을 여러 번 눌러도 점수는 한 번만 올라요.",
  );
  await blocks.getByRole("button", { name: "이 문장을 원문으로 쓰기" }).click();
  await expect(
    page.getByLabel("내가 처음 쓴 요청문 (원문)", { exact: true }),
  ).toHaveValue(/^우리 반 친구가 쓸 퀴즈를 만들고 싶어요/);
  await expect(blocks.locator(".block-sentence")).toHaveText(
    "아직 고른 블록이 없어요.",
  );

  await step(page, 2);
  await page.getByRole("button", { name: "+ 이렇게 누르면" }).click();
  await page.getByRole("button", { name: "+ 이렇게 될 것 같아요." }).click();
  await expect(
    page.getByLabel("실행 전 나의 예상", { exact: true }),
  ).toHaveValue("이렇게 누르면 이렇게 될 것 같아요.");
  await page.getByRole("button", { name: "이 단계 안내 듣기" }).click();
  const spoken = await page.evaluate(
    () => (window as unknown as { spoken: string[] }).spoken,
  );
  expect(spoken[0]).toMatch(/^ko-KR\|어라\? 점수가 또 올라가요!/);
  expect(spoken[1]).toMatch(/^ko-KR\|예상하고 실행/);
  expect(spoken[1]).toContain("같은 정답을 세 번 누르면");

  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  // 모드는 다시 열어도 유지된다.
  await page.reload();
  await expect(page.getByLabel("안내 모드", { exact: true })).toHaveValue(
    "easy",
  );
});
