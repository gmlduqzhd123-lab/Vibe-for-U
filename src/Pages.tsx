import { useEffect, useState } from "react";
import { missions, lessons, rubric } from "./data";
import { kindNames, stageDone } from "./model";
import type { Kind, Mission, Mode, Work } from "./model";
import { Empty, Icon, Mascot, Pill } from "./ui";
export type Navigate = (path: string) => void;
export function Home({
  mode,
  setMode,
  works,
  lastWork,
  go,
  create,
}: {
  mode: Mode;
  setMode: (v: Mode) => void;
  works: Work[];
  lastWork?: Work;
  go: Navigate;
  create: (m: Mission, normal?: boolean) => void;
}) {
  const complete = works.filter((w) =>
    stageDone(w.draft).every(Boolean),
  ).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">작은 생각이, 나만의 앱이 되는 곳</span>
          <h1>
            {mode === "child"
              ? "오늘은 어떤 생각을 만들어 볼까요?"
              : "생각한 도구를 직접 만들어 보세요."}
          </h1>
          <p>예상하고, 직접 해 보고, 조금씩 고치며 배워요.</p>
        </div>
        <span className="date-chip">40분씩, 차근차근</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <Pill tone="paper">
            <Icon name="spark" size={14} /> 생각을 현실로 만드는 첫걸음
          </Pill>
          <h2>
            “이런 앱이 있으면 좋겠다!”
            <br />그 생각부터 시작해요.
          </h2>
          <p>
            코드를 몰라도 괜찮아요. 준비된 코드와 규칙을 바꾸며
            <br className="desktop-br" /> 나만의 앱 만들기를 연습해요.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => create(missions[0])}>
              첫 작품 만들기 <Icon name="arrow" size={18} />
            </button>
            <button
              className="hero-secondary"
              onClick={() =>
                lastWork ? go(`work/${lastWork.id}/0`) : go("library")
              }
            >
              이어서 학습하기
            </button>
          </div>
          <div className="hero-foot">
            <span>
              <Icon name="check" size={15} /> 가입 없이 바로 시작
            </span>
            <span>
              <Icon name="shield" size={15} /> 기록은 내 기기에
            </span>
          </div>
        </div>
        <div className="hero-art">
          <span className="sketch-note">
            생각 한 스푼
            <br />
            <b>도전 한 스푼!</b>
          </span>
          <Mascot />
          <span className="art-label">나도 앱을 만들 수 있어요</span>
        </div>
      </section>
      <section className="mode-strip">
        <div>
          <Icon name="spark" />
          <div>
            <b>나에게 맞는 안내를 골라요</b>
            <span>언제든 바꿀 수 있어요. 만들던 작품은 그대로!</span>
          </div>
        </div>
        <div className="segmented" aria-label="사용자 모드">
          <button
            className={mode === "child" ? "active" : ""}
            aria-pressed={mode === "child"}
            onClick={() => setMode("child")}
          >
            어린이 모드
          </button>
          <button
            className={mode === "adult" ? "active" : ""}
            aria-pressed={mode === "adult"}
            onClick={() => setMode("adult")}
          >
            일반 입문자 모드
          </button>
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>어떤 앱을 만들어 볼까요?</h2>
            <p>세 가지 공작대에서, 열두 가지 미션에 도전해요.</p>
          </div>
          <button className="text-button" onClick={() => go("missions")}>
            모든 미션 보기 <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="project-grid">
          {(["quiz", "story", "timer"] as Kind[]).map((kind, i) => (
            <button
              key={kind}
              className={`project-card ${kind}`}
              onClick={() => go(`missions/${kind}`)}
            >
              <div className="project-card-top">
                <span className="project-icon">
                  <Icon name={kind} size={30} />
                </span>
                <Pill tone="paper">미션 4개</Pill>
              </div>
              <h3>{kindNames[kind]} 만들기</h3>
              <p>
                {
                  [
                    "정답을 고르면 점수가 쑥!\n나만의 문제로 배우는 퀴즈",
                    "내 선택에 따라 달라지는 이야기.\n두근두근, 다음 장면은?",
                    "시작, 멈춤, 다시 시작!\n시간을 다루는 작은 도구",
                  ][i]
                }
              </p>
              <div className="project-bottom">
                <span>
                  {
                    [
                      "선택 · 조건 · 점수",
                      "선택 · 연결 · 흐름",
                      "시간 · 상태 · 반복",
                    ][i]
                  }
                </span>
                <span className="circle-arrow">
                  <Icon name="arrow" size={18} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="home-bottom">
        <div className="journey panel">
          <div className="section-heading">
            <h2>우리는 이렇게 만들어요</h2>
            <span className="muted small">결과보다 중요한, 만드는 과정</span>
          </div>
          <div className="journey-steps">
            {[
              "목표 정하기",
              "요청 작성하기",
              "예상하고 실행",
              "검사하고 수정",
              "설명하고 저장",
            ].map((t, i) => (
              <div key={t}>
                <span>{i + 1}</span>
                <b>{t}</b>
                {i < 4 ? <Icon name="chevron" size={14} /> : null}
              </div>
            ))}
          </div>
        </div>
        <button className="teacher-callout" onClick={() => go("teacher")}>
          <Icon name="book" size={26} />
          <div>
            <b>선생님도 함께해요</b>
            <p>8차시 수업 안내와 검사 카드</p>
          </div>
          <Icon name="arrow" />
        </button>
      </section>
      {works.length ? (
        <div className="local-progress">
          <span>
            지금까지 만든 작품 <b>{works.length}개</b>
          </span>
          <span>
            모든 단계 기록 완료 <b>{complete}개</b>
          </span>
          <button className="text-button" onClick={() => go("library")}>
            내 작품 열기 →
          </button>
        </div>
      ) : null}
      <p className="privacy-line">
        <Icon name="shield" size={15} /> 기본 연습과 학습 기록은 외부로 자동
        전송되지 않아요. 실제 AI 제작은 교사·성인과 별도로 진행해요.
      </p>
    </>
  );
}
export function Missions({
  filter,
  works,
  go,
}: {
  filter?: string;
  works: Work[];
  go: Navigate;
}) {
  const valid = ["quiz", "story", "timer"].includes(filter ?? "");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">한 번에 하나씩, 나의 속도로</span>
          <h1>미션 공작대</h1>
          <p>처음이라면 퀴즈 1부터. 문제를 찾는 연습은 퀴즈 3을 골라요.</p>
        </div>
      </div>
      <div className="filter-row">
        {["all", "quiz", "story", "timer"].map((k) => (
          <button
            className={(!valid && k === "all") || k === filter ? "active" : ""}
            key={k}
            onClick={() => go(k === "all" ? "missions" : `missions/${k}`)}
          >
            {k === "all" ? "전체 12개" : kindNames[k as Kind]}
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
                    {kindNames[m.kind]} {m.order}
                  </Pill>
                  {m.id === "quiz-1" ? <Pill>첫 미션 추천</Pill> : null}
                  {m.learningError ? (
                    <Pill tone="orange">학습용 오류 포함</Pill>
                  ) : null}
                </div>
                <h2>{m.title}</h2>
                <p>{m.goal}</p>
                <span className="muted small">
                  예상 → 실행 → {m.tests[0].label} → 수정
                </span>
                <div className="mission-footer">
                  <b>
                    {done
                      ? "기록 완료"
                      : attempts.length
                        ? "진행 중"
                        : "아직 시작하지 않음"}
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
}: {
  create: (m: Mission) => void;
  go: Navigate;
  copy: (text: string) => void;
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
          <Icon name="print" />이 자료 인쇄
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
                    <button onClick={() => go(`mission/${lessonMissions[i]}`)}>
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
                    주소에는 미션만 들어가요. 학생의 기록은 각자 기기에 남아요.
                  </small>
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
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">한 번의 완성보다, 쌓이는 변화</span>
          <h1>내 작품 선반</h1>
          <p>자동 저장된 편집본과 직접 남긴 수정 버전을 다시 만나요.</p>
        </div>
        <div className="button-row">
          <button onClick={importFile}>
            <Icon name="folder" />
            파일 가져오기
          </button>
          <button disabled={!works.length} onClick={exportAll}>
            <Icon name="download" />
            목록 백업
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
                    작품 열기
                  </button>
                  <button onClick={() => go(`portfolio/${w.id}`)}>
                    포트폴리오
                  </button>
                  <button
                    className="danger-text"
                    aria-label={`${w.draft.title} 삭제`}
                    onClick={() => remove(w)}
                  >
                    <Icon name="trash" />
                    삭제
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
      <div className="shared-device panel">
        <div>
          <h2>공용 기기 정리</h2>
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
          <button onClick={nextUser}>다음 사용자 시작</button>
          <button className="danger-text" onClick={clearAll}>
            이 앱의 데이터 전체 삭제
          </button>
        </div>
      </div>
    </>
  );
}
