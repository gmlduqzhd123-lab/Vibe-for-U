import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { clone, makeWork } from "../src/model";
import type { PatternConfig } from "../src/model";
import {
  autoChecks,
  initialPattern,
  patternMoves,
  runPattern,
  stepPattern,
} from "../src/engines";
import { configSummary } from "../src/learning";
import { exportJSON, parseImport, validateConfig } from "../src/storage";
const starter = (id: string) =>
  clone(missions.find((m) => m.id === id)!.starter) as PatternConfig;
describe("패턴 그리기", () => {
  it("명령을 차례대로 한 칸씩 실행해 ㄱ 모양을 그린다", () => {
    const c = starter("pattern-1");
    expect(patternMoves(c)).toHaveLength(6);
    let s = initialPattern();
    s = stepPattern(c, s);
    expect([s.x, s.y, s.painted.length]).toEqual([1, 0, 2]);
    s = runPattern(c, s);
    expect([s.x, s.y, s.painted.length]).toEqual([3, 3, 7]);
    expect(stepPattern(c, s)).toBe(s);
    expect(autoChecks(c, "r").every((r) => r.status === "pass")).toBe(true);
  });
  it("반복 횟수만큼 명령 묶음을 실행한다", () => {
    const c = starter("pattern-2");
    expect(runPattern(c).painted).toHaveLength(7);
    c.repeat = 4;
    expect(runPattern(c).painted).toHaveLength(9);
  });
  it("학습용 넘어가기 규칙은 반대편을 칠하고, 멈추기로 고치면 목표와 같다", () => {
    const c = starter("pattern-3");
    const wrong = runPattern(c);
    expect(wrong.wrapped).toBe(2);
    expect(wrong.painted).toContain("0,4");
    const failed = autoChecks(c, "r");
    expect(failed.find((r) => r.label === "판 가장자리")?.status).toBe("fail");
    expect(failed.find((r) => r.label === "목표 모양")?.status).toBe("fail");
    c.edge = "stop";
    const fixed = runPattern(c);
    expect([fixed.wrapped, fixed.blocked]).toEqual([0, 4]);
    expect(autoChecks(c, "r").every((r) => r.status === "pass")).toBe(true);
    expect(configSummary(c)[2]).toBe("가장자리: 멈추기");
  });
  it("빠진 명령을 더하면 네모가 완성된다", () => {
    const c = starter("pattern-4");
    expect(autoChecks(c, "r")[0].status).toBe("fail");
    c.commands.push({ dir: "up", count: 2 });
    expect(autoChecks(c, "r")[0].status).toBe("pass");
  });
  it("정상 규칙 새 작품은 멈추기 규칙이고 파일로 오가도 유지된다", () => {
    const w = makeWork(missions.find((m) => m.id === "pattern-3")!, true);
    expect((w.draft.config as PatternConfig).edge).toBe("stop");
    expect(parseImport(exportJSON([w]))[0].draft.config).toEqual(
      w.draft.config,
    );
  });
  it("판 밖 목표 칸·범위를 벗어난 값은 거절한다", () => {
    const c = starter("pattern-1");
    expect(() => validateConfig({ ...c, target: ["5,0"] })).toThrow("목표 칸");
    expect(() => validateConfig({ ...c, target: ["0,0", "0,0"] })).toThrow();
    expect(() => validateConfig({ ...c, size: 11 })).toThrow("판 크기");
    expect(() => validateConfig({ ...c, repeat: 0 })).toThrow("반복");
    expect(() =>
      validateConfig({ ...c, commands: [{ dir: "jump", count: 1 }] }),
    ).toThrow("방향");
    expect(() => validateConfig({ ...c, edge: "bounce" })).toThrow("가장자리");
  });
  it("조건 규칙: 막히면 오른쪽으로 돌아 명령 하나로 테두리를 그린다", () => {
    const c = starter("pattern-5");
    const plain = runPattern(c);
    expect(plain.painted).toHaveLength(5);
    expect(plain.blocked).toBe(11);
    expect(autoChecks(c, "r")[0].status).toBe("fail");
    c.turn = "right";
    const ring = runPattern(c);
    expect(ring.painted).toHaveLength(16);
    expect(ring.turns).toBe(3);
    expect([ring.x, ring.y]).toEqual([0, 1]);
    expect(autoChecks(c, "r").every((r) => r.status === "pass")).toBe(true);
    expect(configSummary(c)).toContain(
      "조건: 만약 다음 칸이 막히면 오른쪽으로 돌기",
    );
  });
  it("돈 방향은 그 명령 안에서만 이어지고 이미 칠한 칸도 막힌 칸이다", () => {
    const c: PatternConfig = {
      kind: "pattern",
      size: 5,
      repeat: 1,
      edge: "stop",
      turn: "right",
      commands: [
        { dir: "right", count: 6 },
        { dir: "up", count: 1 },
      ],
      target: ["0,0"],
    };
    let s = runPattern(c);
    // 오른쪽 4칸 → 막혀서 아래로 2칸 → 다음 명령은 다시 위쪽(이미 칠한 칸이라 오른쪽으로 돌기 → 판 밖이라 멈춤)
    expect([s.x, s.y]).toEqual([4, 2]);
    expect(s.blocked).toBe(1);
    s = initialPattern();
    expect(s.heading).toBeNull();
  });
  it("조건 규칙은 파일로 오가도 유지되고, 값이 없으면 넣지 않는다", () => {
    const w = makeWork(missions.find((m) => m.id === "pattern-5")!);
    (w.draft.config as PatternConfig).turn = "right";
    expect(parseImport(exportJSON([w]))[0].draft.config).toEqual(
      w.draft.config,
    );
    const old = starter("pattern-1");
    expect("turn" in validateConfig(old)).toBe(false);
    expect(() => validateConfig({ ...old, turn: "left" })).toThrow("조건");
  });
});
