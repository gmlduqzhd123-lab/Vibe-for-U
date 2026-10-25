import { useEffect, useRef, useState } from "react";
import { Inspection } from "./Inspection";
import { configSummary, updatePrediction } from "./learning";
import {
  arrangePrompt,
  correctionPrompt,
  stageDone,
  aiStatus,
  uid,
  LIMITS,
} from "./model";
import type { Work, Snapshot, Mode, Mission, Version } from "./model";
import type { Navigate } from "./Pages";
import { Field, Hint, Icon, Pill } from "./ui";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
import { LearningWords } from "./Welcome";
export const stageNames = [
  "목표 정하기",
  "요청 작성하기",
  "예상하고 실행",
  "검사하고 수정",
  "설명하고 저장",
];
type Props = {
  work: Work;
  mission: Mission;
  step: number;
  mode: Mode;
  go: Navigate;
  edit: (fn: (d: Snapshot) => Snapshot) => void;
  copy: (text: string) => void;
  message: (s: string) => void;
  saveVersion: (label: string) => void;
  restore: (v: Version) => void;
  exportWork: () => void;
  deleteChecks: (ids: string[]) => void;
  deleteVersion: (v: Version) => void;
};
export function Workspace({
  work: w,
  mission: m,
  step,
  mode,
  go,
  edit,
  copy,
  message,
  saveVersion,
  restore,
  exportWork,
  deleteChecks,
  deleteVersion,
}: Props) {
  const d = w.draft;
  const done = stageDone(d);
  const predictionRef = useRef<HTMLDivElement>(null);
  const focusWhenReady = useRef(false);
  useEffect(() => {
    if (step === 2 && focusWhenReady.current) {
      predictionRef.current?.querySelector("textarea")?.focus();
      focusWhenReady.current = false;
    }
  }, [step]);
  const focusPrediction = () => {
    if (step === 2) predictionRef.current?.querySelector("textarea")?.focus();
    else {
      focusWhenReady.current = true;
      go(`work/${w.id}/2`);
    }
  };
  const [versionLabel, setVersionLabel] = useState("");
  const [compareA, setCompareA] = useState(w.versions[0]?.id ?? "");
  const [compareB, setCompareB] = useState("current");
  const checks = d.checks.filter((c) => c.revision === d.revision);
  const patch = (p: Partial<Snapshot>) => edit((s) => ({ ...s, ...p }));
  const change = (key: keyof Snapshot["change"], v: string) =>
    patch({ change: { ...d.change, [key]: v } });
  const a = w.versions.find((v) => v.id === compareA)?.data ?? d;
  const b = w.versions.find((v) => v.id === compareB)?.data ?? d;
  return (
    <>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            {m.title} ·{" "}
            {d.activity === "practice" ? "기본 연습실" : "실제 AI 제작 활동"}
          </span>
          <h1>{d.title || "제목 없는 작품"}</h1>
        </div>
        <div className="button-row">
          <button onClick={exportWork}>
            <Icon name="download" />
            파일 백업
          </button>
          <button onClick={() => go(`portfolio/${w.id}`)}>
            과정 포트폴리오 <Icon name="arrow" />
          </button>
        </div>
      </div>
      <nav className="stage-nav" aria-label="학습 단계">
        {stageNames.map((t, i) => (
          <button
            key={t}
            className={step === i ? "active" : done[i] ? "done" : ""}
            aria-current={step === i ? "step" : undefined}
            onClick={() => go(`work/${w.id}/${i}`)}
          >
            <span>{done[i] ? <Icon name="check" size={15} /> : i + 1}</span>
            <b>{t}</b>
            <small>{done[i] ? "기록 완료" : "기록할 내용 있음"}</small>
          </button>
        ))}
      </nav>
      <LearningWords compact />
      <div className="workspace-meta">
        <span>
          <span className="status-dot" />
          {w.editingLabel} · 실행 화면도 이 설정을 사용해요
        </span>
        {(d.config.kind === "quiz" &&
          (d.config.scoring === "attempt" || !d.config.resetScore)) ||
        (d.config.kind === "timer" && !d.config.showEnd) ||
        (m.learningError &&
          d.config.kind === "story" &&
          d.config.scenes[0]?.choices[1]?.to === "tree") ? (
          <Pill tone="orange">학습용 오류 규칙 포함</Pill>
        ) : (
          <Pill tone="green">현재 설정으로 검사해 보세요</Pill>
        )}
      </div>
      <div className="activity-switch no-print">
        <button
          className={d.activity === "practice" ? "active" : ""}
          onClick={() => patch({ activity: "practice" })}
        >
          기본 연습실
        </button>
        <button
          className={d.activity === "ai" ? "active" : ""}
          onClick={() => patch({ activity: "ai" })}
        >
          실제 AI 제작 기록
        </button>
        <span>
          {d.activity === "practice"
            ? "준비된 코드와 규칙을 바꾸며 연습해요."
            : "외부 도구는 교사·성인이 조작해요."}
        </span>
      </div>
      {d.activity === "ai" ? (
        <section className="panel ai-panel">
          <Pill>실제 AI 활동 · {aiStatus(d.ai)}</Pill>
          <h2>요청은 여기서, 실제 제작은 외부 도구에서</h2>
          <p>
            {mode === "child"
              ? "내가 쓴 요청문과 검사 조건을 교사·성인에게 전달해요. 교사·성인이 외부 AI 도구로 만들고 실행하면, 그 결과를 함께 관찰해요."
              : "외부 AI 개발 도구에 요청문을 붙여 넣어 생성·실행한 뒤 직접 관찰한 결과를 기록하세요."}{" "}
            복사만으로 실제 제작이 완료되지는 않아요.
          </p>
          <div className="button-row">
            <button
              onClick={() =>
                copy(d.arrangedPrompt || arrangePrompt(d.promise, mode))
              }
            >
              <Icon name="copy" />
              제작 요청문 복사
            </button>
            <button onClick={() => copy(correctionPrompt(d.change))}>
              수정 요청문 복사
            </button>
          </div>
          <div className="form-grid">
            <Field
              max={LIMITS.short}
              label="실제로 사용한 외부 AI 도구명"
              value={d.ai.tool}
              onChange={(v) => patch({ ai: { ...d.ai, tool: v } })}
            />
            <Field
              label="도구에서 도움받은 내용"
              value={d.ai.help}
              onChange={(v) => patch({ ai: { ...d.ai, help: v } })}
            />
          </div>
          <Field
            area
            label="외부 실행 전 예상"
            value={d.ai.expected}
            onChange={(v) => patch({ ai: { ...d.ai, expected: v } })}
          />
          <Field
            area
            label="외부 결과의 검사 기준"
            value={d.ai.criteria}
            onChange={(v) => patch({ ai: { ...d.ai, criteria: v } })}
          />
          <Field
            area
            label="실제로 실행하여 관찰한 결과"
            value={d.ai.observation}
            onChange={(v) => patch({ ai: { ...d.ai, observation: v } })}
          />
          <label className="field">
            <span>내가 확인한 외부 결과</span>
            <select
              value={d.ai.result}
              onChange={(e) =>
                patch({
                  ai: {
                    ...d.ai,
                    result: e.target.value as Snapshot["ai"]["result"],
                  },
                })
              }
            >
              <option value="unobserved">아직 확인하지 않음</option>
              <option value="pass">직접 검사 기준 충족을 관찰함</option>
              <option value="revise">수정할 동작을 관찰함</option>
            </select>
          </label>
          <Field
            area
            label="외부 AI에 보낼 수정 요청문"
            value={d.ai.revisionPrompt}
            onChange={(v) => patch({ ai: { ...d.ai, revisionPrompt: v } })}
          />
          <button onClick={() => copy(d.ai.revisionPrompt)}>
            이 수정 요청문 복사
          </button>
          <p className="small muted">
            아래 실행 화면과 자동 검사는 기본 연습 템플릿만 확인해요. 외부 AI
            코드의 동작을 자동 검증하지 않아요.
          </p>
        </section>
      ) : null}
      <div className="workbench">
        <section className="panel editing-panel">
          <div className="step-heading">
            <Pill>STEP {String(step + 1).padStart(2, "0")}</Pill>
            <h2>{stageNames[step]}</h2>
            <p>
              {
                [
                  "누가, 어떤 순간에 쓸 앱인지 약속해요.",
                  "내 말로 적고, 검사할 수 있는 요청으로 정리해요.",
                  "누르기 전에 예상하고, 설정과 결과를 비교해요.",
                  "기대한 결과와 실제 결과를 나란히 적어요.",
                  "어떻게 움직이는지, 무엇을 바꿨는지 설명해요.",
                ][step]
              }
            </p>
          </div>
          {step === 0 ? (
            <>
              <div className="note">
                아래 내용은 시작 예시예요. 내 생각에 맞게 고치고, 아래의 ‘이
                약속으로 만들기’를 눌러 확인해요.
              </div>
              <Field
                max={LIMITS.short}
                label="작품 제목"
                value={d.title}
                onChange={(v) => patch({ title: v })}
              />
              {(
                [
                  [
                    "audience",
                    "누가 사용할 앱인가요?",
                    "예: 쉬는 시간에 함께 노는 우리 반 친구",
                  ],
                  [
                    "problem",
                    "어떤 문제를 해결하나요?",
                    "예: 배운 내용을 재미있게 복습하고 싶어요.",
                  ],
                  [
                    "features",
                    "어떤 기능과 결과가 필요한가요?",
                    "예: 답을 고르면 안내와 점수가 나와요.",
                  ],
                  [
                    "done",
                    "어떤 조건이면 완성인가요?",
                    "예: 한 문제에서는 점수가 한 번만 올라가요.",
                  ],
                  [
                    "input",
                    "무엇을 누르거나 입력하나요?",
                    "예: 정답이라고 생각하는 선택지를 눌러요.",
                  ],
                  [
                    "exceptions",
                    "반복 클릭·빈 입력·다시 시작은요?",
                    "예: 여러 번 눌러도 한 번만 채점해요.",
                  ],
                ] as const
              ).map(([key, label, hint]) => (
                <Field
                  key={key}
                  area={key === "done"}
                  label={label}
                  value={d.promise[key]}
                  max={LIMITS.promise}
                  placeholder={hint}
                  onChange={(v) =>
                    patch({
                      promise: { ...d.promise, [key]: v },
                      goalReviewed: false,
                    })
                  }
                />
              ))}
              <details className="hint" open={mode === "child"}>
                <summary>입력 · 조건 · 앱이 기억하는 값</summary>
                <p>
                  입력은 내가 누른 답이에요. 조건은 “정답인가? 이미 답했나?”를
                  확인하는 약속이에요. 앱은 점수와 문제 번호처럼 다음 행동에도
                  필요한 값을 기억해요.
                </p>
              </details>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <Field
                area
                label="내가 처음 쓴 요청문 (원문)"
                value={d.originalPrompt}
                placeholder={
                  mode === "child"
                    ? "우리 반 친구가 쓸 퀴즈를 만들고 싶어요. 답을 고르면…"
                    : "목적과 원하는 기능을 자유롭게 적으세요."
                }
                onChange={(v) => patch({ originalPrompt: v })}
              />
              <button
                className="primary"
                onClick={() =>
                  patch({ arrangedPrompt: arrangePrompt(d.promise, mode) })
                }
              >
                <Icon name="spark" />
                만들기 약속으로 요청문 정리
              </button>
              <Field
                area
                label="정리한 제작 요청문"
                value={d.arrangedPrompt}
                onChange={(v) => patch({ arrangedPrompt: v })}
              />
              <button
                disabled={!d.arrangedPrompt.trim()}
                onClick={() => copy(d.arrangedPrompt)}
              >
                <Icon name="copy" />
                제작 요청문 복사
              </button>
              <div className="note">
                원문은 따로 보존해요. 자유롭게 적은 문장을 실행 코드로 바꾸지
                않아요. 실행 결과는 다음 단계에서 확인한 설정과 규칙에 따라
                결정돼요.
              </div>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <div className="prompt-question">{m.prediction}</div>
              <div ref={predictionRef}>
                <Field
                  area
                  label="실행 전 나의 예상"
                  value={d.prediction}
                  placeholder="이렇게 누르면… 이렇게 될 것 같아요. 왜냐하면…"
                  onChange={(v) => edit((s) => updatePrediction(s, v))}
                />
              </div>
              <h3>설정과 규칙</h3>
              <p className="muted small">
                설정을 바꾸면 새 설정 버전이 생겨요. 이전 검사 기록은 보존되며
                재검사가 필요해요.
              </p>
              <Settings
                config={d.config}
                onChange={(config) =>
                  edit((s) => ({ ...s, config, revision: uid() }))
                }
              />
              <Hint hints={m.hints} />
            </>
          ) : null}
          {step === 3 ? (
            <>
              <div className="prompt-question">
                <b>이번 수정 과제</b>
                <p>{m.task}</p>
              </div>
              <Inspection
                draft={d}
                mission={m}
                onChange={(checks) => patch({ checks })}
                message={message}
                deleteChecks={deleteChecks}
              />
              <h3>바꾼 내용과 이유를 남겨요</h3>
              <Field
                label="바꾸려는 동작"
                value={d.change.behavior}
                placeholder="예: 한 번 답한 문제는 다시 채점하지 않게 바꿨어요."
                onChange={(v) => change("behavior", v)}
              />
              <Field
                area
                label="왜 이렇게 수정했나요?"
                value={d.change.reason}
                placeholder="문제가 없었다면, 무엇을 더 좋게 바꾸었거나 그대로 둔 이유를 적어도 좋아요."
                onChange={(v) => change("reason", v)}
              />
              <details className="correction-extra">
                <summary>수정 요청문을 보낼 때 · 자세한 기록</summary>
                {(
                  [
                    ["situation", "어떤 상황에서 생긴 문제인가요?"],
                    ["expected", "기대한 결과"],
                    ["actual", "실제 결과"],
                    ["keep", "그대로 유지할 동작"],
                    ["retest", "수정 후 다시 할 검사"],
                  ] as const
                ).map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={d.change[key]}
                    onChange={(v) => change(key, v)}
                  />
                ))}
                <button onClick={() => copy(correctionPrompt(d.change))}>
                  <Icon name="copy" />
                  수정 요청문 복사
                </button>
              </details>
              <button className="subtle" onClick={() => go(`work/${w.id}/2`)}>
                설정으로 돌아가 수정하기 <Icon name="arrow" />
              </button>
              <Hint hints={m.hints} />
            </>
          ) : null}
          {step === 4 ? (
            <>
              <div className="prompt-question">{m.closing}</div>
              <Field
                area
                label="작동 원리와 배운 점"
                value={d.reflection}
                placeholder="내가 누른 것 → 적용한 규칙 → 기억하는 값 → 화면에 나온 결과"
                onChange={(v) => patch({ reflection: v })}
              />
              <Field
                area
                label="친구·교사·도구에게 도움받은 내용"
                value={d.help}
                placeholder="어떤 도움을 받았나요? 혼자 했다면 그렇게 적어도 좋아요."
                onChange={(v) => patch({ help: v })}
              />
              <div className="badges">
                {checks.some((c) => c.status === "pass") ? (
                  <Pill tone="green">✓ 검사 확인 기록</Pill>
                ) : null}
                {d.checks.some((c) => c.revision !== d.revision) &&
                checks.some((c) => c.status === "pass") ? (
                  <Pill>✓ 설정 변경 후 재검사 기록</Pill>
                ) : null}
                {d.change.reason.trim() ? (
                  <Pill tone="orange">✓ 수정 이유 작성</Pill>
                ) : null}
              </div>
              <p>
                배지는 확인 가능한 기록에 연결돼요. 이해도나 창의성 점수는
                자동으로 매기지 않아요.
              </p>
              <button
                className="primary"
                onClick={() => go(`portfolio/${w.id}`)}
              >
                포트폴리오 모아 보기 <Icon name="arrow" />
              </button>
            </>
          ) : null}
          <div className="step-bottom">
            <span className="small muted">
              {done[step]
                ? "이 단계의 기록이 채워졌어요."
                : [
                    "예시를 읽고, 내 약속을 정한 뒤 아래 버튼으로 확인해 주세요.",
                    "원문과 정리한 요청문을 모두 적어 주세요.",
                    "예상을 적고 현재 설정의 앱을 눌러 보세요.",
                    "직접 관찰·수정 이유를 적고, 미확인·수정 필요 항목을 다시 검사해요.",
                    "작동 원리와 도움받은 내용을 적어 주세요.",
                  ][step]}
            </span>
            <button
              className="primary"
              onClick={() =>
                step === 0
                  ? Object.values(d.promise).every((v) => v.trim())
                    ? (patch({ goalReviewed: true }), go(`work/${w.id}/1`))
                    : message("빈 만들기 약속을 먼저 채워 주세요.")
                  : step < 4
                    ? go(`work/${w.id}/${step + 1}`)
                    : saveVersion(versionLabel || "설명과 성찰 기록")
              }
            >
              {step === 0
                ? "이 약속으로 만들기"
                : step < 4
                  ? "다음 단계"
                  : "이 과정 버전으로 저장"}
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>
        <aside className="preview-panel panel">
          <div className="preview-heading">
            <Icon name="play" size={18} />
            <h2>직접 해 보는 작은 앱</h2>
            <Pill tone="paper">기본 연습</Pill>
          </div>
          {!d.prediction.trim() ? (
            <div className="prediction-nudge">
              <b>누르기 전에, 어떻게 될지 예상해 볼까요?</b>
              <p>예상을 적은 다음 직접 실행하면 과정 기록으로 남아요.</p>
              <button onClick={focusPrediction}>
                먼저 예상 적기 <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : null}
          <Preview
            key={`${w.id}:${d.revision}:${d.config.kind === "timer" ? step : "stable"}`}
            config={d.config}
            onRun={() => {
              if (d.prediction.trim() && d.runRevision !== d.revision)
                patch({ runRevision: d.revision });
            }}
          />
          <div className="preview-advice">
            <Icon name="help" size={18} />
            <p>
              예상과 달라도 괜찮아요.
              <br />
              어떤 규칙 때문인지 찾아보는 게 배움이에요.
            </p>
          </div>
        </aside>
      </div>
      <details className="panel versions">
        <summary>
          <Icon name="folder" />
          <b>수정 버전 · 비교와 복원</b>
          <span>{w.versions.length} / 30개</span>
        </summary>
        <p>
          버전은 고치기 전후의 모습을 이름 붙여 남긴 것이에요. 저장한 모습을
          비교하거나 다시 열 수 있어요.
        </p>
        <div className="version-save">
          <Field
            max={LIMITS.short}
            label="이번 버전 이름"
            value={versionLabel}
            placeholder="예: 중복 점수 수정 후 재검사"
            onChange={setVersionLabel}
          />
          <button
            className="primary"
            disabled={w.versions.length >= LIMITS.versions}
            onClick={() => {
              saveVersion(versionLabel);
              setVersionLabel("");
            }}
          >
            현재 편집본을 버전으로 저장
          </button>
        </div>
        <p className="small muted">
          자동 저장은 현재 편집 내용을 보관해요. 버전 저장은 설정·검사·수정
          이유를 한 묶음으로 남겨요. 복원 전 편집본도 버전으로 보존해요. 버전은
          30개·묶음 600KB까지, 직접 검사 글은 항목당 500자까지 보관해요.
        </p>
        <div className="version-list">
          {w.versions.map((v, i) => (
            <div key={v.id}>
              <span>
                <b>
                  V{i + 1} · {v.label}
                </b>
                <small>
                  {v.reason} · {new Date(v.at).toLocaleString("ko-KR")}
                </small>
              </span>
              <button
                disabled={w.versions.length >= LIMITS.versions}
                onClick={() => restore(v)}
              >
                이 버전 복원
              </button>
              {i > 0 ? (
                <button
                  className="danger-text"
                  onClick={() => deleteVersion(v)}
                >
                  이 버전 삭제
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="compare-grid">
          {[
            { selected: compareA, set: setCompareA, data: a },
            { selected: compareB, set: setCompareB, data: b },
          ].map((v, i) => (
            <div key={i}>
              <label className="field">
                <span>{i === 0 ? "비교할 이전 버전" : "비교할 다음 버전"}</span>
                <select
                  value={v.selected}
                  onChange={(e) => v.set(e.target.value)}
                >
                  <option value="current">현재 편집본</option>
                  {w.versions.map((t, k) => (
                    <option key={t.id} value={t.id}>
                      V{k + 1} · {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <h3>{v.data.title}</h3>
              <p>
                설정 {v.data.revision.slice(0, 6)} · 검사{" "}
                {
                  v.data.checks.filter((c) => c.revision === v.data.revision)
                    .length
                }
                개
              </p>
              <ul className="config-summary">
                {configSummary(v.data.config).map((line, k) => (
                  <li key={k}>{line}</li>
                ))}
              </ul>
              <p>예상: {v.data.prediction || "미기록"}</p>
              <p className="preserve">
                원문: {v.data.originalPrompt || "미기록"}
              </p>
              <p className="preserve">
                정리한 요청: {v.data.arrangedPrompt || "미기록"}
              </p>
              <p>수정 이유: {v.data.change.reason || "미기록"}</p>
              <details>
                <summary>설정과 해당 검사 기록 자세히 보기</summary>
                <pre>
                  {JSON.stringify(
                    {
                      설정: v.data.config,
                      검사: v.data.checks.filter(
                        (c) => c.revision === v.data.revision,
                      ),
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
