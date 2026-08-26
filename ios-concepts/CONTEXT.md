# Domain glossary

## Concept factory

- **Concept factory** — the complete cold path from a short product request to a native, locally working, developer-handoff iOS application. A build or a set of documents alone is not a factory result.
- **Factory result** — a delivery that passes product, experience, visual, interaction, permission and build evidence gates without manual edits to generated Swift.
- **Cold run** — a factory run for a new request with no reused product, experience, visual, source or review artifact.
- **Product world** — the entities, relationships, actions, invariants and retention loop that exist before screens are planned.
- **Product grammar** — the target-family structure a product must preserve. For VK mimicry this includes authored content, identity, feed distribution and social feedback; it is not a palette or navigation skin.
- **Visual calibration** — an approved golden concept plus executable screen and component recipes used to render a new product without copying its domain features.
- **Permission journey** — a reachable product scenario containing a contextual trigger, the real system request seam, a granted outcome and a denied fallback.
- **Capability outcome** — the product-owned value created after a capability succeeds, such as image bytes in a post draft, a saved calendar event, selected contacts or recognized text. Authorization status, a toast and a decorative label are not outcomes.
- **Capability journey** — the complete chain `entity action → contextual authorization (when required) → system operation → capability outcome → persisted or visible product state`, with an executable denied/unavailable fallback.
- **Capability** — an iOS platform facility delivered through code, configuration, entitlement, extension or lifecycle integration. A capability is not necessarily a user-consent permission.
- **User-consent permission** — a capability whose first contextual use can show a system authorization prompt.
- **Quality receipt** — fresh evidence tied to exact source and capture hashes. A declaration or a green build is not a quality receipt.
- **False affordance** — a visible control whose outcome is missing, indistinct, surprising or disconnected from its owning entity.
- **Product Blueprint** — the single canonical product specification produced by the streamlined factory: product world, core loop, navigation, actions, states, capability journeys, content and acceptance criteria. It replaces separate generated product, experience and visual planning documents.
- **Reference UI kit** — an executable family of tokens, components and screen compositions calibrated from a golden concept. For VK mimicry the source is «Образы»; it constrains rendering but never contributes product entities or features.
- **Delivery proof** — one fresh build, interaction and pixel evidence package for the exact generated source. Failed proof returns addressable blockers; it does not trigger whole-app regeneration.

## Quality states

- **Blocked** — at least one mandatory axis, screen, journey or permission has insufficient evidence or scores below its floor.
- **Handoff-ready** — every required screen and state is coherent, every action and permission journey is executable, two device classes pass, and every independent visual/product axis meets the configured floor.
