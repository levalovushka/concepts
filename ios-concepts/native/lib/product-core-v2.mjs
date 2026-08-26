import { createHash } from "node:crypto";

export const PRODUCT_CORE_SCHEMA_VERSION = 2;

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function hasText(value, minimum = 3) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function stableId(prefix, value) {
  return `${prefix}-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

export function validateProductCoreV2(core) {
  const diagnostics = [];
  if (!core || typeof core !== "object") return [diagnostic("product-core.required", "Product Core v2 is required", "productCore")];
  if (core.schemaVersion !== PRODUCT_CORE_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "product-core.schema", `Product Core schemaVersion must be ${PRODUCT_CORE_SCHEMA_VERSION}`, "schemaVersion",
  ));
  for (const [field, minimum] of [["id", 3], ["name", 2], ["thesis", 32], ["situation", 24], ["problem", 24], ["mechanism", 32]]) {
    if (!hasText(core[field], minimum)) diagnostics.push(diagnostic("product-core.identity", `${field} is too weak or missing`, field));
  }
  if (!hasText(core.audience?.who, 16) || !hasText(core.audience?.need, 24)) diagnostics.push(diagnostic(
    "product-core.audience", "Audience needs a concrete actor and need", "audience",
  ));
  const entities = new Map((core.world?.entities || []).map(item => [item.id, item]));
  const actions = new Map((core.world?.actions || []).map(item => [item.id, item]));
  if (entities.size < 3) diagnostics.push(diagnostic("product-core.world.entities", "Product world needs at least three entities", "world.entities"));
  if (actions.size < 4) diagnostics.push(diagnostic("product-core.world.actions", "Product world needs at least four useful actions", "world.actions"));
  for (const [id, action] of actions) {
    if (!entities.has(action.entityId)) diagnostics.push(diagnostic("product-core.action.entity", `Action ${id} has no owning entity`, `world.actions.${id}.entityId`));
    if (!hasText(action.label, 3)) diagnostics.push(diagnostic("product-core.action.label", `Action ${id} needs concise user-facing copy`, `world.actions.${id}.label`));
    if (!hasText(action.outcome, 12)) diagnostics.push(diagnostic("product-core.action.outcome", `Action ${id} needs an observable outcome`, `world.actions.${id}.outcome`));
    if (!action.effect?.type || !["create", "update", "toggle", "append", "delete", "system"].includes(action.effect.type)) diagnostics.push(diagnostic(
      "product-core.action.effect", `Action ${id} needs a product effect and cannot be screen navigation`, `world.actions.${id}.effect`,
    ));
  }
  const loop = core.coreLoop?.actionIds || [];
  if (loop.length < 3 || new Set(loop).size !== loop.length || !hasText(core.coreLoop?.returnReason, 24)) diagnostics.push(diagnostic(
    "product-core.loop", "Core loop needs at least three distinct actions and a return reason", "coreLoop",
  ));
  for (const id of loop) if (!actions.has(id)) diagnostics.push(diagnostic("product-core.loop.action", `Core loop references unknown action ${id}`, "coreLoop.actionIds"));
  if ((core.returnReasons || []).length < 3) diagnostics.push(diagnostic("product-core.return", "Product Core needs three concrete return reasons", "returnReasons"));
  if ((core.nonGoals || []).length < 2) diagnostics.push(diagnostic("product-core.non-goals", "Product Core needs at least two non-goals", "nonGoals"));
  const proof = core.proof?.steps || [];
  if (proof.length !== 3 || proof.map(item => item.role).join("|") !== "entry|action|result") diagnostics.push(diagnostic(
    "product-core.proof", "Product proof must contain entry, action and result steps", "proof.steps",
  ));
  for (const [index, step] of proof.entries()) {
    if (!actions.has(step.actionId) || !hasText(step.observable, 16)) diagnostics.push(diagnostic(
      "product-core.proof.step", `Proof step ${index + 1} needs a known action and observable evidence`, `proof.steps[${index}]`,
    ));
  }
  if (Object.hasOwn(core, "permissions") || Object.hasOwn(core, "capabilities")) diagnostics.push(diagnostic(
    "product-core.capability-leak", "Permissions belong after Product Core and must not shape the product mechanism", "productCore",
  ));
  return Object.freeze(diagnostics);
}

export function createProductCoreArtifact({ request, core, portfolio, selectedBy = "human" }) {
  const diagnostics = validateProductCoreV2(core);
  if (diagnostics.length) return Object.freeze({ ok: false, diagnostics, artifact: null });
  const selected = portfolio?.candidates?.find(item => item.id === core.id);
  if (!selected) return Object.freeze({
    ok: false,
    diagnostics: [diagnostic("product-core.selection", `Selected core ${core.id} is absent from the explored portfolio`, "portfolio.candidates")],
    artifact: null,
  });
  const body = {
    schemaVersion: PRODUCT_CORE_SCHEMA_VERSION,
    request: structuredClone(request),
    selectedCandidateId: core.id,
    selectedBy,
    recommendationId: portfolio.recommendationId || null,
    core: structuredClone(core),
    explorationReceipt: {
      candidateIds: portfolio.candidates.map(item => item.id),
      assessments: structuredClone(portfolio.assessments || []),
    },
  };
  return Object.freeze({ ok: true, diagnostics: [], artifact: Object.freeze({ ...body, artifactId: stableId("product-core", body) }) });
}

export function validateProductPortfolio(portfolio, qualityFloor = 8.5) {
  const diagnostics = [];
  const candidates = portfolio?.candidates || [];
  if (candidates.length !== 3 || new Set(candidates.map(item => item.id)).size !== 3) diagnostics.push(diagnostic(
    "portfolio.count", "Product exploration must return exactly three distinct mechanisms", "portfolio.candidates",
  ));
  const assessments = new Map((portfolio?.assessments || []).map(item => [item.candidateId, item]));
  for (const candidate of candidates) {
    const assessment = assessments.get(candidate.id);
    if (!assessment) diagnostics.push(diagnostic("portfolio.assessment", `Candidate ${candidate.id} was not independently assessed`, `portfolio.assessments.${candidate.id}`));
    if ((assessment?.axes || []).some(axis => axis.score < qualityFloor) && portfolio.recommendationId === candidate.id) diagnostics.push(diagnostic(
      "portfolio.recommendation-floor", `Recommended candidate ${candidate.id} does not clear ${qualityFloor}/10 on every axis`, "portfolio.recommendationId",
    ));
  }
  if (!candidates.some(item => item.id === portfolio?.recommendationId)) diagnostics.push(diagnostic(
    "portfolio.recommendation", "Portfolio recommendation must reference one candidate", "portfolio.recommendationId",
  ));
  return Object.freeze(diagnostics);
}
