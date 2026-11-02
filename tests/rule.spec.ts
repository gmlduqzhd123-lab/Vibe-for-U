import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("만약 규칙 앱: 조건 순서 때문에 가려진 문구를 찾아 순서를 고치고 재검사한다", async ({
  page,
}) => {
  await page.goto("#/missions/rule");
  await expect(page.locator(".mission-card")).toHaveCount(4);
  await page.goto("#/mission/rule-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".rule-preview");
  const plus = preview.getByRole("button", { name: "+1 스티커 붙이기" });
  for (let i = 0; i < 6; i++) await plus.click();
  await expect(preview.getByTestId("rule-value")).toHaveText("6");
  // 6개인데 앞 조건(3 이상)이 먼저 맞아 '최고예요!'가 나오지 않는다.
  await expect(preview.getByRole("status")).toContainText("좋아요");
  await expect(preview.locator(".rule-list .hit")).toContainText(
    "지금 맞는 조건",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(page.locator(".smart-hints")).toContainText(
    "앞 조건에 가려서 나올 수 없어요",
  );

  await page.goto(`#/work/${id}/2`);
  await page.getByRole("button", { name: "조건 2 위로" }).click();
  for (let i = 0; i < 6; i++)
    await page
      .locator(".rule-preview")
      .getByRole("button", { name: "+1 스티커 붙이기" })
      .click();
  await expect(page.locator(".rule-preview").getByRole("status")).toContainText(
    "최고예요!",
  );
  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await expect(page.getByText("모두 통과했어요")).toBeVisible();
});

test("만약 규칙 앱: 가장 작은 값을 지우면 0 아래로 내려간다", async ({
  page,
}) => {
  await page.goto("#/mission/rule-2");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  const minus = () =>
    page
      .locator(".rule-preview")
      .getByRole("button", { name: "−1 스티커 떼기" });
  await minus().click();
  await expect(page.getByTestId("rule-value")).toHaveText("0");
  await page.getByLabel("가장 작은 값 (비우면 제한 없음)").fill("");
  await minus().click();
  await expect(page.getByTestId("rule-value")).toHaveText("-1");
});
