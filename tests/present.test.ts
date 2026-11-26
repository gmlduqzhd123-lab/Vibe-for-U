import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { lessons } from "../src/lessonData";
import {
  activitySteps,
  currentStep,
  roleState,
  slidesFor,
} from "../src/Present";
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
  it("차시 활동 글을 할 일과 분으로 나누고, 지난 시간에 맞는 지금 할 일을 고른다", () => {
    for (const l of lessons)
      expect(activitySteps(l.activity).length, l.title).toBeGreaterThan(1);
    const steps = activitySteps(lessons[0].activity);
    expect(steps[0]).toEqual({ text: "목표와 사용할 사람 정하기", minutes: 7 });
    expect(steps.reduce((n, s) => n + s.minutes, 0)).toBe(30);
    const min = 60_000;
    expect(currentStep(steps, 0, 30 * min).index).toBe(0);
    expect(currentStep(steps, 7 * min, 30 * min).index).toBe(1);
    expect(currentStep(steps, 29 * min, 30 * min).index).toBe(2);
    // 활동 시간을 10분으로 줄여도 비율로 맞춘다.
    expect(currentStep(steps, 3 * min, 10 * min).index).toBe(1);
    expect(currentStep(steps, 10 * min, 10 * min).index).toBe(2);
    // 영어 글("… 7 min → …")도 나눈다.
    expect(activitySteps("Set a goal 7 min → Run 10 min")).toEqual([
      { text: "Set a goal", minutes: 7 },
      { text: "Run", minutes: 10 },
    ]);
  });
});
