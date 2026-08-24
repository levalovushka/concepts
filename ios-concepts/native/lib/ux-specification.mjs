import { stableProductArtifactId } from "./product-maturity.mjs";

export const UX_SPECIFICATION_SCHEMA_VERSION = 1;
export const CANONICAL_UX_STATES = Object.freeze([
  "loading",
  "populated/default",
  "empty",
  "error",
  "offline",
  "permission-needed",
  "permission-denied",
  "permission-restricted",
  "permission-limited",
]);

const LEGACY_MIGRATION_SLUGS = new Set(["looks", "dvor"]);
const MEDIA_SURFACES = Object.freeze({
  looks: new Set(["home", "search", "post", "nearby", "clip", "create", "camera", "media", "profile", "wardrobe", "event", "subtitles", "shareext"]),
  dvor: new Set(["home", "createpost", "post", "problem", "shoot", "chronicle", "profile"]),
});
const COLLECTION_PATTERNS = new Set(["collection", "social-feed", "service-list"]);
const ALLOWED_OUTCOMES = new Set(["navigate", "mutate", "request", "dismiss", "external", "system"]);
const ALLOWED_PRESENTATIONS = new Set(["root", "tab", "push", "sheet", "cover", "system", "external", "state"]);
const ALLOWED_SCENARIO_COVERAGE = new Set([
  "happy-path", "failure-recovery", "offline", "persistence-return", "permission-denial-fallback",
]);
const SURFACE_SCENARIO_STEPS = new Set([
  "surface", "open-surface", "surface-visible", "recovery-visible", "input-preserved", "invoke-recovery",
]);
const ALLOWED_SCENARIO_STEPS = new Set([
  ...SURFACE_SCENARIO_STEPS,
  "fixture", "perform-action", "outcome-visible", "inject-state", "connectivity",
  "checkpoint-flow", "relaunch", "return-to-flow", "flow-context-restored",
  "permission-status", "deny-permission", "fallback-visible", "state-visible",
]);

function diagnostic(code, message, path, severity = "error") {
  return Object.freeze({ code, message, path, severity });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function computedReachability(navigation, screenIds) {
  const reachable = new Set(asArray(navigation?.roots).filter(id => screenIds.has(id)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of asArray(navigation?.edges)) {
      if (screenIds.has(edge?.to) && (edge?.from === null || reachable.has(edge?.from)) && !reachable.has(edge.to)) {
        reachable.add(edge.to);
        changed = true;
      }
    }
  }
  return reachable;
}

function outcomeDestination(outcome = {}) {
  return outcome.target || outcome.destination || outcome.capability || outcome.state || null;
}

function slugKey(value) {
  return String(value || "value")
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "value";
}

function presentationFor(screen, surfaces) {
  return surfaces.find(item => item.id === screen.id)?.presentation || screen.native?.presentation || "unknown";
}

function canonicalStateFor(value) {
  if (CANONICAL_UX_STATES.includes(value)) return value;
  if (["default", "populated", "current", "ready", "available", "unread", "read", "locked", "unlocked"].includes(value)) return "populated/default";
  if (["loading", "searching", "checking", "connecting", "recording", "transcribing", "scanning", "submitting", "editing", "sending"].includes(value)) return "loading";
  if (value === "empty") return "empty";
  if (["error", "mismatch", "stale", "fallback", "cancelled"].includes(value)) return "error";
  if (value === "offline") return "offline";
  if (value === "denied") return "permission-denied";
  if (value === "restricted") return "permission-restricted";
  if (value === "limited") return "permission-limited";
  return "populated/default";
}

function russianStateCopy(slug, title, state) {
  const product = slug === "dvor" ? "дома" : "образов";
  const copies = {
    loading: `Обновляем данные раздела «${title}»; текущий контекст остаётся доступен.`,
    "populated/default": `Актуальные данные раздела «${title}» готовы к следующему действию.`,
    empty: `В разделе «${title}» пока ничего нет — создайте первое содержательное действие.`,
    error: `Не удалось обновить «${title}». Введённые данные сохранены; повторите попытку.`,
    offline: `Нет сети. Показаны сохранённые данные ${product}; свежесть отмечена явно.`,
    "permission-needed": `Для следующего действия нужен системный доступ; запрос появится только после подтверждения.`,
    "permission-denied": `Доступ отключён. Продолжите задачу запасным способом без системного разрешения.`,
    "permission-restricted": `Доступ ограничен настройками устройства или семьи; системный запрос недоступен.`,
    "permission-limited": `Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор.`,
  };
  return copies[state];
}

function fixtureData(slug, surface, state) {
  const stateLabel = state === "default" ? "populated" : state;
  if (slug === "dvor") return {
    fixtureKind: "house-matter",
    house: "Полевая, 12 · подъезд 3",
    actor: "Марина Соколова · кв. 47",
    headline: surface === "meters" ? "Холодная вода · 01842,7 м³" : "Лифт снова останавливается между 6-м и 7-м этажами",
    status: stateLabel,
    metadata: "заявка №4817 · мастер до 18:30 · 12 соседей следят",
    stressText: "Подъезд №3, квартиры 41–68: повторная остановка после вчерашнего ремонта; коляска остаётся на первом этаже.",
    edgeValues: [0, 1, 2, 5, 21, 1842.7],
  };
  return {
    fixtureKind: "look",
    actor: "Алина Романова · сегодня, 08:42",
    headline: surface === "wardrobe" ? "Тренч цвета хаки · 7 сохранённых сочетаний" : "Тренч, графитовые брюки и кеды после дождя",
    status: stateLabel,
    metadata: "4 вещи · 27 сохранений · ответ через 12 минут",
    stressText: "Пальто оверсайз с очень длинным названием модели, винтажная сумка и заметка автора на три строки для проверки крупного текста.",
    edgeValues: [0, 1, 2, 5, 21, 182],
  };
}

function fixtureFor(concept, surface, state) {
  const mediaRequired = Boolean(MEDIA_SURFACES[concept.slug]?.has(surface.id)
    && !["empty", "error", "offline", "denied", "restricted"].includes(state));
  return {
    id: `fixture.${concept.slug}.${surface.id}.${slugKey(state)}`,
    surface: surface.id,
    state,
    deterministicIds: [
      `${concept.slug}.${surface.id}.${slugKey(state)}.primary.001`,
      `${concept.slug}.${surface.id}.${slugKey(state)}.edge.099`,
    ],
    data: fixtureData(concept.slug, surface.id, state),
    edgeCases: ["long-russian-copy", "accessibility-xxxl", "zero-one-many-values", state === "offline" ? "stale-timestamp" : "mixed-recency"],
    provenance: {
      kind: "legacy-migration-fixture",
      source: `concepts/${concept.slug}/concept.json + native/apps/${concept.slug}`,
      note: "Deterministic representative Russian content; not user research or production data.",
    },
    media: mediaRequired ? [{
      role: "product-content-photo",
      assetId: `${concept.slug}.${surface.id}.content.001`,
      provenance: `native/apps/${concept.slug}/Assets.xcassets existing app-owned catalog`,
      license: "legacy project-owned/approved asset; redistribution rights require separate evidence intake",
    }] : [],
  };
}

function addString(catalog, key, source, context, screens, usage, options = {}) {
  const previous = catalog.get(key);
  const item = {
    key,
    source,
    locale: "ru",
    placeholders: options.placeholders || [],
    pluralization: options.pluralization || null,
    context,
    screens: [...new Set(asArray(screens))],
    usage,
  };
  if (previous && previous.source !== source) throw new Error(`localization key ${key} has conflicting sources`);
  catalog.set(key, previous || item);
  return key;
}

function applicability(screen, state, permissions, actions) {
  const declared = new Set(screen.ui?.states || screen.native?.states || ["default"]);
  const screenPermissions = permissions.filter(item => item.screen === screen.id || item.target === screen.id);
  const async = actions.some(item => item.execution === "async");
  const presentation = screen._presentation;
  if (state === "populated/default") return { applicable: true, rationale: "Every reachable surface has an observable resting state." };
  if (state === "loading") return declared.has("loading") || async
    ? { applicable: true, rationale: "Declared or asynchronous work can be in progress." }
    : { applicable: false, rationale: "This surface owns no asynchronous or loading operation." };
  if (state === "empty") return declared.has("empty") || COLLECTION_PATTERNS.has(screen.ui?.pattern)
    ? { applicable: true, rationale: "The collection can contain zero product units." }
    : { applicable: false, rationale: "The surface represents one required task or system-owned object, not a collection." };
  if (state === "error") return declared.has("error") || async || !["system", "external"].includes(presentation)
    ? { applicable: true, rationale: "Product data, validation, or an asynchronous operation can fail." }
    : { applicable: false, rationale: "The operating system or external application owns failure presentation." };
  if (state === "offline") return !["system", "external"].includes(presentation)
    ? { applicable: true, rationale: "Native product state must remain explicit when integrations are unavailable." }
    : { applicable: false, rationale: "The operating system or external application owns connectivity presentation." };
  if (state === "permission-needed" || state === "permission-denied") return screenPermissions.length
    ? { applicable: true, rationale: "A declared capability enters or returns to this surface." }
    : { applicable: false, rationale: "No permission is requested from or resolved on this surface." };
  if (state === "permission-restricted") return screenPermissions.length
    ? { applicable: true, rationale: "System policy can prevent a request independently of user denial." }
    : { applicable: false, rationale: "No permission is requested from or resolved on this surface." };
  if (state === "permission-limited") {
    const limited = screenPermissions.some(item => ["photos", "contacts", "location", "camera"].includes(item.key));
    return limited
      ? { applicable: true, rationale: "The capability can expose limited or reduced data." }
      : { applicable: false, rationale: "The linked capabilities have no useful limited-data mode." };
  }
  return { applicable: false, rationale: "State is not part of the canonical UX vocabulary." };
}

function buildNavigation(concept, screens, actions, permissions) {
  const screenIds = new Set(screens.map(item => item.id));
  const entries = new Map(screens.map(item => [item.id, []]));
  const exits = new Map(screens.map(item => [item.id, []]));
  const edges = [];
  const roots = new Set([concept.start, ...(concept.native?.navigation?.tabs || concept.tabs || []).map(item => item.screen || item.id)].filter(Boolean));

  if (concept.start && screenIds.has(concept.start)) entries.get(concept.start).push({ type: "launch", source: "application", guard: null });
  for (const tab of concept.native?.navigation?.tabs || concept.tabs || []) {
    const target = tab.screen || tab.id;
    if (!screenIds.has(target)) continue;
    entries.get(target).push({ type: "tab", source: tab.id, guard: "session.authenticated" });
    edges.push({ id: `tab.${tab.id}`, type: "tab", from: null, to: target, guard: "session.authenticated" });
  }
  for (const screen of screens) if (screen.parent && screenIds.has(screen.parent)) {
    entries.get(screen.id).push({ type: "parent", source: screen.parent, guard: null });
    exits.get(screen.parent).push({ type: "present", action: null, destination: screen.id });
    edges.push({ id: `parent.${screen.parent}.${screen.id}`, type: "presentation", from: screen.parent, to: screen.id, guard: null });
  }
  for (const action of actions) {
    const outcome = action.outcome || {};
    if (outcome.type === "navigate" && screenIds.has(outcome.target)) {
      entries.get(outcome.target).push({ type: "action", source: `${action.surface}.${action.id}`, guard: action.enabledWhen || "always" });
      exits.get(action.surface)?.push({ type: "navigate", action: action.id, destination: outcome.target });
      edges.push({ id: `action.${action.surface}.${action.id}`, type: "action", from: action.surface, to: outcome.target, guard: action.enabledWhen || "always" });
    } else if (ALLOWED_OUTCOMES.has(outcome.type)) {
      exits.get(action.surface)?.push({ type: outcome.type, action: action.id, destination: outcomeDestination(outcome) });
    }
  }
  for (const permission of permissions) if (screenIds.has(permission.target)) {
    entries.get(permission.target).push({ type: "permission", source: `${permission.screen}.${permission.key}`, guard: `capability.${permission.key}.requested` });
    exits.get(permission.screen)?.push({ type: "permission", action: permission.key, destination: permission.target });
    edges.push({ id: `permission.${permission.key}`, type: "permission", from: permission.screen, to: permission.target, guard: `gesture.${permission.key}` });
  }
  const deepLinks = asArray(concept.native?.navigation?.deepLinks).map(item => ({
    id: item.id,
    pattern: item.pattern,
    target: item.target,
    guard: item.guard || "session.authenticated",
  }));
  for (const link of deepLinks) if (screenIds.has(link.target)) {
    entries.get(link.target).push({ type: "deep-link", source: link.id, guard: link.guard });
    edges.push({ id: `deep-link.${link.id}`, type: "deep-link", from: null, to: link.target, guard: link.guard });
  }

  const reachable = new Set([...roots].filter(id => screenIds.has(id)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) if ((edge.from === null || reachable.has(edge.from)) && !reachable.has(edge.to)) {
      reachable.add(edge.to);
      changed = true;
    }
  }

  const nodes = screens.map(screen => {
    const presentation = screen._presentation;
    const back = presentation === "push"
      ? { type: "pop", destination: screen.parent }
      : ["sheet", "cover"].includes(presentation)
        ? { type: "dismiss", destination: screen.parent }
        : ["system", "external"].includes(presentation)
          ? { type: "system-return", destination: screen.parent }
          : { type: "none", destination: null };
    return {
      id: screen.id,
      presentation,
      parent: screen.parent || null,
      root: roots.has(screen.id),
      entries: entries.get(screen.id),
      exits: exits.get(screen.id),
      guards: [...new Set(entries.get(screen.id).map(item => item.guard).filter(Boolean))],
      back,
      dismiss: ["sheet", "cover"].includes(presentation) ? { type: "interactive-or-action", destination: screen.parent } : null,
    };
  });
  return { roots: [...roots], nodes, edges, deepLinks, reachable };
}

function stepsForFlow(flow, actionIndex) {
  const steps = [];
  const flowSteps = asArray(flow?.steps);
  for (let index = 0; index < flowSteps.length; index += 1) {
    const surface = flowSteps[index];
    const next = flowSteps[index + 1];
    const action = asArray(actionIndex.get(surface)).find(item => item.outcome?.type === "navigate" && item.outcome.target === next);
    steps.push(action
      ? { type: "perform-action", id: `${surface}.${action.id}` }
      : { type: "open-surface", id: surface });
  }
  return steps;
}

function generatedScenarios(contract, screens, actions, permissions, fixtures, catalog) {
  const actionIndex = new Map();
  for (const action of actions) actionIndex.set(action.surface, [...asArray(actionIndex.get(action.surface)), action]);
  const fixtureBySurface = new Map();
  const fixtureBySurfaceState = new Map();
  for (const fixture of fixtures) if (!fixtureBySurface.has(fixture.surface)) fixtureBySurface.set(fixture.surface, fixture.id);
  for (const fixture of fixtures) fixtureBySurfaceState.set(`${fixture.surface}.${canonicalStateFor(fixture.state)}`, fixture.id);
  const scenarios = [];
  for (const flow of asArray(contract?.delivery?.criticalFlows)) {
    const flowSteps = asArray(flow?.steps);
    if (!flow?.id || !flow?.name || !flowSteps.length) continue;
    const flowId = slugKey(flow.id);
    const start = flow.trigger || flowSteps[0];
    const last = flowSteps.at(-1);
    const failureSurface = flowSteps.find(surface => fixtureBySurfaceState.has(`${surface}.error`)) || start;
    const nameBase = `scenario.${flowId}`;
    scenarios.push({
      id: `${flowId}.happy`, flowId: flow.id, coverage: "happy-path",
      nameKey: addString(catalog, `${nameBase}.happy.name`, `${flow.name}: основной путь`, "Acceptance scenario name", flowSteps, "acceptance"),
      given: [{ type: "surface", id: start }, { type: "fixture", id: fixtureBySurface.get(start) }],
      when: stepsForFlow(flow, actionIndex),
      then: [{ type: "surface-visible", id: last }, { type: "outcome-visible", id: slugKey(flow.outcome) }],
    });
    scenarios.push({
      id: `${flowId}.failure`, flowId: flow.id, coverage: "failure-recovery",
      nameKey: addString(catalog, `${nameBase}.failure.name`, `${flow.name}: ошибка и восстановление`, "Acceptance scenario name", flowSteps, "acceptance"),
      given: [{ type: "surface", id: failureSurface }, { type: "fixture", id: fixtureBySurfaceState.get(`${failureSurface}.error`) }, { type: "inject-state", id: "error" }],
      when: [{ type: "invoke-recovery", id: failureSurface }],
      then: [{ type: "recovery-visible", id: failureSurface }, { type: "input-preserved", id: failureSurface }],
    });
    scenarios.push({
      id: `${flowId}.offline`, flowId: flow.id, coverage: "offline",
      nameKey: addString(catalog, `${nameBase}.offline.name`, `${flow.name}: без сети`, "Acceptance scenario name", flowSteps, "acceptance"),
      given: [{ type: "surface", id: start }, { type: "fixture", id: fixtureBySurfaceState.get(`${start}.offline`) }, { type: "connectivity", id: "offline" }],
      when: [{ type: "open-surface", id: start }],
      then: [{ type: "state-visible", id: `${start}.offline` }, { type: "recovery-visible", id: start }],
    });
    scenarios.push({
      id: `${flowId}.persistence`, flowId: flow.id, coverage: "persistence-return",
      nameKey: addString(catalog, `${nameBase}.persistence.name`, `${flow.name}: возврат после перезапуска`, "Acceptance scenario name", flowSteps, "acceptance"),
      given: [{ type: "surface", id: start }, { type: "checkpoint-flow", id: flow.id }],
      when: [{ type: "relaunch", id: "application" }, { type: "return-to-flow", id: flow.id }],
      then: [{ type: "flow-context-restored", id: flow.id }, { type: "surface-visible", id: start }],
    });
  }
  for (const permission of permissions) scenarios.push({
    id: `permission.${permission.key}.denied`, flowId: `permission:${permission.key}`, coverage: "permission-denial-fallback",
    nameKey: addString(catalog, `scenario.permission.${slugKey(permission.key)}.denied.name`, `${permission.feature}: отказ и запасной путь`, "Acceptance scenario name", [permission.screen, permission.target], "acceptance"),
    given: [{ type: "surface", id: permission.screen }, { type: "fixture", id: fixtureBySurfaceState.get(`${permission.target}.permission-denied`) }, { type: "permission-status", id: `${permission.key}.not-determined` }],
    when: [{ type: "deny-permission", id: permission.key }],
    then: [{ type: "state-visible", id: `${permission.target}.permission-denied` }, { type: "fallback-visible", id: permission.key }],
  });
  return scenarios;
}

function validateScenarioReferences(scenarios, screens, actions, fixtures) {
  const diagnostics = [];
  const screenIds = new Set(screens.map(item => item.id));
  const actionIds = new Set(actions.map(item => `${item.surface}.${item.id}`));
  const fixtureIds = new Set(fixtures.map(item => item.id));
  const scenarioIds = new Set();
  for (const [index, scenario] of scenarios.entries()) {
    const base = `ux.acceptanceScenarios[${index}]`;
    if (!scenario?.id || scenarioIds.has(scenario.id)) diagnostics.push(diagnostic(
      "ux.scenario.id-invalid", "Acceptance scenario ids must be present and unique", `${base}.id`,
    ));
    scenarioIds.add(scenario?.id);
    if (!scenario?.flowId || !ALLOWED_SCENARIO_COVERAGE.has(scenario?.coverage)) diagnostics.push(diagnostic(
      "ux.scenario.contract-invalid", "Acceptance scenario needs a flowId and recognised coverage", base,
    ));
    for (const phase of ["given", "when", "then"]) {
      if (!asArray(scenario?.[phase]).length) diagnostics.push(diagnostic(
        "ux.scenario.phase-empty", `Acceptance scenario ${scenario?.id || index} has no ${phase} steps`, `${base}.${phase}`,
      ));
      for (const [stepIndex, step] of asArray(scenario?.[phase]).entries()) {
        const path = `${base}.${phase}[${stepIndex}]`;
        if (!ALLOWED_SCENARIO_STEPS.has(step?.type) || typeof step?.id !== "string" || !step.id) diagnostics.push(diagnostic(
          "ux.scenario.step-invalid", "Scenario step needs a recognised type and stable id", path,
        ));
        if (SURFACE_SCENARIO_STEPS.has(step?.type) && !screenIds.has(step.id)) diagnostics.push(diagnostic(
          "ux.scenario.surface-missing", `Scenario references missing surface ${step.id}`, path,
        ));
        if (step?.type === "perform-action" && !actionIds.has(step.id)) diagnostics.push(diagnostic(
          "ux.scenario.action-missing", `Scenario references missing action ${step.id}`, path,
        ));
        if (step?.type === "fixture" && !fixtureIds.has(step.id)) diagnostics.push(diagnostic(
          "ux.scenario.fixture-missing", `Scenario references missing fixture ${step.id}`, path,
        ));
        if (step?.type === "state-visible") {
          const split = step.id.lastIndexOf(".");
          if (split <= 0 || !screenIds.has(step.id.slice(0, split))) diagnostics.push(diagnostic(
            "ux.scenario.state-missing", `Scenario references invalid surface state ${step.id}`, path,
          ));
        }
      }
    }
  }
  return diagnostics;
}

function findBareLocalizedStrings(value, path = "ux", results = []) {
  if (typeof value === "string") {
    const allowed = path.includes(".localization.catalog[") && path.endsWith(".source")
      || path.includes(".fixtures[") && path.includes(".data.")
      || path.includes(".fixtures[") && path.includes(".provenance.")
      || path.includes(".fixtures[") && path.includes(".media[")
      || path.endsWith(".rationale");
    if (!allowed && /[А-Яа-яЁё]/u.test(value)) results.push(path);
    return results;
  }
  if (Array.isArray(value)) value.forEach((item, index) => findBareLocalizedStrings(item, `${path}[${index}]`, results));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) findBareLocalizedStrings(item, `${path}.${key}`, results);
  return results;
}

function validateUXSpecification(specification, concept, contract, sourceStates) {
  const diagnostics = [];
  if (!specification || typeof specification !== "object") return [diagnostic(
    "ux.specification.required", "Canonical UX Specification must be an object", "ux",
  )];
  if (specification.schemaVersion !== UX_SPECIFICATION_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "ux.schema-version.unsupported", "UX Specification schemaVersion must be 1", "ux.schemaVersion",
  ));
  if (specification.productContractId !== contract?.contractId) diagnostics.push(diagnostic(
    "ux.product-contract.drift", "UX Specification does not point to the compiled Product Contract", "ux.productContractId",
  ));
  if (!new Set(["explicit-product-delivery", "legacy-migration"]).has(specification.source)) diagnostics.push(diagnostic(
    "ux.source.invalid", "UX Specification source must declare explicit delivery or legacy migration", "ux.source",
  ));
  const { uxSpecificationId, ...identityBody } = specification;
  const expectedId = stableProductArtifactId("ux", identityBody);
  if (uxSpecificationId !== expectedId) diagnostics.push(diagnostic(
    "ux.identity.unstable", `UX Specification id must be ${expectedId}`, "ux.uxSpecificationId",
  ));

  const navigation = specification.navigation || {};
  const nodes = asArray(navigation.nodes);
  const edges = asArray(navigation.edges);
  const screenIds = new Set();
  for (const [index, node] of nodes.entries()) {
    if (!node?.id || screenIds.has(node.id)) diagnostics.push(diagnostic(
      "ux.navigation.node-id-invalid", "Navigation node ids must be present and unique", `ux.navigation.nodes[${index}].id`,
    ));
    if (node?.id) screenIds.add(node.id);
  }
  if (!nodes.length) diagnostics.push(diagnostic(
    "ux.navigation.nodes-required", "UX navigation graph needs at least one node", "ux.navigation.nodes",
  ));
  const rootIds = new Set(asArray(navigation.roots));
  if (!rootIds.size) diagnostics.push(diagnostic(
    "ux.navigation.root-required", "UX navigation graph needs at least one root", "ux.navigation.roots",
  ));
  for (const root of rootIds) if (!screenIds.has(root)) diagnostics.push(diagnostic(
    "ux.navigation.root-missing", `Navigation root ${root} has no node`, "ux.navigation.roots",
  ));

  const edgeIds = new Set();
  for (const [index, edge] of edges.entries()) {
    const path = `ux.navigation.edges[${index}]`;
    if (!edge?.id || edgeIds.has(edge.id)) diagnostics.push(diagnostic(
      "ux.navigation.edge-id-invalid", "Navigation edge ids must be present and unique", `${path}.id`,
    ));
    if (edge?.id) edgeIds.add(edge.id);
    if (edge?.from !== null && !screenIds.has(edge?.from)) diagnostics.push(diagnostic(
      "ux.navigation.edge-source-missing", `Navigation edge ${edge?.id || index} starts at missing surface ${edge?.from}`, `${path}.from`,
    ));
    if (!screenIds.has(edge?.to)) diagnostics.push(diagnostic(
      "ux.navigation.edge-target-missing", `Navigation edge ${edge?.id || index} ends at missing surface ${edge?.to}`, `${path}.to`,
    ));
    if (typeof edge?.type !== "string" || !edge.type) diagnostics.push(diagnostic(
      "ux.navigation.edge-type-missing", "Navigation edge needs a semantic type", `${path}.type`,
    ));
  }
  const reachable = computedReachability(navigation, screenIds);
  const declaredReachable = new Set(asArray(navigation.reachable));
  for (const id of screenIds) {
    if (!reachable.has(id)) diagnostics.push(diagnostic(
      "ux.navigation.orphan-screen", `Surface ${id} is unreachable from launch or root navigation`, `ux.navigation.nodes.${id}`,
    ));
    if (declaredReachable.has(id) !== reachable.has(id)) diagnostics.push(diagnostic(
      "ux.navigation.reachability-drift", `Declared reachability for ${id} differs from roots and edges`, "ux.navigation.reachable",
    ));
  }
  for (const id of declaredReachable) if (!screenIds.has(id)) diagnostics.push(diagnostic(
    "ux.navigation.reachable-node-missing", `Reachability list references missing surface ${id}`, "ux.navigation.reachable",
  ));

  for (const node of nodes) {
    const path = `ux.navigation.nodes.${node?.id || "unknown"}`;
    if (!ALLOWED_PRESENTATIONS.has(node?.presentation)) diagnostics.push(diagnostic(
      "ux.navigation.presentation-invalid", `Surface ${node?.id} has invalid presentation ${node?.presentation}`, `${path}.presentation`,
    ));
    if (node?.parent && !screenIds.has(node.parent)) diagnostics.push(diagnostic(
      "ux.navigation.parent-missing", `Surface ${node.id} points to missing parent ${node.parent}`, `${path}.parent`,
    ));
    if (["push", "sheet", "cover"].includes(node?.presentation) && !node?.parent) diagnostics.push(diagnostic(
      "ux.navigation.parent-required", `${node.presentation} surface ${node.id} needs a parent`, `${path}.parent`,
    ));
    for (const field of ["entries", "exits", "guards"]) if (!Array.isArray(node?.[field])) diagnostics.push(diagnostic(
      "ux.navigation.semantics-incomplete", `Surface ${node?.id} must explicitly declare ${field}`, `${path}.${field}`,
    ));
    if (!asArray(node?.entries).length) diagnostics.push(diagnostic(
      "ux.navigation.entry-missing", `Surface ${node?.id} has no declared entry semantics`, `${path}.entries`,
    ));
    if (Boolean(node?.root) !== rootIds.has(node?.id)) diagnostics.push(diagnostic(
      "ux.navigation.root-drift", `Surface ${node?.id} root flag differs from navigation.roots`, `${path}.root`,
    ));
    if (!node?.back || typeof node.back.type !== "string" || !("destination" in node.back)) diagnostics.push(diagnostic(
      "ux.navigation.back-semantics-missing", `Surface ${node?.id} needs explicit back semantics`, `${path}.back`,
    ));
    if (["pop", "dismiss", "system-return"].includes(node?.back?.type) && !node.back.destination) diagnostics.push(diagnostic(
      "ux.navigation.back-destination-missing", `Surface ${node?.id} has no back/dismiss destination`, `${path}.back`,
    ));
    if (["sheet", "cover"].includes(node?.presentation) && (!node?.dismiss?.type || !node.dismiss.destination)) diagnostics.push(diagnostic(
      "ux.navigation.dismiss-semantics-missing", `${node.presentation} surface ${node.id} needs dismiss semantics`, `${path}.dismiss`,
    ));
    if (["push", "sheet", "cover"].includes(node?.presentation) && node?.parent && !edges.some(edge => edge.from === node.parent && edge.to === node.id)) diagnostics.push(diagnostic(
      "ux.navigation.transition-missing", `Surface ${node.id} has no transition from parent ${node.parent}`, path,
    ));
  }
  const deepLinkIds = new Set();
  for (const [index, link] of asArray(navigation.deepLinks).entries()) {
    const path = `ux.navigation.deepLinks[${index}]`;
    if (!link?.id || deepLinkIds.has(link.id) || !link?.pattern || !link?.guard) diagnostics.push(diagnostic(
      "ux.navigation.deep-link-invalid", "Deep link needs a unique id, pattern, target, and guard", path,
    ));
    deepLinkIds.add(link?.id);
    if (!screenIds.has(link?.target)) diagnostics.push(diagnostic(
      "ux.navigation.deep-link-target-missing", `Deep link ${link?.id} targets missing surface ${link?.target}`, path,
    ));
  }

  const actions = asArray(specification.actions);
  const actionIds = new Set();
  for (const [index, action] of actions.entries()) {
    const id = `${action?.surface}.${action?.id}`;
    const path = `ux.actions[${index}]`;
    if (!action?.id || !screenIds.has(action?.surface) || actionIds.has(id)) diagnostics.push(diagnostic(
      "ux.action.identity-invalid", "Action needs a unique id on an existing surface", path,
    ));
    actionIds.add(id);
    if (!action?.outcome?.type || !ALLOWED_OUTCOMES.has(action.outcome.type)) diagnostics.push(diagnostic(
      "ux.action.outcome-missing", `Action ${id} has no executable outcome`, `${path}.outcome`,
    ));
    const destinationRequirements = { navigate: "target", mutate: "state", request: "capability", external: "destination", system: "destination" };
    const required = destinationRequirements[action?.outcome?.type];
    if (required && !action.outcome?.[required]) diagnostics.push(diagnostic(
      "ux.action.destination-missing", `Action ${id} needs outcome.${required}`, `${path}.outcome.${required}`,
    ));
    if (action?.outcome?.type === "navigate" && action.outcome.target && !screenIds.has(action.outcome.target)) diagnostics.push(diagnostic(
      "ux.action.destination-missing", `Action ${id} targets missing surface ${action.outcome.target}`, `${path}.outcome.target`,
    ));
    if (action?.outcome?.type === "navigate" && action.outcome.target && !edges.some(edge => edge.from === action.surface && edge.to === action.outcome.target)) diagnostics.push(diagnostic(
      "ux.navigation.action-transition-missing", `Action ${id} has no matching navigation edge`, `${path}.outcome`,
    ));
    for (const field of ["labelKey", "execution", "persistence", "enabledWhen"]) if (typeof action?.[field] !== "string" || !action[field]) diagnostics.push(diagnostic(
      "ux.action.contract-incomplete", `Action ${id} needs ${field}`, `${path}.${field}`,
    ));
  }

  const screens = asArray(specification.screens);
  const screenIndex = new Map();
  const fixtureReferences = [];
  for (const [index, screen] of screens.entries()) {
    const path = `ux.screens[${index}]`;
    if (!screen?.id || screenIndex.has(screen.id) || !screenIds.has(screen?.id)) diagnostics.push(diagnostic(
      "ux.screen.identity-invalid", "UX screen ids must be unique and match navigation nodes", `${path}.id`,
    ));
    if (screen?.id) screenIndex.set(screen.id, screen);
    if (!asArray(screen?.componentRoles).length) diagnostics.push(diagnostic(
      "ux.design.component-role-required", `Surface ${screen?.id} has no semantic component role`, `${path}.componentRoles`,
    ));
    const states = new Map();
    for (const [stateIndex, state] of asArray(screen?.states).entries()) {
      const statePath = `${path}.states[${stateIndex}]`;
      if (!CANONICAL_UX_STATES.includes(state?.id) || states.has(state?.id)) diagnostics.push(diagnostic(
        "ux.state.identity-invalid", `Surface ${screen?.id} has an unknown or duplicate canonical state`, `${statePath}.id`,
      ));
      states.set(state?.id, state);
      if (state?.applicable === true) {
        if (!state.content?.titleKey || !state.content?.bodyKey || !Array.isArray(state.content?.fixtureIds)
          || !state.content.fixtureIds.length || !Array.isArray(state.availableActions)
          || !Array.isArray(state.transitions) || !state.recovery?.guidanceKey || !Array.isArray(state.recovery?.actionIds)) {
          diagnostics.push(diagnostic(
            "ux.state.handling-incomplete", `Applicable state ${screen?.id}.${state?.id} lacks content, actions, transitions, recovery, or fixtures`, statePath,
          ));
        }
        for (const fixtureId of asArray(state.content?.fixtureIds)) fixtureReferences.push([fixtureId, `${statePath}.content.fixtureIds`]);
        for (const transition of asArray(state.transitions)) {
          if (!actionIds.has(`${screen?.id}.${transition?.action}`) || !transition?.outcome?.type) diagnostics.push(diagnostic(
            "ux.state.transition-invalid", `State ${screen?.id}.${state?.id} references an invalid action transition`, `${statePath}.transitions`,
          ));
        }
      } else if (state?.applicable === false) {
        if (typeof state.rationale !== "string" || state.rationale.trim().length < 8) diagnostics.push(diagnostic(
          "ux.state.not-applicable-unjustified", `Non-applicable state ${screen?.id}.${state?.id} needs a rationale`, statePath,
        ));
      } else diagnostics.push(diagnostic(
        "ux.state.applicability-required", `State ${screen?.id}.${state?.id} must explicitly declare applicability`, `${statePath}.applicable`,
      ));
    }
    for (const state of CANONICAL_UX_STATES) if (!states.has(state)) diagnostics.push(diagnostic(
      "ux.state.required-missing", `Surface ${screen?.id} does not declare ${state}`, `${path}.states`,
    ));
    for (const action of actions.filter(item => item.surface === screen?.id)) {
      const transitioned = [...states.values()].some(state => state?.applicable && asArray(state.transitions).some(item => item.action === action.id));
      if (!transitioned) diagnostics.push(diagnostic(
        "ux.action.transition-missing", `Action ${screen.id}.${action.id} is not available as a state transition`, `${path}.states`,
      ));
    }
    const variantIds = new Set();
    for (const [variantIndex, variant] of asArray(screen?.variants).entries()) {
      if (!variant?.id || variantIds.has(variant.id) || !CANONICAL_UX_STATES.includes(variant?.canonicalState) || !variant?.fixtureId) diagnostics.push(diagnostic(
        "ux.screen.variant-invalid", `Surface ${screen?.id} variant needs a unique id, canonical state, and fixture`, `${path}.variants[${variantIndex}]`,
      ));
      variantIds.add(variant?.id);
      if (variant?.fixtureId) fixtureReferences.push([variant.fixtureId, `${path}.variants[${variantIndex}].fixtureId`]);
    }
  }
  for (const id of screenIds) if (!screenIndex.has(id)) diagnostics.push(diagnostic(
    "ux.screen.missing", `Navigation surface ${id} has no screen/state specification`, `ux.screens.${id}`,
  ));

  const catalogItems = asArray(specification.localization?.catalog);
  const catalog = new Set();
  for (const [index, item] of catalogItems.entries()) {
    const path = `ux.localization.catalog[${index}]`;
    if (!item?.key || catalog.has(item.key)) diagnostics.push(diagnostic(
      "ux.localization.key-invalid", "Localization keys must be present and unique", `${path}.key`,
    ));
    if (item?.key) catalog.add(item.key);
    if (typeof item?.source !== "string" || !item.source.trim() || item?.locale !== "ru"
      || !Array.isArray(item?.placeholders) || !(item?.pluralization === null || typeof item?.pluralization === "object")
      || typeof item?.context !== "string" || !item.context || !Array.isArray(item?.screens)
      || typeof item?.usage !== "string" || !item.usage) diagnostics.push(diagnostic(
      "ux.localization.entry-incomplete", `Localization entry ${item?.key || index} lacks Russian source or usage metadata`, path,
    ));
    for (const screen of asArray(item?.screens)) if (!screenIds.has(screen)) diagnostics.push(diagnostic(
      "ux.localization.screen-missing", `Localization entry ${item?.key} references missing surface ${screen}`, `${path}.screens`,
    ));
  }
  const requiredKeys = [];
  function collectKeys(value, path = "ux") {
    if (Array.isArray(value)) return value.forEach((item, index) => collectKeys(item, `${path}[${index}]`));
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (key.endsWith("Key") && typeof item === "string") requiredKeys.push([item, `${path}.${key}`]);
      else collectKeys(item, `${path}.${key}`);
    }
  }
  collectKeys(specification);
  for (const [key, path] of requiredKeys) if (!catalog.has(key)) diagnostics.push(diagnostic(
    "ux.localization.key-missing", `Localization key ${key} is not in the catalog`, path,
  ));
  for (const path of findBareLocalizedStrings(specification)) diagnostics.push(diagnostic(
    "ux.localization.bare-string", "User-facing Russian string exists outside the localization catalog or fixture data", path,
  ));

  const fixtures = asArray(specification.fixtures);
  const fixtureIds = new Set();
  const deterministicIds = new Set();
  for (const [index, fixture] of fixtures.entries()) {
    const path = `ux.fixtures[${index}]`;
    if (!fixture?.id || fixtureIds.has(fixture.id) || !screenIds.has(fixture?.surface) || typeof fixture?.state !== "string") diagnostics.push(diagnostic(
      "ux.fixture.identity-invalid", "Fixture needs a unique id, existing surface, and state", path,
    ));
    if (fixture?.id) fixtureIds.add(fixture.id);
    if (asArray(fixture?.deterministicIds).length < 2 || asArray(fixture?.edgeCases).length < 2
      || !fixture?.data || typeof fixture.data !== "object" || Object.keys(fixture.data).length < 3
      || !fixture?.provenance?.kind || !fixture.provenance?.source || !fixture.provenance?.note
      || !Array.isArray(fixture?.media)) diagnostics.push(diagnostic(
      "ux.fixture.contract-incomplete", `Fixture ${fixture?.id || index} lacks deterministic data, edge cases, provenance, or media declaration`, path,
    ));
    for (const id of asArray(fixture?.deterministicIds)) {
      if (!id || deterministicIds.has(id)) diagnostics.push(diagnostic(
        "ux.fixture.deterministic-id-invalid", `Fixture ${fixture?.id || index} has a missing or duplicate deterministic data id`, `${path}.deterministicIds`,
      ));
      deterministicIds.add(id);
    }
    for (const [mediaIndex, media] of asArray(fixture?.media).entries()) if (!media?.role || !media?.assetId || !media?.provenance || !media?.license) diagnostics.push(diagnostic(
      "ux.fixture.media-provenance-missing", `Fixture ${fixture?.id} media lacks role, asset id, provenance, or license`, `${path}.media[${mediaIndex}]`,
    ));
  }
  for (const [fixtureId, path] of fixtureReferences) if (!fixtureIds.has(fixtureId)) diagnostics.push(diagnostic(
    "ux.fixture.reference-missing", `State references missing fixture ${fixtureId}`, path,
  ));
  for (const [surface, states] of sourceStates instanceof Map ? sourceStates : new Map()) for (const state of asArray(states)) {
    const id = `fixture.${concept?.slug}.${surface}.${slugKey(state)}`;
    if (!fixtureIds.has(id)) diagnostics.push(diagnostic(
      "ux.fixture.captured-state-missing", `Captured/tested state ${surface}--${state} has no deterministic fixture`, `ux.fixtures.${id}`,
    ));
  }

  const scenarios = asArray(specification.acceptanceScenarios);
  const coverage = new Map();
  for (const scenario of scenarios) {
    const kinds = coverage.get(scenario?.flowId) || new Set();
    kinds.add(scenario?.coverage);
    coverage.set(scenario?.flowId, kinds);
  }
  for (const flow of asArray(contract?.delivery?.criticalFlows)) {
    const found = coverage.get(flow.id) || new Set();
    for (const kind of ["happy-path", "failure-recovery", "offline", "persistence-return"]) if (!found.has(kind)) diagnostics.push(diagnostic(
      "ux.acceptance.critical-flow-uncovered", `Critical flow ${flow.id} lacks ${kind}`, `ux.acceptanceScenarios.${flow.id}`,
    ));
  }
  for (const permission of asArray(contract?.permissions)) if (!(coverage.get(`permission:${permission.key}`) || new Set()).has("permission-denial-fallback")) diagnostics.push(diagnostic(
    "ux.acceptance.permission-uncovered", `Permission ${permission.key} lacks denial/fallback acceptance coverage`, `ux.acceptanceScenarios.permission:${permission.key}`,
  ));
  diagnostics.push(...validateScenarioReferences(scenarios, nodes, actions, fixtures));

  const design = specification.design || {};
  if (!design.tokens || typeof design.tokens !== "object" || !Object.keys(design.tokens).length) diagnostics.push(diagnostic(
    "ux.design.tokens-required", "UX Specification must expose semantic tokens consumed by SwiftUI", "ux.design.tokens",
  ));
  if (!asArray(design.semanticComponentRoles).length || !design.swiftUIConsumption?.environment || !design.swiftUIConsumption?.rule) diagnostics.push(diagnostic(
    "ux.design.consumption-incomplete", "UX design semantics need component roles and a SwiftUI consumption seam", "ux.design",
  ));

  if (contract?.status === "mature" && concept?.ux?.schemaVersion !== UX_SPECIFICATION_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "ux.explicit-source.required",
    "A newly selected Product Contract requires an explicit concept.ux source; legacy derivation is restricted to Looks and Dvor",
    "ux.schemaVersion",
  ));
  if (contract?.status === "mature" && concept?.ux?.schemaVersion === UX_SPECIFICATION_SCHEMA_VERSION) {
    for (const key of ["navigation", "screens", "design", "localization", "acceptanceScenarios", "fixtures"]) {
      const value = concept.ux[key];
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) diagnostics.push(diagnostic(
        "ux.explicit-source.section-required", `Explicit UX source must provide ${key}`, `ux.${key}`,
      ));
    }
    if (!Array.isArray(concept.ux.navigation?.nodes) || !Array.isArray(concept.ux.navigation?.edges)) diagnostics.push(diagnostic(
      "ux.explicit-source.navigation-incomplete", "Explicit UX navigation needs nodes and edges", "ux.navigation",
    ));
    if (!Array.isArray(concept.ux.localization?.catalog)) diagnostics.push(diagnostic(
      "ux.explicit-source.localization-incomplete", "Explicit UX localization needs a complete catalog", "ux.localization.catalog",
    ));
    const explicitScreens = new Set(asArray(concept.ux.screens).map(item => item?.id));
    for (const node of nodes) if (!explicitScreens.has(node?.id)) diagnostics.push(diagnostic(
      "ux.explicit-source.screen-required", `Explicit UX source does not define surface ${node?.id}`, `ux.screens.${node?.id}`,
    ));
  }
  if (contract?.status === "migration-baseline" && !LEGACY_MIGRATION_SLUGS.has(concept?.slug)) diagnostics.push(diagnostic(
    "ux.legacy-migration.forbidden", "UX migration is restricted to Looks and Dvor", "ux",
  ));
  return diagnostics;
}

export function auditUXSpecification(specification, concept, productContract) {
  const sourceStates = new Map(asArray(specification?.screens).map(screen => [
    screen?.id,
    asArray(screen?.variants).map(variant => variant?.id).filter(Boolean),
  ]));
  return validateUXSpecification(specification, concept, productContract, sourceStates);
}

export function compileUXSpecification(concept, productContract, options = {}) {
  concept ||= {};
  const diagnostics = [];
  const contract = productContract || {};
  if (!productContract) diagnostics.push(diagnostic(
    "ux.product-contract.required", "Product Contract is required before UX compilation", "ux.productContractId",
  ));
  const surfaces = options.surfaces || asArray(concept.screens).map(screen => ({
    id: screen.id,
    title: screen.title,
    purpose: screen.ui?.purpose || screen.native?.purpose,
    presentation: screen.native?.presentation || "unknown",
    parent: screen.parent || null,
    states: screen.ui?.states || screen.native?.states || ["default"],
  }));
  const permissions = options.permissions || asArray(concept.permissions);
  const actions = options.actions || asArray(concept.screens).flatMap(screen => asArray(screen.ui?.actions).map(action => ({ ...action, surface: screen.id })));
  const screenSource = asArray(concept.screens).map(screen => ({
    ...screen,
    _presentation: presentationFor(screen, surfaces),
  }));
  const navigation = buildNavigation(concept, screenSource, actions, permissions);
  const catalog = new Map();
  const sourceStates = new Map();

  const compiledActions = actions.map(action => ({
    surface: action.surface,
    id: action.id,
    labelKey: addString(catalog, `screen.${slugKey(action.surface)}.action.${slugKey(action.id)}.label`, action.label, "Action label", [action.surface], "control"),
    outcome: action.outcome,
    execution: action.execution || "sync",
    persistence: action.persistence || "none",
    enabledWhen: action.enabledWhen || "always",
  }));
  for (const tab of concept.native?.navigation?.tabs || concept.tabs || []) addString(
    catalog, `navigation.tab.${slugKey(tab.id)}.label`, tab.label, "Root tab label", [tab.screen || tab.id], "navigation",
  );
  for (const permission of permissions) {
    addString(catalog, `permission.${slugKey(permission.key)}.title`, permission.alert?.title || permission.feature, "System permission pre-prompt title", [permission.screen, permission.target], "permission");
    addString(catalog, `permission.${slugKey(permission.key)}.body`, permission.alert?.text || permission.feature, "System permission explanation", [permission.screen, permission.target], "permission");
    addString(catalog, `permission.${slugKey(permission.key)}.fallback`, permission.fallback, "Denied fallback", [permission.target], "recovery");
  }

  const fixtures = [];
  const screens = screenSource.map(screen => {
    const titleKey = addString(catalog, `screen.${slugKey(screen.id)}.title`, screen.title, "Surface title", [screen.id], "navigation-title");
    const purposeKey = addString(catalog, `screen.${slugKey(screen.id)}.purpose`, screen.ui?.purpose || screen.native?.purpose || screen.title, "Product task", [screen.id], "accessibility-and-docs");
    const declared = screen.ui?.states || screen.native?.states || ["default"];
    sourceStates.set(screen.id, declared);
    const variants = declared.map(state => {
      const fixture = fixtureFor(concept, screen, state);
      fixtures.push(fixture);
      return { id: state, canonicalState: canonicalStateFor(state), fixtureId: fixture.id };
    });
    const screenActions = compiledActions.filter(item => item.surface === screen.id);
    const screenPermissions = permissions.filter(item => item.screen === screen.id || item.target === screen.id);
    const states = CANONICAL_UX_STATES.map(state => {
      const applies = applicability(screen, state, permissions, screenActions);
      if (!applies.applicable) return { id: state, applicable: false, rationale: applies.rationale };
      const stateKey = slugKey(state);
      const bodyKey = addString(catalog, `screen.${slugKey(screen.id)}.state.${stateKey}.body`, russianStateCopy(concept.slug, screen.title, state), `State copy: ${state}`, [screen.id], "state-body");
      const recoveryKey = addString(catalog, `screen.${slugKey(screen.id)}.state.${stateKey}.recovery`, state === "populated/default" ? "Продолжить основное действие." : "Повторить действие или выбрать доступный запасной путь.", `Recovery copy: ${state}`, [screen.id], "recovery");
      const permissionFallbacks = state.startsWith("permission-") ? screenPermissions.map(item => `permission.${item.key}.fallback`) : [];
      let fixtureIds = variants.filter(item => item.canonicalState === state).map(item => item.fixtureId);
      if (!fixtureIds.length) {
        const fixture = fixtureFor(concept, screen, state);
        fixtures.push(fixture);
        fixtureIds = [fixture.id];
      }
      return {
        id: state,
        applicable: true,
        rationale: applies.rationale,
        content: {
          titleKey,
          bodyKey,
          fixtureIds,
        },
        availableActions: [...screenActions.map(item => item.id), ...permissionFallbacks],
        transitions: screenActions.map(item => ({ action: item.id, outcome: item.outcome })),
        recovery: { guidanceKey: recoveryKey, actionIds: [...screenActions.filter(item => item.outcome?.type !== "dismiss").map(item => item.id), ...permissionFallbacks] },
      };
    });
    return {
      id: screen.id,
      titleKey,
      purposeKey,
      componentRoles: asArray(screen.ui?.componentFamilies).length ? screen.ui.componentFamilies : [screen.ui?.pattern || screen.native?.role || "system-surface"],
      states,
      variants,
    };
  });

  const acceptanceScenarios = generatedScenarios(contract, screenSource, actions, permissions, fixtures, catalog);
  const explicit = concept.ux?.schemaVersion === UX_SPECIFICATION_SCHEMA_VERSION ? concept.ux : null;
  const generatedNavigation = {
    roots: navigation.roots,
    nodes: navigation.nodes,
    edges: navigation.edges,
    deepLinks: navigation.deepLinks,
    reachable: [...navigation.reachable].sort(),
  };
  const generatedDesign = {
    strategy: concept.native?.design?.strategy || contract.reference?.strategy,
    referenceProfile: concept.native?.design?.referenceProfile || contract.reference?.profileId || null,
    tokens: options.design?.tokens || concept.native?.design?.tokens || {},
    semanticComponentRoles: [...new Set(screens.flatMap(screen => screen.componentRoles))].sort(),
    swiftUIConsumption: {
      environment: "NativeVisualLanguage",
      rule: "SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.",
    },
  };
  const base = {
    schemaVersion: UX_SPECIFICATION_SCHEMA_VERSION,
    productContractId: contract.contractId || "missing-product-contract",
    source: contract.status === "migration-baseline" ? "legacy-migration" : "explicit-product-delivery",
    navigation: Array.isArray(explicit?.navigation?.nodes) ? explicit.navigation : generatedNavigation,
    screens: asArray(explicit?.screens).length ? explicit.screens : screens,
    actions: compiledActions,
    design: explicit?.design?.tokens ? explicit.design : generatedDesign,
    localization: Array.isArray(explicit?.localization?.catalog) ? explicit.localization : {
      defaultLocale: "ru",
      catalog: [...catalog.values()].sort((left, right) => left.key.localeCompare(right.key)),
    },
    acceptanceScenarios: asArray(explicit?.acceptanceScenarios).length ? explicit.acceptanceScenarios : acceptanceScenarios,
    fixtures: asArray(explicit?.fixtures).length ? explicit.fixtures : fixtures,
    migrationLimitations: contract.status === "migration-baseline" ? [
      "State semantics are derived from the existing concept and action contracts; future redesign requires an explicit concept.ux source.",
      "Fixture content is deterministic representative migration data, not research or production data.",
      "Legacy media license text records the current boundary and still requires separate redistribution evidence intake.",
    ] : [],
  };
  const specification = Object.freeze({ uxSpecificationId: stableProductArtifactId("ux", base), ...base });
  diagnostics.push(...validateUXSpecification(specification, concept, contract, sourceStates));
  return { ok: diagnostics.every(item => item.severity !== "error"), diagnostics, specification };
}
