import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { useState } from "react";
import { initialRule, pressRule, resetRule, ruleMessage } from "./engines";
import type { RuleConfig } from "./model";
import { Pill } from "./ui";
import { useT } from "./i18n";
// 만약 규칙 앱의 실행 화면: 버튼으로 값을 바꾸면 위에서부터 처음 맞는 조건의 문구가 나온다.
const conditionText = {
  gte: "{v} 이상이면",
  lte: "{v} 이하이면",
  eq: "{v}과 같으면",
};
export function RulePreview({
  config,
  onRun,
}: {
  config: RuleConfig;
  onRun: () => void;
}) {
  const t = useT();
  const [s, setS] = useState(() => initialRule(config, t));
  const hit = ruleMessage(config, s.value);
  const history = useRunHistory();
  return (
    <div className="preview-inner rule-preview">
      <div className="preview-caption">
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 만약 규칙 템플릿")}</span>
      </div>
      <div className="rule-value">
        <span>{config.variable}</span>
        <strong data-testid="rule-value">{s.value}</strong>
      </div>
      <p className="rule-message" role="status">
        {hit.message}
      </p>
      <SpeakButton
        text={`${config.variable} ${s.value}. ${hit.message}`}
        label={t("결과 듣기")}
      />
      <div className="button-row">
        {config.buttons.map((b, i) => (
          <button
            key={i}
            className={b.change > 0 ? "primary" : ""}
            onClick={() => {
              onRun();
              setS((p) => {
                const next = pressRule(config, p, i, t);
                history.record({
                  label: b.label,
                  state: `${config.variable} ${p.value} → ${next.value}`,
                  event: next.event,
                });
                return next;
              });
            }}
          >
            {b.label}
          </button>
        ))}
        <button
          className="text-button"
          onClick={() => {
            onRun();
            history.record({
              label: t("↺ 처음으로"),
              state: `${config.variable} ${s.value} → ${config.start}`,
              event: t("처음으로 → {name} {v}", {
                name: config.variable,
                v: config.start,
              }),
            });
            setS(resetRule(config, t));
          }}
        >
          {t("↺ 처음으로")}
        </button>
      </div>
      <RunHistory history={history} />
      <details className="trace" open>
        <summary>{t("동작 설명 · 지금 앱이 기억하는 값")}</summary>
        <ol className="rule-list">
          {config.rules.map((r, i) => (
            <li key={i} className={i === hit.index ? "hit" : ""}>
              {t("만약 {cond} → 「{msg}」", {
                cond: t(conditionText[r.when], { v: r.value }),
                msg: r.message,
              })}
              {i === hit.index ? ` ← ${t("지금 맞는 조건")}` : ""}
            </li>
          ))}
          <li className={hit.index < 0 ? "hit" : ""}>
            {t("그 밖에 → 「{msg}」", { msg: config.otherwise })}
            {hit.index < 0 ? ` ← ${t("지금 맞는 조건")}` : ""}
          </li>
        </ol>
        <p>{s.event}</p>
      </details>
    </div>
  );
}
