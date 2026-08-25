import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { compileNativeConcept } from "./compile-concept.mjs";

function listDirectories(root) {
  if (existsSync(join(root, "concept.json"))) return [root];
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(root, entry.name, "concept.json")))
    .map(entry => join(root, entry.name));
}

export function auditLegacyConcept(directory, nativeProjectRoot) {
  let concept;
  try {
    concept = JSON.parse(readFileSync(join(directory, "concept.json"), "utf8"));
  } catch (error) {
    return {
      slug: basename(directory), name: basename(directory),
      legacyEvidence: { htmlScreens: 0, declaredScreens: 0 }, ready: false,
      blockers: [`concept.json не является валидным JSON: ${error.message.split("\n")[0]}`],
    };
  }
  const screens = concept.screens || [];
  const htmlCount = existsSync(join(directory, "screens"))
    ? readdirSync(join(directory, "screens")).filter(file => file.endsWith(".html")).length
    : 0;
  const compiled = compileNativeConcept(concept);
  const nativeApp = existsSync(join(nativeProjectRoot, "native", "apps", concept.slug));
  const captureDrivers = existsSync(join(nativeProjectRoot, "native", "apps", concept.slug, "capture.json"));
  const blockers = [];
  if (!concept.native?.design?.strategy) blockers.push("не выбрана native design strategy");
  if (concept.native?.design?.strategy === "mimicry" && !concept.native.design.referenceProfile) blockers.push("не выбран reference profile");
  for (const diagnostic of compiled.diagnostics.filter(item => item.severity === "error")) {
    blockers.push(`${diagnostic.code}: ${diagnostic.message}`);
  }
  if (!nativeApp) blockers.push("нет SwiftUI implementation adapter");
  if (!captureDrivers) blockers.push("нет executable capture catalog");
  return {
    slug: concept.slug || basename(directory),
    name: concept.name || concept.slug,
    legacyEvidence: { htmlScreens: htmlCount, declaredScreens: screens.length },
    ready: blockers.length === 0,
    blockers,
  };
}

export function auditLegacySource(root, nativeProjectRoot) {
  return listDirectories(root).map(directory => auditLegacyConcept(directory, nativeProjectRoot));
}
