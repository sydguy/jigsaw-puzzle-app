# Mobile Create Puzzle review — 6 October 2026

## Latest owner refinement

Populated review now follows [the new selected-image reference](<../design/mobile/mobile-create puzzle populated.png>). The external browser dropdown offers **Before adding image** and **After adding image**, initially Before. Switching uses display state only; actual imports automatically show After and retain their real image, while a fresh review uses the isolated generated mountain-lake sample. No sample ID/image enters the draft, collection or IndexedDB. The same controls/settings survive state changes.

Both states retain Ready to Create guidance above the image. After shows a full unstretched 3:2 image, six-point inner inset, rounded corners, dashed border and bottom-right translucent Change image pill with a code-drawn camera glyph. The populated Create button uses the gradient, but remains disabled; a notice in the external review toolbar explains that gameplay is not connected. The old inline picture title/setup-summary and redundant change link are superseded.

To fit the full picture, populated-only gaps are six points on iPhone and ten on Android, with 68-point readiness art, two-point size-card gaps and 48-point preset targets. Empty-state ten/fourteen-point gaps remain intact. Screenshot comparison confirmed both before/after states fit at 390×844 and 412×915 without scrolling at default text size. Overflow fallback remains for smaller screens/enlarged text. Native and tablet layouts remain unverified and unchanged by this pass.

Intentional reference differences: system fonts/palette/sentence case remain authoritative; default linked grid is 6×9, not the raster's invalid 4×4, and 12×18 is 216 pieces, not 212. The mountain-lake asset is generated matching artwork, not pixel-identical photography; see [asset provenance and prompt](../graphics/create-review/README.md). It is guarded by development-only loading. White camera glyph is native code geometry, not a missing raster asset.

Evidence: isolated Edge screenshots in `.cache/create-review/iphone-populated.png` and `android-populated.png`, plus each layout's before-state `*-top.png`; measured results in `results.json`. Mobile control checks pass, including both selector states, 3:2 aspect, default Timer, keyboard operation, linked grids, rotation, no-scroll fit and draft retention. These are browser checks, not native validation.

Final checks: TypeScript and production web export pass. The production export contains neither the review selector labels nor the sample artwork path. Actual photo import, quota-failure retry, collection rename/delete persistence, navigation, all four collection layouts and future-database preservation checks pass with no captured browser errors. Documentation validation preserves all seven archive hashes and maps all 24 original security bullets. Populated content/viewport measurements are 784/784 points on iPhone and 847/847 on Android.

Latest iPhone spacing follow-up: compact phone section gaps increased from six to ten points. Android retains fourteen-point gaps. Typography, image-panel height and tap targets are unchanged; the default iPhone form must still fit without scrolling.

Android spacing follow-up: both phone layouts now share the 170-point Add Image prompt (172 including border), 64-point camera box and eight-point copy separation. Taller Android section gaps increased from 10 to 14 points; iPhone's compact six-point gaps remain. Both empty phone previews are checked for no vertical overflow. This supersedes the earlier taller Android image-pane geometry.

Latest order change: the readiness/setup-summary box now sits directly below the page header and above Add Image on mobile, in both empty and selected-image states. Its styling and the compact iPhone geometry are retained.

One-page iPhone follow-up: for phone viewports up to 860 points high, the empty image prompt is now 170 points, header padding is reduced, inter-card gaps are six points and readiness artwork is 68 points. Text and control target sizes are unchanged. The full default 390x844 setup, including Create and its status note, fits without scrolling. The 412x915 Android layout retains its previous geometry. Selected-image and enlarged-text layouts can still scroll instead of clipping controls. The mobile check includes an explicit scrollHeight/clientHeight fit assertion and fresh screenshots for both phone sizes.

Removed the inline Choose from My Collection link in both empty and selected-image states. Replaced the platform-rendered switch visual with the exact design-board shape from `design/system/system.css`: 48x28 pill, 2-point border, 20-point white thumb, #B7B2C9 off fill, controlBorder outline and primary-violet on fill. The labelled row retains switch semantics and keyboard/tap operation.

Timer faces are now 36 points high inside 48-point touch targets; the timer card is reduced from 100 to 88 points. Mobile Create uses the shared scroll container with its indicator hidden, retaining wheel/touch/keyboard scrolling. Other screens and tablet layouts retain their existing indicators. These changes supersede the initial review details below. Five attachments arrived with the request; the reference to a sixth was treated as part of the same mobile Create scrollbar request.

Follow-up verification: mobile screenshots were recaptured and compared at both phone sizes, including rotation off/on and the selected-image state. Mobile interaction checks, TypeScript and the broader import/persistence/navigation regression passed. The hidden indicator is scoped through an optional shared-scroll prop whose default remains visible. Home's first regression run reached its final reload with no browser errors but timed out waiting for network idle; its test now waits for the actual empty Home heading after DOM readiness.

The complete Home regression rerun passed all four layouts, including reload and seed isolation. Documentation/archive checks and diff whitespace checks also passed. Native verification remains deferred.

Reference: [latest mobile design](<../design/mobile/mobile-create puzzle.png>). Scope is mobile only, entered through Home's Add Puzzle action. Home was previously approved; neither Home nor the tablet layout was redesigned. Native execution and milestone acceptance remain unverified.

## Decisions and artwork

- Fresh setup defaults to **Timer** (countdown), as explicitly confirmed by the owner. The three choices are Timer / Stopwatch / None. None means timing off; it is not an expired-countdown continuation or a timed success. Existing draft choices are retained during navigation.
- Preserve linked 3:2 grids, presets 54/96/150/216 and rotation initially off. The reference's independent 4x4 and 212-piece labels are superseded by these confirmed rules. Initial grid remains the existing 6x9/54 configuration.
- Use the new owner-supplied camera-circle art and existing puzzle, timer and readiness art. The missing rotation illustration was generated with the built-in image tool and saved in graphics. [Asset provenance and complete prompt](../graphics/puzzle-setup-assets.md).
- DESIGN-SYSTEM.md palette, platform system fonts, sentence-case controls and primary-action geometry override raster inconsistencies. Timer is the visible label for the internal countdown value, per the latest owner decision.

## Implementation and comparison

The mobile component is isolated in `src/create/MobileCreatePuzzle.tsx`; `app/create.tsx` keeps the existing tablet composition. Only the shared draft type/default changes for the newly approved modes; tablet visual iteration is still pending.

The mobile page has a centred title/back control, dashed image panel, grouped steppers and Quick Picks, a three-option timer pill, rotation row, readiness panel and disabled Create action. Back/plus/minus are crisp code shapes. The rotation row is one labelled switch target; the timer group exposes selected radio state and supports keyboard arrows/Space. No new dependency was added.

Build/capture/compare/refine:

1. Built from the updated mobile reference and inspected 390x844/412x915 browser captures.
2. Tightened size-card gaps, preset spacing and readiness artwork to match the compact reference proportions while retaining separate 48-point targets. The Add Image pane remains 222 points including its border; size card is 219, timer card 100, rotation row 70, readiness 104–108 depending on wrapping.
3. A test found checked state absent from the browser accessibility tree even though Timer was drawn selected. Added explicit ARIA checked state. A second check found Space did not activate custom radio semantics; added keyboard handling and arrow navigation. These were actual UI defects, not native-test results.
4. Captured and reviewed the selected-image and None states after real browser import. Set the switch thumb explicitly to the surface colour to avoid the browser's unrelated teal default.

Intentional differences from literal raster pixels:

- Sentence case, design-system colours and system fonts; no phone bezel/status bar fabricated inside the app.
- Valid 6x9 initial grid, computed 216 count and explicit preset selection.
- The form scrolls with the shared violet/lavender scrollbar. Header stays fixed; sufficient space is retained for touch targets and readable copy.
- Create stays visibly disabled with an explanation because the gameplay engine is not connected. A bright enabled-looking button would falsely imply that a puzzle can currently be started.
- Imported images retain a full 3:2 preview with title/change/collection actions. No selected-image reference was supplied, so that state preserves the existing functional flow and is still subject to owner review.
- Existing browser input limit is 10 MiB with additional decoded-size bounds; the displayed 10 MB label reflects that implementation, not certification of native image handling.

## Evidence and remaining limits

`tools/check-mobile-create.cjs` captures `.cache/create-review/iphone-top.png`, `iphone-bottom.png`, `iphone-none.png` and corresponding Android top/bottom views, plus measured dimensions in `results.json`. It checks Home entry, Timer default, all modes, keyboard choice, linked grid endpoints/presets, rotation and source/Home-return draft retention.

`tools/check-browser.cjs` additionally checks None after image import and the Timer off summary, with selected-image captures in `.cache/browser-check/create-selected-image.png` and `create-selected-none.png`. It retains coverage for rejected images, crop cancellation, storage failure/retry, collection persistence and navigation.

Verification results are recorded after the final pass below. These captures and checks do not establish literal pixel identity, real-device font scaling, native permissions, functional gameplay or owner acceptance. Countdown durations remain an owner decision before beta. Draft settings are in-memory; this pass does not promise persistence across closing/reloading the app.

Final checks: TypeScript passed; mobile Create checks passed at both phone sizes; the existing browser/import/persistence regression passed; all four Home layout regressions passed; production web export succeeded (11 routes). Documentation validation passed with seven unchanged archive hashes, 24 security mappings and 16 active documents. `git diff --check` passed. An earlier browser run timed out during Create navigation while the development bundle was refreshing; subsequent complete runs passed with no browser console/page/network errors. No EAS build or native test was run. Owner-supplied mobile/tablet reference changes, camera art and the unrelated new photo-gallery reference were preserved.
