import { now, uid } from "./model";
import type {
  Check,
  Config,
  QuizConfig,
  StoryConfig,
  TimerConfig,
} from "./model";
export type QuizState = {
  index: number;
  score: number;
  answered: boolean;
  selected: number | null;
  finished: boolean;
  event: string;
};
export const initialQuiz = (): QuizState => ({
  index: 0,
  score: 0,
  answered: false,
  selected: null,
  finished: false,
  event: "아직 답을 고르지 않았어요.",
});
export function answerQuiz(
  c: QuizConfig,
  s: QuizState,
  choice: number,
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
    event: `선택 ${choice + 1} → ${c.scoring === "once" ? "이미 답했는지 확인" : "시도할 때마다 채점"} → 점수 ${s.score} → ${s.score + add} → ${correct ? c.correctFeedback : c.wrongFeedback}`,
  };
}
export function nextQuiz(c: QuizConfig, s: QuizState): QuizState {
  if (!s.answered || s.finished) return s;
  return s.index === c.questions.length - 1
    ? { ...s, finished: true, event: "마지막 문제 확인 → 최종 결과 표시" }
    : {
        ...s,
        index: s.index + 1,
        answered: false,
        selected: null,
        event: "다음 문제 → 문제 번호 1 증가 → 답한 상태 초기화",
      };
}
export function resetQuiz(c: QuizConfig, s: QuizState): QuizState {
  return {
    ...initialQuiz(),
    score: c.resetScore ? 0 : s.score,
    event: `다시 시작 → 문제 번호 1, 답한 상태 비움, 점수 ${c.resetScore ? 0 : s.score}`,
  };
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
export function autoChecks(c: Config, revision: string): Check[] {
  const rows: {
    label: string;
    expected: string;
    actual: string;
    pass: boolean;
  }[] = [];
  if (c.kind === "quiz") {
    let q = initialQuiz();
    for (let i = 0; i < 3; i++) q = answerQuiz(c, q, c.questions[0].correct);
    rows.push({
      label: "같은 정답 세 번",
      expected: `${c.points}점만 반영`,
      actual: `${q.score}점`,
      pass: q.score === c.points,
    });
    const wrong = (c.questions[0].correct + 1) % c.questions[0].choices.length;
    const w = answerQuiz(c, initialQuiz(), wrong);
    rows.push({
      label: "오답 점수",
      expected: "0점",
      actual: `${w.score}점`,
      pass: w.score === 0,
    });
    let all = initialQuiz();
    for (const question of c.questions) {
      all = answerQuiz(c, all, question.correct);
      all = nextQuiz(c, all);
    }
    rows.push({
      label: "마지막 결과",
      expected: `결과 화면, ${c.questions.length * c.points}점`,
      actual: `${all.finished ? "결과 화면" : "문제 화면"}, ${all.score}점`,
      pass: all.finished && all.score === c.questions.length * c.points,
    });
    const r = resetQuiz(c, q);
    rows.push({
      label: "다시 시작 상태",
      expected: "0점 · 1번 문제 · 답하지 않음",
      actual: `${r.score}점 · ${r.index + 1}번 문제 · ${r.answered ? "답함" : "답하지 않음"}`,
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
        expected: "존재하는 장면으로 연결",
        actual: valid ? "모두 유효한 장면" : "없는 장면 발견",
        pass: valid,
      },
      {
        label: "의도한 결말 도달",
        expected: `${c.intendedEndings.length}개 결말에 도달 가능`,
        actual: `${c.intendedEndings.filter((id) => reached.has(id)).length}개 결말에 도달 가능`,
        pass: paths,
      },
      {
        label: "처음 장면",
        expected: "시작 장면이 존재",
        actual: c.scenes.find((s) => s.id === c.start)?.title ?? "없음",
        pass: c.scenes.some((s) => s.id === c.start),
      },
    );
  } else {
    const t = startTimer(initialTimer(c), 1000);
    const twice = startTimer(t, 1100);
    const paused = pauseTimer(t, 1500, c);
    const wait = tickTimer(paused, 2500, c);
    const resumed = startTimer(wait, 3000);
    const ended = tickTimer(t, 1000 + c.seconds * 1000 + 500, c);
    const again = tickTimer(ended, 100000, c);
    rows.push(
      {
        label: "연속 시작",
        expected: "원래 종료 시각 유지",
        actual:
          twice.deadline === t.deadline ? "같은 종료 시각" : "종료 시각 변경",
        pass: twice.deadline === t.deadline,
      },
      {
        label: "멈춤과 재개",
        expected: "남은 시간을 유지하고 재개",
        actual:
          wait.remaining === paused.remaining &&
          resumed.deadline === 3000 + wait.remaining
            ? "유지 후 재개"
            : "불일치",
        pass:
          wait.remaining === paused.remaining &&
          resumed.deadline === 3000 + wait.remaining,
      },
      {
        label: "0초와 종료 안내",
        expected: "0초 · 안내 한 번",
        actual: `${ended.remaining / 1000}초 · 안내 ${again.announcements}번`,
        pass: ended.remaining === 0 && again.announcements === 1,
      },
      {
        label: "초기화",
        expected: `${c.seconds}초 · 정지`,
        actual: `${initialTimer(c).remaining / 1000}초 · 정지`,
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
