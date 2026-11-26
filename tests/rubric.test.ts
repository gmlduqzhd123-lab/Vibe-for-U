import { describe, it, expect, beforeEach } from "vitest";
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;
const {
  defaultRubric,
  isCustomRubric,
  resetRubric,
  rubric,
  saveRubric,
  validateRubric,
} = await import("../src/lessonData");
describe("평가 기준 맞춤", () => {
  beforeEach(() => resetRubric());
  it("고친 평가표를 저장하면 같은 배열이 바뀌고, 되돌리면 기본으로 돌아온다", () => {
    const before = rubric;
    const next = defaultRubric.map((r) => [...r]);
    next[0][0] = "문제 찾기";
    next[3][3] = "새 과제에 옮겨 설명한다.";
    saveRubric(next);
    expect(rubric).toBe(before);
    expect(rubric[0][0]).toBe("문제 찾기");
    expect(rubric[3][3]).toBe("새 과제에 옮겨 설명한다.");
    expect(isCustomRubric()).toBe(true);
    resetRubric();
    expect(rubric).toEqual(defaultRubric);
    expect(isCustomRubric()).toBe(false);
  });
  it("항목 수·단계 수가 다르거나 빈칸이 있으면 받지 않는다", () => {
    expect(() => validateRubric(defaultRubric.slice(0, 3))).toThrow();
    expect(() =>
      validateRubric(defaultRubric.map((r) => r.slice(0, 3))),
    ).toThrow();
    const blank = defaultRubric.map((r) => [...r]);
    blank[1][2] = "  ";
    expect(() => saveRubric(blank)).toThrow();
    expect(rubric).toEqual(defaultRubric);
    expect(() => validateRubric("x")).toThrow();
  });
});
