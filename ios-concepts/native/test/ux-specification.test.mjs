import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { auditUXSpecification, CANONICAL_UX_STATES, compileUXSpecification } from "../lib/ux-specification.mjs";

const root = join(import.meta.dirname, "../..");
const concepts = Object.fromEntries(["looks", "dvor"].map(slug => [
  slug,
  JSON.parse(readFileSync(join(root, "concepts", slug, "concept.json"), "utf8")),
]));
const compiled = Object.fromEntries(Object.entries(concepts).map(([slug, concept]) => [slug, compileNativeConcept(concept)]));

for (const slug of ["looks", "dvor"]) {
  test(`${slug} compiles a complete canonical UX Specification`, () => {
    const result = compiled[slug];
    assert.equal(result.ok, true, result.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
    const ux = result.manifest.uxSpecification;
    assert.equal(ux.productContractId, result.manifest.product.contract.contractId);
    assert.equal(ux.navigation.nodes.length, concepts[slug].screens.length);
    assert.equal(ux.navigation.reachable.length, concepts[slug].screens.length);
    assert.equal(ux.localization.catalog.length > 100, true);
    assert.equal(ux.acceptanceScenarios.length > 20, true);
    assert.equal(ux.fixtures.length >= result.manifest.verification.states.length, true);
    assert.doesNotMatch(JSON.stringify(ux).toLowerCase(), /html(?:-|_| )?(?:mapping|screen|class)/);
    for (const screen of ux.screens) assert.deepEqual(screen.states.map(item => item.id), CANONICAL_UX_STATES);
  });
}

test("orphan and parentless pushed surfaces fail closed", () => {
  const concept = structuredClone(concepts.looks);
  delete concept.ux;
  concept.screens.push({
    id: "ghost", title: "Скрытый экран", type: "push", parent: null,
    ui: { pattern: "detail", purpose: "Скрытая задача", states: ["default"], componentFamilies: ["summary"], actions: [] },
  });
  const base = compiled.looks.manifest;
  const result = compileUXSpecification(concept, base.product.contract, {
    surfaces: [...base.surfaces, { id: "ghost", title: "Скрытый экран", purpose: "Скрытая задача", presentation: "push", parent: null, states: ["default"] }],
    permissions: base.permissions,
    actions: base.interactions.actions,
    design: { tokens: base.design.tokens },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "ux.navigation.orphan-screen"), true);
  assert.equal(result.diagnostics.some(item => item.code === "ux.navigation.parent-required"), true);
});

test("declared reachability cannot spoof a broken graph transition", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  const ux = structuredClone(compiled.looks.manifest.uxSpecification);
  const action = ux.actions.find(item => item.outcome?.type === "navigate");
  ux.navigation.edges = ux.navigation.edges.filter(edge => !(edge.from === action.surface && edge.to === action.outcome.target));
  assert.equal(ux.navigation.reachable.includes(action.outcome.target), true);

  const diagnostics = auditUXSpecification(ux, concept, contract);
  assert.equal(diagnostics.some(item => item.code === "ux.navigation.action-transition-missing"), true);
});

test("malformed UX collections become diagnostics instead of compiler exceptions", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  const ux = structuredClone(compiled.looks.manifest.uxSpecification);
  ux.navigation.reachable = null;
  ux.navigation.nodes[0].entries = null;
  ux.screens[0].states = null;
  ux.acceptanceScenarios[0].when = [];

  let diagnostics;
  assert.doesNotThrow(() => { diagnostics = auditUXSpecification(ux, concept, contract); });
  assert.equal(diagnostics.some(item => item.code === "ux.navigation.semantics-incomplete"), true);
  assert.equal(diagnostics.some(item => item.code === "ux.state.required-missing"), true);
  assert.equal(diagnostics.some(item => item.code === "ux.scenario.phase-empty"), true);
});

test("missing Product Contract blocks UX compilation without throwing", () => {
  let result;
  assert.doesNotThrow(() => {
    result = compileUXSpecification({ slug: "new-product", screens: [], permissions: [], native: {} }, null);
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "ux.product-contract.required"), true);
});

test("actions without outcomes or destinations fail closed", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  for (const mutate of [
    ux => { ux.actions[0].outcome = null; },
    ux => { ux.actions[0].outcome = { type: "navigate", target: "ghost" }; },
  ]) {
    const ux = structuredClone(compiled.looks.manifest.uxSpecification);
    mutate(ux);
    const diagnostics = auditUXSpecification(ux, concept, contract);
    assert.equal(diagnostics.some(item => ["ux.action.outcome-missing", "ux.action.destination-missing"].includes(item.code)), true);
  }
});

test("required state handling and N/A rationale are mandatory", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  const missing = structuredClone(compiled.looks.manifest.uxSpecification);
  missing.screens[0].states = missing.screens[0].states.filter(item => item.id !== "offline");
  assert.equal(auditUXSpecification(missing, concept, contract).some(item => item.code === "ux.state.required-missing"), true);

  const unjustified = structuredClone(compiled.looks.manifest.uxSpecification);
  const state = unjustified.screens[0].states.find(item => !item.applicable);
  state.rationale = "";
  assert.equal(auditUXSpecification(unjustified, concept, contract).some(item => item.code === "ux.state.not-applicable-unjustified"), true);
});

test("localization catalog is closed over every contract-level user string", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  const ux = structuredClone(compiled.looks.manifest.uxSpecification);
  const key = ux.actions[0].labelKey;
  ux.localization.catalog = ux.localization.catalog.filter(item => item.key !== key);
  const diagnostics = auditUXSpecification(ux, concept, contract);
  assert.equal(diagnostics.some(item => item.code === "ux.localization.key-missing"), true);

  const bare = structuredClone(compiled.looks.manifest.uxSpecification);
  bare.navigation.nodes[0].guards.push("Голая пользовательская строка");
  assert.equal(auditUXSpecification(bare, concept, contract).some(item => item.code === "ux.localization.bare-string"), true);
});

test("critical flow, permission fallback, and captured fixture coverage are mandatory", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;

  const scenarios = structuredClone(compiled.looks.manifest.uxSpecification);
  const criticalFlowId = contract.delivery.criticalFlows[0].id;
  scenarios.acceptanceScenarios = scenarios.acceptanceScenarios.filter(item => !(item.flowId === criticalFlowId && item.coverage === "offline"));
  assert.equal(auditUXSpecification(scenarios, concept, contract).some(item => item.code === "ux.acceptance.critical-flow-uncovered"), true);

  const permission = structuredClone(compiled.looks.manifest.uxSpecification);
  permission.acceptanceScenarios = permission.acceptanceScenarios.filter(item => item.flowId !== "permission:camera");
  assert.equal(auditUXSpecification(permission, concept, contract).some(item => item.code === "ux.acceptance.permission-uncovered"), true);

  const fixtures = structuredClone(compiled.looks.manifest.uxSpecification);
  fixtures.fixtures = fixtures.fixtures.filter(item => item.id !== "fixture.looks.home.default");
  assert.equal(auditUXSpecification(fixtures, concept, contract).some(item => item.code === "ux.fixture.captured-state-missing"), true);
});

test("fixture media requires provenance and license", () => {
  const concept = concepts.looks;
  const contract = compiled.looks.manifest.product.contract;
  const ux = structuredClone(compiled.looks.manifest.uxSpecification);
  const fixture = ux.fixtures.find(item => item.media.length);
  delete fixture.media[0].license;
  assert.equal(auditUXSpecification(ux, concept, contract).some(item => item.code === "ux.fixture.media-provenance-missing"), true);
});

test("new mature Product Contracts cannot use the legacy UX derivation", () => {
  const concept = structuredClone(concepts.looks);
  delete concept.ux;
  const contract = structuredClone(compiled.looks.manifest.product.contract);
  contract.status = "mature";
  contract.maturity.status = "mature";
  contract.source.kind = "selected-candidate";
  const result = compileUXSpecification(concept, contract, {
    surfaces: compiled.looks.manifest.surfaces,
    permissions: compiled.looks.manifest.permissions,
    actions: compiled.looks.manifest.interactions.actions,
    design: { tokens: compiled.looks.manifest.design.tokens },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "ux.explicit-source.required"), true);
});
