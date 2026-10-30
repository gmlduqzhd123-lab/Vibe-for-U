import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
// 교사 자료실에 연결한 수업 자료 파일이 실제로 있고, 모두 받기 ZIP에도 들어 있는지 확인한다.
describe("수업 자료 파일", () => {
  const code = readFileSync("src/Teacher.tsx", "utf8");
  const block = code.slice(
    code.indexOf("const classroomDocuments"),
    code.indexOf("export function Teacher"),
  );
  const ids = [...block.matchAll(/id: "([\w-]+)"/g)].map((m) => m[1]);
  it("자료 카드마다 PDF와 Word 파일이 있다", () => {
    expect(ids).toContain("new-features-guide");
    for (const id of ids)
      for (const ext of ["pdf", "docx"])
        expect(
          existsSync(`public/materials/${id}.${ext}`),
          `${id}.${ext}`,
        ).toBe(true);
  });
  it("모두 받기 ZIP에 새 기능 보충 안내가 들어 있다", () => {
    // ZIP 중앙 디렉터리의 파일 이름은 UTF-8 글자로 그대로 들어 있다.
    const zip = readFileSync("public/materials/classroom-materials.zip");
    for (const name of [
      "새_기능_수업_보충_안내.pdf",
      "새_기능_수업_보충_안내.docx",
      "교사용_사용_안내서.pdf",
    ])
      expect(zip.includes(Buffer.from(name, "utf8")), name).toBe(true);
  });
});
