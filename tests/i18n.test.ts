import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { translate } from "../src/i18n";
describe("화면 틀 번역", () => {
  it("번역이 없으면 한국어 문장을 그대로 보여 준다", () => {
    expect(translate("ko", "미션 공작대")).toBe("미션 공작대");
    expect(translate("en", "미션 공작대")).toBe("Missions");
    expect(translate("en", "번역 없는 문장")).toBe("번역 없는 문장");
  });
  it("코드에서 t()로 감싼 모든 문장에 영어 번역이 있다", () => {
    const missing: string[] = [];
    for (const f of readdirSync("src").filter((f) => f.endsWith(".tsx"))) {
      const code = readFileSync(`src/${f}`, "utf8");
      for (const m of code.matchAll(/\bt\(\s*"([^"]+)"/g))
        if (translate("en", m[1]) === m[1]) missing.push(`${f}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });
});
