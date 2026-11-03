"""만약 규칙 앱 활동지(보충 차시, 앞뒤 2쪽)를 학생 활동지 Word 파일 끝에 더한다.

기존 5차시 활동지의 문단·표 서식을 그대로 복사해 쓰므로 배치가 다른 차시와 같다.
사용: python3 scripts/make-rule-worksheet.py
      python3 scripts/docx-to-pdf.py public/materials/student-worksheets.docx public/materials/student-worksheets.pdf
      (영어판은 scripts/make-worksheets-en.py가 같은 번역표로 만든다)
"""
import copy

import docx
from docx.oxml.ns import qn

SRC = "public/materials/student-worksheets.docx"
MARK = "보충 차시 만약 규칙 앱 앞면"


def main():
    doc = docx.Document(SRC)
    if any(p.text.strip() == MARK for p in doc.paragraphs):
        print("이미 들어 있어요:", MARK)
        return
    ps = doc.paragraphs
    heads = [i for i, p in enumerate(ps) if p.style.name == "Heading 1"]
    # 5차시 앞면의 각 서식 문단을 본으로 삼는다.
    front = ps[heads[8]]
    back = ps[heads[9]]
    sample = {p.style.name: p for p in ps[heads[8] : heads[10]] if p.text.strip()}
    sample["Heading 1"] = front
    # 5차시 표(행동·기대·실제) 본
    body = doc.element.body
    table_xml = None
    pi = 0
    for k in body.iterchildren():
        tag = k.tag.split("}")[1]
        if tag == "p":
            pi += 1
        elif tag == "tbl" and heads[8] <= pi - 1 < heads[10] and table_xml is None:
            table_xml = k
    assert table_xml is not None
    sect = body.find(qn("w:sectPr"))

    def para(style, text, page_break=False):
        src = sample[style]
        el = copy.deepcopy(src._p)
        # 글자 칸을 하나만 남기고 글을 바꾼다.
        ts = el.findall(".//" + qn("w:t"))
        for t in ts[1:]:
            t.getparent().remove(t)
        ts[0].text = text
        ts[0].set(qn("xml:space"), "preserve")
        ppr = el.find(qn("w:pPr"))
        if ppr is not None:
            pb = ppr.find(qn("w:pageBreakBefore"))
            if pb is not None and not page_break:
                ppr.remove(pb)
            if page_break and pb is None:
                ppr.insert(0, ppr.makeelement(qn("w:pageBreakBefore"), {}))
        body.insert(list(body).index(sect), el)

    def table(rows):
        el = copy.deepcopy(table_xml)
        trs = el.findall(qn("w:tr"))
        # 머리글 1줄 + 본문 줄 수에 맞춘다.
        while len(trs) > len(rows):
            el.remove(trs.pop())
        while len(trs) < len(rows):
            el.append(copy.deepcopy(trs[-1]))
            trs = el.findall(qn("w:tr"))
        for tr, row in zip(trs, rows):
            for tc, text in zip(tr.findall(qn("w:tc")), row):
                ts = tc.findall(".//" + qn("w:t"))
                for t in ts[1:]:
                    t.getparent().remove(t)
                if ts:
                    ts[0].text = text
                else:
                    p = tc.find(qn("w:p"))
                    r = p.makeelement(qn("w:r"), {})
                    t = r.makeelement(qn("w:t"), {})
                    t.text = text
                    r.append(t)
                    p.append(r)
        body.insert(list(body).index(sect), el)
        para("Normal", "")

    line = "_" * 60
    # 앞면
    para("Heading 1", MARK, page_break=True)
    para("Normal", "날짜 __________   모둠 ______   나의 별칭 __________")
    para("Normal", "오늘 할 일  버튼으로 바뀌는 값에 ‘만약 ~이면’ 조건을 붙이고, 조건의 순서 때문에 숨은 문구를 찾아 고친다.")
    para("Normal", "도입 5분  →  활동 30분  →  정리 5분")
    para("Normal", "미션 열기  어라? 최고 문구가 안 나와요!")
    para("Heading 2", "1 앱이 기억하는 값과 조건")
    para("Normal", "이 앱이 기억하는 값은 무엇이고, 어떤 버튼이 그 값을 바꾸나요")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "2 누르기 전에 예상해요")
    table(
        [
            ["스티커 수", "나올 것 같은 문구", "실제로 나온 문구"],
            ["3개", "", ""],
            ["5개", "", ""],
            ["6개", "", ""],
        ]
    )
    para("Heading 2", "3 이상한 점을 짧게 적어요")
    para("Normal", "6개인데 어떤 문구가 나왔나요 · 어떤 문구가 나와야 했나요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 자동 검사   □ 내가 직접 확인   □ 아직 미확인")
    # 뒷면
    para("Heading 1", "보충 차시 만약 규칙 앱 뒷면", page_break=True)
    para("Normal", "날짜 __________   모둠 ______   나의 별칭 __________")
    para("Normal", "조건은 위에서부터 차례로 확인해요. 처음 맞는 조건 하나만 써요.")
    para("Heading 2", "4 조건의 순서를 고쳐요")
    para("Normal", "고치기 전 순서  1) 3 이상  2) 6 이상   →   고친 순서  1) ______  2) ______")
    para("Normal", "순서를 바꾼 까닭")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "5 같은 행동으로 다시 검사해요")
    table(
        [
            ["스티커 수", "기대한 문구", "실제 문구"],
            ["3개", "", ""],
            ["6개", "", ""],
            ["0개에서 −1", "", ""],
        ]
    )
    para("Normal", "내 판정  □ 기대와 같음   □ 수정할 점 있음   □ 아직 미확인")
    para("Heading 2", "6 ‘같으면’과 ‘이상’은 어떻게 다른가요")
    para("Normal", "걸음이 9에서 +2를 누르면 ‘딱 10과 같으면’ 조건은 맞나요 · ‘10 이상’이면 어떻게 되나요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 수정 전 버전   □ 수정 후 버전   □ 직접 관찰과 이유")
    doc.save(SRC)
    print(SRC)


main()
