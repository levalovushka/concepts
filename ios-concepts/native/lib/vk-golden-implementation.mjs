const REQUIRED_PRIMITIVES = Object.freeze([
  "VKRootSurface", "VKTabHeader", "VKAuthoredPost", "VKPostActions",
  "VKNavigationChrome", "VKModalChrome", "VKPrimaryActionArea", "VKGroup", "VKRow",
]);
const FORBIDDEN_PATTERNS = Object.freeze([
  Object.freeze({ pattern: /\bForm\s*\{/m, label: "SwiftUI Form" }),
  Object.freeze({ pattern: /\bContentUnavailableView\s*\(/m, label: "ContentUnavailableView" }),
  Object.freeze({ pattern: /\.listStyle\s*\(\s*\.insetGrouped\s*\)/m, label: "insetGrouped List" }),
  Object.freeze({ pattern: /\.navigationTitle\s*\(/m, label: "automatic navigationTitle chrome" }),
  Object.freeze({ pattern: /\bLinearGradient\s*\(/m, label: "decorative gradient" }),
  Object.freeze({ pattern: /\.background\s*\(\s*\.(?:ultraThin|thin|regular|thick)Material/m, label: "ad-hoc glass material" }),
]);

export function auditVKGoldenImplementation({ strategy, referenceProfile, swiftSource }) {
  if (strategy !== "mimicry" || referenceProfile !== "vk-ios") return [];
  const diagnostics = [];
  for (const rule of FORBIDDEN_PATTERNS) if (rule.pattern.test(swiftSource)) diagnostics.push(Object.freeze({
    code: "vk-golden.forbidden-generic-composition",
    message: `VK mimicry cannot use ${rule.label}; compose the approved Looks/VK primitives instead`,
  }));
  for (const primitive of REQUIRED_PRIMITIVES) if (!swiftSource.includes(primitive)) diagnostics.push(Object.freeze({
    code: "vk-golden.primitive-missing",
    message: `VK mimicry is missing required golden primitive ${primitive}`,
  }));
  return diagnostics;
}

export const VK_GOLDEN_REQUIRED_PRIMITIVES = REQUIRED_PRIMITIVES;
