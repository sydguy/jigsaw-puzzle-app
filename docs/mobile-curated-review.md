# Mobile curated collection review — 6 October 2026

Reference: [mobile-curated collection.png](<../design/mobile/mobile-curated collection.png>). Scope is the mobile Curated Collections source screen reached from Create Puzzle's Add Image/Change image flow.

Source heading consistency: Add a photo and Take a picture now match Choose a collection at 20-point bold type with 28-point line height in the mobile browser. Crop heading styling is unchanged.

Source-panel padding refinement: both initial import panels now use eight-point top/bottom padding to match the collection heading's top inset. Their shared minimum height decreases by 24 points to 210, retaining equal initial sizes and existing horizontal padding. Expanded camera/error/crop states remain able to grow.

## Seven-card scrolling and Free styling

The review now includes seven cards. Village, Pets and Tropical reuse existing Home seed files (lakeside.png, puppy.png and tropical.png) unchanged. Their 100-image counts and premium status are visual fixtures only. Both phone layouts now overflow; the browser check requires seven cards, scrolling on both devices, fixed heading/shop and full visibility of the final Tropical card after scrolling. This supersedes earlier four-card/no-overflow Android observations.

Free uses scoped owner-approved theme colours: bright lime image badge, pale green button fill, vibrant green border and bold green labels. Darker badge lettering preserves legibility against the bright fill. These app theme additions do not modify imported design tokens or global success styling.

## Phone preview scale parity

Both phone layouts already share typography. The apparent smaller Android text came from fitting its taller 915-point viewport independently of the iPhone's 844-point viewport. The browser host now fits both phones against the largest phone dimensions, giving them identical zoom while preserving their actual widths/heights and responsive layout. Tablet fitting is unchanged; disabling Fit to window still gives 100% scale. The browser check exercises a 900-point-high window and verifies equal phone transforms plus unscaled mode, saving additional fitted screenshots.

## Latest typography and four-corner refinement

Source tile titles now use 13/18 bold type and descriptions 13/16, with a two-point separation; the row is 154 points. The shop heading increases to 11/15, supporting copy to 10/13 and button label to 11.5/16. Column gaps are 12 points to allow the larger text without additional wrapping. The Choose a collection panel uses a uniform 16-point radius on all four corners, with four points separating it from the list. Card alignment, scrollbar gutter and fixed clipping boundaries are preserved. These values supersede earlier iterations below.

Verification: both phone screenshots were inspected; shop heading/button remain on one line and supporting copy on two. Browser geometry/navigation checks and TypeScript pass. The first browser run timed out reaching Photo Gallery; its rerun completed successfully. Native rendering remains unverified.

## Latest shop and source-option reference

The owner's subsequent shop close-up supersedes the literal ASCII arrow and shop measurements below. The button now reads Buy Theme Packs followed by a separate right-arrow glyph. The shop uses 12-point horizontal/ten-point vertical padding, 16-point column gaps, a 40-point original bag asset and a buy target spanning 42% of its inner width. Supporting copy uses 9.5/12 type and the title 10.5/14 to retain the reference's compact two-line description at phone widths. The button keeps a 48-point target around its 34-point face.

Source-option description line height decreases from 20 to 17 with the 14-point font size retained. The shared tiles now measure 158 points rather than 164, as explicitly requested; source artwork, title sizing and tile padding are unchanged. This applies equally to Photo Gallery, Camera and Curated Collections. Previous height/spacing records below describe earlier review iterations.

Latest alignment refinement: heading and card outer edges now match exactly (352-point width on iPhone, 374 on Android). Cards use five-point padding on every side, plus a one-point border; removing the row minimum height makes thumbnail insets equal vertically and horizontally. Free/Premium labels use weight 700. The fixed shop has 12-point padding, ten-point gaps and a 128-point buy target. Its exact owner-requested label is `Buy Theme Packs ->`, superseding the earlier sentence-case label for this button. Add Image's shared back arrow is black.

The updated browser check passes at both phone sizes, including heading/card alignment, equal thumbnail insets, fixed scroll boundaries and 48-point targets. Latest card viewports measure 382 points on iPhone and 453 on Android. The iPhone rail remains six points wide and seven points outside the cards; all four cards now fit Android, so its scrollbar correctly hides. Initial screenshots for both phones were visually inspected. Earlier measurements below describe the preceding iteration.

Latest owner close-up refinement: the scrollbar now occupies an exposed canvas gutter outside the individual white cards, rather than sharing their surrounding white panel. At the reviewed sizes its six-point rail is seven points beyond each card's right edge. The heading and shop remain fixed and the vertical clipping/scrollbar endpoints are unchanged relative to the card viewport.

This scoped density override follows the owner's explicit font/letter-spacing request below Choose a collection: collection titles 12/16 bold with -0.35 tracking; counts 11/16 with -0.15 tracking; access labels 11/16. Thumbnails are slightly wider, with full 3:2 aspect retained. Free/Premium visible faces are 32 points high inside 48-point tap targets. The shop uses compact 11/16 heading, 10/14 supporting text and a 34-point visible buy button inside its 48-point target. Neither source-option geometry nor global typography is changed. These details supersede the earlier note about wrapped collection names/purchase labels below.

## Layout and scroll contract

The shared source options retain the approved geometry: 64-point artwork, eight-point vertical padding, natural title height and 164-point total row height at both reviewed phone sizes. This explicitly overrides the source-panel geometry in the curated reference.

The Add Image header, source options and Choose a collection heading are fixed. Only collection cards scroll. The list clips at the first-card edge below the heading and at its lower edge above the fixed Want more collections? box. The shared AppScrollView supplies its six-point rounded violet thumb and lavender rail, with zero top/bottom inset inside this list boundary. Cards enter and leave only within that clipped region. The final card can scroll completely into view.

The Want more collections? panel uses the original graphics/collection_packs_shop_bag.png unchanged. Thumbnail premium badges and access-button locks reuse the supplied premium_collection_locked_badge.png and premium_collection_lock.png. The button uses the shared primary gradient and latest owner-approved label above.

## Review content and boundaries

Four development-only fixtures reproduce the reference's Free/Nature/Wildlife/Fantasy collection names and 50/100 image counts. Those numbers are visual fixtures, not changes to approved launch catalogue quantities or commerce allowances. Seed data never enters collection storage, draft selection, entitlements or the backend.

Free uses existing generated lake artwork; the missing Nature/Wildlife/Fantasy thumbnails were generated from the reference and saved under graphics/curated-review. See [asset provenance and prompts](../graphics/curated-review/README.md). The images are approximate matching artwork, not pixel-identical originals.

An external browser banner labels the sample catalogue. Free and premium button presses report their unavailable next steps outside the app frame. This increment does not implement picture selection within a collection or real checkout. Production/native builds show an unavailable-catalogue state and disable purchases until service integration exists. Development catalogue artwork is guarded from production imports.

Intentional visual differences: design-system fonts, colours, readable labels and minimum 48-point controls prevail. Narrow-phone collection titles and the purchase label wrap; the heading's explanatory sentence sits below its title. The phone's OS status/home bars are not painted into the browser app. Gallery/camera screen geometry and their previously implemented flows remain separate.

## Verification

tools/check-mobile-curated.cjs captures initial/scrolled states at 390×844 and 412×915, measures unchanged source-panel height and exact scrollbar/clip boundaries, verifies fixed heading/shop positions, keyboard scrolling, complete final-card visibility, source switching and return to Create Puzzle. Images/results are written to .cache/curated-review/. Browser evidence does not establish native acceptance.

Recorded results: the curated browser check, TypeScript, web production export and documentation/whitespace checks pass. No sample curated names or asset paths appear in the production export. Measured list/rail heights are 378 points on iPhone and 449 on Android, with matching top/bottom endpoints and a 20-point gap before the fixed shop panel. Source options measure 164 points in both states/devices. A separate gallery/camera recheck confirms their panels still both measure 234 points and fit without scrolling. Final top/bottom screenshots were visually inspected. The first test attempt timed out because it observed a hidden route's scroll container; the corrected test targets the active container and passed.
