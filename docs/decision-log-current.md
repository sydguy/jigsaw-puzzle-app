# Current decisions

2026-10-06 mobile Home scrolling: owner marked the first-card boundary as the start of scrolling. Theme header, Add Puzzle, heading and sorting remain fixed; cards clip at that boundary. Preserve the scrollbar's lower endpoint. Mobile Home's browser tab panel now floats above content, with scroll-end clearance for the final card. This supersedes whole-page Home scrolling for mobile only.

2026-10-06 scrollbar/crown/tab refinement: owner requested a uniform bright-orange crown without high contrast; two more Home fixtures to demonstrate scrolling; one rounded violet scrollbar appearance across all scrollable app pages/device layouts; and slightly reduced browser tab icon/label gap and selected-item padding. Implemented through shared AppScrollView and Screen navigation styling. Mobile review now has seven cards and tablet review five. Native tab sizing remains OS-controlled under the approved native-tabs decision, and physical native scrollbar behavior remains unverified.

2026-10-06 mobile follow-up: owner requested clearer/heavier theme-header text, reduced padding, a bolder crown and more horizontal space around the sort control. Added requested right-to-left swipe deletion to mobile seed cards with explicit confirmation; deleting a Home puzzle preserves its collection picture. Review deletion is memory-only, resets with review-state switching/reload, and never changes theme ownership or real local collection data. Tablet refinement and native verification remain deferred.

2026-10-06 mobile Home refinement: owner rejected the earlier Home result and requested mobile-only iteration against the new empty/populated references, with particular attention to font sizing and density. Isolate the compact layout to mobile; retain the approved navigation and design-system palette/system font family. Match the new mobile reference copy, single-row purchase header and five seeded rows. Use exact supplied thumbnail artwork regions for mobile review. All values remain visual fixtures; no actual user data, billing or gameplay is connected. Tablet redesign is deferred pending mobile review. This is an implementation awaiting owner review, not final design-system or milestone acceptance.

2026-10-05 latest workflow change: owner requested local browser development first and deferred EAS until browser review is satisfactory. Preserve the existing EAS link/profiles dormant. Supersede native-first sequencing for browser UI/gameplay work only; native compatibility, service and release evidence remain required later. No new cloud build or native provisioning is authorized by this change.

2026-10-05: Owner authorized the approved production-v1 plan and document archival. Latest owner statements override the plan. Imported source bytes must be retained.

- Expo SDK55 compatibility target for iOS/iPadOS15.1 and Android7; exact package versions and native build support must be measured, not inferred.
- RevenueCat selected over direct store infrastructure. Store fees remain separate.
- Non-expiring purchased theme/picture packs. Real quantities/prices owner-approved before paid beta.
- Optional ad personalization, consent-dependent.
- Minimize fixed costs; no paid provisioning authorized by a budget estimate.
- Primary development preview is local Expo web on Windows; EAS simulator optional.
- Physical iPad evidence required for release.
- Owner confirmed Expo/EAS, Apple Developer and Google Play accounts/identifiers are not ready. Record setup blockers; do not fabricate production app IDs.
- This folder initially contains reference materials only and is not a Git repository.

Deferred: AI, multiplayer, cloudsync, backup/restore, push and marketing landing site. Final branding, countdown durations, product quantities/prices, legal policies and service provisioning remain tracked gates.

2026-10-05 EAS setup: authenticated owner `sydguy`, created and linked `@sydguy/jigsaw-puzzle-app` (project ID `fc555f03-646f-4c0d-b2cc-e3b381bf5a59`), and adopted the permanent native identifier `com.sydguy.jigsawpuzzleapp` for iOS and Android. Added development, preview and production build profiles. This does not claim Apple/Google credentials or a completed native build.

2026-10-05 foundation: owner resumed work for a clean Expo Router starter and M0, supplied the design/system package and v1 architecture. Adopt tokens without treating proposed screens/entities as accepted implementation. Configure Git main/origin with author sydguy and the supplied email. Keep native/service work gated; record audit findings without forcing incompatible framework upgrades.
# Native tabs and visual verification — 5 October 2026

Owner requested Expo native tabs and a build/screenshot/compare/refine loop for all UI implementation. Native tabs take priority on all native devices, including iPad, with OS-controlled appearance and positioning accepted. This supersedes exact custom bottom-bar geometry on native tablets; labels and screen visibility rules remain. Browser review uses a matching custom bar. Use supplied graphics first and generate missing raster assets from mockup references. Save captures and explicitly report unresolved differences. EAS/native validation remains deferred.
