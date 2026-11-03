"""교사용 안내서·새 기능 보충 안내의 영어판 Word를 만든다. 한국어 Word의 배치를 그대로 두고 글만 바꾼다.

굵은 글자가 섞인 문단은 글자 묶음(run)마다 번역하지 않고, 문단 전체를 번역한 뒤 첫 묶음의 서식으로 넣는다.
번역표: scripts/docs-en.json (한국어 문단 → 영어). 글이 길어 넘치지 않게 글자 크기를 조금 줄인다.
사용: python3 scripts/make-docs-en.py
      python3 scripts/docx-to-pdf.py public/materials/teacher-guide-en.docx public/materials/teacher-guide-en.pdf
      python3 scripts/docx-to-pdf.py public/materials/new-features-guide-en.docx public/materials/new-features-guide-en.pdf
"""
import json
import sys

import docx
from docx.oxml.ns import qn
from docx.shared import Pt

PAIRS = [
    ("public/materials/teacher-guide.docx", "public/materials/teacher-guide-en.docx"),
    (
        "public/materials/new-features-guide.docx",
        "public/materials/new-features-guide-en.docx",
    ),
]
table = json.load(open("scripts/docs-en.json", encoding="utf-8"))
KO = lambda s: any("가" <= c <= "힣" for c in s)


def swap(p, missing):
    text = p.text.strip()
    if not text or not KO(text):
        return
    en = table.get(text)
    if en is None:
        missing.add(text)
        return
    nodes = p._p.findall(".//" + qn("w:t"))
    nodes[0].text = en
    nodes[0].set(qn("xml:space"), "preserve")
    for n in nodes[1:]:
        n.text = ""
    if p.runs and len(en) > len(text) * 1.5:
        size = p.runs[0].font.size or (p.style.font.size if p.style else None)
        if size:
            p.runs[0].font.size = Pt(max(7.5, size.pt - 1))


def convert(src, out, shrink=0.0):
    doc = docx.Document(src)
    # 영어가 길어 쪽수가 늘면 본문 글자를 조금 줄여 한국어판과 같은 쪽수에 맞춘다.
    if shrink:
        base = doc.styles["Normal"].font.size
        if base:
            doc.styles["Normal"].font.size = Pt(base.pt - shrink)
    missing = set()
    paragraphs = list(doc.paragraphs)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                paragraphs += cell.paragraphs
    for s in doc.sections:
        paragraphs += s.header.paragraphs + s.footer.paragraphs
    for p in paragraphs:
        swap(p, missing)
    doc.core_properties.language = "en-US"
    for style in doc.styles:
        rpr = getattr(style.element, "rPr", None)
        if rpr is not None:
            lang = rpr.find(qn("w:lang"))
            if lang is not None:
                lang.set(qn("w:val"), "en-US")
    if missing:
        sys.exit(f"{src}: 번역이 없는 문단 {len(missing)}개: " + " | ".join(sorted(missing)[:5]))
    doc.save(out)
    print(out)


SHRINK = {"public/materials/new-features-guide.docx": 0.5}
for src, out in PAIRS:
    convert(src, out, SHRINK.get(src, 0.0))
