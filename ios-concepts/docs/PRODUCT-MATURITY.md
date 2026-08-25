# Product maturity before SwiftUI

The native pipeline does not accept a raw idea as product intent. Its product seam is:

```text
Product Brief
  → model/generator adapter
  → 3+ materially different Concept Candidates
  → Product Stress Test + deterministic hard gates
  → Selection Receipt
  → canonical Product Contract
  → canonical UX Specification
  → native compiler and developer guide
  → SwiftUI delivery
```

The external module interface is deliberately small:

```js
const result = await developProductConcept({ brief, generator });
```

The generator adapter implements one method, `generateCandidates({ brief, rubric })`.
It may call a real model, an approved internal generator, or an explicitly labelled
fixture. Camo has no default candidate generator and never fabricates model output.
`createStructuredModelProductGenerator({ model })` adapts a real structured-output
client without coupling the maturity module to a provider SDK.

## Inputs and schemas

Machine-readable schemas live in `native/schemas/`:

- `product-development.schema.json` — the complete reproducible artifact embedded by a concept;
- `product-brief.schema.json` — audience, situations, constraints, reference family/profile, permissions and candidate count;
- `concept-candidate.schema.json` — thesis, insight, job, wedge, observable difference, value/supply/social/cold-start/loops/retention/trust/privacy/business/evidence and delivery obligations;
- `selection-receipt.schema.json` — the stable comparison and rejection record;
- `product-contract.schema.json` — the only product input allowed into new native delivery.

Runtime validation is deterministic and emits stable diagnostic codes. JSON Schema is
the adapter contract; runtime gates add relationships JSON Schema cannot express, such
as exact permission grounding, reference readiness, evidence references, candidate
diversity, and the minimum-axis rule.

## Selection and maturity

Every candidate is scored independently on 15 axes from 0–4. Every axis must be at
least 3. Selection first removes every candidate with a schema error, hard-gate
failure, or low axis. Among survivors it maximises the minimum axis; total score is
only a tie-break after all floors pass, then candidate id stabilises the result.

Hard gates block:

- a generic feed/chat/profile bundle without a causal wedge;
- decorative or unmeasurable differentiation;
- permissions without product value, request moment, flow and denied fallback;
- a first session with no value, seed supply, or empty-state action;
- a content model without cold-start and ongoing supply, incentives and controls;
- a core loop without a metric, test plan and non-assumption evidence provenance;
- mimicry that does not map product entities/behavior to the reference mental model;
- a reference profile whose own evidence package is incomplete;
- insight or differentiation supported only by unvalidated assumptions;
- any Product Stress Test axis below 3/4.

The stable Selection Receipt records the winner reasons and explicit rejection reasons
for every alternative. It has no timestamp; its id is a canonical-content SHA-256
prefix. The Product Contract points back to that receipt and candidate. `product:verify`
re-runs comparison from the Brief and Candidates, then reproduces the complete Receipt
and winner Contract; a self-consistent replacement hash cannot hide drift.

## CLI

```bash
# Real adapter module must export `productGenerator` or default.
npm run product:develop -- path/to/product-brief.json \
  --adapter path/to/real-model-adapter.mjs \
  --out path/to/product-development.json

npm run product:verify -- path/to/product-development.json
npm run product:verify -- concepts/looks/concept.json
npm run product:gate -- looks
npm run docs -- looks
npm run docs:check -- looks
```

The reproducible fixture is under `native/fixtures/product-development/`. Its adapter
is named `fixture-generator.mjs` and explicitly disclaims research/model status. The
committed artifact demonstrates a stable receipt, a winner, two axis-specific
rejections, and canonical contract compilation. `weak-brief.json` demonstrates that a
weak request is rejected before an adapter call.

## Native and documentation integration

`product maturity <slug>` is the first step of compile/check/build/capture/smoke/matrix
and release plans. The compiler resolves and reproduces the embedded Product Development
artifact, so calling the compiler script directly cannot bypass maturity or substitute a
self-consistent contract. It then calls the mandatory UX compiler and writes
`selection-receipt.json`, `product-contract.json`, `ux-specification.json` and `native-manifest.json`
into the generated build directory. The UX contract and its blocking rules are described
in [UX-SPECIFICATION.md](UX-SPECIFICATION.md).

`developer docs <slug>` runs before generation/build readiness. The generated
`concepts/<slug>/docs/*.md` are compiled from the same Product Contract, UX
Specification and native manifest. Missing data blocks generation; check mode compares bytes and blocks
drift. The guide covers product/scope, glossary, jobs, loops/flows, IA, screens/states/
actions, permissions and build capabilities, architecture/data, all recovery states,
privacy/trust, accessibility/localization, analytics, testing/evidence/capture, setup,
file ownership, limitations, risks, acceptance criteria and App Store notes.

## Looks and Dvor product selection

Looks and Dvor now contain complete embedded Product Development artifacts. Each has
one Product Brief, three materially different curated candidates, a reproducible
Selection Receipt, and a `mature` Product Contract. Their receipts explicitly reject
the weaker alternatives on failed stress axes.

The portfolios are a human-curated review of accepted scope and observable native
behaviour. Their evidence entries do not claim model generation, interviews, market
demand, supply, retention, or business validation. Future product discovery should
replace assumptions with traceable intake and may re-run the same interface through a
real structured-output model adapter. The allowlisted migration path remains only for
compatibility with older concept files.

## Honest boundary

Automation can prove structure, provenance links, deterministic selection, reference
profile readiness and native delivery consistency. It cannot originate a good insight,
interview users, validate supply, prove retention, or judge whether model rationales are
true. Those require a real model connected through the adapter and real evidence intake
with traceable sources. VK Music, VK Video and OK remain blocked until their independent
reference evidence packages are complete; VK evidence never transfers to them.
