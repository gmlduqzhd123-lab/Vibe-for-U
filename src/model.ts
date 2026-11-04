export type Kind = "quiz" | "story" | "timer" | "pattern" | "rule";
export const kinds: Kind[] = ["quiz", "story", "timer", "pattern", "rule"];
// easy: 3~4학년용. 어린이 모드 안내에 낱말 블록·읽어 주기·큰 글씨를 더한다.
export type Mode = "child" | "adult" | "easy";
export const modes: Mode[] = ["child", "easy", "adult"];
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
export type Direction = "right" | "down" | "left" | "up";
// 칸 판에서 명령 묶음을 반복해 그림을 그린다. 시작은 왼쪽 위 칸(0,0)이다.
export type PatternConfig = {
  kind: "pattern";
  size: number;
  repeat: number;
  commands: { dir: Direction; count: number }[];
  edge: "stop" | "wrap";
  // 조건 규칙: "right"이면 다음 칸이 판 밖이거나 이미 칠한 칸일 때 오른쪽으로 돈다. 없으면 조건 없음.
  turn?: "none" | "right";
  target: string[];
};
// 만약 규칙 앱: 버튼을 누르면 앱이 기억하는 값이 바뀌고, 위에서부터 처음 맞는 조건의 문구를 보여 준다.
export type RuleCondition = "gte" | "lte" | "eq";
export type RuleConfig = {
  kind: "rule";
  // 앱이 기억하는 값의 이름(예: 점수, 걸음 수)과 처음 값
  variable: string;
  start: number;
  // 값이 이보다 작아지지 않게 막는다(없으면 null).
  floor: number | null;
  buttons: { label: string; change: number }[];
  rules: { when: RuleCondition; value: number; message: string }[];
  // 어떤 조건에도 맞지 않을 때 보여 줄 문구
  otherwise: string;
};
export type Config =
  QuizConfig | StoryConfig | TimerConfig | PatternConfig | RuleConfig;
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
  goalReviewed?: boolean;
  originalPrompt: string;
  arrangedPrompt: string;
  prediction: string;
  runRevision: string;
  // 예상이 실제와 맞았는지 학생이 표시한 것(없으면 아직 표시 전). 틀린 예상도 배움의 근거라 남긴다.
  predictionCheck?: "match" | "differ" | "";
  predictionNote?: string;
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
// 교사가 과정 평가표 네 항목에 매긴 단계(0 = 아직 평가하지 않음, 1~3 = 시작·수행·설명 단계)
export type Feedback = {
  levels: number[];
  note: string;
  at: string;
};
export const SCHEMA_VERSION = 3;
export type Work = {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  kind: Kind;
  missionId: string;
  createdAt: string;
  updatedAt: string;
  editingLabel: string;
  draft: Snapshot;
  versions: Version[];
  feedback: Feedback | null;
  // 미션 힌트를 몇 번째까지 열어 보았는지(0 = 열지 않음)
  hintsUsed: number;
  // 학생이 과정 평가표로 스스로 매긴 단계
  selfAssessment: Feedback | null;
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
  // 선생님 미션의 판(고쳐서 다시 나눠 줄 때 1씩 올린다). 기본 미션에는 없다.
  version?: number;
  // 선생님 미션의 영어 글(선택). 비워 두면 영어 화면에서도 한국어 글을 보여 준다.
  en?: MissionEnglish;
};
export type MissionEnglish = {
  title: string;
  goal: string;
  prediction: string;
  task: string;
  closing: string;
  tests: { label: string; expected: string }[];
  hints: string[];
};
// 다섯 학습 단계의 이름
export const stageNames = [
  "목표 정하기",
  "요청 작성하기",
  "예상하고 실행",
  "검사하고 수정",
  "설명하고 저장",
];
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
  commands: 12,
  boardMin: 4,
  boardMax: 10,
  repeat: 10,
  stepCount: 20,
};
export const uid = () => crypto.randomUUID();
export const clone = <T>(value: T): T => structuredClone(value);
export const kindNames: Record<Kind, string> = {
  quiz: "퀴즈",
  story: "갈림길 이야기",
  timer: "타이머",
  pattern: "패턴 그리기",
  rule: "만약 규칙",
};
const promiseText: Record<
  Kind,
  { features: string; input: string; exceptions: string }
> = {
  quiz: {
    features: "정답을 고르고 점수와 결과 보기",
    input: "정답이라고 생각하는 선택지 누르기",
    exceptions:
      "여러 번 눌러도 문제당 한 번만 채점하고 다시 시작하면 0점으로 돌아가기",
  },
  story: {
    features: "선택에 따라 다른 결말 만나기",
    input: "이야기 속 선택지 누르기",
    exceptions: "모든 선택은 있는 장면으로 이동하고 처음으로 돌아갈 수 있기",
  },
  rule: {
    features: "버튼으로 값을 바꾸고 조건에 맞는 문구 보기",
    input: "값을 늘리거나 줄이는 버튼 누르기",
    exceptions:
      "조건은 위에서부터 처음 맞는 것 하나만 쓰고, 값이 가장 작은 값보다 작아지지 않기",
  },
  timer: {
    features: "시간을 정하고 시작·일시정지·초기화하기",
    input: "시간을 입력하고 시작 버튼 누르기",
    exceptions: "연속 시작해도 한 번만 실행하고, 멈춘 시간부터 재개하기",
  },
  pattern: {
    features: "명령과 반복으로 판 위에 모양 그리기",
    input: "명령 순서와 반복 횟수를 정하고 그리기 버튼 누르기",
    exceptions:
      "판 가장자리에서는 멈추고, 처음으로 누르면 빈 판의 첫 칸에서 다시 그리기",
  },
};
export const now = () => new Date().toISOString();
export function arrangePrompt(data: PromiseData, mode: Mode) {
  return mode !== "adult"
    ? `사용할 사람은 ${data.audience}이에요.\n해결할 문제: ${data.problem}\n누르거나 입력할 것: ${data.input}\n필요한 기능: ${data.features}\n다시 누르거나 처음으로 돌아갈 때: ${data.exceptions}\n완성이라고 할 수 있는 조건: ${data.done}`
    : `목적: ${data.problem}\n사용자: ${data.audience}\n입력: ${data.input}\n기능과 결과: ${data.features}\n예외 상황: ${data.exceptions}\n완료 조건: ${data.done}`;
}
// t를 넘기면 화면 언어로 항목 이름을 쓴다.
export function correctionPrompt(
  c: Snapshot["change"],
  t: (text: string) => string = (x) => x,
) {
  return [
    [t("발생 상황"), c.situation],
    [t("기대한 결과"), c.expected],
    [t("실제 결과"), c.actual],
    [t("바꾸려는 동작"), c.behavior],
    [t("유지할 동작"), c.keep],
    [t("수정 후 검사"), c.retest],
    [t("수정 이유"), c.reason],
  ]
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
export function stageDone(d: Snapshot) {
  const current = d.checks.filter((c) => c.revision === d.revision);
  return [
    Object.values(d.promise).every((x) => x.trim()) && d.goalReviewed !== false,
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
    if (config.kind === "pattern") config.edge = "stop";
    // 정상 규칙: 좁은 조건(같으면 → 큰 값 이상 → 작은 값 이하)을 먼저 확인한다.
    if (config.kind === "rule") {
      const rank = (r: RuleConfig["rules"][number]) =>
        r.when === "eq"
          ? [0, 0]
          : r.when === "gte"
            ? [1, -r.value]
            : [2, r.value];
      config.rules = [...config.rules].sort((a, b) => {
        const [x, y] = [rank(a), rank(b)];
        return x[0] - y[0] || x[1] - y[1];
      });
    }
    if (config.kind === "story") {
      const start = config.scenes.find((s) => s.id === config.start)!;
      if (start.choices[1]) start.choices[1].to = "sun";
    }
  }
  const stamp = now();
  const draft: Snapshot = {
    title: normal ? `나의 ${kindNames[mission.kind]}` : mission.title,
    goalReviewed: false,
    config,
    revision: uid(),
    promise: {
      audience: "우리 반 친구",
      problem: mission.goal,
      features: promiseText[mission.kind].features,
      done: mission.tests.map((t) => t.expected).join(" / "),
      input: promiseText[mission.kind].input,
      exceptions: promiseText[mission.kind].exceptions,
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
    schemaVersion: SCHEMA_VERSION,
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
    feedback: null,
    hintsUsed: 0,
    selfAssessment: null,
  };
}
