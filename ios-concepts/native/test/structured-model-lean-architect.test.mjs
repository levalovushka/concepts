import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createStructuredModelLeanArchitect, LEAN_IDEA_AXES } from "../lib/structured-model-lean-architect.mjs";
import { resolveProductTarget } from "../lib/product-target-catalog.mjs";
import { resolveReferenceProfile } from "../lib/reference-profile-catalog.mjs";
import { verifyProductBlueprint } from "../lib/lean-native-factory.mjs";

const request = { id: "cold", request: "Новая социальная сеть в мимикрии ВК", targetProduct: "vkontakte", strategy: "mimicry", capabilityPolicy: "all" };
const target = resolveProductTarget("vkontakte");
const reference = resolveReferenceProfile(target.mimicryProfileId);
const selectedBlueprint = JSON.parse(readFileSync(new URL("../ProductBlueprints/circles-vk.json", import.meta.url), "utf8"));

function matureBlueprintBody() {
  const body = Object.fromEntries(
    Object.entries(selectedBlueprint).filter(([key]) => !["schemaVersion", "targetProduct", "strategy", "states"].includes(key)),
  );
  body.capabilities = body.capabilities.map((capability, index) => ({
    ...capability,
    actionId: `capability_${capability.key}`,
    purpose: `Capability ${capability.key} strengthens a concrete user task after the intent already exists.`,
    requestMoment: `Request ${capability.key} only after the user explicitly starts its owning action.`,
    platformEffect: `Execute the real iOS ${capability.key} adapter and consume its returned result.`,
    testScenario: `Exercise ${capability.key}, assert the persisted success result and the denied fallback.`,
  }));
  const capabilityActions = body.capabilities.map((capability, index) => ({
    id: capability.actionId, entityId: body.world.entities[index % body.world.entities.length].id,
    outcome: `The ${capability.key} result becomes visible on its owning entity.`,
  }));
  body.world.actions.push(...capabilityActions);
  body.navigation.screens[0].actionIds.push(...capabilityActions.map(action => action.id));
  body.localization = body.navigation.screens.flatMap(screen => [
    { key: `screen.${screen.id}.title`, source: screen.title || screen.id, context: `Navigation title for ${screen.id}`, screenIds: [screen.id] },
    { key: `screen.${screen.id}.body`, source: `Содержимое экрана ${screen.title || screen.id}`, context: `Primary product copy for ${screen.id}`, screenIds: [screen.id] },
  ]);
  body.fixtures = body.world.entities.flatMap((entity, index) => [0, 1].map(item => ({
    id: `${entity.id}_${index}_${item}`, entityId: entity.id, purpose: `Deterministic state for ${entity.id}`,
    values: [{ key: "title", value: `${entity.name || entity.id} ${item + 1}` }, { key: "status", value: item ? "Завершено" : "Активно" }],
  }))).slice(0, 8);
  const scenarioActions = [...new Set([...body.coreLoop.actionIds, "open_comments", "respond_to_post"])];
  body.acceptanceScenarios = scenarioActions.map((actionId, index) => ({
    id: `scenario_${index}`, title: `Проверить действие ${actionId}`, startScreenId: body.navigation.screens.find(screen => screen.actionIds.includes(actionId))?.id || "feed",
    actionIds: [actionId], observableResult: `Observable result for ${actionId} is visible and persisted.`,
    failureRecovery: `Failure for ${actionId} preserves input and offers a clear retry.`,
  }));
  while (body.acceptanceScenarios.length < 6) body.acceptanceScenarios.push({
    id: `scenario_extra_${body.acceptanceScenarios.length}`, title: "Проверить восстановление состояния", startScreenId: "feed",
    actionIds: [body.coreLoop.actionIds[0]], observableResult: "The restored product state is visible after relaunch.",
    failureRecovery: "The product keeps local data and exposes an explicit retry.",
  });
  body.delivery = {
    accessibility: ["VoiceOver labels describe outcomes", "Dynamic Type keeps hierarchy", "Controls have 44 point targets", "Color is not the only status signal", "Focus order follows visual order"],
    privacy: { data: ["Local profile", "Capability outcomes"], principles: ["Contextual consent only", "Local-first storage by default", "Denied access keeps a useful fallback"], retention: "Local fixture and session data remain until the user resets the concept." },
    analytics: { events: ["auth_complete", "feed_open", "core_action", "capability_success", "capability_denied"], successMetrics: ["Core loop completion rate", "Useful response rate", "Seven-day return intent"] },
    risks: ["The social loop may lack density", "Capability breadth may obscure the core job", "Reference fidelity may drift across secondary screens"],
    assumptions: ["Local fixtures are sufficient for developer handoff", "The selected loop is understandable without onboarding"],
  };
  return body;
}

function ideas() {
  return ["circles", "neighbours", "makers"].map((id, index) => ({
    id, name: `Idea ${index}`, thesis: `Concrete product thesis for ${id} with an observable social result.`,
    audience: "People with one concrete recurring collaborative need",
    worldSummary: "People author posts, receive responses and complete a shared outcome together.",
    coreLoop: ["Publish", "Respond", "Coordinate", "Return for outcome"],
    referenceFit: "An authored identity-led feed with familiar VK social feedback and navigation.",
    capabilityStrategy: "Capabilities attach to creation, coordination and trusted sharing after product intent exists.",
    nonGoals: ["No generic dashboard", "No decorative social controls"],
  }));
}

test("lean architect hides three-idea selection and deterministic blueprint completion behind one design interface", async () => {
  const calls = [];
  const ideaModel = { async generateStructured(input) {
    calls.push(input.operation);
    return input.operation.endsWith("portfolio.v1") ? { ideas: ideas() } : matureBlueprintBody();
  } };
  const evaluatorModel = { async generateStructured(input) {
    calls.push(input.operation);
    return {
      selectedId: "circles",
      assessments: ideas().map(idea => ({
        ideaId: idea.id, fatalRisks: [],
        axes: LEAN_IDEA_AXES.map(id => ({ id, score: idea.id === "circles" ? 9 : 8, rationale: `Independent concrete rationale for ${id} and ${idea.id}.` })),
      })),
    };
  } };
  const architect = createStructuredModelLeanArchitect({ ideaModel, evaluatorModel });
  const blueprint = await architect.design({ request, target, reference });
  assert.deepEqual(calls, ["camo.lean-product-portfolio.v1", "camo.lean-product-evaluation.v1", "camo.lean-product-blueprint.v1"]);
  assert.equal(blueprint.selectionReceipt.selectedId, "circles");
  assert.equal(blueprint.states.length, blueprint.navigation.screens.length);
  assert.deepEqual(verifyProductBlueprint(blueprint, request, target), []);
});

test("lean architect rejects a selected idea with one weak axis instead of averaging it away", async () => {
  const ideaModel = { async generateStructured(input) {
    if (input.operation.endsWith("portfolio.v1")) return { ideas: ideas() };
    throw new Error("blueprint expansion must not run");
  } };
  const evaluatorModel = { async generateStructured() {
    return {
      selectedId: "circles",
      assessments: ideas().map(idea => ({
        ideaId: idea.id, fatalRisks: [],
        axes: LEAN_IDEA_AXES.map(id => ({ id, score: idea.id === "circles" && id === "core-loop" ? 7 : 9, rationale: `Independent concrete rationale for ${id} and ${idea.id}.` })),
      })),
    };
  } };
  const architect = createStructuredModelLeanArchitect({ ideaModel, evaluatorModel });
  await assert.rejects(() => architect.design({ request, target, reference }), /does not clear/);
});

test("lean architect refuses to reuse an existing product id before source generation", async () => {
  const ideaModel = { async generateStructured(input) {
    if (input.operation.endsWith("portfolio.v1")) return { ideas: ideas() };
    throw new Error("blueprint expansion must not run");
  } };
  const evaluatorModel = { async generateStructured() { throw new Error("evaluation must not run"); } };
  const architect = createStructuredModelLeanArchitect({ ideaModel, evaluatorModel, reservedIds: ["circles"] });
  await assert.rejects(() => architect.design({ request, target, reference }), /reserved product id circles/);
});
