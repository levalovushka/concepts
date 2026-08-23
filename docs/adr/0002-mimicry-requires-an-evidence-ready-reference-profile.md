# ADR 0002: Mimicry requires an evidence-ready reference profile

Status: Accepted

## Context

The native pipeline must support recognisable mimicry of several named iOS products without turning product code into a collection of hardcoded themes. VK, VK Music, VK Video, and Odnoklassniki share ownership and some brand cues, but they are separate products with different information architecture, density, components, and behaviour. Guessing those contracts before screenshot evidence exists would make the output look plausible while being untrustworthy.

## Decision

`concept.json` selects a reference profile by stable ID. The native compiler resolves that ID through the reference-profile catalog and blocks mimicry unless the profile status is `ready`.

A ready profile owns:

- its screenshot evidence inventory;
- measurable navigation, composition, density, typography, token, and component contracts;
- profile-specific SwiftUI component sources;
- the semantic tokens merged into the native manifest.

Product surfaces and state remain in the concept and application composition. Neutral theme/runtime code consumes semantic roles from the manifest and contains no named-product constants.

`vk-ios` is currently ready. `vk-music-ios`, `vk-video-ios`, and `ok-ios` are registered as `awaiting-evidence` with capture plans; selecting any of them is a compile error until their screenshots are analysed and their contracts implemented.

## Consequences

- New reference products do not require changing the product schema.
- A blue palette alone cannot masquerade as VK mimicry.
- Product logic can be reused while each named product gets a separate visual adapter.
- Screenshot collection is an explicit prerequisite rather than an informal final polish step.
- Promoting a profile to `ready` requires both an evidence contract and implementation sources.
