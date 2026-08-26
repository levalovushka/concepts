import { createHash } from "node:crypto";
import { compileCapabilityPlanV2 } from "./capability-plan-v2.mjs";
import { materializeNativeFullV2, executeNativeSliceV2 } from "./native-kernel-adapter-v2.mjs";
import { verifyNativeFullContractV2 } from "./native-full-contract-v2.mjs";
import { verifyNativeSliceContract } from "./native-slice-contract.mjs";
import { validateProductCoreV2 } from "./product-core-v2.mjs";
import { resolveProductTarget } from "./product-target-catalog.mjs";
import { auditNativeProductQualityV2, createNativeVisualReviewPacketV2, verifyNativeVisualReviewV2 } from "./native-visual-review-v2.mjs";

const CAPABILITY_FEATURES = Object.freeze({
  camera: ["Снять продолжение", "chapter", "create"],
  photos: ["Выбрать из медиатеки", "chapter", "create"],
  mic: ["Записать голос", "chapter", "create"],
  speech: ["Расшифровать голос", "chapter", "create"],
  audio: ["Слушать продолжения", "chapter", "create"],
  location: ["Добавить место", "chapter", "discover"],
  wifiinfo: ["Проверить общую сеть", "relay", "discover"],
  hotspot: ["Подключиться к встрече", "relay", "discover"],
  tracking: ["Настроить рекомендации", "person", "discover"],
  associateddomains: ["Открывать ссылки на эстафеты", "relay", "discover"],
  push: ["Следить за эстафетой", "relay", "messages"],
  commnotif: ["Включить важные ответы", "handoff", "messages"],
  remotenotif: ["Обновлять цепочки", "relay", "messages"],
  voip: ["Позвонить участнику", "person", "messages"],
  contacts: ["Выбрать знакомого", "person", "messages"],
  fetch: ["Обновлять ленту", "relay", "services"],
  bgtask: ["Готовить подборку", "relay", "services"],
  appgroups: ["Поделиться черновиком", "chapter", "services"],
  keychain: ["Сохранить защищённую сессию", "person", "services"],
  autofill: ["Добавить быстрый вход", "person", "services"],
  faceid: ["Защитить черновики", "chapter", "services"],
  calendar: ["Запланировать ход", "handoff", "services"],
});

const SYSTEM_SURFACES = Object.freeze([
  Object.freeze({
    id: "settings", role: "support", title: "Настройки", recipe: "settings", capabilityRole: "services",
    states: ["populated/default"], actionIds: [],
    content: Object.freeze({ headline: "Настройки приложения", body: "Управление приватностью, уведомлениями и безопасностью без повторного запроса при запуске." }),
  }),
]);

const SYSTEM_NAVIGATION_ACTIONS = Object.freeze([
  Object.freeze({
    id: "open_settings", label: "Настройки приложения", entityId: "person",
    outcome: "Открываются настройки приватности, уведомлений и безопасности",
    effect: Object.freeze({ type: "update", stateField: "profileDestination", value: "settings" }),
  }),
]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function capabilityAction(key, definition) {
  const [label, entityId] = definition;
  return Object.freeze({
    id: `capability_${key}`,
    label,
    entityId,
    outcome: `${label}: результат сохранён в текущей эстафете и остаётся видимым пользователю`,
    effect: Object.freeze({ type: "system", stateField: `capability_${key}`, value: "completed" }),
  });
}

function compileAllCapabilities({ core, target, spec }) {
  const actions = [...core.world.actions];
  const actionIds = new Set(actions.map(item => item.id));
  const surfaceActions = new Map(spec.surfaces.map(surface => [surface.id, [...surface.actionIds]]));
  const surfaceByCapabilityRole = new Map(spec.surfaces
    .filter(surface => surface.capabilityRole)
    .map(surface => [surface.capabilityRole, surface.id]));
  const overrides = spec.capabilityOverrides || {};
  const bindings = [];

  for (const permission of target.permissions) {
    const feature = CAPABILITY_FEATURES[permission.key];
    if (!feature) throw new Error(`Simple Native V2 has no feature recipe for ${permission.key}`);
    const override = overrides[permission.key] || {};
    const actionId = override.actionId || `capability_${permission.key}`;
    const action = actions.find(item => item.id === actionId) || capabilityAction(permission.key, feature);
    if (!actionIds.has(action.id)) {
      actions.push(action);
      actionIds.add(action.id);
      const owner = override.surfaceId || surfaceByCapabilityRole.get(feature[2]);
      if (!surfaceActions.has(owner)) throw new Error(`Capability ${permission.key} has no ${feature[2]} surface`);
      surfaceActions.get(owner).push(action.id);
    }
    bindings.push({
      key: permission.key,
      actionId,
      strengthensActionId: override.strengthensActionId || core.proof.steps.at(-1).actionId,
      purpose: override.purpose || `${action.label} внутри основного социального сценария приложения`,
      requestMoment: override.requestMoment || `После явного действия «${action.label}» на соответствующей поверхности`,
      platformEffect: override.platformEffect || `Выполнить системную операцию ${permission.key} через проверенный iOS runtime adapter`,
      fallback: override.fallback || "Сохранить текущий продуктовый контекст и предложить повторить действие позже",
      testScenario: override.testScenario || `Проверить успешную и отклонённую ветки ${permission.key} через общий runtime seam`,
      outcome: {
        entityId: override.entityId || action.entityId,
        stateField: override.stateField || `capability_${permission.key}`,
        proof: override.proof || `${action.label}: на поверхности появляется подтверждённый продуктовый результат`,
      },
    });
  }
  return { actions, surfaceActions, proposal: { policy: "required", bindings, exclusions: [] } };
}

function compileContracts(spec) {
  const target = resolveProductTarget(spec.targetProduct);
  if (!target) throw new Error(`Unknown product target ${spec.targetProduct}`);
  if (spec.capabilities !== "all") throw new Error("Simple Native V2 currently requires capabilities: all");
  const core = structuredClone(spec.product);
  core.world.actions.push(...structuredClone(SYSTEM_NAVIGATION_ACTIONS));
  const sourceSurfaces = [...structuredClone(spec.surfaces), ...structuredClone(SYSTEM_SURFACES)];
  const profile = sourceSurfaces.find(surface => surface.recipe === "ownedProfile");
  if (!profile) throw new Error("Simple Native V2 needs one ownedProfile surface");
  profile.actionIds.push("open_settings");
  const expanded = compileAllCapabilities({ core, target, spec: { ...spec, surfaces: sourceSurfaces } });
  core.world.actions = expanded.actions;
  const coreProblems = validateProductCoreV2(core);
  if (coreProblems.length) return { diagnostics: coreProblems };
  const productCore = Object.freeze({
    schemaVersion: 2,
    selectedCandidateId: core.id,
    selectedBy: "direct-concept-spec",
    core: Object.freeze(core),
    artifactId: `product-core-${createHash("sha256").update(JSON.stringify(core)).digest("hex").slice(0, 16)}`,
  });
  const capability = compileCapabilityPlanV2({
    productCoreArtifact: productCore,
    target,
    proposal: expanded.proposal,
    bundleId: `com.camo.${core.id.replace(/[^a-z0-9]/g, "")}`,
  });
  if (!capability.ok) return { diagnostics: capability.diagnostics };

  const surfaces = sourceSurfaces.map(surface => ({
    id: surface.id, role: surface.role, title: surface.title, recipe: surface.recipe,
    states: [...surface.states], actionIds: expanded.surfaceActions.get(surface.id) || [...surface.actionIds],
    content: structuredClone(surface.content),
  }));
  const surfaceById = new Map(surfaces.map(item => [item.id, item]));
  const transitions = [
    ...spec.transitions.map(item => ({ ...item })),
    { from: profile.id, to: "settings", actionId: "open_settings" },
  ];
  const sliceContract = {
    surfaces: spec.sliceSurfaceIds.map(id => structuredClone(surfaceById.get(id))),
    transitions: transitions.filter(item => spec.sliceSurfaceIds.includes(item.from) && spec.sliceSurfaceIds.includes(item.to)),
    acceptanceJourney: { id: "product-proof", actionIds: core.proof.steps.map(item => item.actionId) },
  };
  const journeys = [{ id: "product-proof", actionIds: core.proof.steps.map(item => item.actionId) }];
  const covered = new Set(journeys.flatMap(item => item.actionIds));
  for (const actionId of core.coreLoop.actionIds) if (!covered.has(actionId)) {
    journeys.push({ id: `core-${actionId}`, actionIds: [actionId] });
    covered.add(actionId);
  }
  for (const binding of capability.plan.bindings) if (!covered.has(binding.actionId)) {
    journeys.push({ id: `capability-${binding.key}`, actionIds: [binding.actionId] });
    covered.add(binding.actionId);
  }
  for (const transition of transitions) if (!covered.has(transition.actionId)) {
    journeys.push({ id: `navigation-${transition.actionId}`, actionIds: [transition.actionId] });
    covered.add(transition.actionId);
  }
  const fullContract = {
    schemaVersion: 2,
    surfaces,
    rootTabs: spec.rootTabs.map(item => ({ ...item })),
    transitions,
    acceptanceJourneys: journeys,
    verification: { captures: surfaces.flatMap(surface => surface.states.map(state => ({ id: `${surface.id}--${state}` }))) },
  };
  const problems = [
    ...verifyNativeSliceContract(sliceContract, productCore),
    ...verifyNativeFullContractV2(fullContract, { productCoreArtifact: productCore, capabilityPlan: capability.plan, acceptedSlice: sliceContract }),
  ];
  return problems.length ? { diagnostics: problems } : {
    diagnostics: [], target, productCore, capabilityPlan: capability.plan, sliceContract, fullContract,
  };
}

export function verifySimpleNativeConceptV2(spec) {
  const diagnostics = [];
  if (spec?.schemaVersion !== 1) diagnostics.push(diagnostic("simple.schema", "ConceptSpec schemaVersion must be 1", "schemaVersion"));
  if (!spec?.id || spec.id !== spec?.product?.id) diagnostics.push(diagnostic("simple.id", "ConceptSpec and product ids must match", "id"));
  if (!Array.isArray(spec?.surfaces) || spec.surfaces.length < 7) diagnostics.push(diagnostic("simple.surfaces", "ConceptSpec needs three proof surfaces and four full-product surfaces", "surfaces"));
  if (!Array.isArray(spec?.rootTabs) || spec.rootTabs.length !== 5) diagnostics.push(diagnostic("simple.tabs", "ConceptSpec needs exactly five root tabs", "rootTabs"));
  if (!Array.isArray(spec?.sliceSurfaceIds) || spec.sliceSurfaceIds.length !== 3) diagnostics.push(diagnostic("simple.slice", "ConceptSpec needs three slice surface ids", "sliceSurfaceIds"));
  if (diagnostics.length) return Object.freeze(diagnostics);
  try { return Object.freeze(compileContracts(spec).diagnostics); } catch (error) {
    return Object.freeze([diagnostic("simple.compile", error.message, "conceptSpec")]);
  }
}

export function generateNativeConceptV2({ projectRoot, spec, execute = true, simulator, visualReview = null }) {
  const compiled = compileContracts(spec);
  if (compiled.diagnostics.length) return Object.freeze({ ok: false, diagnostics: Object.freeze(compiled.diagnostics) });
  const qualityDiagnostics = auditNativeProductQualityV2({ spec, fullContract: compiled.fullContract, capabilityPlan: compiled.capabilityPlan });
  if (qualityDiagnostics.length) return Object.freeze({ ok: false, diagnostics: qualityDiagnostics });
  const materialized = materializeNativeFullV2({
    projectRoot,
    productCore: compiled.productCore,
    capabilityPlan: compiled.capabilityPlan,
    fullContract: compiled.fullContract,
    targetProduct: spec.targetProduct,
    strategy: spec.strategy,
  });
  const delivery = execute ? executeNativeSliceV2({ projectRoot, materialized, simulator }) : null;
  const visualReviewPacket = delivery ? createNativeVisualReviewPacketV2({
    spec, fullContract: compiled.fullContract, capabilityPlan: compiled.capabilityPlan, delivery,
  }) : null;
  const visualReviewResult = visualReviewPacket && visualReview
    ? verifyNativeVisualReviewV2({ packet: visualReviewPacket, review: visualReview }) : null;
  return Object.freeze({
    ok: visualReviewResult ? visualReviewResult.passed : true,
    diagnostics: visualReviewResult?.diagnostics || Object.freeze([]),
    spec: structuredClone(spec),
    productCore: compiled.productCore,
    capabilityPlan: compiled.capabilityPlan,
    sliceContract: compiled.sliceContract,
    fullContract: compiled.fullContract,
    materialized,
    delivery,
    visualReviewPacket,
    visualReviewResult,
  });
}

export { CAPABILITY_FEATURES as SIMPLE_NATIVE_CAPABILITY_FEATURES };
