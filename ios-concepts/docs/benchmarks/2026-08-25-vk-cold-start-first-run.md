# First native factory run: VK mimicry cold start

Date: 2026-08-25  
Request: `vk-cold-start-2026-08-25`  
Result: **failed; not ready for developer handoff**

This is a production postmortem, not a showcase. A stage is counted as successful only when its output is usable by the next deterministic stage and the resulting native app builds, behaves, and passes visual review.

## Executive result

The run produced a coherent neighbourhood-help product direction and a buildable SwiftUI preview only after manual pipeline work. It did not produce a handoff-ready application automatically. The raw renderer result was visually unacceptable, did not compile, omitted contextual permission calls, duplicated a runtime-owned type, and ignored the shared authentication/design-system seams.

Current factory readiness: **4/10**.  
Current raw first-pass application quality: **2/10**.  
Current manually recovered preview quality: **6.5/10**.  
Target before production use: every deterministic gate passes, no manual source edits, and independent product/visual review is at least 8.5/10 on every axis.

## Timing

Exact persisted benchmark for the cached-upstream release run:

| Stage | Time | Result |
| --- | ---: | --- |
| Product artifact load/verification | 0.014 s | passed from cache |
| Experience artifact load/verification | 0.013 s | passed from cache |
| Visual artifact load/verification | 0.008 s | passed from cache |
| Render, repair, and attempted release | 547.743 s (9m 08s) | failed after 3 renders |
| Total persisted segment | 547.779 s (9m 08s) | failed |

Measured uncached model calls made while producing those upstream artifacts:

| Module call | Time |
| --- | ---: |
| Experience plan | ~260.9 s |
| Experience revision 1 | ~254.4 s |
| Experience revision 2 | ~265.4 s |
| Visual directions | ~132.6 s |
| Visual evaluation | ~37.9 s |
| Experience + visual subtotal | ~951.2 s (15m 51s) |

The exact cold Product Factory duration was not persisted in the final benchmark because that stage was reused from cache. It must be recorded in the next clean run. Even without it, the measured critical path already exceeded **24m 59s** before human recovery. This is not acceptable for a streaming concept factory.

Post-recovery live verification timings:

| Verification | Wall time | Result |
| --- | ---: | --- |
| Six XCUI journeys, iPhone 17 Pro, first honest run | 50.6 s test session | 3 passed / 3 failed |
| Six XCUI journeys after auth/navigation fixes | 38.4 s test session | 6 passed / 0 failed |
| VK-calibrated UI, iPhone 17 Pro | 48.9 s command wall time | 6 passed / 0 failed |
| VK-calibrated UI, iPhone 16e, first run | 55.2 s command wall time | 5 passed / 1 failed |
| VK-calibrated UI, iPhone 16e, fixed full rerun | 38.9 s command wall time | 6 passed / 0 failed |

The compact-device failure was an authentication race exposed with the keyboard visible. Removing the artificial prefilled address and exercising real input made both the focused journey and the complete compact-device suite pass.

## Module quality

| Module | Quality | What worked | What failed |
| --- | ---: | --- | --- |
| Product idea and world model | 7/10 | One understandable unit, local-help core loop, content ownership, privacy boundary, five useful journeys | The proposition remains somewhat generic; evidence is planned rather than proven; product output is too large for downstream prompts |
| Product evaluator | 6/10 | Rejects fake jargon, duplicate destinations, decorative actions, and cross-product drift | Its score did not predict implementation cost or downstream state explosion |
| Experience planner | 6/10 | Produced a connected 14-surface graph and eventually closed all validator errors | Needed two full LLM rewrites; generated 95 applicable visual states, including nine states for a system photo picker; technical shell/extension surfaces leaked into product UI scope |
| Experience validator | 7/10 after fixes | Now checks reachability, actions, states, auth, journeys, permissions, media ownership | Initially misread nullable fields, tab reachability, auth transitions, and action destinations; error repair required resending a ~92 KB contract |
| Visual direction generator | 5.5/10 | Produced three directions and selected a VK-oriented feed-first direction | Tokens mixed machine values with prose; direction did not force use of shared components; no pixel evidence existed at this stage |
| Visual evaluator | 5/10 | Separate evaluator and reproducible selection | It approved a direction that was too abstract to prevent a 2/10 implementation |
| Native concept generation | 2/10 before refactor | Generated substantive Swift rather than HTML | Model-generated `conceptJson` was structurally not a native concept; slug drifted; capture coverage was incomplete; fixes regressed between attempts |
| Swift renderer | 2/10 raw | Core feed/messages/create/profile code existed | Did not compile; duplicated `CaptureIdentity`; one malformed Swift call; ignored shared auth and visual-language seams; no real permission requests; raw login composition was visibly broken |
| Repair loop | 2/10 | Failed closed after three attempts | Revisions were not cumulative: attempt 3 forgot attempt 1's slug fix. Each repair regenerated a large bundle and cost minutes |
| Static gates | 5/10 before refactor | Eventually caught delivery, capability, capture, visual-language, and Swift failures | Several audits only read top-level Swift files, so modular generated source failed for the wrong reason; compilation happened too late |
| Media fallback | 8/10 | Deterministic neutral `#E5E7EB` assets, no icons, gradients, text, or random colours | Needs a later semantic-media provider without changing the contract |
| Documentation generator | 7/10 | Split developer guide and contract-derived sections | It can document an application that is not yet visually acceptable; release status must be prominent and fail-closed |
| Visual/product critic | not measured | The run never reached a valid capture set | A critic that has not seen pixels must not contribute a passing score |

## Failure sequence

Automated renderer attempts:

1. Failed: generated concept slug and source bundle slug differed.
2. Failed: capture driver missing for `auth-email|loading`.
3. Failed: slug mismatch returned, proving that repair context was not cumulative.

Manual recovery then exposed additional blockers that the model-level repair never reached:

1. `conceptJson` was not a compilable native concept at all.
2. Delivery identity omitted first-frame product evidence.
3. Modular Swift directories were invisible to three non-recursive audits.
4. Photos, location, and push were declared but not called from product gestures.
5. A system photo picker was incorrectly assigned nine product capture states.
6. The app ignored `NativeVisualLanguage` and the shared email/OTP component.
7. The model redeclared pipeline-owned `CaptureIdentity`.
8. Swift compilation found malformed API calls.
9. The first visible login screen scored roughly 2/10 despite earlier contract gates passing.
10. The Xcode generator searched only the first `UITests` directory level, silently omitted a modular XCUI target, and therefore allowed a false-green build.
11. Once recursive discovery was fixed, the first real run passed only 3 of 6 journeys: OTP accessibility was hidden, the email-to-code transition was unreliable, and one state represented both a tab and a nested route.
12. The project generator recreated its output directory, so DerivedData stored below that directory disappeared during a later generation test. Build cache and release products must live under the artifact root, never generated source output.
13. The approved `looks-vk-mimicry-v1` calibration existed but the native renderer received only an abstract visual contract. It did not receive executable shell/feed/navigation/messages/profile recipes, so the first recovered feed still scored about 4/10 and did not resemble the accepted Looks grammar.
14. Generated XCUI asserted a system `NavigationBar` even though the selected VK profile deliberately uses `VKTabHeader` and `VKNavigationChrome`. Journey tests must assert canonical surfaces and outcomes without forcing the wrong chrome implementation.

## Root bottlenecks

1. **LLM owned deterministic artifacts.** Slug, `concept.json`, capture matrix, surface ownership, and asset bindings must be compiler-owned.
2. **Whole-document LLM repair.** A single graph error caused another 4-minute rewrite of the entire Experience Contract.
3. **State applicability was unconstrained.** The planner could mark nearly every canonical state applicable to every screen.
4. **Visual contracts were descriptive, not executable.** Passing prose did not guarantee use of shared components or correct geometry.
5. **Compilation and runtime integration came too late.** Reserved-type collisions and Swift syntax should fail within seconds of the first render.
6. **Critic placement was too late.** No cheap first-frame screenshot gate rejected the clearly broken login before the full release path.
7. **Repair memory was lossy.** Reviser output replaced instead of accumulating proven fixes.
8. **Golden calibration stopped before code generation.** Visual selection cited Looks but the renderer was not given its bounded native composition recipes.
9. **Generated-project and artifact ownership overlapped.** Regeneration could erase expensive build output and invalidate a supposedly ready preview.
10. **Static tests did not instantiate the true Xcode/UI-test graph.** A passing Node suite could coexist with no XCUI scheme at all.

## Refactor required for production flow

### Deterministic compiler ownership

- Compile `concept.json` from Product + Experience + Visual contracts.
- Compile canonical slug, navigation roots, localization, acceptance scenarios, fixtures, capture drivers, ownership, and neutral media bindings.
- Normalize semantic token values; keep rationale in separate descriptive fields.
- Reject generated declarations of runtime/design-system-owned types.

### Smaller model tasks

- Product model: world model and product decision only.
- Experience model: domain actions, routes, and state applicability decisions only.
- Swift model: screen-specific composition and product state reducers only.
- Compiler: all IDs, boilerplate, shared auth, permission adapters, capture plumbing, Xcode targets, and docs.
- Repair model: receive a typed patch request for one module, never the entire application bundle.

### State-budget gate

- Default state applicability to false.
- Collections may own empty; async operations may own loading; network-backed surfaces may own offline/error.
- Permission states exist only on the request and fallback surfaces for that capability.
- System/external surfaces are supplemental evidence, not full product capture matrices.
- Set a normal budget of 2–4 visually distinct states per product surface and require justification above it.

### Fast quality ladder

1. JSON/schema/identity compile: seconds.
2. Navigation/action/capability/state audits: seconds.
3. Swift typecheck and one-device build: target under 90 s.
4. First-frame and one core-flow screenshots: reject obvious visual failure immediately.
5. XCUI core journeys on current device.
6. Full state and small-device capture only after the core visual gate passes.
7. Independent product/UI critic; every axis >= 8.5, no average-score masking.

### Target service level

- First interactive build: <= 12 minutes.
- Accepted handoff package: <= 25 minutes for a typical concept.
- Automated renderer retries: <= 1 full regeneration; later fixes are typed patches.
- Manual source edits: 0.
- Build, journeys, permissions, overflow, safe area, localization, state coverage: 100% deterministic pass.
- Visual/product score: >= 8.5/10 on every axis from independent pixel and flow review.

## Decision

Do not put the current pipeline on production flow yet. Keep the product/experience contracts, separate evaluation, native runtime, documentation split, and fail-closed release idea. Replace model-owned delivery metadata, whole-document repair, unconstrained state matrices, and late visual validation before the next clean benchmark.
