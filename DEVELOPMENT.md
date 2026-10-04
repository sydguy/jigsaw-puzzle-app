# Development entry point

Read [plan](docs/production-v1-plan.md), [requirements](docs/requirements-register.md), [security](docs/security-requirements.md), and [readiness](docs/readiness.md).

Local Windows Expo web is the primary preview. Native purchases/ads/permissions require a development build and physical verification. Cloud simulation is optional. Do not implement from archived Flutter instructions or website marketing copy.

No user secrets in source or chat. No live charges, deployment or release implied by local tests. Milestone gates and missing owner accounts must be reported honestly.

## Root starter

Node >=20.19.4 is required. Run `npm ci`, then `npx expo start` (press w), or `npx expo start --web`. Run `npm run typecheck` and `npm run export:web` before committing application changes. This workstation can use `./tools/with-node.ps1 npx.cmd expo start --web` to select the existing bundled Node24 runtime without a global upgrade.

The app imports design/system/tokens.ts through src/theme.ts. Read [design specification](design/system/DESIGN-SYSTEM.md) and [architecture](docs/v1-architecture.md) before extending it. The starter is intentionally a single route, not a premature implementation of M2/M3 screens or services.

app.json uses a development-only scheme; final bundle/package identifiers and phone/tablet orientation configuration are native provisioning gates. Do not invent store identifiers. No backend keys, sample balances, purchase stubs or AI features are in the starter.
