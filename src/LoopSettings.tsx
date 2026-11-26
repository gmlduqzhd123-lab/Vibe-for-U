import "./late.css";
import type { LoopConfig } from "./model";
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
      </div>
      <Field
        label={t("끝났을 때 문구")}
        max={LIMITS.short}
        value={config.doneMessage}
        onChange={(doneMessage) => edit({ doneMessage })}
      />
    </div>
  );
}
