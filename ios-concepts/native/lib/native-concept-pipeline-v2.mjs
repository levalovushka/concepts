import { performance } from "node:perf_hooks";
import { compileCapabilityPlanV2 } from "./capability-plan-v2.mjs";
import { createProductCoreArtifact, validateProductPortfolio } from "./product-core-v2.mjs";
import { resolveProductTarget } from "./product-target-catalog.mjs";
import { resolveReferenceProfile } from "./reference-profile-catalog.mjs";
import { verifyNativeSliceContract } from "./native-slice-contract.mjs";
import { verifyNativeFullContractV2 } from "./native-full-contract-v2.mjs";

const MAX_REVISIONS = 2;

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function missingAdapter(adapters, path) {
  return path.split(".").reduce((value, key) => value?.[key], adapters) ? null : path;
}

function verifyAdapters(adapters, mode) {
  const required = [
    "studio.explore", "studio.develop", "capabilityPlanner.bind", "experiencePlanner.planSlice",
    "kernel.buildSlice", "reviewer.review", "repairer.repairSlice",
  ];
  if (mode === "full") required.push("expander.expand", "kernel.buildFull", "repairer.repairFull");
  return required.map(path => missingAdapter(adapters, path)).filter(Boolean);
}

function deliveryDiagnostics(delivery, requiredCaptureIds, scope) {
  const diagnostics = [];
  if (delivery?.buildReceipt?.passed !== true) diagnostics.push(diagnostic("delivery.build", `${scope} requires a passing native build`, `${scope}.buildReceipt`));
  if (delivery?.interactionReceipt?.passed !== true) diagnostics.push(diagnostic("delivery.interactions", `${scope} requires executable interaction proof`, `${scope}.interactionReceipt`));
  if (delivery?.documentationReceipt?.passed !== true) diagnostics.push(diagnostic("delivery.documentation", `${scope} requires drift-checked developer documentation`, `${scope}.documentationReceipt`));
  const captured = new Set((delivery?.captures || []).map(item => item.id));
  for (const id of requiredCaptureIds) if (!captured.has(id)) diagnostics.push(diagnostic("delivery.capture", `${scope} is missing capture ${id}`, `${scope}.captures`));
  return diagnostics;
}

function reviewDiagnostics(review, scope) {
  const blockers = review?.blockers || [];
  if (review?.passed === true && blockers.length === 0) return [];
  return (blockers.length ? blockers : ["Independent review did not pass"]).map((message, index) => diagnostic(
    "review.blocker", message, `${scope}.review.blockers[${index}]`,
  ));
}

export async function runNativeConceptPipeline({
  request,
  selectedCandidateId = null,
  mode = "slice",
  adapters,
  onProgress = null,
}) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const measurements = [];
  const artifacts = { request: structuredClone(request) };
  const stage = async (id, operation) => {
    const stageStarted = performance.now();
    onProgress?.({ type: "stage-start", stage: id });
    const value = await operation();
    const durationMs = Math.round((performance.now() - stageStarted) * 100) / 100;
    measurements.push(Object.freeze({ id, durationMs }));
    onProgress?.({ type: "stage-complete", stage: id, durationMs });
    return value;
  };
  const result = (ok, currentStage, diagnostics = [], extra = {}) => Object.freeze({
    ok,
    stage: currentStage,
    diagnostics: Object.freeze(diagnostics),
    artifacts: Object.freeze({ ...artifacts }),
    measurements: Object.freeze([...measurements]),
    metrics: Object.freeze({ startedAt, finishedAt: new Date().toISOString(), wallClockMs: Math.round((performance.now() - started) * 100) / 100 }),
    ...extra,
  });

  if (!["slice", "full"].includes(mode)) return result(false, "request", [diagnostic("request.mode", "mode must be slice or full", "mode")]);
  const missing = verifyAdapters(adapters, mode);
  if (missing.length) return result(false, "request", missing.map(path => diagnostic("factory.adapter", `Required adapter ${path} is missing`, `adapters.${path}`)));
  const target = resolveProductTarget(request?.targetProduct);
  if (!request?.id || !request?.request || !target) return result(false, "request", [diagnostic("request.invalid", "Request id, product request and known targetProduct are required", "request")]);
  const reference = request.strategy === "mimicry" ? resolveReferenceProfile(target.mimicryProfileId) : null;
  if (request.strategy === "mimicry" && reference?.evidenceStatus !== "ready") return result(false, "request", [diagnostic("request.reference", "Mimicry requires an evidence-ready reference profile", "targetProduct")]);

  const portfolio = await stage("product-exploration", () => adapters.studio.explore({ request: structuredClone(request), target, reference }));
  artifacts.portfolio = portfolio;
  const portfolioProblems = validateProductPortfolio(portfolio);
  if (portfolioProblems.length) return result(false, "product-exploration", portfolioProblems);
  if (!selectedCandidateId) return result(false, "selection", [], {
    needsSelection: true,
    choices: Object.freeze(portfolio.candidates.map(item => Object.freeze({ id: item.id, name: item.name, thesis: item.thesis }))),
    recommendationId: portfolio.recommendationId,
  });
  const selected = portfolio.candidates.find(item => item.id === selectedCandidateId);
  if (!selected) return result(false, "selection", [diagnostic("selection.unknown", `Unknown candidate ${selectedCandidateId}`, "selectedCandidateId")]);
  artifacts.selection = Object.freeze({ selectedCandidateId, selectedBy: "human", recommendationId: portfolio.recommendationId });

  const core = await stage("product-core", () => adapters.studio.develop({ request: structuredClone(request), selected: structuredClone(selected), portfolio, target, reference }));
  const productCore = createProductCoreArtifact({ request, core, portfolio, selectedBy: "human" });
  if (!productCore.ok) return result(false, "product-core", productCore.diagnostics);
  artifacts.productCore = productCore.artifact;

  const capabilityProposal = await stage("capability-grounding", () => adapters.capabilityPlanner.bind({ productCore: productCore.artifact, target, reference }));
  const capability = compileCapabilityPlanV2({
    productCoreArtifact: productCore.artifact,
    target,
    proposal: capabilityProposal,
    bundleId: `com.camo.${core.id.replace(/[^a-z0-9]/g, "")}`,
  });
  if (!capability.ok) return result(false, "capability-grounding", capability.diagnostics);
  artifacts.capabilityPlan = capability.plan;

  let sliceContract = await stage("vertical-slice-plan", () => adapters.experiencePlanner.planSlice({ productCore: productCore.artifact, capabilityPlan: capability.plan, reference }));
  let sliceProblems = verifyNativeSliceContract(sliceContract, productCore.artifact);
  if (sliceProblems.length) return result(false, "vertical-slice-plan", sliceProblems);
  artifacts.sliceContract = sliceContract;

  const sliceAttempts = [];
  let sliceReview;
  for (let attempt = 0; attempt <= MAX_REVISIONS; attempt += 1) {
    const delivery = await stage(`slice-build-${attempt + 1}`, () => adapters.kernel.buildSlice({
      productCore: productCore.artifact, capabilityPlan: capability.plan, sliceContract, reference,
    }));
    const expected = sliceContract.surfaces.map(surface => `${surface.id}--populated/default`);
    const deliveryProblems = deliveryDiagnostics(delivery, expected, "slice");
    if (deliveryProblems.length) return result(false, "slice-build", deliveryProblems);
    sliceReview = await stage(`slice-review-${attempt + 1}`, () => adapters.reviewer.review({
      scope: "slice", productCore: productCore.artifact, contract: sliceContract, delivery, reference,
    }));
    sliceAttempts.push(Object.freeze({ attempt: attempt + 1, contract: sliceContract, delivery, review: sliceReview }));
    if (!reviewDiagnostics(sliceReview, "slice").length) break;
    if (attempt === MAX_REVISIONS) {
      artifacts.sliceAttempts = Object.freeze(sliceAttempts);
      return result(false, "slice-review", reviewDiagnostics(sliceReview, "slice"));
    }
    sliceContract = await stage(`slice-repair-${attempt + 1}`, () => adapters.repairer.repairSlice({
      productCore: productCore.artifact, capabilityPlan: capability.plan, contract: sliceContract,
      delivery, review: sliceReview, reference,
    }));
    sliceProblems = verifyNativeSliceContract(sliceContract, productCore.artifact);
    if (sliceProblems.length) return result(false, "slice-repair", sliceProblems);
  }
  artifacts.sliceContract = sliceContract;
  artifacts.sliceAttempts = Object.freeze(sliceAttempts);
  artifacts.sliceApproval = Object.freeze({ passed: true, acceptedContract: sliceContract, review: sliceReview });
  if (mode === "slice") return result(true, "slice-approved");

  let fullContract = await stage("full-expansion", () => adapters.expander.expand({
    productCore: productCore.artifact,
    capabilityPlan: capability.plan,
    acceptedSlice: sliceContract,
    sliceReview,
    reference,
  }));
  let fullProblems = verifyNativeFullContractV2(fullContract, {
    productCoreArtifact: productCore.artifact, capabilityPlan: capability.plan, acceptedSlice: sliceContract,
  });
  if (fullProblems.length) return result(false, "full-expansion", fullProblems);
  artifacts.fullContract = fullContract;
  const fullAttempts = [];
  let fullReview;
  for (let attempt = 0; attempt <= MAX_REVISIONS; attempt += 1) {
    const delivery = await stage(`full-build-${attempt + 1}`, () => adapters.kernel.buildFull({
      productCore: productCore.artifact, capabilityPlan: capability.plan, sliceContract, fullContract, reference,
    }));
    const deliveryProblems = deliveryDiagnostics(delivery, fullContract.verification.captures.map(item => item.id), "full");
    if (deliveryProblems.length) return result(false, "full-build", deliveryProblems);
    fullReview = await stage(`full-review-${attempt + 1}`, () => adapters.reviewer.review({
      scope: "full", productCore: productCore.artifact, contract: fullContract, delivery, reference,
    }));
    fullAttempts.push(Object.freeze({ attempt: attempt + 1, contract: fullContract, delivery, review: fullReview }));
    if (!reviewDiagnostics(fullReview, "full").length) break;
    if (attempt === MAX_REVISIONS) {
      artifacts.fullAttempts = Object.freeze(fullAttempts);
      return result(false, "full-review", reviewDiagnostics(fullReview, "full"));
    }
    fullContract = await stage(`full-repair-${attempt + 1}`, () => adapters.repairer.repairFull({
      productCore: productCore.artifact, capabilityPlan: capability.plan, acceptedSlice: sliceContract,
      contract: fullContract, delivery, review: fullReview, reference,
    }));
    fullProblems = verifyNativeFullContractV2(fullContract, {
      productCoreArtifact: productCore.artifact, capabilityPlan: capability.plan, acceptedSlice: sliceContract,
    });
    if (fullProblems.length) return result(false, "full-repair", fullProblems);
  }
  artifacts.fullContract = fullContract;
  artifacts.fullAttempts = Object.freeze(fullAttempts);
  artifacts.release = Object.freeze({ passed: true, review: fullReview });
  return result(true, "complete");
}

export { MAX_REVISIONS as NATIVE_CONCEPT_MAX_REVISIONS };
