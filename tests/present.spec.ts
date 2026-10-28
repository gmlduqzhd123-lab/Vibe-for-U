import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("교사가 차시에서 수업 진행 화면을 열고 단계·타이머·역할 교대를 진행한다", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("#/teacher");
  const lesson = page.locator(".lesson").nth(4);
  await lesson.locator("summary").click();
  await lesson.getByRole("button", { name: "수업 진행 화면" }).click();
  await expect(page).toHaveURL(/#\/present\/quiz-3\/5$/);
  await expect(page.locator(".sidebar")).toBeHidden();
  const slide = page.locator(".present-slide");
  await expect(slide.getByRole("heading", { level: 1 })).toHaveText(
    "오늘의 활동 · 버그 탐정 되기",
  );
  await expect(slide).toContainText("어라? 점수가 또 올라가요!");
  await page.locator(".present-slide").click();
  await page.keyboard.press("ArrowRight");
  await expect(slide.getByRole("heading", { level: 1 })).toHaveText(
    "먼저 예상하기",
  );
  await page.getByRole("button", { name: "다음 →" }).click();
  await expect(slide).toContainText("같은 정답 세 번 누르기");
  await page.keyboard.press("ArrowLeft");
  await expect(slide.getByRole("heading", { level: 1 })).toHaveText(
    "먼저 예상하기",
  );

  const timer = page.getByRole("complementary", { name: "활동 타이머" });
  await expect(page.getByTestId("present-clock")).toHaveText("30:00");
  await timer.getByRole("button", { name: /시작/ }).click();
  await expect(timer).toContainText("운전자: 짝 A");
  await page.clock.fastForward(10 * 60 * 1000 + 500);
  const swap = page.getByRole("alert").filter({ hasText: "역할을 바꿔요" });
  await expect(swap).toContainText("이제 운전자는 짝 B");
  await expect(page.getByTestId("present-clock")).toHaveText("20:00");
  await swap.getByRole("button", { name: "확인" }).click();
  await expect(swap).toBeHidden();
  await expect(timer).toContainText("운전자: 짝 B");

  await timer.getByRole("button", { name: "정리 5분" }).click();
  await expect(page.getByTestId("present-clock")).toHaveText("05:00");
  await timer.getByRole("button", { name: /시작/ }).click();
  await page.clock.fastForward(5 * 60 * 1000 + 500);
  await expect(timer.getByRole("status")).toHaveText(
    "활동 시간이 끝났어요. 정리해 볼까요?",
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole("button", { name: "수업 진행 끝내기" }).click();
  await expect(page).toHaveURL(/#\/teacher$/);
});
