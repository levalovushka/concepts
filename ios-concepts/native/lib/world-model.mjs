const EXPERIENCE_STATES = Object.freeze(["loading", "populated", "empty", "error", "offline"]);
const BINDING_TEXT_FIELDS = Object.freeze(["purpose", "requestMoment", "deniedOutcome", "observableResult"]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function hasText(value, minimum = 8) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function auditWorldModel(model, target) {
  const diagnostics = [];
  if (!model || typeof model !== "object" || Array.isArray(model)) return [diagnostic(
    "world.required", "A structured World Model is required before screens or navigation.", "worldModel",
  )];
  if (model.schemaVersion !== 1) diagnostics.push(diagnostic("world.schema-version.unsupported", "World Model schemaVersion must be 1.", "worldModel.schemaVersion"));
  if (!hasText(model.id, 3)) diagnostics.push(diagnostic("world.id.required", "World Model needs a stable id.", "worldModel.id"));

  const entityIds = new Set();
  for (const [index, entity] of (model.entities || []).entries()) {
    const path = `worldModel.entities[${index}]`;
    if (entityIds.has(entity.id)) diagnostics.push(diagnostic("world.entity.duplicate", `Duplicate entity ${entity.id}.`, `${path}.id`));
    entityIds.add(entity.id);
    if (!hasText(entity.name, 2) || !["user", "shared", "system"].includes(entity.ownership) || !entity.states?.length) diagnostics.push(diagnostic(
      "world.entity.incomplete", "Every entity needs a name, ownership and lifecycle states.", path,
    ));
  }
  if (!entityIds.size) diagnostics.push(diagnostic("world.entities.required", "World Model needs product entities.", "worldModel.entities"));

  const actionIds = new Set();
  for (const [index, action] of (model.actions || []).entries()) {
    const path = `worldModel.actions[${index}]`;
    if (actionIds.has(action.id)) diagnostics.push(diagnostic("world.action.duplicate", `Duplicate action ${action.id}.`, `${path}.id`));
    actionIds.add(action.id);
    if (!(action.actor === "system" || entityIds.has(action.actor)) || !entityIds.has(action.target)) diagnostics.push(diagnostic(
      "world.action.entity-unknown", `Action ${action.id || index} must connect known entities.`, path,
    ));
    if (!hasText(action.intent) || !action.preconditions?.length || !action.effects?.length || !action.failures?.length || !hasText(action.offlineBehavior)) diagnostics.push(diagnostic(
      "world.action.incomplete", `Action ${action.id || index} needs intent, preconditions, effects, failures and offline behavior.`, path,
    ));
  }
  if (!actionIds.size) diagnostics.push(diagnostic("world.actions.required", "World Model needs observable product actions.", "worldModel.actions"));

  const coreActions = new Set(model.coreActions || []);
  if (!coreActions.size || [...coreActions].some(id => !actionIds.has(id))) diagnostics.push(diagnostic(
    "world.core-actions.invalid", "Core actions must name one or more existing product actions.", "worldModel.coreActions",
  ));

  const requiredGrammar = target?.productGrammar;
  if (requiredGrammar) {
    const grammar = model.experienceGrammar;
    const relationshipIds = new Set((model.relationships || []).map(item => item.id));
    const entityById = new Map((model.entities || []).map(item => [item.id, item]));
    if (!grammar) diagnostics.push(diagnostic(
      "world.grammar.required",
      `${target.name} mimicry requires an explicit product grammar; visual styling cannot substitute for the social product model.`,
      "worldModel.experienceGrammar",
    ));
    else {
      for (const field of ["grammarId", "primarySurfaceRole", "primaryContentMode", "identityMode"]) {
        if (grammar[field] !== requiredGrammar[field === "grammarId" ? "id" : field]) diagnostics.push(diagnostic(
          "world.grammar.target-drift",
          `Experience grammar ${field} must match ${requiredGrammar[field === "grammarId" ? "id" : field]}.`,
          `worldModel.experienceGrammar.${field}`,
        ));
      }
      if (!entityById.has(grammar.identityEntityId) || entityById.get(grammar.identityEntityId)?.ownership === "system") diagnostics.push(diagnostic(
        "world.grammar.identity-invalid", "VK product identity must be grounded in a person or community entity, never a system placeholder.", "worldModel.experienceGrammar.identityEntityId",
      ));
      if (!entityById.has(grammar.primaryContentEntityId) || entityById.get(grammar.primaryContentEntityId)?.ownership === "system") diagnostics.push(diagnostic(
        "world.grammar.content-invalid", "VK primary content must be an authored, non-system entity.", "worldModel.experienceGrammar.primaryContentEntityId",
      ));
      if (!actionIds.has(grammar.distributionActionId)) diagnostics.push(diagnostic(
        "world.grammar.distribution-invalid", "VK feed distribution must map to an observable World Model action.", "worldModel.experienceGrammar.distributionActionId",
      ));
      const feedbackActions = new Set(grammar.feedbackActionIds || []);
      if (feedbackActions.size < requiredGrammar.minimumFeedbackModes || [...feedbackActions].some(id => !actionIds.has(id))) diagnostics.push(diagnostic(
        "world.grammar.feedback-actions-invalid", `VK social feedback needs at least ${requiredGrammar.minimumFeedbackModes} distinct mapped actions.`, "worldModel.experienceGrammar.feedbackActionIds",
      ));
      if (new Set(grammar.feedbackModes || []).size < requiredGrammar.minimumFeedbackModes) diagnostics.push(diagnostic(
        "world.grammar.feedback-modes-insufficient", `VK social feedback needs at least ${requiredGrammar.minimumFeedbackModes} meaningful modes.`, "worldModel.experienceGrammar.feedbackModes",
      ));
      if (!relationshipIds.has(grammar.relationshipId)) diagnostics.push(diagnostic(
        "world.grammar.relationship-invalid", "VK identity/content relationship must exist before screens are planned.", "worldModel.experienceGrammar.relationshipId",
      ));
      const loop = new Set(grammar.retentionLoopActionIds || []);
      if (loop.size < requiredGrammar.minimumRetentionActions || [...loop].some(id => !actionIds.has(id))) diagnostics.push(diagnostic(
        "world.grammar.retention-loop-invalid",
        `VK retention loop must map at least ${requiredGrammar.minimumRetentionActions} distinct return actions. Distribution and social feedback are validated independently.`,
        "worldModel.experienceGrammar.retentionLoopActionIds",
      ));
    }
  }

  if (model.authentication?.required !== true || model.authentication?.method !== target?.authentication?.method
      || !entityIds.has(model.authentication?.sessionEntity) || !hasText(model.authentication?.persistence)) diagnostics.push(diagnostic(
    "world.authentication.incomplete", "Authentication must match the target and persist a session owned by a known entity.", "worldModel.authentication",
  ));
  if (!model.runtime?.persistence?.length || !model.runtime?.demoAdapters?.length) diagnostics.push(diagnostic(
    "world.runtime.incomplete", "No-backend delivery requires explicit local persistence and demo adapters.", "worldModel.runtime",
  ));
  for (const [index, adapter] of (model.runtime?.demoAdapters || []).entries()) {
    const states = new Set(adapter.states || []);
    for (const state of EXPERIENCE_STATES) if (!states.has(state)) diagnostics.push(diagnostic(
      "world.runtime.state-missing", `Demo adapter ${adapter.id || index} lacks ${state}.`, `worldModel.runtime.demoAdapters[${index}].states`,
    ));
  }

  const available = new Set((target?.permissions || []).map(item => item.key));
  const seen = new Set();
  for (const [index, binding] of (model.capabilityBindings || []).entries()) {
    const path = `worldModel.capabilityBindings[${index}]`;
    if (seen.has(binding.key)) diagnostics.push(diagnostic("world.capability.duplicate", `Duplicate capability binding ${binding.key}.`, `${path}.key`));
    seen.add(binding.key);
    if (!available.has(binding.key)) diagnostics.push(diagnostic("world.capability.unknown", `Capability ${binding.key} is not available for ${target?.id}.`, `${path}.key`));
    if (!actionIds.has(binding.action)) diagnostics.push(diagnostic("world.capability.action-unknown", `Capability ${binding.key} points to unknown action ${binding.action}.`, `${path}.action`));
    for (const field of BINDING_TEXT_FIELDS) if (!hasText(binding[field])) diagnostics.push(diagnostic(
      "world.capability.incomplete", `Capability ${binding.key} needs ${field}.`, `${path}.${field}`,
    ));
  }
  if (!seen.size) diagnostics.push(diagnostic(
    "world.capability.selection-required", "Select at least one capability that naturally supports the product model.", "worldModel.capabilityBindings",
  ));
  const deliveryBindings = new Map((model.deliveryBindings || []).map(item => [item.id, item]));
  for (const obligation of target?.deliveryObligations || []) {
    const binding = deliveryBindings.get(obligation);
    if (!binding) diagnostics.push(diagnostic(
      "world.delivery.missing", `Delivery obligation ${obligation} is not grounded in the World Model.`, "worldModel.deliveryBindings",
    ));
    else if (!actionIds.has(binding.action) || !hasText(binding.observableResult)) diagnostics.push(diagnostic(
      "world.delivery.incomplete", `Delivery obligation ${obligation} needs an existing action and observable result.`, "worldModel.deliveryBindings",
    ));
  }
  return diagnostics;
}

export function compilePermissionGrounding(model, target) {
  const bindings = new Map((model.capabilityBindings || []).map(item => [item.key, item]));
  const actions = new Map((model.actions || []).map(item => [item.id, item]));
  const coreActions = new Set(model.coreActions || []);
  return (target.permissions || []).filter(permission => bindings.has(permission.key)).map(permission => {
    const binding = bindings.get(permission.key);
    const action = actions.get(binding?.action);
    return Object.freeze({
      key: permission.key,
      productValue: binding?.purpose || "",
      flow: action?.intent || "",
      requestMoment: binding?.requestMoment || "",
      deniedFallback: binding?.deniedOutcome || "",
      role: coreActions.has(binding?.action) ? "core" : "supporting",
    });
  });
}
