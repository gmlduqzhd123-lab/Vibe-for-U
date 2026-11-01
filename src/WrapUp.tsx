import { useState } from "react";
import type { Work } from "./model";
import { Icon, Pill } from "./ui";
import { useT } from "./i18n";
import type { Navigate } from "./Pages";
// 수업 끝 정리 도우미: 저장 확인 → 모든 작품 백업 → 다음 사용자 시작 또는 전체 삭제를 한 흐름으로 안내한다.
// 마지막 단계는 기존 확인 창을 그대로 열어 한 번 더 확인받는다.
export function WrapUp({
  works,
  saved,
  backup,
  nextUser,
  clearAll,
  go,
}: {
  works: Work[];
  saved: boolean;
  backup: () => boolean;
  nextUser: () => void;
  clearAll: () => void;
  go: Navigate;
}) {
  const t = useT();
  const [backedUp, setBackedUp] = useState(false);
  const [skip, setSkip] = useState(false);
  const ready = backedUp || skip || !works.length;
  const step = (n: number, done: boolean) => (
    <Pill tone={done ? "green" : "paper"}>
      {t(done ? "{n}단계 완료" : "{n}단계", { n })}
    </Pill>
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("공용 기기 정리")}</span>
          <h1>{t("수업 끝 정리 도우미")}</h1>
          <p>
            {t(
              "세 단계를 차례로 하면 다음 사람이 이 기기의 기록을 이어 쓰지 않아요.",
            )}
          </p>
        </div>
      </div>
      <ol className="wrapup">
        <li className="panel">
          {step(1, saved)}
          <h2>{t("저장이 끝났는지 확인해요")}</h2>
          <p role="status">
            {saved
              ? t("모든 편집이 이 기기에 저장됐어요.")
              : t(
                  "아직 저장 중이거나 저장에 실패한 작품이 있어요. 잠시 뒤 다시 확인해 주세요.",
                )}
          </p>
        </li>
        <li className="panel">
          {step(2, backedUp || !works.length)}
          <h2>{t("모든 작품을 파일로 받아요")}</h2>
          {works.length ? (
            <>
              <p>
                {t(
                  "작품 {n}개를 파일로 받아 학교가 정한 곳(학급 드라이브 등)에 보관해요.",
                  { n: works.length },
                )}
              </p>
              <div className="button-row">
                <button
                  className="primary"
                  onClick={() => setBackedUp(backup() || backedUp)}
                >
                  <Icon name="download" />
                  {t("모든 작품 파일로 받기")}
                </button>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={skip}
                  onChange={(e) => setSkip(e.target.checked)}
                />
                {t("이미 백업했거나 보관하지 않아도 돼요")}
              </label>
            </>
          ) : (
            <p>{t("이 기기에 보관할 작품이 없어요.")}</p>
          )}
        </li>
        <li className="panel">
          {step(3, false)}
          <h2>{t("다음에 이 기기를 쓸 상황을 골라요")}</h2>
          {!ready ? (
            <p className="small muted">
              {t("2단계에서 파일을 받거나 건너뛰기를 고르면 버튼이 켜져요.")}
            </p>
          ) : null}
          <div className="wrapup-choices">
            <div>
              <h3>{t("다음 반·다음 학생이 바로 써요")}</h3>
              <p>
                {t(
                  "작품을 지우지 않고 목록에서 접어요. 되돌리기 기록과 최근 작품 연결은 비워요.",
                )}
              </p>
              <button disabled={!ready || !saved} onClick={nextUser}>
                {t("다음 사용자 시작")}
              </button>
            </div>
            <div>
              <h3>{t("기기를 반납하거나 학기가 끝났어요")}</h3>
              <p>
                {t(
                  "이 앱의 작품·설정·학급 평가 목록·되돌리기 기록을 모두 지워요. 다른 앱 데이터는 지우지 않아요.",
                )}
              </p>
              <button
                className="danger-text"
                disabled={!ready || !saved}
                onClick={clearAll}
              >
                {t("이 앱의 데이터 전체 삭제")}
              </button>
            </div>
          </div>
        </li>
      </ol>
      <p>
        <button onClick={() => go("library")}>{t("작품 선반으로")}</button>
      </p>
    </>
  );
}
