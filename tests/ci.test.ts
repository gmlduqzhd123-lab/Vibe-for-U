import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
// CI가 쓰는 Playwright 공식 이미지의 버전이 설치된 Playwright와 같은지 확인한다.
// 버전이 다르면 이미지 안의 브라우저를 찾지 못해 브라우저 검사가 모두 실패한다.
describe("CI 설정", () => {
  it("브라우저 검사 이미지 버전이 설치된 Playwright와 같다", () => {
    const version = JSON.parse(
      readFileSync("node_modules/@playwright/test/package.json", "utf8"),
    ).version;
    const yml = readFileSync(".github/workflows/browser-tests.yml", "utf8");
    const tags = [
      ...yml.matchAll(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/g),
    ];
    expect(tags.length).toBeGreaterThan(0);
    for (const m of tags) expect(m[1]).toBe(version);
  });
});
