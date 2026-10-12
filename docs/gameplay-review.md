# Playable browser gameplay — 13 October 2026

The owner requested full game logic using the v10 HTML/JSX prototype as guidance. This supersedes the earlier presentation-only deferral. The owner approved a relaxed countdown of **20 seconds per piece, rounded up to a whole minute**. The rule is captured in each saved definition as `2026-10-13-20s-ceil-minute`; exact replay does not regenerate the cut or change its duration.

## Implemented behavior

- Square grids 5×5 through 20×20, with complementary tabs/notches and the selected image compressed to the approved square. Source assets and legacy collection records are not rewritten. Pieces render from cached clipped sprites; drag frames update a single ghost canvas.
- Drag or tap to place; keyboard selection/placement and rotation are also available. Shape-compatible wrong-home pieces are legal. With rotation enabled, noncompliant placements remain selected and can be moved, rotated or returned to the tray. A compliant rotation releases the piece. Settled neighbors and flat outside borders must fit.
- Swaps validate the **final** board, including the mutual edge of adjacent swapped pieces. A displaced piece must comply; rejected swaps change neither board nor moves. Placement, return, swap and a successful hint each count one move. Selection, quarter-turn rotation and shuffle count zero.
- Hints correct unsolved corners wherever they are, then tray pieces, then misplaced board pieces. Obstructions and incompatible neighbors return to the tray. Completion requires every home cell and solution orientation. Incomplete progress is capped at 99%, avoiding a false 100% at 399/400.
- All pieces are available in the one-row tray. Swipe left/right, wheel or use keyboard navigation without a scrollbar. Pinch zoom, two-finger pan, zoom buttons and Fit work. The approved orange Preview action shows the actual complete square.
- Start/Pause/Resume are explicit. Timer counts down; Stopwatch counts up; None runs no hidden clock. Pre-start/paused boards remain visible and block gameplay. Preview auto-resumes only if previously running. Background/Home/reload require Resume. Free browser review pauses after the 60-second offline grace; reconnect never silently resumes.
- Timeout offers untimed continuation, Restart or Home. Continued attempts can finish but cannot become timed successes. Completion shows a brief reduced-motion-aware celebration and time/moves, with Home, Play Again and View picture actions.
- Home/setup Continue restores the exact saved state; replay creates a new attempt with the same image, cut, settings and Home identity. An unfinished started attempt requires confirmation before replacement. Changed setup creates a separate puzzle. Times Used counts first Start for each attempt, including replay, never Resume.

## Persistence and failure handling

IndexedDB version 2 adds the `games` store without rewriting `pictures` or preferences. Records contain the normalized local image, exact cut, versioned settings, partition, turns, selection, counters, status, attempt history and once-only reward IDs. Every committed action waits for transaction completion. Clock checkpoints occur every five seconds and on lifecycle pauses; abrupt browser/OS termination can lose up to the last checkpoint interval of clock time, but never invent offline elapsed time on resume.

Saves validate shape, bounds, edges, IDs, board/tray uniqueness, selected noncompliant exceptions, rotations, status and local-image metadata. Each record retains a validated previous snapshot. Damaged current data can recover from it; future record/cut versions are preserved and not opened or overwritten. Compare-and-swap revisions prevent stale tabs overwriting newer saves. A failed write pauses the acknowledged board; Retry saves the pending action, while Reload last saved explicitly discards it only after a successful reload. No user puzzle is automatically evicted.

Home deletion removes only that game and its attempts. Personal-picture deletion confirms the actual linked-puzzle count and removes the photo and linked games in one transaction. Unrelated games remain. Development sample catalogue pictures are still not acquired/persisted as collection content. Opening a visual Home fixture for actual play initializes a zero-progress attempt because those reference fixtures have no saved moves to resume.

## Prototype differences

`prototype/jigsaw-v10.html` and `.jsx` remain unchanged. Their complementary curve/edge and tray interactions guide the browser renderer. The extracted pure engine adds the approved square sizes, final-mutual-edge swap validation, zero-move rotation (the JSX prototype increments board rotation), corner-first hints, immutable transitions, clocks, durable attempts, restart confirmation and recovery. Prototype illustration state is never used as genuine saved gameplay.

## Browser verification

Automated tests use disposable Edge contexts against local Expo, never the owner's browser storage.

| Check | Evidence |
|---|---|
| `tools/check-engine.cjs` | 35,360 seeded random actions over all 32 size/rotation configurations; invariant checks after each action, exact hint completion, wrong-home placements, atomic swaps, bounds/corruption, clocks, reward cancellation/deduplication, near-complete progress |
| `tools/check-gameplay.cjs` | Actual tap/drag placement, clocks, preview lifecycle, acknowledged reload, exact-cut replay, 25-piece completion, attempts and persisted Home entry |
| `tools/check-gameplay-large.cjs` | 400 actual pieces; CDP touch swipes in both directions, hidden scrollbar, rotation, keyboard placement/return, pinch/pan/Fit, offline grace and four layout captures |
| `tools/check-gameplay-failures.cjs` | Injected quota failure and retry; background pause; timeout and durable untimed reward; revision conflict; corrupt-snapshot recovery; future-save preservation |
| `tools/check-gameplay-library.cjs` | Real personal-picture link, distinct changed-settings game, Resume usage count, Home deletion preserving photo, counted cascade preserving unrelated game |
| `tools/check-gameplay-migration.cjs` | Real IndexedDB v1→v2 upgrade preserves legacy 1536×1024 JPEG bytes, metadata and preferences while adding an empty games store |
| `tools/check-home-replay.cjs` | Existing completed/unfinished setup variants, every setting change/revert, duplicate-submit guard and original retained |
| `tools/check-browser.cjs` | Existing photo import/crop/cancellation, quota retry, collection management, saved preferences, future database protection and four-layout navigation remain working |

Screenshots are generated in `.cache/gameplay`, `.cache/gameplay-large`, `.cache/home-replay` (ignored test artifacts). Reviewed phone geometry fits at default text size, including the 400-piece tray. Tablet layout retains its existing scrollable large board; its controls remain below it rather than changing the accepted layout to a new two-column design. Full solved image/real cutouts intentionally replace static reference illustrations. This is visual review, not a claim of pixel identity or physical-device performance.

## Integration limits

- This is the browser-playable slice. The shared TypeScript engine is platform-neutral, but the implemented renderer uses HTML Canvas, not the planned native Skia renderer. Native image snapshot/storage/renderer adapters explicitly report unavailable; native M1/M3 acceptance and physical touch/performance remain open. No package, OS-floor or EAS changes were made.
- AdMob and verified subscriptions/accounts are not connected. Browser rewarded requests truthfully return **unavailable**, granting a hint/untimed continuation per the approved fallback. Completion/technical failure grant once; cancellation does not. No ad impression, purchase or paid offline entitlement is fabricated. The banner remains labelled as a placeholder; real interstitial scheduling, consent and native ad interruption tests remain M8 work.
- Sound uses a short local Web Audio tone; haptics use supported browser vibration. Both honor saved preferences and fail quietly when unsupported. Native audio/haptics, OS backup behavior, lock-screen transitions and process-death recovery need physical testing.
- Existing service, catalogue, policy and native release gates in [readiness](readiness.md) remain open. Local browser storage is not cloud backup; clearing browser data removes it.

Commands: `npm run check:engine`, `npm run typecheck`, `npm run export:web`, `python tools/verify_documents.py`; run browser scripts with the configured Playwright runtime and local Expo on port 8081. The old `check-puzzle-screen.cjs` entry point delegates to the actual gameplay test instead of asserting placeholder-only behavior.

Final static checks passed: TypeScript, Expo web export (13 routes), document/archive checks and `git diff --check`. Reward tests include all supported outcomes, duplicate callbacks and a late completion after cancellation; cancellation remains terminal and grants nothing.
