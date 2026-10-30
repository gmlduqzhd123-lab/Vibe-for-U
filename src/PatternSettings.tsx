import { cell, dirNames } from "./engines";
import type { Direction, PatternConfig } from "./model";
import { LIMITS } from "./model";
import { Icon } from "./ui";
import { useT } from "./i18n";
const clamp = (v: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(Number(v)) || min));
export function PatternSettings({
  config,
  onChange,
}: {
  config: PatternConfig;
  onChange: (c: PatternConfig) => void;
}) {
  const t = useT();
  const edit = (patch: Partial<PatternConfig>) =>
    onChange({ ...config, ...patch });
  const setCommand = (
    i: number,
    patch: Partial<PatternConfig["commands"][0]>,
  ) =>
    edit({
      commands: config.commands.map((m, j) =>
        j === i ? { ...m, ...patch } : m,
      ),
    });
  return (
    <div className="settings">
      <div className="form-grid">
        <label className="field">
          <span>
            {t("판 크기 ({a}~{b}칸)", {
              a: LIMITS.boardMin,
              b: LIMITS.boardMax,
            })}
          </span>
          <input
            type="number"
            min={LIMITS.boardMin}
            max={LIMITS.boardMax}
            value={config.size}
            onChange={(e) => {
              const size = clamp(
                e.target.value,
                LIMITS.boardMin,
                LIMITS.boardMax,
              );
              // 작아진 판 밖의 목표 칸은 지운다.
              edit({
                size,
                target: config.target.filter((t) =>
                  t.split(",").every((n) => Number(n) < size),
                ),
              });
            }}
          />
        </label>
        <label className="field">
          <span>{t("명령 묶음 반복 (1~{n}번)", { n: LIMITS.repeat })}</span>
          <input
            type="number"
            min={1}
            max={LIMITS.repeat}
            value={config.repeat}
            onChange={(e) =>
              edit({ repeat: clamp(e.target.value, 1, LIMITS.repeat) })
            }
          />
        </label>
      </div>
      <label className="field">
        <span>{t("판 가장자리 규칙")}</span>
        <select
          value={config.edge}
          onChange={(e) => edit({ edge: e.target.value as "stop" | "wrap" })}
        >
          <option value="stop">{t("가장자리에서 멈추기 (정상 규칙)")}</option>
          <option value="wrap">{t("반대편으로 넘어가기 (학습용 규칙)")}</option>
        </select>
      </label>
      <label className="field">
        <span>
          {t("조건 규칙 · 만약 다음 칸이 막혀 있으면 (판 끝·이미 칠한 칸)")}
        </span>
        <select
          value={config.turn ?? "none"}
          onChange={(e) => edit({ turn: e.target.value as "none" | "right" })}
        >
          <option value="none">{t("조건 없음 (가장자리 규칙을 따름)")}</option>
          <option value="right">{t("오른쪽으로 돌아서 계속 가기")}</option>
        </select>
      </label>
      <h4>{t("명령 묶음 · 위에서부터 차례대로")}</h4>
      <ol className="command-list">
        {config.commands.map((m, i) => (
          <li key={i}>
            <label className="field">
              <span>{t("명령 {n} 방향", { n: i + 1 })}</span>
              <select
                value={m.dir}
                onChange={(e) =>
                  setCommand(i, { dir: e.target.value as Direction })
                }
              >
                {(Object.keys(dirNames) as Direction[]).map((d) => (
                  <option key={d} value={d}>
                    {t(dirNames[d])}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("명령 {n} 칸 수", { n: i + 1 })}</span>
              <input
                type="number"
                min={1}
                max={LIMITS.stepCount}
                value={m.count}
                onChange={(e) =>
                  setCommand(i, {
                    count: clamp(e.target.value, 1, LIMITS.stepCount),
                  })
                }
              />
            </label>
            <button
              className="danger-text"
              disabled={config.commands.length <= 1}
              onClick={() =>
                edit({ commands: config.commands.filter((_, j) => j !== i) })
              }
            >
              {t("명령 {n} 삭제", { n: i + 1 })}
            </button>
          </li>
        ))}
      </ol>
      <button
        className="subtle"
        disabled={config.commands.length >= LIMITS.commands}
        onClick={() =>
          edit({ commands: [...config.commands, { dir: "right", count: 1 }] })
        }
      >
        <Icon name="plus" />
        {t("명령 추가")}
      </button>
      <h4>{t("목표 모양 · 칸을 눌러 넣고 빼요")}</h4>
      <div
        className="pattern-board target-editor"
        role="group"
        aria-label={t("목표 칸 고르기")}
        style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
      >
        {Array.from({ length: config.size * config.size }, (_, i) => {
          const id = cell(i % config.size, Math.floor(i / config.size));
          const on = config.target.includes(id);
          return (
            <button
              key={id}
              aria-pressed={on}
              aria-label={t("목표 칸 {id}", { id })}
              className={on ? "target painted" : ""}
              disabled={on && config.target.length <= 1}
              onClick={() =>
                edit({
                  target: on
                    ? config.target.filter((t) => t !== id)
                    : [...config.target, id],
                })
              }
            />
          );
        })}
      </div>
      <small>
        {t(
          "명령은 {n}개까지, 한 명령은 {k}칸까지예요. 칸 이름은 (가로, 세로)이고 왼쪽 위가 (0,0)이에요.",
          { n: LIMITS.commands, k: LIMITS.stepCount },
        )}
      </small>
    </div>
  );
}
