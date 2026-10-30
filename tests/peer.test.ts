import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import {
  applyPeerResponse,
  makePeerRequest,
  peerFileKind,
  validatePeerRequest,
  validatePeerResponse,
} from "../src/peer";
import type { PeerResponse } from "../src/peer";
const work = () => {
  const w = makeWork(missions[2]);
  w.draft.reflection = "개인 성찰";
  w.draft.originalPrompt = "개인 원문";
  return w;
};
const response = (w: ReturnType<typeof work>): PeerResponse => ({
  format: "ttukttak-vibe-peer-response",
  version: 1,
  workId: w.id,
  revision: w.draft.revision,
  reviewer: "민준",
  results: [
    {
      label: "같은 정답 세 번 누르기",
      expected: "한 번만",
      actual: "3점이 됐어요",
      status: "fail",
    },
    { label: "빈 결과", expected: "-", actual: "", status: "pending" },
  ],
  comment: "점수가 너무 빨리 올라가요.",
  at: new Date().toISOString(),
});
describe("친구 검사 파일", () => {
  it("요청 파일에는 앱 설정과 검사 항목만 담는다", () => {
    const w = work();
    const r = makePeerRequest(w);
    const text = JSON.stringify(r);
    expect(text).not.toContain("개인 성찰");
    expect(text).not.toContain("개인 원문");
    expect(peerFileKind(r)).toBe("request");
    expect(validatePeerRequest(JSON.parse(text))).toEqual(r);
    expect(r.tests).toEqual(missions[2].tests);
  });
  it("결과를 친구 의견 검사 기록으로 더하고 빈 결과는 건너뛴다", () => {
    const w = work();
    const r = validatePeerResponse(JSON.parse(JSON.stringify(response(w))));
    const next = applyPeerResponse(w, r);
    const peer = next.draft.checks.filter((c) => c.source === "peer");
    expect(peer.map((c) => [c.label, c.status, c.actual])).toEqual([
      ["같은 정답 세 번 누르기 · 민준", "fail", "3점이 됐어요"],
      ["친구 의견 · 민준", "pending", "점수가 너무 빨리 올라가요."],
    ]);
    expect(peer.every((c) => c.revision === w.draft.revision)).toBe(true);
  });
  it("결과 파일의 미션·제목은 있으면 지키고 없어도 읽는다", () => {
    const w = work();
    const base = response(w);
    expect(validatePeerResponse(base).missionId).toBeUndefined();
    const withMission = validatePeerResponse({
      ...base,
      missionId: "quiz-3",
      title: "제목",
    });
    expect([withMission.missionId, withMission.title]).toEqual([
      "quiz-3",
      "제목",
    ]);
  });
  it("잘못된 파일과 빈 결과는 거절한다", () => {
    const w = work();
    expect(peerFileKind({ format: "ttukttak-vibe-backup" })).toBeNull();
    expect(() =>
      validatePeerRequest({ ...makePeerRequest(w), missionId: "quiz-9" }),
    ).toThrow("미션");
    expect(() =>
      validatePeerResponse({
        ...response(w),
        results: [{ label: "a", expected: "", actual: "", status: "maybe" }],
      }),
    ).toThrow("판정");
    expect(() =>
      applyPeerResponse(w, {
        ...response(w),
        results: [],
        comment: " ",
      }),
    ).toThrow("검사 결과가 없어요");
  });
});
