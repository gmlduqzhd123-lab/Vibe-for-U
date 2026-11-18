import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error 형식 선언이 없는 Node 스크립트
import { applyFixes, readFixes } from "../scripts/apply-en-fixes.mjs";
describe("영어 번역 고침 파일을 번역표에 합치기", () => {
  const file = (fixes: unknown) => ({
    format: "ttukttak-vibe-en-fixes",
    version: 1,
    fixes,
  });
  it("값 자리가 다르거나 형식이 다른 파일은 받지 않는다", () => {
    expect(readFixes(file({ "버전 {n}개": "{n} versions" }))).toEqual({
      "버전 {n}개": "{n} versions",
    });
    expect(() => readFixes(file({ "버전 {n}개": "versions" }))).toThrow(
      "값 자리",
    );
    expect(() => readFixes({ format: "x" })).toThrow();
    expect(() => readFixes(file({ 홈: "" }))).toThrow("빈 번역");
  });
  it("따옴표 있는 열쇠·없는 열쇠·다음 줄 값을 모두 바꾸고, 없는 열쇠는 알려 준다", () => {
    const source = [
      "const en = {",
      '  "미션 공작대": "Missions",',
      '  되돌리기: "Undo",',
      '  "긴 문장이에요.":',
      '    "A long sentence.",',
      "};",
    ].join("\n");
    const { source: out, done } = applyFixes(source, {
      "미션 공작대": "Mission Lab",
      되돌리기: 'Undo "it"',
      "긴 문장이에요.": "Long.",
      "없는 문장": "Nope",
    });
    expect(done).toEqual(["미션 공작대", "되돌리기", "긴 문장이에요."]);
    expect(out).toContain('"미션 공작대": "Mission Lab",');
    expect(out).toContain('되돌리기: "Undo \\"it\\"",');
    expect(out).toContain('"긴 문장이에요.":\n    "Long.",');
  });
  it("실제 번역표에서 문장을 찾아 바꾼다", () => {
    const { done } = applyFixes(readFileSync("src/i18n.tsx", "utf8"), {
      "미션 공작대": "Mission Lab",
    });
    expect(done).toEqual(["미션 공작대"]);
  });
});
