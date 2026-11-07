import { useEffect, useState } from "react";
import type { Work } from "./model";
import { kindNames } from "./model";
import { missions } from "./data";
import { localizeMission } from "./missionText";
import { useLang, useT } from "./i18n";
import {
  QR_MAX,
  encodeShare,
  qrPath,
  receiveUrl,
  workPayload,
} from "./qrTransfer";
// 보호자용 작품 소개 한 장: 무엇을 만들고 왜 고쳤고 무엇을 배웠는지, 직접 눌러 볼 QR을 A4 반 장에 담는다.
// 인쇄 전에 개인정보 확인을 거친다(포트폴리오의 버튼). QR에는 작품 설정만 들어간다.
export function FamilyCard({ w }: { w: Work }) {
  const t = useT();
  const lang = useLang();
  const d = w.draft;
  const found = missions.find((m) => m.id === w.missionId);
  const mission = found && localizeMission(found, lang);
  const [qr, setQr] = useState<{ size: number; d: string } | null>(null);
  useEffect(() => {
    let alive = true;
    encodeShare(workPayload(w))
      .then((code) => {
        const url = receiveUrl(code);
        if (alive) setQr(url.length <= QR_MAX ? qrPath(url) : null);
      })
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [w]);
  const text = (v: string) => v.trim() || t("아직 기록하지 않았어요.");
  return (
    <section className="family-card">
      <header>
        <span className="eyebrow">{t("제가 만든 작은 앱을 소개해요")}</span>
        <h2>{d.title || t("제목 없는 작품")}</h2>
        <p className="small">
          {t(kindNames[w.kind])}
          {mission ? ` · ${mission.title}` : ""}
        </p>
      </header>
      <div className="family-body">
        <dl>
          <div>
            <dt>{t("무엇을 만들었나요")}</dt>
            <dd>
              {text(
                [d.promise.problem, d.promise.features]
                  .filter((x) => x.trim())
                  .join(" · "),
              )}
            </dd>
          </div>
          <div>
            <dt>{t("고친 점과 이유")}</dt>
            <dd>{text(d.change.reason)}</dd>
          </div>
          <div>
            <dt>{t("배운 점")}</dt>
            <dd>{text(d.reflection)}</dd>
          </div>
        </dl>
        {qr ? (
          <figure>
            <svg
              role="img"
              aria-label={t("작품을 열어 보는 QR 코드")}
              viewBox={`0 0 ${qr.size} ${qr.size}`}
              shapeRendering="crispEdges"
            >
              <rect width={qr.size} height={qr.size} fill="#fff" />
              <path d={qr.d} fill="#000" />
            </svg>
            <figcaption>
              {t(
                "휴대전화 카메라로 비추고 ‘새 작품으로 받기’를 누르면 직접 눌러 볼 수 있어요.",
              )}
            </figcaption>
          </figure>
        ) : null}
      </div>
      <footer className="small">
        {t(
          "뚝딱 바이브 공작소 · 가입과 서버 없이 학교에서 쓰는 코딩 학습 앱이에요. 점수가 아니라 예상하고 검사하고 고친 과정을 기록해요.",
        )}
      </footer>
    </section>
  );
}
