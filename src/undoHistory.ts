import { APP_PREFIX } from "./model";
import type { Work } from "./model";
// 되돌리기 한 단계: 편집본과 저장 버전 묶음을 함께 기억해 버전 복원·삭제도 되돌린다.
export type Step = Pick<Work, "draft" | "versions" | "editingLabel">;
export type History = { undo: Step[]; redo: Step[]; at: number };
export const UNDO_LIMIT = 50;
// 탭 저장소에 넣을 수 있는 크기(문자 수). 넘치면 오래된 단계부터 버린다.
const STORE_LIMIT = 1_500_000;
export const stepOf = (w: Work): Step => ({
  draft: w.draft,
  versions: w.versions,
  editingLabel: w.editingLabel,
});
// 바꾸기 전 모습을 기억한다. coalesce면 잇달아 입력하는 글자를 한 단계로 묶는다.
// 기록이 실제로 바뀌었는지 돌려준다(바뀐 때만 저장하면 된다).
export function remember(
  h: History,
  before: Step,
  coalesce: boolean,
  stamp = Date.now(),
) {
  const push = !coalesce || stamp - h.at > 800 || !h.undo.length;
  const changed = push || h.redo.length > 0;
  if (push) {
    h.undo.push(before);
    if (h.undo.length > UNDO_LIMIT) h.undo.shift();
  }
  h.at = coalesce ? stamp : 0;
  h.redo = [];
  return changed;
}
export function move(h: History, from: "undo" | "redo", current: Step) {
  const target = h[from].pop();
  if (!target) return undefined;
  h[from === "undo" ? "redo" : "undo"].push(current);
  h.at = 0;
  return target;
}
const key = (id: string) => `${APP_PREFIX}undo:${id}`;
const pending = new Map<
  string,
  { timer: ReturnType<typeof setTimeout>; h: History }
>();
// 탭을 닫거나 새로고침하기 직전에는 기다리지 않고 바로 쓴다.
if (typeof addEventListener === "function")
  addEventListener("pagehide", () => {
    for (const [id, p] of pending) {
      clearTimeout(p.timer);
      writeHistory(id, p.h);
    }
    pending.clear();
  });
// 같은 탭에서는 새로고침해도 되돌리기 기록이 남도록 sessionStorage에 둔다.
// 입력을 막지 않게 잠깐 모았다가 한 번에 쓴다.
export function saveHistory(id: string, h: History) {
  clearTimeout(pending.get(id)?.timer);
  pending.set(id, {
    h,
    timer: setTimeout(() => {
      pending.delete(id);
      writeHistory(id, h);
    }, 500),
  });
}
export function forgetHistory(id?: string) {
  // 아직 쓰지 않은 기록이 지운 뒤에 다시 써지지 않게 먼저 취소한다.
  for (const [k, p] of pending)
    if (!id || k === id) {
      clearTimeout(p.timer);
      pending.delete(k);
    }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && (id ? k === key(id) : k.startsWith(`${APP_PREFIX}undo:`)))
        sessionStorage.removeItem(k);
    }
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}
function writeHistory(id: string, h: History) {
  try {
    const data = { undo: [...h.undo], redo: [...h.redo] };
    let text = JSON.stringify(data);
    while (
      text.length > STORE_LIMIT &&
      (data.undo.length || data.redo.length)
    ) {
      if (data.undo.length) data.undo.shift();
      else data.redo.shift();
      text = JSON.stringify(data);
    }
    sessionStorage.setItem(key(id), text);
  } catch {
    // 저장소를 쓸 수 없으면 이 화면에서만 기억한다.
  }
}
export function loadHistory(id: string): History {
  try {
    const raw = JSON.parse(sessionStorage.getItem(key(id)) ?? "null");
    if (raw && Array.isArray(raw.undo) && Array.isArray(raw.redo))
      return { undo: raw.undo, redo: raw.redo, at: 0 };
  } catch {
    // 손상된 기록은 버린다.
  }
  return { undo: [], redo: [], at: 0 };
}
