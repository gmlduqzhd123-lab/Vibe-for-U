// 대소문자만 다른 파일 이름을 찾는다. Windows·macOS는 대소문자를 구분하지 않아
// "./classReview"와 "./ClassReview"처럼 겹치면 다른 파일이 잡혀 빌드가 깨진다.
import { readdirSync } from "node:fs";
import path from "node:path";

const roots = ["src", "tests", "scripts", "public"];
const clashes = [];
for (const root of roots) {
  const walk = (dir) => {
    const seen = new Map();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      // 확장자를 뺀 이름으로 비교한다(가져오기는 보통 확장자 없이 쓴다).
      const stem = entry.name.replace(/\.[^.]+$/, "");
      const other = seen.get(stem.toLowerCase());
      // 같은 이름에 확장자만 다른 것(Welcome.css·Welcome.tsx)은 괜찮다.
      if (other && other.stem !== stem)
        clashes.push(
          `${path.join(dir, other.name)} ↔ ${path.join(dir, entry.name)}`,
        );
      seen.set(stem.toLowerCase(), { stem, name: entry.name });
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
    }
  };
  walk(root);
}
if (clashes.length) {
  console.error("대소문자만 다른 파일 이름이 있어요:\n" + clashes.join("\n"));
  process.exit(1);
}
console.log("파일 이름 대소문자 충돌 없음");
