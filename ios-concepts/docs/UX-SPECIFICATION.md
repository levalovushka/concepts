# Canonical UX Specification

Product Contract defines what mature product is worth delivering. UX Specification
defines enough product and interaction semantics for another implementation model to
reproduce the native application without reading SwiftUI as the specification.

The compiler interface is:

```js
const result = compileUXSpecification(concept, productContract);
```

Native compilation supplies already-normalized surfaces, actions, permissions and
semantic design tokens through an internal options object. The returned
`uxSpecification` is embedded in `native-manifest.json` and written separately as
`native/build/<slug>/ux-specification.json`. Its content hash becomes a stable
`uxSpecificationId` linked to the Product Contract id.

## What the specification owns

### Navigation graph

Every surface is a node with a `root/tab/push/sheet/cover/system/external/state`
presentation, parent, all entries and exits, guards, and explicit back/dismiss
semantics. Edges record root-tab, parent presentation, action, permission, and optional
deep-link entry. The compiler recomputes reachability from roots and edges rather than
trusting a declared list; orphan nodes, missing transitions/parents, broken deep links
and missing back/dismiss destinations block delivery.

### State semantics

Every surface declares all canonical states:

```text
loading · populated/default · empty · error · offline
permission-needed · permission-denied · permission-restricted · permission-limited
```

Each state is either applicable with localized content keys, available actions,
transitions, recovery and fixture ids, or explicitly not applicable with a reason.
Product-specific variants such as `joined`, `stale`, `transcribing`, or `cancelled`
map to one canonical state without losing their own fixture identity.

### Design semantics

The specification carries the exact semantic token map fed into generated
`NativeConceptSpec.design`, plus component-role ids per surface. Generated Swift exposes
the same roles; `NativeVisualLanguage` remains the runtime environment consumed by
SwiftUI. The UX document never describes a Swift view hierarchy and contains no
HTML/CSS/DOM mapping.

### Localization

All contract-level user-facing copy has a stable key and Russian source, plus
placeholders, pluralization metadata, context, screens and usage. Screens, state copy,
actions, tabs, permission explanations, recovery and acceptance names refer to keys.
A recursive gate rejects Russian user-facing strings outside the catalog. Product
fixture values are content data and are explicitly excluded from UI localization copy.

### Acceptance scenarios

Scenarios use a small deterministic Given/When/Then-style DSL. Every critical flow must
cover happy path, failure/recovery, offline, and persistence/return. Every permission
must cover denial and the declared fallback. References to missing screens, actions or
fixtures fail compilation. This is executable product semantics for replay adapters;
it is not coordinate-based XCUI automation.

### Fixtures

Every captured state and every fixture-referenced acceptance state has deterministic
ids, realistic Russian content, long-copy/numeric/AXXXL edge cases and provenance.
When media is present, asset role, source and license boundary are mandatory. Missing
fixture or media provenance is a blocker.

## Explicit product delivery

A new `mature` Product Contract must provide explicit `concept.ux` sections for
navigation, screens/states, design, localization, acceptance scenarios and fixtures.
The compiler validates and canonicalizes them; it will not silently derive a new
application from names and defaults.

Looks and Dvor now provide explicit `concept.ux` sources compiled from their selected
Product Contracts and current UI/action contracts. Their specifications include:

- all screen graphs and canonical state applicability are explicit;
- every existing captured variant and every acceptance-tested recovery state has a fixture;
- fixtures contain deterministic representative Russian content, not claimed research;
- existing repository media records that external redistribution clearance still
  requires separate evidence intake;
- fixture provenance is `curated-product-fixture`, not legacy or production data.

The migration derivation remains an allowlisted compatibility path for older concept
files, but current Looks and Dvor do not use it.

Generated `concepts/<slug>/docs/*.md` files include the graph, full state
handling matrix, tokens/roles, complete string catalog, scenario table and fixture
catalog together with Product Contract delivery documentation. Check mode compares it
byte-for-byte with compiler output and blocks drift before project generation/build.
