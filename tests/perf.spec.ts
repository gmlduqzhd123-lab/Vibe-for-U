import { test, expect } from "@playwright/test";
// 느린 인터넷(1.6Mbps·지연 150ms)과 느린 기기(CPU 4배 느리게)를 흉내 내어
// 처음 여는 첫 화면과 미션 화면이 정한 시간 안에 뜨는지 본다. Chromium 계열에서만 흉내 낼 수 있다.
const BUDGET_MS = { home: 6000, mission: 3000 };
test("성능 예산: 느린 인터넷·저사양 기기에서도 첫 화면이 제때 뜬다", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "CDP 흉내는 Chromium 계열만 지원해요");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  // 처음 방문: 캐시 없이 첫 화면이 뜰 때까지
  let start = Date.now();
  await page.goto("#/home", { waitUntil: "commit" });
  await page.locator("main h1").first().waitFor();
  const home = Date.now() - start;
  // 첫 화면에서 미션 화면으로 이동(나눠 불러오는 화면)
  start = Date.now();
  await page.goto("#/mission/quiz-1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const mission = Date.now() - start;
  test.info().annotations.push({
    type: "측정",
    description: `첫 화면 ${home}ms · 미션 화면 ${mission}ms`,
  });
  console.log(`첫 화면 ${home}ms · 미션 화면 ${mission}ms`);
  expect(home).toBeLessThan(BUDGET_MS.home);
  expect(mission).toBeLessThan(BUDGET_MS.mission);
});
