// 빌드한 dist/를 읽어 서비스 워커의 캐시 이름과 미리 받을 파일 목록을 채운다.
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// 큰 수업 자료·시안·공유 이미지는 사용자가 고를 때만 받는다.
const SKIP = [/^materials\//, /^concepts\//, /^og-image\./, /^sw\.js$/];

export function precacheFiles(files) {
  return files
    .map((f) => f.split(path.sep).join("/"))
    .filter((f) => !SKIP.some((re) => re.test(f)))
    .sort();
}

export function buildServiceWorker(template, files, version) {
  if (!template.includes("__CACHE_VERSION__") || !template.includes("__PRECACHE__"))
    throw new Error("sw.js에 __CACHE_VERSION__ / __PRECACHE__ 자리가 필요해요.");
  const list = ["./", ...files.map((f) => `./${f}`)];
  return template
    .replace("__CACHE_VERSION__", version)
    .replace("__PRECACHE__", JSON.stringify(list));
}

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(path.relative(base, full));
  }
  return out;
}

export async function writeServiceWorker(dist) {
  const files = precacheFiles(await walk(dist));
  const hash = createHash("sha256");
  for (const f of files) hash.update(f).update(await readFile(path.join(dist, f)));
  const version = hash.digest("hex").slice(0, 12);
  const target = path.join(dist, "sw.js");
  await writeFile(
    target,
    buildServiceWorker(await readFile(target, "utf8"), files, version),
  );
  return { version, files };
}

export function precachePlugin() {
  let dist = "dist";
  return {
    name: "ttukttak-precache",
    apply: "build",
    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await writeServiceWorker(dist);
    },
  };
}
