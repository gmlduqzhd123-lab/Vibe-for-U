"""Word 파일을 PDF로 바꾼다. Word에는 맑은 고딕(영문은 Calibri)을 지정하고, PDF에는 무료 글꼴 Pretendard를 넣는다.

맑은 고딕이 없는 Linux에서 LibreOffice로 바꾸면 다른 글꼴로 대체되므로,
임시 복사본의 글꼴 이름만 Pretendard로 바꿔 변환한다(원래 Word 파일은 그대로 둔다).
Pretendard(SIL OFL 1.1)는 npm의 pretendard 패키지 dist/public/static에서 받아
~/.fonts에 두고 fc-cache -f를 실행해 둔다.

사용: python3 scripts/docx-to-pdf.py 입력.docx 출력.pdf
"""
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

SRC, OUT = sys.argv[1], sys.argv[2]
NAMES = ("Malgun Gothic", "맑은 고딕", "Calibri", "Calibri Light", "Cambria", "Arial", "Times New Roman")
FONT = "Pretendard"

if FONT not in subprocess.run(["fc-list"], capture_output=True, text=True).stdout:
    sys.exit("Pretendard 글꼴이 없어요. 위 안내대로 ~/.fonts에 설치해 주세요.")

with tempfile.TemporaryDirectory() as tmp:
    name = os.path.splitext(os.path.basename(OUT))[0] + ".docx"
    copy = os.path.join(tmp, name)
    with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(copy, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename.endswith(".xml"):
                text = data.decode("utf-8")
                for n in NAMES:
                    text = text.replace(f'"{n}"', f'"{FONT}"')
                data = text.encode("utf-8")
            zout.writestr(info, data)
    subprocess.run(
        ["soffice", "--headless", "--convert-to", "pdf", "--outdir", tmp, copy],
        check=True,
        capture_output=True,
        timeout=180,
    )
    shutil.move(os.path.join(tmp, os.path.splitext(name)[0] + ".pdf"), OUT)
print(OUT)
