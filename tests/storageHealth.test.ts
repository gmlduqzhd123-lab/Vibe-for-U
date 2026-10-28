import { describe, it, expect } from "vitest";
import { formatBytes } from "../src/storageHealth";
describe("저장 용량 표시", () => {
  it("바이트를 읽기 쉬운 단위로 바꾼다", () => {
    expect(formatBytes(512)).toBe("512B");
    expect(formatBytes(1536)).toBe("1.5KB");
    expect(formatBytes(3 * 1024 ** 2)).toBe("3.0MB");
    expect(formatBytes(2 * 1024 ** 3)).toBe("2.0GB");
  });
});
