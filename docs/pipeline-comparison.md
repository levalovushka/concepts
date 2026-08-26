# Swift native factory vs HTML concept pipeline

Date of source review: 2026-08-26.

This note describes what the repository actually executes. It distinguishes the current default native path from compatibility paths and does not treat a documented aspiration as an implemented guarantee.

## Executive conclusion

> Update on this branch: the V2 implementation described near the end of this
> document now exists under `ios-concepts/native/lib/*-v2.mjs`. It adds the
> human selection pause, Product Core v2, capability grounding, an accepted
> three-surface slice, a deterministic Swift Kernel, bounded local repair and a
> typed full-expansion contract. The historical comparison below remains useful
> because it explains why the previous default Swift path was unpredictable.

The two systems do not merely target different rendering technologies. They put the generative model on opposite sides of the most important boundary.

- In the HTML path, the model/person authors a constrained specification, small screen fragments and concept CSS. The page shell, iOS-like chrome, interaction engine, permission state machine, composition of the final artifact, navigation extraction and most acceptance checks are deterministic shared code. The intended loop is deliberately incremental: product proof, a three-screen vertical slice, render, inspect every PNG, fix, render again, then run browser tests and layer lint.
- In the current Swift cold path, models first invent and select the product, then one renderer model returns the app's Swift source and XCUI source as strings in one bounded operation. Deterministic code validates contracts, formats the source, injects some shared shell behavior, generates the Xcode project, builds, tests and captures it. A separate vision model reviews the result, but the default lean pipeline has no implementation-revision loop: each stage runs once and failure produces a blocker receipt.

That architecture explains the observed quality gap. HTML reduces the model's degrees of freedom and makes visual correction cheap and early. Swift asks one model call to satisfy product semantics, Swift syntax/type rules, SwiftUI composition, native runtime seams, capabilities, accessibility identifiers and executable XCUI coverage simultaneously; visual feedback arrives only after the complete app has compiled and run. The native contracts are much stricter on paper, but most of them reject bad output rather than steer it toward a good output.

The repository itself classifies cold Swift generation as a **pilot** until a fresh uncached run reaches handoff with zero manual edits, and says the first uncached run still needs benchmarking (`ios-concepts/docs/LEAN-NATIVE-FACTORY.md:15-27`). The native refactor backlog also says that a real structured-output generator and independent human visual/product review are still missing (`ios-concepts/docs/NATIVE-PIPELINE-REFACTOR.md:84-94`). Therefore unpredictability is not just an impression; the repository documents the same readiness gap.

## What “generation” means in each branch

### HTML

`PLAYBOOK.md` is explicitly an instruction file for a neural model (`PLAYBOOK.md:1-5`), but `platform/` contains no model client or autonomous generation orchestrator. The executable tools scaffold, compile and verify files that an author or agent has already written. The two-step interaction is also explicit: first three product variants and a human choice, then expansion into the full concept and verification (`PLAYBOOK.md:38-53`).

So the actual HTML generator is a hybrid:

1. Human/agent reasoning guided by the playbook.
2. Deterministic scaffold and shared kernel.
3. Human/agent-authored `concept.json`, `screens/*.html`, `styles.css` and narrative docs.
4. Deterministic build, screenshots, audits and browser flows.
5. Manual visual feedback loops, whose receipts are machine-gated.

### Swift

The repository has two native paths:

- The current default for a new product is `runLeanNativeFactory({ request, architect, builder, reviewer })`; the older staged `runFactoryPipeline` is compatibility-only (`ios-concepts/docs/ARCHITECTURE.md:1-10`).
- For already-authored native concepts, `runNativePipeline({ operation, slug })` performs maturity/compile/docs/delivery/generation/audit/build/capture/critic stages (`ios-concepts/native/lib/native-pipeline.mjs:37-94`). This is a delivery pipeline, not cold product generation.

The cold command is `npm run native:cold -- --prompt ... --target ... --strategy ...` (`ios-concepts/docs/LEAN-NATIVE-FACTORY.md:21-27`; `ios-concepts/native/lean-cold-cli.mjs:14-45`). It imports three adapters—architect, builder and reviewer—and persists bounded receipts (`ios-concepts/native/lean-cold-cli.mjs:47-115`). The default Codex adapter actually creates four model clients: idea generator, independent evaluator, Swift renderer and vision critic (`ios-concepts/native/adapters/codex-lean-native.mjs:17-46`).

## HTML pipeline, stage by stage

### 1. Input and human selection

Required input is a target permission set and positioning strategy; theme is optional (`PLAYBOOK.md:38-45`). The first output must be three distinct niches plus permission-organicity scoring, and generation pauses for selection before expanding (`PLAYBOOK.md:47-49`). This is a real human checkpoint before expensive implementation.

### 2. Product development before full UI

The playbook says the first version is always a draft and explicitly defines critique as a repeated `find → fix → recheck from zero` loop (`PLAYBOOK.md:28-34`). A three-screen `entry → action → result` vertical slice must be accepted before the 12–15-screen IA is expanded (`PLAYBOOK.md:213-217`). Full UI is likewise delayed until the slice has been product- and visually accepted (`PLAYBOOK.md:227-229`).

This sequencing matters: a weak idea or composition fails while only three screens exist.

### 3. Scaffold and source artifacts

`new-concept.mjs` copies `_template`, substitutes identity/target/strategy/reference defaults and creates media/screenshot directories (`platform/scripts/new-concept.mjs:15-62`). Its handoff text explicitly says not to expand the sample phone/code/home flow until the brief and vertical slice are rewritten; only three screens should be implemented and checked first (`platform/scripts/new-concept.mjs:64-74`).

The authored source of truth is:

- `platform/concepts/<slug>/concept.json` — product, positioning, screen, permission, readiness and App Store contract;
- `screens/<id>.html` — independent screen fragments;
- `styles.css` — concept-specific styling over the shared kernel;
- `sections.html`, docs and optional deterministic media code.

The shared screen interaction vocabulary is tiny and declarative (`data-go`, `data-back`, `data-ask`, `data-activate`, `data-toast`, state visibility attributes), documented in `platform/README.md:93-120`. This removes navigation and permission-state implementation from per-screen JavaScript.

### 4. Cheap readiness gates

`npm run proof` reads the spec and calls `assessConceptReadiness` before browser work (`platform/scripts/pipeline-proof.mjs:1-25`). For quality-contract v2, that gate checks concrete product fields, at least two primary-source observations, at least three critiques with screen evidence, and at least two visual passes with no open blocker/major defects (`platform/scripts/concept-quality.mjs:25-60`). Mimicry also requires three concrete `pattern → screen → observable behavior` links and required navigation roles (`platform/scripts/concept-quality.mjs:62-74`).

These checks cannot prove that the entered observations are true or that the passes really happened, but they make the intended feedback history part of the canonical spec rather than transient chat text.

### 5. Deterministic compilation

`build.mjs` describes its operation directly as `spec + screens + kernel → self-contained index.html` (`platform/scripts/build.mjs:1-15`). It reads every screen declared by the spec and fails if its file is missing (`platform/scripts/lib.mjs:115-123`), derives runtime permission/navigation data from the same spec (`platform/scripts/lib.mjs:126-143`), combines shared page/CSS/icons/engine with concept fragments, and fails on unfilled template slots (`platform/scripts/build.mjs:313-338`). The output is intentionally monolithic and can open through `file://` (`platform/scripts/build.mjs:3-8`).

The build also derives permission tables, product facts, IA and transitions rather than asking the author to maintain duplicate representations (`platform/scripts/build.mjs:22-101,313-330`).

### 6. Visual loop

The prescribed visual loop is unusually concrete: render every screen, inspect every PNG at full size, record defects, fix blocker/major items, rerender and repeat from zero at least twice (`PLAYBOOK.md:231-262`). `capture.mjs` deterministically activates every hero-prototype screen and saves one PNG per screen (`platform/scripts/capture.mjs:12-47`).

This is the main source of HTML predictability: the author sees a real result early, the delta is usually one HTML fragment or CSS rule, and the next capture is seconds away.

### 7. Automated interaction and consistency feedback

Browser flows are derived from `concept.json`, not dependent on the author remembering every test (`platform/scripts/test-flows.mjs:1-18`). They verify initial state, screen presence, broken routes, permission reachability from the real start graph, granted/denied paths and visible fallback behavior (`platform/scripts/test-flows.mjs:28-140,143-180`).

The layer lint compares spec to built markup, checks artifacts/links/classes, UI-v3 anti-slop rules and false affordances (`platform/scripts/lint-concept.mjs:52-130,134-204`). The single-concept review runs readiness → build → screenshots → structure/anti-slop → geometry/navigation → interactive flows and stops on the first failure (`platform/scripts/review-concept.mjs:14-27`). Portfolio acceptance adds kernel tests, launcher, grid audit and all concepts (`platform/scripts/check.mjs:7-25`).

### 8. HTML outputs

The public deliverable is fixed: one self-contained `index.html` with Overview, Prototypes, Screens and Documents (`PLAYBOOK.md:51-62`). The build also copies assets/docs and packs Markdown docs plus PNG screenshots into a ZIP (`platform/scripts/build.mjs:99-125,336-340`). `build:all` produces the portfolio gallery and per-concept directories (`platform/scripts/build-all.mjs:223-256`).

## Swift cold pipeline, stage by stage

### 1. Short request and persisted run

The CLI turns a prompt into a request containing target product, strategy and `capabilityPolicy: all`, then writes `01-request.json` (`ios-concepts/native/lean-cold-cli.mjs:14-45`). It records stage timing and, when available, a Product Blueprint, delivery receipt, visual review and final pipeline result (`ios-concepts/native/lean-cold-cli.mjs:66-115`). This is good observability and resumability, but does not itself improve the generated UI.

### 2. Three ideas from one model, selection by another

The architect asks the idea model for exactly three substantially different products, starting from a world model and social loop rather than permissions/screens (`ios-concepts/native/lib/structured-model-lean-architect.mjs:375-400`). An independent evaluator scores six axes and selects one (`ios-concepts/native/lib/structured-model-lean-architect.mjs:403-409`; axes/schema at `:1-53`). The selected idea must clear 8.5/10 on every axis with no fatal risks (`ios-concepts/native/lib/structured-model-lean-architect.mjs:237-249,375-378`).

There is no user-choice pause in this cold path. Both proposal and selection are model decisions.

### 3. One model expands the entire Product Blueprint

The idea model is called again to emit a single structured blueprint containing product world, 12–50 actions, 10–16 screens, exactly five tabs for VK mimicry, every target capability, localization, fixtures, acceptance scenarios, accessibility, privacy, analytics, risks and assumptions (`ios-concepts/native/lib/structured-model-lean-architect.mjs:77-234,410-442`). The prompt demands exact capability ownership and observable post-permission outcomes (`ios-concepts/native/lib/structured-model-lean-architect.mjs:415-427`).

Deterministic verification is extensive: identity and request drift, entity/action ownership, core-loop depth, VK grammar, screen/action reachability, capability outcomes, five canonical states, localization, fixtures and acceptance coverage (`ios-concepts/native/lib/lean-native-factory.mjs:18-152`). The blueprint is then compiled into a native manifest with capabilities, tokens, surfaces, fixtures and verification states (`ios-concepts/native/lib/lean-native-factory.mjs:169-291`).

Important limitation: these gates mostly prove referential completeness and minimum string/list structure. A coherent-looking but mediocre product can still be structurally valid.

Before those gates, normalisation also infers reducer effects from action names, creates missing capability actions, assigns orphan actions, adds referenced entities and fills missing localization (`ios-concepts/native/lib/structured-model-lean-architect.mjs:256-300,303-372`). This makes malformed model output more likely to become structurally valid, but an inferred relationship can be mechanically consistent without being the product decision the user expected.

### 4. Deterministic reference composition

The factory resolves a product target and either a reference profile (mimicry) or native calibration (differentiation) before build (`ios-concepts/native/lib/lean-native-factory.mjs:294-317`). The Product UI Contract deterministically assigns a recipe, actions, states and invariants to every surface (`ios-concepts/native/lib/lean-product-ui-contract.mjs:36-97`) and verifies exhaustive action/state/capability ownership (`ios-concepts/native/lib/lean-product-ui-contract.mjs:100-132`).

This is one of the strongest native design choices: the model is not supposed to invent an arbitrary third visual language. The docs describe mimicry as binding to a VK kit and differentiation to a restrained system kit (`ios-concepts/docs/LEAN-NATIVE-FACTORY.md:29-34`).

### 5. One large SwiftUI + XCUI generation call

The renderer model receives the reduced implementation blueprint, Product UI Contract, native manifest, target, reference and calibration (`ios-concepts/native/lib/structured-model-lean-builder.mjs:281-307`). The structured output schema constrains the envelope—3–14 Swift app files, 1–4 UI-test files, smoke-test names and implementation receipts—but each file body is still an unconstrained source-code string (`ios-concepts/native/lib/structured-model-lean-builder.mjs:15-57`).

The prompt then asks the same call to satisfy all of these simultaneously: exact recipes; exhaustive actions; real permission operations and granted/denied outcomes; canonical localization and fixtures; every acceptance scenario; auth and core loop; deterministic capture identity and layout geometry (`ios-concepts/native/lib/structured-model-lean-builder.mjs:298-327`).

After generation, deterministic tooling:

- repairs only one narrowly known SwiftUI newline ambiguity and runs `swift-format` fail-closed (`ios-concepts/native/lib/structured-model-lean-builder.mjs:69-93`);
- checks shared seams, native TabView/Lucide constraints, per-screen action bindings, capability identifiers, fixtures and XCUI scenario coverage (`ios-concepts/native/lib/structured-model-lean-builder.mjs:96-167`);
- injects a compiler-owned native app/auth/capture shell and rewrites action/tab bindings (`ios-concepts/native/lib/lean-native-shell-compiler.mjs:36-67,70-173`);
- writes the blueprint, Swift files, XCUI files and capture catalog (`ios-concepts/native/lib/structured-model-lean-builder.mjs:337-357`).

### 6. Real Xcode build, tests and captures

The executor generates the Xcode project, runs six semantic audits, builds for iPhone 17 Pro, runs the XCUI smoke scheme, captures each default surface and verifies that each PNG exists and is non-trivial (`ios-concepts/native/lib/structured-model-lean-builder.mjs:235-278`). The builder then creates delivery proof and rejects failed interaction/build evidence (`ios-concepts/native/lib/structured-model-lean-builder.mjs:358-371`).

This is stronger implementation evidence than HTML's simulated permission engine: it is real Swift/Xcode/XCUI execution. It is also a much larger and slower failure surface.

There is also a concrete evidence gap inside the cold path. The Product Blueprint assigns all five canonical states—loading, populated/default, empty, error and offline—to every screen (`ios-concepts/native/lib/structured-model-lean-architect.mjs:431-440`), but `captureCatalog()` creates only one `populated/default` driver per screen and `defaultExecutor` captures only those drivers (`ios-concepts/native/lib/structured-model-lean-builder.mjs:214-229,259-272`). Thus “state contract is complete” does not mean those states were rendered or visually reviewed in a cold run.

### 7. Independent visual review, but no revision loop

The delivery reviewer sends all captures plus product/contract/calibration context to an independent vision model (`ios-concepts/native/lib/lean-delivery-reviewer.mjs:3-34`). The critic must inspect every frame and golden, score eleven axes, ground its findings in visible evidence and flag false affordances, clipping, state ambiguity and reference drift (`ios-concepts/native/lib/structured-vision-product-ui-critic.mjs:17-56`; rubric at `ios-concepts/native/lib/product-ui-critic.mjs:5-17,69-85`). The minimum axis score, not an average, controls the result and the configured floor cannot go below 8.5 (`ios-concepts/native/lib/product-ui-critic.mjs:99-145`; `ios-concepts/native/lib/quality-policy.mjs:1-8`).

However, the lean orchestrator calls blueprint once, builder once and reviewer once. A failed review returns diagnostics; no reviser is called (`ios-concepts/native/lib/lean-native-factory.mjs:294-329`). The documented policy is explicit: “A stage is run once” and failures return a resumable blocker receipt (`ios-concepts/docs/LEAN-NATIVE-FACTORY.md:56-58`). Thus the visual critic is an acceptance gate, not a feedback loop that improves the current run.

### 8. Swift outputs

Cold-run evidence goes under `native/FactoryRuns/<request-id>`: request, Product Blueprint, delivery receipt, review and result (`ios-concepts/native/lean-cold-cli.mjs:43-45,91-115`). Product source is written to `native/apps/<slug>`, the blueprint to `native/ProductBlueprints/<slug>-vk.json`, and the capture catalog beside the app (`ios-concepts/native/lib/structured-model-lean-builder.mjs:337-357`). Generated Xcode projects and screenshots live under ignored `native/build` and `native/artifacts` (`ios-concepts/README.md:70-76`).

## Direct comparison

| Dimension | HTML pipeline | Swift cold pipeline | Consequence |
|---|---|---|---|
| Human selection | Required pause after three variants | Evaluator model selects automatically | HTML catches taste/product mismatch before implementation |
| First implementation | Three-screen vertical slice | Complete 10–16-screen blueprint and whole app source | HTML receives useful feedback with a much smaller sunk cost |
| Shared implementation | Page shell, chrome, engine, permission state, assembly are shared | Runtime/auth/shell/tokens are shared, but product view hierarchy, actions and tests are generated | Native has many more model-controlled degrees of freedom |
| Model output type | Small JSON/HTML/CSS/doc edits across iterations | Huge structured response whose fields contain complete Swift/XCUI source strings | JSON schema constrains file envelopes, not SwiftUI visual structure |
| Visual feedback | Mandatory two-pass human loop before acceptance | Independent vision verdict after full build; no automatic revise/rebuild | HTML optimizes; native mostly rejects |
| Runtime complexity | Browser DOM/CSS and simulated iOS behavior | Swift compiler, SwiftUI state/navigation, iOS capabilities, Xcode, simulator, XCUI | More independent failure modes in native |
| Repair granularity | One fragment/CSS token can be changed and recaptured | One source bundle must stay consistent with blueprint, manifests, identifiers and tests | Local Swift fixes easily violate another seam |
| Determinism | Mature kernel composes a fixed deliverable | Product/reference contracts are deterministic; the app implementation is generated | Native is deterministic around a stochastic core, not through it |
| Quality gate behavior | The process requires recorded fix-and-rerender passes | Fail-closed receipts and strict minimum-axis scoring | Native evidence is rigorous but does not create convergence |
| Fidelity target | iOS-like mockup inside one known 375px device frame | Real native UI across safe areas, system chrome and device behavior | Native's target is more valuable but objectively harder |
| Evidence strength | Excellent concept/prototype evidence | Potentially real executable product evidence | Swift wins only when a run actually reaches green handoff |

## Why HTML is more predictable in this repository

### 1. It is an editing loop; Swift cold generation is a sampling event

The HTML playbook encodes human choice, early vertical-slice review and at least two full visual correction passes. Swift's current lean policy runs each stage once. Predictability comes less from HTML/CSS being “easy” and more from repeated observation and correction.

### 2. The HTML kernel owns the fragile cross-cutting behavior

All concepts inherit the same final page, device chrome, permission journal and interaction engine. A screen author mainly supplies content/composition and declarative transitions. Native shares useful infrastructure, but the renderer still owns the actual product hierarchy, action controls, store behavior and XCUI assertions. The larger stochastic surface produces wider variance.

### 3. Native's source schema is structurally strict but visually weak

The blueprint schema is detailed, and the source bundle schema fixes counts and receipt fields. But `contents` is only a string with `minLength: 100`. The compiler can prove that an identifier exists; it cannot prove that the corresponding button is well-composed, attached to the right visible object or pleasant. That is deferred to the final vision gate.

### 4. Too many obligations compete in one renderer context

The builder prompt combines design recipe adherence, product copy, state management, capabilities, persistence, accessibility IDs, navigation, capture geometry and XCUI coverage. The source itself notes that even receipts and delivery prose previously consumed roughly a third of the prompt and displaced executable requirements, so they were removed from renderer input (`ios-concepts/native/lib/structured-model-lean-builder.mjs:188-211`). This is direct evidence of context/attention pressure.

### 5. Native validates presence more reliably than semantic correctness

Checks such as `.nativeAction("surface.action")` presence, outcome identifiers in source/tests and localization strings are valuable drift detectors. They can still be satisfied by awkward UI or shallow implementation. The final vision critic catches some of that, but because there is no reviser, a good diagnosis does not become a better artifact in the same run.

### 6. The reference profile is narrow

The code has a real VK calibration path, but the repository says the next reference adapters must wait for complete evidence and specifically does not infer VK Music, VK Video or OK from existing concepts (`ios-concepts/docs/NATIVE-PIPELINE-REFACTOR.md:84-94`). The general missing-input list likewise calls out absent full screenshot/reference families for those products (`ios-concepts/docs/WHAT-IS-MISSING.md:1-9`). Outside the calibrated path, expected visual quality is underdetermined.

### 7. The comparison is not fully apples-to-apples

HTML produces a controlled prototype in a fake iPhone frame; Swift produces a real native application, capabilities and tests. HTML can look polished while avoiding compiler, OS and device constraints. Swift's lower pass rate partly reflects a higher evidence standard. The fair conclusion is not “HTML is universally better,” but “the HTML factory currently has a better convergence mechanism for concept quality, while Swift has stronger delivery evidence when it succeeds.”

## Empirical evidence already stored in the repository

This diagnosis is corroborated by recent persisted native runs, not only by static architecture reading.

- The 2026-08-26 cold-run evaluation records 398.5 seconds for product architecture and three renderer attempts of 135.2, 151.5 and 207 seconds. It scores the product idea 8.8/10 and docs 9.0/10, but the Swift renderer 1.5/10 and end-to-end pipeline 3.5/10 (`ios-concepts/native/FactoryRuns/cold-vk-docs-eval-resume-20260826-v4/05-cold-run-evaluation.md:7-28`).
- Its stated root cause is exactly the wide model-owned seam: one renderer is responsible for both product-specific composition and mandatory platform infrastructure, and prompt instructions did not reliably retain that infrastructure even after context reduction (`ios-concepts/native/FactoryRuns/cold-vk-docs-eval-resume-20260826-v4/05-cold-run-evaluation.md:30-32`). The proposed repair is to compile shell, capability harnesses and XCUI skeletons deterministically and ask the model only for product modules (`:34-41`).
- The final resumed receipt still stops in `native-build` because generated source omitted `NativeEmailAuth`; it is explicitly not ready for developer handoff (`ios-concepts/native/FactoryRuns/cold-vk-docs-eval-resume-20260826-v4/pipeline-result.json:1-15`).
- The previous day's first-production-run postmortem reports raw first-pass quality 2/10, failure to compile, missing real permission calls, duplicated runtime types and ignored shared auth/design seams (`ios-concepts/docs/benchmarks/2026-08-25-vk-cold-start-first-run.md:1-16,55-71`). Its root-bottleneck list independently names whole-document repair, descriptive rather than executable visual contracts, late compilation/critic placement and lossy repair memory (`ios-concepts/docs/benchmarks/2026-08-25-vk-cold-start-first-run.md:98-109`).

The most revealing fact is the split score: product/specification can be strong while the renderer is near-failing. The dominant variance is therefore downstream implementation and convergence, not merely idea generation.

## Where each pipeline is genuinely better

### HTML is better for

- rapid exploration, comparison of product directions and visual language;
- predictable presentation artifacts and stakeholder review;
- cheap whole-portfolio consistency through one shared kernel;
- early detection and correction of weak product/UI ideas;
- fast iteration on layout, content density and states.

### Swift is better for

- proving that an application compiles, launches and uses real native primitives;
- testing actual navigation, state mutation, permissions, safe areas and accessibility identifiers;
- producing developer-owned Swift source and an Xcode project;
- catching fake prototype affordances that cannot survive implementation;
- establishing evidence suitable for real handoff rather than only concept review.

## Highest-leverage changes to make Swift converge like HTML

These are recommendations inferred from the implementation, not claims that they already exist.

1. Add a real three-screen native preview gate before complete source generation. Build/capture `entry → action → result`, run the visual critic, and require approval before expanding the remaining surfaces. This ports the strongest HTML control point.
2. Turn delivery review into a bounded repair loop. Feed screen/file/action blockers to a reviser, patch only owned files/surfaces, rebuild and recapture; cap at two iterations. Do not regenerate the Product Blueprint for visual defects.
3. Split the renderer by deterministic seams: compiler-owned app/store/navigation shell, compiler-owned capability adapters, and model-authored surface bodies. The current shell compiler is a good start, but product navigation/state/action implementation is still too broad.
4. Generate declarative screen recipes first, validate them against the Product UI Contract, then compile common recipe families to Swift. Raw Swift strings should be the escape hatch, not the primary visual representation.
5. Make user selection optional-but-default after the three product ideas. An evaluator score is not a substitute for the user's taste or expected outcome.
6. Capture visual feedback earlier and cheaper: one device and three core screens first; only after acceptance run all screens, denied variants, small-phone matrix and XCUI.
7. Benchmark only uncached end-to-end runs and record first-pass compile rate, first-pass visual pass rate, number of local repairs, total time and final human score. The docs already require the uncached zero-manual-edit milestone before moving beyond pilot.

## Bottom line

The HTML pipeline is currently more predictable because it is a **constrained iterative design system**. The Swift pipeline is currently a **strict one-shot native code generator surrounded by validators**. Validators improve trust in successful output, but without an early visual slice and a bounded revise/rebuild loop they do not improve the probability that a random run will match the user's expectation.

The best future architecture is not to make Swift imitate HTML output. It is to copy HTML's control strategy: small accepted slice, low-dimensional authored surface, deterministic shared compiler/runtime, real rendered feedback, localized repair, and only then full expansion.
