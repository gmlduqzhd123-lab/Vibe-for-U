import { AppError } from "./appError";
import { now, uid, LIMITS } from "./model";
import { translate } from "./i18n";
import type {
  Check,
  Config,
  Direction,
  PatternConfig,
  QuizConfig,
  RuleCondition,
  RuleConfig,
  SortConfig,
  StoryConfig,
  TimerConfig,
  Mission,
  Snapshot,
} from "./model";
// 동작 기록과 자동 검사 문장은 t를 넘기면 화면 언어로 만든다(기본은 한국어).
export type Tr = (
  text: string,
  vars?: Record<string, string | number>,
) => string;
const ko: Tr = (text, vars) => translate("ko", text, vars);
export type QuizState = {
  index: number;
  score: number;
  answered: boolean;
  selected: number | null;
  finished: boolean;
  event: string;
};
export const initialQuiz = (t: Tr = ko): QuizState => ({
  index: 0,
  score: 0,
  answered: false,
  selected: null,
  finished: false,
  event: t("아직 답을 고르지 않았어요."),
});
export function answerQuiz(
  c: QuizConfig,
  s: QuizState,
  choice: number,
  t: Tr = ko,
): QuizState {
  if (s.finished || choice < 0 || choice >= c.questions[s.index].choices.length)
    return s;
  const correct = choice === c.questions[s.index].correct;
  const add =
    correct && (c.scoring === "attempt" || !s.answered) ? c.points : 0;
  return {
    ...s,
    answered: true,
    selected: choice,
    score: s.score + add,
    event: t("선택 {n} → {rule} → 점수 {a} → {b} → {fb}", {
      n: choice + 1,
      rule: t(
        c.scoring === "once" ? "이미 답했는지 확인" : "시도할 때마다 채점",
      ),
      a: s.score,
      b: s.score + add,
      fb: correct ? c.correctFeedback : c.wrongFeedback,
    }),
  };
}
export function nextQuiz(c: QuizConfig, s: QuizState, t: Tr = ko): QuizState {
  if (!s.answered || s.finished) return s;
  return s.index === c.questions.length - 1
    ? { ...s, finished: true, event: t("마지막 문제 확인 → 최종 결과 표시") }
    : {
        ...s,
        index: s.index + 1,
        answered: false,
        selected: null,
        event: t("다음 문제 → 문제 번호 1 증가 → 답한 상태 초기화"),
      };
}
export function resetQuiz(c: QuizConfig, s: QuizState, t: Tr = ko): QuizState {
  return {
    ...initialQuiz(t),
    score: c.resetScore ? 0 : s.score,
    event: t("다시 시작 → 문제 번호 1, 답한 상태 비움, 점수 {n}", {
      n: c.resetScore ? 0 : s.score,
    }),
  };
}
// 만약 규칙 앱
export type RuleState = { value: number; presses: number; event: string };
export const ruleMatches = (
  r: { when: RuleCondition; value: number },
  v: number,
): boolean =>
  r.when === "gte"
    ? v >= r.value
    : r.when === "lte"
      ? v <= r.value
      : v === r.value;
// 위에서부터 처음 맞는 조건의 문구. 하나도 맞지 않으면 '그 밖에' 문구를 쓴다.
export function ruleMessage(c: RuleConfig, v: number) {
  const hit = c.rules.findIndex((r) => ruleMatches(r, v));
  return { index: hit, message: hit < 0 ? c.otherwise : c.rules[hit].message };
}
export const initialRule = (c: RuleConfig, t: Tr = ko): RuleState => ({
  value: c.start,
  presses: 0,
  event: t("처음 값 {v}에서 시작해요.", { v: c.start }),
});
export function pressRule(
  c: RuleConfig,
  s: RuleState,
  button: number,
  t: Tr = ko,
): RuleState {
  const b = c.buttons[button];
  if (!b) return s;
  const raw = s.value + b.change;
  const value = c.floor === null ? raw : Math.max(c.floor, raw);
  const hit = ruleMessage(c, value);
  return {
    value,
    presses: s.presses + 1,
    event: t("{label} → {name} {a} → {b} → {rule}", {
      label: b.label,
      name: c.variable,
      a: s.value,
      b: value,
      rule:
        hit.index < 0
          ? t("맞는 조건 없음 → 그 밖에 문구")
          : t("조건 {n}번이 처음으로 맞음", { n: hit.index + 1 }),
    }),
  };
}
export const resetRule = (c: RuleConfig, t: Tr = ko): RuleState => ({
  ...initialRule(c, t),
  event: t("처음으로 → {name} {v}", { name: c.variable, v: c.start }),
});
// 앞 조건에 가려 절대 맞을 수 없는 조건(예: '3 이상'이 '5 이상'보다 먼저 있음)을 찾는다.
// 만약 규칙의 조건과 분류 앱의 바구니가 함께 쓴다.
export function shadowedConditions(
  list: { when: RuleCondition; value: number }[],
  extra: number[] = [],
) {
  const values = [...extra, ...list.map((r) => r.value)];
  const lo = Math.min(...values) - 50;
  const hi = Math.max(...values) + 50;
  return list.flatMap((r, i) => {
    let reachable = false;
    for (let v = lo; v <= hi && !reachable; v++)
      if (ruleMatches(r, v) && list.findIndex((x) => ruleMatches(x, v)) === i)
        reachable = true;
    return reachable ? [] : [i];
  });
}
export const shadowedRules = (c: RuleConfig) =>
  shadowedConditions(c.rules, [c.start]);
// 분류 앱: 카드를 위에서부터 처음 맞는 바구니에 넣는다. 맞는 바구니가 없으면 나머지(-1)다.
export type SortState = { placed: number[]; event: string };
export const sortBin = (c: SortConfig, v: number) =>
  c.bins.findIndex((b) => ruleMatches(b, v));
export const binName = (c: SortConfig, i: number) =>
  i < 0 ? c.otherwise : c.bins[i].name;
export const initialSort = (t: Tr = ko): SortState => ({
  placed: [],
  event: t("아직 카드를 넣지 않았어요."),
});
export function stepSort(c: SortConfig, s: SortState, t: Tr = ko): SortState {
  const card = c.cards[s.placed.length];
  if (!card) return s;
  const i = sortBin(c, card.value);
  return {
    placed: [...s.placed, i],
    event: t("「{card}」 {name} {v} → {rule} → 「{bin}」", {
      card: card.label,
      name: c.property,
      v: card.value,
      rule:
        i < 0
          ? t("맞는 조건 없음 → 나머지 바구니")
          : t("조건 {n}번이 처음으로 맞음", { n: i + 1 }),
      bin: binName(c, i),
    }),
  };
}
export function runSort(c: SortConfig, s = initialSort(), t: Tr = ko) {
  let state = s;
  while (state.placed.length < c.cards.length) state = stepSort(c, state, t);
  return {
    ...state,
    event: t("카드 {n}장을 모두 넣었어요.", { n: c.cards.length }),
  };
}
export const resetSort = (t: Tr = ko): SortState => ({
  placed: [],
  event: t("처음으로 → 카드를 모두 꺼냈어요."),
});
// 기대한 바구니와 다른 곳에 들어간 카드(카드 번호, 들어간 곳, 기대한 곳)
export function sortMismatches(c: SortConfig) {
  return c.cards.flatMap((card, i) => {
    const got = binName(c, sortBin(c, card.value));
    return got.trim() === card.expect.trim()
      ? []
      : [{ index: i, got, want: card.expect.trim() }];
  });
}
export function reachable(c: StoryConfig) {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    c.scenes.find((s) => s.id === id)?.choices.forEach((ch) => visit(ch.to));
  };
  visit(c.start);
  return seen;
}
export type TimerState = {
  remaining: number;
  running: boolean;
  deadline: number;
  announcements: number;
  ended: boolean;
};
export const initialTimer = (c: TimerConfig): TimerState => ({
  remaining: c.seconds * 1000,
  running: false,
  deadline: 0,
  announcements: 0,
  ended: false,
});
export function startTimer(s: TimerState, t: number): TimerState {
  return s.running || s.remaining <= 0
    ? s
    : { ...s, running: true, deadline: t + s.remaining };
}
export function tickTimer(
  s: TimerState,
  t: number,
  c: TimerConfig,
): TimerState {
  if (!s.running) return s;
  const remaining = Math.max(0, s.deadline - t);
  return {
    ...s,
    remaining,
    running: remaining > 0,
    ended: remaining === 0,
    announcements: s.announcements + (remaining === 0 && c.showEnd ? 1 : 0),
  };
}
export function pauseTimer(s: TimerState, t: number, c: TimerConfig) {
  return { ...tickTimer(s, t, c), running: false };
}
export type PatternState = {
  x: number;
  y: number;
  painted: string[];
  step: number;
  wrapped: number;
  blocked: number;
  turns: number;
  // 조건으로 돈 방향은 그 명령이 끝날 때까지 이어진다.
  heading: { dir: Direction; command: number } | null;
  event: string;
};
export const dirNames: Record<Direction, string> = {
  right: "오른쪽",
  down: "아래",
  left: "왼쪽",
  up: "위",
};
const delta: Record<Direction, [number, number]> = {
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
  up: [0, -1],
};
const rightOf: Record<Direction, Direction> = {
  right: "down",
  down: "left",
  left: "up",
  up: "right",
};
export const cell = (x: number, y: number) => `${x},${y}`;
export const initialPattern = (t: Tr = ko): PatternState => ({
  x: 0,
  y: 0,
  painted: [cell(0, 0)],
  step: 0,
  wrapped: 0,
  blocked: 0,
  turns: 0,
  heading: null,
  event: t("첫 칸(0,0)에서 시작해요."),
});
// 반복 × 명령 × 칸 수를 한 칸짜리 이동 목록으로 펼친다. command는 몇 번째로 실행하는 명령인지다.
export function patternSteps(c: PatternConfig) {
  const once = c.commands.flatMap((m, i) =>
    Array.from({ length: m.count }, () => ({ dir: m.dir, command: i })),
  );
  return Array.from({ length: c.repeat }, (_, r) =>
    once.map((m) => ({ ...m, command: r * c.commands.length + m.command })),
  ).flat();
}
export const patternMoves = (c: PatternConfig): Direction[] =>
  patternSteps(c).map((m) => m.dir);
export function stepPattern(
  c: PatternConfig,
  s: PatternState,
  t: Tr = ko,
): PatternState {
  const dn = (d: Direction) => t(dirNames[d]);
  const steps = patternSteps(c);
  if (s.step >= steps.length) return s;
  const { command } = steps[s.step];
  const dir =
    s.heading?.command === command ? s.heading.dir : steps[s.step].dir;
  const target = (d: Direction) => {
    const [dx, dy] = delta[d];
    const x = s.x + dx;
    const y = s.y + dy;
    return {
      x,
      y,
      outside: x < 0 || y < 0 || x >= c.size || y >= c.size,
      painted: s.painted.includes(cell(x, y)),
    };
  };
  const next = target(dir);
  // 조건: 다음 칸이 판 밖이거나 이미 칠한 칸이면 오른쪽으로 돈다.
  if (c.turn === "right" && (next.outside || next.painted)) {
    const turned = rightOf[dir];
    const side = target(turned);
    if (side.outside || side.painted)
      return {
        ...s,
        step: s.step + 1,
        blocked: s.blocked + 1,
        event: t("{dir} 막힘 → 오른쪽으로 돌아도 막힘 → 멈춤 (위치 {at})", {
          dir: dn(dir),
          at: cell(s.x, s.y),
        }),
      };
    const at = cell(side.x, side.y);
    return {
      ...s,
      x: side.x,
      y: side.y,
      step: s.step + 1,
      turns: s.turns + 1,
      heading: { dir: turned, command },
      painted: [...s.painted, at],
      event: t(
        "{dir} 막힘 → 만약 막히면 오른쪽으로 돌기 → {turn} 한 칸 → 위치 {at} 칠하기",
        { dir: dn(dir), turn: dn(turned), at },
      ),
    };
  }
  if (next.outside && c.edge === "stop")
    return {
      ...s,
      step: s.step + 1,
      blocked: s.blocked + 1,
      event: t("{dir} 한 칸 → 판 가장자리 → 멈춤 (위치 {at})", {
        dir: dn(dir),
        at: cell(s.x, s.y),
      }),
    };
  const x = next.outside ? (next.x + c.size) % c.size : next.x;
  const y = next.outside ? (next.y + c.size) % c.size : next.y;
  const at = cell(x, y);
  return {
    ...s,
    x,
    y,
    step: s.step + 1,
    painted: s.painted.includes(at) ? s.painted : [...s.painted, at],
    wrapped: s.wrapped + (next.outside ? 1 : 0),
    event: t(
      next.outside
        ? "{dir} 한 칸 → 판 밖 → 반대편으로 넘어감 → 위치 {at} 칠하기"
        : "{dir} 한 칸 → 위치 {at} 칠하기",
      { dir: dn(dir), at },
    ),
  };
}
export function runPattern(c: PatternConfig, s = initialPattern(), t: Tr = ko) {
  const total = patternMoves(c).length;
  let state = s;
  while (state.step < total) state = stepPattern(c, state, t);
  return { ...state, event: t("명령 {n}칸을 모두 실행했어요.", { n: total }) };
}
export function patternMatch(c: PatternConfig, painted: string[]) {
  return {
    missing: c.target.filter((t) => !painted.includes(t)),
    extra: painted.filter((p) => !c.target.includes(p)),
  };
}
export function autoChecks(c: Config, revision: string, t: Tr = ko): Check[] {
  const rows: {
    label: string;
    expected: string;
    actual: string;
    pass: boolean;
  }[] = [];
  if (c.kind === "quiz") {
    let q = initialQuiz(t);
    for (let i = 0; i < 3; i++) q = answerQuiz(c, q, c.questions[0].correct, t);
    rows.push({
      label: "같은 정답 세 번",
      expected: t("{n}점만 반영", { n: c.points }),
      actual: t("{n}점", { n: q.score }),
      pass: q.score === c.points,
    });
    const wrong = (c.questions[0].correct + 1) % c.questions[0].choices.length;
    const w = answerQuiz(c, initialQuiz(), wrong);
    rows.push({
      label: "오답 점수",
      expected: t("{n}점", { n: 0 }),
      actual: t("{n}점", { n: w.score }),
      pass: w.score === 0,
    });
    let all = initialQuiz();
    for (const question of c.questions) {
      all = answerQuiz(c, all, question.correct);
      all = nextQuiz(c, all);
    }
    rows.push({
      label: "마지막 결과",
      expected: t("{screen}, {n}점", {
        screen: t("결과 화면"),
        n: c.questions.length * c.points,
      }),
      actual: t("{screen}, {n}점", {
        screen: t(all.finished ? "결과 화면" : "문제 화면"),
        n: all.score,
      }),
      pass: all.finished && all.score === c.questions.length * c.points,
    });
    const r = resetQuiz(c, q);
    rows.push({
      label: "다시 시작 상태",
      expected: t("{n}점 · {i}번 문제 · {a}", {
        n: 0,
        i: 1,
        a: t("답하지 않음"),
      }),
      actual: t("{n}점 · {i}번 문제 · {a}", {
        n: r.score,
        i: r.index + 1,
        a: t(r.answered ? "답함" : "답하지 않음"),
      }),
      pass: r.score === 0 && r.index === 0 && !r.answered,
    });
  } else if (c.kind === "story") {
    const reached = reachable(c);
    const valid = c.scenes.every((s) =>
      s.choices.every((ch) => c.scenes.some((x) => x.id === ch.to)),
    );
    const paths = c.intendedEndings.every((id) => reached.has(id));
    rows.push(
      {
        label: "모든 선택의 연결",
        expected: t("존재하는 장면으로 연결"),
        actual: t(valid ? "모두 유효한 장면" : "없는 장면 발견"),
        pass: valid,
      },
      {
        label: "의도한 결말 도달",
        expected: t("{n}개 결말에 도달 가능", { n: c.intendedEndings.length }),
        actual: t("{n}개 결말에 도달 가능", {
          n: c.intendedEndings.filter((id) => reached.has(id)).length,
        }),
        pass: paths,
      },
      {
        label: "처음 장면",
        expected: t("시작 장면이 존재"),
        actual: c.scenes.find((s) => s.id === c.start)?.title ?? t("없음"),
        pass: c.scenes.some((s) => s.id === c.start),
      },
    );
  } else if (c.kind === "pattern") {
    const done = runPattern(c);
    const { missing, extra } = patternMatch(c, done.painted);
    const reset = initialPattern();
    rows.push(
      {
        label: "목표 모양",
        expected: t("목표 칸 {n}개와 같은 모양", { n: c.target.length }),
        actual:
          missing.length || extra.length
            ? t("칠한 칸 {p}개 · 빠진 칸 {m}개, 더 칠한 칸 {e}개", {
                p: done.painted.length,
                m: missing.length,
                e: extra.length,
              })
            : t("칠한 칸 {p}개 · 목표와 같음", { p: done.painted.length }),
        pass: !missing.length && !extra.length,
      },
      {
        label: "판 가장자리",
        expected: t("판 밖으로 넘어가지 않음"),
        actual: done.wrapped
          ? t("반대편으로 {n}번 넘어감", { n: done.wrapped })
          : done.blocked
            ? t("가장자리에서 {n}번 멈춤", { n: done.blocked })
            : t("넘어간 이동 없음"),
        pass: done.wrapped === 0,
      },
      {
        label: "반복 실행",
        expected: t("명령 묶음 {r}번 · {n}칸 이동", {
          r: c.repeat,
          n: patternMoves(c).length,
        }),
        actual: t("{n}칸 이동", { n: done.step }),
        pass: done.step === patternMoves(c).length,
      },
      {
        label: "처음으로 다시 그리기",
        expected: t("빈 판의 첫 칸(0,0)에서 시작"),
        actual: t("칠한 칸 {p}개 · 위치 {at}", {
          p: reset.painted.length,
          at: cell(reset.x, reset.y),
        }),
        pass: reset.painted.length === 1 && reset.x === 0 && reset.y === 0,
      },
    );
  } else if (c.kind === "sort") {
    const hidden = shadowedConditions(
      c.bins,
      c.cards.map((x) => x.value),
    );
    const wrong = sortMismatches(c);
    const done = runSort(c, initialSort(t), t);
    const reset = resetSort(t);
    rows.push(
      {
        label: "바구니마다 카드가 들어갈 수 있음",
        expected: t("모든 바구니 조건이 어떤 값에서는 맞는다"),
        actual: hidden.length
          ? t("앞 조건에 가려 쓰이지 않는 바구니 {n}개", { n: hidden.length })
          : t("모든 바구니가 쓰일 수 있음"),
        pass: hidden.length === 0,
      },
      {
        label: "카드가 기대한 바구니로",
        expected: t("카드 {n}장 모두 기대한 바구니에 들어간다", {
          n: c.cards.length,
        }),
        actual: wrong.length
          ? t("「{card}」이 「{got}」에 들어감 · 다른 곳에 간 카드 {n}장", {
              card: c.cards[wrong[0].index].label,
              got: wrong[0].got,
              n: wrong.length,
            })
          : t("모두 기대한 바구니에 들어감"),
        pass: wrong.length === 0,
      },
      {
        label: "모두 넣기",
        expected: t("카드 {n}장이 하나씩 바구니에 들어간다", {
          n: c.cards.length,
        }),
        actual: t("넣은 카드 {n}장", { n: done.placed.length }),
        pass: done.placed.length === c.cards.length,
      },
      {
        label: "처음으로 다시",
        expected: t("바구니를 비우고 첫 카드부터"),
        actual: t("넣은 카드 {n}장", { n: reset.placed.length }),
        pass: reset.placed.length === 0,
      },
    );
  } else if (c.kind === "rule") {
    const hidden = shadowedRules(c);
    let s = initialRule(c, t);
    const up = c.buttons.findIndex((b) => b.change > 0);
    for (let i = 0; i < 3 && up >= 0; i++) s = pressRule(c, s, up, t);
    const reset = resetRule(c, t);
    const down = c.buttons.findIndex((b) => b.change < 0);
    let low = initialRule(c, t);
    for (let i = 0; i < 20 && down >= 0; i++) low = pressRule(c, low, down, t);
    rows.push(
      {
        label: "조건마다 나올 수 있음",
        expected: t("모든 조건의 문구가 어떤 값에서는 나온다"),
        actual: hidden.length
          ? t("앞 조건에 가려 나올 수 없는 조건 {n}개", { n: hidden.length })
          : t("모든 조건이 나올 수 있음"),
        pass: hidden.length === 0,
      },
      {
        label: "버튼과 기억하는 값",
        expected: t("버튼을 누른 만큼 {name}이 바뀐다", { name: c.variable }),
        actual: t("3번 눌러 {a} → {b}", { a: c.start, b: s.value }),
        pass: up < 0 || s.value === c.start + 3 * c.buttons[up].change,
      },
      {
        label: "처음으로 다시",
        expected: t("{name} {v}에서 다시 시작", {
          name: c.variable,
          v: c.start,
        }),
        actual: t("{name} {v}", { name: c.variable, v: reset.value }),
        pass: reset.value === c.start,
      },
      {
        label: "가장 작은 값",
        expected:
          c.floor === null
            ? t("가장 작은 값 제한 없음")
            : t("{v}보다 작아지지 않음", { v: c.floor }),
        actual: t("20번 줄여 {v}", { v: low.value }),
        pass: c.floor === null || low.value >= c.floor,
      },
    );
  } else {
    const first = startTimer(initialTimer(c), 1000);
    const twice = startTimer(first, 1100);
    const paused = pauseTimer(first, 1500, c);
    const wait = tickTimer(paused, 2500, c);
    const resumed = startTimer(wait, 3000);
    const ended = tickTimer(first, 1000 + c.seconds * 1000 + 500, c);
    const again = tickTimer(ended, 100000, c);
    rows.push(
      {
        label: "연속 시작",
        expected: t("원래 종료 시각 유지"),
        actual: t(
          twice.deadline === first.deadline
            ? "같은 종료 시각"
            : "종료 시각 변경",
        ),
        pass: twice.deadline === first.deadline,
      },
      {
        label: "멈춤과 재개",
        expected: t("남은 시간을 유지하고 재개"),
        actual: t(
          wait.remaining === paused.remaining &&
            resumed.deadline === 3000 + wait.remaining
            ? "유지 후 재개"
            : "불일치",
        ),
        pass:
          wait.remaining === paused.remaining &&
          resumed.deadline === 3000 + wait.remaining,
      },
      {
        label: "0초와 종료 안내",
        expected: t("{s}초 · 안내 {n}번", { s: 0, n: 1 }),
        actual: t("{s}초 · 안내 {n}번", {
          s: ended.remaining / 1000,
          n: again.announcements,
        }),
        pass: ended.remaining === 0 && again.announcements === 1,
      },
      {
        label: "초기화",
        expected: t("{s}초 · 정지", { s: c.seconds }),
        actual: t("{s}초 · 정지", { s: initialTimer(c).remaining / 1000 }),
        pass:
          initialTimer(c).remaining === c.seconds * 1000 &&
          !initialTimer(c).running,
      },
    );
  }
  return rows.map((r) => ({
    id: uid(),
    label: r.label,
    expected: r.expected,
    actual: r.actual,
    source: "auto",
    status: r.pass ? "pass" : "fail",
    revision,
    at: now(),
  }));
}
export function missionChecks(m: Mission, revision: string): Check[] {
  return m.tests.map((t) => ({
    id: uid(),
    label: t.label,
    expected: t.expected,
    actual: "",
    source: m.id === "story-4" ? "peer" : "self",
    status: "pending",
    revision,
    at: now(),
  }));
}
export function prepareInspection(
  d: Snapshot,
  m: Mission,
  t: Tr = ko,
): Check[] {
  const retained = d.checks.filter(
    (c) => c.revision !== d.revision || c.source !== "auto",
  );
  const currentManual = retained.some(
    (c) => c.revision === d.revision && c.source !== "auto",
  );
  const result = [
    ...retained,
    ...autoChecks(d.config, d.revision, t),
    ...(currentManual ? [] : missionChecks(m, d.revision)),
  ];
  if (result.length > LIMITS.checks)
    throw new AppError(
      "검사 기록은 100개까지예요. 파일로 백업한 뒤 필요 없는 기록을 선택해 삭제해 주세요.",
    );
  return result;
}
