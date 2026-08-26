import { createHash } from "node:crypto";
import { normalizeLeanActionEffects } from "./structured-model-lean-architect.mjs";
import { resolveHTMLConceptPatterns } from "./html-concept-patterns.mjs";

const recipes = Object.freeze({
  login: "emailAuthentication",
  feed: "authoredFeed",
  post_detail: "authoredPostDetail",
  comments: "commentThread",
  search: "socialDiscovery",
  create: "publicationEditor",
  complete: "resultCompletion",
  messages: "conversationList",
  conversation: "conversation",
  profile: "ownedProfile",
  saved: "savedCollection",
  notifications: "notificationCenter",
  settings: "settings",
  accesses: "capabilityCenter",
  private_deeds: "protectedCollection",
});

const allowedRecipes = new Set(Object.values(recipes));

const nativeComponents = Object.freeze({
  authoredFeed: ["VKRootSurface", "VKTabHeader", "VKAuthoredPost", "VKPostActions"],
  authoredPostDetail: ["VKRootSurface", "VKNavigationChrome", "VKAuthoredPost", "VKPostActions"],
  contributionEditor: ["VKRootSurface", "VKModalChrome", "VKGroup", "VKPrimaryActionArea"],
  completion: ["VKRootSurface", "VKNavigationChrome", "VKInlineNotice", "VKPrimaryActionArea"],
  socialDiscovery: ["VKRootSurface", "VKTabHeader", "VKGroup", "VKRow"],
  publicationEditor: ["VKRootSurface", "VKTabHeader", "VKGroup", "VKPrimaryActionArea"],
  conversationList: ["VKRootSurface", "VKTabHeader", "VKGroup", "VKRow"],
  ownedProfile: ["VKRootSurface", "VKTabHeader", "Avatar", "VKGroup", "VKRow"],
  capabilityCenter: ["VKRootSurface", "VKNavigationChrome", "VKGroup", "VKRow", "VKInlineNotice"],
  settings: ["VKRootSurface", "VKNavigationChrome", "VKGroup", "VKRow"],
  recipientPicker: ["VKRootSurface", "VKModalChrome", "VKGroup", "VKRow", "VKPrimaryActionArea"],
  serviceMenu: ["VKRootSurface", "VKTabHeader", "LazyVGrid"],
  featureList: ["VKRootSurface", "VKNavigationChrome", "VKGroup", "VKRow"],
});

for (const recipe of Object.keys(nativeComponents)) allowedRecipes.add(recipe);

function sha(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function placement(action, screen) {
  if (action.outcome?.type === "navigate") return "attached-to-object";
  if (screen.id === "create" || screen.id === "complete") return "form-flow";
  if (/settings|access|profile/.test(screen.id)) return "settings-row";
  if (/comment|message|conversation/.test(screen.id)) return "composer";
  return "attached-to-content";
}

export function compileLeanProductUIContract(blueprint, manifest) {
  blueprint = normalizeLeanActionEffects(structuredClone(blueprint));
  const actionById = new Map(manifest.interactions.actions.map(action => [action.id, action]));
  const blueprintActionById = new Map(blueprint.world.actions.map(action => [action.id, action]));
  const stateByScreen = new Map(blueprint.states.map(item => [item.screenId, item.variants]));
  const capabilitiesByAction = new Map();
  for (const capability of blueprint.capabilities) {
    const owned = capabilitiesByAction.get(capability.actionId) || [];
    owned.push(capability);
    capabilitiesByAction.set(capability.actionId, owned);
  }
  const surfaces = blueprint.navigation.screens.map(screen => {
    const actions = screen.actionIds.map(id => {
      const action = actionById.get(id);
      const capabilities = capabilitiesByAction.get(id) || [];
      return Object.freeze({
        id,
        label: action?.label,
        outcome: action?.outcome,
        effect: blueprintActionById.get(id)?.effect || action?.outcome?.reducer,
        placement: placement(action || {}, screen),
        capabilities: Object.freeze(capabilities.map(capability => Object.freeze({
          key: capability.key,
          requestMoment: capability.requestMoment,
          observableResult: capability.observableResult,
          deniedFallback: capability.fallback,
          stateField: capability.outcome.stateField,
        }))),
      });
    });
    return Object.freeze({
      screenId: screen.id,
      title: screen.title,
      recipe: screen.recipe || recipes[screen.id] || (screen.presentation === "tab" ? "authoredFeed" : "authoredPostDetail"),
      nativeComponents: Object.freeze([...(nativeComponents[screen.recipe || recipes[screen.id]] || ["VKRootSurface", "VKGroup"])]),
      inheritedPatterns: resolveHTMLConceptPatterns(screen.recipe || recipes[screen.id]),
      presentation: screen.presentation,
      parent: screen.parent,
      entityIds: Object.freeze([...(screen.entityIds || [])]),
      actions: Object.freeze(actions),
      states: Object.freeze([...(stateByScreen.get(screen.id) || [])]),
      surfaceContract: manifest.design.surfaceContracts?.find(item => item.id === screen.id)
        || manifest.design.surfaceContracts?.find(item => item.surface === screen.id) || null,
    });
  });
  const body = {
    schemaVersion: 1,
    productId: blueprint.id,
    targetProduct: blueprint.targetProduct,
    strategy: blueprint.strategy,
    design: Object.freeze({
      referenceProfile: manifest.design.referenceProfile?.id || null,
      tokens: Object.freeze({ ...(manifest.design.tokens || {}) }),
      iconPolicy: Object.freeze({ ...(manifest.design.referenceProfile?.native?.iconography || {}) }),
    }),
    rootTabs: blueprint.navigation.rootTabs,
    surfaces,
    invariants: [
      "one-visible-control-per-action",
      "object-attached-social-feedback",
      "permission-from-owning-product-gesture",
      "granted-and-denied-observable-outcomes",
      "single-profile-entry",
      "native-tabview-owns-liquid-glass",
      "lucide-product-chrome-for-vk",
      "shared-native-authentication",
    ],
  };
  return Object.freeze({ ...body, contractId: `ui-${sha(body)}` });
}

export function verifyLeanProductUIContract(contract, blueprint) {
  const problems = [];
  if (!contract?.contractId || !/^ui-[a-f0-9]{16}$/.test(contract.contractId)) problems.push("contract id is missing");
  const surfaceById = new Map((contract?.surfaces || []).map(item => [item.screenId, item]));
  if (surfaceById.size !== blueprint.navigation.screens.length) problems.push("surface ownership is incomplete or duplicated");
  for (const screen of blueprint.navigation.screens) {
    const surface = surfaceById.get(screen.id);
    if (!surface) { problems.push(`${screen.id}: UI surface is missing`); continue; }
    if (!allowedRecipes.has(surface.recipe)) problems.push(`${screen.id}: unknown recipe ${surface.recipe}`);
    if (!surface.nativeComponents?.length) problems.push(`${screen.id}: native component mapping is missing`);
    const expected = [...screen.actionIds].sort();
    const actual = [...new Set(surface.actions.map(item => item.id))].sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) problems.push(`${screen.id}: action ownership drift`);
    const requiredStates = blueprint.deliveryMode === "slice" || blueprint.statePolicy === "applicable"
      ? ["populated/default"]
      : ["loading", "populated/default", "empty", "error", "offline"];
    if (!requiredStates.every(state => surface.states.includes(state))) {
      problems.push(`${screen.id}: canonical state coverage is incomplete`);
    }
    for (const action of surface.actions) {
      if (!action.effect?.type) problems.push(`${screen.id}.${action.id}: machine-readable effect is missing`);
      if (action.effect?.type === "navigate" && !surfaceById.has(action.effect.targetScreenId)) {
        problems.push(`${screen.id}.${action.id}: route ${action.effect.targetScreenId} does not exist`);
      }
      const capabilities = blueprint.capabilities.filter(item => item.actionId === action.id);
      const ownedKeys = new Set((action.capabilities || []).map(item => item.key));
      for (const capability of capabilities) if (!ownedKeys.has(capability.key)) {
        problems.push(`${screen.id}.${action.id}: capability ${capability.key} ownership is missing`);
      }
    }
  }
  if (!contract.design?.tokens || Object.keys(contract.design.tokens).length < 6) problems.push("semantic design tokens are missing");
  if (contract.strategy === "mimicry" && contract.targetProduct === "vkontakte") {
    for (const invariant of ["object-attached-social-feedback", "native-tabview-owns-liquid-glass", "lucide-product-chrome-for-vk"]) {
      if (!contract.invariants.includes(invariant)) problems.push(`VK invariant ${invariant} is missing`);
    }
  }
  return Object.freeze({ passed: problems.length === 0, problems: Object.freeze(problems) });
}
