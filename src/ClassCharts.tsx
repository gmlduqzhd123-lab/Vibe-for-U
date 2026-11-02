import { useT } from "./i18n";
import { rubric } from "./data";
import { stageNames } from "./model";
import type { Work } from "./model";
import { levelNames, summarize } from "./classSummary";
// 학급 진행 요약 그래프: 학생들이 멈춘 단계, 힌트 사용, 자기 평가와 교사 평가의 차이를 본다.
// 막대·점 옆에 값을 함께 쓰고, 같은 내용을 표로도 펼쳐 볼 수 있게 한다.
const SELF = "#1f8a5b";
const TEACHER = "#7560ad";
export function classStats(works: Work[]) {
  const s = works.map(summarize);
  // 아직 기록하지 않은 첫 단계(모두 했으면 5)
  const next = s.map((x) => {
    const i = x.stages.findIndex((done) => !done);
    return i < 0 ? stageNames.length : i;
  });
  const stuck = [...stageNames, "모두 기록"].map((label, i) => ({
    label,
    n: next.filter((v) => v === i).length,
  }));
  const hints = ["안 봄", "1번째", "2번째", "3번째까지"].map((label, i) => ({
    label,
    n: s.filter((x) => Math.min(x.hintsUsed, 3) === i).length,
  }));
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  const levels = rubric.map((row, i) => {
    const pairs = works
      .map((w) => [
        w.selfAssessment?.levels[i] ?? 0,
        w.feedback?.levels[i] ?? 0,
      ])
      .filter(([a, b]) => a > 0 && b > 0);
    return {
      label: row[0],
      self: avg(pairs.map((p) => p[0])),
      teacher: avg(pairs.map((p) => p[1])),
      n: pairs.length,
    };
  });
  return { stuck, hints, levels };
}
function Bars({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; n: number }[];
  total: number;
}) {
  const t = useT();
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <figure className="class-chart">
      <figcaption>{title}</figcaption>
      <ul className="bar-list">
        {rows.map((r) => (
          <li
            key={r.label}
            title={t("{label}: {n}명 / {total}명", {
              label: t(r.label),
              n: r.n,
              total,
            })}
          >
            <span className="bar-label">{t(r.label)}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${(r.n / max) * 100}%` }}
              />
            </span>
            <span className="bar-value">{t("{n}명", { n: r.n })}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
export function ClassCharts({ works }: { works: Work[] }) {
  const t = useT();
  const { stuck, hints, levels } = classStats(works);
  const most = stuck
    .slice(0, stageNames.length)
    .reduce((a, b) => (b.n > a.n ? b : a));
  const rated = levels.filter((l) => l.n > 0);
  const gaps = rated
    .map((l) => ({ ...l, gap: (l.self ?? 0) - (l.teacher ?? 0) }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const x = (v: number) => 12 + ((v - 1) / 2) * 216;
  return (
    <section
      className="panel class-charts"
      aria-labelledby="class-charts-title"
    >
      <h3 id="class-charts-title">{t("학급 진행 요약 그래프")}</h3>
      <p className="class-chart-headline">
        {most.n
          ? t(
              "가장 많은 학생({n}명)이 「{stage}」 단계에서 멈춰 있어요. 다음 차시 도입에서 이 단계를 함께 짚어 보세요.",
              { n: most.n, stage: t(most.label) },
            )
          : t("모든 학생이 다섯 단계를 모두 기록했어요.")}
      </p>
      <div className="class-chart-grid">
        <Bars
          title={t("다음에 기록할 단계별 학생 수")}
          rows={stuck}
          total={works.length}
        />
        <Bars
          title={t("미션 힌트를 연 정도")}
          rows={hints}
          total={works.length}
        />
        <figure className="class-chart">
          <figcaption>{t("자기 평가와 선생님 평가 (평균 단계)")}</figcaption>
          <div className="dot-legend" aria-hidden="true">
            <span>
              <svg width="12" height="12">
                <circle cx="6" cy="6" r="5" fill={SELF} />
              </svg>
              {t("스스로")}
            </span>
            <span>
              <svg width="12" height="12">
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  fill="none"
                  stroke={TEACHER}
                  strokeWidth="2"
                />
              </svg>
              {t("선생님")}
            </span>
          </div>
          {rated.length ? (
            <ul className="dot-list">
              {levels.map((l) => (
                <li
                  key={l.label}
                  title={
                    l.n
                      ? t("{label}: 스스로 {self} · 선생님 {teacher} ({n}명)", {
                          label: t(l.label),
                          self: l.self!.toFixed(1),
                          teacher: l.teacher!.toFixed(1),
                          n: l.n,
                        })
                      : t("{label}: 둘 다 평가한 작품 없음", {
                          label: t(l.label),
                        })
                  }
                >
                  <span className="bar-label">{t(l.label)}</span>
                  <svg
                    viewBox="0 0 240 24"
                    className="dot-track"
                    role="img"
                    aria-label={
                      l.n
                        ? t(
                            "{label}: 스스로 평균 {self}, 선생님 평균 {teacher}",
                            {
                              label: t(l.label),
                              self: l.self!.toFixed(1),
                              teacher: l.teacher!.toFixed(1),
                            },
                          )
                        : t("{label}: 비교할 평가 없음", { label: t(l.label) })
                    }
                  >
                    <line
                      x1="12"
                      x2="228"
                      y1="12"
                      y2="12"
                      className="dot-axis"
                    />
                    {[1, 2, 3].map((v) => (
                      <line
                        key={v}
                        x1={x(v)}
                        x2={x(v)}
                        y1="7"
                        y2="17"
                        className="dot-tick"
                      />
                    ))}
                    {l.n ? (
                      <>
                        <line
                          x1={x(l.self!)}
                          x2={x(l.teacher!)}
                          y1="12"
                          y2="12"
                          className="dot-gap"
                        />
                        <circle cx={x(l.self!)} cy="12" r="6" fill={SELF} />
                        <circle
                          cx={x(l.teacher!)}
                          cy="12"
                          r="5"
                          fill="none"
                          stroke={TEACHER}
                          strokeWidth="2.5"
                        />
                      </>
                    ) : null}
                  </svg>
                </li>
              ))}
              <li className="dot-scale" aria-hidden="true">
                <span />
                <span>
                  {levelNames.slice(1).map((n) => (
                    <small key={n}>{t(n)}</small>
                  ))}
                </span>
              </li>
            </ul>
          ) : (
            <p className="small muted">
              {t(
                "스스로 평가와 선생님 평가를 모두 넣은 작품이 생기면 비교가 나와요.",
              )}
            </p>
          )}
          {gaps[0] && Math.abs(gaps[0].gap) >= 0.5 ? (
            <p className="small">
              {t(
                gaps[0].gap > 0
                  ? "「{label}」에서 학생들이 스스로를 더 높게 봤어요(평균 차이 {gap}단계). 근거를 함께 이야기해 보세요."
                  : "「{label}」에서 학생들이 스스로를 더 낮게 봤어요(평균 차이 {gap}단계). 근거를 함께 이야기해 보세요.",
                {
                  label: t(gaps[0].label),
                  gap: Math.abs(gaps[0].gap).toFixed(1),
                },
              )}
            </p>
          ) : null}
        </figure>
      </div>
      <details>
        <summary>{t("표로 보기")}</summary>
        <table>
          <thead>
            <tr>
              <th>{t("항목")}</th>
              <th>{t("값")}</th>
            </tr>
          </thead>
          <tbody>
            {stuck.map((r) => (
              <tr key={`s-${r.label}`}>
                <td>{t("다음 단계 · {label}", { label: t(r.label) })}</td>
                <td>{t("{n}명", { n: r.n })}</td>
              </tr>
            ))}
            {hints.map((r) => (
              <tr key={`h-${r.label}`}>
                <td>{t("힌트 · {label}", { label: t(r.label) })}</td>
                <td>{t("{n}명", { n: r.n })}</td>
              </tr>
            ))}
            {levels.map((l) => (
              <tr key={`l-${l.label}`}>
                <td>{t("평가 · {label}", { label: t(l.label) })}</td>
                <td>
                  {l.n
                    ? t("스스로 {self} · 선생님 {teacher} ({n}명)", {
                        self: l.self!.toFixed(1),
                        teacher: l.teacher!.toFixed(1),
                        n: l.n,
                      })
                    : t("비교할 평가 없음")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
