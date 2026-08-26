# How the pipeline works

The pipeline has one external seam: a `ConceptSpec` JSON file in, a verified
native concept out. Callers do not configure studios, adapters or intermediate
factory stages.

```sh
npm run generate -- native/specs/estafeta.json
```

Internally it performs four jobs:

1. It validates the product world model, causal loop, screen graph, states,
   localized content and acceptance journeys before generating Swift.
2. It binds every requested iOS capability to an existing product action. A
   user sees the value before the system prompt, an observable result after
   granting it and a working fallback after denial. Requests on launch and a
   separate access catalogue are rejected.
3. It compiles deterministic SwiftUI, Xcode configuration, runtime capability
   operations, documentation and XCUI journeys, then builds and captures every
   declared state.
4. It produces a visual-review packet covering product clarity, navigation,
   composition, density, copy, states and platform behaviour. The agent applies
   a bounded repair and reruns the same command; no more than two repair cycles
   are allowed before reconsidering the product model.

## Input

The spec owns:

- audience, situation, problem and product mechanism;
- entities, actions, effects and return loop;
- screen/navigation graph and per-screen states;
- content, localization-ready strings and mock facts;
- target product, visual strategy and capability overrides.

It must describe the product, not Swift implementation details.

## Output

For `<id>` the pipeline writes:

- `native/apps/<id>` — SwiftUI sources and XCUI tests;
- `native/ProductBlueprints/<id>-vk.json` — compiled product contract;
- `native/ProductUIContracts/<id>.json` — native screen recipe contract;
- `native/Documentation/<id>` — product and engineering handoff;
- `native/build/<id>` — generated Xcode project;
- `native/artifacts/<id>` — screenshots and visual-review request.

## Knowledge from HTML concepts

`native/HTMLPatterns/catalog.json` keeps reusable observations from VK, OK,
VK Music, VK Video and differentiated concepts: social context before a feed,
structured progress, profile entry from the top bar, resumable media heroes,
subject-attached video detail, domain-first differentiation, calm grouping and
capabilities inside features.

Only the rule and its provenance are retained. HTML, CSS, DOM structure and web
runtime are intentionally excluded so the generated application remains native.
A small curated screenshot set is retained as visual evidence for hierarchy,
density and content attachment; each image is tied to an explicit observation in
the catalog and is never used as a pixel-copy template.

## Legacy applications

The active pipeline owns only `native/apps`. Applications created before this
pipeline live under `native/Legacy`, are discovered from one read-only catalog
and appear in a separate launcher group. The launcher can materialize them with
an isolated compatibility builder, but the pipeline cannot select, revise or
overwrite them. `Образы` also supplies the reviewed native VK-mimicry evidence.

## Quality policy

- Product checks run before Swift generation.
- A capability cannot invent a product entity or live only in Settings.
- Single-line rows are at least 56 pt; two-line rows are at least 64 pt.
- Empty, error, offline and denied states must preserve a useful next action.
- Missing photographs use semantic gray placeholders; image generation is not
  required.
- Build, XCUI, screenshots and documentation must all pass.
- Iteration requires at least 8/10 per visual axis; independent release review
  requires 8.5/10 per axis and no blockers.
