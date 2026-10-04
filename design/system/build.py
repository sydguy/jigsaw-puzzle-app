"""Build the design reference from local assets. Does not mutate imported sources."""
from pathlib import Path
import json, re, html, hashlib

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent.parent
tokens = json.loads((BASE / 'tokens.json').read_text(encoding='utf-8'))
colors = tokens['color']
lines = ['/* Generated from tokens.json by build.py. Proposed design tokens. */', ':root {']
for name, value in colors.items():
    key = re.sub(r'([A-Z])', lambda m: '-' + m[1].lower(), name)
    lines.append(f'  --jf-{key}: {value};')
(BASE / 'tokens.css').write_text('\n'.join(lines + ['}', '']), encoding='utf-8')
(BASE / 'tokens.ts').write_text('// Design proposal only. Review before app adoption.\nexport const designTokens = ' + json.dumps(tokens, indent=2) + ' as const;\n', encoding='utf-8')

def lum(value):
    rgb = [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
    rgb = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    return sum(v * w for v, w in zip(rgb, [.2126, .7152, .0722]))

def contrast(a, b):
    x, y = sorted([lum(a), lum(b)])
    return (y + .05) / (x + .05)

pairs = [('text', 'canvas', 4.5), ('textSecondary', 'canvas', 4.5), ('textSecondary', 'surfaceSoft', 4.5), ('primary', 'surface', 4.5), ('surface', 'primary', 4.5), ('surface', 'gradientStart', 4.5), ('surface', 'gradientEnd', 4.5), ('success', 'successSoft', 4.5), ('danger', 'dangerSoft', 4.5), ('warning', 'warningSoft', 4.5), ('info', 'infoSoft', 4.5), ('surface', 'danger', 4.5), ('controlBorder', 'surface', 3), ('focus', 'surfaceSoft', 3)]
checks = []
for fg, bg, minimum in pairs:
    ratio = contrast(colors[fg], colors[bg])
    checks.append({'foreground': fg, 'background': bg, 'ratio': round(ratio, 2), 'minimum': minimum, 'passed': ratio >= minimum})
for name in ['hint', 'preview', 'restart', 'shuffle']:
    for value in tokens['gradient'][name]['colors']:
        ratio = contrast('#FFFFFF', value)
        checks.append({'foreground': '#FFFFFF icon', 'background': value, 'role': name, 'ratio': round(ratio, 2), 'minimum': 3, 'passed': ratio >= 3})
# Sample the primary gradient in sRGB to catch weak intermediate stops as well.
start, end = [[int(colors[key][i:i+2], 16) for i in (1, 3, 5)] for key in ['gradientStart', 'gradientEnd']]
gradient_min = min(contrast('#FFFFFF', '#' + ''.join(f'{round(a+(b-a)*t/100):02X}' for a,b in zip(start,end))) for t in range(101))
checks.append({'foreground': '#FFFFFF', 'background': 'primary gradient (101 sRGB samples)', 'ratio': round(gradient_min, 2), 'minimum': 4.5, 'passed': gradient_min >= 4.5})
(BASE / 'review/contrast.json').write_text(json.dumps(checks, indent=2) + '\n', encoding='utf-8')

def disposition(p):
    n = p.name.lower()
    if 'ai' in n and (n.startswith('ai_') or 'ai.' in n or '-ai-' in n or '_ai_' in n) or 'combo' in n:
        return 'Deferred AI; preserve but exclude from v1'
    if 'portrait' in p.parts:
        return 'Generated portrait adaptation; correct columns, crop, tray and legacy content against active requirements'
    if 'billing' in n:
        return 'Retain styling; exclude AI/combo, use verified prices/history and no receipt PDFs'
    if 'account' in n:
        return 'Retain styling; remove obsolete account fields/copy where specified'
    if 'photo gallery' in n:
        return 'Visual reference only; use OS photo picker in v1'
    if 'collection' in n:
        return 'Retain visual pattern; three phone/six tablet columns, actual source selection and owned rules'
    if 'puzzle' in n and p.suffix == '.png' and 'design' in p.parts:
        return 'Retain visual pattern; approved linked grids, clocks, tray and rotation rules govern'
    return 'Retain visual language; active written requirements govern behaviour'

inventory = []
sections = []
for title, folder, pattern in [('Phone / 15 screens', 'design/mobile', '*.png'), ('Tablet landscape / 14 screens', 'design/tablet', '*.png'), ('Tablet portrait / 14 adaptations', 'design/tablet/portrait', '*.png'), ('Graphics / 33 assets', 'graphics', '*')]:
    cards = []
    for p in sorted((ROOT / folder).glob(pattern)):
        if p.suffix not in ['.png', '.svg']: continue
        relative = p.relative_to(ROOT).as_posix()
        state = disposition(p)
        inventory.append({'path':relative, 'disposition':state, 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
        src = '../../' + relative
        cards.append(f'<figure><a href="{html.escape(src, quote=True)}"><img loading="lazy" src="{html.escape(src, quote=True)}" alt="{html.escape(p.stem)}"></a><figcaption><b>{html.escape(p.name)}</b><p>{html.escape(state)}</p></figcaption></figure>')
    sections.append(f'<h2>{title}</h2><div class="gallery">' + ''.join(cards) + '</div>')
(BASE / 'review/source-inventory.json').write_text(json.dumps(inventory, indent=2) + '\n', encoding='utf-8')
(BASE / 'sources.html').write_text('''<!doctype html><html lang="en-AU"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Source gallery · Jigsaw design system</title><style>body{max-width:1600px;margin:auto;padding:32px;background:#f7f7fe;color:#17124f;font:16px/1.5 system-ui}a{color:#5430e8}h1{font-size:32px}h2{margin-top:40px}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}figure{margin:0;padding:16px;background:white;border:1px solid #dad7ee;border-radius:16px}img{width:100%;height:280px;object-fit:contain}b{font-size:13px;overflow-wrap:anywhere}p{color:#625b87;font-size:12px}</style><a href="index.html">← Design system</a><h1>The source library</h1><p>Original supplied designs, preserved unchanged. These images include legacy and generated content; the active requirements and design specification state the corrections.</p>''' + ''.join(sections) + '</html>', encoding='utf-8')
print(f'Built token exports, source gallery ({len(inventory)} images) and {len(checks)} contrast checks.')
failed = [check for check in checks if not check['passed']]
print('Contrast failures:', json.dumps(failed))
if failed: raise SystemExit(1)
