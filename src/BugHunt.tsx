import { debugFilled, kinds, kindNames } from "./model";
import type { Kind, Work } from "./model";
import { Icon, Pill } from "./ui";
import { useT } from "./i18n";
import type { Navigate } from "./Pages";
import { bugSolved, isBugChallenge } from "./bugChallenge";
// 버그 탐정 무한 연습 화면: 새 도전을 받고, 지금까지 찾아 고친 도전을 본다.
export function BugHunt({
  works,
  start,
  go,
}: {
  works: Work[];
  start: (kind?: Kind) => void;
  go: Navigate;
}) {
  const t = useT();
  const mine = works
    .filter(isBugChallenge)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const solved = mine.filter(bugSolved).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("버그 탐정 도전")}</span>
          <h1>{t("버그 탐정 무한 연습")}</h1>
          <p>
            {t(
              "정상 작품에 앱이 몰래 버그 하나를 숨겨 둬요. 예상하고 실행해 보며 이상한 점을 찾고, 규칙을 고친 뒤 자동 검사로 확인해요.",
            )}
          </p>
        </div>
      </div>
      <section className="panel bug-hunt-start">
        <h2>{t("새 도전 받기")}</h2>
        <div className="button-row">
          <button className="primary" onClick={() => start()}>
            <Icon name="plus" />
            {t("아무 종류나")}
          </button>
          {kinds.map((k) => (
            <button key={k} onClick={() => start(k)}>
              <Icon name={k} />
              {t(kindNames[k])}
            </button>
          ))}
        </div>
        <p className="small muted">
          {t(
            "어디가 틀렸는지는 알려 주지 않아요. 막히면 ‘검사하고 수정’ 단계에서 자동 검사를 누르고 맞춤 힌트를 열어 보세요.",
          )}
        </p>
      </section>
      <section className="panel">
        <h2>
          {t("찾아 고친 버그 {n}개 / 도전 {m}개", {
            n: solved,
            m: mine.length,
          })}
        </h2>
        {mine.length ? (
          <ul className="bug-hunt-list">
            {mine.map((w) => {
              const done = bugSolved(w);
              return (
                <li key={w.id}>
                  <span>
                    <Pill tone={done ? "green" : "orange"}>
                      {t(done ? "고쳤어요" : "버그가 숨어 있어요")}
                    </Pill>{" "}
                    {w.draft.title}
                    {debugFilled(w.draft.debugLog) ? (
                      <small> · {t("일지 다 적음")}</small>
                    ) : null}
                  </span>
                  <button onClick={() => go(`work/${w.id}/2`)}>
                    {t(done ? "다시 보기" : "이어서 찾기")}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="small muted">{t("아직 받은 도전이 없어요.")}</p>
        )}
      </section>
    </>
  );
}
