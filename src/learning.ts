import type { Config, Snapshot, Work } from "./model";
export function updatePrediction(d: Snapshot, prediction: string): Snapshot {
  return {
    ...d,
    prediction,
    runRevision: prediction === d.prediction ? d.runRevision : "",
  };
}
export function configSummary(c: Config): string[] {
  if (c.kind === "quiz")
    return [
      `문항 ${c.questions.length}개 · 문제당 ${c.points}점`,
      `채점: ${c.scoring === "once" ? "문제마다 한 번만" : "정답을 누를 때마다 (학습용 오류)"}`,
      `다시 시작: ${c.resetScore ? "점수·문제 번호·응답 상태 모두 초기화" : "점수는 유지하고 문제 번호·응답 상태 초기화"}`,
      `정답 안내: ${c.correctFeedback}`,
      `오답 안내: ${c.wrongFeedback}`,
    ];
  if (c.kind === "story")
    return [
      `장면 ${c.scenes.length}개 · 도달해야 할 결말 ${c.intendedEndings.length}개`,
      `시작: ${c.scenes.find((s) => s.id === c.start)?.title ?? c.start}`,
      ...c.scenes.flatMap((s) =>
        s.choices.map(
          (ch) =>
            `${s.title}에서 ‘${ch.label}’ → ${c.scenes.find((t) => t.id === ch.to)?.title ?? ch.to}`,
        ),
      ),
    ];
  return [
    `제한 시간: ${c.seconds}초`,
    `종료 안내: ${c.showEnd ? "표시함" : "표시하지 않음 (학습용 오류)"}`,
    `안내 문장: ${c.endMessage}`,
    "다시 열면 정지 상태로 시작",
  ];
}
export function revisionLabel(w: Work, revision: string) {
  if (revision === w.draft.revision) return "현재 편집본";
  const index = w.versions.findIndex((v) => v.data.revision === revision);
  return index >= 0
    ? `V${index + 1} · ${w.versions[index].label}`
    : "이전 설정 (버전 저장 전)";
}
// 두 버전을 비교해 바뀐 규칙 줄과 바뀐 기록 항목을 찾는다.
export function compareSnapshots(a: Snapshot, b: Snapshot) {
  const left = configSummary(a.config);
  const right = configSummary(b.config);
  const fields: [string, (d: Snapshot) => string][] = [
    ["작품 제목", (d) => d.title],
    ["실행 전 예상", (d) => d.prediction],
    ["원문 요청", (d) => d.originalPrompt],
    ["정리한 요청", (d) => d.arrangedPrompt],
    ["바꾼 동작", (d) => d.change.behavior],
    ["수정 이유", (d) => d.change.reason],
    ["작동 원리", (d) => d.reflection],
  ];
  return {
    removed: left.filter((l) => !right.includes(l)),
    added: right.filter((l) => !left.includes(l)),
    sameConfig: JSON.stringify(a.config) === JSON.stringify(b.config),
    fields: fields.filter(([, get]) => get(a) !== get(b)).map(([n]) => n),
  };
}
