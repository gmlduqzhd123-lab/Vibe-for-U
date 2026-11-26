import "./late.css";
import { QrSendButton } from "./QrShare";
import { FamilyCard } from "./FamilyCard";
import { useSendGuard } from "./sendGuard";
import { PhraseBank } from "./Phrases";
import { feedbackPayload } from "./qrTransfer";
import { dateLocale, translate, useLang, useT } from "./i18n";
import { localizeMission } from "./missionText";
import { PraiseCards, ShowCase } from "./ShowCase";
import { adoptMissions } from "./customMissions";
import { ClassCharts, classStats } from "./ClassCharts";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LIMITS, debugFields, debugFilled, now, stageDone } from "./model";
import type { Feedback, Work } from "./model";
import {
  clearClassSession,
  downloadText,
  exportJSON,
  loadClassSession,
  parseBackup,
  readBackupText,
  saveClassSession,
} from "./storage";
import {
  emptyFeedback,
  CLASS_FORMAT,
  arrange,
  filters,
  orders,
  classBugs,
  classSessionFiles,
  graded,
  parseClassSession,
  lessonProgress,
  levelNames,
  assessmentGaps,
  stuckByStage,
  summarize,
  toCSV,
} from "./classSummary";
import type { Entry, Filter, Order } from "./classSummary";
import { Empty, Field, Icon, Pill } from "./ui";
import { RubricChoices } from "./Rubric";
import { missions } from "./data";
import { rubric } from "./lessonData";
import { stageNames } from "./model";
const fileBase = (name: string) => name.replace(/\.json$/i, "");
// 우리 반이 많이 만난 버그: 다음 차시에 함께 다룰 버그를 고르는 근거로 쓴다.
function BugBoard({ works }: { works: Work[] }) {
  const t = useT();
  const rows = classBugs(works);
  return (
    <div className="panel bug-board">
      <h3>{t("우리 반이 많이 만난 버그")}</h3>
      <p className="small muted">
        {t(
          "저장한 버전과 지금 편집본을 맞춤 힌트 규칙으로 살펴 셌어요. ‘지금은 고침’은 지금 편집본에서는 그 버그가 없는 학생 수예요.",
        )}
      </p>
      {rows.length ? (
        <table className="lesson-table">
          <thead>
            <tr>
              <th>{t("버그 종류")}</th>
              <th>{t("만난 학생")}</th>
              <th>{t("지금은 고침")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{t(r.name)}</td>
                <td>{t("{n}명", { n: r.met })}</td>
                <td>
                  {r.fixed} / {r.met}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{t("읽은 작품에서 맞춤 힌트가 찾는 버그가 없었어요.")}</p>
      )}
    </div>
  );
}
// 학기 요약 한 장: 학급 전체의 단계 완료, 많이 만난 버그, 평가 평균, 차시별 진행을 A4 한 장에 모은다.
// 학년 협의회·상담 자료용이라 학생 이름과 작품 글은 넣지 않는다.
function TermSummary({ works }: { works: Work[] }) {
  const t = useT();
  const lang = useLang();
  const total = works.length;
  const stages = works.map((w) => stageDone(w.draft));
  const { levels } = classStats(works);
  const bugs = classBugs(works).slice(0, 5);
  const lessonRows = lessonProgress(works).filter((r) => r.works);
  const avg = (v: number | null) => (v === null ? "–" : v.toFixed(1));
  return (
    <article className="term-summary">
      <header>
        <h2>{t("학급 과정 평가 요약")}</h2>
        <p>
          {new Date().toLocaleDateString(dateLocale(lang))} ·{" "}
          {t(
            "작품 {n}개 · 다섯 단계 모두 기록 {done}개 · 평가 완료 {graded}개",
            {
              n: total,
              done: stages.filter((s) => s.every(Boolean)).length,
              graded: works.filter((w) => graded(w.feedback)).length,
            },
          )}
        </p>
      </header>
      <section>
        <h3>{t("단계별 완료")}</h3>
        <table>
          <tbody>
            {stageNames.map((name, i) => (
              <tr key={name}>
                <th>
                  {i + 1}. {t(name)}
                </th>
                <td>
                  {stages.filter((s) => s[i]).length} / {total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>{t("과정 평가 평균 (1 시작 · 2 수행 · 3 설명·적용)")}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("관찰 항목")}</th>
              <th>{t("스스로")}</th>
              <th>{t("선생님")}</th>
              <th>{t("둘 다 평가한 작품")}</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((r) => (
              <tr key={r.label}>
                <th>{t(r.label)}</th>
                <td>{avg(r.self)}</td>
                <td>{avg(r.teacher)}</td>
                <td>{t("{n}개", { n: r.n })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>{t("우리 반이 많이 만난 버그")}</h3>
        {bugs.length ? (
          <table>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id}>
                  <th>{t(b.name)}</th>
                  <td>
                    {t("만난 학생 {n}명 · 지금은 고침 {m}명", {
                      n: b.met,
                      m: b.fixed,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{t("읽은 작품에서 맞춤 힌트가 찾는 버그가 없었어요.")}</p>
        )}
      </section>
      {lessonRows.length ? (
        <section>
          <h3>{t("차시별 진행")}</h3>
          <table>
            <tbody>
              {lessonRows.map((r) => (
                <tr key={r.number}>
                  <th>
                    {t("{n}차시", { n: r.number })} · {t(r.title)}
                  </th>
                  <td>
                    {t("작품 {n}개 · 다섯 단계 완료 {m}개", {
                      n: r.works,
                      m: r.done,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
      <footer>
        {t(
          "기록을 근거로 교사가 직접 매긴 평가의 요약이에요. 앱은 점수를 자동으로 매기지 않으며, 이 요약에는 학생 이름과 작품 글을 넣지 않았어요.",
        )}
      </footer>
    </article>
  );
}
// 그래프·차시별 진행·많이 만난 버그는 작품 목록과 평가 단계가 바뀔 때만 다시 계산한다.
// (의견을 한 글자 칠 때마다 모든 작품·버전을 다시 살피면 입력이 느려진다.)
const Summaries = memo(
  function Summaries({ works }: { works: Work[]; signature: string }) {
    return (
      <>
        <ClassCharts works={works} />
        <LessonBoard works={works} />
        <BugBoard works={works} />
      </>
    );
  },
  (a, b) => a.signature === b.signature,
);
// 차시 진행 대시보드: 8차시 계획의 미션마다 읽은 작품이 어디까지 왔는지 한 표로 본다.
function LessonBoard({ works }: { works: Work[] }) {
  const t = useT();
  const rows = lessonProgress(works);
  return (
    <div className="panel lesson-board">
      <h3>{t("차시별 진행")}</h3>
      <p className="small muted">
        {t(
          "8차시 계획의 미션별로 읽은 작품을 셌어요. 같은 미션을 쓰는 차시는 같은 작품이 보여요. ‘많이 멈춘 단계’는 아직 기록하지 않은 첫 단계가 가장 많은 곳이에요.",
        )}
      </p>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label={t("차시별 진행표 · 좌우 방향키로 이동해 읽기")}
      >
        <table className="lesson-table">
          <thead>
            <tr>
              <th>{t("차시")}</th>
              <th>{t("미션")}</th>
              <th>{t("작품")}</th>
              <th>{t("다섯 단계 완료")}</th>
              <th>{t("많이 멈춘 단계")}</th>
              <th>{t("평가 완료")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.number} className={r.works ? "" : "lesson-empty"}>
                <td>
                  <b>{t("{n}차시", { n: r.number })}</b>
                  <br />
                  <small>{t(r.title)}</small>
                </td>
                <td>{r.mission}</td>
                <td>{t("{n}개", { n: r.works })}</td>
                <td>
                  {r.works ? (
                    <>
                      {r.done} / {r.works}
                      <span className="bar-track lesson-bar" aria-hidden="true">
                        <span
                          className="bar-fill"
                          style={{ width: `${(r.done / r.works) * 100}%` }}
                        />
                      </span>
                    </>
                  ) : (
                    "–"
                  )}
                </td>
                <td>
                  {r.stuckAt >= 0
                    ? t("{stage} · {n}명", {
                        stage: t(stageNames[r.stuckAt]),
                        n: r.stuckN,
                      })
                    : r.works
                      ? t("모두 기록")
                      : "–"}
                </td>
                <td>{r.works ? `${r.graded} / ${r.works}` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function ClassReview({ message }: { message: (s: string) => void }) {
  const t = useT();
  const lang = useLang();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showing, setShowing] = useState(false);
  const [printFamilies, setPrintFamilies] = useState(false);
  const guard = useSendGuard();
  // 보호자 카드 모두 인쇄: 카드마다 QR을 따로 만들기 때문에, 모두 준비된 뒤에 인쇄한다.
  const readyCount = useRef(0);
  const familyReady = () => {
    if (++readyCount.current < entries.length) return;
    document.documentElement.dataset.print = "families";
    addEventListener(
      "afterprint",
      () => {
        delete document.documentElement.dataset.print;
        setPrintFamilies(false);
      },
      { once: true },
    );
    // 마지막 QR이 화면에 그려질 틈을 준다.
    setTimeout(() => window.print(), 50);
  };
  const [errors, setErrors] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  // 새로고침해도 평가가 사라지지 않게 이 기기에 임시로 보관하고 다시 연다.
  const [restored, setRestored] = useState(false);
  // 효과 안의 알림은 그때의 화면 언어로 쓴다(언어가 바뀌어도 목록을 다시 열지 않게 ref로 둔다).
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);
  useEffect(() => {
    let alive = true;
    loadClassSession<Entry>()
      .then((saved) => {
        if (!alive) return;
        if (saved?.entries.length) {
          setEntries(saved.entries);
          const l = langRef.current;
          message(
            translate(l, "{date}까지 평가하던 작품 {n}개를 이어서 열었어요.", {
              date: new Date(saved.savedAt).toLocaleString(dateLocale(l)),
              n: saved.entries.length,
            }),
          );
        }
      })
      .catch(() => {})
      .finally(() => alive && setRestored(true));
    return () => {
      alive = false;
    };
  }, [message]);
  useEffect(() => {
    if (!restored) return;
    const timer = setTimeout(() => {
      (entries.length ? saveClassSession(entries) : clearClassSession()).catch(
        () =>
          message(
            translate(
              langRef.current,
              "평가 목록을 이 기기에 보관하지 못했어요. CSV나 평가 파일로 내려받아 두세요.",
            ),
          ),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [entries, restored, message]);
  const load = async (files: FileList | null) => {
    if (!files?.length) return;
    const added: Entry[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      try {
        if (file.size > LIMITS.bytes)
          throw new Error(t("파일은 2MB 이하여야 해요."));
        // 파일은 한 번만 읽는다. 학급 모으기에는 되돌리기 기록이 필요 없어 검사하지 않는다.
        const data = readBackupText(await file.text());
        // 다른 기기에서 내보낸 평가 목록 파일이면 평가와 함께 그대로 이어서 연다.
        if ((data as { format?: unknown } | null)?.format === CLASS_FORMAT) {
          adoptMissions((data as { missions?: unknown }).missions);
          for (const e of parseClassSession(data, file.name)) {
            added.push({
              ...e,
              work: {
                ...e.work,
                feedback: e.work.feedback ?? emptyFeedback(now()),
              },
            });
          }
          continue;
        }
        // 학생 작품에 담긴 선생님 미션은 교사 기기에도 더해 둔다.
        try {
          adoptMissions((data as { missions?: unknown } | null)?.missions);
        } catch {
          // 미션을 읽지 못하면 아래 작품 검사가 이유를 알린다.
        }
        // 원래 작품 ID는 파서가 함께 돌려준다(가져오며 새 ID를 붙이기 때문).
        const { works, sourceIds } = parseBackup(data, false);
        works.forEach((work, i) =>
          added.push({
            key: `${file.name}#${i}:${work.id}`,
            sourceId: sourceIds[i] || undefined,
            file: works.length > 1 ? `${file.name} (${i + 1})` : file.name,
            work: { ...work, feedback: work.feedback ?? emptyFeedback(now()) },
          }),
        );
      } catch (e) {
        failed.push(
          `${file.name}: ${e instanceof Error ? e.message : t("읽지 못했어요.")}`,
        );
      }
    }
    setEntries((list) => [...list, ...added]);
    setErrors(failed);
    message(
      failed.length
        ? t("작품 {n}개를 읽었어요. 파일 {failed}개는 읽지 못했어요.", {
            n: added.length,
            failed: failed.length,
          })
        : t("작품 {n}개를 읽었어요.", { n: added.length }),
    );
    if (input.current) input.current.value = "";
  };
  const setFeedback = (key: string, patch: Partial<Feedback>) =>
    setEntries((list) =>
      list.map((e) =>
        e.key === key && e.work.feedback
          ? {
              ...e,
              work: {
                ...e.work,
                feedback: { ...e.work.feedback, ...patch, at: now() },
              },
            }
          : e,
      ),
    );
  const returnFile = (e: Entry) =>
    downloadText(
      `${fileBase(e.file)}-평가.json`,
      exportJSON([e.work]),
      "application/json",
    );
  const summaries = entries.map((e) => summarize(e.work));
  // 걸러 보기·정렬: 표의 줄과 평가 카드에 함께 적용한다(위의 합계와 그래프는 전체 기준).
  const [filter, setFilter] = useState<Filter>("all");
  const [order, setOrder] = useState<Order>("loaded");
  const shown = arrange(entries, filter, order);
  // 작품 목록과 평가 단계가 바뀔 때만 다시 계산할 것들의 열쇠(의견을 칠 때는 그대로다).
  const signature = entries
    .map((e) => `${e.key}:${e.work.feedback?.levels.join("")}`)
    .join("|");
  const counts = useMemo(
    () => filters.map(([id]) => arrange(entries, id, "loaded").length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature],
  );
  return (
    <section className="class-review" aria-labelledby="class-review-title">
      {showing && entries.length ? (
        <ShowCase entries={entries} close={() => setShowing(false)} />
      ) : null}
      <div className="praise-sheet" aria-hidden="true">
        <PraiseCards entries={entries} />
      </div>
      {/* 학기 요약 한 장: 그 인쇄 때만 보인다. 학생 이름이나 작품 글은 넣지 않는다. */}
      <div className="term-sheet">
        {entries.length ? (
          <TermSummary works={entries.map((e) => e.work)} />
        ) : null}
      </div>
      {/* 보호자용 소개 카드 모두 인쇄: 그 인쇄 때만 보인다(A4 한 장에 두 명). */}
      <div className="families-sheet">
        {printFamilies
          ? entries.map((e) => (
              <FamilyCard key={e.key} w={e.work} onReady={familyReady} />
            ))
          : null}
      </div>
      <div className="panel">
        <h2 id="class-review-title">{t("학급 작품 모으기")}</h2>
        <p>
          {t("학생이")} <b>{t("내 작품 선반 → 목록 백업")}</b>{" "}
          {t("또는 작업실의")} <b>{t("파일 백업")}</b>
          {t(
            "으로 낸 JSON 파일을 여러 개 한꺼번에 고르세요. 파일 이름을 학생 번호·이름으로 바꿔 받으면 누구의 작품인지 알아보기 쉬워요.",
          )}
        </p>
        <div className="note">
          <Icon name="shield" />
          {t(
            "평가 중인 목록은 이 기기에만 임시로 보관해 새로고침해도 이어서 열려요. 서버에는 올리지 않고, 학생 작품 선반과도 섞이지 않아요. 평가를 마치면 CSV나 평가 파일로 내려받고",
          )}{" "}
          <b>{t("목록 비우기")}</b>
          {t("로 지워 주세요.")}
        </div>
        <div className="button-row">
          <button className="primary" onClick={() => input.current?.click()}>
            <Icon name="folder" />
            {t("학생 작품 파일 고르기")}
          </button>
          <button
            disabled={!entries.length}
            onClick={() =>
              downloadText(
                `뚝딱-학급-평가-${new Date().toISOString().slice(0, 10)}.csv`,
                toCSV(entries),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Icon name="download" />
            {t("표 CSV로 내려받기")}
          </button>
          <button
            disabled={!entries.length}
            onClick={() => {
              entries.forEach(returnFile);
              message(
                t(
                  "평가를 넣은 작품 파일 {n}개의 다운로드를 요청했어요. 여러 파일 다운로드를 허용해 주세요.",
                  { n: entries.length },
                ),
              );
            }}
          >
            {t("평가 파일 모두 내려받기")}
          </button>
          <button
            disabled={!entries.length}
            onClick={() => {
              const files = classSessionFiles(entries);
              files.forEach((text, i) =>
                downloadText(
                  `뚝딱-평가목록-${new Date().toISOString().slice(0, 10)}${files.length > 1 ? `-${i + 1}` : ""}.json`,
                  text,
                  "application/json",
                ),
              );
              message(
                t(
                  "평가 목록 파일 {n}개의 다운로드를 요청했어요. 다른 기기의 ‘학생 작품 파일 고르기’로 열면 이어서 평가해요.",
                  { n: files.length },
                ),
              );
            }}
          >
            <Icon name="download" />
            {t("평가 목록 옮기기")}
          </button>
          <button disabled={!entries.length} onClick={() => setShowing(true)}>
            <Icon name="play" />
            {t("작품 발표 화면")}
          </button>
          <button
            disabled={!entries.length}
            onClick={() => {
              // 학기 요약 한 장만 인쇄한다(인쇄가 끝나면 원래대로).
              document.documentElement.dataset.print = "term";
              addEventListener(
                "afterprint",
                () => delete document.documentElement.dataset.print,
                { once: true },
              );
              window.print();
            }}
          >
            <Icon name="print" />
            {t("학기 요약 한 장 인쇄")}
          </button>
          <button
            onClick={() => {
              // 칭찬·질문 카드만 인쇄한다(인쇄가 끝나면 원래대로).
              document.documentElement.dataset.print = "cards";
              addEventListener(
                "afterprint",
                () => delete document.documentElement.dataset.print,
                { once: true },
              );
              window.print();
            }}
          >
            <Icon name="print" />
            {t("칭찬·질문 카드 인쇄")}
          </button>
          <button
            disabled={!entries.length}
            onClick={() =>
              guard(
                entries.map((e) => e.work),
                () => {
                  // 카드를 먼저 그리고, 모든 카드의 QR이 준비되면 인쇄 창을 연다(아래 familyReady).
                  readyCount.current = 0;
                  setPrintFamilies(true);
                },
              )
            }
          >
            <Icon name="print" />
            {t("보호자용 소개 카드 모두 인쇄")}
          </button>
          <button
            className="danger-text"
            disabled={!entries.length}
            onClick={() => {
              setEntries([]);
              setErrors([]);
            }}
          >
            {t("목록 비우기")}
          </button>
        </div>
        <input
          ref={input}
          className="sr-only"
          tabIndex={-1}
          type="file"
          multiple
          accept=".json,application/json"
          aria-label={t("학생 작품 JSON 파일 여러 개")}
          onChange={(e) => void load(e.target.files)}
        />
        {errors.length ? (
          <div role="alert" className="warning">
            <b>{t("읽지 못한 파일")}</b>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {entries.length ? (
        <>
          <div className="panel">
            <h3>{t("한눈에 보기")}</h3>
            <div className="form-grid class-filter">
              <label className="field">
                <span>{t("걸러 보기")}</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Filter)}
                >
                  {filters.map(([id, label], i) => (
                    <option key={id} value={id}>
                      {`${t(label)} (${counts[i]})`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t("정렬")}</span>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as Order)}
                >
                  {orders.map(([id, label]) => (
                    <option key={id} value={id}>
                      {t(label)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {shown.length < entries.length ? (
              <p className="small" role="status">
                {t("작품 {n}개 가운데 {m}개를 보고 있어요.", {
                  n: entries.length,
                  m: shown.length,
                })}
              </p>
            ) : null}
            <p>
              {t(
                "작품 {n}개 · 다섯 단계 모두 기록 {done}개 · 평가 완료 {graded}개",
                {
                  n: entries.length,
                  done: summaries.filter((s) => s.stages.every(Boolean)).length,
                  graded: entries.filter((e) => graded(e.work.feedback)).length,
                },
              )}
            </p>
            <StuckStrip entries={entries} />
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label={t("학급 작품 요약표 · 좌우 방향키로 이동해 읽기")}
            >
              <table className="class-table">
                <thead>
                  <tr>
                    <th>{t("파일 / 작품")}</th>
                    {stageNames.map((s, i) => (
                      <th key={s}>
                        {i + 1}. {t(s)}
                      </th>
                    ))}
                    <th>{t("직접 확인")}</th>
                    <th>{t("버전")}</th>
                    <th>{t("힌트")}</th>
                    <th>{t("짝·일지")}</th>
                    <th>{t("평가")}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e) => {
                    const s = summarize(e.work);
                    const found = missions.find(
                      (m) => m.id === e.work.missionId,
                    );
                    return (
                      <tr key={e.key}>
                        <td>
                          <b>{e.file}</b>
                          <br />
                          <small>
                            {t(s.title)} · {t(s.kind)} ·{" "}
                            {found
                              ? localizeMission(found, lang).title
                              : s.mission}
                          </small>
                        </td>
                        {s.stages.map((done, i) => (
                          <td key={i} className={done ? "stage-done" : ""}>
                            {t(done ? "✓ 완료" : "남음")}
                          </td>
                        ))}
                        <td>
                          {t("통과 {n}", { n: s.manualPass })}
                          {s.pending ? t(" · 남은 {n}", { n: s.pending }) : ""}
                          {s.retested ? t(" · 재검사함") : ""}
                        </td>
                        <td>{t("{n}개", { n: s.versions })}</td>
                        <td>
                          {s.hintsUsed
                            ? t("{n}번째까지", { n: s.hintsUsed })
                            : t("안 봄")}
                        </td>
                        <td>
                          {s.swaps === null
                            ? "–"
                            : t("역할 교대 {n}번", { n: s.swaps })}
                          {s.journal ? ` · ${t("일지 적음")}` : ""}
                        </td>
                        <td>
                          {graded(e.work.feedback) ? (
                            <Pill tone="green">{t("평가 완료")}</Pill>
                          ) : (
                            <Pill tone="paper">{t("평가 전")}</Pill>
                          )}
                          {assessmentGaps(e.work).big ? (
                            <Pill tone="orange">{t("평가 차이 큼")}</Pill>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="class-total">
                    <td>{t("단계별 완료")}</td>
                    {stageNames.map((_, i) => (
                      <td key={i}>
                        {summaries.filter((s) => s.stages[i]).length} /{" "}
                        {entries.length}
                      </td>
                    ))}
                    <td colSpan={5} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <Summaries works={entries.map((e) => e.work)} signature={signature} />
          <div className="class-cards">
            {shown.map((e) => (
              <ReviewCard
                key={e.key}
                entry={e}
                onChange={(p) => setFeedback(e.key, p)}
                download={() => returnFile(e)}
                message={message}
              />
            ))}
          </div>
        </>
      ) : (
        <Empty title={t("아직 읽은 작품이 없어요")}>
          <p>
            {t("학생 작품 파일을 고르면 단계 기록 표와 평가 카드가 나와요.")}
          </p>
        </Empty>
      )}
    </section>
  );
}
function ReviewCard({
  entry: e,
  onChange,
  download,
  message,
}: {
  entry: Entry;
  onChange: (p: Partial<Feedback>) => void;
  download: () => void;
  message: (s: string) => void;
}) {
  const t = useT();
  const d = e.work.draft;
  const f = e.work.feedback!;
  const done = stageDone(d);
  const gaps = assessmentGaps(e.work);
  return (
    <details className="panel review-card">
      <summary>
        <b>{e.file}</b>
        <span>
          {t("{title} · {n} / 5단계", {
            title: d.title || t("제목 없는 작품"),
            n: done.filter(Boolean).length,
          })}
        </span>
        {graded(f) ? <Pill tone="green">{t("평가 완료")}</Pill> : null}
      </summary>
      <dl className="record-list">
        <div>
          <dt>{t("실행 전 예상")}</dt>
          <dd className="preserve">{d.prediction || t("미기록")}</dd>
        </div>
        <div>
          <dt>{t("바꾼 동작과 이유")}</dt>
          <dd className="preserve">
            {[d.change.behavior, d.change.reason].filter(Boolean).join(" / ") ||
              t("미기록")}
          </dd>
        </div>
        <div>
          <dt>{t("직접 확인한 검사")}</dt>
          <dd>
            {d.checks
              .filter((c) => c.revision === d.revision && c.source !== "auto")
              .map((c) => `${c.label}: ${c.actual || t("실제 결과 미기록")}`)
              .join(" / ") || t("미기록")}
          </dd>
        </div>
        <div>
          <dt>{t("작동 원리와 배운 점")}</dt>
          <dd className="preserve">{d.reflection || t("미기록")}</dd>
        </div>
        <div>
          <dt>{t("도움받은 내용")}</dt>
          <dd className="preserve">{d.help || t("미기록")}</dd>
        </div>
        {debugFilled(d.debugLog) ? (
          <div>
            <dt>{t("버그 탐정 일지")}</dt>
            <dd className="preserve">
              {debugFields
                .map(([key, label]) => `${t(label)}: ${d.debugLog![key]}`)
                .join("\n")}
            </dd>
          </div>
        ) : null}
        {d.pair ? (
          <div>
            <dt>{t("짝 활동")}</dt>
            <dd>
              {t("{a} · {b} · 역할 교대 {n}번", {
                a: d.pair.a.trim() || t("짝 1"),
                b: d.pair.b.trim() || t("짝 2"),
                n: Math.max(0, d.pair.swaps.length - 1),
              })}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>{t("학생 자기 평가")}</dt>
          <dd>
            {e.work.selfAssessment?.levels.some((l) => l > 0)
              ? rubric
                  .map(
                    (r, i) =>
                      `${t(r[0])}: ${t(levelNames[e.work.selfAssessment!.levels[i]])}`,
                  )
                  .join(" / ")
              : t("미기록")}
            {e.work.selfAssessment?.note.trim()
              ? ` · ${e.work.selfAssessment.note}`
              : ""}
          </dd>
        </div>
        {gaps.items.length ? (
          <div className="assessment-gap">
            <dt>
              {t("평가가 다른 항목")}{" "}
              {gaps.big ? (
                <Pill tone="orange">
                  {t("두 단계 차이 · 이야기 나눠 보기")}
                </Pill>
              ) : null}
            </dt>
            <dd>
              {gaps.items
                .map((x) =>
                  t("{name}: 스스로 {a} · 선생님 {b}", {
                    name: t(x.name),
                    a: t(levelNames[x.self]),
                    b: t(levelNames[x.teacher]),
                  }),
                )
                .join(" / ")}
            </dd>
          </div>
        ) : null}
      </dl>
      <h3>{t("과정 평가")}</h3>
      <RubricChoices
        name={e.key}
        levels={f.levels}
        onChange={(levels) => onChange({ levels })}
      />
      <Field
        area
        label={t("확인한 근거와 다음 도움")}
        value={f.note}
        onChange={(note) => onChange({ note })}
      />
      <PhraseBank note={f.note} onChange={(note) => onChange({ note })} />
      <div className="button-row">
        <button onClick={download}>
          <Icon name="download" />
          {t("평가를 넣은 작품 파일 내려받기")}
        </button>
        {graded(f) ? (
          <QrSendButton
            works={[]}
            payload={() => feedbackPayload(e.work, e.sourceId)}
            label={t("평가를 QR로 돌려주기")}
            message={message}
          />
        ) : null}
      </div>
      <p className="small muted">
        {t("학생이 이 파일을")} <b>{t("파일 가져오기")}</b>
        {t("로 열면 포트폴리오에서 평가와 의견을 볼 수 있어요.")}
      </p>
    </details>
  );
}

// 멈춘 곳 한눈에 보기: 단계마다 거기서 멈춘 작품 수와 파일 이름을 보여 준다.
function StuckStrip({ entries }: { entries: Entry[] }) {
  const t = useT();
  const { stages, done } = stuckByStage(entries);
  const most = Math.max(0, ...stages.map((s) => s.files.length));
  return (
    <section className="stuck-strip" aria-labelledby="stuck-title">
      <h3 id="stuck-title">{t("어디에서 멈췄나요")}</h3>
      <ol>
        {stages.map((s) => (
          <li
            key={s.name}
            className={most > 0 && s.files.length === most ? "most" : ""}
          >
            <b>{t(s.name)}</b>
            <span>{t("{n}명", { n: s.files.length })}</span>
            {s.files.length ? (
              <small>
                {s.files.slice(0, 6).join(", ")}
                {s.files.length > 6
                  ? t(" 밖에 {n}명", { n: s.files.length - 6 })
                  : ""}
              </small>
            ) : null}
            {most > 0 && s.files.length === most ? (
              <em>{t("가장 많이 멈춘 단계")}</em>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="small">
        {t("다섯 단계를 모두 기록한 작품 {n}개", { n: done.length })}
      </p>
    </section>
  );
}
