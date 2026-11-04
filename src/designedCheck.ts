import type { Check, Config } from "./model";
import { now, uid } from "./model";
import {
  answerQuiz,
  initialQuiz,
  initialRule,
  initialTimer,
  nextQuiz,
  patternMatch,
  pressRule,
  runPattern,
  startTimer,
  tickTimer,
} from "./engines";
import type { Tr } from "./engines";
// 학생이 직접 설계하는 검사: "이렇게 누르면 이런 결과가 나올 것"을 적으면 앱이 대신 눌러 보고 비교한다.
// 설계는 종류별 동작 하나와 숫자 값 두 개(a, b)로 이루어진다. 결과 문장은 화면 언어로 만든다.
export type Param = { key: "a" | "b"; label: string; min: number; max: number };
export type Action = { id: string; label: string; params: Param[] };
export type Design = { action: string; a: number; b: number; expected: string };
export function designActions(c: Config, t: Tr): Action[] {
  switch (c.kind) {
    case "quiz": {
      const choices = Math.max(1, ...c.questions.map((q) => q.choices.length));
      return [
        {
          id: "quiz-answer",
          label: t("문제 {a}에서 {b}번 답 고르기 → 점수"),
          params: [
            {
              key: "a",
              label: t("문제 번호"),
              min: 1,
              max: c.questions.length,
            },
            { key: "b", label: t("답 번호"), min: 1, max: choices },
          ],
        },
        {
          id: "quiz-twice",
          label: t("문제 {a}에서 정답을 두 번 고르기 → 점수"),
          params: [
            {
              key: "a",
              label: t("문제 번호"),
              min: 1,
              max: c.questions.length,
            },
          ],
        },
        {
          id: "quiz-all",
          label: t("모든 문제를 정답으로 풀기 → 최종 점수"),
          params: [],
        },
      ];
    }
    case "rule":
      return [
        {
          id: "rule-press",
          label: t("{a}번 버튼을 {b}번 누르기 → 값과 문구"),
          params: [
            { key: "a", label: t("버튼 번호"), min: 1, max: c.buttons.length },
            { key: "b", label: t("누르는 횟수"), min: 1, max: 50 },
          ],
        },
      ];
    case "timer":
      return [
        {
          id: "timer-wait",
          label: t("시작하고 {a}초 기다리기 → 남은 시간"),
          params: [
            { key: "a", label: t("기다리는 초"), min: 0, max: c.seconds + 60 },
          ],
        },
      ];
    case "pattern":
      return [
        {
          id: "pattern-run",
          label: t("명령을 모두 실행하기 → 칠한 칸 수"),
          params: [],
        },
      ];
    case "story":
      return [
        {
          id: "story-choose",
          label: t("시작 장면에서 {a}번 선택하기 → 다음 장면"),
          params: [
            {
              key: "a",
              label: t("선택 번호"),
              min: 1,
              max: Math.max(
                1,
                c.scenes.find((s) => s.id === c.start)?.choices.length ?? 1,
              ),
            },
          ],
        },
      ];
  }
}
const clamp = (v: number, p?: Param) =>
  p ? Math.min(p.max, Math.max(p.min, Math.round(v) || p.min)) : 0;
// 설계대로 앱을 실행해 실제 결과를 문장으로 돌려준다.
export function runDesign(c: Config, d: Design, t: Tr) {
  const action = designActions(c, t).find((x) => x.id === d.action);
  if (!action) return null;
  const a = clamp(
    d.a,
    action.params.find((p) => p.key === "a"),
  );
  const b = clamp(
    d.b,
    action.params.find((p) => p.key === "b"),
  );
  const label = t(action.label, { a, b });
  switch (d.action) {
    case "quiz-answer":
    case "quiz-twice": {
      if (c.kind !== "quiz") return null;
      let s = initialQuiz(t);
      for (let i = 1; i < a; i++) {
        s = answerQuiz(c, s, c.questions[s.index].correct, t);
        s = nextQuiz(c, s, t);
      }
      const choice =
        d.action === "quiz-twice" ? c.questions[s.index].correct : b - 1;
      s = answerQuiz(c, s, choice, t);
      if (d.action === "quiz-twice") s = answerQuiz(c, s, choice, t);
      return { label, actual: t("점수 {n}", { n: s.score }) };
    }
    case "quiz-all": {
      if (c.kind !== "quiz") return null;
      let s = initialQuiz(t);
      while (!s.finished) {
        s = answerQuiz(c, s, c.questions[s.index].correct, t);
        s = nextQuiz(c, s, t);
      }
      return { label, actual: t("최종 점수 {n}", { n: s.score }) };
    }
    case "rule-press": {
      if (c.kind !== "rule") return null;
      let s = initialRule(c, t);
      for (let i = 0; i < b; i++) s = pressRule(c, s, a - 1, t);
      const hit = c.rules.find((r) =>
        r.when === "gte"
          ? s.value >= r.value
          : r.when === "lte"
            ? s.value <= r.value
            : s.value === r.value,
      );
      return {
        label,
        actual: t("{name} {v} · 문구 「{m}」", {
          name: c.variable,
          v: s.value,
          m: hit ? hit.message : c.otherwise,
        }),
      };
    }
    case "timer-wait": {
      if (c.kind !== "timer") return null;
      const s = tickTimer(startTimer(initialTimer(c), 0), a * 1000, c);
      const left = Math.ceil(s.remaining / 1000);
      return {
        label,
        actual: s.ended
          ? t("남은 시간 0초 · {end}", {
              end: c.showEnd ? t("종료 안내 표시") : t("종료 안내 없음"),
            })
          : t("남은 시간 {n}초", { n: left }),
      };
    }
    case "pattern-run": {
      if (c.kind !== "pattern") return null;
      const s = runPattern(c, undefined, t);
      const m = patternMatch(c, s.painted);
      return {
        label,
        actual: t("칠한 칸 {n}개 · 목표와 다른 칸 {m}개", {
          n: s.painted.length,
          m: m.missing.length + m.extra.length,
        }),
      };
    }
    case "story-choose": {
      if (c.kind !== "story") return null;
      const start = c.scenes.find((s) => s.id === c.start);
      const to = start?.choices[a - 1]?.to;
      const scene = c.scenes.find((s) => s.id === to);
      return {
        label,
        actual: scene
          ? t("장면 「{title}」", { title: scene.title })
          : t("이어지는 장면이 없어요"),
      };
    }
  }
  return null;
}
// 예상과 실제 비교: 예상에 숫자가 있으면 숫자들이 차례로 같아야 하고, 없으면 예상 문구가 실제에 들어 있어야 한다.
export function designMatches(expected: string, actual: string) {
  const nums = (s: string) => s.match(/-?\d+/g) ?? [];
  const e = expected.trim();
  if (!e) return false;
  const en = nums(e);
  if (en.length) return en.join(",") === nums(actual).join(",");
  return actual.replace(/\s/g, "").includes(e.replace(/\s/g, ""));
}
// 설계·실행 결과를 '학습자 직접 확인' 카드로 만든다. 상태는 앱이 비교해 넣고, 학생은 바꿀 수 있다.
export function designedCheck(
  c: Config,
  d: Design,
  revision: string,
  t: Tr,
): Check | null {
  const run = runDesign(c, d, t);
  if (!run) return null;
  return {
    id: uid(),
    label: `${t("내가 설계한 검사")} · ${run.label}`,
    expected: d.expected.trim(),
    actual: `${t("앱이 대신 눌러 봤어요")}: ${run.actual}`,
    source: "self",
    status: designMatches(d.expected, run.actual) ? "pass" : "fail",
    revision,
    at: now(),
  };
}
