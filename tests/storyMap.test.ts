import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { storyLayout } from "../src/StoryMap";
import type { StoryConfig } from "../src/model";
const starter = (id: string) =>
  structuredClone(missions.find((m) => m.id === id)!.starter) as StoryConfig;
describe("장면 연결 지도 배치", () => {
  it("시작에서의 거리로 열을 나눈다", () => {
    const map = storyLayout(starter("story-1"));
    expect(map.nodes.map((n) => [n.id, n.col, n.row])).toEqual([
      ["start", 0, 0],
      ["tree", 1, 0],
      ["sun", 1, 1],
    ]);
    expect(map.unreachable).toEqual([]);
    expect(map.missing).toEqual([]);
    expect(map.edges.map((e) => [e.to, e.index, e.back])).toEqual([
      ["tree", 1, false],
      ["sun", 2, false],
    ]);
  });
  it("잘못 연결된 길 때문에 갈 수 없는 목표 결말을 따로 표시한다", () => {
    const map = storyLayout(starter("story-3"));
    expect(map.unreachable.map((n) => n.id)).toEqual(["sun"]);
    expect(map.missing).toEqual(["sun"]);
    expect(map.nodes.find((n) => n.id === "sun")!.col).toBe(2);
  });
  it("앞 장면으로 돌아가는 선택은 되돌아가는 화살표다", () => {
    const c = starter("story-1");
    c.scenes[1] = {
      ...c.scenes[1],
      ending: false,
      choices: [{ label: "처음으로", to: "start" }],
    };
    const back = storyLayout(c).edges.find((e) => e.from === "tree")!;
    expect(back.back).toBe(true);
  });
});
