import { APP_PREFIX, LIMITS, SCHEMA_VERSION, uid } from "./model";
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
        reject(new Error("다른 탭을 닫은 뒤 다시 시도해 주세요."));
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
    tx.onerror = () => reject(tx.error ?? new Error("저장하지 못했어요."));
    tx.onabort = () => reject(tx.error ?? new Error("저장이 취소되었어요."));
  });
}
// 기기에 남은 옛 형식 작품은 읽을 때 새 형식으로 바꾸고, 다음 저장 때 새 형식으로 기록한다.
export const listWorks = () =>
  (transaction("readonly", (s) => s.getAll()) as Promise<unknown[]>).then(
    (all) => all.map((w) => migrateWork(w) as Work),
  );
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
      reject(tx.error ?? new Error("가져오기 저장 실패"));
  });
}
export function exportJSON(works: Work[]) {
  return JSON.stringify({
    format: "ttukttak-vibe-backup",
    schemaVersion: SCHEMA_VERSION,
    works,
  });
}
export const jsonBytes = (data: unknown) =>
  new TextEncoder().encode(JSON.stringify(data)).length;
export function backupFiles(works: Work[]) {
  const files: string[] = [];
  let group: Work[] = [];
  for (const work of works) {
    if (new TextEncoder().encode(exportJSON([work])).length > LIMITS.bytes)
      throw new Error(
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
  a.click();
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
    throw new Error(`${path}: 객체 형식이 필요해요.`);
  return v as Obj;
}
function str(v: unknown, path: string, max: number = LIMITS.text) {
  if (typeof v !== "string" || v.length > max)
    throw new Error(`${path}: ${max}자 이내의 글자여야 해요.`);
  return v;
}
function bool(v: unknown, path: string) {
  if (typeof v !== "boolean")
    throw new Error(`${path}: 참/거짓 값이 필요해요.`);
  return v;
}
function num(v: unknown, path: string, min: number, max: number) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
    throw new Error(`${path}: ${min}~${max}의 정수여야 해요.`);
  return v;
}
function arr(v: unknown, path: string, min: number, max: number): unknown[] {
  if (!Array.isArray(v) || v.length < min || v.length > max)
    throw new Error(`${path}: 항목 ${min}~${max}개가 필요해요.`);
  return v;
}
function one<T extends string>(
  v: unknown,
  options: readonly T[],
  path: string,
): T {
  if (typeof v !== "string" || !options.includes(v as T))
    throw new Error(`${path}: 지원하지 않는 값이에요.`);
  return v as T;
}
function stamp(v: unknown, path: string) {
  const s = str(v, path, 40);
  if (!Number.isFinite(Date.parse(s)))
    throw new Error(`${path}: 올바른 날짜가 아니에요.`);
  return s;
}
function unique(ids: string[], path: string) {
  if (ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length)
    throw new Error(`${path}: 이름표가 비었거나 중복돼요.`);
}
export function validateConfig(value: unknown): Config {
  const c = obj(value, "설정");
  const kind = one(c.kind, ["quiz", "story", "timer"], "프로젝트 종류");
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
      throw new Error("장면 연결: 존재하는 장면과 결말을 연결해 주세요.");
    if (
      scenes.some(
        (s) =>
          (s.ending && s.choices.length > 0) ||
          (!s.ending && s.choices.length === 0),
      )
    )
      throw new Error(
        "장면: 결말에는 선택지가 없어야 하고, 진행 장면에는 선택지가 필요해요.",
      );
    return { kind, start, scenes, intendedEndings: endings };
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
    throw new Error("작품과 버전의 프로젝트 종류가 달라요.");
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
};
const supported = `스키마 버전 1~${SCHEMA_VERSION}`;
function checkVersion(v: unknown, what: string) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1)
    throw new Error(
      `${what}의 스키마 버전을 알 수 없어요. 이 앱은 ${supported}를 읽어요.`,
    );
  if (v > SCHEMA_VERSION)
    throw new Error(
      `더 새로운 앱에서 만든 ${what}이에요(스키마 버전 ${v}). 이 앱은 ${supported}를 읽어요. 최신 주소에서 새로고침한 뒤 다시 가져와 주세요.`,
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
function validateFeedback(v: unknown): Feedback | null {
  if (v === null) return null;
  const f = obj(v, "교사 평가");
  return {
    levels: arr(f.levels, "평가 단계", 4, 4).map((l) =>
      num(l, "평가 단계", 0, 3),
    ),
    note: str(f.note, "평가 의견"),
    at: stamp(f.at, "평가 시각"),
  };
}
export function validateWork(v: unknown): Work {
  const w = obj(migrateWork(v), "작품");
  const kind = one(w.kind, ["quiz", "story", "timer"], "프로젝트 종류");
  const missionId = str(w.missionId, "미션", 80);
  if (!new RegExp(`^${kind}-[1-4]$`).test(missionId))
    throw new Error("지원하지 않는 미션이에요.");
  const versions = arr(w.versions, "버전", 1, LIMITS.versions).map((v) => {
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
    throw new Error(
      "수정 버전 묶음은 600KB까지예요. 필요한 버전만 남긴 파일을 선택해 주세요.",
    );
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
  };
}
export function parseImport(text: string): Work[] {
  if (new TextEncoder().encode(text).length > LIMITS.bytes)
    throw new Error("파일은 2MB 이하여야 해요. 작품을 나누어 내보내 주세요.");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "JSON 파일을 읽을 수 없어요. 원래 내보낸 .json 파일을 선택해 주세요.",
    );
  }
  const root = obj(data, "파일");
  if (root.format !== "ttukttak-vibe-backup")
    throw new Error(`뚝딱 백업 파일(${supported})을 선택해 주세요.`);
  checkVersion(root.schemaVersion, "백업 파일");
  return arr(root.works, "작품 목록", 1, 50).map((v) => {
    const work = validateWork(v);
    return { ...work, id: uid(), editingLabel: "가져온 복사본 · 현재 편집본" };
  });
}
