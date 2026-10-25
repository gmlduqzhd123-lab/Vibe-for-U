"""Regenerate the committed local QR paths with ReportLab (not needed for npm builds)."""
from pathlib import Path
import json
from reportlab.graphics.barcode.qrencoder import QRCode, QRErrorCorrectLevel

BASE = 'https://gmlduqzhd123-lab.github.io/Vibe-for-U/'
routes = [('home', 'home'), ('try', 'try')] + [(f'lesson-{i}', f'lesson/{i}') for i in range(1, 9)]
result = {}
for key, route in routes:
    url = BASE + '#/' + route
    qr = QRCode(None, QRErrorCorrectLevel.M)
    qr.addData(url)
    qr.make()
    parts = [f'M{x+4} {y+4}h1v1h-1z' for y, row in enumerate(qr.modules) for x, dark in enumerate(row) if dark]
    result[key] = dict(url=url, size=len(qr.modules)+8, path=''.join(parts))
target = Path(__file__).resolve().parents[1] / 'src' / 'qrData.ts'
target.write_text('export const qrData: Record<string, {url: string; size: number; path: string}> = ' + json.dumps(result, ensure_ascii=False) + ';\n', encoding='utf-8')
print('Generated 10 QR paths with M correction and four-module quiet zones.')
