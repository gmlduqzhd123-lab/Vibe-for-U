import { missions } from "./data";
import { kindNames, kinds, stageDone } from "./model";
import type { Kind, Mission, Work } from "./model";
import { Empty, Icon, Pill } from "./ui";
import { StoragePanel } from "./storageHealth";
import { SpeakButton } from "./Speak";
import { useLang, useT } from "./i18n";
import { localizeMission } from "./missionsEn";
export type Navigate = (path: string) => void;
export { Home } from "./Welcome";
export function Missions({
  filter,
  works,
  go,
}: {
  filter?: string;
  works: Work[];
  go: Navigate;
}) {
  const valid = (kinds as string[]).includes(filter ?? "");
  const t = useT();
  const lang = useLang();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("한 번에 하나씩, 나의 속도로")}</span>
          <h1>{t("미션 공작대")}</h1>
          <p>
            {t("처음이라면 퀴즈 1부터. 문제를 찾는 연습은 퀴즈 3을 골라요.")}
          </p>
        </div>
      </div>
      <div className="filter-row">
        {["all", ...kinds].map((k) => (
          <button
            className={(!valid && k === "all") || k === filter ? "active" : ""}
            key={k}
            onClick={() => go(k === "all" ? "missions" : `missions/${k}`)}
          >
            {k === "all"
              ? t("전체 {n}개").replace("{n}", String(missions.length))
              : t(kindNames[k as Kind])}
          </button>
        ))}
      </div>
      <div className="mission-grid">
        {missions
          .map((m) => localizeMission(m, lang))
          .filter((m) => !valid || m.kind === filter)
          .map((m) => {
            const attempts = works.filter((w) => w.missionId === m.id);
            const done = attempts.some((w) =>
              stageDone(w.draft).every(Boolean),
            );
            return (
              <button
                className={`mission-card ${m.kind}`}
                key={m.id}
                onClick={() => go(`mission/${m.id}`)}
              >
                <div className="project-card-top">
                  <Pill tone="paper">
                    {t(kindNames[m.kind])} {m.order}
                  </Pill>
                  {m.id === "quiz-1" ? <Pill>{t("첫 미션 추천")}</Pill> : null}
                  {m.learningError ? (
                    <Pill tone="orange">{t("학습용 오류 포함")}</Pill>
                  ) : null}
                </div>
                <h2>{m.title}</h2>
                <p>{m.goal}</p>
                <span className="muted small">
                  예상 → 실행 → {m.tests[0].label} → 수정
                </span>
                <div className="mission-footer">
                  <b>
                    {t(
                      done
                        ? "기록 완료"
                        : attempts.length
                          ? "진행 중"
                          : "아직 시작하지 않음",
                    )}
                  </b>
                  <Icon name="arrow" />
                </div>
              </button>
            );
          })}
      </div>
    </>
  );
}
export function MissionDetail({
  mission: m,
  create,
  share,
}: {
  mission: Mission;
  create: (m: Mission, normal?: boolean) => void;
  share: (text: string) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {kindNames[m.kind]} · 미션 {m.order}
          </span>
          <h1>{m.title}</h1>
          <p>{m.goal}</p>
        </div>
      </div>
      <div className="detail-layout">
        <div className="panel">
          <Pill tone={m.learningError ? "orange" : "green"}>
            {m.learningError
              ? "학습용 오류가 있는 시작 작품"
              : "정상 규칙으로 시작하는 작품"}
          </Pill>
          <h2>이번에는 이렇게 해 봐요</h2>
          <p>{m.guide}</p>
          <SpeakButton
            text={`${m.title}. ${m.goal} ${m.guide} 먼저 예상하기. ${m.prediction}`}
            label="미션 안내 듣기"
          />
          <h3>먼저 예상하기</h3>
          <p>{m.prediction}</p>
          <h3>검사할 것</h3>
          {m.tests.map((t) => (
            <div className="check-summary" key={t.label}>
              <Icon name="check" />
              <div>
                <b>{t.label}</b>
                <p>{t.expected}</p>
              </div>
            </div>
          ))}
          <h3>완료 기준</h3>
          <p>{m.completion}</p>
          <h3>마무리 질문</h3>
          <p>{m.closing}</p>
        </div>
        <aside className="panel mission-start">
          <span className={`project-icon ${m.kind}`}>
            <Icon name={m.kind} size={40} />
          </span>
          <h2>생각할 준비 됐나요?</h2>
          <p>
            여기서는 준비된 코드와 규칙을 바꿔요. 자유로운 요청문 자체를 코드로
            실행하지 않아요.
          </p>
          <button className="primary full" onClick={() => create(m)}>
            이 미션 시작하기 <Icon name="arrow" />
          </button>
          <button className="full" onClick={() => create(m, true)}>
            정상 규칙의 새 작품 만들기
          </button>
          <button
            className="text-button"
            onClick={() =>
              share(`${location.href.split("#")[0]}#/mission/${m.id}`)
            }
          >
            <Icon name="copy" />
            같은 미션 링크 복사
          </button>
          <p className="small muted">
            링크에는 미션 번호만 들어가요. 내 학습 기록은 공유되지 않아요.
          </p>
        </aside>
      </div>
    </>
  );
}
export function Library({
  works,
  go,
  exportAll,
  importFile,
  remove,
  nextUser,
  clearAll,
  hiddenCount,
  reveal,
  message,
}: {
  works: Work[];
  go: Navigate;
  exportAll: () => void;
  importFile: () => void;
  remove: (w: Work) => void;
  nextUser: () => void;
  clearAll: () => void;
  hiddenCount: number;
  reveal: () => void;
  message: (s: string) => void;
}) {
  const t = useT();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("한 번의 완성보다, 쌓이는 변화")}</span>
          <h1>{t("내 작품 선반")}</h1>
          <p>{t("자동 저장된 편집본과 직접 남긴 수정 버전을 다시 만나요.")}</p>
        </div>
        <div className="button-row">
          <button onClick={() => go("peer")}>{t("친구 작품 검사하기")}</button>
          <button onClick={importFile}>
            <Icon name="folder" />
            {t("파일 가져오기")}
          </button>
          <button disabled={!works.length} onClick={exportAll}>
            <Icon name="download" />
            {t("목록 백업")}
          </button>
        </div>
      </div>
      <div className="note">
        <Icon name="shield" />
        현재 기기와 브라우저에 저장돼요. 다른 기기에서 이어 하려면 파일로
        내보내세요. 공용 기기의 기록은 개인별로 비밀 보호되지 않아요.
      </div>
      {hiddenCount ? (
        <div className="warning">
          이전 사용자의 작품 {hiddenCount}개는 이어서 학습에 연결하지 않았어요.{" "}
          <button onClick={reveal}>공용 기기 기록을 명시적으로 열기</button>
        </div>
      ) : null}
      {works.length ? (
        <div className="work-grid">
          {[...works]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((w) => (
              <article className="panel work-card" key={w.id}>
                <div className="project-card-top">
                  <span className={`project-icon ${w.kind}`}>
                    <Icon name={w.kind} />
                  </span>
                  <Pill tone="paper">
                    {stageDone(w.draft).filter(Boolean).length} / 5단계 기록
                  </Pill>
                </div>
                <h2>{w.draft.title || "제목 없는 작품"}</h2>
                <p>
                  {kindNames[w.kind]} · 버전 {w.versions.length}개
                </p>
                <small>
                  최근 수정 {new Date(w.updatedAt).toLocaleString("ko-KR")}
                </small>
                <div className="button-row">
                  <button
                    className="primary"
                    onClick={() => go(`work/${w.id}/0`)}
                  >
                    {t("작품 열기")}
                  </button>
                  <button onClick={() => go(`portfolio/${w.id}`)}>
                    {t("포트폴리오")}
                  </button>
                  <button
                    className="danger-text"
                    aria-label={`${w.draft.title} 삭제`}
                    onClick={() => remove(w)}
                  >
                    <Icon name="trash" />
                    {t("삭제")}
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <Empty title="첫 생각을 담을 빈 선반이에요">
          <p>
            미션 하나를 골라 작품을 만들어 보세요. 백업 파일이 있다면 가져올
            수도 있어요.
          </p>
          <button className="primary" onClick={() => go("missions")}>
            미션 고르기 <Icon name="arrow" />
          </button>
        </Empty>
      )}
      <StoragePanel message={message} />
      <div className="shared-device panel">
        <div>
          <h2>{t("공용 기기 정리")}</h2>
          <p>
            다음 사용자는 이전 기록을 자동으로 이어받지 않아요. 삭제 전에는 파일
            백업을 선택할 수 있어요.
          </p>
          <small>
            가져오기: JSON 2MB 이하 · 한 파일 최대 50작품 · 작품당 버전 30개 ·
            문항 20개 · 장면 24개 · 글 4,000자
          </small>
        </div>
        <div className="button-row">
          <button onClick={nextUser}>{t("다음 사용자 시작")}</button>
          <button className="danger-text" onClick={clearAll}>
            {t("이 앱의 데이터 전체 삭제")}
          </button>
        </div>
      </div>
    </>
  );
}
