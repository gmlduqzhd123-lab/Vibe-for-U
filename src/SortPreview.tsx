import "./late.css";
import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { useState } from "react";
import {
  binCondition,
  binName,
  cardValues,
  initialSort,
  resetSort,
  runSort,
  stepSort,
} from "./engines";
import type { SortConfig } from "./model";
import { Pill } from "./ui";
import { useT } from "./i18n";
// 분류 앱의 실행 화면: 카드를 한 장씩(또는 모두) 넣으면 위에서부터 처음 맞는 바구니에 들어간다.
export function SortPreview({
  config,
  onRun,
}: {
  config: SortConfig;
  onRun: () => void;
}) {
  const t = useT();
  const [s, setS] = useState(() => initialSort(t));
  const history = useRunHistory();
  const done = s.placed.length >= config.cards.length;
  const next = config.cards[s.placed.length];
  const record = (label: string, n: typeof s) =>
    history.record({
      label,
      state: t("넣은 카드 {n}장 / {m}장", {
        n: n.placed.length,
        m: config.cards.length,
      }),
      event: n.event,
    });
  // 바구니마다 들어간 카드. 마지막 칸(-1)은 나머지 바구니다.
  const bins = [...config.bins.map((_, i) => i), -1].map((i) => ({
    i,
    name: binName(config, i),
    cards: s.placed.flatMap((b, k) => (b === i ? [config.cards[k]] : [])),
  }));
  return (
    <div className="preview-inner sort-preview">
      <div className="preview-caption">
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 분류 템플릿")}</span>
      </div>
      <p className="sort-next" role="status">
        {next
          ? t("다음 카드: 「{card}」 {what}", {
              card: next.label,
              what: cardValues(config, next),
            })
          : t("카드를 모두 넣었어요.")}
      </p>
      <div className="button-row">
        <button
          className="primary"
          disabled={done}
          onClick={() => {
            onRun();
            const n = stepSort(config, s, t);
            setS(n);
            record(t("한 장 넣기"), n);
          }}
        >
          {t("한 장 넣기")}
        </button>
        <button
          disabled={done}
          onClick={() => {
            onRun();
            const n = runSort(config, s, t);
            setS(n);
            record(t("모두 넣기"), n);
          }}
        >
          {t("모두 넣기")}
        </button>
        <button
          className="text-button"
          onClick={() => {
            onRun();
            const n = resetSort(t);
            setS(n);
            record(t("↺ 처음으로"), n);
          }}
        >
          {t("↺ 처음으로")}
        </button>
      </div>
      <ul className="sort-bins" aria-label={t("바구니")}>
        {bins.map((b) => (
          <li key={b.i} className={b.i < 0 ? "rest" : ""}>
            <b>{b.name}</b>
            <small>
              {b.i < 0
                ? t("나머지 · 어떤 조건에도 맞지 않을 때")
                : binCondition(config, config.bins[b.i], t)}
            </small>
            <span className="sort-cards">
              {b.cards.length
                ? b.cards.map((c, k) => <span key={k}>{c.label}</span>)
                : t("비어 있어요")}
            </span>
          </li>
        ))}
      </ul>
      {done ? (
        <SpeakButton
          text={bins
            .map((b) =>
              t("{bin}: {cards}", {
                bin: b.name,
                cards: b.cards.map((c) => c.label).join(", ") || t("없음"),
              }),
            )
            .join(". ")}
          label={t("결과 듣기")}
        />
      ) : null}
      <RunHistory history={history} />
      <details className="trace" open>
        <summary>{t("동작 설명 · 지금 앱이 하는 일")}</summary>
        <ol className="rule-list">
          {config.bins.map((b, i) => (
            <li key={i}>
              {t("만약 {cond} → 「{bin}」 바구니", {
                cond: binCondition(config, b, t),
                bin: b.name,
              })}
            </li>
          ))}
          <li>{t("그 밖에 → 「{bin}」", { bin: config.otherwise })}</li>
        </ol>
        <p>{s.event}</p>
      </details>
    </div>
  );
}
