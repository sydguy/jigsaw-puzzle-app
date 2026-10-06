# V1 requirements register

DEV-LOCAL-01 (5 October 2026, retained latest owner decision): local Expo web development/review first; EAS builds and native provisioning deferred until owner reconsideration. Acceptance: phone portrait and tablet portrait/landscape browser review, with native-only behavior labelled unverified. Supersedes native M1 as a prerequisite for browser implementation, not as a release gate.

Authority: latest owner decisions, then [production plan](production-v1-plan.md) and [security requirements](security-requirements.md). Historical sources are evidence, not active instructions. Status below describes requirement disposition, not implementation completion.

## Historical owner decisions

| Source ID | Disposition and current requirement | Milestone | Acceptance |
|---|---|---|---|
| Sept26 D01 | Retain wrong-home compatible placement; non-compliant placement stays selected. Completion uses home and solution orientation. | M3 | ENGINE-01 |
| D02 | Retain optional quarter-turn rotation, default off; button and tap-again supported. | M3 | ENGINE-02 |
| D03 | Supersede 15x20 and provisional minimum: linked 2x3 through 16x24, presets 54/96/150/216. | M1/M3 | ENGINE-03 |
| D04 | Retain unlimited hints; corners wherever located, then tray, then misplaced board. Supersede strict ad rule with no-fill/technical-failure fallback, cancellation excluded. | M3/M8 | ENGINE-04, ADS-01 |
| D05 | Retain explicit Start/Pause; countdown now v1. Both clocks pause outside foreground. | M3 | CLOCK-01 |
| D06 | Retain correct-only progress; every board change including selected noncompliant move counts once, rotation zero, swap once. Invalid displaced-piece swap rejects atomically without count. | M3 | ENGINE-05 |
| D07 | Retain crop/navigation/labels; detailed UI matrix below. | M2/M4 | UI-01 |
| D08 | Supersede Flutter and review-only orientation: Expo/RN; phones portrait, tablets both; both ecosystems launch. | M1/M2 | PLATFORM-01 |
| D09 | Retain no child/chat/parent features; general audience primarily teens/adults; no child-directed marketing. | M8/M10 | PRIVACY-01 |
| D10 | Retain guests; accounts for purchases. Apple, Google, verified email/password. Explicit local guest migration choice. | M6 | ACCOUNT-01 |
| D11 | Retain device-local saves; defer full cross-platform image/progress sync with photo-upload consent. | M4 | SAVE-01 |
| D12 | Defer AI: text and five styles first; voice/reference transformation not v1. | Future | DEFERRED-01 |
| D13 | Defer AI charging: successful delivery consumes once including discard; failure none; no free allowance. | Future | DEFERRED-01 |
| D14 | Retain configurable products; owner approves quantities/prices before paid beta. | M7/M9 | COMMERCE-01 |
| D15 | Resolve proposal: choose theme on first Add with confirmation; non-expiring unlock and shared picture allowances; acquire distinct picture once/account. | M7 | COMMERCE-02 |
| D16 | Replace PDF placeholder with accurate purchase history and store receipt guidance. | M7 | COMMERCE-03 |
| D17 | Retain owner-created catalogue: estimated 20 free plus 3 premium themes x30; owner approves AI-created artwork before publication. | M5/M9 | CONTENT-01 |
| D18 | Retain ads and US$2.99/mo base; subscription removes all ads/enables offline, no premium/AI allowance. | M7/M8 | ADS-02 |
| D19 | Retain real HTTPS FAQ/policy/support destinations; website mock guidance only; landing later; form delivery/spam/failure handling required. | M8 | SUPPORT-01 |
| D20 | Supersede unchosen backend: Supabase, RevenueCat, Expo/EAS. Minimize fixed costs. Expo account/project now linked; remaining provider and store accounts are setup gates. | M0/M1 | SETUP-01 |
| D21 | Retain single-picture import; collection deletion cascades after count-confirmation; Home deletion preserves picture. | M4 | SAVE-02 |

## Owner UI image (top-to-bottom rows)

| Row | Disposition/current rule | Acceptance |
|---|---|---|
| 1 | Retain Home / My Collection / Settings; tablet nav on Account/Billing/Legal; mobile Billing back to Settings, no bottom menu. Owner update 5 October: native tabs on all native devices; OS-controlled iPad position/appearance supersedes exact full-width bottom geometry. Browser uses design-matched bottom navigation. | UI-01 |
| 2 | Retain actual source highlighting; AI source hidden until future release. | UI-02 |
| 3 | Retain 12x18 =216, not212; counts computed from dimensions. | ENGINE-03 |
| 4 | Retain exclude-owned ON hides; OFF dims/disables acquisition. | UI-03 |
| 5 | Retain three phone/six tablet app grid columns; one detail row. OS picker is separate. | UI-04 |
| 6 | Remove Country/Timezone from mobile Account. | UI-05 |
| 7 | Remove child/chat/parent deletion copy; use real jigsaw-data consequences. | ACCOUNT-02 |
| 8 | Retain Times Used / Date Added / Last Used. | UI-06 |
| 9 | Retain Preview label only. | CLOCK-01 |
| 10 | Resolve original uncertainty using later handover: source Back preserves draft, crop X cancels; remove redundant tablet camera close and deferred AI gear. | UI-07 |
| 11 | Retain bounded fixed3:2 crop. | IMAGE-01 |
| 12 | Resolve placeholders: fractions are used/granted; configuration and real store prices govern. | COMMERCE-01 |

## Interview refinements and detailed acceptance

| ID | Required behavior / verification | Milestone |
|---|---|---|
| UI-01 | New Home has existing headers, Add Puzzle and empty My Puzzles. Preserve supplied active layouts and artwork with written corrections. | M2 |
| UI-02..07 | Apply and visually verify each owner-UI row above, phone portrait/tablet both orientations. | M2/M4 |
| ENGINE-01..05 | Test every allowed grid and random action sequences; no duplicate/lost piece, correct edge tests, final-mutual-edge swaps, successful hint one move. | M3 |
| GAME-06 | Restart/Play Again retain cut/settings and Home identity, reset stats and shuffle tray/angles; Create always separate. Confirm destructive restart. | M3/M4 |
| GAME-07 | Times Used counts started attempts including restart/replay, never resume. Progress is correct-only. Brief completion celebration, time/moves, Home/Play Again, timed-vs-untimed result. | M3/M4 |
| GAME-08 | Horizontal single-row tray, Shuffle; pinch zoom/two-finger pan, zoom/Fit, drag and tap alternative. Ad-free space goes to board. | M1/M3 |
| CLOCK-01 | Both clocks pause on Home/background/close/lock/ads/forced connectivity pause. Return requires Resume. Preview auto-resumes iff previously running. Pre-start/paused board visible but moves/rotation/hints/shuffle disabled. | M3 |
| CLOCK-02 | Fixed per-count countdown table version captured per attempt; tune before beta. Hard timeout offers Restart/Home/rewarded untimed continuation; never timed success. | M3/M9 |
| CLOCK-03 | Owner 6 October: fresh Create Puzzle defaults to Timer (countdown); choices Timer / Stopwatch / None. None turns timing off with no countdown deadline and no timed-success classification. Existing draft selections survive source navigation. Supersedes the old two-mode setup and provisional Stopwatch default; countdown values remain open. | M2/M3 |
| IMAGE-01 | OS picker -> selected-image confirmation -> bounded3:2 crop. Camera permissions requested just in time. Cancellation adds nothing. Crop reused for all puzzles. | M4 |
| IMAGE-02 | Default editable titles; catalogue title/theme; photos original/OS name, theme My Photo; AI future generated title/theme AI Image. | M4 |
| SAVE-01 | Local images/progress only; no manual backup v1; clearly explain uninstall/device-loss risk. Transactional acknowledged saves and validated recovery. | M4 |
| SAVE-02 | Test cascade count/confirmation and Home-only deletion. Storage-based limits, no arbitrary20-puzzle cap; never evict user saves. | M4 |
| ACCOUNT-01 | Apple/Google/email-password with verification/reset; local guest assignment ask first, refusal keeps separate guest content. | M6 |
| ACCOUNT-02 | Signout hides retained account data. Deletion removes account data now/otherdevices on reconnect; preserve unrelated guest data. Reauthentication required. | M6 |
| COMMERCE-01 | Configurable non-expiring products, quantities and prices pending owner approval before paid beta. Used/granted fractions. Accurate purchase history, no PDF. | M7/M9 |
| COMMERCE-02 | Theme first-use claim confirmed and transactional; shared picture balance; unique acquisition peraccount/picture, redownload free including other OS. | M7 |
| COMMERCE-03 | Account benefits cross iOS/Android; billing managed originalstore. RevenueCat verification and deduplicated server ledger; cancelled/pending purchase no grant. | M7 |
| OFFLINE-01 | Free guest/signed-in online play; lost connection60s grace then save/pause. Subscriber previously signed in can play/create local/downloaded pictures until verified paidexpiry; renew online. Starter content downloaded during online setup, not bundled. | M7/M8 |
| ADS-01 | Reward once on completion or unavailable/technical failure, none on cancellation. Free online no-fill does not block gameplay. | M8 |
| ADS-02 | Banner and eligible Start/Restart/PlayAgain interstitial <=1/5min, skipfirsteverstart, avoid adjacent reward/interstitial. Subscriber no ads. | M8 |
| PRIVACY-01 | Optional personalized ads with valid consent/platform permissions/age handling; denial doesn't blockplay. Crash/error plus opt-in analytics; no sensitive content logs. | M8/M10 |
| ACCESS-01 | Scalable readabletext, contrast, large targets, labelled controls, reducedmotion. No fully nonvisual puzzle v1. Independent subtle sound/haptic toggles, no music. English with translation-ready strings. | M2/M8 |
| CONTENT-01 | Owner-only MFA admin upload/organize/review/publish, catalogue originals and rights reviewed; no screenshot-thumbnails-as-content. | M5/M9 |
| SUPPORT-01 | FAQ and delivered contactform, abuse protection, deliveryfailure handling; real HTTPS policies. | M8 |
| PLATFORM-01 | Australia, iPhone/iPad/Androidphones/tablets; iOS15.1+/Android7+ targets subject to proof. SDK55 baseline. Physical iPad releasegate. | M1/M9 |
| SETUP-01 | Windows localweb preview default, EAScloudbuild only when needed, optional cloudsim. Owner accounts/identifiers absent and blocked, not fabricated. | M0/M1 |
| QUALITY-01 | Physical flows, interruptions, purchase/restore/adfailures and smooth384 on supporteddevices before release; no deadline over quality. | M9/M10 |
| DEFERRED-01 | AI later: OpenAI/Gemini API compare pricequality; nofreeallowance; previewAdd/Discard; variation costs; onepending job continues away; temporarydelivery/exportPhotos, no cloudarchive. | Future |
| DEFERRED-02 | Future cooperative+competitive multiplayer and exact singleplayer cloudsync acrossOS, explicit personaluploadconsent. No push initial. | Future |
| BRAND-01 | Jigsaw Fun Time workingname; branding/identifier/icon open. | M0/M9 |

## Historical implementation supersessions

Flutter/Dart, old milestones, old20-save cap, independent rows/columns, minimum3x3, maximum300, clocks counting while closed, AI launch, custom device gallery, receipt PDFs, six-month creditexpiry and website marketing promises are not active requirements. Exact edge arrays/solution orientations, bounded saves, atomic mutations and source provenance remain applicable.

## Security mapping

The active security document retains each original bullet in order with explicitly documented technology/grid/ad supersessions. Its AI charging bullet is deferred. See security-traceability.json for every original bullet hash and current disposition; security evidence belongs to the relevant milestone and independent release review.

## Not yet accepted

This register is documentation, not a claim of exhaustive acceptance. Expo is linked; remaining service accounts, final missing-state owner review and production setup remain open. Under DEV-LOCAL-01, browser development can proceed before native compatibility proof. Native compatibility/performance must pass before native acceptance and release. See browser-implementation.md for partial M2/M4 evidence.
