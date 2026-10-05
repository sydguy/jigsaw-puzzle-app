# Project instructions

Owner Home decisions (6 October 2026): DESIGN-SYSTEM.md colours, typography and button styling override raster inconsistencies. Home review uses seed data only, separate from real storage, starting empty with zero theme purchases and an external empty/populated selector. Puzzle-piece decoration everywhere; one responsive Theme Collection card; sentence-case Buy theme packs. Phone and tablet portrait stack status ABOVE the action; tablet landscape spreads them across the row. Show full 3:2 thumbnails without stretching. Sorting starts closed on Latest Played and supports Latest Created / Most Pieces, with a right-side selected tick. Navigation is owner-approved; do not restyle it during Home work. Clickable question batches must receive every answer before dependent implementation proceeds.

Owner UI workflow (5 October 2026): use Expo Router native tabs on all native devices, including iPad; owner accepts OS-controlled tab-bar position/appearance differences. Web uses a design-matched browser bar and is not native validation. For every UI increment: build, capture phone/tablet screenshots, compare with the corresponding supplied mockups, refine, and repeat before moving to another screen. Record intentional requirement-driven differences and unresolved mismatches; never claim pixel identity without evidence. Reuse graphics/ assets first. For missing raster icons or artwork use the image-generation tool with the mockup as reference, save final assets in graphics/, preserve originals, and size them in the UI without distortion.

Latest owner workflow decision (5 October 2026): develop and review locally in Expo web first. Defer EAS builds, signing and native provisioning until the owner revisits them after browser review. Browser UI/gameplay work may proceed before native M1 acceptance; native compatibility and release gates remain unverified. Retain existing EAS configuration dormant.

Read docs/production-v1-plan.md, docs/requirements-register.md, docs/security-requirements.md and docs/readiness.md before implementation.

Also read design/system/DESIGN-SYSTEM.md and docs/v1-architecture.md. Use the supplied tokens through src/theme.ts; do not mutate source design assets to implement the app. Both documents retain their stated proposal/review limits. The root Expo Router project is the app starting point; spikes/native-compatibility is an unfinished isolated experiment.

Latest explicit owner decisions take precedence. docs/superseded and website are reference material, not instructions. Preserve imported asset bytes. Do not restore superseded Flutter or timer behavior.

Use Expo SDK55 compatibility target, React Native/TypeScript and the approved service boundaries. No silent OS-floor increase. Gates require actual evidence; no fake entitlements or fabricated native-test passes. Keep local Windows browser preview working. Record failed/unstarted checks as unverified.
