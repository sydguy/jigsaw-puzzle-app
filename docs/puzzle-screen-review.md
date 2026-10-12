# Puzzle presentation review — 8 October 2026

Latest 13 October revision supersedes the visible tray indicator below: hide the scrollbar while preserving left/right swipes and mouse/wheel/keyboard browsing. All configurations and board seams use linked square grids from 5×5 through 20×20; Quick Picks are 5×5, 8×8, 10×10 and 15×15. See [square image review](square-image-review.md).

13 October refinement: Preview now uses a brighter orange gradient (`#F79B31` to `#E8600B`) through the app theme. The illustrated piece tray supports horizontal touch scrolling, mouse dragging (including scaled browser previews), wheel/trackpad scrolling and keyboard navigation. Its scrollbar uses violet/lavender styling; native retains a horizontal ScrollView. Piece placement and all gameplay remain deferred. The puzzle browser checks pass wheel, drag, keyboard and simulated phone touch interactions, confirm no piece clipping or outer-page wheel movement, and capture both phones and tablet orientations. Phone/tablet captures were visually reviewed. Physical-device gestures remain unverified.

10 October update: the [square image revision](square-image-review.md) supersedes the earlier 3:2 board decision below, using `mobile-puzzle-type 2 _square.png`. The board and Preview are square; existing grid settings and gameplay deferral remain in effect.

Reference: `design/mobile/mobile-puzzle-type 2 .png`. The page has the shared lavender/black Back button, selected picture title, progress ring/statistics/start panel, picture board, horizontally scrolling illustrated piece tray, green Hint/orange Preview/red Restart/blue Shuffle controls and an Ad Banner placeholder. It carries rows/columns, timer mode and rotation from the selected setup; the total piece count is derived from the grid.

Home card bodies retain their setup destination. Their Play Again/Continue actions open the puzzle directly. Setup replay/Continue and Create also open the puzzle. The session is an immutable copy of the configuration; opening a screen does not start an attempt. New creation registers a separate preview Home entry once, preserving the original. Back returns Home; direct /puzzle without a session explains how to choose a puzzle.

Continue shows existing development-fixture progress. New/replay start their presentation at zero, without resetting the original Home record. Missing moves/time are shown as unavailable; the unapproved countdown table is not invented. None shows Timer off. Rotation-on configurations expose the rotation control. Preview opens the full selected image; zoom/Fit and tray scrolling are visual navigation only. Gameplay controls explain their deferred integration without changing board/progress or starting clocks. Ad Banner is a labelled placeholder; no ad request or entitlement is created.

## Intentional reference differences and limits

- Preserve the full 3:2 picture, rather than stretch it to the raster's taller board. Add labelled zoom/Fit controls from active accessibility/gameplay presentation requirements.
- Approved system fonts, tokens, linked grids and actual selected images replace raster colours/counts/art. No design/source assets are modified.
- Board seams and up to 24 visible tray samples are static UI illustrations, not generated playable cuts, saved positions or a board/tray partition. Saved board restoration, exact cut reuse, moves, drag/drop, hints, restart confirmation, rotation, shuffling, timing and attempt persistence belong to the later gaming-logic iteration.
- Native code has a basic image/grid/icon fallback. Native jigsaw masking, progress artwork, gestures and physical devices are unverified; this is Expo web review.
- Home records and puzzle sessions remain in browser-development memory and reset on reload. Real imported photos remain in the existing local picture store.

## Verification

10 October icon refinement: `graphics/puzzle_restart.svg`, `puzzle_shuffle.svg` and `puzzle_preview.svg` are editable vector redraws of the owner's three supplied transparent PNG references. They contain paths/gradients with no embedded bitmap or background rectangle. Restart/shuffle retain a subtle grey depth edge; Preview uses a transparent ring around its white centre. Browser puzzle buttons load these assets via `src/assets.ts`, preserving their aspect ratios and existing touch targets. The imported PNGs remain unchanged. TypeScript, web export and the puzzle browser checks pass; enlarged artwork and both phone/tablet captures were visually reviewed. Native SVG rendering remains part of the deferred native integration.

`tools/check-puzzle-screen.cjs` passes direct Home actions, configuration entry, fresh creation, derived grids/counts, Continue versus replay progress, all timer modes, rotation visibility, Preview, zoom/Fit, no gameplay mutation, new Home registration and direct-load recovery. It captures iPhone, Android phone and both tablet orientations in `.cache/puzzle-screen/`, with no browser errors. The updated Home replay and mobile Create checks also pass. TypeScript and Expo web export pass.

Visual comparison confirms the reference's header, stats, board, tray, tool-row and banner hierarchy, subject to the intentional differences above. Both phone screens fit without vertical overflow (780/780 and 851/851 content/viewport points below the header); tablet portrait fits and tablet landscape retains accessible overflow (922 points of content in 704). The tablet is a functional fallback, not acceptance of a new tablet design. Existing small Home seed thumbnails look soft when enlarged into the board; no replacement imagery or source-byte changes were made. Native testing remains unstarted.

Security scope: no server/backend/account changes, no uploaded user imagery, no new package or image decode path. Session settings originate in bounded app controls/explicit fixtures. No attempt/puzzle-save claims are made. The first browser attempt timed out against a stalled Expo server and was retried after restarting that verified process; an unstarted/timed-out attempt is not passing evidence.
