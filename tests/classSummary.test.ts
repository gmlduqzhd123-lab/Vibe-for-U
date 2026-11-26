import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { emptyFeedback, graded, summarize, toCSV } from "../src/classSummary";
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
    expect(head).toContain(
      "힌트 사용,역할 교대,버그 탐정 일지,최근 수정,스스로: 문제와 요구사항",
    );
    expect(row).toContain(`"'=HYPERLINK(""x"")"`);
    expect(row).toContain("설명·적용,수행,시작,미평가");
    expect(row).toContain('"줄\n바꿈, 쉼표"');
  });
});
describe("차시별 진행", () => {
  it("차시 미션별 작품 수·완료·많이 멈춘 단계를 센다", async () => {
    const { lessonProgress } = await import("../src/classSummary");
    const quiz1 = missions.find((m) => m.id === "quiz-1")!;
    const a = makeWork(quiz1);
    const b = makeWork(quiz1);
    b.draft.goalReviewed = true;
    b.draft.originalPrompt = "요청";
    b.draft.arrangedPrompt = "정리";
    const rows = lessonProgress([a, b]);
    expect(rows).toHaveLength(8);
    expect(rows[0].works).toBe(2);
    expect(rows[0].done).toBe(0);
    // 멈춘 학생 수가 같으면 앞 단계를 보여 준다.
    expect(rows[0].stuckAt).toBe(0);
    expect(rows[0].stuckN).toBe(1);
    // 같은 미션을 쓰는 2차시도 같은 작품을 보여 준다.
    expect(rows[1].works).toBe(2);
    expect(rows[2].works).toBe(0);
    expect(rows[2].stuckAt).toBe(-1);
  });
});
describe("우리 반이 많이 만난 버그", () => {
  it("버전과 편집본에서 만난 버그와 지금 고친 학생 수를 센다", async () => {
    const { classBugs } = await import("../src/classSummary");
    const bugged = missions.find((m) => m.id === "quiz-3")!;
    // 1번 학생: 학습용 오류 그대로(만남, 안 고침)
    const a = makeWork(bugged);
    // 2번 학생: 처음 버전은 오류, 지금은 고침
    const b = makeWork(bugged);
    if (b.draft.config.kind === "quiz") b.draft.config.scoring = "once";
    // 3번 학생: 정상 규칙으로 시작(만나지 않음)
    const c = makeWork(missions[0], true);
    const rows = classBugs([a, b, c]);
    expect(rows[0]).toMatchObject({
      id: "quiz-score-once",
      met: 2,
      fixed: 1,
    });
    expect(rows[0].name).toBe("같은 정답에 점수가 또 올라요");
  });
});
describe("평가 목록 옮기기", () => {
  it("평가와 원래 작품 ID를 담아 내보내고 그대로 읽으며, 크면 여러 파일로 나눈다", async () => {
    const { classSessionFiles, parseClassSession } =
      await import("../src/classSummary");
    const w = makeWork(missions[0]);
    w.feedback = { levels: [3, 2, 2, 1], note: "좋아요", at: w.createdAt };
    const entries = [{ key: "k", file: "7번.json", work: w, sourceId: "원래" }];
    const [text, ...rest] = classSessionFiles(entries);
    expect(rest).toHaveLength(0);
    const back = parseClassSession(JSON.parse(text), "목록.json");
    expect(back[0]).toMatchObject({ file: "7번.json", sourceId: "원래" });
    expect(back[0].work.feedback?.note).toBe("좋아요");
    expect(back[0].work.id).toBe(w.id);
    // 큰 작품 여러 개는 2MB를 넘지 않게 나눈다.
    const big = Array.from({ length: 12 }, (_, i) => {
      const x = makeWork(missions[0]);
      x.draft.reflection = "가".repeat(3900);
      x.draft.checks = Array.from({ length: 90 }, (_, k) => ({
        id: `c${k}`,
        label: "검사",
        expected: "가".repeat(450),
        actual: "가".repeat(450),
        source: "self" as const,
        status: "pass" as const,
        revision: x.draft.revision,
        at: x.createdAt,
      }));
      return { key: `b${i}`, file: `${i}.json`, work: x };
    });
    const files = classSessionFiles(big);
    expect(files.length).toBeGreaterThan(1);
    for (const f of files)
      expect(new TextEncoder().encode(f).length).toBeLessThanOrEqual(
        2 * 1024 * 1024,
      );
    expect(
      files.flatMap((f) => parseClassSession(JSON.parse(f), "n")).length,
    ).toBe(12);
    expect(() => parseClassSession({ format: "x" }, "n")).toThrow();
  });
});
describe("학급 모으기 걸러 보기·정렬", () => {
  it("평가 전·미완료·버그 남은 작품을 거르고, 이름과 진행 순으로 정렬한다", async () => {
    const { arrange } = await import("../src/classSummary");
    const entry = (file: string, id: string) => ({
      key: file,
      file,
      work: makeWork(missions.find((m) => m.id === id)!),
    });
    const a = entry("10번.json", "quiz-1");
    const b = entry("2번.json", "quiz-3");
    const c = entry("1번.json", "story-1");
    a.work.feedback = { levels: [1, 2, 3, 1], note: "", at: a.work.createdAt };
    c.work.draft.goalReviewed = true;
    const list = [a, b, c];
    expect(arrange(list, "all", "loaded")).toEqual(list);
    expect(arrange(list, "ungraded", "loaded").map((e) => e.file)).toEqual([
      "2번.json",
      "1번.json",
    ]);
    // 퀴즈 3은 학습용 오류가 있는 시작 설정이다.
    expect(arrange(list, "bugs", "loaded").map((e) => e.file)).toEqual([
      "2번.json",
    ]);
    expect(arrange(list, "unfinished", "loaded")).toHaveLength(3);
    // 숫자를 숫자로 보고 정렬한다(1 → 2 → 10).
    expect(arrange(list, "all", "name").map((e) => e.file)).toEqual([
      "1번.json",
      "2번.json",
      "10번.json",
    ]);
    expect(arrange(list, "all", "progress").at(-1)!.file).toBe("1번.json");
  });
});
