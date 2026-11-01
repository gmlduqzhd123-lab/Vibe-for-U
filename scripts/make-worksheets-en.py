"""차시별 학생 활동지 영어판을 만든다. 한국어 Word 파일의 배치를 그대로 두고 글만 바꾼다.

번역표는 scripts/worksheets-en.json(한국어 문단 → 영어)에 있다. 영어 글이 길어 넘치지 않도록 글자 크기를 조금 줄인다.
사용: python3 scripts/make-worksheets-en.py
      python3 scripts/docx-to-pdf.py public/materials/student-worksheets-en.docx public/materials/student-worksheets-en.pdf
"""
import json
import sys

import docx
from docx.shared import Pt

SRC = "public/materials/student-worksheets.docx"
OUT = "public/materials/student-worksheets-en.docx"
table = json.load(open("scripts/worksheets-en.json", encoding="utf-8"))
doc = docx.Document(SRC)
missing = set()


def swap(p):
    text = p.text.strip()
    if not text or not any("가" <= c <= "힣" for c in text):
        return
    en = table.get(text)
    if en is None:
        missing.add(text)
        return
    # 첫 글자 칸(w:t)에 영어를 넣고 나머지 칸은 비운다. 링크 안의 글자도 같은 방법으로 바뀐다.
    nodes = p._p.findall(".//" + docx.oxml.ns.qn("w:t"))
    nodes[0].text = en
    for n in nodes[1:]:
        n.text = ""
    if p.runs and len(en) > len(text) * 1.6:
        size = p.runs[0].font.size
        if size:
            p.runs[0].font.size = Pt(max(7, size.pt - 1))


paragraphs = list(doc.paragraphs)
for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            paragraphs += cell.paragraphs
for s in doc.sections:
    paragraphs += s.header.paragraphs + s.footer.paragraphs
for p in paragraphs:
    swap(p)
doc.core_properties.title = "Ttukttak Vibe Workshop · Student worksheets (English)"
doc.core_properties.language = "en-US"
# 문서 언어를 영어로 표시한다(화면 낭독기·맞춤법 검사).
for style in doc.styles:
    rpr = getattr(style.element, "rPr", None)
    if rpr is not None:
        lang = rpr.find(docx.oxml.ns.qn("w:lang"))
        if lang is not None:
            lang.set(docx.oxml.ns.qn("w:val"), "en-US")
if missing:
    sys.exit("번역이 없는 문단: " + " | ".join(sorted(missing)))
doc.save(OUT)
print(OUT)
