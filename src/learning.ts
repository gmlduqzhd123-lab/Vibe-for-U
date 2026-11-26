import type { Config, Snapshot, Work } from "./model";
import { stageDone, stageNames } from "./model";
import { uid } from "./model";
import { binCondition, cardValues, dirNames } from "./engines";
import { translate } from "./i18n";
export function updatePrediction(d: Snapshot, prediction: string): Snapshot {
  // 예상을 바꾸면 "눌러 봤다" 기록과 맞았는지 표시도 처음으로 돌아간다.
  const changed = prediction !== d.prediction;
  return {
    ...d,
    prediction,
    runRevision: changed ? "" : d.runRevision,
    ...(changed ? { predictionCheck: "", predictionNote: "" } : {}),
  };
}
// 앱 설정을 바꾸면 새 판이 된다. 지난 판에서 남긴 "예상대로였어요" 표시와 메모는
// 새 설정으로 다시 눌러 본 뒤에 다시 고르도록 비운다(예상 글은 그대로 둔다).
export function updateConfig(d: Snapshot, config: Config): Snapshot {
  return {
    ...d,
    config,
    revision: uid(),
    predictionCheck: "",
    predictionNote: "",
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
  if (c.kind === "loop")
    return [
      t("기억하는 값: {name} · 처음 {v}", { name: c.variable, v: c.start }),
      t("한 번({round})에 {change}씩 · {n}번 반복", {
        round: c.round,
        change: c.change > 0 ? `+${c.change}` : c.change,
        n: c.times,
      }),
      t("반복 세는 방법: {v}", {
        v: t(
          c.count === "exact" ? "정한 횟수만큼" : "한 번 더 반복 (학습용 오류)",
        ),
      }),
      t("목표 값: {v} · 끝났을 때 「{msg}」", {
        v: c.goal,
        msg: c.doneMessage,
      }),
    ];
  if (c.kind === "sort")
    return [
      t("비교하는 특징: {name} · 카드 {n}장", {
        name: c.property2 ? `${c.property}, ${c.property2}` : c.property,
        n: c.cards.length,
      }),
      ...c.bins.map((b, i) =>
        t("바구니 {n}: 만약 {cond} 「{bin}」", {
          n: i + 1,
          cond: binCondition(c, b, t),
          bin: b.name,
        }),
      ),
      t("나머지 바구니: 「{bin}」", { bin: c.otherwise }),
      ...c.cards.map((k) =>
        t("카드 「{card}」 {what} → 기대 「{bin}」", {
          card: k.label,
          what: cardValues(c, k),
          bin: k.expect,
        }),
      ),
    ];
  if (c.kind === "rule") {
    const when = {
      gte: "{v} 이상이면",
      lte: "{v} 이하이면",
      eq: "{v}과 같으면",
    };
    return [
      t("기억하는 값: {name} · 처음 {v}", { name: c.variable, v: c.start }),
      t("가장 작은 값: {v}", {
        v: c.floor === null ? t("제한 없음") : c.floor,
      }),
      ...c.buttons.map((b) =>
        t("버튼 「{label}」: {name} {change}", {
          label: b.label,
          name: c.variable,
          change: b.change > 0 ? `+${b.change}` : b.change,
        }),
      ),
      ...c.rules.map((r, i) =>
        t("조건 {n}: 만약 {cond} 「{msg}」", {
          n: i + 1,
          cond: t(when[r.when], { v: r.value }),
          msg: r.message,
        }),
      ),
      t("그 밖에: 「{msg}」", { msg: c.otherwise }),
    ];
  }
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

// 포트폴리오의 빠진 기록 안내: 아직 비어 있는 기록과, 그 기록을 채우는 작업실 단계(0~4)를 돌려준다.
// text는 번역 열쇠이고 vars의 stage도 번역 열쇠다(화면에서 t()로 바꾼다).
export type Gap = { text: string; stage?: string; step: number };
export function portfolioGaps(w: Work): Gap[] {
  const d = w.draft;
  const out: Gap[] = stageDone(d).flatMap((done, i) =>
    done
      ? []
      : [
          {
            text: "「{stage}」 단계에 기록할 내용이 남았어요.",
            stage: stageNames[i],
            step: i,
          },
        ],
  );
  const ran = Boolean(d.prediction.trim()) && d.runRevision === d.revision;
  if (ran && !d.predictionCheck)
    out.push({ text: "예상이 맞았는지 아직 표시하지 않았어요.", step: 2 });
  if (ran && d.runLog?.revision !== d.revision)
    out.push({ text: "어떻게 눌러 봤는지 실행 기록 증거가 없어요.", step: 2 });
  if (!w.selfAssessment || w.selfAssessment.levels.some((l) => l === 0))
    out.push({ text: "스스로 평가를 아직 다 고르지 않았어요.", step: 4 });
  return out;
}

// 설명 문장 도우미: 증거로 남긴 실행 기록과 지금 규칙으로 "누른 것 → 규칙 → 기억한 값 → 결과" 틀을 채운다.
// 규칙으로만 만들며(AI 없음) 학생이 자기 말로 고쳐 쓰는 출발점이다. 실행 기록이 없으면 null.
export function explainDraft(d: Snapshot, t: Tr = ko): string | null {
  const log = d.runLog;
  if (!log?.steps.length) return null;
  const pressed = [...new Set(log.steps.map((s) => s.label))]
    .slice(0, 4)
    .join(", ");
  const last = log.steps[log.steps.length - 1];
  return [
    t("내가 누른 것: {v}", { v: pressed }),
    t("앱이 따른 규칙: {v}", {
      v: configSummary(d.config, t).slice(0, 2).join(" / "),
    }),
    t("앱이 기억한 값: {v}", { v: last.state }),
    t("그래서 화면에 나온 결과: "),
    t("내가 알게 된 것: "),
  ].join("\n");
}
