# UI/state inventory

Current screenshots provide styling and layout; this matrix supplies state coverage. Owner visual acceptance remains M2 evidence, not assumed from this text.

| Surface | States and behavior | Test |
|---|---|---|
| Home | Empty headers/AddPuzzle/MyPuzzles; populated progress/lastplayed; loadfailure with retry; deletion confirmation; no sample userpuzzles | UI-01 |
| Collection | Empty; three/six-column grid; detailed row; themefilter; used/date/lastused; rename; cascade count confirmation | UI-04, SAVE-02 |
| Add source | Curated/photo/camera only; active-source highlight; Back keeps draft; AI hidden | UI-02 |
| Curated | Loading/empty/error; free/premium; owned hide-or-disable; confirm full spend; no allowance/product unavailable; resumable download | COMMERCE-02 |
| Photo/camera | Just-in-time permission; denied->settings; picker cancel; selected-image confirmation; crop cancel; malformed/oversized/lowstorage messages | IMAGE-01 |
| Create | Linked approved dimensions; presets; rotationoff; stopwatch/countdown; no start until valid local image/config | ENGINE-03 |
| Play | Ready/running/paused/Preview/ad/connectiongrace/forcedpause/timeout/completed; board visible and disabled when paused; toolbar/tray/zoom states | CLOCK-01 |
| Timeout | Clear timed failure; continueuntimed reward explanation, Restart/Home; subscriber directcontinue; cancelledad stays at timeout | CLOCK-02 |
| Completion | Reducedmotion-aware celebration; time/moves; timed success or untimed finish; Replay/Home | GAME-07 |
| Auth | Guest/signin/signup/verification/reset/linking/expiredonline session; errors do not erase localprogress; deep-link recovery | ACCOUNT-01 |
| Guest migration | Explicit local assignment yes/no; never imply upload/sync | ACCOUNT-01 |
| Billing | Storeprices/loading/unavailable/pending/cancelled/success; restore/history/receipt guidance; used/granted; no fakePDF | COMMERCE-01 |
| Offline | Valid subscriber localaccess, verifiedexpiry/reconnect; free60sgrace thenpause; savedprogress retained | OFFLINE-01 |
| Settings/privacy | Independent sound/haptic toggles; optionalanalytics; consent/revoke; real support/legal links; actual deletion scope | PRIVACY-01 |
| Support | Validated submit/pending/success with requestID/failure/retry; never report success before durable acceptance | SUPPORT-01 |
| Admin | MFA gate; draft/review/publish/unpublish; authorizationfailure; uploadvalidation; audit history | CONTENT-01 |

Phone portrait and tablet portrait/landscape variants are required. Accessibility labels, text scaling, contrast and reducedmotion apply to all states. No nonvisual puzzle-play claim.
