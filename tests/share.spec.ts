import { test, expect } from "@playwright/test";

const start = async (page: import("@playwright/test").Page) => {
  await page.goto("#/mission/quiz-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("공유 퀴즈");
};

test("파일 공유를 지원하는 기기에서는 공유 창으로 작품 파일을 보낸다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const sent: { name: string; type: string; text: string; title?: string }[] =
      [];
    (window as unknown as { sent: typeof sent }).sent = sent;
    let cancel = false;
    (window as unknown as { cancelNext: () => void }).cancelNext = () =>
      (cancel = true);
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (d: ShareData) => Boolean(d.files?.length),
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (d: ShareData) => {
        if (cancel) {
          cancel = false;
          throw new DOMException("취소", "AbortError");
        }
        for (const f of d.files ?? [])
          sent.push({
            name: f.name,
            type: f.type,
            text: await f.text(),
            title: d.title,
          });
      },
    });
  });
  await start(page);
  const share = page
    .locator(".workspace-heading")
    .getByRole("button", { name: "공유로 보내기" });
  await share.click();
  await expect(
    page.getByRole("status").filter({ hasText: "공유 창으로 파일을 보냈어요" }),
  ).toBeVisible();
  const sent = await page.evaluate(
    () =>
      (
        window as unknown as {
          sent: { name: string; type: string; text: string; title?: string }[];
        }
      ).sent,
  );
  expect(sent).toHaveLength(1);
  expect(sent[0].name).toBe("뚝딱-작품-공유 퀴즈.json");
  expect(sent[0].type).toBe("application/json");
  expect(sent[0].title).toBe("공유 퀴즈");
  const backup = JSON.parse(sent[0].text);
  expect(backup.format).toBe("ttukttak-vibe-backup");
  expect(backup.works[0].draft.title).toBe("공유 퀴즈");

  // 사용자가 공유 창을 닫으면 아무 오류도 보이지 않는다.
  await page.evaluate(() =>
    (window as unknown as { cancelNext: () => void }).cancelNext(),
  );
  await page.locator(".toast button").click();
  await share.click();
  await expect(page.locator(".toast")).toHaveCount(0);

  // 친구 검사 요청 파일도 공유할 수 있다.
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(3)
    .click();
  await page.getByRole("button", { name: "요청 파일 공유로 보내기" }).click();
  // 공유는 비동기로 끝나므로 기록이 생길 때까지 기다린다.
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { sent: { name: string }[] }).sent
          .map((s) => s.name)
          .at(-1),
      ),
    )
    .toBe("친구검사요청-공유 퀴즈.json");
});

test("파일 공유를 지원하지 않는 기기에서는 공유 버튼을 숨기고 내려받기만 보인다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });
  await start(page);
  await expect(page.getByRole("button", { name: "공유로 보내기" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "파일 백업", exact: true }),
  ).toBeVisible();
});
