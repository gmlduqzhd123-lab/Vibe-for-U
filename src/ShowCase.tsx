import { useLang, useT } from "./i18n";
import { localizeMission } from "./missionText";
import { useEffect, useRef, useState } from "react";
import type { Entry } from "./classSummary";
import { Preview } from "./Preview";
import { missions } from "./data";
import { kindNames } from "./model";
// 작품 발표 화면: 학급 모으기에 넣은 작품을 프로젝터에서 차례로 실행하고,
// 학생의 예상·직접 확인한 결과·고친 이유·작동 원리를 한 장씩 크게 보여 준다. 교사 화면이라 한국어로 둔다.
const slides = ["작품 실행", "예상과 실제", "고친 이유", "작동 원리"] as const;
const empty = "아직 기록하지 않았어요.";
export function ShowCase({
  entries,
  close,
}: {
  entries: Entry[];
  close: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const text = (v: string) => v.trim() || t(empty);
  const [i, setI] = useState(0);
  const [slide, setSlide] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const e = entries[Math.min(i, entries.length - 1)];
  const d = e.work.draft;
  const found = missions.find((m) => m.id === e.work.missionId);
  const mission = found && localizeMission(found, lang);
  const manual = d.checks.filter(
    (c) => c.revision === d.revision && c.source !== "auto" && c.actual.trim(),
  );
  const move = (step: number) => {
    const next = slide + step;
    if (next >= 0 && next < slides.length) return setSlide(next);
    const work = i + step;
    if (work < 0 || work >= entries.length) return;
    setI(work);
    setSlide(step > 0 ? 0 : slides.length - 1);
  };
  useEffect(() => {
    root.current?.focus();
  }, []);
  return (
    <div
      ref={root}
      className="showcase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="showcase-title"
      tabIndex={-1}
      onKeyDown={(k) => {
        if (
          k.target instanceof HTMLInputElement ||
          k.target instanceof HTMLTextAreaElement
        )
          return;
        if (k.key === "ArrowRight" || k.key === "PageDown") move(1);
        else if (k.key === "ArrowLeft" || k.key === "PageUp") move(-1);
        else if (k.key === "Escape") close();
        else return;
        k.preventDefault();
      }}
    >
      <header className="showcase-head">
        <div>
          <span className="eyebrow">
            {t("작품 {n} / {total} · {file}", {
              n: i + 1,
              total: entries.length,
              file: e.file,
            })}
          </span>
          <h2 id="showcase-title">{d.title || t("제목 없는 작품")}</h2>
          <p className="small">
            {t(kindNames[e.work.kind])} · {mission?.title}
          </p>
        </div>
        <button onClick={close}>{t("✕ 발표 끝내기")}</button>
      </header>
      <nav className="showcase-tabs" aria-label={t("발표 장면")}>
        {slides.map((s, k) => (
          <button
            key={s}
            aria-current={k === slide ? "step" : undefined}
            className={k === slide ? "active" : ""}
            onClick={() => setSlide(k)}
          >
            {k + 1}. {t(s)}
          </button>
        ))}
      </nav>
      <section className="showcase-body" aria-live="polite">
        {slide === 0 ? (
          <Preview
            key={`${e.key}:${d.revision}`}
            config={d.config}
            onRun={() => {}}
          />
        ) : slide === 1 ? (
          <div className="showcase-text">
            <h3>{t("누르기 전에 이렇게 예상했어요")}</h3>
            <p>{text(d.prediction)}</p>
            <h3>{t("직접 눌러 보니")}</h3>
            {manual.length ? (
              <ul>
                {manual.map((c) => (
                  <li key={c.id}>
                    <b>{c.label}</b> · {c.actual}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{text("")}</p>
            )}
          </div>
        ) : slide === 2 ? (
          <div className="showcase-text">
            <h3>{t("이상했던 점")}</h3>
            <p>{text(d.change.situation || d.change.actual)}</p>
            <h3>{t("이렇게 바꿨어요")}</h3>
            <p>{text(d.change.behavior)}</p>
            <h3>{t("바꾼 까닭")}</h3>
            <p>{text(d.change.reason)}</p>
          </div>
        ) : (
          <div className="showcase-text">
            <h3>{t("이 앱은 이렇게 움직여요")}</h3>
            <p>{text(d.reflection)}</p>
          </div>
        )}
      </section>
      <footer className="showcase-foot">
        <button onClick={() => move(-1)} disabled={i === 0 && slide === 0}>
          {t("← 이전")}
        </button>
        <span className="small">{t("←·→ 방향키로 넘기고 Esc로 끝내요")}</span>
        <button
          className="primary"
          onClick={() => move(1)}
          disabled={i === entries.length - 1 && slide === slides.length - 1}
        >
          {t("다음 →")}
        </button>
      </footer>
    </div>
  );
}
// 칭찬·질문 카드: 한 쪽에 여섯 장. 발표를 들은 친구가 손으로 적어 건넨다.
export function PraiseCards({ entries }: { entries: Entry[] }) {
  const t = useT();
  const titles = entries.map((e) => e.work.draft.title || e.file);
  const cards = titles.length ? titles : Array.from({ length: 6 }, () => "");
  return (
    <div className="praise-cards">
      {cards.map((title, k) => (
        <div className="praise-card" key={k}>
          <b>{t("칭찬·질문 카드")}</b>
          <p>
            {t("작품: {title}", { title: title || "____________________" })}
          </p>
          <p>{t("좋았던 점 ________________________________")}</p>
          <p>________________________________________</p>
          <p>{t("궁금한 점 ________________________________")}</p>
          <p>{t("적은 친구 ____________")}</p>
        </div>
      ))}
    </div>
  );
}
