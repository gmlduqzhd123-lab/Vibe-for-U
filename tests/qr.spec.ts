import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { useClipboard } from "./support";

test("QR로 보내기: 받기 주소를 다른 기기에서 열어 새 작품으로 받는다", async ({
  page,
  browser,
}) => {
  const read = await useClipboard(page);
  await page.goto("#/mission/story-1");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  await page.getByLabel("작품 제목", { exact: true }).fill("QR 이야기");
  await page.getByRole("button", { name: "QR로 보내기" }).click();
  const dialog = page.getByRole("dialog", { name: "QR로 보내기" });
  await expect(
    dialog.getByRole("img", { name: "받기 주소가 담긴 QR 코드" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .include(".qr-dialog")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog.getByRole("button", { name: "주소 복사" }).click();
  const url = await read();
  expect(url).toContain("#/receive/z");
  await dialog.getByRole("button", { name: "닫기" }).click();

  // 다른 기기: 저장소를 함께 쓰지 않는 새 브라우저 창
  const other = await browser.newContext();
  const phone = await other.newPage();
  await phone.goto(url);
  await expect(phone.getByRole("heading", { level: 1 })).toHaveText(
    "작품 「QR 이야기」이 왔어요",
  );
  await phone.getByRole("button", { name: "새 작품으로 받기" }).click();
  await expect(phone.getByLabel("작품 제목", { exact: true })).toHaveValue(
    "QR 이야기",
  );
  await phone.goto(url.split("#")[0] + "#/library");
  await expect(phone.getByRole("heading", { name: "QR 이야기" })).toBeVisible();
  await other.close();
});

test("친구 검사 요청도 QR로 보내 받는 기기의 친구 검사 화면에서 연다", async ({
  page,
  browser,
}) => {
  const read = await useClipboard(page);
  await page.goto("#/mission/quiz-3");
  await page
    .getByRole("button", { name: "이 미션 시작하기", exact: true })
    .click();
  const id = page.url().split("/work/")[1].split("/")[0];
  await page.goto(`#/work/${id}/3`);
  await page.getByRole("button", { name: "요청을 QR로 보내기" }).click();
  const dialog = page.getByRole("dialog", { name: "요청을 QR로 보내기" });
  await dialog.getByRole("button", { name: "주소 복사" }).click();
  const url = await read();
  const other = await browser.newContext();
  const friend = await other.newPage();
  await friend.goto(url);
  await friend
    .getByRole("button", { name: "친구 작품 검사하기로 열기" })
    .click();
  await expect(friend.getByLabel("검사한 친구 (이름이나 별명)")).toBeVisible();
  await other.close();
});

test("망가진 QR 주소는 받지 않고 알려 준다", async ({ page }) => {
  await page.goto("#/receive/zbroken");
  await expect(page.getByRole("alert")).toContainText(
    "QR 주소를 읽지 못했어요",
  );
});
