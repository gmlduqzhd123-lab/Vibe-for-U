import qrcode from "qrcode-generator";
import { missions } from "./data";
import type { Config, Feedback, Mission, Work } from "./model";
import { adoptMissions, isCustom } from "./customMissions";
import { LIMITS } from "./model";
import { makePeerRequest, validatePeerRequest } from "./peer";
import type { PeerRequest } from "./peer";
import { validateConfig, validateFeedback } from "./storage";
import { AppError } from "./appError";
// QR로 주고받기: 작은 작품 설정이나 친구 검사 요청을 주소 뒤쪽(#)에 줄여 담는다.
// 받는 기기는 자기 카메라 앱으로 QR을 비춰 주소를 열면 된다. #뒤의 글은 서버로 보내지지 않는다.
export type SharePayload =
  | {
      k: "work";
      title: string;
      missionId: string;
      config: Config;
      // 선생님 미션이면 미션도 함께 담는다(받는 기기에 없을 수 있다).
      missions?: Mission[];
    }
  | { k: "peer"; request: PeerRequest }
  // 교사가 학급 모으기에서 학생 한 명에게 돌려주는 평가
  | { k: "feedback"; workId: string; title: string; feedback: Feedback };
// 휴대전화 카메라가 무리 없이 읽는 QR 크기에 맞춘 주소 길이 상한(글자 수).
export const QR_MAX = 1800;
const b64url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
async function pipe(bytes: Uint8Array, stream: GenericTransformStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}
// 압축을 지원하면 z, 아니면 j(그대로)를 앞에 붙인다.
export async function encodeShare(p: SharePayload) {
  const raw = new TextEncoder().encode(JSON.stringify(p));
  if (typeof CompressionStream === "function")
    return "z" + b64url(await pipe(raw, new CompressionStream("deflate-raw")));
  return "j" + b64url(raw);
}
export async function decodeShare(code: string): Promise<SharePayload> {
  let data: unknown;
  try {
    const bytes = fromB64url(code.slice(1));
    if (bytes.length > LIMITS.bytes) throw new Error("too large");
    const raw =
      code[0] === "z"
        ? await pipe(bytes, new DecompressionStream("deflate-raw"))
        : code[0] === "j"
          ? bytes
          : null;
    if (!raw) throw new Error("unknown");
    data = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    throw new AppError(
      "QR 주소를 읽지 못했어요. QR을 다시 비추거나 파일로 주고받아 주세요.",
    );
  }
  const o = (data ?? {}) as Record<string, unknown>;
  if (o.k === "peer")
    return { k: "peer", request: validatePeerRequest(o.request) };
  if (o.k === "feedback") {
    const f = validateFeedback(o.feedback);
    if (!f) throw new AppError("평가가 비어 있어요.");
    // 작품 ID는 작품 파일과 같은 규칙(빈칸 없이 80자 이내)으로 본다.
    if (
      typeof o.workId !== "string" ||
      !o.workId.trim() ||
      o.workId.length > 80
    )
      throw new AppError("평가를 돌려줄 작품을 알 수 없어요.");
    return {
      k: "feedback",
      workId: o.workId,
      title: typeof o.title === "string" ? o.title.slice(0, LIMITS.short) : "",
      feedback: f,
    };
  }
  if (o.k === "work") {
    const missionId = String(o.missionId);
    // 받는다를 누르기 전에는 이 기기에 남기지 않는다.
    adoptMissions(o.missions, false);
    if (!missions.some((m) => m.id === missionId))
      throw new AppError("지원하지 않는 미션이에요.");
    const title =
      typeof o.title === "string" ? o.title.slice(0, LIMITS.short) : "";
    const embedded = missions.filter(
      (m) => m.id === missionId && isCustom(m.id),
    );
    return {
      k: "work",
      title,
      missionId,
      config: validateConfig(o.config),
      ...(embedded.length ? { missions: embedded } : {}),
    };
  }
  throw new AppError(
    "QR 주소를 읽지 못했어요. QR을 다시 비추거나 파일로 주고받아 주세요.",
  );
}
export const workPayload = (w: Work): SharePayload => ({
  ...(isCustom(w.missionId)
    ? { missions: missions.filter((m) => m.id === w.missionId) }
    : {}),
  k: "work",
  title: w.draft.title,
  missionId: w.missionId,
  config: w.draft.config,
});
export const peerPayload = (
  w: Work,
  questions: string[] = [],
): SharePayload => ({
  k: "peer",
  request: makePeerRequest(w, questions),
});
export const feedbackPayload = (w: Work, sourceId?: string): SharePayload => ({
  k: "feedback",
  // 학생 기기의 원래 ID로 보낸다(교사 기기에서는 가져오며 새 ID가 붙어 있다).
  workId: sourceId ?? w.id,
  title: w.draft.title,
  feedback: w.feedback!,
});
// 앱이 열린 주소를 기준으로 받기 주소를 만든다(GitHub Pages 하위 경로 포함).
export const receiveUrl = (code: string) =>
  `${location.origin}${location.pathname}#/receive/${code}`;
// QR 그림(SVG 경로). 오류 정정은 L(가장 많이 담는 단계)을 쓴다.
export function qrPath(text: string) {
  const qr = qrcode(0, "L");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (qr.isDark(y, x)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
  return { size: n + 8, d };
}
