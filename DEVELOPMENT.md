# Development entry point

Read [plan](docs/production-v1-plan.md), [requirements](docs/requirements-register.md), [security](docs/security-requirements.md), and [readiness](docs/readiness.md).

Local Windows Expo web is the primary preview. Native purchases/ads/permissions require a development build and physical verification. Cloud simulation is optional. Do not implement from archived Flutter instructions or website marketing copy.

Current owner direction: browser development and review first; defer all EAS builds and native setup until the owner revisits them. Review phone portrait and both tablet orientations locally. Native M1 proof does not block browser implementation under this updated sequence; all native acceptance and release checks remain required later.

No user secrets in source or chat. No live charges, deployment or release implied by local tests. Milestone gates and missing owner accounts must be reported honestly.

## Root starter

Node >=20.19.4 is required. Run `npm ci`, then `npx expo start` (press w), or `npx expo start --web`. Run `npm run typecheck` and `npm run export:web` before committing application changes. This workstation can use `./tools/with-node.ps1 npx.cmd expo start --web` to select the existing bundled Node24 runtime without a global upgrade.

The app imports design/system/tokens.ts through src/theme.ts. Read [design specification](design/system/DESIGN-SYSTEM.md) and [architecture](docs/v1-architecture.md) before extending it. The [browser implementation report](docs/browser-implementation.md) records current routes, storage boundaries, validation and remaining gameplay work. Use the browser toolbar to review explicit phone/tablet layouts; do not treat desktop width as a native device class.

app.json uses a development-only scheme and configured bundle/package identifiers. EAS configuration is dormant; phone/tablet native orientation enforcement remains a later native gate. No backend keys, sample balances, purchase stubs or AI features are in the starter.
