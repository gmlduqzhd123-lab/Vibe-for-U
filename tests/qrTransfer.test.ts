import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import {
  QR_MAX,
  decodeShare,
  encodeShare,
  feedbackPayload,
  peerPayload,
  qrPath,
  workPayload,
} from "../src/qrTransfer";
describe("QR로 주고받기", () => {
  it("작품 설정을 줄여 담았다가 그대로 되살린다", async () => {
    const w = makeWork(missions.find((m) => m.id === "story-1")!);
    const code = await encodeShare(workPayload(w));
    expect(code[0]).toBe("z");
    expect(code).toMatch(/^[\w-]+$/);
    const back = await decodeShare(code);
    expect(back).toEqual(workPayload(w));
  });
  it("미션 대부분은 QR 한 장에 담긴다", async () => {
    const origin = "https://gmlduqzhd123-lab.github.io/Vibe-for-U/#/receive/";
    const sizes = await Promise.all(
      missions.map(async (m) => {
        const w = makeWork(m);
        return [
          (await encodeShare(workPayload(w))).length,
          (await encodeShare(peerPayload(w))).length,
        ];
      }),
    );
    for (const [work, peer] of sizes) {
      expect(origin.length + work).toBeLessThan(QR_MAX);
      expect(origin.length + peer).toBeLessThan(QR_MAX);
    }
    expect(qrPath(origin + "z" + "a".repeat(1000)).size).toBeGreaterThan(40);
  });
  it("망가지거나 지원하지 않는 내용은 받지 않는다", async () => {
    await expect(decodeShare("zzzz")).rejects.toThrow(
      "QR 주소를 읽지 못했어요",
    );
    const fake = await encodeShare({
      k: "work",
      title: "x",
      missionId: "없는-미션",
      config: missions[0].starter,
    });
    await expect(decodeShare(fake)).rejects.toThrow("지원하지 않는 미션");
    const bad = await encodeShare({
      k: "work",
      title: "x",
      missionId: "quiz-1",
      config: { kind: "quiz" } as never,
    });
    await expect(decodeShare(bad)).rejects.toThrow();
  });
  it("평가 QR은 원래 작품 ID로 되살리고, ID가 없거나 이상하면 받지 않는다", async () => {
    const w = makeWork(missions[0]);
    w.feedback = { levels: [2, 2, 3, 1], note: "잘했어요", at: w.createdAt };
    const ok = await decodeShare(
      await encodeShare(feedbackPayload(w, "원래-id")),
    );
    expect(ok).toMatchObject({ k: "feedback", workId: "원래-id" });
    for (const workId of [undefined, "", "   ", "x".repeat(81), 12]) {
      const code = await encodeShare({
        ...feedbackPayload(w),
        workId,
      } as never);
      await expect(decodeShare(code)).rejects.toThrow(
        "평가를 돌려줄 작품을 알 수 없어요",
      );
    }
  });
});
