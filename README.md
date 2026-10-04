# Jigsaw app — production v1

Read the approved [production plan](docs/production-v1-plan.md), [requirements register](docs/requirements-register.md) and [security requirements](docs/security-requirements.md).

The root is a minimal Expo SDK 55 + React Native + TypeScript + Expo Router project. This is not a released app. See [M0 report](docs/m0-report.md), [readiness](docs/readiness.md), [documentation index](docs/README.md) and [development guide](DEVELOPMENT.md).

## Start locally

Use Node.js 20.19.4 or newer (a supported LTS version is recommended).

```powershell
npm ci
npx expo start
```

Press **w** for the local browser, or run `npx expo start --web` directly. No EAS cloud build is needed. `npm run typecheck` checks TypeScript and `npm run export:web` verifies the web bundle.

On this workstation the system Node is older. The existing bundled Node can be selected without changing the global installation: `./tools/with-node.ps1 npx.cmd expo start --web`.

## Small project structure

- app/: Expo Router layout, starter route and not-found page.
- src/theme.ts: direct re-export of the supplied design tokens.
- design/system/: visual specification and token source; [architecture](docs/v1-architecture.md) explains entity/service boundaries.
- spikes/native-compatibility/: earlier unfinished experiment; not imported by the root app and not a native acceptance result.

Primary preview is local Expo web on Windows. EAS native builds and physical checks are separate; cloud simulation is optional. No production accounts, signing or native validation are claimed.

## References

- [Visual and entity architecture](docs/v1-architecture.md): development workflow, runtime services and minimum v1 data relationships, with editable Mermaid diagrams.
- design/mobile and design/tablet: current app screens; current written decisions take precedence.
- graphics and root asset maps: supplied artwork.
- design/graphics currently contains the original hint bulb; the main 32 PNG/SVG artwork set remains in root graphics. Both are preserved.
- prototype: latest v10 behavioral reference, not trusted production code.
- website: guidance-only historical mock, not current scope or target UI.
- docs/superseded: original guidance/owner images preserved unchanged.
- Root CSV/checksum files and historical manifests: provenance, not active requirements.

No Flutter implementation or earlier milestone authorization carries forward. Latest explicit owner decisions remain highest authority.
