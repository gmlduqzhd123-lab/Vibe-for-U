"""분류하기 앱 활동지(보충 차시, 앞뒤 2쪽)를 학생 활동지 Word 파일 끝에 더한다.

scripts/make-rule-worksheet.py와 같은 방법(5차시 서식을 본으로 복사)을 쓴다. 만약 규칙 활동지 뒤에 붙는다.

기존 5차시 활동지의 문단·표 서식을 그대로 복사해 쓰므로 배치가 다른 차시와 같다.
사용: python3 scripts/make-sort-worksheet.py
      python3 scripts/docx-to-pdf.py public/materials/student-worksheets.docx public/materials/student-worksheets.pdf
      (영어판은 scripts/make-worksheets-en.py가 같은 번역표로 만든다)
"""
import copy

import docx
from docx.oxml.ns import qn

SRC = "public/materials/student-worksheets.docx"
MARK = "보충 차시 분류하기 앱 앞면"


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
    para("Normal", "오늘 할 일  카드를 조건에 따라 바구니에 나눠 담고, 조건의 순서 때문에 비어 있는 바구니를 찾아 고친다.")
    para("Normal", "도입 5분  →  활동 30분  →  정리 5분")
    para("Normal", "미션 열기  다리가 많아요 바구니가 비어 있어요")
    para("Heading 2", "1 카드의 특징과 바구니 조건")
    para("Normal", "앱은 카드의 어떤 값을 보고 바구니를 고르나요 · 바구니 조건을 위에서부터 차례로 적어요")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "2 넣기 전에 예상해요")
    table(
        [
            ["카드 (다리 수)", "들어갈 것 같은 바구니", "실제로 들어간 바구니"],
            ["닭 (2)", "", ""],
            ["개미 (6)", "", ""],
            ["뱀 (0)", "", ""],
        ]
    )
    para("Heading 2", "3 이상한 점을 짧게 적어요")
    para("Normal", "어느 바구니가 비어 있나요 · 그 바구니에 들어가야 할 카드는 어디로 갔나요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 자동 검사   □ 내가 직접 확인   □ 아직 미확인")
    # 뒷면
    para("Heading 1", "보충 차시 분류하기 앱 뒷면", page_break=True)
    para("Normal", "날짜 __________   모둠 ______   나의 별칭 __________")
    para("Normal", "바구니 조건은 위에서부터 차례로 확인해요. 처음 맞는 바구니 하나에만 넣어요.")
    para("Heading 2", "4 바구니의 순서를 고쳐요")
    para("Normal", "고치기 전 순서  1) 2 이상  2) 6 이상   →   고친 순서  1) ______  2) ______")
    para("Normal", "순서를 바꾼 까닭")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "5 같은 카드로 다시 검사해요")
    table(
        [
            ["카드 (다리 수)", "기대한 바구니", "실제 바구니"],
            ["개미 (6)", "", ""],
            ["고양이 (4)", "", ""],
            ["뱀 (0)", "", ""],
        ]
    )
    para("Normal", "내 판정  □ 기대와 같음   □ 수정할 점 있음   □ 아직 미확인")
    para("Heading 2", "6 딱 기준 값인 카드는 어디로 갈까요")
    para("Normal", "‘120 이상’ 바구니에 키가 딱 120인 친구는 들어가나요 · ‘121 이상’으로 바꾸면 어떻게 되나요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 수정 전 버전   □ 수정 후 버전   □ 직접 관찰과 이유")
    doc.save(SRC)
    print(SRC)


main()
