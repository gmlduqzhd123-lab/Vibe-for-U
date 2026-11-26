import type {
  Config,
  Kind,
  Mission,
  PatternConfig,
  LoopConfig,
  ListConfig,
  RuleConfig,
  SortConfig,
} from "./model";
import { kinds } from "./model";
export const quiz: Config = {
  kind: "quiz",
  scoring: "once",
  points: 1,
  resetScore: true,
  correctFeedback: "정답이에요! 잘 생각했어요.",
  wrongFeedback: "괜찮아요. 다음 문제도 도전해 봐요.",
  questions: [
    {
      id: "q1",
      text: "식물이 자라는 데 필요한 것은?",
      choices: ["햇빛과 물", "리모컨", "장난감"],
      correct: 0,
    },
    {
      id: "q2",
      text: "친구와 함께 앱을 만들 때 좋은 방법은?",
      choices: ["혼자만 누르기", "생각을 나누고 번갈아 하기", "검사하지 않기"],
      correct: 1,
    },
  ],
};
export const story: Config = {
  kind: "story",
  start: "start",
  intendedEndings: ["tree", "sun"],
  scenes: [
    {
      id: "start",
      title: "숲속의 작은 갈림길",
      text: "도서관에서 빌린 지도를 따라 숲에 도착했어요. 두 갈래 길 중 어디로 갈까요?",
      ending: false,
      choices: [
        { label: "커다란 나무 쪽으로", to: "tree" },
        { label: "햇빛이 비치는 쪽으로", to: "sun" },
      ],
    },
    {
      id: "tree",
      title: "나무 도서관",
      text: "나뭇가지 사이에 작은 도서관이 있었어요. 다람쥐와 책을 읽으며 하루를 보냈답니다.",
      ending: true,
      choices: [],
    },
    {
      id: "sun",
      title: "햇살 정원",
      text: "꽃이 가득한 정원을 찾았어요. 친구들과 씨앗을 심고 다음 만남을 약속했답니다.",
      ending: true,
      choices: [],
    },
  ],
};
export const timer: Config = {
  kind: "timer",
  seconds: 30,
  showEnd: true,
  endMessage: "약속한 시간이 끝났어요! 잠깐 쉬어 가요.",
};
const stairs = (n: number) =>
  Array.from({ length: n }, (_, i) => [`${i},${i}`, `${i + 1},${i}`])
    .flat()
    .concat(`${n},${n}`);
// 패턴 미션은 미션마다 명령과 목표 모양이 달라 시작 설정을 따로 둔다.
const patternStarters: PatternConfig[] = [
  {
    kind: "pattern",
    size: 5,
    repeat: 1,
    edge: "stop",
    commands: [
      { dir: "right", count: 3 },
      { dir: "down", count: 3 },
    ],
    target: ["0,0", "1,0", "2,0", "3,0", "3,1", "3,2", "3,3"],
  },
  {
    kind: "pattern",
    size: 5,
    repeat: 3,
    edge: "stop",
    commands: [
      { dir: "right", count: 1 },
      { dir: "down", count: 1 },
    ],
    target: stairs(3),
  },
  {
    kind: "pattern",
    size: 5,
    repeat: 6,
    edge: "wrap",
    commands: [
      { dir: "right", count: 1 },
      { dir: "down", count: 1 },
    ],
    target: stairs(4),
  },
  {
    kind: "pattern",
    size: 5,
    repeat: 1,
    edge: "stop",
    commands: [
      { dir: "right", count: 3 },
      { dir: "down", count: 3 },
      { dir: "left", count: 3 },
    ],
    target: [
      "0,0",
      "1,0",
      "2,0",
      "3,0",
      "3,1",
      "3,2",
      "3,3",
      "2,3",
      "1,3",
      "0,3",
      "0,2",
      "0,1",
    ],
  },
];
// 5×5 판의 테두리 16칸
const ring = Array.from({ length: 16 }, (_, i) =>
  i < 5
    ? `${i},0`
    : i < 9
      ? `4,${i - 4}`
      : i < 13
        ? `${12 - i},4`
        : `0,${16 - i}`,
);
patternStarters.push({
  kind: "pattern",
  size: 5,
  repeat: 1,
  edge: "stop",
  turn: "none",
  commands: [{ dir: "right", count: 15 }],
  target: ring,
});
export const pattern: Config = patternStarters[0];
// 만약 규칙 앱의 시작 설정: 칭찬 스티커를 모으면 문구가 바뀐다.
const ruleBase: RuleConfig = {
  kind: "rule",
  variable: "스티커",
  start: 0,
  floor: 0,
  buttons: [
    { label: "+1 스티커 붙이기", change: 1 },
    { label: "−1 스티커 떼기", change: -1 },
  ],
  rules: [{ when: "gte", value: 5, message: "우와, 스티커 5개를 모았어요!" }],
  otherwise: "스티커를 모아 볼까요?",
};
const ruleStarters: RuleConfig[] = [
  ruleBase,
  ruleBase,
  // 학습용 오류: 넓은 조건(3 이상)이 먼저 있어 '6 이상' 문구가 나오지 않는다.
  {
    ...ruleBase,
    rules: [
      { when: "gte", value: 3, message: "좋아요, 3개 넘게 모았어요!" },
      { when: "gte", value: 6, message: "최고예요! 6개를 모았어요!" },
    ],
  },
  {
    ...ruleBase,
    variable: "걸음",
    buttons: [
      { label: "+1 한 걸음", change: 1 },
      { label: "+2 두 걸음", change: 2 },
      { label: "−1 뒤로", change: -1 },
    ],
    rules: [
      { when: "eq", value: 10, message: "딱 10걸음, 보물 도착!" },
      { when: "lte", value: 3, message: "이제 막 출발했어요." },
    ],
    otherwise: "보물을 향해 걷는 중이에요.",
  },
];
// 분류 앱의 시작 설정: 카드를 특징 값으로 바구니에 나눠 담는다.
const sortStarters: SortConfig[] = [
  {
    kind: "sort",
    property: "다리 수",
    cards: [
      { label: "고양이", value: 4, expect: "네 발 동물" },
      { label: "닭", value: 2, expect: "두 발 동물" },
      { label: "강아지", value: 4, expect: "네 발 동물" },
      { label: "뱀", value: 0, expect: "그 밖의 동물" },
      { label: "참새", value: 2, expect: "두 발 동물" },
    ],
    bins: [
      { name: "네 발 동물", when: "eq", value: 4 },
      { name: "두 발 동물", when: "eq", value: 2 },
    ],
    otherwise: "그 밖의 동물",
  },
  {
    kind: "sort",
    property: "키(cm)",
    cards: [
      { label: "민트", value: 119, expect: "다음에 타요" },
      { label: "하늘", value: 120, expect: "탈 수 있어요" },
      { label: "바다", value: 135, expect: "탈 수 있어요" },
      { label: "별이", value: 104, expect: "다음에 타요" },
    ],
    bins: [{ name: "탈 수 있어요", when: "gte", value: 120 }],
    otherwise: "다음에 타요",
  },
  // 학습용 오류: 넓은 조건(2 이상)이 먼저 있어 '6 이상' 바구니에 카드가 들어가지 않는다.
  {
    kind: "sort",
    property: "다리 수",
    cards: [
      { label: "닭", value: 2, expect: "다리가 있어요" },
      { label: "개미", value: 6, expect: "다리가 많아요" },
      { label: "고양이", value: 4, expect: "다리가 있어요" },
      { label: "거미", value: 8, expect: "다리가 많아요" },
      { label: "뱀", value: 0, expect: "다리가 없어요" },
    ],
    bins: [
      { name: "다리가 있어요", when: "gte", value: 2 },
      { name: "다리가 많아요", when: "gte", value: 6 },
    ],
    otherwise: "다리가 없어요",
  },
  {
    kind: "sort",
    property: "무게(g)",
    cards: [
      { label: "연필", value: 10, expect: "가벼워요" },
      { label: "책", value: 500, expect: "보통이에요" },
      { label: "수박", value: 3000, expect: "무거워요" },
      { label: "지우개", value: 20, expect: "가벼워요" },
      { label: "물병", value: 1000, expect: "무거워요" },
    ],
    bins: [
      { name: "무거워요", when: "gte", value: 1000 },
      { name: "가벼워요", when: "lte", value: 100 },
    ],
    otherwise: "보통이에요",
  },
  // 그리고: 다리가 6개이면서 날개도 있어야 '나는 곤충'이다.
  {
    kind: "sort",
    property: "다리 수",
    property2: "날개 수",
    cards: [
      { label: "나비", value: 6, value2: 4, expect: "나는 곤충" },
      { label: "개미", value: 6, value2: 0, expect: "걷는 곤충" },
      { label: "벌", value: 6, value2: 4, expect: "나는 곤충" },
      { label: "참새", value: 2, value2: 2, expect: "곤충이 아니에요" },
      { label: "거미", value: 8, value2: 0, expect: "곤충이 아니에요" },
    ],
    bins: [
      {
        name: "나는 곤충",
        when: "eq",
        value: 6,
        second: { op: "and", when: "gte", value: 1 },
      },
      { name: "걷는 곤충", when: "eq", value: 6 },
    ],
    otherwise: "곤충이 아니에요",
  },
  // 또는: 너무 덥거나 미세먼지가 많으면 실내에서 체육을 한다.
  {
    kind: "sort",
    property: "기온(도)",
    property2: "미세먼지",
    cards: [
      { label: "월요일", value: 25, value2: 30, expect: "운동장 체육" },
      { label: "화요일", value: 34, value2: 20, expect: "실내 체육" },
      { label: "수요일", value: 28, value2: 95, expect: "실내 체육" },
      { label: "목요일", value: 35, value2: 90, expect: "실내 체육" },
      { label: "금요일", value: 20, value2: 79, expect: "운동장 체육" },
    ],
    bins: [
      {
        name: "실내 체육",
        when: "gte",
        value: 33,
        second: { op: "or", when: "gte", value: 80 },
      },
    ],
    otherwise: "운동장 체육",
  },
];
const specifications: Record<
  Kind,
  {
    title: string;
    goal: string;
    prediction: string;
    tests: { label: string; expected: string }[];
    task: string;
    hints: string[];
    closing: string;
  }[]
> = {
  // 분류 앱·반복 계산기의 미션은 아래에서 채운다(시작 설정과 나란히 읽히도록).
  sort: [],
  loop: [],
  list: [],
  quiz: [
    {
      title: "선택이 정답을 만났을 때",
      goal: "내가 고른 답에 맞는 안내를 보여 주는 퀴즈를 만들어요.",
      prediction: "정답과 다른 답을 눌렀을 때 각각 어떤 안내가 나올까요?",
      tests: [
        { label: "정답 선택", expected: "정답 안내와 1점이 나온다." },
        {
          label: "오답 선택",
          expected: "오답 안내가 나오고 점수는 늘지 않는다.",
        },
      ],
      task: "정답·오답 안내를 친구가 이해하기 쉬운 문장으로 바꿔 보세요.",
      hints: [
        "첫 문제에서 답 하나를 골라 보세요.",
        "정답 번호와 선택한 번호를 비교해요.",
        "설정에서 정답 안내와 오답 안내를 각각 바꿔 보세요.",
      ],
      closing: "답을 고르는 행동이 어떤 조건과 만났나요?",
    },
    {
      title: "점수가 모이면 결과가 돼요",
      goal: "문제의 점수를 모아 마지막 결과를 보여 줘요.",
      prediction: "두 문제를 모두 맞히면 몇 점이 될까요?",
      tests: [
        {
          label: "점수 누적",
          expected: "맞힌 문제 수 × 문제당 점수가 나온다.",
        },
        {
          label: "마지막 문제",
          expected: "마지막 문제 다음에는 최종 결과가 나온다.",
        },
      ],
      task: "문제당 점수를 2로 바꾸고 두 문제의 최종 점수를 예상해 보세요.",
      hints: [
        "현재 점수와 문제 번호를 찾아보세요.",
        "다음 문제를 누를 때 점수를 지우면 안 돼요.",
        "문제 수 2 × 문제당 점수 2 = 최종 4점을 확인해요.",
      ],
      closing: "문제 번호와 점수는 왜 따로 기억할까요?",
    },
    {
      title: "어라? 점수가 또 올라가요!",
      goal: "정답을 여러 번 눌러 생기는 중복 점수를 찾아 고쳐요.",
      prediction:
        "같은 정답을 세 번 누르면 몇 점이 될까요? 몇 점이어야 할까요?",
      tests: [
        {
          label: "같은 정답 세 번 누르기",
          expected: "한 문제의 점수는 한 번만 반영된다.",
        },
        { label: "수정 후 재검사", expected: "정답을 세 번 눌러도 1점이다." },
      ],
      task: "채점 규칙을 「문제당 한 번」으로 바꾸고 같은 검사를 다시 해 보세요.",
      hints: [
        "첫 문제의 정답을 여러 번 눌러 보세요.",
        "앱은 이미 답했는지를 기억할 수 있어요.",
        "채점 규칙을 「문제당 한 번」으로 바꾸고 다시 실행해요.",
      ],
      closing: "앱이 어떤 값을 기억해야 중복 점수를 막을 수 있나요?",
    },
    {
      title: "다시 시작하면 깨끗하게",
      goal: "점수와 문제 번호를 함께 처음으로 되돌려요.",
      prediction: "두 문제를 풀고 다시 시작하면 어떤 값이 바뀌어야 하나요?",
      tests: [
        {
          label: "다시 시작",
          expected: "점수는 0점, 문제 번호는 1, 답한 상태는 비어 있다.",
        },
      ],
      task: "다시 시작 규칙에서 점수 초기화를 켠 뒤 처음 상태를 확인하세요.",
      hints: [
        "문제를 풀고 다시 시작을 눌러 보세요.",
        "점수·문제 번호·응답 여부 세 값을 비교해요.",
        "설정의 「다시 시작할 때 점수 초기화」를 켜 보세요.",
      ],
      closing: "화면만 처음으로 돌아가면 충분할까요?",
    },
  ],
  story: [
    {
      title: "내 선택이 길을 만들어요",
      goal: "선택지와 다음 장면의 연결을 이해해요.",
      prediction: "나무 쪽을 고르면 어떤 장면이 나올까요?",
      tests: [
        {
          label: "첫 선택",
          expected: "나무 쪽 선택은 나무 도서관으로 이동한다.",
        },
        { label: "처음으로", expected: "처음 장면으로 돌아온다." },
      ],
      task: "선택지 이름을 바꾸고 연결된 장면과 잘 어울리는지 검사하세요.",
      hints: [
        "첫 선택을 눌러 다음 장면을 읽어요.",
        "선택에는 다음 장면의 이름표가 붙어 있어요.",
        "장면 연결 설정에서 선택지와 도착 장면을 비교해요.",
      ],
      closing: "선택지 이름만 바꾸면 도착 장면도 바뀌나요?",
    },
    {
      title: "두 갈래, 두 가지 결말",
      goal: "서로 다른 선택으로 서로 다른 결말을 만들어요.",
      prediction: "두 번째 길에서도 새로운 결말을 만날 수 있나요?",
      tests: [
        {
          label: "결말 도달",
          expected: "나무 도서관과 햇살 정원에 모두 도달할 수 있다.",
        },
      ],
      task: "각 결말의 문장을 바꾸고 두 길을 모두 걸어 보세요.",
      hints: [
        "첫 길의 결말을 본 뒤 처음으로 돌아가요.",
        "두 번째 길도 골라 보세요.",
        "서로 다른 결말의 제목과 내용을 비교해요.",
      ],
      closing:
        "결말을 추가하는 것과 갈 수 있는 길을 만드는 것은 어떻게 다를까요?",
    },
    {
      title: "길을 잘못 들었나 봐요",
      goal: "의도와 다르게 연결된 길을 찾아 수정해요.",
      prediction:
        "햇빛 쪽을 눌렀는데 나무 도서관이 나온다면 어떤 연결을 바꿀까요?",
      tests: [
        {
          label: "경로 확인",
          expected: "햇빛 쪽 선택은 햇살 정원으로 이동한다.",
        },
        {
          label: "막힌 결말 확인",
          expected: "의도한 모든 결말에 도달할 수 있다.",
        },
      ],
      task: "햇빛 쪽 선택이 햇살 정원에 연결되도록 수정하세요.",
      hints: [
        "두 선택지를 각각 실행해 보세요.",
        "선택지 문장보다 도착 장면 설정을 살펴봐요.",
        "두 번째 선택의 도착 장면을 햇살 정원으로 바꿔요.",
      ],
      closing: "장면이 존재하는데도 갈 수 없었던 이유는 무엇인가요?",
    },
    {
      title: "친구의 한마디로 더 좋은 이야기",
      goal: "친구의 관찰을 듣고 헷갈리는 안내를 개선해요.",
      prediction: "친구는 선택지를 읽고 다음 장면을 예상할 수 있을까요?",
      tests: [
        {
          label: "친구 사용 의견",
          expected: "친구가 직접 해 보고 이해된 점과 헷갈린 점을 기록한다.",
        },
      ],
      task: "친구 의견을 검사 카드에 남기고 선택지나 설명을 한 가지 개선하세요.",
      hints: [
        "운전자와 관찰자 역할을 정해요.",
        "친구가 고르기 전에 다음 장면을 물어봐요.",
        "관찰한 사실과 고치고 싶은 점을 나누어 기록해요.",
      ],
      closing: "친구 의견 중 무엇을 반영했고, 왜 그렇게 했나요?",
    },
  ],
  timer: [
    {
      title: "시간이 줄어들기 시작해요",
      goal: "시작 행동과 남은 시간의 관계를 알아봐요.",
      prediction: "시작 버튼을 여러 번 누르면 시간이 더 빨리 줄어들까요?",
      tests: [
        {
          label: "연속 시작",
          expected: "시작을 여러 번 눌러도 하나의 타이머만 실행된다.",
        },
      ],
      task: "시간을 10초로 바꾸고 시작 전후 값을 관찰하세요.",
      hints: [
        "처음 남은 시간을 적어 보세요.",
        "시작 버튼을 연속으로 눌러요.",
        "시간은 시작 시각과 지금 시각의 차이로 계산해요.",
      ],
      closing: "남은 시간은 어떤 행동 뒤에 달라지나요?",
    },
    {
      title: "잠깐 멈췄다가 이어 가요",
      goal: "일시정지와 재개에서 남은 시간을 유지해요.",
      prediction: "멈춘 뒤 기다렸다가 재개하면 어느 시간부터 줄어들까요?",
      tests: [
        { label: "일시정지", expected: "멈춘 동안 남은 시간이 유지된다." },
        { label: "재개", expected: "멈춘 지점부터 다시 줄어든다." },
      ],
      task: "친구와 번갈아 시작·멈춤·재개를 하며 남은 시간을 기록하세요.",
      hints: [
        "시작한 다음 일시정지를 눌러요.",
        "멈춘 시간을 적고 잠시 기다려요.",
        "재개 뒤 숫자가 처음으로 돌아가지 않는지 봐요.",
      ],
      closing: "일시정지와 초기화의 차이는 무엇인가요?",
    },
    {
      title: "0초가 되면 알려 줘요",
      goal: "종료 조건과 안내를 검사하고 수정해요.",
      prediction: "0초에 도달했을 때 어떤 안내가 나와야 할까요?",
      tests: [
        { label: "종료 안내", expected: "0초에서 안내가 한 번 나온다." },
        { label: "시간 하한", expected: "남은 시간은 0보다 작아지지 않는다." },
      ],
      task: "종료 안내 표시를 켜고 시간을 2초로 설정해 실제 종료를 확인하세요.",
      hints: [
        "2초로 설정하면 금방 확인할 수 있어요.",
        "0초인데 조용하다면 종료 안내 설정을 살펴봐요.",
        "종료 안내를 켜고 초기화한 뒤 다시 실행해요.",
      ],
      closing: "종료 조건과 종료 안내는 어떻게 연결되나요?",
    },
    {
      title: "몇 번이고 다시 시작",
      goal: "초기화하고 반복 사용해도 같은 규칙이 적용되는지 검사해요.",
      prediction: "실행 중 초기화하면 남은 시간과 실행 상태는 어떻게 될까요?",
      tests: [
        { label: "초기화", expected: "설정한 시간으로 돌아와 멈춘다." },
        {
          label: "반복 실행",
          expected: "다시 시작해도 종료 안내는 실행마다 한 번이다.",
        },
      ],
      task: "초기화 전후를 비교하고 다른 화면을 다녀온 뒤 정지 상태를 확인하세요.",
      hints: [
        "시작한 뒤 초기화를 눌러요.",
        "설정 시간으로 돌아왔는지 확인해요.",
        "다른 화면으로 갔다가 돌아오면 멈춘 상태로 시작해요.",
      ],
      closing: "기록을 저장할 때 실행 중인 시계까지 계속 돌아가야 할까요?",
    },
  ],
  pattern: [
    {
      title: "명령은 차례대로 움직여요",
      goal: "명령 순서대로 칸을 칠해 모양을 그려요.",
      prediction: "오른쪽 3칸, 아래 3칸 명령이면 어떤 모양이 될까요?",
      tests: [
        {
          label: "명령 순서",
          expected: "오른쪽으로 3칸 칠한 뒤 아래로 3칸 칠해 ㄱ 모양이 된다.",
        },
        { label: "처음으로", expected: "빈 판의 첫 칸에서 다시 시작한다." },
      ],
      task: "두 명령의 순서를 바꾸면 모양이 어떻게 달라질지 예상하고 실행해 보세요.",
      hints: [
        "한 칸씩 그리기로 첫 명령이 끝나는 곳을 봐요.",
        "명령은 위에서부터 차례대로 실행돼요.",
        "명령 1과 명령 2의 방향을 서로 바꿔 보세요.",
      ],
      closing: "같은 명령도 순서가 바뀌면 왜 다른 모양이 될까요?",
    },
    {
      title: "반복하면 계단이 돼요",
      goal: "명령 묶음을 반복해 같은 무늬를 이어 그려요.",
      prediction: "오른쪽 1칸·아래 1칸을 3번 반복하면 칸이 몇 개 칠해질까요?",
      tests: [
        {
          label: "반복 횟수",
          expected: "명령 묶음이 3번 실행되어 계단 모양이 된다.",
        },
        { label: "칠한 칸 수", expected: "첫 칸을 포함해 7칸이 칠해진다." },
      ],
      task: "반복을 4번으로 바꾸기 전에 칠해질 칸 수를 예상하고, 목표 모양에도 계단 한 칸을 더해 보세요.",
      hints: [
        "한 번 반복할 때 몇 칸이 칠해지는지 세어 봐요.",
        "첫 칸은 처음부터 칠해져 있어요.",
        "칠한 칸 = 1 + 반복 횟수 × 2예요.",
      ],
      closing:
        "같은 명령을 여러 번 적는 것과 반복을 쓰는 것은 무엇이 다를까요?",
    },
    {
      title: "어라? 그림이 반대편에서 나와요!",
      goal: "판 끝에서 반대편으로 넘어가는 이동을 찾아 고쳐요.",
      prediction: "계단이 판 끝에 닿은 뒤에도 명령이 남으면 어떻게 될까요?",
      tests: [
        {
          label: "가장자리 확인",
          expected: "판 끝에서 멈추고 반대편 칸을 칠하지 않는다.",
        },
        {
          label: "수정 후 재검사",
          expected: "목표 계단 9칸과 같은 모양이 된다.",
        },
      ],
      task: "가장자리 규칙을 「가장자리에서 멈추기」로 바꾸고 같은 그리기를 다시 검사하세요.",
      hints: [
        "한 칸씩 그리기로 계단 끝을 지켜봐요.",
        "(4,4) 다음 이동이 어디로 가는지 확인해요.",
        "설정의 판 가장자리 규칙을 「멈추기」로 바꿔요.",
      ],
      closing: "판 밖으로 나가는 순간 앱은 무엇을 확인해야 할까요?",
    },
    {
      title: "한 칸씩 따라가며 네모 완성",
      goal: "한 칸씩 실행하며 위치를 기록하고 빠진 명령을 찾아요.",
      prediction: "세 명령만으로 네모가 닫힐까요? 마지막 위치는 어디일까요?",
      tests: [
        {
          label: "한 칸씩 위치",
          expected: "명령마다 도착한 위치를 기록할 수 있다.",
        },
        {
          label: "네모 완성",
          expected: "4×4 네모 둘레 12칸이 모두 칠해진다.",
        },
      ],
      task: "한 칸씩 그리기로 위치를 기록하고, 빠진 명령을 더해 네모를 완성하세요.",
      hints: [
        "명령이 하나 끝날 때마다 현재 위치를 적어요.",
        "마지막 위치에서 첫 칸까지 몇 칸 남았나요?",
        "위쪽으로 2칸 가는 명령을 추가해 보세요.",
      ],
      closing: "한 칸씩 실행하면 어떤 점을 더 잘 찾을 수 있나요?",
    },
    {
      title: "막히면 돌아서 테두리 그리기",
      goal: "‘만약 막히면 오른쪽으로 돌기’ 조건으로 명령 하나만 써서 테두리를 그려요.",
      prediction: "오른쪽 15칸 명령 하나로 판 테두리를 모두 칠할 수 있을까요?",
      tests: [
        {
          label: "조건 없이 실행",
          expected: "판 끝에서 막혀 윗줄 5칸만 칠해진다.",
        },
        {
          label: "조건 넣고 재검사",
          expected: "막힐 때마다 오른쪽으로 돌아 테두리 16칸이 칠해진다.",
        },
      ],
      task: "조건 규칙을 「오른쪽으로 돌아서 계속 가기」로 바꾸고 같은 명령으로 다시 그려 보세요.",
      hints: [
        "조건 없이 그리면 몇 칸에서 멈추는지 세어 봐요.",
        "판 끝은 ‘막힌 칸’이에요. 막히면 어떻게 할지 정할 수 있어요.",
        "설정의 조건 규칙을 「오른쪽으로 돌아서 계속 가기」로 바꿔요.",
      ],
      closing:
        "‘만약 ~이면 ~한다’ 조건이 없다면 같은 테두리를 그리는 데 명령이 몇 개 필요할까요?",
    },
  ],
  rule: [
    {
      title: "만약 5개를 모으면",
      goal: "버튼으로 스티커 수를 바꾸고, 5개가 되면 축하 문구가 나오게 해요.",
      prediction:
        "+1을 몇 번 눌러야 축하 문구가 나올까요? 4번 눌렀을 때는 무엇이 나올까요?",
      tests: [
        {
          label: "5개가 되면",
          expected: "+1을 다섯 번 누르면 축하 문구가 나온다.",
        },
        {
          label: "처음으로",
          expected: "처음으로를 누르면 스티커 0개, 처음 문구로 돌아간다.",
        },
      ],
      task: "‘만약 스티커가 5 이상이면’ 조건의 문구를 우리 반에 맞게 바꾸고 다시 확인하세요.",
      hints: [
        "앱이 기억하는 값은 ‘스티커’ 수예요.",
        "조건은 ‘5 이상’이라서 5일 때도 맞아요.",
        "4일 때는 어떤 조건에도 맞지 않아 ‘그 밖에’ 문구가 나와요.",
      ],
      closing:
        "‘만약 ~이면’ 조건이 없다면 앱은 언제 축하해야 하는지 알 수 있을까요?",
    },
    {
      title: "0 아래로는 안 돼요",
      goal: "−1 버튼을 여러 번 눌러도 스티커가 0보다 작아지지 않는지 확인해요.",
      prediction: "0개일 때 −1을 누르면 몇 개가 될까요?",
      tests: [
        {
          label: "0에서 빼기",
          expected: "0개일 때 −1을 눌러도 0개로 남는다.",
        },
        {
          label: "다시 모으기",
          expected: "빼다가 다시 +1을 누르면 1개부터 늘어난다.",
        },
      ],
      task: "‘가장 작은 값’ 설정을 지워 보고 무엇이 달라지는지 비교한 뒤 다시 0으로 정하세요.",
      hints: [
        "설정에서 ‘가장 작은 값’을 찾아요.",
        "가장 작은 값이 없으면 −1, −2처럼 내려갈 수 있어요.",
        "스티커 수는 0보다 작을 수 없으니 0을 가장 작은 값으로 둬요.",
      ],
      closing:
        "앱이 기억하는 값에 ‘여기보다 작아지면 안 돼’ 같은 약속이 필요한 까닭은 무엇일까요?",
    },
    {
      title: "어라? 최고 문구가 안 나와요!",
      goal: "6개를 모아도 ‘최고예요!’가 나오지 않는 까닭을 찾아 조건의 순서를 고쳐요.",
      prediction:
        "스티커 6개가 되면 어떤 문구가 나와야 할까요? 실제로는 무엇이 나올까요?",
      tests: [
        {
          label: "6개가 되면",
          expected: "6개가 되면 ‘최고예요!’ 문구가 나온다.",
        },
        {
          label: "3개가 되면",
          expected: "3~5개일 때는 ‘좋아요’ 문구가 나온다.",
        },
      ],
      task: "조건은 위에서부터 차례로 확인해요. 조건의 순서를 바꿔 6 이상을 먼저 확인하게 하세요.",
      hints: [
        "6은 ‘3 이상’에도 맞고 ‘6 이상’에도 맞아요.",
        "앱은 위에서부터 처음 맞는 조건 하나만 써요.",
        "‘6 이상’ 조건을 위로 올려 보세요.",
      ],
      closing:
        "여러 조건이 함께 맞을 때 앱이 어떤 순서로 확인하는지 설명해 보세요.",
    },
    {
      title: "딱 맞을 때만",
      goal: "걸음 수가 딱 10일 때만 보물 문구가 나오게 하고, ‘같으면’과 ‘이상’의 차이를 확인해요.",
      prediction: "+2로 9에서 11이 되면 보물 문구가 나올까요?",
      tests: [
        {
          label: "딱 10걸음",
          expected: "걸음이 정확히 10일 때만 보물 문구가 나온다.",
        },
        {
          label: "10을 지나치면",
          expected: "11이 되면 보물 문구 대신 ‘걷는 중’ 문구가 나온다.",
        },
      ],
      task: "조건을 ‘10과 같으면’에서 ‘10 이상’으로 바꿔 보고 결과를 비교한 뒤, 원하는 쪽을 골라 이유를 적으세요.",
      hints: [
        "‘같으면’은 그 값일 때만 맞아요.",
        "9에서 +2를 누르면 10을 건너뛰어요.",
        "‘이상’으로 바꾸면 11에서도 맞아요.",
      ],
      closing:
        "‘같으면’과 ‘이상’ 가운데 보물 찾기 놀이에 더 알맞은 조건은 무엇이고, 왜 그런가요?",
    },
  ],
};
specifications.sort.push(
  {
    title: "다리 수로 나누기",
    goal: "동물 카드를 다리 수에 따라 알맞은 바구니에 나눠 담아요.",
    prediction:
      "뱀 카드는 어느 바구니에 들어갈까요? 어떤 바구니 조건에도 맞지 않으면 어떻게 될까요?",
    tests: [
      {
        label: "모두 넣기",
        expected:
          "고양이·강아지는 네 발, 닭·참새는 두 발, 뱀은 그 밖의 동물에 들어간다.",
      },
      {
        label: "처음으로",
        expected: "처음으로를 누르면 바구니가 비고 첫 카드부터 다시 넣는다.",
      },
    ],
    task: "여섯 발 동물(개미) 카드와 그 바구니를 더하고 다시 넣어 확인하세요.",
    hints: [
      "앱은 카드의 ‘다리 수’ 값만 보고 바구니를 골라요.",
      "‘4와 같으면’은 딱 4일 때만 맞아요.",
      "어떤 조건에도 맞지 않는 카드는 나머지 바구니로 가요.",
    ],
    closing:
      "바구니 조건이 없다면 앱은 카드를 어디에 넣어야 할지 알 수 있을까요?",
  },
  {
    title: "딱 120cm도 탈 수 있어요",
    goal: "놀이기구 키 기준에 딱 맞는 친구가 어느 쪽으로 가는지 확인해요.",
    prediction: "키가 딱 120cm인 하늘이는 어느 바구니에 들어갈까요?",
    tests: [
      {
        label: "기준 값 그대로",
        expected: "120cm인 하늘이는 ‘탈 수 있어요’에 들어간다.",
      },
      {
        label: "기준보다 1 작게",
        expected: "119cm인 민트는 ‘다음에 타요’에 들어간다.",
      },
    ],
    task: "조건을 ‘120 이상’에서 ‘121 이상’으로 바꿔 보고 누가 달라지는지 확인한 뒤 원래대로 돌려 이유를 적으세요.",
    hints: [
      "‘이상’은 그 값도 포함해요.",
      "기준 값과 똑같은 카드를 꼭 하나 넣어 시험해 봐요.",
      "121 이상으로 바꾸면 120인 카드는 조건에 맞지 않아요.",
    ],
    closing: "‘이상’과 ‘보다 크면’은 기준 값에서 어떻게 다를까요?",
  },
  {
    title: "다리가 많아요 바구니가 비어 있어요",
    goal: "개미와 거미가 ‘다리가 많아요’에 들어가도록 바구니 순서를 고쳐요.",
    prediction: "개미(다리 6개)는 지금 어느 바구니에 들어갈까요?",
    tests: [
      {
        label: "많은 다리",
        expected: "개미·거미가 ‘다리가 많아요’에 들어간다.",
      },
      {
        label: "보통 다리",
        expected: "닭·고양이는 ‘다리가 있어요’에 그대로 들어간다.",
      },
    ],
    task: "바구니 순서를 바꿔 좁은 조건을 먼저 확인하게 하고 다시 넣어 보세요.",
    hints: [
      "개미의 다리 6개는 ‘2 이상’에도 맞아요.",
      "앱은 위에서부터 처음 맞는 바구니 하나에만 넣어요.",
      "‘6 이상’ 바구니를 ‘2 이상’보다 위로 올려요.",
    ],
    closing:
      "넓은 조건과 좁은 조건이 함께 있을 때 어느 것을 먼저 확인해야 할까요?",
  },
  {
    title: "보통은 나머지 바구니로",
    goal: "가벼운 것과 무거운 것만 조건으로 정하고 나머지는 ‘보통이에요’로 보내요.",
    prediction: "500g인 책은 어느 바구니에 들어갈까요? 딱 1000g인 물병은요?",
    tests: [
      {
        label: "가운데 무게",
        expected: "책은 어떤 조건에도 맞지 않아 ‘보통이에요’에 들어간다.",
      },
      {
        label: "양 끝",
        expected: "물병·수박은 무거워요, 연필·지우개는 가벼워요에 들어간다.",
      },
    ],
    task: "나머지 바구니 이름을 바꿔 보고, 가벼운 기준을 200g으로 바꿔 누가 달라지는지 확인하세요.",
    hints: [
      "나머지 바구니는 조건이 없어요. 위의 바구니에 모두 맞지 않을 때 써요.",
      "‘100 이하’는 100g도 포함해요.",
      "기준 값을 바꾸면 그 근처 카드부터 확인해 봐요.",
    ],
    closing: "모든 경우를 조건으로 적지 않아도 되는 까닭은 무엇일까요?",
  },
  {
    title: "날개도 있어야 나는 곤충",
    goal: "두 가지 특징을 ‘그리고’로 이어 다리가 6개이면서 날개도 있는 곤충만 골라요.",
    prediction: "다리는 6개인데 날개가 없는 개미는 어느 바구니에 들어갈까요?",
    tests: [
      {
        label: "둘 다 맞을 때",
        expected: "나비·벌은 두 조건이 모두 맞아 ‘나는 곤충’에 들어간다.",
      },
      {
        label: "하나만 맞을 때",
        expected: "개미는 다리만 맞아 ‘걷는 곤충’에 들어간다.",
      },
    ],
    task: "‘그리고’를 ‘또는’으로 바꿔 보고 참새가 어디로 가는지 확인한 뒤, 원래대로 돌려 이유를 적으세요.",
    hints: [
      "‘그리고’는 두 조건이 모두 맞아야 해요.",
      "개미는 날개 수가 0이라 둘째 조건에 맞지 않아요.",
      "‘또는’으로 바꾸면 날개만 있어도 맞아서 참새도 들어가요.",
    ],
    closing: "‘그리고’와 ‘또는’ 가운데 어느 쪽이 더 많은 카드를 받아들일까요?",
  },
  {
    title: "덥거나 먼지가 많으면 실내에서",
    goal: "두 가지 특징을 ‘또는’으로 이어 하나만 맞아도 실내 체육으로 보내요.",
    prediction:
      "기온은 28도인데 미세먼지가 95인 수요일은 어디에서 체육을 할까요?",
    tests: [
      {
        label: "하나만 맞아도",
        expected: "화요일(더움)·수요일(먼지 많음)은 ‘실내 체육’에 들어간다.",
      },
      {
        label: "둘 다 아닐 때",
        expected: "월요일·금요일은 ‘운동장 체육’에 들어간다.",
      },
    ],
    task: "‘또는’을 ‘그리고’로 바꿔 보고 누가 달라지는지 확인한 뒤, 원래대로 돌려 이유를 적으세요.",
    hints: [
      "‘또는’은 두 조건 가운데 하나만 맞아도 돼요.",
      "미세먼지 79는 ‘80 이상’에 맞지 않아요.",
      "‘그리고’로 바꾸면 덥고 먼지도 많은 목요일만 남아요.",
    ],
    closing:
      "안전을 위한 규칙에는 ‘그리고’와 ‘또는’ 가운데 무엇이 더 알맞을까요?",
  },
);
// 반복 계산기의 시작 설정: 같은 만큼 바꾸는 일을 정한 횟수만큼 되풀이한다.
const loopStarters: LoopConfig[] = [
  {
    kind: "loop",
    variable: "저금통(원)",
    round: "일째",
    start: 0,
    change: 500,
    times: 7,
    count: "exact",
    goal: 3500,
    doneMessage: "일주일 저금 끝! 3500원을 모았어요.",
  },
  {
    kind: "loop",
    variable: "읽은 쪽수",
    round: "일째",
    start: 20,
    change: 15,
    times: 4,
    count: "exact",
    goal: 80,
    doneMessage: "80쪽까지 읽었어요!",
  },
  // 학습용 오류: 정한 횟수보다 한 번 더 돌아 줄넘기가 60개가 된다.
  {
    kind: "loop",
    variable: "줄넘기(개)",
    round: "세트",
    start: 0,
    change: 10,
    times: 5,
    count: "extra",
    goal: 50,
    doneMessage: "줄넘기 50개 끝!",
  },
  {
    kind: "loop",
    variable: "남은 사탕(개)",
    round: "번째 친구",
    start: 20,
    change: -3,
    times: 6,
    count: "exact",
    goal: 2,
    doneMessage: "친구 6명에게 나눠 주고 2개가 남았어요.",
  },
  // 조건 반복: 3000원 이상이 되면 횟수가 남아도 멈춘다.
  {
    kind: "loop",
    variable: "모은 돈(원)",
    round: "주째",
    start: 0,
    change: 700,
    times: 10,
    count: "exact",
    goal: 3500,
    doneMessage: "3000원을 넘었어요! 이제 살 수 있어요.",
    until: { when: "gte", value: 3000 },
  },
  // 학습용 오류: 300씩 늘면 1000을 건너뛰어 ‘같으면’ 조건에 한 번도 맞지 않는다.
  {
    kind: "loop",
    variable: "물통(mL)",
    round: "컵째",
    start: 0,
    change: 300,
    times: 8,
    count: "exact",
    goal: 1200,
    doneMessage: "물통이 찼어요. 그만 부어요!",
    until: { when: "eq", value: 1000 },
  },
];
// 목록 만들기의 시작 설정: 낱말을 차례로 넣고 빼며 순서와 개수를 본다.
const listStarters: ListConfig[] = [
  {
    kind: "list",
    name: "소풍 준비물",
    items: ["도시락", "물", "돗자리", "모자"],
    duplicate: "block",
    max: 6,
    remove: "last",
    fullMessage: "준비물 목록이 가득 찼어요!",
  },
  {
    kind: "list",
    name: "작은 가방",
    items: ["공책", "필통", "물통", "우산", "간식"],
    duplicate: "block",
    max: 3,
    remove: "last",
    fullMessage: "가방이 가득 찼어요. 하나를 빼야 넣을 수 있어요.",
  },
  // 학습용 오류: 같은 이름을 또 누르면 명단에 두 번 들어간다.
  {
    kind: "list",
    name: "출석 명단",
    items: ["하늘", "바다", "나무", "구름"],
    duplicate: "allow",
    max: 8,
    remove: "last",
    fullMessage: "명단이 가득 찼어요.",
  },
  {
    kind: "list",
    name: "급식 줄",
    items: ["하늘 모둠", "바다 모둠", "나무 모둠", "구름 모둠"],
    duplicate: "block",
    max: 4,
    remove: "first",
    fullMessage: "줄이 가득 찼어요.",
  },
];
specifications.loop.push(
  {
    title: "일주일 저금통",
    goal: "하루에 500원씩 7일 동안 저금하면 얼마가 되는지 반복으로 알아봐요.",
    prediction:
      "‘한 번 반복’을 3번 누르면 저금통에 얼마가 있을까요? 7번이면요?",
    tests: [
      {
        label: "한 번씩 반복",
        expected: "누를 때마다 500원씩 늘어난다.",
      },
      {
        label: "끝까지 반복",
        expected: "7번 반복하고 3500원에서 멈춘다.",
      },
    ],
    task: "하루 저금을 700원으로 바꾸고 목표 값도 맞게 고친 뒤 다시 확인하세요.",
    hints: [
      "앱이 기억하는 값은 저금통의 돈이에요.",
      "한 번 반복할 때마다 같은 만큼 늘어나요.",
      "목표 값은 ‘한 번에 바뀌는 값 × 횟수’예요.",
    ],
    closing:
      "같은 일을 7번 적는 것과 ‘7번 반복’이라고 적는 것은 무엇이 다를까요?",
  },
  {
    title: "처음 값이 있을 때",
    goal: "이미 20쪽을 읽은 책을 하루 15쪽씩 4일 더 읽으면 몇 쪽인지 알아봐요.",
    prediction: "4번 반복이 끝나면 60쪽일까요, 80쪽일까요?",
    tests: [
      {
        label: "처음 값",
        expected: "반복하기 전에 20쪽에서 시작한다.",
      },
      {
        label: "끝난 값",
        expected: "4번 반복하면 80쪽이 된다.",
      },
    ],
    task: "처음 값을 0으로 바꿔 끝난 값이 어떻게 달라지는지 보고, 다시 20으로 돌려 이유를 적으세요.",
    hints: [
      "반복은 처음 값에서 시작해요.",
      "15쪽씩 4번이면 60쪽이 늘어나요.",
      "끝난 값은 처음 값 + 늘어난 값이에요.",
    ],
    closing: "반복이 끝난 값을 미리 계산하려면 무엇 세 가지를 알아야 할까요?",
  },
  {
    title: "어라? 한 번 더 뛰었어요!",
    goal: "줄넘기 10개씩 5세트만 해야 하는데 60개가 되는 까닭을 찾아 고쳐요.",
    prediction: "‘끝까지 반복’을 누르면 줄넘기는 몇 개가 될까요?",
    tests: [
      {
        label: "반복 횟수",
        expected: "5세트만 하고 멈춘다.",
      },
      {
        label: "끝난 값",
        expected: "줄넘기 50개에서 끝난다.",
      },
    ],
    task: "‘반복 세는 방법’을 고쳐 5세트에서 멈추게 하고 다시 확인하세요.",
    hints: [
      "점이 몇 개 켜졌는지 세어 봐요.",
      "앱은 몇 번 했는지 세다가 정한 횟수가 되면 멈춰야 해요.",
      "설정의 ‘반복 세는 방법’을 ‘정한 횟수만큼’으로 바꿔요.",
    ],
    closing: "반복이 한 번 더 돌거나 덜 도는 실수는 왜 생기기 쉬울까요?",
  },
  {
    title: "줄어드는 반복",
    goal: "사탕 20개를 친구 6명에게 3개씩 나눠 주면 몇 개가 남는지 알아봐요.",
    prediction: "6번 반복하면 사탕은 몇 개 남을까요?",
    tests: [
      {
        label: "줄어드는 값",
        expected: "누를 때마다 3개씩 줄어든다.",
      },
      {
        label: "끝난 값",
        expected: "6번 반복하면 2개가 남는다.",
      },
    ],
    task: "친구를 7명으로 바꾸면 어떤 일이 생기는지 보고, 사탕이 모자라지 않게 숫자를 고치세요.",
    hints: [
      "한 번에 바뀌는 값이 −3이에요.",
      "3개씩 6번이면 18개가 줄어요.",
      "7명이면 21개가 필요해서 값이 0보다 작아져요.",
    ],
    closing: "값이 0보다 작아지면 안 될 때 앱은 무엇을 확인해야 할까요?",
  },
  {
    title: "목표에 닿으면 그만",
    goal: "일주일에 700원씩 모으다가 3000원 이상이 되면 멈추는 반복을 만들어요.",
    prediction: "‘끝까지 반복’을 누르면 몇 주째에, 얼마에서 멈출까요?",
    tests: [
      {
        label: "멈춤 조건",
        expected: "3000원 이상이 되면 횟수가 남아도 멈춘다.",
      },
      {
        label: "멈춘 값",
        expected: "5주째에 3500원에서 멈춘다.",
      },
    ],
    task: "멈춤 조건의 값을 5000으로 바꾸고, 멈추는 값을 계산해 목표 값도 맞게 고치세요.",
    hints: [
      "앱은 반복하기 전에 값이 조건에 맞는지 먼저 확인해요.",
      "2800원은 3000원 이상이 아니라서 한 번 더 반복해요.",
      "반복 횟수 10은 넘지 않을 가장 많은 횟수예요.",
    ],
    closing:
      "‘7번 반복’과 ‘3000원이 될 때까지 반복’은 언제 각각 쓰면 좋을까요?",
  },
  {
    title: "어라? 멈추지 않아요!",
    goal: "물통이 1000mL가 되면 멈춰야 하는데 끝까지 붓는 까닭을 찾아 고쳐요.",
    prediction: "한 컵에 300mL씩 부으면 물통이 딱 1000mL가 되는 때가 있을까요?",
    tests: [
      {
        label: "멈춤 조건",
        expected: "1000mL 이상이 되면 멈춘다.",
      },
      {
        label: "멈춘 값",
        expected: "4컵째에 1200mL에서 멈춘다.",
      },
    ],
    task: "멈춤 조건을 ‘이상이면’으로 고쳐 물이 넘치기 전에 멈추게 하고 다시 확인하세요.",
    hints: [
      "값은 300, 600, 900, 1200으로 바뀌어요.",
      "딱 1000이 되는 때가 없어서 ‘같으면’ 조건에 맞지 않아요.",
      "설정의 ‘멈추는 방법’을 ‘값이 얼마 이상이면 멈추기’로 바꿔요.",
    ],
    closing: "멈춤 조건에 ‘같으면’을 쓰면 왜 위험할 수 있을까요?",
  },
);
specifications.list.push(
  {
    title: "소풍 준비물 목록",
    goal: "소풍에 가져갈 준비물을 차례로 넣어 목록을 만들어요.",
    prediction:
      "‘물’을 먼저 넣고 ‘도시락’을 넣으면 1번 자리에는 무엇이 있을까요?",
    tests: [
      {
        label: "넣는 순서",
        expected: "누른 순서대로 목록 맨 뒤에 들어간다.",
      },
      {
        label: "목록의 개수",
        expected: "넣을 때마다 개수가 1씩 늘어난다.",
      },
    ],
    task: "낱말을 내가 챙길 준비물로 바꾸고, 낱말을 하나 더 추가한 뒤 다시 확인하세요.",
    hints: [
      "목록은 넣은 순서를 기억해요.",
      "새 낱말은 언제나 맨 뒤에 들어가요.",
      "설정에서 낱말을 고치고 ‘+ 낱말 추가’를 눌러요.",
    ],
    closing: "목록이 순서를 기억하면 어떤 점이 편리할까요?",
  },
  {
    title: "가득 차면 그만",
    goal: "세 개만 들어가는 작은 가방에 물건을 넣으며 가득 찼을 때를 살펴봐요.",
    prediction: "물건 세 개를 넣은 뒤 네 번째 물건을 누르면 어떻게 될까요?",
    tests: [
      {
        label: "가득 찼을 때",
        expected: "네 번째 물건은 들어가지 않고 안내가 나온다.",
      },
      {
        label: "빼고 다시 넣기",
        expected: "하나를 빼면 다른 물건을 넣을 수 있다.",
      },
    ],
    task: "가장 많은 개수를 4로 바꾸고 가득 찼을 때 문구를 친절하게 고친 뒤 다시 확인하세요.",
    hints: [
      "앱은 넣기 전에 목록의 개수를 세어 봐요.",
      "개수가 가장 많은 개수와 같으면 넣지 않아요.",
      "‘하나 빼기’는 맨 뒤에 있는 물건을 꺼내요.",
    ],
    closing: "앱이 넣기 전에 개수를 확인하지 않으면 어떤 일이 생길까요?",
  },
  {
    title: "어라? 이름이 두 번!",
    goal: "출석 명단에 같은 이름이 두 번 들어가는 까닭을 찾아 고쳐요.",
    prediction: "‘하늘’을 두 번 누르면 명단에는 모두 몇 명이 있을까요?",
    tests: [
      {
        label: "같은 이름 다시 넣기",
        expected: "같은 이름은 한 번만 들어간다.",
      },
      {
        label: "다른 이름 넣기",
        expected: "다른 이름은 맨 뒤에 들어간다.",
      },
    ],
    task: "‘같은 낱말을 또 넣으면’을 고쳐 이름이 한 번만 들어가게 하고 다시 확인하세요.",
    hints: [
      "‘하늘’을 두 번 누르고 개수를 세어 봐요.",
      "앱은 넣기 전에 목록에 이미 있는지 확인해야 해요.",
      "설정의 ‘같은 낱말을 또 넣으면’을 ‘넣지 않기’로 바꿔요.",
    ],
    closing: "같은 것이 두 번 들어가면 안 되는 목록에는 무엇이 있을까요?",
  },
  {
    title: "먼저 온 사람 먼저",
    goal: "급식 줄처럼 먼저 넣은 것이 먼저 나오는 목록을 만들어요.",
    prediction:
      "하늘, 바다, 나무 모둠을 차례로 넣고 ‘하나 빼기’를 누르면 누가 나올까요?",
    tests: [
      {
        label: "먼저 넣은 것 빼기",
        expected: "맨 앞에 있는 모둠이 먼저 나온다.",
      },
      {
        label: "자리 당겨지기",
        expected: "하나가 나오면 뒤에 있던 모둠이 앞으로 온다.",
      },
    ],
    task: "‘하나 빼기가 꺼내는 곳’을 맨 뒤로 바꿔 무엇이 달라지는지 보고, 급식 줄에 맞는 쪽으로 돌려놓으세요.",
    hints: [
      "줄은 먼저 선 사람이 먼저 나가요.",
      "맨 앞이 빠지면 2번이 1번이 돼요.",
      "접시 쌓기는 맨 뒤(위)에서 꺼내는 목록이에요.",
    ],
    closing:
      "맨 앞에서 꺼내는 목록과 맨 뒤에서 꺼내는 목록은 각각 어디에 쓰일까요?",
  },
);
export const missions: Mission[] = kinds.flatMap((kind) =>
  specifications[kind].map((s, i) => {
    const starter = structuredClone(
      kind === "quiz"
        ? quiz
        : kind === "story"
          ? story
          : kind === "timer"
            ? timer
            : kind === "rule"
              ? ruleStarters[i]
              : kind === "sort"
                ? sortStarters[i]
                : kind === "loop"
                  ? loopStarters[i]
                  : kind === "list"
                    ? listStarters[i]
                    : patternStarters[i],
    );
    if (kind === "quiz" && starter.kind === "quiz") {
      if (i === 2) starter.scoring = "attempt";
      if (i === 3) starter.resetScore = false;
    }
    if (kind === "story" && i === 2 && starter.kind === "story")
      starter.scenes[0].choices[1].to = "tree";
    if (kind === "timer" && i === 2 && starter.kind === "timer")
      starter.showEnd = false;
    return {
      ...s,
      id: `${kind}-${i + 1}`,
      kind,
      order: i + 1,
      guide: `먼저 예상한 뒤 실행해 보세요. ${s.task}`,
      completion: `예상 기록 → ${s.tests.map((t) => t.label).join(", ")} 직접 확인 → 수정 이유와 원리 설명`,
      learningError:
        i === 2 || (kind === "quiz" && i === 3) || (kind === "loop" && i === 5),
      starter,
    };
  }),
);
