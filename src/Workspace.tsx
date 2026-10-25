import { useState } from "react";
import { autoChecks } from "./engines";
import {
  arrangePrompt,
  correctionPrompt,
  stageDone,
  aiStatus,
  uid,
  now,
  LIMITS,
} from "./model";
import type { Work, Snapshot, Mode, Mission, Check, Version } from "./model";
import type { Navigate } from "./Pages";
import { Field, Hint, Icon, Pill } from "./ui";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
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
  const [versionLabel, setVersionLabel] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [compareA, setCompareA] = useState(w.versions[0]?.id ?? "");
  const [compareB, setCompareB] = useState("current");
  const checks = d.checks.filter((c) => c.revision === d.revision);
  const oldCount = d.checks.length - checks.length;
  const patch = (p: Partial<Snapshot>) => edit((s) => ({ ...s, ...p }));
  const addChecks = (rows: Check[]) => {
    if (d.checks.length + rows.length > LIMITS.checks) {
      message(
        "한 작품의 검사 기록은 100개까지예요. 백업 후 선택한 검사 기록을 삭제해 주세요.",
      );
      return;
    }
    patch({ checks: [...d.checks, ...rows] });
  };
  const manualCards = () =>
    addChecks(
      m.tests.map((t) => ({
        id: uid(),
        label: t.label,
        expected: t.expected,
        actual: "",
        source: m.id === "story-4" ? "peer" : "self",
        status: "pending",
        revision: d.revision,
        at: now(),
      })),
    );
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
      <div className="workspace-meta">
        <span>
          <span className="status-dot" />
          {w.editingLabel} · 설정 {d.revision.slice(0, 6)}
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
                    patch({ promise: { ...d.promise, [key]: v } })
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
              <Field
                area
                label="실행 전 나의 예상"
                value={d.prediction}
                placeholder="이렇게 누르면… 이렇게 될 것 같아요. 왜냐하면…"
                onChange={(v) => patch({ prediction: v })}
              />
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
              <div className="button-row">
                <button
                  className="primary"
                  onClick={() => addChecks(autoChecks(d.config, d.revision))}
                >
                  <Icon name="check" />
                  현재 설정 자동 검사
                </button>
                <button onClick={manualCards}>미션 직접 확인 카드 추가</button>
                <button
                  onClick={() =>
                    addChecks([
                      {
                        id: uid(),
                        label: "나의 검사",
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
                  나의 검사 추가
                </button>
                <button
                  onClick={() =>
                    addChecks([
                      {
                        id: uid(),
                        label: "친구·교사 의견",
                        expected: "직접 사용한 뒤 의견 듣기",
                        actual: "",
                        source: "peer",
                        status: "pending",
                        revision: d.revision,
                        at: now(),
                      },
                    ])
                  }
                >
                  친구·교사 의견 추가
                </button>
              </div>
              <p className="small muted">
                자동 검사는 템플릿의 동작만 확인해요. 문장의 의미와 창의성은
                사람이 살펴봐요. 이전 설정의 기록 {oldCount}개는 아래
                버전·포트폴리오에서 확인할 수 있어요.
              </p>
              {checks.length === 0 ? (
                <div className="empty compact">
                  아직 이 설정에서 검사하지 않았어요. 자동 검사와 직접 확인
                  카드를 추가해 보세요.
                </div>
              ) : (
                checks.map((c) => (
                  <div key={c.id} className={`check-card ${c.status}`}>
                    <div className="check-card-head">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={selected.includes(c.id)}
                          aria-label={`${c.label} 기록 선택`}
                          onChange={(e) =>
                            setSelected((s) =>
                              e.target.checked
                                ? [...s, c.id]
                                : s.filter((id) => id !== c.id),
                            )
                          }
                        />
                        <b>{c.label}</b>
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
                        {c.source === "auto"
                          ? "자동 검사"
                          : c.source === "self"
                            ? "학습자 직접 확인"
                            : "친구·교사 의견"}
                      </Pill>
                    </div>
                    <p>
                      <b>기대</b> {c.expected}
                    </p>
                    {c.source === "auto" ? (
                      <p>
                        <b>실제</b> {c.actual} ·{" "}
                        <strong>
                          {c.status === "pass"
                            ? "통과"
                            : c.status === "fail"
                              ? "수정 필요"
                              : "미확인"}
                        </strong>
                      </p>
                    ) : (
                      <>
                        <Field
                          max={LIMITS.short}
                          label="검사 이름"
                          value={c.label}
                          onChange={(v) =>
                            patch({
                              checks: d.checks.map((t) =>
                                t.id === c.id ? { ...t, label: v } : t,
                              ),
                            })
                          }
                        />
                        <Field
                          area
                          label={`${c.label} 기대한 결과`}
                          value={c.expected}
                          max={LIMITS.checkText}
                          onChange={(v) =>
                            patch({
                              checks: d.checks.map((t) =>
                                t.id === c.id
                                  ? { ...t, expected: v, status: "pending" }
                                  : t,
                              ),
                            })
                          }
                        />
                        <Field
                          area
                          label={`${c.label} 실제 결과`}
                          value={c.actual}
                          max={LIMITS.checkText}
                          onChange={(v) =>
                            patch({
                              checks: d.checks.map((t) =>
                                t.id === c.id
                                  ? {
                                      ...t,
                                      actual: v,
                                      status: v.trim() ? t.status : "pending",
                                    }
                                  : t,
                              ),
                            })
                          }
                        />
                        <label className="field">
                          <span>{c.label} 확인 상태</span>
                          <select
                            value={c.status}
                            onChange={(e) => {
                              if (
                                e.target.value !== "pending" &&
                                (!c.actual.trim() ||
                                  !c.expected.trim() ||
                                  !c.label.trim())
                              ) {
                                message(
                                  "검사 이름, 기대한 결과와 직접 관찰한 실제 결과를 먼저 적어 주세요.",
                                );
                                return;
                              }
                              patch({
                                checks: d.checks.map((t) =>
                                  t.id === c.id
                                    ? {
                                        ...t,
                                        status: e.target
                                          .value as Check["status"],
                                      }
                                    : t,
                                ),
                              });
                            }}
                          >
                            <option value="pending">아직 확인하지 않음</option>
                            <option value="pass">직접 확인함</option>
                            <option value="fail">수정할 점이 있음</option>
                          </select>
                        </label>
                      </>
                    )}
                  </div>
                ))
              )}
              {selected.length ? (
                <button
                  className="danger-text"
                  onClick={() => {
                    deleteChecks(selected);
                    setSelected([]);
                  }}
                >
                  선택한 학습 기록 {selected.length}개 삭제
                </button>
              ) : null}
              <h3>수정의 이유를 남겨요</h3>
              {(
                [
                  ["situation", "어떤 상황에서 생긴 문제인가요?"],
                  ["expected", "기대한 결과"],
                  ["actual", "실제 결과"],
                  ["behavior", "바꾸려는 동작"],
                  ["keep", "그대로 유지할 동작"],
                  ["retest", "수정 후 다시 할 검사"],
                  ["reason", "왜 이렇게 수정했나요?"],
                ] as const
              ).map(([key, label]) => (
                <Field
                  area={key === "reason"}
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
                    "빈 약속을 채워 주세요.",
                    "원문과 정리한 요청문을 모두 적어 주세요.",
                    "예상을 적고 현재 설정의 앱을 눌러 보세요.",
                    "직접 관찰·수정 이유를 적고, 미확인·수정 필요 항목을 다시 검사해요.",
                    "작동 원리와 도움받은 내용을 적어 주세요.",
                  ][step]}
            </span>
            <button
              className="primary"
              onClick={() =>
                step < 4
                  ? go(`work/${w.id}/${step + 1}`)
                  : saveVersion(versionLabel || "설명과 성찰 기록")
              }
            >
              {step < 4 ? "다음 단계" : "이 과정 버전으로 저장"}
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
          <Preview
            key={`${w.id}:${d.revision}:${step}:${d.activity}`}
            config={d.config}
            onRun={() => {
              if (d.runRevision !== d.revision)
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
