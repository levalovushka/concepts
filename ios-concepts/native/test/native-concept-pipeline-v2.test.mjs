import assert from "node:assert/strict";
import test from "node:test";
import { runNativeConceptPipeline } from "../lib/native-concept-pipeline-v2.mjs";
import { portfolio, strongCore } from "../fixtures/pipeline-v2/strong-product.mjs";
import { resolveProductTarget } from "../lib/product-target-catalog.mjs";

const request = Object.freeze({ id: "pipeline-v2-test", request: "Социальное приложение взаимопомощи соседей с видимым результатом", targetProduct: "vkontakte", strategy: "mimicry" });
const target = resolveProductTarget("vkontakte");
const excluded = target.permissions.filter(item => item.key !== "camera").map(item => ({
  key: item.key,
  reason: `Capability ${item.key} does not strengthen the accepted three-step product proof and remains outside this bounded pilot`,
}));
const capabilityProposal = Object.freeze({
  policy: "pool",
  bindings: [{
    key: "camera", actionId: "capture_result", strengthensActionId: "complete_promise",
    purpose: "Показать соседям проверяемый итог обещания прямо в карточке завершения",
    requestMoment: "После нажатия «Добавить фото результата» на экране завершения",
    platformEffect: "Открыть системную камеру и сохранить полученный локальный файл",
    fallback: "Оставить текстовый результат и предложить выбрать изображение позже",
    testScenario: "Разрешить камеру и увидеть сохранённую миниатюру после перезапуска",
    outcome: { entityId: "promise", stateField: "resultPhoto", proof: "Карточка завершения показывает сохранённую миниатюру" },
  }],
  exclusions: excluded,
});
const slice = Object.freeze({
  schemaVersion: 1,
  surfaces: [
    { id: "feed", role: "entry", title: "Рядом", recipe: "authoredFeed", states: ["populated/default", "empty", "offline"], actionIds: ["discover_promise"], content: { author: "Марина Орлова", headline: "Починим лавку до вечера", body: "Сосед показал конкретный результат, для которого нужна помощь." } },
    { id: "offer", role: "action", title: "Предложить помощь", recipe: "contributionEditor", states: ["populated/default", "error"], actionIds: ["offer_help"], content: { headline: "Чем вы поможете", body: "Укажите конкретный вклад, который увидит автор обещания.", details: [{ title: "Вклад", detail: "40 минут", icon: "person" }, { title: "Когда", detail: "Сегодня", icon: "clock" }] } },
    { id: "result", role: "result", title: "Результат", recipe: "completion", states: ["populated/default", "permission-denied"], actionIds: ["complete_promise", "capture_result"], content: { headline: "Лавка снова на месте", body: "Результат, вклад помощников и продолжение видны в одной карточке.", summary: { title: "Результат виден", detail: "Вклад сохранён." } } },
  ],
  transitions: [
    { from: "feed", to: "offer", actionId: "discover_promise" },
    { from: "offer", to: "result", actionId: "offer_help" },
  ],
  acceptanceJourney: { id: "product-proof", actionIds: ["discover_promise", "offer_help", "complete_promise"] },
});

function deliveryFor(contract, scope = "slice") {
  const captureIds = scope === "slice"
    ? contract.surfaces.map(item => `${item.id}--populated/default`)
    : contract.verification.captures.map(item => item.id);
  return {
    buildReceipt: { passed: true }, interactionReceipt: { passed: true }, documentationReceipt: { passed: true },
    captures: captureIds.map(id => ({ id, path: `/tmp/${id}.png` })),
  };
}

function adapters({ reviews = [{ passed: true, blockers: [] }], full = false } = {}) {
  let reviewIndex = 0;
  const value = {
    studio: { async explore() { return structuredClone(portfolio); }, async develop() { return structuredClone(strongCore); } },
    capabilityPlanner: { async bind() { return structuredClone(capabilityProposal); } },
    experiencePlanner: { async planSlice() { return structuredClone(slice); } },
    kernel: { async buildSlice({ sliceContract }) { return deliveryFor(sliceContract); } },
    reviewer: { async review() { return structuredClone(reviews[Math.min(reviewIndex++, reviews.length - 1)]); } },
    repairer: { async repairSlice({ contract }) { const repaired = structuredClone(contract); repaired.surfaces[0].content.body += " Исправлено по пикселям."; return repaired; } },
  };
  if (full) {
    const extraSurfaces = [
      { id: "messages", role: "support", title: "Ответы", recipe: "conversationList", states: ["populated/default"], actionIds: ["accept_help"], content: { headline: "Ответы на обещание", body: "Автор видит конкретные вклады соседей." } },
      { id: "profile", role: "support", title: "Профиль", recipe: "ownedProfile", states: ["populated/default"], actionIds: [], content: { headline: "Мои обещания", body: "Завершённые дела и вклады остаются в профиле." } },
    ];
    const surfaces = [...slice.surfaces, ...extraSurfaces];
    const fullContract = {
      schemaVersion: 2,
      surfaces,
      rootTabs: surfaces.map((surface, index) => ({ surfaceId: surface.id, title: surface.title, role: ["feed", "discovery", "short-video", "messaging", "services"][index] })),
      transitions: [...slice.transitions, { from: "messages", to: "result", actionId: "accept_help" }],
      acceptanceJourneys: [
        { id: "proof", actionIds: ["discover_promise", "offer_help", "complete_promise"] },
        { id: "response", actionIds: ["accept_help"] },
        { id: "permission", actionIds: ["capture_result"] },
      ],
      verification: { captures: surfaces.flatMap(surface => surface.states.map(state => ({ id: `${surface.id}--${state}` }))) },
    };
    value.expander = { async expand() { return structuredClone(fullContract); } };
    value.kernel.buildFull = async ({ fullContract: contract }) => deliveryFor(contract, "full");
    value.repairer.repairFull = async ({ contract }) => structuredClone(contract);
  }
  return value;
}

test("pipeline stops after exploration until a human selects one product mechanism", async () => {
  const result = await runNativeConceptPipeline({ request, adapters: adapters() });
  assert.equal(result.ok, false);
  assert.equal(result.stage, "selection");
  assert.equal(result.needsSelection, true);
  assert.equal(result.choices.length, 3);
  assert.equal(result.artifacts.productCore, undefined);
});

test("accepted vertical slice is rebuilt locally after a visual blocker", async () => {
  const result = await runNativeConceptPipeline({
    request,
    selectedCandidateId: "neighbour-promises",
    adapters: adapters({ reviews: [{ passed: false, blockers: ["Primary result is below the fold"] }, { passed: true, blockers: [] }] }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.stage, "slice-approved");
  assert.equal(result.artifacts.selection.selectedBy, "human");
  assert.equal(result.artifacts.sliceAttempts.length, 2);
  assert.match(result.artifacts.sliceContract.surfaces[0].content.body, /Исправлено/);
});

test("visual review is bounded to two repairs and never regenerates the product", async () => {
  const result = await runNativeConceptPipeline({
    request,
    selectedCandidateId: "neighbour-promises",
    adapters: adapters({ reviews: [{ passed: false, blockers: ["Still generic"] }] }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.stage, "slice-review");
  assert.equal(result.artifacts.sliceAttempts.length, 3);
  assert.equal(result.measurements.filter(item => item.id === "product-core").length, 1);
});

test("full expansion cannot start before the vertical slice passes", async () => {
  const value = adapters({ reviews: [{ passed: true, blockers: [] }, { passed: true, blockers: [] }], full: true });
  const result = await runNativeConceptPipeline({ request, selectedCandidateId: "neighbour-promises", mode: "full", adapters: value });
  assert.equal(result.ok, true);
  assert.equal(result.stage, "complete");
  assert.equal(result.artifacts.sliceApproval.passed, true);
  assert.equal(result.artifacts.fullAttempts.length, 1);
});
