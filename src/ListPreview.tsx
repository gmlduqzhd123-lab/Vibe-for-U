import "./late.css";
import { RunHistory, useRunHistory } from "./runHistory";
import { SpeakButton } from "./Speak";
import { useState } from "react";
import {
  addList,
  fillList,
  initialList,
  listText,
  removeList,
  resetList,
} from "./engines";
import type { ListConfig } from "./model";
import { Pill } from "./ui";
import { useT } from "./i18n";
// 목록 앱의 실행 화면: 낱말을 누르면 목록 맨 뒤에 들어가고, 목록은 순서와 개수를 기억한다.
export function ListPreview({
  config,
  onRun,
}: {
  config: ListConfig;
  onRun: () => void;
}) {
  const t = useT();
  const [s, setS] = useState(() => initialList(t));
  const [note, setNote] = useState("");
  const history = useRunHistory();
  const act = (label: string, next: typeof s, message = "") => {
    onRun();
    setS(next);
    setNote(message);
    history.record({
      label,
      state: `${t("{n}개", { n: s.list.length })} → ${t("{n}개", { n: next.list.length })}`,
      event: next.event,
    });
  };
  const add = (i: number) => {
    const next = addList(config, s, i, t);
    const item = config.items[i];
    act(
      t("「{item}」 넣기", { item }),
      next,
      next.list !== s.list
        ? ""
        : s.list.length >= config.max
          ? config.fullMessage
          : t("「{item}」은 이미 목록에 있어요.", { item }),
    );
  };
  const count = t("{n}개 / 가장 많이 {m}개", {
    n: s.list.length,
    m: config.max,
  });
  return (
    <div className="preview-inner list-preview">
      <div className="preview-caption">
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 목록 만들기 템플릿")}</span>
      </div>
      <div className="rule-value">
        <span>{config.name}</span>
        <strong data-testid="list-count">{count}</strong>
      </div>
      <p className="rule-message" role="status">
        {note}
      </p>
      <div className="button-row">
        {config.items.map((item, i) => (
          <button key={i} className="primary" onClick={() => add(i)}>
            {item}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button
          onClick={() => {
            const next = fillList(config, s, t);
            act(
              t("모두 차례로 넣기"),
              next,
              next.list.length >= config.max &&
                config.items.some((x) => !next.list.includes(x))
                ? config.fullMessage
                : "",
            );
          }}
        >
          {t("모두 차례로 넣기")}
        </button>
        <button
          disabled={!s.list.length}
          onClick={() => act(t("하나 빼기"), removeList(config, s, t))}
        >
          {t("하나 빼기")}
        </button>
        <button
          className="text-button"
          onClick={() => act(t("↺ 처음으로"), resetList(t))}
        >
          {t("↺ 처음으로")}
        </button>
      </div>
      {s.list.length ? (
        <ol className="list-items" aria-label={config.name}>
          {s.list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <p className="list-empty">{t("빈 목록")}</p>
      )}
      <SpeakButton
        text={`${config.name}. ${count}. ${listText(s.list, t)}`}
        label={t("결과 듣기")}
      />
      <RunHistory history={history} />
      <details className="trace" open>
        <summary>{t("동작 설명 · 지금 앱이 기억하는 값")}</summary>
        <p>
          {t(
            config.remove === "first"
              ? "낱말은 맨 뒤에 들어가고, 하나 빼기는 맨 앞(먼저 넣은 것)을 꺼내요."
              : "낱말은 맨 뒤에 들어가고, 하나 빼기는 맨 뒤(나중에 넣은 것)를 꺼내요.",
          )}
        </p>
        <p>{t("앱이 기억하는 목록: {list}", { list: listText(s.list, t) })}</p>
        <p>{s.event}</p>
      </details>
    </div>
  );
}
