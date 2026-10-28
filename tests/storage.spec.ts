import { test, expect } from "@playwright/test";
// 테스트 브라우저마다 보존 허락 방식이 달라 저장소 API를 흉내 낸다.
const fakeStorage = (usage: number) => ({
  usage,
  script: () => {
    let granted = false;
    const u = (window as unknown as { fakeUsage: number }).fakeUsage;
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        persisted: async () => granted,
        persist: async () => (granted = true),
        estimate: async () => ({ usage: u, quota: 100 * 1024 ** 2 }),
      },
    });
  },
});

for (const { usage, warn } of [
  { usage: 2 * 1024 ** 2, warn: false },
  { usage: 90 * 1024 ** 2, warn: true },
])
  test(`작품 선반에서 기록 보존을 요청하고 사용 용량을 본다 (${usage / 1024 ** 2}MB)`, async ({
    page,
  }) => {
    const fake = fakeStorage(usage);
    await page.addInitScript(
      (n) => ((window as unknown as { fakeUsage: number }).fakeUsage = n),
      fake.usage,
    );
    await page.addInitScript(fake.script);
    await page.goto("#/library");
    const panel = page.locator(".storage-health");
    await expect(panel).toContainText("보존 요청 전");
    await expect(panel).toContainText(
      `사용 중 ${usage === 2 * 1024 ** 2 ? "2.0MB" : "90.0MB"} / 사용 가능 약 100.0MB`,
    );
    await expect(panel.getByRole("alert")).toHaveCount(warn ? 1 : 0);
    await panel
      .getByRole("button", { name: "이 기기에 기록 보존 요청" })
      .click();
    await expect(panel).toContainText("보존 요청 허락됨");
    await expect(
      panel.getByRole("button", { name: "이 기기에 기록 보존 요청" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("status").filter({ hasText: "보존을 허락했어요" }),
    ).toBeVisible();
  });
