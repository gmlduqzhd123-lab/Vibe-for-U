import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { ListConfig, LoopConfig, Work } from "../src/model";
import {
  addList,
  autoChecks,
  fillList,
  initialList,
  initialLoop,
  loopRounds,
  removeList,
  resetList,
  runLoop,
  stepLoop,
} from "../src/engines";
import { diagnose } from "../src/diagnose";
import { validateConfig } from "../src/storage";
import { bugCandidates } from "../src/bugChallenge";
import { designedCheck } from "../src/designedCheck";
import { arrange, assessmentGaps } from "../src/classSummary";
import { missionMatches, missionState } from "../src/Pages";
import { currentStep } from "../src/Present";
import { tourSteps } from "../src/Tour";
const starter = <T>(id: string) =>
  missions.find((m) => m.id === id)!.starter as T;
const t = (s: string, v?: Record<string, string | number>) =>
  v ? s.replace(/\{(\w+)\}/g, (a, k) => (k in v ? String(v[k]) : a)) : s;
describe("목록 만들기", () => {
  it("낱말을 차례로 넣고, 같은 낱말은 한 번만 넣으며, 맨 뒤에서 뺀다", () => {
    const c = starter<ListConfig>("list-1");
    let s = addList(c, initialList(), 1);
    s = addList(c, s, 0);
    expect(s.list).toEqual(["물", "도시락"]);
    const same = addList(c, s, 0);
    expect(same.list).toBe(s.list);
    expect(same.event).toContain("이미 목록에 있음");
    expect(removeList(c, s).list).toEqual(["물"]);
    expect(removeList(c, initialList()).list).toEqual([]);
    expect(resetList().list).toEqual([]);
    expect(autoChecks(c, "r").every((x) => x.status === "pass")).toBe(true);
  });
  it("가득 차면 더 넣지 않고, 맨 앞에서 빼는 목록은 먼저 넣은 것이 나온다", () => {
    const bag = starter<ListConfig>("list-2");
    const full = fillList(bag, initialList());
    expect(full.list).toEqual(["공책", "필통", "물통"]);
    expect(full.event).toContain("가득 참");
    const line = starter<ListConfig>("list-4");
    const out = removeList(line, fillList(line, initialList()));
    expect(out.list[0]).toBe("바다 모둠");
    expect(out.event).toContain("맨 앞 「하늘 모둠」");
  });
  it("같은 낱말이 두 번 들어가는 학습용 오류를 자동 검사와 힌트가 찾는다", () => {
    const bugged = starter<ListConfig>("list-3");
    expect(addList(bugged, addList(bugged, initialList(), 0), 0).list).toEqual([
      "하늘",
      "하늘",
    ]);
    expect(
      autoChecks(bugged, "r")
        .filter((x) => x.status === "fail")
        .map((x) => x.label),
    ).toEqual(["같은 낱말 다시 넣기"]);
    expect(diagnose(bugged).map((f) => f.id)).toEqual(["list-duplicate"]);
    const fixed = makeWork(
      missions.find((m) => m.id === "list-3")!,
      true,
    ).draft.config;
    expect(diagnose(fixed)).toEqual([]);
    expect(bugCandidates("list").length).toBeGreaterThan(0);
  });
  it("파일 검사는 목록 설정의 범위를 지키고, 설계한 검사는 개수를 비교한다", () => {
    const c = starter<ListConfig>("list-1");
    expect(validateConfig(c)).toEqual(c);
    expect(() => validateConfig({ ...c, max: 0 })).toThrow();
    expect(() => validateConfig({ ...c, items: [] })).toThrow();
    expect(() => validateConfig({ ...c, remove: "middle" })).toThrow();
    const card = designedCheck(
      c,
      { action: "list-add", a: 1, b: 3, expected: "1" },
      "r",
      t,
    )!;
    expect(card.status).toBe("pass");
    const take = designedCheck(
      c,
      { action: "list-take", a: 1, b: 0, expected: "3개" },
      "r",
      t,
    )!;
    expect(take.status).toBe("pass");
    expect(take.actual).toContain("1. 도시락");
  });
});
describe("반복의 멈춤 조건", () => {
  it("조건에 맞으면 횟수가 남아도 멈추고, 멈춘 뒤에는 더 바뀌지 않는다", () => {
    const c = starter<LoopConfig>("loop-5");
    expect(loopRounds(c)).toBe(5);
    const done = runLoop(c);
    expect([done.round, done.value]).toEqual([5, 3500]);
    expect(done.event).toContain("멈춤 조건");
    expect(stepLoop(c, done)).toBe(done);
    expect(autoChecks(c, "r").every((x) => x.status === "pass")).toBe(true);
    // 처음 값이 이미 조건에 맞으면 한 번도 반복하지 않는다.
    const already = { ...c, start: 5000 };
    expect(stepLoop(already, initialLoop(already)).round).toBe(0);
  });
  it("값이 건너뛰는 ‘같으면’ 조건을 힌트가 찾고, 정상 규칙은 ‘이상이면’으로 멈춘다", () => {
    const bugged = starter<LoopConfig>("loop-6");
    expect(runLoop(bugged).round).toBe(8);
    expect(diagnose(bugged).map((f) => f.id)).toEqual(["loop-never"]);
    expect(
      autoChecks(bugged, "r")
        .filter((x) => x.status === "fail")
        .map((x) => x.label),
    ).toEqual(["멈춤 조건에서 멈추기", "반복이 끝난 값"]);
    const fixed = makeWork(
      missions.find((m) => m.id === "loop-6")!,
      true,
    ).draft.config as LoopConfig;
    expect(fixed.until).toEqual({ when: "gte", value: 1000 });
    expect(runLoop(fixed).value).toBe(1200);
    expect(diagnose(fixed)).toEqual([]);
    // 멈춘 값이 목표와 다르면 목표를 고치라고 알려 준다.
    expect(diagnose({ ...fixed, goal: 1000 }).map((f) => f.id)).toEqual([
      "loop-goal",
    ]);
  });
  it("파일 검사는 멈춤 조건을 그대로 두고 잘못된 조건은 막는다", () => {
    const c = starter<LoopConfig>("loop-5");
    expect(validateConfig(c)).toEqual(c);
    expect(validateConfig(starter<LoopConfig>("loop-1"))).not.toHaveProperty(
      "until",
    );
    expect(() =>
      validateConfig({ ...c, until: { when: "near", value: 1 } }),
    ).toThrow();
  });
});
describe("미션 찾기와 평가 비교", () => {
  const work = (id: string) => makeWork(missions.find((m) => m.id === id)!);
  it("낱말이 모두 들어 있는 미션만 찾고, 진행 상태를 알려 준다", () => {
    const m = missions.find((x) => x.id === "list-4")!;
    expect(missionMatches(m, "급식 줄")).toBe(true);
    expect(missionMatches(m, "급식 점수")).toBe(false);
    expect(missionMatches(m, "  ")).toBe(true);
    expect(missionMatches(m, "목록", "목록 만들기")).toBe(true);
    expect(missionState("quiz-1", [])).toBe("new");
    expect(missionState("quiz-1", [work("quiz-1")])).toBe("doing");
  });
  it("스스로 평가와 선생님 평가가 다른 항목을 찾고, 그런 작품만 걸러 본다", () => {
    const same: Work = {
      ...work("quiz-1"),
      selfAssessment: { levels: [2, 2, 2, 2], note: "", at: "" },
      feedback: { levels: [2, 2, 2, 2], note: "", at: "" },
    };
    const far: Work = {
      ...work("quiz-2"),
      selfAssessment: { levels: [3, 2, 0, 1], note: "", at: "" },
      feedback: { levels: [1, 2, 2, 0], note: "", at: "" },
    };
    expect(assessmentGaps(same)).toEqual({ items: [], big: false });
    const gaps = assessmentGaps(far);
    expect(gaps.items).toHaveLength(1);
    expect(gaps.items[0]).toMatchObject({ self: 3, teacher: 1 });
    expect(gaps.big).toBe(true);
    const entries = [same, far].map((w, i) => ({
      key: String(i),
      file: `${i}.json`,
      work: w,
    }));
    expect(arrange(entries, "gap", "loaded").map((e) => e.key)).toEqual(["1"]);
  });
  it("수업 진행 화면은 지금 활동의 남은 시간과 다음 활동을 알려 준다", () => {
    const list = [
      { text: "예상", minutes: 10 },
      { text: "검사", minutes: 20 },
    ];
    const now = currentStep(list, 4 * 60000, 30 * 60000);
    expect(now.text).toBe("예상");
    expect(Math.round(now.leftMs / 60000)).toBe(6);
    expect(now.next).toBe("검사");
    const last = currentStep(list, 25 * 60000, 30 * 60000);
    expect(Math.round(last.leftMs / 60000)).toBe(5);
    expect(last.next).toBe("");
  });
  it("둘러보기는 작업실 화면에 있는 곳만 짚는다", () => {
    expect(tourSteps).toHaveLength(5);
    for (const s of tourSteps) expect(s.target).toMatch(/^\.[a-z-]+/);
  });
});
