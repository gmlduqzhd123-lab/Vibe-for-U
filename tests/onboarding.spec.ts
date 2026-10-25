import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import { qrData } from "../src/qrData";

test("첫 화면의 역할 입구와 세 예제는 작품을 만들지 않고 작동한다", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("#/home");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "퀴즈·이야기·타이머",
  );
  await page.getByRole("button", { name: /학생 체험하기/ }).click();
  await expect(page).toHaveURL(/#\/explore$/);
  const demo = page.locator(".demo-lab");
  await demo.getByRole("button", { name: /1\s*햇빛과 물/ }).click();
  await expect(demo.getByTestId("score")).toHaveText("1점");
  await demo.getByRole("button", { name: /이야기 눌러보기/ }).click();
  await demo
    .getByRole("button", { name: "커다란 나무 쪽으로", exact: true })
    .click();
  await expect(
    demo.getByRole("heading", { name: "나무 도서관", exact: true }),
  ).toBeVisible();
  await demo.getByRole("button", { name: /처음으로 돌아가기/ }).click();
  await demo
    .getByRole("button", { name: "햇빛이 비치는 쪽으로", exact: true })
    .click();
  await expect(
    demo.getByRole("heading", { name: "햇살 정원", exact: true }),
  ).toBeVisible();
  await demo.getByRole("button", { name: /타이머 눌러보기/ }).click();
  await demo.getByRole("button", { name: "시작", exact: true }).click();
  await page.clock.fastForward(2000);
  await demo.getByRole("button", { name: "일시정지", exact: true }).click();
  const remaining = await demo.getByTestId("remaining").innerText();
  await page.clock.fastForward(3000);
  await expect(demo.getByTestId("remaining")).toHaveText(remaining);
  await demo.getByRole("button", { name: "재개", exact: true }).click();
  await page.clock.fastForward(5000);
  await expect(demo.getByTestId("remaining")).toHaveText("00:00");
  await expect(demo.locator(".timer-end")).toContainText("5초가 끝났어요");
  await page.goto("#/library");
  await expect(page.locator(".work-card")).toHaveCount(0);
});

test("3분 체험의 예상·세 번 재현·규칙 수정·재검사와 작품 이어가기", async ({
  page,
}) => {
  await page.goto("#/try");
  await expect(
    page.getByRole("button", {
      name: "내 예상으로 실행해 보기 →",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: "3점", exact: true }).check();
  await page
    .getByRole("button", { name: "내 예상으로 실행해 보기 →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "정답 햇빛과 물", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "규칙 하나 고치기 →", exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "정답 햇빛과 물", exact: true })
    .click({ clickCount: 2 });
  await expect(page.getByTestId("trial-score")).toHaveText("3점");
  await page
    .getByRole("button", { name: "규칙 하나 고치기 →", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "정답 햇빛과 물", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "정답 햇빛과 물", exact: true })
      .click();
  await expect(page.getByTestId("trial-score")).toHaveText("1점");
  await expect(page.locator(".try-results")).toContainText("내 예상 3점");
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("attempt");
  await expect(
    page.getByRole("button", {
      name: "고친 규칙으로 내 작품 만들기 →",
      exact: true,
    }),
  ).not.toBeVisible();
  await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .selectOption("once");
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "정답 햇빛과 물", exact: true })
      .click();
  await page
    .getByLabel("내 말로 설명하기 · 왜 이렇게 고쳤나요?", { exact: true })
    .fill("맞힌 문제 수를 세려면 이미 답했는지 기억해야 해요.");
  await page
    .getByRole("button", {
      name: "고친 규칙으로 내 작품 만들기 →",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("navigation", { name: "학습 단계" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(2)
    .click();
  await expect(
    page.getByLabel("실행 전 나의 예상", { exact: true }),
  ).toHaveValue(/3점/);
  await expect(
    page.getByRole("combobox", { name: "채점 규칙", exact: true }),
  ).toHaveValue("once");
  await expect(page.getByTestId("score")).toHaveText("0점");
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(3)
    .click();
  await expect(
    page.getByLabel("왜 이렇게 수정했나요?", { exact: true }),
  ).toHaveValue(/이미 답했는지 기억/);
  await expect(page.locator(".check-card")).toHaveCount(0);
});

test("교사 입구의 차시·활동지·교과 연결과 고치기 전후 예제", async ({
  page,
}) => {
  await page.goto("#/home");
  await page.getByRole("button", { name: /교사 수업 준비/ }).click();
  await expect(page).toHaveURL(/#\/prepare$/);
  const selector = page.getByRole("combobox", {
    name: "준비할 차시",
    exact: true,
  });
  await expect(selector.locator("option")).toHaveCount(8);
  await selector.selectOption("5");
  await expect(page.locator(".teacher-starter")).toContainText(
    "6차시의 외부 AI 도구는 교사·성인이 조작",
  );
  await expect(
    page.getByRole("link", { name: "이 차시 활동지 받기 · 2쪽", exact: true }),
  ).toHaveAttribute("href", /student-lesson-06.pdf$/);
  await page
    .getByRole("button", { name: "국어 활동 안내 열기", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/mission\/story-1$/);
  await page.goto("#/home");
  await page
    .getByRole("button", { name: "같은 정답 세 번 비교하기", exact: true })
    .click();
  await expect(page.locator(".compare-grid").locator("strong")).toHaveText([
    "3점",
    "1점",
  ]);
  for (let i = 1; i <= 5; i++) {
    const response = await page.request.get(
      new URL(`guide/step-${i}.png`, test.info().project.use.baseURL!).href,
    );
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  await page.getByText("낯선 말은 쉽게 풀어볼까요?", { exact: true }).click();
  await expect(page.locator(".word-grid")).toContainText(
    "고치기 전후의 모습을 이름 붙여",
  );
});

test("소개 카드 10종의 QR·PNG 다운로드·복사 대안·인쇄", async ({ page }) => {
  await page.goto("#/share");
  const selection = page.getByRole("combobox", {
    name: "QR 카드로 안내할 곳",
    exact: true,
  });
  await expect(selection.locator("option")).toHaveCount(10);
  await fs.mkdir("test-results/evidence", { recursive: true });
  for (const [id, value] of Object.entries(qrData)) {
    await selection.selectOption(id);
    await expect(page.locator(".share-destination")).toHaveAttribute(
      "href",
      value.url,
    );
    await page
      .getByTestId("share-qr")
      .screenshot({ path: `test-results/evidence/qr-${id}.png` });
  }
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "카드 PNG 저장", exact: true }).click(),
  ]);
  await download.saveAs("test-results/evidence/intro-card.png");
  expect(await download.failure()).toBeNull();
  const bytes = await fs.readFile("test-results/evidence/intro-card.png");
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("blocked")) },
    }),
  );
  await page
    .getByRole("button", { name: "소개 문구 복사", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("복사할 내용", { exact: true })).toHaveValue(
    /8차시 새 문제에 적용하기/,
  );
  await expect(page.getByLabel("복사할 내용", { exact: true })).toHaveValue(
    /#\/mission\/timer-4/,
  );
  await page.keyboard.press("Escape");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".share-controls")).toBeHidden();
  await expect(page.locator(".share-poster")).toBeVisible();
  await page.pdf({
    path: "test-results/evidence/intro-card.pdf",
    format: "A4",
    printBackground: true,
  });
});

test("새 입구 네 화면은 휴대전화·태블릿·PC에서 넘침과 접근성 오류가 없다", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["home", "explore", "prepare", "try", "share"]) {
      await page.goto(`#/${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(audit.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/evidence/new-${route}-${width}.png`,
      });
    }
  }
  expect(errors).toEqual([]);
});
