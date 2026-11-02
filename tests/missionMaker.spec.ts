import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("선생님이 미션을 만들어 파일로 나눠 주면 학생이 가져와 시작한다", async ({
  page,
  browser,
}) => {
  await page.goto("#/teacher");
  await page.getByRole("button", { name: "미션 만들기", exact: true }).click();
  await page.getByLabel("프로젝트 종류").selectOption("timer");
  await page.getByLabel("미션 제목", { exact: true }).fill("줄넘기 타이머");
  await page
    .getByLabel("미션 목표 (학생이 무엇을 만들고 확인하나요?)")
    .fill("줄넘기 30초를 알리는 타이머를 만든다.");
  await page
    .getByLabel("먼저 예상하기 질문")
    .fill("0초가 되면 무엇이 나올까요?");
  await page
    .getByLabel("이번 과제 (무엇을 고치거나 바꾸나요?)")
    .fill("종료 안내가 나오게 고쳐요.");
  await page.getByLabel("0초가 되면 종료 안내 표시").uncheck();
  await page
    .getByLabel("학습용 오류 포함 (학생이 찾아 고칠 규칙이 있어요)")
    .check();
  await page.getByLabel("검사 1 이름").fill("종료 안내");
  await page.getByLabel("검사 1 기대 결과").fill("0초에 안내가 한 번 나온다.");
  await page.getByLabel("힌트 1").fill("종료 안내 설정을 봐요.");
  await page.getByLabel("마무리 질문").fill("타이머는 언제 안내해야 할까요?");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".mission-maker")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "미션 파일 내려받기" }).click();
  const file = await (await download).path();

  await page.getByRole("button", { name: "이 기기에 미션 더하기" }).click();
  await expect(page.locator(".maker-list")).toContainText("줄넘기 타이머");
  await page.goto("#/missions/timer");
  await expect(
    page.getByRole("button", { name: /줄넘기 타이머/ }),
  ).toContainText("선생님 미션");

  // 학생 기기: 파일을 가져오면 미션이 더해지고 바로 시작할 수 있다.
  const other = await browser.newContext();
  const student = await other.newPage();
  await student.goto(page.url().split("#")[0] + "#/library");
  await student.locator("input[type=file]").setInputFiles(file!);
  await expect(student.getByRole("heading", { level: 1 })).toHaveText(
    "줄넘기 타이머",
  );
  await student
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(student.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "줄넘기 타이머",
  );
  await student.reload();
  await expect(student.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "줄넘기 타이머",
  );
  // 학생 작품 파일에는 선생님 미션이 함께 담겨, 미션이 없는 새 교사 기기에서도 읽힌다.
  const backup = student.waitForEvent("download");
  await student.getByRole("button", { name: "파일 백업", exact: true }).click();
  const workFile = await (await backup).path();
  const fresh = await browser.newContext();
  const teacher = await fresh.newPage();
  await teacher.goto(page.url().split("#")[0] + "#/teacher");
  await teacher
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await teacher.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles({
    name: "01.json",
    mimeType: "application/json",
    buffer: await (await import("node:fs/promises")).readFile(workFile!),
  });
  await expect(teacher.locator(".class-table")).toContainText("줄넘기 타이머");
  await expect(teacher.locator(".warning")).toHaveCount(0);
  await fresh.close();
  await other.close();
});
