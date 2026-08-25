import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return extname(entry.name) === ".swift" ? [path] : [];
  });
}

function includesTerm(value, terms) {
  const normalized = String(value || "").toLocaleLowerCase("ru");
  return terms.some(term => normalized.includes(String(term).toLocaleLowerCase("ru")));
}

export function verifyNativeDelivery(concept, appDirectory) {
  const diagnostics = [];
  const identity = concept?.native?.deliveryIdentity;
  if (!identity) {
    diagnostics.push(diagnostic(
      "delivery.identity.required",
      "Native delivery requires explicit product identity anchors.",
      "native.deliveryIdentity",
    ));
    return { ok: false, diagnostics };
  }

  const files = sourceFiles(appDirectory);
  const source = files.map(path => readFileSync(path, "utf8")).join("\n");
  if (!files.length) diagnostics.push(diagnostic(
    "delivery.implementation.required", "Native product realization has no Swift sources.", appDirectory,
  ));
  if (/ManifestConceptRootView|ManifestConceptSurface/.test(source)) diagnostics.push(diagnostic(
    "delivery.generic-renderer.forbidden",
    "A specification viewer cannot be shipped as a native product realization.",
    appDirectory,
  ));
  if (concept?.native?.design?.strategy === "differentiation"
      && /VKTabHeader|VKNavigationChrome|\.vkNavigation\s*\(/.test(source)) diagnostics.push(diagnostic(
    "delivery.differentiation.reference-shell-forbidden",
    "A differentiation concept cannot use the VK reference shell as its interface foundation.",
    appDirectory,
  ));
  for (const [index, tab] of (concept?.native?.navigation?.tabs || []).entries()) {
    if (!tab.systemImage || ["circle", "circle.fill"].includes(tab.systemImage)) diagnostics.push(diagnostic(
      "delivery.navigation.placeholder-icon",
      `Tab ${tab.id} uses a placeholder instead of a semantic product icon.`,
      `native.navigation.tabs[${index}].systemImage`,
    ));
  }

  for (const surface of identity.coreSurfaces || []) {
    const marker = `.nativeSurface(\"${surface}\")`;
    const routedOwnedSurface = source.includes(".nativeSurface(") && source.includes(`\"${surface}\"`);
    if (!source.includes(marker) && !routedOwnedSurface) diagnostics.push(diagnostic(
      "delivery.core-surface.unrealized",
      `Core surface ${surface} has no owned native realization marker.`,
      `native.deliveryIdentity.coreSurfaces.${surface}`,
    ));
  }

  const fixtures = concept?.ux?.fixtures || [];
  const fixtureText = JSON.stringify(fixtures);
  for (const term of identity.forbiddenVocabulary || []) if (includesTerm(fixtureText, [term])) diagnostics.push(diagnostic(
    "delivery.fixture.cross-product-contamination",
    `Fixture catalog contains forbidden cross-product vocabulary: ${term}.`,
    "ux.fixtures",
  ));
  for (const term of identity.requiredVocabulary || []) if (!includesTerm(fixtureText, [term])) diagnostics.push(diagnostic(
    "delivery.fixture.identity-missing",
    `Fixture catalog never demonstrates required product unit: ${term}.`,
    "ux.fixtures",
  ));

  const firstSurface = identity.firstFrame?.surface;
  if (firstSurface && source.includes(`NativeCapabilityControls(surfaceID: "${firstSurface}")`)) diagnostics.push(diagnostic(
    "delivery.first-frame.permission-preprompt",
    "The first product frame cannot render a raw capability request before a contextual user gesture.",
    "native.deliveryIdentity.firstFrame",
  ));
  const firstFixtures = fixtures.filter(item => item.surface === firstSurface && ["default", "populated/default"].includes(item.state));
  if (!firstSurface || !firstFixtures.length || !includesTerm(JSON.stringify(firstFixtures), identity.firstFrame?.mustExpose || [])) diagnostics.push(diagnostic(
    "delivery.first-frame.promise-missing",
    "The first populated frame does not expose a declared product promise.",
    "native.deliveryIdentity.firstFrame",
  ));

  return { ok: diagnostics.length === 0, diagnostics };
}
