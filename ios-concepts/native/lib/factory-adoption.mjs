import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateFactoryRequest } from "./product-factory.mjs";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = join(nativeRoot, "..");
const source = JSON.parse(readFileSync(join(nativeRoot, "FactoryAdoption", "catalog.json"), "utf8"));
const statuses = new Set(["calibration-source", "next", "queued", "product-rework-required", "factory-native"]);

function nativeConceptSlugs() {
  const apps = new Set(readdirSync(join(nativeRoot, "apps"), { withFileTypes: true }).filter(item => item.isDirectory()).map(item => item.name));
  return readdirSync(join(projectRoot, "concepts"), { withFileTypes: true })
    .filter(item => item.isDirectory() && apps.has(item.name) && existsSync(join(projectRoot, "concepts", item.name, "concept.json")))
    .map(item => item.name).sort();
}

export const FACTORY_ADOPTION_CATALOG = Object.freeze(source.concepts.map(item => Object.freeze({ ...item })));

export function auditFactoryAdoption() {
  const diagnostics = [];
  const entries = new Map();
  for (const [index, entry] of FACTORY_ADOPTION_CATALOG.entries()) {
    const path = `concepts[${index}]`;
    if (entries.has(entry.slug)) diagnostics.push({ code: "adoption.slug.duplicate", path: `${path}.slug`, message: `Duplicate adoption entry ${entry.slug}` });
    entries.set(entry.slug, entry);
    if (!statuses.has(entry.status)) diagnostics.push({ code: "adoption.status.invalid", path: `${path}.status`, message: `Unknown adoption status ${entry.status}` });
    const conceptPath = join(projectRoot, "concepts", entry.slug, "concept.json");
    if (!existsSync(conceptPath)) {
      diagnostics.push({ code: "adoption.concept.missing", path, message: `Missing native concept ${entry.slug}` });
      continue;
    }
    const concept = JSON.parse(readFileSync(conceptPath, "utf8"));
    if (concept.productDevelopment?.productContract?.contractId !== entry.productContractId) diagnostics.push({
      code: "adoption.contract.drift", path: `${path}.productContractId`, message: `${entry.slug} Product Contract changed without adoption review`,
    });
    if (concept.native?.design?.strategy !== entry.strategy) diagnostics.push({
      code: "adoption.strategy.drift", path: `${path}.strategy`, message: `${entry.slug} strategy changed without adoption review`,
    });
    if (entry.status === "next") {
      const requestPath = entry.requestPath && join(projectRoot, entry.requestPath);
      if (!requestPath || !existsSync(requestPath)) diagnostics.push({
        code: "adoption.request.missing", path: `${path}.requestPath`, message: `${entry.slug} is next but has no runnable Factory Request`,
      });
      else {
        const request = JSON.parse(readFileSync(requestPath, "utf8"));
        diagnostics.push(...validateFactoryRequest(request).map(item => ({ ...item, code: `adoption.${item.code}`, path: `${path}.request.${item.path}` })));
        if (request.strategy !== entry.strategy) diagnostics.push({ code: "adoption.request.strategy-drift", path: `${path}.request.strategy`, message: `${entry.slug} request strategy differs from adoption decision` });
      }
    }
    if (entry.status === "factory-native") {
      for (const filename of ["01-factory-request.json", "02-product-development.json", "03-experience-contract.json", "04-visual-development.json", "05-release.json"]) {
        if (!existsSync(join(projectRoot, "concepts", entry.slug, "factory", filename))) diagnostics.push({
          code: "adoption.artifact.missing", path: `${path}.status`, message: `${entry.slug} cannot be factory-native without ${filename}`,
        });
      }
    }
  }
  for (const slug of nativeConceptSlugs()) if (!entries.has(slug)) diagnostics.push({ code: "adoption.entry.missing", path: "concepts", message: `Native concept ${slug} has no adoption decision` });
  for (const slug of entries.keys()) if (!nativeConceptSlugs().includes(slug)) diagnostics.push({ code: "adoption.entry.orphan", path: "concepts", message: `Adoption entry ${slug} has no native implementation` });
  const orders = FACTORY_ADOPTION_CATALOG.map(item => item.order);
  if (new Set(orders).size !== orders.length) diagnostics.push({ code: "adoption.order.duplicate", path: "concepts", message: "Adoption order must be deterministic" });
  return diagnostics;
}

export function planFactoryAdoption(slug) {
  const entry = FACTORY_ADOPTION_CATALOG.find(item => item.slug === slug);
  if (!entry) throw new Error(`Unknown native concept ${slug}`);
  return Object.freeze({
    schemaVersion: 1,
    ...entry,
    mayMutateCompatibilitySource: false,
    promotionRule: "Replace compatibility source only after a complete factory release and explicit visual approval",
    requiredArtifacts: Object.freeze([
      "01-factory-request.json", "02-product-development.json", "03-experience-contract.json",
      "04-visual-development.json", "05-release.json",
    ]),
  });
}
