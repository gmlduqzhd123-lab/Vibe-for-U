import { useEffect, useState } from "react";
import { missions, lessons, rubric } from "./data";
import { kindNames, kinds, stageDone } from "./model";
import type { Kind, Mission, Work } from "./model";
import { Empty, Icon, Pill } from "./ui";
import { ClassReview } from "./ClassReview";
import { StoragePanel } from "./storageHealth";
import { SpeakButton } from "./Speak";
import { useLang, useT } from "./i18n";
const materialPath = (filename: string) =>
  `${import.meta.env.BASE_URL}materials/${filename}`;
const classroomDocuments = [
  {
    id: "teacher-guide",
    title: "교사용 사용 안내서",
    description: "앱 사용법, 차시별 시간표와 발문, 과정 평가, 저장·백업 안내",
    pages: 14,
    downloadName: "뚝딱_바이브_교사용_사용_안내서",
  },
  {
    id: "student-worksheets",
    title: "차시별 학생 활동지 전체",
    description: "1~8차시 예상·관찰·수정·재검사 기록지 · 차시마다 앞뒤 2쪽",
    pages: 16,
    downloadName: "뚝딱_바이브_차시별_학생_활동지",
  },
];
export type Navigate = (path: string) => void;
export { Home } from "./Welcome";
export function Missions({
  filter,
  works,
  go,
}: {
  filter?: string;
  works: Work[];
  go: Navigate;
}) {
  const valid = (kinds as string[]).includes(filter ?? "");
  const t = useT();
  const lang = useLang();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("한 번에 하나씩, 나의 속도로")}</span>
          <h1>{t("미션 공작대")}</h1>
          <p>
            {t("처음이라면 퀴즈 1부터. 문제를 찾는 연습은 퀴즈 3을 골라요.")}
          </p>
          {lang !== "ko" ? (
            <p className="note">{t("미션 본문은 한국어로 되어 있어요.")}</p>
          ) : null}
        </div>
      </div>
      <div className="filter-row">
        {["all", ...kinds].map((k) => (
          <button
            className={(!valid && k === "all") || k === filter ? "active" : ""}
            key={k}
            onClick={() => go(k === "all" ? "missions" : `missions/${k}`)}
          >
            {k === "all"
              ? t("전체 {n}개").replace("{n}", String(missions.length))
              : t(kindNames[k as Kind])}
          </button>
        ))}
      </div>
      <div className="mission-grid">
        {missions
          .filter((m) => !valid || m.kind === filter)
          .map((m) => {
            const attempts = works.filter((w) => w.missionId === m.id);
            const done = attempts.some((w) =>
              stageDone(w.draft).every(Boolean),
            );
            return (
              <button
                className={`mission-card ${m.kind}`}
                key={m.id}
                onClick={() => go(`mission/${m.id}`)}
              >
                <div className="project-card-top">
                  <Pill tone="paper">
                    {t(kindNames[m.kind])} {m.order}
                  </Pill>
                  {m.id === "quiz-1" ? <Pill>{t("첫 미션 추천")}</Pill> : null}
                  {m.learningError ? (
                    <Pill tone="orange">{t("학습용 오류 포함")}</Pill>
                  ) : null}
                </div>
                <h2>{m.title}</h2>
                <p>{m.goal}</p>
                <span className="muted small">
                  예상 → 실행 → {m.tests[0].label} → 수정
                </span>
                <div className="mission-footer">
                  <b>
                    {t(
                      done
                        ? "기록 완료"
                        : attempts.length
                          ? "진행 중"
                          : "아직 시작하지 않음",
                    )}
                  </b>
                  <Icon name="arrow" />
                </div>
              </button>
            );
          })}
      </div>
    </>
  );
}
export function MissionDetail({
  mission: m,
  create,
  share,
}: {
  mission: Mission;
  create: (m: Mission, normal?: boolean) => void;
  share: (text: string) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {kindNames[m.kind]} · 미션 {m.order}
          </span>
          <h1>{m.title}</h1>
          <p>{m.goal}</p>
        </div>
      </div>
      <div className="detail-layout">
        <div className="panel">
          <Pill tone={m.learningError ? "orange" : "green"}>
            {m.learningError
              ? "학습용 오류가 있는 시작 작품"
              : "정상 규칙으로 시작하는 작품"}
          </Pill>
          <h2>이번에는 이렇게 해 봐요</h2>
          <p>{m.guide}</p>
          <SpeakButton
            text={`${m.title}. ${m.goal} ${m.guide} 먼저 예상하기. ${m.prediction}`}
            label="미션 안내 듣기"
          />
          <h3>먼저 예상하기</h3>
          <p>{m.prediction}</p>
          <h3>검사할 것</h3>
          {m.tests.map((t) => (
            <div className="check-summary" key={t.label}>
              <Icon name="check" />
              <div>
                <b>{t.label}</b>
                <p>{t.expected}</p>
              </div>
            </div>
          ))}
          <h3>완료 기준</h3>
          <p>{m.completion}</p>
          <h3>마무리 질문</h3>
          <p>{m.closing}</p>
        </div>
        <aside className="panel mission-start">
          <span className={`project-icon ${m.kind}`}>
            <Icon name={m.kind} size={40} />
          </span>
          <h2>생각할 준비 됐나요?</h2>
          <p>
            여기서는 준비된 코드와 규칙을 바꿔요. 자유로운 요청문 자체를 코드로
            실행하지 않아요.
          </p>
          <button className="primary full" onClick={() => create(m)}>
            이 미션 시작하기 <Icon name="arrow" />
          </button>
          <button className="full" onClick={() => create(m, true)}>
            정상 규칙의 새 작품 만들기
          </button>
          <button
            className="text-button"
            onClick={() =>
              share(`${location.href.split("#")[0]}#/mission/${m.id}`)
            }
          >
            <Icon name="copy" />
            같은 미션 링크 복사
          </button>
          <p className="small muted">
            링크에는 미션 번호만 들어가요. 내 학습 기록은 공유되지 않아요.
          </p>
        </aside>
      </div>
    </>
  );
}
export function Teacher({
  create,
  go,
  copy,
  message,
}: {
  create: (m: Mission) => void;
  go: Navigate;
  copy: (text: string) => void;
  message: (s: string) => void;
}) {
  const [tab, setTab] = useState("lessons");
  const [cardKind, setCardKind] = useState<Kind | "all">("all");
  const lessonMissions = [
    "quiz-1",
    "quiz-1",
    "story-1",
    "quiz-4",
    "quiz-3",
    "quiz-1",
    "story-4",
    "timer-4",
  ];
  const classroomCards: { kind: Kind; action: string; expected: string }[] = [
    {
      kind: "quiz",
      action: "같은 정답을 세 번 누르기",
      expected: "한 문제의 점수는 한 번만 반영된다.",
    },
    {
      kind: "quiz",
      action: "마지막 문제까지 풀기",
      expected: "마지막 문제 뒤에 최종 점수와 결과가 나온다.",
    },
    {
      kind: "quiz",
      action: "다시 시작하기",
      expected: "점수 0점·첫 문제·답하지 않은 상태로 돌아간다.",
    },
    {
      kind: "story",
      action: "두 갈림길 모두 가 보기",
      expected: "각 선택이 의도한 장면으로 연결되고 모든 결말에 도달한다.",
    },
    {
      kind: "story",
      action: "처음으로 돌아가기",
      expected: "시작 장면으로 돌아가고 지나온 길이 비워진다.",
    },
    {
      kind: "timer",
      action: "시작을 연속으로 누르기",
      expected: "타이머 하나만 실행되고 시간이 두 배로 줄지 않는다.",
    },
    {
      kind: "timer",
      action: "일시정지 후 기다렸다가 재개하기",
      expected: "멈춘 동안 남은 시간이 유지되고 그 지점부터 이어진다.",
    },
    {
      kind: "timer",
      action: "0초가 된 뒤 기다리기",
      expected: "0초보다 작아지지 않고 종료 안내가 한 번 나온다.",
    },
    {
      kind: "timer",
      action: "초기화한 다음 다시 시작하기",
      expected: "설정한 시간·정지 상태로 돌아간 뒤 다시 실행된다.",
    },
    {
      kind: "pattern",
      action: "그리기 전에 모양을 예상하고 모두 그리기",
      expected: "명령 순서대로 칸이 칠해지고 목표 모양과 같다.",
    },
    {
      kind: "pattern",
      action: "한 칸씩 그리며 위치 기록하기",
      expected: "이동할 때마다 현재 위치가 한 칸씩 바뀐다.",
    },
    {
      kind: "pattern",
      action: "판 끝에 닿은 뒤에도 그리기",
      expected: "판 끝에서 멈추고 반대편 칸을 칠하지 않는다.",
    },
  ];
  useEffect(() => {
    let closed: HTMLDetailsElement[] = [];
    const expand = () => {
      closed = Array.from(
        document.querySelectorAll<HTMLDetailsElement>(".lesson:not([open])"),
      );
      closed.forEach((d) => {
        d.open = true;
      });
    };
    const restore = () => {
      closed.forEach((d) => {
        d.open = false;
      });
      closed = [];
    };
    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">모두에게 열린 학습 자료</span>
          <h1>교사 자료실</h1>
          <p>40분 × 8차시. 아이의 생각과 검사 과정을 함께 살펴보세요.</p>
        </div>
        <button onClick={() => window.print()}>
          <Icon name="print" />
          화면 안내 인쇄
        </button>
      </div>
      <div className="note">
        공개 학습 자료예요. 모드 선택은 교사 인증이나 접근 통제가 아니에요.
        3~4학년은 선택 카드와 짝 활동을 활용해 주세요.
      </div>
      <div className="filter-row no-print">
        {[
          ["lessons", "8차시 수업 안내"],
          ["cards", "검사표 · 짝 활동"],
          ["rubric", "과정 평가표"],
          ["class", "학급 작품 모으기"],
          ["examples", "시범 작품"],
        ].map(([k, t]) => (
          <button
            key={k}
            className={tab === k ? "active" : ""}
            onClick={() => setTab(k)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "lessons" ? (
        <>
          <section
            className="panel classroom-materials no-print"
            aria-labelledby="classroom-materials-title"
          >
            <div className="materials-heading">
              <div>
                <h2 id="classroom-materials-title">수업 자료 내려받기</h2>
                <p>
                  초등 5~6학년 기준 · 40분씩 8차시 · PDF로 인쇄하고 Word로
                  수정하세요.
                </p>
              </div>
              <a
                className="resource-link"
                href={materialPath("classroom-materials.zip")}
                download="뚝딱_바이브_8차시_수업자료.zip"
              >
                <Icon name="download" size={17} /> 모두 받기 · ZIP
              </a>
            </div>
            <div className="materials-grid">
              {classroomDocuments.map((document) => (
                <article className="material-card" key={document.id}>
                  <span className="material-pages">
                    {document.pages}쪽 · PDF / Word
                  </span>
                  <h3>{document.title}</h3>
                  <p>{document.description}</p>
                  <div className="button-row">
                    <a
                      className="resource-link primary"
                      href={materialPath(`${document.id}.pdf`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${document.title} PDF 열기 (새 탭)`}
                    >
                      PDF 열기 <Icon name="arrow" size={15} />
                    </a>
                    <a
                      className="resource-link"
                      href={materialPath(`${document.id}.pdf`)}
                      download={`${document.downloadName}.pdf`}
                      aria-label={`${document.title} PDF 내려받기`}
                    >
                      <Icon name="download" size={15} /> PDF 내려받기
                    </a>
                    <a
                      className="resource-link"
                      href={materialPath(`${document.id}.docx`)}
                      download={`${document.downloadName}.docx`}
                      aria-label={`${document.title} Word 수정본 내려받기`}
                    >
                      Word 수정본
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="materials-help">
              오늘 쓸 활동지만 필요하면 아래 차시를 펼쳐 받으세요. 한 면당 한
              쪽으로 인쇄하고, 양면 인쇄는 긴 쪽 넘김을 선택하세요. 6차시 외부
              AI 도구는 교사·성인이 조작해요.
            </p>
          </section>
          <div className="lessons">
            {lessons.map((l, i) => (
              <details className="panel lesson" key={l.title} open={i === 0}>
                <summary>
                  <span className="lesson-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>{l.title}</h2>
                    <span>{l.goal}</span>
                  </div>
                  <Icon name="chevron" />
                </summary>
                <div className="lesson-body">
                  <div className="lesson-actions no-print">
                    <b>
                      이 차시에 연결한 미션 ·{" "}
                      {missions.find((m) => m.id === lessonMissions[i])!.title}
                    </b>
                    <div className="button-row">
                      <button
                        onClick={() => go(`mission/${lessonMissions[i]}`)}
                      >
                        미션 안내 열기 <Icon name="arrow" size={16} />
                      </button>
                      <button
                        onClick={() =>
                          copy(
                            `${location.href.split("#")[0]}#/mission/${lessonMissions[i]}`,
                          )
                        }
                      >
                        <Icon name="copy" size={16} />
                        학생용 미션 주소 복사
                      </button>
                    </div>
                    <small>
                      주소에는 미션만 들어가요. 학생의 기록은 각자 기기에
                      남아요.
                    </small>
                    <div className="lesson-worksheet">
                      <b>{i + 1}차시 학생 활동지 · 앞뒤 2쪽</b>
                      <div className="button-row">
                        <a
                          className="resource-link"
                          href={materialPath(
                            `student-lesson-${String(i + 1).padStart(2, "0")}.pdf`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${i + 1}차시 학생 활동지 PDF 열기 (새 탭)`}
                        >
                          활동지 PDF 열기 <Icon name="arrow" size={15} />
                        </a>
                        <a
                          className="resource-link"
                          href={materialPath(
                            `student-lesson-${String(i + 1).padStart(2, "0")}.pdf`,
                          )}
                          download={`뚝딱_바이브_${i + 1}차시_학생_활동지.pdf`}
                          aria-label={`${i + 1}차시 학생 활동지 내려받기`}
                        >
                          <Icon name="download" size={15} /> 활동지 내려받기
                        </a>
                      </div>
                    </div>
                  </div>
                  <p>
                    <b>준비물</b> {l.materials}
                  </p>
                  <div className="lesson-schedule">
                    <div>
                      <Pill>도입 5분</Pill>
                      <p>{l.intro}</p>
                    </div>
                    <div>
                      <Pill tone="green">전개 30분</Pill>
                      <p>{l.activity}</p>
                    </div>
                    <div>
                      <Pill tone="orange">정리 5분</Pill>
                      <p>{l.close}</p>
                    </div>
                  </div>
                  <p>
                    <b>교사 발문</b> “{l.question}”
                  </p>
                  <p>
                    <b>관찰 기준</b> {l.observe}
                  </p>
                  <p>
                    <b>기기 문제 대안</b> {l.fallback}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </>
      ) : null}
      {tab === "cards" ? (
        <div className="panel printable">
          <h2>짝 활동 · 역할을 바꿔요</h2>
          <p>
            운전자: 버튼을 누르고 규칙을 수정해요. 관찰자: 실행 전에 예상하고,
            결과와 이유를 적어요.
          </p>
          <p>
            10분마다 역할을 교대해요. 먼저 답을 알려 주기보다 “어떻게
            검사할까?”를 물어보세요.
          </p>
          <h2>인쇄용 검사 카드</h2>
          <label className="field no-print">
            <span>검사표 프로젝트</span>
            <select
              value={cardKind}
              onChange={(e) => setCardKind(e.target.value as Kind | "all")}
            >
              <option value="all">모든 프로젝트</option>
              <option value="quiz">퀴즈</option>
              <option value="story">갈림길 이야기</option>
              <option value="timer">타이머</option>
              <option value="pattern">패턴 그리기</option>
            </select>
          </label>
          <p>
            기대한 결과는 정상 규칙의 예시예요. 작품의 약속에 맞게 조정해서
            사용하고, 실제 결과는 직접 관찰한 뒤 적어 주세요.
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="검사표 · 좌우 방향키로 이동해 읽기"
          >
            <table>
              <thead>
                <tr>
                  <th>검사 행동</th>
                  <th>기대한 결과</th>
                  <th>실제 결과 / 판정</th>
                </tr>
              </thead>
              <tbody>
                {classroomCards
                  .filter((c) => cardKind === "all" || c.kind === cardKind)
                  .map((c) => (
                    <tr key={c.action}>
                      <td>
                        <small>{kindNames[c.kind]}</small>
                        <br />
                        {c.action}
                      </td>
                      <td>{c.expected}</td>
                      <td className="write-space">
                        실제: __________________
                        <br />□ 확인 □ 수정 필요 □ 미확인
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <h3>수정과 재검사</h3>
          <p>발생 상황: _____________________</p>
          <p>바꾼 규칙과 이유: _____________________</p>
          <p>같은 행동으로 다시 검사한 결과: _____________________</p>
          <p>친구의 관찰 의견: _____________________</p>
        </div>
      ) : null}
      {tab === "rubric" ? (
        <div className="panel printable">
          <h2>과정 평가표</h2>
          <p>
            프롬프트 길이, 코드 줄 수, 장식의 양으로 이해도를 평가하지 않습니다.
            실제 기록과 설명을 근거로 단계와 의견을 적습니다.
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="과정 평가표 · 좌우 방향키로 이동해 읽기"
          >
            <table>
              <thead>
                <tr>
                  {[
                    "관찰 항목",
                    "시작 단계",
                    "수행 단계",
                    "설명·적용 단계",
                  ].map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rubric.map((row) => (
                  <tr key={row[0]}>
                    {row.map((t, i) => (
                      <td key={i}>{t}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>확인한 근거 / 다음 도움: _____________________________________</p>
        </div>
      ) : null}
      {tab === "class" ? <ClassReview message={message} /> : null}
      {tab === "examples" ? (
        <div className="project-grid">
          {["quiz-3", "story-3", "timer-3"].map((id) => {
            const m = missions.find((m) => m.id === id)!;
            return (
              <div className={`project-card ${m.kind}`} key={id}>
                <Icon name={m.kind} size={32} />
                <h2>{m.title}</h2>
                <p>{m.task}</p>
                <button onClick={() => create(m)}>시범 작품 열기</button>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
export function Library({
  works,
  go,
  exportAll,
  importFile,
  remove,
  nextUser,
  clearAll,
  hiddenCount,
  reveal,
  message,
}: {
  works: Work[];
  go: Navigate;
  exportAll: () => void;
  importFile: () => void;
  remove: (w: Work) => void;
  nextUser: () => void;
  clearAll: () => void;
  hiddenCount: number;
  reveal: () => void;
  message: (s: string) => void;
}) {
  const t = useT();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("한 번의 완성보다, 쌓이는 변화")}</span>
          <h1>{t("내 작품 선반")}</h1>
          <p>{t("자동 저장된 편집본과 직접 남긴 수정 버전을 다시 만나요.")}</p>
        </div>
        <div className="button-row">
          <button onClick={() => go("peer")}>{t("친구 작품 검사하기")}</button>
          <button onClick={importFile}>
            <Icon name="folder" />
            {t("파일 가져오기")}
          </button>
          <button disabled={!works.length} onClick={exportAll}>
            <Icon name="download" />
            {t("목록 백업")}
          </button>
        </div>
      </div>
      <div className="note">
        <Icon name="shield" />
        현재 기기와 브라우저에 저장돼요. 다른 기기에서 이어 하려면 파일로
        내보내세요. 공용 기기의 기록은 개인별로 비밀 보호되지 않아요.
      </div>
      {hiddenCount ? (
        <div className="warning">
          이전 사용자의 작품 {hiddenCount}개는 이어서 학습에 연결하지 않았어요.{" "}
          <button onClick={reveal}>공용 기기 기록을 명시적으로 열기</button>
        </div>
      ) : null}
      {works.length ? (
        <div className="work-grid">
          {[...works]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((w) => (
              <article className="panel work-card" key={w.id}>
                <div className="project-card-top">
                  <span className={`project-icon ${w.kind}`}>
                    <Icon name={w.kind} />
                  </span>
                  <Pill tone="paper">
                    {stageDone(w.draft).filter(Boolean).length} / 5단계 기록
                  </Pill>
                </div>
                <h2>{w.draft.title || "제목 없는 작품"}</h2>
                <p>
                  {kindNames[w.kind]} · 버전 {w.versions.length}개
                </p>
                <small>
                  최근 수정 {new Date(w.updatedAt).toLocaleString("ko-KR")}
                </small>
                <div className="button-row">
                  <button
                    className="primary"
                    onClick={() => go(`work/${w.id}/0`)}
                  >
                    {t("작품 열기")}
                  </button>
                  <button onClick={() => go(`portfolio/${w.id}`)}>
                    {t("포트폴리오")}
                  </button>
                  <button
                    className="danger-text"
                    aria-label={`${w.draft.title} 삭제`}
                    onClick={() => remove(w)}
                  >
                    <Icon name="trash" />
                    {t("삭제")}
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <Empty title="첫 생각을 담을 빈 선반이에요">
          <p>
            미션 하나를 골라 작품을 만들어 보세요. 백업 파일이 있다면 가져올
            수도 있어요.
          </p>
          <button className="primary" onClick={() => go("missions")}>
            미션 고르기 <Icon name="arrow" />
          </button>
        </Empty>
      )}
      <StoragePanel message={message} />
      <div className="shared-device panel">
        <div>
          <h2>{t("공용 기기 정리")}</h2>
          <p>
            다음 사용자는 이전 기록을 자동으로 이어받지 않아요. 삭제 전에는 파일
            백업을 선택할 수 있어요.
          </p>
          <small>
            가져오기: JSON 2MB 이하 · 한 파일 최대 50작품 · 작품당 버전 30개 ·
            문항 20개 · 장면 24개 · 글 4,000자
          </small>
        </div>
        <div className="button-row">
          <button onClick={nextUser}>{t("다음 사용자 시작")}</button>
          <button className="danger-text" onClick={clearAll}>
            {t("이 앱의 데이터 전체 삭제")}
          </button>
        </div>
      </div>
    </>
  );
}
