import { APP_PREFIX } from "./model";
import type { Work } from "./model";
// 백업 알림: 작품마다 마지막으로 백업 파일을 만든 때를 기억하고,
// 그 뒤에 바뀐 작품이 많거나 바뀐 지 며칠이 지났으면 작품 선반에서 백업을 권한다.
// (iPad Safari 등은 7일 동안 열지 않은 사이트의 저장소를 지울 수 있다.)
const KEY = `${APP_PREFIX}backups`;
const SNOOZE = `${APP_PREFIX}backup-snooze`;
export const DUE_WORKS = 3;
export const DUE_DAYS = 3;
const DAY = 86_400_000;
// 백업을 기억하면 알리는 이름(작품 선반이 다시 센다).
export const BACKUP_EVENT = "ttukttak-backup";
function read(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}
export function markBackedUp(works: Work[], at = new Date().toISOString()) {
  try {
    const all = read();
    for (const w of works) all[w.id] = at;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 기억할 수 없으면 알림이 조금 더 자주 나올 뿐이다.
  }
  if (typeof dispatchEvent === "function")
    dispatchEvent(new Event(BACKUP_EVENT));
}
const today = (now: number) => new Date(now).toISOString().slice(0, 10);
export function snoozeBackup(now = Date.now()) {
  try {
    localStorage.setItem(SNOOZE, today(now));
  } catch {
    // 저장할 수 없으면 이번 화면에서만 숨긴다.
  }
  if (typeof dispatchEvent === "function")
    dispatchEvent(new Event(BACKUP_EVENT));
}
// 마지막 백업 뒤에 바뀐 작품과, 그 가운데 가장 오래 백업하지 않은 변경이 며칠 전인지
export function backupDue(works: Work[], now = Date.now()) {
  const last = read();
  const changed = works.filter((w) => !last[w.id] || w.updatedAt > last[w.id]);
  const oldest = Math.min(
    ...changed.map((w) => new Date(w.updatedAt).getTime()),
  );
  const days = changed.length ? Math.floor((now - oldest) / DAY) : 0;
  let snoozed = false;
  try {
    snoozed = localStorage.getItem(SNOOZE) === today(now);
  } catch {
    // 읽을 수 없으면 숨기지 않는다.
  }
  return {
    changed: changed.length,
    days,
    due:
      !snoozed &&
      (changed.length >= DUE_WORKS || (changed.length > 0 && days >= DUE_DAYS)),
  };
}
