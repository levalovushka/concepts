import test from "node:test";
import assert from "node:assert/strict";
import { createFactoryDevelopmentArtifact, developProductFactory } from "../lib/product-factory.mjs";
import { developExperienceContract } from "../lib/experience-contract.mjs";
import { createVisualDevelopmentArtifact, developVisualDirection, verifyVisualDevelopmentArtifact } from "../lib/visual-direction.mjs";
import { createStructuredModelVisualDirectionEvaluator } from "../lib/structured-model-visual-direction-evaluator.mjs";
import { createStructuredModelVisualDirectionGenerator, visualDirectionGeneratorModelSchema } from "../lib/structured-model-visual-direction-generator.mjs";
import { toStrictOutputSchema } from "../lib/codex-cli-structured-model.mjs";
import { fixtureExperiencePlanner, productFactoryEvaluator, productFactoryGenerator } from "../fixtures/product-factory/fixture-adapter.mjs";

const visualAxes = ["product-hierarchy", "native-coherence", "cross-screen-consistency", "state-completeness", "strategy-integrity", "visual-risk"];
const forbidden = ["decorative-gradients", "colored-icon-placeholders", "generic-hero-cards", "universal-done-copy", "card-stack-default"];

async function inputs() {
  const request = {
    schemaVersion: 1,
    request: "Соседи закрывают одну ограниченную бытовую задачу через понятное обязательство и наблюдаемый результат",
    targetProduct: "vk-music",
    strategy: "differentiation",
  };
  const result = await developProductFactory({ request, generator: productFactoryGenerator, evaluator: productFactoryEvaluator });
  const factoryArtifact = createFactoryDevelopmentArtifact({ request, result });
  const experience = await developExperienceContract({ factoryArtifact, planner: fixtureExperiencePlanner });
  return { factoryArtifact, experienceContract: experience.contract };
}

function direction(experience, index) {
  const screenIds = experience.navigation.nodes.map(item => item.id);
  return {
    schemaVersion: 1,
    id: `native-direction-${index}`,
    name: `Нативное направление ${index}`,
    strategy: "differentiation",
    rationale: `Направление ${index} подчёркивает продуктовую иерархию системной композицией без декоративных контейнеров.`,
    composition: {
      chrome: "system",
      density: index === 0 ? "content-led" : index === 1 ? "compact-list" : "sectioned-flow",
      contentRhythm: `Ритм ${index} следует важности действия и состоянию данных`,
      screenFamilies: [{ id: `primary-${index}`, screens: screenIds, structure: `system-structure-${index}`, primaryRole: "product-task" }],
    },
    tokens: {
      accent: index === 0 ? "#2457D6" : index === 1 ? "#146C5A" : "#7A3E00",
      background: "#FFFFFF", groupedBackground: "#F2F2F7", surface: "#FFFFFF",
      fill: "#F2F2F7", separator: "#C6C6C8", textPrimary: "#000000", textSecondary: "#6C6C70",
    },
    iconography: { productChromeSource: "sf-symbols", weight: "semibold", tabRoles: [] },
    componentRecipes: screenIds.map(screen => ({
      role: `screen:${screen}`, nativePrimitive: screen === "auth" ? "Form" : "ScrollView",
      anatomy: ["system-header", "primary-content", "contextual-actions"],
      states: experience.states.find(item => item.screenId === screen).variants.filter(item => item.applicable).map(item => item.id),
      prohibitions: ["No decorative placeholder container", "No action without Experience Contract id"],
    })),
    rules: { allowedPatterns: ["system-navigation", "semantic-sections", "content-unavailable-state"], forbiddenPatterns: forbidden },
    evidenceRefs: ["selected-product-contract", "verified-experience-contract", "calibration:native-product-baseline-v1"],
  };
}

test("three independently evaluated native directions produce one reproducible Visual Direction Contract", async () => {
  const source = await inputs();
  const directions = [0, 1, 2].map(index => direction(source.experienceContract, index));
  const result = await developVisualDirection({
    ...source,
    generator: { async generateDirections() { return directions; } },
    evaluator: { async evaluateDirections() { return { assessments: directions.map((item, index) => ({
      directionId: item.id,
      axes: visualAxes.map(id => ({ id, score: index === 0 ? 9.2 : 8.7, rationale: `Independent evidence-backed rationale for ${id} in ${item.id}.` })),
    })) }; } },
  });
  assert.equal(result.ok, true, result.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  assert.equal(result.receipt.directions.length, 3);
  assert.equal(result.contract.direction.id, "native-direction-0");
  assert.match(result.contract.visualDirectionContractId, /^visual-[0-9a-f]{16}$/);
  const artifact = createVisualDevelopmentArtifact(result);
  assert.deepEqual(verifyVisualDevelopmentArtifact(artifact, source.factoryArtifact, source.experienceContract), []);
});

test("differentiation rejects template visuals and the wrong icon family before SwiftUI", async () => {
  const source = await inputs();
  const directions = [0, 1, 2].map(index => direction(source.experienceContract, index));
  directions[0].iconography.productChromeSource = "lucide-assets";
  directions[0].rules.forbiddenPatterns = [];
  const result = await developVisualDirection({
    ...source,
    generator: { async generateDirections() { return directions; } },
    evaluator: { async evaluateDirections() { throw new Error("must not evaluate invalid visual contracts"); } },
  });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "visual.iconography.strategy-drift"), true);
  assert.equal(result.diagnostics.some(item => item.code === "visual.forbidden-pattern.missing"), true);
});

test("visual verifier reproduces the selected direction instead of trusting a rehashed contract", async () => {
  const source = await inputs();
  const directions = [0, 1, 2].map(index => direction(source.experienceContract, index));
  const result = await developVisualDirection({
    ...source,
    generator: { async generateDirections() { return directions; } },
    evaluator: { async evaluateDirections() { return { assessments: directions.map(item => ({
      directionId: item.id,
      axes: visualAxes.map(id => ({ id, score: 9, rationale: `Independent evidence-backed rationale for ${id} in ${item.id}.` })),
    })) }; } },
  });
  const artifact = structuredClone(createVisualDevelopmentArtifact(result));
  artifact.visualDirectionContract.direction.tokens.accent = "#FF00FF";
  const diagnostics = verifyVisualDevelopmentArtifact(artifact, source.factoryArtifact, source.experienceContract);
  assert.equal(diagnostics.some(item => item.code === "visual.contract.unstable"), true);
  assert.equal(diagnostics.some(item => item.code === "visual.contract.selection-drift"), true);
});

test("structured visual adapters keep generation and evaluation as separate model operations", async () => {
  const calls = [];
  const model = { async generateStructured(request) {
    calls.push(request);
    if (request.operation.endsWith("generator.v1")) return { directions: [{ id: "one" }, { id: "two" }, { id: "three" }] };
    return { assessments: [] };
  } };
  const generator = createStructuredModelVisualDirectionGenerator({ model });
  const evaluator = createStructuredModelVisualDirectionEvaluator({ model });
  const directions = await generator.generateDirections({ productContract: {}, experienceContract: {}, strategy: "differentiation", referenceProfileId: null });
  await evaluator.evaluateDirections({ productContract: {}, experienceContract: {}, directions, rubric: { axes: visualAxes, scoreRange: [0, 10] } });
  assert.deepEqual(calls.map(call => call.operation), [
    "camo.native-visual-direction-generator.v1",
    "camo.native-visual-direction-evaluator.v1",
  ]);
  assert.equal(calls[0].schema.properties.directions.minItems, 3);
  assert.equal(calls[1].schema.properties.assessments.items.properties.axes.minItems, visualAxes.length);
});

test("visual generator schema is closed and compatible with production structured output", () => {
  const strict = toStrictOutputSchema(visualDirectionGeneratorModelSchema());
  const tabRole = strict.properties.directions.items.properties.iconography.properties.tabRoles.items;
  assert.equal(tabRole.additionalProperties, false);
  assert.deepEqual(tabRole.required, ["screenId", "icon"]);
});
