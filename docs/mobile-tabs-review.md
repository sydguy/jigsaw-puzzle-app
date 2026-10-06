# Mobile My Collection and Settings

References: `design/mobile/Mob-my collection grid.png`, `design/mobile/Mob-my collection detailed.png`, `design/mobile/mobile-settings.png`, plus the owner's existing Play preferences panel and design-board switch examples. Scope: phone browser layouts at 390×844 and 412×915. Tablet geometry and native acceptance are unchanged.

## Latest owner refinements

### Signed-in alignment to guest

The latest owner correction uses the guest layout as the reference for both states. Both account areas occupy 98 points. Signed-in uses 34 points before its 50-point Sign Out button and 14 after, matching the guest sign-up text's visible bottom inset. Sign Out includes the reference's left arrow. Both panels now have the guest four-point tab gap, while menu spacing and Play preferences bounds match exactly between states. Focused checks passed these equalities on both phones with no scroll overflow; screenshots were visually reviewed. TypeScript and web export passed. Guest presentation is unchanged; native validation remains deferred.

### Guest reference correction

The latest attached guest screenshot supersedes the side-by-side footer decision below. Sign In is full-width again, with New here? Sign up centered underneath inside a 48-point target. Guest panel extends ten points lower and removes the extra bottom inset, leaving a four-point tab gap. Signed-in geometry is unchanged; fonts, menu icons and preference-box sizing are preserved. The focused spacing check now asserts the stacked full-width action, centered prompt, correct panel/tab gap and no-scroll fit for both phone layouts.

Validation passed on both phones in both account states. Guest panels measure 742/813 points with four-point tab gaps; signed-in remains 732/803 with fourteen-point gaps. Neither state overflows at default phone sizes. Captures in `.cache/settings-spacing/` were visually compared with the supplied guest reference. TypeScript and the 12-route Expo export passed; native validation remains deferred.

### Settings account-state parity

Owner requested the guest state use the signed-in geometry exactly. Guest Sign In and its existing sign-up prompt now share one 50-point row, replacing the stacked action/prompt. This leaves the signed-in layout unchanged and makes menu row bounds, Play preferences bounds, action-row bounds and 16-point panel bottom inset identical between states. Fonts and icons are unchanged. The spacing check asserts exact geometry parity on both phones; all four states passed without scrolling, and screenshots were visually reviewed. TypeScript and web export passed. Native validation remains deferred.

### Settings spacing correction

Owner rejected the compact panel and supplied mobile-settings.png again. The white panel now fills the space above the tab bar, with a 60-point avatar, 20-point profile/menu headings, 38-point artwork, 16-point panel insets and 12-point section gaps. Menu rows expand into the available height with a 52-point minimum. Play preferences and account actions remain at the bottom of the same panel. Preferences copy is shortened without changing its local-only/unconnected-play meaning. Minimum panel height follows the phone viewport; content can still grow for accessibility/errors. `tools/check-settings-spacing.cjs` captures both phone/account states and measures overflow, panel/tab separation and action order.

Validation: all four phone/account combinations passed, with 732-point iPhone and 803-point Android panels and a 14-point panel/tab gap. Scroll content equals viewport height (844/915) in every default state. Screenshots in `.cache/settings-spacing/` were compared visually with the supplied reference; adding preferences and the guest sign-up prompt intentionally changes its composition. TypeScript and the 12-route web export passed. Tablet code is unchanged; native and enlarged-text validation remain unverified.

### 7 October follow-up (supersedes floating Collection notes below)

- My Collection's Create Puzzle footer and browser tabs are fixed in normal layout, with no content underneath. The Picture details/Rename or delete footer action is removed.
- Filters begin All pictures (combined default), My Pictures (photo/camera), All Curated Themes (all nonpersonal items, including free curated pictures), then individual themes.
- Detailed thumbnails use the same responsive 3:2 size for personal and theme pictures. Filename/title is one line with an ellipsis, preserving equal reviewed insets and the eight-point text gap.
- Detailed rows and Home share `SwipeDeleteRow`, `DeleteIcon` and `theme.color.cardDelete` (#F52235). A left swipe reveals trash icon/Delete; arrow keys also reveal/close. Cancel is initially focused. Delete requires object-specific confirmation; the action remains pending until storage completes, and failures retain the picture with a visible retryable error. Local photo deletion clears an affected draft through the existing local service. There are no stored gameplay puzzles yet, so actual photos have zero linked puzzles. Catalogue/Home fixtures are removed only from review memory and reset on screen remount/reload, never changing entitlements or real pictures.
- Guest Sign In follows Play preferences, with a New here? Sign up action. Both still explain the unconnected account service. Settings uses smaller icons/type and closer spacing while keeping 48-point controls, fitting default phone layouts without a scrollbar; smaller screens, errors and larger text retain overflow access. Signed-in review still offers Sign Out.
- Theme Collection uses 700 weight wherever it appears, matching My Collection's weight. Tablet Home already used 700.

The focused refinement script passed on both phone layouts: revised filters, fixed controls, uniform thumbnails, pointer-swipe/cancel/delete, failed-storage recovery, real deletion persistence, Home deletion styling, account-action ordering and guest/signed-in Settings fit. Screenshots in `.cache/mobile-refinements/` were visually reviewed, with Home recaptured after all artwork loaded. The new swipe wrapper initially expanded around long filenames; explicit width constraints and nonwrapping list layout fixed it, and the check now asserts no horizontal overflow. `check-mobile-tabs.cjs` also passed sorting/filtering/Create handoff, preference persistence and Billing/Back, with unchanged tablet regression captures. TypeScript, the 12-route Expo web export and document validation passed. The broader crop/storage browser suite was not rerun in this follow-up. Native gestures and linked-puzzle cascade remain unverified until those implementations exist.

### Previous refinement

These changes supersede the original implementation notes below:

- Personal photo/camera imports and 18 development theme fixtures share one list. The external Collection review selector is removed. My Pictures is the first filter item, followed by All Themes and theme names; the first filters both personal sources. Theme fixtures remain labelled in the external toolbar and are never persisted or treated as acquired content.
- Grid/Detailed visible faces match the 36-point dropdown faces, retaining 48-point targets. Create Puzzle and the browser tab bar float with Home-style shadows. The outside scrollbar ends above the action stack, and extra scroll-end padding reveals the final card. Settings uses the same floating tab treatment.
- Detailed thumbnails grow to the text-block height, maintain the complete 3:2 image and equal top/bottom/left insets at reviewed sizes, with the same eight-point gap to text. A width cap preserves text space on smaller screens or enlarged text.
- Tapping an already-selected picture deselects it in My Collection and curated picture selection. The owner explicitly confirmed that mandatory choices (Grid/Detailed, timer mode, puzzle size) remain active.
- Guest Settings includes Sign In. The external Account review selector switches between Not signed in and Signed in sample profile. The latter shows Sarah Johnson with a reserved example.com email and Sign Out. Sign In explains that authentication is not connected in the external status; native/production opens the Account explanation. Sign Out returns to guest review without modifying actual photos/preferences or authentication.

`tools/check-mobile-refinements.cjs` verifies a combined list containing both local import sources and theme fixtures, My Pictures filter order/content, matching control heights, floating positioning, detail-image ratio and equal insets, repeat-tap deselection, last-card visibility and guest/signed-in actions on both phone layouts. Screenshots are in `.cache/mobile-refinements/`. The initial tab/browser checks below are previous-pass evidence; their selectors now follow My Pictures rather than the removed review dropdown.

Latest refinement validation passed on both phone browser layouts, with screenshots visually reviewed. TypeScript, Expo web export and document validation passed. An initial test run used an explicit image-role selector that did not match React Native Web's image element; correcting the geometry-check selector resolved the timeout. No native-device execution was performed.

## Original implementation notes

## My Collection

Centred title and subtitle; side-by-side Sort by and Filter by Theme menus; gradient Grid/Detailed segmented control; selected picture ring/tick; coloured theme chips; fixed Create Puzzle footer and the existing bottom tabs. The grid remains exactly three columns. Detail rows show title, theme, Times Used, Date Added and Last Used. Metadata wraps into readable lines instead of reproducing the reference's tiny single line. Thumbnails show the complete 3:2 asset without stretching. The shared scrollbar sits in a separate gutter; title/controls/footer stay fixed and only pictures scroll.

Sort choices are Recently Added (default), Last Used, Most Used and Title A–Z. Themes are derived from the displayed data. Selection survives view changes; filtering out a selected picture disables Create until a visible picture is selected. The button opens Create Puzzle with the chosen picture while retaining grid/timer/rotation settings. The initial state has no selected picture, so the action is disabled until selection.

The external Collection review selector defaults to Sample collection, with 18 entries built from nine existing seed images. Repeats exercise scrolling on both phones. These are labelled review fixtures and use their actual artwork titles; the mockup's separate catalogue originals remain unavailable. Sample usage/dates never enter the repository. Selecting a sample only supplies the existing temporary Create preview.

Saved photos displays actual browser-local pictures only, with zero usage and Last Used: Not yet until gameplay exists. After a successful import this mode is selected automatically. After selecting a real picture, Picture details retains rename/delete and their existing confirmation/storage handling. Empty saved collections provide Add Picture. The main Collection screen follows the supplied theme/sort controls; the older phone search field is superseded by this layout. Tablet search and layout remain intact.

## Settings

The main mobile page uses one rounded white panel with a circular guest initial, profile summary, settings label and existing Account/Billing/Privacy & Legal/FAQ/Support graphics and links. Play preferences appears below the links with the owner's explanatory copy. No authenticated identity or Sign Out is fabricated: the browser still runs as a guest. Billing's lavender emphasis in the raster is treated as an interaction state rather than a permanently selected main-page row.

Sound effects and Haptic feedback use a shared 48×28 pill, outlined grey-lavender off track, violet on track and 20-point white thumb, within 48-point touch targets. Space/Enter/pointer interaction is available. The existing local preference service remains authoritative; controls disable during load/save and errors remain visible. Gameplay sound and physical haptics are still unconnected, as explained in the panel.

## Validation and limits

`tools/check-mobile-tabs.cjs` captures `.cache/mobile-tabs-review/` grid/detail/empty/Settings screens on both phones and unchanged tablet pages. Checks cover three columns, sorting, theme filtering, selection, sample Create handoff, disabled initial action, last-card visibility, outside scrollbar, fixed header/footer, persisted sound preference, switch geometry and Billing/Back. Visual comparison uses the supplied references; reused artwork, guest profile and wrapped metadata are intentional differences, not a pixel-identity claim.

`tools/check-browser.cjs` has been updated to follow Select → Picture details, the Detailed label and theme filtering in the mobile view. It retains real-photo crop/save, storage error/retry, rename/delete, persisted preferences and future-database protection checks.

Both browser checks pass after the density refinement. The automation waits for the development page to finish reconnecting after reload before changing review controls; an earlier run selected a control before hydration and was retried with that wait. These checks use isolated browser storage, never the owner's saved pictures or preferences.

TypeScript and Expo web export pass. Export initially discarded an unreadable Metro cache and successfully rebuilt all 12 routes. No new dependency, external service, image upload or entitlement change was introduced. Native execution, physical text scaling/accessibility, account/billing/support integration and final owner visual acceptance remain unverified.
