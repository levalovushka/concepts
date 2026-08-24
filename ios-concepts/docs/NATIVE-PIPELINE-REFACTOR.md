# Native pipeline refactor

## Target seam

```text
concept.json
  → compiled product/surface/action contracts
  → product state driver
  → NativeVisualLanguage adapter
  → shared SwiftUI primitives + profile recipes
  → real runtime screen
  → interaction replay + screenshot audit
```

The capture harness drives the same state seam as the product. It must never
replace a real screen with a context-free verification view.

## Completed foundation

- `NativeVisualLanguage` owns semantic palette, spacing, metrics, type, chrome
  and icon roles.
- VK reference и нативная системная грамматика являются concrete adapters.
  Looks и Dvor намеренно используют VK-mimicry; отдельного текущего
  differentiation-концепта пока нет.
- `NativeVisualLanguage` is the only environment seam; `Theme` and
  `DvorStyle` compatibility projections have been removed.
- Shared action and feedback primitives own loading, disabled, hit-target,
  optical weight and accessibility behaviour.
- Action contract v3 owns the exhaustive semantic variants, placement rules,
  enablement, async fallback and post-adapter product mutation. The generated
  Swift catalog is consumed by contract-bound Looks controls.
- Looks interaction replay covers all 12 primary actions plus the dependent
  check-in flow, with executable outcome assertions for navigation, async
  failure/retry/success/fallback and local persist/restore.
- Отдельно запускаемые generated `LooksSmokeTests` и `DvorSmokeTests` покрывают
  реальный hit-testing, accessibility labels/hit targets, критический Dynamic
  Type, навигацию и permission seam entry.
- All seventeen app-owned Looks surface families now receive state through their real screens:
  Home, Search, Chats, Notifications, Wardrobe, Nearby, Services, Create,
  Mates, Lock, Talk, NetQR, Phone, Code, CodeFail, Event and Check-in.
- Capture ownership is exhaustive: every multi-state surface is classified as
  product, pending product migration, system or extension. The generated Swift
  ownership adapter prevents generic capture presentations from intercepting
  product-owned screens.
- The mandatory visual-language audit blocks new local token enums, duplicate
  theme environments and growth of hardcoded app colors.
- Повторяющиеся chrome-иконки проходят через semantic roles. VK-mimicry root
  tabs материализуют pinned Lucide vector assets, при этом системный SwiftUI
  `TabView` и Liquid Glass остаются владельцами tab chrome.
- Двухустройственная матрица (`iPhone 17 Pro`, `iPhone 16e`) воспроизводит smoke
  и 18 целевых кадров для Looks и Dvor.
- Factory-readiness report разделяет automated confidence и human
  visual/product score; зелёная автоматика не выставляет 10/10.

## Migration status

Measured on 2026-08-24:

- 0 Swift source files read `Theme` (baseline: 22).
- 0 Dvor call sites use `DvorStyle` (baseline: 93).
- 0 app-local `Color(hex:)` occurrences remain in Looks (baseline: 5).
- No app-owned Looks presentation uses the synthetic capture-state path.
  `CaptureStates.swift` is now limited to OS-owned and extension-owned surfaces.
- Authentication persists the last successful account and the existing
  `Session` persists sign-in. Event participation, venue-network connection and
  check-in are product-store mutations backed by `UserDefaults`; calendar and
  location/Wi-Fi access continue through real iOS permission adapters.

## Next stage

1. Закрыть physical iOS и VoiceOver manual checklist с device metadata и
   evidence bundle.
2. Провести независимый human visual/product review current/small-phone captures.
3. Добавить следующий reference adapter только после полного evidence intake;
   VK Music, VK Video и OK не выводятся из Looks/Dvor по догадке.

## Definition of factory-ready

- No app-local visual token containers or hardcoded brand colors.
- No synthetic capture presentation for an app-owned surface.
- Every action produces a route, mutation, permission request, persistence or
  explicit system handoff and is replay-tested.
- Every profile has evidence, token extraction, component recipes, motion notes
  and a complete capture matrix.
- Builds, captures and visual/product gates pass for all concepts from a clean
  generated project.
