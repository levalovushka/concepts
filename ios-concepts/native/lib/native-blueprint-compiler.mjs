import { resolveProductTarget } from "./product-target-catalog.mjs";
import { resolveReferenceProfile } from "./reference-profile-catalog.mjs";
import { resolveCapability } from "./capability-catalog.mjs";
import { resolveExtension } from "./extension-catalog.mjs";
import { validateCapabilityOutcome } from "./capability-outcome-contract.mjs";
import { normalizeLeanActionEffects } from "./structured-model-lean-architect.mjs";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function hasText(value, minimum = 3) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function verifyProductBlueprint(blueprint, request, target) {
  const diagnostics = [];
  if (!blueprint || typeof blueprint !== "object") return [diagnostic("blueprint.required", "Product Blueprint is required", "blueprint")];
  blueprint = normalizeLeanActionEffects(structuredClone(blueprint));
  if (blueprint.schemaVersion !== 1) diagnostics.push(diagnostic("blueprint.schema", "Product Blueprint schemaVersion must be 1", "schemaVersion"));
  if (!hasText(blueprint.id) || !hasText(blueprint.name, 2) || !hasText(blueprint.thesis, 24)) diagnostics.push(diagnostic(
    "blueprint.identity", "Product Blueprint needs a stable id, name and concrete thesis", "blueprint",
  ));
  if (blueprint.targetProduct !== request.targetProduct || blueprint.strategy !== request.strategy) diagnostics.push(diagnostic(
    "blueprint.request-drift", "Product Blueprint changed the requested target or strategy", "blueprint",
  ));
  const entities = new Set((blueprint.world?.entities || []).map(item => item.id));
  const actions = new Map((blueprint.world?.actions || []).map(item => [item.id, item]));
  if (entities.size < 3) diagnostics.push(diagnostic("blueprint.world.shallow", "Product world needs at least three meaningful entities", "world.entities"));
  for (const [id, action] of actions) {
    if (!entities.has(action.entityId) || !hasText(action.outcome, 8)) diagnostics.push(diagnostic(
      "blueprint.action.unowned", `Action ${id} needs an owning entity and observable outcome`, `world.actions.${id}`,
    ));
    if (!action.effect?.type) diagnostics.push(diagnostic(
      "blueprint.action.effect-missing", `Action ${id} needs a machine-readable reducer effect`, `world.actions.${id}.effect`,
    ));
    if (action.effect?.type === "navigate" && !hasText(action.effect.targetScreenId, 2)) diagnostics.push(diagnostic(
      "blueprint.action.route-missing", `Navigation action ${id} needs targetScreenId`, `world.actions.${id}.effect.targetScreenId`,
    ));
  }
  for (const id of blueprint.coreLoop?.actionIds || []) if (!actions.has(id)) diagnostics.push(diagnostic(
    "blueprint.core-loop.action-missing", `Core loop references unknown action ${id}`, "coreLoop.actionIds",
  ));
  if ((blueprint.coreLoop?.actionIds || []).length < 3 || !hasText(blueprint.coreLoop?.returnReason, 12)) diagnostics.push(diagnostic(
    "blueprint.core-loop.shallow", "Core loop needs contribution, response, reward and a return reason", "coreLoop",
  ));
  const screens = new Map((blueprint.navigation?.screens || []).map(item => [item.id, item]));
  const roots = blueprint.navigation?.rootTabs || [];
  if (request.deliveryMode !== "slice" && request.strategy === "mimicry" && request.targetProduct === "vkontakte" && roots.length !== 5) diagnostics.push(diagnostic(
    "blueprint.vk.tabs", "VK mimicry needs exactly five intentional root tabs", "navigation.rootTabs",
  ));
  for (const root of roots) if (!screens.has(root.screenId)) diagnostics.push(diagnostic(
    "blueprint.navigation.root-missing", `Root tab ${root.screenId} has no screen`, "navigation.rootTabs",
  ));
  const boundActions = new Set();
  const actionOwners = new Map();
  for (const screen of screens.values()) for (const id of screen.actionIds || []) {
    if (!actions.has(id)) diagnostics.push(diagnostic("blueprint.screen.action-unknown", `Screen ${screen.id} references unknown action ${id}`, `navigation.screens.${screen.id}`));
    boundActions.add(id);
    if (!actionOwners.has(id)) actionOwners.set(id, []);
    actionOwners.get(id).push(screen.id);
  }
  for (const id of actions.keys()) if (!boundActions.has(id)) diagnostics.push(diagnostic(
    "blueprint.action.unreachable", `Action ${id} is not reachable from a screen`, "navigation.screens",
  ));
  const feedbackModes = new Set(blueprint.socialGrammar?.feedbackModes || []);
  if (request.strategy === "mimicry" && request.targetProduct === "vkontakte"
      && (blueprint.socialGrammar?.primarySurface !== "feed" || blueprint.socialGrammar?.authorship !== "person-or-community" || feedbackModes.size < 2)) diagnostics.push(diagnostic(
    "blueprint.vk.grammar", "VK mimicry needs authored feed content, stable identity and at least two feedback modes", "socialGrammar",
  ));
  if (feedbackModes.has("comment")) {
    const openComments = actions.get("open_comments");
    const respond = actions.get("respond_to_post");
    if (!openComments || !respond
        || !actionOwners.get("open_comments")?.includes("feed")
        || !actionOwners.get("respond_to_post")?.includes("post_detail")) diagnostics.push(diagnostic(
      "blueprint.comment.intent", "Comments need separate feed navigation and post-detail mutation intents", "world.actions",
    ));
  }
  const capabilityByKey = new Map((blueprint.capabilities || []).map(item => [item.key, item]));
  const capabilityActionOwners = new Map();
  if (request.capabilityPolicy === "all") for (const capability of target.permissions) {
    const binding = capabilityByKey.get(capability.key);
    const outcomeProblem = validateCapabilityOutcome(binding, { entities, actions });
    if (outcomeProblem) diagnostics.push(diagnostic(
      "blueprint.capability.missing", `Capability ${capability.key} ${outcomeProblem}`, `capabilities.${capability.key}`,
    ));
    if (capability.key === "associateddomains"
        && (!Array.isArray(binding?.configuration?.domains) || !binding.configuration.domains.some(item => /^applinks:[a-z0-9.-]+$/i.test(item)))) {
      diagnostics.push(diagnostic(
        "blueprint.capability.configuration", "Associated Domains needs at least one concrete applinks domain", `capabilities.${capability.key}.configuration.domains`,
      ));
    }
    if (blueprint.selectionReceipt) {
      for (const [field, minimum] of [["purpose", 24], ["requestMoment", 20], ["platformEffect", 20], ["testScenario", 24]]) {
        if (!hasText(binding?.[field], minimum)) diagnostics.push(diagnostic(
          "blueprint.capability.contract-incomplete",
          `Capability ${capability.key} needs a concrete ${field}`,
          `capabilities.${capability.key}.${field}`,
        ));
      }
      if (binding?.actionId) {
        const previous = capabilityActionOwners.get(binding.actionId);
        if (previous) diagnostics.push(diagnostic(
          "blueprint.capability.action-reused",
          `Capabilities ${previous} and ${capability.key} reuse ${binding.actionId}; each capability needs an intentional owning gesture`,
          `capabilities.${capability.key}.actionId`,
        ));
        capabilityActionOwners.set(binding.actionId, capability.key);
      }
    }
  }
  const requiredStates = new Set(request.deliveryMode === "slice" || request.statePolicy === "applicable"
    ? ["populated/default"]
    : ["loading", "populated/default", "empty", "error", "offline"]);
  const stateByScreen = new Map((blueprint.states || []).map(item => [item.screenId, new Set(item.variants || [])]));
  for (const id of screens.keys()) for (const state of requiredStates) if (!stateByScreen.get(id)?.has(state)) diagnostics.push(diagnostic(
    "blueprint.state.missing", `Screen ${id} lacks ${state}`, `states.${id}`,
  ));
  if (blueprint.selectionReceipt) {
    const localizationKeys = new Set();
    const localizedScreens = new Set();
    for (const [index, item] of (blueprint.localization || []).entries()) {
      if (localizationKeys.has(item.key)) diagnostics.push(diagnostic("blueprint.localization.duplicate", `Duplicate localization key ${item.key}`, `localization[${index}].key`));
      localizationKeys.add(item.key);
      for (const screenId of item.screenIds || []) {
        if (!screens.has(screenId)) diagnostics.push(diagnostic("blueprint.localization.screen-unknown", `${item.key} references unknown screen ${screenId}`, `localization[${index}].screenIds`));
        localizedScreens.add(screenId);
      }
    }
    for (const screenId of screens.keys()) if (!localizedScreens.has(screenId)) diagnostics.push(diagnostic(
      "blueprint.localization.screen-missing", `Screen ${screenId} has no localized copy`, `localization.${screenId}`,
    ));
    for (const [index, fixture] of (blueprint.fixtures || []).entries()) if (!entities.has(fixture.entityId)) diagnostics.push(diagnostic(
      "blueprint.fixture.entity-unknown", `Fixture ${fixture.id} references unknown entity ${fixture.entityId}`, `fixtures[${index}].entityId`,
    ));
    const scenarioActions = new Set();
    for (const [index, scenario] of (blueprint.acceptanceScenarios || []).entries()) {
      if (!screens.has(scenario.startScreenId)) diagnostics.push(diagnostic("blueprint.acceptance.screen-unknown", `Scenario ${scenario.id} starts on unknown screen ${scenario.startScreenId}`, `acceptanceScenarios[${index}].startScreenId`));
      for (const actionId of scenario.actionIds || []) {
        if (!actions.has(actionId)) diagnostics.push(diagnostic("blueprint.acceptance.action-unknown", `Scenario ${scenario.id} references unknown action ${actionId}`, `acceptanceScenarios[${index}].actionIds`));
        scenarioActions.add(actionId);
      }
    }
    for (const actionId of blueprint.coreLoop?.actionIds || []) if (!scenarioActions.has(actionId)) diagnostics.push(diagnostic(
      "blueprint.acceptance.core-loop-missing", `Core-loop action ${actionId} has no acceptance scenario`, "acceptanceScenarios",
    ));
    for (const [field, minimum] of [["accessibility", 5], ["risks", 3], ["assumptions", 2]]) if ((blueprint.delivery?.[field] || []).length < minimum) diagnostics.push(diagnostic(
      "blueprint.delivery.incomplete", `Developer delivery needs at least ${minimum} ${field} entries`, `delivery.${field}`,
    ));
  }
  return diagnostics;
}

function uniqueByKey(items) {
  const result = new Map();
  for (const item of items) if (!result.has(item.key)) result.set(item.key, item);
  return [...result.values()];
}

function screenRoles(screen) {
  if (screen.id === "feed") return ["root-header", "social-feed", "post"];
  if (screen.id === "messages" || screen.id === "conversation") return ["messages", "people-list"];
  if (screen.id === "menu" || screen.id === "profile") return ["profile-cards", "people-list"];
  if (screen.presentation === "sheet") return ["root-header", "form"];
  return screen.presentation === "tab" ? ["root-header", "people-list"] : ["post", "people-list"];
}

export function compileProductBlueprint(blueprint, { bundleId = `com.camo.${blueprint.id}` } = {}) {
  blueprint = normalizeLeanActionEffects(structuredClone(blueprint));
  const request = {
    targetProduct: blueprint.targetProduct,
    strategy: blueprint.strategy,
    capabilityPolicy: blueprint.capabilityPolicy || "all",
    deliveryMode: blueprint.deliveryMode || "full",
    statePolicy: blueprint.statePolicy || "canonical",
  };
  const target = resolveProductTarget(blueprint.targetProduct);
  const diagnostics = target ? verifyProductBlueprint(blueprint, request, target) : [diagnostic("blueprint.target", "Unknown target product", "targetProduct")];
  const reference = blueprint.strategy === "mimicry" ? resolveReferenceProfile(target?.mimicryProfileId) : null;
  if (diagnostics.length) return { ok: false, diagnostics, manifest: null };
  const bindingByKey = new Map(blueprint.capabilities.map(item => [item.key, item]));
  const targetCapabilities = request.capabilityPolicy === "all"
    ? target.permissions
    : target.permissions.filter(item => bindingByKey.has(item.key));
  const capabilityPlans = targetCapabilities.map(item => {
    const plan = resolveCapability(item.key, { bundleId });
    const domains = bindingByKey.get(item.key)?.configuration?.domains;
    if (!plan || item.key !== "associateddomains" || !Array.isArray(domains)) return plan;
    return {
      ...plan,
      entitlements: plan.entitlements.map(entry => entry.key === "com.apple.developer.associated-domains"
        ? { ...entry, value: domains }
        : entry),
    };
  }).filter(Boolean);
  const usageInfo = capabilityPlans.flatMap(plan => plan.usageKeys.map(key => ({
    key, value: bindingByKey.get(plan.permissionKey)?.observableResult || `Доступ нужен для функции «${blueprint.name}»`,
  })));
  const extensionTargets = [...new Set(capabilityPlans.flatMap(plan => plan.extensionTargets))];
  const extensions = extensionTargets.map(id => resolveExtension(id, { productName: blueprint.name, slug: blueprint.id, bundleId })).filter(Boolean);
  const actionSurface = new Map();
  for (const screen of blueprint.navigation.screens) for (const id of screen.actionIds) actionSurface.set(id, screen.id);
  const actions = blueprint.world.actions.map(action => ({
    id: action.id,
    surface: actionSurface.get(action.id),
    label: action.label || action.outcome,
    outcome: action.effect.type === "navigate"
      ? { type: "navigate", target: `${action.effect.targetScreenId}${action.effect.targetState ? `#${action.effect.targetState}` : ""}` }
      : { type: action.effect.type === "system" ? "system" : "mutate", target: actionSurface.get(action.id), reducer: action.effect },
    variant: blueprint.coreLoop.actionIds.includes(action.id) ? "primary" : "secondary",
    placement: blueprint.coreLoop.actionIds.includes(action.id) ? "content" : "attached",
    enabledWhen: "available",
  }));
  const statesByScreen = new Map(blueprint.states.map(item => [item.screenId, item.variants]));
  const surfaces = blueprint.navigation.screens.map(screen => ({
    id: screen.id, title: screen.title, purpose: `Выполнить задачу экрана «${screen.title}» в общем продуктовом цикле`,
    role: screen.id === "feed" ? "feed" : screen.presentation,
    presentation: screen.presentation, parent: screen.parent || null,
    states: statesByScreen.get(screen.id) || ["populated/default"], distinction: false,
  }));
  const surfaceContracts = surfaces.map(surface => ({
    surface: surface.id,
    job: surface.purpose,
    primaryAction: actions.find(item => item.surface === surface.id && item.variant === "primary")?.id || null,
    pattern: surface.id === "feed" ? "social-feed" : surface.presentation,
    composition: surface.id === "feed" ? ["root-header", "authored-posts", "attached-feedback"] : screenRoles(surface),
    primaryRegion: surface.id === "feed" ? "authored-posts" : "product-content",
    aboveFold: { mustExpose: surface.title, maxPreludeLayers: 1 },
    allowedFamilies: screenRoles(surface),
    forbiddenFamilies: ["decorative-gradient", "colored-icon-placeholder", "unowned-selector", "detached-action-panel"],
    source: blueprint.strategy === "mimicry" ? "vk-ios-reference-ui-kit" : "native-system-kit",
  }));
  const permissions = targetCapabilities.map(item => {
    const binding = bindingByKey.get(item.key);
    return {
      key: item.key, capability: item.key, screen: actionSurface.get(binding.actionId),
      target: actionSurface.get(binding.actionId), feature: blueprint.world.actions.find(action => action.id === binding.actionId)?.outcome,
      gesture: binding.actionId, fallback: binding.fallback, conditional: true,
      productOutcome: binding.outcome,
      activation: capabilityPlans.find(plan => plan.permissionKey === item.key)?.activation || "contextual-gesture",
    };
  });
  const tabs = blueprint.navigation.rootTabs.map(tab => ({
    id: tab.screenId, label: tab.title, screen: tab.screenId,
    role: tab.screenId === "feed" ? "feed" : tab.screenId === "circles" ? "discovery" : tab.screenId === "messages" ? "messaging" : tab.screenId === "plans" ? "infrastructure" : "services",
    systemImage: tab.icon,
  }));
  const tokens = reference?.tokens || {
    accent: "#0077FF", background: "#FFFFFF", groupedBackground: "#F2F3F5", fill: "#F2F3F5",
    separator: "#E7E8EC", textPrimary: "#000000", textSecondary: "#818C99",
  };
  const uxScreens = surfaces.map(surface => ({
    id: surface.id, titleKey: `screen.${surface.id}.title`, purposeKey: `screen.${surface.id}.purpose`, componentRoles: screenRoles(surface),
  }));
  const localization = blueprint.localization || surfaces.flatMap(surface => [
    { key: `screen.${surface.id}.title`, source: surface.title },
    { key: `screen.${surface.id}.purpose`, source: surface.purpose },
  ]);
  const fixtures = blueprint.fixtures || surfaces.map(surface => ({
    id: `${surface.id}-default`, surface: surface.id, state: "populated/default",
    data: { headline: surface.title, status: "Актуально", metadata: blueprint.name },
  }));
  const manifest = {
    schemaVersion: 1, qualityContractVersion: 2, actionContractVersion: 3,
    slug: blueprint.id, name: blueprint.name, bundleId,
    platform: { os: "iOS", minimumVersion: "26.0" },
    product: {
      contract: blueprint, selectionReceipt: null, audience: blueprint.audience.who,
      problem: blueprint.audience.need, promise: blueprint.thesis,
      distinctions: ["Малый круг вместо безличного охвата", "Видимый итог после ответа"],
      evidenceScreens: ["feed", "post_detail", "circle_detail", "plans"],
      coreLoop: blueprint.coreLoop.actionIds, nonGoals: ["Безличный каталог интересов", "Административный task manager"],
    },
    design: {
      strategy: blueprint.strategy, referenceProfile: reference, character: ["dense", "social", "content-first"],
      density: "reference", colorScheme: "light", tokens, qualityFloor: 8.5, surfaceContracts,
    },
    navigation: { tabs, profileEntry: "menu-profile" },
    surfaces, permissions, interactions: { actions },
    capabilities: {
      plans: capabilityPlans,
      info: uniqueByKey([...capabilityPlans.flatMap(plan => plan.info), ...usageInfo]),
      entitlements: uniqueByKey(capabilityPlans.flatMap(plan => plan.entitlements)),
      backgroundModes: [...new Set(capabilityPlans.flatMap(plan => plan.backgroundModes))],
      extensionTargets, extensions,
      frameworks: [...new Set([...capabilityPlans.flatMap(plan => plan.frameworks), ...extensions.flatMap(item => item.frameworks || [])])].sort(),
      runtimeAdapters: [...new Set(capabilityPlans.map(plan => plan.runtimeAdapter).filter(Boolean))].sort(),
    },
    verification: {
      states: surfaces.flatMap(surface => surface.states.map(state => ({
        id: `${surface.id}--${state}`, surface: surface.id, state, method: "screenshot", launch: { screen: surface.id, state },
      }))),
    },
    uxSpecification: {
      schemaVersion: 1, screens: uxScreens, design: { tokens }, localization: { catalog: localization }, fixtures,
      acceptanceScenarios: blueprint.acceptanceScenarios || [],
    },
  };
  return { ok: true, diagnostics: [], manifest };
}
