"""Validate archive integrity and active local links; regenerate current index."""
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

archive = json.loads((DOCS/'archive-manifest.json').read_text(encoding='utf-8'))
for item in archive['files']:
    assert sha(ROOT/item['archived']) == item['sha256'], item

original = (DOCS/'superseded/security-requirements.md').read_text(encoding='utf-8')
current = (DOCS/'security-requirements.md').read_text(encoding='utf-8')
old_bullets = [x for x in original.splitlines() if x.startswith('- ')]
new_bullets = [x for x in current.splitlines() if x.startswith('- ')]
assert len(old_bullets) == len(new_bullets)
mapping=[]
for i, (old,new) in enumerate(zip(old_bullets,new_bullets),1):
    mapping.append({'id':f'SEC-{i:02}', 'original':old[2:], 'current':new[2:],
        'disposition':'deferred' if 'DEFERRED AI' in new else ('retained' if old==new else 'superseded wording; protection retained'),
        'implemented':False})
(DOCS/'security-traceability.json').write_text(json.dumps(mapping,indent=2)+'\n',encoding='utf-8')

historical={'source-inventory.md','source-corrections.md'}
active=[ROOT/'README.md',ROOT/'DEVELOPMENT.md',ROOT/'AGENTS.md'] + [p for p in DOCS.glob('*.md') if p.name not in historical]
broken=[]
for p in active:
    for href in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if '://' in href or href.startswith('#') or href.startswith('mailto:'): continue
        path=unquote(href.split('#')[0].strip('<>'))
        if not (p.parent/path).exists() and path != 'current-source-index.json': broken.append(f'{p.name}: {href}')
assert not broken, broken

files=[]
for folder in ['docs','design','graphics','prototype','website']:
    for p in sorted((ROOT/folder).rglob('*')):
        if p.is_file() and p.name!='current-source-index.json':
            files.append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)})
index={'date':'2026-10-05','purpose':'Current source paths; historical manifests remain unchanged',
       'archiveMappings':archive['files'],
       'intentionallyAbsent':['prototype/jigsaw-v8.jsx','prototype/jigsaw.html'],
       'historicalTemporaryFileAbsent':'checksums.tmp','files':files}
(DOCS/'current-source-index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(archive["files"])} archive hashes; {len(mapping)} security bullets mapped; {len(active)} active documents link-checked; {len(files)} current source records.')
