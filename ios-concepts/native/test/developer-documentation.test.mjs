import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { auditDeveloperDocumentation, compileDeveloperDocumentation } from "../lib/developer-documentation.mjs";

const root = join(import.meta.dirname, "../..");

for (const slug of ["looks", "dvor"]) {
  test(`${slug} developer guide is generated from the same compiled contract without drift`, () => {
    const concept = JSON.parse(readFileSync(join(root, "concepts", slug, "concept.json"), "utf8"));
    const manifest = compileNativeConcept(concept).manifest;
    const result = auditDeveloperDocumentation({ root, concept, manifest });
    assert.equal(result.ok, true, result.diagnostics.map(item => item.message).join("\n"));
  });
}

test("documentation blocks instead of emitting an empty mandatory section", () => {
  const concept = JSON.parse(readFileSync(join(root, "concepts", "looks", "concept.json"), "utf8"));
  const manifest = structuredClone(compileNativeConcept(concept).manifest);
  manifest.product.contract.delivery.analytics.events = [];
  const result = compileDeveloperDocumentation({ concept, manifest });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.path === "delivery.analytics.events"), true);
  assert.equal(result.markdown, "");
});

test("developer guide contains every required delivery concern", () => {
  const source = readFileSync(join(root, "concepts", "looks", "docs", "developer-guide.md"), "utf8");
  for (const heading of [
    "Product vision and scope", "Domain glossary", "Personas and jobs", "Core loop and critical flows",
    "Information architecture and navigation", "Screen, state, and action matrix",
    "Canonical UX state handling", "Design tokens and semantic component roles",
    "Localization string catalog", "Executable acceptance scenarios", "Deterministic fixture catalog",
    "Permissions, capabilities, and entitlements", "Architecture and module boundaries",
    "Data, state, persistence, and integrations", "Loading, empty, error, denied, and offline states",
    "Privacy, security, and trust", "Accessibility and localization",
    "Analytics event plan and success metrics", "Testing, evidence, and capture plan",
    "Setup, build, and run", "Generated and owned file map",
    "Limitations, risks, and acceptance criteria", "App Store notes",
  ]) assert.match(source, new RegExp(`## ${heading}`));
});
