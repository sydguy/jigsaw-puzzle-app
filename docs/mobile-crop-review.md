# Mobile picture selection and crop review

7 October refinement: Cancel/Done now have wider 104-point faces and a slimmer 40-point visible height, with eight-point vertical padding. Transparent outer padding retains 48-point tap targets; 12-point corners, labels and primary/secondary styling remain. This overrides the earlier visible-action padding described below.

Reference: [Mob-photo capturedv1.png](<../design/mobile/Mob-photo capturedv1.png>). Latest owner instructions specify Cancel/Done and an immediate return to populated Create Puzzle. Those actions supersede Retake Photo/Use Photo from the raster. No new graphics are required.

Latest hint/button refinement: the generated [hand-and-arrows asset](../graphics/crop_drag_hint.png) appears in a translucent pill over the initial selection with Drag to change selected area. First touch/click anywhere in the editor dismisses it immediately; keyboard interaction does too. Reset does not reshow it; a new crop does. The overlay never intercepts gestures. Cancel/Done now use 12-point corners, minimum 48-point height, 14/20 semibold labels and 12×20 padding, with white/bordered secondary and gradient primary styling. This supersedes the initial pill-shaped header actions and earlier no-new-graphics note. [Asset prompt/provenance](../graphics/crop-drag-hint-provenance.md).

## Implemented browser flow

Choose file opens the system-provided single-file dialog/photo picker. Selecting a supported picture displays the complete, correctly oriented bitmap in a full-phone crop overlay. The browser controls the OS picker; its exact gallery presentation depends on the host. The app does not build a replacement device gallery.

The initial selection is the largest centred 3:2 rectangle contained in the decoded image. Its left/right edges touch for portrait and square images; top/bottom touch for wider images; all four touch for an exact 3:2 image. White borders/corner dots and dimmed surroundings follow the reference. Letterboxing preserves the complete image at any input aspect ratio, so landscape images do not fill a portrait screen vertically.

Dragging moves the selection. Each of four corners resizes it while keeping the opposite corner fixed and preserving 3:2. Pointer deltas are converted through the actual displayed image bounds, including browser preview zoom. Movement and resizing clamp at image boundaries. Keyboard arrows move a focused frame or corner, with Shift for a larger step. Reset restores the initial maximal crop. The dialog contains keyboard focus and disables the underlying app while open.

Cancel or Escape discards the selection and returns to its source without saving. Done validates the crop again, renders only its selected source pixels into a 1536×1024 JPEG, waits for the local transaction to succeed, and returns to populated Create Puzzle using the saved real image. The original filename supplies the default title, editable later in Collection. Timer/grid/rotation settings survive. A failed write retains the crop and offers Done again; rapid duplicate submissions are blocked.

Open camera retains the explicit browser permission/live-preview/capture flow. Take photo stops its video tracks and opens this same editor. The browser adapter uses no microphone. Native picker, native camera UI, native Cancel/Done presentation and physical touch performance are unverified and remain deferred under the browser-first decision.

## Boundaries and validation

Existing format-signature, 10 MiB encoded-size, 24-megapixel and 8192-side checks remain in force. Images never upload. Both original bitmap and bounded display canvas are released when leaving the flow; the display canvas is capped at a 2048-pixel longest side. Crop geometry is finite, bounded and fixed-aspect at the save boundary. The original bitmap supplies the export, not the scaled display canvas. No new runtime library was added; @types/react-dom 19.2.0 provides portal type declarations compatible with the existing React 19.2 stack. The attempted latest type package required React 19.3, so it was rejected and the matching version pinned without peer overrides.

## Evidence

- tools/check-crop.cjs covers 12,000 deterministic random move/resize steps, portrait/landscape/square/exact-ratio/extreme dimensions, invalid crop rejection, four corner pointer drags, movement, keyboard operation, browser zoom, saved-pixel comparison, cancellation, draft retention and actual populated-image handoff on both phones.
- tools/check-mobile-sources.cjs passes permission/no-hardware errors, synthetic camera capture, crop cancellation/Done, stream cleanup, no microphone and persisted camera metadata. Its first run checked cancellation during preview layout settling; the check now waits for video readiness and bounded cleanup completion, then passed.
- tools/check-browser.cjs passes unsupported-image rejection, cancellation, quota failure/retry, draft retention, collection rename/delete persistence and existing navigation checks with the new crop controls.
- TypeScript and production web export pass (11 exported routes). Screenshots in .cache/crop-review include both phone layouts, selected crops, artwork and populated Create Puzzle. Visually reviewed; no pixel-identity or native validation claim.

Dependency installation reported 35 audit findings (14 moderate, 21 high); dependency security triage remains a production gate. This is browser functionality evidence for part of M4, not complete M4/native acceptance.
