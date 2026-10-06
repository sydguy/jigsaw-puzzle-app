# Create Puzzle artwork provenance

6 October 2026. Existing imported graphics and design references were not edited.

| Asset | Source / role | SHA-256 |
|---|---|---|
| `add-image-camera-circle.png` | Owner-supplied transparent camera-circle artwork, reused unchanged | `960DED651F9417D887C6DEC0D897B14E9006F16CCFC21EB592DAA93E73D2BF04` |
| `puzzle_rotate_arrows.png` | New transparent raster illustration, built-in image-generation tool; displayed with contain fitting | `B9526F78200220B76B1DE94ED2397BCE8126C8850A5CA5FB8229C1830761A45E` |
| `../design/mobile/mobile-create puzzle.png` | Owner's latest mobile reference, not generated or modified in this pass | `FCDC2F866A5FABFD19B0D0BBD73AF123A39D27EDFEBF96783EC116A7B586C9B5` |

Existing `puzzle_size_piece.png`, `puzzle_timer_mode.png` and `puzzle_ready_illustration.png` are reused unchanged. Back/plus/minus are simple code-drawn controls, not bitmap substitutes. The camera asset's transparent padding is accounted for by its display box; its original pixels remain intact.

The generated original remains at `C:/Users/ARIJI/.codex/generated_images/01a10585-2b69-74d1-9a88-3fb814d26b1a/exec-e47a1471-13ea-40c4-8282-bf2b2590cfe0.png`. The project copy is self-contained under graphics. No CLI fallback or external API key was used.

Final generation prompt (mobile reference attached as visual guidance):

> Create a single transparent PNG UI illustration matching the Rotate pieces icon near the bottom of the supplied Create Puzzle mobile screen reference. Reference image is style/shape guidance, not an edit target. Isolate only the two rounded curved purple arrows forming a nearly complete clockwise circle, arrowhead at left pointing up and arrowhead at right pointing down. Crisp chunky rounded strokes, subtle violet gradient (#7140EC to #5430E8), minimal dimensional highlight, no cast shadow. Empty transparent center and transparent background, no tile or circle backdrop, no text, no other icons. Center the artwork in a square with about 8% transparent margin, legible as a 36-point mobile settings illustration. Do not reproduce the screen or any words.
