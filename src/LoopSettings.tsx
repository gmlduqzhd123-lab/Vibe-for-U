import "./late.css";
import type { LoopConfig, RuleCondition } from "./model";
import { LIMITS } from "./model";
import { Field } from "./ui";
import { useT } from "./i18n";
// 반복 계산기의 설정: 기억하는 값, 처음 값, 한 번에 바뀌는 값, 반복 횟수와 세는 방법, 목표 값.
export function LoopSettings({
  config,
  onChange,
}: {
  config: LoopConfig;
  onChange: (c: LoopConfig) => void;
}) {
  const t = useT();
  const edit = (patch: Partial<LoopConfig>) =>
    onChange({ ...config, ...patch });
  const num = (v: string, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  const number = (
    label: string,
    key: "start" | "change" | "times" | "goal",
    min: number,
    max: number,
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={config[key]}
        onChange={(e) => edit({ [key]: num(e.target.value, min, max) })}
      />
    </label>
  );
  return (
    <div className="settings">
      <div className="form-grid">
        <Field
          label={t("기억하는 값 이름")}
          max={40}
          value={config.variable}
          onChange={(variable) => edit({ variable })}
        />
        <Field
          label={t("한 번 반복의 이름 (예: 일, 바퀴)")}
          max={40}
          value={config.round}
          onChange={(round) => edit({ round })}
        />
        {number(t("처음 값"), "start", -100000, 100000)}
        {number(t("한 번에 바뀌는 값"), "change", -10000, 10000)}
        {number(t("반복 횟수 (1~50)"), "times", 1, 50)}
        <label className="field">
          <span>{t("반복 세는 방법")}</span>
          <select
            value={config.count}
            onChange={(e) =>
              edit({ count: e.target.value as LoopConfig["count"] })
            }
          >
            <option value="exact">{t("정한 횟수만큼 (정상 규칙)")}</option>
            <option value="extra">{t("한 번 더 반복 (학습용 규칙)")}</option>
          </select>
        </label>
        {number(t("목표 값 (반복이 끝났을 때)"), "goal", -1000000, 1000000)}
        <label className="field">
          <span>{t("멈추는 방법")}</span>
          <select
            value={config.until ? config.until.when : "none"}
            onChange={(e) => {
              const when = e.target.value;
              if (when === "none") {
                const rest = { ...config };
                delete rest.until;
                onChange(rest);
              } else
                edit({
                  until: {
                    when: when as RuleCondition,
                    value: config.until?.value ?? config.goal,
                  },
                });
            }}
          >
            <option value="none">{t("횟수를 다 채우면 멈추기")}</option>
            <option value="gte">{t("값이 얼마 이상이면 멈추기")}</option>
            <option value="lte">{t("값이 얼마 이하이면 멈추기")}</option>
            <option value="eq">{t("값이 얼마와 같으면 멈추기")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("반복 안의 조건 (몇 번째마다 더 바꾸기)")}</span>
          <select
            value={config.bonus ? config.bonus.every : 0}
            onChange={(e) => {
              const every = Number(e.target.value);
              if (!every) {
                const rest = { ...config };
                delete rest.bonus;
                onChange(rest);
              } else
                edit({
                  bonus: {
                    every,
                    change: config.bonus?.change ?? config.change,
                  },
                });
            }}
          >
            <option value={0}>{t("없음")}</option>
            {[2, 3, 4, 5, 10].map((n) => (
              <option key={n} value={n}>
                {t("{n}의 배수 번째마다", { n })}
              </option>
            ))}
          </select>
        </label>
        {config.bonus ? (
          <label className="field">
            <span>{t("그때 더 바뀌는 값")}</span>
            <input
              type="number"
              value={config.bonus.change}
              onChange={(e) =>
                edit({
                  bonus: {
                    every: config.bonus!.every,
                    change: num(e.target.value, -10000, 10000),
                  },
                })
              }
            />
          </label>
        ) : null}
        {config.until ? (
          <label className="field">
            <span>{t("멈춤 조건의 값")}</span>
            <input
              type="number"
              value={config.until.value}
              onChange={(e) =>
                edit({
                  until: {
                    when: config.until!.when,
                    value: num(e.target.value, -1000000, 1000000),
                  },
                })
              }
            />
          </label>
        ) : null}
      </div>
      {config.until ? (
        <small>
          {t(
            "멈춤 조건이 있으면 ‘반복 횟수’는 넘지 않을 가장 많은 횟수예요. 조건에 맞으면 그 전에 멈춰요.",
          )}
        </small>
      ) : null}
      <Field
        label={t("끝났을 때 문구")}
        max={LIMITS.short}
        value={config.doneMessage}
        onChange={(doneMessage) => edit({ doneMessage })}
      />
    </div>
  );
}
