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
