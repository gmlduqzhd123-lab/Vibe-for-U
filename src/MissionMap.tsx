import { missions } from "./data";
import { courses } from "./customMissions";
import { kindNames, kinds, stageDone } from "./model";
import type { Work } from "./model";
import { Icon } from "./ui";
import { useLang, useT } from "./i18n";
import { localizeMission } from "./missionText";
import type { Navigate } from "./Pages";
// 나의 미션 지도: 종류마다 미션을 길처럼 잇고, 내가 걸어온 곳을 표시한다. 순위나 점수는 없다.
// 상태는 색과 함께 글자(✓·…·○)와 이름으로도 알린다.
type State = "done" | "doing" | "new";
export function missionState(works: Work[], id: string): State {
  const mine = works.filter((w) => w.missionId === id);
  if (mine.some((w) => stageDone(w.draft).every(Boolean))) return "done";
  return mine.length ? "doing" : "new";
}
const mark: Record<State, string> = { done: "✓", doing: "…", new: "○" };
const label: Record<State, string> = {
  done: "다섯 단계 기록 완료",
  doing: "진행 중",
  new: "아직 시작하지 않음",
};
export function MissionMap({ works, go }: { works: Work[]; go: Navigate }) {
  const t = useT();
  const lang = useLang();
  const all = missions.map((m) => ({
    m: localizeMission(m, lang),
    state: missionState(works, m.id),
  }));
  const done = all.filter((x) => x.state === "done").length;
  const courseList = courses();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("내가 걸어온 길")}</span>
          <h1>{t("나의 미션 지도")}</h1>
          <p>
            {t("다섯 단계를 모두 기록한 미션 {n}개 / 전체 {m}개", {
              n: done,
              m: all.length,
            })}
          </p>
        </div>
      </div>
      <ul className="map-legend" aria-label={t("지도 표시")}>
        {(["done", "doing", "new"] as State[]).map((s) => (
          <li key={s} className={`map-dot ${s}`}>
            <span aria-hidden="true">{mark[s]}</span> {t(label[s])}
          </li>
        ))}
      </ul>
      <div className="mission-map">
        {courseList.map((c) => {
          const stops = c.missionIds
            .map((id) => all.find((x) => x.m.id === id))
            .filter((x): x is (typeof all)[number] => Boolean(x));
          const finished = stops.filter((x) => x.state === "done").length;
          // 코스는 순서대로 걷는다. 아직 끝내지 않은 첫 미션이 다음 할 곳이다.
          const nextStop = stops.find((x) => x.state !== "done");
          return (
            <section
              key={c.id}
              className="map-row course"
              aria-labelledby={`map-${c.id}`}
            >
              <h2 id={`map-${c.id}`}>
                <Icon name="book" />{" "}
                {t("우리 반 코스 · {title}", { title: c.title })}
                <small>
                  {t("{n} / {m} 완료", { n: finished, m: stops.length })}
                </small>
              </h2>
              <ol className="map-path">
                {stops.map(({ m, state }, i) => (
                  <li
                    key={m.id}
                    className={`map-stop ${state}${nextStop?.m.id === m.id ? " next" : ""}`}
                  >
                    <button
                      onClick={() => go(`mission/${m.id}`)}
                      aria-label={`${i + 1}. ${m.title} · ${t(label[state])}${nextStop?.m.id === m.id ? ` · ${t("다음에 할 미션")}` : ""}`}
                    >
                      <span className="map-dot-big" aria-hidden="true">
                        {state === "new" ? i + 1 : mark[state]}
                      </span>
                      <span className="map-name">{m.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
        {kinds.map((k) => (
          <section
            key={k}
            className={`map-row ${k}`}
            aria-labelledby={`map-${k}`}
          >
            <h2 id={`map-${k}`}>
              <Icon name={k} /> {t(kindNames[k])}
            </h2>
            <ol className="map-path">
              {all
                .filter((x) => x.m.kind === k)
                .map(({ m, state }) => (
                  <li key={m.id} className={`map-stop ${state}`}>
                    <button
                      onClick={() => go(`mission/${m.id}`)}
                      aria-label={`${t(kindNames[k])} ${m.order} · ${m.title} · ${t(label[state])}`}
                    >
                      <span className="map-dot-big" aria-hidden="true">
                        {state === "new" ? m.order : mark[state]}
                      </span>
                      <span className="map-name">{m.title}</span>
                    </button>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
