import "./late.css";
import { createContext, useContext, useState } from "react";
import { useT } from "./i18n";
import { RUN_LOG_LIMIT } from "./model";
// 실행 기록 되감기: 실행 화면에서 누른 것과 그때 앱이 기억한 값을 순서대로 남기고 한 칸씩 되감아 본다.
// 기록은 화면에만 두고 작품에는 저장하지 않는다(실행은 학생이 고친 것이 아니라서 되돌리기에도 넣지 않는다).
export type RunStep = { label: string; state: string; event: string };
// 작업실의 실행 화면에서만 "증거로 남기기"를 보인다(교사 미리보기·버전 보기에서는 없음).
export const RunEvidenceContext = createContext<
  ((steps: RunStep[]) => void) | null
>(null);
const LIMIT = 60;
export function useRunHistory() {
  const [steps, setSteps] = useState<RunStep[]>([]);
  // 보고 있는 칸(마지막이면 null = 지금)
  const [at, setAt] = useState<number | null>(null);
  const record = (s: RunStep) => {
    setSteps((p) => [...p, s].slice(-LIMIT));
    setAt(null);
  };
  const reset = () => {
    setSteps([]);
    setAt(null);
  };
  return { steps, at, setAt, record, reset };
}
// 화면 낭독기 알림: 누를 때마다 무슨 일이 일어났는지 읽어 준다.
// 알림 칸은 처음부터 화면에 있어야 바뀐 글이 읽히므로(나중에 끼워 넣은 칸은 읽히지 않을 수 있다) 늘 그려 둔다.
// 눈에 보이는 상태 칸이 늘 있는 실행 화면(규칙·분류·반복·타이머·패턴)에는 쓰지 않는다.
export function RunAnnouncer({
  history,
}: {
  history: ReturnType<typeof useRunHistory>;
}) {
  const last = history.steps[history.steps.length - 1];
  return (
    <p className="sr-only" role="status" data-testid="run-announcer">
      {last ? `${last.label}. ${last.state}. ${last.event}` : ""}
    </p>
  );
}
export function RunHistory({
  history,
}: {
  history: ReturnType<typeof useRunHistory>;
}) {
  const t = useT();
  const save = useContext(RunEvidenceContext);
  const { steps, at, setAt } = history;
  if (!steps.length) return null;
  const i = at ?? steps.length - 1;
  const s = steps[i];
  return (
    <details className="run-history" open>
      <summary>
        {t("실행 기록 되감기 · {n}번 눌렀어요", { n: steps.length })}
      </summary>
      <div className="run-history-bar">
        <button
          type="button"
          onClick={() => setAt(Math.max(0, i - 1))}
          disabled={i === 0}
          aria-label={t("한 칸 앞으로 되감기")}
        >
          ◀
        </button>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={i}
          aria-label={t("실행 기록 위치")}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAt(v === steps.length - 1 ? null : v);
          }}
        />
        <button
          type="button"
          onClick={() => setAt(i + 1 >= steps.length - 1 ? null : i + 1)}
          disabled={i >= steps.length - 1}
          aria-label={t("한 칸 뒤로")}
        >
          ▶
        </button>
        <span className="small">
          {i + 1} / {steps.length}
        </span>
      </div>
      <p className="run-history-step" aria-live="polite">
        <b>{s.label}</b> → {s.state}
        <br />
        <small>{s.event}</small>
      </p>
      {at !== null ? (
        <p className="small muted">
          {t("지난 기록을 보고 있어요. 실행 화면은 지금 값을 보여 줘요.")}
        </p>
      ) : null}
      {save ? (
        <button type="button" onClick={() => save(steps)}>
          {t("이 기록을 증거로 남기기 (최근 {n}개)", {
            n: Math.min(steps.length, RUN_LOG_LIMIT),
          })}
        </button>
      ) : null}
    </details>
  );
}
