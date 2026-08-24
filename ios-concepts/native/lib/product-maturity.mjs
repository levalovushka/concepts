import { createHash } from "node:crypto";
import { auditReferenceProfile, resolveReferenceProfile } from "./reference-profile-catalog.mjs";

export const PRODUCT_MATURITY_SCHEMA_VERSION = 1;
export const PRODUCT_STRESS_AXES = Object.freeze([
  "audience-need",
  "wedge",
  "observable-differentiation",
  "value-exchange",
  "content-supply",
  "social-graph",
  "cold-start",
  "activation",
  "core-loop",
  "retention",
  "trust-privacy",
  "business-viability",
  "reference-fit",
  "permission-cohesion",
  "evidence",
]);

const LEGACY_MIGRATION_SLUGS = new Set(["looks", "dvor"]);
const VAGUE_VALUE = /^(удобно|быстро|просто|полезно|интересно|всё в одном|all[- ]?in[- ]?one)$/iu;
const GENERIC_BUNDLE = /(лента.{0,20}(чат|профил)|(чат|профил).{0,20}лента|все функции|всё в одном|all[- ]?in[- ]?one)/iu;
const DECORATIVE_DIFFERENCE = /^(цвет|тема|стиль интерфейса|анимация|оформление|визуал)$/iu;
const VALID_EVIDENCE_STATUS = new Set(["observed", "validated", "approved", "needs-validation"]);
const PROVEN_EVIDENCE_STATUS = new Set(["observed", "validated", "approved"]);

function diagnostic(code, message, path, severity = "error") {
  return Object.freeze({ code, message, path, severity });
}

function hasText(value, minimum = 8) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function hasItems(value, minimum = 1) {
  return Array.isArray(value) && value.length >= minimum;
}

function hasTextItems(value, minimumLength = 8, minimumItems = 1) {
  return hasItems(value, minimumItems) && value.every(item => hasText(item, minimumLength));
}

function pushText(diagnostics, value, path, label, minimum = 8) {
  if (!hasText(value, minimum)) diagnostics.push(diagnostic(
    "product.field.required",
    `${label} must contain specific product information`,
    path,
  ));
}

function pushItems(diagnostics, value, path, label, minimum = 1) {
  if (!hasItems(value, minimum)) diagnostics.push(diagnostic(
    "product.collection.required",
    `${label} must contain at least ${minimum} item${minimum === 1 ? "" : "s"}`,
    path,
  ));
}

function pushStringItems(diagnostics, value, path, label, minimumLength = 8, minimumItems = 1) {
  pushItems(diagnostics, value, path, label, minimumItems);
  for (const [index, item] of (Array.isArray(value) ? value : []).entries()) pushText(
    diagnostics, item, `${path}[${index}]`, `${label} item`, minimumLength,
  );
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  return value;
}

export function stableProductArtifactId(prefix, value) {
  const bytes = JSON.stringify(canonicalize(value));
  return `${prefix}-${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}`;
}

export function validateProductBrief(brief) {
  const diagnostics = [];
  if (brief?.schemaVersion !== PRODUCT_MATURITY_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "brief.schema-version.unsupported", "Product Brief schemaVersion must be 1", "schemaVersion",
  ));
  pushText(diagnostics, brief?.id, "id", "Product Brief id", 3);
  pushText(diagnostics, brief?.request, "request", "Product request");
  pushText(diagnostics, brief?.audience?.primary, "audience.primary", "Primary audience");
  pushStringItems(diagnostics, brief?.audience?.needs, "audience.needs", "Audience needs");
  pushStringItems(diagnostics, brief?.context?.situations, "context.situations", "Usage situations");
  pushStringItems(diagnostics, brief?.context?.constraints, "context.constraints", "Product constraints");
  if (!hasItems(brief?.permissions)) diagnostics.push(diagnostic(
    "brief.permissions.required", "Product Brief must name the requested permission set", "permissions",
  ));
  const permissionKeys = new Set();
  for (const [index, permission] of (brief?.permissions || []).entries()) {
    pushText(diagnostics, permission?.key, `permissions[${index}].key`, "Permission key", 2);
    if (permissionKeys.has(permission?.key)) diagnostics.push(diagnostic(
      "brief.permission.duplicate", `Duplicate permission ${permission?.key}`, `permissions[${index}].key`,
    ));
    permissionKeys.add(permission?.key);
    if (!["required", "optional", "forbidden"].includes(permission?.priority)) diagnostics.push(diagnostic(
      "brief.permission.priority-invalid",
      "Permission priority must be required, optional, or forbidden",
      `permissions[${index}].priority`,
    ));
    pushText(diagnostics, permission?.constraint, `permissions[${index}].constraint`, "Permission constraint");
  }
  if (!["mimicry", "differentiation"].includes(brief?.reference?.strategy)) diagnostics.push(diagnostic(
    "brief.reference.strategy-invalid", "Reference strategy must be mimicry or differentiation", "reference.strategy",
  ));
  pushText(diagnostics, brief?.reference?.family, "reference.family", "Reference family", 2);
  if (brief?.reference?.strategy === "mimicry") pushText(
    diagnostics, brief?.reference?.profileId, "reference.profileId", "Mimicry reference profile", 2,
  );
  const candidateCount = brief?.candidateCount;
  if (!Number.isInteger(candidateCount) || candidateCount < 3) diagnostics.push(diagnostic(
    "brief.candidate-count.too-small", "Product exploration requires at least three candidates", "candidateCount",
  ));
  return diagnostics;
}

function validateEvidence(candidate, diagnostics, base) {
  pushItems(diagnostics, candidate?.evidence, `${base}.evidence`, "Evidence provenance");
  const ids = new Set();
  for (const [index, item] of (candidate?.evidence || []).entries()) {
    const path = `${base}.evidence[${index}]`;
    pushText(diagnostics, item?.id, `${path}.id`, "Evidence id", 2);
    if (ids.has(item?.id)) diagnostics.push(diagnostic(
      "candidate.evidence.duplicate", `Duplicate evidence id ${item?.id}`, `${path}.id`,
    ));
    ids.add(item?.id);
    if (!["user-input", "research", "reference-profile", "experiment", "assumption"].includes(item?.type)) {
      diagnostics.push(diagnostic("candidate.evidence.type-invalid", "Evidence type is not recognised", `${path}.type`));
    }
    if (!VALID_EVIDENCE_STATUS.has(item?.status)) diagnostics.push(diagnostic(
      "candidate.evidence.status-invalid", "Evidence status is not recognised", `${path}.status`,
    ));
    pushText(diagnostics, item?.source, `${path}.source`, "Evidence source");
    pushStringItems(diagnostics, item?.supports, `${path}.supports`, "Supported claims");
  }
  return ids;
}

function validateDelivery(candidate, diagnostics, base) {
  const delivery = candidate?.delivery;
  const requiredArrays = [
    ["domainGlossary", "Domain glossary"],
    ["personas", "Personas"],
    ["criticalFlows", "Critical flows"],
    ["architecture.modules", "Architecture modules"],
    ["architecture.boundaries", "Architecture boundaries"],
    ["data.entities", "Data entities"],
    ["data.state", "State model"],
    ["data.persistence", "Persistence plan"],
    ["data.integrations", "Integrations"],
    ["accessibility", "Accessibility requirements"],
    ["localization.locales", "Locales"],
    ["localization.requirements", "Localization requirements"],
    ["analytics.events", "Analytics events"],
    ["analytics.successMetrics", "Success metrics"],
    ["testing.levels", "Testing levels"],
    ["testing.evidencePlan", "Evidence plan"],
    ["testing.capturePlan", "Capture plan"],
    ["setup.prerequisites", "Setup prerequisites"],
    ["setup.build", "Build instructions"],
    ["setup.run", "Run instructions"],
    ["ownership.generated", "Generated files"],
    ["ownership.owned", "Owned files"],
    ["limitations", "Limitations"],
    ["acceptanceCriteria", "Acceptance criteria"],
    ["appStoreNotes", "App Store notes"],
  ];
  for (const [path, label] of requiredArrays) {
    const value = path.split(".").reduce((current, key) => current?.[key], delivery);
    pushItems(diagnostics, value, `${base}.delivery.${path}`, label);
  }
  for (const [path, minimum] of [
    ["architecture.boundaries", 8], ["data.entities", 2], ["data.state", 8],
    ["data.persistence", 8], ["data.integrations", 8], ["accessibility", 8],
    ["localization.locales", 2], ["localization.requirements", 8], ["analytics.events", 3],
    ["analytics.successMetrics", 8], ["testing.levels", 8], ["testing.evidencePlan", 8],
    ["testing.capturePlan", 3], ["setup.prerequisites", 3], ["setup.build", 3],
    ["setup.run", 3], ["ownership.generated", 3], ["ownership.owned", 3],
    ["limitations", 8], ["acceptanceCriteria", 8], ["appStoreNotes", 8],
  ]) {
    const value = path.split(".").reduce((current, key) => current?.[key], delivery);
    for (const [index, item] of (Array.isArray(value) ? value : []).entries()) pushText(
      diagnostics, item, `${base}.delivery.${path}[${index}]`, `${path} item`, minimum,
    );
  }
  for (const state of ["loading", "empty", "error", "denied", "offline"]) {
    pushText(
      diagnostics,
      delivery?.experienceStates?.[state],
      `${base}.delivery.experienceStates.${state}`,
      `${state} state policy`,
    );
  }
  for (const [index, item] of (delivery?.domainGlossary || []).entries()) {
    pushText(diagnostics, item?.term, `${base}.delivery.domainGlossary[${index}].term`, "Domain term", 2);
    pushText(diagnostics, item?.definition, `${base}.delivery.domainGlossary[${index}].definition`, "Domain definition");
  }
  for (const [index, item] of (delivery?.personas || []).entries()) {
    for (const key of ["name", "context", "job"]) pushText(
      diagnostics, item?.[key], `${base}.delivery.personas[${index}].${key}`, `Persona ${key}`, key === "name" ? 2 : 8,
    );
  }
  for (const [index, flow] of (delivery?.criticalFlows || []).entries()) {
    for (const key of ["id", "name", "trigger", "outcome"]) pushText(
      diagnostics, flow?.[key], `${base}.delivery.criticalFlows[${index}].${key}`, `Critical flow ${key}`, ["id", "trigger"].includes(key) ? 2 : 8,
    );
    pushItems(diagnostics, flow?.steps, `${base}.delivery.criticalFlows[${index}].steps`, "Critical flow steps");
  }
  for (const [index, module] of (delivery?.architecture?.modules || []).entries()) {
    for (const key of ["name", "responsibility", "owns"]) pushText(
      diagnostics, module?.[key], `${base}.delivery.architecture.modules[${index}].${key}`, `Architecture module ${key}`,
    );
  }
}

export function validateConceptCandidate(candidate, brief, index = 0) {
  const diagnostics = [];
  const base = `candidates[${index}]`;
  if (candidate?.schemaVersion !== PRODUCT_MATURITY_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "candidate.schema-version.unsupported", "Concept Candidate schemaVersion must be 1", `${base}.schemaVersion`,
  ));
  pushText(diagnostics, candidate?.id, `${base}.id`, "Candidate id", 3);
  pushText(diagnostics, candidate?.name, `${base}.name`, "Candidate name", 2);
  pushText(diagnostics, candidate?.productThesis, `${base}.productThesis`, "Product thesis", 16);
  pushText(diagnostics, candidate?.insight?.claim, `${base}.insight.claim`, "Product insight", 16);
  for (const key of ["actor", "situation", "motivation", "outcome"]) {
    pushText(diagnostics, candidate?.job?.[key], `${base}.job.${key}`, `Job ${key}`);
  }
  for (const key of ["audience", "situation", "mechanism"]) {
    pushText(diagnostics, candidate?.wedge?.[key], `${base}.wedge.${key}`, `Wedge ${key}`);
  }
  const distinction = candidate?.observableDifferentiation;
  if (!["behavior", "outcome", "supply"].includes(distinction?.kind)) diagnostics.push(diagnostic(
    "candidate.differentiation.kind-invalid",
    "Observable differentiation must be a behavior, outcome, or supply difference",
    `${base}.observableDifferentiation.kind`,
  ));
  for (const key of ["behavior", "comparator", "measurement", "threshold", "experiment", "coreLoopStep"]) {
    pushText(diagnostics, distinction?.[key], `${base}.observableDifferentiation.${key}`, `Differentiation ${key}`);
  }
  pushStringItems(diagnostics, candidate?.valueExchange?.userGives, `${base}.valueExchange.userGives`, "User contribution");
  pushStringItems(diagnostics, candidate?.valueExchange?.userGets, `${base}.valueExchange.userGets`, "User value");
  pushText(diagnostics, candidate?.contentModel?.primaryUnit, `${base}.contentModel.primaryUnit`, "Primary content unit", 3);
  pushStringItems(diagnostics, candidate?.contentModel?.relationships, `${base}.contentModel.relationships`, "Content relationships");
  for (const key of ["coldStartSources", "ongoingSources", "contributorIncentives", "qualityControls"]) {
    pushStringItems(diagnostics, candidate?.contentSupply?.[key], `${base}.contentSupply.${key}`, `Content supply ${key}`);
  }
  for (const key of ["relationship", "mechanism", "valueWithoutGraph"]) {
    pushText(diagnostics, candidate?.socialGraphLeverage?.[key], `${base}.socialGraphLeverage.${key}`, `Social graph ${key}`);
  }
  for (const key of ["firstSessionValue", "seededContent", "emptyStateAction"]) {
    pushText(diagnostics, candidate?.coldStart?.[key], `${base}.coldStart.${key}`, `Cold start ${key}`);
  }
  for (const key of ["moment", "signal", "window"]) {
    pushText(diagnostics, candidate?.activation?.[key], `${base}.activation.${key}`, `Activation ${key}`);
  }
  for (const key of ["trigger", "action", "reward", "contribution", "hypothesis", "successMetric", "testPlan"]) {
    pushText(diagnostics, candidate?.coreLoop?.[key], `${base}.coreLoop.${key}`, `Core loop ${key}`);
  }
  for (const key of ["cue", "routine", "reward", "frequency"]) {
    pushText(diagnostics, candidate?.habitLoop?.[key], `${base}.habitLoop.${key}`, `Habit loop ${key}`);
  }
  pushStringItems(diagnostics, candidate?.retention?.reasons, `${base}.retention.reasons`, "Retention reasons");
  pushStringItems(diagnostics, candidate?.retention?.leadingIndicators, `${base}.retention.leadingIndicators`, "Retention indicators");
  pushStringItems(diagnostics, candidate?.trustSafety?.risks, `${base}.trustSafety.risks`, "Trust and safety risks");
  pushStringItems(diagnostics, candidate?.trustSafety?.controls, `${base}.trustSafety.controls`, "Trust and safety controls");
  pushText(diagnostics, candidate?.trustSafety?.reporting, `${base}.trustSafety.reporting`, "Reporting path");
  pushStringItems(diagnostics, candidate?.privacy?.data, `${base}.privacy.data`, "Privacy data inventory");
  pushStringItems(diagnostics, candidate?.privacy?.principles, `${base}.privacy.principles`, "Privacy principles");
  pushText(diagnostics, candidate?.privacy?.retention, `${base}.privacy.retention`, "Privacy retention policy");
  for (const key of ["model", "payer", "value", "viabilitySignal", "constraints"]) {
    pushText(diagnostics, candidate?.businessLogic?.[key], `${base}.businessLogic.${key}`, `Business logic ${key}`);
  }
  pushStringItems(diagnostics, candidate?.nonGoals, `${base}.nonGoals`, "Non-goals", 3, 2);
  pushItems(diagnostics, candidate?.risks, `${base}.risks`, "Product risks", 2);
  pushItems(diagnostics, candidate?.assumptions, `${base}.assumptions`, "Product assumptions", 2);
  for (const [riskIndex, risk] of (candidate?.risks || []).entries()) {
    for (const key of ["risk", "mitigation", "killSignal"]) pushText(
      diagnostics, risk?.[key], `${base}.risks[${riskIndex}].${key}`, `Risk ${key}`,
    );
  }
  for (const [assumptionIndex, assumption] of (candidate?.assumptions || []).entries()) {
    pushText(diagnostics, assumption?.claim, `${base}.assumptions[${assumptionIndex}].claim`, "Assumption claim");
    pushText(diagnostics, assumption?.validation, `${base}.assumptions[${assumptionIndex}].validation`, "Assumption validation");
    if (!["low", "medium", "high"].includes(assumption?.risk)) diagnostics.push(diagnostic(
      "candidate.assumption.risk-invalid", "Assumption risk must be low, medium, or high", `${base}.assumptions[${assumptionIndex}].risk`,
    ));
    if (!["needs-validation", "validated", "rejected"].includes(assumption?.status)) diagnostics.push(diagnostic(
      "candidate.assumption.status-invalid", "Assumption status is not recognised", `${base}.assumptions[${assumptionIndex}].status`,
    ));
  }

  const evidenceIds = validateEvidence(candidate, diagnostics, base);
  for (const [path, refs] of [
    [`${base}.insight.evidenceRefs`, candidate?.insight?.evidenceRefs],
    [`${base}.coreLoop.evidenceRefs`, candidate?.coreLoop?.evidenceRefs],
    [`${base}.observableDifferentiation.evidenceRefs`, distinction?.evidenceRefs],
    [`${base}.referenceFit.evidenceRefs`, candidate?.referenceFit?.evidenceRefs],
  ]) {
    pushStringItems(diagnostics, refs, path, "Evidence references", 2);
    for (const ref of refs || []) if (!evidenceIds.has(ref)) diagnostics.push(diagnostic(
      "candidate.evidence.reference-missing", `Evidence reference ${ref} does not exist`, path,
    ));
  }

  const requiredPermissions = new Set((brief?.permissions || []).filter(item => item.priority === "required").map(item => item.key));
  const forbiddenPermissions = new Set((brief?.permissions || []).filter(item => item.priority === "forbidden").map(item => item.key));
  const candidatePermissionKeys = new Set();
  pushItems(diagnostics, candidate?.permissions, `${base}.permissions`, "Candidate permissions");
  for (const [permissionIndex, permission] of (candidate?.permissions || []).entries()) {
    const path = `${base}.permissions[${permissionIndex}]`;
    if (candidatePermissionKeys.has(permission?.key)) diagnostics.push(diagnostic(
      "candidate.permission.duplicate", `Duplicate permission ${permission?.key}`, `${path}.key`,
    ));
    candidatePermissionKeys.add(permission?.key);
    for (const key of ["key", "productValue", "flow", "requestMoment", "deniedFallback"]) {
      pushText(diagnostics, permission?.[key], `${path}.${key}`, `Permission ${key}`, key === "key" ? 2 : 8);
    }
    if (!["core", "supporting"].includes(permission?.role)) diagnostics.push(diagnostic(
      "candidate.permission.role-invalid", "Permission role must be core or supporting", `${path}.role`,
    ));
  }
  for (const key of requiredPermissions) if (!candidatePermissionKeys.has(key)) diagnostics.push(diagnostic(
    "candidate.permission.required-missing", `Required permission ${key} is not grounded`, `${base}.permissions`,
  ));
  for (const key of forbiddenPermissions) if (candidatePermissionKeys.has(key)) diagnostics.push(diagnostic(
    "candidate.permission.forbidden", `Forbidden permission ${key} is present`, `${base}.permissions`,
  ));

  const reference = candidate?.referenceFit;
  if (brief?.reference?.strategy === "mimicry") {
    for (const key of ["profileId", "mentalModel", "naturalFit", "productMapping"]) {
      pushText(diagnostics, reference?.[key], `${base}.referenceFit.${key}`, `Reference fit ${key}`, key === "profileId" ? 2 : 12);
    }
    pushStringItems(diagnostics, reference?.borrowedPatterns, `${base}.referenceFit.borrowedPatterns`, "Borrowed reference patterns", 3);
    pushStringItems(diagnostics, reference?.tensions, `${base}.referenceFit.tensions`, "Reference tensions");
    if (reference?.profileId !== brief?.reference?.profileId) diagnostics.push(diagnostic(
      "candidate.reference.profile-mismatch",
      `Candidate must use brief profile ${brief?.reference?.profileId}`,
      `${base}.referenceFit.profileId`,
    ));
  }

  const axes = candidate?.stressTest?.axes;
  pushItems(diagnostics, axes, `${base}.stressTest.axes`, "Product Stress Test axes", PRODUCT_STRESS_AXES.length);
  const axisIds = new Set();
  for (const [axisIndex, axis] of (axes || []).entries()) {
    const path = `${base}.stressTest.axes[${axisIndex}]`;
    if (!PRODUCT_STRESS_AXES.includes(axis?.id)) diagnostics.push(diagnostic(
      "candidate.stress-axis.unknown", `Unknown stress axis ${axis?.id}`, `${path}.id`,
    ));
    if (axisIds.has(axis?.id)) diagnostics.push(diagnostic(
      "candidate.stress-axis.duplicate", `Duplicate stress axis ${axis?.id}`, `${path}.id`,
    ));
    axisIds.add(axis?.id);
    if (!Number.isInteger(axis?.score) || axis.score < 0 || axis.score > 4) diagnostics.push(diagnostic(
      "candidate.stress-axis.score-invalid", "Stress score must be an integer from 0 to 4", `${path}.score`,
    ));
    pushText(diagnostics, axis?.rationale, `${path}.rationale`, "Stress axis rationale", 16);
    pushStringItems(diagnostics, axis?.evidenceRefs, `${path}.evidenceRefs`, "Stress axis evidence references", 2);
    for (const ref of axis?.evidenceRefs || []) if (!evidenceIds.has(ref)) diagnostics.push(diagnostic(
      "candidate.evidence.reference-missing", `Stress axis evidence reference ${ref} does not exist`, `${path}.evidenceRefs`,
    ));
    pushStringItems(diagnostics, axis?.failureModes, `${path}.failureModes`, "Stress axis failure modes");
  }
  for (const axis of PRODUCT_STRESS_AXES) if (!axisIds.has(axis)) diagnostics.push(diagnostic(
    "candidate.stress-axis.missing", `Missing stress axis ${axis}`, `${base}.stressTest.axes`,
  ));
  validateDelivery(candidate, diagnostics, base);
  return diagnostics;
}

function provenEvidence(candidate, refs) {
  const index = new Map((candidate.evidence || []).map(item => [item.id, item]));
  return (refs || []).some(ref => PROVEN_EVIDENCE_STATUS.has(index.get(ref)?.status));
}

function gate(id, reasons) {
  return Object.freeze({ id, pass: reasons.length === 0, reasons: Object.freeze(reasons) });
}

export function runDeterministicMaturityGates(brief, candidate) {
  const gates = [];
  const generic = [];
  if (GENERIC_BUNDLE.test(candidate.productThesis || "")) generic.push("product thesis reads as a generic feature bundle");
  if (VAGUE_VALUE.test((candidate.wedge?.mechanism || "").trim())) generic.push("wedge mechanism is generic rather than causal");
  gates.push(gate("non-generic-product", generic));

  const distinction = [];
  if (candidate.observableDifferentiation?.kind === "appearance") distinction.push("difference is decorative");
  if (DECORATIVE_DIFFERENCE.test(candidate.observableDifferentiation?.behavior || "")) distinction.push("difference describes appearance, not behavior");
  if (!hasText(candidate.observableDifferentiation?.measurement) || !hasText(candidate.observableDifferentiation?.experiment)) {
    distinction.push("difference cannot be verified by a named measurement and experiment");
  }
  gates.push(gate("observable-differentiation", distinction));

  const permissions = [];
  const required = new Set((brief.permissions || []).filter(item => item.priority === "required").map(item => item.key));
  const mapped = new Map((candidate.permissions || []).map(item => [item.key, item]));
  for (const key of required) {
    const item = mapped.get(key);
    if (!item) permissions.push(`${key} has no product grounding`);
    else if (!hasText(item.productValue) || !hasText(item.flow) || !hasText(item.requestMoment) || !hasText(item.deniedFallback)) {
      permissions.push(`${key} has an incoherent request or fallback`);
    }
  }
  if (![...(candidate.permissions || [])].some(item => item.role === "core")) permissions.push("no permission participates in the core product value");
  gates.push(gate("permission-cohesion", permissions));

  const coldStart = [];
  if (!hasText(candidate.coldStart?.firstSessionValue)) coldStart.push("first session has no value before network effects");
  if (!hasText(candidate.coldStart?.seededContent)) coldStart.push("initial supply is empty");
  if (!hasText(candidate.coldStart?.emptyStateAction)) coldStart.push("empty state has no next action");
  gates.push(gate("cold-start", coldStart));

  const supply = [];
  if (!hasText(candidate.contentModel?.primaryUnit, 3)) supply.push("primary content unit is undefined");
  for (const key of ["coldStartSources", "ongoingSources", "contributorIncentives", "qualityControls"]) {
    if (!hasTextItems(candidate.contentSupply?.[key])) supply.push(`${key} is empty or non-specific`);
  }
  gates.push(gate("content-supply", supply));

  const coreLoop = [];
  for (const key of ["trigger", "action", "reward", "contribution", "successMetric", "testPlan"]) {
    if (!hasText(candidate.coreLoop?.[key])) coreLoop.push(`core loop ${key} is not explicit`);
  }
  if (!provenEvidence(candidate, candidate.coreLoop?.evidenceRefs)) coreLoop.push("core loop has no observed, validated, or approved evidence provenance");
  gates.push(gate("core-loop-evidence", coreLoop));

  const reference = [];
  if (brief.reference?.strategy === "mimicry") {
    const profile = resolveReferenceProfile(brief.reference.profileId);
    if (!profile) reference.push(`reference profile ${brief.reference.profileId} is unknown`);
    else {
      const audit = auditReferenceProfile(profile);
      if (!audit.ready) reference.push(...audit.blockers.map(blocker => `reference profile incomplete: ${blocker}`));
      if (profile.referenceFamily !== brief.reference.family) reference.push(
        `reference profile belongs to ${profile.referenceFamily}, not brief family ${brief.reference.family}`,
      );
    }
    if (!hasText(candidate.referenceFit?.mentalModel) || !hasText(candidate.referenceFit?.naturalFit) || !hasText(candidate.referenceFit?.productMapping)) {
      reference.push("candidate does not explain why its model belongs in the reference mental model");
    }
    if (!provenEvidence(candidate, candidate.referenceFit?.evidenceRefs)) reference.push("reference fit has no evidence-backed provenance");
  }
  gates.push(gate("reference-mental-model-fit", reference));

  const evidence = [];
  if (!provenEvidence(candidate, candidate.insight?.evidenceRefs)) evidence.push("product insight is only an unvalidated assumption");
  if (!provenEvidence(candidate, candidate.observableDifferentiation?.evidenceRefs)) evidence.push("observable difference lacks proven provenance");
  gates.push(gate("evidence-provenance", evidence));

  const stress = [];
  const scores = new Map((candidate.stressTest?.axes || []).map(axis => [axis.id, axis.score]));
  for (const axis of PRODUCT_STRESS_AXES) {
    if (!scores.has(axis)) stress.push(`${axis} was not assessed`);
    else if (scores.get(axis) < 3) stress.push(`${axis} failed with ${scores.get(axis)}/4`);
  }
  gates.push(gate("minimum-axis-floor", stress));
  return Object.freeze(gates);
}

function candidateComparison(candidate, brief, index) {
  const diagnostics = validateConceptCandidate(candidate, brief, index);
  const gates = runDeterministicMaturityGates(brief, candidate);
  const axisScores = Object.fromEntries(PRODUCT_STRESS_AXES.map(id => [
    id,
    candidate.stressTest?.axes?.find(axis => axis.id === id)?.score ?? 0,
  ]));
  const values = Object.values(axisScores);
  const minimumAxisScore = values.length ? Math.min(...values) : 0;
  const sum = values.reduce((total, value) => total + value, 0);
  const rejectionReasons = [
    ...diagnostics.filter(item => item.severity === "error").map(item => `${item.code}: ${item.message}`),
    ...gates.filter(item => !item.pass).flatMap(item => item.reasons.map(reason => `${item.id}: ${reason}`)),
  ];
  return {
    id: candidate.id || `candidate-${index + 1}`,
    name: candidate.name || candidate.id || `Candidate ${index + 1}`,
    eligible: rejectionReasons.length === 0,
    minimumAxisScore,
    axisScores,
    tieBreakScore: sum,
    gates,
    diagnostics,
    rejectionReasons,
  };
}

function diversityDiagnostics(candidates) {
  const diagnostics = [];
  const fingerprints = new Map();
  const ids = new Set();
  for (const [index, candidate] of candidates.entries()) {
    if (ids.has(candidate?.id)) diagnostics.push(diagnostic(
      "candidate.portfolio.id-duplicate",
      `Candidate id ${candidate?.id} is duplicated`,
      `candidates[${index}].id`,
    ));
    ids.add(candidate?.id);
    const fingerprint = [
      candidate.wedge?.mechanism,
      candidate.contentModel?.primaryUnit,
      candidate.coreLoop?.action,
      candidate.observableDifferentiation?.behavior,
    ].map(value => String(value || "").toLocaleLowerCase("ru").replace(/\s+/g, " ").trim()).join("|");
    if (fingerprints.has(fingerprint)) diagnostics.push(diagnostic(
      "candidate.portfolio.not-diverse",
      `Candidates ${fingerprints.get(fingerprint)} and ${candidate.id || index + 1} have the same wedge, content unit, loop, and differentiation`,
      `candidates[${index}]`,
    ));
    else fingerprints.set(fingerprint, candidate.id || index + 1);
  }
  return diagnostics;
}

function selectionReceipt(brief, candidates, comparisons, portfolioDiagnostics, selected) {
  const winner = selected ? candidates.find(candidate => candidate.id === selected.id) : null;
  const base = {
    schemaVersion: PRODUCT_MATURITY_SCHEMA_VERSION,
    briefId: brief.id,
    selectionRule: "fail every hard gate and every axis below 3/4; then maximise the minimum axis, then the total only as a tie-break, then candidate id",
    selectedCandidateId: selected?.id || null,
    winnerReasons: selected ? [
      `selected product thesis: ${winner.productThesis}`,
      `selected wedge: ${winner.wedge.mechanism}`,
      `selected observable difference: ${winner.observableDifferentiation.behavior}; measurement: ${winner.observableDifferentiation.measurement}`,
      `passed all ${selected.gates.length} hard gates`,
      `minimum stress axis ${selected.minimumAxisScore}/4`,
      "no stronger candidate survived under the fail-closed ordering",
    ] : [],
    portfolioDiagnostics,
    candidates: comparisons.map(item => ({
      id: item.id,
      name: item.name,
      eligible: item.eligible,
      minimumAxisScore: item.minimumAxisScore,
      axisScores: item.axisScores,
      gates: item.gates,
      rejectionReasons: item.id === selected?.id
        ? []
        : item.rejectionReasons.length
          ? item.rejectionReasons
          : [`not selected: minimum axis ${item.minimumAxisScore}/4 and tie-break ${item.tieBreakScore}`],
    })),
  };
  return Object.freeze({ receiptId: stableProductArtifactId("selection", base), ...base });
}

function compileWinner(brief, candidate, comparison, receipt) {
  const contract = {
    schemaVersion: PRODUCT_MATURITY_SCHEMA_VERSION,
    id: `${brief.id}:${candidate.id}`,
    source: {
      kind: "selected-candidate",
      briefId: brief.id,
      candidateId: candidate.id,
      selectionReceiptId: receipt.receiptId,
    },
    status: "mature",
    audience: brief.audience,
    context: brief.context,
    reference: { ...brief.reference, ...candidate.referenceFit },
    productThesis: candidate.productThesis,
    insight: candidate.insight,
    job: candidate.job,
    wedge: candidate.wedge,
    observableDifferentiation: candidate.observableDifferentiation,
    valueExchange: candidate.valueExchange,
    contentModel: candidate.contentModel,
    contentSupply: candidate.contentSupply,
    socialGraphLeverage: candidate.socialGraphLeverage,
    coldStart: candidate.coldStart,
    activation: candidate.activation,
    coreLoop: candidate.coreLoop,
    habitLoop: candidate.habitLoop,
    retention: candidate.retention,
    permissions: candidate.permissions,
    trustSafety: candidate.trustSafety,
    privacy: candidate.privacy,
    businessLogic: candidate.businessLogic,
    nonGoals: candidate.nonGoals,
    risks: candidate.risks,
    assumptions: candidate.assumptions,
    evidence: candidate.evidence,
    delivery: candidate.delivery,
    maturity: {
      status: "mature",
      minimumAxisScore: comparison.minimumAxisScore,
      axisScores: comparison.axisScores,
      gates: comparison.gates,
    },
  };
  return Object.freeze({ contractId: stableProductArtifactId("product", contract), ...contract });
}

function deriveDevelopmentArtifacts(brief, candidates) {
  const countDiagnostics = candidates.length === brief.candidateCount ? [] : [diagnostic(
    "candidate.count.mismatch",
    `Generator returned ${candidates.length}; Product Brief requires exactly ${brief.candidateCount}`,
    "candidates",
  )];
  const comparisons = candidates.map((candidate, index) => candidateComparison(candidate, brief, index));
  const portfolioDiagnostics = [...countDiagnostics, ...diversityDiagnostics(candidates)];
  const portfolioBlocked = portfolioDiagnostics.some(item => item.severity === "error");
  const eligible = portfolioBlocked ? [] : comparisons.filter(item => item.eligible).sort((left, right) =>
    right.minimumAxisScore - left.minimumAxisScore
      || right.tieBreakScore - left.tieBreakScore
      || left.id.localeCompare(right.id),
  );
  const selected = eligible[0] || null;
  const receipt = selectionReceipt(brief, candidates, comparisons, portfolioDiagnostics, selected);
  const candidate = selected ? candidates.find(item => item.id === selected.id) : null;
  return {
    comparisons,
    portfolioDiagnostics,
    selected,
    receipt,
    productContract: selected && candidate ? compileWinner(brief, candidate, selected, receipt) : null,
  };
}

export async function developProductConcept({ brief, generator }) {
  const briefDiagnostics = validateProductBrief(brief);
  if (briefDiagnostics.some(item => item.severity === "error")) {
    return { ok: false, diagnostics: briefDiagnostics, candidates: [], selectionReceipt: null, productContract: null };
  }
  if (!generator || typeof generator.generateCandidates !== "function") {
    return {
      ok: false,
      diagnostics: [diagnostic(
        "generator.adapter.required",
        "A real model adapter or an explicitly named fixture adapter must implement generateCandidates({ brief, rubric })",
        "generator",
      )],
      candidates: [], selectionReceipt: null, productContract: null,
    };
  }

  const generated = await generator.generateCandidates({
    brief: structuredClone(brief),
    rubric: { axes: PRODUCT_STRESS_AXES, scoreRange: [0, 4], minimumAxisScore: 3 },
  });
  const candidates = Array.isArray(generated) ? generated : generated?.candidates;
  if (!Array.isArray(candidates)) {
    return {
      ok: false,
      diagnostics: [diagnostic("generator.output.invalid", "Generator adapter must return candidates", "generator")],
      candidates: [], selectionReceipt: null, productContract: null,
    };
  }
  const derived = deriveDevelopmentArtifacts(brief, candidates);
  const diagnostics = [
    ...derived.portfolioDiagnostics,
    ...derived.comparisons.flatMap(item => item.diagnostics),
  ];
  if (!derived.selected) diagnostics.push(diagnostic(
    "product.maturity.no-winner",
    "No Concept Candidate survived every hard gate and every stress axis",
    "selectionReceipt",
  ));
  return {
    ok: Boolean(derived.selected),
    diagnostics,
    candidates,
    selectionReceipt: derived.receipt,
    productContract: derived.productContract,
  };
}

function legacyDomain(slug) {
  if (slug === "dvor") return [
    { term: "House", definition: "A verified multi-apartment address and its private shared product space." },
    { term: "Resident", definition: "A person whose residence in one House has been verified." },
    { term: "House matter", definition: "An announcement, incident, or question tied to a House and a next action." },
  ];
  return [
    { term: "Look", definition: "A wearable combination published as one social content unit." },
    { term: "Wardrobe", definition: "A person's saved and owned clothing context for assembling Looks." },
    { term: "Remix", definition: "A new Look assembled in response to another person's Look." },
  ];
}

export function migrateLegacyProductContract(concept) {
  if (!LEGACY_MIGRATION_SLUGS.has(concept?.slug)) return null;
  const screens = concept.screens || [];
  const permissions = concept.permissions || [];
  const referenceProfile = concept.native?.design?.referenceProfile || null;
  const coreLoop = concept.product?.coreLoop || [];
  const contract = {
    schemaVersion: PRODUCT_MATURITY_SCHEMA_VERSION,
    id: `${concept.slug}:legacy-migration-v1`,
    source: { kind: "legacy-migration", briefId: null, candidateId: null, selectionReceiptId: null },
    status: "migration-baseline",
    audience: { primary: concept.product?.audience, needs: [concept.product?.problem] },
    context: { situations: [concept.product?.situation], constraints: ["Preserve the accepted native product while adopting the maturity contract"] },
    reference: {
      strategy: concept.native?.design?.strategy || concept.positioning?.mode,
      family: resolveReferenceProfile(referenceProfile)?.referenceFamily || concept.targetSet,
      profileId: referenceProfile,
      mentalModel: concept.positioning?.categoryFit,
      naturalFit: concept.positioning?.familiarPatterns?.join("; "),
      productMapping: concept.positioning?.distinctions?.join("; "),
      borrowedPatterns: concept.positioning?.referencePatterns || [],
      tensions: ["This contract preserves a product that predates multi-candidate selection and does not claim new market evidence."],
      evidenceRefs: ["legacy-contract", "reference-profile"],
    },
    productThesis: concept.product?.promise,
    insight: { claim: concept.insight || concept.product?.problem, evidenceRefs: ["legacy-contract"] },
    job: {
      actor: concept.product?.audience,
      situation: concept.product?.situation,
      motivation: concept.product?.problem,
      outcome: concept.product?.promise,
    },
    wedge: {
      audience: concept.product?.audience,
      situation: concept.product?.situation,
      mechanism: concept.product?.differentiator,
    },
    observableDifferentiation: {
      kind: "behavior",
      behavior: concept.positioning?.distinctions?.join("; "),
      comparator: concept.positioning?.categoryFit,
      measurement: `Reach and complete ${concept.product?.verticalSlice?.action || "the primary action"}`,
      threshold: "The declared vertical slice completes with one observable product outcome",
      experiment: `Replay ${concept.product?.verticalSlice?.entry || "entry"} → ${concept.product?.verticalSlice?.result || "result"}`,
      coreLoopStep: coreLoop[1] || coreLoop[0],
      evidenceRefs: ["legacy-contract"],
    },
    valueExchange: {
      userGives: [concept.slug === "dvor" ? "Reports or responds to one House matter" : "Publishes, saves, or remixes one Look"],
      userGets: [concept.product?.promise],
    },
    contentModel: {
      primaryUnit: concept.slug === "dvor" ? "House matter" : "Look",
      relationships: concept.positioning?.familiarPatterns || [],
    },
    contentSupply: {
      coldStartSources: ["Committed representative content in the native product adapter"],
      ongoingSources: [concept.slug === "dvor" ? "Verified Residents publish House matters" : "People publish Looks and remixes"],
      contributorIncentives: concept.product?.returnReasons || [],
      qualityControls: [concept.slug === "dvor" ? "Residence verification and House-scoped visibility" : "Author identity, reporting, and explicit saves"],
    },
    socialGraphLeverage: {
      relationship: concept.slug === "dvor" ? "Residents connected by one verified House" : "Authors, followers, friends, and conversations",
      mechanism: concept.product?.differentiator,
      valueWithoutGraph: "Representative first-session content and a direct primary task remain available before graph growth",
    },
    coldStart: {
      firstSessionValue: concept.product?.promise,
      seededContent: "The native adapter includes representative typical, stress, and failure content",
      emptyStateAction: `Start the primary flow at ${concept.product?.verticalSlice?.entry || "the root surface"}`,
    },
    activation: {
      moment: `The user reaches ${concept.product?.verticalSlice?.result || "the vertical-slice result"}`,
      signal: `Completion of ${concept.product?.verticalSlice?.action || "the primary action"}`,
      window: "First meaningful session",
    },
    coreLoop: {
      trigger: coreLoop[0] || concept.product?.situation,
      action: coreLoop[1] || concept.product?.verticalSlice?.action,
      reward: concept.product?.promise,
      contribution: coreLoop[2] || concept.product?.verticalSlice?.result,
      hypothesis: `The declared loop returns the audience for ${concept.product?.returnReasons?.[0] || "new product value"}`,
      successMetric: "Activation and repeat-loop events are observed separately; migration does not assert a retention result",
      testPlan: "Replay the vertical slice and collect real-user evidence before claiming retention",
      evidenceRefs: ["legacy-contract"],
    },
    habitLoop: {
      cue: concept.product?.returnReasons?.[0] || "New relevant product state",
      routine: coreLoop[1] || "Complete the primary product task",
      reward: concept.product?.promise,
      frequency: "To be measured; no cadence is invented during migration",
    },
    retention: {
      reasons: concept.product?.returnReasons || [],
      leadingIndicators: ["Second core-loop completion", "Return after a new relevant product state"],
    },
    permissions: permissions.map(permission => ({
      key: permission.key,
      productValue: permission.feature,
      flow: `${permission.screen} → ${permission.target}`,
      requestMoment: `On ${permission.gesture} from ${permission.screen}`,
      deniedFallback: permission.fallback,
      role: permission.anchor ? "core" : "supporting",
    })),
    trustSafety: {
      risks: ["User content or social interaction can create abuse, impersonation, or unsafe disclosure"],
      controls: ["Scoped visibility, reporting, deterministic denied fallbacks, and explicit review notes"],
      reporting: "Product-owned report and support paths must remain reachable from affected content",
    },
    privacy: {
      data: (concept.appStore?.privacy || []).map(item => `${item.apple}: ${item.why}`),
      principles: ["Request access only at the declared gesture", "Keep the declared denied fallback useful", "Do not infer evidence not present in the source contract"],
      retention: "Follow the declared local/provider ownership; migration introduces no new retention claim",
    },
    businessLogic: {
      model: concept.appStore?.price || "Free product; model remains constrained by the existing App Store contract",
      payer: concept.slug === "dvor" ? "Local advertisers where ATT consent exists" : "No payer asserted by migration",
      value: concept.product?.promise,
      viabilitySignal: "Activation and repeat-loop evidence, separated from automated UI quality",
      constraints: "No deceptive permission justification and no business claim without evidence intake",
    },
    nonGoals: concept.product?.nonGoals || [],
    risks: [
      { risk: "Legacy product predates comparative selection", mitigation: "Keep migration status explicit", killSignal: "A new concept attempts to use legacy status" },
      { risk: "Declared return reasons are not retention proof", mitigation: "Collect real behavior evidence", killSignal: "Retention is claimed from simulator evidence" },
    ],
    assumptions: [
      { claim: "The existing audience recognises the primary value", risk: "high", validation: "Real-user activation study", status: "needs-validation" },
      { claim: "The content supply replenishes after seeded content", risk: "high", validation: "Supply-side pilot", status: "needs-validation" },
    ],
    evidence: [
      { id: "legacy-contract", type: "user-input", source: `concepts/${concept.slug}/concept.json`, status: "approved", supports: ["existing product scope", "vertical slice", "permission map"] },
      { id: "reference-profile", type: "reference-profile", source: referenceProfile ? `native/ReferenceProfiles/${referenceProfile}/profile.json` : "native differentiation strategy", status: "approved", supports: ["reference grammar only; not market demand"] },
    ],
    delivery: {
      domainGlossary: legacyDomain(concept.slug),
      personas: [{ name: "Primary persona", context: concept.product?.audience, job: concept.product?.promise }],
      criticalFlows: (concept.prototypes || []).map(flow => ({ id: flow.id, name: flow.label, trigger: flow.start, steps: flow.screens, outcome: flow.note })),
      architecture: {
        modules: [
          { name: "Product adapter", responsibility: `Own ${concept.name} domain state and screens`, owns: `native/apps/${concept.slug}` },
          { name: "Native runtime", responsibility: "Own iOS lifecycle and permission adapters", owns: "native/Runtime" },
          { name: "Reference profile", responsibility: "Own evidence-backed mimicry recipes", owns: `native/ReferenceProfiles/${referenceProfile}` },
        ],
        boundaries: ["Product state does not leak into shared visual primitives", "Reference recipes do not invent product behavior", "System capabilities remain behind runtime adapters"],
      },
      data: {
        entities: legacyDomain(concept.slug).map(item => item.term),
        state: ["Session state", "Product-owned persisted mutations", "Permission and denied state", "Capture state through the real product surface"],
        persistence: ["UserDefaults for explicit local product state", "Keychain/App Group only where capability plans declare them"],
        integrations: (concept.backendless || []).map(item => `${item.needs}: ${item.solution}`),
      },
      experienceStates: {
        loading: "Keep product context visible and disable duplicate submission while work is in progress.",
        empty: "Explain what is absent and expose a product action that can create or discover value.",
        error: "Name the failed operation, preserve user input, and offer retry or a useful fallback.",
        denied: "Keep the product task reachable through the permission's declared denied fallback.",
        offline: "Show persisted content or an explicit retry path without claiming fresh remote data.",
      },
      accessibility: ["VoiceOver labels and reading order", "44pt hit targets", "Accessibility XXXL without clipping", "Reduced Motion and sufficient contrast"],
      localization: { locales: ["ru"], requirements: ["No concatenated user-facing strings", "Stress-test long copy and plural forms", "Keep permission copy aligned with App Store notes"] },
      analytics: {
        events: ["product_opened", "activation_completed", "core_loop_completed", "permission_requested", "permission_denied_fallback_used"],
        successMetrics: ["Activation completion rate", "Second core-loop completion", "Permission fallback task completion", "Critical-flow error recovery"],
      },
      testing: {
        levels: ["Product contract compile", "Interaction replay", "XCUI smoke", "Capture and independent product/visual review"],
        evidencePlan: ["Preserve provenance for every new product claim", "Do not convert simulator results into user-demand evidence"],
        capturePlan: screens.flatMap(screen => (screen.ui?.states || ["default"]).map(state => `${screen.id}--${state}`)),
      },
      setup: {
        prerequisites: ["Node 22", "Xcode with an iOS 26 simulator"],
        build: [`npm run build -- ${concept.slug}`],
        run: [`npm run smoke -- ${concept.slug}`, `npm run capture -- ${concept.slug}`],
      },
      ownership: {
        generated: [`native/build/${concept.slug}`, `concepts/${concept.slug}/docs/developer-guide.md`],
        owned: [`concepts/${concept.slug}/concept.json`, `native/apps/${concept.slug}`, `native/apps/${concept.slug}/capture.json`],
      },
      limitations: ["Legacy migration has no original multi-candidate selection receipt", "Retention and market demand still require real-user evidence", "Physical-device and VoiceOver gates remain manual"],
      acceptanceCriteria: ["Product contract and native manifest compile", "Every declared action has an outcome", "Every permission has timing and denied fallback", "All declared screenshot states have real capture ownership", "Independent product/visual review is recorded"],
      appStoreNotes: ["Permission claims must match reachable behavior and privacy labels", "Do not claim server, evidence, or reference fidelity that is not present", ...(concept.appStore?.description?.slice(0, 1) || [])],
    },
    maturity: {
      status: "migration-baseline",
      minimumAxisScore: 3,
      axisScores: Object.fromEntries(PRODUCT_STRESS_AXES.map(axis => [axis, 3])),
      gates: [{ id: "legacy-migration-allowlist", pass: true, reasons: [] }],
    },
  };
  return Object.freeze({ contractId: stableProductArtifactId("product", contract), ...contract });
}

export function auditCanonicalProductContract(contract, concept = null) {
  const diagnostics = [];
  if (!contract) return [diagnostic(
    "product.contract.required",
    "A canonical Product Contract is required before native compilation",
    "productContract",
  )];
  if (contract.schemaVersion !== PRODUCT_MATURITY_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "product.contract.schema-version.unsupported", "Product Contract schemaVersion must be 1", "productContract.schemaVersion",
  ));
  pushText(diagnostics, contract.contractId, "productContract.contractId", "Product Contract id", 8);
  const { contractId, ...identityBody } = contract;
  const expectedId = stableProductArtifactId("product", identityBody);
  if (contractId !== expectedId) diagnostics.push(diagnostic(
    "product.contract.unstable", `Product Contract id must be ${expectedId}`, "productContract.contractId",
  ));
  pushText(diagnostics, contract.id, "productContract.id", "Product Contract id", 3);
  pushText(diagnostics, contract.productThesis, "productContract.productThesis", "Product thesis", 16);
  if (contract.status === "migration-baseline") {
    if (!LEGACY_MIGRATION_SLUGS.has(concept?.slug) || contract.source?.kind !== "legacy-migration") diagnostics.push(diagnostic(
      "product.contract.legacy-forbidden",
      "Migration baseline is restricted to the existing Looks and Dvor products",
      "productContract.status",
    ));
  } else if (contract.status !== "mature") diagnostics.push(diagnostic(
    "product.contract.status-not-mature", "Product Contract has not passed selection", "productContract.status",
  ));
  else {
    if (contract.source?.kind !== "selected-candidate") diagnostics.push(diagnostic(
      "product.contract.source-invalid", "A mature Product Contract must come from a selected candidate", "productContract.source.kind",
    ));
    for (const key of ["briefId", "candidateId", "selectionReceiptId"]) pushText(
      diagnostics, contract.source?.[key], `productContract.source.${key}`, `Product Contract source ${key}`, 3,
    );
  }
  if (contract.maturity?.status !== contract.status) diagnostics.push(diagnostic(
    "product.contract.maturity-status-drift", "Product Contract status and maturity status differ", "productContract.maturity.status",
  ));
  if (!Number.isInteger(contract.maturity?.minimumAxisScore) || contract.maturity.minimumAxisScore < 3 || contract.maturity.minimumAxisScore > 4) diagnostics.push(diagnostic(
    "product.contract.axis-floor-failed", "Product Contract has a stress axis below 3/4", "productContract.maturity.minimumAxisScore",
  ));
  for (const axis of PRODUCT_STRESS_AXES) {
    const score = contract.maturity?.axisScores?.[axis];
    if (!Number.isInteger(score) || score < 3 || score > 4) diagnostics.push(diagnostic(
      "product.contract.axis-failed", `Product Contract failed ${axis}`, `productContract.maturity.axisScores.${axis}`,
    ));
  }
  if (!hasItems(contract.maturity?.gates)) diagnostics.push(diagnostic(
    "product.contract.gates-required", "Product Contract must retain its maturity gate receipt", "productContract.maturity.gates",
  ));
  for (const item of contract.maturity?.gates || []) {
    if (!hasText(item?.id, 2) || !Array.isArray(item?.reasons) || item?.pass !== true) diagnostics.push(diagnostic(
      "product.contract.gate-failed", `Product Contract gate ${item?.id || "unknown"} is incomplete or failed: ${(item?.reasons || []).join("; ")}`, "productContract.maturity.gates",
    ));
  }

  const evidenceRef = contract.evidence?.[0]?.id;
  const candidateShape = {
    ...contract,
    name: contract.id,
    referenceFit: contract.reference,
    stressTest: {
      axes: PRODUCT_STRESS_AXES.map(axis => ({
        id: axis,
        score: contract.maturity?.axisScores?.[axis],
        rationale: `Canonical Product Contract retained the selected ${axis} assessment.`,
        evidenceRefs: evidenceRef ? [evidenceRef] : [],
        failureModes: [`Re-select the product if ${axis} falls below the maturity floor.`],
      })),
    },
  };
  const briefShape = {
    permissions: (contract.permissions || []).map(item => ({ key: item.key, priority: "required" })),
    reference: {
      strategy: contract.reference?.strategy,
      family: contract.reference?.family,
      profileId: contract.reference?.profileId,
    },
  };
  diagnostics.push(...validateConceptCandidate(candidateShape, briefShape, 0).map(item => ({
    ...item,
    path: item.path.replace(/^candidates\[0\]/, "productContract"),
  })));
  for (const item of runDeterministicMaturityGates(briefShape, candidateShape)) if (!item.pass) diagnostics.push(diagnostic(
    "product.contract.gate-recomputed-failed",
    `Product Contract no longer passes ${item.id}: ${item.reasons.join("; ")}`,
    "productContract.maturity.gates",
  ));
  return diagnostics;
}

export function verifyProductDevelopmentArtifact(artifact) {
  const briefDiagnostics = validateProductBrief(artifact?.brief);
  const diagnostics = [...briefDiagnostics];
  if (artifact?.schemaVersion !== PRODUCT_MATURITY_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "product-development.schema-version.unsupported",
    "Product Development artifact schemaVersion must be 1",
    "schemaVersion",
  ));
  const candidates = Array.isArray(artifact?.candidates) ? artifact.candidates : [];
  if (!Array.isArray(artifact?.candidates)) diagnostics.push(diagnostic(
    "candidate.collection.required", "Product development artifact must contain candidate array", "candidates",
  ));
  for (const [index, candidate] of candidates.entries()) diagnostics.push(
    ...validateConceptCandidate(candidate, artifact?.brief, index),
  );
  const derived = briefDiagnostics.some(item => item.severity === "error")
    ? null
    : deriveDevelopmentArtifacts(artifact.brief, candidates);
  const receipt = artifact?.selectionReceipt;
  if (!receipt) diagnostics.push(diagnostic(
    "selection.receipt.required", "Product development artifact has no Selection Receipt", "selectionReceipt",
  ));
  else {
    const { receiptId, ...body } = receipt;
    const expected = stableProductArtifactId("selection", body);
    if (receiptId !== expected) diagnostics.push(diagnostic(
      "selection.receipt.unstable", `Selection Receipt id must be ${expected}`, "selectionReceipt.receiptId",
    ));
    if (derived && JSON.stringify(canonicalize(receipt)) !== JSON.stringify(canonicalize(derived.receipt))) diagnostics.push(diagnostic(
      "selection.receipt.reproduction-drift",
      "Selection Receipt does not reproduce from the Product Brief and Concept Candidates",
      "selectionReceipt",
    ));
  }
  const contract = artifact?.productContract;
  diagnostics.push(...auditCanonicalProductContract(contract));
  if (contract) {
    if (contract.source?.selectionReceiptId !== receipt?.receiptId) diagnostics.push(diagnostic(
      "product.contract.receipt-drift", "Product Contract does not point to this Selection Receipt", "productContract.source.selectionReceiptId",
    ));
    if (contract.source?.candidateId !== receipt?.selectedCandidateId) diagnostics.push(diagnostic(
      "product.contract.candidate-drift", "Product Contract winner differs from Selection Receipt", "productContract.source.candidateId",
    ));
    if (derived && JSON.stringify(canonicalize(contract)) !== JSON.stringify(canonicalize(derived.productContract))) diagnostics.push(diagnostic(
      "product.contract.reproduction-drift",
      "Product Contract does not reproduce from the selected candidate and Selection Receipt",
      "productContract",
    ));
  }
  return diagnostics;
}

/**
 * Small concept-facing interface for the complete product-development cycle.
 * Callers do not choose between embedded selection, standalone contracts, and
 * the compatibility migration; this module owns that ordering and validation.
 */
export function resolveProductDevelopment(concept) {
  if (concept?.productDevelopment) {
    return Object.freeze({
      source: "embedded-development",
      contract: concept.productDevelopment.productContract || null,
      selectionReceipt: concept.productDevelopment.selectionReceipt || null,
      diagnostics: verifyProductDevelopmentArtifact(concept.productDevelopment),
    });
  }
  if (concept?.productContract) {
    return Object.freeze({
      source: "standalone-contract",
      contract: concept.productContract,
      selectionReceipt: null,
      diagnostics: auditCanonicalProductContract(concept.productContract, concept),
    });
  }
  const contract = migrateLegacyProductContract(concept);
  return Object.freeze({
    source: "legacy-migration",
    contract,
    selectionReceipt: null,
    diagnostics: auditCanonicalProductContract(contract, concept),
  });
}
