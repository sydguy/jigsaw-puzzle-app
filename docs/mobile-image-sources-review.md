# Mobile gallery and camera review — 6 October 2026

Scope: the mobile Add Image flow reached through Add Image or Change image on Create Puzzle. References: [Photo Gallery](../design/mobile/mobile-add-image-photo-gallery.png) and [Camera](../design/mobile/mobile-add-image-camera.png). Design-system tokens and current owner decisions govern colour, typography, control geometry and behaviour.

Latest owner spacing refinement: source artwork boxes are 64 points, tile vertical padding is eight points, and titles use their natural height instead of a reserved 40-point slot. This removes the excess gap before each description. All three tiles measure 164 points high (previously 182). The initial Add a photo and Take a picture panels each measure exactly 234 points on both phone layouts. Their shared minimum height allows error, camera-preview and crop content to expand safely. Fresh screenshots and measurements are in .cache/source-review/spacing-results.json; both default screens fit without scrolling. TypeScript and whitespace checks passed for this styling refinement.

## Implemented

- Photo Gallery opens first; the three source tiles follow reference order: Photo Gallery, Camera, Curated Collections. Selection has an outline and separate tick. The subsequent [curated review](mobile-curated-review.md) replaces its mobile development placeholder with labelled catalogue fixtures; real catalogue service integration remains pending.
- The gallery panel uses the supplied heading/copy and a styled single-file chooser row. Selection enters the existing validated fixed-3:2 crop flow. Cancel adds nothing; successful save returns the selected image to the original destination and preserves puzzle settings.
- The camera panel uses the supplied heading/copy and gradient Open camera action. On web, that explicit action requests video only. It shows a live preview with Take photo and Cancel camera, then reuses the same crop/import pipeline.
- Camera denial, missing hardware, camera busy/unavailable, preview failure and disconnection have explanatory retry states. Leaving the route, switching sources, cancelling, capturing or hiding the page stops media tracks. Late permission results after leaving are discarded and their tracks stopped.
- Capture bounds decoded dimensions before allocating its output canvas, limits its longest output side to 2048 pixels and uses JPEG input to the shared validated crop pipeline. Final saved images remain 1536×1024 metadata-free JPEGs. Camera pictures retain source= camera and the existing My Photo theme. Existing source= photo records remain valid without a database migration.
- No microphone, upload or puzzle creation is performed. Native photo/camera implementations remain explicitly unavailable, pending native work and physical verification.

## Visual comparison and intentional differences

The existing unchanged source artwork is reused from graphics/image_source_photo_gallery.png, graphics/image_source_camera.png and graphics/image_source_curated_collections.png. Upload/camera/check/back/info utility symbols use code geometry; no new raster art was required.

Phone screenshots are captured at 390×844 and 412×915 in .cache/source-review/. The header, three source cards, main form and information note fit without scrolling in both default states. The first screenshot pass led to removal of the form card outline and an increase in source-description text to 14/20. The long Curated Collections title wraps to two lines at the standard 14-point label size; descriptions now follow their titles immediately. The OS status/home bars in the reference are not painted into the browser app. Existing assets differ slightly from the dimensional artwork pictured in the new reference. No pixel-identity claim is made.

The crop editor and live camera states reuse functional controls; they were not specified by these two raster references. Tablet source layout is outside this mobile iteration and retains its previous presentation.

## Verification and limits

Run tools/check-mobile-sources.cjs against localhost:8081 using the documented Node runtime and Playwright setup. It uses an isolated browser profile and Chromium's synthetic camera, never the owner's physical webcam or collection. It captures both source states on both phones and exercises Add/Change entry, single-file selection, just-in-time permission, denial/no-camera recovery, capture, crop cancellation, save/persisted camera metadata, source-switch/Back stream cleanup and microphone exclusion.

The existing tools/check-browser.cjs covers gallery file validation, crop cancellation, quota failure/retry, draft retention and collection persistence. Native camera hardware, browser/device-specific permissions and physical mobile quality remain unverified. This browser increment does not accept M1 or complete M4.

Recorded results: both browser scripts passed with no captured browser errors; TypeScript and production web export passed. Both source states have content/viewport height 764/764 on the iPhone fixture and 835/835 on Android, so neither scrolls at default text size. Final screenshots were visually inspected against the references after the typography/card refinement. Documentation validation retained seven archive hashes and all 24 original security requirement mappings.
