import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";

test("학급 진행 요약 그래프: 멈춘 단계·힌트·평가 차이를 보여 주고 표로도 읽는다", async ({
  page,
}) => {
  const works = [0, 1, 2, 3].map((i) => {
    const w = makeWork(missions[i]);
    w.draft.title = `학생 ${i + 1}`;
    w.hintsUsed = i % 3;
    if (i < 2) {
      w.draft.promise = {
        ...w.draft.promise,
        audience: "친구",
        problem: "문제",
        features: "기능",
        done: "완료",
        input: "입력",
        exceptions: "예외",
      };
      w.selfAssessment = { levels: [3, 3, 2, 2], note: "", at: w.createdAt };
      w.feedback = { levels: [1, 2, 2, 2], note: "", at: w.createdAt };
    }
    return w;
  });
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    works.map((w, i) => ({
      name: `${i + 1}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w])),
    })),
  );
  const charts = page.locator(".class-charts");
  await expect(charts).toContainText("학급 진행 요약 그래프");
  await expect(charts.locator(".class-chart-headline")).toContainText(
    "「목표 정하기」 단계에서 멈춰 있어요",
  );
  await expect(charts).toContainText(
    "「문제와 요구사항」에서 학생들이 스스로를",
  );
  await expect(
    charts.getByRole("img", {
      name: /문제와 요구사항: 스스로 평균 3.0, 선생님 평균 1.0/,
    }),
  ).toBeVisible();
  await charts.getByText("표로 보기").click();
  await expect(charts.locator("table")).toContainText("힌트 · 2번째");
  await charts.screenshot({ path: test.info().outputPath("class-charts.png") });
  expect(
    (
      await new AxeBuilder({ page })
        .include(".class-charts")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
