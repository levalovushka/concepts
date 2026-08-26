import assert from "node:assert/strict";
import test from "node:test";
import { verifyNativeFullContractV2 } from "../lib/native-full-contract-v2.mjs";
import { createProductCoreArtifact } from "../lib/product-core-v2.mjs";
import { compileCapabilityPlanV2 } from "../lib/capability-plan-v2.mjs";
import { portfolio, strongCapabilityProposal, strongCore, strongSlice } from "../fixtures/pipeline-v2/strong-product.mjs";

const productCoreArtifact = createProductCoreArtifact({ request: { id: "full-contract-test" }, core: strongCore, portfolio }).artifact;
const capabilityPlan = compileCapabilityPlanV2({
  productCoreArtifact, target: { permissions: [{ key: "camera" }] }, proposal: strongCapabilityProposal,
  bundleId: "com.camo.neighbourpromises",
}).plan;
const extra = [
  { id: "responses", role: "support", title: "Ответы", recipe: "conversationList", states: ["populated/default"], actionIds: ["accept_help"], content: { headline: "Ответы соседей", body: "Автор видит предложения и выбирает конкретный вклад." } },
  { id: "profile", role: "support", title: "Профиль", recipe: "ownedProfile", states: ["populated/default"], actionIds: [], content: { headline: "Мои обещания", body: "Завершённые дела и вклады остаются в профиле." } },
];
const surfaces = [...strongSlice.surfaces, ...extra];
const contract = {
  schemaVersion: 2, surfaces,
  rootTabs: surfaces.map((surface, index) => ({ surfaceId: surface.id, title: surface.title, role: ["feed", "discovery", "short-video", "messaging", "services"][index] })),
  transitions: [...strongSlice.transitions, { from: "responses", to: "result", actionId: "accept_help" }],
  acceptanceJourneys: [
    { id: "proof", actionIds: ["discover_promise", "offer_help", "complete_promise"] },
    { id: "response", actionIds: ["accept_help"] },
    { id: "permission", actionIds: ["capture_result"] },
  ],
  verification: { captures: surfaces.flatMap(surface => surface.states.map(state => ({ id: `${surface.id}--${state}` }))) },
};

test("full contract preserves the accepted slice and closes tabs, actions, journeys and captures", () => {
  assert.deepEqual(verifyNativeFullContractV2(contract, { productCoreArtifact, capabilityPlan, acceptedSlice: strongSlice }), []);
});

test("full contract rejects a regenerated slice and a duplicated action owner", () => {
  const broken = structuredClone(contract);
  broken.surfaces[0].content.headline = "Другой продукт";
  broken.surfaces.at(-1).actionIds = ["discover_promise"];
  const codes = verifyNativeFullContractV2(broken, { productCoreArtifact, capabilityPlan, acceptedSlice: strongSlice }).map(item => item.code);
  assert.ok(codes.includes("full.slice-drift"));
  assert.ok(codes.includes("full.action-owner"));
});
