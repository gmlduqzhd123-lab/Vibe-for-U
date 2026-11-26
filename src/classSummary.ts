import { missions } from "./data";
import { rubric, lessonMissionIds, lessons } from "./lessonData";
import { debugFilled, kindNames, stageDone, stageNames } from "./model";
import { diagnose } from "./diagnose";
import { AppError } from "./appError";
import { jsonBytes, validateWork } from "./storage";
import { LIMITS } from "./model";
import type { Feedback, Work } from "./model";
// 학급 작품 모으기: 학생이 낸 작품 파일을 교사 기기에서 읽어 요약·평가한다. 서버나 기기 저장소에 넣지 않는다.
export const levelNames = ["미평가", "시작", "수행", "설명·적용"];
export const emptyFeedback = (at: string): Feedback => ({
  levels: rubric.map(() => 0),
  note: "",
  at,
});
// sourceId: 학생 기기에 있는 원래 작품 ID(가져올 때 새 ID를 붙이므로 따로 기억한다). QR로 평가를 돌려줄 때 쓴다.
export type Entry = {
  key: string;
  file: string;
  work: Work;
  sourceId?: string;
};
export function summarize(w: Work) {
  const d = w.draft;
  const current = d.checks.filter((c) => c.revision === d.revision);
  return {
    title: d.title || "제목 없는 작품",
    mission: missions.find((m) => m.id === w.missionId)?.title ?? w.missionId,
    kind: kindNames[w.kind],
    stages: stageDone(d),
    manualPass: current.filter(
      (c) => c.source !== "auto" && c.status === "pass",
    ).length,
    pending: current.filter((c) => c.status !== "pass").length,
    retested:
      d.checks.some((c) => c.revision !== d.revision) &&
      current.some((c) => c.status === "pass"),
    versions: w.versions.length,
    hintsUsed: w.hintsUsed,
    updatedAt: w.updatedAt,
    // 짝 활동에서 역할을 바꾼 횟수(짝 활동을 하지 않았으면 null)와 버그 탐정 일지를 다 적었는지
    swaps: d.pair ? Math.max(0, d.pair.swaps.length - 1) : null,
    journal: debugFilled(d.debugLog),
  };
}
export const graded = (f: Feedback | null) =>
  Boolean(f && f.levels.every((l) => l > 0));
// 차시 진행: 8차시 계획의 미션별로 읽은 작품이 어디까지 왔는지 센다.
// 같은 미션을 쓰는 차시(1·2·6차시 퀴즈 1)는 같은 작품을 보여 준다.
export function lessonProgress(works: Work[]) {
  return lessons.map((lesson, i) => {
    const missionId = lessonMissionIds[i];
    const mine = works.filter((w) => w.missionId === missionId);
    const stages = mine.map((w) => stageDone(w.draft));
    // 아직 기록하지 않은 첫 단계에 멈춘 학생 수
    const waiting = stageNames.map(
      (_, s) => stages.filter((st) => st.findIndex((x) => !x) === s).length,
    );
    const most = Math.max(0, ...waiting);
    return {
      number: i + 1,
      title: lesson.title,
      missionId,
      mission: missions.find((m) => m.id === missionId)?.title ?? missionId,
      works: mine.length,
      done: stages.filter((st) => st.every(Boolean)).length,
      graded: mine.filter((w) => graded(w.feedback)).length,
      stuckAt: most > 0 ? waiting.indexOf(most) : -1,
      stuckN: most,
    };
  });
}
// 엑셀이 '=' 등으로 시작하는 칸을 수식으로 실행하지 않도록 앞에 '를 붙인다.
function cell(v: string | number) {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function toCSV(entries: Entry[]) {
  const head = [
    "파일",
    "작품 제목",
    "프로젝트",
    "미션",
    ...["목표", "요청", "예상·실행", "검사·수정", "설명·저장"].map(
      (s) => `${s} 기록`,
    ),
    "직접 확인 통과",
    "미확인·수정 필요",
    "재검사",
    "버전 수",
    "힌트 사용",
    "역할 교대",
    "버그 탐정 일지",
    "최근 수정",
    ...rubric.map((r) => `스스로: ${r[0]}`),
    ...rubric.map((r) => r[0]),
    "평가 의견",
  ];
  const rows = entries.map(({ file, work }) => {
    const s = summarize(work);
    const f = work.feedback;
    return [
      file,
      s.title,
      s.kind,
      s.mission,
      ...s.stages.map((done) => (done ? "완료" : "남음")),
      s.manualPass,
      s.pending,
      s.retested ? "예" : "아니요",
      s.versions,
      s.hintsUsed,
      s.swaps === null ? "짝 활동 안 함" : s.swaps,
      s.journal ? "적음" : "없음",
      new Date(s.updatedAt).toLocaleString("ko-KR"),
      ...rubric.map((_, i) => levelNames[work.selfAssessment?.levels[i] ?? 0]),
      ...rubric.map((_, i) => levelNames[f?.levels[i] ?? 0]),
      f?.note ?? "",
    ];
  });
  // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
  return (
    String.fromCharCode(0xfeff) +
    [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n")
  );
}

// 우리 반이 많이 만난 버그: 작품의 저장한 버전과 지금 편집본을 맞춤 힌트 규칙으로 살펴,
// 어떤 종류의 버그를 만난 학생이 몇 명이고 그 가운데 지금은 고친 학생이 몇 명인지 센다.
export const bugNames: Record<string, string> = {
  "quiz-score-once": "같은 정답에 점수가 또 올라요",
  "quiz-reset": "다시 시작해도 점수가 남아요",
  "story-broken": "없는 장면으로 가는 선택지",
  "story-unreachable": "갈 수 없는 결말",
  "timer-end": "0초가 돼도 안내가 없어요",
  "rule-shadowed": "앞 조건에 가린 조건",
  "loop-extra": "한 번 더 도는 반복",
  "loop-goal": "반복이 끝난 값이 목표와 달라요",
  "loop-never": "멈춤 조건에 닿지 못하는 반복",
  "list-duplicate": "목록에 같은 낱말이 두 번",
  "sort-shadowed": "앞 조건에 가린 바구니",
  "sort-unknown": "없는 바구니 이름",
  "sort-order": "바구니 순서 때문에 다른 곳으로",
  "sort-boundary": "기준 값에서 다른 곳으로",
  "pattern-wrap": "판 밖으로 넘어가요",
  "pattern-missing": "목표에서 빠진 칸",
  "pattern-extra": "목표 밖 칸을 칠해요",
};
export function classBugs(works: Work[]) {
  const rows = new Map<string, { met: number; fixed: number }>();
  for (const w of works) {
    const now = new Set(diagnose(w.draft.config).map((f) => f.id));
    const seen = new Set(now);
    for (const v of w.versions)
      for (const f of diagnose(v.data.config)) seen.add(f.id);
    for (const id of seen) {
      const r = rows.get(id) ?? { met: 0, fixed: 0 };
      r.met++;
      if (!now.has(id)) r.fixed++;
      rows.set(id, r);
    }
  }
  return [...rows]
    .map(([id, r]) => ({ id, name: bugNames[id] ?? id, ...r }))
    .sort((a, b) => b.met - a.met || a.name.localeCompare(b.name));
}

// 평가 목록 옮기기: 평가 중인 학급 목록을 파일로 내보내 다른 기기에서 이어서 평가한다.
// 학생 작품 파일과 섞이지 않게 형식 이름을 따로 두고, 파일 한도(2MB)를 넘으면 여러 파일로 나눈다.
export const CLASS_FORMAT = "ttukttak-vibe-class";
const pack = (entries: Entry[]) => ({
  format: CLASS_FORMAT,
  version: 1,
  // 선생님 미션으로 만든 작품도 다른 기기에서 열리게 그 미션을 함께 담는다.
  missions: missions.filter(
    (m) =>
      m.id.startsWith("custom-") &&
      entries.some((e) => e.work.missionId === m.id),
  ),
  entries: entries.map(({ file, work, sourceId }) => ({
    file,
    work,
    ...(sourceId ? { sourceId } : {}),
  })),
});
export function classSessionFiles(entries: Entry[]) {
  const files: string[] = [];
  let group: Entry[] = [];
  for (const e of entries) {
    if (group.length && jsonBytes(pack([...group, e])) > LIMITS.bytes) {
      files.push(JSON.stringify(pack(group)));
      group = [];
    }
    group.push(e);
  }
  if (group.length) files.push(JSON.stringify(pack(group)));
  return files;
}
// 작품은 작품 파일과 같은 규칙으로 검사한다. 평가(feedback)는 작품 안에 들어 있어 함께 온다.
export function parseClassSession(data: unknown, name: string): Entry[] {
  const o = (data ?? {}) as {
    format?: unknown;
    version?: unknown;
    entries?: unknown;
  };
  if (o.format !== CLASS_FORMAT || o.version !== 1 || !Array.isArray(o.entries))
    throw new AppError("평가 목록 파일 형식을 알 수 없어요.");
  if (o.entries.length < 1 || o.entries.length > 200)
    throw new AppError("평가 목록에는 작품이 1~200개 있어야 해요.");
  return o.entries.map((raw, i) => {
    const e = (raw ?? {}) as {
      file?: unknown;
      work?: unknown;
      sourceId?: unknown;
    };
    const work = validateWork(e.work);
    const file =
      typeof e.file === "string" && e.file.trim()
        ? e.file.slice(0, LIMITS.short)
        : `${name} (${i + 1})`;
    return {
      key: `${name}#${i}:${work.id}`,
      file,
      work,
      ...(typeof e.sourceId === "string" && e.sourceId.length <= 80
        ? { sourceId: e.sourceId }
        : {}),
    };
  });
}

// 스스로 평가와 선생님 평가 비교: 둘 다 고른 항목 가운데 단계가 다른 것을 돌려준다.
// big은 한 항목이라도 두 단계 차이(시작 ↔ 설명·적용)가 나는지다. 상담할 학생을 빨리 찾게 한다.
export function assessmentGaps(w: Work) {
  const self = w.selfAssessment?.levels ?? [];
  const teacher = w.feedback?.levels ?? [];
  const items = rubric.flatMap((r, i) => {
    const a = self[i] ?? 0;
    const b = teacher[i] ?? 0;
    return a > 0 && b > 0 && a !== b
      ? [{ name: r[0], self: a, teacher: b }]
      : [];
  });
  return {
    items,
    big: items.some((x) => Math.abs(x.self - x.teacher) >= 2),
  };
}

// 학급 모으기 걸러 보기·정렬: 평가할 작품을 빨리 찾게 한다.
export type Filter = "all" | "ungraded" | "unfinished" | "bugs" | "gap";
export type Order = "loaded" | "name" | "progress";
export const filters: [Filter, string][] = [
  ["all", "모든 작품"],
  ["ungraded", "평가 전인 작품"],
  ["unfinished", "다섯 단계를 다 기록하지 않은 작품"],
  ["bugs", "지금 버그가 남은 작품"],
  ["gap", "스스로 평가와 선생님 평가가 다른 작품"],
];
export const orders: [Order, string][] = [
  ["loaded", "읽은 순서"],
  ["name", "파일 이름 순서"],
  ["progress", "기록한 단계가 적은 순서"],
];
const steps = (w: Work) => stageDone(w.draft).filter(Boolean).length;
export function arrange(entries: Entry[], filter: Filter, order: Order) {
  const keep = entries.filter(({ work }) =>
    filter === "ungraded"
      ? !graded(work.feedback)
      : filter === "unfinished"
        ? steps(work) < stageNames.length
        : filter === "bugs"
          ? diagnose(work.draft.config).length > 0
          : filter === "gap"
            ? assessmentGaps(work).items.length > 0
            : true,
  );
  if (order === "loaded") return keep;
  // 정렬해도 같은 값끼리는 읽은 순서를 지킨다.
  return [...keep].sort((a, b) =>
    order === "name"
      ? a.file.localeCompare(b.file, "ko", { numeric: true })
      : steps(a.work) - steps(b.work),
  );
}
