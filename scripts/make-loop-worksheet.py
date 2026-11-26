"""반복 계산기 활동지(보충 차시, 앞뒤 2쪽)를 학생 활동지 Word 파일 끝에 더한다.

scripts/make-rule-worksheet.py와 같은 방법(5차시 서식을 본으로 복사)을 쓴다. 분류하기 앱 활동지 뒤에 붙는다.

기존 5차시 활동지의 문단·표 서식을 그대로 복사해 쓰므로 배치가 다른 차시와 같다.
사용: python3 scripts/make-loop-worksheet.py
      python3 scripts/docx-to-pdf.py public/materials/student-worksheets.docx public/materials/student-worksheets.pdf
      (영어판은 scripts/make-worksheets-en.py가 같은 번역표로 만든다)
"""
import copy

import docx
from docx.oxml.ns import qn

SRC = "public/materials/student-worksheets.docx"
MARK = "보충 차시 반복 계산기 앞면"


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
    para("Normal", "오늘 할 일  같은 일을 되풀이하며 값이 어떻게 쌓이는지 보고, 한 번 더 도는 반복을 찾아 고친다.")
    para("Normal", "도입 5분  →  활동 30분  →  정리 5분")
    para("Normal", "미션 열기  어라? 한 번 더 뛰었어요!")
    para("Heading 2", "1 반복의 세 가지 숫자")
    para("Normal", "처음 값은 얼마인가요 · 한 번에 얼마씩 바뀌나요 · 몇 번 반복하나요")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "2 누르기 전에 예상해요")
    table(
        [
            ["반복한 횟수", "예상한 값", "실제 값"],
            ["1번", "", ""],
            ["3번", "", ""],
            ["끝까지", "", ""],
        ]
    )
    para("Heading 2", "3 이상한 점을 짧게 적어요")
    para("Normal", "점은 몇 개 켜졌나요 · 정한 횟수와 무엇이 다른가요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 자동 검사   □ 내가 직접 확인   □ 아직 미확인")
    # 뒷면
    para("Heading 1", "보충 차시 반복 계산기 뒷면", page_break=True)
    para("Normal", "날짜 __________   모둠 ______   나의 별칭 __________")
    para("Normal", "앱은 몇 번 했는지 세다가 정한 횟수가 되면 멈춰요. 끝난 값은 처음 값 + 바뀌는 값 × 횟수예요.")
    para("Heading 2", "4 반복 세는 방법을 고쳐요")
    para("Normal", "고치기 전  ____번 반복해서 ____개   →   고친 뒤  ____번 반복해서 ____개")
    para("Normal", "그렇게 고친 까닭")
    para("Writing", line)
    para("Writing", line)
    para("Heading 2", "5 같은 방법으로 다시 검사해요")
    table(
        [
            ["검사할 것", "기대한 결과", "실제 결과"],
            ["끝까지 반복", "", ""],
            ["끝난 뒤 한 번 더 누르기", "", ""],
            ["처음으로 다시", "", ""],
        ]
    )
    para("Normal", "내 판정  □ 기대와 같음   □ 수정할 점 있음   □ 아직 미확인")
    para("Heading 2", "6 조건에 맞으면 멈추는 반복")
    para("Normal", "‘7번 반복’과 ‘3000원 이상이 되면 멈추기’는 무엇이 다른가요 · 300씩 늘 때 ‘1000과 같으면 멈추기’는 왜 멈추지 않나요")
    para("Writing", line)
    para("Writing", line)
    para("Normal", "□ 수정 전 버전   □ 수정 후 버전   □ 직접 관찰과 이유")
    doc.save(SRC)
    print(SRC)


main()
