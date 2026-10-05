# Home visual review — 6 October 2026

Scope: Home only. Existing navigation remains unchanged and owner-approved. This is browser visual review, not gameplay, billing or native acceptance.

## Latest pass: mobile only

Fixed-header/floating-tab follow-up: mobile Home now separates its fixed theme/hero/sort region from the scrolling card viewport. The viewport clips cards at the first-card boundary; the scrollbar starts there with zero top inset. Its lower endpoint remains eight points above the tab panel. Browser Home tabs overlay the content with a soft shadow and retain their previous size/position. Additional scroll-end padding keeps the final card completely reachable above the panel. Empty Home uses the same structure. Tablet and other screen compositions remain unchanged.

Verified this follow-up with TypeScript and both Home scripts: first-card/rail alignment, unchanged lower endpoint, fixed header/hero/sort/tab geometry while scrolling, last-card visibility, sorting, four layout regressions, mouse/touch swipe, deletion/cancellation, balances and fixture reset all passed. Updated top/bottom captures are in `.cache/home-review/iphone-populated.png`, `iphone-scrolled.png` and their Android equivalents. Native execution remains unverified.

Scrollbar/tab follow-up: owner requested a uniform orange crown, two extra cards, a shared scrollbar design and a slightly thinner browser navigation bar. Crown now uses the original alpha silhouette tinted `#E69A2D`, with no contrast/saturation filter. Mobile has seven fixtures (added Sunset Retreat and Mountain Escape, reusing existing 3:2 review artwork); tablet review has five. The earlier five-rows-fit-at-once criterion is superseded by deliberate overflow. Shared AppScrollView supplies the 6-point round violet thumb/pale lavender rail for all app screens and device layouts, only when needed. Browser supports thumb dragging, track seeking, wheel/touch scrolling and keyboard controls; its thumb length is capped at 80 points to retain the reference's short-handle appearance. Bottom navigation stays fixed and is reduced by tightening padding and icon/label spacing. Native tabs stay OS-controlled; the equivalent native indicator is implemented but unverified on physical devices.

Scrollbar verification: all four Home layouts passed scrolling, thumb movement/dragging, fixed-tab position and existing Home checks. Seven-card swipe/deletion checks passed. The full browser regression passed import/recovery, persisted rename/delete, collection layouts, preferences and navigation. Initial checks exposed development reload timeouts and a measurement before preview scaling settled; the harness now waits for the rendered frame and actual restored input/setting values rather than relying on network-idle reload timing. TypeScript passed. Scrolled captures are `.cache/home-review/*-scrolled.png`; no native execution is claimed.

Header/swipe follow-up: increased Theme Collection to 16/20 at weight 800, caption to 12/16, balances to 14/18 and units to 10. Reduced header padding to 8 horizontal / 2 vertical, with a 56-point minimum height. The original crown renders at 38 points with a modest browser saturation/contrast adjustment; its source file remains unchanged. The mobile sort face is now 110 points wide with a 10-point gap after “Sort by:”; the matching menu is 122 points wide.

Mobile puzzle cards now reveal an 80-point Delete action on a right-to-left swipe. Only one row stays open; short/vertical gestures do not reveal it. Delete opens a confirmation stating that the collection picture stays. Confirming removes only that seed row in memory and updates My Puzzles; deleting the final row does not change the sample theme balances. Switching Home review states or reloading resets the fixtures. Keyboard users can focus a row and press Left Arrow to reveal Delete; the dialog supports cancellation. Native gesture code is present but remains physically unverified.

`tools/check-mobile-home-actions.cjs` covers both phone layouts, header bounds, horizontal spacing, mouse and touch gestures (including a scaled frame), cancellation, single-row removal, last-row balance preservation, keyboard access and fixture reset. The first capture was interrupted by a development-page remount; the rerun passed. Captures include `*-header-empty.png`, `*-header-populated.png` and `*-swipe-delete.png` under `.cache/home-review/`. Existing Home checks and TypeScript also passed.

Follow-up correction: the owner supplied three close-ups for the plus and sorting control. Both mobile states now share the populated Add Puzzle card's height, typography, subtitle and decoration, with a geometrically centered plus formed from two rounded strokes. Empty Home also displays “Sort by:”. The mobile sort face is 100 × 28 logical pixels inside its 48-point trigger; the open panel is anchored immediately below it, slightly wider, with compact rows, a lavender selected row and a drawn tick/chevron. Pointer opening no longer adds a spurious keyboard focus outline; keyboard focus remains supported. Captures include `iphone-populated-sort.png` and `android-populated-sort.png` for direct state comparison. Tablet layout is unchanged.

The owner requested a new mobile-only iteration after rejecting the earlier result. The sections below this update describe the earlier pass; the following mobile-specific details replace its larger type/row geometry, generated thumbnail art and corrected sample-time label. Tablet layouts remain at the earlier implementation pending a separate review.

- References: latest `design/mobile/mobile-home-empty-new-user.png` and `design/mobile/mobile-homev1.png`; both empty and five-row populated states captured at 390 × 844 and 412 × 915.
- Isolated `MobileHomeScreen` retains the shared palette and platform system sans-serif. Compact geometry follows the new mobile references: section/hero titles 20 points, row titles 13, metadata 10, action labels 11. Primary actions retain 48-point hit areas around 32-point visible faces. This mobile-specific sizing is an interpretation of the latest request to match the new references; it is awaiting visual approval and is not a global token change.
- Single-row crown/title/purchase header in both states; empty header includes “No purchased packs.” Displayed purchase copy is “Buy Theme Packs” from the new reference. Populated balances remain explicitly labelled used/granted for assistive technology.
- All five rows fit above the unchanged navigation at both phone review sizes. Status remains above the action; thumbnails preserve 3:2 without stretching. Empty-state spacing, illustration, heading, supporting copy and compact sort menu were compared and refined through repeated captures.
- Mobile thumbnails use the supplied picture regions directly from an unchanged reference copy under `graphics/home-review/`; provenance and coordinates are recorded in its README. The screen itself is built from real UI components, not a screenshot background.
- Sample dates match the new mobile reference. Castle displays the reference label “25:48” only in review, separately from its valid sortable timestamp. Legacy piece counts remain fixtures and never enter the gameplay engine.
- Sorting still starts closed, per the explicit owner decision; the reference shows the expanded state. The approved navigation, design-system palette and platform font family remain intentional differences from literal raster pixels. No native status bar/device bezel is fabricated as app UI.

Evidence: `.cache/home-review/iphone-empty.png`, `iphone-populated.png`, `iphone-sort.png` and the corresponding `android-*` captures. Automated checks cover bounds, all five rows above navigation, image ratio, action placement, sorting and seed isolation. These checks and screenshot comparison do not establish literal pixel identity or native accessibility acceptance. Small metadata text still requires owner review and later physical-device/font-scaling validation.

Verification for this pass: TypeScript passed; Home checks passed for both phone sizes and both unchanged tablet layouts; production web export passed and its JavaScript excludes the development fixtures/review selector. The wider browser regression first timed out waiting for network idle during a picture-page reload, with no page errors; a rerun after bundling completed passed all existing import, persistence, settings and navigation checks. Documentation verification passed (seven archive hashes, 24 security mappings, 15 active documents). No EAS build or native test was attempted.

## Earlier pass: confirmed H1–H8

1. Puzzle-piece silhouettes in every Home state and device layout.
2. One Theme Collection card with crown and Buy theme packs for zero ownership; wrapping is allowed on narrow phones.
3. Sentence-case Buy theme packs; DESIGN-SYSTEM.md palette, type and button rules override screenshot inconsistencies.
4. Seed data only for this review, separate from actual user storage.
5. Status above action on phones AND portrait tablets. Landscape tablets place them across the row.
6. Complete 3:2 thumbnail image with no stretching or additional crop.
7. Sort starts closed with Latest Played; Latest Created and Most Pieces work; selected tick on right.
8. Start empty with zero themes. An external browser control switches to populated seed data.

## Review controls and boundaries

Open localhost:8081 and use Preview layout plus Home review in the outer browser toolbar. Empty and populated states are clearly labelled outside the app frame. Five sample puzzles appear on phones and three on tablets, matching the supplied examples. AI remains hidden. Allowance numbers are explicitly used out of granted.

Seed titles, counts and progress reproduce the reference samples. Legacy 100/64/200 counts are visual fixtures only: no engine configuration or product rule was changed. The invalid reference time 25:48 was corrected to 23:48 in the Castle fixture. Images are newly generated matching scenes, not original thumbnail extractions; provenance and prompt descriptions are in graphics/home-review/README.md.

No seed puzzles, pictures or balances are written to IndexedDB or a service. Play Again/Continue and Buy theme packs show an external review message explaining that no gameplay/purchase occurred. Add Puzzle retains its existing route. The fixture selector is development-only; no live payment, account or gameplay implementation is implied.

## Build, capture, compare, refine

References: mobile/mobile-home-empty-new-user.png, tablet/tab-home-empty-new-user.png, tablet/portrait/06-home-empty-new-user.png and their populated counterparts under design/. The older design/new-user-empty README differs on sorting and purchase CTA; confirmed H decisions above take precedence.

- First pass: implemented allowance, decoration, empty guidance, populated rows and sorting using design-system tokens. Reused crown, piece and ready artwork.
- Capture found intrinsic PNG height overriding the intended thumbnail ratio in React Native Web. Added explicit width/height derived from 3:2 and reran the checks.
- Visual comparison found Play Again wrapping on phones and unnecessarily narrow portrait-tablet actions. Refined Home-only button padding and expanded the portrait action column. Recaptured all four layouts.
- Final captures show complete thumbnails, right-side sort ticks, responsive header wrapping, empty state, and the confirmed status/action arrangements. Token text sizes and 48-point controls intentionally make rows taller than scaled raster examples; lists scroll. Native tab appearance and the approved browser bar were not changed.

Evidence is generated by tools/check-home.cjs in .cache/home-review/: iphone, android, tablet-portrait and tablet-landscape, each with empty, populated and sort captures. Captures exclude the browser toolbar so the app area is directly reviewable.

## Verification and limits

Home automation passed across all four fixtures: initial empty state, sample counts, seed isolation, 3:2 image geometry, row bounds, portrait/landscape status placement, all sort choices, Escape dismissal, action feedback and reset to empty on reload. Existing browser regression also passed for collection/import/persistence/failure recovery and navigation.

TypeScript and production web export passed. Inspection of the final exported JavaScript confirmed both the seed titles and Home review selector are absent, after moving the fixture import behind the development guard. Archive/link checks passed: seven original archive hashes unchanged, 24 security mappings and 15 active documents checked. No EAS build, service provisioning or native execution was performed. Native accessibility, font scaling and gesture behavior remain device-test gates. Screen matching is a reviewable implementation, not a claim of literal pixel identity or M2 owner acceptance.
