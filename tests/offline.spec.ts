import { test, expect } from "@playwright/test";

test("한 번 연 뒤에는 인터넷이 끊겨도 앱과 미션 화면이 열린다", async ({
  page,
  context,
}) => {
  await page.goto("#/home");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // 캐시 목록에 화면 실행 파일이 모두 들어갔는지 확인한다.
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const mine = names.filter((n) => n.startsWith("vibe-for-u-v"));
    const keys = await (await caches.open(mine[0])).keys();
    return { mine, urls: keys.map((r) => new URL(r.url).pathname) };
  });
  expect(cached.mine).toHaveLength(1);
  expect(cached.mine[0]).not.toBe("vibe-for-u-v1");
  expect(cached.urls.some((u) => /\/assets\/index-.+\.js$/.test(u))).toBe(true);
  expect(cached.urls.some((u) => /\/assets\/index-.+\.css$/.test(u))).toBe(
    true,
  );
  expect(cached.urls.some((u) => u.includes("/materials/"))).toBe(false);

  await context.setOffline(true);
  await page.goto("#/missions");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "미션 공작대" }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("새 배포본이 준비되면 저장 후 새로고침 안내를 보여 준다", async ({
  page,
}) => {
  await page.goto("#/missions");
  await page.evaluate(() => dispatchEvent(new Event("ttukttak:update")));
  const banner = page.locator(".update-banner");
  await expect(banner).toContainText("새 버전이 준비됐어요");
  await banner.getByRole("button", { name: "나중에" }).click();
  await expect(banner).toBeHidden();
  await page.evaluate(() => dispatchEvent(new Event("ttukttak:update")));
  await banner.getByRole("button", { name: "저장하고 새로고침" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "미션 공작대",
  );
  await expect(banner).toBeHidden();
});
