# Mobile collection picture selection

Reference: `design/mobile/mobile-collection pic selection.png`. Owner correction: replace the old combined AI/Theme header with the single Theme Collection summary from the approved mobile Home. Shared lavender-circle/black-arrow Back button applies.

Implemented for local mobile browser review at 390×844 and 412×915. Clicking any curated collection row opens `/collection-pictures` with that collection's title. The entire row is a single accessible button; its Free/Premium face retains the previous geometry. Source options and curated-list geometry remain unchanged.

The fixed top contains the title, subtitle, orange crown summary and exclude-owned switch. The summary matches Home's 56-point minimum card, 38-point crown, 16/20 bold title, 14/18 balances, and 108-point buy target. The grid uses three columns, eight-point gaps, rounded thumbnails and a violet selection outline with a white tick badge. The shared six-point scrollbar sits outside the thumbnails and spans the independently clipped grid viewport. The 56-point Add Picture action remains below the viewport. Back returns to the curated list with that source still selected.

Exclude already in collection starts off. Four owned review entries are dimmed and disabled; enabling the switch removes them. Add Picture starts disabled until the user selects an available picture. From the Create flow, Add Picture transfers the selected sample into the populated Create preview without touching the real picture ID or puzzle settings. Subsequent actual import or explicit local-picture selection clears the temporary sample override.

## Intentional differences and scope

- Use design-system colours/system fonts and the owner's approved Home header; remove AI entirely. Use the shared Back button and 48×28 design-system switch.
- Twenty-one development-only tiles exercise scrolling on both phone sizes. They reuse nine existing seed artworks, with repeats; the screenshot's separate nature originals are unavailable. The images are not screenshot crops or a production catalogue. Grid tiles use cover fitting without stretching; Create shows the complete original 3:2 seed.
- Every collection uses the same review artwork set for now. The title follows the clicked card. Sample balances/owned markers are labelled in the external browser toolbar and are never treated as real entitlements.
- This increment implements browsing/selection review, not catalogue download or acquisition. No purchase, allowance debit, unlock or local-picture save occurs. From My Collection rather than Create, Add Picture explains this in the external review status. Live acquisition still requires the service/confirmation/transaction boundaries in the production plan.
- No tablet redesign or native acceptance. Tablet source pages were captured for regression review; the new route shows an honest mobile-review notice on tablets. Production/native builds expose no seed catalogue.

## Evidence

`tools/check-collection-pictures.cjs` uses isolated Edge and captures `.cache/collection-picture-review/phone-{0,1}-{selected,scrolled,create}.png` and both tablet source layouts. It checks three columns, unavailable owned entries, hide/show filtering, explicit selection, initial disabled Add, header replacement, scrollbar endpoints/gutter, fixed header/footer, last-row visibility, Create handoff, Back navigation and storage isolation. It also imports a test image after a sample to check the real crop replaces the temporary preview.

`tools/check-mobile-curated.cjs` passes existing phone option-height, list-spacing/clipping, fixed-shop, scrollbar and navigation checks after changing rows to clickable buttons. TypeScript passes. Expo web export passes with 12 routes including the new screen. Screenshots were compared visually to the supplied reference; exact artwork/pixel identity is not claimed. Physical touch, font scaling, native services and catalogue rights remain unverified.
