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
  };
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
}
// 작품 파일·친구 검사 요청·QR에 함께 온 선생님 미션을 받아들인다.
// save가 true면 이 기기에 남기고(작품을 더할 때), 아니면 이번에 열어 보는 동안만 쓴다(친구 검사).
export function adoptMissions(list: unknown, save = true): Mission[] {
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
      if (!stored.some((x) => x.id === m.id))
        adopted.push(saveCustomMission(m));
    } else if (!missions.some((x) => x.id === m.id)) {
      const order = missions.filter((x) => x.kind === m.kind).length + 1;
      missions.push({ ...m, order });
      adopted.push(m);
    }
  }
  return adopted;
}
