import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";
import { problems } from "./support";
type P = import("@playwright/test").Page;
const axe = async (page: P, sel: string) =>
  expect(
    (
      await new AxeBuilder({ page })
        .include(sel)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
const start = async (page: P, id: string) => {
  await page.goto(`#/mission/${id}`);
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  return page.url().split("/work/")[1].split("/")[0];
};

test("작업실: 보내기 메뉴로 묶고, 학습용 오류 표시가 규칙 앱에도 맞게 나온다", async ({
  page,
}) => {
  const id = await start(page, "loop-3");
  const menu = page.locator(".more-menu");
  const exportButton = page.getByRole("button", { name: "앱 파일로 내보내기" });
  await expect(exportButton).toBeHidden();
  await expect(
    page.getByRole("button", { name: "파일 백업", exact: true }),
  ).toBeVisible();
  await menu.locator("summary").click();
  await expect(exportButton).toBeVisible();
  await expect(menu.getByRole("button", { name: "QR로 보내기" })).toBeVisible();
  await axe(page, ".workspace-heading");
  expect(await problems(page)).toEqual([]);
  // Esc와 바깥 누르기로 닫힌다.
  await page.keyboard.press("Escape");
  await expect(exportButton).toBeHidden();
  await menu.locator("summary").click();
  await page.locator("h1").click();
  await expect(exportButton).toBeHidden();

  // 한 번 더 도는 반복은 학습용 오류로 표시하고, 고치면 표시가 바뀐다.
  const meta = page.locator(".workspace-meta");
  await expect(meta).toContainText("학습용 오류 규칙 포함");
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("반복 세는 방법").selectOption("exact");
  await expect(meta).toContainText("현재 설정으로 검사해 보세요");
});

test("미션 목록: 앱 종류별 묶음과 진행 막대", async ({ page }) => {
  await page.goto("#/missions");
  const groups = page.locator(".mission-group");
  await expect(groups).toHaveCount(8);
  await expect(groups.first().locator("summary")).toContainText(
    "퀴즈기록 완료 0 / 4",
  );
  await expect(
    groups.first().getByRole("progressbar", { name: "퀴즈 진행" }),
  ).toHaveAttribute("value", "0");
  // 묶음을 접으면 그 종류의 미션 카드가 보이지 않는다.
  await groups.first().locator("summary").click();
  await expect(groups.first().locator(".mission-card").first()).toBeHidden();
  await expect(groups.nth(1).locator(".mission-card").first()).toBeVisible();
  await axe(page, ".mission-group");
  expect(await problems(page)).toEqual([]);
  // 찾기 결과가 없는 종류의 묶음은 사라지고, 종류를 고르면 묶음 없이 보여 준다.
  await page.getByLabel("미션 찾기").fill("급식 줄");
  await expect(groups).toHaveCount(1);
  await page.getByLabel("미션 찾기").fill("");
  await page.getByRole("button", { name: "목록 만들기", exact: true }).click();
  await expect(groups).toHaveCount(0);
  await expect(page.locator(".mission-card")).toHaveCount(5);
});

test("앱 잇기: 반복 안의 조건과 반복으로 목록 채우기", async ({ page }) => {
  let id = await start(page, "loop-7");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  for (let i = 0; i < 5; i++)
    await preview.getByRole("button", { name: "한 번 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("8");
  await expect(preview.locator(".trace")).toContainText("5의 배수라 +3 더");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("16");
  // 보너스를 3의 배수 번째마다로 바꾸면 세 번 받아 19가 된다.
  await page
    .getByLabel("반복 안의 조건 (몇 번째마다 더 바꾸기)")
    .selectOption("3");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("19");
  await axe(page, ".settings");

  id = await start(page, "list-5");
  await page.goto(`#/work/${id}/2`);
  await preview.getByRole("button", { name: "모두 차례로 넣기" }).click();
  await expect(preview.locator(".list-items li")).toHaveText([
    "하늘",
    "바다",
    "나무",
    "구름",
  ]);
  await expect(preview.locator(".rule-message")).toHaveText(
    "오늘 발표는 네 명까지예요.",
  );
  // 낱말 묶음은 접을 수 있다.
  const words = page.locator(".settings-group");
  await expect(words.locator("summary")).toHaveText("낱말 6개 고치기");
  await words.locator("summary").click();
  await expect(page.getByLabel("낱말 1", { exact: true })).toBeHidden();
  expect(await problems(page)).toEqual([]);
});

test("도전 과제: 설정을 바꾸면 달성 표시가 생긴다", async ({ page }) => {
  const id = await start(page, "list-5");
  await page.goto(`#/work/${id}/4`);
  const panel = page.locator(".challenge-panel");
  await panel.locator("summary").click();
  const items = panel.locator(".challenge-list li");
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText("아직");
  await axe(page, ".challenge-panel");
  await panel.getByRole("button", { name: "설정 바꾸러 가기" }).click();
  await page.getByLabel("가장 많은 개수 (1~12)").fill("5");
  await page.goto(`#/work/${id}/4`);
  await panel.locator("summary").click();
  await expect(items.first()).toContainText("달성!");
  await expect(items.first()).toHaveClass(/met/);
});

test("학급 모으기: 어디에서 멈췄는지 한눈에 본다", async ({ page }) => {
  const a = makeWork(missions.find((m) => m.id === "quiz-1")!);
  const b = makeWork(missions.find((m) => m.id === "list-1")!);
  const c = makeWork(missions.find((m) => m.id === "loop-1")!);
  c.draft.goalReviewed = true;
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    [a, b, c].map((w, i) => ({
      name: `${i + 1}번.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const strip = page.locator(".stuck-strip");
  await expect(strip.locator("li").first()).toContainText(
    "목표 정하기2명1번.json, 2번.json가장 많이 멈춘 단계",
  );
  await expect(strip.locator("li").nth(1)).toContainText(
    "요청 작성하기1명3번.json",
  );
  await expect(strip).toContainText("다섯 단계를 모두 기록한 작품 0개");
  await axe(page, ".stuck-strip");
  expect(await problems(page)).toEqual([]);
});
