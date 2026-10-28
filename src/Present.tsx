import { useEffect, useState } from "react";
import { lessons } from "./data";
import { initialTimer, pauseTimer, startTimer, tickTimer } from "./engines";
import type { Mission, TimerConfig } from "./model";
import { kindNames } from "./model";
import type { Navigate } from "./Pages";
import { Icon, Pill } from "./ui";
// 교사용 수업 진행 화면: 프로젝터에 미션을 단계별로 크게 보여 주고, 활동 타이머와 짝 역할 교대를 알린다.
export type Slide = { title: string; lines: string[] };
export function slidesFor(m: Mission, lesson?: (typeof lessons)[number]) {
  const slides: Slide[] = [
    {
      title: lesson ? `오늘의 활동 · ${lesson.title}` : "오늘의 미션",
      lines: [m.title, m.goal, ...(lesson ? [`목표: ${lesson.goal}`] : [])],
    },
    { title: "먼저 예상하기", lines: [m.prediction] },
    {
      title: "검사할 것",
      lines: m.tests.map((t) => `${t.label} → ${t.expected}`),
    },
    { title: "이번 수정 과제", lines: [m.task] },
    {
      title: "마무리 질문",
      lines: [m.closing, ...(lesson ? [`“${lesson.question}”`] : [])],
    },
  ];
  return slides;
}
// 활동 시간 중 지난 시간으로 역할 교대 횟수와 다음 교대까지 남은 시간을 계산한다.
export function roleState(elapsedMs: number, everyMs: number) {
  const swaps = Math.floor(elapsedMs / everyMs);
  return { swaps, nextInMs: everyMs - (elapsedMs % everyMs) };
}
const ROLE_EVERY = 10 * 60 * 1000;
const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
export function Present({
  mission: m,
  lessonNumber,
  go,
}: {
  mission: Mission;
  lessonNumber?: number;
  go: Navigate;
}) {
  const lesson = lessonNumber ? lessons[lessonNumber - 1] : undefined;
  const slides = slidesFor(m, lesson);
  const [index, setIndex] = useState(0);
  const [minutes, setMinutes] = useState(lesson ? 30 : 10);
  const config: TimerConfig = {
    kind: "timer",
    seconds: minutes * 60,
    showEnd: true,
    endMessage: "활동 시간이 끝났어요.",
  };
  const [timer, setTimer] = useState(() => initialTimer(config));
  const [roles, setRoles] = useState(true);
  const [seenSwaps, setSeenSwaps] = useState(0);
  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(
      () => setTimer((t) => tickTimer(t, Date.now(), config)),
      250,
    );
    return () => clearInterval(id);
    // config는 분 단위 설정에서만 바뀐다.
  }, [timer.running, minutes]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown")
        setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp")
        setIndex((i) => Math.max(0, i - 1));
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [slides.length]);
  const elapsed = config.seconds * 1000 - timer.remaining;
  const role = roleState(elapsed, ROLE_EVERY);
  const swapDue = roles && role.swaps > seenSwaps && !timer.ended;
  const reset = (min = minutes) => {
    setMinutes(min);
    setTimer(initialTimer({ ...config, seconds: min * 60 }));
    setSeenSwaps(0);
  };
  const slide = slides[index];
  return (
    <section className="present" aria-labelledby="present-title">
      <header className="present-top">
        <div>
          <Pill tone="paper">
            {kindNames[m.kind]} {m.order}
            {lesson ? ` · ${lessonNumber}차시` : ""}
          </Pill>
          <span className="present-count">
            {index + 1} / {slides.length}
          </span>
        </div>
        <div className="button-row">
          <button
            onClick={() =>
              document.fullscreenElement
                ? void document.exitFullscreen()
                : void document.documentElement.requestFullscreen?.()
            }
          >
            전체 화면
          </button>
          <button onClick={() => go("teacher")}>수업 진행 끝내기</button>
        </div>
      </header>
      <article className="present-slide" aria-live="polite">
        <h1 id="present-title">{slide.title}</h1>
        {slide.lines.map((line, i) => (
          <p key={i} className={i === 0 ? "present-lead" : undefined}>
            {line}
          </p>
        ))}
      </article>
      <nav className="present-nav button-row" aria-label="진행 단계">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          aria-keyshortcuts="ArrowLeft"
        >
          ← 이전
        </button>
        {slides.map((s, i) => (
          <button
            key={s.title}
            aria-current={i === index ? "step" : undefined}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
          >
            {i + 1}. {s.title.split(" · ")[0]}
          </button>
        ))}
        <button
          className="primary"
          disabled={index === slides.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          aria-keyshortcuts="ArrowRight"
        >
          다음 →
        </button>
      </nav>
      <aside className="present-timer panel" aria-label="활동 타이머">
        <div className="present-clock" data-testid="present-clock">
          {clock(timer.remaining)}
        </div>
        <div className="button-row">
          {(lesson ? [5, 30, 5] : [5, 10, 20]).map((n, i) => (
            <button key={i} onClick={() => reset(n)}>
              {lesson ? ["도입", "전개", "정리"][i] : ""} {n}분
            </button>
          ))}
        </div>
        <div className="button-row">
          <button
            className="primary"
            disabled={timer.running || timer.remaining === 0}
            onClick={() => setTimer((t) => startTimer(t, Date.now()))}
          >
            <Icon name="play" /> 시작
          </button>
          <button
            disabled={!timer.running}
            onClick={() => setTimer((t) => pauseTimer(t, Date.now(), config))}
          >
            일시정지
          </button>
          <button onClick={() => reset()}>초기화</button>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={roles}
            onChange={(e) => setRoles(e.target.checked)}
          />
          10분마다 짝 역할 교대 알림
        </label>
        {roles ? (
          <p className="present-roles">
            운전자: <b>{role.swaps % 2 ? "짝 B" : "짝 A"}</b> · 관찰자:{" "}
            <b>{role.swaps % 2 ? "짝 A" : "짝 B"}</b>
            <br />
            <small>다음 교대까지 {clock(role.nextInMs)}</small>
          </p>
        ) : null}
        <div role="status" className="present-status">
          {timer.ended ? "활동 시간이 끝났어요. 정리해 볼까요?" : ""}
        </div>
      </aside>
      {swapDue ? (
        <div role="alert" className="present-swap">
          <b>역할을 바꿔요!</b> 이제 운전자는 {role.swaps % 2 ? "짝 B" : "짝 A"}
          , 관찰자는 {role.swaps % 2 ? "짝 A" : "짝 B"}예요.
          <button onClick={() => setSeenSwaps(role.swaps)}>확인</button>
        </div>
      ) : null}
    </section>
  );
}
