import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { LoopConfig } from "../src/model";
import {
  autoChecks,
  initialLoop,
  resetLoop,
  runLoop,
  stepLoop,
} from "../src/engines";
import { diagnose } from "../src/diagnose";
import { validateConfig } from "../src/storage";
import { bugCandidates } from "../src/bugChallenge";
import { designedCheck } from "../src/designedCheck";
const starter = (id: string) =>
  missions.find((m) => m.id === id)!.starter as LoopConfig;
const t = (s: string, v?: Record<string, string | number>) =>
  v ? s.replace(/\{(\w+)\}/g, (a, k) => (k in v ? String(v[k]) : a)) : s;
describe("반복 계산기", () => {
  it("정한 횟수만큼 값을 바꾸고 멈추며, 처음으로 돌아간다", () => {
    const c = starter("loop-1");
    let s = stepLoop(c, initialLoop(c));
    expect([s.round, s.value]).toEqual([1, 500]);
    s = runLoop(c, s);
    expect([s.round, s.value]).toEqual([7, 3500]);
    expect(stepLoop(c, s)).toBe(s);
    expect(resetLoop(c).value).toBe(0);
    expect(autoChecks(c, "r").every((x) => x.status === "pass")).toBe(true);
    // 줄어드는 반복과 처음 값이 있는 반복
    expect(runLoop(starter("loop-4")).value).toBe(2);
    expect(runLoop(starter("loop-2")).value).toBe(80);
  });
  it("한 번 더 도는 학습용 오류를 자동 검사와 힌트가 찾고, 정상 규칙은 통과한다", () => {
    const bugged = starter("loop-3");
    expect(runLoop(bugged).value).toBe(60);
    expect(
      autoChecks(bugged, "r")
        .filter((x) => x.status === "fail")
        .map((x) => x.label),
    ).toEqual(["정한 횟수만큼 반복", "반복이 끝난 값"]);
    expect(diagnose(bugged).map((f) => f.id)).toEqual(["loop-extra"]);
    const fixed = makeWork(
      missions.find((m) => m.id === "loop-3")!,
      true,
    ).draft.config;
    expect(autoChecks(fixed, "r").every((x) => x.status === "pass")).toBe(true);
    // 횟수만 틀리면 목표 값 힌트가 나온다.
    expect(
      diagnose({ ...starter("loop-1"), times: 6 }).map((f) => f.id),
    ).toEqual(["loop-goal"]);
  });
  it("파일 검사·버그 탐정·내가 설계한 검사에 쓰인다", () => {
    for (const m of missions.filter((x) => x.kind === "loop"))
      expect(validateConfig(m.starter)).toEqual(m.starter);
    expect(() => validateConfig({ ...starter("loop-1"), times: 0 })).toThrow();
    expect(bugCandidates("loop").length).toBeGreaterThan(0);
    const card = designedCheck(
      starter("loop-1"),
      { action: "loop-rounds", a: 3, b: 0, expected: "1500" },
      "r",
      t,
    )!;
    expect(card.status).toBe("pass");
    expect(card.actual).toContain("저금통(원) 1500");
  });
});
