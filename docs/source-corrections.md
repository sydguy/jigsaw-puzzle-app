# Owner-approved source corrections

## Mobile Photo Gallery — 28 September 2026

The owner explicitly authorized replacing the truncated current mobile Photo Gallery
reference and retaining the previous bytes for traceability. This is a specific
exception to baseline immutability, not permission to alter other imported designs.
Existing M1 implementation work is retained. No Flutter layout correction is to be
derived from the truncated image.

| Role | Path | Bytes | SHA-256 |
|---|---|---:|---|
| Current visual authority | [mobile Photo Gallery](../references/mobile/mobile-photo%20gallery.png) | 1841710 | 0bded31a56ba020144af985f8dff2b02582101a0b207ebec3e8578571d0ca6d6 |
| Archived original | [superseded mobile Photo Gallery](../references/superseded/mobile/mobile-photo%20gallery.png) | 1376256 | 4bab85a14ddbdfe6a71e10dc877f8180ea25d6194e69c6ae739591a39306bf9f |

Replacement supplied as `G:/jigsaw/pics/Mobile/mobile-photo gallery.png` and copied
byte-for-byte. The complete image shows four source choices, Photo Gallery selected,
a three-column image grid, selected-photo feedback and the bottom Add Selected Image
action. The scenic thumbnails remain visual reference material, not a supplied
production photo catalogue. Camera, AI and curated content are still later milestones.

Updated SCREEN_UPDATES.csv, the SHA-256 text file checksums.json, source-inventory.md
and source-baseline.json. The source manifest now records 109 files, including the
archived original. The original source ZIP, original imported handover, prototype,
website and all other images remain unchanged. Historical M0 reports keep their
original 108-file result; verification now reports matches against the approved
current baseline rather than claiming all original paths are unchanged.

The verifier also rejects non-scalar path/hash records. This catches nested-array
serialization mistakes instead of silently reporting an incorrect record count.
