import { missions } from "./data";
import { APP_PREFIX, LIMITS, uid } from "./model";
import type { Mission } from "./model";
import { validateConfig } from "./storage";
import { AppError } from "./appError";
// 선생님이 만든 미션: 미션 파일로 나눠 주고, 학생 기기에서는 '파일 가져오기'로 더한다.
// 기기의 localStorage에 두고, 앱을 열 때 기본 미션 목록 뒤에 붙인다(같은 배열을 모든 화면이 함께 쓴다).
export const MISSION_FORMAT = "ttukttak-vibe-mission";
export const CUSTOM_LIMIT = 30;
const KEY = `${APP_PREFIX}missions`;
export const isCustom = (id: string) => id.startsWith("custom-");
const builtIn = missions.filter((m) => !isCustom(m.id)).length;
type Obj = Record<string, unknown>;
// 영어 글(선택): 제목·목표·예상·과제·마무리가 모두 있어야 쓰고, 검사·힌트 수는 한국어와 같아야 한다.
function englishOf(raw: unknown, tests: number, hints: number) {
  if (!raw || typeof raw !== "object") return undefined;
  const e = raw as Obj;
  const opt = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const title = opt(e.title, LIMITS.short);
  const goal = opt(e.goal, LIMITS.promise);
  const prediction = opt(e.prediction, LIMITS.promise);
  const task = opt(e.task, LIMITS.promise);
  const closing = opt(e.closing, LIMITS.promise);
  if (![title, goal, prediction, task, closing].every(Boolean))
    return undefined;
  const ts = Array.isArray(e.tests) ? e.tests : [];
  const hs = Array.isArray(e.hints) ? e.hints : [];
  if (ts.length !== tests || hs.length !== hints) return undefined;
  const parsed = ts.map((t) => {
    const o = (t ?? {}) as Obj;
    return {
      label: opt(o.label, LIMITS.short),
      expected: opt(o.expected, LIMITS.checkText),
    };
  });
  const hintList = hs.map((h) => opt(h, LIMITS.promise));
  if (parsed.some((t) => !t.label || !t.expected) || hintList.some((h) => !h))
    return undefined;
  return {
    title,
    goal,
    prediction,
    task,
    closing,
    tests: parsed,
    hints: hintList,
  };
}
const text = (v: unknown, what: string, max: number, required = true) => {
  if (typeof v !== "string" || v.length > max || (required && !v.trim()))
    throw new AppError("{what}: {max}자 이내로 적어 주세요.", { what, max });
  return v.trim();
};
export function validateMission(data: unknown): Mission {
  if (!data || typeof data !== "object")
    throw new AppError("미션 파일 형식을 알 수 없어요.");
  const m = data as Obj;
  const starter = validateConfig(m.starter);
  const tests = Array.isArray(m.tests) ? m.tests : [];
  if (tests.length < 1 || tests.length > 6)
    throw new AppError("검사 항목은 1~6개여야 해요.");
  const hints = Array.isArray(m.hints) ? m.hints : [];
  if (hints.length < 1 || hints.length > 3)
    throw new AppError("힌트는 1~3개여야 해요.");
  const id =
    typeof m.id === "string" && /^custom-[\w-]{1,60}$/.test(m.id)
      ? m.id
      : `custom-${uid()}`;
  const title = text(m.title, "미션 제목", LIMITS.short);
  const task = text(m.task, "이번 과제", LIMITS.promise);
  const parsedTests = tests.map((t) => {
    const o = (t ?? {}) as Obj;
    return {
      label: text(o.label, "검사 이름", LIMITS.short),
      expected: text(o.expected, "기대 결과", LIMITS.checkText),
    };
  });
  return {
    id,
    kind: starter.kind,
    order: 0,
    title,
    goal: text(m.goal, "미션 목표", LIMITS.promise),
    guide: `먼저 예상한 뒤 실행해 보세요. ${task}`,
    prediction: text(m.prediction, "예상 질문", LIMITS.promise),
    tests: parsedTests,
    task,
    hints: hints.map((h) => text(h, "힌트", LIMITS.promise)),
    completion: `예상 기록 → ${parsedTests.map((t) => t.label).join(", ")} 직접 확인 → 수정 이유와 원리 설명`,
    closing: text(m.closing, "마무리 질문", LIMITS.promise),
    learningError: m.learningError === true,
    starter,
    version:
      typeof m.version === "number" &&
      Number.isInteger(m.version) &&
      m.version > 0
        ? Math.min(m.version, 9999)
        : 1,
    en: englishOf(m.en, parsedTests.length, hints.length),
  };
}
// 같은 미션의 더 새로운 판인지(교사가 고쳐서 다시 나눠 준 경우)
export const isNewerMission = (incoming: Mission, stored: Mission) =>
  (incoming.version ?? 1) > (stored.version ?? 1);
// 저장된 미션을 새 판으로 바꾼다. 이미 만든 작품은 작품 안에 설정이 따로 있어 그대로 남는다.
export function replaceCustomMission(m: Mission) {
  return saveCustomMission(m);
}
export const missionFile = (m: Mission) =>
  JSON.stringify({ format: MISSION_FORMAT, version: 1, mission: m });
export function parseMissionFile(data: unknown) {
  const o = (data ?? {}) as Obj;
  if (o.format !== MISSION_FORMAT || o.version !== 1)
    throw new AppError("미션 파일 형식을 알 수 없어요.");
  return validateMission(o.mission);
}
function read(): Mission[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((m) => {
      try {
        return [validateMission(m)];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
// 기본 미션 뒤에 붙이고, 종류마다 이어지는 번호를 매긴다.
function register(list: Mission[]) {
  missions.splice(builtIn);
  for (const m of list) {
    const order = missions.filter((x) => x.kind === m.kind).length + 1;
    missions.push({ ...m, order });
  }
}
export function loadCustomMissions() {
  register(read());
}
export function customMissions() {
  return missions.filter((m) => isCustom(m.id));
}
export function saveCustomMission(m: Mission) {
  const list = read().filter((x) => x.id !== m.id);
  if (list.length >= CUSTOM_LIMIT)
    throw new AppError("선생님 미션은 이 기기에 {n}개까지 둘 수 있어요.", {
      n: CUSTOM_LIMIT,
    });
  list.push(m);
  localStorage.setItem(KEY, JSON.stringify(list));
  register(list);
  return missions.find((x) => x.id === m.id)!;
}
export function removeCustomMission(id: string) {
  const list = read().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  register(list);
}
// 이 앱의 데이터 전체 삭제 뒤에는 기본 미션만 남긴다.
export function forgetCustomMissions() {
  register([]);
  try {
    localStorage.removeItem(COURSE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}
// 미션 묶음(코스): 선생님이 미션 몇 개를 순서대로 묶어 한 파일로 나눠 준다.
// 기본 미션과 선생님 미션을 섞을 수 있고, 선생님 미션은 파일에 함께 담긴다.
export const COURSE_FORMAT = "ttukttak-vibe-course";
export const COURSE_LIMIT = 10;
export const COURSE_MISSIONS = 12;
export type Course = { id: string; title: string; missionIds: string[] };
const COURSE_KEY = `${APP_PREFIX}courses`;
export function validateCourse(data: unknown): Course {
  if (!data || typeof data !== "object")
    throw new AppError("코스 파일 형식을 알 수 없어요.");
  const c = data as Obj;
  const ids = Array.isArray(c.missionIds) ? c.missionIds : [];
  const missionIds = [
    ...new Set(
      ids.filter(
        (v): v is string => typeof v === "string" && /^[\w-]{1,80}$/.test(v),
      ),
    ),
  ];
  if (missionIds.length < 1 || missionIds.length > COURSE_MISSIONS)
    throw new AppError("코스에는 미션을 1~{n}개 넣어 주세요.", {
      n: COURSE_MISSIONS,
    });
  return {
    id:
      typeof c.id === "string" && /^course-[\w-]{1,60}$/.test(c.id)
        ? c.id
        : `course-${uid()}`,
    title: text(c.title, "코스 이름", LIMITS.short),
    missionIds,
  };
}
export const courseFile = (c: Course) =>
  JSON.stringify({
    format: COURSE_FORMAT,
    version: 1,
    course: c,
    missions: missions.filter(
      (m) => isCustom(m.id) && c.missionIds.includes(m.id),
    ),
  });
// 코스와, 함께 담긴 선생님 미션(adoptMissions로 받아들인다)을 돌려준다.
// 이 기기에 아무것도 남기기 전에 모두 검사한다: 담긴 미션이 하나라도 잘못됐거나,
// 코스의 미션이 기기에도 파일에도 없으면 저장하지 않고 알린다.
export function parseCourseFile(data: unknown) {
  const o = (data ?? {}) as Obj;
  if (o.format !== COURSE_FORMAT || o.version !== 1)
    throw new AppError("코스 파일 형식을 알 수 없어요.");
  const course = validateCourse(o.course);
  if (
    o.missions !== undefined &&
    (!Array.isArray(o.missions) || o.missions.length > CUSTOM_LIMIT)
  )
    throw new AppError("미션 파일 형식을 알 수 없어요.");
  const bundled = ((o.missions as unknown[] | undefined) ?? []).map(
    validateMission,
  );
  const missing = course.missionIds.filter(
    (id) =>
      !missions.some((m) => m.id === id) && !bundled.some((m) => m.id === id),
  );
  if (missing.length)
    throw new AppError(
      "코스에 적힌 미션 {n}개가 이 기기에 없어요. 미션 파일을 먼저 가져와 주세요.",
      { n: missing.length },
    );
  return { course, missions: bundled };
}
function readCourses(): Course[] {
  try {
    const raw = JSON.parse(localStorage.getItem(COURSE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((c) => {
      try {
        return [validateCourse(c)];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export const courses = () => readCourses();
export function saveCourse(c: Course) {
  const list = readCourses().filter((x) => x.id !== c.id);
  if (list.length >= COURSE_LIMIT)
    throw new AppError("코스는 이 기기에 {n}개까지 둘 수 있어요.", {
      n: COURSE_LIMIT,
    });
  list.push(c);
  localStorage.setItem(COURSE_KEY, JSON.stringify(list));
  return c;
}
export function removeCourse(id: string) {
  localStorage.setItem(
    COURSE_KEY,
    JSON.stringify(readCourses().filter((x) => x.id !== id)),
  );
}
// 작품 파일·친구 검사 요청·QR에 함께 온 선생님 미션을 받아들인다.
// save가 true면 이 기기에 남기고(작품을 더할 때), 아니면 이번에 열어 보는 동안만 쓴다(친구 검사).
// 함께 온 미션 가운데 이 기기에 있는 것보다 새 판인 미션(바꿀지 교사·학생이 정한다)
export type MissionUpdate = { incoming: Mission; stored: Mission };
export function adoptMissions(
  list: unknown,
  save = true,
  updates?: MissionUpdate[],
): Mission[] {
  if (list === undefined) return [];
  if (!Array.isArray(list) || list.length > CUSTOM_LIMIT)
    throw new AppError("미션 파일 형식을 알 수 없어요.");
  const adopted: Mission[] = [];
  const stored = read();
  for (const raw of list) {
    const m = validateMission(raw);
    if (!isCustom(m.id)) continue;
    // 남길 때는 기기에 저장된 적이 없는 미션만, 잠깐 쓸 때는 목록에 없는 미션만 더한다.
    if (save) {
      const old = stored.find((x) => x.id === m.id);
      if (!old) adopted.push(saveCustomMission(m));
      else if (isNewerMission(m, old))
        updates?.push({ incoming: m, stored: old });
    } else if (!missions.some((x) => x.id === m.id)) {
      const order = missions.filter((x) => x.kind === m.kind).length + 1;
      missions.push({ ...m, order });
      adopted.push(m);
    }
  }
  return adopted;
}
