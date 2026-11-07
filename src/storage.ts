import { AppError } from "./appError";
import { APP_PREFIX, LIMITS, SCHEMA_VERSION, kinds, uid } from "./model";
import { missions } from "./data";
import { EXPORT_STEPS, recentSteps } from "./undoHistory";
import type { Step } from "./undoHistory";
import type {
  AIData,
  Check,
  Config,
  Feedback,
  Kind,
  PromiseData,
  Snapshot,
  Work,
} from "./model";
export const DB_NAME = APP_PREFIX + "works-v1";
const STORE = "works";
let database: Promise<IDBDatabase> | undefined;
export function openDatabase() {
  if (!database)
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () =>
        r.result.createObjectStore(STORE, { keyPath: "id" });
      r.onsuccess = () => {
        r.result.onversionchange = () => {
          r.result.close();
          database = undefined;
        };
        resolve(r.result);
      };
      r.onerror = () => {
        database = undefined;
        reject(r.error);
      };
      r.onblocked = () => {
        database = undefined;
        reject(new AppError("다른 탭을 닫은 뒤 다시 시도해 주세요."));
      };
    });
  return database;
}
async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const r = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error ?? new AppError("저장하지 못했어요."));
    tx.onabort = () => reject(tx.error ?? new AppError("저장이 취소되었어요."));
  });
}
// 기기에 남은 옛 형식 작품은 읽을 때 새 형식으로 바꾸고, 다음 저장 때 새 형식으로 기록한다.
// 기록 하나가 망가지거나 더 새로운 앱의 형식이어도 나머지 작품은 열 수 있게, 읽지 못한 기록은 원본 그대로 따로 모은다.
export async function readAllWorks() {
  const all = (await transaction("readonly", (s) => s.getAll())) as unknown[];
  const works: Work[] = [];
  const unreadable: unknown[] = [];
  for (const raw of all) {
    try {
      const w = migrateWork(raw) as Work;
      const d = w.draft as Partial<Work["draft"]> | undefined;
      if (
        typeof w.id !== "string" ||
        !kinds.includes(w.kind) ||
        !d?.config ||
        d.config.kind !== w.kind ||
        !Array.isArray(w.versions)
      )
        throw new AppError("작품 형식을 알 수 없어요.");
      works.push(w);
    } catch {
      unreadable.push(raw);
    }
  }
  return { works, unreadable };
}
export const listWorks = () => readAllWorks().then((r) => r.works);
export const saveWork = (w: Work) => transaction("readwrite", (s) => s.put(w));
export const deleteWork = (id: string) =>
  transaction("readwrite", (s) => s.delete(id));
export const clearWorks = () => transaction("readwrite", (s) => s.clear());
export async function importWorks(works: Work[]) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    for (const w of works) tx.objectStore(STORE).put(w);
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () =>
      reject(tx.error ?? new AppError("가져오기 저장 실패"));
  });
}
// 선생님 미션으로 만든 작품은 그 미션도 함께 담아, 미션이 없는 기기에서도 열리게 한다.
export const usedCustomMissions = (works: Work[]) =>
  missions.filter(
    (m) =>
      m.id.startsWith("custom-") && works.some((w) => w.missionId === m.id),
  );
// 되돌리기 기록은 파일을 많이 키우지 않는 만큼만 담는다(바이트).
const UNDO_BYTES = 300_000;
export function exportJSON(works: Work[], withUndo = true) {
  const used = usedCustomMissions(works);
  const body = {
    format: "ttukttak-vibe-backup",
    schemaVersion: SCHEMA_VERSION,
    works,
    ...(used.length ? { missions: used } : {}),
  };
  if (!withUndo) return JSON.stringify(body);
  // 최근 되돌리기 단계를 작품 ID별로 함께 담아, 다른 기기에서 열어도 몇 단계는 되돌릴 수 있게 한다.
  const undo: Record<string, Step[]> = {};
  for (const w of works) {
    const steps = recentSteps(w.id);
    if (steps.length) undo[w.id] = steps;
  }
  if (!Object.keys(undo).length) return JSON.stringify(body);
  // 너무 크면 단계가 가장 많은 작품부터 가장 오래된 단계를 하나씩 빼서 고르게 줄인다.
  while (jsonBytes(undo) > UNDO_BYTES) {
    const ids = Object.keys(undo);
    if (!ids.length) break;
    const id = ids.reduce((a, b) => (undo[b].length > undo[a].length ? b : a));
    undo[id].shift();
    if (!undo[id].length) delete undo[id];
  }
  if (!Object.keys(undo).length) return JSON.stringify(body);
  const text = JSON.stringify({ ...body, undo });
  // 되돌리기 기록 때문에 파일 한도를 넘으면 기록은 빼고 작품만 담는다.
  return new TextEncoder().encode(text).length > LIMITS.bytes
    ? JSON.stringify(body)
    : text;
}
export const jsonBytes = (data: unknown) =>
  new TextEncoder().encode(JSON.stringify(data)).length;
export function backupFiles(works: Work[]) {
  const files: string[] = [];
  let group: Work[] = [];
  for (const work of works) {
    if (new TextEncoder().encode(exportJSON([work])).length > LIMITS.bytes)
      throw new AppError(
        "한 작품의 파일이 2MB를 넘어요. 백업할 검사 기록과 버전을 줄여 주세요.",
      );
    const candidate = [...group, work];
    if (
      candidate.length > 50 ||
      new TextEncoder().encode(exportJSON(candidate)).length > LIMITS.bytes
    ) {
      files.push(exportJSON(group));
      group = [];
    }
    group.push(work);
  }
  if (group.length) files.push(exportJSON(group));
  return files;
}
export function downloadText(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  // 문서에 붙인 링크만 내려받는 브라우저가 있어 잠깐 붙였다가 뗀다.
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadWorks(works: Work[]) {
  const files = backupFiles(works);
  files.forEach((text, i) =>
    downloadText(
      `뚝딱-작품-${new Date().toISOString().slice(0, 10)}${files.length > 1 ? `-${i + 1}` : ""}.json`,
      text,
      "application/json",
    ),
  );
  return files.length;
}
type Obj = Record<string, unknown>;
function obj(v: unknown, path: string): Obj {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new AppError("{path}: 객체 형식이 필요해요.", { path });
  return v as Obj;
}
function str(v: unknown, path: string, max: number = LIMITS.text) {
  if (typeof v !== "string" || v.length > max)
    throw new AppError("{path}: {max}자 이내의 글자여야 해요.", { path, max });
  return v;
}
function bool(v: unknown, path: string) {
  if (typeof v !== "boolean")
    throw new AppError("{path}: 참/거짓 값이 필요해요.", { path });
  return v;
}
function num(v: unknown, path: string, min: number, max: number) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
    throw new AppError("{path}: {min}~{max}의 정수여야 해요.", {
      path,
      min,
      max,
    });
  return v;
}
function arr(v: unknown, path: string, min: number, max: number): unknown[] {
  if (!Array.isArray(v) || v.length < min || v.length > max)
    throw new AppError("{path}: 항목 {min}~{max}개가 필요해요.", {
      path,
      min,
      max,
    });
  return v;
}
function one<T extends string>(
  v: unknown,
  options: readonly T[],
  path: string,
): T {
  if (typeof v !== "string" || !options.includes(v as T))
    throw new AppError("{path}: 지원하지 않는 값이에요.", { path });
  return v as T;
}
function stamp(v: unknown, path: string) {
  const s = str(v, path, 40);
  if (!Number.isFinite(Date.parse(s)))
    throw new AppError("{path}: 올바른 날짜가 아니에요.", { path });
  return s;
}
function unique(ids: string[], path: string) {
  if (ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length)
    throw new AppError("{path}: 이름표가 비었거나 중복돼요.", { path });
}
export function validateConfig(value: unknown): Config {
  const c = obj(value, "설정");
  const kind = one(c.kind, kinds, "프로젝트 종류");
  if (kind === "pattern") {
    const size = num(c.size, "판 크기", LIMITS.boardMin, LIMITS.boardMax);
    const commands = arr(c.commands, "명령", 1, LIMITS.commands).map((v) => {
      const m = obj(v, "명령");
      return {
        dir: one(m.dir, ["right", "down", "left", "up"] as const, "명령 방향"),
        count: num(m.count, "명령 칸 수", 1, LIMITS.stepCount),
      };
    });
    const target = arr(c.target, "목표 칸", 1, size * size).map((v) => {
      const t = str(v, "목표 칸", 5);
      const m = /^(\d+),(\d+)$/.exec(t);
      if (!m || Number(m[1]) >= size || Number(m[2]) >= size)
        throw new AppError("목표 칸: 판 안의 칸이어야 해요.");
      return t;
    });
    unique(target, "목표 칸");
    return {
      kind,
      size,
      repeat: num(c.repeat, "반복 횟수", 1, LIMITS.repeat),
      commands,
      edge: one(c.edge, ["stop", "wrap"] as const, "가장자리 규칙"),
      ...(c.turn === undefined
        ? {}
        : { turn: one(c.turn, ["none", "right"] as const, "조건 규칙") }),
      target,
    };
  }
  if (kind === "quiz") {
    const questions = arr(c.questions, "문항", 1, LIMITS.questions).map(
      (v, i) => {
        const q = obj(v, `문항 ${i + 1}`);
        const choices = arr(q.choices, "선택지", 2, LIMITS.choices).map((t) =>
          str(t, "선택지", LIMITS.short),
        );
        return {
          id: str(q.id, "문항 이름표", 80),
          text: str(q.text, "문제"),
          choices,
          correct: num(q.correct, "정답 번호", 0, choices.length - 1),
        };
      },
    );
    unique(
      questions.map((q) => q.id),
      "문항",
    );
    return {
      kind,
      questions,
      scoring: one(c.scoring, ["once", "attempt"], "채점 규칙"),
      points: num(c.points, "문제당 점수", 1, 10),
      correctFeedback: str(c.correctFeedback, "정답 안내"),
      wrongFeedback: str(c.wrongFeedback, "오답 안내"),
      resetScore: bool(c.resetScore, "점수 초기화"),
    };
  }
  if (kind === "story") {
    const scenes = arr(c.scenes, "장면", 2, LIMITS.scenes).map((v) => {
      const s = obj(v, "장면");
      return {
        id: str(s.id, "장면 이름표", 80),
        title: str(s.title, "장면 제목", LIMITS.short),
        text: str(s.text, "장면 설명"),
        ending: bool(s.ending, "결말 여부"),
        choices: arr(s.choices, "장면 선택지", 0, LIMITS.choices).map((v) => {
          const ch = obj(v, "장면 선택");
          return {
            label: str(ch.label, "선택 문장", LIMITS.short),
            to: str(ch.to, "도착 장면", 80),
          };
        }),
      };
    });
    unique(
      scenes.map((s) => s.id),
      "장면",
    );
    const start = str(c.start, "시작 장면", 80);
    const endings = arr(c.intendedEndings, "의도한 결말", 1, LIMITS.scenes).map(
      (v) => str(v, "결말 이름표", 80),
    );
    unique(endings, "의도한 결말");
    if (
      !scenes.some((s) => s.id === start) ||
      scenes.some((s) =>
        s.choices.some((ch) => !scenes.some((t) => t.id === ch.to)),
      ) ||
      endings.some((id) => !scenes.some((s) => s.id === id && s.ending))
    )
      throw new AppError("장면 연결: 존재하는 장면과 결말을 연결해 주세요.");
    if (
      scenes.some(
        (s) =>
          (s.ending && s.choices.length > 0) ||
          (!s.ending && s.choices.length === 0),
      )
    )
      throw new AppError(
        "장면: 결말에는 선택지가 없어야 하고, 진행 장면에는 선택지가 필요해요.",
      );
    return { kind, start, scenes, intendedEndings: endings };
  }
  if (kind === "rule") {
    const when = ["gte", "lte", "eq"] as const;
    return {
      kind,
      variable: str(c.variable, "기억하는 값 이름", 40),
      start: num(c.start, "처음 값", -1000, 1000),
      floor:
        c.floor === null ? null : num(c.floor, "가장 작은 값", -1000, 1000),
      buttons: arr(c.buttons, "버튼", 1, 4).map((v) => {
        const b = obj(v, "버튼");
        return {
          label: str(b.label, "버튼 이름", LIMITS.short),
          change: num(b.change, "버튼이 바꾸는 값", -100, 100),
        };
      }),
      rules: arr(c.rules, "조건", 1, LIMITS.choices).map((v) => {
        const r = obj(v, "조건");
        return {
          when: one(r.when, when, "조건 종류"),
          value: num(r.value, "조건 값", -1000, 1000),
          message: str(r.message, "조건 문구", LIMITS.short),
        };
      }),
      otherwise: str(c.otherwise, "그 밖에 문구", LIMITS.short),
    };
  }
  return {
    kind,
    seconds: num(c.seconds, "제한 시간", 1, LIMITS.seconds),
    endMessage: str(c.endMessage, "종료 안내"),
    showEnd: bool(c.showEnd, "종료 표시"),
  };
}
function validateSnapshot(v: unknown, kind: Kind): Snapshot {
  const d = obj(v, "작품 내용");
  const config = validateConfig(d.config);
  if (config.kind !== kind)
    throw new AppError("작품과 버전의 프로젝트 종류가 달라요.");
  const p = obj(d.promise, "만들기 약속");
  const promise = {} as PromiseData;
  for (const key of [
    "audience",
    "problem",
    "features",
    "done",
    "input",
    "exceptions",
  ] as const)
    promise[key] = str(p[key], `약속 ${key}`, LIMITS.promise);
  const a = obj(d.ai, "AI 기록");
  const ai: AIData = {
    tool: str(a.tool, "도구명", LIMITS.short),
    help: str(a.help, "도움"),
    observation: str(a.observation, "AI 실제 결과"),
    expected: str(a.expected, "AI 예상"),
    criteria: str(a.criteria, "AI 검사 기준"),
    result: one(a.result, ["unobserved", "pass", "revise"], "AI 판정"),
    revisionPrompt: str(a.revisionPrompt, "AI 수정 요청"),
  };
  const change = {} as Snapshot["change"];
  const ch = obj(d.change, "수정 기록");
  for (const key of [
    "situation",
    "expected",
    "actual",
    "behavior",
    "keep",
    "retest",
    "reason",
  ] as const)
    change[key] = str(ch[key], `수정 ${key}`);
  const checks: Check[] = arr(d.checks, "검사 기록", 0, LIMITS.checks).map(
    (v) => {
      const c = obj(v, "검사");
      return {
        id: str(c.id, "검사 ID", 80),
        label: str(c.label, "검사 이름", LIMITS.short),
        expected: str(c.expected, "기대 결과", LIMITS.checkText),
        actual: str(c.actual, "실제 결과", LIMITS.checkText),
        source: one(c.source, ["auto", "self", "peer"], "검사 종류"),
        status: one(c.status, ["pass", "fail", "pending"], "검사 상태"),
        revision: str(c.revision, "검사 버전", 80),
        at: stamp(c.at, "검사 시각"),
      };
    },
  );
  unique(
    checks.map((c) => c.id),
    "검사",
  );
  return {
    title: str(d.title, "작품 제목", LIMITS.short),
    config,
    revision: str(d.revision, "설정 버전", 80),
    promise,
    ...(d.goalReviewed === undefined
      ? {}
      : { goalReviewed: bool(d.goalReviewed, "만들기 약속 확인") }),
    originalPrompt: str(d.originalPrompt, "원문"),
    arrangedPrompt: str(d.arrangedPrompt, "정리 요청문"),
    prediction: str(d.prediction, "예상"),
    runRevision: str(d.runRevision, "실행 설정 버전", 80),
    ...(d.predictionCheck === undefined
      ? {}
      : {
          predictionCheck: one(
            d.predictionCheck,
            ["match", "differ", ""] as const,
            "예상 확인",
          ),
        }),
    ...(d.predictionNote === undefined
      ? {}
      : {
          predictionNote: str(
            d.predictionNote,
            "예상 확인 메모",
            LIMITS.promise,
          ),
        }),
    checks,
    change,
    reflection: str(d.reflection, "성찰"),
    help: str(d.help, "도움 기록"),
    activity: one(d.activity, ["practice", "ai"], "활동 종류"),
    ai,
  };
}
// 저장 형식을 바꿀 때는 SCHEMA_VERSION을 올리고, 바로 앞 버전에서 바꾸는 함수를 여기에 더한다.
// 각 함수는 검사 전의 원본을 받아 다음 버전의 원본을 돌려준다. 검사는 마지막에 한 번 한다.
const migrations: Record<number, (w: Obj) => Obj> = {
  // 1 → 2: 교사 평가 기록(feedback)을 더했다.
  1: (w) => ({ ...w, schemaVersion: 2, feedback: null }),
  // 2 → 3: 힌트 사용 기록(hintsUsed)과 학생 자기 평가(selfAssessment)를 더했다.
  2: (w) => ({ ...w, schemaVersion: 3, hintsUsed: 0, selfAssessment: null }),
};
const supported = `스키마 버전 1~${SCHEMA_VERSION}`;
function checkVersion(v: unknown, what: string) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1)
    throw new AppError(
      "{what}의 스키마 버전을 알 수 없어요. 이 앱은 {supported}를 읽어요.",
      { what, supported },
    );
  if (v > SCHEMA_VERSION)
    throw new AppError(
      "더 새로운 앱에서 만든 {what}이에요(스키마 버전 {v}). 이 앱은 {supported}를 읽어요. 최신 주소에서 새로고침한 뒤 다시 가져와 주세요.",
      { what, v, supported },
    );
  return v;
}
export function migrateWork(v: unknown): unknown {
  let w = obj(v, "작품");
  let version = checkVersion(w.schemaVersion, "작품");
  while (version < SCHEMA_VERSION) {
    w = migrations[version](w);
    version = checkVersion(w.schemaVersion, "작품");
  }
  return w;
}
export function validateFeedback(
  v: unknown,
  what = "교사 평가",
): Feedback | null {
  if (v === null) return null;
  const f = obj(v, what);
  return {
    levels: arr(f.levels, "평가 단계", 4, 4).map((l) =>
      num(l, "평가 단계", 0, 3),
    ),
    note: str(f.note, "평가 의견"),
    at: stamp(f.at, "평가 시각"),
  };
}
function validateVersions(value: unknown, kind: Kind) {
  const versions = arr(value, "버전", 1, LIMITS.versions).map((v) => {
    const b = obj(v, "버전");
    return {
      id: str(b.id, "버전 ID", 80),
      label: str(b.label, "버전 제목", LIMITS.short),
      reason: str(b.reason, "버전 이유"),
      at: stamp(b.at, "버전 시각"),
      data: validateSnapshot(b.data, kind),
    };
  });
  unique(
    versions.map((v) => v.id),
    "버전",
  );
  if (jsonBytes(versions) > LIMITS.historyBytes)
    throw new AppError(
      "수정 버전 묶음은 600KB까지예요. 필요한 버전만 남긴 파일을 선택해 주세요.",
    );
  return versions;
}
// 작품 파일에 담긴 되돌리기 단계. 한 단계는 편집본·버전 묶음·편집본 이름이다.
function validateSteps(value: unknown, kind: Kind): Step[] {
  return arr(value, "되돌리기 기록", 0, EXPORT_STEPS).map((v) => {
    const s = obj(v, "되돌리기 단계");
    return {
      draft: validateSnapshot(s.draft, kind),
      versions: validateVersions(s.versions, kind),
      editingLabel: str(s.editingLabel, "편집본 이름", LIMITS.short),
    };
  });
}
export function validateWork(v: unknown): Work {
  const w = obj(migrateWork(v), "작품");
  const kind = one(w.kind, kinds, "프로젝트 종류");
  const missionId = str(w.missionId, "미션", 80);
  if (!missions.some((m) => m.id === missionId && m.kind === kind))
    throw new AppError("지원하지 않는 미션이에요.");
  const versions = validateVersions(w.versions, kind);
  return {
    schemaVersion: SCHEMA_VERSION,
    id: str(w.id, "작품 ID", 80),
    kind,
    missionId,
    createdAt: stamp(w.createdAt, "만든 시각"),
    updatedAt: stamp(w.updatedAt, "고친 시각"),
    editingLabel: str(w.editingLabel, "편집본 이름", LIMITS.short),
    draft: validateSnapshot(w.draft, kind),
    versions,
    feedback: validateFeedback(w.feedback),
    hintsUsed: num(w.hintsUsed, "힌트 사용", 0, 10),
    selfAssessment: validateFeedback(w.selfAssessment, "자기 평가"),
  };
}
// 작품 파일 글을 읽는다(크기·JSON 검사). 파일을 한 번만 읽고 parseBackup에 넘긴다.
export function readBackupText(text: string): unknown {
  if (new TextEncoder().encode(text).length > LIMITS.bytes)
    throw new AppError(
      "파일은 2MB 이하여야 해요. 작품을 나누어 내보내 주세요.",
    );
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(
      "JSON 파일을 읽을 수 없어요. 원래 내보낸 .json 파일을 선택해 주세요.",
    );
  }
}
// 읽은 작품 파일을 검사해 새 ID의 작품, 새 ID별 되돌리기 단계(withUndo일 때만 검사),
// 파일에 적힌 원래 작품 ID(sourceIds, works와 같은 순서)를 돌려준다.
export function parseBackup(
  data: unknown,
  withUndo = true,
): { works: Work[]; undo: Map<string, Step[]>; sourceIds: string[] } {
  const root = obj(data, "파일");
  if (root.format !== "ttukttak-vibe-backup")
    throw new AppError("뚝딱 백업 파일({supported})을 선택해 주세요.", {
      supported,
    });
  checkVersion(root.schemaVersion, "백업 파일");
  const undoRoot =
    !withUndo || root.undo === undefined ? {} : obj(root.undo, "되돌리기 기록");
  const undo = new Map<string, Step[]>();
  const sourceIds: string[] = [];
  const works = arr(root.works, "작품 목록", 1, 50).map((v) => {
    const work = validateWork(v);
    sourceIds.push(work.id);
    const id = uid();
    // 함께 온 되돌리기 기록은 새 ID에 붙인다. 읽을 수 없는 기록은 작품만 가져온다.
    const raw = undoRoot[work.id];
    if (raw !== undefined)
      try {
        const steps = validateSteps(raw, work.kind);
        if (steps.length) undo.set(id, steps);
      } catch {
        // 되돌리기 기록은 있으면 좋은 것이라 작품을 막지 않는다.
      }
    return { ...work, id, editingLabel: "가져온 복사본 · 현재 편집본" };
  });
  return { works, undo, sourceIds };
}
export const parseImportWithUndo = (text: string) =>
  parseBackup(readBackupText(text));
export function parseImport(text: string): Work[] {
  return parseImportWithUndo(text).works;
}
// 학급 작품 모으기에서 평가 중인 목록. 학생 작품 저장소와 섞이지 않게 따로 둔다.
const CLASS_DB = APP_PREFIX + "class-v1";
function openClassDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(CLASS_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("session");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function classTx<T>(
  mode: IDBTransactionMode,
  action: (s: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openClassDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("session", mode);
    const r = action(tx.objectStore("session"));
    tx.oncomplete = () => {
      db.close();
      resolve(r.result);
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(tx.error ?? new AppError("평가 목록을 저장하지 못했어요."));
    };
  });
}
export type ClassSession<T> = { entries: T[]; savedAt: string };
export const loadClassSession = <T>() =>
  classTx("readonly", (s) => s.get("current")) as Promise<
    ClassSession<T> | undefined
  >;
export const saveClassSession = <T>(entries: T[]) =>
  classTx("readwrite", (s) =>
    s.put({ entries, savedAt: new Date().toISOString() }, "current"),
  );
export const clearClassSession = () =>
  classTx("readwrite", (s) => s.delete("current"));
