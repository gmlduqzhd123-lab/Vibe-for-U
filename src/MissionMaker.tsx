import { useState } from "react";
import { missions } from "./data";
import { kindNames, kinds, makeWork } from "./model";
import type { Config, Kind, Work } from "./model";
import { Field, Icon, Pill } from "./ui";
import { Settings } from "./Settings";
import { Preview } from "./Preview";
import { downloadText } from "./storage";
import { errorText } from "./appError";
import { translate } from "./i18n";
import {
  customMissions,
  isCustom,
  missionFile,
  removeCustomMission,
  saveCustomMission,
  validateMission,
} from "./customMissions";
// 교사용 미션 만들기: 시작 설정·학습용 오류·검사 항목·힌트를 정해 이 기기에 더하거나 미션 파일로 나눠 준다.
// 교사 화면이라 한국어로 둔다.
const ko = (s: string) => translate("ko", s);
const starterOf = (kind: Kind): Config =>
  makeWork(
    missions.find((m) => m.kind === kind && !isCustom(m.id))!,
    true,
  ).draft.config;
const blank = (kind: Kind) => ({
  title: "",
  goal: "",
  prediction: "",
  task: "",
  closing: "",
  learningError: false,
  tests: [{ label: "", expected: "" }],
  hints: ["", "", ""],
  starter: starterOf(kind),
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
  const [draft, setDraft] = useState(() => blank("quiz"));
  const [list, setList] = useState(customMissions);
  const set = (patch: Partial<typeof draft>) =>
    setDraft({ ...draft, ...patch });
  const build = () =>
    validateMission({
      ...draft,
      tests: draft.tests.filter((t) => t.label.trim() || t.expected.trim()),
      hints: draft.hints.filter((h) => h.trim()),
    });
  const attempt = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      message(errorText(e, ko, "미션을 만들지 못했어요."));
    }
  };
  return (
    <div className="mission-maker">
      <section className="panel">
        <h2>선생님 미션 만들기</h2>
        <p className="small muted">
          시작 설정과 검사 항목을 정해 우리 반 미션을 만들어요. 이 기기에 더하면
          미션 공작대에 바로 나오고, 미션 파일을 나눠 주면 학생이 ‘파일
          가져오기’로 더해요.
        </p>
        <label className="field">
          <span>프로젝트 종류</span>
          <select
            value={draft.starter.kind}
            onChange={(e) =>
              set({ starter: starterOf(e.target.value as Kind) })
            }
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {kindNames[k]}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="미션 제목"
          max={200}
          value={draft.title}
          onChange={(title) => set({ title })}
        />
        <Field
          label="미션 목표 (학생이 무엇을 만들고 확인하나요?)"
          area
          max={500}
          value={draft.goal}
          onChange={(goal) => set({ goal })}
        />
        <Field
          label="먼저 예상하기 질문"
          area
          max={500}
          value={draft.prediction}
          onChange={(prediction) => set({ prediction })}
        />
        <Field
          label="이번 과제 (무엇을 고치거나 바꾸나요?)"
          area
          max={500}
          value={draft.task}
          onChange={(task) => set({ task })}
        />
      </section>
      <section className="panel">
        <h3>시작 설정</h3>
        <p className="small muted">
          학생이 처음 여는 앱이에요. 일부러 틀린 규칙을 넣었다면 아래 ‘학습용
          오류 포함’을 켜 주세요.
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
          학습용 오류 포함 (학생이 찾아 고칠 규칙이 있어요)
        </label>
      </section>
      <section className="panel">
        <h3>검사 항목 (1~6개)</h3>
        {draft.tests.map((t, i) => (
          <fieldset className="maker-test" key={i}>
            <legend>검사 {i + 1}</legend>
            <Field
              label={`검사 ${i + 1} 이름`}
              max={200}
              value={t.label}
              onChange={(label) =>
                set({
                  tests: draft.tests.map((x, j) =>
                    j === i ? { ...x, label } : x,
                  ),
                })
              }
            />
            <Field
              label={`검사 ${i + 1} 기대 결과`}
              max={500}
              value={t.expected}
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
                검사 {i + 1} 삭제
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
          검사 항목 추가
        </button>
        <h3>힌트 (1~3개, 차례로 열려요)</h3>
        {draft.hints.map((h, i) => (
          <Field
            key={i}
            label={`힌트 ${i + 1}`}
            max={500}
            value={h}
            onChange={(v) =>
              set({ hints: draft.hints.map((x, j) => (j === i ? v : x)) })
            }
          />
        ))}
        <Field
          label="마무리 질문"
          area
          max={500}
          value={draft.closing}
          onChange={(closing) => set({ closing })}
        />
        <div className="button-row">
          <button
            className="primary"
            onClick={() =>
              attempt(() => {
                const m = saveCustomMission(build());
                setList(customMissions());
                message(`「${m.title}」을 이 기기의 미션 공작대에 더했어요.`);
                setDraft(blank(draft.starter.kind));
              })
            }
          >
            <Icon name="plus" />이 기기에 미션 더하기
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
                  "미션 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.",
                );
              })
            }
          >
            <Icon name="download" />
            미션 파일 내려받기
          </button>
        </div>
      </section>
      <section className="panel">
        <h3>이 기기의 선생님 미션 {list.length}개</h3>
        {list.length ? (
          <ul className="maker-list">
            {list.map((m) => {
              const used = works.filter((w) => w.missionId === m.id).length;
              return (
                <li key={m.id}>
                  <div>
                    <Pill tone="paper">
                      {kindNames[m.kind]} {m.order}
                    </Pill>{" "}
                    <b>{m.title}</b>
                    {m.learningError ? (
                      <Pill tone="orange">학습용 오류 포함</Pill>
                    ) : null}
                    {used ? <small> · 이 미션의 작품 {used}개</small> : null}
                  </div>
                  <div className="button-row">
                    <button onClick={() => open(m.id)}>미션 보기</button>
                    <button
                      onClick={() =>
                        downloadText(
                          `뚝딱-미션-${m.title}.json`,
                          missionFile(m),
                          "application/json",
                        )
                      }
                    >
                      파일 다시 받기
                    </button>
                    <button
                      className="danger-text"
                      disabled={used > 0}
                      title={
                        used
                          ? "이 미션으로 만든 작품이 있어 지울 수 없어요."
                          : undefined
                      }
                      onClick={() => {
                        removeCustomMission(m.id);
                        setList(customMissions());
                        message(`「${m.title}」을 이 기기에서 지웠어요.`);
                      }}
                    >
                      지우기
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="small muted">아직 만든 미션이 없어요.</p>
        )}
      </section>
    </div>
  );
}
