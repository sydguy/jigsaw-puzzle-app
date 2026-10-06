# Mobile Account and Privacy & Legal — 7 October 2026

Implemented from `design/mobile/mobile-account.png` and `design/mobile/mobile-legal.png`. Settings opens each page with its own fixed heading and shared black-chevron lavender Back button. Browser tabs are omitted on these subpages; returning restores Settings. Tablet routes retain their existing UI.

Account includes Full Name, Email, masked password/Edit, Save Changes and a red Danger Zone. The external signed-in review provides the editable sample profile; Save validates the name/email and updates only development-preview memory. Guest fields/actions are disabled. Password Edit and Delete My Account explain that their services are not connected; neither collects credentials nor deletes data. Existing real pictures and play preferences are untouched.

Privacy and Legal reuses all six supplied graphics, grouped into Cookie Preferences and Legal cards. Functional is an always-on status. Analytics and Marketing start off; preview changes are ephemeral, do not persist consent and do not start tracking. Policy rows report that the documents are not yet published. No legal policy content or external destination is fabricated.

## Visual comparison and intentional differences

- Preserved the reference grouping, white rounded cards, form structure, warning panel, icon/copy alignment and dividers.
- Shared design-system type, black back arrow, 48-point touch targets and switch styling override raster inconsistencies. Utility warning/pencil/trash icons use existing code/native text treatment; original artwork bytes are unchanged.
- The narrower phone width wraps the Legal subtitle onto two lines. Both default phone layouts fit without scrolling; shared overflow access remains for constrained sizes.
- Account's obsolete child-profile/chat wording is replaced with account profile/picture/puzzle scope, delayed cleanup on offline devices and separate guest data. The longer corrected text makes the warning panel taller than the raster.
- Sample email uses `sarah@example.com`. Guest Account has an explicit sign-in message and disabled form, absent from the signed-in reference.
- Optional analytics starts off despite the raster's on state, following the current consent requirement.
- No claim of pixel identity, physical-device validation or production account functionality.

## Verification

- `npm run typecheck`: passed.
- `npm run export:web`: passed; twelve exported routes.
- `tools/check-mobile-account-legal.cjs`: isolated Edge browser checks for both phone layouts, account validation, unavailable destructive/password actions, privacy defaults, pointer/keyboard switching, policy notices and Back navigation. No page errors.
- Captures: `.cache/mobile-account-legal/iphone-account.png`, `iphone-account-guest.png`, `iphone-legal.png`, Android counterparts and both tablet Settings layouts. Inspected phone and tablet captures against supplied references; both phone Legal views have no horizontal or vertical overflow at default text size.
- Real account APIs, reauthentication, verified email/password changes, deletion orchestration, published policies, durable consent and physical native testing remain unimplemented gates. No dependency or storage schema changes.
