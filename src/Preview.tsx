import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { RulePreview } from "./RulePreview";
import { SortPreview } from "./SortPreview";
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
import { useT } from "./i18n";
export function Preview({
  config,
  onRun,
}: {
  config: Config;
  onRun: () => void;
}) {
  const t = useT();
  const [q, setQ] = useState(() => initialQuiz(t));
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
  // 실행 기록 되감기: 누른 것과 그때 앱이 기억한 값을 남긴다.
  const history = useRunHistory();
  if (config.kind === "pattern")
    return <PatternPreview config={config} onRun={onRun} />;
  if (config.kind === "rule")
    return <RulePreview config={config} onRun={onRun} />;
  if (config.kind === "sort")
    return <SortPreview config={config} onRun={onRun} />;
  if (config.kind === "quiz") {
    const question = config.questions[q.index];
    return (
      <div className="preview-inner">
        <div className="preview-caption">
          <Pill tone="green">{t("실행 화면")}</Pill>
          <span>{t("준비된 퀴즈 템플릿")}</span>
        </div>
        <div className="quiz-top">
          <span>
            {q.finished
              ? t("완료")
              : t("문제 {i} / {n}", {
                  i: q.index + 1,
                  n: config.questions.length,
                })}
          </span>
          <b data-testid="score">{t("{n}점", { n: q.score })}</b>
        </div>
        {q.finished ? (
          <div className="result">
            <Icon name="spark" size={40} />
            <h3>{t("퀴즈를 모두 풀었어요!")}</h3>
            <p>
              {t("최종 점수")} <b>{q.score}점</b>
            </p>
            <SpeakButton
              text={`${t("퀴즈를 모두 풀었어요!")} ${t("최종 점수")} ${t("{n}점", { n: q.score })}`}
              label={t("결과 듣기")}
            />
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
                    const s = q;
                    const next = answerQuiz(config, s, i, t);
                    setQ(next);
                    history.record({
                      label: t("선택 {n}", { n: i + 1 }),
                      state: t("점수 {a} → {b}", {
                        a: s.score,
                        b: next.score,
                      }),
                      event: next.event,
                    });
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
                <SpeakButton
                  text={`${
                    q.selected === question.correct
                      ? config.correctFeedback
                      : config.wrongFeedback
                  }. ${t("점수 {n}점", { n: q.score })}`}
                  label={t("결과 듣기")}
                />
                <button
                  className="primary full"
                  onClick={() => {
                    run();
                    const s = q;
                    const next = nextQuiz(config, s, t);
                    setQ(next);
                    history.record({
                      label: t(next.finished ? "결과 보기" : "다음 문제"),
                      state: t("문제 {i} · 점수 {n}", {
                        i: next.index + 1,
                        n: next.score,
                      }),
                      event: next.event,
                    });
                  }}
                >
                  {q.index === config.questions.length - 1
                    ? t("결과 보기")
                    : t("다음 문제")}{" "}
                  <Icon name="arrow" />
                </button>
              </>
            ) : (
              <p className="muted small">
                {t("답이라고 생각하는 것을 눌러 보세요.")}
              </p>
            )}
          </>
        )}
        <button
          className="text-button"
          onClick={() => {
            run();
            const s = q;
            const next = resetQuiz(config, s, t);
            setQ(next);
            history.record({
              label: t("↺ 다시 시작"),
              state: t("점수 {a} → {b}", { a: s.score, b: next.score }),
              event: next.event,
            });
          }}
        >
          {t("↺ 다시 시작")}
        </button>
        <RunHistory history={history} />
        <details className="trace" open>
          <summary>{t("동작 설명 · 지금 앱이 기억하는 값")}</summary>
          <dl>
            <div>
              <dt>{t("점수")}</dt>
              <dd>{q.score}</dd>
            </div>
            <div>
              <dt>{t("문제 번호")}</dt>
              <dd>{q.index + 1}</dd>
            </div>
            <div>
              <dt>{t("이미 답함")}</dt>
              <dd>{t(q.answered ? "예" : "아니요")}</dd>
            </div>
          </dl>
          <p>{q.event}</p>
          <small>
            {t("채점 규칙:")}{" "}
            {config.scoring === "once"
              ? t("아직 답하지 않았을 때만 점수 반영")
              : t("누를 때마다 점수 반영 (학습용)")}{" "}
            · {t("문제당 {n}점", { n: config.points })}
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
          <Pill tone="green">{t("실행 화면")}</Pill>
          <span>{t("준비된 이야기 템플릿")}</span>
        </div>
        <div className="story-illustration">
          <Icon name="book" size={54} />
          <span>{t("나의 선택, 새로운 장면")}</span>
        </div>
        {scene.ending ? <Pill tone="orange">{t("이야기의 결말")}</Pill> : null}
        <h3>{scene.title}</h3>
        <p className="story-text">{scene.text}</p>
        <SpeakButton
          text={`${scene.title}. ${scene.text}`}
          label={t("장면 듣기")}
        />
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
                history.record({
                  label: ch.label,
                  state: t("장면 {a} → {b}", { a: scene.id, b: ch.to }),
                  event: t(
                    "선택 → 연결된 장면 ID 확인 → 현재 장면 변경 → 새 장면 표시",
                  ),
                });
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
            history.record({
              label: t("↺ 처음으로 돌아가기"),
              state: t("장면 {a} → {b}", { a: scene.id, b: config.start }),
              event: t("처음 장면으로 돌아감"),
            });
            setSceneId(config.start);
            setTrail([]);
          }}
        >
          {t("↺ 처음으로 돌아가기")}
        </button>
        <RunHistory history={history} />
        <details className="trace" open>
          <summary>{t("동작 설명 · 장면의 연결")}</summary>
          <p>
            {t("선택 → 연결된 장면 ID 확인 → 현재 장면 변경 → 새 장면 표시")}
          </p>
          <p>
            {t("현재 장면:")} <b>{scene.id}</b> ·{" "}
            {t("지나온 길 {n}개", { n: trail.length })}
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
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 타이머 템플릿")}</span>
      </div>
      <div className={`clock ${clock.running ? "running" : ""}`}>
        <Icon name="timer" size={28} />
        <strong data-testid="remaining">
          {String(Math.floor(display / 60)).padStart(2, "0")}:
          {String(display % 60).padStart(2, "0")}
        </strong>
        <span>
          {clock.running
            ? t("시간이 흐르고 있어요")
            : clock.ended
              ? t("시간 종료")
              : t("멈춘 상태")}
        </span>
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={clock.running || clock.remaining === 0}
          onClick={() => {
            run();
            const s = clock;
            const next = startTimer(s, Date.now());
            setClock(next);
            history.record({
              label: t(s.remaining === config.seconds * 1000 ? "시작" : "재개"),
              state: t("남은 시간 {n}초", {
                n: Math.ceil(next.remaining / 1000),
              }),
              event: t("시계가 흐르기 시작함"),
            });
          }}
        >
          <Icon name="play" />
          {t(clock.remaining === config.seconds * 1000 ? "시작" : "재개")}
        </button>
        <button
          disabled={!clock.running}
          onClick={() => {
            run();
            const s = clock;
            const next = pauseTimer(s, Date.now(), config);
            setClock(next);
            history.record({
              label: t("일시정지"),
              state: t("남은 시간 {n}초", {
                n: Math.ceil(next.remaining / 1000),
              }),
              event: t("남은 시간을 기억하고 멈춤"),
            });
          }}
        >
          {t("일시정지")}
        </button>
        <button
          onClick={() => {
            run();
            history.record({
              label: t("초기화"),
              state: t("남은 시간 {n}초", { n: config.seconds }),
              event: t("설정 시간으로 돌아가 정지"),
            });
            setClock(initialTimer(config));
          }}
        >
          {t("초기화")}
        </button>
      </div>
      {clock.ended ? (
        <SpeakButton
          text={
            config.showEnd
              ? config.endMessage
              : t("종료 안내 표시가 꺼져 있어요.")
          }
          label={t("결과 듣기")}
        />
      ) : null}
      <RunHistory history={history} />
      <div className="timer-end" role="status">
        {clock.ended && config.showEnd
          ? config.endMessage
          : clock.ended
            ? t("종료 안내 표시가 꺼져 있어요.")
            : t("시작 전 시간을 예상해 보세요.")}
      </div>
      <details className="trace" open>
        <summary>{t("동작 설명 · 시간과 상태")}</summary>
        <p>
          {t(
            "시작 → 실행 중인지 확인 → 종료 시각 기억 → 현재 시각과의 차이 표시",
          )}
        </p>
        <dl>
          <div>
            <dt>{t("남은 초")}</dt>
            <dd>{display}</dd>
          </div>
          <div>
            <dt>{t("실행 중")}</dt>
            <dd>{t(clock.running ? "예" : "아니요")}</dd>
          </div>
          <div>
            <dt>{t("안내 횟수")}</dt>
            <dd>{clock.announcements}</dd>
          </div>
        </dl>
        <small>
          {t(
            "멈추면 남은 시간을 기억해요. 화면을 떠나면 실행을 정리하며, 다시 열면 정지 상태예요.",
          )}
        </small>
      </details>
    </div>
  );
}
