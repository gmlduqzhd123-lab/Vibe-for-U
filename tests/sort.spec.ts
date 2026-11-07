import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("분류 앱: 넓은 조건에 가린 바구니를 찾아 순서를 고치고, 실행 기록을 증거로 남긴다", async ({
  page,
}) => {
  await page.goto("#/mission/sort-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  await expect(preview).toContainText("다음 카드: 「닭」 다리 수 2");
  await preview.getByRole("button", { name: "모두 넣기" }).click();
  await expect(preview.locator(".sort-next")).toHaveText(
    "카드를 모두 넣었어요.",
  );
  const many = preview.locator(".sort-bins li", { hasText: "다리가 많아요" });
  await expect(many).toContainText("비어 있어요");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".preview-panel")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  // 검사하고 수정: 자동 검사가 가린 바구니를 찾고 맞춤 힌트가 순서를 알려 준다.
  await page.goto(`#/work/${id}/3`);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".smart-hints")).toContainText(
    "「다리가 많아요」 바구니는 앞 조건에 가려서",
  );

  // 바구니 2를 위로 올리면 개미·거미가 '다리가 많아요'에 들어간다.
  await page.goto(`#/work/${id}/2`);
  await page.getByRole("button", { name: "바구니 2 위로" }).click();
  await preview.getByRole("button", { name: "한 장 넣기" }).click();
  await preview.getByRole("button", { name: "모두 넣기" }).click();
  await expect(many).toContainText("개미");
  await expect(many).toContainText("거미");
  await expect(
    preview.locator(".sort-bins li", { hasText: "다리가 없어요" }),
  ).toContainText("뱀");

  // 실행 기록을 증거로 남기면 포트폴리오에 나온다.
  await preview
    .getByRole("button", { name: /이 기록을 증거로 남기기/ })
    .click();
  await expect(page.locator(".toast")).toContainText(
    "실행 기록 2개를 증거로 남겼어요",
  );
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto(`#/portfolio/${id}`);
  const log = page.locator(".run-log");
  await expect(log).toContainText("이렇게 눌러 봤어요");
  await expect(log).toContainText("한 장 넣기");
  await expect(log).toContainText("넣은 카드 5장 / 5장");
});

test("분류 앱도 앱 파일(HTML)로 내보내 그대로 실행된다", async ({ page }) => {
  await page.goto("#/mission/sort-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "앱 파일로 내보내기" }).click();
  const file = await (await download).path();
  const html = await (await import("node:fs/promises")).readFile(file!, "utf8");
  await page.setContent(html);
  await page.getByRole("button", { name: "모두 넣기" }).click();
  await expect(page.locator(".bins li").first()).toContainText(
    "고양이, 강아지",
  );
  await expect(page.locator(".note")).toHaveText("카드를 모두 넣었어요.");
});
