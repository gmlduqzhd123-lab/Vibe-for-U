import type { Config, Snapshot, Work } from "./model";
import { dirNames } from "./engines";
import { translate } from "./i18n";
export function updatePrediction(d: Snapshot, prediction: string): Snapshot {
  return {
    ...d,
    prediction,
    runRevision: prediction === d.prediction ? d.runRevision : "",
  };
}
type Tr = (text: string, vars?: Record<string, string | number>) => string;
const ko: Tr = (text, vars) => translate("ko", text, vars);
// 사람이 읽는 규칙 요약. t를 넘기면 화면 언어로 쓴다(비교할 때도 같은 t를 써야 줄이 맞는다).
export function configSummary(c: Config, t: Tr = ko): string[] {
  if (c.kind === "quiz")
    return [
      t("문항 {n}개 · 문제당 {p}점", { n: c.questions.length, p: c.points }),
      t("채점: {v}", {
        v: t(
          c.scoring === "once"
            ? "문제마다 한 번만"
            : "정답을 누를 때마다 (학습용 오류)",
        ),
      }),
      t("다시 시작: {v}", {
        v: t(
          c.resetScore
            ? "점수·문제 번호·응답 상태 모두 초기화"
            : "점수는 유지하고 문제 번호·응답 상태 초기화",
        ),
      }),
      t("정답 안내: {v}", { v: c.correctFeedback }),
      t("오답 안내: {v}", { v: c.wrongFeedback }),
    ];
  if (c.kind === "story")
    return [
      t("장면 {n}개 · 도달해야 할 결말 {e}개", {
        n: c.scenes.length,
        e: c.intendedEndings.length,
      }),
      t("시작: {v}", {
        v: c.scenes.find((s) => s.id === c.start)?.title ?? c.start,
      }),
      ...c.scenes.flatMap((s) =>
        s.choices.map((ch) =>
          t("{from}에서 ‘{choice}’ → {to}", {
            from: s.title,
            choice: ch.label,
            to: c.scenes.find((x) => x.id === ch.to)?.title ?? ch.to,
          }),
        ),
      ),
    ];
  if (c.kind === "pattern")
    return [
      t("판 {s}×{s} · 명령 묶음 {r}번 반복", { s: c.size, r: c.repeat }),
      t("명령: {v}", {
        v: c.commands
          .map((m) => t("{dir} {n}칸", { dir: t(dirNames[m.dir]), n: m.count }))
          .join(" → "),
      }),
      t("가장자리: {v}", {
        v: t(
          c.edge === "stop" ? "멈추기" : "반대편으로 넘어가기 (학습용 오류)",
        ),
      }),
      ...(c.turn === "right"
        ? [t("조건: 만약 다음 칸이 막히면 오른쪽으로 돌기")]
        : []),
      t("목표 칸 {n}개", { n: c.target.length }),
    ];
  return [
    t("제한 시간: {n}초", { n: c.seconds }),
    t("종료 안내: {v}", {
      v: t(c.showEnd ? "표시함" : "표시하지 않음 (학습용 오류)"),
    }),
    t("안내 문장: {v}", { v: c.endMessage }),
    t("다시 열면 정지 상태로 시작"),
  ];
}
export function revisionLabel(w: Work, revision: string, t: Tr = ko) {
  if (revision === w.draft.revision) return t("현재 편집본");
  const index = w.versions.findIndex((v) => v.data.revision === revision);
  return index >= 0
    ? `V${index + 1} · ${w.versions[index].label}`
    : t("이전 설정 (버전 저장 전)");
}
// 두 버전을 비교해 바뀐 규칙 줄과 바뀐 기록 항목을 찾는다.
export function compareSnapshots(a: Snapshot, b: Snapshot, t: Tr = ko) {
  const left = configSummary(a.config, t);
  const right = configSummary(b.config, t);
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
