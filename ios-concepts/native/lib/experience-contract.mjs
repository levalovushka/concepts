import { createHash } from "node:crypto";
import { verifyFactoryDevelopmentArtifact } from "./product-factory.mjs";

export const EXPERIENCE_STATE_IDS = Object.freeze([
  "loading", "populated/default", "empty", "error", "offline",
  "permission-needed", "permission-denied", "permission-restricted", "permission-limited",
]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function stableId(value) {
  return `experience-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

function hasText(value, minimum = 3) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function actionDestination(action, nodeIds) {
  for (const value of [action?.outcome?.destination, action?.outcome?.target]) {
    if (typeof value === "string" && nodeIds.has(value)) return value;
  }
  return null;
}

function selectedWorldModel(artifact) {
  return (artifact?.worldModels || []).find(item => item.id === artifact.selectedWorldModelId) || null;
}

export function enforceExperienceStatePolicy(plan) {
  const normalized = structuredClone(plan);
  const nodes = new Map((normalized.navigation?.nodes || []).map(item => [item.id, item]));
  const actionsBySurface = Map.groupBy(normalized.actions || [], item => item.surface);
  const permissionsBySurface = Map.groupBy(normalized.permissionFlows || [], item => item.surface);
  for (const policy of normalized.states || []) {
    const node = nodes.get(policy.screenId);
    const actions = actionsBySurface.get(policy.screenId) || [];
    const permissions = (permissionsBySurface.get(policy.screenId) || [])
      .filter(item => ["camera", "mic", "speech", "photos", "photo", "location", "push", "contacts", "calendar", "tracking"].includes(item.key));
    const systemOwned = ["system", "external"].includes(node?.presentation);
    const asyncWork = actions.some(action => action.outcome?.type === "request"
      || /(?:офлайн|очеред|сети|network|queue)/iu.test(action.persistence || ""));
    const collection = node?.presentation === "tab" && policy.screenId !== "profile";
    for (const variant of policy.variants || []) {
      if (variant.id === "populated/default") variant.applicable = true;
      else if (systemOwned) variant.applicable = false;
      else if (variant.id === "loading") variant.applicable = asyncWork;
      else if (variant.id === "empty") variant.applicable = collection;
      else if (variant.id === "error") variant.applicable = asyncWork;
      else if (variant.id === "offline") variant.applicable = asyncWork || collection;
      else if (["permission-needed", "permission-denied", "permission-restricted"].includes(variant.id)) variant.applicable = permissions.length > 0;
      else if (variant.id === "permission-limited") variant.applicable = permissions.some(item => ["photos", "location"].includes(item.key));
    }
    const priority = collection
      ? ["populated/default", "empty", "loading", "error", "offline"]
      : permissions.length
        ? ["populated/default", "error", "offline", "permission-denied"]
        : ["populated/default", "loading", "error", "offline"];
    const budget = collection ? 5 : 4;
    const keep = new Set(priority.filter(id => policy.variants?.some(item => item.id === id && item.applicable)).slice(0, budget));
    for (const variant of policy.variants || []) if (variant.applicable && !keep.has(variant.id)) variant.applicable = false;
  }
  return normalized;
}

export function repairExperienceTopology(plan, model) {
  const normalized = structuredClone(plan);
  normalized.navigation ||= { roots: [], nodes: [] };
  const productRoot = normalized.authentication?.successSurface
    || normalized.navigation.roots?.find(id => id !== normalized.authentication?.entrySurface)
    || normalized.navigation.nodes?.find(item => item.presentation === "root")?.id;

  // System permission sheets are owned by iOS, not by the product navigation
  // graph. Keeping them as app screens creates unreachable empty surfaces and
  // encourages generators to draw fake permission UI.
  const removedSystemScreens = new Set(normalized.navigation.nodes
    .filter(item => item.presentation === "system")
    .map(item => item.id));
  normalized.navigation.nodes = normalized.navigation.nodes.filter(item => !removedSystemScreens.has(item.id));
  normalized.navigation.roots = (normalized.navigation.roots || []).filter(id => !removedSystemScreens.has(id));
  normalized.states = (normalized.states || []).filter(item => !removedSystemScreens.has(item.screenId));
  normalized.screenBlueprints = (normalized.screenBlueprints || []).filter(item => !removedSystemScreens.has(item.screenId));
  if (normalized.content?.screenBindings) normalized.content.screenBindings = normalized.content.screenBindings
    .filter(item => !removedSystemScreens.has(item.screenId));

  const actions = normalized.actions || [];
  for (const action of actions) {
    if (removedSystemScreens.has(action.surface)) action.surface = productRoot;
    if (removedSystemScreens.has(action.outcome?.target) || removedSystemScreens.has(action.outcome?.destination)) {
      action.outcome = { type: "navigate", target: productRoot, state: "populated/default", destination: productRoot };
    }
  }
  const nodeById = new Map(normalized.navigation.nodes.map(item => [item.id, item]));
  for (const flow of normalized.permissionFlows || []) {
    const trigger = actions.find(item => item.id === flow.triggerActionId);
    if (trigger) flow.surface = trigger.surface;
    const denied = actions.find(item => item.id === flow.deniedActionId);
    if (denied) {
      denied.surface = flow.surface;
      denied.outcome.target = flow.surface;
      if (denied.outcome.type === "dismiss") delete denied.outcome.destination;
    }
  }
  const publishNode = nodeById.get("publish");
  const publishAction = actions.find(item => item.worldActionId === "publish_plan");
  if (publishNode && publishAction) {
    publishAction.surface = publishNode.id;
    publishAction.outcome = { type: "navigate", target: publishNode.parent, state: "populated/default", destination: publishNode.parent };
  }
  const ensureNavigationAction = ({ id, surface, target, label }) => {
    let action = actions.find(item => item.id === id);
    if (!action) {
      action = { id, worldActionId: null, surface, label, persistence: "none" };
      actions.push(action);
    }
    action.surface = surface;
    action.outcome = { type: "navigate", target, state: "populated/default", destination: target };
    return action;
  };
  if (nodeById.has("feed") && nodeById.has("publish")) ensureNavigationAction({
    id: "open_publish", surface: "feed", target: "publish", label: "Создать встречу",
  });
  if (nodeById.has("feed") && nodeById.has("saved")) ensureNavigationAction({
    id: "open_saved", surface: "feed", target: "saved", label: "Сохранённые",
  });
  if (nodeById.has("feed") && nodeById.has("plan_detail")
    && !actions.some(item => item.surface === "feed" && actionDestination(item, new Set(nodeById.keys())) === "plan_detail")) {
    ensureNavigationAction({ id: "open_plan_detail", surface: "feed", target: "plan_detail", label: "Открыть встречу" });
  }
  for (const node of normalized.navigation?.nodes || []) {
    if (!node.parent || node.presentation === "tab") continue;
    if (actions.some(item => item.surface === node.id && item.outcome?.type === "navigate" && actionDestination(item, new Set(nodeById.keys())) === node.parent)) continue;
    actions.push({
      id: `back_from_${node.id}`,
      worldActionId: null,
      surface: node.id,
      label: "Назад",
      outcome: { type: "navigate", target: node.parent, state: "populated/default", destination: node.parent },
      persistence: "none",
    });
  }
  for (const action of actions) if (!["navigate", "external", "system"].includes(action.outcome?.type)) {
    action.outcome.target = action.surface;
    delete action.outcome.destination;
  }
  const actionById = new Map(actions.map(item => [item.id, item]));
  for (const node of normalized.navigation?.nodes || []) node.actionIds = actions.filter(item => item.surface === node.id).map(item => item.id);
  for (const blueprint of normalized.screenBlueprints || []) {
    blueprint.secondaryActionIds = (blueprint.secondaryActionIds || []).filter(id => actionById.get(id)?.surface === blueprint.screenId);
    if (actionById.get(blueprint.primaryActionId)?.surface !== blueprint.screenId) blueprint.primaryActionId = blueprint.secondaryActionIds.shift() || null;
  }
  const mappedWorldActions = new Set(actions.map(item => item.worldActionId).filter(Boolean));
  const detail = (normalized.navigation?.nodes || []).find(item => item.presentation === "push")?.id || productRoot;
  for (const worldAction of model?.actions || []) if (!mappedWorldActions.has(worldAction.id)) {
    const opensEntity = /(?:open|return|вернут|откры)/iu.test(`${worldAction.id} ${worldAction.intent}`);
    const generated = {
      id: worldAction.id,
      worldActionId: worldAction.id,
      surface: productRoot,
      label: worldAction.intent,
      outcome: opensEntity
        ? { type: "navigate", target: detail, state: "populated/default", destination: detail }
        : { type: "mutate", target: productRoot, state: "populated/default" },
      persistence: "Локальный продуктовый снимок",
    };
    actions.push(generated);
    actionById.set(generated.id, generated);
    const rootNode = (normalized.navigation?.nodes || []).find(item => item.id === productRoot);
    rootNode?.actionIds?.push(generated.id);
  }
  // Every product-owned surface binds to canonical data. Authentication can
  // reuse the identity record; it must not invent a separate profile entity.
  const boundScreens = new Set((normalized.content?.screenBindings || []).map(item => item.screenId));
  const identityRecord = normalized.content?.records?.find(item => item.entityId === "identity")?.id
    || normalized.content?.records?.[0]?.id;
  for (const node of normalized.navigation.nodes) if (!boundScreens.has(node.id)) {
    normalized.content ||= {};
    normalized.content.screenBindings ||= [];
    normalized.content.screenBindings.push({
      screenId: node.id,
      recordIds: identityRecord ? [identityRecord] : [],
      mediaIds: [],
    });
  }
  const nodeIds = new Set((normalized.navigation?.nodes || []).map(item => item.id));
  const groups = new Map();
  for (const action of actions) {
    const destination = actionDestination(action, nodeIds);
    if (!destination || destination === action.surface) continue;
    if (!groups.has(destination)) groups.set(destination, []);
    groups.get(destination).push(action.id);
  }
  normalized.entryPoints = [...groups.entries()].map(([destinationScreenId, ids]) => ({
    destinationScreenId,
    primaryActionId: ids[0],
    secondaryActionIds: ids.slice(1),
    ...(ids.length > 1 ? { duplicationRationale: "Каждый дополнительный вход сохраняет исходный пользовательский контекст и ведёт к одной канонической поверхности." } : {}),
  }));
  const navigationActions = actions.filter(item => item.outcome?.type === "navigate");
  const pathBetween = (from, to) => {
    if (from === to) return [];
    const queue = [{ screen: from, ids: [] }];
    const seen = new Set([from]);
    while (queue.length) {
      const current = queue.shift();
      for (const action of navigationActions.filter(item => item.surface === current.screen)) {
        const destination = actionDestination(action, nodeIds);
        if (!destination || seen.has(destination)) continue;
        const ids = [...current.ids, action.id];
        if (destination === to) return ids;
        seen.add(destination);
        queue.push({ screen: destination, ids });
      }
    }
    return [];
  };
  for (const journey of normalized.journeys || []) {
    let surface = journey.startScreenId;
    const repaired = [];
    for (const id of journey.actionIds || []) {
      const action = actionById.get(id);
      if (!action) continue;
      if (["system", "external"].includes(nodeById.get(action.surface)?.presentation) && action.surface !== journey.startScreenId) continue;
      if (action.outcome?.type === "navigate" && ["system", "external"].includes(nodeById.get(actionDestination(action, nodeIds))?.presentation)) continue;
      if (action.surface !== surface) {
        const bridge = pathBetween(surface, action.surface);
        repaired.push(...bridge);
        for (const bridgeId of bridge) surface = actionDestination(actionById.get(bridgeId), nodeIds) || surface;
      }
      repaired.push(id);
      if (action.outcome?.type === "navigate") surface = actionDestination(action, nodeIds) || surface;
      else surface = action.surface;
    }
    // Repeated navigation is meaningful in an end-to-end scenario. Removing
    // duplicates can silently tear a later action away from its owning screen.
    journey.actionIds = repaired;
  }
  return normalized;
}

export function verifyExperienceContract(contract, factoryArtifact) {
  const diagnostics = verifyFactoryDevelopmentArtifact(factoryArtifact).map(item => Object.freeze({
    ...item,
    path: `factoryArtifact.${item.path}`,
  }));
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) return [
    ...diagnostics,
    diagnostic("experience.required", "Experience Contract must be an object", "experience"),
  ];
  const model = selectedWorldModel(factoryArtifact);
  const productContract = factoryArtifact?.productDevelopment?.productContract;
  if (contract.schemaVersion !== 2) diagnostics.push(diagnostic("experience.schema-version.unsupported", "Product Integrity / Experience Contract schemaVersion must be 2", "schemaVersion"));
  const { experienceContractId: _id, ...identity } = contract;
  const expectedId = stableId(identity);
  if (contract.experienceContractId !== expectedId) diagnostics.push(diagnostic(
    "experience.identity.unstable", `Experience Contract id must be ${expectedId}`, "experienceContractId",
  ));
  if (contract.productContractId !== productContract?.contractId) diagnostics.push(diagnostic(
    "experience.product-contract.drift", "Experience Contract does not point to the selected Product Contract", "productContractId",
  ));
  if (contract.worldModelId !== model?.id) diagnostics.push(diagnostic(
    "experience.world-model.drift", "Experience Contract does not point to the selected World Model", "worldModelId",
  ));

  const nodes = Array.isArray(contract.navigation?.nodes) ? contract.navigation.nodes : [];
  const nodeIds = new Set();
  for (const [index, node] of nodes.entries()) {
    const path = `navigation.nodes[${index}]`;
    if (nodeIds.has(node.id)) diagnostics.push(diagnostic("experience.screen.duplicate", `Duplicate screen ${node.id}`, `${path}.id`));
    nodeIds.add(node.id);
    if (!hasText(node.title, 2) || !hasText(node.purpose, 8) || !["root", "tab", "push", "sheet", "cover", "system", "external"].includes(node.presentation)) diagnostics.push(diagnostic(
      "experience.screen.incomplete", `Screen ${node.id || index} needs title, product purpose and native presentation`, path,
    ));
    if (node.parent !== null && node.parent !== undefined && !nodes.some(item => item.id === node.parent)) diagnostics.push(diagnostic(
      "experience.screen.parent-unknown", `Screen ${node.id} points to unknown parent ${node.parent}`, `${path}.parent`,
    ));
    for (const entityId of node.entityIds || []) if (!model?.entities?.some(item => item.id === entityId)) diagnostics.push(diagnostic(
      "experience.screen.entity-unknown", `Screen ${node.id} exposes unknown entity ${entityId}`, `${path}.entityIds`,
    ));
  }
  if (!nodeIds.size) diagnostics.push(diagnostic("experience.screens.required", "Experience Contract needs screens", "navigation.nodes"));
  const roots = Array.isArray(contract.navigation?.roots) ? contract.navigation.roots : [];
  for (const root of roots) if (!nodeIds.has(root)) diagnostics.push(diagnostic("experience.navigation.root-unknown", `Unknown navigation root ${root}`, "navigation.roots"));

  const actions = Array.isArray(contract.actions) ? contract.actions : [];
  const actionById = new Map();
  const worldActions = new Set((model?.actions || []).map(item => item.id));
  for (const [index, action] of actions.entries()) {
    const path = `actions[${index}]`;
    if (actionById.has(action.id)) diagnostics.push(diagnostic("experience.action.duplicate", `Duplicate action ${action.id}`, `${path}.id`));
    actionById.set(action.id, action);
    if (!nodeIds.has(action.surface)) diagnostics.push(diagnostic("experience.action.surface-unknown", `Action ${action.id} belongs to unknown screen ${action.surface}`, `${path}.surface`));
    if (action.worldActionId != null && !worldActions.has(action.worldActionId)) diagnostics.push(diagnostic(
      "experience.action.world-unknown", `Action ${action.id} invents unknown World Model action ${action.worldActionId}`, `${path}.worldActionId`,
    ));
    if (!hasText(action.label, 2) || !["navigate", "mutate", "request", "dismiss", "external", "system"].includes(action.outcome?.type)) diagnostics.push(diagnostic(
      "experience.action.incomplete", `Action ${action.id || index} needs a label and deterministic outcome`, path,
    ));
    if (action.outcome?.type === "navigate" && !nodeIds.has(action.outcome.target)) diagnostics.push(diagnostic(
      "experience.action.target-unknown", `Action ${action.id} navigates to unknown screen ${action.outcome.target}`, `${path}.outcome.target`,
    ));
    if (action.worldActionId && !hasText(action.persistence, 3)) diagnostics.push(diagnostic(
      "experience.action.persistence-required", `World action ${action.worldActionId} needs explicit persistence`, `${path}.persistence`,
    ));
  }
  for (const node of nodes) for (const actionId of node.actionIds || []) {
    const action = actionById.get(actionId);
    if (!action) diagnostics.push(diagnostic("experience.screen.action-unknown", `Screen ${node.id} references unknown action ${actionId}`, `navigation.nodes.${node.id}.actionIds`));
    else if (action.surface !== node.id) diagnostics.push(diagnostic("experience.screen.action-drift", `Action ${actionId} belongs to ${action.surface}, not ${node.id}`, `navigation.nodes.${node.id}.actionIds`));
  }
  for (const worldAction of worldActions) if (!actions.some(item => item.worldActionId === worldAction)) diagnostics.push(diagnostic(
    "experience.world-action.unmapped", `World Model action ${worldAction} has no reachable experience action`, "actions",
  ));

  const reachable = new Set(roots);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) if (node.presentation === "tab" && reachable.has(node.parent) && !reachable.has(node.id)) {
      reachable.add(node.id);
      changed = true;
    }
    for (const action of actions) {
      const destination = actionDestination(action, nodeIds);
      if (reachable.has(action.surface) && destination && !reachable.has(destination)) {
        reachable.add(destination);
        changed = true;
      }
    }
  }
  for (const node of nodes) if (!reachable.has(node.id)) diagnostics.push(diagnostic(
    "experience.navigation.unreachable", `Screen ${node.id} is unreachable from declared roots`, `navigation.nodes.${node.id}`,
  ));

  const auth = contract.authentication;
  if (auth?.required !== true || auth?.restoreSession !== true || !nodeIds.has(auth?.entrySurface) || !nodeIds.has(auth?.successSurface)) diagnostics.push(diagnostic(
    "experience.authentication.incomplete", "Authentication needs reachable entry/success screens and local session restoration", "authentication",
  ));
  const authWorldActions = new Set((model?.actions || []).filter(item =>
    item.target === model?.authentication?.sessionEntity
      && /(?:auth|login|sign|verify.*code|вход|код)/iu.test(`${item.id} ${item.intent}`),
  ).map(item => item.id));
  const authAction = actions.find(item => authWorldActions.has(item.worldActionId)
    && actionDestination(item, nodeIds) === auth?.successSurface);
  const authReachable = new Set([auth?.entrySurface]);
  changed = true;
  while (changed) {
    changed = false;
    for (const action of actions) {
      const destination = actionDestination(action, nodeIds);
      if (authReachable.has(action.surface) && destination && !authReachable.has(destination)) {
        authReachable.add(destination);
        changed = true;
      }
    }
  }
  if (!authAction || !authReachable.has(authAction.surface) || actionDestination(authAction, nodeIds) !== auth?.successSurface) diagnostics.push(diagnostic(
    "experience.authentication.action-drift", "Authentication action must be reachable from entrySurface and move to successSurface", "authentication",
  ));

  const stateByScreen = new Map((contract.states || []).map(item => [item.screenId, item]));
  for (const node of nodes) {
    const policy = stateByScreen.get(node.id);
    if (!policy) {
      diagnostics.push(diagnostic("experience.states.screen-missing", `Screen ${node.id} has no state policy`, "states"));
      continue;
    }
    const seen = new Set();
    for (const [index, variant] of (policy.variants || []).entries()) {
      if (seen.has(variant.id)) diagnostics.push(diagnostic("experience.state.duplicate", `Duplicate ${variant.id} state on ${node.id}`, `states.${node.id}.variants[${index}]`));
      seen.add(variant.id);
      if (!hasText(variant.productMeaning, 8)) diagnostics.push(diagnostic("experience.state.meaning-required", `${node.id}.${variant.id} needs product meaning`, `states.${node.id}.variants[${index}].productMeaning`));
      if (typeof variant.applicable !== "boolean") diagnostics.push(diagnostic("experience.state.applicability-required", `${node.id}.${variant.id} must explicitly declare applicability`, `states.${node.id}.variants[${index}].applicable`));
      for (const actionId of variant.availableActions || []) if (!actionById.has(actionId)) diagnostics.push(diagnostic("experience.state.action-unknown", `${node.id}.${variant.id} references unknown action ${actionId}`, `states.${node.id}.variants[${index}].availableActions`));
      if (variant.recoveryActionId !== null && variant.recoveryActionId !== undefined && !actionById.has(variant.recoveryActionId)) diagnostics.push(diagnostic("experience.state.recovery-unknown", `${node.id}.${variant.id} references unknown recovery ${variant.recoveryActionId}`, `states.${node.id}.variants[${index}].recoveryActionId`));
    }
    for (const id of EXPERIENCE_STATE_IDS) if (!seen.has(id)) diagnostics.push(diagnostic(
      "experience.state.missing", `Screen ${node.id} lacks canonical state ${id}`, `states.${node.id}.variants`,
    ));
    const applicableCount = (policy.variants || []).filter(item => item.applicable).length;
    const stateBudget = node.presentation === "tab" && node.id !== "profile" ? 5 : 4;
    if (applicableCount > stateBudget) diagnostics.push(diagnostic(
      "experience.state.budget-exceeded", `${node.id} declares ${applicableCount} applicable states; its product-surface budget is ${stateBudget}`, `states.${node.id}.variants`,
    ));
  }

  const permissionFlows = Array.isArray(contract.permissionFlows) ? contract.permissionFlows : [];
  const flowByKey = new Map(permissionFlows.map(item => [item.key, item]));
  for (const binding of model?.capabilityBindings || []) {
    const flow = flowByKey.get(binding.key);
    if (!flow) diagnostics.push(diagnostic("experience.permission.missing", `Capability ${binding.key} has no experience flow`, "permissionFlows"));
    else {
      const trigger = actionById.get(flow.triggerActionId);
      if (flow.worldActionId !== binding.action || trigger?.worldActionId !== binding.action || trigger?.surface !== flow.surface) diagnostics.push(diagnostic(
        "experience.permission.action-drift", `Capability ${binding.key} is not bound to its World Model action and screen`, `permissionFlows.${binding.key}`,
      ));
      if (!actionById.has(flow.deniedActionId)) diagnostics.push(diagnostic("experience.permission.denied-action-missing", `Capability ${binding.key} has no denied fallback action`, `permissionFlows.${binding.key}.deniedActionId`));
    }
  }
  for (const flow of permissionFlows) if (!(model?.capabilityBindings || []).some(item => item.key === flow.key)) diagnostics.push(diagnostic(
    "experience.permission.unknown", `Experience flow invents capability ${flow.key}`, "permissionFlows",
  ));

  const records = Array.isArray(contract.content?.records) ? contract.content.records : [];
  const recordById = new Map();
  for (const [index, record] of records.entries()) {
    const path = `content.records[${index}]`;
    if (recordById.has(record.id)) diagnostics.push(diagnostic("experience.content.record-duplicate", `Duplicate content record ${record.id}`, `${path}.id`));
    recordById.set(record.id, record);
    if (!model?.entities?.some(item => item.id === record.entityId)) diagnostics.push(diagnostic(
      "experience.content.entity-unknown", `Content record ${record.id} uses unknown entity ${record.entityId}`, `${path}.entityId`,
    ));
    const facts = Array.isArray(record.facts) ? record.facts : [];
    if (!hasText(record.displayName, 2) || !facts.length || facts.some(fact => !hasText(fact?.key, 1) || !hasText(fact?.value, 1))) diagnostics.push(diagnostic(
      "experience.content.record-incomplete", `Content record ${record.id || index} needs canonical name and facts`, path,
    ));
  }
  if (!records.length) diagnostics.push(diagnostic("experience.content.records-required", "Canonical product records are required before rendering", "content.records"));

  const media = Array.isArray(contract.content?.media) ? contract.content.media : [];
  const mediaById = new Map();
  for (const [index, item] of media.entries()) {
    const path = `content.media[${index}]`;
    if (mediaById.has(item.id)) diagnostics.push(diagnostic("experience.content.media-duplicate", `Duplicate media contract ${item.id}`, `${path}.id`));
    mediaById.set(item.id, item);
    if (!recordById.has(item.ownerRecordId)) diagnostics.push(diagnostic(
      "experience.content.media-owner-unknown", `Media ${item.id} has unknown owner ${item.ownerRecordId}`, `${path}.ownerRecordId`,
    ));
    if (!hasText(item.semanticDescription, 12)) diagnostics.push(diagnostic(
      "experience.content.media-description-required", `Media ${item.id || index} needs a semantic subject description`, `${path}.semanticDescription`,
    ));
  }
  for (const record of records) for (const mediaId of record.mediaIds || []) {
    const item = mediaById.get(mediaId);
    if (!item) diagnostics.push(diagnostic("experience.content.record-media-unknown", `Record ${record.id} references unknown media ${mediaId}`, `content.records.${record.id}.mediaIds`));
    else if (item.ownerRecordId !== record.id) diagnostics.push(diagnostic("experience.content.record-media-owner-drift", `Media ${mediaId} belongs to ${item.ownerRecordId}, not ${record.id}`, `content.records.${record.id}.mediaIds`));
  }

  const bindings = Array.isArray(contract.content?.screenBindings) ? contract.content.screenBindings : [];
  const bindingByScreen = new Map();
  for (const [index, binding] of bindings.entries()) {
    const path = `content.screenBindings[${index}]`;
    if (bindingByScreen.has(binding.screenId)) diagnostics.push(diagnostic("experience.content.screen-binding-duplicate", `Duplicate content binding for ${binding.screenId}`, path));
    bindingByScreen.set(binding.screenId, binding);
    if (!nodeIds.has(binding.screenId)) diagnostics.push(diagnostic("experience.content.screen-unknown", `Content binding uses unknown screen ${binding.screenId}`, `${path}.screenId`));
    for (const id of binding.recordIds || []) if (!recordById.has(id)) diagnostics.push(diagnostic("experience.content.record-unknown", `${binding.screenId} references unknown record ${id}`, `${path}.recordIds`));
    for (const id of binding.mediaIds || []) {
      const item = mediaById.get(id);
      if (!item) diagnostics.push(diagnostic("experience.content.media-unknown", `${binding.screenId} references unknown media ${id}`, `${path}.mediaIds`));
      else if (!(binding.recordIds || []).includes(item.ownerRecordId)) diagnostics.push(diagnostic(
        "experience.content.media-owner-unbound", `${binding.screenId} shows ${id} without its canonical owner ${item.ownerRecordId}`, `${path}.mediaIds`,
      ));
    }
  }
  for (const node of nodes) if (!bindingByScreen.has(node.id)) diagnostics.push(diagnostic(
    "experience.content.screen-binding-missing", `Screen ${node.id} has no canonical content binding`, "content.screenBindings",
  ));

  const crossScreenActions = actions.filter(item => {
    const destination = actionDestination(item, nodeIds);
    return destination && destination !== item.surface;
  });
  const navigatingByTarget = Map.groupBy(crossScreenActions, item => actionDestination(item, nodeIds));
  const entryPoints = Array.isArray(contract.entryPoints) ? contract.entryPoints : [];
  const entryByTarget = new Map();
  for (const [index, entry] of entryPoints.entries()) {
    const path = `entryPoints[${index}]`;
    if (entryByTarget.has(entry.destinationScreenId)) diagnostics.push(diagnostic("experience.entry-point.duplicate", `Duplicate entry policy for ${entry.destinationScreenId}`, path));
    entryByTarget.set(entry.destinationScreenId, entry);
    const targetActions = navigatingByTarget.get(entry.destinationScreenId) || [];
    const targetIds = new Set(targetActions.map(item => item.id));
    if (!targetIds.has(entry.primaryActionId)) diagnostics.push(diagnostic("experience.entry-point.primary-invalid", `${entry.primaryActionId} does not navigate to ${entry.destinationScreenId}`, `${path}.primaryActionId`));
    for (const id of entry.secondaryActionIds || []) if (!targetIds.has(id)) diagnostics.push(diagnostic("experience.entry-point.secondary-invalid", `${id} does not navigate to ${entry.destinationScreenId}`, `${path}.secondaryActionIds`));
    if ((entry.secondaryActionIds || []).length && !hasText(entry.duplicationRationale, 12)) diagnostics.push(diagnostic(
      "experience.entry-point.rationale-required", `Secondary entry points to ${entry.destinationScreenId} need a product rationale`, `${path}.duplicationRationale`,
    ));
  }
  for (const [target, targetActions] of navigatingByTarget.entries()) if (targetActions.length > 1 && !entryByTarget.has(target)) diagnostics.push(diagnostic(
    "experience.entry-point.policy-missing", `${target} has ${targetActions.length} competing entry actions without an ownership policy`, "entryPoints",
  ));

  const blueprints = Array.isArray(contract.screenBlueprints) ? contract.screenBlueprints : [];
  const blueprintByScreen = new Map();
  for (const [index, blueprint] of blueprints.entries()) {
    const path = `screenBlueprints[${index}]`;
    if (blueprintByScreen.has(blueprint.screenId)) diagnostics.push(diagnostic("experience.blueprint.duplicate", `Duplicate blueprint for ${blueprint.screenId}`, path));
    blueprintByScreen.set(blueprint.screenId, blueprint);
    if (!nodeIds.has(blueprint.screenId)) diagnostics.push(diagnostic("experience.blueprint.screen-unknown", `Blueprint uses unknown screen ${blueprint.screenId}`, `${path}.screenId`));
    if (blueprint.primaryRecordId != null && !recordById.has(blueprint.primaryRecordId)) diagnostics.push(diagnostic("experience.blueprint.record-unknown", `Blueprint ${blueprint.screenId} uses unknown primary record ${blueprint.primaryRecordId}`, `${path}.primaryRecordId`));
    for (const id of [blueprint.primaryActionId, ...(blueprint.secondaryActionIds || [])].filter(Boolean)) {
      const action = actionById.get(id);
      if (!action || action.surface !== blueprint.screenId) diagnostics.push(diagnostic("experience.blueprint.action-drift", `Blueprint action ${id} does not belong to ${blueprint.screenId}`, path));
    }
    if (!Array.isArray(blueprint.contentOrder) || blueprint.contentOrder.length < 2 || !blueprint.prohibitedPatterns?.length) diagnostics.push(diagnostic(
      "experience.blueprint.incomplete", `Blueprint ${blueprint.screenId || index} needs ordered semantic content and prohibitions`, path,
    ));
  }
  for (const node of nodes) if (!blueprintByScreen.has(node.id)) diagnostics.push(diagnostic(
    "experience.blueprint.missing", `Screen ${node.id} has no semantic anatomy`, "screenBlueprints",
  ));

  const journeys = Array.isArray(contract.journeys) ? contract.journeys : [];
  const journeyIds = new Set();
  const coveredWorldActions = new Set();
  for (const [index, journey] of journeys.entries()) {
    const path = `journeys[${index}]`;
    if (journeyIds.has(journey.id)) diagnostics.push(diagnostic("experience.journey.duplicate", `Duplicate journey ${journey.id}`, `${path}.id`));
    journeyIds.add(journey.id);
    let current = journey.startScreenId;
    if (!nodeIds.has(current)) diagnostics.push(diagnostic("experience.journey.start-unknown", `Journey ${journey.id} starts on unknown screen ${current}`, `${path}.startScreenId`));
    for (const actionId of journey.actionIds || []) {
      const action = actionById.get(actionId);
      if (!action) { diagnostics.push(diagnostic("experience.journey.action-unknown", `Journey ${journey.id} uses unknown action ${actionId}`, `${path}.actionIds`)); continue; }
      if (action.surface !== current) diagnostics.push(diagnostic("experience.journey.sequence-broken", `Journey ${journey.id} expects ${actionId} on ${current}, but it belongs to ${action.surface}`, `${path}.actionIds`));
      if (action.worldActionId) coveredWorldActions.add(action.worldActionId);
      const destination = actionDestination(action, nodeIds);
      if (destination) current = destination;
    }
    if (!hasText(journey.observableResult, 12) || !hasText(journey.failureRecovery, 12)) diagnostics.push(diagnostic("experience.journey.outcome-incomplete", `Journey ${journey.id || index} needs result and recovery`, path));
  }
  const userConsentPermissions = new Set([
    "camera", "mic", "speech", "photo", "photos", "photoadd", "location", "locationalways",
    "push", "tracking", "contacts", "calendar", "faceid", "localnet",
  ]);
  for (const flow of permissionFlows.filter(item => userConsentPermissions.has(item.key))) {
    if (!journeys.some(item => item.actionIds?.includes(flow.triggerActionId))) diagnostics.push(diagnostic(
      "experience.permission.trigger-journey-missing",
      `User-consent permission ${flow.key} has no acceptance journey that reaches its contextual trigger.`,
      `permissionFlows.${flow.key}.triggerActionId`,
    ));
    if (!journeys.some(item => item.actionIds?.includes(flow.deniedActionId))) diagnostics.push(diagnostic(
      "experience.permission.denied-journey-missing",
      `User-consent permission ${flow.key} has no acceptance journey that proves its denied fallback.`,
      `permissionFlows.${flow.key}.deniedActionId`,
    ));
  }
  if (journeys.length < 3) diagnostics.push(diagnostic("experience.journeys.insufficient", "At least three end-to-end acceptance journeys are required", "journeys"));
  for (const coreAction of model?.coreActions || []) if (!coveredWorldActions.has(coreAction)) diagnostics.push(diagnostic(
    "experience.journey.core-action-uncovered", `Core action ${coreAction} is absent from acceptance journeys`, "journeys",
  ));
  return diagnostics;
}

export async function developExperienceContract({ factoryArtifact, planner }) {
  const factoryDiagnostics = verifyFactoryDevelopmentArtifact(factoryArtifact);
  if (factoryDiagnostics.length) return { ok: false, diagnostics: factoryDiagnostics, contract: null };
  if (!planner || typeof planner.planExperience !== "function") return {
    ok: false,
    diagnostics: [diagnostic("experience.planner.required", "Experience planner must implement planExperience({ productContract, worldModel })", "planner")],
    contract: null,
  };
  const productContract = structuredClone(factoryArtifact.productDevelopment.productContract);
  const worldModel = structuredClone(selectedWorldModel(factoryArtifact));
  const normalizePlan = value => planner.autoRepairTopology
    ? repairExperienceTopology(enforceExperienceStatePolicy(value), worldModel)
    : enforceExperienceStatePolicy(value);
  let plan = normalizePlan(await planner.planExperience({ productContract, worldModel }));
  const attempts = [];
  const maximumAttempts = Math.max(1, Number(process.env.CAMO_EXPERIENCE_MAX_ATTEMPTS || 2));
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const { experienceContractId: _ignored, ...body } = plan || {};
    const contract = Object.freeze({ experienceContractId: stableId(body), ...body });
    const diagnostics = verifyExperienceContract(contract, factoryArtifact);
    attempts.push(Object.freeze({ attempt, diagnosticCount: diagnostics.length }));
    if (!diagnostics.length) return { ok: true, diagnostics: [], contract, revisionCount: attempt - 1, attempts: Object.freeze(attempts) };
    if (attempt === maximumAttempts || typeof planner.reviseExperience !== "function") return {
      ok: false, diagnostics, contract, revisionCount: attempt - 1, attempts: Object.freeze(attempts),
    };
    plan = normalizePlan(await planner.reviseExperience({
      productContract: structuredClone(productContract),
      worldModel: structuredClone(worldModel),
      plan: structuredClone(plan),
      diagnostics: structuredClone(diagnostics),
      attempt: attempt + 1,
    }));
  }
  throw new Error("Experience revision loop exhausted unexpectedly");
}
