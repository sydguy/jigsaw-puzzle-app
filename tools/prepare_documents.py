"""One-time, fail-closed adoption of the approved v1 documentation. No app code."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
ARCHIVE = DOCS / 'superseded'
SOURCE = Path(r'C:\Users\ARIJI\.codex\attachments\7477861d-d674-444b-842a-a4482673cbf3\Pasted text.txt')
NAMES = ['Jigsaw-Development-Handover.md', '04-Jigsaw-Development-Handover-v3-2-.md',
         'decision-log.md', 'owner-decisions-sept26.png', 'owner-ui-decisions.png',
         'historical-asset-map-v1.md', 'security-requirements.md']

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def write(name, text):
    path = DOCS / name
    if path.exists():
        raise RuntimeError(f'Refusing to overwrite {path}')
    path.write_text(text.strip() + '\n', encoding='utf-8')

def main():
    if (DOCS / 'production-v1-plan.md').exists():
        raise RuntimeError('Adoption already started; inspect evidence instead of rerunning.')
    for name in NAMES:
        src, dst = DOCS / name, ARCHIVE / name
        if not src.is_file() or dst.exists():
            raise RuntimeError(f'Unsafe archive operation: {src} -> {dst}')
        if not src.resolve().is_relative_to(ROOT) or not dst.resolve().is_relative_to(ROOT):
            raise RuntimeError('Path escapes workspace')
    plan = SOURCE.read_text(encoding='utf-8').strip()
    security = (DOCS / 'security-requirements.md').read_text(encoding='utf-8')
    ui = '''### Explicit owner-image and UI requirements

- Navigation labels: **Home / My Collection / Settings**.
- Retain full-width tablet bottom navigation on Account, Billing and Legal. Mobile Billing returns to Settings with no bottom menu.
- App collection grids: **three columns on phones, six on tablets**; detailed view is one item per row. The OS photo picker remains the approved device-photo selector.
- Highlight the actual selected image source.
- Exclude-owned ON hides acquired pictures; OFF shows them dimmed and unavailable for another acquisition.
- Remove Country/Timezone from mobile Account and remove child-profile/chat/parent-settings copy.
- Use **Times Used / Date Added / Last Used** and **Preview** consistently.
- Source Back retains the Create Puzzle draft; crop X cancels without adding an item; crop stays within image bounds and outputs 3:2.
- Remove the redundant tablet camera close action.
- Add Picture imports one picture at a time into My Collection.
- Collection-picture deletion confirms the linked-puzzle count and deletes those puzzles; Home-puzzle deletion preserves its picture.
- Allowance fractions explicitly show used out of granted.
- Hide AI-only source tiles, headers and AI/combo products in v1. Deferred AI UI removes the gear and places sparkles on AI/Combo Pack headings, not Create Puzzle.
- Earlier 15x20, Flutter, provisional orientations and strict ad-completion rules are superseded by the interview decisions.
- Deferred AI requirements retain text prompts plus five styles, once-only charging on successful delivery, no charge on failure and consumption on discard. AI is not v1 work.

'''
    local = '''**The primary daily preview runs locally on Windows; cloud simulation is optional.**

Run `npx expo start --web` and open its localhost address. Phone/tablet-sized browser layouts and Fast Refresh share the gameplay engine and Skia web/CanvasKit renderer. This is the web-compatible app, not an iOS/Android OS emulator. No EAS build is needed for local browser iteration.

EAS Build compiles native binaries and is separate from EAS Simulator. Once a native development build is installed, compatible JavaScript/UI edits load from the Windows development server without rebuilding. Native dependencies/configuration changes and standalone test/release artifacts require builds. Physical checks remain required for purchases, ads, permissions, gestures and hardware performance.

M1 must demonstrate both the local Windows browser workflow and a physical-device development-build workflow.

'''
    authority = '''Use this order when references disagree:

1. Latest explicit decisions from the owner.
2. This plan, the consolidated requirements register and incorporated security requirements.
3. Current app design screens for visual details not overridden in writing.
4. v10 prototype as a behavioral reference.
5. Archived documents and owner-decision images for historical traceability only.
'''
    plan = re.sub(r'Use this order when references disagree:.*?5\. Historical implementation proposals\.\n', authority, plan, flags=re.S)
    archive_section = '''### Local plan storage and superseded documents

This plan and its detailed requirements supersede earlier written design/implementation guidance. Map every earlier confirmed decision as retained, superseded or deferred before archiving; omission does not cancel it. Imported bytes remain unchanged.

Save the active plan, requirements register, security requirements and documentation index in docs. Move both handovers, the former decision log, both owner-decision images and historical asset map unchanged into docs/superseded. Archive the original security-requirements.md there and replace its active path with reconciled security guidance.

Retain source-baseline.json, source-inventory.md and source-corrections.md as historical provenance, not active specifications. Retain ai-sparkles-placement.png as a visual reference for deferred AI. Preserve historical CSV/checksum records; create a separate current source index with actual paths, archive mappings and intentionally removed old prototypes. Update README and active documentation links. Check destination collisions and verify hashes before/after moving. Do not rewrite historical manifests to imply they describe the new tree.

M0 acceptance requires complete requirement mapping, unchanged archived hashes, resolving active links and no active Flutter development instruction.

'''
    plan = plan.replace('---\n\n## 2.', archive_section + '---\n\n## 2.', 1)
    plan = plan.replace('Use three complementary workflows:', local + 'Use three complementary workflows:', 1)
    plan = plan.replace('Implement the approved placement rules explicitly:', ui + 'Implement the approved placement rules explicitly:', 1)
    plan = plan.replace('Use Row Level Security and server-side authorization throughout.', 'Public free-catalogue browsing and guest support remain available without account sign-in, with validation and abuse limits.\n\nUse Row Level Security and server-side authorization throughout.', 1)
    plan = plan.replace('- Account for every supplied current screen and approved owner annotation.', '- Account for every supplied current screen and approved owner annotation.\n- Map owner-image and security decisions; save this plan and archive superseded documents with hash verification.', 1)
    plan = plan.replace('Carry forward the security addendum’s intent while replacing obsolete technologies and product rules.', 'Carry forward every applicable protection from the original security requirements, not only this summary. The full reconciled security requirements below are mandatory.\n\n' + reconcile_security(security))
    plan += '\n\n### Documentation and local-preview verification\n\nVerify archive hashes, requirement coverage and active links. Test the three-/six-column grids, source highlighting, exclude-owned state and deletion scope. Demonstrate local browser Fast Refresh without EAS simulation. A check that cannot start is unverified, never passed.\n'
    # Create current replacements before moving any historical file.
    write('production-v1-plan.md', plan)
    write('security-v1-staged.md', reconcile_security(security))
    ARCHIVE.mkdir(exist_ok=True)
    records = []
    for name in NAMES:
        src, dst = DOCS / name, ARCHIVE / name
        before = digest(src)
        src.rename(dst)
        after = digest(dst)
        if before != after:
            raise RuntimeError(f'Archive hash mismatch: {name}')
        records.append({'original': f'docs/{name}', 'archived': f'docs/superseded/{name}', 'sha256': before, 'verified': True})
    (DOCS / 'security-v1-staged.md').rename(DOCS / 'security-requirements.md')
    write('archive-manifest.json', json.dumps({'date': '2026-10-05', 'files': records}, indent=2))
    print(f'Saved plan and security requirements; archived {len(records)} files with matching SHA-256.')

def reconcile_security(text):
    text = text.replace('# Security requirements addendum - 26 September 2026', '# Active v1 security requirements — 5 October 2026')
    text = text.replace('This addendum is mandatory for all subsequent implementation milestones. It supplements Version 3 and preserves its approved gameplay and product decisions.', 'These requirements are mandatory across the approved v1 milestones. The current plan and latest owner decisions supersede historical technology and product rules.')
    text = text.replace('Flutter/Dart', 'React Native/TypeScript').replace('as specified in Version 3', 'as specified in the current plan')
    text = text.replace('## M1 and M2:', '## Local implementation:').replace('## M3-M5:', '## Service implementation:')
    text = text.replace('15 rows by 20 columns, at most 300 pieces', '16 rows by 24 columns, at most 384 pieces')
    text = text.replace('Minimum dimensions remain subject to the existing product decision.', 'Allowed grids are 2x3, 4x6, 6x9, 8x12, 10x15, 12x18, 14x21 and 16x24 only.')
    text = text.replace('Gate rewarded hints on verified completion using the chosen ad integration\'s supported mechanism; prevent duplicate reward callbacks. Do not claim a local callback makes a modified client tamper-proof. Keep failed/canceled ads from mutating puzzle progress.', 'Grant rewarded hints/untimed continuation once on supported completion, or on the owner-approved no-fill/technical-failure fallback. User cancellation grants nothing. Distinguish these outcomes and prevent duplicate grants. Do not claim a local callback makes a modified client tamper-proof.')
    text = text.replace('- Make AI generation and allowance deductions', '- DEFERRED AI (not v1 implementation): Make AI generation and allowance deductions')
    text = text.split('## Repository adoption')[0]
    text += '''## Adoption and explicit supersessions

The original is preserved in superseded/security-requirements.md. This active document is linked from README, DEVELOPMENT.md and AGENTS.md. Security intent is retained; obsolete milestone labels are replaced with subsystem scope.

Supersessions: Flutter/Dart -> React Native/TypeScript; 15x20/300 -> approved grids up to 16x24/384; ad-completion-only -> completion or no-fill/technical failure, never user cancellation. AI protections remain deferred. All other protections remain required. No certification or completed native validation is claimed.
'''
    return text.strip()

if __name__ == '__main__':
    main()
