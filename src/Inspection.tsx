import { SpeakButton } from "./Speak";
import { useState } from "react";
import { missionChecks, prepareInspection } from "./engines";
import type { Check, Config, Mission, Snapshot } from "./model";
import { designActions, designedCheck, runDesign } from "./designedCheck";
import type { Param } from "./designedCheck";
import { LIMITS, now, uid } from "./model";
import { Field, Icon, Pill } from "./ui";
import { useT } from "./i18n";
import { errorText } from "./appError";
import { diagnose } from "./diagnose";
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
// 학생이 직접 설계하는 검사: 어떻게 누를지와 예상 결과를 적으면 앱이 대신 눌러 보고 비교해 카드로 남긴다.
function DesignCheck({
  config,
  revision,
  add,
  message,
}: {
  config: Config;
  revision: string;
  add: (c: Check) => void;
  message: (text: string) => void;
}) {
  const t = useT();
  const actions = designActions(config, t);
  const [action, setAction] = useState(actions[0]?.id ?? "");
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [expected, setExpected] = useState("");
  const chosen = actions.find((x) => x.id === action) ?? actions[0];
  if (!chosen) return null;
  const preview = runDesign(config, { action: chosen.id, a, b, expected }, t);
  const numberField = (p: Param) => (
    <label className="field" key={p.key}>
      <span>{p.label}</span>
      <input
        type="number"
        min={p.min}
        max={p.max}
        value={p.key === "a" ? a : b}
        onChange={(e) =>
          (p.key === "a" ? setA : setB)(Number(e.target.value) || p.min)
        }
      />
    </label>
  );
  return (
    <details className="extra-checks design-check">
      <summary>{t("내가 설계한 검사 · 앱에게 실험 시키기")}</summary>
      <p className="small muted">
        {t(
          "‘이렇게 누르면 이런 결과가 나올 거야’를 적어요. 앱이 대신 눌러 본 결과와 비교해 ‘학습자 직접 확인’ 카드로 남겨요.",
        )}
      </p>
      <label className="field">
        <span>{t("어떻게 눌러 볼까요?")}</span>
        <select
          value={chosen.id}
          onChange={(e) => {
            setAction(e.target.value);
            setA(1);
            setB(1);
          }}
        >
          {actions.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label.replace(/\{a\}|\{b\}/g, "□")}
            </option>
          ))}
        </select>
      </label>
      <div className="design-params">{chosen.params.map(numberField)}</div>
      <Field
        label={t("예상 결과 (숫자나 문구)")}
        max={LIMITS.checkText}
        value={expected}
        placeholder={t("예: 점수 2")}
        hint={
          preview
            ? t("실험할 것: {label}", { label: preview.label })
            : undefined
        }
        onChange={setExpected}
      />
      <button
        type="button"
        onClick={() => {
          if (!expected.trim()) {
            message(t("예상 결과를 먼저 적어 주세요."));
            return;
          }
          const c = designedCheck(
            config,
            { action: chosen.id, a, b, expected },
            revision,
            t,
          );
          if (!c) return;
          add(c);
          setExpected("");
          message(
            t(
              c.status === "pass"
                ? "예상대로였어요! 카드에 기록했어요."
                : "예상과 달랐어요. 왜 다른지 생각해 보고 카드에 적어요.",
            ),
          );
        }}
      >
        <Icon name="check" />
        {t("실험하고 기록하기")}
      </button>
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
  const findings = diagnose(d.config);
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
            onChange(prepareInspection(d, m, t));
            setSelected([]);
          } catch (e) {
            message(errorText(e, t, t("검사 기록을 준비하지 못했어요.")));
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
          <SpeakButton
            text={[
              t(
                automatic.some((c) => c.status === "fail")
                  ? "수정할 규칙이 있어요"
                  : "모두 통과했어요",
              ),
              ...automatic.map(
                (c) =>
                  `${t(c.label)}: ${t(c.status === "pass" ? "통과" : "수정 필요")}. ${c.actual}`,
              ),
            ].join(". ")}
            label={t("자동 검사 결과 듣기")}
          />
          {automatic.map(renderCard)}
        </details>
      ) : null}
      {automatic.some((c) => c.status === "fail") && findings.length ? (
        <section className="smart-hints" aria-labelledby="smart-hints-title">
          <h3 id="smart-hints-title">{t("앱이 찾은 문제와 맞춤 힌트")}</h3>
          <ul>
            {findings.map((f) => (
              <li key={f.id}>
                <b>{t(f.problem, f.vars)}</b>
                <details>
                  <summary>{t("힌트 보기")}</summary>
                  <p>
                    {t(
                      f.hint,
                      f.vars && {
                        ...f.vars,
                        ...(f.vars.dir ? { dir: t(String(f.vars.dir)) } : {}),
                      },
                    )}
                  </p>
                  <SpeakButton
                    text={`${t(f.problem, f.vars)}. ${t(
                      f.hint,
                      f.vars && {
                        ...f.vars,
                        ...(f.vars.dir ? { dir: t(String(f.vars.dir)) } : {}),
                      },
                    )}`}
                    label={t("힌트 듣기")}
                  />
                </details>
              </li>
            ))}
          </ul>
          <p className="small muted">
            {t(
              "규칙으로 찾은 힌트예요. 고친 뒤에는 ‘현재 설정 자동 검사’를 다시 눌러 확인하고, 직접 눌러 본 결과도 기록해요.",
            )}
          </p>
        </section>
      ) : null}
      <DesignCheck
        config={d.config}
        revision={d.revision}
        add={(c) => add([c])}
        message={message}
      />
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
