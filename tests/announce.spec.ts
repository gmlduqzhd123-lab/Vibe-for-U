import { test, expect } from "@playwright/test";
// 화면 낭독기 흐름 검사: 실행 화면에서 누를 때마다 바뀐 내용이 읽히려면
// (1) 알림 칸(role=status)이 누르기 전부터 화면에 있고 (2) 누른 뒤 그 칸의 글이 바뀌어야 한다.
// 나중에 끼워 넣는 알림 칸은 낭독기가 읽지 않을 수 있어, 누르기 전에 있는 칸만 센다.
const cases: { mission: string; press: string | RegExp; says: RegExp }[] = [
  { mission: "quiz-1", press: /^1\s/, says: /선택 1.*점수 0 → 1/ },
  { mission: "story-1", press: /./, says: /장면 .+ → .+/ },
  {
    mission: "rule-1",
    press: "+1 스티커 붙이기",
    says: /스티커 1\.\s*스티커를 모아 볼까요/,
  },
  { mission: "sort-1", press: "한 장 넣기", says: /다음 카드: 「닭」/ },
  { mission: "loop-1", press: "한 번 반복", says: /일째 1 \/ 7/ },
  { mission: "pattern-1", press: "모두 그리기", says: /다 그렸어요/ },
];
for (const c of cases)
  test(`낭독기 알림: ${c.mission} 실행 화면은 누르기 전부터 있는 알림 칸으로 결과를 알린다`, async ({
    page,
  }) => {
    await page.goto(`#/mission/${c.mission}`);
    await page
      .getByRole("button", { name: "이 미션 시작하기", exact: true })
      .click();
    const id = page.url().split("/work/")[1].split("/")[0];
    await page.goto(`#/work/${id}/2`);
    const inner = page.locator(".preview-panel .preview-inner");
    await expect(inner).toBeVisible();
    // 누르기 전에 있는 알림 칸에 표시를 해 둔다.
    const before = await inner.locator('[role="status"]').evaluateAll((els) =>
      els.map((el, i) => {
        el.setAttribute("data-live-before", String(i));
        return el.textContent ?? "";
      }),
    );
    expect(before.length, "누르기 전에 알림 칸이 있어야 해요").toBeGreaterThan(
      0,
    );
    const area = /quiz|story/.test(c.mission)
      ? inner.locator(".answers")
      : inner;
    await area.getByRole("button", { name: c.press }).first().click();
    // 그 칸 가운데 하나의 글이 바뀌고, 기대한 내용을 담는다.
    await expect
      .poll(async () =>
        (
          await inner
            .locator("[data-live-before]")
            .evaluateAll((els) => els.map((el) => el.textContent ?? ""))
        ).join(" | "),
      )
      .toMatch(c.says);
    const after = await inner
      .locator("[data-live-before]")
      .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
    expect(after).not.toEqual(before);
  });
