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
  readAllWorks,
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
    expect(w.hintsUsed).toBe(0);
    expect(w.selfAssessment).toBeNull();
  });
  it("기기에 남은 스키마 1 작품도 읽을 때 새 형식이 된다", async () => {
    await saveWork(v1Work() as unknown as ReturnType<typeof makeWork>);
    const [w] = await listWorks();
    expect(w.schemaVersion).toBe(SCHEMA_VERSION);
    expect(w.feedback).toBeNull();
  });
  it("스키마 2 작품은 힌트 기록 0·자기 평가 없음으로 바꾼다", () => {
    const w = makeWork(missions[0]) as unknown as Record<string, unknown>;
    delete w.hintsUsed;
    delete w.selfAssessment;
    w.feedback = { levels: [1, 1, 1, 1], note: "", at: w.createdAt };
    const [v3] = parseImport(
      JSON.stringify({
        format: "ttukttak-vibe-backup",
        schemaVersion: 2,
        works: [{ ...w, schemaVersion: 2 }],
      }),
    );
    expect(v3.schemaVersion).toBe(3);
    expect(v3.hintsUsed).toBe(0);
    expect(v3.selfAssessment).toBeNull();
    expect(v3.feedback?.levels).toEqual([1, 1, 1, 1]);
  });
  it("힌트 기록과 자기 평가의 범위를 검사한다", () => {
    const w = makeWork(missions[0]);
    w.hintsUsed = 2;
    w.selfAssessment = {
      levels: [2, 2, 1, 0],
      note: "더 해 볼래요",
      at: w.createdAt,
    };
    const [copy] = parseImport(exportJSON([w]));
    expect([copy.hintsUsed, copy.selfAssessment]).toEqual([
      2,
      w.selfAssessment,
    ]);
    w.hintsUsed = 11;
    expect(() => parseImport(exportJSON([w]))).toThrow("힌트");
    w.hintsUsed = 0;
    w.selfAssessment = { levels: [9, 0, 0, 0], note: "", at: w.createdAt };
    expect(() => parseImport(exportJSON([w]))).toThrow("평가 단계");
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
describe("기기 저장소의 망가진 기록", () => {
  beforeEach(async () => {
    await clearWorks();
  });
  it("읽지 못한 기록만 따로 두고 나머지 작품은 읽는다", async () => {
    const good = makeWork(missions[0]);
    await saveWork(good);
    const future = { ...makeWork(missions[1]), schemaVersion: 99 };
    const unknownKind = {
      ...makeWork(missions[1]),
      kind: "rocket",
    };
    const broken = { id: "broken", schemaVersion: 2 };
    for (const raw of [future, unknownKind, broken])
      await saveWork(raw as unknown as ReturnType<typeof makeWork>);
    const { works, unreadable } = await readAllWorks();
    expect(works.map((w) => w.id)).toEqual([good.id]);
    expect(unreadable).toHaveLength(3);
    expect((await listWorks()).map((w) => w.id)).toEqual([good.id]);
  });
});
