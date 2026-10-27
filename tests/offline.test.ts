import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildServiceWorker,
  precacheFiles,
} from "../scripts/precache.mjs";
describe("오프라인 캐시 목록", () => {
  it("화면 실행 파일은 미리 받고 큰 수업 자료·시안은 제외한다", () => {
    const files = precacheFiles([
      "index.html",
      "assets/index-abc.js",
      "assets/index-abc.css",
      "guide/step-1.png",
      "materials/teacher-guide.pdf",
      "concepts/a.html",
      "og-image.jpg",
      "sw.js",
    ]);
    expect(files).toEqual([
      "assets/index-abc.css",
      "assets/index-abc.js",
      "guide/step-1.png",
      "index.html",
    ]);
  });
  it("빌드마다 캐시 이름과 목록을 채운 서비스 워커를 만든다", () => {
    const template = readFileSync("public/sw.js", "utf8");
    const sw = buildServiceWorker(template, ["assets/a.js", "index.html"], "abc123");
    expect(sw).toContain("CACHE_PREFIX + 'abc123'");
    expect(sw).toContain('["./","./assets/a.js","./index.html"]');
    expect(sw).not.toMatch(/__CACHE_VERSION__|__PRECACHE__/);
    expect(() => buildServiceWorker("const x = 1;", [], "v")).toThrow();
  });
});
