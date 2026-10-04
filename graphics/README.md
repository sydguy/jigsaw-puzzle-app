# Jigsaw source handover v2

Read docs/Jigsaw-Development-Handover.md from the top. Version 2 decisions override the historical audit. This is a development input package, not a built Flutter app.

- references/mobile and references/tablet: 29 current screens; seven revised replacements.
- SCREEN_UPDATES.csv: exact replacement mapping; superseded art remains in references/superseded.
- assets/graphics: 32 PNGs and one SVG. ASSET_MAP.csv and asset_map.json give roles and checksums.
- references/graphics: original bulb, preserved unchanged.
- prototype: unchanged basic puzzle source.
- graphics-updated.zip: standalone asset package.

Copy assets/graphics into the Flutter repository and register it under flutter/assets in pubspec.yaml. PNGs use Image.asset. The SVG needs an SVG-capable renderer or a native drawing port; Image.asset does not directly render SVG. The hint icon uses a 64-unit viewBox, white artwork, transparent background; use at about 24–32 logical pixels in the existing green button. The button owns its gradient, padding, focus/tap states and semantics.

Screenshots still contain some old labels: written decisions override them (216 pieces, no child/chat deletion copy, active source selection, etc.). No screenshots were repainted in this packaging task. Old project ZIP uploads were not overwritten. Use this consolidated package as the current development input.
