# Native visual language

`NativeVisualLanguage` is the only visual seam between a compiled concept and
SwiftUI. Screens ask for semantic color, spacing, typography, chrome and icon
roles. A reference profile or differentiated product supplies the adapter.

## Invariants

- Root `TabView` remains system-owned so iOS can render Liquid Glass.
- Reference adapters own push/modal chrome; product adapters may use system
  chrome.
- Functional icons come through semantic roles. VK/Looks product chrome uses
  the reference profile's audited, template-rendered Lucide 0.525.0 assets;
  selected tabs use a 2.5 stroke inside the same 24pt optical box. This applies
  to both current VK-mimicry concepts, Looks and Dvor. Permissions, platform
  actions and future true differentiation concepts remain SF Symbols.
- Product screens do not embed named-brand colors or copy profile tokens.
- New styles must extend this module or a registered reference adapter; they
  must not add another app-local token enum.

## Action semantics

The contract owns meaning; the reference adapter owns mimicry. The exhaustive
variants are `primary`, `secondary`, `destructive`, `quiet`, `icon` and `row`.
Primary is the single body CTA; secondary is a body alternative; destructive
is reserved for persisted deletion/sign-out; quiet is text-level; icon is a
labelled 44pt control; row owns the whole row. Primary never belongs in a menu
or toolbar, and row never belongs outside row placement.

`NativeActionButton` exposes only primary, secondary and destructive geometry.
Quiet, icon and row controls keep the reference recipe while binding to the
generated semantic catalog through `nativeAction`. Async actions must declare
idle/loading/success/error, retry, fallback and any post-adapter product
mutation. Feedback may describe an outcome but can never be the outcome.

## Migration

`Theme`, `DvorStyle` and app-local `Color(hex:)` compatibility paths have been
deleted. New repeated decisions enter this seam only when they have more than
one caller or reference evidence; useful local geometry stays local.
