# Pipeline v6: product spec to native product

Status: **implemented native delivery contract**. Looks and Dvor remain explicit
migration baselines; new products enter through a Product Brief.

## Outcome

One mature selected product produces a native SwiftUI application whose product logic,
interaction semantics, navigation, capabilities, states, and design quality are independently verifiable.

```text
Product Brief
  -> real model/generator adapter
  -> 3+ Concept Candidates
  -> Product Stress Test + hard gates
  -> Selection Receipt
  -> canonical Product Contract
  -> canonical UX Specification
  -> native compiler
  -> blocking surface contract
  -> native manifest
  -> checked developer guide
  -> contract-driven Swift/Xcode generation
  -> build gates
  -> state capture
  -> critic loop
  -> reviewable app
```

The pipeline supports two design strategies:

- **mimicry** uses an evidence-backed reference profile and must preserve the reference's recognisable information architecture, compositions, behaviour, density, and components;
- **differentiation** derives a coherent visual grammar from the audience, promise, content model, core loop, and desired product character.

Both strategies share the same product, native, accessibility, interaction, and quality gates.

## Canonical specifications

The selected Product Contract owns product truth. The UX Specification owns product
and interaction semantics needed to implement it reproducibly. `concept.json` binds
those contracts to native delivery. Looks and Dvor may derive migration-baseline
contracts from their existing files, but this exception is allowlisted and labelled.

Together they own:

- audience, problem, promise, distinctions, non-goals, core loop, and vertical slice;
- the complete reachable screen graph, presentation, parentage, entry/exit,
  guards, deep links and back/dismiss semantics;
- every canonical loading/populated/empty/error/offline/permission state, its
  content, actions, transitions, recovery and explicit applicability;
- navigation roles and tab membership;
- permission features, request gestures, fallback behaviour, and review notes;
- design strategy, reference profile or differentiation character, semantic tokens, density, and accessibility contract;
- localization catalog, semantic component roles, executable acceptance scenarios
  and deterministic fixtures for captured/tested states.

It does **not** own raw `.pbxproj` structure, entitlement syntax, framework imports, or extension boilerplate. Those are compiler knowledge.

## Deep modules

### Native compiler

Interface:

```js
compileNativeConcept(concept, platformCatalog) -> NativeManifest | diagnostics
```

The compiler revalidates product maturity, calls `compileUXSpecification`, resolves
capabilities, normalises native presentations and states, and produces the only input
consumed by generators and gates. Missing UX semantics are diagnostics, never defaults.

### Product maturity

```js
developProductConcept({ brief, generator }) -> development artifact | blocked receipt
```

The external generator produces structured candidates. The module validates them,
applies non-averaged stress floors and hard gates, records explicit rejection reasons,
and compiles exactly one canonical Product Contract. There is no fake model fallback.

### UX compiler

```js
compileUXSpecification(concept, productContract) -> UXSpecification | diagnostics
```

It owns graph reachability, state/action transition closure, localization closure,
semantic design roles, acceptance coverage and fixture/media provenance. SwiftUI is
an adapter layer; the UX contract contains neither Swift view code nor web mapping.

### Capability catalog

Interface:

```js
resolveCapability(permissionKey, buildContext) -> CapabilityPlan
```

A capability plan describes required usage strings, entitlements, background modes, extension targets, frameworks, runtime adapter, simulator support, and verification method. Unknown or unsupported capability plans are build errors; no adapter may report success by default.

### Design strategy

Interface:

```text
DesignIntent + ProductSurface -> SurfaceContract
```

Mimicry and differentiation are adapters at this seam. Both return a measurable surface contract: composition, hierarchy, density, token roles, allowed components, interaction states, and reference evidence.

For quality-contract v2, generation has no generic escape hatch. Every non-system surface must select a proven product-role or screen-pattern recipe, name one primary action, define primary and secondary regions, cover typical/stress/failure content, and intentionally select component families allowed by that recipe. Unknown compositions, decorative families not earned by the task, and more than the recipe's allowed prelude layers are compilation errors—not critic suggestions.

Reference profiles are registered by stable IDs rather than file paths. A mimicry build is blocked while its profile is `awaiting-evidence`; the pipeline must never invent a named product's visual grammar. The initial family is `vk-ios`, `vk-music-ios`, `vk-video-ios`, and `ok-ios`. Only `vk-ios` is ready today; the other profiles have explicit screenshot capture plans.

### Quality runner

Interface:

```text
verify(build, nativeManifest) -> GateReport
```

It verifies the final build artifacts—not source-code strings—and captures every declared product state. A critic pass is accepted only after deterministic gates pass.

## Gates

1. Product Brief is complete and yields at least three materially different candidates.
2. No candidate may pass a generic/decorative wedge, incoherent permissions, empty cold start/supply, unproven loop, untestable difference, or failed reference fit.
3. Every Product Stress Test axis passes its floor; an average cannot mask failure.
4. Every screen is reachable and every action/entry/exit/back/dismiss transition closes.
5. Every canonical state is fully specified or has a justified non-applicability.
6. Localization, critical-flow/permission scenarios and captured/tested fixtures are closed sets.
7. Every non-system surface compiles to one bounded composition contract; fallback dashboards and accidental component families are blocking.
8. Every permission resolves to a supported capability plan and one product gesture.
9. Generated `Info.plist`, entitlements, background modes, targets, and frameworks equal the native manifest.
10. Developer documentation must be complete and byte-identical to regenerated output before build readiness.
11. Navigation in the built application equals the manifest; drift is blocking.
12. Accessibility labels, Dynamic Type, contrast, reduced motion, and 44-point hit targets pass.
13. Every declared state is captured from a fresh build.
14. Critic checks product relevance, design strategy, visual defects, and interaction coherence; failed surfaces return to implementation.

## Migration order

1. Looks and Dvor compile deterministic migration-baseline Product Contracts and UX Specifications from existing native source data.
2. They do not receive invented multi-candidate receipts, market evidence or transferred reference evidence.
3. The next substantive redesign replaces derivation with a real Product Brief,
   model-generated candidates, evidence intake and explicit `concept.ux` source.
4. No other concept slug may use migration-baseline status.
5. Legacy HTML may remain readable as migration material but cannot drive native output.

## Definition of done for a concept

A concept is native-ready only when maturity passes, Product Contract and UX
Specification compile without diagnostics, developer documentation has no drift, the
Xcode project builds without warnings, capability and navigation gates pass against
build artifacts, every declared state has a current fixture and screenshot, all
interactions are live, and the critic verdict is clean. Market truth, independent
reference evidence, physical-device behaviour and VoiceOver still require external evidence.
