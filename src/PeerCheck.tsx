import { useRef, useState } from "react";
import { LIMITS, kindNames, now } from "./model";
import type { PeerRequest, PeerResult } from "./peer";
import { peerFileKind, validatePeerRequest } from "./peer";
import { downloadText } from "./storage";
import { Preview } from "./Preview";
import { Empty, Field, Icon, Pill } from "./ui";
import { missions } from "./data";
// 친구의 작품을 내 기기에서 직접 써 보고 검사 결과 파일을 만들어 돌려준다. 내 기기에는 저장하지 않는다.
export function PeerCheck({
  request,
  setRequest,
  message,
}: {
  request: PeerRequest | null;
  setRequest: (r: PeerRequest | null) => void;
  message: (s: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [reviewer, setReviewer] = useState("");
  const [comment, setComment] = useState("");
  const [results, setResults] = useState<PeerResult[]>([]);
  const open = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > LIMITS.bytes) throw new Error("파일이 너무 커요.");
      const data: unknown = JSON.parse(await file.text());
      if (peerFileKind(data) !== "request")
        throw new Error("친구가 보낸 ‘친구 검사 요청’ 파일을 골라 주세요.");
      const r = validatePeerRequest(data);
      setRequest(r);
      setResults(r.tests.map((t) => ({ ...t, actual: "", status: "pending" })));
      message("친구 작품을 열었어요. 먼저 예상하고 직접 눌러 보세요.");
    } catch (e) {
      message(
        `열지 못했어요. ${e instanceof Error ? e.message : "파일을 다시 골라 주세요."}`,
      );
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  const mission = missions.find((m) => m.id === request?.missionId);
  const filled = results.some((r) => r.actual.trim()) || comment.trim();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">짝 활동 · 관찰자</span>
          <h1>친구 작품 검사하기</h1>
          <p>
            친구가 보낸 요청 파일을 열어 앱을 직접 써 보고, 본 것을 적어
            돌려줘요. 이 기기에는 저장하지 않아요.
          </p>
        </div>
        <button onClick={() => input.current?.click()}>
          <Icon name="folder" />
          친구 검사 요청 파일 열기
        </button>
      </div>
      <input
        ref={input}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json,application/json"
        aria-label="친구 검사 요청 파일"
        onChange={(e) => void open(e.target.files?.[0])}
      />
      {!request ? (
        <Empty title="아직 연 요청 파일이 없어요">
          <p>
            친구가 작업실의 검사 단계에서 <b>친구 검사 요청 파일 만들기</b>로
            만든 파일을 열어 주세요.
          </p>
        </Empty>
      ) : (
        <div className="workbench peer-check">
          <section className="panel">
            <Pill tone="paper">
              {kindNames[request.config.kind]} · {mission?.title}
            </Pill>
            <h2>{request.title}</h2>
            <p className="small muted">
              비난 대신 본 것을 적어요. “~을 눌렀더니 ~이 나왔어요.”처럼요.
            </p>
            <Field
              max={LIMITS.short}
              label="검사한 친구 (이름이나 별명)"
              value={reviewer}
              onChange={setReviewer}
            />
            {results.map((r, i) => (
              <fieldset className="check-card" key={r.label}>
                <legend>{r.label}</legend>
                <p className="small">기대: {r.expected}</p>
                <Field
                  area
                  max={LIMITS.checkText}
                  label={`${r.label} · 실제로 본 결과`}
                  value={r.actual}
                  onChange={(actual) =>
                    setResults((list) =>
                      list.map((x, j) => (j === i ? { ...x, actual } : x)),
                    )
                  }
                />
                <label className="field">
                  <span>{r.label} · 판정</span>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      setResults((list) =>
                        list.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                status: e.target.value as PeerResult["status"],
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="pending">아직 확인하지 않음</option>
                    <option value="pass">기대대로 됨</option>
                    <option value="fail">고칠 점이 있음</option>
                  </select>
                </label>
              </fieldset>
            ))}
            <Field
              area
              max={LIMITS.checkText}
              label="이해된 점과 헷갈린 점"
              value={comment}
              onChange={setComment}
            />
            <div className="button-row">
              <button
                className="primary"
                disabled={!filled}
                onClick={() => {
                  downloadText(
                    `친구검사결과-${request.title}.json`,
                    JSON.stringify({
                      format: "ttukttak-vibe-peer-response",
                      version: 1,
                      workId: request.workId,
                      revision: request.revision,
                      reviewer,
                      results,
                      comment,
                      at: now(),
                    }),
                    "application/json",
                  );
                  message(
                    "검사 결과 파일을 만들었어요. 친구에게 돌려주면 친구가 ‘파일 가져오기’로 열어요.",
                  );
                }}
              >
                <Icon name="download" />
                검사 결과 파일 내려받기
              </button>
              <button onClick={() => setRequest(null)}>닫기</button>
            </div>
          </section>
          <aside className="preview-panel panel">
            <div className="preview-heading">
              <Icon name="play" size={18} />
              <h2>친구가 만든 앱</h2>
            </div>
            <Preview config={request.config} onRun={() => {}} />
          </aside>
        </div>
      )}
    </>
  );
}
