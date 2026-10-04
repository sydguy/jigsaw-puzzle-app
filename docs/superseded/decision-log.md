# M0 decision log

Authority: current user scope > final v3 update in
[Jigsaw-Development-Handover.md](Jigsaw-Development-Handover.md) > confirmed v2
decisions > current screen references > v10 prototype > historical proposals.
Statements below are specification records; gameplay is not implemented in M0.

## Confirmed product decisions

| ID | Current decision |
|---|---|
| D01 | Compliant wrong-home placements release. Outer edges must be flat; occupied neighbours must mesh. Non-compliant pieces remain selected and movable in both rotation modes. Completion requires home cell and per-piece solutionOrientation. |
| D02 | Quarter-turn rotation toggle, initially OFF. OFF has upright pieces and no rotate action; the selection-lock rule still applies. |
| D03 | Maximum 15 rows by 20 columns / 300 pieces. Presets 54, 96, 150, 216; 12 by 18 is 216. Minimum 3 by 3 remains provisional. |
| D04 | Unlimited hints, corners first then random remaining tray piece. Displace target occupant and incompatible neighbours to tray. Free hint requires completed rewarded ad. Only active ad-free subscription removes hint ads. |
| D05 | Explicit Start/Pause, stopwatch first. Countdown deferred. |
| D06 | Correct placements determine progress. Placements/replacements, atomic board swap, board-to-tray and successful Hint each count one move; rotation counts zero. Shuffle affects tray only; Restart confirms and resets attempt. |
| D07 | Home / My Collection / Settings. Retain tablet full-width bottom navigation, including Account/Billing/Legal. Mobile Billing has Back to Settings and no bottom menu. Phone grids three columns, tablet six; detail one per row. |
| D08 | One Flutter app; initial review phone portrait and tablet landscape. Actual devices, oldest supported OS and launch platform matrix still open. |
| D09 | General audience; no child profiles/chat/parent features. |
| D10 | Guest local play; accounts for purchase/generation entitlements; explicit guest migration. Sign-in methods open. |
| D11 | Durable local saves first; cloud sync separate. |
| D12 | Text generation plus five styles first. Voice and reference-photo transformation deferred. |
| D13 | Deduct once per successfully delivered image; failures do not deduct; discard still consumes. |
| D14 | Pack quantities/prices/products are illustrative and require central configuration later. |
| D15 | Theme unlock balance / first-use claim is a proposal, not approved. |
| D16 | Purchase-history PDF is a placeholder. |
| D17 | Production free/themed image catalogue is later work; screenshots are not original catalogue images. |
| D18 | Ads planned; ad-free US$2.99/month. Pack purchases do not remove hint ads. Banner coverage, grace/expiry and store rules remain later work. |
| D19 | Public HTTPS website destinations required. Supplied website is a mockup, policies draft and support form non-sending. No local HTML production policy destination. |
| D20 | No cloud provider chosen; keep future service boundaries independent. |
| D21 | Add Picture imports one image. Collection image deletion cascades to linked Home puzzles after confirmation showing count; Home puzzle deletion preserves image. |

Additional confirmed UI rules: crop fixed 3:2 within image bounds; source Back
retains Create draft; crop X cancels; actual image source highlighted; remove AI
gear and redundant tablet camera close action. Exclude-owned ON hides owned
images, OFF dims/disables them. Remove mobile Country/Timezone and child/chat
deletion copy. Use Preview and Times Used / Date Added / Last Used labels.
Sparkles belongs to AI Picture Packs and Combo Packs headings, not Create Puzzle.
75/100 pictures and 2/3 themes mean USED.

## Open decisions and gates

- Before M1 acceptance: minimum dimensions, named phone/tablet test devices,
  supported OS floor; hints when tray is empty but unsolved or corners are
  already wrongly placed; count/cancel semantics for intermediate non-compliant
  attempts should be made explicit in engine acceptance tests.
- Later controls: countdown duration/expiry and any additional orientations.
- Accounts: login methods, migration/conflict rules, deletion details.
- Content/AI: catalogue originals/rights, initial grants, expiry, regeneration,
  provider, limits, costs.
- Commerce: exact packs, theme claim timing, allowance denominators after top-up,
  subscription grace/expiry/banner coverage, receipt requirements.
- Release: public website URLs, identity/contact/support delivery, policy review,
  analytics/privacy implementation, identifiers/branding/signing and launch matrix.
- Rename/tag remains undecided. No open proposal is implemented as approved.

## M0 engineering choices (reviewable, not owner product approvals)

Flutter 3.44.8 / Dart 3.12.2; Material 3; primary #462bd9, light lavender surfaces
and dark indigo text; default platform fonts pending font review. 600 logical
pixels is a provisional compact/wide threshold, 1080 maximum content width.
No orientation lock. Android/iOS generated targets, web development review host.
No service packages or speculative domain models. flutter_svg renders the supplied
white 64-unit Hint SVG; its parent provides green background. Named PNG originals
retain aspect ratio and use display-sized decoding.

## Source discrepancies retained for M1

The final written v3 rule wins over actual prototype code:
v10 gateOK rejects non-compliant upright drops instead of retaining selection;
turn increments moves and does not immediately reconcile selection on rotation;
completion hard-codes zero; swaps check temporarily empty slots rather than the
final mutual edge. Prototype timer starts on interaction and preview uses mutable
snapshots. These are implementation inputs, not code to copy blindly.
Preserve original v8/v10 files. The old handover has superseded limits, copy and
hint proposals. Website marketing claims are not completed app capabilities.

## M1 authorization and decisions — 27 September 2026

The owner explicitly authorized M1, superseding the historical M0-only scope.
The preceding M0 entries describe their original milestone; they are retained.
Active authority also includes the updated handover and security-requirements.md.

The owner resolved two M1 questions during implementation:

- Count every board-changing placement/move immediately, including a non-compliant
  attempt that remains selected. Rotation and selection-only taps count zero.
- Reject a swap atomically if the displaced piece would not comply in the final
  board. Rejection changes neither board nor move count. The actively moved piece
  may remain selected if it is non-compliant. Evaluate the final mutual edge.

Engineering choices, not new product approvals:

- Keep the existing provisional 3×3 lower bound visible in development guidance.
  Presets are 6×9, 8×12, 10×15 and 12×18; the maximum is 15×20.
- Use a monotonic stopwatch with explicit Start/Pause. Backgrounding, Home and
  Preview pause it; reopening never counts time spent closed. Checkpoint every
  second and after each accepted action. An abrupt process kill can lose the
  uncheckpointed fraction of elapsed time, but not an acknowledged saved move.
- Persist exact edge arrays, solution/current orientations, board/tray order,
  selection, moves, elapsed milliseconds, UTC timestamps and schema/generation.
  Store the normalized cropped image, so reapplying a crop transform is unnecessary.
- Limit local sessions to 20 as a bounded M1 storage guard. Deletion/collection
  management and production allowance policy are not being introduced here.
- Use the OS photo picker for real local image access. Gallery does not fabricate
  scenic catalogue thumbnails. Android interrupted picker returns prompt reselection;
  existing saved puzzles remain available. Camera/AI/catalogue stay deferred.
- Hints, Restart and Shuffle are M2 controls in the milestone table. Their product
  rules are retained; no ad bypass or fabricated entitlement is introduced for M1.
- Native files use two save generations and flushed replacement; browser review
  uses atomic localStorage writes, subject to browser quota/eviction and one tab.
  Unknown future schemas/engine versions are retained and made read-only.

Still open: final minimum dimensions, minimum OS and named physical devices,
Hint behavior for an empty tray/wrong board corners, and physical visual/performance
acceptance. Installed plugins introduce technical OS floors; they do not constitute
owner approval of the launch support matrix.
## Owner reference correction — 28 September 2026

The complete replacement mobile Photo Gallery image is now current visual authority.
The truncated original is archived; see [source corrections](source-corrections.md).
Gallery selection now has an explicit Add Selected Image confirmation before Crop.
Use real selected device photos; do not fabricate a catalogue from screenshot thumbnails.
The source correction does not change gameplay decisions or authorize M2-M6.

## Owner running-resume requirement - 29 September 2026

The owner requires active sessions to reopen running and count time spent stopped.
Schema 2 persists running intent, elapsed milliseconds and a UTC checkpoint anchor.
Explicit Pause, Preview, completion and returning Home stop the clock. Background
lifecycle events checkpoint without pausing. Start acknowledges running only after
its save succeeds; a storage failure stops local play and reports the failure.
Schema 1 saves migrate as paused, preserving their prior behavior.

Elapsed time uses a monotonic stopwatch while the controller is alive and UTC
elapsed time from the last saved anchor after process recreation. Negative clock
deltas add zero; elapsed values saturate at the existing ten-year storage bound.
Local clock changes can affect offline elapsed time; this is a guest stopwatch,
not trusted timing for rewards or competitive scoring. No network time service
or later-milestone integration is introduced.

M1 review uses phone portrait and tablet landscape. Real-device picker permission
coverage belongs to M2 and broader release device/performance QA to M6; these
unperformed checks must be documented but are not substituted for M1 acceptance.
