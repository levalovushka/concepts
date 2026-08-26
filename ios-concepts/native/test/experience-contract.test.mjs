import test from "node:test";
import assert from "node:assert/strict";
import { createFactoryDevelopmentArtifact, developProductFactory } from "../lib/product-factory.mjs";
import { developExperienceContract, verifyExperienceContract } from "../lib/experience-contract.mjs";
import { createStructuredModelExperiencePlanner, experiencePlannerModelSchema } from "../lib/structured-model-experience-planner.mjs";
import { toStrictOutputSchema } from "../lib/codex-cli-structured-model.mjs";
import { productFactoryEvaluator, productFactoryGenerator } from "../fixtures/product-factory/fixture-adapter.mjs";

const stateIds = [
  "loading", "populated/default", "empty", "error", "offline",
  "permission-needed", "permission-denied", "permission-restricted", "permission-limited",
];

async function factoryArtifact() {
  const request = {
    schemaVersion: 1,
    request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
    targetProduct: "vk-music",
    strategy: "differentiation",
  };
  const result = await developProductFactory({ request, generator: productFactoryGenerator, evaluator: productFactoryEvaluator });
  return createFactoryDevelopmentArtifact({ request, result });
}

function states(screenId, defaultAction) {
  return {
    screenId,
    variants: stateIds.map(id => ({
      id,
      applicable: true,
      productMeaning: `${id} имеет наблюдаемый смысл для экрана ${screenId}`,
      availableActions: id === "populated/default" && defaultAction ? [defaultAction] : [],
      recoveryActionId: ["error", "offline"].includes(id) ? defaultAction : null,
    })),
  };
}

function integrityFields(model, actionIds) {
  const coreAction = actionIds[model.coreActions[0]];
  const supportingAction = actionIds[model.actions.find(item => item.id !== "authenticate" && item.id !== model.coreActions[0])?.id || model.coreActions[0]];
  return {
    content: {
      records: [
        { id: "resident-main", entityId: "resident", displayName: "Анна", facts: [{ key: "role", value: "Житель" }], mediaIds: [] },
        { id: "request-main", entityId: "request", displayName: "Задача дома", facts: [{ key: "status", value: "Открыта" }], mediaIds: ["request-photo"] },
        { id: "media-main", entityId: "media", displayName: "Фото задачи", facts: [{ key: "status", value: "Локально" }], mediaIds: [] },
      ],
      media: [{ id: "request-photo", ownerRecordId: "request-main", role: "evidence", semanticDescription: "Фотография конкретной открытой задачи дома" }],
      screenBindings: [
        { screenId: "auth", recordIds: ["resident-main"], mediaIds: [] },
        { screenId: "home", recordIds: ["request-main"], mediaIds: ["request-photo"] },
        { screenId: "detail", recordIds: ["request-main", "media-main"], mediaIds: ["request-photo"] },
      ],
    },
    entryPoints: [],
    screenBlueprints: [
      { screenId: "auth", primaryRecordId: "resident-main", contentOrder: ["identity", "credentials"], primaryActionId: actionIds.authenticate, secondaryActionIds: [], prohibitedPatterns: ["No undeclared identity provider"] },
      { screenId: "home", primaryRecordId: "request-main", contentOrder: ["context", "request-feed"], primaryActionId: "open-detail", secondaryActionIds: [], prohibitedPatterns: ["No detached generic call to action"] },
      { screenId: "detail", primaryRecordId: "request-main", contentOrder: ["request-context", "evidence", "actions"], primaryActionId: coreAction, secondaryActionIds: [supportingAction], prohibitedPatterns: ["No action without visible result"] },
    ],
    journeys: [
      { id: "complete", title: "Войти и выполнить задачу", startScreenId: "auth", actionIds: [actionIds.authenticate, "open-detail", coreAction], observableResult: "Результат основного действия виден на экране", failureRecovery: "Ошибка оставляет данные и предлагает явный повтор" },
      { id: "support", title: "Открыть и уточнить задачу", startScreenId: "home", actionIds: ["open-detail", supportingAction], observableResult: "Выбранная задача показывает новое сохранённое состояние", failureRecovery: "Сохранённая задача остаётся доступна без сети" },
      {
        id: "repeat", title: "Повторить основное действие", startScreenId: "detail",
        actionIds: [...new Set([
          coreAction,
          ...model.capabilityBindings.flatMap(binding => [actionIds[binding.action], `fallback-${binding.key}`]),
        ])],
        observableResult: "Повторное действие даёт наблюдаемый результат", failureRecovery: "Неуспешное действие доступно для повторной попытки",
      },
    ],
  };
}

function planFor(artifact) {
  const model = artifact.worldModels.find(item => item.id === artifact.selectedWorldModelId);
  const actionIds = Object.fromEntries(model.actions.map(action => [action.id, `perform-${action.id}`]));
  const actions = model.actions.map(action => ({
    id: actionIds[action.id],
    worldActionId: action.id,
    surface: action.id === "authenticate" ? "auth" : "detail",
    label: action.intent,
    outcome: action.id === "authenticate" ? { type: "navigate", target: "home" } : { type: "mutate", state: `${action.id}-completed` },
    persistence: action.id === "authenticate" ? "session" : "local-model",
  }));
  actions.push({ id: "open-detail", worldActionId: null, surface: "home", label: "Открыть задачу", outcome: { type: "navigate", target: "detail" }, persistence: "none" });
  for (const binding of model.capabilityBindings) actions.push({
    id: `fallback-${binding.key}`, worldActionId: null, surface: "detail", label: binding.deniedOutcome,
    outcome: { type: "mutate", state: `${binding.key}-fallback` }, persistence: "local-model",
  });
  return {
    schemaVersion: 2,
    productContractId: artifact.productDevelopment.productContract.contractId,
    worldModelId: model.id,
    authentication: { required: true, entrySurface: "auth", successSurface: "home", restoreSession: true },
    navigation: {
      roots: ["auth"],
      nodes: [
        { id: "auth", title: "Вход", purpose: "Восстановить или создать обязательную сессию", presentation: "root", parent: null, entityIds: ["resident"], actionIds: [actionIds.authenticate] },
        { id: "home", title: "Главная", purpose: "Увидеть актуальные ограниченные задачи", presentation: "root", parent: null, entityIds: ["request"], actionIds: ["open-detail"] },
        { id: "detail", title: "Задача", purpose: "Выполнить действие и увидеть его результат", presentation: "push", parent: "home", entityIds: ["request", "media"], actionIds: actions.filter(item => item.surface === "detail").map(item => item.id) },
      ],
    },
    actions,
    states: [states("auth", actionIds.authenticate), states("home", "open-detail"), states("detail", actionIds[model.coreActions[0]])],
    permissionFlows: model.capabilityBindings.map(binding => ({
      key: binding.key,
      worldActionId: binding.action,
      surface: "detail",
      triggerActionId: actionIds[binding.action],
      deniedActionId: `fallback-${binding.key}`,
    })),
    ...integrityFields(model, actionIds),
  };
}

test("Experience Contract closes auth, navigation, actions and per-screen states before visual design", async () => {
  const artifact = await factoryArtifact();
  const result = await developExperienceContract({
    factoryArtifact: artifact,
    planner: { async planExperience() { return planFor(artifact); } },
  });
  assert.equal(result.ok, true, result.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  assert.match(result.contract.experienceContractId, /^experience-[0-9a-f]{16}$/);
  assert.deepEqual(verifyExperienceContract(result.contract, artifact), []);
});

test("Experience Contract rejects a missing offline state and an invented product action", async () => {
  const artifact = await factoryArtifact();
  const plan = planFor(artifact);
  plan.states[1].variants = plan.states[1].variants.filter(item => item.id !== "offline");
  plan.actions[0].worldActionId = "invented-by-screen";
  const result = await developExperienceContract({
    factoryArtifact: artifact,
    planner: { async planExperience() { return plan; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "experience.state.missing"), true);
  assert.equal(result.diagnostics.some(item => item.code === "experience.action.world-unknown"), true);
});

test("Product Integrity v2 rejects competing entry points and cross-screen media identity drift", async () => {
  const artifact = await factoryArtifact();
  const plan = planFor(artifact);
  plan.actions.push({ id: "open-detail-again", worldActionId: null, surface: "home", label: "Ещё один вход", outcome: { type: "navigate", target: "detail" }, persistence: "none" });
  plan.navigation.nodes.find(item => item.id === "home").actionIds.push("open-detail-again");
  plan.content.screenBindings.find(item => item.screenId === "home").recordIds = [];
  const result = await developExperienceContract({
    factoryArtifact: artifact,
    planner: { async planExperience() { return plan; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "experience.entry-point.policy-missing"), true);
  assert.equal(result.diagnostics.some(item => item.code === "experience.content.media-owner-unbound"), true);
});

test("Product Integrity v2 rejects a journey whose buttons cannot be executed in sequence", async () => {
  const artifact = await factoryArtifact();
  const plan = planFor(artifact);
  plan.journeys[0].actionIds = ["open-detail", plan.journeys[0].actionIds.at(-1)];
  const result = await developExperienceContract({
    factoryArtifact: artifact,
    planner: { async planExperience() { return plan; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "experience.journey.sequence-broken"), true);
});

test("structured planner receives product semantics without visual implementation choices", async () => {
  const artifact = await factoryArtifact();
  let call = null;
  const planner = createStructuredModelExperiencePlanner({
    model: { async generateStructured(value) { call = value; return planFor(artifact); } },
  });
  await planner.planExperience({
    productContract: artifact.productDevelopment.productContract,
    worldModel: artifact.worldModels.find(item => item.id === artifact.selectedWorldModelId),
  });
  assert.equal(call.operation, "camo.native-product-integrity-planner.v2");
  assert.equal(call.schema.properties.experienceContractId, undefined);
  assert.match(call.input.instructions.join("\n"), /before visual design/i);
  assert.match(call.input.instructions.join("\n"), /canonical content records/i);
  assert.doesNotMatch(call.input.instructions.join("\n"), /generate SwiftUI/i);
});

test("experience planner schema is closed and compatible with production structured output", () => {
  const schema = experiencePlannerModelSchema();
  const strict = toStrictOutputSchema(schema);
  assert.equal(strict.properties.experienceContractId, undefined);
  assert.equal(strict.required.includes("experienceContractId"), false);
  assert.equal(strict.$defs, undefined);
  const fact = strict.properties.content.properties.records.items.properties.facts.items;
  assert.equal(fact.additionalProperties, false);
  assert.deepEqual(fact.required, ["key", "value"]);
});
