import type { Work } from "./model";
import { aiStatus, kindNames, stageDone, correctionPrompt } from "./model";
import { Icon, Pill } from "./ui";
import type { Navigate } from "./Pages";
import { configSummary, revisionLabel } from "./learning";
const text = (v: string) => v || "아직 기록하지 않았어요.";
export function Portfolio({
  work: w,
  go,
  exportWork,
}: {
  work: Work;
  go: Navigate;
  exportWork: () => void;
}) {
  const d = w.draft;
  return (
    <>
      <div className="page-heading no-print">
        <div>
          <span className="eyebrow">만든 결과와, 만들어 온 과정</span>
          <h1>나의 과정 포트폴리오</h1>
          <p>쓴 문장의 길이가 아닌, 생각과 검사의 근거를 모아요.</p>
        </div>
        <div className="button-row">
          <button onClick={() => go(`work/${w.id}/4`)}>이어서 기록하기</button>
          <button onClick={exportWork}>
            <Icon name="download" />
            작품 파일
          </button>
          <button className="primary" onClick={() => window.print()}>
            <Icon name="print" />
            인쇄 / PDF 저장
          </button>
        </div>
      </div>
      <article className="portfolio panel">
        <header>
          <Pill tone="green">{kindNames[w.kind]} · 과정 기록</Pill>
          <h1>{d.title || "제목 없는 작품"}</h1>
          <p>
            {w.editingLabel} · {new Date(w.updatedAt).toLocaleString("ko-KR")}
          </p>
          <div className="badges">
            {stageDone(d).map((done, i) => (
              <Pill key={i} tone={done ? "green" : "paper"}>
                {i + 1}단계 {done ? "기록 완료" : "기록 남음"}
              </Pill>
            ))}
          </div>
        </header>
        <section>
          <h2>01. 만들 앱과 처음 정한 요구사항</h2>
          <dl className="record-list">
            <div>
              <dt>사용할 사람</dt>
              <dd>{text(d.promise.audience)}</dd>
            </div>
            <div>
              <dt>해결할 문제</dt>
              <dd>{text(d.promise.problem)}</dd>
            </div>
            <div>
              <dt>처음 정한 기능</dt>
              <dd>{text(w.versions[0].data.promise.features)}</dd>
            </div>
            <div>
              <dt>처음 완료 조건</dt>
              <dd>{text(w.versions[0].data.promise.done)}</dd>
            </div>
            <div>
              <dt>현재 완료 조건</dt>
              <dd>{text(d.promise.done)}</dd>
            </div>
            <div>
              <dt>입력과 예외</dt>
              <dd>
                {text(d.promise.input)} / {text(d.promise.exceptions)}
              </dd>
            </div>
          </dl>
          <h3>처음 쓴 요청문</h3>
          <p className="preserve">{text(d.originalPrompt)}</p>
          <h3>정리한 요청문</h3>
          <p className="preserve">{text(d.arrangedPrompt)}</p>
        </section>
        <section>
          <h2>02. 실행 전 예상</h2>
          <p className="preserve">{text(d.prediction)}</p>
          <p>
            현재 설정 실행 기록:{" "}
            {d.runRevision === d.revision
              ? "직접 버튼을 눌러 봄"
              : "현재 설정은 아직 실행하지 않음"}
          </p>
        </section>
        <section>
          <h2>03. 기대와 실제 · 검사 기록</h2>
          <p>
            자동 검사는 기본 연습 템플릿의 동작을 확인합니다. 직접 확인과 의견은
            사용자가 기록한 내용입니다.
          </p>
          {d.checks.length ? (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="학습 검사 기록표 · 좌우 방향키로 이동해 읽기"
            >
              <table>
                <thead>
                  <tr>
                    <th>검사한 작품 / 출처</th>
                    <th>검사와 기대</th>
                    <th>실제 결과</th>
                    <th>판정</th>
                  </tr>
                </thead>
                <tbody>
                  {d.checks.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {revisionLabel(w, c.revision)}
                        <br />
                        {c.source === "auto"
                          ? "자동 검사"
                          : c.source === "self"
                            ? "학습자 직접 확인"
                            : "친구·교사 의견"}
                      </td>
                      <td>
                        <b>{c.label}</b>
                        <br />
                        {c.expected}
                      </td>
                      <td className="preserve">{text(c.actual)}</td>
                      <td>
                        {c.status === "pass"
                          ? "확인됨"
                          : c.status === "fail"
                            ? "수정 필요"
                            : "미확인"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>아직 검사 기록이 없어요.</p>
          )}
        </section>
        <section>
          <h2>04. 발견한 문제와 수정 · 재검사</h2>
          <p className="preserve">{correctionPrompt(d.change)}</p>
          <h3>수정 전후 버전</h3>
          {w.versions.map((v, i) => (
            <div className="portfolio-version" key={v.id}>
              <h3>
                V{i + 1} · {v.label}
              </h3>
              <p>저장한 이유: {v.reason}</p>
              <p>수정 이유: {text(v.data.change.reason)}</p>
              <p>
                해당 설정 검사:{" "}
                {v.data.checks
                  .filter((c) => c.revision === v.data.revision)
                  .map(
                    (c) =>
                      `${c.label}: ${c.status === "pass" ? "확인됨" : c.status === "fail" ? "수정 필요" : "미확인"}`,
                  )
                  .join(" / ") || "미기록"}
              </p>
              <ul className="config-summary">
                {configSummary(v.data.config).map((line, k) => (
                  <li key={k}>{line}</li>
                ))}
              </ul>
              <details className="no-print">
                <summary>원본 설정 데이터 보기</summary>
                <pre>{JSON.stringify(v.data.config, null, 2)}</pre>
              </details>
            </div>
          ))}
        </section>
        <section>
          <h2>05. 작동 원리와 새로운 과제에 적용</h2>
          <p className="preserve">{text(d.reflection)}</p>
          <h3>도움받은 내용</h3>
          <p className="preserve">{text(d.help)}</p>
        </section>
        <section>
          <h2>06. 실제 AI 제작 활동 (별도 기록)</h2>
          <Pill>{aiStatus(d.ai)}</Pill>
          <p>사용 도구: {text(d.ai.tool)}</p>
          <p>도움: {text(d.ai.help)}</p>
          <p>실행 전 예상: {text(d.ai.expected)}</p>
          <p>검사 기준: {text(d.ai.criteria)}</p>
          <p className="preserve">실제 관찰: {text(d.ai.observation)}</p>
          <p>
            사용자 판정:{" "}
            {d.ai.result === "unobserved"
              ? "미확인"
              : d.ai.result === "pass"
                ? "기준 충족을 관찰함"
                : "수정할 점을 관찰함"}
          </p>
          <p className="preserve">수정 요청: {text(d.ai.revisionPrompt)}</p>
          <small>
            요청문 복사 여부로 실제 AI 제작 완료를 판단하지 않으며, 외부 AI
            코드를 자동으로 검증하지 않습니다.
          </small>
        </section>
      </article>
    </>
  );
}
