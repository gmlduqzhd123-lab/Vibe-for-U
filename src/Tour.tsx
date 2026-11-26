import "./late.css";
import { useEffect, useState } from "react";
import { APP_PREFIX } from "./model";
import { useT } from "./i18n";
// 첫 사용 둘러보기: 작업실 화면의 다섯 곳을 차례로 짚어 준다. 화면을 가리지 않고 짚는 곳에 테두리만 두른다.
// 본 적이 있는지는 이 기기에만 기억한다.
const SEEN_KEY = `${APP_PREFIX}tour-seen`;
export const tourSteps: { target: string; title: string; text: string }[] = [
  {
    target: ".stage-nav",
    title: "다섯 단계",
    text: "목표부터 설명까지 다섯 단계를 차례로 해요. 단계 이름을 누르면 그 단계로 가고, 기록을 마친 단계에는 체크 표시가 생겨요.",
  },
  {
    target: ".workspace-meta",
    title: "지금 고치는 작품",
    text: "지금 고치는 작품의 이름이에요. 고친 내용은 저절로 이 기기에 저장돼요.",
  },
  {
    target: ".plain-fieldset",
    title: "이번 단계에서 할 일",
    text: "이 아래에 이번 단계의 글을 적어요. 3단계부터는 설정을 바꾸고 실행 화면을 직접 눌러 볼 수 있어요.",
  },
  {
    target: ".workspace-heading .button-row",
    title: "되돌리기와 백업",
    text: "잘못 고쳤으면 되돌리기를 눌러요. 파일 백업으로 작품을 파일로 남기고, 과정 포트폴리오에서 내가 한 일을 모아 봐요.",
  },
  {
    target: ".stage-nav",
    title: "막힐 때는",
    text: "막히면 화면의 힌트를 열어 보세요. 한 단계를 마치면 아래의 ‘다음 단계’를 눌러 넘어가요.",
  },
];
const seen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};
export function Tour() {
  const t = useT();
  const [at, setAt] = useState(-1);
  const [fresh, setFresh] = useState(() => !seen());
  const step = tourSteps[at];
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    el?.classList.add("tour-target");
    el?.scrollIntoView?.({ block: "nearest" });
    return () => el?.classList.remove("tour-target");
  }, [step]);
  const open = () => {
    setAt(0);
    setFresh(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // 기억하지 못해도 둘러보기는 그대로 쓸 수 있다.
    }
  };
  if (!step)
    return (
      <p className="tour-start no-print">
        <button className={fresh ? "tour-fresh" : "text-button"} onClick={open}>
          {t(fresh ? "처음이라면 화면 둘러보기" : "화면 둘러보기")}
        </button>
      </p>
    );
  return (
    <section className="tour no-print" aria-label={t("화면 둘러보기")}>
      <p role="status">
        <b>
          {t("둘러보기 {n} / {m} · {title}", {
            n: at + 1,
            m: tourSteps.length,
            title: t(step.title),
          })}
        </b>{" "}
        {t(step.text)}
      </p>
      <div className="button-row">
        <button disabled={at === 0} onClick={() => setAt(at - 1)}>
          {t("이전 안내")}
        </button>
        {at < tourSteps.length - 1 ? (
          <button className="primary" onClick={() => setAt(at + 1)}>
            {t("다음 안내")}
          </button>
        ) : null}
        <button
          className={at < tourSteps.length - 1 ? "text-button" : "primary"}
          onClick={() => setAt(-1)}
        >
          {t("둘러보기 끝내기")}
        </button>
      </div>
    </section>
  );
}
