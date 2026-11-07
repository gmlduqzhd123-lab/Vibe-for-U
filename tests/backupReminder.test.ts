import { describe, it, expect, beforeEach } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { backupDue, markBackedUp, snoozeBackup } from "../src/backupReminder";
import { backupFiles } from "../src/storage";
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;
const DAY = 86_400_000;
const work = (daysAgo: number, now: number) => {
  const w = makeWork(missions[0]);
  w.updatedAt = new Date(now - daysAgo * DAY).toISOString();
  return w;
};
describe("백업 알림", () => {
  beforeEach(() => store.clear());
  it("바뀐 작품이 3개 이상이거나, 백업하지 않은 변경이 3일 넘으면 알린다", () => {
    const now = Date.parse("2026-11-07T09:00:00Z");
    expect(backupDue([work(0, now), work(1, now)], now).due).toBe(false);
    expect(
      backupDue([work(0, now), work(0, now), work(0, now)], now),
    ).toMatchObject({
      changed: 3,
      due: true,
    });
    expect(backupDue([work(4, now)], now)).toMatchObject({
      days: 4,
      due: true,
    });
  });
  it("백업 파일을 만들면 그 작품은 다시 세지 않고, 그 뒤에 고치면 다시 센다", () => {
    const now = Date.now();
    const a = work(5, now);
    const b = work(5, now);
    backupFiles([a, b]);
    expect(backupDue([a, b], now).changed).toBe(0);
    a.updatedAt = new Date(now + 1000).toISOString();
    expect(backupDue([a, b], now + 2000).changed).toBe(1);
  });
  it("오늘은 그만 보기를 누르면 그날은 알리지 않는다", () => {
    const now = Date.parse("2026-11-07T09:00:00Z");
    const list = [work(9, now)];
    snoozeBackup(now);
    expect(backupDue(list, now).due).toBe(false);
    expect(backupDue(list, now + DAY).due).toBe(true);
    markBackedUp(list, new Date(now + DAY).toISOString());
    expect(backupDue(list, now + DAY).due).toBe(false);
  });
});
