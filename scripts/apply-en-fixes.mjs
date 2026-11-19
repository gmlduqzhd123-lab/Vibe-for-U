// 교사가 앱의 "영어 번역 고치기"에서 내보낸 고침 파일을 저장소의 영어 번역표에 합친다.
// 사용: node scripts/apply-en-fixes.mjs 뚝딱-영어-번역-고침-2026-11-18.json
//       그다음 npx prettier --write src/i18n.tsx src/i18nEn.ts && npx vitest run tests/i18n.test.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FORMAT = "ttukttak-vibe-en-fixes";
const slots = (s) =>
  [...s.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// 고침 파일을 검사해 { 한국어: 영어 } 표를 돌려준다. 값 자리({n} 등)가 다르면 받지 않는다.
export function readFixes(data) {
  if (!data || data.format !== FORMAT || data.version !== 1)
    throw new Error("영어 번역 고침 파일이 아니에요.");
  const fixes = data.fixes;
  if (!fixes || typeof fixes !== "object" || Array.isArray(fixes))
    throw new Error("고친 문장이 없어요.");
  for (const [ko, en] of Object.entries(fixes)) {
    if (typeof en !== "string" || !en.trim()) throw new Error(`빈 번역: ${ko}`);
    if (slots(ko) !== slots(en)) throw new Error(`값 자리가 달라요: ${ko}`);
  }
  return fixes;
}
// 번역표 소스에서 열쇠가 ko인 줄의 값을 en으로 바꾼다. 바꾼 열쇠 목록을 함께 돌려준다.
export function applyFixes(source, fixes) {
  const done = [];
  let out = source;
  for (const [ko, en] of Object.entries(fixes)) {
    const key = JSON.stringify(ko);
    // "열쇠": "값" 또는 따옴표 없는 열쇠: "값" (값이 다음 줄에 있을 수 있다).
    // 영어에 큰따옴표가 들어 있으면 Prettier가 값을 작은따옴표로 쓰므로 둘 다 찾는다.
    const re = new RegExp(
      `(^\\s*(?:${esc(key)}|${esc(ko)}):\\s*)(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
      "m",
    );
    if (!re.test(out)) continue;
    out = out.replace(re, (_, head) => head + JSON.stringify(en));
    done.push(ko);
  }
  return { source: out, done };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error("사용: node scripts/apply-en-fixes.mjs <고침 파일.json>");
    process.exit(1);
  }
  const fixes = readFixes(JSON.parse(readFileSync(file, "utf8")));
  const left = { ...fixes };
  for (const path of ["src/i18n.tsx", "src/i18nEn.ts"]) {
    const { source, done } = applyFixes(readFileSync(path, "utf8"), left);
    writeFileSync(path, source);
    for (const k of done) delete left[k];
    console.log(`${path}: ${done.length}개 고침`);
  }
  const missing = Object.keys(left);
  if (missing.length) {
    console.error(`번역표에 없는 문장 ${missing.length}개:`);
    for (const k of missing) console.error(`  ${k}`);
    process.exit(1);
  }
}
