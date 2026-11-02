import type { Config, Direction } from "./model";
import {
  answerQuiz,
  cell,
  dirNames,
  initialQuiz,
  patternMatch,
  reachable,
  resetQuiz,
  ruleMatches,
  runPattern,
  shadowedRules,
} from "./engines";
// 맞춤 힌트: 자동 검사와 같은 규칙으로 설정을 실행해 보고, 실패한 까닭에 맞는 힌트를 고른다.
// AI 없이 규칙으로만 찾는다. 문장은 한국어 열쇠이며 화면에서 t()로 바꾼다.
export type Finding = {
  id: string;
  problem: string;
  hint: string;
  vars?: Record<string, string | number>;
};
const parse = (id: string) => id.split(",").map(Number) as [number, number];
export function diagnose(c: Config): Finding[] {
  const out: Finding[] = [];
  if (c.kind === "quiz") {
    let q = initialQuiz();
    for (let i = 0; i < 3; i++) q = answerQuiz(c, q, c.questions[0].correct);
    if (q.score !== c.points)
      out.push({
        id: "quiz-score-once",
        problem: "같은 정답을 여러 번 누르면 점수가 또 올라요.",
        hint: "설정의 ‘채점 규칙’을 ‘문제당 한 번 (정상 규칙)’으로 바꿔 보세요. 앱이 ‘이미 답했는지’를 기억해야 해요.",
      });
    if (resetQuiz(c, q).score !== 0)
      out.push({
        id: "quiz-reset",
        problem: "다시 시작해도 점수가 남아 있어요.",
        hint: "설정의 ‘다시 시작할 때 점수 초기화’를 켜 보세요. 처음으로 돌아갈 때 앱이 기억하던 점수도 0으로 돌아가야 해요.",
      });
  } else if (c.kind === "story") {
    const ids = new Set(c.scenes.map((s) => s.id));
    const broken = c.scenes.flatMap((s) =>
      s.choices.filter((ch) => !ids.has(ch.to)).map(() => s.title),
    );
    if (broken.length)
      out.push({
        id: "story-broken",
        problem: "없는 장면으로 가는 선택이 {n}개 있어요.",
        hint: "「{scene}」 장면의 ‘도착 장면’을 지금 있는 장면으로 골라 주세요.",
        vars: { n: broken.length, scene: broken[0] },
      });
    const seen = reachable(c);
    const lost = c.intendedEndings.filter((id) => !seen.has(id));
    if (lost.length) {
      const title = c.scenes.find((s) => s.id === lost[0])?.title ?? lost[0];
      out.push({
        id: "story-unreachable",
        problem: "목표 결말 {n}개에 갈 수 없어요.",
        hint: "장면 연결 지도에서 「{scene}」이 ‘갈 수 없음’으로 보여요. 시작에서 갈 수 있는 장면 가운데 하나의 ‘도착 장면’을 「{scene}」으로 바꿔 길을 이어 보세요.",
        vars: { n: lost.length, scene: title },
      });
    }
  } else if (c.kind === "timer") {
    if (!c.showEnd)
      out.push({
        id: "timer-end",
        problem: "0초가 돼도 끝났다는 안내가 나오지 않아요.",
        hint: "설정의 ‘0초가 되면 종료 안내 표시’를 켜 보세요.",
      });
  } else if (c.kind === "rule") {
    const hidden = shadowedRules(c);
    if (hidden.length) {
      const i = hidden[0];
      const cover = c.rules.findIndex(
        (r, k) =>
          k < i &&
          // 가려진 조건이 맞는 값에서 먼저 맞는 앞 조건
          [c.rules[i].value].some((v) => ruleMatches(r, v)),
      );
      out.push({
        id: "rule-shadowed",
        problem: "「{msg}」 문구는 앞 조건에 가려서 나올 수 없어요.",
        hint: "앱은 조건을 위에서부터 확인하고 처음 맞는 것 하나만 써요. 조건 {n}번을 조건 {k}번보다 위로 올려 보세요.",
        vars: {
          msg: c.rules[i].message,
          n: i + 1,
          k: Math.max(cover, 0) + 1,
        },
      });
    }
  } else {
    const done = runPattern(c);
    const { missing, extra } = patternMatch(c, done.painted);
    if (done.wrapped)
      out.push({
        id: "pattern-wrap",
        problem: "그림이 판 밖으로 나가 반대편에서 다시 나와요.",
        hint: "설정의 ‘판 가장자리 규칙’을 ‘가장자리에서 멈추기 (정상 규칙)’로 바꿔 보세요. 앱은 다음 칸이 판 안인지 먼저 확인해야 해요.",
      });
    else if (missing.length) {
      // 마지막 위치에서 가장 가까운 빠진 칸 쪽으로 가는 명령을 제안한다.
      const near = [...missing].sort((a, b) => {
        const [ax, ay] = parse(a);
        const [bx, by] = parse(b);
        return (
          Math.abs(ax - done.x) +
          Math.abs(ay - done.y) -
          (Math.abs(bx - done.x) + Math.abs(by - done.y))
        );
      })[0];
      const [tx, ty] = parse(near);
      const dir: Direction =
        tx !== done.x
          ? tx > done.x
            ? "right"
            : "left"
          : ty > done.y
            ? "down"
            : "up";
      const count = Math.abs(tx - done.x) + Math.abs(ty - done.y);
      out.push({
        id: "pattern-missing",
        problem: "목표인데 칠하지 않은 칸이 {n}개 있어요.",
        hint: "마지막 위치는 {at}이에요. 가장 가까운 빠진 칸 {to}까지 ‘{dir} {k}칸’ 명령을 더해 보세요.",
        vars: {
          n: missing.length,
          at: cell(done.x, done.y),
          to: near,
          dir: dirNames[dir],
          k: count,
        },
      });
    }
    if (!done.wrapped && extra.length)
      out.push({
        id: "pattern-extra",
        problem: "목표에 없는 칸을 {n}개 더 칠했어요.",
        hint: "‘한 칸씩 그리기’로 따라가며 처음 목표 밖으로 나가는 명령을 찾고, 그 명령의 칸 수나 반복 횟수를 줄여 보세요.",
        vars: { n: extra.length },
      });
  }
  return out;
}
