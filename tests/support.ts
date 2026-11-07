import type { Page } from "@playwright/test";
const engine = (page: Page) => page.context().browser()?.browserType().name();
// PDF 증거 파일은 Chromium만 만들 수 있다. 다른 엔진에서는 인쇄 화면 검사만 한다.
export async function savePdf(page: Page, path: string) {
  if (engine(page) !== "chromium") return;
  await page.pdf({ path, format: "A4", printBackground: true });
}
// Chromium은 실제 클립보드 권한을 쓰고, 권한 이름을 모르는 WebKit 등은 복사한 글을 기록해 읽는다.
export async function useClipboard(page: Page) {
  if (engine(page) === "chromium")
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
  else
    await page.addInitScript(() => {
      let last = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (t: string) => {
            last = t;
          },
          readText: async () => last,
        },
      });
    });
  return () => page.evaluate(() => navigator.clipboard.readText());
}
// 화면 안에서 문제를 찾아 사람이 읽을 수 있는 설명으로 돌려준다.
export async function problems(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const name = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} “${(el.textContent ?? "").trim().slice(0, 30)}”`;
    if (document.documentElement.scrollWidth > innerWidth + 1)
      out.push(
        `가로 넘침 ${document.documentElement.scrollWidth}px > ${innerWidth}px`,
      );
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        !el.closest(
          "[hidden], dialog:not([open]), details:not([open]) > :not(summary), .sr-only",
        )
      );
    };
    // 넘친 글자를 숨기는 상자(overflow hidden/clip)에서 글자가 잘렸는지
    for (const el of document.querySelectorAll<HTMLElement>(
      "main *, .topbar *",
    )) {
      if (!visible(el) || !el.textContent?.trim()) continue;
      const s = getComputedStyle(el);
      const clips = s.overflowX === "hidden" || s.overflowX === "clip";
      if (
        clips &&
        el.scrollWidth > el.clientWidth + 2 &&
        s.textOverflow !== "ellipsis"
      )
        out.push(`잘린 글자: ${name(el)}`);
    }
    // 선택 상자가 고른 글자보다 좁아 글자가 잘리는지(선택 상자는 넘침을 재지 못해 글자 너비를 잰다)
    const ctx = document.createElement("canvas").getContext("2d");
    for (const sel of document.querySelectorAll<HTMLSelectElement>(
      "main select, .topbar select",
    )) {
      const text = sel.selectedOptions[0]?.text.trim();
      if (!ctx || !text || !visible(sel)) continue;
      const s = getComputedStyle(sel);
      ctx.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      const need =
        ctx.measureText(text).width +
        parseFloat(s.paddingLeft) +
        parseFloat(s.paddingRight) +
        14; // 펼침 화살표 자리
      if (need > sel.clientWidth + 2)
        out.push(`잘린 선택 상자: ${name(sel)} “${text}”`);
    }
    // 버튼·링크·입력 칸끼리 3px 넘게 겹치는지(안에 든 것끼리는 제외)
    const controls = [
      ...document.querySelectorAll<HTMLElement>(
        "main button, main a, main input, main select, main textarea, .topbar button, .topbar select, .topbar summary",
      ),
    ].filter(visible);
    for (let i = 0; i < controls.length; i++)
      for (let j = i + 1; j < controls.length; j++) {
        const a = controls[i];
        const b = controls[j];
        if (a.contains(b) || b.contains(a)) continue;
        const r = a.getBoundingClientRect();
        const q = b.getBoundingClientRect();
        const w = Math.min(r.right, q.right) - Math.max(r.left, q.left);
        const h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        if (w > 3 && h > 3) out.push(`겹친 버튼: ${name(a)} ↔ ${name(b)}`);
      }
    return out;
  });
}
