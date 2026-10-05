# Browser implementation — 5 October 2026

Status: first browser UI and local collection increment, spanning parts of M2/M4. This is not full milestone acceptance or a playable game.

## Implemented

- Main routes now belong to an Expo Router tab group. Native builds use SDK 55 NativeTabs from expo-router/unstable-native-tabs. Web retains a separate design-matched bar; it does not emulate native tabs. Owner explicitly accepts OS-controlled iPad tab positioning/appearance.
- Generated navigation artwork is stored in graphics/navigation_home.png, navigation_collection.png and navigation_settings.png; generation provenance is in graphics/navigation-assets.md.

- Expo Router routes: Home, My Collection, Create Puzzle, image sources, picture details and Settings.
- Explicit iPhone-sized, Android-phone-sized, tablet portrait and tablet landscape browser fixtures; fit-to-window or full logical size. These are layout fixtures, not OS simulators.
- Supplied artwork and design tokens, empty first Home, correct navigation labels, hidden deferred AI elements and truthful guest/no-pack state.
- Linked 2×3 through 16×24 grids, approved quick picks, rotation off initially and stopwatch/countdown setup. Draft survives source-screen return. Countdown durations remain unapproved.
- One personal picture at a time through the browser file picker; actual PNG/JPEG header and decoder checks; bounded 3:2 crop with zoom and position; editable title; metadata-free JPEG output.
- Browser-local picture storage with commit acknowledgement, read/write error states and retry. Collection grid/detail, search, newest/oldest ordering, rename and explicit delete confirmation.
- Three phone/six tablet collection columns, including portrait tablet.
- Local sound/haptic preference persistence. Audio and haptic effects themselves await gameplay/native implementation.
- Settings categories with honest unavailable-service states; phone Billing hides bottom navigation and tablet Billing retains it.

## Boundaries and safety

The web repository uses IndexedDB for this local browser workflow. It does not replace the planned SQLite/private-file native adapter. Native storage currently reports unavailable. Nothing uploads personal pictures; no account, payment, ad, analytics or subscription state is fabricated.

Initial browser import limits: 10 MiB encoded, 24 million decoded pixels, 8,192 pixels maximum per side; output 1,536×1,024 JPEG. These are provisional engineering limits for browser review, not approved native promises. Header checks occur before decode and decoded dimensions are checked again. User SVG/active formats are rejected. Crops are bounded; cancelled selections add no record. Only committed writes update visible local data.

Stored pictures have a schema-validated ID, title, source/theme, timestamp, dimensions and bounded JPEG data. A newer IndexedDB version is refused without rewriting it. Failed writes preserve the crop for retry and do not acknowledge a save. Native save snapshots, recovery, account scopes and puzzle attempts are not implemented by this collection adapter. Large-library paging, cross-tab changes, memory pressure and native image-decoder validation remain M4 work.

No puzzles exist in this increment, so Home counts, Times Used and associated-puzzle deletion counts are zero. These must come from actual puzzle/attempt records when gameplay is connected. Create Puzzle is explicitly disabled with a nearby explanation. Changing this button to create a fake puzzle is not acceptance.

## Verification

- TypeScript strict check and production web export: passed on the final source; eight routes exported.
- tools/check-image-bounds.cjs: 108 crop boundary/aspect cases plus invalid format, excessive allocation and invalid crop rejection passed.
- tools/check-browser.cjs: isolated Edge context verifies navigation, four layouts, draft retention, linked setup, file rejection, crop cancellation, import, quota-failure/retry, rename/delete after refresh, grid widths, search, preference persistence, Billing navigation and preservation of a future database version.
- Test images are generated inside the isolated browser test. They are not production catalogue artwork and are never inserted into the owner's normal browser storage.
- Screenshots in .cache/browser-check/: phone Home, phone/Android Collection and tablet Collection in both orientations. Reviewed for fit, readable content and fixed bottom navigation; not a full visual/accessibility acceptance.
- Original imported references remain unchanged. No EAS build requested.

Run the image test with Node 24 through tools/with-node.ps1, passing node and tools/check-image-bounds.cjs. Browser checks require Playwright plus installed Microsoft Edge, and the Expo server on port 8081. Use installed Playwright or the workstation bundled dependency directory via NODE_PATH; the script does not embed a personal runtime path.

## Next implementation work

Implement and independently test the gameplay engine, then connect the agreed renderer to real puzzle/attempt records. Add durable progress/recovery, camera, full catalogue/filtering and the remaining service flows. Native builds stay deferred under the owner's current instruction. M2 owner review, M3 engine evidence, full M4 durability and production security acceptance remain open; the previously recorded dependency audit findings remain unresolved.
