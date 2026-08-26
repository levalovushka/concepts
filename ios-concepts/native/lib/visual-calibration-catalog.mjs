import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = join(nativeRoot, "..");
const source = JSON.parse(readFileSync(join(nativeRoot, "VisualCalibrations", "catalog.json"), "utf8"));

export const VISUAL_CALIBRATION_CATALOG = Object.freeze(source.profiles.map(profile => Object.freeze(structuredClone(profile))));

export function resolveVisualCalibration({ strategy, referenceProfileId = null }) {
  return VISUAL_CALIBRATION_CATALOG.find(profile => profile.strategy === strategy
    && (strategy !== "mimicry" || profile.referenceProfileId === referenceProfileId)) || null;
}

export function auditVisualCalibrationCatalog() {
  const diagnostics = [];
  const ids = new Set();
  for (const [index, profile] of VISUAL_CALIBRATION_CATALOG.entries()) {
    const path = `profiles[${index}]`;
    if (ids.has(profile.id)) diagnostics.push({ code: "calibration.id.duplicate", path: `${path}.id`, message: `Duplicate visual calibration ${profile.id}` });
    ids.add(profile.id);
    if (!["mimicry", "differentiation"].includes(profile.strategy)) diagnostics.push({ code: "calibration.strategy.invalid", path: `${path}.strategy`, message: `Unsupported strategy ${profile.strategy}` });
    if (profile.strategy === "mimicry" && (!profile.referenceProfileId || profile.kind !== "approved-golden-concept")) diagnostics.push({ code: "calibration.mimicry.incomplete", path, message: "Mimicry calibration requires an approved golden concept and exact reference profile" });
    if (profile.strategy === "differentiation" && profile.kind !== "approved-system-baseline") diagnostics.push({ code: "calibration.differentiation.kind", path: `${path}.kind`, message: "Differentiation must use an approved system baseline, not an arbitrary concept" });
    if (!profile.transferScope?.length || !profile.nonTransferable?.length || !profile.requiredEvidenceRefs?.length) diagnostics.push({ code: "calibration.boundary.incomplete", path, message: `${profile.id} must state transferable and non-transferable decisions` });
    if (profile.kind === "approved-golden-concept" && (!profile.implementationRecipes
        || !["shell", "feed", "navigation", "messages", "profile", "contentBoundary"].every(key => profile.implementationRecipes[key]))) {
      diagnostics.push({ code: "calibration.recipes.incomplete", path: `${path}.implementationRecipes`, message: `${profile.id} must expose executable implementation recipes for the native renderer` });
    }
    if (profile.kind === "approved-golden-concept" && (!profile.goldenCaptures
        || !["feed", "post", "messages", "conversation", "profile"].every(key => profile.goldenCaptures[key]))) {
      diagnostics.push({ code: "calibration.captures.incomplete", path: `${path}.goldenCaptures`, message: `${profile.id} must expose reviewed golden captures for every core VK anatomy` });
    }
    for (const [role, capturePath] of Object.entries(profile.goldenCaptures || {})) if (!existsSync(join(projectRoot, capturePath))) diagnostics.push({
      code: "calibration.capture.missing", path: `${path}.goldenCaptures.${role}`, message: `Golden capture does not exist: ${capturePath}`,
    });
    for (const [sourceIndex, sourcePath] of (profile.sourcePaths || []).entries()) if (!existsSync(join(projectRoot, sourcePath))) diagnostics.push({
      code: "calibration.source.missing", path: `${path}.sourcePaths[${sourceIndex}]`, message: `Calibration source does not exist: ${sourcePath}`,
    });
  }
  return diagnostics;
}
