import type { RuleCondition, SortConfig } from "./model";
import { LIMITS } from "./model";
import { Field, Icon } from "./ui";
import { useT } from "./i18n";
// 분류 앱의 설정: 비교하는 특징, 카드(값과 들어갈 바구니), 바구니 조건(위에서부터 확인)과 나머지 바구니.
export function SortSettings({
  config,
  onChange,
}: {
  config: SortConfig;
  onChange: (c: SortConfig) => void;
}) {
  const t = useT();
  const edit = (patch: Partial<SortConfig>) =>
    onChange({ ...config, ...patch });
  const num = (v: string) =>
    Math.max(-10000, Math.min(10000, Math.round(Number(v) || 0)));
  const { bins, cards } = config;
  const move = (i: number, step: number) => {
    const next = [...bins];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    edit({ bins: next });
  };
  const setCard = (i: number, patch: Partial<SortConfig["cards"][number]>) =>
    edit({ cards: cards.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const setBin = (i: number, patch: Partial<SortConfig["bins"][number]>) =>
    edit({ bins: bins.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const names = [...bins.map((b) => b.name), config.otherwise];
  return (
    <div className="settings">
      <Field
        label={t("비교하는 특징 이름")}
        max={40}
        value={config.property}
        onChange={(property) => edit({ property })}
      />
      <h4>{t("바구니 · 위에서부터 확인하고 처음 맞는 바구니에 넣어요")}</h4>
      {bins.map((b, i) => (
        <fieldset className="rule-edit" key={i}>
          <legend>{t("바구니 {n}", { n: i + 1 })}</legend>
          <Field
            label={t("바구니 {n} 이름", { n: i + 1 })}
            max={LIMITS.short}
            value={b.name}
            onChange={(name) => setBin(i, { name })}
          />
          <div className="form-grid">
            <label className="field">
              <span>{t("바구니 {n} 조건 종류", { n: i + 1 })}</span>
              <select
                value={b.when}
                onChange={(e) =>
                  setBin(i, { when: e.target.value as RuleCondition })
                }
              >
                <option value="gte">{t("이상이면 (≥)")}</option>
                <option value="lte">{t("이하이면 (≤)")}</option>
                <option value="eq">{t("같으면 (=)")}</option>
              </select>
            </label>
            <label className="field">
              <span>{t("바구니 {n} 기준 값", { n: i + 1 })}</span>
              <input
                type="number"
                value={b.value}
                onChange={(e) => setBin(i, { value: num(e.target.value) })}
              />
            </label>
          </div>
          <div className="button-row">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              {t("바구니 {n} 위로", { n: i + 1 })}
            </button>
            <button
              type="button"
              disabled={i === bins.length - 1}
              onClick={() => move(i, 1)}
            >
              {t("바구니 {n} 아래로", { n: i + 1 })}
            </button>
            {bins.length > 1 ? (
              <button
                type="button"
                className="danger-text"
                onClick={() => edit({ bins: bins.filter((_, j) => j !== i) })}
              >
                <Icon name="trash" />
                {t("바구니 {n} 삭제", { n: i + 1 })}
              </button>
            ) : null}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={bins.length >= LIMITS.choices}
        onClick={() =>
          edit({
            bins: [...bins, { name: t("새 바구니"), when: "gte", value: 10 }],
          })
        }
      >
        <Icon name="plus" />
        {t("바구니 추가")}
      </button>
      <Field
        label={t("나머지 바구니 이름 (어떤 조건에도 맞지 않을 때)")}
        max={LIMITS.short}
        value={config.otherwise}
        onChange={(otherwise) => edit({ otherwise })}
      />
      <h4>{t("카드 (1~12장)")}</h4>
      {cards.map((c, i) => (
        <div className="form-grid sort-card-edit" key={i}>
          <Field
            label={t("카드 {n} 이름", { n: i + 1 })}
            max={LIMITS.short}
            value={c.label}
            onChange={(label) => setCard(i, { label })}
          />
          <label className="field">
            <span>
              {t("카드 {n} {name}", { n: i + 1, name: config.property })}
            </span>
            <input
              type="number"
              value={c.value}
              onChange={(e) => setCard(i, { value: num(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>{t("카드 {n}이 들어갈 바구니", { n: i + 1 })}</span>
            <select
              value={names.includes(c.expect) ? c.expect : ""}
              onChange={(e) => setCard(i, { expect: e.target.value })}
            >
              {names.includes(c.expect) ? null : (
                <option value="">{t("바구니를 골라 주세요")}</option>
              )}
              {names.map((n, k) => (
                <option key={k} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {cards.length > 1 ? (
            <button
              type="button"
              className="danger-text"
              onClick={() => edit({ cards: cards.filter((_, j) => j !== i) })}
            >
              <Icon name="trash" />
              {t("카드 {n} 삭제", { n: i + 1 })}
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        disabled={cards.length >= 12}
        onClick={() =>
          edit({
            cards: [
              ...cards,
              { label: t("새 카드"), value: 0, expect: config.otherwise },
            ],
          })
        }
      >
        <Icon name="plus" />
        {t("카드 추가")}
      </button>
    </div>
  );
}
