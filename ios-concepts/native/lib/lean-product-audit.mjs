import { auditCapabilityOutcomeImplementation } from "./capability-outcome-contract.mjs";

export function auditLeanProduct({ blueprint, manifest, swiftSource, runtimeSource = "", uiTestSource = "" }) {
  const problems = [];
  const actions = new Map(blueprint.world.actions.map(action => [action.id, action]));
  const screens = new Map(blueprint.navigation.screens.map(screen => [screen.id, screen]));
  const compiled = new Map(manifest.interactions.actions.map(action => [action.id, action]));

  for (const action of compiled.values()) {
    if (action.outcome.type !== "navigate") continue;
    const target = action.outcome.target?.split("#")[0];
    if (!target || !screens.has(target)) problems.push(`${action.id}: navigate outcome has no real screen`);
  }
  for (const id of blueprint.coreLoop.actionIds) {
    const action = compiled.get(id);
    if (!action || !swiftSource.includes(`.nativeAction("${action.surface}.${id}")`)) {
      problems.push(`${id}: core-loop action has no bound product control`);
    }
  }
  if (blueprint.socialGrammar.feedbackModes.includes("comment")) {
    if (!actions.has("open_comments") || !actions.has("respond_to_post")) problems.push("comments need separate open and submit actions");
    if (compiled.get("open_comments")?.outcome?.target !== "post_detail#comments") problems.push("open_comments must navigate to the focused comment thread");
    for (const marker of ["feed.open_comments", "post_detail.respond_to_post"]) {
      if (!swiftSource.includes(`.nativeAction("${marker}")`)) problems.push(`${marker}: comment intent is not bound to its own control`);
    }
  }
  if ((blueprint.capabilities || []).length >= 10) {
    for (const id of ["settings", "accesses"]) if (!screens.has(id)) problems.push(`${id}: capability-rich product needs this real screen`);
    if (!swiftSource.includes("UIApplication.openSettingsURLString")) problems.push("denied capabilities need a route to iPhone settings");
  }
  problems.push(...auditCapabilityOutcomeImplementation({ capabilities: blueprint.capabilities, manifest, swiftSource, runtimeSource, uiTestSource }));
  return problems;
}
