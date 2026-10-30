import { useEffect, useRef, useState } from "react";
import { LIMITS, now, stageDone } from "./model";
import type { Feedback } from "./model";
import {
  clearClassSession,
  downloadText,
  exportJSON,
  loadClassSession,
  parseImport,
  saveClassSession,
} from "./storage";
import {
  emptyFeedback,
  graded,
  levelNames,
  summarize,
  toCSV,
} from "./classSummary";
import type { Entry } from "./classSummary";
import { Empty, Field, Icon, Pill } from "./ui";
import { RubricChoices } from "./Rubric";
import { rubric } from "./data";
import { stageNames } from "./model";
const fileBase = (name: string) => name.replace(/\.json$/i, "");
export function ClassReview({ message }: { message: (s: string) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  // 새로고침해도 평가가 사라지지 않게 이 기기에 임시로 보관하고 다시 연다.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    let alive = true;
    loadClassSession<Entry>()
      .then((saved) => {
        if (!alive) return;
        if (saved?.entries.length) {
          setEntries(saved.entries);
          message(
            `${new Date(saved.savedAt).toLocaleString("ko-KR")}까지 평가하던 작품 ${saved.entries.length}개를 이어서 열었어요.`,
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
            "평가 목록을 이 기기에 보관하지 못했어요. CSV나 평가 파일로 내려받아 두세요.",
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
          throw new Error("파일은 2MB 이하여야 해요.");
        const works = parseImport(await file.text());
        works.forEach((work, i) =>
          added.push({
            key: `${file.name}#${i}:${work.id}`,
            file: works.length > 1 ? `${file.name} (${i + 1})` : file.name,
            work: { ...work, feedback: work.feedback ?? emptyFeedback(now()) },
          }),
        );
      } catch (e) {
        failed.push(
          `${file.name}: ${e instanceof Error ? e.message : "읽지 못했어요."}`,
        );
      }
    }
    setEntries((list) => [...list, ...added]);
    setErrors(failed);
    message(
      `작품 ${added.length}개를 읽었어요.${failed.length ? ` 파일 ${failed.length}개는 읽지 못했어요.` : ""}`,
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
  return (
    <section className="class-review" aria-labelledby="class-review-title">
      <div className="panel">
        <h2 id="class-review-title">학급 작품 모으기</h2>
        <p>
          학생이 <b>내 작품 선반 → 목록 백업</b> 또는 작업실의 <b>파일 백업</b>
          으로 낸 JSON 파일을 여러 개 한꺼번에 고르세요. 파일 이름을 학생
          번호·이름으로 바꿔 받으면 누구의 작품인지 알아보기 쉬워요.
        </p>
        <div className="note">
          <Icon name="shield" />
          평가 중인 목록은 이 기기에만 임시로 보관해 새로고침해도 이어서 열려요.
          서버에는 올리지 않고, 학생 작품 선반과도 섞이지 않아요. 평가를 마치면
          CSV나 평가 파일로 내려받고 <b>목록 비우기</b>로 지워 주세요.
        </div>
        <div className="button-row">
          <button className="primary" onClick={() => input.current?.click()}>
            <Icon name="folder" />
            학생 작품 파일 고르기
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
            <Icon name="download" />표 CSV로 내려받기
          </button>
          <button
            disabled={!entries.length}
            onClick={() => {
              entries.forEach(returnFile);
              message(
                `평가를 넣은 작품 파일 ${entries.length}개의 다운로드를 요청했어요. 여러 파일 다운로드를 허용해 주세요.`,
              );
            }}
          >
            평가 파일 모두 내려받기
          </button>
          <button
            className="danger-text"
            disabled={!entries.length}
            onClick={() => {
              setEntries([]);
              setErrors([]);
            }}
          >
            목록 비우기
          </button>
        </div>
        <input
          ref={input}
          className="sr-only"
          tabIndex={-1}
          type="file"
          multiple
          accept=".json,application/json"
          aria-label="학생 작품 JSON 파일 여러 개"
          onChange={(e) => void load(e.target.files)}
        />
        {errors.length ? (
          <div role="alert" className="warning">
            <b>읽지 못한 파일</b>
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
            <h3>한눈에 보기</h3>
            <p>
              작품 {entries.length}개 · 다섯 단계 모두 기록{" "}
              {summaries.filter((s) => s.stages.every(Boolean)).length}개 · 평가
              완료 {entries.filter((e) => graded(e.work.feedback)).length}개
            </p>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="학급 작품 요약표 · 좌우 방향키로 이동해 읽기"
            >
              <table className="class-table">
                <thead>
                  <tr>
                    <th>파일 / 작품</th>
                    {stageNames.map((s, i) => (
                      <th key={s}>
                        {i + 1}. {s}
                      </th>
                    ))}
                    <th>직접 확인</th>
                    <th>버전</th>
                    <th>힌트</th>
                    <th>평가</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, k) => {
                    const s = summaries[k];
                    return (
                      <tr key={e.key}>
                        <td>
                          <b>{e.file}</b>
                          <br />
                          <small>
                            {s.title} · {s.kind} · {s.mission}
                          </small>
                        </td>
                        {s.stages.map((done, i) => (
                          <td key={i} className={done ? "stage-done" : ""}>
                            {done ? "✓ 완료" : "남음"}
                          </td>
                        ))}
                        <td>
                          통과 {s.manualPass}
                          {s.pending ? ` · 남은 ${s.pending}` : ""}
                          {s.retested ? " · 재검사함" : ""}
                        </td>
                        <td>{s.versions}개</td>
                        <td>
                          {s.hintsUsed ? `${s.hintsUsed}번째까지` : "안 봄"}
                        </td>
                        <td>
                          {graded(e.work.feedback) ? (
                            <Pill tone="green">평가 완료</Pill>
                          ) : (
                            <Pill tone="paper">평가 전</Pill>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="class-total">
                    <td>단계별 완료</td>
                    {stageNames.map((_, i) => (
                      <td key={i}>
                        {summaries.filter((s) => s.stages[i]).length} /{" "}
                        {entries.length}
                      </td>
                    ))}
                    <td colSpan={4} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="class-cards">
            {entries.map((e) => (
              <ReviewCard
                key={e.key}
                entry={e}
                onChange={(p) => setFeedback(e.key, p)}
                download={() => returnFile(e)}
              />
            ))}
          </div>
        </>
      ) : (
        <Empty title="아직 읽은 작품이 없어요">
          <p>학생 작품 파일을 고르면 단계 기록 표와 평가 카드가 나와요.</p>
        </Empty>
      )}
    </section>
  );
}
function ReviewCard({
  entry: e,
  onChange,
  download,
}: {
  entry: Entry;
  onChange: (p: Partial<Feedback>) => void;
  download: () => void;
}) {
  const d = e.work.draft;
  const f = e.work.feedback!;
  const done = stageDone(d);
  return (
    <details className="panel review-card">
      <summary>
        <b>{e.file}</b>
        <span>
          {d.title || "제목 없는 작품"} · {done.filter(Boolean).length} / 5단계
        </span>
        {graded(f) ? <Pill tone="green">평가 완료</Pill> : null}
      </summary>
      <dl className="record-list">
        <div>
          <dt>실행 전 예상</dt>
          <dd className="preserve">{d.prediction || "미기록"}</dd>
        </div>
        <div>
          <dt>바꾼 동작과 이유</dt>
          <dd className="preserve">
            {[d.change.behavior, d.change.reason].filter(Boolean).join(" / ") ||
              "미기록"}
          </dd>
        </div>
        <div>
          <dt>직접 확인한 검사</dt>
          <dd>
            {d.checks
              .filter((c) => c.revision === d.revision && c.source !== "auto")
              .map((c) => `${c.label}: ${c.actual || "실제 결과 미기록"}`)
              .join(" / ") || "미기록"}
          </dd>
        </div>
        <div>
          <dt>작동 원리와 배운 점</dt>
          <dd className="preserve">{d.reflection || "미기록"}</dd>
        </div>
        <div>
          <dt>도움받은 내용</dt>
          <dd className="preserve">{d.help || "미기록"}</dd>
        </div>
        <div>
          <dt>학생 자기 평가</dt>
          <dd>
            {e.work.selfAssessment?.levels.some((l) => l > 0)
              ? rubric
                  .map(
                    (r, i) =>
                      `${r[0]}: ${levelNames[e.work.selfAssessment!.levels[i]]}`,
                  )
                  .join(" / ")
              : "미기록"}
            {e.work.selfAssessment?.note.trim()
              ? ` · ${e.work.selfAssessment.note}`
              : ""}
          </dd>
        </div>
      </dl>
      <h3>과정 평가</h3>
      <RubricChoices
        name={e.key}
        levels={f.levels}
        onChange={(levels) => onChange({ levels })}
      />
      <Field
        area
        label="확인한 근거와 다음 도움"
        value={f.note}
        onChange={(note) => onChange({ note })}
      />
      <button onClick={download}>
        <Icon name="download" />
        평가를 넣은 작품 파일 내려받기
      </button>
      <p className="small muted">
        학생이 이 파일을 <b>파일 가져오기</b>로 열면 포트폴리오에서 평가와
        의견을 볼 수 있어요.
      </p>
    </details>
  );
}
