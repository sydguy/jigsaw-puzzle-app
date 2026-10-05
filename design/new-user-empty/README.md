# New-user Home empty states

Generated 6 October 2026 for three review fixtures:

- `mobile-home-empty.png`
- `tablet-landscape-home-empty.png`
- `tablet-portrait-home-empty.png`

## Required state represented

- No user puzzles exist: `My Puzzles (0)`.
- The deferred AI allowance/header is absent.
- Theme Collection is the only allowance/status card.
- Guest state truthfully says `Guest collection · No purchased packs` and shows no sample balance.
- Add Puzzle remains the primary next action.
- Home / My Collection / Settings navigation is retained, with Home selected.

## Design-system decisions applied

- Canvas `#F7F7FE`, white surfaces, soft lavender grouping, deep indigo text and violet primary interaction.
- Platform system sans-serif hierarchy, rounded cards, restrained violet shadows and generous spacing.
- Empty state preserves screen context and uses a small puzzle illustration, title and one clear next action.
- Tablet layouts use 24-point-style gutters; mobile uses 16-point-style gutters.

## Intentional differences from supplied populated mockups

- AI Pack and all example balances are removed because AI is deferred from v1 and the guest owns no pack.
- Sorting is plain `Latest played` context text rather than an interactive dropdown while the list is empty.
- Puzzle rows and thumbnails are replaced by the first-puzzle empty state.
- The supplied mobile empty-state image is a composition reference only; these files use the design-system hierarchy and spacing.

## Review limits

These are generated raster composition studies. They do not prove pixel identity, native rendering, text scaling, accessibility semantics, safe-area behaviour, Expo Router native-tab geometry, or physical-device acceptance. Native tab-bar appearance may differ by OS as approved. Browser and native screenshots still need to be captured from the implemented components and compared before M2 visual acceptance.
