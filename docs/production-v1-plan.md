# Production v1 development plan — Jigsaw app

Owner sequencing update — 5 October 2026: development and review now proceed in local Expo web on Windows first, covering phone portrait and tablet portrait/landscape layouts and browser-compatible gameplay. EAS builds, signing and native provisioning are deferred until the owner revisits them after browser review. This supersedes the requirement to complete native M1 proof before browser UI/gameplay implementation. Native M1 evidence is still required before native acceptance and release; browser results do not prove iOS/Android compatibility. Existing EAS configuration is retained dormant. Native-only services must remain clearly identified as unavailable or development adapters in browser review, never verified purchases or entitlements.

## 1. Product baseline and technical direction

Build an Australian, English-language release for iPhone, iPad, Android phones and Android tablets. The priority is enjoyable, reliable puzzle play that preserves progress and matches the approved app designs.

**Keep the requested stack: Expo, React Native and Supabase.** It suits this app. Add a dedicated puzzle renderer, durable local storage, RevenueCat and native advertising integration.

The main trade-off is older iOS support: **target Expo SDK 55 to retain iOS/iPadOS 15.1 compatibility**, with Android 7+ as the compatibility target. These targets require successful dependency and device testing before becoming advertised support commitments.

### Launch scope

**Included:**

- Curated pictures, personal-photo imports and camera capture.
- Single-player puzzles from 6 to 384 pieces.
- Timer (countdown, default), Stopwatch and None (timer off) modes. Owner update: 6 October 2026.
- Local collections, exact puzzle saves and replay.
- Guest play, Apple/Google/email sign-in.
- Non-expiring premium theme/picture packs.
- Ad-free subscription, subscriber offline play, banners, interstitials and rewarded actions.
- Owner-only catalogue administration.
- Settings, accessibility support, purchase history, account deletion, working support and policy pages.

**Deferred:**

- User-facing AI image generation and associated products.
- Cooperative/competitive multiplayer.
- Cloud collection/progress sync and manual backup/restore.
- Push notifications, leaderboards, social features and background music.
- Public web gameplay and the marketing landing website.

AI-generated artwork may still supply the owner-curated launch catalogue. That is separate from offering AI generation inside the app.

### Requirements authority

Use this order when references disagree:

1. Latest explicit decisions from the owner.
2. This plan, the consolidated requirements register and incorporated security requirements.
3. Current app design screens for visual details not overridden in writing.
4. v10 prototype as a behavioral reference.
5. Archived documents and owner-decision images for historical traceability only.

The website is guidance only. Flutter engineering choices, earlier milestone approvals and outdated limits do not carry into the new implementation.

Before development, create a consolidated requirements register with identifiers linking each decision to its screens, implementation milestone and acceptance tests. Preserve imported references unchanged.

### Local plan storage and superseded documents

This plan and its detailed requirements supersede earlier written design/implementation guidance. Map every earlier confirmed decision as retained, superseded or deferred before archiving; omission does not cancel it. Imported bytes remain unchanged.

Save the active plan, requirements register, security requirements and documentation index in docs. Move both handovers, the former decision log, both owner-decision images and historical asset map unchanged into docs/superseded. Archive the original security-requirements.md there and replace its active path with reconciled security guidance.

Retain source-baseline.json, source-inventory.md and source-corrections.md as historical provenance, not active specifications. Retain ai-sparkles-placement.png as a visual reference for deferred AI. Preserve historical CSV/checksum records; create a separate current source index with actual paths, archive mappings and intentionally removed old prototypes. Update README and active documentation links. Check destination collisions and verify hashes before/after moving. Do not rewrite historical manifests to imply they describe the new tree.

M0 acceptance requires complete requirement mapping, unchanged archived hashes, resolving active links and no active Flutter development instruction.

---

## 2. Architecture, interfaces and operating model

### Application stack

| Area | Planned implementation |
|---|---|
| App shell | Expo SDK 55, React Native, TypeScript strict mode, Expo Router |
| Puzzle rendering | React Native Skia; Gesture Handler and Reanimated for interaction |
| Gameplay rules | Framework-independent TypeScript engine |
| Native persistence | Expo SQLite plus app-private image files |
| Credentials | Platform-protected storage through Expo SecureStore |
| Images | OS photo picker, Expo Camera and bounded image processing |
| Backend | Supabase Auth, Postgres, Storage and Edge Functions |
| Purchases | RevenueCat over Apple In-App Purchase and Google Play Billing |
| Advertising | Google AdMob through React Native Google Mobile Ads |
| Crash reporting | Sentry, with sensitive-data filtering and session replay disabled |
| Optional usage analytics | Small, allowlisted event pipeline into Supabase; disabled until consent |
| Admin/support web | Separate Expo Router web application on EAS Hosting |
| Transactional email | Resend connected to Supabase custom SMTP and support delivery |
| Build/distribution | EAS Build and Submit; separate development, preview and production profiles |

Expo documents SDK 55 with React Native 0.83 and React 19.2.0; its SDK-specific pages currently recommend Skia 2.4.18 and SQLite `~55.0.20`. During the compatibility milestone, resolve compatible patches, record every exact version and commit the lockfile. Do not mix SDK 57 packages into SDK 55 or adopt beta packages by default. ([Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/), [Skia](https://docs.expo.dev/versions/v55.0.0/sdk/skia/), [SQLite](https://docs.expo.dev/versions/v55.0.0/sdk/sqlite/))

### Windows preview and native validation

**The primary daily preview runs locally on Windows; cloud simulation is optional.**

Run `npx expo start --web` and open its localhost address. Phone/tablet-sized browser layouts and Fast Refresh share the gameplay engine and Skia web/CanvasKit renderer. This is the web-compatible app, not an iOS/Android OS emulator. No EAS build is needed for local browser iteration.

EAS Build compiles native binaries and is separate from EAS Simulator. Once a native development build is installed, compatible JavaScript/UI edits load from the Windows development server without rebuilding. Native dependencies/configuration changes and standalone test/release artifacts require builds. Physical checks remain required for purchases, ads, permissions, gestures and hardware performance.

M1 must demonstrate both the local Windows browser workflow and a physical-device development-build workflow.

Use three complementary workflows:

- **Browser preview:** daily UI and gameplay review at phone/tablet dimensions, sharing the production engine and rendering approach.
- **EAS cloud simulation:** native iPhone/iPad checks when account access is available. EAS Simulator is currently early access; it must not become a dependency that blocks all development.
- **Physical development/release builds:** your iPhone 12 Pro, Samsung S26 Ultra and Galaxy Tab A9+, plus an arranged iPad and representative older hardware.

Native billing, ads and device permissions use actual development builds. Browser integrations use clearly identified development adapters, never simulated production purchases or entitlements. ([EAS Build](https://docs.expo.dev/build/introduction/), [EAS Simulator](https://expo.dev/services/simulators))

### Boundaries and source of truth

**The device owns:**

- Personal/camera images and normalized crops.
- Collections, puzzle definitions, attempts, board/tray positions and statistics.
- Guest/account-local separation and local preferences.

**Supabase owns:**

- App account identity.
- Published catalogue metadata and image delivery authorization.
- Theme unlocks, picture allowances and acquisition records.
- Processed purchase events, account-deletion state and administrator audit records.

**Stores and RevenueCat establish purchase validity.** Supabase translates verified purchase events into app benefits. Clients cannot grant balances, unlock themes or set subscription expiry.

Gameplay must never require a network request per move.

### Core data model

| Entity | Important information |
|---|---|
| Local collection item | Stable ID, owner scope, source, title, theme, image location/hash, timestamps |
| Puzzle definition | Image reference, dimensions, cut-generation version, exact edges, solution orientations, rotation and timer configuration |
| Puzzle attempt | Attempt ID, board/tray state, selected piece, rotations, moves, elapsed time, status and save version |
| Catalogue picture/theme | Stable IDs, title, theme membership, published state, versioned image assets and provenance |
| Store product | Store identifiers, entitlement/allowance mapping, configuration version |
| Purchase event/grant | Unique transaction/event identifiers, account, quantities, refund/revocation state |
| Theme unlock | Unique account/theme relationship |
| Picture acquisition | Unique account/picture relationship; permits redownload without another charge |
| Consent/settings | Versioned privacy choices, analytics preference, sound/haptic preferences |
| Support request | Request ID, contact information, message and delivery state |

Keep puzzle identity separate from attempt identity. Restart/Play Again creates a new attempt under the same Home entry; Create Puzzle creates a separate entry even with identical settings.

### Service interfaces

Use authenticated Edge Functions for privileged operations:

- Read catalogue and request authorized image delivery.
- Claim a picture, atomically spending allowances when necessary.
- Read account benefits and purchase history.
- Process authenticated RevenueCat events idempotently.
- Reconcile purchases after checkout/restore.
- Request and complete account deletion.
- Submit support requests.
- Publish/unpublish catalogue content through the administrator interface.

A picture claim against a previously unowned theme must confirm the complete spend before execution. Theme unlock and picture acquisition happen in one transaction; concurrent requests cannot overspend or double-charge.

Public free-catalogue browsing and guest support remain available without account sign-in, with validation and abuse limits.

Use Row Level Security and server-side authorization throughout. Administrator access requires MFA enforced at the backend, not merely a hidden admin route. ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security))

---

## 3. Implementation behavior

### Gameplay and presentation

Preserve the supplied visual language, navigation, artwork and approved corrections. First Home shows its headers, Add Puzzle area and empty My Puzzles section.

- Phones remain portrait; tablets support portrait and landscape.
- Fixed 3:2 crop on collection import.
- Linked grid sizes: 2×3, 4×6, 6×9, 8×12, 10×15, 12×18, 14×21 and 16×24.
- Retain presets of 54, 96, 150 and 216 pieces.
- Rotation defaults off; when enabled, quarter-turn clockwise rotation works through both the button and tapping the selected piece again.
- Support drag/drop and tap-select/tap-place.
- Pinch zoom, two-finger pan, visible zoom controls and Fit.
- Horizontally scrolling single-row tray with sufficiently large pieces.
- Subscriber layouts reclaim the banner space.

### Explicit owner-image and UI requirements

- Navigation labels: **Home / My Collection / Settings**.
- Use Expo Router native tabs on native devices. Owner update (5 October 2026) accepts OS-controlled iPad tab position/appearance in place of exact custom bottom-bar geometry. Tablet Account, Billing and Legal retain navigation; mobile Billing returns to Settings with no tab bar. Browser review uses a matching custom bottom bar.
- App collection grids: **three columns on phones, six on tablets**; detailed view is one item per row. The OS photo picker remains the approved device-photo selector.
- Highlight the actual selected image source.
- Exclude-owned ON hides acquired pictures; OFF shows them dimmed and unavailable for another acquisition.
- Remove Country/Timezone from mobile Account and remove child-profile/chat/parent-settings copy.
- Use **Times Used / Date Added / Last Used** and **Preview** consistently.
- Source Back retains the Create Puzzle draft; crop X cancels without adding an item; crop stays within image bounds and outputs 3:2.
- Remove the redundant tablet camera close action.
- Add Picture imports one picture at a time into My Collection.
- Collection-picture deletion confirms the linked-puzzle count and deletes those puzzles; Home-puzzle deletion preserves its picture.
- Allowance fractions explicitly show used out of granted.
- Hide AI-only source tiles, headers and AI/combo products in v1. Deferred AI UI removes the gear and places sparkles on AI/Combo Pack headings, not Create Puzzle.
- Earlier 15x20, Flutter, provisional orientations and strict ad-completion rules are superseded by the interview decisions.
- Deferred AI requirements retain text prompts plus five styles, once-only charging on successful delivery, no charge on failure and consumption on discard. AI is not v1 work.

Implement the approved placement rules explicitly:

- Shape-compatible wrong-home placements are allowed.
- Non-compliant placements remain selected and movable.
- Outer flat-edge and occupied-neighbor compatibility rules apply.
- Swaps validate the final board atomically.
- Completion requires every piece in its home cell and solution orientation.
- Count board-changing moves, including selected non-compliant placements; rotation and selection-only actions count zero.
- Hints correct unsolved corners first, then tray pieces, then misplaced board pieces when the tray is empty.
- Hints return obstructing occupants and incompatible neighbors to the tray.

Render using cached paths and shared image resources. Avoid regenerating every piece or updating the complete React screen on every drag frame.

### Clocks and lifecycle

Owner update (6 October 2026): Create Puzzle offers Timer / Stopwatch / None, defaulting to Timer for a fresh setup. None means timing is off, with no countdown deadline; do not treat a None attempt as a timed success. This is separate from continuing an expired countdown untimed. Preserve the selected mode when returning to an existing draft. The default change does not invent countdown durations.

Use an explicit gameplay state machine covering ready, running, paused, preview, ad interruption, connectivity pause, timeout and completion.

- Both clocks pause when the app leaves the foreground, closes or returns Home.
- Returning from background requires Resume.
- Preview resumes automatically only when play was running before Preview.
- Ads and forced connectivity pauses do not consume puzzle time.
- Paused/pre-start boards remain visible, with gameplay actions disabled.
- Countdown duration is a versioned piece-count configuration captured when an attempt starts.
- Timeout offers rewarded untimed continuation, Restart and Home.
- An untimed continuation never becomes a timed success.

Countdown values will be tuned during gameplay testing and owner-approved before beta. Changing the configuration must not alter an existing attempt’s duration.

### Persistence and image handling

- Persist each committed gameplay action transactionally.
- Save clock checkpoints periodically and on lifecycle transitions.
- Retain a last-known-good recovery snapshot.
- Validate schema versions, piece uniqueness, board/tray partition, rotations, dimensions and selection before loading.
- Preserve unsupported future saves rather than overwriting them.
- Pause and explain a save failure; do not present an unsaved move as safely stored.
- Import files through temporary staging and commit collection records only after successful processing.
- Use controlled filenames, strip unnecessary metadata and reject malformed or unsupported input.
- Bound encoded size, decoded pixels and output resolution; establish tested limits in the image milestone.
- Never evict user-owned saved puzzles automatically. Remove disposable caches first and block new imports safely when storage is insufficient.

OS-level backup behavior must be explicitly configured and tested so it does not accidentally create an undocumented sync or restore promise.

### Accounts, purchases and offline access

- Apple, Google and verified email/password sign-in.
- Password reset and authentication links open the correct app/environment.
- Use a stable Supabase account ID for RevenueCat identity.
- Account linking requires verified provider ownership; do not implement unsafe email-only account merging.
- Offer guest-data assignment on sign-in.
- Sign-out retains but hides account-local content and restores the separate guest collection.
- Account deletion removes the current account’s local content and causes other installations to remove it on reconnection.

Purchase behavior:

- Non-expiring theme unlock and shared picture allowances.
- Configurable products, with actual quantities/prices approved before paid beta.
- US$2.99 subscription base, localized store pricing shown to Australian users.
- Subscription removes ads and enables offline play; premium packs remain separate.
- Purchase history reflects verified records; provide store receipt guidance, not custom PDFs.
- Failed or pending purchases do not grant benefits.
- Duplicate callbacks do not duplicate grants.
- Refund/revocation handling uses transaction-linked records and preserves an audit trail.
- Restoring purchases cannot silently transfer another app account’s benefits.

Offline access uses the last verified paid expiry, associated with the signed-in account. An expired Supabase access token alone must not erase otherwise-valid offline access. Renewal requires reconnection; signing out removes access to that account’s offline content.

Local expiry checks cannot make a modified or clock-tampered device tamper-proof. Detect clock rollback and require verification where trustworthy expiry cannot be established.

### Ads, privacy and connectivity

- Free users receive a 60-second disconnection grace period, then play pauses with progress saved.
- Ad no-fill while online does not block ordinary play.
- Rewarded completion grants the action once.
- No available ad or technical failure grants the requested hint/untimed continuation.
- User cancellation does not grant it.
- Interstitials only at eligible Start/Restart/Play Again transitions, at most once per five minutes; skip the first-ever start and prevent adjacent rewarded/interstitial experiences.
- Personalization is optional and conditional on applicable consent, age and platform tracking permissions.
- Declining tracking must not prevent play.
- Do not initialize advertising in a way that transmits data before the required consent decisions.
- Use test ad units in development and automated tests.

The old security document’s strict completed-ad-only language is superseded by the confirmed no-fill/technical-failure policy. The implementation must distinguish failure, cancellation and completion. The selected ad library supports Expo development builds and the required formats. ([Ad integration documentation](https://docs.page/invertase/react-native-google-mobile-ads))

### Catalogue, support and administration

Prepare approximately 20 free pictures and three premium themes of 30 pictures each.

- Owner reviews artwork, titles, crops, rights/provenance and content suitability before publication.
- Screenshots are not a production image catalogue.
- Publish immutable image versions; replacing artwork must not change an existing puzzle.
- Unpublishing removes new availability without silently destroying existing acquisitions.
- Download starter content during online setup; show retry and partial-download states.
- Admin supports draft, preview, publish, unpublish, ordering and audited changes.
- Build real support, FAQ, privacy and terms pages independently of the marketing mock.
- Support submission stores a request before attempting email delivery, preventing lost messages when email fails.
- Add abuse limits, duplicate protection and a visible retry/failure path.

---

## 4. Development milestones and acceptance gates

Milestones advance on evidence, not simply elapsed time. No fixed release date is assumed.

| Milestone | Deliverables | Required exit evidence |
|---|---|---|
| **M0 — Pre-development preparation** | Consolidated specification, source authority map, screen/state inventory, architecture records, data boundaries, acceptance matrix, dependency candidates, account/secret inventory and risk register | No contradictory active requirements; every missing design/state has a specified behavior and responsible owner |
| **M1 — Native compatibility and performance proof** | Minimal Expo SDK 55 development builds with Skia, SQLite, RevenueCat, ads and crash reporting; 384-piece rendering/gesture benchmark; Windows preview workflow | iOS/Android builds succeed; selected libraries support intended OS floors; physical performance evidence; exact dependency lockfile |
| **M2 — Design system and complete UI specification** | Reusable components, typography/colors/spacing, navigation, tablet portrait adaptations, empty/error/loading states, accessibility semantics | Owner review of representative phone/tablet screens and missing states before broad UI implementation |
| **M3 — Gameplay engine and local playable slice** | Deterministic cut generation, all placement rules, rotation, swaps, tray, zoom, hints, shuffle, start/pause, clocks and completion | Automated engine/invariant tests plus a playable puzzle on browser and native devices |
| **M4 — Durable collections and image sources** | Photo picker, camera, crop, titles/themes, Home/Collection metadata, deletion, restart/replay, SQLite saves and recovery | Interruption, low-storage, malformed-image and migration tests; no lost or duplicated pieces |
| **M5 — Backend, catalogue and owner administration** | Supabase environments, schema/RLS, image delivery, publishing workflow and initial catalogue pipeline | Cross-account access denied; draft content inaccessible; published content downloadable; admin MFA enforced |
| **M6 — Identity and account lifecycle** | Apple/Google/email flows, linking, verification/reset, guest migration, sign-out isolation and deletion | Physical-device authentication and deep-link tests; account isolation and reconnect deletion tests |
| **M7 — RevenueCat commerce and offline access** | Store test products, subscription, pack ledger, claims, restore, history, refunds and offline entitlement handling | Sandbox purchase matrix passes; no double grants/overspend; cross-platform benefits work; expiry/reconnection behavior verified |
| **M8 — Advertising, consent and production services** | Banner/interstitial/rewarded integration, privacy controls, sound/haptics, support/email, telemetry and policy destinations | Completion/no-fill/failure/cancellation tests; ad timing correct; consent choices honored; support delivery and alerts demonstrated |
| **M9 — Feature-complete beta** | Final catalogue, approved product configuration, tuned countdown values, branding, store metadata and full device test coverage | TestFlight/Play testing evidence; physical iPad validation; accessibility and 384-piece performance pass |
| **M10 — Production hardening and release candidate** | Security review, production permissions/configuration, restore drill, signed release artifacts, operational runbooks and submission package | No release-blocking defects; no exploitable critical/high security findings; production purchase/support/monitoring paths validated |
| **M11 — Australian release and stabilization** | Controlled store launch, operational monitoring, support triage and verified update/rollback procedure | Stable launch monitoring, reconciled purchases and no unresolved data-loss or account-isolation incidents |

**Dependencies:** M1 must pass before committing to the complete renderer/UI implementation. M3–M4 establish the local product; M5–M7 establish account and commerce authority. M8 cannot be accepted against mocks alone. M9 requires all included features.

### M0 preparation checklist

Before app development starts:

- Produce the current specification and reconcile superseded Flutter, timer, hint and grid rules.
- Account for every supplied current screen and approved owner annotation.
- Map owner-image and security decisions; save this plan and archive superseded documents with hash verification.
- Specify missing authentication, completion, timeout, offline, consent, purchase and failure states.
- Define the benchmark procedure, test devices and older-OS validation route.
- Establish owner-controlled repository/service accounts, MFA and secret handling.
- Record the intended app identifiers and environment separation.
- Document budget quotas and cost-review triggers.
- Establish catalogue production/review responsibilities.
- Track branding, policies, support domain and real store products as dated milestone deliverables.

Business accounts or credentials not yet supplied must remain explicit dependencies. Do not claim they exist or are configured.

### Milestone reporting

Each milestone ends with:

- A runnable build or reviewable artifact.
- Requirements implemented and deliberately deferred.
- Actual checks performed and results.
- Screenshots/recordings for relevant layouts.
- Security and failure-path evidence.
- Remaining blockers and the next milestone’s prerequisites.

---

## 5. Quality, costs and release safeguards

### Test strategy

| Layer | Required coverage |
|---|---|
| Engine | Every grid, rotations, wrong-but-compatible placement, selected non-compliant pieces, atomic swaps, hints and completion |
| Property/invariant tests | Random action sequences preserve piece uniqueness, board/tray partition and valid state |
| Persistence | Kill/interruption around saves, failed writes, migrations, damaged saves, low storage and image-file reconciliation |
| UI | Phone portrait, both tablet orientations, text scaling, touch targets, reduced motion and empty/error states |
| Accounts/backend | RLS, cross-account denial, provider linking, stale sessions, guest migration and account deletion |
| Commerce | Pending/cancelled/failed purchase, restore, renewals, expiry, refunds, duplicate/out-of-order callbacks and concurrent claims |
| Ads | No-fill, load/show failure, cancellation, completion, duplicate callbacks, lifecycle interruptions and frequency limits |
| Device journeys | Import/create/play/pause/reopen/complete/replay; permissions; camera; real store sandboxes |
| Operations | Email failure, unavailable backend, invalid configuration, quota exhaustion, monitoring and rollback |

Use Jest with property-based tests for the engine, React Native Testing Library for component behavior, backend SQL/RLS tests, browser automation for web surfaces and native journey automation where supported. Manual physical-device checks remain required for gestures, camera, purchases and perceived responsiveness.

**Proposed measurable performance gates:**

- Target 60 Hz drag/pan responsiveness on the agreed baseline hardware.
- Measure frame pacing in release builds, not development mode.
- No recurring visible stalls during a representative 384-piece session.
- No growing memory usage across repeated create/play/delete cycles.
- No acknowledged saved move lost on restart.
- Gameplay remains responsive while saves and catalogue downloads run.

M1 establishes reproducible measurements and memory budgets. If older hardware fails, optimize first; reducing supported devices or changing product limits requires an explicit decision.

### Security and privacy

Carry forward every applicable protection from the original security requirements, not only this summary. The full reconciled security requirements below are mandatory.

# Active v1 security requirements — 5 October 2026

These requirements are mandatory across the approved v1 milestones. The current plan and latest owner decisions supersede historical technology and product rules. Prototype code establishes intended behaviour, not a trusted production implementation. This addendum is a requirements update, not a completed security audit or certification.

## Security mindset when porting prototype logic

- Treat JSX, HTML, website mockups and their dependencies as unreviewed reference material. Do not copy implementation details merely because they work in the prototype. Reimplement approved behaviour in maintainable React Native/TypeScript code with explicit validation and tests.
- For each feature, identify inputs, sensitive data, trust boundaries, failure paths and possible abuse before implementation. Review the relevant prototype logic for unsafe assumptions, resource exhaustion, state corruption and unintended access. Record findings and their disposition in the development decision/security log.
- Preserve legitimate wrong-but-shape-compatible placements and selected non-compliant pieces as specified in the current plan. These are intentional gameplay, not vulnerabilities. Validate settled versus actively selected state without silently changing the rules.
- Keep original imported references byte-for-byte unchanged. Put production fixes in application code. Add regression tests for demonstrated bugs; distinguish confirmed vulnerabilities, suspected risks and ordinary correctness defects.

## Local implementation: local engine, images and persistence

- Validate inputs in the engine and persistence boundaries, not only UI controls. Enforce integer dimensions within the approved maximum of 16 rows by 24 columns, at most 384 pieces, supported orientations, valid IDs and bounded allocations. Allowed grids are 2x3, 4x6, 6x9, 8x12, 10x15, 12x18, 14x21 and 16x24 only.
- Validate saved state before applying it: supported schema, board/tray partition, unique pieces, valid indices, orientations, selection, edges and consistent dimensions. Reject or safely recover corrupt, oversized or unsupported saves without losing the last valid save. Never execute imported content or deserialize arbitrary objects.
- Make swaps, hints, moves and save updates atomic. Preserve no-lost/no-duplicate-piece invariants, keep preview separate from persisted gameplay, and test interrupted writes and migrations. Keep image deletion scoped to the intended collection item and its confirmed dependent puzzles.
- Treat picked, downloaded and generated images as untrusted. Define and enforce encoded byte, decoded pixel, dimension and processing limits; validate actual decode/format rather than trusting extensions or MIME labels. Handle malformed images, cancellation and memory pressure. Use maintained decoding components and bounded output sizes.
- Use application-controlled file names and storage locations. Never let image names, save contents or remote metadata select arbitrary filesystem paths. Bound temporary storage and clean up canceled/failed operations. Do not enable user-supplied SVG or other active formats without a separately reviewed need and restricted handling.
- Request only necessary platform permissions when needed. Keep guest photos and saves local by default; any upload must be explicit in the feature flow. Strip unnecessary sensitive image metadata from derived/shared/uploaded images. Exclude photos, prompts, tokens and personal information from routine logs.
- Test malicious or malformed inputs, excessive dimensions, truncated saves, duplicate IDs, invalid orientations, rapid repeated actions, cancellation and recovery. Record actual tests and remaining device/decoder limitations.

## Service implementation: accounts, services, generation and commerce

- No provider secrets, signing credentials or privileged API keys in app bundles, website scripts, source control or logs. Store session credentials using platform-appropriate protected storage. Keep service credentials on the backend and support rotation.
- Enforce authentication and per-object authorization on the server for every protected account, image, job, purchase and entitlement operation. Client flags, hidden buttons and local balances are not authority. Test cross-account access, expired sessions, logout and guest-data migration.
- Use HTTPS with normal certificate verification. Do not introduce production certificate-validation bypasses. Validate external navigation destinations and schemes. For any server-side URL retrieval, restrict destinations and redirects to prevent access to internal services.
- DEFERRED AI (not v1 implementation): Make AI generation and allowance deductions idempotent and transactional. Bound requests, uploads, job concurrency and cost; enforce server-side quotas and rate limits. Failed generation must not deduct, and retries must not double-charge. Treat generated content as untrusted data.
- Verify purchases and subscription state through the chosen store's supported server verification mechanisms. Authenticate service callbacks, prevent replay/double grants, and handle expiry, refunds and revocation. Preserve the approved distinction between pack ownership and ad-free subscriptions.
- Grant rewarded hints/untimed continuation once on supported completion, or on the owner-approved no-fill/technical-failure fallback. User cancellation grants nothing. Distinguish these outcomes and prevent duplicate grants. Do not claim a local callback makes a modified client tamper-proof.
- Before enabling account deletion, verify authorization and require appropriate reauthentication; implement the documented deletion scope. Define retention, backups and consent/data handling for third-party services before integrating them.
- Review website forms and endpoints for input validation, output encoding, authorization, abuse limits and applicable CSRF protection. Use safe DOM APIs; do not insert untrusted HTML or ship development secrets/debug endpoints.

## Acceptance evidence and release gate

- Every milestone report must include security-relevant changes, tested failure/abuse cases, dependency findings and unresolved risks. Passing formatting, analysis and ordinary feature tests alone is not security sign-off.
- Review direct and transitive dependencies for known vulnerabilities and maintenance status when adopted and before release. Retain lockfiles, remove unnecessary packages, and keep production configuration separate from development fixtures.
- Maintain a short threat model covering local data, image input, account boundaries, generation costs, purchase/reward integrity and website exposure as those features become real. Add security checks to CI where they provide useful coverage, including secret detection and relevant dependency checks.
- Before release, verify production permissions, logging, backend access rules and signing/secret handling on actual build artifacts. Arrange independent security review for authentication, payments and public services. Fix exploitable critical/high findings before release; record other residual risks and decisions explicitly.
- Never report a command as passed if it did not start. An environment startup failure means the check is unverified; retry in a functioning environment and record the actual result. No claim of vulnerability-free software is permitted.

## Adoption and explicit supersessions

The original is preserved in superseded/security-requirements.md. This active document is linked from README, DEVELOPMENT.md and AGENTS.md. Security intent is retained; obsolete milestone labels are replaced with subsystem scope.

Supersessions: Flutter/Dart -> React Native/TypeScript; 15x20/300 -> approved grids up to 16x24/384; ad-completion-only -> completion or no-fill/technical failure, never user cancellation. AI protections remain deferred. All other protections remain required. No certification or completed native validation is claimed.

- Threat model accounts, local data, image decoding, purchases, allowances, ads and public endpoints.
- Server-only privileged credentials; no secrets in app bundles.
- Protected token storage, validated navigation links and normal TLS verification.
- Input/resource limits and transactional mutations.
- Dependency and secret scanning in CI.
- No photos, passwords, tokens or personal prompts in routine telemetry.
- Separate administrator privileges from normal accounts.
- Document retention, deletion and backup behavior before production data collection.
- Independently review authentication, purchases and exposed services before release.
- Review age handling and optional personalized advertising before integrating production consent flows.

Sentry is supported in Expo, including release/source-map integration. Supabase production email uses a configured SMTP provider rather than assuming its default mail service is sufficient. ([Expo/Sentry](https://docs.expo.dev/guides/using-sentry/), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp))

### Environments, delivery and recovery

- Separate staging and production databases, credentials, store products and ad units.
- Development fixtures and bypass adapters must be excluded from production builds.
- Store migrations in version control; test them against staging before production.
- Use GitHub Actions for static checks and automated tests; EAS builds at milestone/release boundaries to limit costs.
- Require manual production deployment/release approval.
- Use runtime-versioned updates; native dependency changes require a new binary.
- Database changes must remain compatible with installed app versions.
- Maintain runbooks for purchase reconciliation, content withdrawal, support outages and emergency release rollback.
- Back up database records and catalogue objects separately; demonstrate restoration before release.

### Cost approach

Follow the confirmed preference to **minimize fixed costs**:

- Start with EAS Free while build quotas are sufficient.
- Use free development/staging resources where they meet testing needs.
- Budget Supabase Pro for production reliability and backups rather than assuming a free development tier is production-equivalent.
- Use free monitoring/email/hosting allowances initially, with explicit quota monitoring.
- Do not introduce paid AI infrastructure in v1.
- Avoid automatic plan upgrades.
- Alert before quota exhaustion; reduce optional analytics and nonessential background work before affecting core access.
- Never delete user data or invalidate legitimate purchases to control cost.

Current reference prices are Supabase Pro from US$25/month and EAS Starter US$19/month if needed. Additional usage, email, domains and other services are separate. RevenueCat’s agreed usage-based fee is additional to store commissions. These are planning references, not authorized purchases. ([Supabase pricing](https://supabase.com/pricing), [Expo pricing](https://expo.dev/pricing), [RevenueCat pricing](https://www.revenuecat.com/pricing/))

### Remaining scheduled decisions and risks

These are explicit gates, not choices left for an implementer to invent:

- **Compatibility:** prove SDK 55 plus the complete native dependency set supports the requested old OS versions.
- **SDK maintenance:** review support and store build requirements at each major milestone; do not silently raise minimum OS versions.
- **Commercial configuration:** owner approves pack quantities and actual store prices before paid beta.
- **Countdown tuning:** owner approves the piece-count duration table before beta.
- **Branding and publishing identity:** finalize before production identifiers, artwork and store submissions are locked.
- **Legal/privacy:** finalize policies, retention and age/advertising behavior before collecting production data.
- **Hardware:** obtain physical iPad and older-device evidence before declaring support.
- **EAS Simulator:** access and cost remain unverified; development has browser and physical-device alternatives.
- **Content:** initial artwork must be produced and reviewed; mockup thumbnails are insufficient.
- **Budget:** no fixed monthly ceiling was approved; exceeding free allowances or adding recurring services requires an explicit cost decision.

**Release v1 is complete only when the approved scope works in signed production builds on the supported device matrix, saves and purchases survive failure scenarios, support and monitoring operate, and every release gate has recorded evidence.**

### Documentation and local-preview verification

Verify archive hashes, requirement coverage and active links. Test the three-/six-column grids, source highlighting, exclude-owned state and deletion scope. Demonstrate local browser Fast Refresh without EAS simulation. A check that cannot start is unverified, never passed.
