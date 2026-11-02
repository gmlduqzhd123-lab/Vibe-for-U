// 성능 예산: 빌드한 첫 화면 파일(압축 기준)이 정한 크기를 넘지 않는지 본다.
// 기능을 더해도 학교 기기·느린 인터넷에서 첫 화면이 느려지지 않게 지킨다.
// 사용: npm run build 뒤 node scripts/size-budget.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

// 단위 KB(1024바이트), gzip 기준. 넘으면 실패한다. 늘릴 때는 까닭을 README에 적는다.
const BUDGET = {
  "첫 화면 JS": 112,
  "첫 화면 CSS": 16,
  "나눠 불러오는 화면 하나": 60,
  // 서비스 워커가 미리 받는 파일 전체(안내 그림 포함, 압축 전 크기)
  "오프라인 캐시 전체": 1600,
};
const dist = "dist";
const html = readFileSync(`${dist}/index.html`, "utf8");
const gz = (file) => gzipSync(readFileSync(file)).length / 1024;
// 첫 화면이 바로 받는 파일: index.html이 부르는 JS·CSS와 미리 불러오는 JS
const entry = [
  ...html.matchAll(/(?:src|href)="[^"]*?(assets\/[^"]+\.(js|css))"/g),
].map((m) => ({ file: `${dist}/${m[1]}`, type: m[2] }));
const sum = (type) =>
  entry.filter((e) => e.type === type).reduce((n, e) => n + gz(e.file), 0);
const assets = readdirSync(`${dist}/assets`).map((f) => `${dist}/assets/${f}`);
const entryFiles = new Set(entry.map((e) => e.file));
const lazy = assets
  .filter((f) => f.endsWith(".js") && !entryFiles.has(f))
  .map((f) => ({ f, kb: gz(f) }))
  .sort((a, b) => b.kb - a.kb);
// 서비스 워커가 미리 받는 파일 전체(압축 전 크기)
const sw = readFileSync(`${dist}/sw.js`, "utf8");
const list = JSON.parse(sw.match(/const CORE = (\[[^\]]*\])/)?.[1] ?? "[]");
const cache = list.reduce((n, p) => {
  try {
    return n + statSync(`${dist}/${p.replace(/^\.?\//, "")}`).size / 1024;
  } catch {
    return n;
  }
}, 0);
const measured = {
  "첫 화면 JS": sum("js"),
  "첫 화면 CSS": sum("css"),
  "나눠 불러오는 화면 하나": lazy[0]?.kb ?? 0,
  "오프라인 캐시 전체": cache,
};
let failed = false;
for (const [name, limit] of Object.entries(BUDGET)) {
  const kb = measured[name];
  const ok = kb <= limit;
  failed ||= !ok;
  console.log(
    `${ok ? "통과" : "초과"}  ${name}: ${kb.toFixed(1)}KB / 예산 ${limit}KB`,
  );
}
if (lazy[0]) console.log(`  가장 큰 나눠 불러오는 파일: ${lazy[0].f}`);
if (failed) {
  console.error(
    "성능 예산을 넘었어요. 파일을 나누거나 줄인 뒤 다시 확인해 주세요.",
  );
  process.exit(1);
}
