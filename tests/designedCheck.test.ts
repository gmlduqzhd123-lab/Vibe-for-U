import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import {
  designActions,
  designMatches,
  designedCheck,
  runDesign,
} from "../src/designedCheck";
const t = (s: string, v?: Record<string, string | number>) =>
  v ? s.replace(/\{(\w+)\}/g, (a, k) => (k in v ? String(v[k]) : a)) : s;
const starter = (id: string) => missions.find((m) => m.id === id)!.starter;
describe("내가 설계한 검사", () => {
  it("종류마다 실험 동작이 있고 값 범위를 설정에서 정한다", () => {
    for (const m of missions)
      expect(designActions(m.starter, t).length).toBeGreaterThan(0);
    const quiz = designActions(starter("quiz-3"), t)[0];
    expect(quiz.params[0].max).toBeGreaterThan(0);
  });
  it("퀴즈: 정답을 두 번 고르면 채점 규칙에 따라 점수가 달라진다", () => {
    const c = starter("quiz-3");
    const twice = runDesign(
      c,
      { action: "quiz-twice", a: 1, b: 1, expected: "" },
      t,
    )!;
    expect(twice.actual).toContain(
      c.kind === "quiz" && c.scoring === "attempt" ? "2" : "1",
    );
    const all = runDesign(
      c,
      { action: "quiz-all", a: 1, b: 1, expected: "" },
      t,
    )!;
    expect(all.label).toBe("모든 문제를 정답으로 풀기 → 최종 점수");
  });
  it("규칙·타이머·패턴·이야기도 실행 결과를 문장으로 돌려준다", () => {
    const rule = runDesign(
      starter("rule-1"),
      { action: "rule-press", a: 1, b: 3, expected: "" },
      t,
    )!;
    expect(rule.label).toContain("1번 버튼을 3번 누르기");
    expect(rule.actual).toContain("문구");
    const timer = runDesign(
      starter("timer-1"),
      { action: "timer-wait", a: 5, b: 0, expected: "" },
      t,
    )!;
    expect(timer.actual).toMatch(/남은 시간 \d+초/);
    const pattern = runDesign(
      starter("pattern-1"),
      { action: "pattern-run", a: 0, b: 0, expected: "" },
      t,
    )!;
    expect(pattern.actual).toMatch(/칠한 칸 \d+개/);
    const story = runDesign(
      starter("story-1"),
      { action: "story-choose", a: 1, b: 0, expected: "" },
      t,
    )!;
    expect(story.actual).toContain("장면");
  });
  it("예상에 숫자가 있으면 숫자로, 없으면 문구 포함으로 비교한다", () => {
    expect(designMatches("점수 2", "점수 2")).toBe(true);
    expect(designMatches("2", "점수 2")).toBe(true);
    expect(designMatches("1", "점수 2")).toBe(false);
    expect(designMatches("종료 안내", "남은 시간 0초 · 종료 안내 표시")).toBe(
      true,
    );
    expect(designMatches("", "점수 2")).toBe(false);
  });
  it("카드는 학습자 직접 확인으로 들어가고 상태를 앱이 비교해 넣는다", () => {
    const c = designedCheck(
      starter("quiz-3"),
      { action: "quiz-twice", a: 1, b: 1, expected: "점수 1" },
      "r1",
      t,
    )!;
    expect(c.source).toBe("self");
    expect(c.revision).toBe("r1");
    expect(c.label).toContain("내가 설계한 검사");
    expect(["pass", "fail"]).toContain(c.status);
    expect(
      designedCheck(
        starter("quiz-3"),
        { action: "없는 동작", a: 1, b: 1, expected: "" },
        "r",
        t,
      ),
    ).toBeNull();
  });
});
