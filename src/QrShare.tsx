import { useEffect, useId, useRef, useState } from "react";
import { Icon, Pill } from "./ui";
import { useLang, useT } from "./i18n";
import { localizeMission } from "./missionText";
import { missions } from "./data";
import { kindNames } from "./model";
import { errorText } from "./appError";
import {
  QR_MAX,
  decodeShare,
  encodeShare,
  qrPath,
  receiveUrl,
} from "./qrTransfer";
import type { SharePayload } from "./qrTransfer";
// QR로 보내기 버튼: 누르면 큰 QR 창을 열고, 너무 크면 파일로 보내라고 안내한다.
export function QrSendButton({
  payload,
  label,
  message,
}: {
  payload: () => SharePayload;
  label: string;
  message: (s: string) => void;
}) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [url, setUrl] = useState("");
  const open = async () => {
    const link = receiveUrl(await encodeShare(payload()));
    if (link.length > QR_MAX) {
      message(
        t("QR에 담기에는 작품이 커요. 파일 내려받기나 공유로 보내 주세요."),
      );
      return;
    }
    setUrl(link);
    dialog.current?.showModal();
  };
  const qr = url ? qrPath(url) : null;
  return (
    <>
      <button type="button" onClick={open}>
        <Icon name="send" />
        {label}
      </button>
      <dialog
        ref={dialog}
        className="qr-dialog"
        aria-labelledby={titleId}
        onClose={() => setUrl("")}
      >
        <h2 id={titleId}>{label}</h2>
        {qr ? (
          <svg
            role="img"
            aria-label={t("받기 주소가 담긴 QR 코드")}
            viewBox={`0 0 ${qr.size} ${qr.size}`}
            shapeRendering="crispEdges"
          >
            <rect width={qr.size} height={qr.size} fill="#fff" />
            <path d={qr.d} fill="#000" />
          </svg>
        ) : null}
        <ol className="small">
          <li>{t("받을 기기의 카메라 앱으로 QR을 비춰요.")}</li>
          <li>{t("열린 주소에서 ‘받기’를 눌러요.")}</li>
        </ol>
        <p className="small muted">
          {t(
            "QR에는 작품 설정만 들어가고 다른 학습 기록은 들어가지 않아요. 주소의 # 뒤쪽은 서버로 보내지지 않아요.",
          )}
        </p>
        <div className="button-row">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                message(t("받기 주소를 복사했어요."));
              } catch {
                message(t("주소를 복사하지 못했어요. QR을 비춰 주세요."));
              }
            }}
          >
            <Icon name="copy" />
            {t("주소 복사")}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => dialog.current?.close()}
          >
            {t("닫기")}
          </button>
        </div>
      </dialog>
    </>
  );
}
// QR로 연 받기 화면: 무엇이 왔는지 보여 주고, 학생이 누를 때만 이 기기에 더한다.
export function Receive({
  code,
  receiveWork,
  receivePeer,
  go,
}: {
  code: string;
  receiveWork: (p: Extract<SharePayload, { k: "work" }>) => void;
  receivePeer: (p: Extract<SharePayload, { k: "peer" }>) => void;
  go: (path: string) => void;
}) {
  const t = useT();
  const lang = useLang();
  const [state, setState] = useState<
    { payload: SharePayload } | { error: string } | null
  >(null);
  useEffect(() => {
    let alive = true;
    decodeShare(code)
      .then((payload) => alive && setState({ payload }))
      .catch((e) => alive && setState({ error: errorText(e, t) }));
    return () => {
      alive = false;
    };
    // 화면 언어가 바뀌어도 다시 읽을 필요는 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);
  if (!state) return <p role="status">{t("QR로 받은 내용을 읽고 있어요…")}</p>;
  if ("error" in state)
    return (
      <div className="panel">
        <h1>{t("QR로 받기")}</h1>
        <p role="alert" className="warning">
          {state.error}
        </p>
        <button onClick={() => go("library")}>{t("작품 선반으로")}</button>
      </div>
    );
  const p = state.payload;
  const missionId = p.k === "work" ? p.missionId : p.request.missionId;
  const found = missions.find((m) => m.id === missionId);
  const mission = found && localizeMission(found, lang);
  const title =
    (p.k === "work" ? p.title : p.request.title) || t("제목 없는 작품");
  return (
    <div className="panel receive">
      <span className="eyebrow">{t("QR로 받기")}</span>
      <h1>
        {t(
          p.k === "work"
            ? "작품 「{title}」이 왔어요"
            : "친구가 「{title}」 검사를 부탁했어요",
          {
            title,
          },
        )}
      </h1>
      {mission ? (
        <p>
          <Pill tone="paper">{t(kindNames[mission.kind])}</Pill> {mission.title}
        </p>
      ) : null}
      <p>
        {t(
          p.k === "work"
            ? "받으면 이 기기에 새 작품으로 더해요. 보낸 사람의 작품은 바뀌지 않아요."
            : "친구 작품 검사하기 화면에서 열어요. 이 기기에는 저장하지 않아요.",
        )}
      </p>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => (p.k === "work" ? receiveWork(p) : receivePeer(p))}
        >
          {t(p.k === "work" ? "새 작품으로 받기" : "친구 작품 검사하기로 열기")}
        </button>
        <button onClick={() => go("home")}>{t("받지 않기")}</button>
      </div>
    </div>
  );
}
