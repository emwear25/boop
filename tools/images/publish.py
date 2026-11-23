# Converts tools/images/out/*.jpg into web-ready WebP under public/img.
# Product shots: <name>.webp (1400w) and <name>-sm.webp (700w). Scenes: 2400w.
# Usage: python3 tools/images/publish.py
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[2]
src, dst = root / 'tools/images/out', root / 'public/img'
(dst / 'p').mkdir(parents=True, exist_ok=True)
n = 0
for f in sorted(src.glob('*.jpg')):
    im = Image.open(f).convert('RGB')
    if f.stem.startswith('scene-'):
        out = dst / f'{f.stem}.webp'
        if not out.exists() or out.stat().st_mtime < f.stat().st_mtime:
            im.thumbnail((2400, 2400)); im.save(out, 'WEBP', quality=80, method=6); n += 1
        continue
    for w, suffix, q in ((1400, '', 80), (700, '-sm', 78)):
        out = dst / 'p' / f'{f.stem}{suffix}.webp'
        if out.exists() and out.stat().st_mtime >= f.stat().st_mtime: continue
        c = im.copy(); c.thumbnail((w, w * 2)); c.save(out, 'WEBP', quality=q, method=6); n += 1
print(n, 'files written')
