import { USER_CONSENT_CAPABILITY_KEYS, resolveCapability } from "./capability-catalog.mjs";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function hasText(value, minimum = 12) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function compileCapabilityPlanV2({ productCoreArtifact, target, proposal, bundleId }) {
  const diagnostics = [];
  const core = productCoreArtifact?.core;
  if (!core) return Object.freeze({ ok: false, diagnostics: [diagnostic("capability.core", "Verified Product Core artifact is required", "productCoreArtifact")], plan: null });
  const targetKeys = new Set((target?.permissions || []).map(item => item.key));
  const entities = new Set(core.world.entities.map(item => item.id));
  const actions = new Map(core.world.actions.map(item => [item.id, item]));
  const coreActions = new Set(core.coreLoop.actionIds);
  const bindings = proposal?.bindings || [];
  const exclusions = proposal?.exclusions || [];
  const covered = new Set();
  const gestures = new Set();
  for (const [index, binding] of bindings.entries()) {
    const path = `bindings[${index}]`;
    if (!targetKeys.has(binding.key)) diagnostics.push(diagnostic("capability.unknown", `Capability ${binding.key} is outside the target profile`, `${path}.key`));
    if (covered.has(binding.key)) diagnostics.push(diagnostic("capability.duplicate", `Capability ${binding.key} is duplicated`, `${path}.key`));
    covered.add(binding.key);
    if (!actions.has(binding.actionId)) diagnostics.push(diagnostic("capability.action", `Capability ${binding.key} must bind to an existing product action`, `${path}.actionId`));
    if (!coreActions.has(binding.strengthensActionId)) diagnostics.push(diagnostic(
      "capability.core-link", `Capability ${binding.key} must name the core-loop action it strengthens`, `${path}.strengthensActionId`,
    ));
    if (gestures.has(binding.actionId)) diagnostics.push(diagnostic("capability.gesture-reused", `Action ${binding.actionId} cannot own two capabilities`, `${path}.actionId`));
    gestures.add(binding.actionId);
    if (!entities.has(binding.outcome?.entityId)) diagnostics.push(diagnostic("capability.outcome.entity", `Capability ${binding.key} outcome needs an existing product entity`, `${path}.outcome.entityId`));
    for (const field of ["purpose", "requestMoment", "platformEffect", "fallback", "testScenario"]) if (!hasText(binding[field])) diagnostics.push(diagnostic(
      "capability.contract", `Capability ${binding.key} needs a concrete ${field}`, `${path}.${field}`,
    ));
    if (!hasText(binding.outcome?.stateField, 3) || !hasText(binding.outcome?.proof)) diagnostics.push(diagnostic(
      "capability.outcome", `Capability ${binding.key} needs persisted entity state and visible proof`, `${path}.outcome`,
    ));
    const platform = resolveCapability(binding.key, { bundleId });
    if (!platform) diagnostics.push(diagnostic("capability.adapter", `Capability ${binding.key} has no deterministic iOS adapter`, `${path}.key`));
    if (USER_CONSENT_CAPABILITY_KEYS.has(binding.key) && binding.activation && binding.activation !== "contextual-gesture") diagnostics.push(diagnostic(
      "capability.activation", `User-consent capability ${binding.key} must be contextual`, `${path}.activation`,
    ));
  }
  for (const [index, exclusion] of exclusions.entries()) {
    const path = `exclusions[${index}]`;
    if (!targetKeys.has(exclusion.key) || covered.has(exclusion.key)) diagnostics.push(diagnostic("capability.exclusion", `Invalid exclusion for ${exclusion.key}`, path));
    covered.add(exclusion.key);
    if (!hasText(exclusion.reason, 24)) diagnostics.push(diagnostic("capability.exclusion.reason", `Exclusion ${exclusion.key} needs a product reason`, `${path}.reason`));
  }
  if (covered.size !== targetKeys.size || [...targetKeys].some(key => !covered.has(key))) diagnostics.push(diagnostic(
    "capability.coverage", "Every target capability must be intentionally bound or explicitly excluded", "capabilityPlan",
  ));
  if (proposal?.policy === "required" && exclusions.length) diagnostics.push(diagnostic(
    "capability.required", "Required capability policy does not allow exclusions", "exclusions",
  ));
  if (diagnostics.length) return Object.freeze({ ok: false, diagnostics: Object.freeze(diagnostics), plan: null });
  const compiledBindings = bindings.map(binding => Object.freeze({
    ...structuredClone(binding),
    activation: resolveCapability(binding.key, { bundleId }).activation,
    platform: Object.freeze(resolveCapability(binding.key, { bundleId })),
    userConsent: USER_CONSENT_CAPABILITY_KEYS.has(binding.key),
  }));
  return Object.freeze({
    ok: true,
    diagnostics: [],
    plan: Object.freeze({ schemaVersion: 2, policy: proposal.policy || "pool", bindings: Object.freeze(compiledBindings), exclusions: Object.freeze(exclusions.map(item => Object.freeze(structuredClone(item)))) }),
  });
}

