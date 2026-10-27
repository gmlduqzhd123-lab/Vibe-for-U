import { useEffect, useRef, useState } from "react";
import { APP_PREFIX } from "./model";
// 같은 작품을 여러 탭에서 열면 한 탭만 편집하고 나머지는 읽기 전용으로 둔다.
// Web Locks를 지원하지 않는 브라우저는 예전처럼 모든 탭에서 편집할 수 있다.
export type LockState = "mine" | "other";
export function useWorkLock(id: string | undefined, onRegain: () => void) {
  const [state, setState] = useState<LockState>("mine");
  const [attempt, setAttempt] = useState(0);
  const steal = useRef(false);
  const regain = useRef(onRegain);
  regain.current = onRegain;
  useEffect(() => {
    const locks =
      typeof navigator !== "undefined" ? navigator.locks : undefined;
    if (!id || !locks) {
      setState("mine");
      return;
    }
    const name = `${APP_PREFIX}work:${id}`;
    let alive = true;
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const waiting = new AbortController();
    const hold = (fromOther: boolean) => {
      if (!alive) return;
      if (fromOther) regain.current();
      setState("mine");
      return held;
    };
    const wait = () => {
      setState("other");
      // 다른 탭이 닫히거나 작품을 떠나면 이 탭이 이어받는다.
      locks
        .request(name, { signal: waiting.signal }, () => hold(true))
        .catch(() => {});
    };
    const lost = () => {
      if (alive) wait();
    };
    if (steal.current) {
      steal.current = false;
      locks.request(name, { steal: true }, () => hold(true)).catch(lost);
    } else
      locks
        .request(name, { ifAvailable: true }, (lock) =>
          lock ? hold(false) : (wait(), undefined),
        )
        .catch(lost);
    return () => {
      alive = false;
      waiting.abort();
      release();
    };
  }, [id, attempt]);
  return {
    state,
    takeOver: () => {
      steal.current = true;
      setAttempt((n) => n + 1);
    },
  };
}
// 저장·삭제를 다른 탭에 알려 목록과 읽기 전용 화면을 새로 고친다.
const CHANNEL = APP_PREFIX + "changes";
export function announceChange() {
  if (typeof BroadcastChannel === "undefined") return;
  const c = new BroadcastChannel(CHANNEL);
  c.postMessage("changed");
  c.close();
}
export function useChanges(onChange: () => void) {
  const latest = useRef(onChange);
  latest.current = onChange;
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const c = new BroadcastChannel(CHANNEL);
    c.onmessage = () => latest.current();
    return () => c.close();
  }, []);
}
