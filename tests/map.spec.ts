import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("나의 미션 지도: 시작한 미션과 아직 안 한 미션을 글자로도 구분해 보여 준다", async ({
  page,
}) => {
  await page.goto("#/mission/story-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto("#/missions");
  await page.getByRole("button", { name: "나의 미션 지도" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "나의 미션 지도",
  );
  await expect(
    page.getByText("다섯 단계를 모두 기록한 미션 0개 / 전체 25개"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /이야기 1 · .* · 진행 중/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /퀴즈 1 · .* · 아직 시작하지 않음/ }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: /타이머 2 · / }).click();
  await expect(page).toHaveURL(/#\/mission\/timer-2$/);
});
