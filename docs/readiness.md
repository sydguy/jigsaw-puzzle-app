# Readiness and milestone evidence

## Status

M0 local documentation adoption and clean Expo foundation prepared; full readiness remains conditional on the setup and review gates below. See [M0 evidence](m0-report.md). M1 native compatibility and all later milestones NOT ACCEPTED. No production app, signing, clouddeployment or physical testing is claimed.

## External/setup blockers confirmed by owner

| Dependency | Status | Gate |
|---|---|---|
| Owner Expo/EAS account/organization | Not ready | Account-linked EAS builds |
| Apple Developer membership/signing | Not ready | Installable iOS build and Store/TestFlight |
| Google Play Console account | Not ready | Store billing/Play testing and submission |
| Final app identifier/publishing identity | Not chosen | Native provisioning |
| Supabase/RevenueCat/AdMob/Resend/Sentry resources | Not provisioned/verified | Service integration acceptance |
| Physical iPad and older supported hardware | Not available/verified | Native release acceptance |
| Catalogue originals and rights approvals | Not supplied | Contentbeta |
| Product prices/quantities, countdown table, policies/retention | Scheduled owner decisions | Paidbeta/release |

Never ask for secrets in chat. Owner-controlled provider dashboards, scoped local environment variables and managed secret stores are the setup route.

## Development sequence

Local documentation checks, TypeScript, Expo package compatibility, web export and HTTP startup checks pass. Visual/native verification remains outstanding. A local-only M1 feasibility harness may prove dependency resolution, rendering and Windows preview without live services. It must be labelled as a compatibility harness, exclude fabricated entitlements and not be reported as production UI. Broad feature development remains gated on native compatibility/performance evidence.

## Risks

- Dependency audit has 30 unresolved findings, including 21 high; security triage is required before production acceptance. See dependency-audit.json.
- System Node 20.18.3 is below the project minimum; use the documented bundled-runtime helper or install a supported Node version.
- The design system and entity architecture still describe themselves as proposals; owner visual acceptance remains an M2 gate.

- SDK55 native plugin/OS compatibility remains unproven; release requirements may change before launch.
- Git main and the requested GitHub origin are configured; initial publication is part of this foundation task.
- Cloud simulator is optional and cannot replace hardware performance evidence.
- Free service quotas may be unsuitable for production; review before any paid plan commitment.
- Refund/revocation handling for already-spent allowances needs an explicit reviewed policy before commerce acceptance.
- Optional personalized ads require reviewed age/consent behavior before production integration.
