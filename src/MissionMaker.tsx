import { useT } from "./i18n";
import { useState } from "react";
import { missions } from "./data";
import { kindNames, kinds, makeWork } from "./model";
import type { Config, Kind, Work } from "./model";
import { Field, Icon, Pill } from "./ui";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
import { downloadText } from "./storage";
import { errorText } from "./appError";
import {
  courseFile,
  courses,
  customMissions,
  isCustom,
  missionFile,
  removeCourse,
  removeCustomMission,
  saveCourse,
  saveCustomMission,
  validateCourse,
  validateMission,
} from "./customMissions";
// 교사용 미션 만들기: 시작 설정·학습용 오류·검사 항목·힌트를 정해 이 기기에 더하거나 미션 파일로 나눠 준다.
// 교사 화면이라 한국어로 둔다.
const starterOf = (kind: Kind): Config =>
  makeWork(
    missions.find((m) => m.kind === kind && !isCustom(m.id))!,
    true,
  ).draft.config;
const blank = (kind: Kind) => ({
  // 기존 미션을 고칠 때만 채운다(같은 ID로 새 판을 만든다).
  id: undefined as string | undefined,
  version: 1,
  title: "",
  goal: "",
  prediction: "",
  task: "",
  closing: "",
  learningError: false,
  tests: [{ label: "", expected: "" }],
  hints: ["", "", ""],
  starter: starterOf(kind),
  // 영어 글(선택). 영어 화면을 쓰는 학급에 나눠 줄 때 채운다.
  en: {
    title: "",
    goal: "",
    prediction: "",
    task: "",
    closing: "",
    tests: "",
    hints: "",
  },
});
// 영어 검사·힌트는 줄마다 하나씩 적는다(검사는 "이름 | 기대 결과").
const parseEnglish = (en: ReturnType<typeof blank>["en"]) => ({
  ...en,
  tests: en.tests
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      const [label = "", expected = ""] = l.split("|");
      return { label: label.trim(), expected: expected.trim() };
    }),
  hints: en.hints.split("\n").filter((l) => l.trim()),
});
export function MissionMaker({
  works,
  message,
  open,
}: {
  works: Work[];
  message: (s: string) => void;
  open: (id: string) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState(() => blank("quiz"));
  const [list, setList] = useState(customMissions);
  const set = (patch: Partial<typeof draft>) =>
    setDraft({ ...draft, ...patch });
  const build = () =>
    validateMission({
      ...draft,
      // 고치는 중이면 판을 하나 올려, 이미 받은 기기에서 새 판으로 바꿀지 물을 수 있게 한다.
      version: draft.id ? draft.version + 1 : 1,
      tests: draft.tests.filter((t) => t.label.trim() || t.expected.trim()),
      hints: draft.hints.filter((h) => h.trim()),
      en: parseEnglish(draft.en),
    });
  const attempt = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      message(errorText(e, t, t("미션을 만들지 못했어요.")));
    }
  };
  return (
    <div className="mission-maker">
      <section className="panel">
        <h2>{t("선생님 미션 만들기")}</h2>
        {draft.id ? (
          <p className="note">
            {t(
              "「{title}」 {v}판을 고치는 중이에요. 저장하면 {next}판이 되고, 이 미션을 이미 받은 기기는 다음에 파일을 열 때 새 판으로 바꿀지 물어요.",
              {
                title: draft.title,
                v: draft.version,
                next: draft.version + 1,
              },
            )}{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => setDraft(blank(draft.starter.kind))}
            >
              {t("고치기 그만두기")}
            </button>
          </p>
        ) : null}
        <p className="small muted">
          {t(
            "시작 설정과 검사 항목을 정해 우리 반 미션을 만들어요. 이 기기에 더하면 미션 공작대에 바로 나오고, 미션 파일을 나눠 주면 학생이 ‘파일 가져오기’로 더해요.",
          )}
        </p>
        <label className="field">
          <span>{t("프로젝트 종류")}</span>
          <select
            value={draft.starter.kind}
            onChange={(e) =>
              set({ starter: starterOf(e.target.value as Kind) })
            }
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {t(kindNames[k])}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={t("미션 제목")}
          max={200}
          value={draft.title}
          onChange={(title) => set({ title })}
        />
        <Field
          label={t("미션 목표 (학생이 무엇을 만들고 확인하나요?)")}
          area
          max={500}
          value={draft.goal}
          onChange={(goal) => set({ goal })}
        />
        <Field
          label={t("먼저 예상하기 질문")}
          area
          max={500}
          value={draft.prediction}
          onChange={(prediction) => set({ prediction })}
        />
        <Field
          label={t("이번 과제 (무엇을 고치거나 바꾸나요?)")}
          area
          max={500}
          value={draft.task}
          onChange={(task) => set({ task })}
        />
      </section>
      <section className="panel">
        <h3>{t("시작 설정")}</h3>
        <p className="small muted">
          {t(
            "학생이 처음 여는 앱이에요. 일부러 틀린 규칙을 넣었다면 아래 ‘학습용 오류 포함’을 켜 주세요.",
          )}
        </p>
        <div className="maker-starter">
          <Settings
            config={draft.starter}
            onChange={(starter) => set({ starter })}
          />
          <div className="maker-preview">
            <Preview
              key={JSON.stringify(draft.starter)}
              config={draft.starter}
              onRun={() => {}}
            />
          </div>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={draft.learningError}
            onChange={(e) => set({ learningError: e.target.checked })}
          />
          {t("학습용 오류 포함 (학생이 찾아 고칠 규칙이 있어요)")}
        </label>
      </section>
      <section className="panel">
        <h3>{t("검사 항목 (1~6개)")}</h3>
        {draft.tests.map((c, i) => (
          <fieldset className="maker-test" key={i}>
            <legend>{t("검사 {n}", { n: i + 1 })}</legend>
            <Field
              label={t("검사 {n} 이름", { n: i + 1 })}
              max={200}
              value={c.label}
              onChange={(label) =>
                set({
                  tests: draft.tests.map((x, j) =>
                    j === i ? { ...x, label } : x,
                  ),
                })
              }
            />
            <Field
              label={t("검사 {n} 기대 결과", { n: i + 1 })}
              max={500}
              value={c.expected}
              onChange={(expected) =>
                set({
                  tests: draft.tests.map((x, j) =>
                    j === i ? { ...x, expected } : x,
                  ),
                })
              }
            />
            {draft.tests.length > 1 ? (
              <button
                type="button"
                className="danger-text"
                onClick={() =>
                  set({ tests: draft.tests.filter((_, j) => j !== i) })
                }
              >
                <Icon name="trash" />
                {t("검사 {n} 삭제", { n: i + 1 })}
              </button>
            ) : null}
          </fieldset>
        ))}
        <button
          type="button"
          disabled={draft.tests.length >= 6}
          onClick={() =>
            set({ tests: [...draft.tests, { label: "", expected: "" }] })
          }
        >
          <Icon name="plus" />
          {t("검사 항목 추가")}
        </button>
        <h3>{t("힌트 (1~3개, 차례로 열려요)")}</h3>
        {draft.hints.map((h, i) => (
          <Field
            key={i}
            label={t("힌트 {n}", { n: i + 1 })}
            max={500}
            value={h}
            onChange={(v) =>
              set({ hints: draft.hints.map((x, j) => (j === i ? v : x)) })
            }
          />
        ))}
        <Field
          label={t("마무리 질문")}
          area
          max={500}
          value={draft.closing}
          onChange={(closing) => set({ closing })}
        />
        <details className="maker-english">
          <summary>{t("영어 글 함께 적기 (선택)")}</summary>
          <p className="small muted">
            {t(
              "영어 화면을 쓰는 학급에 나눠 줄 때 채워요. 다섯 칸을 모두 적고 검사·힌트 줄 수가 한국어와 같아야 영어 화면에 나와요. 비워 두면 영어 화면에서도 한국어 글을 보여 줘요.",
            )}
          </p>
          {(
            [
              ["title", "Mission title", false],
              ["goal", "Goal", true],
              ["prediction", "Prediction question", true],
              ["task", "Task", true],
              ["closing", "Closing question", true],
            ] as const
          ).map(([key, label, area]) => (
            <Field
              key={key}
              label={label}
              area={area}
              max={area ? 500 : 200}
              value={draft.en[key]}
              onChange={(v) => set({ en: { ...draft.en, [key]: v } })}
            />
          ))}
          <Field
            label={t("Checks · 한 줄에 하나, 「이름 | 기대 결과」 ({n}줄)", {
              n: draft.tests.filter((x) => x.label.trim() || x.expected.trim())
                .length,
            })}
            area
            max={2000}
            value={draft.en.tests}
            onChange={(v) => set({ en: { ...draft.en, tests: v } })}
          />
          <Field
            label={t("Hints · 한 줄에 하나 ({n}줄)", {
              n: draft.hints.filter((h) => h.trim()).length,
            })}
            area
            max={1500}
            value={draft.en.hints}
            onChange={(v) => set({ en: { ...draft.en, hints: v } })}
          />
        </details>
        <div className="button-row">
          <button
            className="primary"
            onClick={() =>
              attempt(() => {
                const m = saveCustomMission(build());
                setList(customMissions());
                message(
                  t("「{title}」을 이 기기의 미션 공작대에 더했어요.", {
                    title: m.title,
                  }),
                );
                setDraft(blank(draft.starter.kind));
              })
            }
          >
            <Icon name="plus" />
            {t("이 기기에 미션 더하기")}
          </button>
          <button
            onClick={() =>
              attempt(() => {
                const m = build();
                downloadText(
                  `뚝딱-미션-${m.title}.json`,
                  missionFile(m),
                  "application/json",
                );
                message(
                  t(
                    "미션 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.",
                  ),
                );
              })
            }
          >
            <Icon name="download" />
            {t("미션 파일 내려받기")}
          </button>
        </div>
      </section>
      <section className="panel">
        <h3>{t("이 기기의 선생님 미션 {n}개", { n: list.length })}</h3>
        {list.length ? (
          <ul className="maker-list">
            {list.map((m) => {
              const used = works.filter((w) => w.missionId === m.id).length;
              return (
                <li key={m.id}>
                  <div>
                    <Pill tone="paper">
                      {t(kindNames[m.kind])} {m.order}
                    </Pill>{" "}
                    <b>{m.title}</b>
                    {m.learningError ? (
                      <Pill tone="orange">{t("학습용 오류 포함")}</Pill>
                    ) : null}
                    {used ? (
                      <small>{t(" · 이 미션의 작품 {n}개", { n: used })}</small>
                    ) : null}
                  </div>
                  <div className="button-row">
                    <button onClick={() => open(m.id)}>{t("미션 보기")}</button>
                    <button
                      onClick={() => {
                        setDraft({
                          id: m.id,
                          version: m.version ?? 1,
                          title: m.title,
                          goal: m.goal,
                          prediction: m.prediction,
                          task: m.task,
                          closing: m.closing,
                          learningError: m.learningError,
                          tests: m.tests.map((x) => ({ ...x })),
                          hints: [...m.hints, "", "", ""].slice(0, 3),
                          en: {
                            title: m.en?.title ?? "",
                            goal: m.en?.goal ?? "",
                            prediction: m.en?.prediction ?? "",
                            task: m.en?.task ?? "",
                            closing: m.en?.closing ?? "",
                            tests: (m.en?.tests ?? [])
                              .map((x) => `${x.label} | ${x.expected}`)
                              .join("\n"),
                            hints: (m.en?.hints ?? []).join("\n"),
                          },
                          starter: structuredClone(m.starter),
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {t("고쳐서 새 판 만들기")}
                    </button>
                    <button
                      onClick={() =>
                        downloadText(
                          `뚝딱-미션-${m.title}.json`,
                          missionFile(m),
                          "application/json",
                        )
                      }
                    >
                      {t("파일 다시 받기")}
                    </button>
                    <button
                      className="danger-text"
                      disabled={used > 0}
                      title={
                        used
                          ? t("이 미션으로 만든 작품이 있어 지울 수 없어요.")
                          : undefined
                      }
                      onClick={() => {
                        removeCustomMission(m.id);
                        setList(customMissions());
                        message(
                          t("「{title}」을 이 기기에서 지웠어요.", {
                            title: m.title,
                          }),
                        );
                      }}
                    >
                      {t("지우기")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="small muted">{t("아직 만든 미션이 없어요.")}</p>
        )}
      </section>
      <CourseMaker message={message} attempt={attempt} />
    </div>
  );
}
// 미션 묶음(코스) 만들기: 기본 미션과 선생님 미션을 순서대로 묶어 한 파일로 나눠 준다.
function CourseMaker({
  message,
  attempt,
}: {
  message: (s: string) => void;
  attempt: (fn: () => void) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [choice, setChoice] = useState(missions[0]?.id ?? "");
  const [saved, setSaved] = useState(courses);
  const build = () => validateCourse({ title, missionIds: picked });
  const nameOf = (id: string) => {
    const m = missions.find((x) => x.id === id);
    return m ? `${t(kindNames[m.kind])} ${m.order} · ${m.title}` : id;
  };
  const refresh = () => setSaved(courses());
  return (
    <section className="panel course-maker">
      <h3>{t("미션 묶음(코스) 만들기")}</h3>
      <p className="small muted">
        {t(
          "기본 미션과 선생님 미션을 순서대로 묶어요. 학생이 코스 파일을 가져오면 나의 미션 지도에 ‘우리 반 코스’ 길이 생기고, 담긴 선생님 미션도 함께 더해져요.",
        )}
      </p>
      <Field
        label={t("코스 이름")}
        max={200}
        value={title}
        onChange={setTitle}
      />
      <label className="field">
        <span>{t("넣을 미션")}</span>
        <select value={choice} onChange={(e) => setChoice(e.target.value)}>
          {missions.map((m) => (
            <option key={m.id} value={m.id} disabled={picked.includes(m.id)}>
              {nameOf(m.id)}
              {isCustom(m.id) ? ` (${t("선생님 미션")})` : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!choice || picked.includes(choice)}
        onClick={() => setPicked([...picked, choice])}
      >
        <Icon name="plus" />
        {t("코스에 더하기")}
      </button>
      {picked.length ? (
        <ol className="course-steps" aria-label={t("코스 순서")}>
          {picked.map((id, i) => (
            <li key={id}>
              <span>
                {i + 1}. {nameOf(id)}
              </span>
              <span className="button-row">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={t("{n}번 미션을 앞으로", { n: i + 1 })}
                  onClick={() => {
                    const next = [...picked];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setPicked(next);
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="danger-text"
                  aria-label={t("{n}번 미션 빼기", { n: i + 1 })}
                  onClick={() => setPicked(picked.filter((x) => x !== id))}
                >
                  {t("빼기")}
                </button>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="small muted">{t("아직 넣은 미션이 없어요.")}</p>
      )}
      <div className="button-row">
        <button
          type="button"
          className="primary"
          onClick={() =>
            attempt(() => {
              const c = saveCourse(build());
              refresh();
              message(
                t("코스 「{title}」을 이 기기에 더했어요.", { title: c.title }),
              );
              setTitle("");
              setPicked([]);
            })
          }
        >
          <Icon name="plus" />
          {t("이 기기에 코스 더하기")}
        </button>
        <button
          type="button"
          onClick={() =>
            attempt(() => {
              const c = build();
              downloadText(
                `뚝딱-코스-${c.title}.json`,
                courseFile(c),
                "application/json",
              );
              message(
                t(
                  "코스 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.",
                ),
              );
            })
          }
        >
          <Icon name="download" />
          {t("코스 파일 내려받기")}
        </button>
      </div>
      {saved.length ? (
        <>
          <h4>{t("이 기기의 코스 {n}개", { n: saved.length })}</h4>
          <ul className="maker-list">
            {saved.map((c) => (
              <li key={c.id}>
                <div>
                  <b>{c.title}</b>{" "}
                  <small>{t("미션 {n}개", { n: c.missionIds.length })}</small>
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    onClick={() =>
                      downloadText(
                        `뚝딱-코스-${c.title}.json`,
                        courseFile(c),
                        "application/json",
                      )
                    }
                  >
                    {t("파일 다시 받기")}
                  </button>
                  <button
                    type="button"
                    className="danger-text"
                    onClick={() => {
                      removeCourse(c.id);
                      refresh();
                      message(
                        t("코스 「{title}」을 이 기기에서 지웠어요.", {
                          title: c.title,
                        }),
                      );
                    }}
                  >
                    {t("지우기")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
