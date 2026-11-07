import { AppError } from "./appError";
import { missions } from "./data";
import { LIMITS, now, uid } from "./model";
import type { Check, Config, Mission, Work } from "./model";
import { adoptMissions, isCustom } from "./customMissions";
import { validateConfig } from "./storage";
// 친구 검사: 요청 파일에는 앱 설정과 검사 항목만 담고, 학생의 다른 기록은 넣지 않는다.
export type PeerRequest = {
  format: "ttukttak-vibe-peer-request";
  version: 1;
  workId: string;
  revision: string;
  title: string;
  missionId: string;
  config: Config;
  tests: { label: string; expected: string }[];
  // 선생님 미션이면 미션도 담아, 그 미션이 없는 친구 기기에서도 연다.
  missions?: Mission[];
  // 만든 학생이 친구에게 물어볼 것("이 부분이 헷갈려요, 확인해 줘"). 없을 수 있다.
  questions?: string[];
};
export type PeerResult = {
  label: string;
  expected: string;
  actual: string;
  status: Check["status"];
};
export type PeerResponse = {
  format: "ttukttak-vibe-peer-response";
  version: 1;
  workId: string;
  revision: string;
  reviewer: string;
  results: PeerResult[];
  comment: string;
  at: string;
  // 요청한 작품을 찾지 못했을 때 비슷한 작품을 먼저 보여 주려고 담는다(이전 파일에는 없을 수 있음).
  missionId?: string;
  title?: string;
  // 만든 학생의 질문에 친구가 적은 답(질문 순서대로)
  answers?: { question: string; answer: string }[];
};
export function makePeerRequest(
  w: Work,
  questions: string[] = [],
): PeerRequest {
  const m = missions.find((x) => x.id === w.missionId);
  const asked = questions
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 5);
  return {
    ...(asked.length ? { questions: asked } : {}),
    format: "ttukttak-vibe-peer-request",
    version: 1,
    workId: w.id,
    revision: w.draft.revision,
    title: w.draft.title || "제목 없는 작품",
    missionId: w.missionId,
    config: w.draft.config,
    tests: m?.tests ?? [],
    ...(m && isCustom(m.id) ? { missions: [m] } : {}),
  };
}
type Obj = Record<string, unknown>;
const fail = (
  key: string,
  vars: Record<string, string | number> = {},
): never => {
  throw new AppError(key, vars);
};
const obj = (v: unknown, what: string) =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Obj)
    : fail("{what}: 객체 형식이 필요해요.", { what });
const str = (v: unknown, what: string, max: number) =>
  typeof v === "string" && v.length <= max
    ? v
    : fail("{what}: {max}자 이내의 글자여야 해요.", { what, max });
const list = (v: unknown, what: string, max: number) =>
  Array.isArray(v) && v.length <= max
    ? v
    : fail("{what}: 항목이 {max}개 이하여야 해요.", { what, max });
export function peerFileKind(data: unknown) {
  const f = data && typeof data === "object" ? (data as Obj).format : null;
  return f === "ttukttak-vibe-peer-request"
    ? "request"
    : f === "ttukttak-vibe-peer-response"
      ? "response"
      : null;
}
export function validatePeerRequest(data: unknown): PeerRequest {
  const r = obj(data, "친구 검사 요청");
  if (r.version !== 1) fail("지원하지 않는 친구 검사 요청 파일이에요.");
  const missionId = str(r.missionId, "미션", 80);
  // 함께 온 선생님 미션은 이번 검사 동안만 쓴다(친구 기기에 남기지 않는다).
  adoptMissions(r.missions, false);
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) fail("지원하지 않는 미션이에요.");
  return {
    format: "ttukttak-vibe-peer-request",
    version: 1,
    workId: str(r.workId, "작품 ID", 80),
    revision: str(r.revision, "설정 버전", 80),
    title: str(r.title, "작품 제목", LIMITS.short),
    missionId,
    config: validateConfig(r.config),
    tests: list(r.tests, "검사 항목", 10).map((t) => {
      const o = obj(t, "검사 항목");
      return {
        label: str(o.label, "검사 이름", LIMITS.short),
        expected: str(o.expected, "기대 결과", LIMITS.checkText),
      };
    }),
    ...(mission && isCustom(mission.id) ? { missions: [mission] } : {}),
    ...(r.questions === undefined
      ? {}
      : {
          questions: list(r.questions, "질문", 5).map((q) =>
            str(q, "질문", LIMITS.checkText),
          ),
        }),
  };
}
export function validatePeerResponse(data: unknown): PeerResponse {
  const r = obj(data, "친구 검사 결과");
  if (r.version !== 1) fail("지원하지 않는 친구 검사 결과 파일이에요.");
  const at = str(r.at, "검사 시각", 40);
  if (!Number.isFinite(Date.parse(at))) fail("검사 시각이 올바르지 않아요.");
  return {
    format: "ttukttak-vibe-peer-response",
    version: 1,
    workId: str(r.workId, "작품 ID", 80),
    revision: str(r.revision, "설정 버전", 80),
    reviewer: str(r.reviewer, "검사한 친구", LIMITS.short),
    results: list(r.results, "검사 결과", 10).map((t) => {
      const o = obj(t, "검사 결과");
      const status = o.status;
      if (status !== "pass" && status !== "fail" && status !== "pending")
        fail("검사 판정: 지원하지 않는 값이에요.");
      return {
        label: str(o.label, "검사 이름", LIMITS.short),
        expected: str(o.expected, "기대 결과", LIMITS.checkText),
        actual: str(o.actual, "실제 결과", LIMITS.checkText),
        status: status as Check["status"],
      };
    }),
    comment: str(r.comment, "친구 의견", LIMITS.checkText),
    at,
    ...(r.missionId === undefined
      ? {}
      : { missionId: str(r.missionId, "미션", 80) }),
    ...(r.title === undefined
      ? {}
      : { title: str(r.title, "작품 제목", LIMITS.short) }),
    ...(r.answers === undefined
      ? {}
      : {
          answers: list(r.answers, "질문 답", 5).map((a) => {
            const o = obj(a, "질문 답");
            return {
              question: str(o.question, "질문", LIMITS.checkText),
              answer: str(o.answer, "답", LIMITS.checkText),
            };
          }),
        }),
  };
}
// 결과를 작품의 친구 의견 검사 기록으로 더한다. 검사한 설정 버전을 그대로 남긴다.
export function applyPeerResponse(w: Work, r: PeerResponse): Work {
  const who = r.reviewer.trim() || "친구";
  const rows: Check[] = [
    ...r.results
      .filter((x) => x.actual.trim() || x.status !== "pending")
      .map((x) => ({
        id: uid(),
        label: `${x.label} · ${who}`.slice(0, LIMITS.short),
        expected: x.expected,
        actual: x.actual,
        source: "peer" as const,
        status: x.status,
        revision: r.revision,
        at: r.at,
      })),
    ...(r.answers ?? [])
      .filter((a) => a.answer.trim())
      .map((a) => ({
        id: uid(),
        label: `질문 · ${who}`.slice(0, LIMITS.short),
        expected: a.question,
        actual: a.answer,
        source: "peer" as const,
        status: "pending" as const,
        revision: r.revision,
        at: r.at,
      })),
    ...(r.comment.trim()
      ? [
          {
            id: uid(),
            label: `친구 의견 · ${who}`.slice(0, LIMITS.short),
            expected: "친구가 직접 써 보고 남긴 의견",
            actual: r.comment,
            source: "peer" as const,
            status: "pending" as const,
            revision: r.revision,
            at: r.at,
          },
        ]
      : []),
  ];
  if (!rows.length) fail("친구가 적은 검사 결과가 없어요.");
  if (w.draft.checks.length + rows.length > LIMITS.checks)
    fail(
      "검사 기록은 100개까지예요. 필요 없는 기록을 정리한 뒤 다시 가져와 주세요.",
    );
  return {
    ...w,
    updatedAt: now(),
    draft: { ...w.draft, checks: [...w.draft.checks, ...rows] },
  };
}
