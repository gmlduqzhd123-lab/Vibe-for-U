import { missions } from "./data";
import { kinds, stageDone } from "./model";
import type { Mission, Work } from "./model";
// 미션 추천: 내가 한 것을 보고 다음에 해 볼 미션을 셋까지 고른다. 순위나 점수는 쓰지 않는다.
// 1) 하던 미션 이어서 2) 가장 최근에 끝낸 종류의 다음 미션 3) 아직 안 해 본 종류의 첫 미션
export type Suggestion = { mission: Mission; reason: string };
export function recommend(works: Work[], list: Mission[] = missions) {
  const out: Suggestion[] = [];
  const add = (mission: Mission | undefined, reason: string) => {
    if (mission && !out.some((s) => s.mission.id === mission.id))
      out.push({ mission, reason });
  };
  const state = (id: string) => {
    const mine = works.filter((w) => w.missionId === id);
    if (mine.some((w) => stageDone(w.draft).every(Boolean))) return "done";
    return mine.length ? "doing" : "new";
  };
  const byRecent = [...works].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  // 1) 가장 최근에 고친, 아직 다섯 단계를 다 기록하지 않은 미션
  add(
    list.find(
      (m) =>
        m.id ===
        byRecent.find((w) => state(w.missionId) === "doing")?.missionId,
    ),
    "하던 미션을 이어서 해요.",
  );
  // 2) 가장 최근에 끝낸 미션과 같은 종류에서, 아직 시작하지 않은 다음 미션
  const finished = byRecent.find((w) => state(w.missionId) === "done");
  const last = list.find((m) => m.id === finished?.missionId);
  if (last)
    add(
      list.find(
        (m) =>
          m.kind === last.kind && m.order > last.order && state(m.id) === "new",
      ),
      "방금 끝낸 종류의 다음 미션이에요.",
    );
  // 3) 아직 한 번도 안 해 본 종류의 첫 미션(처음이라면 퀴즈 1)
  for (const k of kinds) {
    if (out.length >= 3) break;
    if (works.some((w) => w.kind === k)) continue;
    add(
      list.find((m) => m.kind === k && m.order === 1),
      works.length ? "아직 안 해 본 종류예요." : "처음이라면 여기서 시작해요.",
    );
    if (!works.length) break;
  }
  return out.slice(0, 3);
}
