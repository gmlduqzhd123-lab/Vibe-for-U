import { describe, it, expect, beforeAll } from "vitest";
import { addTranslations, translate } from "../src/i18n";
import { en as student } from "../src/i18nEn";
import { enTeacher } from "../src/i18nEnTeacher";
const en = { ...student, ...enTeacher };
import { stageNames, kindNames, aiStatus, makeWork } from "../src/model";
import { dirNames, autoChecks } from "../src/engines";
import { missions, quiz, story, timer } from "../src/data";
import { lessons, rubric } from "../src/lessonData";
import { bugNames, filters, levelNames, orders } from "../src/classSummary";
import { debugFields } from "../src/model";
import { builtInPhrases } from "../src/Phrases";
import { stageGuides } from "../src/Workspace";
import { blockGroups, predictionStarters } from "../src/BlockPrompt";
import { codeKeys, listedKeys } from "./i18nKeys";
import { configStrings } from "../src/missionText";
import { tourSteps } from "../src/Tour";
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
      // 화면에서 t()로 바꾸는 표: 버그 종류, 버그 탐정 일지 칸, 의견 문장 모음
      ...Object.values(bugNames),
      ...debugFields.flatMap(([, label, hint]) => [label, hint]),
      ...builtInPhrases.flat(),
      // 미션 추천 이유(recommend.ts)와 학급 모으기 걸러 보기·정렬 이름
      "하던 미션을 이어서 해요.",
      "방금 끝낸 종류의 다음 미션이에요.",
      "아직 안 해 본 종류예요.",
      "처음이라면 여기서 시작해요.",
      ...filters.map(([, label]) => label),
      ...orders.map(([, label]) => label),
      // 포트폴리오의 빠진 기록 안내(learning.ts의 portfolioGaps가 돌려주는 문장)
      "「{stage}」 단계에 기록할 내용이 남았어요.",
      "예상이 맞았는지 아직 표시하지 않았어요.",
      "어떻게 눌러 봤는지 실행 기록 증거가 없어요.",
      "스스로 평가를 아직 다 고르지 않았어요.",
      // 화면 둘러보기의 안내 글(Tour.tsx)
      ...tourSteps.flatMap((s) => [s.title, s.text]),
      ...predictionStarters,
      "시작 작품 · 현재 편집본",
      "가져온 복사본 · 현재 편집본",
      "QR로 받은 복사본 · 현재 편집본",
      "QR로 받은 작품",
      // 차시 안내와 완성 예제·미션의 시작 글
      ...lessons.flatMap((l) => Object.values(l)),
      ...[quiz, story, timer].flatMap(configStrings),
      ...missions.flatMap((m) => configStrings(m.starter)),
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
