import { rubric, missions } from "./data";
import { kindNames, stageDone } from "./model";
import type { Feedback, Work } from "./model";
import { Icon } from "./ui";
import { dateLocale, useLang, useT } from "./i18n";
import { levelNames } from "./classSummary";
import { localizeMission } from "./missionText";
import type { Navigate } from "./Pages";
// 학기말 성장 포트폴리오 묶음: 내 작품 여러 개의 과정 기록을 한 번에 모아 인쇄(PDF 저장)한다.
// 첫 작품과 마지막 작품의 자기 평가를 나란히 두어 자란 점을 본다.
const rated = (f: Feedback | null) => Boolean(f && f.levels.some((l) => l > 0));
export function Growth({ works, go }: { works: Work[]; go: Navigate }) {
  const t = useT();
  const lang = useLang();
  const list = [...works].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const day = (s: string) => new Date(s).toLocaleDateString(dateLocale(lang));
  const self = list.filter((w) => rated(w.selfAssessment));
  const first = self[0];
  const last = self.length > 1 ? self[self.length - 1] : undefined;
  const text = (v: string) => v.trim() || t("아직 기록하지 않았어요.");
  return (
    <article className="growth">
      <div className="button-row no-print">
        <button
          className="primary"
          disabled={!list.length}
          onClick={() => window.print()}
        >
          <Icon name="print" />
          {t("인쇄 / PDF 저장")}
        </button>
        <button onClick={() => go("library")}>{t("작품 선반으로")}</button>
      </div>
      <header className="growth-cover">
        <span className="eyebrow">{t("학기말 성장 포트폴리오")}</span>
        <h1>{t("내가 만들고 고쳐 온 길")}</h1>
        {list.length ? (
          <p>
            {t("작품 {n}개 · {from} ~ {to}", {
              n: list.length,
              from: day(list[0].createdAt),
              to: day(list[list.length - 1].updatedAt),
            })}
            {" · "}
            {t("다섯 단계를 모두 기록한 작품 {n}개", {
              n: list.filter((w) => stageDone(w.draft).every(Boolean)).length,
            })}
          </p>
        ) : (
          <p>{t("아직 작품이 없어요. 미션을 하나 골라 시작해 보세요.")}</p>
        )}
      </header>
      {first ? (
        <section className="growth-compare">
          <h2>{t("스스로 평가한 단계의 변화")}</h2>
          <table>
            <thead>
              <tr>
                <th>{t("관찰 항목")}</th>
                <th>
                  {t("처음")} · {first.draft.title || t("제목 없는 작품")}
                </th>
                {last ? (
                  <th>
                    {t("마지막")} · {last.draft.title || t("제목 없는 작품")}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rubric.map((row, i) => {
                const a = first.selfAssessment!.levels[i];
                const b = last?.selfAssessment?.levels[i] ?? 0;
                return (
                  <tr key={row[0]}>
                    <td>{t(row[0])}</td>
                    <td>{t(levelNames[a])}</td>
                    {last ? (
                      <td>
                        {t(levelNames[b])}
                        {b > a ? ` ↑ ${t("자랐어요")}` : ""}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!last ? (
            <p className="small muted">
              {t(
                "자기 평가를 한 작품이 두 개 이상이면 처음과 마지막을 비교해요.",
              )}
            </p>
          ) : null}
        </section>
      ) : null}
      {list.map((w, k) => {
        const found = missions.find((m) => m.id === w.missionId);
        const m = found && localizeMission(found, lang);
        const d = w.draft;
        const done = stageDone(d).filter(Boolean).length;
        return (
          <section className="growth-work" key={w.id}>
            <h2>
              {k + 1}. {d.title || t("제목 없는 작품")}
            </h2>
            <p className="small muted">
              {t(kindNames[w.kind])} · {m?.title} · {day(w.createdAt)} ·{" "}
              {t("{n} / 5단계 기록", { n: done })} ·{" "}
              {t("버전 {n}개", { n: w.versions.length })}
            </p>
            <dl className="record-list">
              <div>
                <dt>{t("실행 전 예상")}</dt>
                <dd>{text(d.prediction)}</dd>
              </div>
              <div>
                <dt>{t("수정 이유")}</dt>
                <dd>{text(d.change.reason)}</dd>
              </div>
              <div>
                <dt>{t("작동 원리와 배운 점")}</dt>
                <dd>{text(d.reflection)}</dd>
              </div>
              {w.feedback?.note.trim() ? (
                <div>
                  <dt>{t("선생님 · 확인한 근거와 다음 도움")}</dt>
                  <dd>{w.feedback.note}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        );
      })}
    </article>
  );
}
