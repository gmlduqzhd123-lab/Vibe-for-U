import { useEffect, useState } from "react";
import {
  answerQuiz,
  initialQuiz,
  nextQuiz,
  resetQuiz,
  initialTimer,
  startTimer,
  tickTimer,
  pauseTimer,
} from "./engines";
import type { Config } from "./model";
import { Icon, Pill } from "./ui";
import { PatternPreview } from "./PatternPreview";
export function Preview({
  config,
  onRun,
}: {
  config: Config;
  onRun: () => void;
}) {
  const [q, setQ] = useState(initialQuiz);
  const [sceneId, setSceneId] = useState(
    config.kind === "story" ? config.start : "",
  );
  const [trail, setTrail] = useState<string[]>([]);
  const [clock, setClock] = useState(() =>
    initialTimer(
      config.kind === "timer"
        ? config
        : { kind: "timer", seconds: 30, showEnd: true, endMessage: "" },
    ),
  );
  useEffect(() => {
    if (config.kind !== "timer" || !clock.running) return;
    const update = () => setClock((s) => tickTimer(s, Date.now(), config));
    const interval = window.setInterval(update, 100);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [clock.running, config]);
  const run = () => onRun();
  if (config.kind === "pattern")
    return <PatternPreview config={config} onRun={onRun} />;
  if (config.kind === "quiz") {
    const question = config.questions[q.index];
    return (
      <div className="preview-inner">
        <div className="preview-caption">
          <Pill tone="green">실행 화면</Pill>
          <span>준비된 퀴즈 템플릿</span>
        </div>
        <div className="quiz-top">
          <span>
            {q.finished
              ? "완료"
              : `문제 ${q.index + 1} / ${config.questions.length}`}
          </span>
          <b data-testid="score">{q.score}점</b>
        </div>
        {q.finished ? (
          <div className="result">
            <Icon name="spark" size={40} />
            <h3>퀴즈를 모두 풀었어요!</h3>
            <p>
              최종 점수 <b>{q.score}점</b>
            </p>
          </div>
        ) : (
          <>
            <h3 className="question">{question.text}</h3>
            <div className="answers">
              {question.choices.map((ch, i) => (
                <button
                  className={q.selected === i ? "selected" : ""}
                  key={i}
                  onClick={() => {
                    run();
                    setQ((s) => answerQuiz(config, s, i));
                  }}
                >
                  <span>{i + 1}</span>
                  {ch}
                  {q.selected === i ? <Icon name="check" size={16} /> : null}
                </button>
              ))}
            </div>
            {q.answered ? (
              <>
                <p role="status" className="feedback">
                  {q.selected === question.correct
                    ? config.correctFeedback
                    : config.wrongFeedback}
                </p>
                <button
                  className="primary full"
                  onClick={() => {
                    run();
                    setQ((s) => nextQuiz(config, s));
                  }}
                >
                  {q.index === config.questions.length - 1
                    ? "결과 보기"
                    : "다음 문제"}{" "}
                  <Icon name="arrow" />
                </button>
              </>
            ) : (
              <p className="muted small">답이라고 생각하는 것을 눌러 보세요.</p>
            )}
          </>
        )}
        <button
          className="text-button"
          onClick={() => {
            run();
            setQ((s) => resetQuiz(config, s));
          }}
        >
          ↺ 다시 시작
        </button>
        <details className="trace" open>
          <summary>동작 설명 · 지금 앱이 기억하는 값</summary>
          <dl>
            <div>
              <dt>점수</dt>
              <dd>{q.score}</dd>
            </div>
            <div>
              <dt>문제 번호</dt>
              <dd>{q.index + 1}</dd>
            </div>
            <div>
              <dt>이미 답함</dt>
              <dd>{q.answered ? "예" : "아니요"}</dd>
            </div>
          </dl>
          <p>{q.event}</p>
          <small>
            채점 규칙:{" "}
            {config.scoring === "once"
              ? "아직 답하지 않았을 때만 점수 반영"
              : "누를 때마다 점수 반영 (학습용)"}{" "}
            · 문제당 {config.points}점
          </small>
        </details>
      </div>
    );
  }
  if (config.kind === "story") {
    const scene =
      config.scenes.find((s) => s.id === sceneId) ??
      config.scenes.find((s) => s.id === config.start)!;
    return (
      <div className="preview-inner">
        <div className="preview-caption">
          <Pill tone="green">실행 화면</Pill>
          <span>준비된 이야기 템플릿</span>
        </div>
        <div className="story-illustration">
          <Icon name="book" size={54} />
          <span>나의 선택, 새로운 장면</span>
        </div>
        {scene.ending ? <Pill tone="orange">이야기의 결말</Pill> : null}
        <h3>{scene.title}</h3>
        <p className="story-text">{scene.text}</p>
        <div className="answers">
          {scene.choices.map((ch, i) => (
            <button
              key={i}
              onClick={() => {
                run();
                setTrail((t) => [
                  ...t.slice(-29),
                  `${scene.title} → ${ch.label}`,
                ]);
                setSceneId(ch.to);
              }}
            >
              {ch.label}
              <Icon name="arrow" size={16} />
            </button>
          ))}
        </div>
        <button
          className="text-button"
          onClick={() => {
            run();
            setSceneId(config.start);
            setTrail([]);
          }}
        >
          ↺ 처음으로 돌아가기
        </button>
        <details className="trace" open>
          <summary>동작 설명 · 장면의 연결</summary>
          <p>선택 → 연결된 장면 ID 확인 → 현재 장면 변경 → 새 장면 표시</p>
          <p>
            현재 장면: <b>{scene.id}</b> · 지나온 길 {trail.length}개
          </p>
          {trail.length ? <small>{trail.join(" / ")}</small> : null}
        </details>
      </div>
    );
  }
  const display = Math.ceil(clock.remaining / 1000);
  return (
    <div className="preview-inner">
      <div className="preview-caption">
        <Pill tone="green">실행 화면</Pill>
        <span>준비된 타이머 템플릿</span>
      </div>
      <div className={`clock ${clock.running ? "running" : ""}`}>
        <Icon name="timer" size={28} />
        <strong data-testid="remaining">
          {String(Math.floor(display / 60)).padStart(2, "0")}:
          {String(display % 60).padStart(2, "0")}
        </strong>
        <span>
          {clock.running
            ? "시간이 흐르고 있어요"
            : clock.ended
              ? "시간 종료"
              : "멈춘 상태"}
        </span>
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={clock.running || clock.remaining === 0}
          onClick={() => {
            run();
            setClock((s) => startTimer(s, Date.now()));
          }}
        >
          <Icon name="play" />
          {clock.remaining === config.seconds * 1000 ? "시작" : "재개"}
        </button>
        <button
          disabled={!clock.running}
          onClick={() => {
            run();
            setClock((s) => pauseTimer(s, Date.now(), config));
          }}
        >
          일시정지
        </button>
        <button
          onClick={() => {
            run();
            setClock(initialTimer(config));
          }}
        >
          초기화
        </button>
      </div>
      <div className="timer-end" role="status">
        {clock.ended && config.showEnd
          ? config.endMessage
          : clock.ended
            ? "종료 안내 표시가 꺼져 있어요."
            : "시작 전 시간을 예상해 보세요."}
      </div>
      <details className="trace" open>
        <summary>동작 설명 · 시간과 상태</summary>
        <p>
          시작 → 실행 중인지 확인 → 종료 시각 기억 → 현재 시각과의 차이 표시
        </p>
        <dl>
          <div>
            <dt>남은 초</dt>
            <dd>{display}</dd>
          </div>
          <div>
            <dt>실행 중</dt>
            <dd>{clock.running ? "예" : "아니요"}</dd>
          </div>
          <div>
            <dt>안내 횟수</dt>
            <dd>{clock.announcements}</dd>
          </div>
        </dl>
        <small>
          멈추면 남은 시간을 기억해요. 화면을 떠나면 실행을 정리하며, 다시 열면
          정지 상태예요.
        </small>
      </details>
    </div>
  );
}
