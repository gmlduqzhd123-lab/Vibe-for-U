import type { RuleCondition, RuleConfig } from "./model";
import { LIMITS } from "./model";
import { Field, Icon } from "./ui";
import { useT } from "./i18n";
// 만약 규칙 앱의 설정: 기억하는 값, 버튼, 조건(위에서부터 확인)과 그 밖에 문구를 정한다.
export function RuleSettings({
  config,
  onChange,
}: {
  config: RuleConfig;
  onChange: (c: RuleConfig) => void;
}) {
  const t = useT();
  const edit = (patch: Partial<RuleConfig>) =>
    onChange({ ...config, ...patch });
  const num = (v: string, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  const rules = config.rules;
  const move = (i: number, step: number) => {
    const next = [...rules];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    edit({ rules: next });
  };
  return (
    <div className="settings">
      <div className="form-grid">
        <Field
          label={t("기억하는 값 이름")}
          max={40}
          value={config.variable}
          onChange={(variable) => edit({ variable })}
        />
        <label className="field">
          <span>{t("처음 값")}</span>
          <input
            type="number"
            value={config.start}
            onChange={(e) => edit({ start: num(e.target.value, -1000, 1000) })}
          />
        </label>
        <label className="field">
          <span>{t("가장 작은 값 (비우면 제한 없음)")}</span>
          <input
            type="number"
            value={config.floor ?? ""}
            onChange={(e) =>
              edit({
                floor:
                  e.target.value === ""
                    ? null
                    : num(e.target.value, -1000, 1000),
              })
            }
          />
        </label>
      </div>
      <h4>{t("버튼 (1~4개)")}</h4>
      {config.buttons.map((b, i) => (
        <div className="form-grid" key={i}>
          <Field
            label={t("버튼 {n} 이름", { n: i + 1 })}
            max={LIMITS.short}
            value={b.label}
            onChange={(label) =>
              edit({
                buttons: config.buttons.map((x, j) =>
                  j === i ? { ...x, label } : x,
                ),
              })
            }
          />
          <label className="field">
            <span>{t("버튼 {n}이 바꾸는 값", { n: i + 1 })}</span>
            <input
              type="number"
              value={b.change}
              onChange={(e) =>
                edit({
                  buttons: config.buttons.map((x, j) =>
                    j === i
                      ? { ...x, change: num(e.target.value, -100, 100) }
                      : x,
                  ),
                })
              }
            />
          </label>
          {config.buttons.length > 1 ? (
            <button
              type="button"
              className="danger-text"
              onClick={() =>
                edit({ buttons: config.buttons.filter((_, j) => j !== i) })
              }
            >
              <Icon name="trash" />
              {t("버튼 {n} 삭제", { n: i + 1 })}
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        disabled={config.buttons.length >= 4}
        onClick={() =>
          edit({
            buttons: [...config.buttons, { label: t("새 버튼"), change: 1 }],
          })
        }
      >
        <Icon name="plus" />
        {t("버튼 추가")}
      </button>
      <h4>{t("조건 · 위에서부터 확인하고 처음 맞는 것 하나만 써요")}</h4>
      {rules.map((r, i) => (
        <fieldset className="rule-edit" key={i}>
          <legend>{t("조건 {n}", { n: i + 1 })}</legend>
          <div className="form-grid">
            <label className="field">
              <span>{t("조건 {n} 종류", { n: i + 1 })}</span>
              <select
                value={r.when}
                onChange={(e) =>
                  edit({
                    rules: rules.map((x, j) =>
                      j === i
                        ? { ...x, when: e.target.value as RuleCondition }
                        : x,
                    ),
                  })
                }
              >
                <option value="gte">{t("이상이면 (≥)")}</option>
                <option value="lte">{t("이하이면 (≤)")}</option>
                <option value="eq">{t("같으면 (=)")}</option>
              </select>
            </label>
            <label className="field">
              <span>{t("조건 {n} 값", { n: i + 1 })}</span>
              <input
                type="number"
                value={r.value}
                onChange={(e) =>
                  edit({
                    rules: rules.map((x, j) =>
                      j === i
                        ? { ...x, value: num(e.target.value, -1000, 1000) }
                        : x,
                    ),
                  })
                }
              />
            </label>
          </div>
          <Field
            label={t("조건 {n} 문구", { n: i + 1 })}
            max={LIMITS.short}
            value={r.message}
            onChange={(message) =>
              edit({
                rules: rules.map((x, j) => (j === i ? { ...x, message } : x)),
              })
            }
          />
          <div className="button-row">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              {t("조건 {n} 위로", { n: i + 1 })}
            </button>
            <button
              type="button"
              disabled={i === rules.length - 1}
              onClick={() => move(i, 1)}
            >
              {t("조건 {n} 아래로", { n: i + 1 })}
            </button>
            {rules.length > 1 ? (
              <button
                type="button"
                className="danger-text"
                onClick={() => edit({ rules: rules.filter((_, j) => j !== i) })}
              >
                <Icon name="trash" />
                {t("조건 {n} 삭제", { n: i + 1 })}
              </button>
            ) : null}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={rules.length >= LIMITS.choices}
        onClick={() =>
          edit({
            rules: [
              ...rules,
              { when: "gte", value: 10, message: t("새 조건 문구") },
            ],
          })
        }
      >
        <Icon name="plus" />
        {t("조건 추가")}
      </button>
      <Field
        label={t("그 밖에 문구 (어떤 조건에도 맞지 않을 때)")}
        max={LIMITS.short}
        value={config.otherwise}
        onChange={(otherwise) => edit({ otherwise })}
      />
    </div>
  );
}
