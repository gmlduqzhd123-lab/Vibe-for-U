import { describe, it, expect } from "vitest";
import { missions } from "../src/data";
import { makeWork } from "../src/model";
import { scanText, scanWorks } from "../src/privacy";
const kinds = (t: string) => scanText("글", t).map((h) => h.kind);
describe("개인정보 감지", () => {
  it("전화번호·이메일·주민번호·주소·학교 반·실제 이름을 찾는다", () => {
    expect(kinds("우리 집 010-1234-5678로 연락해")).toEqual(["전화번호"]);
    expect(kinds("minseo@school.kr 으로 보내")).toEqual(["이메일 주소"]);
    expect(kinds("140101-3123456")).toContain("주민등록번호");
    expect(kinds("서울시 강남구 테헤란로 152에 살아요")).toContain("집 주소");
    expect(kinds("101동 1203호")).toContain("집 주소");
    expect(kinds("햇살초등학교 5학년 3반 친구들")).toEqual(["학교·학년·반"]);
    expect(kinds("제 이름은 김민서예요")).toEqual(["실제 이름"]);
  });
  it("이름 뒤 호칭·자기소개·생년월일·메신저 아이디·자동차 번호도 찾는다", () => {
    expect(kinds("김민서 학생이 만든 퀴즈")).toContain("실제 이름");
    expect(kinds("저는 박지우예요. 반가워요")).toContain("실제 이름");
    expect(kinds("이도윤이 만든 타이머")).toContain("실제 이름");
    expect(kinds("2015년 3월 14일생이에요")).toEqual(["생년월일"]);
    expect(kinds("카톡 아이디: minseo_2015 로 보내")).toContain(
      "메신저·SNS 아이디",
    );
    expect(kinds("인스타 @ji.woo.kim 팔로우")).toContain("메신저·SNS 아이디");
    expect(kinds("우리 차는 123가 4567")).toEqual(["자동차 번호"]);
  });
  it("미션의 보통 글(명령·점수·시간)은 짚지 않는다", () => {
    for (const t of [
      "오른쪽으로 3칸 → 아래로 2칸",
      "같은 정답을 세 번 누르면 3점",
      "30초가 끝났어요! 1000점",
      "명령 묶음 3번 반복 · 12칸 이동",
      "선생님이 만든 미션",
      "친구가 만든 퀴즈",
      "2026년 11월 3일 수업",
      "10번 눌러서 100점",
    ])
      expect(kinds(t), t).toEqual([]);
    for (const m of missions)
      expect(scanWorks([makeWork(m)]), m.id).toEqual([]);
  });
  it("작품의 어느 칸에 있는지 알려 주고, 찾은 글은 가려서 보여 준다", () => {
    const w = makeWork(missions[0]);
    w.draft.title = "민서의 퀴즈 010-9876-5432";
    const [hit] = scanWorks([w]);
    expect(hit).toMatchObject({ kind: "전화번호", where: "작품 제목" });
    expect(hit.sample).not.toContain("9876");
  });
});
