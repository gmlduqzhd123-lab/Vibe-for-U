import { useEffect, useState } from "react";
import type { PairLog } from "./model";
import { stageNames } from "./model";
import { Field, Icon } from "./ui";
import { useT } from "./i18n";
// 짝 활동: 조종사(누르는 사람)와 길잡이(설명하는 사람)를 정하고 정해진 시간마다 바꾸자고 알린다.
// 누가 어느 단계에서 조종사였는지를 작품에 남겨, 협업 평가의 근거로 쓴다. 이름 대신 별명을 써도 된다.
export const PAIR_SWAPS = 50;
export function PairPanel({
  pair,
  step,
  onChange,
  message,
  readOnly,
}: {
  pair?: PairLog;
  step: number;
  onChange: (p: PairLog | undefined) => void;
  message: (s: string) => void;
  readOnly: boolean;
}) {
  const t = useT();
  const [minutes, setMinutes] = useState(5);
  const driver = pair?.swaps[pair.swaps.length - 1]?.driver ?? "a";
  const name = (k: "a" | "b") =>
    (pair?.[k] ?? "").trim() || t(k === "a" ? "짝 1" : "짝 2");
  // 교대 알림: 화면에만 알리고 기록은 바꾸지 않는다(바꾸는 것은 학생이 누른다).
  useEffect(() => {
    if (!pair || !minutes || readOnly) return;
    const id = setInterval(
      () =>
        message(
          t("역할을 바꿀 시간이에요. {next} 님이 조종사를 해요.", {
            next: name(driver === "a" ? "b" : "a"),
          }),
        ),
      minutes * 60_000,
    );
    return () => clearInterval(id);
    // 이름이 바뀔 때마다 시계를 다시 맞추지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(pair), minutes, driver, readOnly]);
  const swap = () => {
    if (!pair) return;
    const next: "a" | "b" = driver === "a" ? "b" : "a";
    onChange({
      ...pair,
      swaps: [
        ...pair.swaps,
        { at: new Date().toISOString(), driver: next, stage: step },
      ].slice(-PAIR_SWAPS),
    });
    message(t("이제 {name} 님이 조종사예요.", { name: name(next) }));
  };
  return (
    <details className="pair-panel no-print">
      <summary>
        <Icon name="spark" />{" "}
        {pair
          ? t("짝 활동 · 조종사 {a} · 길잡이 {b}", {
              a: name(driver),
              b: name(driver === "a" ? "b" : "a"),
            })
          : t("짝 활동 · 역할 나누기")}
      </summary>
      <p className="small muted">
        {t(
          "조종사는 누르고 입력해요. 길잡이는 무엇을 할지 말하고 예상해요. 이름 대신 별명을 써도 돼요.",
        )}
      </p>
      <fieldset className="plain-fieldset" disabled={readOnly}>
        {pair ? (
          <>
            <div className="form-grid">
              <Field
                label={t("짝 1 이름이나 별명")}
                max={40}
                value={pair.a}
                onChange={(a) => onChange({ ...pair, a })}
              />
              <Field
                label={t("짝 2 이름이나 별명")}
                max={40}
                value={pair.b}
                onChange={(b) => onChange({ ...pair, b })}
              />
              <label className="field">
                <span>{t("역할 바꾸기 알림")}</span>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  <option value={3}>{t("{n}분마다", { n: 3 })}</option>
                  <option value={5}>{t("{n}분마다", { n: 5 })}</option>
                  <option value={10}>{t("{n}분마다", { n: 10 })}</option>
                  <option value={0}>{t("알림 끄기")}</option>
                </select>
              </label>
            </div>
            <div className="button-row">
              <button
                type="button"
                className="primary"
                disabled={readOnly}
                onClick={swap}
              >
                {t("역할 바꾸기")}
              </button>
              <button
                type="button"
                className="text-button"
                disabled={readOnly}
                onClick={() => onChange(undefined)}
              >
                {t("짝 활동 끝내기")}
              </button>
            </div>
            <p className="small">
              {t("역할을 바꾼 기록 {n}번 · 포트폴리오에 나와요.", {
                n: Math.max(0, pair.swaps.length - 1),
              })}
            </p>
          </>
        ) : (
          <button
            type="button"
            disabled={readOnly}
            onClick={() =>
              onChange({
                a: "",
                b: "",
                swaps: [
                  { at: new Date().toISOString(), driver: "a", stage: step },
                ],
              })
            }
          >
            {t("짝 활동 시작")}
          </button>
        )}
      </fieldset>
    </details>
  );
}
// 포트폴리오에 보이는 짝 활동 기록
export function PairRecord({
  pair,
  time,
}: {
  pair: PairLog;
  time: (s: string) => string;
}) {
  const t = useT();
  const name = (k: "a" | "b") =>
    pair[k].trim() || t(k === "a" ? "짝 1" : "짝 2");
  return (
    <div className="pair-record">
      <h3>{t("짝 활동 기록")}</h3>
      <ol>
        {pair.swaps.map((s, i) => (
          <li key={i}>
            {time(s.at)} · {t(stageNames[s.stage])} ·{" "}
            {t("조종사 {a} · 길잡이 {b}", {
              a: name(s.driver),
              b: name(s.driver === "a" ? "b" : "a"),
            })}
          </li>
        ))}
      </ol>
    </div>
  );
}
