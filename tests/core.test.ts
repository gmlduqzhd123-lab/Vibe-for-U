import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { missions } from "../src/data";
import { makeWork, clone, stageDone } from "../src/model";
import {
  answerQuiz,
  initialQuiz,
  nextQuiz,
  resetQuiz,
  autoChecks,
  initialTimer,
  startTimer,
  tickTimer,
  pauseTimer,
  reachable,
} from "../src/engines";
import {
  clearWorks,
  saveWork,
  listWorks,
  exportJSON,
  parseImport,
  importWorks,
  validateConfig,
  backupFiles,
  jsonBytes,
} from "../src/storage";
describe("시범: 중복 점수 발견 → 수정 → 버전·검사 저장 → 복원", () => {
  beforeEach(async () => {
    await clearWorks();
  });
  it("학습용 반복 채점은 재현되며 수정 뒤 같은 검사에 통과한다", async () => {
    const w = makeWork(missions.find((m) => m.id === "quiz-3")!);
    const c = w.draft.config;
    if (c.kind !== "quiz") throw Error();
    let state = initialQuiz();
    for (let i = 0; i < 3; i++) state = answerQuiz(c, state, 0);
    expect(state.score).toBe(3);
    const before = autoChecks(c, w.draft.revision);
    expect(before[0].status).toBe("fail");
    w.draft.checks = before;
    w.versions[0].data = clone(w.draft);
    c.scoring = "once";
    w.draft.revision = "fixed";
    const after = autoChecks(c, "fixed");
    expect(after.every((x) => x.status === "pass")).toBe(true);
    w.draft.checks.push(...after);
    w.draft.prediction = "1점이어야 해요";
    w.draft.change.reason = "이미 답한 상태를 확인하려고";
    await saveWork(w);
    const restored = (await listWorks())[0];
    expect(restored.draft.config).toEqual(c);
    expect(restored.versions[0].data.checks[0].status).toBe("fail");
    expect(restored.draft.checks.at(-1)?.status).toBe("pass");
    expect(restored.draft.prediction).toBe("1점이어야 해요");
    expect(restored.draft.change.reason).toContain("상태");
  });
  it("정상 새 작품은 중복 점수와 초기화 오류가 없다", () => {
    const w = makeWork(missions[2], true);
    expect(
      autoChecks(w.draft.config, w.draft.revision).every(
        (x) => x.status === "pass",
      ),
    ).toBe(true);
  });
  it("오답은 0점, 마지막 뒤 결과, 재시작은 모든 상태 초기화", () => {
    const c = makeWork(missions[0], true).draft.config;
    if (c.kind !== "quiz") throw Error();
    let s = answerQuiz(c, initialQuiz(), 2);
    expect(s.score).toBe(0);
    s = nextQuiz(c, s);
    s = answerQuiz(c, s, 1);
    s = nextQuiz(c, s);
    expect(s.finished).toBe(true);
    expect(s.score).toBe(1);
    expect(resetQuiz(c, s)).toMatchObject({
      index: 0,
      score: 0,
      answered: false,
      selected: null,
      finished: false,
    });
  });
  it("과거 설정 검사로 현재 단계를 완료하지 않는다", () => {
    const d = makeWork(missions[0]).draft;
    d.checks = autoChecks(d.config, "old");
    d.change.reason = "수정";
    expect(stageDone(d)[3]).toBe(false);
  });
});
describe("이야기와 시계", () => {
  it("잘못된 유효 연결은 막힌 결말로 나타나고 수정 후 도달한다", () => {
    const c = makeWork(missions.find((m) => m.id === "story-3")!).draft.config;
    if (c.kind !== "story") throw Error();
    expect(reachable(c).has("sun")).toBe(false);
    expect(autoChecks(c, "a")[1].status).toBe("fail");
    c.scenes[0].choices[1].to = "sun";
    expect(reachable(c).has("sun")).toBe(true);
    expect(autoChecks(c, "b").every((x) => x.status === "pass")).toBe(true);
  });
  it("연속 시작·멈춤·재개·백그라운드 경과·종료 한 번", () => {
    const c = {
      kind: "timer" as const,
      seconds: 5,
      endMessage: "끝",
      showEnd: true,
    };
    let t = startTimer(initialTimer(c), 100);
    expect(startTimer(t, 200).deadline).toBe(5100);
    t = pauseTimer(t, 2100, c);
    expect(t.remaining).toBe(3000);
    expect(tickTimer(t, 9000, c).remaining).toBe(3000);
    t = startTimer(t, 10000);
    expect(t.deadline).toBe(13000);
    t = tickTimer(t, 50000, c);
    expect(t.remaining).toBe(0);
    expect(t.announcements).toBe(1);
    expect(tickTimer(t, 60000, c).announcements).toBe(1);
    expect(initialTimer(c).running).toBe(false);
  });
});
describe("파일 신뢰 경계와 저장", () => {
  beforeEach(async () => {
    await clearWorks();
  });
  it("큰 작품 여러 개도 파일별 2MB 이내로 나누고 완전히 복원한다", () => {
    const works = Array.from({ length: 10 }, () => {
      const w = makeWork(missions[0]);
      if (w.draft.config.kind !== "quiz") throw Error();
      w.draft.config.questions = Array.from({ length: 20 }, (_, i) => ({
        id: `q${i}`,
        text: "가".repeat(4000),
        choices: ["답", "다른 답"],
        correct: 0,
      }));
      return w;
    });
    const files = backupFiles(works);
    expect(files.length).toBeGreaterThan(1);
    expect(
      files.every((t) => new TextEncoder().encode(t).length <= 2097152),
    ).toBe(true);
    expect(files.flatMap((t) => parseImport(t))).toHaveLength(10);
  });
  it("많은 작품 백업은 가져올 수 있는 크기와 개수로 나눈다", () => {
    const works = Array.from({ length: 51 }, () => makeWork(missions[0]));
    const files = backupFiles(works);
    expect(files).toHaveLength(2);
    expect(files.flatMap((t) => parseImport(t))).toHaveLength(51);
    expect(
      files.every((t) => new TextEncoder().encode(t).length <= 2097152),
    ).toBe(true);
  });
  it("큰 수정 버전 묶음을 거절하고 생성된 요청문도 길이 제한 안에 둔다", () => {
    const w = makeWork(missions[0]);
    w.versions = Array.from({ length: 30 }, (_, i) => ({
      ...clone(w.versions[0]),
      id: String(i),
      data: {
        ...clone(w.draft),
        originalPrompt: "가".repeat(4000),
        prediction: "나".repeat(4000),
      },
    }));
    expect(jsonBytes(w.versions)).toBeGreaterThan(600 * 1024);
    expect(() => parseImport(exportJSON([w]))).toThrow("600KB");
  });
  it("내보내기 왕복은 기록을 보존하며 새 ID를 부여한다", async () => {
    const w = makeWork(missions[2]);
    w.draft.originalPrompt = "<script>alert(1)</script>";
    const [copy] = parseImport(exportJSON([w]));
    expect(copy.id).not.toBe(w.id);
    expect(copy.draft).toEqual(w.draft);
    await importWorks([copy]);
    expect((await listWorks()).length).toBe(1);
  });
  it.each([
    "not json",
    JSON.stringify({
      format: "ttukttak-vibe-backup",
      schemaVersion: 99,
      works: [],
    }),
    JSON.stringify({
      format: "ttukttak-vibe-backup",
      schemaVersion: 1,
      works: [{ schemaVersion: 4 }],
    }),
  ])("손상/비지원 파일 거절로 원래 작품 유지: %s", async (text) => {
    await saveWork(makeWork(missions[0]));
    expect(() => parseImport(text)).toThrow();
    expect((await listWorks()).length).toBe(1);
  });
  it("잘못된 필드·범위·참조·개수·크기를 거절한다", () => {
    const w = makeWork(missions[0]);
    w.draft.title = "x".repeat(201);
    expect(() => parseImport(exportJSON([w]))).toThrow("200");
    expect(() =>
      validateConfig({
        kind: "timer",
        seconds: -1,
        endMessage: "",
        showEnd: true,
      }),
    ).toThrow();
    const c = clone(missions[4].starter);
    if (c.kind !== "story") throw Error();
    c.scenes[0].choices[0].to = "missing";
    expect(() => validateConfig(c)).toThrow("연결");
    expect(() => parseImport(" ".repeat(2097153))).toThrow("2MB");
  });
  it("이전 버전 내부까지 검사한다", () => {
    const w = makeWork(missions[0]);
    (w.versions[0].data.config as unknown as { points: number }).points = 999;
    expect(() => parseImport(exportJSON([w]))).toThrow("점수");
  });
  it("트랜잭션 저장 실패는 성공으로 해결되지 않는다", async () => {
    await expect(
      saveWork({
        ...makeWork(missions[0]),
        draft: () => 0,
      } as unknown as ReturnType<typeof makeWork>),
    ).rejects.toThrow();
    expect((await listWorks()).length).toBe(0);
  });
  it("모든 12개 미션은 유효한 시작 데이터를 갖는다", () => {
    expect(missions).toHaveLength(12);
    for (const m of missions)
      expect(validateConfig(m.starter)).toEqual(m.starter);
  });
});
