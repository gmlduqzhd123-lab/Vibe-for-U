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
describe("작품 파일에 담는 되돌리기 단계", () => {
  it("최근 다섯 단계만 담고, 파일을 읽으면 새 ID에 붙는다", async () => {
    const { recentSteps, saveHistory } = await import("../src/undoHistory");
    const { exportJSON, parseImportWithUndo } = await import("../src/storage");
    const { missions } = await import("../src/data");
    const { makeWork } = await import("../src/model");
    const w = makeWork(missions[0]);
    const step = (title: string) => ({
      draft: { ...w.draft, title },
      versions: w.versions,
      editingLabel: w.editingLabel,
    });
    saveHistory(w.id, {
      undo: ["a", "b", "c", "d", "e", "f", "g"].map(step),
      redo: [],
      at: 0,
    });
    expect(recentSteps(w.id).map((s) => s.draft.title)).toEqual([
      "c",
      "d",
      "e",
      "f",
      "g",
    ]);
    const text = exportJSON([w]);
    expect(JSON.parse(text).undo[w.id]).toHaveLength(5);
    expect(JSON.parse(exportJSON([w], false)).undo).toBeUndefined();
    const { works, undo } = parseImportWithUndo(text);
    expect(works).toHaveLength(1);
    expect(works[0].id).not.toBe(w.id);
    expect(undo.get(works[0].id)?.map((s) => s.draft.title)).toEqual([
      "c",
      "d",
      "e",
      "f",
      "g",
    ]);
    // 손상된 되돌리기 기록은 작품만 가져온다.
    const broken = JSON.parse(text);
    broken.undo[w.id] = [{ draft: 1 }];
    const again = parseImportWithUndo(JSON.stringify(broken));
    expect(again.works).toHaveLength(1);
    expect(again.undo.size).toBe(0);
  });
});
