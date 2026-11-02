import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("오늘 수업 키트: 차시를 고르면 목표·진행 순서·미션 QR을 A4 한 장에 인쇄한다", async ({
  page,
  browserName,
}) => {
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "수업 키트 한 장 인쇄" })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "1차시 · 작은 문제를 앱으로",
  );
  await expect(
    page.getByRole("img", { name: /미션 주소 QR 코드/ }),
  ).toBeVisible();
  await expect(page.locator(".kit-url")).toContainText("#/mission/quiz-1");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".lesson-kit")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  // 인쇄하면 메뉴와 버튼은 빠지고 한 장에 들어간다(PDF는 Chromium만 만들 수 있다).
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("button", { name: "A4 한 장으로 인쇄" }),
  ).toBeHidden();
  if (browserName === "chromium") {
    for (let n = 1; n <= 8; n++) {
      await page.goto(`#/kit/${n}`);
      await page.locator(".lesson-kit h1").waitFor();
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [])
        .length;
      expect(pages, `${n}차시`).toBe(1);
    }
  }
});
