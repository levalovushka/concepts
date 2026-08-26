import { verifyExperienceContract } from "./experience-contract.mjs";
import { verifyFactoryDevelopmentArtifact } from "./product-factory.mjs";
import { runProductQualityLoop } from "./product-quality-loop.mjs";
import { reviewProductUI } from "./product-ui-critic.mjs";
import { verifyVisualDevelopmentArtifact } from "./visual-direction.mjs";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function validateRenderedDelivery(delivery, factoryArtifact, experienceContract, visualDevelopment) {
  const diagnostics = [];
  const productContract = factoryArtifact.productDevelopment.productContract;
  if (!delivery || typeof delivery !== "object") return [diagnostic("release.delivery.required", "Renderer must return a delivery", "delivery")];
  if (delivery.productContractId !== productContract.contractId) diagnostics.push(diagnostic(
    "release.delivery.product-drift", "Rendered delivery does not point to the selected Product Contract", "delivery.productContractId",
  ));
  if (delivery.experienceContractId !== experienceContract.experienceContractId) diagnostics.push(diagnostic(
    "release.delivery.experience-drift", "Rendered delivery does not point to the verified Experience Contract", "delivery.experienceContractId",
  ));
  if (JSON.stringify(delivery.contentManifest || null) !== JSON.stringify(experienceContract.content)) diagnostics.push(diagnostic(
    "release.delivery.content-drift", "Renderer did not consume the canonical Product Integrity content manifest", "delivery.contentManifest",
  ));
  const expectedBlueprints = new Set(experienceContract.screenBlueprints.map(item => item.screenId));
  const consumedBlueprints = new Set(delivery.consumedBlueprintScreenIds || []);
  for (const screenId of expectedBlueprints) if (!consumedBlueprints.has(screenId)) diagnostics.push(diagnostic(
    "release.delivery.blueprint-missing", `Renderer did not consume semantic blueprint ${screenId}`, "delivery.consumedBlueprintScreenIds",
  ));
  for (const screenId of consumedBlueprints) if (!expectedBlueprints.has(screenId)) diagnostics.push(diagnostic(
    "release.delivery.blueprint-unknown", `Renderer claims unknown semantic blueprint ${screenId}`, "delivery.consumedBlueprintScreenIds",
  ));
  const visualContract = visualDevelopment.visualDirectionContract;
  if (delivery.visualDirectionContractId !== visualContract.visualDirectionContractId) diagnostics.push(diagnostic(
    "release.delivery.visual-drift", "Rendered delivery does not point to the selected Visual Direction Contract", "delivery.visualDirectionContractId",
  ));
  if (delivery.concept?.productDevelopment?.productContract?.contractId !== productContract.contractId) diagnostics.push(diagnostic(
    "release.delivery.concept-drift", "Rendered concept embeds a different Product Contract", "delivery.concept.productDevelopment.productContract",
  ));
  if (delivery.concept?.native?.design?.strategy !== productContract.reference?.strategy) diagnostics.push(diagnostic(
    "release.delivery.strategy-drift", "Rendered concept strategy differs from Product Contract", "delivery.concept.native.design.strategy",
  ));
  if (JSON.stringify(delivery.concept?.native?.design?.tokens || {}) !== JSON.stringify(visualContract.direction.tokens)) diagnostics.push(diagnostic(
    "release.delivery.tokens-drift", "Rendered concept does not consume selected semantic visual tokens", "delivery.concept.native.design.tokens",
  ));
  if (JSON.stringify(delivery.concept?.native?.design?.iconography || {}) !== JSON.stringify(visualContract.direction.iconography)) diagnostics.push(diagnostic(
    "release.delivery.iconography-drift", "Rendered concept does not consume selected iconography rules", "delivery.concept.native.design.iconography",
  ));
  const expectedRecipes = new Set(visualContract.direction.componentRecipes.map(item => item.role));
  const consumedRecipes = new Set(delivery.consumedRecipeRoles || []);
  for (const role of expectedRecipes) if (!consumedRecipes.has(role)) diagnostics.push(diagnostic(
    "release.delivery.recipe-missing", `Renderer did not consume required component recipe ${role}`, "delivery.consumedRecipeRoles",
  ));
  for (const role of consumedRecipes) if (!expectedRecipes.has(role)) diagnostics.push(diagnostic(
    "release.delivery.recipe-unknown", `Renderer claims an unknown component recipe ${role}`, "delivery.consumedRecipeRoles",
  ));

  const expected = new Set(experienceContract.states.flatMap(policy =>
    policy.variants.filter(item => item.applicable).map(item => `${policy.screenId}|${item.id}`)));
  const requiredDeviceClasses = new Set(["current", "small-phone"]);
  const devices = Array.isArray(delivery.testMatrix?.devices) ? delivery.testMatrix.devices : [];
  const deviceIds = new Set();
  const deviceClasses = new Set();
  for (const [index, device] of devices.entries()) {
    if (typeof device?.id !== "string" || typeof device?.name !== "string" || !requiredDeviceClasses.has(device?.class)) diagnostics.push(diagnostic(
      "release.device.invalid", "Every test device needs a stable id, simulator name and supported device class", `delivery.testMatrix.devices[${index}]`,
    ));
    if (deviceIds.has(device?.id)) diagnostics.push(diagnostic("release.device.duplicate", `Duplicate test device ${device?.id}`, `delivery.testMatrix.devices[${index}].id`));
    deviceIds.add(device?.id);
    deviceClasses.add(device?.class);
  }
  for (const deviceClass of requiredDeviceClasses) if (!deviceClasses.has(deviceClass)) diagnostics.push(diagnostic(
    "release.device-class.missing", `Release needs a ${deviceClass} simulator`, "delivery.testMatrix.devices",
  ));
  const seen = new Set();
  for (const [index, capture] of (delivery.captures || []).entries()) {
    const stateKey = `${capture.surface}|${capture.state}`;
    const key = `${capture.deviceId}|${stateKey}`;
    if (seen.has(key)) diagnostics.push(diagnostic("release.capture.duplicate", `Duplicate capture ${key}`, `delivery.captures[${index}]`));
    seen.add(key);
    if (!deviceIds.has(capture.deviceId)) diagnostics.push(diagnostic("release.capture.device-unknown", `Capture ${key} uses an unknown device`, `delivery.captures[${index}].deviceId`));
    if (!expected.has(stateKey)) diagnostics.push(diagnostic("release.capture.unknown", `Capture ${stateKey} is not an applicable Experience Contract state`, `delivery.captures[${index}]`));
    if (typeof capture.id !== "string" || typeof capture.path !== "string" || typeof capture.sha256 !== "string" || capture.sha256.length < 8) diagnostics.push(diagnostic(
      "release.capture.incomplete", `Capture ${key} needs stable id, path and content hash`, `delivery.captures[${index}]`,
    ));
  }
  for (const deviceId of deviceIds) for (const stateKey of expected) if (!seen.has(`${deviceId}|${stateKey}`)) diagnostics.push(diagnostic(
    "release.capture.missing", `Applicable Experience Contract state ${stateKey} has no fresh capture on ${deviceId}`, "delivery.captures",
  ));

  const journeyIds = new Set(experienceContract.journeys.map(item => item.id));
  const journeyReceipts = new Map((delivery.interactionReceipts || []).map(item => [item.journeyId, item]));
  for (const journey of experienceContract.journeys) {
    const receipt = journeyReceipts.get(journey.id);
    if (!receipt) diagnostics.push(diagnostic("release.journey.missing", `Journey ${journey.id} has no executable interaction receipt`, "delivery.interactionReceipts"));
    else {
      if (receipt.passed !== true) diagnostics.push(diagnostic("release.journey.failed", `Journey ${journey.id} did not pass`, `delivery.interactionReceipts.${journey.id}`));
      if (JSON.stringify(receipt.actionIds || []) !== JSON.stringify(journey.actionIds)) diagnostics.push(diagnostic(
        "release.journey.action-drift", `Journey ${journey.id} did not execute the contracted action sequence`, `delivery.interactionReceipts.${journey.id}.actionIds`,
      ));
      if (typeof receipt.evidencePath !== "string" || typeof receipt.sha256 !== "string" || receipt.sha256.length < 8) diagnostics.push(diagnostic(
        "release.journey.evidence-incomplete", `Journey ${journey.id} needs fresh executable evidence`, `delivery.interactionReceipts.${journey.id}`,
      ));
    }
  }
  for (const journeyId of journeyReceipts.keys()) if (!journeyIds.has(journeyId)) diagnostics.push(diagnostic(
    "release.journey.unknown", `Interaction receipt references unknown journey ${journeyId}`, "delivery.interactionReceipts",
  ));
  const expectedPermissionKeys = new Set(experienceContract.permissionFlows
    .filter(item => USER_CONSENT_CAPABILITY_KEYS.has(item.key)).map(item => item.key));
  const permissionReceipts = new Map((delivery.permissionReceipts || []).map(item => [item.permissionKey, item]));
  for (const key of expectedPermissionKeys) {
    const receipt = permissionReceipts.get(key);
    if (!receipt) {
      diagnostics.push(diagnostic("release.permission-receipt.missing", `User-consent permission ${key} has no executable prompt receipt`, "delivery.permissionReceipts"));
      continue;
    }
    if (receipt.promptMode !== "system-dialog") diagnostics.push(diagnostic(
      "release.permission-receipt.mocked", `Permission ${key} was not verified through the system dialog seam`, `delivery.permissionReceipts.${key}.promptMode`,
    ));
    for (const device of devices) {
      const evidence = receipt.devices?.find(item => item.deviceId === device.id);
      if (!evidence || evidence.grantedPassed !== true || evidence.deniedPassed !== true
          || typeof evidence.evidencePath !== "string" || typeof evidence.sha256 !== "string") diagnostics.push(diagnostic(
        "release.permission-receipt.incomplete", `Permission ${key} lacks granted and denied evidence on ${device.id}`, `delivery.permissionReceipts.${key}.devices`,
      ));
    }
  }
  for (const key of permissionReceipts.keys()) if (!expectedPermissionKeys.has(key)) diagnostics.push(diagnostic(
    "release.permission-receipt.unknown", `Permission receipt references uncontracted permission ${key}`, "delivery.permissionReceipts",
  ));
  if (delivery.buildReceipt?.passed !== true || typeof delivery.buildReceipt?.xcodeProjectPath !== "string" || typeof delivery.buildReceipt?.sha256 !== "string") diagnostics.push(diagnostic(
    "release.build.evidence-incomplete", "Release needs a successful Xcode build receipt with project path and source hash", "delivery.buildReceipt",
  ));
  return diagnostics;
}

export async function releaseFactoryProduct({ factoryArtifact, experienceContract, visualDevelopment, renderer, critic, reviser }) {
  const diagnostics = [
    ...verifyFactoryDevelopmentArtifact(factoryArtifact).map(item => Object.freeze({ ...item, path: `factoryArtifact.${item.path}` })),
    ...verifyExperienceContract(experienceContract, factoryArtifact).map(item => Object.freeze({ ...item, path: `experienceContract.${item.path}` })),
    ...verifyVisualDevelopmentArtifact(visualDevelopment, factoryArtifact, experienceContract).map(item => Object.freeze({ ...item, path: `visualDevelopment.${item.path}` })),
  ];
  if (!renderer || typeof renderer.render !== "function") diagnostics.push(diagnostic(
    "release.renderer.required", "Factory release requires renderer.render({ factoryArtifact, experienceContract, revision, attempt })", "renderer",
  ));
  if (!critic || typeof critic.review !== "function") diagnostics.push(diagnostic(
    "release.critic.required", "Factory release requires an independent product/UI critic", "critic",
  ));
  if (!reviser || typeof reviser.revise !== "function") diagnostics.push(diagnostic(
    "release.reviser.required", "Factory release requires a revision adapter before review starts", "reviser",
  ));
  if (diagnostics.length) return { ok: false, diagnostics, attempts: [], delivery: null };

  const render = (revision, attempt) => renderer.render({
    factoryArtifact: structuredClone(factoryArtifact),
    experienceContract: structuredClone(experienceContract),
    visualDevelopment: structuredClone(visualDevelopment),
    revision: structuredClone(revision),
    attempt,
  });
  const renderAttempts = [];
  let initialDelivery = null;
  const revisionHistory = [];
  const cumulativeRevision = () => revisionHistory.length
    ? { ...structuredClone(revisionHistory.at(-1)), history: structuredClone(revisionHistory) }
    : null;
  let successfulRenderAttempt = 0;
  const maximumRenderAttempts = Math.max(1, Number(process.env.CAMO_RENDER_MAX_ATTEMPTS || 3));
  for (let attempt = 1; attempt <= maximumRenderAttempts; attempt += 1) {
    try {
      initialDelivery = await render(cumulativeRevision(), attempt);
      renderAttempts.push(Object.freeze({ attempt, status: "completed", diagnostics: Object.freeze([]) }));
      successfulRenderAttempt = attempt;
      break;
    } catch (error) {
      const failure = diagnostic(
        "release.render.failed",
        String(error?.message || error).slice(0, 12_000),
        `renderAttempts[${attempt - 1}]`,
      );
      renderAttempts.push(Object.freeze({ attempt, status: "failed", diagnostics: Object.freeze([failure]) }));
      if (attempt === maximumRenderAttempts) return {
        ok: false, delivery: null, attempts: Object.freeze([]), renderAttempts: Object.freeze(renderAttempts),
        diagnostics: Object.freeze([failure, diagnostic("release.render.iterations-exhausted", `Native render/build still fails after ${maximumRenderAttempts} automated attempt(s)`, "renderAttempts")]),
      };
      const revision = await reviser.revise({
        attempt,
        factoryArtifact: structuredClone(factoryArtifact),
        experienceContract: structuredClone(experienceContract),
        visualDevelopment: structuredClone(visualDevelopment),
        delivery: null,
        receipt: null,
        diagnostics: [failure],
      });
      revisionHistory.push(revision);
    }
  }
  const quality = await runProductQualityLoop({
    initialDelivery,
    reviewer: { async review({ attempt, delivery }) {
      const renderDiagnostics = validateRenderedDelivery(delivery, factoryArtifact, experienceContract, visualDevelopment);
      if (renderDiagnostics.length) return { ok: false, receipt: null, diagnostics: renderDiagnostics };
      return reviewProductUI({ concept: delivery.concept, captures: delivery.captures, integrityContract: experienceContract, reviewer: critic });
    } },
    reviser: { async revise({ attempt, delivery, receipt, diagnostics: reviewDiagnostics }) {
      const revision = await reviser.revise({
        attempt,
        factoryArtifact: structuredClone(factoryArtifact),
        experienceContract: structuredClone(experienceContract),
        visualDevelopment: structuredClone(visualDevelopment),
        delivery: structuredClone(delivery),
        receipt: structuredClone(receipt),
        diagnostics: structuredClone(reviewDiagnostics),
      });
      revisionHistory.push(revision);
      return render(cumulativeRevision(), successfulRenderAttempt + attempt);
    } },
  });
  return { ...quality, renderAttempts: Object.freeze(renderAttempts) };
}
import { USER_CONSENT_CAPABILITY_KEYS } from "./capability-catalog.mjs";
