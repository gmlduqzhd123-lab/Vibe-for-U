import { useEffect, useRef, useState } from "react";
import { lessons, missions, quiz, story, timer } from "./data";
import { answerQuiz, initialQuiz } from "./engines";
import { stageDone } from "./model";
import type { Kind, Mission, Mode, QuizConfig, Work } from "./model";
import { Preview } from "./Preview";
import { Icon, Mascot, Pill } from "./ui";

type Go = (path: string) => void;
type Create = (
  mission: Mission,
  normal?: boolean,
  starter?: { prediction: string; reason: string },
) => void;
export const lessonMissionIds = [
  "quiz-1",
  "quiz-1",
  "story-1",
  "quiz-4",
  "quiz-3",
  "quiz-1",
  "story-4",
  "timer-4",
];
export const materialUrl = (file: string) =>
  `${import.meta.env.BASE_URL}materials/${file}`;
const practiceQuiz = quiz as QuizConfig;
const errorQuiz: QuizConfig = { ...practiceQuiz, scoring: "attempt" };

export function LearningWords({ compact = false }: { compact?: boolean }) {
  return (
    <details
      className={`learning-words panel ${compact ? "compact no-print" : ""}`}
    >
      <summary>낯선 말은 쉽게 풀어볼까요?</summary>
      <dl className="word-grid">
        {[
          ["요청문", "만들고 싶은 것과 지켜야 할 약속을 설명하는 말이에요."],
          ["검사", "내 생각대로 움직이는지 직접 확인하는 일이에요."],
          ["버그", "기대한 것과 다르게 움직이는 부분이에요."],
          ["상태", "점수나 남은 시간처럼 앱이 지금 기억하는 값이에요."],
          ["버전", "고치기 전후의 모습을 이름 붙여 남긴 것이에요."],
          [
            "포트폴리오",
            "예상·검사·수정 이유를 모아 내가 배운 것을 소개하는 기록이에요.",
          ],
        ].map(([term, meaning]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function DemoLab({ go }: { go: Go }) {
  const [kind, setKind] = useState<Kind>("quiz");
  const config =
    kind === "quiz"
      ? quiz
      : kind === "story"
        ? story
        : {
            ...timer,
            seconds: 5,
            endMessage: "5초가 끝났어요! 잠깐 쉬어 가요.",
          };
  return (
    <section className="panel demo-lab" aria-labelledby="demo-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">완성 예제부터 눌러보세요</span>
          <h2 id="demo-title">어떤 앱을 만드는 곳인가요?</h2>
          <p>
            답을 고르고, 길을 바꾸고, 시간을 멈춰 보세요. 이 체험은 작품을
            저장하지 않아요.
          </p>
        </div>
      </div>
      <div className="demo-layout">
        <div className="demo-choices" role="group" aria-label="완성 예제 선택">
          {(
            [
              ["quiz", "퀴즈 눌러보기", "정답을 고르면 안내와 점수가 나와요."],
              ["story", "이야기 눌러보기", "내 선택에 따라 다른 결말로 가요."],
              [
                "timer",
                "타이머 눌러보기",
                "5초를 시작하고 멈췄다가 이어 가요.",
              ],
            ] as const
          ).map(([id, title, description]) => (
            <button
              key={id}
              aria-pressed={kind === id}
              className={kind === id ? "selected" : ""}
              onClick={() => setKind(id)}
            >
              <Icon name={id} size={26} />
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
            </button>
          ))}
          <button className="text-button" onClick={() => go("try")}>
            이제 내가 고쳐보기 · 3분 <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="demo-screen" aria-label="저장하지 않는 완성 예제">
          <Preview key={kind} config={config} onRun={() => {}} />
        </div>
      </div>
    </section>
  );
}

const journey = [
  ["생각하기", "목표 정하기", "누가 쓸까요?", "친구가 쓸 퀴즈를 만들래요."],
  [
    "설명하기",
    "요청 작성하기",
    "무엇이 나와야 할까요?",
    "같은 문제는 한 번만 채점해 줘.",
  ],
  [
    "실행하기",
    "예상하고 실행",
    "먼저 예상하고 눌러요.",
    "세 번 눌러도 1점일 것 같아요.",
  ],
  [
    "고치기",
    "검사하고 수정",
    "다르면 규칙을 바꿔요.",
    "3점이네? 한 번만 채점하도록 고칠래요.",
  ],
  [
    "소개하기",
    "설명하고 저장",
    "바꾼 까닭을 말해요.",
    "이미 답했는지 기억하면 돼요.",
  ],
];
export function LearningPath() {
  return (
    <section className="learning-path" aria-labelledby="path-title">
      <div className="section-heading">
        <div>
          <h2 id="path-title">다섯 장면으로 보는 앱 만들기</h2>
          <p>완성 화면보다 예상하고 고친 이유가 중요해요.</p>
        </div>
      </div>
      <ol className="path-cards">
        {journey.map(([simple, stage, action, speech], index) => (
          <li key={stage}>
            <span className="path-number">{index + 1}</span>
            <h3>{simple}</h3>
            <span className="small muted">작업실의 {stage}</span>
            <a
              href={`${import.meta.env.BASE_URL}guide/step-${index + 1}.png`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${stage} 실제 화면 크게 보기 (새 탭)`}
            >
              <img
                src={`${import.meta.env.BASE_URL}guide/step-${index + 1}.png`}
                alt={`${stage} 단계의 실제 작업실 화면`}
                loading="lazy"
                width="320"
                height="210"
              />
            </a>
            <b>{action}</b>
            <p className="speech">“{speech}”</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BeforeAfter({ go }: { go: Go }) {
  const [compared, setCompared] = useState(false);
  const repeated = (config: QuizConfig) =>
    [0, 0, 0].reduce((state) => answerQuiz(config, state, 0), initialQuiz())
      .score;
  return (
    <section className="panel before-after" aria-labelledby="compare-title">
      <span className="eyebrow">규칙 비교 예제</span>
      <h2 id="compare-title">이렇게 고치며 원리를 배워요</h2>
      <p>같은 문제의 같은 정답을 세 번 눌렀을 때, 두 규칙을 비교해 보세요.</p>
      <div className="compare-grid" aria-live="polite">
        <div>
          <Pill tone="orange">고치기 전</Pill>
          <h3>누를 때마다 점수가 올라가요</h3>
          <strong>{compared ? `${repeated(errorQuiz)}점` : "?점"}</strong>
          <p>버튼을 누를 때마다 1점씩 더하는 규칙</p>
        </div>
        <div>
          <Pill tone="green">고친 후</Pill>
          <h3>한 문제는 한 번만 채점해요</h3>
          <strong>{compared ? `${repeated(practiceQuiz)}점` : "?점"}</strong>
          <p>이미 답한 문제인지 기억하고 확인하는 규칙</p>
        </div>
      </div>
      <div className="button-row">
        <button onClick={() => setCompared(true)}>
          같은 정답 세 번 비교하기
        </button>
        <button className="text-button" onClick={() => go("try")}>
          내 손으로 고쳐보기 →
        </button>
      </div>
      {compared ? (
        <p className="comparison-reason">
          고친 까닭: 누른 횟수보다 맞힌 문제 수를 세려면, 이미 답했는지 기억해야
          해요.
        </p>
      ) : null}
    </section>
  );
}

function SubjectLinks({ go }: { go: Go }) {
  return (
    <section aria-labelledby="subject-title">
      <div className="section-heading">
        <div>
          <h2 id="subject-title">우리 수업에서는 이렇게 써요</h2>
          <p>수업 아이디어예요. 문항·이야기·시간은 배운 내용에 맞게 바꿔요.</p>
        </div>
      </div>
      <div className="subject-grid">
        {[
          [
            "과학",
            "배운 내용을 확인하는 퀴즈",
            "식물에게 필요한 것을 묻고, 정답·오답 안내를 바꿔요.",
            "quiz-1",
            "quiz",
          ],
          [
            "국어",
            "내 선택으로 이어지는 이야기",
            "갈림길의 선택과 결말을 연결하고 친구가 읽기 쉽게 고쳐요.",
            "story-1",
            "story",
          ],
          [
            "체육",
            "운동과 휴식을 알리는 타이머",
            "운동할 시간을 정하고 멈춤·재개·종료 안내를 검사해요.",
            "timer-4",
            "timer",
          ],
        ].map(([subject, title, description, id, icon]) => (
          <article className="panel subject-card" key={subject}>
            <Icon name={icon} size={26} />
            <span className="subject-label">{subject} 수업 아이디어</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <button onClick={() => go(`mission/${id}`)}>
              {subject} 활동 안내 열기 <Icon name="arrow" size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TeacherStarter({
  go,
  full = false,
}: {
  go: Go;
  full?: boolean;
}) {
  const [lesson, setLesson] = useState(0);
  const current = lessons[lesson];
  return (
    <section className="panel teacher-starter" aria-labelledby="starter-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">선생님의 수업 준비</span>
          <h2 id="starter-title">내일 바로 하는 40분 수업</h2>
          <p>기기 1대당 2명 · 활동지 1인 1부 · 학생 계정 가입 없이 시작해요.</p>
        </div>
      </div>
      {full ? (
        <label className="field">
          <span>준비할 차시</span>
          <select
            value={lesson}
            onChange={(event) => setLesson(Number(event.target.value))}
          >
            {lessons.map((item, index) => (
              <option value={index} key={item.title}>
                {index + 1}차시 · {item.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <Pill>1차시 · {current.title}</Pill>
      )}
      <h3 className="starter-goal">오늘의 목표 · {current.goal}</h3>
      <p>
        <b>준비물</b> {current.materials} · 브라우저에서 미션과 저장 상태를 먼저
        확인하세요.
      </p>
      <div className="starter-timeline">
        <div>
          <b>도입 5분</b>
          <p>{current.intro}</p>
        </div>
        <div>
          <b>활동 30분</b>
          <p>{current.activity}</p>
        </div>
        <div>
          <b>정리 5분</b>
          <p>{current.close}</p>
        </div>
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => go(`mission/${lessonMissionIds[lesson]}`)}
        >
          이 수업 미션 열기 <Icon name="arrow" size={16} />
        </button>
        <a
          className="resource-link"
          href={materialUrl(
            `student-lesson-${String(lesson + 1).padStart(2, "0")}.pdf`,
          )}
          download={`뚝딱_바이브_${lesson + 1}차시_학생_활동지.pdf`}
        >
          이 차시 활동지 받기 · 2쪽
        </a>
        <a
          className="resource-link"
          href={materialUrl("teacher-guide.pdf")}
          target="_blank"
          rel="noopener noreferrer"
        >
          교사용 안내서 열기 · 새 탭
        </a>
        <button onClick={() => go(full ? "teacher" : "prepare")}>
          {full ? "전체 자료와 8차시 안내" : "다른 차시도 준비하기"}
        </button>
      </div>
      {lesson === 5 ? (
        <p className="note">
          6차시의 외부 AI 도구는 교사·성인이 조작해요. 사전 예제를 준비하고
          생성·미실행을 구별해 기록해요.
        </p>
      ) : null}
      {full ? (
        <>
          <h3>수업에서 살펴볼 것</h3>
          <p>{current.observe}</p>
          <p>
            <b>기기 문제가 생기면</b> {current.fallback}
          </p>
          <p>
            <b>도움 조절</b> 3~4학년은 교사가 읽어 주고 선택 카드로 말해요.
            5~6학년은 짝과 예상·실제·이유를 기록해요. 빠른 학생은 조건을 하나 더
            바꾸고 재검사해요.
          </p>
        </>
      ) : null}
    </section>
  );
}

export function Home({
  mode,
  setMode,
  works,
  lastWork,
  go,
  create,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  works: Work[];
  lastWork?: Work;
  go: Go;
  create: Create;
}) {
  return (
    <div className="welcome-home">
      <section className="welcome-hero">
        <div>
          <span className="eyebrow">
            뚝딱 바이브 공작소 · 처음 만나는 코딩의 원리
          </span>
          <h1>
            퀴즈·이야기·타이머를
            <br />
            만들고 고치며 배워요.
          </h1>
          <p className="welcome-lead">
            코드를 몰라도, 작은 앱을 눌러 보고 규칙 하나를 고칠 수 있어요.
            <br className="desktop-br" /> 예상하고 확인하며 내 생각을 설명하는
            연습을 해요.
          </p>
          <div className="entry-grid">
            <button
              className="entry-button student"
              onClick={() => go("explore")}
            >
              <Icon name="play" size={25} />
              <span>
                <b>학생 체험하기</b>
                <small>예제부터 눌러보고 3분 도전</small>
              </span>
              <Icon name="arrow" />
            </button>
            <button
              className="entry-button teacher"
              onClick={() => go("prepare")}
            >
              <Icon name="book" size={25} />
              <span>
                <b>교사 수업 준비</b>
                <small>40분 수업과 활동지 바로 준비</small>
              </span>
              <Icon name="arrow" />
            </button>
          </div>
          <div className="button-row welcome-secondary">
            <button className="text-button" onClick={() => create(missions[0])}>
              첫 작품 만들기 <Icon name="arrow" size={16} />
            </button>
            <button
              className="text-button"
              onClick={() =>
                lastWork ? go(`work/${lastWork.id}/0`) : go("library")
              }
            >
              이어서 학습하기
            </button>
            <span>가입 없이 · 기록은 내 기기에</span>
          </div>
        </div>
        <div className="welcome-mascot">
          <Mascot />
          <span>“먼저 해 보고, 하나씩 고쳐요!”</span>
        </div>
      </section>
      <DemoLab go={go} />
      <section className="quick-invite panel">
        <div>
          <Pill tone="orange">3분 첫 체험</Pill>
          <h2>같은 정답을 세 번 누르면 몇 점일까요?</h2>
          <p>예상 → 이상한 점수 발견 → 규칙 하나 수정 → 같은 행동으로 확인</p>
        </div>
        <button className="primary" onClick={() => go("try")}>
          3분 체험 시작 <Icon name="arrow" />
        </button>
      </section>
      <LearningPath />
      <SubjectLinks go={go} />
      <BeforeAfter go={go} />
      <TeacherStarter go={go} />
      <LearningWords />
      <section className="panel share-invite">
        <div>
          <h2>함께 써 볼 친구와 선생님에게</h2>
          <p>앱 소개와 차시별 미션을 QR 카드로 인쇄하거나 이미지로 나눠요.</p>
        </div>
        <button onClick={() => go("share")}>
          QR 소개 카드 만들기 <Icon name="arrow" />
        </button>
      </section>
      <section className="mode-strip">
        <div>
          <Icon name="spark" />
          <div>
            <b>나에게 맞는 안내를 골라요</b>
            <span>
              작품과 기록은 유지해요. 교사 자료는 모두에게 열려 있어요.
            </span>
          </div>
        </div>
        <div className="segmented" aria-label="사용자 모드">
          <button
            aria-pressed={mode === "child"}
            className={mode === "child" ? "active" : ""}
            onClick={() => setMode("child")}
          >
            어린이 모드
          </button>
          <button
            aria-pressed={mode === "adult"}
            className={mode === "adult" ? "active" : ""}
            onClick={() => setMode("adult")}
          >
            일반 입문자 모드
          </button>
        </div>
      </section>
      <div className="button-row">
        <button onClick={() => go("missions")}>
          모든 미션 보기 <Icon name="grid" />
        </button>
        <button onClick={() => go("teacher")}>
          전체 교사 자료 열기 <Icon name="book" />
        </button>
      </div>
      {works.length ? (
        <div className="local-progress">
          <span>
            지금까지 만든 작품 <b>{works.length}개</b>
          </span>
          <span>
            모든 단계 기록 완료{" "}
            <b>
              {
                works.filter((work) => stageDone(work.draft).every(Boolean))
                  .length
              }
              개
            </b>
          </span>
          <button className="text-button" onClick={() => go("library")}>
            내 작품 열기 →
          </button>
        </div>
      ) : null}
      <p className="privacy-line">
        <Icon name="shield" size={15} /> 기본 연습은 준비된 코드와 규칙을
        사용해요. 실제 AI 제작은 교사·성인과 별도로 진행해요.
      </p>
    </div>
  );
}

export function Explore({ go }: { go: Go }) {
  return (
    <div className="welcome-home">
      <div className="page-heading">
        <div>
          <span className="eyebrow">학생 체험하기</span>
          <h1>먼저 눌러보고, 하나만 고쳐봐요</h1>
          <p>
            처음이어도 괜찮아요. 예제에서 시작하고 내 작품으로 이어갈 수 있어요.
          </p>
        </div>
        <button onClick={() => go("home")}>홈으로</button>
      </div>
      <div className="support-badges">
        <span>처음이라면 · 예제 눌러보기</span>
        <span>3~4학년 · 선생님과 말로 설명</span>
        <span>5~6학년 · 짝과 예상·검사</span>
      </div>
      <DemoLab go={go} />
      <section className="panel quick-invite">
        <div>
          <h2>다음은 3분 첫 체험</h2>
          <p>
            정답을 세 번 누르고 점수 규칙을 직접 고쳐봐요. 시간 제한은 없어요.
          </p>
        </div>
        <button className="primary" onClick={() => go("try")}>
          3분 체험 시작 →
        </button>
      </section>
      <LearningPath />
      <LearningWords />
    </div>
  );
}

export function Prepare({ go }: { go: Go }) {
  return (
    <div className="welcome-home">
      <div className="page-heading">
        <div>
          <span className="eyebrow">교사 수업 준비</span>
          <h1>한 차시를 골라 바로 준비하세요</h1>
          <p>설치나 학생 가입 없이, 예제·미션·활동지를 함께 준비합니다.</p>
        </div>
        <button onClick={() => go("home")}>홈으로</button>
      </div>
      <TeacherStarter go={go} full />
      <SubjectLinks go={go} />
      <LearningWords />
      <section className="panel share-invite">
        <div>
          <h2>학급에 오늘의 미션 안내하기</h2>
          <p>
            차시를 고르면 학생이 바로 들어갈 QR 카드와 소개 문구가 준비돼요.
          </p>
        </div>
        <button onClick={() => go("share")}>수업 QR 카드 만들기 →</button>
      </section>
    </div>
  );
}

export function QuickTry({ go, create }: { go: Go; create: Create }) {
  const [phase, setPhase] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [state, setState] = useState(initialQuiz);
  const [clicks, setClicks] = useState(0);
  const [scoring, setScoring] = useState<QuizConfig["scoring"]>("attempt");
  const [reason, setReason] = useState("");
  const panel = useRef<HTMLElement>(null);
  const finish = useRef<HTMLHeadingElement>(null);
  const previousPhase = useRef(phase);
  const complete =
    phase === 2 && clicks === 3 && scoring === "once" && state.score === 1;
  useEffect(() => {
    if (previousPhase.current === phase) return;
    previousPhase.current = phase;
    panel.current
      ?.querySelector<HTMLHeadingElement>("h2")
      ?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [phase]);
  useEffect(() => {
    if (!complete) return;
    finish.current?.focus({ preventScroll: true });
    finish.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [complete]);
  const reset = () => {
    setPhase(0);
    setPrediction("");
    setState(initialQuiz());
    setClicks(0);
    setScoring("attempt");
    setReason("");
  };
  const clickAnswer = () => {
    setState((current) =>
      answerQuiz(
        { ...practiceQuiz, scoring: phase === 1 ? "attempt" : scoring },
        current,
        0,
      ),
    );
    setClicks((count) => count + 1);
  };
  return (
    <div className="try-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">3분 첫 체험 · 시간 제한 없음</span>
          <h1>점수가 또 올라가요</h1>
          <p>
            한 문제는 1점. 같은 정답을 세 번 눌러도 한 문제의 점수만 받아야
            해요.
          </p>
        </div>
        <button onClick={() => go("home")}>홈으로</button>
      </div>
      <ol className="try-progress" aria-label="첫 체험 순서">
        {["예상하기", "이상한 점수 발견", "규칙 수정과 재검사"].map(
          (title, index) => (
            <li
              key={title}
              aria-current={phase === index ? "step" : undefined}
              className={phase === index ? "active" : ""}
            >
              {index + 1}. {title}
            </li>
          ),
        )}
      </ol>
      <section className="panel try-content" ref={panel}>
        {phase === 0 ? (
          <>
            <h2 tabIndex={-1}>1 먼저 예상해요</h2>
            <fieldset className="prediction-options">
              <legend>
                같은 문제의 정답을 세 번 누르면 몇 점이어야 할까요?
              </legend>
              {["1", "2", "3"].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="trial-prediction"
                    value={value}
                    checked={prediction === value}
                    onChange={() => setPrediction(value)}
                  />
                  {value}점
                </label>
              ))}
            </fieldset>
            <p>
              예상은 틀려도 괜찮아요. 실제 결과와 비교할 내 생각을 먼저 남겨요.
            </p>
            <button
              className="primary"
              disabled={!prediction}
              onClick={() => setPhase(1)}
            >
              내 예상으로 실행해 보기 →
            </button>
          </>
        ) : null}
        {phase === 1 || phase === 2 ? (
          <>
            <h2 tabIndex={-1}>
              {phase === 1
                ? "2 같은 정답을 세 번 눌러요"
                : "3 한 가지 규칙을 고치고 다시 검사해요"}
            </h2>
            <p>
              내 예상 <b>{prediction}점</b> · 같은 정답 세 번 · 문제당 1점
            </p>
            {phase === 2 ? (
              <label className="field">
                <span id="trial-rule-label">채점 규칙</span>
                <select
                  aria-labelledby="trial-rule-label"
                  aria-describedby="trial-rule-help"
                  value={scoring}
                  onChange={(event) => {
                    setScoring(event.target.value as QuizConfig["scoring"]);
                    setState(initialQuiz());
                    setClicks(0);
                  }}
                >
                  <option value="attempt">누를 때마다 1점</option>
                  <option value="once">문제당 한 번만 1점</option>
                </select>
                <small id="trial-rule-help">
                  규칙을 바꾸면 0점부터 같은 검사를 다시 시작해요.
                </small>
              </label>
            ) : null}
            <div className="trial-quiz">
              <h3>식물이 자라는 데 필요한 것은?</h3>
              <button
                onClick={clickAnswer}
                disabled={clicks >= 3 || (phase === 2 && scoring !== "once")}
              >
                정답 햇빛과 물
              </button>
              <div role="status" className="trial-score">
                누른 횟수 {clicks}/3 · 현재 점수{" "}
                <strong data-testid="trial-score">{state.score}점</strong>
              </div>
            </div>
            {phase === 1 && clicks === 3 ? (
              <div className="trial-observation">
                <p>
                  실제로는 <b>3점</b>이 되었어요. 누를 때마다 1점을 더하는 규칙
                  때문이에요. 우리가 정한 “한 문제는 한 번” 약속과 다르네요.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setPhase(2);
                    setState(initialQuiz());
                    setClicks(0);
                  }}
                >
                  규칙 하나 고치기 →
                </button>
              </div>
            ) : null}
          </>
        ) : null}
        {complete ? (
          <div className="try-finish">
            <h2 ref={finish} tabIndex={-1}>
              같은 행동으로 확인했어요
            </h2>
            <div className="try-results">
              <span>
                내 예상 <b>{prediction}점</b>
              </span>
              <span>
                고치기 전 <b>3점</b>
              </span>
              <span>
                고친 후 <b>1점</b>
              </span>
            </div>
            <p>
              이미 답한 문제인지 기억하면, 또 눌러도 점수를 더하지 않을 수
              있어요.
            </p>
            <label className="field">
              <span>내 말로 설명하기 · 왜 이렇게 고쳤나요?</span>
              <input
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder="맞힌 문제 수를 세려면…"
              />
            </label>
            <p className="muted">
              체험만 하면 기록은 남지 않아요. 새 작품을 만들면 내 예상과 설명을
              옮겨요. 새 작품에서 실행·검사는 다시 해요.
            </p>
            <button
              className="primary"
              onClick={() =>
                create(
                  missions.find((mission) => mission.id === "quiz-3")!,
                  true,
                  {
                    prediction: `같은 정답을 세 번 누르면 ${prediction}점일 것 같아요.`,
                    reason,
                  },
                )
              }
            >
              고친 규칙으로 내 작품 만들기 →
            </button>
          </div>
        ) : null}
      </section>
      <div className="button-row">
        <button onClick={reset}>체험 처음부터 다시</button>
        <button className="text-button" onClick={() => go("explore")}>
          다른 완성 예제 눌러보기
        </button>
      </div>
      <LearningWords compact />
    </div>
  );
}
