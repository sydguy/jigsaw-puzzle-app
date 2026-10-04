# Jigsaw App — Current decisions and source updates

Version 2 • 26 September 2026 (Sydney)

This section supersedes conflicting proposals in the historical Version 1 audit below. The updated references are implementation inputs; this package is not a Flutter application yet. Seven revised screens have now been merged into the current reference folders. Original revised artwork is preserved byte-for-byte, including any text mistakes explicitly overridden here.

## Confirmed UI and navigation decisions

- Standard main navigation: Home / My Collection / Settings. Revised tablet Account, Billing and Privacy & Legal retain the full-width bottom menu. Revised mobile My Collection retains its menu.
- Mobile Billing has no bottom menu; Back returns to Settings, where the menu is visible. Do not generalize this exception to other screens without their references.
- Back on an image-source screen returns to Create Puzzle with its draft retained. X on crop cancels cropping and returns to the preceding screen. Remove the AI settings gear. Remove the redundant top-right close action from tablet camera source selection; its Back action remains.
- Highlight the actual selected image source. Exclude-owned ON hides already-owned pictures; OFF shows them dimmed and unavailable.
- Tablet image grids have six columns; phone image grids have three. Detailed lists remain one image per row.
- Mobile detailed metadata uses Times Used / Date Added / Last Used labels, as in its revised reference.
- Remove Country and Timezone from mobile Account. Replace child/chat/parent deletion copy with actual jigsaw data consequences.
- Use the label Preview for the eye action. Crop output is fixed at 3:2 with resizing inside image bounds.
- The 12 × 18 preset is 216 pieces, overriding the 212 still visible in revised screenshots.
- Rotation toggle is present on both Create Puzzle layouts: “Rotate pieces” / “Pieces start at random angles. Rotate them to fit.” Preserve the prototype's quarter-turn rotation behaviour; OFF means upright pieces. The supplied toggle is initially shown OFF.
- `ai_sparkles.png` is confirmed for the AI Picture Packs heading and the Combo Packs heading (combined with the puzzle-pair symbol), as circled in the supplied annotation. It is not the Create Puzzle jigsaw icon.
- 75/100 pictures means 75 USED. 2/3 themes means 2 USED. Use clear Used labels; the denominators/period after top-ups still need a definition.
- Displayed image quantities, bundle totals and prices are illustrative, not approved production products. This does not override the separately specified ad-free price below.

## Owner decisions D01–D21

| ID | Confirmed decision / remaining detail |
|---|---|
| D01 | Preserve wrong-but-shape-compatible placement. Exact image position and orientation still determine correctness/completion. |
| D02 | Preserve rotation, controlled by the new Create Puzzle toggle. |
| D03 | Maximum 15 rows × 20 columns = 300 pieces. Retain the shown presets. Performance gate must now cover 300 pieces; minimum remains provisional at 3×3. |
| D04 | Unlimited hints. Free users watch an ad for each hint; paid users do not. Each hint correctly places one corner piece first; after corners, select a random remaining tray piece and place it correctly. Clarify whether “paid” means active ad-free subscribers or any pack purchaser. |
| D05 | Adopt proposed explicit Start/Pause, Stopwatch in first milestone; countdown deferred until duration and expiry behaviour are defined. |
| D06 | Progress counts correctly placed pieces only. Count each board placement, correct or incorrect, including replacement by a tray piece or swapping board pieces. Proposed atomic swap counts as one move, subject to confirmation. Shuffle only rearranges tray; Restart confirms and resets the current attempt. Rotation, return-to-tray and automatic hint move counting remain to be specified. |
| D07 | UI decisions resolved by revised references and this decision section; do not retain the old “adaptive five/six columns” proposal. |
| D08 | One Flutter app; phone portrait and tablet landscape for first review. Select actual test devices and minimum OS versions during setup. |
| D09 | App is for any age. Child profiles, chat and parent settings were mistaken copy and are not features. |
| D10 | Local guest play; account required for purchased/generation entitlements; explicit guest-data migration. Sign-in methods remain open. |
| D11 | Durable local saves first; cloud synchronization is a separate milestone. |
| D12 | Text generation plus five styles first. Voice and reference-photo transformation are separately scoped later work. |
| D13 | Deduct once per successfully delivered generated image; no deduction on failed generation. Discarding a successful result still consumes its allowance. Initial grant, expiration and regeneration rules remain open. |
| D14 | Pack products/prices remain placeholders and must be centrally defined later. |
| D15 | Owner is considering choosing themes at purchase versus choosing/locking them on first use. Multiple unused purchases must combine sensibly. This is NOT yet a final entitlement rule; see proposal below. |
| D16 | Purchase-history PDF remains a placeholder at this stage. |
| D17 | Create a repository of free and themed images in a later content milestone. Screenshot imagery is not a supplied full-resolution catalogue. |
| D18 | Ads will be included. Ad-free option: US$2.99 per month. Subscription entitlement, grace/expiry behaviour and which ads it removes must be defined during commerce design; proposal is all banner and hint ads. |
| D19 | FAQ and legal links lead to pages on the app's website. Website is part of wider scope; no website URL or inspectable website reference is included in these seven attachments. Business identity, support URL/contact and policy content remain required. |
| D20 | Keep service interfaces independent until cloud requirements and costs are established. No cloud provider selected yet. |
| D21 | Add Picture selects one image and adds it to My Collection. Deleting an image from My Collection deletes all associated Home puzzles. Deleting a Home puzzle does NOT delete its My Collection image. Confirm cascade deletion with an associated-puzzle count before applying. Rename/tag features are not decided. |

## Theme-pack proposal — requires owner agreement

Use a balance of **unclaimed theme unlocks**. A pack of two adds two; a subsequent pack of three adds three, even if earlier unlocks are unused. If none was used, balance becomes five. If one was already used, balance becomes four and the previously unlocked theme remains available.

Let users browse previews of all themes. Unowned themes are not fully unlocked. On the first Add Picture from an unowned theme, show “Use 1 theme unlock to unlock Nature?” Confirming atomically unlocks that theme permanently, subtracts one available unlock and adds the selected image. Cancellation consumes nothing. Future additions from that theme consume no further theme unlocks. A user may optionally choose their themes immediately after purchase; the same confirmation/claim operation applies.

Display “2 themes unlocked · 3 unlocks available” instead of an ambiguous fraction after multiple purchases. AI counts should distinguish used and available pictures. This proposal assumes theme ownership unlocks the whole theme; if an additional per-picture limit is intended, it must be specified separately. Do not grant unrestricted access to all themes while waiting to see which pictures a user chooses.

## Remaining implementation edge cases

- Hint must displace an occupant of its target slot back to the tray without losing/duplicating pieces, and set the selected piece to its correct rotation. Because wrong compatible pieces are allowed, adjacent wrong pieces can conflict with a correct hint placement. Proposed policy: return incompatible neighbours to the tray, but this needs approval.
- Decide what happens when the tray is empty but the board is unsolved, or an incorrectly placed corner is already on the board. A useful proposal is to correct a wrong board piece when no eligible tray piece remains. No hint should silently do nothing after a rewarded ad.
- Free hint is granted only after successful ad completion; canceled/failed ads must not consume a hint or mutate progress. Ads cannot operate as “watch to proceed” offline; show unavailable/retry state.
- Determine whether pack buyers retain hint ads unless subscribed to ad-free. Keep image/theme entitlements separate from subscription entitlements.
- Website design reference is still awaited. Confirm countdown rules, login methods, production catalogue, pack grants/expiry and full release platform requirements before their respective milestones.

## Source-package contents and precedence

`references/mobile/` and `references/tablet/` contain 29 current screen references using stable original screen filenames. Seven have been replaced with the revised uploads. `references/superseded/` retains the replaced screenshots for traceability. `SCREEN_UPDATES.csv` lists each replacement and its supplied filename. Written decisions above override any residual screenshot inconsistency.

`assets/graphics/` contains the 27 existing named PNGs plus five newly named originals and the new Hint SVG. The original bulb PNG is in `references/graphics/`; use the SVG in the app. `ASSET_MAP.csv` and `asset_map.json` include source filename, use, dimensions/checksum where applicable. The inherited map is retained as historical reference. The SVG is original vector code, not a raster image embedded in SVG. It uses white shapes on transparency; the button supplies its own colour/background.

`prototype/` contains unchanged JSX and HTML. `docs/` contains this handover and source decision screenshots. `checksums.json` fingerprints packaged files. `graphics-updated.zip` contains the current graphics and maps for separate reuse. This consolidated source ZIP supersedes using the old Mobile/Tab/graphics ZIPs as the development input; the old uploaded archives themselves have not been overwritten.

---

# Historical Version 1 audit — reference only

The following audit describes the original attachments. Any conflicting proposal, count, maximum size, asset gap or unresolved decision is superseded by Version 2 above. In particular: six new source graphics are supplied (five deployed PNGs plus the original bulb reference); a new SVG is the deployed bulb, the maximum is 300 pieces, rotation is confirmed, placement semantics are preserved, and unlimited rewarded hints replace the earlier highlight-only hint proposal.

# Jigsaw App — Development Handover

Version 1 • 25 September 2026 (Sydney) • Source audit and proposed implementation specification

## 1. Scope and source authority

Build a Flutter/Dart jigsaw app for mobile and tablet from the supplied visual references and graphics. The supplied React/browser code is a **basic puzzle prototype only**. AI image generation, native camera capture, accounts, billing, settings, collections, backend services and persistent game saves are new implementation work. A screen showing a feature does not mean that feature exists in code.

This handover was produced by reading the JSX, inspecting the HTML application logic, visually reviewing all 29 screen references and the graphics index, and examining all 27 PNG files. This was a static audit, not a browser playtest or Flutter build. Findings about possible interaction defects require reproduction during implementation. No source attachments were changed.

| Source | Inspected contents | Role |
|---|---|---|
| Mobile.zip | 15 PNG screen references | Phone appearance and layout |
| Tab.zip | 14 PNG screen references | Tablet appearance and layout |
| jigsaw-v8.jsx | React component, browser Canvas sprites, puzzle state and input handlers | Behaviour reference to port, not native Flutter source |
| jigsaw (2).html | Bundled React/ReactDOM and compiled puzzle application | Standalone browser version with the same core mechanisms inspected; not a second backend or full app |
| graphics(1).zip | 27 named PNGs, ASSET_MAP.md, asset_map.json, README.md, visual_index.jpg | Already renamed graphics package, including confirmed shopping bag and circular lock roles |

Authority: explicit user decisions override screenshots; screenshots establish visual intent; prototype code establishes existing behaviour, not an automatic requirement to retain every limitation. Conflicts listed below must remain visible in the specification. Prices, dates, names, picture counts and allowances in screenshots are sample data until approved.

## 2. What exists and what must be built

| Capability | Existing evidence | Flutter work |
|---|---|---|
| Piece generation | `buildEdges`, `edgePath`, `sprite`: complementary edges and clipped image pieces | Port geometry and deterministic state; replace Canvas/data URLs with native drawing |
| Tap and drag placement | `tapTray`, `tapCell`, pointer handlers, placement primitives | Rebuild gestures and coordinate conversion; retain accessible tap alternative |
| Piece rotation | Upright `young` and 90-degree `teen` modes | Decide whether both remain; add missing final UI control |
| Move/replace/swap/return | Existing board/tray operations | Port with invariants and atomic validation |
| Completion and feedback | Exact target cell plus zero rotation; ticks, glow, celebration | Native rendering, progress rules and completion screen |
| Solution preview | `togglePeek` temporarily replaces board and restores in-memory snapshot | Preview overlay that never overwrites saved gameplay state |
| Time and move count | Count-up timer and partial move counting | Start/pause/resume, lifecycle handling, countdown if retained |
| Image input | Browser file input and FileReader | Native photo picker, camera, orientation correction, validation and crop |
| Zoom | 1–5 zoom controls with scrollable viewport | Native pinch/pan and fit behaviour; prevent gesture conflicts |
| Restart/shuffle | `init` resets puzzle and shuffles tray; shuffle helper exists | Separate restart and tray-only shuffle actions |
| Hint | No dedicated hint action | Define and implement |
| Persistent save/resume | No durable save in application logic; `saved` is preview-only state | Local database/files, schema versioning and restart recovery |
| All app screens outside puzzle | Images only | Build routes, components, data and states |
| AI, accounts, billing, cloud | No corresponding service implementation | Build services and integrations from scratch |

### Puzzle behaviour that must be deliberately preserved or changed

- The board is a grid of slots, not freeform pieces that join into movable clusters. No cluster snapping exists.
- `canPlace` checks outward flat edges and compatibility with occupied neighbours. It does **not** require the piece to be in its unique correct picture position. A visually wrong piece can be accepted. Completion uses the stricter exact-position test.
- All internal edges use a binary tab/blank style; matching shape is not proof of correct picture placement.
- In the JSX, each dimension is limited to 3–6 on mobile and 3–10 on larger viewports. Thus mobile is capped at 36 pieces and larger viewports at 100. The UI's 54/96/150/216 presets require new capacity and performance validation.
- `CAP = 900` limits initial image downscaling; the minimum 28-pixel cell can subsequently increase board size. This is a prototype rendering heuristic, not a production quality target.
- Changing image, dimensions or mode calls `init` and resets progress. Layout changes must not recreate an existing game in Flutter.
- The timer begins from interaction, pauses in solution view, and stops at completion. The supplied screens instead show an explicit Start Playing action and a Timer/Stopwatch selector.

### Risks to fix during the port

| Finding from source inspection | Required treatment |
|---|---|
| Board rotation changes orientation without calling `canPlace` | Decide if incompatible rotations are legal; validate resulting board if edge constraints remain |
| Swap checks both pieces with both slots temporarily empty | Validate the final board, including the new mutual edge when swapped cells are adjacent |
| Board rotation counts a move; tray rotation does not | Define one consistent move-count policy |
| Pointer cancellation uses the same handler as release | Cancel drag without committing a placement |
| Rectangular pieces can rotate 90 degrees | Test visual dimensions and edge matching; constrain mode or geometry if needed |
| Preview mutates live board and rotation arrays | Render a separate preview layer; avoid accidentally persisting a solved board |
| Browser file load has no user-facing decode/error/size workflow | Validate size and format, handle failure and large-image memory pressure |
| No deterministic seed or serialized layout | Persist exact edges, rotations, tray order and slots, or a versioned seed algorithm |

## 3. Screen inventory and behaviour contract

Paths below are the actual members inside the supplied ZIPs. They are references, not Flutter routes. Reuse one state model across mobile/tablet layouts.

| ID / screen | Mobile reference | Tablet reference | Required behaviour |
|---|---|---|---|
| S01 Home | `Mobile/mobile-homev1.png` | `Tab/tab-homev1.png` | Allowance summary, Add Puzzle, sort My Puzzles, Continue and Play Again; Home selected |
| S02 Create Puzzle | `Mobile/mobile-create puzzle.png` | `Tab/tab-create puzzle.png` | Image selection, row/column controls, quick picks, Timer/Stopwatch, create action |
| S03 Photo Gallery | `Mobile/mobile-photo gallery.png` | `Tab/tab-photo gallery.png` | Four image-source options, selected photo, Add Selected Image; obtain real device image access |
| S04 Camera entry | `Mobile/mobile-take photo.png` | `Tab/Tab-take photo.png` | Camera option active; Take Photo launches capture and handles permission/cancellation |
| S05 Captured image / crop | `Mobile/Mob-photo capturedv1.png` | `Tab/Tab-photo capturedv1.png` | Move/resize crop, darken outside, Retake Photo, Use Photo, cancel |
| S06 Generate with AI | `Mobile/mobile-AI.png` | `Tab/Tab-AI.png` | Prompt, optional upload, voice input, five style choices, Generate Image; async result states needed |
| S07 Curated collections | `Mobile/mobile-curated collection.png` | `Tab/tab-Curated collection.png` | Browse free/premium themes; lock badges; Buy Collection Packs opens billing |
| S08 Theme image picker | `Mobile/mobile-collection pic selection.png` | `Tab/tab-collection pic selection.png` | Theme heading, allowance summary, exclude-owned toggle, selected image, Add Picture |
| S09 My Collection grid | `Mobile/Mob-my collection grid.png` | `Tab/Tab-my collection grid.png` | Sort/filter, grid/detail switch, select image, Create Puzzle; My Collection selected |
| S10 My Collection detail | `Mobile/Mob-my collection detailed.png` | `Tab/Tab-my collection detailed v 1.png` | One image per row, name/theme, times used/date added/last used, selection and Create Puzzle |
| S11 Puzzle play | `Mobile/mobile-puzzle-type 2 .png` | `Tab/tab-puzzle.png` | Title/back, board, tray, progress/moves/time, Start Playing, Hint/Preview/Restart/Shuffle, ad area |
| S12 Settings menu | `Mobile/mobile-settings.png` | No standalone file; sidebar in settings pages | Account, Billing, Privacy & Legal, FAQ, Support, Sign Out |
| S13 Account | `Mobile/mobile-account.png` | `Tab/Tab-Account.png` | Name/email, password change entry, Save Changes, account deletion; field differences need resolution |
| S14 Billing | `Mobile/mobile-billing.png` | `Tab/tab-billing.png` | AI packs, themed collections, combos, purchase history and PDF actions; all commerce is new |
| S15 Privacy & Legal | `Mobile/mobile-legal.png` | `Tab/Tab-privacy and Legal.png` | Functional/analytics/marketing preferences and policy links; content and effects to be defined |

### Proposed navigation

1. Home → Add Puzzle → Create Puzzle → Add Image → selected source → crop/confirm → Create Puzzle → Play.
2. Photo Gallery → choose one image → crop/confirm → return to Create Puzzle with image retained.
3. Camera → capture → Retake or Use Photo → return with cropped image.
4. AI → generate → result review → use image → crop/confirm → return with image. Failed generation stays recoverable in the AI flow.
5. Curated Collections → eligible theme → theme image picker → Add Picture → add to My Collection and return selection to the calling flow. Locked theme → Billing → successful entitlement → return to theme.
6. My Collection → select image → Create Puzzle with that image preselected → Play.
7. Home Continue → resume exact existing session. Play Again → new session using its image/settings; preserve completed history.
8. Settings → settings subpage. Tablet sidebar and mobile push routes share state. Sign-out/account deletion have explicit confirmation and data handling.

Items 2–8 include inferred transitions because screenshots are not interactive specifications. Preserve the originating route and draft so back navigation does not lose an image or prompt. No automatic purchase or AI request should occur merely from entering a page.

### States missing from the visual references

Design these using the same components: empty Home/Collection; no filter results; disabled selection actions; permission denied/restricted; picker canceled; image decode failure; capture unavailable; crop cancel; generation loading/queued/canceled/failed/rejected/out-of-allowance; generated result review; offline catalogue; locked/unlocked collection; purchase pending/canceled/failed/restored; login/signup/password reset; account change success/error; deletion confirmation; pause/resume; completion; countdown expiry; restart confirmation; FAQ content; support contact; policy reading; receipt availability.

## 4. Visual specification and corrections

Use a shared design system: white/light lavender surfaces, dark indigo text, purple primary theme (existing project direction: `#462bd9`), subtle gradients, rounded cards and clear whitespace. Exact font family and gradient stops are not recoverable from these screenshots; choose and review a consistent set. Do not rasterize whole screens into the app. Device frames, status-bar samples and sample personal data are not app assets.

Phone play layout: title → progress/start → board → tray → four controls → ad area. Tablet play layout in the supplied file: board on the left, progress and controls on the right, tray below, ad area at bottom. Use available logical width rather than the prototype's browser breakpoints. Phone portrait/tablet landscape are supplied; other orientations require a product decision.

Maintain 3:2 landscape image presentation as the established project direction, but flag the crop geometry and exact tablet grid count for confirmation. Custom row/column combinations can make rectangular cells; the art itself must not be stretched. Use visible scrollbars for long lists and keep bottom actions clear of system insets. Asset sizing should account for each PNG's intrinsic aspect ratio and transparent padding.

| Conflict in supplied references | Proposed resolution (not silently approved) |
|---|---|
| Billing/legal/account tablet pages and mobile Billing use Favourites; Home/Collection use My Collection | Standardize Home / My Collection / Settings, matching prior explicit naming |
| Mobile AI highlights Photo Gallery; curated collection screens also highlight Photo Gallery | Highlight the actual active source; use tablet AI's selection logic as reference |
| 12 × 18 labelled 212 pieces | Calculate counts from dimensions: **216**; retain 54, 96 and 150 for other presets |
| Tablet theme picker shows exclude-owned ON while owned items remain visible | ON hides owned items; OFF displays them dimmed and unavailable |
| Tablet My Collection grid has five columns; theme picker and gallery have six | Decide adaptive five/six versus fixed six; phone grid references use three |
| Mobile Account contains Country/Timezone; tablet does not | Propose omit, consistent with earlier removal direction; do not infer demographic requirements |
| Account deletion copy mentions child profiles, chat histories and parent settings | Replace with actual jigsaw data consequences; those features are not established scope |
| Mobile detailed view uses metadata icons; tablet uses text labels | Prefer explicit Times Used / Date Added / Last Used labels where space allows |
| Play screens label eye action PREVIEW; previous project discussion used SHOW SOLUTION | One action and one agreed label; do not implement two duplicate preview features |
| Back/close/settings controls vary across image-source references | One back action in source selection; close/cancel in crop; top-right settings on AI is optional |
| Crop screenshots differ in apparent ratio/edge alignment | Fixed 3:2 output proposed; resize within image bounds without copying inconsistent mockup geometry |
| Prices, pack totals and allowance fractions vary | Treat as fixtures; define server catalogue and allowance semantics before commerce work |

## 5. Graphics integration

All 27 supplied PNGs are readable RGBA images with some transparent pixels. Original dimensions range from 698 to 1356 pixels wide and 710 to 1104 high. These are ample source icons, but should be decoded at appropriate display sizes rather than loading every full-size texture at once. Keep originals unchanged; create optimized derivatives only as part of the build workflow.

The existing map is useful but not absolute: `ai_sparkles.png` is appropriate for AI actions/allowance, while Create Puzzle shows a **jigsaw** symbol. Do not use sparkles for every Create Puzzle button merely because the inherited map mentions that reuse.

| Component family | Assets in `graphics/` |
|---|---|
| Four source tiles | `image_source_photo_gallery.png`, `image_source_camera.png`, `image_source_ai_generate.png`, `image_source_curated_collections.png` |
| AI styles | `ai_style_realistic.png`, `ai_style_artistic.png`, `ai_style_cartoon.png`, `ai_style_watercolor.png`, `ai_style_sketch.png` |
| AI actions/allowance | `ai_sparkles.png` |
| Billing | `billing_ai_picture_pack.png`, `billing_themed_collection_piece.png`, `billing_combo_puzzle_pair_tilted.png`; straight pair retained as alternate |
| Premium/upsell | `premium_collection_crown.png`, `premium_collection_lock.png`, `premium_collection_locked_badge.png`, `collection_packs_shop_bag.png` |
| Settings | `settings_account.png`, `settings_faq.png`, `settings_support.png` |
| Privacy preferences | `privacy_functional_shield.png`, `privacy_analytics.png`, `privacy_marketing.png` |
| Policy links | `legal_terms_conditions.png`, `legal_privacy_policy.png`, `legal_cookie_policy.png` |

Copy to `assets/graphics/` and register that directory in Flutter's asset configuration. Use a typed asset-name registry; keep selection rings, badges and text as native UI layers. Never bake changing prices or labels into PNGs. Standard back/home/grid/list/settings/play/pause/eye/shuffle/restart/image/jigsaw/microphone icons can be native vectors.

**Not supplied as separate production assets:** scenic catalogue photos/thumbnails, the yellow Add Image illustration, app launcher icon/splash branding, font files, and microphone waveform artwork. Scenic images appear inside screenshot references but are not an original image catalogue. Supply originals or create an approved replacement collection. The yellow card and waveform can be recreated with native layout/vector work; no manual user placement is required.

## 6. Proposed Flutter structure and data contracts

These are implementation proposals, not claims that a framework package or cloud provider has already been selected. Choose exact dependency versions when establishing the build and verify their current documentation then.

| Module | Responsibility |
|---|---|
| `app/` | Navigation, theme, startup and dependency wiring |
| `features/home/`, `collection/` | Session list, image metadata, filters and selection |
| `features/image_sources/` | Photo picker, camera, crop, AI result flow and catalogue |
| `features/puzzle/domain/` | Pure Dart edges, board state, placement, rotation, completion and serialization |
| `features/puzzle/presentation/` | Board painting, hit testing, drag overlay, tray and controls |
| `features/settings/`, `account/`, `billing/` | Screen state and service interfaces |
| `data/local/` | Durable metadata database, app-owned image files and migrations |
| `data/remote/` | Authentication, catalogue, generation, entitlements and optional sync |
| `shared/widgets/` | Buttons, cards, source tiles, allowance summary and adaptive navigation |

Persist logical state rather than widget geometry or piece bitmap data. A session needs: session ID, image ID, crop transform, rows/columns, rule mode, engine/schema version, exact edges or seed plus algorithm version, each piece rotation, board slots, tray order, move count, elapsed time/countdown configuration, status, timestamps and completion history. Save after committed actions and on lifecycle transitions. Preview state is transient. Recover safely from interrupted writes and missing image files.

| Entity | Minimum data |
|---|---|
| ImageAsset | ID, source type, local original/working image paths, dimensions, crop, title, theme, date added, origin catalogue ID, ownership |
| PuzzleSession | Versioned state above; immutable image/settings reference and resumable progress |
| PlayHistory | Session/attempt IDs, start/completion, duration and moves; define when usage increments |
| Collection/CollectionImage | Theme ID, title, catalogue version, cover, ordered image IDs, access requirements |
| GenerationJob | User, prompt/style, optional reference image, job status/result, request idempotency key, allowance reservation |
| Product/Entitlement | Store product mapping, pack contents, verified ownership and grant ledger |
| Preferences | Sound/haptics if adopted, privacy choices, display preferences; no secrets |

### Services to build later in the milestones

- AI service: app submits an authenticated generation job to backend; backend holds provider credentials, validates allowance and request, performs generation, stores result and exposes status. Handle retries without double charging. Failed/rejected generation releases any reservation. Decide provider/model/budget after product rules are agreed.
- Commerce service: load product catalogue and localized prices, integrate mobile purchasing, verify transactions server-side, grant each purchase once, restore entitlements and reconcile reversals. Do not trust a client-edited allowance balance. Store rules and provider capabilities must be checked during implementation; this handover is not a compliance assessment.
- Account service: chosen sign-in methods, guest migration if adopted, profile edits, credential reset, sign-out and deletion. Do not store or display the user's existing password; the mockup password row should become a change-password flow.
- Catalogue/content service: original images, thumbnails, theme metadata, versioned downloads and access enforcement. Define whether purchased content remains usable offline.
- Optional sync: separate local session persistence from cloud sync. Add conflict handling before enabling multi-device writes; do not overwrite a newer game silently.
- Privacy/settings: controls must affect the selected analytics/marketing services. Static toggles are not completed functionality. Policy/FAQ/support text and destinations remain required content.

## 7. Decisions needed from the owner

All recommendations below are provisional. Unanswered decisions do not prevent a reusable design system or isolated engine work; they do gate the corresponding behaviour/service release.

| ID / timing | Decision | Suggested starting point |
|---|---|---|
| D01 — before engine acceptance | Allow wrong-but-shape-compatible placements like the prototype, or accept only the correct piece? | Preserve prototype rules initially for review; this is a major gameplay choice |
| D02 — before engine acceptance | Keep rotation? How does the user choose it? | Upright default plus explicit Rotation difficulty toggle; avoid age labels unless intentionally targeted |
| D03 — before engine acceptance | Maximum puzzle size/custom dimensions? | Support the four shown presets through 216, subject to phone performance tests; minimum 3×3 provisional |
| D04 — before gameplay controls | What does Hint do? Free/unlimited or limited? | Highlight the correct target for a selected piece; separate from full-image Preview |
| D05 — before gameplay controls | Countdown duration and timeout behaviour? Start manually or on first move? | Explicit Start/Pause; Stopwatch first milestone, countdown deferred until duration/expiry is defined |
| D06 — before gameplay controls | Progress counts occupied cells or correctly placed pieces? Move counting? Restart/shuffle rules? | Correct placements/total; one move per successful board edit; Shuffle rearranges tray only; Restart confirms and resets current attempt |
| D07 — before layout sign-off | Accept corrections in section 4? Fixed 3:2 crop? Fixed six-column tablet collection grid? | Accept clear label/count/selection fixes; adaptive tablet columns pending visual review |
| D08 — before platform setup | Android and iOS launch together? Required orientations and oldest supported devices? | One Flutter app; phone portrait and tablet landscape for first review; choose test devices before performance targets |
| D09 — before accounts/ads/AI | Intended audience: adults, general audience, or children? Are parent/child profiles real scope? | Treat old child/chat deletion text as placeholder until answered; audience affects product and service choices |
| D10 — before accounts | Guest play or mandatory login? Which sign-in methods? | Local guest play; account required for purchased/generation entitlements; explicit migration of guest data |
| D11 — before sync | Local saves only or cross-device cloud sync at launch? | Durable local saves first; add sync as a separate milestone |
| D12 — before AI | Text-only generation, uploaded-photo transformation, voice prompt, or all three at launch? | Text + five styles first; upload and voice are separately scoped features shown in UI |
| D13 — before AI | Initial free allowance, what consumes one picture, expiry, regeneration and rejected-image policy? | Deduct once per successfully delivered image; no deduction on failure; decide whether discarding a result consumes it |
| D14 — before commerce | Exact pack contents, prices, currencies, one-time/subscription model and bundle rules? | Treat displayed prices as placeholders; define products centrally |
| D15 — before commerce | Do theme packs unlock entire themes permanently, a number of selected themes, or individual pictures? What does 75/100 mean? | Prefer permanent theme unlocks for clarity, but confirm against intended theme/picture allowance model |
| D16 — before commerce UI completion | Is purchase-history PDF required? Receipts from store or custom generated documents? | Use actual available transaction history; no fabricated invoices |
| D17 — before content | Original scenic library available, or create replacement art? How many free/premium images? | Start with small approved catalogue and source/rights records; 50/100/120 screenshot counts are not commitments |
| D18 — before ads | Banner ads at launch? Ad-free option? Rewarded hints? | Keep layout slot in prototype; enable real ads only after audience and monetization are chosen |
| D19 — before release | App name/logo, support contact, FAQ and legal text, analytics choice? | Owner supplies business identity/content; implement pages with reviewed copy |
| D20 — before backend integration | Preferred cloud provider, operating budget, deployment region and account ownership? | Keep service interfaces independent until costs and requirements are established |
| D21 — before collection acceptance | Does Add Picture also add to My Collection? Single or multiple selection? Can users rename/delete/tag images? | Single selection; import once; preselect for puzzle; define deletion behaviour for linked sessions |

## 8. Milestones and acceptance gates

| Milestone | Deliverable | Acceptance evidence |
|---|---|---|
| M0 — source/spec baseline | Repository, immutable references, this handover, decision log, asset registry | Every reference linked; no unresolved product assumption represented as approved |
| M1 — local playable app | Shared UI, Home/Create/Gallery/Crop/Play, pure Dart engine, durable save/resume | Create → play → kill/reopen → resume exact state on phone and tablet; preview never changes saved state |
| M2 — complete local experience | Camera, My Collection grid/detail, filters/metadata, approved controls, empty/error states | Real-device camera/picker permission tests; layout and gesture review; restart/shuffle/hint behaviour verified |
| M3 — accounts and catalogue | Chosen auth, profile, downloadable theme catalogue, settings/content; sync only if selected | Sign-in/out/deletion and guest migration tests; offline download behaviour; ownership enforcement |
| M4 — AI generation | Backend jobs, allowance ledger, styles, result review; optional voice/reference upload | Failure/retry/cancellation paths; no provider secret in app; no double deduction |
| M5 — monetization | Product catalogue, purchases/restoration, entitlements/history, optional ads | Sandbox purchase scenarios, duplicate callbacks, restore and offline reconciliation |
| M6 — release preparation | Device QA, accessibility/performance work, build/deploy automation, release documentation | Reproducible builds; staging service checks; signed packages using owner accounts/toolchains |

M1 is the first testable milestone, not a reduction of the final app scope. Feature screens backed by fixtures must be labelled as development fixtures and cannot be reported as completed integrations.

### Meaningful verification

- Engine: complementary adjacent edges, flat boundaries, valid placement policy, rotation mapping, final-state swap validation, no duplicate/lost pieces, exact completion, serialization round trip.
- Interaction: tap versus drag, canceled drag, scroll versus drag, zoom hit testing, rectangular-piece rotation, tray return, replacement of occupied cells, layout resize without resetting a game.
- Persistence: close during play, close while previewing, interrupted write, app update/migration, missing file, replay history and timezone-safe timestamps.
- Visual: compare rendered phone/tablet screens to references after removing device chrome; validate text scaling, minimum usable controls, scrollable content and bottom safe areas. Do not force screenshot-sized fixed coordinates.
- Performance: profile largest approved puzzle and large imported images on named devices; use a 60-fps interaction target where device supports it and record measured results, initialization time and peak memory. No performance claim has been established in this audit.
- Services: permission denial, network loss, expired authentication, duplicate AI/purchase requests, restore/reconciliation and deletion effects.

## 9. Repository handoff and next implementation instruction

Suggested repository locations: `docs/` for this handover and decision log; `references/mobile/` and `references/tablet/` for screenshots; `references/prototype/` for unchanged JSX/HTML; `assets/graphics/` for named assets; `assets/catalogue/` for approved sample art; `lib/` for Flutter; `test/` and `integration_test/` for meaningful verification; `backend/` and `infra/` when selected; `.github/workflows/` for build automation. Store signing credentials and service secrets outside source control.

First implementation task:

> Establish the Flutter repository using this handover and attached source references. Build M1 as actual project files. Keep the prototype unchanged as a reference, port the puzzle engine to pure Dart, and implement the supplied mobile/tablet visual layouts using the named assets. Record unresolved decisions; do not silently choose monetization, audience or cloud semantics. Demonstrate image selection, fixed-ratio crop, puzzle creation, play, and durable resume. Add regression tests for engine invariants and persistence. Report exactly what ran, what passed, and which platform builds remain unavailable.

This audit delivers a specification, not app binaries. No Flutter/Android/iOS toolchain or cloud account was configured or validated during this task. Signed store builds and backend deployment are later milestone deliverables with their required accounts and environments.

## Appendix — source fingerprints

SHA-256 fingerprints identify the exact supplied files audited.

| Supplied file | SHA-256 |
|---|---|
| Mobile.zip | `27b1752a124a7c0557ef58af3f745bba5ef5b3b2018757180caa4fb90b7eef73` |
| Tab.zip | `cc7ebcf8f550dcd346e7f615db7f91e8a2439bab0c43a580a363907570f4d896` |
| jigsaw-v8.jsx | `26cce0f3f1c0bba4f5f9ecb6a570233081e18c6fba85771e2083c1c22c6ab825` |
| jigsaw (2).html | `3ac7e9627dad12b6bfcd906d2b54f400ff8289d7e7004b4044499215682e38db` |
| graphics(1).zip | `fa68e6bc3d77dc99500eac02ac604ec5ad5bcc2ec907d7fb3a3ff34c63953f16` |
# Version 3 update — website reference and unified notch-fit rule

This section supersedes any conflicting placement, rotation, legal-page, FAQ or support-page wording later in the document.

## Newly supplied source references

- `prototype/jigsaw-v10.jsx` and `prototype/jigsaw-v10.html` are the latest supplied browser prototype. Keep the older prototype files for history only; use v10 when studying the algorithm.
- `website/` contains the supplied Jigsaw Fun Time website mockup. The app's Privacy & Legal, FAQ and Support entries should open the corresponding public website destinations. The source pages are `privacy.html`, `terms.html`, the FAQ/help content in `support.html`, and the support contact section at `support.html#contact`.
- Do not bundle a local HTML file as the production policy destination. Deploy the website over HTTPS, configure stable public URLs, and open them using the platform browser or an approved in-app web view.
- The policy text is draft product copy, not approved legal advice. Review it against the final data collection, AI provider, advertising, analytics, account deletion, purchases, target countries and child-safety posture before release.
- The supplied support form explicitly does not send messages. Production needs a real submission endpoint or approved email/support workflow, abuse protection, delivery/error states and a verified support address.

## Authoritative unified placement rule

Each piece has top, right, bottom and left edges. Each edge is flat, an outward tab or an inward blank. Adjacent generated pieces are complementary.

A piece **complies** at its current cell and orientation only when both conditions hold:

1. Every side facing the outer puzzle boundary is flat. A tab or blank may not point outside the frame.
2. Every side touching an already placed neighbour meshes with that neighbour's facing edge. A side facing an empty cell imposes no constraint.

Every compliant placement is accepted and released even when the piece is not in its home cell; a wrong-but-shape-compatible position is valid gameplay. A non-compliant drop is rejected **as a settled placement** in either rotation mode: the piece may remain in the attempted cell, but it stays selected and cannot be released there. The player can rotate it or move it again. This is the v10 interaction confirmed by the owner. Solution correctness is separate: the puzzle is won only when every piece is in its home cell in that piece's correct solution orientation.

After a placement, move or swap, evaluate the affected piece at its new position and orientation. A compliant piece releases. A non-compliant piece stays selected at that location and must be rotated or moved before it can release. Swaps must remain atomic and must never lose or duplicate either piece.

After every committed placement, move, swap or in-place rotation, re-evaluate the moved/rotated piece at its current position and orientation:

- If it complies, it releases and can be deselected normally.
- If a placement or in-place rotation is non-compliant, it remains the active selected piece and cannot be deselected in that location/orientation.
- It is not frozen: it can be rotated when rotation is enabled, moved to another cell, swapped, or returned to the tray. Re-check compliance at the new position/orientation; retain no failure memory tied to an earlier cell.
- The board and tray remain interactive while a rotated, non-compliant piece is selected. Moving it to a compliant destination, rotating it into compliance, or returning it to the tray resolves the locked selection without losing or duplicating pieces.
- With rotation disabled, all pieces remain at 0 degrees and no rotate action is shown, but placement and selection-lock semantics are otherwise identical.

## v10 prototype audit against the authoritative rule

The v10 code correctly includes rotated-edge mapping, flat boundary checks, complementary neighbour checks, random starting quarter-turns, exact home-cell-plus-0-degree completion, and compliance re-checks after moving a selected piece.

The owner tested v10 and confirmed that its rotation-enabled selection-lock interaction is the intended reference behaviour. In the Flutter port, describe a non-compliant drop as “not released” rather than implying that the piece must snap back to its source. Flutter tests must cover rotating it into compliance, moving it to another cell, returning it to the tray and interacting with occupied destinations without losing or duplicating pieces.

Required engine tests now include all four rotations, boundary compliance after rotation, neighbour compliance after rotation, non-release of non-compliant drops, acceptance and release of compliant wrong-home-cell drops, lock/release transitions, relocation clearing stale compliance, atomic occupied-cell swaps, exact completion using each piece's solution orientation, and serialization of selection plus orientation.

## Confirmed M1 action counting

- Swapping two board pieces counts as one move.
- Rotating a piece does **not** count as a move.
- Returning a board piece to the tray counts as one move.
- A successful automatic Hint counts as one move.
- When Hint's target is obstructed, return the obstructing piece and incompatible neighbours to the tray.
- Only the active US$2.99/month ad-free subscription removes Hint ads; picture/theme pack purchases do not remove them.
- Store a per-piece `solutionOrientation` (or equivalent normalized target) and compare against it during completion. Do not hard-code the product rule as a literal 0-degree value, even if an implementation internally normalizes a piece's solution orientation to zero.
