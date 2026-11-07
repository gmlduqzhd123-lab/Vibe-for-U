import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { diagnose } from "../src/diagnose";
import { makeWork } from "../src/model";
import type { PatternConfig } from "../src/model";
describe("맞춤 힌트", () => {
  it("학습용 오류가 있는 미션마다 그 오류에 맞는 힌트를 찾는다", () => {
    const expected: Record<string, string> = {
      "quiz-3": "quiz-score-once",
      "quiz-4": "quiz-reset",
      "story-3": "story-unreachable",
      "timer-3": "timer-end",
      "pattern-3": "pattern-wrap",
      "rule-3": "rule-shadowed",
      "sort-3": "sort-shadowed",
    };
    for (const m of missions.filter((m) => m.learningError))
      expect(
        diagnose(m.starter).map((f) => f.id),
        m.id,
      ).toContain(expected[m.id]);
  });
  it("정상 규칙으로 시작한 퀴즈·이야기·타이머에는 힌트가 없다", () => {
    for (const m of missions.filter((m) => m.kind !== "pattern"))
      expect(diagnose(makeWork(m, true).draft.config), m.id).toEqual([]);
  });
  it("패턴에서 빠진 칸은 마지막 위치에서 가장 가까운 칸으로 가는 명령을 제안한다", () => {
    const c: PatternConfig = {
      kind: "pattern",
      size: 4,
      repeat: 1,
      commands: [{ dir: "right", count: 2 }],
      edge: "stop",
      target: ["0,0", "1,0", "2,0", "2,1", "2,2"],
    };
    const [f] = diagnose(c);
    expect(f.id).toBe("pattern-missing");
    expect(f.vars).toMatchObject({
      n: 2,
      at: "2,0",
      to: "2,1",
      dir: "아래",
      k: 1,
    });
  });
});
