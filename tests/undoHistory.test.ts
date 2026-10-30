import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { move, remember, stepOf, UNDO_LIMIT } from "../src/undoHistory";
import type { History } from "../src/undoHistory";
const fresh = (): History => ({ undo: [], redo: [], at: 0 });
describe("되돌리기 기록", () => {
  it("연속 입력은 한 단계로 묶고, 바뀐 때만 저장이 필요하다고 알린다", () => {
    const h = fresh();
    const w = makeWork(missions[0]);
    expect(remember(h, stepOf(w), true, 1000)).toBe(true);
    expect(remember(h, stepOf(w), true, 1500)).toBe(false);
    expect(h.undo).toHaveLength(1);
    expect(remember(h, stepOf(w), true, 3000)).toBe(true);
    expect(h.undo).toHaveLength(2);
  });
  it("버전 묶음까지 되돌리고 다시 하며, 새 편집은 다시 하기를 비운다", () => {
    const h = fresh();
    const before = makeWork(missions[0]);
    const after = {
      ...before,
      versions: [...before.versions, { ...before.versions[0], id: "v2" }],
    };
    remember(h, stepOf(before), false);
    const back = move(h, "undo", stepOf(after))!;
    expect(back.versions).toHaveLength(1);
    expect(h.redo).toHaveLength(1);
    const forward = move(h, "redo", stepOf(before))!;
    expect(forward.versions).toHaveLength(2);
    remember(h, stepOf(before), false);
    expect(h.redo).toHaveLength(0);
    expect(move(fresh(), "undo", stepOf(before))).toBeUndefined();
  });
  it(`${UNDO_LIMIT}단계를 넘으면 가장 오래된 단계부터 버린다`, () => {
    const h = fresh();
    const w = makeWork(missions[0]);
    for (let i = 0; i < UNDO_LIMIT + 5; i++)
      remember(h, { ...stepOf(w), editingLabel: String(i) }, false);
    expect(h.undo).toHaveLength(UNDO_LIMIT);
    expect(h.undo[0].editingLabel).toBe("5");
  });
});
