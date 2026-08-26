function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

const allowedRoles = new Set(["entry", "action", "result", "support"]);
const allowedStates = new Set(["populated/default", "loading", "empty", "error", "offline", "permission-denied", "permission-granted"]);

function stableSurface(surface) {
  return JSON.stringify({
    id: surface.id, role: surface.role, recipe: surface.recipe,
    actionIds: surface.actionIds, content: surface.content,
  });
}

export function verifyNativeFullContractV2(contract, { productCoreArtifact, capabilityPlan, acceptedSlice }) {
  const diagnostics = [];
  const core = productCoreArtifact?.core;
  if (!core) return [diagnostic("full.core", "Product Core artifact is required", "productCoreArtifact")];
  if (contract?.schemaVersion !== 2) diagnostics.push(diagnostic("full.schema", "Full experience contract schemaVersion must be 2", "schemaVersion"));
  const surfaces = contract?.surfaces || [];
  if (surfaces.length < 5) diagnostics.push(diagnostic("full.surfaces", "Full experience must have at least five meaningful surfaces", "surfaces"));
  const surfaceById = new Map(surfaces.map(item => [item.id, item]));
  if (surfaceById.size !== surfaces.length) diagnostics.push(diagnostic("full.surface-id", "Full surface ids must be unique", "surfaces"));

  const tabs = contract?.rootTabs || [];
  if (tabs.length !== 5 || new Set(tabs.map(item => item.surfaceId)).size !== 5) diagnostics.push(diagnostic(
    "full.root-tabs", "VK full expansion needs exactly five distinct root tabs", "rootTabs",
  ));
  for (const [index, tab] of tabs.entries()) if (!surfaceById.has(tab.surfaceId) || !tab.title || !tab.role) diagnostics.push(diagnostic(
    "full.root-tab", `Root tab ${index + 1} needs a known surface, title and icon role`, `rootTabs[${index}]`,
  ));

  const actionIds = new Set(core.world.actions.map(item => item.id));
  const owners = new Map();
  for (const [index, surface] of surfaces.entries()) {
    const path = `surfaces[${index}]`;
    if (!surface.id || !surface.title || !surface.recipe || !allowedRoles.has(surface.role)) diagnostics.push(diagnostic(
      "full.surface", "Every full surface needs id, title, supported role and recipe", path,
    ));
    const states = surface.states || [];
    if (!states.includes("populated/default") || states.some(state => !allowedStates.has(state))) diagnostics.push(diagnostic(
      "full.states", `${surface.id} needs explicit applicable states`, `${path}.states`,
    ));
    if (!surface.content?.headline || !surface.content?.body) diagnostics.push(diagnostic("full.content", `${surface.id} needs canonical content`, `${path}.content`));
    for (const actionId of surface.actionIds || []) {
      if (!actionIds.has(actionId)) diagnostics.push(diagnostic("full.action", `${surface.id} references unknown action ${actionId}`, `${path}.actionIds`));
      const current = owners.get(actionId) || [];
      current.push(surface.id);
      owners.set(actionId, current);
    }
  }
  for (const actionId of actionIds) {
    const actionOwners = owners.get(actionId) || [];
    if (actionOwners.length !== 1) diagnostics.push(diagnostic(
      "full.action-owner", `Action ${actionId} needs exactly one surface owner; found ${actionOwners.length}`, "surfaces.actionIds",
    ));
  }
  for (const binding of capabilityPlan?.bindings || []) if ((owners.get(binding.actionId) || []).length !== 1) diagnostics.push(diagnostic(
    "full.capability-owner", `Capability ${binding.key} lost owning action ${binding.actionId}`, "surfaces.actionIds",
  ));

  for (const accepted of acceptedSlice?.surfaces || []) {
    const expanded = surfaceById.get(accepted.id);
    if (!expanded || stableSurface(expanded) !== stableSurface(accepted)) diagnostics.push(diagnostic(
      "full.slice-drift", `Accepted slice surface ${accepted.id} changed during expansion`, `surfaces.${accepted.id}`,
    ));
  }
  for (const [index, transition] of (contract?.transitions || []).entries()) if (
    !surfaceById.has(transition.from) || !surfaceById.has(transition.to) || !actionIds.has(transition.actionId)
  ) diagnostics.push(diagnostic("full.transition", "Full transition must connect known surfaces through a product action", `transitions[${index}]`));

  const journeys = contract?.acceptanceJourneys || [];
  if (journeys.length < 3) diagnostics.push(diagnostic("full.journeys", "Full experience needs at least three executable journeys", "acceptanceJourneys"));
  const journeyActions = new Set(journeys.flatMap(item => item.actionIds || []));
  for (const actionId of core.coreLoop.actionIds) if (!journeyActions.has(actionId)) diagnostics.push(diagnostic(
    "full.journey-core-loop", `Core-loop action ${actionId} has no acceptance journey`, "acceptanceJourneys",
  ));
  for (const binding of capabilityPlan?.bindings || []) if (!journeyActions.has(binding.actionId)) diagnostics.push(diagnostic(
    "full.journey-capability", `Capability action ${binding.actionId} has no acceptance journey`, "acceptanceJourneys",
  ));

  const captureIds = new Set((contract?.verification?.captures || []).map(item => item.id));
  for (const surface of surfaces) for (const state of surface.states) {
    const id = `${surface.id}--${state}`;
    if (!captureIds.has(id)) diagnostics.push(diagnostic("full.capture", `Full capture plan is missing ${id}`, "verification.captures"));
  }
  return Object.freeze(diagnostics);
}
