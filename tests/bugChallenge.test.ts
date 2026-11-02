import { describe, it, expect } from "vitest";
import { kinds } from "../src/model";
import {
  bugCandidates,
  bugSolved,
  isBugChallenge,
  makeBugChallenge,
} from "../src/bugChallenge";
import { diagnose } from "../src/diagnose";
describe("버그 탐정 무한 연습", () => {
  it("네 종류 모두 오류를 넣을 수 있는 도전이 있고, 넣은 오류는 맞춤 힌트가 찾는다", () => {
    for (const k of kinds) {
      const list = bugCandidates(k);
      expect(list.length, k).toBeGreaterThan(0);
      for (const c of list)
        expect(diagnose(c.config).length).toBeGreaterThan(0);
    }
    expect(bugCandidates().length).toBeGreaterThanOrEqual(10);
  });
  it("도전 작품은 고치기 전에는 풀리지 않았고, 시작 버전에 도전 표시가 남는다", () => {
    let i = 0;
    const seq = [0.1, 0.5, 0.9];
    const w = makeBugChallenge(
      (m) => `도전 · ${m.title}`,
      "quiz",
      () => seq[i++ % 3],
    );
    expect(isBugChallenge(w)).toBe(true);
    expect(bugSolved(w)).toBe(false);
    expect(w.draft.title).toMatch(/^도전 · /);
    // 정상 규칙으로 되돌리면 풀린다.
    const fixed = {
      ...w,
      draft: {
        ...w.draft,
        config: { ...w.draft.config, scoring: "once", resetScore: true },
      },
    } as typeof w;
    expect(bugSolved(fixed)).toBe(true);
  });
});
