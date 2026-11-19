import { test, expect } from "@playwright/test";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { exportJSON } from "../src/storage";

test("분류 앱: 나머지 바구니 이름을 바꿔도 카드가 따라 바뀌어 자동 검사가 통과한다", async ({
  page,
}) => {
  await page.goto("#/mission/sort-4");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  await page
    .getByLabel("나머지 바구니 이름 (어떤 조건에도 맞지 않을 때)")
    .fill("중간이에요");
  await expect(page.getByLabel("카드 2이 들어갈 바구니")).toHaveValue(
    "중간이에요",
  );
  await page.getByLabel("바구니 1 이름").fill("묵직해요");
  await expect(page.getByLabel("카드 3이 들어갈 바구니")).toHaveValue(
    "묵직해요",
  );
  await page.goto(`#/work/${id}/3`);
  await page
    .getByRole("button", { name: "현재 설정 자동 검사", exact: true })
    .click();
  await expect(page.locator(".check-card.fail")).toHaveCount(0);
  await expect(page.locator(".smart-hints")).toHaveCount(0);
});

test("의견 문장 모음: 한 카드에서 저장한 내 문장이 다른 카드에도 바로 보이고 서로 덮어쓰지 않는다", async ({
  page,
}) => {
  const works = [0, 1].map((i) => makeWork(missions[i]));
  await page.goto("#/teacher");
  await page
    .getByRole("button", { name: "학급 작품 모으기", exact: true })
    .click();
  await page.getByLabel("학생 작품 JSON 파일 여러 개").setInputFiles(
    works.map((w, i) => ({
      name: `${i + 1}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(exportJSON([w], false)),
    })),
  );
  const cards = page.locator(".review-card");
  for (const i of [0, 1]) {
    await cards.nth(i).locator("summary").first().click();
    await cards.nth(i).locator(".phrase-bank summary").click();
  }
  const add = async (i: number, text: string) => {
    await cards.nth(i).getByLabel("새 문장").fill(text);
    await cards
      .nth(i)
      .getByRole("button", { name: "내 문장으로 저장" })
      .click();
  };
  await add(0, "첫째 문장이에요.");
  await expect(
    cards.nth(1).getByRole("button", { name: "첫째 문장이에요.", exact: true }),
  ).toBeVisible();
  await add(1, "둘째 문장이에요.");
  await expect(
    cards.nth(0).getByRole("button", { name: "둘째 문장이에요.", exact: true }),
  ).toBeVisible();
  // 두 문장 모두 저장소에 남는다.
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ttukttak-vibe:phrases") ?? "[]"),
    ),
  ).toEqual(["첫째 문장이에요.", "둘째 문장이에요."]);
  await cards
    .nth(1)
    .getByRole("button", { name: "내 문장 「첫째 문장이에요.」 지우기" })
    .click();
  await expect(
    cards.nth(0).getByRole("button", { name: "첫째 문장이에요.", exact: true }),
  ).toHaveCount(0);
});

test("영어 번역을 고치면 이미 보이는 메뉴 글자도 바로 바뀐다", async ({
  page,
}) => {
  await page.goto("#/teacher");
  await page.getByLabel("언어 · Language").selectOption("en");
  await page.getByRole("button", { name: "Fix English translations" }).click();
  const nav = page.getByRole("navigation", { name: "Main menu" });
  await expect(nav.getByRole("button", { name: "Missions" })).toBeVisible();
  const fix = page.locator(".translation-fix");
  await fix.getByLabel("Search in Korean or English").fill("미션 공작대");
  const row = fix.locator(".fix-list li").filter({
    has: page.locator('p[lang="ko"]', { hasText: /^미션 공작대$/ }),
  });
  await row.getByLabel("English sentence").fill("Mission Lab");
  await row.getByRole("button", { name: "Save fixed translation" }).click();
  // 다른 화면으로 가지 않아도 메뉴가 바뀐다.
  await expect(nav.getByRole("button", { name: "Mission Lab" })).toBeVisible();
  await row.getByRole("button", { name: "Restore original" }).click();
  await expect(nav.getByRole("button", { name: "Missions" })).toBeVisible();
});

test("휴대전화 너비에서 설정 선택 상자 글자는 보통 글자 크기일 때 14px 그대로다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/2`);
  const size = await page
    .getByRole("combobox", { name: "채점 규칙", exact: true })
    .evaluate((el) => getComputedStyle(el).fontSize);
  expect(size).toBe("14px");
});
