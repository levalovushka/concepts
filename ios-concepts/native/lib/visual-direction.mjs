import { createHash } from "node:crypto";
import { verifyExperienceContract } from "./experience-contract.mjs";
import { verifyFactoryDevelopmentArtifact } from "./product-factory.mjs";
import { FACTORY_MINIMUM_QUALITY_FLOOR } from "./quality-policy.mjs";
import { auditVisualCalibrationCatalog, resolveVisualCalibration } from "./visual-calibration-catalog.mjs";

export const VISUAL_DIRECTION_COUNT = 3;
export const visualDirectionCount = strategy => strategy === "mimicry" ? 1 : VISUAL_DIRECTION_COUNT;
export const VISUAL_DIRECTION_AXES = Object.freeze([
  "product-hierarchy", "native-coherence", "cross-screen-consistency",
  "state-completeness", "strategy-integrity", "visual-risk",
]);
const DIFFERENTIATION_FORBIDDEN = Object.freeze([
  "decorative-gradients", "colored-icon-placeholders", "generic-hero-cards",
  "universal-done-copy", "card-stack-default",
]);
const REQUIRED_TOKENS = Object.freeze([
  "accent", "background", "groupedBackground", "surface", "fill",
  "separator", "textPrimary", "textSecondary",
]);
const NATIVE_PRIMITIVES = new Set([
  "NavigationStack", "TabView", "List", "Form", "ScrollView", "Grid", "Section",
  "Toolbar", "Button", "TextField", "SecureField", "Picker", "PhotosPicker",
  "ContentUnavailableView", "ShareLink", "Map", "VideoPlayer",
]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function stableId(prefix, value) {
  return `${prefix}-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

function hasText(value, minimum = 8) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function repairVisualDirection(direction, experienceContract, calibration) {
  const normalized = structuredClone(direction);
  const tabScreens = experienceContract.navigation.nodes
    .filter(item => item.presentation === "tab")
    .map(item => item.id);
  const proposedTabs = new Map((normalized.iconography?.tabRoles || []).map(item => [item.screenId, item.icon]));
  normalized.iconography ||= {};
  normalized.iconography.tabRoles = tabScreens.map(screenId => ({
    screenId,
    icon: proposedTabs.get(screenId) || (/saved|bookmark|favorite/iu.test(screenId) ? "bookmark" : "home"),
  }));

  const recipes = new Map();
  for (const recipe of normalized.componentRecipes || []) {
    const role = String(recipe.role || "").split(";")[0].trim();
    if (!role.startsWith("screen:")) continue;
    recipe.role = role;
    recipe.states = (recipe.states || []).map(item => String(item).split(":")[0].trim());
    recipes.set(role, recipe);
  }
  for (const node of experienceContract.navigation.nodes) {
    const role = `screen:${node.id}`;
    const expectedStates = experienceContract.states.find(item => item.screenId === node.id)
      ?.variants.filter(item => item.applicable).map(item => item.id) || ["populated/default"];
    const blueprint = experienceContract.screenBlueprints.find(item => item.screenId === node.id);
    const recipe = recipes.get(role) || {
      role,
      nativePrimitive: node.presentation === "tab" ? "List" : node.presentation === "sheet" ? "Form" : "NavigationStack",
      anatomy: blueprint?.contentOrder?.slice(0, 6) || ["navigation", "content"],
      prohibitions: blueprint?.prohibitedPatterns?.slice(0, 4) || ["Do not invent product actions"],
    };
    recipe.states = expectedStates;
    recipes.set(role, recipe);
  }
  normalized.componentRecipes = [...recipes.values()];
  normalized.evidenceRefs = [...new Set([
    ...(normalized.evidenceRefs || []),
    "selected-product-contract",
    "verified-experience-contract",
    ...(calibration ? [`calibration:${calibration.id}`] : []),
  ])];
  return normalized;
}

function auditDirection(direction, strategy, experienceContract, calibration, index) {
  const diagnostics = [];
  const base = `directions[${index}]`;
  if (direction?.schemaVersion !== 1) diagnostics.push(diagnostic("visual.schema-version.unsupported", "Visual Direction schemaVersion must be 1", `${base}.schemaVersion`));
  if (!hasText(direction?.id, 3) || !hasText(direction?.name, 2) || !hasText(direction?.rationale, 16)) diagnostics.push(diagnostic(
    "visual.identity.incomplete", "Visual Direction needs id, name and product rationale", base,
  ));
  if (direction?.strategy !== strategy) diagnostics.push(diagnostic("visual.strategy.drift", `Direction strategy must be ${strategy}`, `${base}.strategy`));
  const expectedChrome = strategy === "mimicry" ? "reference-flat" : "system";
  if (direction?.composition?.chrome !== expectedChrome) diagnostics.push(diagnostic(
    "visual.chrome.strategy-drift", `${strategy} requires ${expectedChrome} navigation chrome`, `${base}.composition.chrome`,
  ));
  if (!hasText(direction?.composition?.contentRhythm) || !hasText(direction?.composition?.density, 3)) diagnostics.push(diagnostic(
    "visual.composition.incomplete", "Visual Direction needs density and content rhythm", `${base}.composition`,
  ));

  const screens = new Set(experienceContract.navigation.nodes.map(item => item.id));
  const covered = new Set();
  for (const [familyIndex, family] of (direction?.composition?.screenFamilies || []).entries()) {
    if (!hasText(family?.structure, 8) || !hasText(family?.primaryRole, 3)) diagnostics.push(diagnostic(
      "visual.screen-family.incomplete", `Screen family ${family?.id || familyIndex} needs structure and primary role`, `${base}.composition.screenFamilies[${familyIndex}]`,
    ));
    for (const screen of family?.screens || []) {
      if (!screens.has(screen)) diagnostics.push(diagnostic("visual.screen-family.unknown", `Direction references unknown screen ${screen}`, `${base}.composition.screenFamilies[${familyIndex}].screens`));
      if (covered.has(screen)) diagnostics.push(diagnostic("visual.screen-family.duplicate", `Screen ${screen} belongs to multiple visual families`, `${base}.composition.screenFamilies[${familyIndex}].screens`));
      covered.add(screen);
    }
  }
  for (const screen of screens) if (!covered.has(screen)) diagnostics.push(diagnostic("visual.screen-family.missing", `Screen ${screen} has no visual family`, `${base}.composition.screenFamilies`));
  for (const token of REQUIRED_TOKENS) if (!hasText(direction?.tokens?.[token], 4)) diagnostics.push(diagnostic(
    "visual.token.missing", `Visual Direction lacks semantic token ${token}`, `${base}.tokens.${token}`,
  ));

  const expectedIcons = strategy === "mimicry" ? "lucide-assets" : "sf-symbols";
  if (direction?.iconography?.productChromeSource !== expectedIcons) diagnostics.push(diagnostic(
    "visual.iconography.strategy-drift", `${strategy} requires ${expectedIcons} for product chrome`, `${base}.iconography.productChromeSource`,
  ));
  if (!["semibold", "bold"].includes(direction?.iconography?.weight)) diagnostics.push(diagnostic(
    "visual.iconography.weight", "Product icons must use semibold or bold weight", `${base}.iconography.weight`,
  ));
  const tabScreens = experienceContract.navigation.nodes.filter(item => item.presentation === "tab").map(item => item.id);
  const tabRoles = Array.isArray(direction?.iconography?.tabRoles) ? direction.iconography.tabRoles : [];
  const tabRoleIds = new Set();
  for (const [roleIndex, role] of tabRoles.entries()) {
    if (tabRoleIds.has(role?.screenId)) diagnostics.push(diagnostic("visual.iconography.tab-duplicate", `Duplicate icon role for ${role?.screenId}`, `${base}.iconography.tabRoles[${roleIndex}]`));
    tabRoleIds.add(role?.screenId);
    if (!tabScreens.includes(role?.screenId)) diagnostics.push(diagnostic("visual.iconography.tab-unknown", `Icon role references non-tab screen ${role?.screenId}`, `${base}.iconography.tabRoles[${roleIndex}].screenId`));
    if (!hasText(role?.icon, 2)) diagnostics.push(diagnostic("visual.iconography.tab-icon-missing", `Tab ${role?.screenId || roleIndex} needs an icon`, `${base}.iconography.tabRoles[${roleIndex}].icon`));
  }
  for (const screen of tabScreens) if (!tabRoleIds.has(screen)) diagnostics.push(diagnostic(
    "visual.iconography.tab-missing", `Tab screen ${screen} has no explicit icon role`, `${base}.iconography.tabRoles`,
  ));
  if (!Array.isArray(direction?.rules?.allowedPatterns) || !direction.rules.allowedPatterns.length) diagnostics.push(diagnostic(
    "visual.allowed-patterns.missing", "Visual Direction needs at least one allowed product pattern", `${base}.rules.allowedPatterns`,
  ));

  const recipes = new Map((direction?.componentRecipes || []).map(item => [item.role, item]));
  for (const screen of screens) {
    const role = `screen:${screen}`;
    const recipe = recipes.get(role);
    if (!recipe) {
      diagnostics.push(diagnostic("visual.recipe.screen-missing", `Screen ${screen} has no component recipe`, `${base}.componentRecipes`));
      continue;
    }
    if (!NATIVE_PRIMITIVES.has(recipe.nativePrimitive)) diagnostics.push(diagnostic(
      "visual.recipe.primitive-unsupported", `${role} uses unsupported primitive ${recipe.nativePrimitive}`, `${base}.componentRecipes.${role}.nativePrimitive`,
    ));
    if (!Array.isArray(recipe.anatomy) || recipe.anatomy.length < 2 || !Array.isArray(recipe.prohibitions) || !recipe.prohibitions.length) diagnostics.push(diagnostic(
      "visual.recipe.incomplete", `${role} needs explicit anatomy and prohibitions`, `${base}.componentRecipes.${role}`,
    ));
    const expectedStates = experienceContract.states.find(item => item.screenId === screen)?.variants.filter(item => item.applicable).map(item => item.id) || [];
    for (const state of expectedStates) if (!recipe.states?.includes(state)) diagnostics.push(diagnostic(
      "visual.recipe.state-missing", `${role} does not cover ${state}`, `${base}.componentRecipes.${role}.states`,
    ));
  }
  if (strategy === "differentiation") for (const pattern of DIFFERENTIATION_FORBIDDEN) if (!direction?.rules?.forbiddenPatterns?.includes(pattern)) diagnostics.push(diagnostic(
    "visual.forbidden-pattern.missing", `Differentiation must explicitly forbid ${pattern}`, `${base}.rules.forbiddenPatterns`,
  ));
  if (!Array.isArray(direction?.evidenceRefs) || direction.evidenceRefs.length < 2) diagnostics.push(diagnostic(
    "visual.evidence.incomplete", "Visual Direction must cite product and experience evidence", `${base}.evidenceRefs`,
  ));
  if (calibration && !direction?.evidenceRefs?.includes(`calibration:${calibration.id}`)) diagnostics.push(diagnostic(
    "visual.calibration.evidence-missing", `Visual Direction must cite selected calibration ${calibration.id}`, `${base}.evidenceRefs`,
  ));
  if (direction?.assessment !== undefined || direction?.scores !== undefined) diagnostics.push(diagnostic(
    "visual.self-assessment.forbidden", "Visual generator cannot score its own direction", base,
  ));
  return diagnostics;
}

export function createVisualDevelopmentArtifact(result) {
  if (!result?.ok || !result.receipt || !result.contract) throw new TypeError(
    "A successful Visual Direction result is required",
  );
  return Object.freeze({
    schemaVersion: 1,
    directions: structuredClone(result.directions),
    selectionReceipt: structuredClone(result.receipt),
    visualDirectionContract: structuredClone(result.contract),
  });
}

export function verifyVisualDevelopmentArtifact(artifact, factoryArtifact, experienceContract) {
  const diagnostics = [
    ...verifyFactoryDevelopmentArtifact(factoryArtifact).map(item => Object.freeze({ ...item, path: `factoryArtifact.${item.path}` })),
    ...verifyExperienceContract(experienceContract, factoryArtifact).map(item => Object.freeze({ ...item, path: `experienceContract.${item.path}` })),
  ];
  if (!artifact || typeof artifact !== "object") return [...diagnostics, diagnostic("visual.artifact.required", "Visual Development artifact is required", "visualArtifact")];
  if (artifact.schemaVersion !== 1) diagnostics.push(diagnostic("visual.artifact.schema-version", "Visual Development schemaVersion must be 1", "schemaVersion"));
  const directions = Array.isArray(artifact.directions) ? artifact.directions : [];
  const strategy = factoryArtifact.factoryRequest.strategy;
  const expectedDirectionCount = visualDirectionCount(strategy);
  if (directions.length !== expectedDirectionCount) diagnostics.push(diagnostic("visual.direction.count", `Visual artifact must retain ${expectedDirectionCount} direction(s) for ${strategy}`, "directions"));
  const referenceProfileId = factoryArtifact.productDevelopment.productContract.reference?.profileId || null;
  const calibration = resolveVisualCalibration({ strategy, referenceProfileId });
  if (!calibration) diagnostics.push(diagnostic("visual.calibration.missing", `No approved calibration for ${strategy}/${referenceProfileId || "native"}`, "visualDirectionContract"));
  for (const [index, direction] of directions.entries()) diagnostics.push(...auditDirection(direction, strategy, experienceContract, calibration, index));
  const receipt = artifact.selectionReceipt;
  const contract = artifact.visualDirectionContract;
  const { receiptId: _receiptId, ...receiptBody } = receipt || {};
  const expectedReceiptId = stableId("visual-selection", receiptBody);
  if (receipt?.receiptId !== expectedReceiptId) diagnostics.push(diagnostic("visual.receipt.unstable", `Visual Selection Receipt id must be ${expectedReceiptId}`, "selectionReceipt.receiptId"));
  if (receipt?.productContractId !== factoryArtifact.productDevelopment.productContract.contractId
      || receipt?.experienceContractId !== experienceContract.experienceContractId) diagnostics.push(diagnostic(
    "visual.receipt.input-drift", "Visual Selection Receipt points to different product or experience contracts", "selectionReceipt",
  ));
  const selected = directions.find(item => item.id === receipt?.selectedDirectionId);
  if (!selected) diagnostics.push(diagnostic("visual.receipt.winner-missing", "Visual Selection Receipt winner is absent from directions", "selectionReceipt.selectedDirectionId"));
  const { visualDirectionContractId: _contractId, ...contractBody } = contract || {};
  const expectedContractId = stableId("visual", contractBody);
  if (contract?.visualDirectionContractId !== expectedContractId) diagnostics.push(diagnostic("visual.contract.unstable", `Visual Direction Contract id must be ${expectedContractId}`, "visualDirectionContract.visualDirectionContractId"));
  if (contract?.selectionReceiptId !== receipt?.receiptId || contract?.direction?.id !== receipt?.selectedDirectionId
      || JSON.stringify(contract?.direction) !== JSON.stringify(selected)) diagnostics.push(diagnostic(
    "visual.contract.selection-drift", "Visual Direction Contract is not reproducible from the Selection Receipt winner", "visualDirectionContract",
  ));
  if (contract?.productContractId !== receipt?.productContractId || contract?.experienceContractId !== receipt?.experienceContractId) diagnostics.push(diagnostic(
    "visual.contract.input-drift", "Visual Direction Contract points to different upstream contracts", "visualDirectionContract",
  ));
  if (contract?.calibrationId !== calibration?.id) diagnostics.push(diagnostic(
    "visual.contract.calibration-drift", "Visual Direction Contract does not retain the selected calibration", "visualDirectionContract.calibrationId",
  ));
  return diagnostics;
}

export async function developVisualDirection({ factoryArtifact, experienceContract, generator, evaluator }) {
  const diagnostics = [
    ...verifyFactoryDevelopmentArtifact(factoryArtifact).map(item => Object.freeze({ ...item, path: `factoryArtifact.${item.path}` })),
    ...verifyExperienceContract(experienceContract, factoryArtifact).map(item => Object.freeze({ ...item, path: `experienceContract.${item.path}` })),
  ];
  if (!generator || typeof generator.generateDirections !== "function") diagnostics.push(diagnostic("visual.generator.required", "Visual generator must implement generateDirections", "generator"));
  const strategy = factoryArtifact?.factoryRequest?.strategy;
  if (strategy !== "mimicry" && (!evaluator || typeof evaluator.evaluateDirections !== "function")) diagnostics.push(diagnostic("visual.evaluator.required", "Independent visual evaluator must implement evaluateDirections", "evaluator"));
  if (diagnostics.length) return { ok: false, diagnostics, directions: [], receipt: null, contract: null };

  diagnostics.push(...auditVisualCalibrationCatalog().map(item => Object.freeze({ ...item, severity: "error", path: `visualCalibrations.${item.path}` })));
  const referenceProfileId = factoryArtifact.productDevelopment.productContract.reference?.profileId || null;
  const calibration = resolveVisualCalibration({ strategy, referenceProfileId });
  if (!calibration) diagnostics.push(diagnostic("visual.calibration.missing", `No approved calibration for ${strategy}/${referenceProfileId || "native"}`, "calibration"));
  if (diagnostics.length) return { ok: false, diagnostics, directions: [], receipt: null, contract: null };
  let directions = await generator.generateDirections({
    productContract: structuredClone(factoryArtifact.productDevelopment.productContract),
    experienceContract: structuredClone(experienceContract),
    strategy,
    referenceProfileId,
    calibration: structuredClone(calibration),
  });
  if (generator.autoRepairDirection && Array.isArray(directions)) directions = directions.map(direction =>
    repairVisualDirection(direction, experienceContract, calibration));
  const expectedDirectionCount = visualDirectionCount(strategy);
  if (!Array.isArray(directions) || directions.length !== expectedDirectionCount) diagnostics.push(diagnostic(
    "visual.direction.count", `Visual generator must return exactly ${expectedDirectionCount} direction(s) for ${strategy}`, "directions",
  ));
  const ids = new Set();
  const fingerprints = new Set();
  for (const [index, direction] of (Array.isArray(directions) ? directions : []).entries()) {
    if (ids.has(direction.id)) diagnostics.push(diagnostic("visual.direction.id-duplicate", `Duplicate direction ${direction.id}`, `directions[${index}].id`));
    ids.add(direction.id);
    const fingerprint = `${direction.composition?.density}|${(direction.composition?.screenFamilies || []).map(item => item.structure).join("|")}`;
    if (strategy !== "mimicry" && fingerprints.has(fingerprint)) diagnostics.push(diagnostic("visual.direction.not-diverse", `Direction ${direction.id} repeats an existing composition`, `directions[${index}].composition`));
    fingerprints.add(fingerprint);
    diagnostics.push(...auditDirection(direction, strategy, experienceContract, calibration, index));
  }
  if (diagnostics.length) return { ok: false, diagnostics, directions: Array.isArray(directions) ? directions : [], receipt: null, contract: null };

  const evaluation = strategy === "mimicry" ? { assessments: [] } : await evaluator.evaluateDirections({
      productContract: structuredClone(factoryArtifact.productDevelopment.productContract),
      experienceContract: structuredClone(experienceContract),
      directions: structuredClone(directions),
      calibration: structuredClone(calibration),
      rubric: { axes: VISUAL_DIRECTION_AXES, scoreRange: [0, 10], minimumAxisScore: FACTORY_MINIMUM_QUALITY_FLOOR },
    });
  const assessments = Array.isArray(evaluation?.assessments) ? evaluation.assessments : [];
  const assessmentById = new Map();
  for (const [index, assessment] of assessments.entries()) {
    if (assessmentById.has(assessment.directionId)) diagnostics.push(diagnostic("visual.evaluation.duplicate", `Duplicate assessment for ${assessment.directionId}`, `assessments[${index}]`));
    if (!ids.has(assessment.directionId)) diagnostics.push(diagnostic("visual.evaluation.unknown", `Assessment references unknown direction ${assessment.directionId}`, `assessments[${index}]`));
    assessmentById.set(assessment.directionId, assessment);
  }
  const comparisons = directions.map(direction => {
    if (strategy === "mimicry") return {
      id: direction.id,
      eligible: true,
      minimumAxisScore: null,
      axisScores: {},
      rejectionReasons: [],
      selectionBasis: `approved-golden-calibration:${calibration.id}`,
    };
    const assessment = assessmentById.get(direction.id);
    const axes = new Map((assessment?.axes || []).map(item => [item.id, item]));
    const reasons = [];
    const scores = {};
    for (const axisId of VISUAL_DIRECTION_AXES) {
      const axis = axes.get(axisId);
      if (!axis || !Number.isFinite(axis.score) || axis.score < 0 || axis.score > 10 || !hasText(axis.rationale, 24)) reasons.push(`${axisId} assessment is missing or ungrounded`);
      else {
        scores[axisId] = axis.score;
        if (axis.score < FACTORY_MINIMUM_QUALITY_FLOOR) reasons.push(`${axisId} scored ${axis.score}, below ${FACTORY_MINIMUM_QUALITY_FLOOR}`);
      }
    }
    return { id: direction.id, eligible: reasons.length === 0, minimumAxisScore: Object.keys(scores).length ? Math.min(...Object.values(scores)) : 0, axisScores: scores, rejectionReasons: reasons };
  });
  if (strategy !== "mimicry") for (const direction of directions) if (!assessmentById.has(direction.id)) diagnostics.push(diagnostic("visual.evaluation.missing", `Direction ${direction.id} has no independent assessment`, "assessments"));
  const selected = comparisons.filter(item => item.eligible).sort((left, right) => (right.minimumAxisScore || 0) - (left.minimumAxisScore || 0) || left.id.localeCompare(right.id))[0] || null;
  if (!selected) diagnostics.push(diagnostic("visual.selection.no-winner", "No Visual Direction cleared every independent axis", "receipt"));
  const receiptBody = {
    schemaVersion: 1,
    productContractId: factoryArtifact.productDevelopment.productContract.contractId,
    experienceContractId: experienceContract.experienceContractId,
    calibrationId: calibration.id,
    selectionMode: strategy === "mimicry" ? "approved-golden-calibration" : "independent-direction-evaluation",
    selectedDirectionId: selected?.id || null,
    floor: FACTORY_MINIMUM_QUALITY_FLOOR,
    directions: comparisons,
  };
  const receipt = Object.freeze({ receiptId: stableId("visual-selection", receiptBody), ...receiptBody });
  if (!selected) return { ok: false, diagnostics, directions, receipt, contract: null };
  const contractBody = {
    schemaVersion: 1,
    productContractId: receiptBody.productContractId,
    experienceContractId: receiptBody.experienceContractId,
    selectionReceiptId: receipt.receiptId,
    calibrationId: calibration.id,
    direction: directions.find(item => item.id === selected.id),
  };
  const contract = Object.freeze({ visualDirectionContractId: stableId("visual", contractBody), ...contractBody });
  return { ok: diagnostics.length === 0, diagnostics, directions, receipt, contract };
}
