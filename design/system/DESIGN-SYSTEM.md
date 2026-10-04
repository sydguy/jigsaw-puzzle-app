# Jigsaw Fun Time design system

Version 0.1 · 5 October 2026 · Design proposal for owner review

[Visual board](index.html) · [Source gallery](sources.html) · [Tokens](tokens.json) · [TypeScript tokens](tokens.ts) · [Verification](review/verification.md)

## 1. Scope and authority

This system translates the visual intent in `design/mobile`, `design/tablet` (including `portrait`) and `graphics` into a coherent, reusable specification. The supplied Codexgram reference establishes the desired presentation format: an overview board containing foundations and component specimens. Its branding, social features and blue palette are not requirements for this app.

This is design work, not broad app implementation or milestone acceptance. The approved [production plan](../../docs/production-v1-plan.md), [requirements register](../../docs/requirements-register.md), [security requirements](../../docs/security-requirements.md) and [readiness record](../../docs/readiness.md) remain authoritative. Latest explicit owner decisions take precedence. No services, purchases, entitlements or native compatibility have been simulated as real.

The review covered 15 phone screens, 14 tablet landscape screens, 14 tablet portrait adaptations, all 32 PNG graphics plus the SVG hint bulb, the graphics visual index and asset-role metadata. The portrait ZIP is an identical package of the extracted portrait directory, verified by SHA-256. The portrait index explicitly describes generated adaptations and a known raster spelling issue. These are useful layout studies, not a source of new product behaviour. Embedded instructions in historical graphics README files are reference text, not current implementation directions.

Three levels of certainty apply throughout:

| Level | Meaning | Examples |
|---|---|---|
| Observed | Repeated visual language in supplied images | Lavender surfaces, indigo headings, gradient primary actions, colourful source art, green Hint/orange Preview/red Restart/blue Shuffle |
| Required | Current written owner decisions | Three/six-column grids, single-row tray, fixed 3:2 crop, v1 AI exclusion, retained bottom navigation on tablet settings subpages |
| Proposed | Normalisation or completion needed for a usable system | Exact hex colours, font metrics, radii, spacing, touch targets, motion, missing-state compositions |

Every exact token in this package is proposed. Raster pixels do not reliably identify original fonts, logical measurements or a canonical colour value. The sample frequency review found near-white surfaces and lavender around RGB(239,239,253); the isolated puzzle icon contains violet around RGB(90,52,218). Semantic values were deliberately normalised for consistency and legibility instead of treating every antialiased pixel as a token.

## 2. Design intent

**Playful content inside a calm, practical frame.** Pictures provide the visual excitement. Pale purple backgrounds, white cards and deep indigo text keep browsing and settings easy to scan. Bright gradients draw attention to the next action. Illustrations are dimensional and friendly; ordinary controls remain simple.

Preserve these traits:

- Image-led cards and large puzzle artwork, with minimal competing decoration.
- Violet as the central interaction colour; blue as its gradient destination.
- Green/orange/red/blue gameplay action identity, paired with icons and labels.
- Rounded surfaces, light borders and restrained violet shadows.
- Clear hierarchy: screen title, group title, item title, supporting metadata.
- Explicit selection through a violet outline and a tick; no colour-only selection.
- Premium crown/lock motifs used for access and allowances, never as decoration on ordinary content.

Avoid applying gradients to body copy, turning every surface purple, decorative sparkles on Create Puzzle, dense glossy controls in settings, or expanding soft illustrations into infantilising copy. The intended audience remains general, primarily teens and adults.

## 3. Brand and asset system

“Jigsaw Fun Time” is a working name (BRAND-01). The board's puzzle motif and typeset name are a wordmark study, not a final logo or platform app icon. Existing `puzzle_size_piece.png` is a section illustration; its temporary use as a board emblem does not change that production role. Brand name, final wordmark, platform icon and publishing identity require owner decisions.

Use imported PNGs unchanged, at their natural aspect ratios, with contain-style fitting. Align their visual mass rather than assuming identical bounding boxes. Use 48/72/112-point illustration boxes according to context; 24-point boxes for utility symbols. A dimensional source tile may use a 56–72-point illustration inside a larger 48-point-minimum touch target. Do not make a 24-point drawing imply a 24-point hit target.

| Asset family | Files in `graphics/` | Role |
|---|---|---|
| Image sources | `image_source_photo_gallery.png`, `image_source_camera.png`, `image_source_curated_collections.png` | Three v1 source choices |
| Puzzle setup | `puzzle_size_piece.png`, `puzzle_timer_mode.png`, `puzzle_ready_illustration.png` | Setup groups and empty guidance |
| Play | `hint_bulb.svg` | White hint glyph inside green button; button supplies surface and semantics |
| Settings | `settings_account.png`, `settings_billing.png`, `settings_privacy_legal.png`, `settings_faq.png`, `settings_support.png` | Navigation categories |
| Privacy/legal | `privacy_functional_shield.png`, `privacy_analytics.png`, `privacy_marketing.png`, `legal_terms_conditions.png`, `legal_privacy_policy.png`, `legal_cookie_policy.png` | Explanatory privacy rows and policy destinations |
| Premium | `premium_collection_crown.png`, `premium_collection_lock.png`, `premium_collection_locked_badge.png`, `collection_packs_shop_bag.png`, `billing_themed_collection_piece.png` | Theme allowances, locked catalogue items and pack entry |
| Future only | `ai_sparkles.png`, five `ai_style_*` files, `image_source_ai_generate.png`, `billing_ai_picture_pack.png`, both `billing_combo_puzzle_pair_*` files | Preserved provenance; hidden in v1 |

The current files do not supply a final logo/app icon, original catalogue images, the yellow Add Image composite, or a complete vector utility family. The board uses an existing photo illustration instead of inventing a production asset. Home/back/grid/settings/play/preview/restart/shuffle/rotate/zoom/camera utility glyphs must be drawn or selected consistently during implementation; the board's text glyphs are layout specimens, not a completed icon font. Use filled, softly rounded geometry for navigation, simple 2-point round strokes where an outlined control is needed. Validate every native rendering size.

The three files under `specimens/` are review-only crops from `tab-homev1.png`; their source coordinates are recorded in `specimens/provenance.json`. They are not a production image catalogue or rights approval. All original imported files remain byte-identical.

## 4. Colour foundations

Canonical machine-readable values live in `tokens.json`; `tokens.css` and `tokens.ts` are generated by `build.py`.

| Token | Value | Use |
|---|---|---|
| canvas | `#F7F7FE` | Screen background |
| surface | `#FFFFFF` | Cards, forms, sheets |
| surfaceSoft | `#EFEEFD` | Soft grouping, inactive segments |
| selected | `#E7E1FF` | Selected source/preset/nav background |
| text | `#17124F` | Headings, body text, values |
| textSecondary | `#625B87` | Supporting text with readable contrast |
| primary / primaryPressed | `#5430E8` / `#4020BF` | Links, active state, solid CTA fallback |
| gradientStart → gradientEnd | `#7140EC` → `#3030F4` | Primary CTA, approximately 110° |
| border / controlBorder | `#DAD7EE` / `#8D84B2` | Decorative dividers / identifiable input outlines |
| focus | `#2F23B9` | Separate keyboard focus ring |
| success / successSoft | `#27763D` / `#E9F5EA` | Completion and confirmed success |
| warning / warningSoft | `#995000` / `#FFF1D9` | Reconnection and recoverable caution |
| danger / dangerSoft | `#BA2F3A` / `#FFF0F1` | Destructive action and failure |
| info / infoSoft | `#255FD0` / `#EAF1FF` | Download or pending information |
| premiumGold | `#F3BA43` | Decorative premium accent; dark text on gold |

Gameplay fills use Hint `#377E3C`, Preview `#AC510B`, Restart `#BA2F3A`, Shuffle `#255FD0`, with lighter gradient tops in the token file. White utility glyphs are separate from the dark labels underneath. Their accent hues remain recognisable from the source screens while darker bases improve contrast. Do not reuse the orange Preview action as a warning or the red Restart action as an error message without a text label.

Proposed acceptance targets: 4.5:1 for ordinary text, 3:1 for large text and essential control boundaries/icons. These targets are checked for the specified token pairs in `review/contrast.json`; they do not certify every screen. Soft separators need not be interactive outlines. Text must not be placed over unprotected photographs. Disabled items retain readable labels, a disabled semantic state and an explanation when the reason is not obvious.

Light appearance is the evidenced design direction. No dark appearance is implied by this proposal; a separate owner-reviewed palette and artwork treatment would be needed.

## 5. Typography, geometry and motion

Proposed native typeface: platform system sans-serif (iOS system, Android system), regular/semibold/bold. The browser board uses platform fallbacks. There is no evidence identifying a licensed custom font.

| Style | Size / line height | Weight | Example |
|---|---|---|---|
| Display | 32 / 40 | 700 | Introductory empty state only |
| Screen title | 24 / 32 | 700 | Create Puzzle |
| Section | 20 / 28 | 700 | My Puzzles |
| Body | 16 / 24 | 400 | Explanatory text |
| Label | 14 / 20 | 600 | Buttons, fields, item titles |
| Caption | 12 / 16 | 400 | Dates and secondary metadata |
| Metric | 24 / 32 | 700, tabular | Time and piece count |

These are default logical points, not screenshot pixels. Allow native font scaling; avoid fixed text-container heights. Use sentence case, keeping the approved navigation labels. Do not compress essential labels to fit a tiny card. At enlarged text, allow multi-line titles and taller rows; offer detailed view without changing the specified grid column count. The tiny overview device studies deliberately scale whole layouts to fit the board and are not production text-size examples.

Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48. Phone gutter 16, tablet gutter 24. Card inset 16; inter-card spacing 12–16; section spacing 24. Touch targets at least 48×48, including invisible but non-overlapping padding around small symbols. Inputs and buttons have a minimum 48-point height and grow for scaled text.

Radii: image/chip 8; control 12; card 16; sheet 24; pill 999 for switches and segments. Border width 1, selection border 2, keyboard focus ring 3 with offset 3 in the web reference. Do not communicate selection solely through shadow. Shadows: card y=4, blur=16, violet at 6%; floating y=8, blur=24 at 14%. Native elevation values are proposed mappings, not a promise that platforms render identical shadows.

Motion: press 120ms, selection 160ms, sheet 220ms; brief completion celebration at most 800ms. Reduced motion removes decorative travel, confetti and scale effects. No looping ambient animation, no forced delay before gameplay, and no background music. Sound and haptics have independent controls.

## 6. Layout and navigation

| Area | Phone portrait | Tablet portrait | Tablet landscape |
|---|---|---|---|
| Shell | Stacked sections; 16 gutter | 24 gutter; stacked content where needed | 24 gutter; use columns where content supports them |
| Collection | Exactly 3 columns | Exactly 6 columns | Exactly 6 columns |
| Detailed collection | One item per row, wrapping metadata | One item per row | One item per row; metadata can align horizontally |
| Create Puzzle | Image, size, timer, rotation, CTA | Image above settings; CTA below | Image ~60%, settings ~40%; full-width CTA |
| Puzzle | Stats, board, one-row tray, actions | Same hierarchy; more board room | Board plus ~280-point inspector; tray below board |
| Settings subpages | Back navigation; Billing has no bottom menu | Settings categories wrap above content; bottom nav retained | Category sidebar, content panel, full-width bottom nav |

Device class determines three versus six columns. Available width determines whether panels can sit side-by-side; a suggested 900-point usable-width threshold enables the inspector. Do not infer “tablet” solely from a desktop browser width or silently rotate phones. The local browser harness should offer explicit device-class/orientation fixtures. Tablet narrow-window behaviour needs native validation before acceptance.

Respect safe-area insets at top and bottom. Primary CTA sits above navigation and keyboard. Scroll long forms and keep the focused field visible; do not pin a CTA over content. Bottom navigation is Home / My Collection / Settings, in equal thirds across the screen. The selected route uses lavender fill, violet icon/text and an accessibility selected state. Account/Billing/Legal on tablets retain this navigation across the full width, including beneath a settings sidebar. Mobile Billing returns to Settings with no bottom menu. Create/source/crop/gameplay remain focused flows with Back/close according to their task.

The board shows corrected illustrative phone Home empty, six-column tablet Collection and tablet landscape paused play. These are composition studies; actual device measurements, gestures, split-screen behaviour and text scaling remain unverified.

## 7. Component contracts

Each interactive component needs default, pressed, focus, disabled and loading states where applicable. Focus and selection must be independently visible. Loading actions prevent duplicate submissions, retain a useful label and announce completion or failure.

| Component | Anatomy and variants | Behaviour and accessibility |
|---|---|---|
| PrimaryButton | Gradient, white label, optional leading icon; solid fallback | One primary choice per decision; label changes to a specific pending action; no double submit |
| SecondaryButton / TextAction | White with identifiable border / plain violet text | Same hit target as primary; useful Cancel/Back/Preview wording |
| DestructiveButton | Red fill or red text in danger zone | Explicit object in label; confirm scope; never use as a casual primary action |
| IconButton | 24-point glyph inside 48-point target | Accessible name describes action, not appearance; tooltip is supplementary |
| TextField | Visible label, input, helper/error region | Never placeholder-only; invalid semantic state; focus remains on recoverable input; error text preserved |
| SelectField | Label, selected value, chevron | Native accessible selection where possible; long values wrap or have full accessible label |
| SegmentedControl | Lavender track, solid selected pill | Named exclusive group; announce selected option; keyboard-operable |
| SwitchRow | Title, optional help, native switch | Entire row target; explicit on/off state; actual current preference, no assumed consent |
| SourceTile | Illustration, title, short purpose, selection tick | Exactly three v1 choices; selected source reflects navigation state; no AI tile |
| PictureCard | 3:2 thumbnail, title, theme tag, optional selection/owned overlay | Selection separate from acquisition; long title uses two lines; acquired content cannot be reacquired |
| CollectionDetailRow | Thumbnail, title, theme, metadata, selection | Times Used / Date Added / Last Used; wrap metadata on narrow screens |
| PuzzleRow | Thumbnail, title, piece count, Created/Last Played, status, action | Continue for incomplete, Play Again for complete; progress is correct-home-and-orientation only |
| ThemeCard | Cover, theme title, free/premium badge, lock when applicable | Lock means new acquisition restricted; never imply already-owned content is repurchased |
| AllowanceSummary | Crown, theme/picture labels, used/granted amounts | Always show meaning: “75 of 100 pictures used”; no fake balances while loading |
| ProgressMeter | Bar/ring plus numeric value and label | Announce relevant updates without reading every frame; clamp rendering to validated data |
| StatBlock | Correct pieces, move count, time, play state | Tabular numerals; clear stopwatch/countdown label; time pauses according to state machine |
| GameplayAction | Coloured control plus icon and visible label | Hint/Preview/Restart/Shuffle; disable state-sensitive actions while paused; confirm Restart |
| PieceTray | Single horizontal row, large pieces, selected indicator | Horizontal scrolling; tap-select/tap-place alternative; never wrap to multiple rows |
| BottomNavigation | Three equal destinations with labels | Safe-area bottom padding; selected semantic state; no badges invented for unavailable features |
| EmptyState | Small approved illustration, title, one next action | Preserve screen headers and context; no preloaded fake user puzzles |
| InlineAlert | Status icon, clear cause, recovery action | Role/announcement appropriate to urgency; error not only a colour; retain entered data |
| LoadingState | Stable skeleton structure or progress with text | No perpetual spinner without recovery; partial catalogue downloads remain useful |
| Modal / BottomSheet | Heading, consequences/content, secondary/primary actions | Trap focus in web; restore trigger focus; Escape/Back dismiss non-blocking decisions; tablet centred max ~480 |
| Toast / StatusMessage | Short acknowledgement | Noncritical only; durable errors and critical decisions stay in the page |
| SettingsRow | Category icon, title, optional value, chevron | Row is a single hit target; use real destinations; icons are decorative if title names the action |
| SupportForm | Contact fields, message, submit/status | Preserve content on failure; request ID after durable server acceptance; email-delivery failure accurately reported |

## 8. Screen patterns and state coverage

The following extends the active [state inventory](../../docs/ui-states.md) with visual and copy guidance. All new missing-state compositions are proposed and require review. These are client app patterns; the separate owner-admin surface may reuse tokens but needs its own workflow design.

### Home and My Collection

First Home preserves its headers, allowances area, Add Puzzle block and empty My Puzzles section. “Your first puzzle awaits” with one clear Add Puzzle action is the proposed empty-state copy. A guest with no pack sees truthful no-pack/no-allowance information, not sample balances. Populated Home contains real local puzzles only. Restart/Play Again creates a new attempt beneath the existing Home entry; Create Puzzle creates a new entry.

Collection supports grid/detail, sort, theme filter, rename, selection and Add Picture. Empty Collection explains that pictures added here can be reused for puzzles. A filter with no matches says “No pictures match these filters” and offers Clear filters. Loading preserves the heading/filter region. A read failure says “Couldn't load your collection” with Retry and retains recoverable data. Times Used counts started attempts, including restart/replay, not resume.

Two deletion scopes must be visibly different: Home deletion says “Delete this puzzle? Your picture stays in My Collection.” Collection deletion says “Delete this picture? This also deletes {count} linked puzzles from this device.” Use the actual count and correct singular/plural. No sample count can reach a real confirmation.

### Add Image, camera, crop and curated sources

Source Back preserves Create Puzzle draft data. Photo Gallery launches the OS picker; the supplied custom-gallery screenshot guides spacing and selection styling, not a replacement photo-library implementation. Request camera permission when Camera is chosen. Denied permission explains why access is needed and offers system Settings and a different source; cancellation is not an error. Remove the redundant tablet camera close icon.

Selected-image confirmation leads to bounded fixed 3:2 crop. Use Photo/Add Picture adds one picture after processing succeeds; crop X cancels without adding anything. Retake returns to capture. The crop window must remain 3:2 in both tablet orientations even though the generated portrait study shows an incompatible tall window. Provide accessible controls for non-drag adjustments where feasible. Reject unsupported/malformed/oversized images with recovery choices; preserve existing content on low storage. Do not copy the raster “10MB” limit into production until tested bounds exist.

Curated browsing distinguishes free/premium, locked/unlocked, selected/unselected and acquired/unacquired. Exclude owned ON hides acquired pictures; OFF shows them dimmed, labelled and unavailable for another acquisition. Loading and download progress show real status. Failure offers Retry; interrupted downloads can resume. Empty themes have explanatory copy. Unavailable products/balances never show a fabricated price or allowance.

First acquisition in an unowned theme must explain the full combined spend before confirmation: theme unlock plus picture allowance. Existing theme acquisitions spend only applicable picture allowance. Show actual remaining quantities and no-double-charge guidance from verified state. Insufficient allowance offers the correct pack route; sign-in is required for purchases. Previously acquired content may redownload without another charge.

### Create Puzzle

Image selection, Puzzle size, Quick Picks, Timer mode, Rotate pieces, readiness guidance, Create Puzzle. Rows and columns move together through 2×3, 4×6, 6×9, 8×12, 10×15, 12×18, 14×21 and 16×24. Counts are derived products: 6, 24, 54, 96, 150, 216, 294, 384. Keep presets 54/96/150/216. A stepper changes the linked pair, not independent row/column values. Disable decrease/increase at bounds. Rotation defaults off.

Use “Stopwatch” and “Countdown” as the proposed clearer mode labels; behaviour remains the approved two modes. No countdown duration is invented by this design system. Production durations come from the owner-approved, versioned per-count configuration. Create is unavailable until a valid local image and configuration exist, with a nearby reason (“Choose a picture first”). Source return preserves the draft. No AI sparkles on Create Puzzle.

### Gameplay

| State | Presentation | Permitted actions and transition |
|---|---|---|
| Ready | Board visible, Start action, initial stats | Start; no piece moves/rotation/hints/shuffle until running |
| Running | Live clock, correct-only progress, Pause | Drag/drop or tap placement; zoom/Fit; configured rotation; Preview/Hint/Shuffle; confirmed Restart |
| Paused | Board visible with Paused label and Resume | Gameplay moves/rotation/hints/shuffle disabled; Home available; no time passes |
| Preview | Full reference picture, labelled Preview, close/return | Clock paused; return resumes only if running before Preview |
| Ad interruption | Native ad experience and clear return state | Clock paused; no duplicate reward; cancellation does not grant action |
| Connection grace | Nonblocking “Connection lost” status with real remaining grace | Free play continues for 60 seconds; then save and pause |
| Connectivity pause | Board retained, reconnect explanation | Retry connection/Home; Resume after recovery; no clock consumption |
| Save failure | Persistent error and paused play | Retry save/recovery; never report the last unsaved move as safely stored |
| Timeout | “Time's up”, elapsed/result context | Untimed continuation (rewarded for free user), Restart, Home; cancelled ad stays here |
| Completed | Brief celebration, time/moves, timed/untimed result | Home / Play Again; no countdown-success claim after untimed continuation |

An expired free countdown is not a completed puzzle. Subscriber untimed continuation is direct, while free continuation explains the rewarded action. Rewarded completion or unavailable/technical failure grants the requested hint/continuation once; user cancellation does not. No-fill while online must not block ordinary play. Do not silently replace these rules with older completed-ad-only behaviour.

Selected piece uses a clear outline; a selected non-compliant placement remains movable rather than disappearing. Shape-compatible wrong-home placements remain allowed. Correctness/progress requires home and solution orientation. Do not colour every wrong-home placement as an error if it is a legitimate intermediate move. Rotate is shown only when configured, and supported both by button and tap-again. Count board-changing moves; rotation/selection alone count zero. The system specifies visual states, not replacement engine rules.

Pinch zoom and two-finger pan have visible zoom/Fit alternatives. Keep the tray a single scrolling row even at 384 pieces. Ads occupy a separate reserved region, never the board or action targets; ad-free subscribers reclaim this space. Native ad dimensions must come from the integration, not a screenshot placeholder.

### Account, billing, privacy and support

| Surface | Required variants | Proposed communication |
|---|---|---|
| Authentication | Guest, Apple, Google, email sign-in/sign-up, verification, password reset, linking, expired session, deep-link recovery | Explain next action; preserve local work on failure; no unsafe email-only merging |
| Guest assignment | Assign to account / keep separate | “Move this device's guest pictures and puzzles to your account on this device?” No upload/sync implication |
| Account | View/edit/saving/error/success; sign-out; delete with reauthentication | Remove mobile Country/Timezone and all child/chat/parent copy; deletion states actual jigsaw-data consequences |
| Sign-out | Scope notice, confirmation where needed | Account-local pictures remain stored but hidden; separate guest collection returns |
| Billing | Loading/unavailable/ready/pending/cancelled/verified success, restore, history | Store-localised actual price/period; pending grants nothing; pack and ad-free subscription separate |
| Restore | Pending, reconciled, nothing found, mismatch/failure | “Purchases restored” only after verified reconciliation; no silent account transfer |
| History | Verified rows with store/date/product/status | Store receipt guidance, no fake receipt PDF download |
| Offline | Valid verified subscriber access; expiry; clock rollback; reconnect | Local/downloaded pictures until verified paid expiry; renewal requires connection; expired auth token alone does not erase valid offline access |
| Preferences | Sound, haptics, optional analytics, permitted personalised ads | Independent sound/haptic toggles; analytics off until consent; declining tracking does not block play |
| Privacy/legal | Essential function status, optional choices, real policy links | Essential functions shown as required, not an optional-consent switch; revoke choices; final policy/retention wording pending review |
| Support | Editing, invalid, sending, accepted with request ID, failed/retry | Preserve message on failure; no “sent” before durable acceptance; distinguish email delivery issues |
| Local storage | Save, recovery, low-space, unsupported version | Explain local-only persistence and uninstall/device-loss risk; never promise cloud backup or silently overwrite future saves |

Marketing/analytics assets are explanatory artwork, not evidence of consent. Final age, privacy and retention decisions remain release gates. Production Apple/Google sign-in buttons need platform-compliant brand assets and native checks; the utility style guide does not override provider requirements.

## 9. Accessibility and content rules

- All controls have role, label and current state; images decorative to their adjacent title have empty descriptions. Puzzle imagery receives concise contextual naming, without claiming fully nonvisual puzzle play.
- The selected source/card includes a visible tick or explicit label. Progress and errors include text. No red-versus-green-only distinction.
- Keep 48-point targets independent and non-overlapping. Provide tap selection/placement and zoom/Fit controls alongside gestures.
- Support text scaling without clipping primary actions; long titles wrap. Test narrow phones, both tablet orientations, increased text and translated-length strings even though v1 language is English.
- Announce critical error/status changes without reading every clock tick, drag frame or progress animation. Modal focus returns to its trigger. Destructive confirmations initially focus Cancel.
- Use Australian English and dates such as “5 Oct 2026”; real store price formatting controls currency/period. Never hardcode screenshot product prices, sample balances or placeholder limits.
- Use Preview consistently. Distinguish Continue (existing puzzle), Resume (paused attempt), Play Again (completed attempt) and Create Puzzle (new Home entry).
- Say what happened, what was retained and what to do next. Do not say “Everything is saved” unless storage acknowledged it.

## 10. Source interpretation and corrections

The full per-file list and disposition appear in `review/source-inventory.json` and the linked gallery.

| Source family | Preserved design intent | Current correction |
|---|---|---|
| Home, all orientations | Allowance header, lavender Add Puzzle, image rows, bottom nav | Hide AI allowance; show empty first Home; approved piece counts |
| My Collection grid/detail | Image-first grid, purple selection, theme tags, view switch | Three phone/six tablet columns, including portrait; approved metadata labels |
| Create Puzzle | Image pane, grouped white controls, primary CTA | Linked grids, 216 correction, rotation off, real tested import limits |
| Add Image/source screens | Large dimensional illustration tiles | Three v1 sources; highlight actual source; OS photo picker |
| Curated and selection | Theme covers, crown/lock, ownership overlay | Full spend confirmation; proper exclude-owned behaviour; no sample prices |
| Camera/captured | Simple capture action, image-led crop | Remove duplicate tablet close; bounded 3:2 crop even in portrait |
| Puzzle screens | Big board, progress ring, colour-coded tools | Approved piece counts, single-row tray, zoom/Fit, lifecycle-safe clocks |
| Settings/Account | Calm category list/sidebar and white form | No child/chat copy; remove mobile Country/Timezone; truthful local data scope |
| Billing | Premium artwork, cards, history rows | Hide AI/combo products; verified/localised store values; no receipt PDF |
| Privacy/legal | Illustrated preference and policy rows | Optional analytics initially off; consent/policy wording reviewed, real links |
| AI screens and graphics | Archived visual language only | Deferred; absent from v1 board component choices |
| Tablet portrait adaptations | Portrait content stacking | Generated spelling/column/crop/tray inaccuracies do not override requirements |

## 11. Implementation handoff and review gates

`tokens.ts` is a dependency-free typed constant suitable for a later Expo SDK 55/React Native component implementation. It is not wired into the compatibility harness. Use platform system fonts, density-independent sizes, accessible native primitives and approved service interfaces. Map gradients, shadows and icons only after compatible dependencies are verified. Do not increase OS floors, introduce a new icon/animation runtime, or copy prototype code to satisfy the visual board.

Proposed component module names: `ActionButton`, `IconAction`, `LabeledField`, `SegmentedChoice`, `PreferenceRow`, `SourceTile`, `PictureCard`, `CollectionRow`, `PuzzleRow`, `AllowanceSummary`, `PuzzleStats`, `GameplayToolbar`, `PieceTray`, `BottomNavigation`, `EmptyState`, `InlineNotice`, `ConfirmationSheet`. Component props should consume validated state from services/engine rather than calculating purchase entitlement or save authority.

Before M2 visual acceptance, review the palette/type scale, provisional wordmark, corrected source picker, six-column portrait tablet layout, phone empty Home and paused/completed/timeout/error patterns. Check text scaling, contrast and gesture alternatives on actual app components. Brand/icon selection, approved catalogue artwork, product quantities/prices, countdown configuration and final policy wording remain owner decisions at their existing gates.

Browser layout and token checks are limited design-artifact evidence. M1 native compatibility, physical performance, full accessibility validation, service behaviour and M2 owner acceptance are not claimed. See `review/verification.md` for actual performed checks and remaining unverified work.

## Files and local preview

Open `index.html` directly in a browser for an offline, editable reference. All assets are local; no CDN, API, telemetry or third-party upload is involved. To preview alongside the repo, run `python -m http.server 8765 --bind 127.0.0.1` from the repository root and open `/design/system/`. This separate reference does not change the Expo preview workflow.

Run `python design/system/build.py` to regenerate CSS/TypeScript token exports, source gallery and contrast-pair evidence. Imported sources are read only. The overview is `design-system-board.jpg`; review captures and provenance live under `review/` and `specimens/`.
