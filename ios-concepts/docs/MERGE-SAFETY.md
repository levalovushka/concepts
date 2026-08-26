# Standalone repository migration receipt

Date: 2026-08-26

The native project is published independently at
[`vladshukurov/camo`](https://github.com/vladshukurov/camo). Its repository root
contains only the SwiftUI concept factory, native applications, iOS permission
runtime, reference profiles, launcher, developer documentation and tests.

## Verified migration

- Source branch: `codex/ios-concepts-additive` in `levalovushka/concepts`.
- Source checkpoint: `2b0f3f8`.
- Destination base before replacement: `0ae47f3`.
- First standalone destination commit: `61c90a5`.
- Migrated source tree: `802d21a57d0a22e530715bb6a88b0a8baca45257`.
- Destination tree after replacement: `802d21a57d0a22e530715bb6a88b0a8baca45257`.

The matching Git tree IDs prove that all 790 tracked native-project files were
copied exactly. Legacy `platform/`, HTML concepts, root prototype files and old
binary exports are absent from the destination `main`. They remain recoverable
from Git history but are not part of the current project tree.

## Isolation rules

- Normal commands never search for a neighbouring legacy platform.
- HTML evidence is accepted only through `native/legacy-adapter/` with an
  explicit `--legacy-root` path.
- `native/build`, `native/artifacts`, `DerivedData` and launcher build output are
  generated locally and ignored.
- Release links and packaging target `vladshukurov/camo`.
- `npm run isolation` reproduces contract gates in a clean standalone copy.
