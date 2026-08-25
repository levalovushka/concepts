# Independent product and visual readiness audit

Date: 2026-08-24
Audited snapshot: `9ab4cb0c68e690abcb8ecf0048cc0aa4f061b539`
Products: Looks / «Образы», Dvor / «Двор»
Review basis: real simulator PNGs, not test status alone.

## Evidence reviewed

- Looks: all 66 declared current-device capture states, plus five root flows on iPhone 17 Pro and iPhone 16e.
- Dvor: all 74 declared current-device capture states, plus four root flows on iPhone 17 Pro and iPhone 16e.
- Root-flow inspection covered selected and unselected native Liquid Glass `TabView` states, Lucide optical boxes, baselines, captions, contrast and small-phone fit.
- Secondary-state inspection covered empty, loading, error, denied, permission, submission, scanning, connection and verification variants declared by each capture manifest.
- Structured critique axes: product clarity, information hierarchy, VK mimicry, flow/component consistency, optical accuracy, action predictability, microcopy, accessibility and small-phone behavior.

## Findings and fixes

| Severity | Before | Mechanism / pipeline cause | After |
| --- | --- | --- | --- |
| P1 | Dvor `phone--error` was pixel-identical to `phone--default`. | `ResidenceOnboarding.authenticationError` did not initialize from the capture state. Green capture execution therefore hid a non-rendered error contract. | The error state initializes with visible recovery copy; distinct-state pixel gating passes. |
| P1 | Dvor Home and Yard tabs could render SF Symbols. | `house-matters` and `infrastructure` were absent from `TabIconRole` and the VK profile, so optional Lucide lookup fell back to `Label(systemImage:)`. | Both roles have vendored Lucide mappings (`house`, `layout-grid`); app tab labels require Lucide assets. |
| P1 | Both apps permitted future SF Symbol regressions in product tabs. | `tabLabel` accepted an optional asset and contained a system-image fallback. | `requiredTabIconAsset` is fail-closed; visual-language and asset audits reject fallback code or missing vendored files. SF Symbols remain available only to system actions and permissions. |
| P1 | Dvor lock-overlay CTA used the default purple palette instead of VK blue. | The overlay was outside the visual-language environment boundary. | The environment is explicitly propagated into the overlay; the reviewed capture uses VK blue. |
| P2 | The reference-profile audit assumed exactly five tab roles. | The gate encoded one product's role count instead of the profile's required vocabulary and asset existence. | The audit checks required base roles as a subset and verifies every mapped icon against the vendored Lucide manifest. |

No P0 defects were found. No decorative redesign, gradients, random components, colored icon placeholders, or VK Music/VK Video/OK adapters were added.

## Structured review after fixes

### Looks

- Product clarity: feed, search, chats, clip and services are recognizable at entry; the clip remains intentionally immersive.
- Hierarchy: primary actions and post-linked action strips read correctly. Remaining blocker: the opening feed and service/profile carousels are visually dense.
- VK mimicry and consistency: compact push chrome, cards, spacing and blue accents are coherent. All five product tabs use vendored Lucide regular/selected assets inside native `TabView`.
- Predictability and microcopy: visible chevrons map to actions; back buttons, composer, permissions and recovery states follow their flow contracts.
- Accessibility/small phone: no root-flow clipping or tab-label collisions on iPhone 16e; automated AXXXL and safe-area checks pass. VoiceOver order/rotor remains manual.

### Dvor

- Product clarity: home matters, chats, yard infrastructure and menu establish a coherent residence-services model.
- Hierarchy: matter and service actions remain attached to their cards/details; loading, empty, denied and error states preserve the next action. Remaining blocker: the service/menu breadth is dense.
- VK mimicry and consistency: top bars, cards, blue CTA language and all four Lucide tab roles are consistent after overlay and icon fixes.
- Predictability and microcopy: the phone authentication error now explains recovery; no reviewed decorative chevrons imply unavailable actions.
- Accessibility/small phone: root flows and tabs fit iPhone 16e without clipping; automated AXXXL and safe-area checks pass. All secondary permission/onboarding states were reviewed on the current device, not manually duplicated on the small phone.

## Independent scores

| Product | Product contract | Hierarchy | Consistency | Visual fidelity | Predictability | Mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Looks | 8.7 | 8.5 | 9.1 | 8.8 | 9.0 | 8.8 |
| Dvor | 8.8 | 8.6 | 9.1 | 8.9 | 9.0 | 8.9 |

Scores below 9 are limited by the concrete density/small-device coverage issues above and by simulator-only Liquid Glass inspection. No axis is rated 10.

## Manual readiness boundary

The independent product/visual gate is complete. Factory readiness remains blocked by:

- physical-device launch, real TCC prompts and physical Liquid Glass optical inspection;
- manual VoiceOver reading order, rotor and announcements.

Neither gate is inferred from screenshots, simulator tests or green automation.
