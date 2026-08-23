# Camo Pipeline

Camo turns a constrained product concept into a reviewable native application. Its language separates product intent from the iOS artifacts and visual implementation that realise that intent.

## Product

**Concept**:
A product proposition constrained by a target permission set and expressed through reachable user value.
_Avoid_: Prototype, demo

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
