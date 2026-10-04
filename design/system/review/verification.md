# Design artifact verification

5 October 2026 · Proposal v0.1

## Performed

- Reviewed contact sheets for all 43 screen PNGs (15 mobile, 14 tablet landscape, 14 tablet portrait), 32 PNG graphics and one SVG; inspected representative Create, Home and gameplay screens at full size. Read graphics asset metadata and portrait provenance, plus all required active project documents and the UI/state inventory.
- Verified that every entry in `tablet-portrait-designs.zip` matches its extracted counterpart by SHA-256.
- Ran `python design/system/build.py`: exit 0. Generates 76-image source inventory/gallery, CSS and TypeScript token exports, and 23 contrast checks. All specified pairs passed their declared 4.5:1 text or 3:1 icon/control targets. Primary gradient was sampled at 101 sRGB positions. This is token-pair evidence, not full accessibility certification.
- Loaded the board in the Codex in-app browser using a loopback-only Python server. All image elements loaded. Inspected the default desktop screenshot and full-page export.
- Checked board reflow at viewport widths 320, 390, 768, 1024 and 1600. No horizontal document overflow or internal overflow in component panels/device studies was found. The board used one/two/three/four columns as appropriate; the tablet specimen retained six image columns. Measurements are in `responsive.json`.
- Exercised the 12×18 preset: output changed to 216 pieces and exclusive selected state updated.
- Exercised source selection: Curated Collections acquired the selection tick and Camera cleared.
- Exercised Exclude owned: switching off exposed the dimmed, labelled Already owned specimen.
- Opened the deletion demonstration: actual dialog opened with the linked-puzzle scope and focus on Cancel. Dismissal returned focus to the Delete picture trigger. An initial unscoped Cancel selector was ambiguous; the dialog-scoped retry passed. No app files or pictures were deleted.
- Final SHA-256 preservation check passed: all 83 original files unchanged, zero missing. HTML and Markdown local-link checks found zero missing targets. `node --check design/system/system.js` exited 0. Browser error/warning log returned no entries during the board check.
- Inspected the 390-pixel mobile presentation, saved `phone-board.jpg`, and exported the complete desktop board to `../design-system-board.jpg`. Temporary responsive viewport overrides were reset after verification.

## Limits / unverified

- No native application components were implemented, and no Expo, iOS or Android tests were started. Existing compatibility harness and imported assets were not modified.
- Native screen-reader behaviour, Dynamic Type/font scaling, gestures, reduced-motion rendering, older-OS compatibility and physical-device performance are unverified. CSS includes focus and reduced-motion treatments, but their presence is not native test evidence.
- The small device studies are scaled composition diagrams, not production-size accessible screens or working gameplay. Text glyphs are utility-icon placeholders; the complete vector utility set and final brand/app icon remain open.
- Purchase, allowance, reward, consent, permission, account, storage and network behaviours are design contracts, not connected services. Balances, pictures and progress on the board are explicitly illustrative.
- Final colour/type/spacing approval, missing-state visual acceptance and M2 acceptance remain with the owner under the existing milestone process. This artifact does not change any release gate.

See `source-hashes.json` for the pre-work 83-file baseline and `integrity.json` for the final preservation result. `source-inventory.json` identifies the 76 screen/graphic images and their interpretation. `specimens/provenance.json` (one directory above this review directory) records review-only crops.
