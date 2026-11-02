import { readdirSync, readFileSync } from "node:fs";
// 코드에서 화면 언어로 바꾸는 한국어 문장(번역 열쇠)을 모은다.
// t( ... )의 첫 인자 안 문자열(삼항식 양쪽 포함)과, 나중에 t()로 바꾸는 목록·알림 문장을 찾는다.
const HANGUL = /[가-힣]/;
function firstArg(code: string, start: number) {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const c = code[i];
    if (c === '"' || c === "`" || c === "'") {
      const end = code.indexOf(c, i + 1);
      if (end < 0) break;
      i = end;
    } else if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (!depth) return code.slice(start, i);
      depth--;
    } else if (c === "," && !depth) return code.slice(start, i);
  }
  return "";
}
const strings = (s: string) =>
  [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((m) => m[1].replace(/\\"/g, '"'))
    .filter((x) => HANGUL.test(x));
export function codeKeys(files = readdirSync("src")) {
  const keys = new Map<string, string>();
  const add = (f: string, k: string) => {
    if (!keys.has(k)) keys.set(k, f);
  };
  for (const f of files.filter((f) => /\.tsx?$/.test(f) && f !== "i18n.tsx")) {
    const code = readFileSync(`src/${f}`, "utf8");
    for (const m of code.matchAll(/\b(?:t|translate\(\s*\w+\s*,)\s*\(/g)) {
      const arg = firstArg(code, m.index! + m[0].length);
      for (const k of strings(arg)) add(f, k);
    }
    for (const m of code.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g))
      if (HANGUL.test(m[1])) add(f, m[1]);
  }
  return keys;
}
// t()에 변수로 넘기는 문장들: 알림·확인 창, 목록 배열, 엔진·자료의 고정 문장.
export function listedKeys(files = readdirSync("src")) {
  const keys = new Map<string, string>();
  const add = (f: string, k: string) => {
    if (HANGUL.test(k) && !keys.has(k)) keys.set(k, f);
  };
  // 미션 만들기는 교사 화면이라 한국어로 둔다.
  for (const f of files.filter(
    (f) => /\.tsx$/.test(f) && f !== "MissionMaker.tsx",
  )) {
    const code = readFileSync(`src/${f}`, "utf8");
    // 알림과 저장 상태는 보여 줄 때 t()로 바꾼다.
    for (const m of code.matchAll(
      /\b(?:message|setStorageStatus|setStorageError)\(/g,
    ))
      for (const k of strings(firstArg(code, m.index! + m[0].length)))
        add(f, k.split("\\n")[0]);
    // ["경로", "이름"] · ["경로", "아이콘", "이름"] 모양의 메뉴·입력 목록
    for (const m of code.matchAll(
      /\[\s*"[\w-]+",\s*(?:"[\w-]+",\s*)?"((?:[^"\\]|\\.)*)"\s*\]/g,
    ))
      add(f, m[1]);
  }
  // 확인 창의 제목·본문·버튼 이름(App)
  const app = readFileSync("src/App.tsx", "utf8");
  for (const m of app.matchAll(/\b(?:title|body|label):\s*"([^"]+)"/g))
    add("App.tsx", m[1]);
  // 파일 검사 오류(AppError)와 그 안에 넣는 항목 이름: 검사 함수 호출의 모든 문자열을 모은다.
  for (const f of [
    "storage.ts",
    "peer.ts",
    "engines.ts",
    "qrTransfer.ts",
    "customMissions.ts",
  ]) {
    const code = readFileSync(`src/${f}`, "utf8");
    for (const m of code.matchAll(
      /\b(?:new AppError|fail|obj|str|bool|num|arr|one|stamp|unique|list|checkVersion|text)\(/g,
    )) {
      // 첫 인자뿐 아니라 괄호 안 전체(항목 이름은 둘째 인자)를 본다.
      let depth = 0;
      let end = m.index! + m[0].length;
      for (; end < code.length; end++) {
        const c = code[end];
        if (c === '"' || c === "`") end = code.indexOf(c, end + 1);
        else if (c === "(") depth++;
        else if (c === ")" && !depth--) break;
      }
      for (const k of strings(code.slice(m.index!, end))) add(f, k);
    }
  }
  // 낱말 블록과 첫 체험·소개 화면은 파일 전체(자료 배열 포함)가 화면 문장이다.
  // 맞춤 힌트의 문제·힌트 문장도 화면에서 t()로 바꾼다.
  for (const f of ["BlockPrompt.tsx", "Welcome.tsx", "diagnose.ts"])
    for (const k of strings(readFileSync(`src/${f}`, "utf8"))) add(f, k);
  return keys;
}
