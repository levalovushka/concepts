function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

const roles = ["entry", "action", "result"];
const allowedStates = new Set(["populated/default", "loading", "empty", "error", "offline", "permission-denied", "permission-granted"]);

export function verifyNativeSliceContract(contract, productCoreArtifact) {
  const diagnostics = [];
  const core = productCoreArtifact?.core;
  if (!core) return [diagnostic("slice.core", "Product Core artifact is required", "productCoreArtifact")];
  const surfaces = contract?.surfaces || [];
  if (surfaces.length !== 3 || surfaces.map(item => item.role).join("|") !== roles.join("|")) diagnostics.push(diagnostic(
    "slice.surfaces", "Native slice must contain ordered entry, action and result surfaces", "surfaces",
  ));
  const surfaceIds = new Set(surfaces.map(item => item.id));
  if (surfaceIds.size !== surfaces.length) diagnostics.push(diagnostic("slice.surface-id", "Slice surface ids must be unique", "surfaces"));
  const actions = new Set(core.world.actions.map(item => item.id));
  const proofActions = new Set(core.proof.steps.map(item => item.actionId));
  const ownedActions = new Set();
  for (const [index, surface] of surfaces.entries()) {
    const path = `surfaces[${index}]`;
    if (!surface.id || !surface.title || !surface.recipe) diagnostics.push(diagnostic("slice.surface", `Slice ${surface.role} needs id, title and recipe`, path));
    if (!(surface.states || []).includes("populated/default") || (surface.states || []).some(state => !allowedStates.has(state))) diagnostics.push(diagnostic(
      "slice.states", `Slice surface ${surface.id} needs explicit applicable states`, `${path}.states`,
    ));
    for (const actionId of surface.actionIds || []) {
      if (!actions.has(actionId)) diagnostics.push(diagnostic("slice.action", `Slice surface ${surface.id} references unknown action ${actionId}`, `${path}.actionIds`));
      if (ownedActions.has(actionId)) diagnostics.push(diagnostic("slice.action-owner", `Action ${actionId} appears on two slice surfaces`, `${path}.actionIds`));
      ownedActions.add(actionId);
    }
    if (!surface.content?.headline || !surface.content?.body) diagnostics.push(diagnostic("slice.content", `Slice surface ${surface.id} needs canonical content`, `${path}.content`));
    if (surface.role === "entry" && !surface.content?.author) diagnostics.push(diagnostic(
      "slice.content.author", "Entry surface needs a canonical authored identity", `${path}.content.author`,
    ));
    if (surface.role === "action" && (surface.content?.details || []).length < 2) diagnostics.push(diagnostic(
      "slice.content.details", "Action surface needs at least two concrete input details", `${path}.content.details`,
    ));
    if (surface.role === "result" && (!surface.content?.summary?.title || !surface.content?.summary?.detail)) diagnostics.push(diagnostic(
      "slice.content.summary", "Result surface needs an observable summary", `${path}.content.summary`,
    ));
  }
  for (const actionId of proofActions) if (!ownedActions.has(actionId)) diagnostics.push(diagnostic(
    "slice.proof", `Product proof action ${actionId} is not visible in the slice`, "surfaces.actionIds",
  ));
  for (const [index, transition] of (contract?.transitions || []).entries()) {
    if (!surfaceIds.has(transition.from) || !surfaceIds.has(transition.to) || !actions.has(transition.actionId)) diagnostics.push(diagnostic(
      "slice.transition", "Slice transition must connect known surfaces through a product action", `transitions[${index}]`,
    ));
  }
  if ((contract?.acceptanceJourney?.actionIds || []).join("|") !== core.proof.steps.map(item => item.actionId).join("|")) diagnostics.push(diagnostic(
    "slice.journey", "Slice acceptance journey must execute the Product Core proof in order", "acceptanceJourney.actionIds",
  ));
  return Object.freeze(diagnostics);
}
