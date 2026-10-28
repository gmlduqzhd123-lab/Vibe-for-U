import { reachable } from "./engines";
import type { StoryConfig } from "./model";
// 장면을 상자로, 선택을 화살표로 그린다. 시작에서 몇 번 골라야 닿는지(깊이)로 열을 나누고,
// 시작에서 갈 수 없는 장면은 맨 오른쪽 열에 따로 모은다.
export type MapNode = {
  id: string;
  title: string;
  col: number;
  row: number;
  start: boolean;
  ending: boolean;
  intended: boolean;
  reachable: boolean;
};
export type MapEdge = {
  from: string;
  to: string;
  label: string;
  index: number;
  back: boolean;
};
export function storyLayout(c: StoryConfig) {
  const depth = new Map<string, number>([[c.start, 0]]);
  const queue = [c.start];
  while (queue.length) {
    const id = queue.shift()!;
    for (const ch of c.scenes.find((s) => s.id === id)?.choices ?? [])
      if (!depth.has(ch.to)) {
        depth.set(ch.to, depth.get(id)! + 1);
        queue.push(ch.to);
      }
  }
  const seen = reachable(c);
  const lastCol = Math.max(0, ...depth.values());
  const rows = new Map<number, number>();
  const nodes: MapNode[] = c.scenes.map((s) => {
    const col = depth.has(s.id) ? depth.get(s.id)! : lastCol + 1;
    const row = rows.get(col) ?? 0;
    rows.set(col, row + 1);
    return {
      id: s.id,
      title: s.title,
      col,
      row,
      start: s.id === c.start,
      ending: s.ending,
      intended: c.intendedEndings.includes(s.id),
      reachable: seen.has(s.id),
    };
  });
  const edges: MapEdge[] = c.scenes.flatMap((s) =>
    s.choices.map((ch, i) => ({
      from: s.id,
      to: ch.to,
      label: ch.label,
      index: i + 1,
      back:
        (nodes.find((n) => n.id === ch.to)?.col ?? 0) <=
        (nodes.find((n) => n.id === s.id)?.col ?? 0),
    })),
  );
  const missing = c.intendedEndings.filter((id) => !seen.has(id));
  return {
    nodes,
    edges,
    cols: Math.max(...nodes.map((n) => n.col)) + 1,
    rows: Math.max(...rows.values()),
    unreachable: nodes.filter((n) => !n.reachable),
    missing,
  };
}
const W = 170;
const H = 84;
const BOX_W = 132;
const BOX_H = 50;
const short = (t: string) => (t.length > 9 ? t.slice(0, 8) + "…" : t);
export function StoryMap({ config }: { config: StoryConfig }) {
  const map = storyLayout(config);
  const pos = (id: string) => {
    const n = map.nodes.find((x) => x.id === id)!;
    return { x: 16 + n.col * W, y: 16 + n.row * H };
  };
  const title = (id: string) =>
    config.scenes.find((s) => s.id === id)?.title ?? id;
  return (
    <figure className="story-map">
      <figcaption>
        <b>장면 연결 지도</b>
        <span>
          {map.unreachable.length
            ? ` · 시작에서 갈 수 없는 장면 ${map.unreachable.length}개`
            : " · 모든 장면에 갈 수 있어요"}
          {map.missing.length
            ? ` · 닿을 수 없는 목표 결말 ${map.missing.length}개`
            : ""}
        </span>
      </figcaption>
      <div className="story-map-scroll">
        <svg
          role="img"
          aria-label={`장면 ${config.scenes.length}개의 연결 지도. 아래 목록에 같은 연결이 있어요.`}
          width={32 + map.cols * W - (W - BOX_W)}
          height={32 + map.rows * H - (H - BOX_H)}
        >
          <defs>
            <marker
              id="story-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" className="story-arrow" />
            </marker>
          </defs>
          {map.edges.map((e, i) => {
            const a = pos(e.from);
            const b = pos(e.to);
            const x1 = a.x + BOX_W;
            const y1 = a.y + BOX_H / 2 + (e.index - 1) * 8 - 4;
            const d = e.back
              ? // 같은 열이나 앞쪽으로 돌아가는 길은 아래로 휘어 그린다.
                `M${a.x + BOX_W / 2} ${a.y + BOX_H} C ${a.x + BOX_W / 2} ${a.y + BOX_H + 40}, ${b.x + BOX_W / 2} ${b.y + BOX_H + 40}, ${b.x + BOX_W / 2} ${b.y + BOX_H + 2}`
              : `M${x1} ${y1} C ${x1 + 30} ${y1}, ${b.x - 30} ${b.y + BOX_H / 2}, ${b.x - 2} ${b.y + BOX_H / 2}`;
            return (
              <g key={i} className={`story-edge${e.back ? " back" : ""}`}>
                <title>{`${title(e.from)} → ‘${e.label}’ → ${title(e.to)}`}</title>
                <path d={d} markerEnd="url(#story-arrow)" />
                {!e.back ? (
                  <text x={x1 + 6} y={y1 - 3}>
                    {e.index}
                  </text>
                ) : null}
              </g>
            );
          })}
          {map.nodes.map((n) => {
            const p = pos(n.id);
            return (
              <g
                key={n.id}
                className={[
                  "story-node",
                  n.start ? "start" : "",
                  n.ending ? "ending" : "",
                  n.reachable ? "" : "unreachable",
                  n.intended && !n.reachable ? "missing" : "",
                ].join(" ")}
              >
                <title>{n.title}</title>
                <rect x={p.x} y={p.y} width={BOX_W} height={BOX_H} rx="10" />
                <text x={p.x + 10} y={p.y + 20}>
                  {short(n.title)}
                </text>
                <text x={p.x + 10} y={p.y + 38} className="story-node-tag">
                  {n.start
                    ? "시작"
                    : !n.reachable
                      ? "갈 수 없음"
                      : n.ending
                        ? n.intended
                          ? "목표 결말"
                          : "결말"
                        : "장면"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ul className="story-map-list">
        {map.edges.map((e, i) => (
          <li key={i}>
            {title(e.from)} → ‘{e.label}’ → {title(e.to)}
          </li>
        ))}
        {map.unreachable.map((n) => (
          <li key={n.id} className="story-map-warn">
            {n.title}: 시작에서 갈 수 없어요
            {n.intended ? " (목표 결말)" : ""}
          </li>
        ))}
      </ul>
    </figure>
  );
}
