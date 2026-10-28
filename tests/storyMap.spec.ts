import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("장면 연결 지도로 갈 수 없는 결말을 찾고 연결을 고치면 지도가 바뀐다", async ({
  page,
}) => {
  await page.goto("#/mission/story-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "학습 단계" })
    .getByRole("button")
    .nth(2)
    .click();
  const map = page.locator(".story-map");
  await expect(map.locator("figcaption")).toContainText(
    "시작에서 갈 수 없는 장면 1개 · 닿을 수 없는 목표 결말 1개",
  );
  await expect(map.locator(".story-map-warn")).toHaveText(
    "햇살 정원: 시작에서 갈 수 없어요 (목표 결말)",
  );
  await expect(map.locator(".story-node.unreachable")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "도착 장면 2" })
    .selectOption({ label: "햇살 정원" });
  await expect(map.locator("figcaption")).toContainText(
    "모든 장면에 갈 수 있어요",
  );
  await expect(map.locator(".story-node.unreachable")).toHaveCount(0);
  await expect(map.locator(".story-map-list li")).toContainText([
    "숲속의 작은 갈림길 → ‘커다란 나무 쪽으로’ → 나무 도서관",
    "숲속의 작은 갈림길 → ‘햇빛이 비치는 쪽으로’ → 햇살 정원",
  ]);
  const audit = await new AxeBuilder({ page })
    .include(".story-map")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
