import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
// 앱 저장소에 기록을 직접 넣는다(손상·새 형식 기록 흉내).
const plant = (page: Page, records: unknown[]) =>
  page.evaluate(
    (items) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("ttukttak-vibe:works-v1", 1);
        r.onsuccess = () => {
          const tx = r.result.transaction("works", "readwrite");
          for (const item of items) tx.objectStore("works").put(item);
          tx.oncomplete = () => {
            r.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    records,
  );

test("화면 오류가 나면 안전 화면에서 백업하고 다른 화면으로 갈 수 있다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const names: string[] = [];
    (window as unknown as { names: string[] }).names = names;
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) names.push(this.download);
      return click.call(this);
    };
  });
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  const id = page.url().split("/work/")[1].split("/")[0];
  // 문항이 하나도 없는 손상된 퀴즈로 바꿔 넣는다.
  const work = await page.evaluate(
    (workId) =>
      new Promise<Record<string, unknown>>((resolve) => {
        const r = indexedDB.open("ttukttak-vibe:works-v1", 1);
        r.onsuccess = () => {
          const get = r.result
            .transaction("works")
            .objectStore("works")
            .get(workId);
          get.onsuccess = () => {
            r.result.close();
            resolve(get.result);
          };
        };
      }),
    id,
  );
  (work.draft as { config: { questions: unknown[] } }).config.questions = [];
  await plant(page, [work]);
  await page.reload();
  const crash = page.getByRole("alert").filter({ hasText: "문제가 생겼어요" });
  await expect(crash).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주 메뉴" })).toBeVisible();
  await crash.getByRole("button", { name: "모든 작품 파일로 백업" }).click();
  await expect(crash.getByRole("status")).toContainText(
    "다운로드를 요청했어요",
  );
  expect(
    await page.evaluate(() => (window as unknown as { names: string[] }).names),
  ).toEqual([expect.stringMatching(/^뚝딱-작품-.*\.json$/)]);
  await crash.getByRole("button", { name: "작품 선반으로" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "내 작품 선반",
  );
  await expect(crash).toBeHidden();
});

test("더 새로운 앱의 기록이 섞여 있어도 나머지 작품을 열고 원본을 보관한다", async ({
  page,
}) => {
  await page.goto("#/mission/timer-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await expect(page.getByText("기기에 저장됨", { exact: true })).toBeVisible();
  await plant(page, [{ id: "from-the-future", schemaVersion: 99 }]);
  await page.goto("#/library");
  await page.reload();
  const warning = page
    .getByRole("alert")
    .filter({ hasText: "읽지 못한 기록이 1개" });
  await expect(warning).toBeVisible();
  await expect(page.locator(".work-card")).toHaveCount(1);
  await expect(page.getByText("저장소 연결 실패")).toBeHidden();
  const download = page.waitForEvent("download");
  await warning
    .getByRole("button", { name: "읽지 못한 기록 원본 내려받기" })
    .click();
  const text = await (await download).createReadStream();
  let body = "";
  for await (const chunk of text) body += chunk;
  expect(JSON.parse(body)).toEqual([
    { id: "from-the-future", schemaVersion: 99 },
  ]);
});
