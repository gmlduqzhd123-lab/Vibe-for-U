import type { Config, Kind } from "./model";
import {
  loopStops,
  patternMatch,
  reachable,
  runLoop,
  runPattern,
  shadowedBins,
  shadowedRules,
  sortBin,
  sortMismatches,
} from "./engines";
import { diagnose } from "./diagnose";
// 도전 과제: 미션을 마친 학생이 설정을 바꿔 스스로 만들어 보는 열린 과제.
// 정답이 하나가 아니며, 지금 설정이 조건에 맞는지 규칙으로만 확인한다(AI 없음). 기록에는 남기지 않는다.
// text는 번역 열쇠다.
export type Challenge = {
  id: string;
  text: string;
  met: (c: Config) => boolean;
};
const clean = (c: Config) => diagnose(c).length === 0;
export const challenges: Record<Kind, Challenge[]> = {
  quiz: [
    {
      id: "quiz-three",
      text: "문제를 3개 이상으로 늘리고, 모두 맞히면 딱 9점이 되게 만들어 보세요.",
      met: (c) =>
        c.kind === "quiz" &&
        c.questions.length >= 3 &&
        c.questions.length * c.points === 9 &&
        clean(c),
    },
    {
      id: "quiz-choices",
      text: "모든 문제의 선택지를 4개 이상으로 만들고, 정답이 모두 1번은 아니게 해 보세요.",
      met: (c) =>
        c.kind === "quiz" &&
        c.questions.every((q) => q.choices.length >= 4) &&
        c.questions.some((q) => q.correct !== 0),
    },
  ],
  story: [
    {
      id: "story-endings",
      text: "결말을 3개 이상 만들고, 모든 결말에 갈 수 있게 길을 이어 보세요.",
      met: (c) => {
        if (c.kind !== "story") return false;
        const seen = reachable(c);
        const endings = c.scenes.filter((s) => s.ending);
        return endings.length >= 3 && endings.every((s) => seen.has(s.id));
      },
    },
    {
      id: "story-long",
      text: "선택을 세 번 해야 닿는 결말을 하나 만들어 보세요.",
      met: (c) => {
        if (c.kind !== "story") return false;
        // 시작에서 각 장면까지 가장 짧은 선택 횟수
        const depth = new Map([[c.start, 0]]);
        const queue = [c.start];
        while (queue.length) {
          const id = queue.shift()!;
          for (const ch of c.scenes.find((s) => s.id === id)?.choices ?? [])
            if (!depth.has(ch.to)) {
              depth.set(ch.to, depth.get(id)! + 1);
              queue.push(ch.to);
            }
        }
        return c.scenes.some((s) => s.ending && (depth.get(s.id) ?? 0) >= 3);
      },
    },
  ],
  timer: [
    {
      id: "timer-ninety",
      text: "딱 1분 30초를 재고, 끝나면 내가 쓴 안내가 나오는 타이머를 만들어 보세요.",
      met: (c) =>
        c.kind === "timer" &&
        c.seconds === 90 &&
        c.showEnd &&
        c.endMessage.trim().length > 0,
    },
  ],
  pattern: [
    {
      id: "pattern-twelve",
      text: "목표 모양과 똑같이 그리면서, 칠한 칸이 딱 12개가 되게 만들어 보세요.",
      met: (c) => {
        if (c.kind !== "pattern") return false;
        const painted = runPattern(c).painted;
        const m = patternMatch(c, painted);
        return painted.length === 12 && !m.missing.length && !m.extra.length;
      },
    },
    {
      id: "pattern-repeat",
      text: "명령은 2개 이하로 쓰고, 반복을 3번 이상 써서 목표 모양을 그려 보세요.",
      met: (c) => {
        if (c.kind !== "pattern") return false;
        const m = patternMatch(c, runPattern(c).painted);
        return (
          c.commands.length <= 2 &&
          c.repeat >= 3 &&
          !m.missing.length &&
          !m.extra.length
        );
      },
    },
  ],
  rule: [
    {
      id: "rule-three",
      text: "조건을 3개 이상 만들고, 어떤 조건도 앞 조건에 가리지 않게 순서를 정해 보세요.",
      met: (c) =>
        c.kind === "rule" && c.rules.length >= 3 && !shadowedRules(c).length,
    },
    {
      id: "rule-down",
      text: "값을 줄이는 버튼을 넣고, 값이 0보다 작아지지 않게 막아 보세요.",
      met: (c) =>
        c.kind === "rule" &&
        c.buttons.some((b) => b.change < 0) &&
        c.floor !== null &&
        c.floor >= 0,
    },
  ],
  sort: [
    {
      id: "sort-three",
      text: "바구니를 3개 이상 만들고, 모든 카드가 기대한 바구니에 들어가게 해 보세요.",
      met: (c) =>
        c.kind === "sort" &&
        c.bins.length >= 3 &&
        !shadowedBins(c).length &&
        !sortMismatches(c).length,
    },
    {
      id: "sort-rest",
      text: "나머지 바구니에도 카드가 한 장 이상 들어가고, 모든 카드가 기대한 곳에 가게 해 보세요.",
      met: (c) =>
        c.kind === "sort" &&
        c.cards.some((card) => sortBin(c, card) < 0) &&
        !sortMismatches(c).length,
    },
  ],
  loop: [
    {
      id: "loop-hundred",
      text: "처음 값이 0이 아닌데도 딱 100에서 끝나는 반복을 만들어 보세요.",
      met: (c) =>
        c.kind === "loop" &&
        c.start !== 0 &&
        runLoop(c).value === 100 &&
        clean(c),
    },
    {
      id: "loop-down",
      text: "값이 줄어들다가 멈춤 조건에 맞아, 정한 횟수를 다 채우기 전에 멈추는 반복을 만들어 보세요.",
      met: (c) => {
        if (c.kind !== "loop" || c.change >= 0 || !c.until) return false;
        const done = runLoop(c);
        return loopStops(c, done.value) && done.round < c.times && clean(c);
      },
    },
  ],
  list: [
    {
      id: "list-queue",
      text: "낱말을 6개 이상 만들고, 5개까지만 들어가며 먼저 넣은 것이 먼저 나오는 목록을 만들어 보세요.",
      met: (c) =>
        c.kind === "list" &&
        c.items.length >= 6 &&
        c.max === 5 &&
        c.remove === "first" &&
        clean(c),
    },
    {
      id: "list-unique",
      text: "낱말 버튼이 모두 서로 다르고, 모두 넣어도 가득 차지 않는 목록을 만들어 보세요.",
      met: (c) =>
        c.kind === "list" &&
        new Set(c.items.map((x) => x.trim())).size === c.items.length &&
        c.max >= c.items.length &&
        clean(c),
    },
  ],
};
