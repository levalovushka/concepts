# Lucide assets in native mimicry

Scope is deliberately narrow: VK-mimicry product-chrome root tabs in Looks and
Dvor. System permission UI, platform actions and future true differentiation
concepts use SF Symbols.

- Source: `lucide-static` 0.525.0, five vendored SVGs, 24×24 viewBox.
- License: ISC; the full upstream notice is vendored beside the source.
- Rendering: generated Xcode vector image sets with template intent.
- Regular stroke: 2; selected stroke: 2.5; optical box and paths are unchanged.
- Runtime: no network, JavaScript package, custom drawing or icon placeholder.
- Container: system SwiftUI `TabView`, preserving accessibility hit targets and
  Liquid Glass. There is no custom tab bar.

The asset-generation tests reject missing license/version, external SVG
references, scripts, a non-24pt viewBox, incomplete semantic tab roles and
non-deterministic output.

Upstream package: https://www.npmjs.com/package/lucide-static/v/0.525.0
Project/license: https://github.com/lucide-icons/lucide
