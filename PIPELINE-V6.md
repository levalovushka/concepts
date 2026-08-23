# Pipeline v6: product spec to native product

Status: **working implementation plan**. It evolves v5 without replacing `concept.json`.

## Outcome

One confirmed product concept produces a native SwiftUI application whose product logic, navigation, capabilities, states, and design quality are independently verifiable.

```text
phrase
  -> confirmed brief
  -> concept.json
  -> native compiler
  -> blocking surface contract
  -> native manifest
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

## Source of truth

`concept.json` remains the source of truth. It is migrated from a web-oriented document into a platform-neutral product specification with an explicit native section.

It owns:

- audience, problem, promise, distinctions, non-goals, core loop, and vertical slice;
- product surfaces, their purpose, native presentation, states, and transitions;
- navigation roles and tab membership;
- permission features, request gestures, fallback behaviour, and review notes;
- design strategy, reference profile or differentiation character, semantic tokens, density, and accessibility contract.

It does **not** own raw `.pbxproj` structure, entitlement syntax, framework imports, or extension boilerplate. Those are compiler knowledge.

## Deep modules

### Native compiler

Interface:

```js
compileNativeConcept(concept, platformCatalog) -> NativeManifest | diagnostics
```

The compiler validates the product graph, resolves capabilities, normalises native presentations and states, and produces the only input consumed by generators and gates.

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

1. Product brief is complete and distinctions are observable in named surfaces.
2. Every product surface has a purpose, reachable transition, native presentation, and required states.
3. Every non-system surface compiles to one bounded composition contract; fallback dashboards and accidental component families are blocking.
4. Every permission resolves to a supported capability plan and one product gesture.
5. Generated `Info.plist`, entitlements, background modes, targets, and frameworks equal the native manifest.
6. Navigation in the built application equals the manifest; drift is blocking.
7. Every interactive element performs an action or is explicitly disabled with a reason.
8. Accessibility labels, Dynamic Type, contrast, reduced motion, and 44-point hit targets pass.
9. Every declared state is captured from a fresh build.
10. Critic checks product relevance, design strategy, visual defects, and interaction coherence; failed surfaces return to implementation.

## Migration order

1. Introduce compiler, capability catalog, diagnostics, and tests while reading the current schema.
2. Add native fields to `looks/concept.json`; generate a checked native manifest.
3. Make navigation and screenshot catalogs consume the manifest.
4. Generate real main-app capabilities, then extension targets; make unsupported gaps fail honestly.
5. Replace default-success permission behaviour with explicit runtime adapters and test adapters.
6. Split the VK reference implementation from Looks product data; add the differentiation adapter.
7. Add state capture and critic orchestration.
8. Migrate the remaining concepts incrementally; legacy HTML fields may remain readable during migration but cannot drive native output.

## Definition of done for a concept

A concept is native-ready only when its manifest compiles without diagnostics, the Xcode project builds without project warnings, capability and navigation gates pass against build artifacts, every declared state has a current screenshot, all interactions are live, and the critic verdict is clean.
