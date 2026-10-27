import type { Config, QuizConfig, StoryConfig } from "./model";
import { LIMITS, uid } from "./model";
import { Field, Icon } from "./ui";
import { PatternSettings } from "./PatternSettings";
export function Settings({
  config,
  onChange,
}: {
  config: Config;
  onChange: (c: Config) => void;
}) {
  if (config.kind === "quiz") {
    const edit = (patch: Partial<QuizConfig>) =>
      onChange({ ...config, ...patch });
    return (
      <div className="settings">
        <div className="form-grid">
          <label className="field">
            <span>채점 규칙</span>
            <select
              value={config.scoring}
              onChange={(e) =>
                edit({ scoring: e.target.value as "once" | "attempt" })
              }
            >
              <option value="once">문제당 한 번 (정상 규칙)</option>
              <option value="attempt">누를 때마다 (학습용 규칙)</option>
            </select>
          </label>
          <label className="field">
            <span>문제당 점수 (1~10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={config.points}
              onChange={(e) =>
                edit({
                  points: Math.max(
                    1,
                    Math.min(10, Math.round(Number(e.target.value))),
                  ),
                })
              }
            />
          </label>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={config.resetScore}
            onChange={(e) => edit({ resetScore: e.target.checked })}
          />
          다시 시작할 때 점수 초기화
        </label>
        <Field
          label="정답 안내"
          value={config.correctFeedback}
          onChange={(v) => edit({ correctFeedback: v })}
        />
        <Field
          label="오답 안내"
          value={config.wrongFeedback}
          onChange={(v) => edit({ wrongFeedback: v })}
        />
        {config.questions.map((q, i) => (
          <details className="editor-item" key={q.id}>
            <summary>
              문항 {i + 1} · {q.text.slice(0, 25)}
            </summary>
            <Field
              label={`문항 ${i + 1} 내용`}
              value={q.text}
              onChange={(v) =>
                edit({
                  questions: config.questions.map((p, j) =>
                    j === i ? { ...p, text: v } : p,
                  ),
                })
              }
            />
            {q.choices.map((ch, k) => (
              <Field
                key={k}
                max={LIMITS.short}
                label={`문항 ${i + 1} 선택지 ${k + 1}`}
                value={ch}
                onChange={(v) =>
                  edit({
                    questions: config.questions.map((p, j) =>
                      j === i
                        ? {
                            ...p,
                            choices: p.choices.map((t, l) => (k === l ? v : t)),
                          }
                        : p,
                    ),
                  })
                }
              />
            ))}
            <label className="field">
              <span>문항 {i + 1} 정답</span>
              <select
                value={q.correct}
                onChange={(e) =>
                  edit({
                    questions: config.questions.map((p, j) =>
                      j === i ? { ...p, correct: Number(e.target.value) } : p,
                    ),
                  })
                }
              >
                {q.choices.map((_, k) => (
                  <option key={k} value={k}>
                    {k + 1}번
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button
                disabled={q.choices.length >= LIMITS.choices}
                onClick={() =>
                  edit({
                    questions: config.questions.map((p, j) =>
                      j === i
                        ? { ...p, choices: [...p.choices, "새 선택지"] }
                        : p,
                    ),
                  })
                }
              >
                선택지 추가
              </button>
              <button
                disabled={q.choices.length <= 2}
                onClick={() =>
                  edit({
                    questions: config.questions.map((p, j) =>
                      j === i
                        ? {
                            ...p,
                            choices: p.choices.slice(0, -1),
                            correct: Math.min(p.correct, p.choices.length - 2),
                          }
                        : p,
                    ),
                  })
                }
              >
                마지막 선택지 삭제
              </button>
              <button
                className="danger-text"
                disabled={config.questions.length <= 1}
                onClick={() =>
                  edit({
                    questions: config.questions.filter((_, j) => j !== i),
                  })
                }
              >
                문항 삭제
              </button>
            </div>
          </details>
        ))}
        <button
          className="subtle"
          disabled={config.questions.length >= LIMITS.questions}
          onClick={() =>
            edit({
              questions: [
                ...config.questions,
                {
                  id: uid(),
                  text: "새 문제를 적어 주세요.",
                  choices: ["선택 1", "선택 2"],
                  correct: 0,
                },
              ],
            })
          }
        >
          <Icon name="plus" />
          문항 추가
        </button>
        <small>
          최대 문항 20개 · 선택지 6개. 설정을 바꾸면 실행 화면은 처음으로
          돌아가요.
        </small>
      </div>
    );
  }
  if (config.kind === "pattern")
    return <PatternSettings config={config} onChange={onChange} />;
  if (config.kind === "story") {
    const edit = (patch: Partial<StoryConfig>) =>
      onChange({ ...config, ...patch });
    const update = (
      id: string,
      patch: Partial<StoryConfig["scenes"][number]>,
    ) =>
      edit({
        scenes: config.scenes.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      });
    return (
      <div className="settings">
        <label className="field">
          <span>시작 장면</span>
          <select
            value={config.start}
            onChange={(e) => edit({ start: e.target.value })}
          >
            {config.scenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        {config.scenes.map((s, i) => (
          <details className="editor-item" key={s.id} open={i === 0}>
            <summary>
              장면 {i + 1} · {s.title}
            </summary>
            <Field
              max={LIMITS.short}
              label={`장면 ${i + 1} 제목`}
              value={s.title}
              onChange={(v) => update(s.id, { title: v })}
            />
            <Field
              area
              label={`장면 ${i + 1} 설명`}
              value={s.text}
              onChange={(v) => update(s.id, { text: v })}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={s.ending}
                disabled={config.intendedEndings.includes(s.id)}
                onChange={(e) =>
                  update(s.id, {
                    ending: e.target.checked,
                    choices: e.target.checked
                      ? []
                      : [{ label: "다음으로", to: config.start }],
                  })
                }
              />
              결말 장면
            </label>
            {s.ending ? (
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={config.intendedEndings.includes(s.id)}
                  disabled={
                    config.intendedEndings.length === 1 &&
                    config.intendedEndings.includes(s.id)
                  }
                  onChange={(e) =>
                    edit({
                      intendedEndings: e.target.checked
                        ? [...config.intendedEndings, s.id]
                        : config.intendedEndings.filter((id) => id !== s.id),
                    })
                  }
                />
                도달해야 하는 결말에 포함
              </label>
            ) : (
              s.choices.map((ch, k) => (
                <div className="connection" key={k}>
                  <Field
                    max={LIMITS.short}
                    label={`장면 ${i + 1} 선택 ${k + 1}`}
                    value={ch.label}
                    onChange={(v) =>
                      update(s.id, {
                        choices: s.choices.map((c, j) =>
                          k === j ? { ...c, label: v } : c,
                        ),
                      })
                    }
                  />
                  <label className="field">
                    <span>도착 장면 {k + 1}</span>
                    <select
                      value={ch.to}
                      onChange={(e) =>
                        update(s.id, {
                          choices: s.choices.map((c, j) =>
                            k === j ? { ...c, to: e.target.value } : c,
                          ),
                        })
                      }
                    >
                      {config.scenes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={s.choices.length <= 1}
                    onClick={() =>
                      update(s.id, {
                        choices: s.choices.filter((_, j) => j !== k),
                      })
                    }
                  >
                    이 선택 삭제
                  </button>
                </div>
              ))
            )}
            {!s.ending ? (
              <button
                disabled={s.choices.length >= 6}
                onClick={() =>
                  update(s.id, {
                    choices: [
                      ...s.choices,
                      { label: "새로운 길", to: config.start },
                    ],
                  })
                }
              >
                선택 추가
              </button>
            ) : null}
            <button
              className="danger-text"
              disabled={
                s.id === config.start ||
                config.scenes.length <= 2 ||
                (config.intendedEndings.includes(s.id) &&
                  config.intendedEndings.length <= 1)
              }
              onClick={() =>
                edit({
                  scenes: config.scenes
                    .filter((t) => t.id !== s.id)
                    .map((t) => ({
                      ...t,
                      choices: t.choices.map((ch) => ({
                        ...ch,
                        to: ch.to === s.id ? config.start : ch.to,
                      })),
                    })),
                  intendedEndings: config.intendedEndings.filter(
                    (id) => id !== s.id,
                  ),
                })
              }
            >
              장면 삭제
            </button>
          </details>
        ))}
        <button
          disabled={config.scenes.length >= LIMITS.scenes}
          onClick={() =>
            edit({
              scenes: [
                ...config.scenes,
                {
                  id: uid(),
                  title: "새로운 결말",
                  text: "어떤 일이 생겼나요?",
                  ending: true,
                  choices: [],
                },
              ],
            })
          }
        >
          <Icon name="plus" />새 장면 추가
        </button>
        <small>
          최대 장면 24개 · 장면마다 선택 6개. 장면을 삭제하면 해당 장면으로 가던
          길은 시작 장면으로 연결돼요.
        </small>
      </div>
    );
  }
  return (
    <div className="settings">
      <label className="field">
        <span>제한 시간 (1~3,600초)</span>
        <input
          type="number"
          min={1}
          max={LIMITS.seconds}
          value={config.seconds}
          onChange={(e) =>
            onChange({
              ...config,
              seconds: Math.max(
                1,
                Math.min(LIMITS.seconds, Math.round(Number(e.target.value))),
              ),
            })
          }
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.showEnd}
          onChange={(e) => onChange({ ...config, showEnd: e.target.checked })}
        />
        0초가 되면 종료 안내 표시
      </label>
      <Field
        area
        label="종료 안내 문장"
        value={config.endMessage}
        onChange={(v) => onChange({ ...config, endMessage: v })}
      />
      <div className="note">
        시작을 여러 번 눌러도 한 번만 실행해요. 남은 시간은 0보다 작아지지 않고,
        종료 안내는 한 번만 나와요.
      </div>
    </div>
  );
}
