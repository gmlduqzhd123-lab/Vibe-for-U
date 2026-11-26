import "./late.css";
import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { useState } from "react";
import {
  initialLoop,
  loopRounds,
  loopStops,
  loopUntil,
  resetLoop,
  runLoop,
  stepLoop,
} from "./engines";
import type { LoopConfig } from "./model";
import { Pill } from "./ui";
import { useT } from "./i18n";
// 반복 계산기의 실행 화면: 한 번 반복할 때마다 값이 같은 만큼 바뀌고, 정한 횟수를 채우면 멈춘다.
export function LoopPreview({
  config,
  onRun,
}: {
  config: LoopConfig;
  onRun: () => void;
}) {
  const t = useT();
  const [s, setS] = useState(() => initialLoop(config, t));
  const history = useRunHistory();
  // 멈춤 조건이 있으면 언제 멈출지 미리 보여 주지 않고, 넘지 않을 가장 많은 횟수만큼 점을 그린다.
  const total = config.until
    ? config.times + (config.count === "extra" ? 1 : 0)
    : loopRounds(config);
  const done = s.round >= total || loopStops(config, s.value);
  const act = (label: string, next: typeof s) => {
    onRun();
    setS(next);
    history.record({
      label,
      state: `${config.variable} ${s.value} → ${next.value}`,
      event: next.event,
    });
  };
  const message = done
    ? config.doneMessage
    : t("{round} {n} / {m}", { round: config.round, n: s.round, m: total });
  return (
    <div className="preview-inner loop-preview">
      <div className="preview-caption">
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 반복 계산기 템플릿")}</span>
      </div>
      <div className="rule-value">
        <span>{config.variable}</span>
        <strong data-testid="loop-value">{s.value}</strong>
      </div>
      <p className="rule-message" role="status">
        {message}
      </p>
      <ol className="loop-dots" aria-label={t("반복한 횟수")}>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={i < s.round ? "on" : ""}>
            <span className="sr-only">
              {t(i < s.round ? "{n}번째 했어요" : "{n}번째 아직", { n: i + 1 })}
            </span>
          </li>
        ))}
      </ol>
      <SpeakButton
        text={`${config.variable} ${s.value}. ${message}`}
        label={t("결과 듣기")}
      />
      <div className="button-row">
        <button
          className="primary"
          disabled={done}
          onClick={() => act(t("한 번 반복"), stepLoop(config, s, t))}
        >
          {t("한 번 반복")}
        </button>
        <button
          disabled={done}
          onClick={() => act(t("끝까지 반복"), runLoop(config, s, t))}
        >
          {t("끝까지 반복")}
        </button>
        <button
          className="text-button"
          onClick={() => act(t("↺ 처음으로"), resetLoop(config, t))}
        >
          {t("↺ 처음으로")}
        </button>
      </div>
      <RunHistory history={history} />
      <details className="trace" open>
        <summary>{t("동작 설명 · 지금 앱이 기억하는 값")}</summary>
        <p>
          {t("{round}마다 {name}이 {change}씩 바뀌어요. {n}번 하면 멈춰요.", {
            round: config.round,
            name: config.variable,
            change: config.change > 0 ? `+${config.change}` : config.change,
            n: total,
          })}
        </p>
        {config.bonus ? (
          <p>
            {t(
              "반복 안에서 확인해요: 만약 {n}의 배수 번째이면 {change}을 더 바꿔요.",
              {
                n: config.bonus.every,
                change:
                  config.bonus.change > 0
                    ? `+${config.bonus.change}`
                    : config.bonus.change,
              },
            )}
          </p>
        ) : null}
        {config.until ? (
          <p>
            {t(
              "반복하기 전에 먼저 확인해요: 만약 {name}이 {cond} 횟수가 남아도 멈춰요.",
              { name: config.variable, cond: loopUntil(config, t) },
            )}
          </p>
        ) : null}
        <p>{s.event}</p>
      </details>
    </div>
  );
}
