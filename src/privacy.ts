import type { Config, Snapshot, Work } from "./model";
// 개인정보 감지: 작품을 파일·QR·앱 파일로 내보내기 전에, 기기 밖으로 나가면 안 될 것처럼 보이는 글을 찾는다.
// 규칙으로만 찾으므로 놓치거나 잘못 짚을 수 있다. 막지 않고 "보내기 전에 확인해요"라고 알린다.
export type PrivacyHit = { kind: string; where: string; sample: string };
const RULES: { kind: string; re: RegExp }[] = [
  {
    kind: "전화번호",
    re: /(?<!\d)(?:01[016789]|0[2-6]\d?)[-. ]?\d{3,4}[-. ]?\d{4}(?!\d)/,
  },
  { kind: "이메일 주소", re: /[\w.+-]+@[\w-]+\.[\w.-]+/ },
  { kind: "주민등록번호", re: /(?<!\d)\d{6}[- ]?[1-4]\d{6}(?!\d)/ },
  {
    kind: "집 주소",
    // "오른쪽으로 3칸" 같은 명령과 헷갈리지 않게 시·구·군 이름이 앞에 있을 때만 도로 주소로 본다.
    re: /[가-힣]+(?:시|구|군)\s[가-힣\d]+(?:로|길)\s?\d+|[가-힣]+(?:동|리)\s\d+(?:-\d+)?번지|\d+동\s?\d+호/,
  },
  {
    kind: "학교·학년·반",
    re: /[가-힣]+(?:초등학교|초교|중학교)\s?\d\s?학년\s?\d+\s?반/,
  },
  {
    kind: "실제 이름",
    // "제 이름은 ○○", "저는 ○○입니다/이에요", "○○○ 학생·어린이", "○○○(이)가 만든". 선생님·친구처럼 흔한 말은 이름으로 보지 않는다.
    re: /(?:제|내|우리\s?(?:엄마|아빠|형|누나|언니|오빠|동생|선생님))\s?이름은\s?[가-힣]{2,4}|저는\s?[가-힣]{2,4}\s?(?:입니다|이에요|예요|라고)|(?!선생님|어린이|친구들|우리들|학생들)[가-힣]{3}\s?(?:학생|어린이)(?:이|가|은|는|의|을|를)?(?![가-힣])|(?!선생님|어린이|친구들|우리들|학생들)[가-힣]{3}(?:이|가)\s?만든/,
  },
  {
    kind: "생년월일",
    re: /(?:19|20)\d{2}\s?년\s?\d{1,2}\s?월\s?\d{1,2}\s?일\s?(?:생|에\s?태어)/,
  },
  {
    kind: "메신저·SNS 아이디",
    // 이메일(@ 뒤에 점이 있는 주소)은 이메일 규칙이 맡는다.
    re: /(?:카카오|카톡|인스타|인스타그램|틱톡|디스코드|유튜브)\s?(?:아이디|ID|id|계정)?\s?[:：]?\s?@?[A-Za-z0-9_.]{4,}|(?<![\w.])@[A-Za-z0-9_.]{4,}(?!\.[A-Za-z]{2,})/,
  },
  {
    kind: "자동차 번호",
    re: /(?<![가-힣\d])\d{2,3}[가-힣]\s?\d{4}(?!\d)/,
  },
];
// 앱이 보여 주는 이름(사람이 읽을 곳)과 글을 함께 모은다.
function texts(d: Snapshot): [string, string][] {
  const out: [string, string][] = [
    ["작품 제목", d.title],
    ...Object.entries(d.promise).map(
      ([, v]) => ["만들기 약속", v] as [string, string],
    ),
    ["처음 쓴 요청문", d.originalPrompt],
    ["정리한 요청문", d.arrangedPrompt],
    ["실행 전 예상", d.prediction],
    ["작동 원리와 배운 점", d.reflection],
    ...(d.predictionNote
      ? [["예상 확인 메모", d.predictionNote] as [string, string]]
      : []),
    ...(d.pair
      ? ([
          ["짝 이름", d.pair.a],
          ["짝 이름", d.pair.b],
        ] as [string, string][])
      : []),
    ...Object.values(d.debugLog ?? {}).map(
      (v) => ["버그 탐정 일지", v] as [string, string],
    ),
    ["도움받은 내용", d.help],
    ...Object.values(d.change).map((v) => ["수정 기록", v] as [string, string]),
    ...Object.values(d.ai)
      .filter((v) => typeof v === "string")
      .map((v) => ["실제 AI 활동 기록", v] as [string, string]),
    ...d.checks.flatMap(
      (c) =>
        [
          ["검사 기록", c.label],
          ["검사 기록", c.actual],
        ] as [string, string][],
    ),
  ];
  return [...out, ...configTexts(d.config)];
}
function configTexts(c: Config): [string, string][] {
  if (c.kind === "quiz")
    return [
      ...c.questions.flatMap(
        (q) =>
          [
            ["퀴즈 문제", q.text],
            ...q.choices.map((x) => ["퀴즈 선택지", x]),
          ] as [string, string][],
      ),
      ["정답 안내", c.correctFeedback],
      ["오답 안내", c.wrongFeedback],
    ];
  if (c.kind === "story")
    return c.scenes.flatMap(
      (s) =>
        [
          ["이야기 장면", s.title],
          ["이야기 장면", s.text],
          ...s.choices.map((x) => ["이야기 선택", x.label]),
        ] as [string, string][],
    );
  if (c.kind === "timer") return [["종료 안내", c.endMessage]];
  if (c.kind === "sort")
    return [
      ["분류 특징", c.property],
      ["바구니 이름", c.otherwise],
      ...c.bins.map((b) => ["바구니 이름", b.name] as [string, string]),
      ...c.cards.map((k) => ["카드 이름", k.label] as [string, string]),
    ];
  if (c.kind === "rule")
    return [
      ["조건 문구", c.otherwise],
      ...c.rules.map((r) => ["조건 문구", r.message] as [string, string]),
      ...c.buttons.map((b) => ["버튼 이름", b.label] as [string, string]),
    ];
  return [];
}
export function scanText(where: string, text: string): PrivacyHit[] {
  const hits: PrivacyHit[] = [];
  for (const r of RULES) {
    const m = text.match(r.re);
    if (m) hits.push({ kind: r.kind, where, sample: mask(m[0]) });
  }
  return hits;
}
// 경고 창에 그대로 다시 보여 주지 않도록 가운데를 가린다.
const mask = (s: string) =>
  s.length <= 4 ? s[0] + "…" : s.slice(0, 2) + "…" + s.slice(-1);
export function scanWorks(works: Work[]): PrivacyHit[] {
  const seen = new Set<string>();
  const hits: PrivacyHit[] = [];
  for (const w of works)
    for (const d of [w.draft, ...w.versions.map((v) => v.data)])
      for (const [where, text] of texts(d))
        for (const h of scanText(where, text ?? "")) {
          const key = `${h.kind}|${h.where}|${h.sample}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push(h);
          }
        }
  return hits;
}
