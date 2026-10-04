# Jigsaw Fun Time design system

Owner-review proposal, version 0.1, 5 October 2026.

- [Interactive visual board](index.html): 24 component groups and three layout studies.
- [Board image](design-system-board.jpg): full-page visual export.
- [Full specification](DESIGN-SYSTEM.md): foundations, component contracts, screen/state patterns, accessibility, responsive rules and handoff.
- [Tokens](tokens.json), [TypeScript export](tokens.ts), [CSS export](tokens.css).
- [Source gallery](sources.html): all 43 design screens and 33 graphics assets with dispositions.
- [Verification](review/verification.md): actual checks and unverified work.

Open `index.html` directly in a browser. All resources are local. The interactive selections and confirmation dialog are reversible demonstrations and do not change app data.

From the repository root, `python design/system/build.py` regenerates the token exports, gallery and contrast evidence. It does not edit original designs. The images in `specimens/` are traceable screenshot crops for this design document only, not approved catalogue content.

The approved project requirements govern behaviour. This package does not accept a milestone, finalise branding, implement the production app or alter the Expo compatibility harness.
