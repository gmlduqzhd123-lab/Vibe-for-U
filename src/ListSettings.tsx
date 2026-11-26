import "./late.css";
import type { ListConfig } from "./model";
import { LIMITS } from "./model";
import { Field } from "./ui";
import { useT } from "./i18n";
// 목록 앱의 설정: 목록 이름, 넣을 낱말, 같은 낱말 규칙, 가장 많은 개수, 빼는 곳.
export function ListSettings({
  config,
  onChange,
}: {
  config: ListConfig;
  onChange: (c: ListConfig) => void;
}) {
  const t = useT();
  const edit = (patch: Partial<ListConfig>) =>
    onChange({ ...config, ...patch });
  return (
    <div className="settings">
      <div className="form-grid">
        <Field
          label={t("목록 이름")}
          max={40}
          value={config.name}
          onChange={(name) => edit({ name })}
        />
        <label className="field">
          <span>{t("가장 많은 개수 (1~12)")}</span>
          <input
            type="number"
            min={1}
            max={12}
            value={config.max}
            onChange={(e) =>
              edit({
                max: Math.max(
                  1,
                  Math.min(12, Math.round(Number(e.target.value) || 1)),
                ),
              })
            }
          />
        </label>
        <label className="field">
          <span>{t("같은 낱말을 또 넣으면")}</span>
          <select
            value={config.duplicate}
            onChange={(e) =>
              edit({ duplicate: e.target.value as ListConfig["duplicate"] })
            }
          >
            <option value="block">{t("넣지 않기 (정상 규칙)")}</option>
            <option value="allow">{t("또 넣기 (학습용 규칙)")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("하나 빼기가 꺼내는 곳")}</span>
          <select
            value={config.remove}
            onChange={(e) =>
              edit({ remove: e.target.value as ListConfig["remove"] })
            }
          >
            <option value="first">{t("맨 앞 (먼저 넣은 것)")}</option>
            <option value="last">{t("맨 뒤 (나중에 넣은 것)")}</option>
          </select>
        </label>
      </div>
      <details className="settings-group" open>
        <summary>{t("낱말 {n}개 고치기", { n: config.items.length })}</summary>
        {config.items.map((item, i) => (
          <div className="list-item-edit" key={i}>
            <Field
              label={t("낱말 {n}", { n: i + 1 })}
              max={40}
              value={item}
              onChange={(v) =>
                edit({ items: config.items.map((x, k) => (k === i ? v : x)) })
              }
            />
            <button
              className="text-button"
              disabled={config.items.length <= 1}
              aria-label={t("낱말 {n} 지우기", { n: i + 1 })}
              onClick={() =>
                edit({ items: config.items.filter((_, k) => k !== i) })
              }
            >
              {t("지우기")}
            </button>
          </div>
        ))}
        <button
          disabled={config.items.length >= 8}
          onClick={() =>
            edit({
              items: [
                ...config.items,
                t("낱말 {n}", { n: config.items.length + 1 }),
              ],
            })
          }
        >
          {t("+ 낱말 추가")}
        </button>
      </details>
      <Field
        label={t("가득 찼을 때 문구")}
        max={LIMITS.short}
        value={config.fullMessage}
        onChange={(fullMessage) => edit({ fullMessage })}
      />
      <small>{t("낱말은 8개까지 만들 수 있어요.")}</small>
    </div>
  );
}
