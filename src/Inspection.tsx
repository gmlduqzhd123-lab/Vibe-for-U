import { useState } from "react";
import { missionChecks, prepareInspection } from "./engines";
import type { Check, Mission, Snapshot } from "./model";
import { LIMITS, now, uid } from "./model";
import { Field, Icon, Pill } from "./ui";
import { useT } from "./i18n";
function CheckEditor({
  c,
  update,
}: {
  c: Check;
  update: (id: string, patch: Partial<Check>) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(!c.expected.trim() || !c.label.trim());
  return (
    <details
      className="check-edit"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>{t("검사 이름·기대한 결과 바꾸기")}</summary>
      <Field
        max={LIMITS.short}
        label={t("검사 이름")}
        value={c.label}
        onChange={(v) => update(c.id, { label: v, status: "pending" })}
      />
      <Field
        area
        max={LIMITS.checkText}
        label={t("{label} 기대한 결과", { label: c.label })}
        value={c.expected}
        onChange={(v) => update(c.id, { expected: v, status: "pending" })}
      />
    </details>
  );
}
export function Inspection({
  draft: d,
  mission: m,
  onChange,
  message,
  deleteChecks,
}: {
  draft: Snapshot;
  mission: Mission;
  onChange: (checks: Check[]) => void;
  message: (text: string) => void;
  deleteChecks: (ids: string[]) => void;
}) {
  const t = useT();
  const [selected, setSelected] = useState<string[]>([]);
  const current = d.checks.filter((c) => c.revision === d.revision);
  const automatic = current.filter((c) => c.source === "auto");
  const manual = current.filter((c) => c.source !== "auto");
  const observed = manual.filter(
    (c) => c.actual.trim() && c.status !== "pending",
  ).length;
  const add = (rows: Check[]) => {
    if (d.checks.length + rows.length > LIMITS.checks) {
      message(
        t(
          "검사 기록은 100개까지예요. 백업 후 필요 없는 기록을 선택해 삭제해 주세요.",
        ),
      );
      return;
    }
    onChange([...d.checks, ...rows]);
  };
  const update = (id: string, patch: Partial<Check>) =>
    onChange(d.checks.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const renderCard = (c: Check) => (
    <div key={c.id} className={`check-card ${c.status}`}>
      <div className="check-card-head">
        <label className="checkbox">
          <input
            type="checkbox"
            aria-label={t("{label} 기록 선택", { label: c.label })}
            checked={selected.includes(c.id)}
            onChange={(e) =>
              setSelected((s) =>
                e.target.checked ? [...s, c.id] : s.filter((id) => id !== c.id),
              )
            }
          />
          {/* 자동 검사 이름은 앱이 만든 글이라 화면 언어로 보여 준다. */}
          <b>{c.source === "auto" ? t(c.label) : c.label}</b>
        </label>
        <Pill
          tone={
            c.source === "auto"
              ? "purple"
              : c.source === "self"
                ? "green"
                : "orange"
          }
        >
          {t(
            c.source === "auto"
              ? "자동 검사"
              : c.source === "self"
                ? "학습자 직접 확인"
                : "친구·교사 의견",
          )}
        </Pill>
      </div>
      <p>
        <b>{t("기대")}</b>{" "}
        {c.expected || t("어떤 결과여야 하는지 적어 주세요.")}
      </p>
      {c.source === "auto" ? (
        <p>
          <b>{t("실제")}</b> {c.actual} ·{" "}
          <strong>
            {t(
              c.status === "pass"
                ? "통과"
                : c.status === "fail"
                  ? "수정 필요"
                  : "미확인",
            )}
          </strong>
        </p>
      ) : (
        <>
          <CheckEditor c={c} update={update} />
          <Field
            area
            max={LIMITS.checkText}
            label={t("{label} 실제 결과", { label: c.label })}
            value={c.actual}
            placeholder={t("어떤 버튼을 눌렀고, 실제로 무엇이 보였나요?")}
            hint={t("예상과 달라도 실제로 본 내용을 그대로 적어요.")}
            onChange={(v) => update(c.id, { actual: v, status: "pending" })}
          />
          <label className="field">
            <span>{t("{label} 확인 상태", { label: c.label })}</span>
            <select
              value={c.status}
              onChange={(e) => {
                if (
                  e.target.value !== "pending" &&
                  (!c.actual.trim() || !c.expected.trim() || !c.label.trim())
                ) {
                  message(
                    t(
                      "검사 이름, 기대한 결과와 직접 관찰한 실제 결과를 먼저 적어 주세요.",
                    ),
                  );
                  return;
                }
                update(c.id, { status: e.target.value as Check["status"] });
              }}
            >
              <option value="pending">{t("아직 확인하지 않음")}</option>
              <option value="pass">{t("직접 확인함")}</option>
              <option value="fail">{t("수정할 점이 있음")}</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
  return (
    <section className="inspection" aria-label={t("검사 순서와 기록")}>
      <div className="inspection-guide">
        <h3>{t("세 가지만 차례로 해 봐요")}</h3>
        <ol>
          <li>{t("‘자동 검사’로 앱의 규칙을 확인해요.")}</li>
          <li>
            {t("준비된 카드대로 직접 누르고 ‘실제 결과와 확인 상태’를 적어요.")}
          </li>
          <li>
            {t("바꿀 점을 고친 뒤 같은 검사를 다시 하고, ‘이유’를 적어요.")}
          </li>
        </ol>
        <p role="status">
          {automatic.length
            ? t("자동 검사 {p}/{n}개 통과", {
                p: automatic.filter((c) => c.status === "pass").length,
                n: automatic.length,
              })
            : t("자동 검사 전")}{" "}
          · {t("직접 관찰 {o}/{n}개 기록", { o: observed, n: manual.length })}
        </p>
      </div>
      <button
        className="primary"
        onClick={() => {
          try {
            onChange(prepareInspection(d, m));
            setSelected([]);
          } catch (e) {
            message(
              e instanceof Error
                ? e.message
                : t("검사 기록을 준비하지 못했어요."),
            );
          }
        }}
      >
        <Icon name="check" />
        {t("현재 설정 자동 검사")}
      </button>
      <p className="small muted">
        {t(
          "이 버튼으로 직접 확인 카드도 함께 준비해요. 자동 검사는 템플릿의 동작만 확인하며, 직접 봤다는 기록을 대신 쓰지 않아요.",
        )}
      </p>
      {manual.length ? (
        <h3 className="manual-heading">{t("내 눈으로 확인해요")}</h3>
      ) : (
        <div className="empty compact">
          {t(
            "위의 자동 검사 버튼을 누르면 이번 미션의 직접 확인 카드가 나와요.",
          )}
        </div>
      )}
      {manual.map(renderCard)}
      {automatic.length ? (
        <details
          className="auto-results"
          open={automatic.some((c) => c.status === "fail")}
        >
          <summary>
            {t("자동 검사 결과 {n}개", { n: automatic.length })} ·{" "}
            {t(
              automatic.some((c) => c.status === "fail")
                ? "수정할 규칙이 있어요"
                : "모두 통과했어요",
            )}
          </summary>
          {automatic.map(renderCard)}
        </details>
      ) : null}
      <details className="extra-checks">
        <summary>{t("검사 카드·친구 의견 더하기")}</summary>
        <div className="button-row">
          <button
            onClick={() => {
              const rows = missionChecks(m, d.revision).filter(
                (t) =>
                  !current.some(
                    (c) => c.source === t.source && c.label === t.label,
                  ),
              );
              if (rows.length) add(rows);
              else
                message(
                  "이번 미션의 카드는 이미 준비되어 있어요. 실제 결과와 확인 상태를 기록해 주세요.",
                );
            }}
          >
            {t("미션 직접 확인 카드 추가")}
          </button>
          <button
            onClick={() =>
              add([
                {
                  id: uid(),
                  label: t("나의 검사"),
                  expected: "",
                  actual: "",
                  source: "self",
                  status: "pending",
                  revision: d.revision,
                  at: now(),
                },
              ])
            }
          >
            {t("나의 검사 추가")}
          </button>
          <button
            onClick={() =>
              add([
                {
                  id: uid(),
                  label: t("친구·교사 의견"),
                  expected: t("직접 사용한 뒤 의견 듣기"),
                  actual: "",
                  source: "peer",
                  status: "pending",
                  revision: d.revision,
                  at: now(),
                },
              ])
            }
          >
            {t("친구·교사 의견 추가")}
          </button>
        </div>
      </details>
      {d.checks.length > current.length ? (
        <p className="small muted">
          {t(
            "이전 설정의 검사 {n}개는 포트폴리오에 보존돼요. 현재 설정에서는 다시 확인해 주세요.",
            { n: d.checks.length - current.length },
          )}
        </p>
      ) : null}
      {selected.length ? (
        <button
          className="danger-text"
          onClick={() => {
            deleteChecks(selected);
            setSelected([]);
          }}
        >
          {t("선택한 학습 기록 {n}개 삭제", { n: selected.length })}
        </button>
      ) : null}
    </section>
  );
}
