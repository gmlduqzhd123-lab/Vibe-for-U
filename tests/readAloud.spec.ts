import { test, expect } from "@playwright/test";
// 결과·자동 검사·맞춤 힌트에도 읽어 주기 버튼이 있고, 읽을 글이 그 내용이다.
test("읽어 주기 범위: 실행 결과·자동 검사·맞춤 힌트를 읽는다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    const synth = {
      speaking: false,
      cancel() {
        this.speaking = false;
      },
      speak(u: { text: string; onend?: () => void }) {
        spoken.push(u.text);
        setTimeout(() => u.onend?.(), 10);
      },
      getVoices: () => [],
    };
    Object.defineProperty(window, "speechSynthesis", { value: synth });
  });
  const spoken = () =>
    page.evaluate(() => (window as unknown as { spoken: string[] }).spoken);
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  await page.locator(".preview-panel .answers button").first().click();
  await page.getByRole("button", { name: "결과 듣기" }).click();
  expect((await spoken()).at(-1)).toMatch(/점/);

  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "현재 설정 자동 검사" }).click();
  await page.getByRole("button", { name: "자동 검사 결과 듣기" }).click();
  expect((await spoken()).at(-1)).toContain("수정할 규칙이 있어요");
  await page.locator(".smart-hints").getByText("힌트 보기").first().click();
  await page.getByRole("button", { name: "힌트 듣기" }).first().click();
  expect((await spoken()).at(-1)).toContain("채점 규칙");
});
