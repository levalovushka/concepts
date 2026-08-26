import { createHash } from "node:crypto";
import { PRODUCT_UI_CRITIC_AXES } from "./product-ui-critic.mjs";
import { resolveHTMLConceptPatterns } from "./html-concept-patterns.mjs";

const ITERATION_FLOOR = 8;
const RELEASE_FLOOR = 8.5;

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function stableId(value) {
  return `native-review-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

export function auditNativeProductQualityV2({ spec, fullContract, capabilityPlan }) {
  const diagnostics = [];
  const surfaceByAction = new Map(fullContract.surfaces.flatMap(surface => surface.actionIds.map(id => [id, surface])));
  const transitionByAction = new Map(fullContract.transitions.map(item => [item.actionId, item]));
  const coreActions = spec.product.coreLoop.actionIds;
  for (const [index, actionId] of coreActions.entries()) {
    const owner = surfaceByAction.get(actionId);
    if (!owner) diagnostics.push(diagnostic("quality.core-owner", `${actionId} has no visible product surface`, `product.coreLoop.actionIds[${index}]`));
    if (index < coreActions.length - 1) {
      const nextOwner = surfaceByAction.get(coreActions[index + 1]);
      const transition = transitionByAction.get(actionId);
      if (!transition || transition.to !== nextOwner?.id) diagnostics.push(diagnostic(
        "quality.core-sequence", `${actionId} does not visibly continue to ${coreActions[index + 1]}`, `transitions.${actionId}`,
      ));
    }
  }
  const mediaProduct = capabilityPlan.bindings.some(item => ["camera", "photos"].includes(item.key));
  if (mediaProduct && !fullContract.surfaces.some(surface => surface.content.mediaAsset || surface.content.mediaPlaceholder)) diagnostics.push(diagnostic(
    "quality.media-proof", "A media-led product needs visible media or a deterministic gray media placeholder in its core flow", "surfaces.content",
  ));
  const capabilityOwners = new Set(capabilityPlan.bindings.map(item => surfaceByAction.get(item.actionId)?.id).filter(Boolean));
  if (capabilityOwners.size < 3) diagnostics.push(diagnostic(
    "quality.capability-concentration", "Capabilities need contextual entry points across at least three product areas", "capabilityPlan.bindings",
  ));
  if (fullContract.surfaces.some(surface => surface.id === "accesses" && surface.actionIds.length)) diagnostics.push(diagnostic(
    "quality.permission-center", "An accesses screen cannot own permission requests", "surfaces.accesses",
  ));
  for (const surface of fullContract.surfaces) if (surface.actionIds.length > 8) diagnostics.push(diagnostic(
    "quality.action-density", `${surface.id} exposes ${surface.actionIds.length} actions; split or progressively disclose them`, `surfaces.${surface.id}.actionIds`,
  ));
  const settings = fullContract.surfaces.find(surface => surface.recipe === "settings");
  const capabilityActionIds = new Set(capabilityPlan.bindings.map(item => item.actionId));
  const settingsCapabilities = settings?.actionIds.filter(id => capabilityActionIds.has(id)).length || 0;
  if (settingsCapabilities > 3) diagnostics.push(diagnostic(
    "quality.settings-capability-dump", `Settings owns ${settingsCapabilities} capability gestures; move product features to their natural objects`, "surfaces.settings.actionIds",
  ));
  for (const binding of capabilityPlan.bindings) {
    if (!binding.purpose || !binding.requestMoment || !binding.platformEffect || !binding.fallback || !binding.outcome?.proof) diagnostics.push(diagnostic(
      "quality.capability-context", `${binding.key} needs purpose, request moment, platform effect, visible proof and denied fallback`, `capabilityPlan.bindings.${binding.key}`,
    ));
    if (/launch|startup|запуск/i.test(binding.requestMoment || "")) diagnostics.push(diagnostic(
      "quality.capability-on-launch", `${binding.key} cannot be requested on launch; attach it to the owning feature gesture`, `capabilityPlan.bindings.${binding.key}.requestMoment`,
    ));
  }
  return Object.freeze(diagnostics);
}

export function createNativeVisualReviewPacketV2({ spec, fullContract, capabilityPlan, delivery }) {
  if (!delivery?.buildReceipt?.passed || !delivery?.interactionReceipt?.passed || !delivery?.captures?.length) {
    throw new Error("Native visual review requires a fresh build, XCUI receipt and captures");
  }
  const structuralDiagnostics = auditNativeProductQualityV2({ spec, fullContract, capabilityPlan });
  const body = {
    schemaVersion: 1,
    product: {
      id: spec.id, name: spec.product.name, thesis: spec.product.thesis,
      audience: structuredClone(spec.product.audience),
      coreLoop: [...spec.product.coreLoop.actionIds],
      targetProduct: spec.targetProduct, strategy: spec.strategy,
    },
    surfaces: fullContract.surfaces.map(surface => ({
      id: surface.id, role: surface.role, recipe: surface.recipe,
      states: [...surface.states], actions: [...surface.actionIds], content: structuredClone(surface.content),
      inheritedPatterns: resolveHTMLConceptPatterns(surface.recipe),
    })),
    transitions: fullContract.transitions.map(item => ({ ...item })),
    captures: delivery.captures.map(item => ({
      id: item.id, surface: item.surface, state: item.state, path: item.path, sha256: item.sha256,
    })),
    rubric: {
      axes: PRODUCT_UI_CRITIC_AXES,
      iterationFloor: ITERATION_FLOOR,
      releaseFloor: RELEASE_FLOOR,
      layoutContract: {
        minimumSingleLineRowHeight: 56,
        minimumTwoLineRowHeight: 64,
        sectionHeaderInsets: { top: 18, bottom: 12 },
        rule: "Separate product content, navigation and capability actions into named groups; no unlabeled dense utility stack.",
      },
      questions: [
        "Is the product promise and next action clear within two seconds?",
        "Does the complete core loop read as one causal journey rather than disconnected demos?",
        "Do media, people and outcomes feel like product matter rather than technical placeholders?",
        "Are capabilities secondary to product tasks and requested only after an explicit feature gesture?",
        "Does each screen have VK-like hierarchy, density, chrome and content attachment?",
        "Are empty, offline, error and permission-denied states useful and recoverable?",
        "Does each screen use a domain-specific composition inherited from the HTML concepts instead of a generic card or capability list?",
        "Do rows breathe, section labels explain the grouping, and separators align without making the page look like one dense settings dump?",
      ],
    },
    agentLoop: {
      publicInput: "one ConceptSpec and one command",
      steps: [
        "build SwiftUI app, run XCUI and capture every declared state",
        "inspect every real capture with vision and score every rubric axis",
        "turn only blocker and major findings into a bounded repair brief",
        "repair ConceptSpec or a reusable native recipe, then rebuild and reinspect",
      ],
      maxRepairIterations: 2,
      releaseRule: "stop only after a fresh independent release review reaches 8.5 on every axis",
    },
    structuralDiagnostics,
  };
  return Object.freeze({ ...body, packetId: stableId(body) });
}

export function verifyNativeVisualReviewV2({ packet, review }) {
  const diagnostics = [...(packet?.structuralDiagnostics || [])];
  const mode = review?.mode;
  const floor = mode === "release" ? RELEASE_FLOOR : ITERATION_FLOOR;
  if (!packet?.packetId || !review) return Object.freeze({
    passed: false, floor, diagnostics: Object.freeze([diagnostic("review.required", "A visual review response is required", "review")]), repairBrief: Object.freeze([]),
  });
  if (!['iteration', 'release'].includes(mode)) diagnostics.push(diagnostic("review.mode", "Review mode must be iteration or release", "review.mode"));
  if (!Number.isInteger(review.iteration) || review.iteration < 1 || review.iteration > 2) diagnostics.push(diagnostic(
    "review.iteration", "The bounded repair loop allows iteration 1 or 2 only", "review.iteration",
  ));
  if (!review.reviewer?.name || !["vision", "human"].includes(review.reviewer.captureInspection)) diagnostics.push(diagnostic(
    "review.eyes", "Reviewer must identify itself and inspect the actual captures through vision or human eyes", "review.reviewer",
  ));
  if (mode === "release" && review.reviewer?.independentFromGenerator !== true) diagnostics.push(diagnostic(
    "review.independence", "Release review must be independent from the generator", "review.reviewer.independentFromGenerator",
  ));
  const axes = new Map((review.axes || []).map(item => [item.id, item]));
  for (const id of PRODUCT_UI_CRITIC_AXES) {
    const axis = axes.get(id);
    if (!axis || !Number.isFinite(axis.score) || axis.score < floor || axis.score > 10
        || typeof axis.rationale !== "string" || axis.rationale.trim().length < 24) diagnostics.push(diagnostic(
      "review.axis", `${id} needs grounded rationale and a score of at least ${floor}`, `review.axes.${id}`,
    ));
  }
  const captureReviews = new Map((review.captures || []).map(item => [item.captureId, item]));
  for (const capture of packet.captures) if (!captureReviews.get(capture.id)?.summary?.trim()) diagnostics.push(diagnostic(
    "review.capture", `${capture.id} has not been inspected`, `review.captures.${capture.id}`,
  ));
  const findings = [...(review.findings || [])];
  for (const [index, finding] of findings.entries()) if (
    !finding.code || !["blocker", "major", "minor"].includes(finding.severity)
    || !finding.problem || !finding.recommendation || !Array.isArray(finding.captureIds)
  ) diagnostics.push(diagnostic("review.finding", "Every finding needs code, severity, captures, problem and recommendation", `review.findings[${index}]`));
  const blocking = findings.filter(item => ["blocker", "major"].includes(item.severity));
  if (blocking.length || review.verdict !== "clean") diagnostics.push(diagnostic(
    "review.blocked", `${blocking.length} blocking or major visual/product findings remain`, "review.verdict",
  ));
  const repairBrief = blocking.map(item => Object.freeze({
    code: item.code, severity: item.severity, captureIds: Object.freeze([...item.captureIds]),
    problem: item.problem, recommendation: item.recommendation,
  }));
  return Object.freeze({ passed: diagnostics.length === 0, floor, diagnostics: Object.freeze(diagnostics), repairBrief: Object.freeze(repairBrief) });
}

export const NATIVE_VISUAL_REVIEW_V2_AXES = PRODUCT_UI_CRITIC_AXES;
