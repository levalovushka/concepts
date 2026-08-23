# Compile concept.json into a native manifest

Camo keeps `concept.json` as the single product source of truth and compiles it into a validated native manifest before generating Swift or Xcode artifacts. Swift applications may implement the composition of a product surface, but they may not redefine navigation, product states, permissions, or capabilities; this preserves product intent without forcing product authors to write build-system details into the concept.

The compiler owns the mapping from a permission to its iOS capabilities because that mapping changes with the platform and may require several artifacts. Generated manifests and Xcode projects are disposable build output, never a second hand-maintained specification.
