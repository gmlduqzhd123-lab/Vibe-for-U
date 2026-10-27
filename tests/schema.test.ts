import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { missions } from "../src/data";
import { makeWork, SCHEMA_VERSION } from "../src/model";
import {
  clearWorks,
  exportJSON,
  listWorks,
  migrateWork,
  parseImport,
  saveWork,
} from "../src/storage";
// 스키마 1 시절의 작품: feedback 필드가 없다.
const v1Work = () => {
  const w = makeWork(missions[0]) as unknown as Record<string, unknown>;
  delete w.feedback;
  return { ...w, schemaVersion: 1 };
};
describe("저장 형식 변환", () => {
  beforeEach(async () => {
    await clearWorks();
  });
  it("새 작품과 백업 파일은 현재 스키마 버전으로 기록한다", () => {
    const w = makeWork(missions[0]);
    expect(w.schemaVersion).toBe(SCHEMA_VERSION);
    expect(w.feedback).toBeNull();
    expect(JSON.parse(exportJSON([w])).schemaVersion).toBe(SCHEMA_VERSION);
  });
  it("스키마 1 백업 파일을 가져오면 새 형식으로 바꾼다", () => {
    const file = JSON.stringify({
      format: "ttukttak-vibe-backup",
      schemaVersion: 1,
      works: [v1Work()],
    });
    const [w] = parseImport(file);
    expect(w.schemaVersion).toBe(SCHEMA_VERSION);
    expect(w.feedback).toBeNull();
    expect(w.draft.title).toBe(missions[0].title);
  });
  it("기기에 남은 스키마 1 작품도 읽을 때 새 형식이 된다", async () => {
    await saveWork(v1Work() as unknown as ReturnType<typeof makeWork>);
    const [w] = await listWorks();
    expect(w.schemaVersion).toBe(SCHEMA_VERSION);
    expect(w.feedback).toBeNull();
  });
  it("더 새로운 앱의 파일과 알 수 없는 버전은 이유를 알려 거절한다", () => {
    expect(() =>
      parseImport(
        JSON.stringify({
          format: "ttukttak-vibe-backup",
          schemaVersion: 99,
          works: [],
        }),
      ),
    ).toThrow("더 새로운 앱");
    expect(() => migrateWork({ schemaVersion: "1" })).toThrow("알 수 없어요");
    expect(() => migrateWork({ schemaVersion: 0 })).toThrow("알 수 없어요");
  });
  it("교사 평가 기록의 범위를 검사한다", () => {
    const w = makeWork(missions[0]);
    w.feedback = { levels: [1, 2, 3, 0], note: "근거", at: w.createdAt };
    expect(parseImport(exportJSON([w]))[0].feedback).toEqual(w.feedback);
    w.feedback = { levels: [1, 2, 4, 0], note: "", at: w.createdAt };
    expect(() => parseImport(exportJSON([w]))).toThrow("평가 단계");
    w.feedback = { levels: [1, 2], note: "", at: w.createdAt };
    expect(() => parseImport(exportJSON([w]))).toThrow("평가 단계");
  });
});
