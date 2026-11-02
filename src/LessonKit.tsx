import { useLang, useT } from "./i18n";
import { localizeMission } from "./missionText";
import { lessonMissionIds, lessons, missions } from "./data";
import { kindNames } from "./model";
import { Icon } from "./ui";
import { qrPath } from "./qrTransfer";
import type { Navigate } from "./Pages";
// 오늘 수업 키트: 차시 목표·진행 순서·미션 QR·준비물·살펴볼 것을 A4 한 장에 모아 인쇄한다.
// 학생은 칠판에 붙인 QR을 기기 카메라로 비춰 오늘 미션을 바로 연다. 교사 자료라 한국어로 둔다.
export function LessonKit({ number, go }: { number: number; go: Navigate }) {
  const t = useT();
  const lang = useLang();
  const lesson = lessons[number - 1];
  const mission = localizeMission(
    missions.find((m) => m.id === lessonMissionIds[number - 1])!,
    lang,
  );
  const url = `${location.origin}${location.pathname}#/mission/${mission.id}`;
  const qr = qrPath(url);
  return (
    <article className="lesson-kit">
      <div className="button-row no-print">
        <button className="primary" onClick={() => window.print()}>
          <Icon name="print" />
          {t("A4 한 장으로 인쇄")}
        </button>
        <button onClick={() => go("teacher")}>{t("교사 자료실로")}</button>
      </div>
      <header className="kit-head">
        <div>
          <span className="eyebrow">
            {t("뚝딱 바이브 공작소 · 오늘 수업 키트")}
          </span>
          <h1>
            {t("{n}차시 · {title}", { n: number, title: t(lesson.title) })}
          </h1>
          <p>
            <b>{t("오늘의 목표")}</b> {t(lesson.goal)}
          </p>
        </div>
        <figure className="kit-qr">
          <svg
            role="img"
            aria-label={t("{title} 미션 주소 QR 코드", {
              title: mission.title,
            })}
            viewBox={`0 0 ${qr.size} ${qr.size}`}
            shapeRendering="crispEdges"
          >
            <rect width={qr.size} height={qr.size} fill="#fff" />
            <path d={qr.d} fill="#000" />
          </svg>
          <figcaption>
            {t("카메라로 비추면 오늘 미션이 열려요")}
            <br />
            <b>
              {t(kindNames[mission.kind])} · {mission.title}
            </b>
          </figcaption>
        </figure>
      </header>
      <section>
        <h2>{t("진행 순서 (40분)")}</h2>
        <ol className="kit-timeline">
          <li>
            <b>{t("도입 5분")}</b> {t(lesson.intro)}
          </li>
          <li>
            <b>{t("활동 30분")}</b> {t(lesson.activity)}
          </li>
          <li>
            <b>{t("정리 5분")}</b> {t(lesson.close)}
          </li>
        </ol>
      </section>
      <div className="kit-grid">
        <section>
          <h2>{t("미션에서 할 일")}</h2>
          <p>
            <b>{t("먼저 예상하기")}</b> {mission.prediction}
          </p>
          <p>
            <b>{t("검사할 것")}</b>{" "}
            {mission.tests.map((t) => t.label).join(" · ")}
          </p>
          <p>
            <b>{t("이번 과제")}</b> {mission.task}
          </p>
        </section>
        <section>
          <h2>{t("준비와 살펴볼 것")}</h2>
          <p>
            <b>{t("준비물")}</b> {t(lesson.materials)} ·{" "}
            {t("{n}차시 학생 활동지(앞뒤 2쪽)", { n: number })}
          </p>
          <p>
            <b>{t("핵심 질문")}</b> {t(lesson.question)}
          </p>
          <p>
            <b>{t("살펴볼 것")}</b> {t(lesson.observe)}
          </p>
          <p>
            <b>{t("기기 문제가 생기면")}</b> {t(lesson.fallback)}
          </p>
        </section>
      </div>
      <section>
        <h2>{t("수업 전 확인")}</h2>
        <ul className="kit-checks">
          <li>{t("□ 기기마다 QR로 미션이 열리고 ‘기기에 저장됨’이 보여요")}</li>
          <li>{t("□ 짝 역할(운전자·관찰자)과 교대 시간을 정했어요")}</li>
          <li>
            {t(
              "□ 수업 끝에 ‘수업 끝 정리 도우미’로 백업·정리할 시간을 남겼어요",
            )}
          </li>
        </ul>
        <p className="kit-url">{t("미션 주소: {url}", { url })}</p>
      </section>
    </article>
  );
}
