import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import type { SortConfig } from "../src/model";
import {
  autoChecks,
  binCondition,
  initialSort,
  renameBasket,
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
  it("그리고·또는: 둘째 특징 조건을 이어 판정하고, 가린 바구니도 두 특징으로 찾는다", () => {
    const and = starter("sort-5");
    expect(runSort(and).placed).toEqual([0, 1, 0, -1, -1]);
    expect(sortMismatches(and)).toEqual([]);
    expect(autoChecks(and, "r").every((x) => x.status === "pass")).toBe(true);
    // '그리고'를 '또는'으로 바꾸면 날개만 있는 참새도 들어간다.
    const loose = {
      ...and,
      bins: and.bins.map((b) =>
        b.second ? { ...b, second: { ...b.second, op: "or" as const } } : b,
      ),
    };
    expect(runSort(loose).placed[3]).toBe(0);
    // 넓은 바구니(다리 6)를 위로 올리면 '나는 곤충'은 가려진다.
    const hidden = { ...and, bins: [...and.bins].reverse() };
    expect(diagnose(hidden)[0].id).toBe("sort-shadowed");
    const or = starter("sort-6");
    expect(runSort(or).placed).toEqual([-1, 0, 0, 0, -1]);
    expect(binCondition(or, or.bins[0])).toBe(
      "기온(도) 33 이상이면 또는 미세먼지 80 이상이면",
    );
    expect(validateConfig(and)).toEqual(and);
  });
  it("바구니 이름을 바꾸면 그 이름을 가리키던 카드도 함께 바뀌어 검사가 깨지지 않는다", () => {
    const c = starter("sort-4");
    const renamed = renameBasket(c, -1, "중간이에요");
    expect(renamed.otherwise).toBe("중간이에요");
    expect(renamed.cards.find((k) => k.label === "책")!.expect).toBe(
      "중간이에요",
    );
    expect(sortMismatches(renamed)).toEqual([]);
    const bin = renameBasket(c, 0, "묵직해요");
    expect(bin.bins[0].name).toBe("묵직해요");
    expect(sortMismatches(bin)).toEqual([]);
    // 같은 이름의 바구니가 둘이면 어느 쪽인지 알 수 없어 카드는 그대로 둔다.
    const twin = { ...c, bins: c.bins.map((b) => ({ ...b, name: "같음" })) };
    expect(renameBasket(twin, 0, "다름").cards).toEqual(twin.cards);
  });
});
