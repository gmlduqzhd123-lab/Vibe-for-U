import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { clone, makeWork } from "../src/model";
import { compareSnapshots } from "../src/learning";
describe("버전 비교", () => {
  it("바뀐 규칙 줄과 기록 항목을 찾는다", () => {
    const before = makeWork(missions[2]).draft;
    const after = clone(before);
    if (after.config.kind !== "quiz") throw Error();
    after.config.scoring = "once";
    after.change.reason = "중복 점수를 막으려고";
    const diff = compareSnapshots(before, after);
    expect(diff.sameConfig).toBe(false);
    expect(diff.removed).toEqual(["채점: 정답을 누를 때마다 (학습용 오류)"]);
    expect(diff.added).toEqual(["채점: 문제마다 한 번만"]);
    expect(diff.fields).toEqual(["수정 이유"]);
  });
  it("같은 버전은 바뀐 점이 없다", () => {
    const d = makeWork(missions[0]).draft;
    const diff = compareSnapshots(d, clone(d));
    expect(diff).toEqual({
      removed: [],
      added: [],
      sameConfig: true,
      fields: [],
    });
  });
});
