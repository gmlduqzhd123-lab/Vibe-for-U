import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { classStats } from "../src/ClassCharts";
describe("학급 진행 요약", () => {
  it("멈춘 단계·힌트·평가 평균을 센다", () => {
    const a = makeWork(missions[0]);
    const b = makeWork(missions[1]);
    b.hintsUsed = 2;
    b.selfAssessment = { levels: [3, 2, 1, 1], note: "", at: b.createdAt };
    b.feedback = { levels: [1, 2, 1, 0], note: "", at: b.createdAt };
    const s = classStats([a, b]);
    // 새 작품은 첫 단계(목표 정하기)가 아직 남아 있다.
    expect(s.stuck[0]).toEqual({ label: "목표 정하기", n: 2 });
    expect(s.stuck.at(-1)).toEqual({ label: "모두 기록", n: 0 });
    expect(s.hints.map((h) => h.n)).toEqual([1, 0, 1, 0]);
    expect(s.levels[0]).toMatchObject({ self: 3, teacher: 1, n: 1 });
    // 한쪽이라도 평가하지 않은 항목은 비교에서 뺀다.
    expect(s.levels[3]).toMatchObject({ self: null, teacher: null, n: 0 });
  });
});
