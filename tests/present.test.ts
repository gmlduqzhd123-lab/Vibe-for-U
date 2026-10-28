import { describe, it, expect } from "vitest";
import { lessons, missions } from "../src/data";
import { roleState, slidesFor } from "../src/Present";
describe("수업 진행 화면", () => {
  it("미션을 다섯 장면으로 나누고 차시 정보가 있으면 함께 넣는다", () => {
    const m = missions.find((x) => x.id === "quiz-3")!;
    const plain = slidesFor(m);
    expect(plain.map((s) => s.title)).toEqual([
      "오늘의 미션",
      "먼저 예상하기",
      "검사할 것",
      "이번 수정 과제",
      "마무리 질문",
    ]);
    expect(plain[2].lines).toHaveLength(m.tests.length);
    const withLesson = slidesFor(m, lessons[4]);
    expect(withLesson[0].title).toBe(`오늘의 활동 · ${lessons[4].title}`);
    expect(withLesson[4].lines).toContain(`“${lessons[4].question}”`);
  });
  it("지난 시간으로 역할 교대 횟수와 다음 교대까지 남은 시간을 센다", () => {
    const ten = 10 * 60 * 1000;
    expect(roleState(0, ten)).toEqual({ swaps: 0, nextInMs: ten });
    expect(roleState(ten - 1, ten)).toEqual({ swaps: 0, nextInMs: 1 });
    expect(roleState(ten, ten)).toEqual({ swaps: 1, nextInMs: ten });
    expect(roleState(25 * 60 * 1000, ten).swaps).toBe(2);
  });
});
