# Streamlined native concept factory

## Outcome

The primary iOS factory path optimises for one result: a coherent native app that a developer can run and understand without manually redesigning it. The legacy staged factory remains available for reproducibility of existing artifacts, but is no longer the default path for a new concept.

## External interface

```js
runLeanNativeFactory({ request, architect, builder, reviewer })
```

The caller supplies a short request and three real adapters. Internally the module owns validation, the target profile, VK grammar, the complete capability pool, timing and failure receipts.

## Current executable boundary

`npm run native:lean -- <slug> --build` compiles and verifies an existing Product Blueprint. Add `--prove` to reuse that fresh build and capture the blueprint's core evidence screens with runtime identity, safe-area, horizontal-boundary, PNG freshness and duplicate-pixel checks. The command writes `native/artifacts/<slug>/shots/core-proof.json` and deliberately marks independent visual review as required.

The compiled-blueprint command is not evidence of cold generation from a short request. Cold production has a separate command below and remains **pilot** until one fresh uncached run reaches handoff with zero manual edits.

## Cold production command

`npm run native:cold -- --prompt "<short product request>" --target vkontakte --strategy mimicry`

The command hides the complete production composition behind one interface: three product ideas, independent idea selection, deterministic Product Blueprint completion, SwiftUI generation, shared-runtime audits, Xcode build, XCUI smoke, core captures and independent pixel review. A successful process exit is developer-handoff evidence; a build without interaction or visual receipts is not.

The first uncached run must still be benchmarked before readiness moves beyond **pilot**. The command persists every bounded artifact and stage timing under `native/FactoryRuns/<request-id>` so speed and quality failures cannot disappear into console output.

## Four physical stages

1. **Product architecture** — one bounded operation explores alternatives internally and returns one Product Blueprint. The blueprint contains the product world, core loop, navigation, actions, screen states, content, capability journeys and acceptance scenarios.
2. **Reference composition** — deterministic. Mimicry binds the Product Blueprint to the executable VK UI kit calibrated from «Образы». Differentiation binds it to the restrained native system kit. No model invents a third style.
3. **Native build** — one bounded operation creates SwiftUI implementation files. Deterministic tooling formats, compiles, launches and captures them.
4. **Delivery proof** — one independent review of real screens and interactions. A failure returns file/screen/action blockers. It never starts a whole-app rewrite loop.

## Removed from the default path

- a separate model call for discovery;
- iterative generation of Experience Contract topology;
- generated visual directions for VK mimicry;
- three complete renderer retries for formatting or compiler errors;
- full capture matrices before the first visual preview;
- self-scoring and averaged quality scores;
- capabilities treated as product ideas.

## Product Blueprint rules

- The product must make sense without naming an iOS capability.
- VK mimicry requires authored social content, stable identity, a feed, at least two feedback modes and a return loop.
- Every visible action belongs to an entity and declares a deterministic result.
- Every screen declares default, loading, empty, error and offline behaviour; permission states are declared only where relevant.
- `capabilityPolicy: all` binds every capability in the selected target profile. User-consent capabilities have contextual granted/denied journeys. Platform capabilities have configuration, lifecycle and observable-result proofs.
- A capability binding owns `outcome.entityId`, `outcome.stateField` and `outcome.proof`. The factory accepts only the complete chain `gesture → authorization → system operation → entity-owned state → visible/persisted proof`; a granted permission, toast or label is not delivery evidence.
- The renderer consumes the Product Blueprint and Reference UI kit without adding screens, tabs, filters or actions.

## Failure policy

A stage is run once. Structural output errors are normalised deterministically when meaning is unambiguous (Swift formatting, stable ids, known reference tokens). Product meaning is never auto-repaired. A failed product, build or review returns a compact blocker receipt and a resumable artifact.
