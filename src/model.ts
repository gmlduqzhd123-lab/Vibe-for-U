export type Kind = "quiz" | "story" | "timer";
export type Mode = "child" | "adult";
export type Question = {
  id: string;
  text: string;
  choices: string[];
  correct: number;
};
export type Scene = {
  id: string;
  title: string;
  text: string;
  ending: boolean;
  choices: { label: string; to: string }[];
};
export type QuizConfig = {
  kind: "quiz";
  questions: Question[];
  scoring: "once" | "attempt";
  points: number;
  correctFeedback: string;
  wrongFeedback: string;
  resetScore: boolean;
};
export type StoryConfig = {
  kind: "story";
  start: string;
  scenes: Scene[];
  intendedEndings: string[];
};
export type TimerConfig = {
  kind: "timer";
  seconds: number;
  endMessage: string;
  showEnd: boolean;
};
export type Config = QuizConfig | StoryConfig | TimerConfig;
export type Check = {
  id: string;
  label: string;
  expected: string;
  actual: string;
  source: "auto" | "self" | "peer";
  status: "pass" | "fail" | "pending";
  revision: string;
  at: string;
};
export type PromiseData = {
  audience: string;
  problem: string;
  features: string;
  done: string;
  input: string;
  exceptions: string;
};
export type AIData = {
  tool: string;
  help: string;
  observation: string;
  expected: string;
  criteria: string;
  result: "unobserved" | "pass" | "revise";
  revisionPrompt: string;
};
export type Snapshot = {
  title: string;
  config: Config;
  revision: string;
  promise: PromiseData;
  originalPrompt: string;
  arrangedPrompt: string;
  prediction: string;
  runRevision: string;
  checks: Check[];
  change: {
    situation: string;
    expected: string;
    actual: string;
    behavior: string;
    keep: string;
    retest: string;
    reason: string;
  };
  reflection: string;
  help: string;
  activity: "practice" | "ai";
  ai: AIData;
};
export type Version = {
  id: string;
  label: string;
  reason: string;
  at: string;
  data: Snapshot;
};
export type Work = {
  schemaVersion: 1;
  id: string;
  kind: Kind;
  missionId: string;
  createdAt: string;
  updatedAt: string;
  editingLabel: string;
  draft: Snapshot;
  versions: Version[];
};
export type Mission = {
  id: string;
  kind: Kind;
  order: number;
  title: string;
  goal: string;
  guide: string;
  prediction: string;
  tests: { label: string; expected: string }[];
  task: string;
  hints: string[];
  completion: string;
  closing: string;
  learningError: boolean;
  starter: Config;
};
export const APP_PREFIX = "ttukttak-vibe:";
export const LIMITS = {
  bytes: 2 * 1024 * 1024,
  text: 4000,
  promise: 500,
  checkText: 500,
  historyBytes: 600 * 1024,
  short: 200,
  questions: 20,
  scenes: 24,
  choices: 6,
  versions: 30,
  checks: 100,
  seconds: 3600,
};
export const uid = () => crypto.randomUUID();
export const clone = <T>(value: T): T => structuredClone(value);
export const kindNames: Record<Kind, string> = {
  quiz: "퀴즈",
  story: "갈림길 이야기",
  timer: "타이머",
};
export const now = () => new Date().toISOString();
export function arrangePrompt(data: PromiseData, mode: Mode) {
  return mode === "child"
    ? `사용할 사람은 ${data.audience}이에요.\n해결할 문제: ${data.problem}\n누르거나 입력할 것: ${data.input}\n필요한 기능: ${data.features}\n다시 누르거나 처음으로 돌아갈 때: ${data.exceptions}\n완성이라고 할 수 있는 조건: ${data.done}`
    : `목적: ${data.problem}\n사용자: ${data.audience}\n입력: ${data.input}\n기능과 결과: ${data.features}\n예외 상황: ${data.exceptions}\n완료 조건: ${data.done}`;
}
export function correctionPrompt(c: Snapshot["change"]) {
  return `발생 상황: ${c.situation}\n기대한 결과: ${c.expected}\n실제 결과: ${c.actual}\n바꾸려는 동작: ${c.behavior}\n유지할 동작: ${c.keep}\n수정 후 검사: ${c.retest}\n수정 이유: ${c.reason}`;
}
export function stageDone(d: Snapshot) {
  const current = d.checks.filter((c) => c.revision === d.revision);
  return [
    Object.values(d.promise).every((x) => x.trim()),
    Boolean(d.originalPrompt.trim() && d.arrangedPrompt.trim()),
    Boolean(d.prediction.trim() && d.runRevision === d.revision),
    current.some(
      (c) =>
        c.source !== "auto" &&
        c.actual.trim() &&
        c.expected.trim() &&
        c.label.trim(),
    ) &&
      current.every((c) => c.status === "pass") &&
      Boolean(d.change.reason.trim()),
    Boolean(d.reflection.trim() && d.help.trim()),
  ];
}
export function aiStatus(ai: AIData) {
  return ai.tool.trim() &&
    ai.observation.trim() &&
    ai.criteria.trim() &&
    ai.expected.trim() &&
    ai.result !== "unobserved"
    ? "관찰 기록 있음"
    : "실제 결과 미기록";
}
export function makeWork(mission: Mission, normal = false): Work {
  const config = clone(mission.starter);
  if (normal) {
    if (config.kind === "quiz") {
      config.scoring = "once";
      config.resetScore = true;
    }
    if (config.kind === "timer") config.showEnd = true;
    if (config.kind === "story") {
      const start = config.scenes.find((s) => s.id === config.start)!;
      if (start.choices[1]) start.choices[1].to = "sun";
    }
  }
  const stamp = now();
  const draft: Snapshot = {
    title: normal ? `나의 ${kindNames[mission.kind]}` : mission.title,
    config,
    revision: uid(),
    promise: {
      audience: "우리 반 친구",
      problem: mission.goal,
      features:
        mission.kind === "quiz"
          ? "정답을 고르고 점수와 결과 보기"
          : mission.kind === "story"
            ? "선택에 따라 다른 결말 만나기"
            : "시간을 정하고 시작·일시정지·초기화하기",
      done: mission.tests.map((t) => t.expected).join(" / "),
      input:
        mission.kind === "quiz"
          ? "정답이라고 생각하는 선택지 누르기"
          : mission.kind === "story"
            ? "이야기 속 선택지 누르기"
            : "시간을 입력하고 시작 버튼 누르기",
      exceptions:
        mission.kind === "quiz"
          ? "여러 번 눌러도 문제당 한 번만 채점하고 다시 시작하면 0점으로 돌아가기"
          : mission.kind === "story"
            ? "모든 선택은 있는 장면으로 이동하고 처음으로 돌아갈 수 있기"
            : "연속 시작해도 한 번만 실행하고, 멈춘 시간부터 재개하기",
    },
    originalPrompt: "",
    arrangedPrompt: "",
    prediction: "",
    runRevision: "",
    checks: [],
    change: {
      situation: "",
      expected: "",
      actual: "",
      behavior: "",
      keep: "",
      retest: "",
      reason: "",
    },
    reflection: "",
    help: "",
    activity: "practice",
    ai: {
      tool: "",
      help: "",
      observation: "",
      expected: "",
      criteria: "",
      result: "unobserved",
      revisionPrompt: "",
    },
  };
  return {
    schemaVersion: 1,
    id: uid(),
    kind: mission.kind,
    missionId: mission.id,
    createdAt: stamp,
    updatedAt: stamp,
    editingLabel: "시작 작품 · 현재 편집본",
    draft,
    versions: [
      {
        id: uid(),
        label: "시작 작품",
        reason: "미션의 시작 설정",
        at: stamp,
        data: clone(draft),
      },
    ],
  };
}
