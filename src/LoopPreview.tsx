import "./late.css";
import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { useState } from "react";
import {
  initialLoop,
  loopRounds,
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
  const total = loopRounds(config);
  const done = s.round >= total;
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
        <p>{s.event}</p>
      </details>
    </div>
  );
}
