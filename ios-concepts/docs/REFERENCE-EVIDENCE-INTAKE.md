# Reference evidence intake contract

Do not create VK Music, VK Video or OK native adapters from memory, web copy,
HTML concepts or adjacent VK products. A profile unlocks only from captured,
versioned iOS evidence supplied or explicitly approved by the user.

## Required package per product

Provide original PNG screenshots or lossless screen-recording frames for one
real iPhone model and one iOS/app version. Every file needs this metadata:

- product (`vk-music-ios`, `vk-video-ios`, `ok-ios`), app version/build;
- iOS version/build, device model and logical resolution;
- locale, light/dark mode, text-size category, signed-in/out status;
- surface, state, selected tab, entry gesture and timestamp;
- whether system chrome/TCC is visible; redact personal data without cropping UI.

Required shared states: launch/auth, every root tab selected and unselected,
pushed navigation, modal/sheet, loading, populated, empty, error, offline,
permission pre-prompt/fallback, badge and long-content/scroll edge.

Product-specific surfaces:

- VK Music: home, search, library, album, artist, player, queue, downloaded.
- VK Video: home, search, subscriptions, video detail, player, comments,
  short-video.
- OK: feed, discovery, messages, video, menu, profile, post, group, settings.

For each root tab include a full-screen frame with that tab selected. For
typography/chrome measurement include at least one uncropped 1× screenshot;
for interaction provide a short recording from the previous stable state.

## Ingestion

1. Put evidence under `native/ReferenceProfiles/<id>/evidence/<app-version>/`.
2. Add a manifest with SHA-256, metadata and surface/state mapping.
3. Extract only repeated/evidence-backed palette, type, metric, icon and chrome
   decisions into `profile.json`; add Swift recipes only for proven families.
4. Keep source frames immutable. Generated crops/contact sheets are derived.

## Gates unlocked

The adapter remains blocked until all required surfaces exist, hashes and
metadata validate, source paths resolve, the visual contract is extracted,
native recipes/tokens exist, tab icon source is licensed and deterministic,
current + small-phone captures pass, and an independent reviewer signs the
side-by-side rubric. Passing one product never unlocks another product.
