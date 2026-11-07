import { missions } from "./data";
import { diagnose } from "./diagnose";
import { autoChecks } from "./engines";
import { clone, makeWork, uid } from "./model";
import type { Config, Kind, Mission, Work } from "./model";
// 버그 탐정 무한 연습: 정상 규칙의 작품에 규칙으로 찾을 수 있는 학습용 오류를 하나 몰래 넣는다.
// 맞춤 힌트(diagnose)가 찾아내는 오류만 넣어서, 학생이 고치면 자동 검사로 확인할 수 있다.
export const BUG_LABEL = "버그 탐정 도전";
type Mutation = (c: Config) => Config | null;
const mutations: Record<Kind, Mutation[]> = {
  quiz: [
    (c) => (c.kind === "quiz" ? { ...c, scoring: "attempt" } : null),
    (c) => (c.kind === "quiz" ? { ...c, resetScore: false } : null),
  ],
  story: [
    // 목표 결말 하나로 가는 길을 모두 처음 장면으로 돌려 그 결말에 갈 수 없게 한다.
    (c) => {
      if (c.kind !== "story" || !c.intendedEndings.length) return null;
      const lost = c.intendedEndings[c.intendedEndings.length - 1];
      return {
        ...c,
        scenes: c.scenes.map((s) => ({
          ...s,
          choices: s.choices.map((ch) =>
            ch.to === lost ? { ...ch, to: c.start } : ch,
          ),
        })),
      };
    },
  ],
  timer: [(c) => (c.kind === "timer" ? { ...c, showEnd: false } : null)],
  rule: [
    // 조건을 거꾸로 놓아 좁은 조건이 넓은 조건에 가리게 한다.
    (c) =>
      c.kind === "rule" && c.rules.length > 1
        ? { ...c, rules: [...c.rules].reverse() }
        : null,
    // 넓은 조건 하나를 맨 위에 끼워 넣는다.
    (c) =>
      c.kind === "rule"
        ? {
            ...c,
            rules: [
              { when: "gte", value: c.start, message: c.otherwise },
              ...c.rules,
            ],
          }
        : null,
  ],
  sort: [
    // 바구니 순서를 거꾸로 놓아 좁은 조건이 넓은 조건에 가리게 한다.
    (c) =>
      c.kind === "sort" && c.bins.length > 1
        ? { ...c, bins: [...c.bins].reverse() }
        : null,
    // 첫 '이상' 바구니의 기준 값을 하나 올려, 딱 기준 값인 카드가 빠지게 한다.
    (c) => {
      if (c.kind !== "sort") return null;
      const i = c.bins.findIndex((b) => b.when === "gte");
      return i < 0
        ? null
        : {
            ...c,
            bins: c.bins.map((b, k) =>
              k === i ? { ...b, value: b.value + 1 } : b,
            ),
          };
    },
  ],
  pattern: [
    (c) => (c.kind === "pattern" ? { ...c, edge: "wrap" } : null),
    // 마지막 명령을 빼서 빠진 칸을 만든다.
    (c) =>
      c.kind === "pattern" && c.commands.length > 1
        ? { ...c, commands: c.commands.slice(0, -1) }
        : null,
    // 첫 명령을 한 칸 더 가게 해 목표 밖 칸을 칠하게 한다.
    (c) =>
      c.kind === "pattern"
        ? {
            ...c,
            commands: c.commands.map((m, i) =>
              i ? m : { ...m, count: m.count + 1 },
            ),
          }
        : null,
  ],
};
const failing = (c: Config) =>
  diagnose(c).length > 0 && autoChecks(c, "r").some((x) => x.status === "fail");
// 오류를 넣을 수 있는 (미션, 오류) 짝. 정상 규칙에서는 문제가 없고, 오류를 넣으면 자동 검사가 실패해야 한다.
export function bugCandidates(kind?: Kind) {
  return missions
    .filter((m) => !m.id.startsWith("custom-") && (!kind || m.kind === kind))
    .flatMap((m) => {
      const base = makeWork(m, true).draft.config;
      if (failing(base)) return [];
      return mutations[m.kind].flatMap((mutate) => {
        const bugged = mutate(clone(base));
        return bugged && failing(bugged)
          ? [{ mission: m, config: bugged }]
          : [];
      });
    });
}
export function makeBugChallenge(
  title: (m: Mission) => string,
  kind?: Kind,
  random = Math.random,
): Work {
  const list = bugCandidates(kind);
  const pick = list[Math.floor(random() * list.length) % list.length];
  const work = makeWork(pick.mission, true);
  work.draft = {
    ...work.draft,
    title: title(pick.mission),
    config: pick.config,
    revision: uid(),
  };
  work.versions = [
    { ...work.versions[0], label: BUG_LABEL, data: clone(work.draft) },
  ];
  work.editingLabel = `${BUG_LABEL} · 현재 편집본`;
  return work;
}
export const isBugChallenge = (w: Work) => w.versions[0]?.label === BUG_LABEL;
// 지금 설정에서 맞춤 힌트가 찾는 문제가 없고 자동 검사도 모두 통과하면 고친 것으로 본다.
export const bugSolved = (w: Work) =>
  diagnose(w.draft.config).length === 0 &&
  autoChecks(w.draft.config, "r").every((x) => x.status === "pass");
