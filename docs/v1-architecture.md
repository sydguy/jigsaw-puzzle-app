# V1 visual and entity architecture

Date: 5 October 2026. Status: proposed logical architecture, saved from the architecture review in chat. This document does not claim implemented integrations, deployed schemas or completed native tests.

Authority: latest explicit owner decisions, then the [production plan](production-v1-plan.md), [requirements register](requirements-register.md) and [security requirements](security-requirements.md). See [readiness](readiness.md) for unresolved setup and acceptance gates. This document explains those requirements; it does not supersede them.

Gameplay and personal images live on the device. Accounts, catalogue access and verified purchase benefits live in Supabase. Mermaid code blocks below remain editable and render in Mermaid-compatible Markdown viewers, including GitHub.

## 1. Visual architecture: development and testing

```mermaid
flowchart TD
    Owner["Owner requirements and approved designs"]
    Stitch["Google Stitch<br/>Screen designs and visual handoff"]
    Codex["Codex workflow<br/>Implement • review • test • record evidence"]
    Repo["Version-controlled project<br/>Expo SDK 55 • React Native • TypeScript<br/>App, backend migrations and tests"]
    Owner --> Stitch
    Owner --> Codex
    Stitch -->|Approved screens, assets and interaction notes| Codex
    Codex <--> Repo
    Repo --> Metro["Local Expo development server<br/>Windows • Fast Refresh"]
    Metro --> Web["Local browser preview<br/>Phone and tablet layouts"]
    Metro -->|JavaScript updates after installation| Native["Installed native development app"]
    Repo --> CI["Automated checks<br/>Engine • persistence • UI • backend"]
    Repo --> EAS["EAS Build<br/>Development • preview • production"]
    EAS -->|Android build| Android["Local Android emulator<br/>Windows / Android Studio"]
    EAS -->|iOS simulator build| Mac["Local iOS simulator<br/>Requires a Mac"]
    EAS -.-> Cloud["Optional EAS cloud simulator<br/>Access and platform availability to verify"]
    EAS -->|Device build| Devices["Physical iPhone / iPad<br/>Android phone / tablet"]
    Android --> Native
    Mac --> Native
    Devices --> Native
    Web --> Evidence["Review and test evidence"]
    CI --> Evidence
    Native --> Evidence
    Cloud -.-> Evidence
    Evidence --> Codex
    Evidence --> Gate["Owner release approval<br/>Required gates passed"]
    Gate --> Submit["EAS Submit<br/>App Store Connect / Google Play"]
```

Google Stitch supplies the design handoff. Codex translates approved designs into maintainable React Native components. Exported frontend code is reference material requiring review. Preserve imported asset bytes; create production derivatives separately. See [Google Stitch overview](https://developers.googleblog.com/en/stitch-a-new-way-to-design-uis/).

| Route | Purpose |
|---|---|
| Windows browser preview | Daily layout and gameplay iteration using `npx expo start --web`; no EAS build required. This is not an OS emulator. |
| Local Android emulator | Android native development and integration checks. |
| Local iOS simulator | iOS native checks on macOS; it cannot run locally on Windows. |
| EAS cloud simulator | Optional remote testing. Early access at review time; project access and Android availability remain unverified. |
| Physical devices | Required evidence for performance, camera, permissions, purchases, ads and lifecycle interruptions. |

EAS Build creates binaries; a simulator or device runs them. Compatible JavaScript changes can use the development server; native dependency/configuration changes require rebuilding. Development adapters must be clearly labelled and excluded from production. No fabricated purchases or entitlements.

References checked during the architecture review: [EAS builds](https://docs.expo.dev/build/setup/), [iOS simulator requirements](https://docs.expo.dev/workflow/ios-simulator/), [EAS Simulator](https://expo.dev/services/simulators). Provider availability can change and must be verified at setup.

## 2. Visual architecture: the running product

```mermaid
flowchart TD
    subgraph Device["Customer device"]
        UI["Expo / React Native UI<br/>Home • Collection • Settings"]
        Engine["TypeScript puzzle engine<br/>Rules • clocks • moves • completion"]
        Render["Skia renderer<br/>Gestures and animation"]
        Local["SQLite + private image files<br/>Collection • puzzles • attempts • settings"]
        Secure["SecureStore<br/>Session credentials"]
        UI <--> Engine
        Engine --> Render
        Engine <--> Local
        UI <--> Secure
    end
    subgraph Backend["Supabase — separate staging and production"]
        Auth["Auth<br/>Apple • Google • verified email"]
        API["Edge Functions<br/>Authorization • claims • purchase reconciliation"]
        DB["Postgres + RLS<br/>Catalogue • benefits • purchase ledger"]
        Storage["Storage<br/>Versioned catalogue artwork"]
        Auth --> API
        API <--> DB
        API -->|Authorize image delivery| Storage
    end
    UI <--> Auth
    UI <-->|Catalogue, benefits, claims and support| API
    Storage -->|Authorized downloads| Local
    UI -->|Checkout / restore| RC["RevenueCat"]
    RC <--> Stores["Apple / Google billing"]
    RC -->|Authenticated purchase events| API
    UI <--> Ads["AdMob<br/>Consent-controlled advertising"]
    UI --> Monitoring["Sentry<br/>Filtered crash reports"]
    Admin["Owner admin web app<br/>EAS Hosting • MFA"] --> API
    Support["Support / policy web pages<br/>EAS Hosting"] --> API
    API --> Email["Resend<br/>Support delivery"]
    Auth -->|Authentication email| Email
```

Every puzzle move runs locally. Supabase authorizes shared account benefits; store verification through RevenueCat establishes purchase validity. Personal photos and exact puzzle progress have no cloud upload or sync path in v1. Optional analytics uses a small allowlisted Supabase pipeline only after consent. Guest free-catalogue browsing and support remain available without sign-in, with validation and abuse limits.

## 3. Entity architecture: local gameplay data

This is a minimum logical model, not a finalized SQL migration. PK means primary key; FK means a relationship within the same database. Remote identity and catalogue references in local storage are not cross-database foreign keys.

```mermaid
erDiagram
    LOCAL_OWNER ||--o{ COLLECTION_ITEM : owns
    LOCAL_OWNER ||--|| LOCAL_SETTINGS : has
    COLLECTION_ITEM ||--o{ PUZZLE : supplies_image
    PUZZLE ||--o{ ATTEMPT : has
    ATTEMPT ||--o{ SAVE_SNAPSHOT : checkpoints
    ATTEMPT ||--o{ REWARD_ACTION : records
    LOCAL_OWNER {
        uuid id PK
        string kind "guest or account"
        uuid account_id "nullable Supabase identity reference"
    }
    COLLECTION_ITEM {
        uuid id PK
        uuid owner_id FK
        string source "catalogue, photo or camera"
        string title
        string theme_label
        string image_path
        string image_hash
        uuid catalogue_asset_id "optional remote reference"
        datetime added_at
    }
    PUZZLE {
        uuid id PK
        uuid collection_item_id FK
        int rows
        int columns
        string cut_version
        json exact_edges
        json solution_orientations
        boolean rotation_enabled
        string timer_mode
    }
    ATTEMPT {
        uuid id PK
        uuid puzzle_id FK
        string status
        int moves
        int elapsed_ms
        string countdown_version
        int countdown_limit_ms
        boolean continued_untimed
        datetime started_at
        datetime completed_at
    }
    SAVE_SNAPSHOT {
        uuid id PK
        uuid attempt_id FK
        int revision
        int schema_version
        json board_tray_rotations_selection
        json clock_checkpoint
        string checksum
    }
    REWARD_ACTION {
        uuid id PK
        uuid attempt_id FK
        string action_type
        string outcome
        datetime applied_at
    }
    LOCAL_SETTINGS {
        uuid owner_id PK,FK
        boolean sound_enabled
        boolean haptics_enabled
        boolean analytics_opt_in
        json versioned_privacy_choices
    }
```

- Collection item means one reusable picture; puzzle means one Home entry; attempt means one playthrough.
- Create Puzzle creates a new puzzle. Restart/Play Again creates a new attempt under the existing puzzle, preserving its cut and settings.
- Exact piece shapes belong to the puzzle; positions and rotations belong to saved attempt state. Separate database rows for every piece are unnecessary.
- Keep current and last-known-good snapshots with atomic saves and bounded schema validation. Attempt statistics and snapshots must remain transactionally consistent.
- Derive Times Used from started attempts and Last Used from attempt activity; resuming does not increment Times Used.
- Collection deletion removes dependent puzzles after count-confirmation. Home deletion preserves the collection picture.
- Guest content moves into an account scope only after explicit consent. Sign-out hides retained account content and restores the separate guest scope.
- Reward actions need unique operation IDs and once-only application with the gameplay mutation. Completion or approved no-fill/technical failure grants the action; cancellation grants nothing.
- Countdown duration and table version are captured per attempt. Both clocks pause during background, Home, ads and forced connectivity pauses. Untimed continuation cannot become timed success.

## 4. Entity architecture: Supabase data

```mermaid
erDiagram
    ACCOUNT ||--o{ PURCHASE_EVENT : receives
    PRODUCT_VERSION ||--o{ PURCHASE_EVENT : identifies
    PURCHASE_EVENT ||--o{ BENEFIT_ENTRY : produces
    ACCOUNT ||--o{ BENEFIT_ENTRY : owns
    ACCOUNT ||--o{ THEME_UNLOCK : holds
    THEME ||--o{ THEME_UNLOCK : unlocks
    THEME ||--o{ CATALOGUE_PICTURE : contains
    CATALOGUE_PICTURE ||--|{ CATALOGUE_ASSET : versions
    ACCOUNT ||--o{ PICTURE_ACQUISITION : holds
    CATALOGUE_PICTURE ||--o{ PICTURE_ACQUISITION : acquired
    ACCOUNT ||--o| SUBSCRIPTION_STATE : has
    ACCOUNT |o--o{ SUPPORT_REQUEST : submits
    ACCOUNT ||--o| ACCOUNT_DELETION : requests
    ACCOUNT {
        uuid id PK "Supabase Auth user ID"
        string lifecycle_status
    }
    THEME {
        uuid id PK
        string title
        string access_tier
        string publication_status
    }
    CATALOGUE_PICTURE {
        uuid id PK
        uuid theme_id FK
        string title
        string publication_status
    }
    CATALOGUE_ASSET {
        uuid id PK
        uuid picture_id FK
        int version
        string storage_key
        string content_hash
        json rights_provenance
    }
    PRODUCT_VERSION {
        uuid id PK
        string platform
        string store_product_id
        int config_version
        json benefit_mapping
    }
    PURCHASE_EVENT {
        uuid id PK
        uuid account_id FK
        uuid product_version_id FK
        string provider_event_id UK
        string store_transaction_id
        string event_type
        string processing_status
    }
    BENEFIT_ENTRY {
        uuid id PK
        uuid account_id FK
        uuid purchase_event_id FK "nullable for spending"
        string benefit_type
        int quantity_delta
        uuid claim_id "optional"
        string idempotency_key UK
    }
    THEME_UNLOCK {
        uuid account_id PK,FK
        uuid theme_id PK,FK
        uuid claim_id
        datetime unlocked_at
    }
    PICTURE_ACQUISITION {
        uuid account_id PK,FK
        uuid picture_id PK,FK
        uuid claim_id
        datetime acquired_at
    }
    SUBSCRIPTION_STATE {
        uuid account_id PK,FK
        string status
        datetime verified_paid_expiry
        datetime verified_at
        string originating_store
    }
    SUPPORT_REQUEST {
        uuid id PK
        uuid account_id FK "nullable for guests"
        string contact_email
        string message
        string delivery_status
    }
    ACCOUNT_DELETION {
        uuid account_id PK,FK
        string status
        datetime requested_at
    }
```

The purchase-event relationship shows purchase-backed benefit entries; spending entries may have no purchase-event reference. Claim IDs correlate allowance spending, theme unlocks and picture acquisitions within one transaction. Published pictures require a valid immutable asset version; draft creation can be staged before publication.

| Rule | Implementation boundary |
|---|---|
| Acquire each picture once per account | Unique `(account_id, picture_id)`; redownload does not spend again. |
| Unlock each theme once | Unique `(account_id, theme_id)`. |
| First picture from a locked premium theme | Confirm and atomically debit theme/picture allowances, unlock the theme and acquire the picture. |
| Prevent duplicate purchase grants | Deduplicate provider events and transaction-level benefit grants. |
| Show allowance used/granted | Derive from the server ledger; clients cannot edit balances. |
| Separate subscription from packs | Subscription provides ad removal and offline access; it grants no premium picture allowance. |
| Preserve existing puzzles | Pin downloaded image versions; replacement artwork does not alter existing puzzles. |
| Preserve privacy | Account-scoped RLS, backend authorization, privileged writes through functions and no provider secrets in the app. |

Owner administration also needs an audit log with actor, action, target and timestamp. Support requests are stored before email delivery, with duplicate protection and retry/failure handling.

The device needs an account-bound cache of verified subscription expiry for offline access; it is not purchase authority. Product prices and quantities require owner approval. Refund/revocation handling for spent allowances, deletion retention and reconnect cleanup require reviewed policies before implementation. The account-deletion entity is a lifecycle concept, not a decision to retain personal identity indefinitely; final schema and cleanup must support deletion without orphaned records.

## Scope and evidence

AI generation, multiplayer, leaderboards, cloud image/progress sync and manual backup are outside v1. SDK 55 and the requested iOS 15.1+/Android 7+ targets remain subject to native compatibility evidence; no silent OS-floor increase is authorized.

These diagrams have been checked against the active project requirements. They are documentation, not native performance, integration, security or release acceptance evidence. No deployment or service provisioning is performed by saving this document.
