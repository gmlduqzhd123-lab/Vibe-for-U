import { useEffect, useRef, useState } from "react";
import { useLang, useT } from "./i18n";
import { localizeConfig } from "./missionText";
import {
  lessonMissionIds,
  lessons,
  missions,
  quiz,
  story,
  timer,
} from "./data";
import { answerQuiz, initialQuiz } from "./engines";
import type { Kind, Mission, QuizConfig } from "./model";
import { Preview } from "./Preview";
import { Icon, Pill } from "./ui";

type Go = (path: string) => void;
type Create = (
  mission: Mission,
  normal?: boolean,
  starter?: { prediction: string; reason: string },
) => void;
export { lessonMissionIds } from "./data";
export const materialUrl = (file: string) =>
  `${import.meta.env.BASE_URL}materials/${file}`;
const practiceQuiz = quiz as QuizConfig;
const errorQuiz: QuizConfig = { ...practiceQuiz, scoring: "attempt" };

export function LearningWords({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <details
      className={`learning-words panel ${compact ? "compact no-print" : ""}`}
    >
      <summary>{t("낯선 말은 쉽게 풀어볼까요?")}</summary>
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
            <dt>{t(term)}</dt>
            <dd>{t(meaning)}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function DemoLab({ go }: { go: Go }) {
  const t = useT();
  const lang = useLang();
  const [kind, setKind] = useState<Kind>("quiz");
  const config =
    kind === "quiz"
      ? localizeConfig(quiz, lang)
      : kind === "story"
        ? localizeConfig(story, lang)
        : {
            ...timer,
            seconds: 5,
            endMessage: t("5초가 끝났어요! 잠깐 쉬어 가요."),
          };
  return (
    <section className="panel demo-lab" aria-labelledby="demo-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("완성 예제부터 눌러보세요")}</span>
          <h2 id="demo-title">{t("어떤 앱을 만드는 곳인가요?")}</h2>
          <p>
            {t(
              "답을 고르고, 길을 바꾸고, 시간을 멈춰 보세요. 이 체험은 작품을 저장하지 않아요.",
            )}
          </p>
        </div>
      </div>
      <div className="demo-layout">
        <div
          className="demo-choices"
          role="group"
          aria-label={t("완성 예제 선택")}
        >
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
                <b>{t(title)}</b>
                <small>{t(description)}</small>
              </span>
            </button>
          ))}
          <button className="text-button" onClick={() => go("try")}>
            {t("이제 내가 고쳐보기 · 3분")} <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="demo-screen" aria-label={t("저장하지 않는 완성 예제")}>
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
  const t = useT();
  const lang = useLang();
  // 안내 그림은 한국어·영어 화면을 따로 찍어 둔다(scripts/guide-shots.mjs).
  const suffix = lang === "en" ? "-en" : "";
  return (
    <section className="learning-path" aria-labelledby="path-title">
      <div className="section-heading">
        <div>
          <h2 id="path-title">{t("다섯 장면으로 보는 앱 만들기")}</h2>
          <p>{t("완성 화면보다 예상하고 고친 이유가 중요해요.")}</p>
        </div>
      </div>
      <ol className="path-cards">
        {journey.map(([simple, stage, action, speech], index) => (
          <li key={stage}>
            <span className="path-number">{index + 1}</span>
            <h3>{t(simple)}</h3>
            <span className="small muted">
              {t("작업실의 {stage}", { stage: t(stage) })}
            </span>
            <a
              href={`${import.meta.env.BASE_URL}guide/step-${index + 1}${suffix}.png`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("{stage} 실제 화면 크게 보기 (새 탭)", {
                stage: t(stage),
              })}
            >
              {/* WebP가 PNG보다 60% 작다. 못 읽는 오래된 브라우저만 PNG를 받는다. */}
              <picture>
                <source
                  srcSet={`${import.meta.env.BASE_URL}guide/step-${index + 1}${suffix}.webp`}
                  type="image/webp"
                />
                <img
                  src={`${import.meta.env.BASE_URL}guide/step-${index + 1}${suffix}.png`}
                  alt={t("{stage} 단계의 실제 작업실 화면", {
                    stage: t(stage),
                  })}
                  loading="lazy"
                  width="320"
                  height="210"
                />
              </picture>
            </a>
            <b>{t(action)}</b>
            <p className="speech">“{t(speech)}”</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BeforeAfter({ go }: { go: Go }) {
  const t = useT();
  const [compared, setCompared] = useState(false);
  const repeated = (config: QuizConfig) =>
    [0, 0, 0].reduce((state) => answerQuiz(config, state, 0), initialQuiz())
      .score;
  return (
    <section className="panel before-after" aria-labelledby="compare-title">
      <span className="eyebrow">{t("규칙 비교 예제")}</span>
      <h2 id="compare-title">{t("이렇게 고치며 원리를 배워요")}</h2>
      <p>
        {t("같은 문제의 같은 정답을 세 번 눌렀을 때, 두 규칙을 비교해 보세요.")}
      </p>
      <div className="compare-grid" aria-live="polite">
        <div>
          <Pill tone="orange">{t("고치기 전")}</Pill>
          <h3>{t("누를 때마다 점수가 올라가요")}</h3>
          <strong>
            {t("{n}점", { n: compared ? repeated(errorQuiz) : "?" })}
          </strong>
          <p>{t("버튼을 누를 때마다 1점씩 더하는 규칙")}</p>
        </div>
        <div>
          <Pill tone="green">{t("고친 후")}</Pill>
          <h3>{t("한 문제는 한 번만 채점해요")}</h3>
          <strong>
            {t("{n}점", { n: compared ? repeated(practiceQuiz) : "?" })}
          </strong>
          <p>{t("이미 답한 문제인지 기억하고 확인하는 규칙")}</p>
        </div>
      </div>
      <div className="button-row">
        <button onClick={() => setCompared(true)}>
          {t("같은 정답 세 번 비교하기")}
        </button>
        <button className="text-button" onClick={() => go("try")}>
          {t("내 손으로 고쳐보기 →")}
        </button>
      </div>
      {compared ? (
        <p className="comparison-reason">
          {t(
            "고친 까닭: 누른 횟수보다 맞힌 문제 수를 세려면, 이미 답했는지 기억해야 해요.",
          )}
        </p>
      ) : null}
    </section>
  );
}

function SubjectLinks({ go }: { go: Go }) {
  const t = useT();
  return (
    <section aria-labelledby="subject-title">
      <div className="section-heading">
        <div>
          <h2 id="subject-title">{t("우리 수업에서는 이렇게 써요")}</h2>
          <p>
            {t(
              "수업 아이디어예요. 문항·이야기·시간은 배운 내용에 맞게 바꿔요.",
            )}
          </p>
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
            <span className="subject-label">
              {t("{subject} 수업 아이디어", { subject: t(subject) })}
            </span>
            <h3>{t(title)}</h3>
            <p>{t(description)}</p>
            <button onClick={() => go(`mission/${id}`)}>
              {t("{subject} 활동 안내 열기", { subject: t(subject) })}{" "}
              <Icon name="arrow" size={16} />
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
  const t = useT();
  const [lesson, setLesson] = useState(0);
  const current = lessons[lesson];
  return (
    <section className="panel teacher-starter" aria-labelledby="starter-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("선생님의 수업 준비")}</span>
          <h2 id="starter-title">{t("내일 바로 하는 40분 수업")}</h2>
          <p>
            {t(
              "기기 1대당 2명 · 활동지 1인 1부 · 학생 계정 가입 없이 시작해요.",
            )}
          </p>
        </div>
      </div>
      {full ? (
        <label className="field">
          <span>{t("준비할 차시")}</span>
          <select
            value={lesson}
            onChange={(event) => setLesson(Number(event.target.value))}
          >
            {lessons.map((item, index) => (
              <option value={index} key={item.title}>
                {t("{n}차시", { n: index + 1 })} · {item.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <Pill>
          {t("{n}차시", { n: 1 })} · {current.title}
        </Pill>
      )}
      <h3 className="starter-goal">
        {t("오늘의 목표")} · {current.goal}
      </h3>
      <p>
        <b>{t("준비물")}</b> {current.materials} ·{" "}
        {t("브라우저에서 미션과 저장 상태를 먼저 확인하세요.")}
      </p>
      <div className="starter-timeline">
        <div>
          <b>{t("도입 5분")}</b>
          <p>{current.intro}</p>
        </div>
        <div>
          <b>{t("활동 30분")}</b>
          <p>{current.activity}</p>
        </div>
        <div>
          <b>{t("정리 5분")}</b>
          <p>{current.close}</p>
        </div>
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => go(`mission/${lessonMissionIds[lesson]}`)}
        >
          {t("이 수업 미션 열기")} <Icon name="arrow" size={16} />
        </button>
        <a
          className="resource-link"
          href={materialUrl(
            `student-lesson-${String(lesson + 1).padStart(2, "0")}.pdf`,
          )}
          download={`뚝딱_바이브_${lesson + 1}차시_학생_활동지.pdf`}
        >
          {t("이 차시 활동지 받기 · 2쪽")}
        </a>
        <a
          className="resource-link"
          href={materialUrl("teacher-guide.pdf")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("교사용 안내서 열기 · 새 탭")}
        </a>
        <button onClick={() => go(full ? "teacher" : "prepare")}>
          {t(full ? "전체 자료와 8차시 안내" : "다른 차시도 준비하기")}
        </button>
      </div>
      {lesson === 5 ? (
        <p className="note">
          {t(
            "6차시의 외부 AI 도구는 교사·성인이 조작해요. 사전 예제를 준비하고 생성·미실행을 구별해 기록해요.",
          )}
        </p>
      ) : null}
      {full ? (
        <>
          <h3>{t("수업에서 살펴볼 것")}</h3>
          <p>{current.observe}</p>
          <p>
            <b>{t("기기 문제가 생기면")}</b> {current.fallback}
          </p>
          <p>
            <b>{t("도움 조절")}</b>{" "}
            {t(
              "3~4학년은 교사가 읽어 주고 선택 카드로 말해요. 5~6학년은 짝과 예상·실제·이유를 기록해요. 빠른 학생은 조건을 하나 더 바꾸고 재검사해요.",
            )}
          </p>
        </>
      ) : null}
    </section>
  );
}

export { RoleHome as Home } from "./RoleHome";

export function Explore({ go }: { go: Go }) {
  const t = useT();
  return (
    <div className="welcome-home">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("학생 체험하기")}</span>
          <h1>{t("먼저 눌러보고, 하나만 고쳐봐요")}</h1>
          <p>
            {t(
              "처음이어도 괜찮아요. 예제에서 시작하고 내 작품으로 이어갈 수 있어요.",
            )}
          </p>
        </div>
        <button onClick={() => go("home")}>{t("홈으로")}</button>
      </div>
      <div className="support-badges">
        <span>{t("처음이라면 · 예제 눌러보기")}</span>
        <span>{t("3~4학년 · 선생님과 말로 설명")}</span>
        <span>{t("5~6학년 · 짝과 예상·검사")}</span>
      </div>
      <DemoLab go={go} />
      <section className="panel quick-invite">
        <div>
          <h2>{t("다음은 3분 첫 체험")}</h2>
          <p>
            {t(
              "정답을 세 번 누르고 점수 규칙을 직접 고쳐봐요. 시간 제한은 없어요.",
            )}
          </p>
        </div>
        <button className="primary" onClick={() => go("try")}>
          {t("3분 체험 시작 →")}
        </button>
      </section>
      <LearningPath />
      <BeforeAfter go={go} />
      <LearningWords />
    </div>
  );
}

export function Prepare({ go }: { go: Go }) {
  const t = useT();
  return (
    <div className="welcome-home">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("교사 수업 준비")}</span>
          <h1>{t("한 차시를 골라 바로 준비하세요")}</h1>
          <p>
            {t("설치나 학생 가입 없이, 예제·미션·활동지를 함께 준비합니다.")}
          </p>
        </div>
        <button onClick={() => go("home")}>{t("홈으로")}</button>
      </div>
      <TeacherStarter go={go} full />
      <SubjectLinks go={go} />
      <LearningWords />
      <section className="panel share-invite">
        <div>
          <h2>{t("학급에 오늘의 미션 안내하기")}</h2>
          <p>
            {t(
              "차시를 고르면 학생이 바로 들어갈 QR 카드와 소개 문구가 준비돼요.",
            )}
          </p>
        </div>
        <button onClick={() => go("share")}>
          {t("수업 QR 카드 만들기 →")}
        </button>
      </section>
    </div>
  );
}

export function LessonLanding({ number, go }: { number: number; go: Go }) {
  const t = useT();
  const lesson = lessons[number - 1];
  return (
    <div className="welcome-home">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("오늘의 학생 활동 · 40분")}</span>
          <h1>
            {t("{n}차시", { n: number })} {lesson.title}
          </h1>
          <p>
            {t("오늘 할 일을 확인하고, 활동지를 준비한 뒤 미션을 시작해요.")}
          </p>
        </div>
        <button onClick={() => go("home")}>{t("홈으로")}</button>
      </div>
      <section className="panel">
        <h2>{t("오늘의 목표")}</h2>
        <p>{lesson.goal}</p>
        <div className="starter-timeline">
          <div>
            <b>{t("함께 생각하기 5분")}</b>
            <p>{lesson.intro}</p>
          </div>
          <div>
            <b>{t("직접 해 보기 30분")}</b>
            <p>{lesson.activity}</p>
          </div>
          <div>
            <b>{t("배운 점 말하기 5분")}</b>
            <p>{lesson.close}</p>
          </div>
        </div>
        {number === 2 || number === 7 ? (
          <p className="note">
            {t(
              "지난 시간 작품이 있으면 내 작품 선반에서 열어 이어가요. 아직 작품이 없다면 연결된 미션에서 새로 시작할 수 있어요.",
            )}
          </p>
        ) : null}
        {number === 6 ? (
          <p className="note">
            {t(
              "외부 AI 도구는 선생님·성인이 조작해요. 나는 요청과 예상, 실제로 본 결과를 기록해요.",
            )}
          </p>
        ) : null}
        <div className="button-row">
          <button
            className="primary"
            onClick={() => go(`mission/${lessonMissionIds[number - 1]}`)}
          >
            {t("오늘의 미션 안내 열기 →")}
          </button>
          {number === 2 || number === 7 ? (
            <button onClick={() => go("library")}>
              {t("지난 작품 이어하기")}
            </button>
          ) : null}
          <a
            className="resource-link"
            href={materialUrl(
              `student-lesson-${String(number).padStart(2, "0")}.pdf`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("{n}차시 활동지 열기 · 2쪽 · 새 탭", { n: number })}
          </a>
        </div>
      </section>
      <LearningWords />
    </div>
  );
}

export function QuickTry({ go, create }: { go: Go; create: Create }) {
  const t = useT();
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
          <span className="eyebrow">{t("3분 첫 체험 · 시간 제한 없음")}</span>
          <h1>{t("점수가 또 올라가요")}</h1>
          <p>
            {t(
              "한 문제는 1점. 같은 정답을 세 번 눌러도 한 문제의 점수만 받아야 해요.",
            )}
          </p>
        </div>
        <button onClick={() => go("home")}>{t("홈으로")}</button>
      </div>
      <ol className="try-progress" aria-label={t("첫 체험 순서")}>
        {["예상하기", "이상한 점수 발견", "규칙 수정과 재검사"].map(
          (title, index) => (
            <li
              key={title}
              aria-current={phase === index ? "step" : undefined}
              className={phase === index ? "active" : ""}
            >
              {index + 1}. {t(title)}
            </li>
          ),
        )}
      </ol>
      <section className="panel try-content" ref={panel}>
        {phase === 0 ? (
          <>
            <h2 tabIndex={-1}>{t("1 먼저 예상해요")}</h2>
            <fieldset className="prediction-options">
              <legend>
                {t("같은 문제의 정답을 세 번 누르면 몇 점이어야 할까요?")}
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
                  {t("{n}점", { n: value })}
                </label>
              ))}
            </fieldset>
            <p>
              {t(
                "예상은 틀려도 괜찮아요. 실제 결과와 비교할 내 생각을 먼저 남겨요.",
              )}
            </p>
            <button
              className="primary"
              disabled={!prediction}
              onClick={() => setPhase(1)}
            >
              {t("내 예상으로 실행해 보기 →")}
            </button>
          </>
        ) : null}
        {phase === 1 || phase === 2 ? (
          <>
            <h2 tabIndex={-1}>
              {t(
                phase === 1
                  ? "2 같은 정답을 세 번 눌러요"
                  : "3 한 가지 규칙을 고치고 다시 검사해요",
              )}
            </h2>
            <p>
              {t("내 예상")} <b>{t("{n}점", { n: prediction })}</b>{" "}
              {t("· 같은 정답 세 번 · 문제당 1점")}
            </p>
            {phase === 2 ? (
              <label className="field">
                <span id="trial-rule-label">{t("채점 규칙")}</span>
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
                  <option value="attempt">{t("누를 때마다 1점")}</option>
                  <option value="once">{t("문제당 한 번만 1점")}</option>
                </select>
                <small id="trial-rule-help">
                  {t("규칙을 바꾸면 0점부터 같은 검사를 다시 시작해요.")}
                </small>
              </label>
            ) : null}
            <div className="trial-quiz">
              <h3>{t("식물이 자라는 데 필요한 것은?")}</h3>
              <button
                onClick={clickAnswer}
                disabled={clicks >= 3 || (phase === 2 && scoring !== "once")}
              >
                {t("정답 햇빛과 물")}
              </button>
              <div role="status" className="trial-score">
                {t("누른 횟수 {n}/3 · 현재 점수", { n: clicks })}{" "}
                <strong data-testid="trial-score">
                  {t("{n}점", { n: state.score })}
                </strong>
              </div>
            </div>
            {phase === 1 && clicks === 3 ? (
              <div className="trial-observation">
                <p>
                  {t("실제로는")} <b>{t("3점")}</b>
                  {t(
                    "이 되었어요. 누를 때마다 1점을 더하는 규칙 때문이에요. 우리가 정한 “한 문제는 한 번” 약속과 다르네요.",
                  )}
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setPhase(2);
                    setState(initialQuiz());
                    setClicks(0);
                  }}
                >
                  {t("규칙 하나 고치기 →")}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
        {complete ? (
          <div className="try-finish">
            <h2 ref={finish} tabIndex={-1}>
              {t("같은 행동으로 확인했어요")}
            </h2>
            <div className="try-results">
              <span>
                {t("내 예상")} <b>{t("{n}점", { n: prediction })}</b>
              </span>
              <span>
                {t("고치기 전")} <b>{t("3점")}</b>
              </span>
              <span>
                {t("고친 후")} <b>{t("1점")}</b>
              </span>
            </div>
            <p>
              {t(
                "이미 답한 문제인지 기억하면, 또 눌러도 점수를 더하지 않을 수 있어요.",
              )}
            </p>
            <label className="field">
              <span>{t("내 말로 설명하기 · 왜 이렇게 고쳤나요?")}</span>
              <input
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("맞힌 문제 수를 세려면…")}
              />
            </label>
            <p className="muted">
              {t(
                "체험만 하면 기록은 남지 않아요. 새 작품을 만들면 내 예상과 설명을 옮겨요. 새 작품에서 실행·검사는 다시 해요.",
              )}
            </p>
            <button
              className="primary"
              onClick={() =>
                create(
                  missions.find((mission) => mission.id === "quiz-3")!,
                  true,
                  {
                    prediction: t(
                      "같은 정답을 세 번 누르면 {n}점일 것 같아요.",
                      { n: prediction },
                    ),
                    reason,
                  },
                )
              }
            >
              {t("고친 규칙으로 내 작품 만들기 →")}
            </button>
          </div>
        ) : null}
      </section>
      <div className="button-row">
        <button onClick={reset}>{t("체험 처음부터 다시")}</button>
        <button className="text-button" onClick={() => go("explore")}>
          {t("다른 완성 예제 눌러보기")}
        </button>
      </div>
      <LearningWords compact />
    </div>
  );
}
