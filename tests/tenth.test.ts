import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { ListConfig, LoopConfig } from "../src/model";
import {
  autoChecks,
  loopRounds,
  runLoop,
  stepLoop,
  initialLoop,
} from "../src/engines";
import { diagnose } from "../src/diagnose";
import { validateConfig } from "../src/storage";
import { challenges } from "../src/challenges";
import { stuckByStage } from "../src/classSummary";
const starter = <T>(id: string) =>
  missions.find((m) => m.id === id)!.starter as T;
describe("반복 안의 조건", () => {
  it("배수 번째마다 값을 더 바꾸고, 자동 검사와 파일 검사를 통과한다", () => {
    const c = starter<LoopConfig>("loop-7");
    let s = initialLoop(c);
    for (let i = 0; i < 5; i++) s = stepLoop(c, s);
    expect(s.value).toBe(8);
    expect(s.event).toContain("5의 배수라 +3 더");
    expect(runLoop(c).value).toBe(16);
    expect(autoChecks(c, "r").every((x) => x.status === "pass")).toBe(true);
    expect(validateConfig(c)).toEqual(c);
    expect(() =>
      validateConfig({ ...c, bonus: { every: 1, change: 3 } }),
    ).toThrow();
  });
  it("보너스 때문에 목표와 달라지면 보너스를 세어 보라고 알려 주고, 멈춤 조건도 보너스를 따른다", () => {
    const c = starter<LoopConfig>("loop-7");
    const off = diagnose({ ...c, goal: 10 });
    expect(off.map((f) => f.id)).toEqual(["loop-goal"]);
    expect(off[0].hint).toContain("보너스");
    // 1,2,3,4,8 → 8 이상이면 다섯 번째에서 멈춘다(보너스가 없으면 여덟 번째).
    const until = { ...c, until: { when: "gte" as const, value: 8 } };
    expect(loopRounds(until)).toBe(5);
    expect(runLoop(until).value).toBe(8);
  });
});
describe("도전 과제", () => {
  it("앱 종류마다 과제가 있고, 시작 설정에서는 아직 달성하지 않은 과제가 있다", () => {
    for (const m of missions) {
      const list = challenges[m.kind];
      expect(list.length, m.kind).toBeGreaterThan(0);
      for (const c of list) expect(typeof c.met(m.starter)).toBe("boolean");
    }
    const ids = Object.values(challenges).flatMap((l) => l.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("조건에 맞게 설정을 바꾸면 달성으로 바뀐다", () => {
    const loop = starter<LoopConfig>("loop-1");
    const hundred = challenges.loop.find((c) => c.id === "loop-hundred")!;
    expect(hundred.met(loop)).toBe(false);
    expect(
      hundred.met({ ...loop, start: 30, change: 10, times: 7, goal: 100 }),
    ).toBe(true);
    // 목표 값이 틀리면(맞춤 힌트가 남으면) 달성이 아니다.
    expect(
      hundred.met({ ...loop, start: 30, change: 10, times: 7, goal: 90 }),
    ).toBe(false);
    const list = starter<ListConfig>("list-5");
    const queue = challenges.list.find((c) => c.id === "list-queue")!;
    expect(queue.met(list)).toBe(false);
    expect(queue.met({ ...list, max: 5 })).toBe(true);
    const timer = missions.find((m) => m.kind === "timer")!.starter;
    expect(
      challenges.timer[0].met({
        ...timer,
        seconds: 90,
        showEnd: true,
      } as never),
    ).toBe(true);
  });
});
describe("어디에서 멈췄나요", () => {
  it("아직 기록하지 않은 첫 단계별로 작품을 모은다", () => {
    const a = makeWork(missions[0]);
    const b = makeWork(missions[1]);
    b.draft.goalReviewed = true;
    const { stages, done } = stuckByStage(
      [a, b].map((work, i) => ({ key: `${i}`, file: `${i + 1}번`, work })),
    );
    expect(stages[0].files).toEqual(["1번"]);
    expect(stages[1].files).toEqual(["2번"]);
    expect(done).toEqual([]);
  });
});
