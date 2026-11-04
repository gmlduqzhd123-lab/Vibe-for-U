import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("선생님이 미션 묶음(코스)을 파일로 나눠 주면 학생 미션 지도에 우리 반 코스 길이 생긴다", async ({
  page,
  browser,
}) => {
  await page.goto("#/teacher");
  await page.getByRole("button", { name: "미션 만들기", exact: true }).click();
  const maker = page.locator(".course-maker");
  await maker.getByLabel("코스 이름").fill("우리 반 1주 코스");
  await maker.getByLabel("넣을 미션").selectOption("story-1");
  await maker.getByRole("button", { name: "코스에 더하기" }).click();
  await maker.getByLabel("넣을 미션").selectOption("quiz-1");
  await maker.getByRole("button", { name: "코스에 더하기" }).click();
  await expect(maker.locator(".course-steps li")).toHaveCount(2);
  // 순서를 바꿀 수 있다: 2번(퀴즈 1)을 앞으로.
  await maker.getByRole("button", { name: "2번 미션을 앞으로" }).click();
  await expect(maker.locator(".course-steps li").first()).toContainText("퀴즈");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".course-maker")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const download = page.waitForEvent("download");
  await maker.getByRole("button", { name: "코스 파일 내려받기" }).click();
  const file = await (await download).path();
  await maker.getByRole("button", { name: "이 기기에 코스 더하기" }).click();
  await expect(maker).toContainText("이 기기의 코스 1개");

  // 학생 기기: 코스 파일을 가져오면 미션 지도에 순서대로 나오고 다음 할 미션이 표시된다.
  const other = await browser.newContext();
  const student = await other.newPage();
  await student.goto(page.url().split("#")[0] + "#/library");
  await student.locator("input[type=file]").setInputFiles(file!);
  await expect(student.locator(".toast")).toContainText(
    "코스 「우리 반 1주 코스」을 받았어요",
  );
  const course = student.locator(".map-row.course");
  await expect(course).toContainText("우리 반 코스 · 우리 반 1주 코스");
  await expect(course).toContainText("0 / 2 완료");
  await expect(course.locator(".map-stop")).toHaveCount(2);
  await expect(course.locator(".map-stop.next")).toContainText(
    "선택이 정답을 만났을 때",
  );
  await course.locator(".map-stop.next button").click();
  await expect(student.getByRole("heading", { level: 1 })).toHaveText(
    "선택이 정답을 만났을 때",
  );
  await other.close();
});
