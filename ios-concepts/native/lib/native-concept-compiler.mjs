import { compileNativeConcept } from "./compile-concept.mjs";
import { stableProductArtifactId } from "./product-maturity.mjs";

function slug(value) {
  return String(value || "native-concept")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30) || "native-concept";
}

function persistence(value) {
  if (["none", "local", "system", "server"].includes(value)) return value;
  if (["session", "local-model", "keychain", "app-group"].includes(value)) return "local";
  return "none";
}

function actionOutcome(action, permissionKeys) {
  const source = action.outcome || {};
  if (source.type === "system") return { type: "external", destination: source.destination || source.target || source.capability || "iOS system surface" };
  if (source.type === "request") {
    const capability = permissionKeys.has(source.capability) ? source.capability : action.worldActionId;
    return permissionKeys.has(capability)
      ? { type: "request", capability }
      : { type: "mutate", state: source.state || `${action.id}-completed` };
  }
  if (source.type === "navigate") return { type: "navigate", target: source.destination || source.target };
  if (source.type === "mutate") return { type: "mutate", state: source.state || `${action.id}-completed` };
  if (source.type === "external") return { type: "external", destination: source.destination || source.target || "external destination" };
  if (source.type === "dismiss") return { type: "dismiss" };
  return { type: "mutate", state: source.state || `${action.id}-completed` };
}

function patternFor(node) {
  if (node.id.startsWith("auth-")) return "auth";
  if (/message|conversation/i.test(node.id)) return /detail/i.test(node.id) ? "chat" : "collection";
  if (/feed|list/i.test(node.id)) return "feed";
  if (/create|compose|picker/i.test(node.id)) return "form";
  if (node.presentation === "tab") return "collection";
  return "detail";
}

function normalizedToken(value) {
  if (typeof value !== "string") return value;
  return value.match(/#[0-9a-f]{6}\b/i)?.[0] || value.replace(/[\u0400-\u04ff]+/gu, "").trim() || "system";
}

function uniqueActionLabel(action, actions) {
  const duplicate = actions.filter(item => item.label === action.label);
  if (duplicate.length < 2) return action.label;
  if (action.id.includes("restricted")) return `${action.label}: доступ ограничен`;
  if (action.id.includes("denied")) return `${action.label}: доступ запрещён`;
  return `${action.label}: ${action.id.replaceAll("-", " ")}`;
}

function scenarioStepSurface(action, fallback, screenIds) {
  const target = action?.outcome?.target || action?.outcome?.destination;
  return screenIds.has(target) ? target : fallback;
}

function acceptanceSource({ contract, experienceContract, generated }) {
  const screenIds = new Set(experienceContract.navigation.nodes.map(item => item.id));
  const actions = new Map(experienceContract.actions.map(item => [item.id, item]));
  const fixtures = generated.manifest.uxSpecification.fixtures;
  const fixtureId = (surface, state = null) => {
    const candidates = fixtures.filter(item => item.surface === surface);
    return (state ? candidates.find(item => item.state === state || item.state === `permission-${state}`) : candidates[0])?.id
      || candidates[0]?.id;
  };
  const localization = generated.manifest.uxSpecification.localization.catalog
    .filter(item => !item.key.startsWith("scenario."))
    .map(item => ({ ...item, screens: item.screens.filter(screen => screenIds.has(screen)) }));
  const scenarios = [];
  const journeys = experienceContract.journeys || [];

  for (const [index, flow] of (contract.delivery?.criticalFlows || []).entries()) {
    const journey = journeys[index] || journeys[0];
    if (!journey) continue;
    const journeyActions = journey.actionIds.map(id => actions.get(id)).filter(Boolean);
    const start = screenIds.has(journey.startScreenId) ? journey.startScreenId : journeyActions[0]?.surface;
    let current = start;
    for (const action of journeyActions) current = scenarioStepSurface(action, current, screenIds);
    const end = current || start;
    const prefix = `scenario.${slug(flow.id)}`;
    const names = {
      happy: `${flow.name}: основной путь`,
      failure: `${flow.name}: ошибка и восстановление`,
      offline: `${flow.name}: без сети`,
      persistence: `${flow.name}: возврат после перезапуска`,
    };
    for (const [kind, source] of Object.entries(names)) localization.push({
      key: `${prefix}.${kind}.name`, source, locale: "ru", placeholders: [], pluralization: null,
      context: "Acceptance scenario name", screens: [...new Set([start, end])], usage: "acceptance",
    });
    scenarios.push({
      id: `${flow.id}.happy`, flowId: flow.id, coverage: "happy-path", nameKey: `${prefix}.happy.name`,
      given: [{ type: "surface", id: start }, { type: "fixture", id: fixtureId(start) }],
      when: journeyActions.map(action => ({ type: "perform-action", id: `${action.surface}.${action.id}` })),
      then: [{ type: "surface-visible", id: end }, { type: "outcome-visible", id: slug(flow.outcome) }],
    });
    scenarios.push({
      id: `${flow.id}.failure`, flowId: flow.id, coverage: "failure-recovery", nameKey: `${prefix}.failure.name`,
      given: [{ type: "surface", id: start }, { type: "fixture", id: fixtureId(start, "error") }, { type: "inject-state", id: "error" }],
      when: [{ type: "invoke-recovery", id: start }],
      then: [{ type: "recovery-visible", id: start }, { type: "input-preserved", id: start }],
    });
    scenarios.push({
      id: `${flow.id}.offline`, flowId: flow.id, coverage: "offline", nameKey: `${prefix}.offline.name`,
      given: [{ type: "surface", id: start }, { type: "fixture", id: fixtureId(start, "offline") }, { type: "connectivity", id: "offline" }],
      when: [{ type: "open-surface", id: start }],
      then: [{ type: "state-visible", id: `${start}.offline` }, { type: "recovery-visible", id: start }],
    });
    scenarios.push({
      id: `${flow.id}.persistence`, flowId: flow.id, coverage: "persistence-return", nameKey: `${prefix}.persistence.name`,
      given: [{ type: "surface", id: start }, { type: "checkpoint-flow", id: flow.id }],
      when: [{ type: "relaunch", id: "application" }, { type: "return-to-flow", id: flow.id }],
      then: [{ type: "flow-context-restored", id: flow.id }, { type: "surface-visible", id: start }],
    });
  }

  for (const permission of contract.permissions || []) {
    const plan = (experienceContract.permissionFlows || []).find(item => item.key === permission.key);
    const surface = plan?.surface || experienceContract.authentication.entrySurface;
    const target = plan?.returnSurface || plan?.surface || surface;
    const nameKey = `scenario.permission.${slug(permission.key)}.denied.name`;
    localization.push({
      key: nameKey, source: `${permission.productValue}: отказ и запасной путь`, locale: "ru", placeholders: [], pluralization: null,
      context: "Acceptance scenario name", screens: [...new Set([surface, target])].filter(id => screenIds.has(id)), usage: "acceptance",
    });
    scenarios.push({
      id: `permission.${permission.key}.denied`, flowId: `permission:${permission.key}`, coverage: "permission-denial-fallback", nameKey,
      given: [{ type: "surface", id: surface }, { type: "fixture", id: fixtureId(target, "denied") }, { type: "permission-status", id: `${permission.key}.not-determined` }],
      when: [{ type: "deny-permission", id: permission.key }],
      then: [{ type: "state-visible", id: `${target}.permission-denied` }, { type: "fallback-visible", id: permission.key }],
    });
  }
  return { scenarios, localization };
}

function permissionSource(contract, experienceContract) {
  const flows = new Map((experienceContract.permissionFlows || []).map(item => [item.key, item]));
  return (contract.permissions || []).map(item => {
    const flow = flows.get(item.key);
    return {
      key: item.key,
      feature: item.productValue,
      gesture: item.requestMoment,
      screen: flow?.surface || experienceContract.authentication.entrySurface,
      target: flow?.surface || experienceContract.authentication.successSurface,
      fallback: item.deniedFallback,
      conditional: true,
      alert: {
        title: `«${item.flow}»: системный доступ`,
        text: `${item.productValue} ${item.deniedFallback}`,
      },
    };
  });
}

export function compileFactoryNativeConcept({ factoryArtifact, experienceContract, visualDevelopment }) {
  const contract = factoryArtifact.productDevelopment.productContract;
  const worldModelId = factoryArtifact.selectedWorldModelId;
  const candidate = factoryArtifact.productDevelopment.candidates.find(item => item.id === worldModelId);
  const direction = visualDevelopment.visualDirectionContract.direction;
  const conceptSlug = slug(worldModelId);
  const permissionKeys = new Set((contract.permissions || []).map(item => item.key));
  const actionsBySurface = Map.groupBy(experienceContract.actions || [], item => item.surface);
  const stateBySurface = new Map((experienceContract.states || []).map(item => [item.screenId, item]));
  const tabIcons = new Map((direction.iconography?.tabRoles || []).map(item => [item.screenId, item.icon]));
  const allActions = experienceContract.actions || [];
  const screens = experienceContract.navigation.nodes.map(node => ({
    id: node.id,
    title: node.title,
    parent: node.parent,
    native: {
      presentation: node.presentation,
      purpose: node.purpose,
      role: patternFor(node),
      states: (stateBySurface.get(node.id)?.variants || []).filter(item => item.applicable).map(item => item.id),
    },
    ui: {
      purpose: node.purpose,
      pattern: patternFor(node),
      states: (stateBySurface.get(node.id)?.variants || []).filter(item => item.applicable).map(item => item.id),
      actions: (actionsBySurface.get(node.id) || []).map(action => ({
        id: action.id,
        label: uniqueActionLabel(action, allActions.filter(item => item.surface === node.id)),
        outcome: actionOutcome(action, permissionKeys),
        execution: action.outcome?.type === "request" ? "async" : "sync",
        persistence: persistence(action.persistence),
      })),
    },
  }));
  const tabs = experienceContract.navigation.nodes.filter(item => item.presentation === "tab").map(item => ({
    id: item.id,
    label: item.title,
    screen: item.id,
    role: item.id,
    systemImage: tabIcons.get(item.id) || "circle",
  }));
  const concept = {
    slug: conceptSlug,
    name: candidate?.name || "Рядом",
    start: experienceContract.authentication.entrySurface,
    qualityContractVersion: 1,
    uiContractVersion: 1,
    productDevelopment: structuredClone(factoryArtifact.productDevelopment),
    product: {
      audience: contract.audience?.primary || contract.job?.actor,
      problem: contract.job?.motivation,
      promise: contract.productThesis,
      nonGoals: contract.nonGoals || [],
    },
    positioning: {
      mode: contract.reference.strategy,
      distinctions: [contract.observableDifferentiation?.behavior || contract.wedge?.mechanism || contract.productThesis],
      evidenceScreens: screens.filter(item => !["system", "external"].includes(item.native.presentation)).slice(0, 4).map(item => item.id),
      referencePatterns: contract.reference.borrowedPatterns || [],
    },
    permissions: permissionSource(contract, experienceContract),
    screens,
    tabs,
    native: {
      schemaVersion: 1,
      actionContractVersion: 0,
      platform: { minimumVersion: "17.0" },
      design: {
        strategy: contract.reference.strategy,
        referenceProfile: contract.reference.profileId,
        character: [direction.name, direction.rationale],
        density: direction.composition?.density || "balanced",
        colorScheme: "light",
        tokens: structuredClone(direction.tokens),
        iconography: structuredClone(direction.iconography),
        qualityFloor: 8.5,
      },
      navigation: {
        tabs,
        profileEntry: tabs.find(item => item.screen === "profile")?.screen || null,
        deepLinks: [
          { id: "authenticated-shell", pattern: `${conceptSlug}://home`, target: "main-shell", guard: "session.authenticated" },
          { id: "share-extension", pattern: `${conceptSlug}://share`, target: "share-extension", guard: "shared-draft.available" },
        ].filter(item => screens.some(screen => screen.id === item.target)),
      },
      extensions: ["share-extension", "notification-service"],
      deliveryIdentity: {
        coreSurfaces: [
          experienceContract.authentication.successSurface,
          ...tabs.map(item => item.screen),
          ...experienceContract.journeys.flatMap(journey => journey.actionIds)
            .map(id => experienceContract.actions.find(action => action.id === id)?.surface)
            .filter(Boolean),
        ].filter((id, index, items) => id && items.indexOf(id) === index).slice(0, 7),
        requiredVocabulary: ["карточк", "помощ", "отклик"],
        forbiddenVocabulary: ["ремикс", "своп", "питомец", "учебный билет"],
        firstFrame: {
          surface: experienceContract.authentication.successSurface,
          mustExpose: ["стул", "дрель"],
        },
        fixture: {
          kind: contract.contentModel?.primaryUnit || "product-record",
          actor: contract.delivery?.personas?.[0]?.name || contract.job?.actor || "Пользователь",
          defaultHeadline: contract.coldStart?.seededContent || contract.productThesis,
          surfaceContent: Object.fromEntries(experienceContract.content.screenBindings.map(binding => [
            binding.screenId,
            binding.recordIds.map(id => experienceContract.content.records.find(record => record.id === id)?.displayName)
              .filter(Boolean).join(" · ") || contract.productThesis,
          ])),
          metadata: contract.coldStart?.firstSessionValue || contract.wedge?.mechanism,
          stressText: contract.delivery?.limitations?.[0] || contract.privacy?.dataMinimization || contract.productThesis,
          edgeValues: [0, 1, 2, 5, 21, 99],
        },
      },
    },
  };
  const generated = compileNativeConcept(concept);
  const acceptance = acceptanceSource({ contract, experienceContract, generated });
  const generatedUX = generated.manifest.uxSpecification;
  const semanticTokens = Object.fromEntries(Object.entries(direction.tokens || {}).map(([key, value]) => [key, normalizedToken(value)]));
  concept.ux = {
    schemaVersion: generatedUX.schemaVersion,
    navigation: generatedUX.navigation,
    screens: generatedUX.screens,
    design: {
      strategy: contract.reference.strategy,
      referenceProfile: contract.reference.profileId,
      tokens: semanticTokens,
      semanticComponentRoles: generatedUX.design.semanticComponentRoles,
      swiftUIConsumption: generatedUX.design.swiftUIConsumption,
    },
    localization: { defaultLocale: "ru", catalog: acceptance.localization.sort((a, b) => a.key.localeCompare(b.key)) },
    acceptanceScenarios: acceptance.scenarios,
    fixtures: generatedUX.fixtures,
  };
  const compiledDraft = compileNativeConcept(concept);
  const { uxSpecificationId: ignored, ...uxBody } = compiledDraft.manifest.uxSpecification;
  concept.ux.uxSpecificationId = stableProductArtifactId("ux", uxBody);
  const compiled = compileNativeConcept(concept);
  return { concept, compiled };
}
