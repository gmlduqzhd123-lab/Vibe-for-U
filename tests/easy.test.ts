import { describe, it, expect } from "vitest";
import { blockGroups, blockSentence } from "../src/BlockPrompt";
import { arrangePrompt, kinds, makeWork } from "../src/model";
import { missions } from "../src/data";
describe("쉬운 모드 낱말 블록", () => {
  it("고른 순서와 상관없이 묶음 순서대로 문장을 만든다", () => {
    const sentence = blockSentence("quiz", [
      "점수를 보여 줘요.",
      "우리 반 친구가 쓸",
      "퀴즈를 만들고 싶어요.",
    ]);
    expect(sentence).toBe(
      "우리 반 친구가 쓸 퀴즈를 만들고 싶어요. 점수를 보여 줘요.",
    );
  });
  it("모든 프로젝트에 네 묶음 블록이 있다", () => {
    for (const k of kinds) {
      const groups = blockGroups(k);
      expect(groups).toHaveLength(4);
      expect(groups.every((g) => g.blocks.length > 0)).toBe(true);
    }
  });
  it("쉬운 모드 요청문 정리는 어린이 모드 문장을 쓴다", () => {
    const p = makeWork(missions[0]).draft.promise;
    expect(arrangePrompt(p, "easy")).toBe(arrangePrompt(p, "child"));
    expect(arrangePrompt(p, "adult")).not.toBe(arrangePrompt(p, "child"));
  });
});
