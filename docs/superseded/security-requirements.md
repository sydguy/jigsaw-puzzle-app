# Security requirements addendum - 26 September 2026

This addendum is mandatory for all subsequent implementation milestones. It supplements Version 3 and preserves its approved gameplay and product decisions. Prototype code establishes intended behaviour, not a trusted production implementation. This addendum is a requirements update, not a completed security audit or certification.

## Security mindset when porting prototype logic

- Treat JSX, HTML, website mockups and their dependencies as unreviewed reference material. Do not copy implementation details merely because they work in the prototype. Reimplement approved behaviour in maintainable Flutter/Dart code with explicit validation and tests.
- For each feature, identify inputs, sensitive data, trust boundaries, failure paths and possible abuse before implementation. Review the relevant prototype logic for unsafe assumptions, resource exhaustion, state corruption and unintended access. Record findings and their disposition in the development decision/security log.
- Preserve legitimate wrong-but-shape-compatible placements and selected non-compliant pieces as specified in Version 3. These are intentional gameplay, not vulnerabilities. Validate settled versus actively selected state without silently changing the rules.
- Keep original imported references byte-for-byte unchanged. Put production fixes in application code. Add regression tests for demonstrated bugs; distinguish confirmed vulnerabilities, suspected risks and ordinary correctness defects.

## M1 and M2: local engine, images and persistence

- Validate inputs in the engine and persistence boundaries, not only UI controls. Enforce integer dimensions within the approved maximum of 15 rows by 20 columns, at most 300 pieces, supported orientations, valid IDs and bounded allocations. Minimum dimensions remain subject to the existing product decision.
- Validate saved state before applying it: supported schema, board/tray partition, unique pieces, valid indices, orientations, selection, edges and consistent dimensions. Reject or safely recover corrupt, oversized or unsupported saves without losing the last valid save. Never execute imported content or deserialize arbitrary objects.
- Make swaps, hints, moves and save updates atomic. Preserve no-lost/no-duplicate-piece invariants, keep preview separate from persisted gameplay, and test interrupted writes and migrations. Keep image deletion scoped to the intended collection item and its confirmed dependent puzzles.
- Treat picked, downloaded and generated images as untrusted. Define and enforce encoded byte, decoded pixel, dimension and processing limits; validate actual decode/format rather than trusting extensions or MIME labels. Handle malformed images, cancellation and memory pressure. Use maintained decoding components and bounded output sizes.
- Use application-controlled file names and storage locations. Never let image names, save contents or remote metadata select arbitrary filesystem paths. Bound temporary storage and clean up canceled/failed operations. Do not enable user-supplied SVG or other active formats without a separately reviewed need and restricted handling.
- Request only necessary platform permissions when needed. Keep guest photos and saves local by default; any upload must be explicit in the feature flow. Strip unnecessary sensitive image metadata from derived/shared/uploaded images. Exclude photos, prompts, tokens and personal information from routine logs.
- Test malicious or malformed inputs, excessive dimensions, truncated saves, duplicate IDs, invalid orientations, rapid repeated actions, cancellation and recovery. Record actual tests and remaining device/decoder limitations.

## M3-M5: accounts, services, generation and commerce

- No provider secrets, signing credentials or privileged API keys in app bundles, website scripts, source control or logs. Store session credentials using platform-appropriate protected storage. Keep service credentials on the backend and support rotation.
- Enforce authentication and per-object authorization on the server for every protected account, image, job, purchase and entitlement operation. Client flags, hidden buttons and local balances are not authority. Test cross-account access, expired sessions, logout and guest-data migration.
- Use HTTPS with normal certificate verification. Do not introduce production certificate-validation bypasses. Validate external navigation destinations and schemes. For any server-side URL retrieval, restrict destinations and redirects to prevent access to internal services.
- Make AI generation and allowance deductions idempotent and transactional. Bound requests, uploads, job concurrency and cost; enforce server-side quotas and rate limits. Failed generation must not deduct, and retries must not double-charge. Treat generated content as untrusted data.
- Verify purchases and subscription state through the chosen store's supported server verification mechanisms. Authenticate service callbacks, prevent replay/double grants, and handle expiry, refunds and revocation. Preserve the approved distinction between pack ownership and ad-free subscriptions.
- Gate rewarded hints on verified completion using the chosen ad integration's supported mechanism; prevent duplicate reward callbacks. Do not claim a local callback makes a modified client tamper-proof. Keep failed/canceled ads from mutating puzzle progress.
- Before enabling account deletion, verify authorization and require appropriate reauthentication; implement the documented deletion scope. Define retention, backups and consent/data handling for third-party services before integrating them.
- Review website forms and endpoints for input validation, output encoding, authorization, abuse limits and applicable CSRF protection. Use safe DOM APIs; do not insert untrusted HTML or ship development secrets/debug endpoints.

## Acceptance evidence and release gate

- Every milestone report must include security-relevant changes, tested failure/abuse cases, dependency findings and unresolved risks. Passing formatting, analysis and ordinary feature tests alone is not security sign-off.
- Review direct and transitive dependencies for known vulnerabilities and maintenance status when adopted and before release. Retain lockfiles, remove unnecessary packages, and keep production configuration separate from development fixtures.
- Maintain a short threat model covering local data, image input, account boundaries, generation costs, purchase/reward integrity and website exposure as those features become real. Add security checks to CI where they provide useful coverage, including secret detection and relevant dependency checks.
- Before release, verify production permissions, logging, backend access rules and signing/secret handling on actual build artifacts. Arrange independent security review for authentication, payments and public services. Fix exploitable critical/high findings before release; record other residual risks and decisions explicitly.
- Never report a command as passed if it did not start. An environment startup failure means the check is unverified; retry in a functioning environment and record the actual result. No claim of vulnerability-free software is permitted.

## Repository adoption

This updated handover does not modify the Windows repository or its imported source baseline automatically. In that repository, retain the archived imported handover unchanged, add this addendum as active guidance (for example, docs/security-requirements.md), and link it from DEVELOPMENT.md and the repository's applicable AGENTS.md. Subsequent implementation tasks must read and follow it. No M1 implementation is claimed by this update.
