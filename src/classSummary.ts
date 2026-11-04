import { rubric, missions, lessonMissionIds, lessons } from "./data";
import { kindNames, stageDone, stageNames } from "./model";
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
