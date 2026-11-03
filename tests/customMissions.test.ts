import { describe, it, expect, beforeEach } from "vitest";
import { missions } from "../src/data";
import {
  customMissions,
  loadCustomMissions,
  missionFile,
  parseMissionFile,
  removeCustomMission,
  saveCustomMission,
  validateMission,
} from "../src/customMissions";
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;
const sample = () => ({
  title: "식물 퀴즈",
  goal: "식물에게 필요한 것을 묻는 퀴즈를 만든다.",
  prediction: "정답을 두 번 누르면 몇 점일까요?",
  task: "채점 규칙을 고쳐요.",
  closing: "앱은 무엇을 기억해야 했나요?",
  learningError: true,
  tests: [{ label: "두 번 누르기", expected: "1점만 반영" }],
  hints: ["채점 규칙을 봐요."],
  starter: missions.find((m) => m.id === "quiz-3")!.starter,
});
describe("선생님 미션", () => {
  beforeEach(() => {
    store.clear();
    loadCustomMissions();
  });
  it("미션 파일로 내보냈다가 그대로 읽는다", () => {
    const m = validateMission(sample());
    expect(m.id).toMatch(/^custom-/);
    expect(m.kind).toBe("quiz");
    expect(parseMissionFile(JSON.parse(missionFile(m)))).toEqual(m);
  });
  it("이 기기에 더하면 기본 미션 뒤에 이어지는 번호로 붙고, 다시 열어도 남는다", () => {
    const before = missions.length;
    const m = saveCustomMission(validateMission(sample()));
    expect(missions.length).toBe(before + 1);
    expect(m.order).toBe(5);
    loadCustomMissions();
    expect(customMissions().map((x) => x.id)).toEqual([m.id]);
    removeCustomMission(m.id);
    expect(missions.length).toBe(before);
  });
  it("빈 제목·검사 없음·잘못된 설정은 받지 않는다", () => {
    expect(() => validateMission({ ...sample(), title: " " })).toThrow(
      "미션 제목",
    );
    expect(() => validateMission({ ...sample(), tests: [] })).toThrow(
      "검사 항목은 1~6개",
    );
    expect(() =>
      validateMission({ ...sample(), starter: { kind: "quiz" } }),
    ).toThrow();
    expect(() => parseMissionFile({ format: "다른 파일" })).toThrow(
      "미션 파일 형식",
    );
  });
});
describe("작품 파일에 담긴 선생님 미션", () => {
  beforeEach(() => {
    store.clear();
    loadCustomMissions();
  });
  it("미션이 없는 기기에서도 작품 파일과 친구 검사 요청을 연다", async () => {
    const { makeWork } = await import("../src/model");
    const { exportJSON, parseImport } = await import("../src/storage");
    const { makePeerRequest, validatePeerRequest } =
      await import("../src/peer");
    const { adoptMissions } = await import("../src/customMissions");
    const m = saveCustomMission(validateMission(sample()));
    const w = makeWork(m);
    const file = exportJSON([w]);
    const request = JSON.parse(JSON.stringify(makePeerRequest(w)));
    expect(JSON.parse(file).missions[0].id).toBe(m.id);
    expect(request.missions[0].id).toBe(m.id);
    // 다른 기기: 선생님 미션이 없다.
    store.clear();
    loadCustomMissions();
    expect(() => parseImport(file)).toThrow("지원하지 않는 미션");
    // 친구 검사는 잠깐만 쓰고 기기에 남기지 않는다.
    expect(validatePeerRequest(request).missionId).toBe(m.id);
    expect(store.size).toBe(0);
    loadCustomMissions();
    // 작품을 가져올 때는 미션을 먼저 더하고 남긴다.
    adoptMissions(JSON.parse(file).missions);
    expect(parseImport(file)[0].missionId).toBe(m.id);
    loadCustomMissions();
    expect(customMissions().map((x) => x.id)).toEqual([m.id]);
  });
});
describe("선생님 미션의 판", () => {
  beforeEach(() => {
    store.clear();
    loadCustomMissions();
  });
  it("같은 ID의 새 판은 바로 덮어쓰지 않고 물어볼 목록에 넣는다", async () => {
    const { adoptMissions, isNewerMission, replaceCustomMission } =
      await import("../src/customMissions");
    const v1 = saveCustomMission(
      validateMission({ ...sample(), id: "custom-a" }),
    );
    expect(v1.version).toBe(1);
    const v2 = validateMission({
      ...sample(),
      id: "custom-a",
      title: "식물 퀴즈 (고침)",
      version: 2,
    });
    expect(isNewerMission(v2, v1)).toBe(true);
    const updates: { incoming: typeof v2; stored: typeof v1 }[] = [];
    expect(adoptMissions([v2], true, updates)).toEqual([]);
    expect(updates.map((u) => u.incoming.title)).toEqual(["식물 퀴즈 (고침)"]);
    expect(customMissions()[0].title).toBe("식물 퀴즈");
    // 같은 판이나 더 낮은 판은 조용히 넘어간다.
    const older: typeof updates = [];
    adoptMissions([v1], true, older);
    expect(older).toEqual([]);
    replaceCustomMission(v2);
    expect(customMissions()[0]).toMatchObject({
      title: "식물 퀴즈 (고침)",
      version: 2,
    });
  });
});
describe("선생님 미션의 영어 글", () => {
  beforeEach(() => {
    store.clear();
    loadCustomMissions();
  });
  it("다섯 칸이 모두 있고 검사·힌트 수가 같을 때만 영어 글을 받고, 영어 화면에서 그 글을 쓴다", async () => {
    const { localizeMission } = await import("../src/missionText");
    const full = {
      title: "Plant quiz",
      goal: "Make a quiz about what plants need.",
      prediction: "What if you press the answer twice?",
      task: "Fix the scoring rule.",
      closing: "What did the app have to remember?",
      tests: [{ label: "Press twice", expected: "Only 1 point counts" }],
      hints: ["Look at the scoring rule."],
    };
    const m = validateMission({ ...sample(), en: full });
    expect(m.en?.title).toBe("Plant quiz");
    expect(localizeMission(m, "ko").title).toBe("식물 퀴즈");
    const en = localizeMission(m, "en");
    expect(en.title).toBe("Plant quiz");
    expect(en.tests[0].label).toBe("Press twice");
    expect(en.guide).toMatch(/^Predict first/);
    // 칸이 비거나 줄 수가 다르면 영어 글을 쓰지 않는다.
    expect(
      validateMission({ ...sample(), en: { ...full, goal: "" } }).en,
    ).toBeUndefined();
    expect(
      validateMission({ ...sample(), en: { ...full, hints: [] } }).en,
    ).toBeUndefined();
    expect(localizeMission(validateMission(sample()), "en").title).toBe(
      "식물 퀴즈",
    );
  });
});
