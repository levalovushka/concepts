# Legacy SwiftUI applications

This directory preserves the native applications that existed before the
unified Camo pipeline. They remain runnable and visible in the launcher, but
they are immutable reference output:

- `apps/` contains the original SwiftUI sources;
- `concepts/` contains their original product manifests and documentation;
- `Shared/` pins the compatible DesignSystem, Runtime and VK profile sources;
- `catalog.json` is the only discovery interface used by the launcher;
- `blueprints/` stores legacy manifests that never had a concept directory.

The active pipeline owns only `native/apps/`. It must never write to
`native/Legacy/`. `looks` (`Образы`) is explicitly retained as the reviewed
VK-mimicry reference.
