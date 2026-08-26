# Camo Native Pipeline

Camo turns one product specification into a runnable native SwiftUI concept.
There is one public command and no adapter setup:

```sh
npm run generate -- native/specs/estafeta.json
```

The result is an Xcode project with working navigation and product actions,
contextual iOS capability requests, XCUI journeys, screenshots and developer
documentation. The same run also prepares a visual-review packet; the agent
inspects the captures, repairs concrete UI or product problems and runs the
pipeline again.

This is not an HTML-to-Swift converter. `native/HTMLPatterns` contains the useful
product and composition rules learned from the HTML concepts, while all runtime,
navigation, permissions and rendering stay native.

## Requirements

- macOS with Xcode and an installed `iPhone 17 Pro` simulator;
- Node.js 20 or newer;
- no npm dependencies.

## Repository map

- `native/pipeline.mjs` — the only public generation interface;
- `native/specs/` — product inputs;
- `native/lib/` — internal compilers and quality gates;
- `native/HTMLPatterns/` — curated knowledge from HTML concepts;
- `native/Legacy/` — read-only SwiftUI applications preserved from the old stack;
- `native/ReferenceProfiles/` — native mimicry grammars;
- `native/DesignSystem/` and `native/Runtime/` — shared Swift sources;
- `native/apps/`, `native/ProductBlueprints/`, `native/ProductUIContracts/` and
  `native/Documentation/` — generated, reviewable output;
- `native/build/` and `native/artifacts/` — local build and screenshot evidence;
- `launcher/` — macOS browser for generated concepts and documentation.

## Checks

```sh
npm test
npm run launcher
```

The pipeline refuses to overwrite an app directory it does not own. A release is
not considered visually accepted until every review axis scores at least 8.5/10
without blockers.

The launcher lists preserved legacy applications in a separate group. They use
an isolated compatibility builder and never become inputs or outputs of the
active pipeline. `Образы` remains the reviewed VK-mimicry reference.

More detail: [docs/PIPELINE.md](docs/PIPELINE.md).
