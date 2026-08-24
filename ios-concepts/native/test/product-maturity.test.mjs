import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  auditCanonicalProductContract,
  developProductConcept,
  migrateLegacyProductContract,
  runDeterministicMaturityGates,
  stableProductArtifactId,
  verifyProductDevelopmentArtifact,
} from "../lib/product-maturity.mjs";
import { productGenerator } from "../fixtures/product-development/fixture-generator.mjs";
import { createStructuredModelProductGenerator } from "../lib/structured-model-product-generator.mjs";

const fixtureRoot = join(import.meta.dirname, "../fixtures/product-development");
const read = name => JSON.parse(readFileSync(join(fixtureRoot, name), "utf8"));

test("weak Product Brief is blocked before the model adapter runs", async () => {
  let called = false;
  const result = await developProductConcept({
    brief: read("weak-brief.json"),
    generator: { async generateCandidates() { called = true; return []; } },
  });
  assert.equal(result.ok, false);
  assert.equal(called, false);
  assert.equal(result.diagnostics.some(item => item.code === "brief.candidate-count.too-small"), true);
  assert.equal(result.diagnostics.some(item => item.code === "brief.permissions.required"), true);
});

test("structured-model adapter sends the real client a bounded operation and deterministic schema", async () => {
  let request = null;
  const generator = createStructuredModelProductGenerator({
    model: { async generateStructured(value) { request = value; return { candidates: [] }; } },
  });
  const brief = read("strong-brief.json");
  await generator.generateCandidates({ brief, rubric: { minimumAxisScore: 3 } });
  assert.equal(request.operation, "camo.product-candidates.v1");
  assert.equal(request.schema.properties.candidates.minItems, 3);
  assert.equal(request.schema.properties.candidates.items.$id.endsWith("concept-candidate.schema.json"), true);
  assert.match(request.input.instructions.join("\n"), /Do not claim evidence/);
});

test("strong brief creates diverse candidates, a stable receipt, and one canonical contract", async () => {
  const brief = read("strong-brief.json");
  const first = await developProductConcept({ brief, generator: productGenerator });
  const second = await developProductConcept({ brief, generator: productGenerator });

  assert.equal(first.ok, true, first.diagnostics.map(item => item.message).join("\n"));
  assert.equal(first.candidates.length, 3);
  assert.equal(first.selectionReceipt.selectedCandidateId, "borrow-circle");
  assert.equal(first.selectionReceipt.receiptId, second.selectionReceipt.receiptId);
  assert.equal(first.productContract.contractId, second.productContract.contractId);
  assert.equal(first.productContract.source.selectionReceiptId, first.selectionReceipt.receiptId);
  assert.equal(first.productContract.maturity.minimumAxisScore, 3);
});

test("a strong average cannot mask one failed stress axis", async () => {
  const result = await developProductConcept({ brief: read("strong-brief.json"), generator: productGenerator });
  const rejected = result.selectionReceipt.candidates.find(item => item.id === "skill-minute");
  const arithmeticMean = Object.values(rejected.axisScores).reduce((sum, value) => sum + value, 0)
    / Object.values(rejected.axisScores).length;

  assert.equal(arithmeticMean > 2.9, true);
  assert.equal(rejected.eligible, false);
  assert.equal(rejected.minimumAxisScore, 2);
  assert.match(rejected.rejectionReasons.join("\n"), /content-supply failed with 2\/4/);
});

test("deterministic gates fail closed for the named weak-product modes", async () => {
  const brief = read("strong-brief.json");
  const [source] = await productGenerator.generateCandidates({ brief, rubric: { minimumAxisScore: 3 } });
  const cases = [
    ["non-generic-product", candidate => { candidate.productThesis = "Лента, чат и профиль — всё в одном"; }],
    ["observable-differentiation", candidate => { candidate.observableDifferentiation.measurement = ""; }],
    ["permission-cohesion", candidate => { candidate.permissions.find(item => item.key === "camera").deniedFallback = ""; }],
    ["cold-start", candidate => { candidate.coldStart.seededContent = ""; }],
    ["content-supply", candidate => { candidate.contentSupply.ongoingSources = [""]; }],
    ["core-loop-evidence", candidate => { candidate.coreLoop.evidenceRefs = ["supply-assumption"]; }],
    ["reference-mental-model-fit", candidate => { candidate.referenceFit.naturalFit = ""; }],
    ["evidence-provenance", candidate => { candidate.insight.evidenceRefs = ["supply-assumption"]; }],
  ];
  for (const [gateId, mutate] of cases) {
    const candidate = structuredClone(source);
    mutate(candidate);
    const gate = runDeterministicMaturityGates(brief, candidate).find(item => item.id === gateId);
    assert.equal(gate.pass, false, `${gateId} unexpectedly passed`);
    assert.equal(gate.reasons.length > 0, true);
  }
});

test("VK Music, VK Video, and OK remain blocked without their own evidence", async () => {
  const baseBrief = read("strong-brief.json");
  const [baseCandidate] = await productGenerator.generateCandidates({ brief: baseBrief, rubric: { minimumAxisScore: 3 } });
  for (const [profileId, family] of [["vk-music-ios", "vk-family"], ["vk-video-ios", "vk-family"], ["ok-ios", "ok-family"]]) {
    const brief = structuredClone(baseBrief);
    brief.reference.profileId = profileId;
    brief.reference.family = family;
    const candidate = structuredClone(baseCandidate);
    candidate.referenceFit.profileId = profileId;
    const gate = runDeterministicMaturityGates(brief, candidate).find(item => item.id === "reference-mental-model-fit");
    assert.equal(gate.pass, false);
    assert.match(gate.reasons.join("\n"), /reference profile incomplete/);
  }
});

test("committed development fixture has stable cross-linked identities", () => {
  const diagnostics = verifyProductDevelopmentArtifact(read("strong-development.json"));
  assert.deepEqual(diagnostics, []);
});

test("portfolio count and candidate identities fail closed", async () => {
  const brief = read("strong-brief.json");
  const source = await productGenerator.generateCandidates({ brief, rubric: { minimumAxisScore: 3 } });
  const tooMany = await developProductConcept({
    brief,
    generator: { async generateCandidates() { return [...source, structuredClone(source[0])]; } },
  });
  assert.equal(tooMany.ok, false);
  assert.equal(tooMany.diagnostics.some(item => item.code === "candidate.count.mismatch"), true);

  const duplicate = structuredClone(source);
  duplicate[1].id = duplicate[0].id;
  const repeatedId = await developProductConcept({
    brief,
    generator: { async generateCandidates() { return duplicate; } },
  });
  assert.equal(repeatedId.ok, false);
  assert.equal(repeatedId.diagnostics.some(item => item.code === "candidate.portfolio.id-duplicate"), true);
});

test("artifact verification reproduces selection instead of trusting a self-hashed receipt", () => {
  const artifact = read("strong-development.json");
  artifact.selectionReceipt.selectedCandidateId = "skill-minute";
  const { receiptId: _oldId, ...body } = artifact.selectionReceipt;
  artifact.selectionReceipt.receiptId = stableProductArtifactId("selection", body);
  const diagnostics = verifyProductDevelopmentArtifact(artifact);
  assert.equal(diagnostics.some(item => item.code === "selection.receipt.reproduction-drift"), true);
});

test("canonical Product Contract revalidates its full product body", () => {
  const contract = read("strong-development.json").productContract;
  contract.contentSupply.ongoingSources = [];
  const { contractId: _oldId, ...body } = contract;
  contract.contractId = stableProductArtifactId("product", body);
  const diagnostics = auditCanonicalProductContract(contract);
  assert.equal(diagnostics.some(item => item.path.includes("contentSupply.ongoingSources")), true);
  assert.equal(diagnostics.some(item => item.code === "product.contract.gate-recomputed-failed"), true);
});

test("legacy compatibility is explicit and restricted to Looks and Dvor", () => {
  const looks = JSON.parse(readFileSync(join(import.meta.dirname, "../../concepts/looks/concept.json"), "utf8"));
  const migrated = migrateLegacyProductContract(looks);
  assert.equal(migrated.status, "migration-baseline");
  assert.equal(migrated.source.kind, "legacy-migration");
  assert.match(migrated.delivery.limitations.join("\n"), /no original multi-candidate selection receipt/i);
  assert.equal(migrateLegacyProductContract({ ...looks, slug: "new-concept" }), null);
});
