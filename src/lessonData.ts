// 8차시 수업 자료와 과정 평가표. 첫 화면에는 필요 없어 미션 자료(data.ts)와 따로 두고,
// 교사 자료실·작업실·포트폴리오처럼 나중에 불러오는 화면만 쓴다(첫 화면 묶음을 가볍게).
// 차시마다 연결한 미션(교사 자료실·소개 화면·수업 키트가 함께 쓴다)
export const lessonMissionIds = [
  "quiz-1",
  "quiz-1",
  "story-1",
  "quiz-4",
  "quiz-3",
  "quiz-1",
  "story-4",
  "timer-4",
];
export const lessons = [
  {
    title: "작은 문제를 앱으로",
    goal: "생활 속 작은 문제를 골라 첫 작품을 실행하고 한 가지를 바꾼다.",
    materials: "기기 1대/짝, 퀴즈 첫 미션, 종이 메모",
    intro: "불편했던 순간을 이야기하고 필요한 앱을 고른다.",
    activity:
      "목표와 사용할 사람 정하기 7분 → 첫 퀴즈 예상·실행 10분 → 안내 한 가지 수정·재검사 13분",
    close: "무엇을 왜 바꿨는지 짝에게 설명한다.",
    question: "이 앱을 누가 언제 쓰면 도움이 될까요?",
    observe: "문제와 기능을 연결하고 변경 이유를 말하는가?",
    fallback: "인쇄한 화면 카드에서 답을 고르고 점수 토큰으로 실행한다.",
  },
  {
    title: "구체적으로 설명하기",
    goal: "목적·기능·완료 조건을 포함한 요청문을 쓴다.",
    materials: "요청문 도우미, 수정 전 요청문",
    intro: "두 요청문을 비교해 모호한 말을 찾는다.",
    activity:
      "원문 작성 8분 → 여섯 질문 채우기 12분 → 요청문 정리와 전후 비교 10분",
    close: "새로 추가한 완료 조건 한 가지를 읽는다.",
    question: "잘 만들어 줘 대신 무엇을 확인하면 될까요?",
    observe: "원문을 보존하며 검사 가능한 조건을 추가하는가?",
    fallback: "여섯 질문을 종이에 적고 짝이 요청을 읽어 준다.",
  },
  {
    title: "입력과 조건 알아보기",
    goal: "선택에 따른 결과를 예상하고 실행 결과와 비교한다.",
    materials: "갈림길 이야기 미션, 장면 카드",
    intro: "갈림길 선택 하나의 결과를 예상한다.",
    activity:
      "입력·조건 찾기 8분 → 두 길 예상·실행 12분 → 연결 수정과 비교 10분",
    close: "선택 → 규칙 → 결과를 설명한다.",
    question: "같은 선택을 하면 항상 같은 장면에 도착하나요?",
    observe: "선택지 문장과 연결 규칙을 구별하는가?",
    fallback: "바닥에 장면 카드를 놓고 화살표로 연결한다.",
  },
  {
    title: "앱이 기억하는 값",
    goal: "점수·문제 번호·남은 시간을 찾아 초기화 전후를 비교한다.",
    materials: "퀴즈·타이머, 기록표",
    intro: "앱이 잠깐 기억해야 할 값을 찾아본다.",
    activity: "상태 값 관찰 10분 → 실행·멈춤·초기화 비교 12분 → 원리 설명 8분",
    close: "초기화해야 하는 값 두 가지를 적는다.",
    question: "화면이 처음으로 돌아가도 점수가 남아 있으면 어떨까요?",
    observe: "입력과 상태 값을 구별하고 초기화를 설명하는가?",
    fallback: "점수판과 종이 타이머를 역할극으로 운영한다.",
  },
  {
    title: "버그 탐정 되기",
    goal: "준비된 오류를 재현하고 한 가지 규칙을 고쳐 재검사한다.",
    materials: "퀴즈 중복 점수 미션, 검사 카드",
    intro: "같은 답을 세 번 누르면 몇 점이어야 할지 이야기한다.",
    activity:
      "오류 재현·검사 10분 → 규칙 수정과 이유 10분 → 같은 조건으로 재검사·버전 저장 10분",
    close: "기대한 결과와 실제 결과를 나란히 설명한다.",
    question: "어떤 행동을 다시 해 보면 고쳤다고 말할 수 있나요?",
    observe: "설정 한 가지를 바꾸고 동일 검사를 다시 수행하는가?",
    fallback: "반복 채점 규칙과 한 번 채점 규칙을 점수 토큰으로 비교한다.",
  },
  {
    title: "실제 AI와 만들기",
    goal: "교사가 외부 AI를 조작하고 학생은 결과를 관찰·검사한다.",
    materials: "교사가 준비한 외부 AI 개발 도구, 사전 생성 예제, 요청문·검사표",
    intro: "기본 연습과 실제 AI 제작 활동의 차이를 확인한다.",
    activity:
      "학생 요청·검사 조건 10분 → 교사가 외부 도구에서 생성·실행 10분 → 학생 검사·수정 요청 10분",
    close: "사용한 도구·도움·관찰 결과를 기록한다.",
    question: "복사한 사실과 실제 실행을 관찰한 사실은 어떻게 다를까요?",
    observe: "실제 결과를 직접 기록하고 도구의 도움을 밝히는가?",
    fallback:
      "생성이 늦거나 인터넷이 끊기면 교사가 준비한 사전 예제로 같은 검사를 진행하고 그 사실을 기록한다.",
  },
  {
    title: "친구가 사용해 보기",
    goal: "짝의 관찰 의견으로 안내와 동작을 개선한다.",
    materials: "각자의 작품, 짝 활동 검사표",
    intro: "비난 대신 관찰한 사실을 말하는 방법을 연습한다.",
    activity:
      "운전자·관찰자 1차 사용 10분 → 역할 교대 10분 → 의견을 반영해 수정·재검사 10분",
    close: "반영한 의견과 유지한 동작을 설명한다.",
    question: "친구가 멈칫한 순간에 어떤 안내가 필요했나요?",
    observe: "의견과 자동 검사 결과를 구분하고 수정 근거로 사용하는가?",
    fallback: "인쇄한 장면·버튼 카드로 사용 상황을 재현한다.",
  },
  {
    title: "새 문제에 적용하기",
    goal: "다른 조건의 과제로 옮겨 요청·예상·검사를 설계한다.",
    materials: "포트폴리오, 새 과제 카드: 운동 20초·휴식 안내 타이머",
    intro: "기존 예제와 다른 사용자와 조건을 확인한다.",
    activity:
      "새 요구와 요청 8분 → 예상·제작·검사 14분 → 포트폴리오 정리·설명 8분",
    close: "다른 앱에도 적용할 검사 방법을 공유한다.",
    question:
      "사용자가 달라져도 그대로 쓸 수 있는 검사와 바꿀 검사는 무엇인가요?",
    observe: "새 상황에 완료 조건을 조정하고 원리와 근거를 설명하는가?",
    fallback:
      "종이에 요청문과 검사 계획을 작성하고 모의 실행으로 결과를 기록한다.",
  },
];
export const defaultRubric: string[][] = [
  [
    "문제와 요구사항",
    "사용할 사람과 불편한 점을 고른다.",
    "목적·기능·완료 조건을 연결한다.",
    "다른 사용자의 문제에 맞게 조건을 바꾸고 설명한다.",
  ],
  [
    "작동 원리 이해",
    "입력과 화면 결과를 찾는다.",
    "규칙과 앱이 기억하는 값을 연결한다.",
    "상태 변화와 예외 상황의 원리를 설명하고 적용한다.",
  ],
  [
    "검사와 수정",
    "예상과 관찰을 기록한다.",
    "기대·실제 결과를 비교하고 수정 후 재검사한다.",
    "검사 근거로 수정 이유를 설명하고 새로운 검사를 설계한다.",
  ],
  [
    "설명과 새로운 과제에 적용",
    "바꾼 부분을 말한다.",
    "도움받은 내용과 변경 이유를 설명한다.",
    "다른 조건의 과제에 배운 방법을 옮겨 설명한다.",
  ],
];
// 평가 기준 맞춤: 학교 기준에 맞게 고친 평가표를 이 기기에 두고(localStorage) 기본 평가표 대신 쓴다.
// 항목은 늘 네 개, 항목마다 이름과 세 단계 설명이다(평가 기록의 단계 값과 자리가 맞아야 한다).
// rubric은 같은 배열을 그 자리에서 고쳐, 이미 불러온 모든 화면이 다음에 그릴 때 새 글을 쓴다.
export const RUBRIC_FORMAT = "ttukttak-vibe-rubric";
const RUBRIC_KEY = "ttukttak-vibe:rubric";
export function validateRubric(data: unknown): string[][] {
  if (
    !Array.isArray(data) ||
    data.length !== defaultRubric.length ||
    data.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== 4 ||
        row.some(
          (cell) =>
            typeof cell !== "string" || !cell.trim() || cell.length > 200,
        ),
    )
  )
    throw new Error("평가표 형식을 알 수 없어요.");
  return (data as string[][]).map((row) => row.map((cell) => cell.trim()));
}
function stored(): string[][] | null {
  try {
    const raw = localStorage.getItem(RUBRIC_KEY);
    return raw ? validateRubric(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
export const rubric: string[][] = defaultRubric.map((row) => [...row]);
const apply = (rows: string[][]) =>
  rows.forEach((row, i) => rubric[i].splice(0, 4, ...row));
export const isCustomRubric = () => stored() !== null;
export function saveRubric(rows: unknown) {
  const next = validateRubric(rows);
  localStorage.setItem(RUBRIC_KEY, JSON.stringify(next));
  apply(next);
}
export function resetRubric() {
  try {
    localStorage.removeItem(RUBRIC_KEY);
  } catch {
    // 지울 수 없으면 이번 화면에서만 기본으로 돌아간다.
  }
  apply(defaultRubric);
}
{
  const custom = typeof localStorage === "undefined" ? null : stored();
  if (custom) apply(custom);
}
