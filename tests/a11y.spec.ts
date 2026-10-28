import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("영어로 바꾸면 화면 틀·문서 언어·제목이 바뀌고 기록은 유지된다", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("언어 검사");
  await expect(page).toHaveTitle(
    "언어 검사 · 목표 정하기 · 뚝딱 바이브 공작소",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");

  await page.getByLabel("언어 · Language").selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(
    "언어 검사 · Set the goal · Ttukttak Vibe Workshop",
  );
  const nav = page.getByRole("navigation", { name: "Main menu" });
  await expect(nav.getByRole("button", { name: "Missions" })).toBeVisible();
  const stages = page.getByRole("navigation", { name: "Learning steps" });
  await expect(stages.getByRole("button").first()).toContainText(
    "Set the goal",
  );
  await expect(page.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "언어 검사",
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);

  await nav.getByRole("button", { name: "Missions" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Missions");
  await expect(page.getByText("Mission texts are in Korean.")).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("언어 · Language").selectOption("ko");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "미션 공작대",
  );
  await expect(page.getByRole("button", { name: "전체 17개" })).toBeVisible();
});

test("누른 버튼이 사라지는 화면 이동 뒤에도 초점이 본문에 남고 새 화면을 알린다", async ({
  page,
}) => {
  await page.goto("#/mission/timer-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.goto("#/library");
  const open = page.getByRole("button", { name: "작품 열기" });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "학습 단계" }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe("main-content");
  await expect(page.locator("p.sr-only[aria-live]")).toContainText(
    "목표 정하기",
  );
  // 본문에서 Tab을 누르면 본문 안의 첫 조작으로 이어진다.
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document.getElementById("main-content")!.contains(document.activeElement),
    ),
  ).toBe(true);
});
