import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { auditProductTargetCatalog, resolveProductTarget } from "../lib/product-target-catalog.mjs";
import {
  compileFactoryCandidateDelivery,
  compileFactoryBrief,
  createFactoryDevelopmentArtifact,
  developProductFactory,
  PRODUCT_FACTORY_CANDIDATE_COUNT,
  validateFactoryRequest,
  verifyFactoryDevelopmentArtifact,
} from "../lib/product-factory.mjs";
import { verifyProductDevelopmentArtifact } from "../lib/product-maturity.mjs";
import { createStructuredModelProductFactory } from "../lib/structured-model-product-factory.mjs";
import { normalizeGeneratedPortfolio } from "../lib/structured-model-product-factory.mjs";
import { createStructuredModelProductEvaluator } from "../lib/structured-model-product-evaluator.mjs";
import { productFactoryEvaluator, productFactoryGenerator } from "../fixtures/product-factory/fixture-adapter.mjs";

const request = {
  schemaVersion: 1,
  request: "Социальное приложение о цельных образах и ситуациях, в которых люди действительно их носят",
  targetProduct: "vkontakte",
  strategy: "mimicry",
};
const discovery = {
  audience: {
    primary: "Люди, которые выбирают цельный образ для конкретной ситуации",
    needs: ["Увидеть проверенное сочетание вещей на человеке и понять контекст использования"],
  },
  context: {
    situations: ["Перед событием нужно быстро выбрать сочетание из уже доступных вещей", "После события хочется сохранить удачный образ целиком"],
    constraints: ["Продуктовая механика остаётся простой и работает на локальных demo-данных"],
  },
};

test("product targets own stable capability pools and mandatory authentication", () => {
  assert.deepEqual(auditProductTargetCatalog(), []);
  assert.equal(resolveProductTarget("vkontakte").permissions.length, 22);
  assert.equal(resolveProductTarget("vkontakte").permissions.some(item => item.key === "associateddomains"), true);
  assert.deepEqual(resolveProductTarget("vkontakte").deliveryObligations, []);
  assert.equal(resolveProductTarget("vk-music").permissions.length, 5);
  assert.equal(resolveProductTarget("vk-video").permissions.length, 10);
  assert.equal(resolveProductTarget("ok").permissions.length, 21);
  for (const id of ["vkontakte", "vk-music", "vk-video", "ok"]) {
    assert.equal(resolveProductTarget(id).authentication.required, true);
  }
});

test("short factory request does not require audience, permission list, or prohibitions", () => {
  assert.deepEqual(validateFactoryRequest(request), []);
  const compiled = compileFactoryBrief({ request, discovery });
  assert.equal(compiled.ok, true, compiled.diagnostics.map(item => item.message).join("\n"));
  assert.match(compiled.brief.id, /^factory-[0-9a-f]{16}$/);
  assert.equal(compiled.brief.audience.primary, discovery.audience.primary);
  assert.equal(compiled.brief.permissions.length, 22);
  assert.equal(compiled.brief.permissions.every(item => item.priority === "optional"), true);
  assert.equal(compiled.brief.candidateCount, PRODUCT_FACTORY_CANDIDATE_COUNT);
  assert.equal(compiled.brief.context.constraints.some(item => /без собственного backend/.test(item)), true);
  assert.equal(compiled.brief.context.constraints.some(item => /Авторизация обязательна/.test(item)), true);
  assert.equal(compiled.brief.context.constraints.some(item => /share-extension/.test(item)), false);
});

test("runtime Factory Request validation matches the closed JSON schema", () => {
  const unknown = validateFactoryRequest({ ...request, audience: "Не пользовательское поле" });
  assert.equal(unknown.some(item => item.code === "factory.property.unknown"), true);

  const tooManyPreferences = validateFactoryRequest({
    ...request,
    preferences: Array.from({ length: 9 }, (_, index) => `Предпочтение ${index + 1}`),
  });
  assert.equal(tooManyPreferences.some(item => item.code === "factory.preferences.too-many"), true);
});

test("unknown target is rejected before a generator call", async () => {
  let called = false;
  const result = await developProductFactory({
    request: { ...request, targetProduct: "unknown" },
    generator: { async generatePortfolio() { called = true; } },
  });
  assert.equal(result.ok, false);
  assert.equal(called, false);
  assert.equal(result.diagnostics.some(item => item.code === "factory.target.unknown"), true);
});

test("mimicry is rejected before generation when its reference evidence is incomplete", async () => {
  let called = false;
  const result = await developProductFactory({
    request: { ...request, targetProduct: "vk-music" },
    generator: { async generatePortfolio() { called = true; } },
  });
  assert.equal(result.ok, false);
  assert.equal(called, false);
  assert.equal(result.diagnostics.some(item => item.code === "factory.reference.not-ready"), true);
});

test("differentiation receives the target capability pool but does not require mimicry evidence", async () => {
  let received = null;
  const result = await developProductFactory({
    request: { ...request, targetProduct: "vk-music", strategy: "differentiation" },
    generator: { async generatePortfolio(value) { received = value; return { discovery, proposals: [] }; } },
    evaluator: { async evaluatePortfolio() { return { assessments: [] }; } },
  });
  assert.equal(received.target.permissions.length, 5);
  assert.equal(received.rubric.candidateCount, 3);
  assert.equal(result.brief.reference.strategy, "differentiation");
  assert.equal(result.ok, false, "an empty candidate portfolio must still fail maturity");
});

test("factory rejects a screen-first proposal without a World Model before maturity scoring", async () => {
  const result = await developProductFactory({
    request: { ...request, targetProduct: "vk-music", strategy: "differentiation" },
    generator: { async generatePortfolio() { return {
      discovery,
      proposals: [{ candidate: { id: "screens-first" }, worldModel: null }],
    }; } },
    evaluator: { async evaluatePortfolio() { return { assessments: [] }; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "world.required"), true);
  assert.equal(result.selectionReceipt, null);
});

test("structured product factory sends a bounded request to the real model", async () => {
  const calls = [];
  const generator = createStructuredModelProductFactory({
    model: { async generateStructured(value) {
      calls.push(value);
      if (value.operation === "camo.native-product-discovery.v2") return discovery;
      if (value.operation === "camo.native-product-ideation.v3") return {
        seeds: Array.from({ length: 5 }, (_, index) => ({ id: `candidate-${index + 1}` })),
      };
      return { candidate: { id: value.input.assignedSeed.id }, worldModel: { id: value.input.assignedSeed.id } };
    } },
  });
  await generator.generatePortfolio({
    request,
    target: resolveProductTarget("vkontakte"),
    rubric: { candidateCount: 5, minimumAxisScore: 3 },
  });
  assert.equal(calls[0].operation, "camo.native-product-discovery.v2");
  assert.equal(calls[1].operation, "camo.native-product-ideation.v3");
  assert.equal(calls.length, 7);
  const proposals = calls.slice(2);
  assert.deepEqual(proposals.map(item => item.operation), Array.from({ length: 5 }, (_, index) => `camo.native-product-proposal.v3.selected-${index + 1}`));
  const call = proposals[0];
  assert.equal(call.schema.properties.candidate.properties.permissions, undefined);
  assert.equal(call.schema.properties.candidate.properties.stressTest, undefined);
  assert.equal(call.schema.properties.candidate.properties.delivery, undefined);
  assert.equal(call.schema.properties.worldModel.$id.endsWith("world-model.schema.json"), true);
  assert.equal(call.input.completePortfolio.length, 5);
  assert.equal(call.input.assignedSeed.id, "candidate-1");
  assert.match(call.input.instructions.join("\n"), /coherent product mechanism before grounding permissions/);
  assert.match(call.input.instructions.join("\n"), /Select only capabilities/);
  assert.match(call.input.instructions.join("\n"), /Authentication is mandatory/);
  assert.match(call.input.instructions.join("\n"), /worldModel\.id must exactly equal candidate\.id/);
  assert.match(call.input.instructions.join("\n"), /loading, populated, empty, error, offline/);
});

test("deterministic World Model compiler owns transport invariants, not the idea model", () => {
  const result = normalizeGeneratedPortfolio({ proposals: [{
    candidate: {
      id: "coherent-product",
      name: "Цельный продукт",
      job: { actor: "Участник", situation: "Совместное дело", motivation: "Договориться без шума", outcome: "Понятный общий результат" },
      coreLoop: { successMetric: "Доля завершённых договорённостей" },
      contentModel: { primaryUnit: "Договорённость" },
      delivery: { architecture: { modules: [{ name: "Core", owns: "State" }] } },
    },
    worldModel: {
      id: "wm-coherent-product",
      entities: [{ id: "person", ownership: "user" }],
      authentication: { method: "emailCode", sessionEntity: "ghost", persistence: "" },
      runtime: { demoAdapters: [{ id: "local-demo", states: ["success"] }] },
    },
  }] }, resolveProductTarget("vkontakte"));
  const world = result.proposals[0].worldModel;
  assert.equal(world.id, "coherent-product");
  assert.deepEqual(world.authentication, {
    method: "email-code", sessionEntity: "person", persistence: "Keychain-backed local demo session",
  });
  assert.deepEqual(world.runtime.demoAdapters[0].states, ["loading", "populated", "empty", "error", "offline"]);
  assert.equal(result.proposals[0].candidate.delivery.architecture.modules[0].name, "Core");
  const delivery = compileFactoryCandidateDelivery(result.proposals[0].candidate, {
    ...world,
    coreActions: ["publish"],
    actions: [{ id: "publish", intent: "Опубликовать договорённость", preconditions: ["Договорённость готова"], effects: ["Договорённость видна участникам"] }],
  });
  assert.match(delivery.architecture.modules[0].name, /Цельный продукт/);
  assert.match(delivery.architecture.modules[0].owns, /Договорённость/);
});

test("factory requires an evaluator independent from the proposal generator", async () => {
  let generated = false;
  const result = await developProductFactory({
    request: { ...request, targetProduct: "vk-music", strategy: "differentiation" },
    generator: { async generatePortfolio() { generated = true; return { discovery, proposals: [] }; } },
  });
  assert.equal(result.ok, false);
  assert.equal(generated, false);
  assert.equal(result.diagnostics.some(item => item.code === "factory.evaluator.required"), true);
});

test("independent product evaluator owns stress scores in a separate model operation", async () => {
  let call = null;
  const evaluator = createStructuredModelProductEvaluator({
    model: { async generateStructured(value) { call = value; return { assessments: [] }; } },
  });
  await evaluator.evaluatePortfolio({
    request,
    target: resolveProductTarget("vkontakte"),
    proposals: Array.from({ length: 5 }, (_, index) => ({ candidate: { id: `candidate-${index}` }, worldModel: { id: `candidate-${index}` } })),
    rubric: { candidateCount: 5, axes: ["audience-need"], scoreRange: [0, 4], minimumAxisScore: 3 },
  });
  assert.equal(call.operation, "camo.native-product-evaluator.v1");
  assert.equal(call.schema.properties.assessments.minItems, 5);
  assert.match(call.input.instructions.join("\n"), /independent/i);
  assert.match(call.input.instructions.join("\n"), /evidenceRefs may contain only exact ids/);
  assert.match(call.input.instructions.join("\n"), /Do not fail audience-need/);
  assert.match(call.input.instructions.join("\n"), /Reserve 4\/4/);
});

test("factory artifact keeps the canonical Product Development verifier seam", () => {
  const productDevelopment = JSON.parse(readFileSync(join(import.meta.dirname, "../fixtures/product-development/strong-development.json"), "utf8"));
  const artifact = createFactoryDevelopmentArtifact({
    request,
    result: {
      ok: true,
      target: resolveProductTarget("vkontakte"),
      discovery,
      worldModels: [{ id: "borrow-circle" }],
      brief: productDevelopment.brief,
      candidates: productDevelopment.candidates,
      selectionReceipt: productDevelopment.selectionReceipt,
      productContract: productDevelopment.productContract,
    },
  });
  assert.deepEqual(verifyProductDevelopmentArtifact(artifact.productDevelopment), []);
  assert.equal(artifact.factoryRequest.targetProduct, "vkontakte");
  assert.equal(artifact.worldModels[0].id, "borrow-circle");
});

test("three World Model proposals complete the full factory-to-verifier tracer bullet", async () => {
  const factoryRequest = {
    schemaVersion: 1,
    request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
    targetProduct: "vk-music",
    strategy: "differentiation",
  };
  const result = await developProductFactory({
    request: factoryRequest,
    generator: productFactoryGenerator,
    evaluator: productFactoryEvaluator,
  });
  assert.equal(result.ok, true, result.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  assert.equal(result.candidates.length, 3);
  assert.equal(result.worldModels.length, 3);
  assert.equal(result.selectionReceipt.candidates.length, 3);
  assert.equal(result.selectedWorldModel.id, result.selectionReceipt.selectedCandidateId);
  const artifact = createFactoryDevelopmentArtifact({ request: factoryRequest, result });
  assert.deepEqual(verifyProductDevelopmentArtifact(artifact.productDevelopment), []);
  assert.deepEqual(verifyFactoryDevelopmentArtifact(artifact), []);
  assert.equal(artifact.selectedWorldModelId, artifact.productDevelopment.selectionReceipt.selectedCandidateId);
});

test("factory verifier reproduces selected World Model auth and identity instead of trusting the artifact", async () => {
  const factoryRequest = {
    schemaVersion: 1,
    request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
    targetProduct: "vk-music",
    strategy: "differentiation",
  };
  const result = await developProductFactory({ request: factoryRequest, generator: productFactoryGenerator, evaluator: productFactoryEvaluator });
  const artifact = structuredClone(createFactoryDevelopmentArtifact({ request: factoryRequest, result }));
  artifact.selectedWorldModelId = "wrong-winner";
  artifact.worldModels.find(item => item.id === result.selectionReceipt.selectedCandidateId).authentication.method = "email-code";
  const diagnostics = verifyFactoryDevelopmentArtifact(artifact);
  assert.equal(diagnostics.some(item => item.code === "factory.world.selection-drift"), true);
  assert.equal(diagnostics.some(item => item.code === "world.authentication.incomplete"), true);
});
