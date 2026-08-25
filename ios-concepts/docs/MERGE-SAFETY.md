# Merge safety receipt

Date: 2026-08-25

## Provenance and scope

- Legacy main base: `61aa5e63e7eeca1be3641e81832f2c9c00905be1`.
- Imported native source commit: `0ae47f3c77e154b51ecd9a6b6c5a56c691dad32a`.
- Imported `ios-concepts/` source tree: `9c588e9e6e2d44c27211dbc79d03f669644d649e` (211 files before isolation adaptations).
- Imported `platform/launcher` source tree: `46771474116ba35b1d6bc28fb48063b24afd4b64` (8 files), relocated to `ios-concepts/launcher/`.
- Integration method: addressable tree import from main; no merge or cherry-pick of the feature branch.
- Allowed diff root: `ios-concepts/**` only.

The complete native source tree was imported first. The tracked machine-local
`docs/factory-readiness.json` from the source commit was then removed from
canonical source and ignored because it contained absolute machine-home build,
test and capture paths. Its generator remains available through `npm run
readiness`. The two legacy migration entrypoints were moved behind the explicit
`native/legacy-adapter/` seam. No tracked `native/build`, `native/artifacts`,
`DerivedData` or launcher build output was imported.

Tails/Today media required by the native build was copied, not moved, from the
unchanged legacy base into canonical project-owned paths under
`ios-concepts/concepts/*/assets/media`. Normal generation now resolves it only
inside the native project root.

## Tree invariants

- `platform` tree on base main before integration: `1a1189f9e29296af03bc9111bd1dbbf719d36fdf`.
- `platform` tree on the integration commit after integration: `1a1189f9e29296af03bc9111bd1dbbf719d36fdf`.
- Files outside `ios-concepts/` in `git diff --name-only 61aa5e63...`: none.
- Legacy files deleted, moved or edited by this integration: none.
- Canonical tracked macOS home-directory paths under `ios-concepts/`: none.

## Legacy baseline equivalence

`npm run check` was run from `platform/` in separate clean base-main and
integration checkouts. Both runs stopped with exit code 1 at the same known
legacy blocker and the same signature:

```text
rodnya: не готов к полной сборке
  · readiness.status: перед публикацией ожидается reviewed
  · readiness.visualPasses: нужны минимум 2 полных визуальных прохода
```

The integration neither fixes nor masks this blocker; no later legacy phase is
reached in either checkout.

## Native verification

- `npm test`: pass, 146/146 tests.
- `npm run check:all`: pass for all six native concepts, including developer-doc drift checks, generation, delivery, navigation, UI, capability, capture-contract and visual-language gates.
- Isolation stage inside `check:all`: pass in a standalone temporary copy with no parent `platform/`; the copy passed `npm test` and all non-Xcode `check:all` contract gates.
- `npm run profiles`: VK iOS ready; OK, VK Music and VK Video remain intentionally blocked for missing evidence and native profile contracts.
- `npm run build -- looks`: pass, Xcode simulator build succeeded.
- `npm run build -- dvor`: pass, Xcode simulator build succeeded.
- `npm run launcher` plus launcher macOS Xcode build: pass.
- `npm run legacy:audit -- --legacy-root ../platform`: adapter executed successfully and remained read-only.
- `npm run legacy:audit` without `--legacy-root`: expected fail-closed result.

Local run receipts use `$PROJECT_ROOT` placeholders and live in ignored
`native/artifacts/receipts`; they are not canonical evidence.

## Remaining risks and intentionally open gates

- Fresh simulator captures, XCUITest smoke/device matrix and the full `release` operation were not run in this integration.
- The imported independent visual audit was not re-performed; no new visual or product-review evidence is claimed here.
- Physical iPhone, independent product review and VoiceOver manual gates remain open by design.
- OK, VK Music and VK Video reference profiles remain blocked; only VK iOS is evidence-ready.
- Tails/Today media retains the source provenance warning that redistribution rights require separate evidence intake.
- Legacy main remains red on the pre-existing Rodnya readiness blocker described above.
