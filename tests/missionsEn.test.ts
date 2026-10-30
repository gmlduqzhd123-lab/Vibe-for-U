import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { missionsEn } from "../src/missionsEn";
import { loadEnglishMissions, localizeMission } from "../src/missionText";
describe("미션 본문 영어 번역", () => {
  it("모든 미션에 같은 개수의 검사·힌트 번역이 있고 한글이 섞이지 않는다", () => {
    for (const m of missions) {
      const en = missionsEn[m.id];
      expect(en, m.id).toBeDefined();
      expect(en.tests).toHaveLength(m.tests.length);
      expect(en.hints).toHaveLength(m.hints.length);
      // 설정 항목 이름을 가리키는 괄호 안만 한국어를 허용한다.
      const text = [
        en.title,
        en.goal,
        en.prediction,
        en.task,
        en.closing,
        ...en.hints,
        ...en.tests.flatMap((t) => [t.label, t.expected]),
      ]
        .join(" ")
        .replace(/\([^)]*\)/g, "");
      expect(text, m.id).not.toMatch(/[가-힣]/);
    }
  });
  it("영어 번역을 불러오기 전에는 원래 미션을 쓴다", () => {
    const m = missions.find((x) => x.id === "quiz-3")!;
    expect(localizeMission(m, "en")).toBe(m);
  });
  it("영어일 때만 번역하고 미션 번호·시작 설정은 그대로 둔다", async () => {
    await loadEnglishMissions();
    const m = missions.find((x) => x.id === "quiz-3")!;
    expect(localizeMission(m, "ko")).toBe(m);
    const en = localizeMission(m, "en");
    expect(en.title).toBe("Huh? The score keeps going up!");
    expect(en.guide).toMatch(/^Predict first, then run it\. /);
    expect([en.id, en.kind, en.starter, en.learningError]).toEqual([
      m.id,
      m.kind,
      m.starter,
      m.learningError,
    ]);
  });
});
