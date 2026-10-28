import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { emptyFeedback, graded, summarize, toCSV } from "../src/classReview";
describe("학급 작품 모으기", () => {
  it("다섯 단계와 직접 검사·버전 수를 요약한다", () => {
    const w = makeWork(missions[2]);
    w.draft.goalReviewed = true;
    w.draft.checks = [
      {
        id: "c1",
        label: "세 번 누르기",
        expected: "1점",
        actual: "1점",
        source: "self",
        status: "pass",
        revision: w.draft.revision,
        at: w.createdAt,
      },
    ];
    const s = summarize(w);
    expect(s.stages[0]).toBe(true);
    expect(s.stages[1]).toBe(false);
    expect(s.manualPass).toBe(1);
    expect(s.versions).toBe(1);
    expect(s.mission).toBe(missions[2].title);
  });
  it("평가 네 항목을 모두 매겨야 평가 완료다", () => {
    const f = emptyFeedback(new Date().toISOString());
    expect(graded(f)).toBe(false);
    expect(graded({ ...f, levels: [1, 2, 3, 0] })).toBe(false);
    expect(graded({ ...f, levels: [1, 2, 3, 1] })).toBe(true);
    expect(graded(null)).toBe(false);
  });
  it("CSV는 BOM·따옴표 처리와 수식 실행 방지를 한다", () => {
    const w = makeWork(missions[0]);
    w.draft.title = '=HYPERLINK("x")';
    w.feedback = {
      levels: [3, 2, 1, 0],
      note: "줄\n바꿈, 쉼표",
      at: w.createdAt,
    };
    const csv = toCSV([{ key: "k", file: "3번.json", work: w }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const [head, row] = csv.slice(1).split("\r\n");
    expect(head).toContain("문제와 요구사항");
    expect(head).toContain("힌트 사용,최근 수정,스스로: 문제와 요구사항");
    expect(row).toContain(`"'=HYPERLINK(""x"")"`);
    expect(row).toContain("설명·적용,수행,시작,미평가");
    expect(row).toContain('"줄\n바꿈, 쉼표"');
  });
});
