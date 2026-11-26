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

test("목록 만들기: 같은 이름이 두 번 들어가는 버그를 찾아 고친다", async ({
  page,
}) => {
  const id = await start(page, "list-3");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  const sky = preview.getByRole("button", { name: "하늘", exact: true });
  await sky.click();
  await sky.click();
  await expect(preview.getByTestId("list-count")).toHaveText(
    "2개 / 가장 많이 8개",
  );
  await expect(preview.locator(".list-items li")).toHaveText(["하늘", "하늘"]);
  await axe(page, ".preview-panel");
  await page.goto(`#/work/${id}/3`);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".smart-hints")).toContainText(
    "같은 낱말을 또 누르면 목록에 두 번 들어가요.",
  );
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("같은 낱말을 또 넣으면").selectOption("block");
  await axe(page, ".settings");
  // 설정을 바꾸면 실행 화면은 빈 목록에서 다시 시작한다.
  await expect(preview.locator(".list-empty")).toBeVisible();
  await sky.click();
  await sky.click();
  await expect(preview.getByTestId("list-count")).toHaveText(
    "1개 / 가장 많이 8개",
  );
  await expect(preview.locator(".rule-message")).toHaveText(
    "「하늘」은 이미 목록에 있어요.",
  );
  await preview.getByRole("button", { name: "바다", exact: true }).click();
  await preview.getByRole("button", { name: "하나 빼기" }).click();
  await expect(preview.locator(".list-items li")).toHaveText(["하늘"]);
  expect(await problems(page)).toEqual([]);
});

test("목록 만들기: 가득 차면 안내하고, 급식 줄은 먼저 넣은 것이 먼저 나온다", async ({
  page,
}) => {
  let id = await start(page, "list-2");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  for (const name of ["공책", "필통", "물통", "우산"])
    await preview.getByRole("button", { name, exact: true }).click();
  await expect(preview.locator(".list-items li")).toHaveCount(3);
  await expect(preview.locator(".rule-message")).toHaveText(
    "가방이 가득 찼어요. 하나를 빼야 넣을 수 있어요.",
  );
  id = await start(page, "list-4");
  await page.goto(`#/work/${id}/2`);
  for (const name of ["하늘 모둠", "바다 모둠", "나무 모둠"])
    await preview.getByRole("button", { name, exact: true }).click();
  await preview.getByRole("button", { name: "하나 빼기" }).click();
  await expect(preview.locator(".list-items li")).toHaveText([
    "바다 모둠",
    "나무 모둠",
  ]);
  // 낱말을 더하면 실행 화면에 새 버튼이 생긴다.
  await page.getByRole("button", { name: "+ 낱말 추가" }).click();
  await page.getByLabel("낱말 5", { exact: true }).fill("별 모둠");
  await expect(
    preview.getByRole("button", { name: "별 모둠", exact: true }),
  ).toBeVisible();
});

test("반복의 멈춤 조건: 조건에 맞으면 멈추고, 건너뛰는 조건은 힌트가 찾는다", async ({
  page,
}) => {
  let id = await start(page, "loop-5");
  await page.goto(`#/work/${id}/2`);
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("3500");
  await expect(preview.locator(".loop-dots li.on")).toHaveCount(5);
  await expect(preview.locator(".loop-dots li")).toHaveCount(10);
  await expect(preview.locator(".rule-message")).toHaveText(
    "3000원을 넘었어요! 이제 살 수 있어요.",
  );
  await expect(
    preview.getByRole("button", { name: "한 번 반복" }),
  ).toBeDisabled();

  id = await start(page, "loop-6");
  await page.goto(`#/work/${id}/2`);
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("2400");
  await page.goto(`#/work/${id}/3`);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".smart-hints")).toContainText(
    "멈춤 조건 「1000과 같으면」에 한 번도 맞지 않아 8번을 다 돌았어요.",
  );
  await page.goto(`#/work/${id}/2`);
  await page.getByLabel("멈추는 방법").selectOption("gte");
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("1200");
  await axe(page, ".settings");
  // 멈춤 조건을 없애면 조건 값 칸도 사라지고 횟수만큼 돈다.
  await page.getByLabel("멈추는 방법").selectOption("none");
  await expect(page.getByLabel("멈춤 조건의 값")).toHaveCount(0);
  await preview.getByRole("button", { name: "끝까지 반복" }).click();
  await expect(preview.getByTestId("loop-value")).toHaveText("2400");
});

test("미션 찾기: 낱말과 진행 상태로 걸러 본다", async ({ page }) => {
  await start(page, "quiz-1");
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await page.goto("#/missions");
  const cards = page.locator(".mission-card");
  await expect(cards).toHaveCount(37);
  await page.getByLabel("미션 찾기").fill("급식 줄");
  await expect(cards).toHaveCount(1);
  await expect(cards).toContainText("먼저 온 사람 먼저");
  await expect(page.getByText("미션 1개를 보여 줘요.")).toBeVisible();
  await page.getByLabel("미션 찾기").fill("없는낱말");
  await expect(cards).toHaveCount(0);
  await expect(page.getByText("찾는 미션이 없어요")).toBeVisible();
  await page.getByLabel("미션 찾기").fill("");
  await page.getByLabel("진행 상태").selectOption("doing");
  await expect(cards).toHaveCount(1);
  await expect(cards).toContainText("선택이 정답을 만났을 때");
  // 앱 종류 걸러 보기와 함께 쓴다.
  await page.getByLabel("진행 상태").selectOption("all");
  await page.getByRole("button", { name: "목록 만들기", exact: true }).click();
  await expect(cards).toHaveCount(4);
  await axe(page, ".mission-find");
  expect(await problems(page)).toEqual([]);
});

test("화면 둘러보기: 다섯 곳을 차례로 짚고, 본 뒤에는 조용한 버튼이 된다", async ({
  page,
}) => {
  const id = await start(page, "quiz-1");
  const open = page.getByRole("button", { name: "처음이라면 화면 둘러보기" });
  await open.click();
  const tour = page.getByRole("region", { name: "화면 둘러보기" });
  await expect(tour).toContainText("둘러보기 1 / 5 · 다섯 단계");
  await expect(page.locator(".stage-nav")).toHaveClass(/tour-target/);
  await expect(tour.getByRole("button", { name: "이전 안내" })).toBeDisabled();
  await axe(page, ".tour");
  for (let i = 0; i < 4; i++)
    await tour.getByRole("button", { name: "다음 안내" }).click();
  await expect(tour).toContainText("둘러보기 5 / 5 · 막힐 때는");
  await expect(tour.getByRole("button", { name: "다음 안내" })).toHaveCount(0);
  expect(await problems(page)).toEqual([]);
  await tour.getByRole("button", { name: "둘러보기 끝내기" }).click();
  await expect(page.locator(".tour-target")).toHaveCount(0);
  // 다시 열어도, 다른 작품에서도 처음 안내 문구는 나오지 않는다.
  await page.goto(`#/work/${id}/1`);
  await expect(
    page.getByRole("button", { name: "화면 둘러보기", exact: true }),
  ).toBeVisible();
  await expect(open).toHaveCount(0);
});

test("강제 색상 모드에서도 고른 단계와 켜진 점이 테두리·시스템 색으로 보인다", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit은 강제 색상 모드를 흉내 내지 못해요",
  );
  await page.emulateMedia({ forcedColors: "active" });
  const id = await start(page, "loop-1");
  await page.goto(`#/work/${id}/2`);
  const outline = (sel: string) =>
    page
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(await outline(".stage-nav button.active")).toBe("solid");
  expect(await outline(".stage-nav button:not(.active)")).toBe("none");
  const preview = page.locator(".preview-panel");
  await preview.getByRole("button", { name: "한 번 반복" }).click();
  const bg = (sel: string) =>
    preview
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg(".loop-dots li.on")).not.toBe(
    await bg(".loop-dots li:not(.on)"),
  );
});

test("평가 비교와 활동 남은 시간", async ({ page }) => {
  const a = makeWork(
    missions.find((m) => m.id === "quiz-1")!,
    true,
  );
  a.feedback = { levels: [1, 2, 2, 2], note: "", at: a.createdAt };
  a.selfAssessment = { levels: [3, 2, 2, 2], note: "", at: a.createdAt };
  const b = makeWork(
    missions.find((m) => m.id === "list-1")!,
    true,
  );
  b.feedback = { levels: [2, 2, 2, 2], note: "", at: b.createdAt };
  b.selfAssessment = { levels: [2, 2, 2, 2], note: "", at: b.createdAt };
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    [a, b].map((w, i) => ({
      name: `${i + 1}번.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const rows = page.locator(".class-table tbody tr:not(.class-total)");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("평가 차이 큼");
  await expect(rows.nth(1)).not.toContainText("평가 차이 큼");
  await page.getByLabel("걸러 보기").selectOption("gap");
  await expect(rows).toHaveCount(1);
  const card = page.locator(".review-card");
  await expect(card).toHaveCount(1);
  await card.locator("summary").first().click();
  await expect(card.locator(".assessment-gap")).toContainText(
    "문제와 요구사항: 스스로 설명·적용 · 선생님 시작",
  );
  await expect(card.locator(".assessment-gap")).toContainText(
    "두 단계 차이 · 이야기 나눠 보기",
  );
  await axe(page, ".review-card");

  await page.goto("#/present/quiz-1/1");
  await page
    .getByRole("button", { name: "시작", exact: false })
    .first()
    .click();
  await expect(page.getByTestId("present-step-left")).toContainText(
    /이 활동 남은 시간 \d\d:\d\d · 다음: /,
  );
});

test("목록 작품을 혼자 열리는 HTML로 내보내 앱 없이 눌러 본다", async ({
  page,
  context,
}) => {
  await start(page, "list-2");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "앱 파일로 내보내기" }).click();
  const path = test.info().outputPath("list-2.html");
  await (await download).saveAs(path);
  const app = await context.newPage();
  const requests: string[] = [];
  app.on("request", (r) => {
    if (!r.url().startsWith("file:")) requests.push(r.url());
  });
  await app.goto(`file://${path}`);
  for (const name of ["공책", "공책", "필통", "물통", "우산"])
    await app.getByRole("button", { name, exact: true }).click();
  await expect(app.locator("ol.bins li")).toHaveText(["공책", "필통", "물통"]);
  await expect(app.getByRole("status")).toHaveText(
    "가방이 가득 찼어요. 하나를 빼야 넣을 수 있어요.",
  );
  await app.getByRole("button", { name: "하나 빼기" }).click();
  await expect(app.locator("ol.bins li")).toHaveText(["공책", "필통"]);
  expect(requests).toEqual([]);
});
