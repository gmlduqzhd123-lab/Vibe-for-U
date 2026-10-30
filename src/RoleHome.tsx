import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { missions } from "./data";
import type { Mission, Mode, Work } from "./model";
import { Icon } from "./ui";
import "./RoleHome.css";
import { useT } from "./i18n";

export function RoleHome({
  mode,
  setMode,
  lastWork,
  go,
  create,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  lastWork?: Work;
  go: (path: string) => void;
  create: (mission: Mission) => void;
}) {
  const t = useT();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        menu.current &&
        event.target instanceof Node &&
        !menu.current.contains(event.target)
      )
        menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        event.preventDefault();
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const navigate = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (menu.current) menu.current.open = false;
    go(path);
  };
  const continuePath = lastWork ? `work/${lastWork.id}/0` : "library";
  return (
    <div className="role-home">
      <header className="role-home-header">
        <a
          className="role-home-brand"
          href="#/home"
          onClick={(event) => navigate(event, "home")}
          aria-label={t("뚝딱 바이브 공작소 홈")}
        >
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            width="40"
            height="40"
            alt=""
          />
          <span>{t("뚝딱 바이브 공작소")}</span>
        </a>
        <div className="ys-key">
          <button type="button" className="ys-chip" data-ys-install>
            📲 <span className="ys-wide">{t("앱")} </span>
            {t("설치")}
          </button>
          <button
            type="button"
            className="ys-chip"
            data-qr
            aria-label={t("QR 코드로 접속")}
          >
            📱 QR
          </button>
        </div>
        <nav aria-label={t("전체 메뉴")}>
          <details className="role-home-menu" ref={menu}>
            <summary aria-label={t("전체 메뉴")}>
              <span className="role-home-menu-label">{t("전체 메뉴")}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="role-home-menu-panel">
              {[
                ["try", "3분 첫 체험"],
                ["explore", "완성 예제 눌러보기"],
                ["missions", "미션 공작대"],
                ["library", "내 작품 선반"],
                ["teacher", "교사 자료실"],
                ["share", "QR 소개 카드"],
              ].map(([path, label]) => (
                <a
                  href={`#/${path}`}
                  key={path}
                  onClick={(event) => navigate(event, path)}
                >
                  {t(label)}
                </a>
              ))}
              <button
                onClick={() => {
                  if (menu.current) menu.current.open = false;
                  create(missions[0]);
                }}
              >
                {t("첫 작품 만들기")}
              </button>
              <label className="role-home-mode">
                <span>{t("안내 모드")}</span>
                <select
                  aria-label={t("안내 모드")}
                  value={mode}
                  onChange={(event) => setMode(event.target.value as Mode)}
                >
                  <option value="child">{t("어린이 모드")}</option>
                  <option value="easy">{t("쉬운 모드 (3~4학년)")}</option>
                  <option value="adult">{t("일반 입문자 모드")}</option>
                </select>
              </label>
            </div>
          </details>
        </nav>
      </header>
      <section className="role-home-content" aria-labelledby="role-home-title">
        <div className="role-home-intro">
          <span className="role-home-eyebrow">
            {t("작은 앱으로 배우는 코딩의 원리")}
          </span>
          <h1 id="role-home-title">{t("누가 사용하나요")}</h1>
          <p>{t("퀴즈·이야기·타이머를 만들고 고치며 배워요")}</p>
        </div>
        <div className="role-home-cards">
          <a
            className="role-home-card student"
            href="#/try"
            onClick={(event) => navigate(event, "try")}
            aria-labelledby="student-entry-title"
            aria-describedby="student-entry-description"
            data-home-action="student"
          >
            <div className="role-home-icon">
              <Icon name="play" size={28} />
            </div>
            <div className="role-home-copy">
              <span className="role-home-overline">
                {t("직접 해 보고 싶어요")}
              </span>
              <h2 id="student-entry-title">{t("학생으로 시작")}</h2>
              <p id="student-entry-description">
                {t("3분 체험에서 작은 퀴즈를 고쳐봐요")}
              </p>
            </div>
            <span className="role-home-card-action">
              {t("체험 시작")} <Icon name="arrow" size={22} />
            </span>
          </a>
          <a
            className="role-home-card teacher"
            href="#/prepare"
            onClick={(event) => navigate(event, "prepare")}
            aria-labelledby="teacher-entry-title"
            aria-describedby="teacher-entry-description"
            data-home-action="teacher"
          >
            <div className="role-home-icon">
              <Icon name="book" size={28} />
            </div>
            <div className="role-home-copy">
              <span className="role-home-overline">
                {t("수업에 활용하고 싶어요")}
              </span>
              <h2 id="teacher-entry-title">{t("교사로 시작")}</h2>
              <p id="teacher-entry-description">
                {t("40분 수업과 활동지를 준비해요")}
              </p>
            </div>
            <span className="role-home-card-action">
              {t("수업 준비")} <Icon name="arrow" size={22} />
            </span>
          </a>
        </div>
        <div className="role-home-returning">
          <span>{t("전에 만든 작품이 있나요?")}</span>
          <a
            href={`#/${continuePath}`}
            onClick={(event) => navigate(event, continuePath)}
          >
            {t("이어서 만들기")} <Icon name="arrow" size={17} />
          </a>
        </div>
      </section>
      <footer className="role-home-footer">
        <span>{t("가입 없이 시작해요")}</span>
        <span aria-hidden="true">·</span>
        <span>{t("학습 기록은 내 기기에 남아요")}</span>
        <p className="ys-credit">
          © 2026 엽쌤. All rights reserved. ·{" "}
          <a
            href="https://gmlduqzhd123-lab.github.io/YScode/"
            target="_blank"
            rel="noopener"
          >
            {t("엽쌤의 다른 앱 보기 →")}
          </a>
        </p>
      </footer>
    </div>
  );
}
