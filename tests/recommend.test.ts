import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { Work } from "../src/model";
import { recommend } from "../src/recommend";
const by = (id: string) => missions.find((m) => m.id === id)!;
const finish = (w: Work) => {
  const d = w.draft;
  d.goalReviewed = true;
  d.originalPrompt = d.arrangedPrompt = "요청";
  d.prediction = "예상";
  d.runRevision = d.revision;
  d.checks = [
    {
      id: "c",
      label: "검사",
      expected: "기대",
      actual: "실제",
      source: "self",
      status: "pass",
      revision: d.revision,
      at: w.createdAt,
    },
  ];
  d.change = { ...d.change, reason: "이유" };
  d.reflection = d.help = "기록";
  return w;
};
describe("미션 추천", () => {
  it("처음이면 퀴즈 1 하나만 권한다", () => {
    const picks = recommend([]);
    expect(picks.map((p) => p.mission.id)).toEqual(["quiz-1"]);
    expect(picks[0].reason).toBe("처음이라면 여기서 시작해요.");
  });
  it("하던 미션 → 끝낸 종류의 다음 미션 → 안 해 본 종류 순으로 셋까지 권한다", () => {
    const done = finish(makeWork(by("quiz-1")));
    done.updatedAt = "2026-11-01T00:00:00.000Z";
    const doing = makeWork(by("story-1"));
    doing.updatedAt = "2026-11-02T00:00:00.000Z";
    const picks = recommend([done, doing]);
    expect(picks.map((p) => p.mission.id)).toEqual([
      "story-1",
      "quiz-2",
      "timer-1",
    ]);
    expect(picks.map((p) => p.reason)).toEqual([
      "하던 미션을 이어서 해요.",
      "방금 끝낸 종류의 다음 미션이에요.",
      "아직 안 해 본 종류예요.",
    ]);
  });
  it("이미 시작한 다음 미션은 건너뛰고, 같은 미션을 두 번 권하지 않는다", () => {
    const done = finish(makeWork(by("quiz-1")));
    const started = makeWork(by("quiz-2"));
    const ids = recommend([done, started]).map((p) => p.mission.id);
    expect(ids[0]).toBe("quiz-2");
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("quiz-3");
  });
});
