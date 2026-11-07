import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { SortConfig } from "../src/model";
import {
  autoChecks,
  initialSort,
  resetSort,
  runSort,
  sortMismatches,
  stepSort,
} from "../src/engines";
import { diagnose } from "../src/diagnose";
import { validateConfig } from "../src/storage";
import { bugCandidates } from "../src/bugChallenge";
const starter = (id: string) =>
  missions.find((m) => m.id === id)!.starter as SortConfig;
describe("분류 앱", () => {
  it("카드를 위에서부터 처음 맞는 바구니에, 맞는 곳이 없으면 나머지에 넣는다", () => {
    const c = starter("sort-1");
    let s = initialSort();
    s = stepSort(c, s);
    expect(s.placed).toEqual([0]);
    expect(s.event).toContain("「네 발 동물」");
    const all = runSort(c, s);
    expect(all.placed).toEqual([0, 1, 0, -1, 1]);
    expect(stepSort(c, all)).toBe(all);
    expect(resetSort().placed).toEqual([]);
    expect(sortMismatches(c)).toEqual([]);
  });
  it("학습용 오류(넓은 조건이 먼저)를 자동 검사와 맞춤 힌트가 찾고, 정상 규칙은 통과한다", () => {
    const bugged = starter("sort-3");
    const fails = autoChecks(bugged, "r").filter((x) => x.status === "fail");
    expect(fails.map((x) => x.label)).toEqual([
      "바구니마다 카드가 들어갈 수 있음",
      "카드가 기대한 바구니로",
    ]);
    expect(diagnose(bugged)[0].id).toBe("sort-shadowed");
    const fixed = makeWork(
      missions.find((m) => m.id === "sort-3")!,
      true,
    ).draft.config as SortConfig;
    expect(fixed.bins.map((b) => b.value)).toEqual([6, 2]);
    expect(autoChecks(fixed, "r").every((x) => x.status === "pass")).toBe(true);
  });
  it("경계값을 틀리면 경계 힌트, 바구니 이름을 틀리면 이름 힌트를 준다", () => {
    const c = starter("sort-2");
    const boundary = { ...c, bins: [{ ...c.bins[0], value: 121 }] };
    expect(diagnose(boundary).map((f) => f.id)).toEqual(["sort-boundary"]);
    const typo = {
      ...c,
      cards: c.cards.map((k, i) => (i ? k : { ...k, expect: "다음에 탐" })),
    };
    expect(diagnose(typo).map((f) => f.id)).toEqual(["sort-unknown"]);
  });
  it("파일 검사를 통과하고, 버그 탐정 도전에도 쓰인다", () => {
    for (const m of missions.filter((x) => x.kind === "sort"))
      expect(validateConfig(m.starter)).toEqual(m.starter);
    expect(() => validateConfig({ ...starter("sort-1"), cards: [] })).toThrow();
    expect(bugCandidates("sort").length).toBeGreaterThan(0);
  });
});
