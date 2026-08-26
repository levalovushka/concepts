import test from "node:test";
import assert from "node:assert/strict";
import { createFactoryDevelopmentArtifact, developProductFactory } from "../lib/product-factory.mjs";
import { developExperienceContract } from "../lib/experience-contract.mjs";
import { releaseFactoryProduct } from "../lib/factory-release.mjs";
import { createVisualDevelopmentArtifact, developVisualDirection } from "../lib/visual-direction.mjs";
import { fixtureExperiencePlanner, fixtureVisualEvaluator, fixtureVisualGenerator, productFactoryEvaluator, productFactoryGenerator } from "../fixtures/product-factory/fixture-adapter.mjs";

async function inputs() {
  const request = {
    schemaVersion: 1,
    request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
    targetProduct: "vk-music",
    strategy: "differentiation",
  };
  const factory = await developProductFactory({ request, generator: productFactoryGenerator, evaluator: productFactoryEvaluator });
  const factoryArtifact = createFactoryDevelopmentArtifact({ request, result: factory });
  const experience = await developExperienceContract({ factoryArtifact, planner: fixtureExperiencePlanner });
  const visual = await developVisualDirection({
    factoryArtifact,
    experienceContract: experience.contract,
    generator: fixtureVisualGenerator,
    evaluator: fixtureVisualEvaluator,
  });
  return { factoryArtifact, experienceContract: experience.contract, visualDevelopment: createVisualDevelopmentArtifact(visual) };
}

function renderer(calls) {
  return { async render({ factoryArtifact, experienceContract, visualDevelopment, revision, attempt }) {
    calls.push({ attempt, revision });
    const visual = visualDevelopment.visualDirectionContract;
    return {
      productContractId: factoryArtifact.productDevelopment.productContract.contractId,
      experienceContractId: experienceContract.experienceContractId,
      visualDirectionContractId: visual.visualDirectionContractId,
      contentManifest: structuredClone(experienceContract.content),
      consumedBlueprintScreenIds: experienceContract.screenBlueprints.map(item => item.screenId),
      concept: {
        slug: "factory-fixture",
        native: { design: { strategy: "differentiation", qualityFloor: 8.5, tokens: visual.direction.tokens, iconography: visual.direction.iconography }, deliveryIdentity: { coreSurfaces: ["home"] } },
        productDevelopment: { productContract: factoryArtifact.productDevelopment.productContract },
      },
      consumedRecipeRoles: visual.direction.componentRecipes.map(item => item.role),
      testMatrix: { devices: [
        { id: "current", name: "iPhone 17 Pro", class: "current" },
        { id: "small", name: "iPhone 16e", class: "small-phone" },
      ] },
      buildReceipt: { passed: true, xcodeProjectPath: "native/build/factory-fixture/FactoryFixture.xcodeproj", sha256: `attempt-build-${attempt}` },
      interactionReceipts: experienceContract.journeys.map(journey => ({
        journeyId: journey.id, actionIds: journey.actionIds, passed: true,
        evidencePath: `journeys/${journey.id}.json`, sha256: `attempt-journey-${attempt}-${journey.id}`,
      })),
      permissionReceipts: experienceContract.permissionFlows
        .filter(flow => ["camera", "photos", "push"].includes(flow.key))
        .map(flow => ({
          permissionKey: flow.key, promptMode: "system-dialog",
          grantedTestName: `test_${flow.key}_granted`, deniedTestName: `test_${flow.key}_denied`,
          devices: ["current", "small"].map(deviceId => ({
            deviceId, grantedPassed: true, deniedPassed: true,
            evidencePath: `permissions/${deviceId}-${flow.key}.xcresult`, sha256: `permission-${attempt}-${deviceId}-${flow.key}`,
          })),
        })),
      captures: ["current", "small"].flatMap(deviceId => experienceContract.states.flatMap(policy => policy.variants.filter(item => item.applicable).map(state => ({
        id: `${deviceId}--${policy.screenId}--${state.id}`,
        deviceId,
        surface: policy.screenId,
        state: state.id,
        path: `shots-${deviceId}/${policy.screenId}--${state.id}--attempt-${attempt}.png`,
        sha256: `attempt-${attempt}-${revision?.id || "initial"}-${deviceId}-${policy.screenId}-${state.id}`,
      })))),
    };
  } };
}

function critic(scoreForAttempt) {
  return { async review(request) {
    const attempt = Number(request.captures[0].sha256.match(/attempt-(\d+)/)[1]);
    const score = scoreForAttempt(attempt);
    return {
      reviewer: { kind: "fixture", name: "independent-release-reviewer", independentFromGenerator: true, captureInspection: "vision" },
      verdict: score >= 8.5 ? "clean" : "blockers",
      axes: request.rubric.axes.map(id => ({ id, score, rationale: `Independent release rationale for ${id} on attempt ${attempt}.`, evidence: "Visible rendered capture evidence" })),
      reviews: request.captures.map(capture => ({
        captureId: capture.id,
        summary: "This rendered capture has a directly inspectable product hierarchy.", evidence: "Visible rendered capture evidence",
        findings: score >= 8.5 ? [] : [{ severity: "blocker", message: "Visual hierarchy remains below release floor" }],
      })),
    };
  } };
}

test("factory release rebuilds twice and rejects after the third independent review", async () => {
  const source = await inputs();
  const renders = [];
  const revisions = [];
  const result = await releaseFactoryProduct({
    ...source,
    renderer: renderer(renders),
    critic: critic(() => 8.4),
    reviser: { async revise(value) { revisions.push(value); return { id: `revision-${value.attempt}` }; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.attempts.length, 3);
  assert.equal(renders.length, 3);
  assert.equal(revisions.length, 2);
  assert.equal(result.diagnostics.some(item => item.code === "quality.iterations.exhausted"), true);
});

test("factory release rejects a renderer that ignores the selected visual recipes", async () => {
  const source = await inputs();
  const baseRenderer = renderer([]);
  const result = await releaseFactoryProduct({
    ...source,
    renderer: { async render(input) {
      const delivery = await baseRenderer.render(input);
      return { ...delivery, consumedRecipeRoles: [] };
    } },
    critic: critic(() => 10),
    reviser: { async revise() { return { id: "should-not-recover" }; } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.attempts.length, 3);
  assert.equal(result.diagnostics.some(item => item.code === "quality.iterations.exhausted"), true);
  assert.equal(result.attempts.every(item => item.diagnostics.some(diagnostic => diagnostic.code === "release.delivery.recipe-missing")), true);
});

test("factory release returns the rebuilt delivery only after every critic axis clears 8.5", async () => {
  const source = await inputs();
  const renders = [];
  const result = await releaseFactoryProduct({
    ...source,
    renderer: renderer(renders),
    critic: critic(attempt => attempt === 1 ? 7 : 9),
    reviser: { async revise({ attempt }) { return { id: `revision-${attempt}` }; } },
  });
  assert.equal(result.ok, true, result.diagnostics.map(item => item.message).join("\n"));
  assert.equal(result.attempts.length, 2);
  assert.equal(renders.length, 2);
  assert.match(result.delivery.captures[0].sha256, /revision-1/);
});
