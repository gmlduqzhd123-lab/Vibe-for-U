import { describe, it, expect, beforeAll } from "vitest";
import { addTranslations, translate } from "../src/i18n";
import { en } from "../src/i18nEn";
import { stageNames, kindNames, aiStatus, makeWork } from "../src/model";
import { dirNames, autoChecks } from "../src/engines";
import { rubric, missions } from "../src/data";
import { levelNames } from "../src/classSummary";
import { stageGuides } from "../src/Workspace";
import { blockGroups, predictionStarters } from "../src/BlockPrompt";
import { codeKeys, listedKeys } from "./i18nKeys";
describe("화면 틀 번역", () => {
  it("번역이 없으면 한국어 문장을 그대로 보여 준다", () => {
    expect(translate("ko", "미션 공작대")).toBe("미션 공작대");
    expect(translate("en", "미션 공작대")).toBe("Missions");
    expect(translate("en", "번역 없는 문장")).toBe("번역 없는 문장");
  });
  it("값을 넣을 자리를 채운다", () => {
    expect(translate("ko", "버전 {n}개", { n: 3 })).toBe("버전 3개");
  });
});
describe("학생 화면 전체 번역", () => {
  beforeAll(() => addTranslations("en", en));
  it("코드에서 화면 언어로 바꾸는 모든 문장에 영어 번역이 있다", () => {
    const keys = new Map([...codeKeys(), ...listedKeys()]);
    const data = [
      ...stageNames,
      ...stageGuides,
      ...Object.values(dirNames),
      ...Object.values(kindNames),
      ...rubric.flat(),
      ...levelNames,
      ...predictionStarters,
      "시작 작품 · 현재 편집본",
      "가져온 복사본 · 현재 편집본",
      ...missions.flatMap((m) => [
        aiStatus(makeWork(m).draft.ai),
        ...autoChecks(m.starter, "r").map((c) => c.label),
      ]),
    ];
    for (const k of data) if (!keys.has(k)) keys.set(k, "자료");
    const missing = [...keys]
      .filter(([k]) => translate("en", k) === k)
      .map(([k, f]) => `${f}: ${k}`);
    expect(missing).toEqual([]);
    expect(keys.size).toBeGreaterThan(500);
  });
  it("번역에도 같은 값 자리가 있다", () => {
    const names = (s: string) =>
      [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const wrong = Object.entries(en).filter(
      ([k, v]) => names(k).join() !== names(v).join(),
    );
    expect(wrong).toEqual([]);
  });
  it("낱말 블록은 같은 번역으로 문장을 잇는다", () => {
    const t = (s: string, v?: Record<string, string | number>) =>
      translate("en", s, v);
    for (const kind of Object.keys(kindNames) as (keyof typeof kindNames)[])
      for (const g of blockGroups(kind, t))
        for (const b of g.blocks) expect(b).not.toMatch(/[가-힣]/);
  });
});
