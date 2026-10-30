import { createContext, useContext } from "react";
// 화면 틀(메뉴·단계·저장 상태·주요 버튼)을 여러 언어로 보여 준다.
// 한국어 문장을 그대로 열쇠로 쓰고, 번역이 없는 문장은 한국어로 보여 준다.
// 첫 화면 틀은 여기 두고, 학생 화면 전체 번역(src/i18nEn.ts)은 영어를 고를 때 불러온다.
// 교사 화면·수업 자료·앱이 만든 동작 설명(엔진 기록)은 한국어로 둔다.
export type Lang = "ko" | "en";
export const langs: { id: Lang; name: string; html: string }[] = [
  { id: "ko", name: "한국어", html: "ko" },
  { id: "en", name: "English", html: "en" },
];
const en: Record<string, string> = {
  "본문으로 건너뛰기": "Skip to main content",
  "나의 작은 앱 만들기": "Make my own small app",
  "주 메뉴": "Main menu",
  "공작소 홈": "Workshop home",
  "미션 공작대": "Missions",
  "내 작품 선반": "My works",
  "교사 자료실": "Teacher resources",
  "학생 체험하기": "Try as a student",
  "3분 첫 체험": "3-minute first try",
  "교사 수업 준비": "Lesson prep",
  "QR 소개 카드": "QR intro cards",
  "나의 배움 공간": "My learning space",
  "버그 탐정 도전": "Bug detective challenge",
  "가입 없이, 내 기기에 저장": "No sign-up, saved on this device",
  "생각을 키우는 안전한 연습실": "A safe place to grow ideas",
  "안내 모드": "Guide mode",
  "어린이 모드": "Kids mode",
  "쉬운 모드 (3~4학년)": "Easy mode (grades 3–4)",
  "일반 입문자 모드": "Beginner mode",
  언어: "Language",
  "불러오는 중": "Loading",
  "기기에 저장됨": "Saved on this device",
  "저장 대기 중": "Waiting to save",
  "저장 실패 · 편집 내용 유지 중": "Save failed · edits kept",
  "저장소 연결 실패": "Storage unavailable",
  "이 앱의 데이터 삭제됨": "App data deleted",
  "이 기기의 작품을 불러오고 있어요…": "Loading works on this device…",
  "화면을 불러오고 있어요…": "Loading this screen…",
  "이 작품이나 미션을 찾을 수 없어요": "This work or mission was not found",
  "작품 선반으로": "Go to my works",
  "저장 다시 시도": "Retry saving",
  "편집 내용 파일로 내보내기": "Export edits to a file",
  "알림 닫기": "Close notice",
  "새 버전이 준비됐어요. 지금 편집 내용을 저장한 뒤 새로고침하면 적용돼요.":
    "A new version is ready. Save your edits and reload to use it.",
  "저장하고 새로고침": "Save and reload",
  나중에: "Later",
  취소: "Cancel",
  "처리 중…": "Working…",
  "목표 정하기": "Set the goal",
  "요청 작성하기": "Write the request",
  "예상하고 실행": "Predict and run",
  "검사하고 수정": "Test and fix",
  "설명하고 저장": "Explain and save",
  "학습 단계": "Learning steps",
  "누가, 어떤 순간에 쓸 앱인지 약속해요.":
    "Agree on who will use the app, and when.",
  "내 말로 적고, 검사할 수 있는 요청으로 정리해요.":
    "Write it in your own words, then turn it into a request you can test.",
  "누르기 전에 예상하고, 설정과 결과를 비교해요.":
    "Predict before you press, then compare the settings with the result.",
  "기대한 결과와 실제 결과를 나란히 적어요.":
    "Write what you expected next to what actually happened.",
  "어떻게 움직이는지, 무엇을 바꿨는지 설명해요.":
    "Explain how it works and what you changed.",
  "기록 완료": "Recorded",
  "기록할 내용 있음": "Still to record",
  "파일 백업": "Back up file",
  되돌리기: "Undo",
  "읽어 주기": "Read aloud",
  "읽기 멈추기": "Stop reading",
  "이 단계 안내 듣기": "Listen to this step",
  "미션 안내 듣기": "Listen to the mission",
  "만든 문장 듣기": "Listen to my sentence",
  "다시 하기": "Redo",
  "과정 포트폴리오": "Process portfolio",
  "다음 단계": "Next step",
  "이 약속으로 만들기": "Make it with this plan",
  "이 과정 버전으로 저장": "Save this process as a version",
  "수정 버전 · 비교와 복원": "Versions · compare and restore",
  "다른 탭에서 이 작품을 편집하고 있어요.":
    "This work is being edited in another tab.",
  "이 탭에서 편집하기": "Edit in this tab",
  "한 번에 하나씩, 나의 속도로": "One at a time, at my own pace",
  "처음이라면 퀴즈 1부터. 문제를 찾는 연습은 퀴즈 3을 골라요.":
    "New here? Start with Quiz 1. To practise finding bugs, pick Quiz 3.",
  "차시 안내와 수업 자료는 한국어로 되어 있어요.":
    "Lesson plans and classroom materials are in Korean.",
  "전체 {n}개": "All {n}",
  퀴즈: "Quiz",
  "갈림길 이야기": "Branching story",
  타이머: "Timer",
  "패턴 그리기": "Pattern drawing",
  "첫 미션 추천": "Recommended first",
  "학습용 오류 포함": "Includes a practice bug",
  "진행 중": "In progress",
  "아직 시작하지 않음": "Not started",
  "한 번의 완성보다, 쌓이는 변화": "Growth over one-time perfection",
  "자동 저장된 편집본과 직접 남긴 수정 버전을 다시 만나요.":
    "Open your autosaved drafts and saved versions again.",
  "파일 가져오기": "Import file",
  "친구 작품 검사하기": "Check a friend's work",
  "목록 백업": "Back up list",
  "작품 열기": "Open",
  포트폴리오: "Portfolio",
  삭제: "Delete",
  "다음 사용자 시작": "Start next user",
  "이 앱의 데이터 전체 삭제": "Delete all app data",
  "공용 기기 정리": "Shared device cleanup",
  "정답을 만드는 시간보다, 생각을 키우는 시간.":
    "Time to grow thinking, not just to find answers.",
  "뚝딱 바이브 공작소": "Ttukttak Vibe Workshop",
};
const tables: Record<Lang, Record<string, string>> = { ko: {}, en };
// 학생 화면 전체 번역은 영어를 고를 때 따로 불러와 더한다(한국어 첫 화면을 가볍게).
export function addTranslations(lang: Lang, table: Record<string, string>) {
  Object.assign(tables[lang], table);
}
// {이름} 자리에 값을 넣는다. 예: t("문항 {n} 내용", { n: 2 })
export function translate(
  lang: Lang,
  text: string,
  vars?: Record<string, string | number>,
) {
  const out = tables[lang][text] ?? text;
  return vars
    ? out.replace(/\{(\w+)\}/g, (all, k: string) =>
        k in vars ? String(vars[k]) : all,
      )
    : out;
}
// 화면 언어에 맞춘 날짜·시각 표시
export const dateLocale = (lang: Lang) => (lang === "en" ? "en-US" : "ko-KR");
export const LangContext = createContext<Lang>("ko");
export const useLang = () => useContext(LangContext);
export function useT() {
  const lang = useContext(LangContext);
  return (text: string, vars?: Record<string, string | number>) =>
    translate(lang, text, vars);
}
