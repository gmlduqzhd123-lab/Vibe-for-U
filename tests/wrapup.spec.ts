import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("수업 끝 정리 도우미: 저장 확인 → 모든 작품 백업 → 다음 사용자 시작", async ({
  page,
}) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("정리 전 작품");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();

  await page.goto("#/library");
  await page.getByRole("button", { name: "수업 끝 정리 도우미" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "수업 끝 정리 도우미",
  );
  await expect(
    page.getByText("모든 편집이 이 기기에 저장됐어요."),
  ).toBeVisible();
  const next = page.getByRole("button", { name: "다음 사용자 시작" });
  await expect(next).toBeDisabled();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "모든 작품 파일로 받기" }).click();
  const file = await download;
  const { readFile } = await import("node:fs/promises");
  expect(await readFile((await file.path())!, "utf8")).toContain(
    "정리 전 작품",
  );
  await expect(page.getByText("2단계 완료")).toBeVisible();
  await expect(next).toBeEnabled();

  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);

  await next.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "다음 사용자로 시작" })
    .click();
  await expect(page.locator(".toast")).toContainText(
    "다음 사용자는 새 작품으로 시작해요.",
  );
  await page.goto("#/library");
  await expect(page.getByRole("heading", { name: "정리 전 작품" })).toHaveCount(
    0,
  );
});

test("수업 끝 정리 도우미: 백업을 건너뛰면 전체 삭제를 고를 수 있다", async ({
  page,
}) => {
  await page.goto("#/mission/timer-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto("#/wrapup");
  const wipe = page.getByRole("button", { name: "이 앱의 데이터 전체 삭제" });
  await expect(wipe).toBeDisabled();
  await page.getByLabel("이미 백업했거나 보관하지 않아도 돼요").check();
  await wipe.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "대상 삭제" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "누가 사용하나요" }),
  ).toBeVisible();
  await page.goto("#/library");
  await expect(page.locator(".work-card")).toHaveCount(0);
});
