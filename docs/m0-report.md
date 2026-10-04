# M0 preparation and Expo foundation — 5 October 2026

## Scope

Owner authorized a clean root Expo + React Native + TypeScript + Expo Router starting point, GitHub connection and all available M0 preparation. This is not broad game/service implementation or M1/M2 acceptance.

## Completed local preparation

- Production plan saved locally; requirements register maps owner-image rules and interview changes.
- Seven historical files archived with SHA-256 verification. Original security bullets are individually mapped into current guidance.
- Missing-state inventory supplies behavior for authentication, completion, timeout, offline, consent, purchase, storage and support states.
- Reviewed design/system/DESIGN-SYSTEM.md, token exports and verification notes alongside v1-architecture.md. Both retain their explicit proposal/review limitations.
- Root Expo Router starter consumes supplied tokens without editing imported designs. The old spike is separate and unfinished.
- Current source index includes phone, tablet landscape and tablet portrait references. Main production artwork remains in root graphics; design/graphics contains the original hint bulb.
- Git origin is https://github.com/sydguy/jigsaw-puzzle-app.git; branch main. Commit author uses supplied email and GitHub handle sydguy.

## Environment and secret inventory

| Item | Local policy / outstanding gate |
|---|---|
| Node | System20.18.3 is below minimum20.19.4. Existing bundled24.19.0 available through tools/with-node.ps1; no system runtime replacement performed. |
| Expo | SDK55/RN0.83 target retained; no silent OS-floor change. Exact dependency lockfile committed. |
| Environments | Development local only. Staging/production resources must be separate when provisioned. |
| Credentials | No provider credentials supplied or stored. Future secrets use owner dashboards and scoped environment/secret stores, never chat/source. |
| App identity | Working name and development scheme only. Final app identifiers, icon and publishing identity remain open. |
| Test devices | Owner iPhone12Pro/S26Ultra/TabA9+ recorded; iPad and older-device evidence remain required. |

## Ownership and gates

Owner supplies accounts/identifiers, branding, catalogue approvals, product quantities/prices, countdown approval and policy review. Engineering supplies implementation, validation, security evidence, environment separation and operational runbooks. No fixed calendar deadline is assumed; each deliverable is due before its plan milestone acceptance.

Benchmark protocol: release builds, representative384-piece session, frame-time/memory sampling, repeated create/play/delete cycles and interruption recovery. Agree actual older hardware before native performance acceptance. Browser timing is not native evidence.

## Threat boundaries

Untrusted image input -> bounded decoding/local files; client commands -> validated local engine/atomic saves; app identity -> Supabase authorization/RLS; store events -> authenticated/idempotent ledger; admin -> MFA and backend authorization; support -> input/abuse checks and durable delivery. No cloud personal-photo/progress sync in v1.

## Remaining gates

M0's local documents and scaffold can be completed without service accounts. Full M0 readiness remains conditional on owner-controlled accounts/identifiers and owner review of unresolved design choices. Native compatibility/performance, M2 visual acceptance, services and release are unverified. See readiness.md for the external blockers. Refunds of spent allowances and final privacy/retention/age rules must be reviewed before their implementations.

## Verification

- PASS: TypeScript strict check (`npm run typecheck`).
- PASS: Expo dependency compatibility (`expo install --check`).
- PASS: production web export; index, sitemap and not-found routes generated.
- PASS: local Expo web server on localhost:8081; HTTP 200 and expected starter content verified.
- PASS: seven archive hashes, 24 original security mappings and active documentation links (rerun after document changes).
- UNVERIFIED: browser visual inspection; browser automation failed to initialize with a Windows sandbox error. HTTP/export success is not a visual acceptance test.
- UNVERIFIED: native builds, physical device behavior, Fast Refresh editing and performance; no service accounts configured.
- OPEN SECURITY GATE: npm audit reports 30 findings (21 high, 9 moderate). A non-breaking npm audit fix did not clear them. Remaining proposed fixes change agreed framework versions and were not applied. See dependency-audit.json. Triage includes braces, node-forge, decode-uri-component and uuid; do not assume all affected paths are development-only.

The clean scaffold is usable for local review. Full M0 readiness and production security acceptance are not claimed.
