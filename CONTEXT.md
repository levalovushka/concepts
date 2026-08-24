# Camo Pipeline

Camo turns a constrained product concept into a reviewable native application. Its language separates product intent from the iOS artifacts and visual implementation that realise that intent.

## Product

**Product Brief**:
A statement of the audience, situation, constraints, reference family, and requested permissions that bounds product exploration before a proposition is chosen.
_Avoid_: Prompt, theme request

**Concept Candidate**:
One independently coherent product proposition developed from a Product Brief, with its own wedge, value exchange, supply model, loops, risks, assumptions, and evidence provenance.
_Avoid_: Variation, feature list

**Product evidence**:
Traceable information that supports or challenges a product claim and states its source and confidence; an untested assumption is identified as such rather than presented as evidence.
_Avoid_: Rationale, invented proof

**Product stress test**:
An axis-by-axis challenge of a Concept Candidate in which a failed critical axis cannot be hidden by stronger axes.
_Avoid_: Average score, vibe check

**Selection receipt**:
The durable comparison that names the selected Concept Candidate, explains why it survived, and records explicit rejection reasons for every alternative.
_Avoid_: Recommendation, leaderboard

**Product contract**:
The mature, canonical product proposition selected for delivery, including its scope, domain, value and supply models, loops, permissions, evidence, delivery obligations, and acceptance criteria.
_Avoid_: Concept summary, UI brief

**Product development artifact**:
The reproducible set of one Product Brief, its materially different Concept Candidates, their Selection Receipt, and the selected Product Contract.
_Avoid_: Approved idea, product metadata

**Web migration evidence**:
An existing web concept's observed product tasks, entities, permission map, and interaction intent used to inform a native Concept without treating its layout or implementation as canonical.
_Avoid_: HTML source, native template, market validation

**UX Specification**:
The canonical interaction model that translates a Product Contract into reachable surfaces, explicit states and transitions, semantic design roles, localized language, acceptance scenarios, and deterministic product fixtures.
_Avoid_: Wireframe, SwiftUI plan, screen list

**Acceptance scenario**:
An executable product-level statement of initial conditions, user or system events, and observable outcomes for one critical flow or recovery path.
_Avoid_: Test note, happy-path description

**Product fixture**:
Deterministic representative content for one observable product state, with stable identity and media provenance where media is present.
_Avoid_: Placeholder, mock screen

**Concept**:
A native product delivery whose intent is governed by one Product Contract and whose surfaces realise reachable user value.
_Avoid_: Prototype, demo

**Product wedge**:
The narrow mechanism and initial situation through which a Concept Candidate can earn adoption before it expands.
_Avoid_: Unique feature, tagline

**Observable differentiation**:
A product distinction expressed as user behaviour or an outcome that can be compared and tested.
_Avoid_: Decorative difference, novelty claim

**Content supply**:
The sources, incentives, and controls that make a product's content available at cold start and replenished afterwards.
_Avoid_: Seed data, content placeholder

**Reference fit**:
The reason a product model belongs naturally inside a reference product's established mental model, including any tensions that must be resolved.
_Avoid_: Visual similarity, brand fit

**Product distinction**:
An observable difference in the product's content model or core loop that gives a user a reason to choose it.
_Avoid_: Feature decoration, novelty widget

**Product surface**:
A reachable place where a user completes a product task; it may have several visual states and one native presentation.
_Avoid_: Screen stub, permission screen

**Product state**:
An observable condition of a product surface, such as populated, empty, loading, denied, or error.
_Avoid_: Screenshot variant

## Platform

**Permission**:
A user-authorised access requested at one reachable product gesture and backed by a useful fallback.
_Avoid_: Entitlement, plist key

**Capability**:
An iOS facility required by a product feature and realised by one or more build artifacts, runtime adapters, or extension targets.
_Avoid_: Permission

**Native manifest**:
The validated, canonical interpretation of a concept for one native build, containing product surfaces, navigation, states, design intent, and required capabilities.
_Avoid_: Generated config, second spec

## Design

**Mimicry**:
A design strategy that preserves a named reference product's recognisable structure, behaviour, density, and visual grammar while expressing Camo's own product model.
_Avoid_: Theme, reskin

**Differentiation**:
A design strategy that derives its visual grammar from the concept's audience, promise, content model, and core loop without copying a named product.
_Avoid_: Custom theme, non-mimicry

**Reference profile**:
Evidence-backed design knowledge about a named product: navigation, composition, components, behaviour, states, and visual tokens.
_Avoid_: Moodboard, style notes

**Reference family**:
A registry of independent reference profiles that may share ownership or brand cues but never share an assumed interface contract. Current members are VK, VK Music, VK Video, and Odnoklassniki.
_Avoid_: Theme variants, one VK skin

**Design contract**:
The measurable visual and interaction constraints that every state of a product surface must satisfy.
_Avoid_: Design system, critic prompt

## Quality

**Maturity gate**:
A fail-closed decision that prevents an immature Concept Candidate or Product Contract from entering product delivery when any critical product axis fails.
_Avoid_: Readiness score, checklist completion

**Gate**:
An executable check that blocks a build when an observable contract is violated.
_Avoid_: Audit report, warning

**Critic pass**:
An independent evaluation of rendered product states against product intent, the design contract, and—when applicable—the reference profile.
_Avoid_: Self-review

## Dvor

**House**:
A verified multi-apartment address and its shared infrastructure, membership, rules, and private product space.
_Avoid_: Community, group, location

**Resident**:
An authenticated person associated with one House and a specific entrance/apartment; write access depends on Residence verification.
_Avoid_: Follower, subscriber, generic user

**Residence verification**:
Evidence that a Resident belongs to a House, normally established by proximity plus the registered home Wi-Fi; manual review is the fallback.
_Avoid_: Login, moderation, geofence

**House matter**:
The primary unit of attention in Dvor: an announcement, incident, or neighbour question tied to a House, audience, status, and next action.
_Avoid_: Post, content card, feed item

**Incident report**:
A House matter describing a physical problem, with evidence, location, tracking number, and lifecycle status.
_Avoid_: Complaint, generic post

**House access record**:
A protected credential or network configuration shared with verified Residents through system-backed access mechanisms.
_Avoid_: Password post, pinned message

**House steward**:
A Resident with additional rights to maintain House information and review manual Residence verification requests; not a separate application role.
_Avoid_: Admin panel, moderator
