import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const audit = async (page: import("@playwright/test").Page) =>
  (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
  ).violations;

test("화면 보기: 고대비와 읽기 쉬운 글꼴을 켜면 기억하고, 접근성 오류가 없다", async ({
  page,
}) => {
  await page.goto("#/missions");
  await page.getByText("화면 보기", { exact: true }).click();
  await page.getByLabel("고대비 화면").check();
  await page.getByLabel("읽기 쉬운 글꼴 · 넓은 줄 간격").check();
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-contrast", "");
  await expect(html).toHaveAttribute("data-readable", "");
  // 고대비에서는 글자가 검정, 바탕이 흰색이다.
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCSS("color", "rgb(0, 0, 0)");
  expect(await audit(page)).toEqual([]);

  await page.reload();
  await expect(html).toHaveAttribute("data-contrast", "");
  await expect(html).toHaveAttribute("data-readable", "");
  expect(
    await page.evaluate(
      () =>
        parseFloat(getComputedStyle(document.documentElement).lineHeight) /
        parseFloat(getComputedStyle(document.documentElement).fontSize),
    ),
  ).toBeGreaterThan(1.8);

  await page.getByText("화면 보기", { exact: true }).click();
  await page.getByLabel("고대비 화면").uncheck();
  await expect(html).not.toHaveAttribute("data-contrast", "");
});

test("패턴 목표 칸은 방향키로 옮기고 스페이스로 넣고 뺀다", async ({
  page,
}) => {
  await page.goto("#/mission/pattern-4");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(2)
    .click();
  const board = page.getByRole("group", { name: "목표 칸 고르기" });
  // 판 안의 칸 가운데 하나만 Tab 순서에 있다.
  await expect(board.locator('button[tabindex="0"]')).toHaveCount(1);
  await board.getByRole("button", { name: "목표 칸 0,0" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  const cell = board.getByRole("button", { name: "목표 칸 1,1" });
  await expect(cell).toBeFocused();
  const before = await cell.getAttribute("aria-pressed");
  await page.keyboard.press("Space");
  await expect(cell).not.toHaveAttribute("aria-pressed", before!);
  // 줄 끝에서는 다음 줄로 넘어가지 않는다.
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowRight");
  await expect(board.locator("button").last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    board.getByRole("button", { name: "목표 칸 0,0" }),
  ).toBeFocused();
});
