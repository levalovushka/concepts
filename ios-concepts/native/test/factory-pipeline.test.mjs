import test from "node:test";
import assert from "node:assert/strict";
import { runFactoryPipeline } from "../lib/factory-pipeline.mjs";
import * as fixtures from "../fixtures/product-factory/fixture-adapter.mjs";

const request = {
  schemaVersion: 1,
  request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
  targetProduct: "vk-music",
  strategy: "differentiation",
};

const adapters = {
  productFactoryGenerator: fixtures.productFactoryGenerator,
  productFactoryEvaluator: fixtures.productFactoryEvaluator,
  experiencePlanner: fixtures.fixtureExperiencePlanner,
  visualDirectionGenerator: fixtures.fixtureVisualGenerator,
  visualDirectionEvaluator: fixtures.fixtureVisualEvaluator,
  factoryRenderer: fixtures.factoryRenderer,
  productUICritic: fixtures.productUICritic,
  productRevisionAdapter: fixtures.productRevisionAdapter,
};

test("one factory interface runs product, experience, visual and release stages in order", async () => {
  const result = await runFactoryPipeline({ request, adapters });
  assert.equal(result.ok, true, result.diagnostics.map(item => item.message).join("\n"));
  assert.equal(result.stage, "complete");
  assert.match(result.artifacts.factoryDevelopment.productDevelopment.productContract.contractId, /^product-/);
  assert.match(result.artifacts.experienceContract.experienceContractId, /^experience-/);
  assert.match(result.artifacts.visualDevelopment.visualDirectionContract.visualDirectionContractId, /^visual-/);
  assert.equal(result.artifacts.release.attempts.length, 1);
  assert.deepEqual(result.metrics.stages.map(item => item.id), ["product", "product-integrity", "visual-direction", "render-review-release"]);
  assert.equal(result.metrics.stages.every(item => item.durationMs >= 0), true);
  assert.equal(result.metrics.automatedRevisionCount, 0);
  assert.equal(result.metrics.manualInterventions, null);
});

test("one factory interface stops before rendering when visual selection fails", async () => {
  let rendered = false;
  const weak = {
    ...adapters,
    visualDirectionEvaluator: { async evaluateDirections({ directions, rubric }) {
      return { assessments: directions.map(direction => ({
        directionId: direction.id,
        axes: rubric.axes.map(id => ({ id, score: 8, rationale: `Independent weak visual rationale for ${id} in ${direction.id}.` })),
      })) };
    } },
    factoryRenderer: { async render() { rendered = true; } },
  };
  const result = await runFactoryPipeline({ request, adapters: weak });
  assert.equal(result.ok, false);
  assert.equal(result.stage, "visual");
  assert.equal(rendered, false);
  assert.equal(result.artifacts.release, undefined);
});
