# Cold-run evaluation: «Свои»

## Outcome

The run correctly stopped before materialising an invalid native application. It is not ready for developer handoff.

## Timing

| Stage | Time | Assessment |
|---|---:|---|
| Three product proposals | 61.5 s | Acceptable, but can be parallelised or reduced to two when confidence is high |
| Independent product evaluation | 40.1 s | Useful and materially improved selection |
| Product Blueprint expansion | 296.9 s | Too slow; documentation-shaped fields must be derived instead of authored by the model |
| Complete product stage | 398.5 s | Too slow for flow production |
| First renderer attempt | 135.2 s | Invalid Swift statement boundary |
| Second renderer attempt | 151.5 s | Invalid Swift statement boundary |
| Renderer after compact context | 207.0 s | Valid structured bundle, but omitted every pipeline-owned runtime seam |
| Cached resume to the same failure | < 0.1 s | Resume/cache works correctly |

## Quality by layer

| Layer | Score | Evidence |
|---|---:|---|
| Product idea | 8.8/10 | A coherent VK-like authored feed built around public commitments, concrete help, progress, proof and continuation; independent axes were 8.8–9.5 |
| World model and UX specification | 8.4/10 | 15 screens, explicit actions, states, fixtures, localization and 22 capability contracts; deterministic normalisation repaired 49 cross-reference defects |
| Developer documentation | 9.0/10 | 13 drift-audited physical files; largest file 14 KB; product, graph, states, copy, fixtures, design, acceptance, accessibility, privacy and capability outcomes are covered |
| Swift renderer | 1.5/10 | Both independent outputs ignored `NativeEmailAuth`, `NativeVisualLanguage`, `CaptureIdentity`, `Permissions.request` and Lucide tab assets |
| End-to-end pipeline | 3.5/10 | Strong idea and handoff specification, but no compilable or reviewable application was produced |

## Root cause

The renderer is responsible for two incompatible jobs: product-specific SwiftUI composition and mandatory platform infrastructure. Prompt instructions do not reliably enforce infrastructure, even after the renderer context was reduced by one third and the non-negotiable checklist was moved first.

## Required refactor before another cold app

1. Compile the app shell deterministically: auth/session restoration, `TabView`, Lucide tab assets for VK, theme environment and capture instrumentation.
2. Compile capability adapters and granted/denied test harnesses from the capability graph. The model supplies product gestures, bindings and outcome presentation only.
3. Ask the model for product modules, not an entire application: data reducers, screen bodies and action handlers behind closed protocols.
4. Derive documentation prose, analytics, privacy and standard accessibility requirements deterministically from the world model; reserve model tokens for product semantics.
5. Compile XCUI skeletons from acceptance action IDs and let the model fill only product-specific assertions.
6. Run `swift-format`, typecheck and contract audits per module before the expensive full simulator build.

## Regression status

`npm test`: 242 passed, 0 failed.

