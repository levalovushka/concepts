import { createHash } from "node:crypto";
import { developProductConcept, developSelectedProductConcept, FACTORY_PRODUCT_QUALITY_AXES, PRODUCT_STRESS_AXES, verifyProductDevelopmentArtifact } from "./product-maturity.mjs";
import { auditReferenceProfile, resolveReferenceProfile } from "./reference-profile-catalog.mjs";
import { resolveProductTarget } from "./product-target-catalog.mjs";
import { auditWorldModel, compilePermissionGrounding } from "./world-model.mjs";
import { USER_CONSENT_CAPABILITY_KEYS } from "./capability-catalog.mjs";

export const PRODUCT_FACTORY_SCHEMA_VERSION = 1;
export const PRODUCT_FACTORY_CANDIDATE_COUNT = 3;
const FACTORY_REQUEST_PROPERTIES = Object.freeze(new Set([
  "schemaVersion", "id", "request", "targetProduct", "strategy", "preferences", "capabilityPolicy",
]));

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function text(value, minimum = 8) {
  return typeof value === "string" && value.trim().length >= minimum;
}

function textItems(value, minimum = 1) {
  return Array.isArray(value) && value.length >= minimum && value.every(item => text(item));
}

function factoryRequestId(request) {
  if (text(request?.id, 3)) return request.id.trim();
  const identity = JSON.stringify({
    request: request?.request?.trim(),
    targetProduct: request?.targetProduct,
    strategy: request?.strategy,
    capabilityPolicy: request?.capabilityPolicy || "organic",
    preferences: request?.preferences || [],
  });
  return `factory-${createHash("sha256").update(identity).digest("hex").slice(0, 16)}`;
}

function compileExplorationReceipt(brief, seeds, evaluation) {
  const seedIds = seeds.map(item => item?.id);
  const assessedIds = evaluation?.assessments?.map(item => item?.seedId) || [];
  const selectedSeedId = evaluation?.selectedSeedId;
  const diagnostics = [];
  if (seeds.length !== brief.candidateCount || new Set(seedIds).size !== seeds.length || seedIds.some(id => !text(id, 3))) diagnostics.push(diagnostic(
    "factory.ideation.invalid", `Ideation must contain ${brief.candidateCount} uniquely identified seeds`, "ideaPortfolio",
  ));
  if (assessedIds.length !== seeds.length || new Set(assessedIds).size !== assessedIds.length || assessedIds.some(id => !seedIds.includes(id))) diagnostics.push(diagnostic(
    "factory.idea-evaluation.invalid", "Independent idea evaluation must assess every seed exactly once", "ideaEvaluation.assessments",
  ));
  if (!seedIds.includes(selectedSeedId)) diagnostics.push(diagnostic(
    "factory.idea-selection.invalid", "Independent idea evaluator selected an unknown seed", "ideaEvaluation.selectedSeedId",
  ));
  const requiredPermissions = new Set((brief.permissions || []).filter(item => item.priority === "required").map(item => item.key));
  for (const [index, seed] of seeds.entries()) {
    const fit = seed.permissionFit || [];
    const fitKeys = new Set(fit.map(item => item.key));
    if (fit.length !== fitKeys.size || [...requiredPermissions].some(key => !fitKeys.has(key)) || [...fitKeys].some(key => !requiredPermissions.has(key))) diagnostics.push(diagnostic(
      "factory.idea-permissions.incomplete", `Idea ${seed.id || index + 1} must map every required user-consent permission exactly once`, `ideaPortfolio[${index}].permissionFit`,
    ));
  }
  const body = { schemaVersion: 1, briefId: brief.id, selectedSeedId, seeds: structuredClone(seeds), assessments: structuredClone(evaluation?.assessments || []), winnerRationale: evaluation?.winnerRationale || "" };
  return { diagnostics, receipt: Object.freeze({ receiptId: `ideas-${createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16)}`, ...body }) };
}

export function compileFactoryCandidateDelivery(candidate, worldModel) {
  const entities = worldModel.entities || [];
  const actions = new Map((worldModel.actions || []).map(item => [item.id, item]));
  const coreActions = (worldModel.coreActions || []).map(id => actions.get(id)).filter(Boolean);
  return Object.freeze({
    domainGlossary: entities.map(entity => ({
      term: entity.name,
      definition: `${entity.name} — сущность продукта с состояниями ${(entity.states || []).join(", ")}.`,
    })),
    personas: [{
      name: candidate.job.actor,
      context: candidate.job.situation,
      job: `${candidate.job.motivation}; ожидаемый результат: ${candidate.job.outcome}`,
    }],
    criticalFlows: coreActions.map(action => ({
      id: action.id,
      name: action.intent,
      trigger: action.preconditions[0],
      steps: [action.intent, ...action.effects],
      outcome: action.effects.join("; "),
    })),
    architecture: {
      modules: [{
        name: `${candidate.name}: Product World`,
        responsibility: "Хранит сущности, правила и наблюдаемые действия выбранной модели мира",
        owns: `${candidate.contentModel.primaryUnit} и его жизненный цикл`,
      }],
      boundaries: ["Экраны и навигация проектируются после выбора Product World"],
    },
    data: {
      entities: entities.map(item => item.name),
      state: entities.map(item => `${item.name}: ${(item.states || []).join(" → ")}`),
      persistence: (worldModel.runtime?.persistence || []).map(item => `${item.entity} хранится в ${item.store}`),
      integrations: (worldModel.runtime?.demoAdapters || []).map(item => `${item.id}: ${item.simulates}`),
    },
    experienceStates: {
      loading: "Показать структуру контента без ложных данных",
      empty: "Объяснить ценность и дать одно контекстное действие",
      error: "Сохранить ввод и предложить повтор без потери контекста",
      denied: "Показать ручной fallback, описанный в Product World",
      offline: "Оставить локальные данные доступными и отметить ожидающий эффект",
    },
    accessibility: ["Понятные VoiceOver-имена и динамический размер текста для всех действий"],
    localization: { locales: ["ru"], requirements: ["Все продуктовые строки входят в закрытый каталог локализации"] },
    analytics: {
      events: coreActions.map(item => `core_${item.id}`),
      successMetrics: [candidate.coreLoop.successMetric],
    },
    testing: {
      levels: ["Детерминированные contract-тесты и executable XCUI journeys"],
      evidencePlan: ["Каждое core action имеет наблюдаемый результат и recovery"],
      capturePlan: ["current", "small-phone"],
    },
    setup: { prerequisites: ["Xcode"], build: ["xcodebuild"], run: ["Simulator"] },
    ownership: {
      generated: ["Product Contract и developer documentation"],
      owned: ["World Model, Experience Contract и нативный SwiftUI-исходник"],
    },
    limitations: ["Без собственного backend; сетевые эффекты воспроизводятся локальным adapter"],
    acceptanceCriteria: coreActions.map(item => `${item.intent}: ${item.effects.join("; ")}`),
  });
}

export function compileFactoryCandidateFoundation(candidate, worldModel) {
  const primaryUnit = candidate.contentModel.primaryUnit;
  const coreAction = (worldModel.actions || []).find(item => (worldModel.coreActions || []).includes(item.id));
  const capabilityData = (worldModel.capabilityBindings || []).map(item => `${item.key}: ${item.purpose}`);
  return Object.freeze({
    ...candidate,
    contentSupply: {
      coldStartSources: [`Канонический локальный набор «${primaryUnit}» с разными авторами и состояниями`],
      ongoingSources: [`Пользователи создают и обновляют «${primaryUnit}» через основной продуктовый цикл`],
      contributorIncentives: [candidate.coreLoop.reward],
      qualityControls: [worldModel.invariants.join("; ")],
    },
    socialGraphLeverage: {
      relationship: worldModel.relationships[0].meaning,
      mechanism: candidate.wedge.mechanism,
      valueWithoutGraph: candidate.coldStart?.firstSessionValue || `Первый сеанс содержит готовый локальный набор «${primaryUnit}»`,
    },
    coldStart: {
      firstSessionValue: candidate.job.outcome,
      seededContent: `Различимые авторы и реалистичные объекты «${primaryUnit}» доступны без ожидания сетевого наполнения`,
      emptyStateAction: coreAction?.intent || candidate.coreLoop.action,
    },
    activation: {
      moment: candidate.coreLoop.reward,
      signal: coreAction?.effects?.[0] || candidate.coreLoop.contribution,
      window: "Первый содержательный сеанс",
    },
    habitLoop: {
      cue: candidate.coreLoop.trigger,
      routine: candidate.coreLoop.action,
      reward: candidate.coreLoop.reward,
      frequency: "По возникновению заявленной пользовательской ситуации; частота проверяется, а не выдумывается",
    },
    retention: {
      reasons: [candidate.coreLoop.reward, candidate.coreLoop.contribution],
      leadingIndicators: [candidate.coreLoop.successMetric],
    },
    trustSafety: {
      risks: (candidate.risks || []).map(item => item.risk),
      controls: [worldModel.invariants.join("; "), "Жалоба и блокировка доступны из затронутого контента"],
      reporting: "Жалоба привязана к конкретному автору или материалу и имеет наблюдаемый локальный результат",
    },
    privacy: {
      data: capabilityData.length ? capabilityData : ["Локальная сессия и продуктовый контент"],
      principles: ["Запрос только после понятного действия", "Полезный сценарий отказа без тупика"],
      retention: "Демо-данные хранятся локально; пользовательские разрешения не считаются продуктовым содержимым",
    },
    businessLogic: {
      model: "Продуктовый концепт без собственного backend и без выдуманной монетизации",
      payer: "Не определён без отдельного бизнес-решения",
      value: candidate.job.outcome,
      viabilitySignal: candidate.coreLoop.successMetric,
      constraints: "Не утверждать спрос, удержание или выручку без внешних данных",
    },
  });
}

export function validateFactoryRequest(request) {
  const diagnostics = [];
  if (!request || typeof request !== "object" || Array.isArray(request)) return [diagnostic(
    "factory.request.invalid", "Factory Request must be an object", "request",
  )];
  for (const key of Object.keys(request)) if (!FACTORY_REQUEST_PROPERTIES.has(key)) diagnostics.push(diagnostic(
    "factory.property.unknown", `Factory Request does not allow property ${key}`, key,
  ));
  if (request?.schemaVersion !== PRODUCT_FACTORY_SCHEMA_VERSION) diagnostics.push(diagnostic(
    "factory.schema-version.unsupported", "Factory Request schemaVersion must be 1", "schemaVersion",
  ));
  if (request?.id !== undefined && !text(request.id, 3)) diagnostics.push(diagnostic("factory.id.invalid", "Optional Factory Request id must be a stable non-empty identifier", "id"));
  if (!text(request?.request, 12)) diagnostics.push(diagnostic("factory.request.required", "Describe the product topic and desired value in one or more sentences", "request"));
  if (!resolveProductTarget(request?.targetProduct)) diagnostics.push(diagnostic(
    "factory.target.unknown", `Unknown target product ${request?.targetProduct || "(missing)"}`, "targetProduct",
  ));
  if (!["mimicry", "differentiation"].includes(request?.strategy)) diagnostics.push(diagnostic(
    "factory.strategy.invalid", "Strategy must be mimicry or differentiation", "strategy",
  ));
  if (request?.preferences !== undefined && (!Array.isArray(request.preferences) || request.preferences.some(item => !text(item, 4)))) diagnostics.push(diagnostic(
    "factory.preferences.invalid", "Preferences must be a short list of specific product wishes", "preferences",
  ));
  if (request?.capabilityPolicy !== undefined && !["organic", "all"].includes(request.capabilityPolicy)) diagnostics.push(diagnostic(
    "factory.capability-policy.invalid", "Capability policy must be organic or all", "capabilityPolicy",
  ));
  if (Array.isArray(request?.preferences) && request.preferences.length > 8) diagnostics.push(diagnostic(
    "factory.preferences.too-many", "Factory Request allows at most eight preferences", "preferences",
  ));
  return diagnostics;
}

export function validateFactoryDiscovery(discovery) {
  const diagnostics = [];
  if (!text(discovery?.audience?.primary)) diagnostics.push(diagnostic(
    "factory.discovery.audience.required", "The factory must infer a specific primary audience", "discovery.audience.primary",
  ));
  if (!textItems(discovery?.audience?.needs)) diagnostics.push(diagnostic(
    "factory.discovery.needs.required", "The factory must infer concrete audience needs", "discovery.audience.needs",
  ));
  if (!textItems(discovery?.context?.situations)) diagnostics.push(diagnostic(
    "factory.discovery.situations.required", "The factory must infer concrete usage situations", "discovery.context.situations",
  ));
  return diagnostics;
}

export function compileFactoryBrief({ request, discovery }) {
  const diagnostics = [...validateFactoryRequest(request), ...validateFactoryDiscovery(discovery)];
  const target = resolveProductTarget(request?.targetProduct);
  if (!target || diagnostics.length) return { ok: false, diagnostics, target: target || null, brief: null };

  const reference = request.strategy === "mimicry"
    ? { strategy: "mimicry", family: target.referenceFamily, profileId: target.mimicryProfileId }
    : { strategy: "differentiation", family: target.referenceFamily };
  const contextConstraints = [
    ...(discovery.context.constraints || []),
    "Приложение работает без собственного backend: удалённые эффекты воспроизводит явный локальный demo adapter",
    "Авторизация обязательна и сохраняет локальную сессию между запусками",
    "Сначала проектируется цельная продуктовая функция; выбираются только те системные возможности, которые органично поддерживают уже существующее действие",
    ...target.deliveryObligations.map(obligation => `Обязательная часть поставки: ${obligation}`),
  ];
  const brief = Object.freeze({
    schemaVersion: 1,
    id: factoryRequestId(request),
    request: request.request,
    audience: Object.freeze({
      primary: discovery.audience.primary,
      needs: Object.freeze([...discovery.audience.needs]),
      exclusions: Object.freeze([...(discovery.audience.exclusions || [])]),
    }),
    context: Object.freeze({
      situations: Object.freeze([...discovery.context.situations]),
      constraints: Object.freeze(contextConstraints),
    }),
    reference: Object.freeze(reference),
    permissions: Object.freeze(target.permissions.map(permission => Object.freeze({
      key: permission.key,
      priority: request.capabilityPolicy === "all" && USER_CONSENT_CAPABILITY_KEYS.has(permission.key) ? "required" : "optional",
      constraint: permission.constraint,
    }))),
    candidateCount: PRODUCT_FACTORY_CANDIDATE_COUNT,
  });
  return { ok: true, diagnostics: [], target, brief };
}

export function createFactoryDevelopmentArtifact({ request, result }) {
  if (!result?.ok || !result.productContract || !result.selectionReceipt) {
    throw new TypeError("A successful Product Factory result is required to create a development artifact");
  }
  return Object.freeze({
    schemaVersion: 1,
    factoryRequest: structuredClone(request),
    targetProduct: result.target.id,
    inferredDiscovery: structuredClone(result.discovery),
    worldModels: structuredClone(result.worldModels || []),
    selectedWorldModelId: result.selectedWorldModel?.id || null,
    productDevelopment: Object.freeze({
      schemaVersion: 1,
      brief: result.brief,
      candidates: result.candidates,
      ...(result.explorationReceipt ? { explorationReceipt: result.explorationReceipt } : {}),
      selectionReceipt: result.selectionReceipt,
      productContract: result.productContract,
    }),
  });
}

export function verifyFactoryDevelopmentArtifact(artifact) {
  const diagnostics = [];
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) return [diagnostic(
    "factory.artifact.required", "Factory Development artifact must be an object", "artifact",
  )];
  if (artifact.schemaVersion !== 1) diagnostics.push(diagnostic(
    "factory.artifact.schema-version", "Factory Development artifact schemaVersion must be 1", "schemaVersion",
  ));
  diagnostics.push(...validateFactoryRequest(artifact.factoryRequest).map(item => Object.freeze({ ...item, path: `factoryRequest.${item.path}` })));
  if (artifact.targetProduct !== artifact.factoryRequest?.targetProduct) diagnostics.push(diagnostic(
    "factory.target.drift", "Artifact targetProduct differs from Factory Request", "targetProduct",
  ));
  const target = resolveProductTarget(artifact.targetProduct);
  diagnostics.push(...verifyProductDevelopmentArtifact(artifact.productDevelopment).map(item => Object.freeze({
    ...item,
    path: `productDevelopment.${item.path}`,
  })));

  const candidates = new Set((artifact.productDevelopment?.candidates || []).map(item => item.id));
  const models = Array.isArray(artifact.worldModels) ? artifact.worldModels : [];
  const modelIds = new Set();
  for (const [index, model] of models.entries()) {
    if (modelIds.has(model?.id)) diagnostics.push(diagnostic(
      "factory.world.duplicate", `Duplicate World Model ${model?.id}`, `worldModels[${index}].id`,
    ));
    modelIds.add(model?.id);
    if (!candidates.has(model?.id)) diagnostics.push(diagnostic(
      "factory.world.candidate-unknown", `World Model ${model?.id} has no candidate`, `worldModels[${index}].id`,
    ));
    diagnostics.push(...auditWorldModel(model, target).map(item => Object.freeze({
      ...item,
      path: `worldModels[${index}].${item.path}`,
    })));
  }
  for (const candidateId of candidates) if (!modelIds.has(candidateId)) diagnostics.push(diagnostic(
    "factory.world.candidate-missing", `Candidate ${candidateId} has no World Model`, "worldModels",
  ));

  const selectedCandidateId = artifact.productDevelopment?.selectionReceipt?.selectedCandidateId;
  if (artifact.selectedWorldModelId !== selectedCandidateId) diagnostics.push(diagnostic(
    "factory.world.selection-drift", "Selected World Model differs from Selection Receipt winner", "selectedWorldModelId",
  ));
  const selectedWorldModel = models.find(item => item.id === selectedCandidateId);
  if (!selectedWorldModel) diagnostics.push(diagnostic(
    "factory.world.selected-missing", "Selection Receipt winner has no World Model", "worldModels",
  ));
  else if (target) {
    const compiledPermissions = compilePermissionGrounding(selectedWorldModel, target);
    if (JSON.stringify(compiledPermissions) !== JSON.stringify(artifact.productDevelopment?.productContract?.permissions || [])) diagnostics.push(diagnostic(
      "factory.world.permission-drift", "Product Contract permissions are not reproducible from the selected World Model", "productDevelopment.productContract.permissions",
    ));
  }
  return diagnostics;
}

async function developLeanProductFactory({ request, target, generator, evaluator, rubric }) {
  const discovery = await generator.discoverProduct({ request: structuredClone(request), target: structuredClone(target) });
  const compiled = compileFactoryBrief({ request, discovery });
  if (!compiled.ok) return {
    ok: false, diagnostics: compiled.diagnostics, target, discovery, candidates: [], selectionReceipt: null, productContract: null, brief: null,
  };
  const seeds = await generator.generateIdeaPortfolio({ request: structuredClone(request), target: structuredClone(target), rubric, discovery: structuredClone(discovery) });
  const ideaEvaluation = await evaluator.selectIdeaPortfolio({ request: structuredClone(request), target: structuredClone(target), discovery: structuredClone(discovery), seeds: structuredClone(seeds) });
  const exploration = compileExplorationReceipt(compiled.brief, seeds, ideaEvaluation);
  if (exploration.diagnostics.length) return {
    ok: false, diagnostics: exploration.diagnostics, target, discovery, ideaPortfolio: seeds, explorationReceipt: exploration.receipt,
    candidates: [], selectionReceipt: null, productContract: null, brief: compiled.brief, worldModels: [],
  };
  const selectedIndex = seeds.findIndex(item => item.id === exploration.receipt.selectedSeedId);
  const proposal = await generator.expandIdea({
    request: structuredClone(request), target: structuredClone(target), rubric, discovery: structuredClone(discovery),
    assignedSeed: structuredClone(seeds[selectedIndex]), completePortfolio: structuredClone(seeds), slot: selectedIndex + 1,
  });
  const proposalDiagnostics = auditWorldModel(proposal?.worldModel, target);
  if (proposal?.candidate?.id !== exploration.receipt.selectedSeedId || proposal?.worldModel?.id !== proposal?.candidate?.id) proposalDiagnostics.push(diagnostic(
    "factory.world.identity-drift", "Expanded candidate and World Model must preserve the selected idea id", "proposal",
  ));
  if (proposalDiagnostics.length) return {
    ok: false, diagnostics: proposalDiagnostics, target, discovery, ideaPortfolio: seeds, explorationReceipt: exploration.receipt,
    candidates: proposal?.candidate ? [proposal.candidate] : [], selectionReceipt: null, productContract: null, brief: compiled.brief,
    worldModels: proposal?.worldModel ? [proposal.worldModel] : [],
  };
  const foundedCandidate = compileFactoryCandidateFoundation(proposal.candidate, proposal.worldModel);
  const groundedProposal = Object.freeze({
    worldModel: proposal.worldModel,
    candidate: Object.freeze({ ...foundedCandidate, permissions: compilePermissionGrounding(proposal.worldModel, target), delivery: compileFactoryCandidateDelivery(foundedCandidate, proposal.worldModel) }),
  });
  const evaluation = await evaluator.evaluatePortfolio({
    request: structuredClone(request), target: structuredClone(target), proposals: [structuredClone(groundedProposal)],
    rubric: { candidateCount: 1, axes: [...PRODUCT_STRESS_AXES, ...FACTORY_PRODUCT_QUALITY_AXES], scoreRange: [0, 4], minimumAxisScore: 3 },
  });
  const assessment = evaluation?.assessments?.find(item => item.candidateId === groundedProposal.candidate.id);
  if (!assessment || evaluation.assessments.length !== 1) return {
    ok: false, diagnostics: [diagnostic("factory.evaluation.invalid", "Expanded winner requires exactly one matching independent assessment", "assessment")],
    target, discovery, ideaPortfolio: seeds, explorationReceipt: exploration.receipt, candidates: [groundedProposal.candidate],
    selectionReceipt: null, productContract: null, brief: compiled.brief, worldModels: [proposal.worldModel],
  };
  const candidate = Object.freeze({
    ...groundedProposal.candidate,
    stressTest: Object.freeze({ axes: Object.freeze(assessment.axes.filter(axis => PRODUCT_STRESS_AXES.includes(axis.id))) }),
    factoryQuality: Object.freeze({ axes: Object.freeze(assessment.axes.filter(axis => FACTORY_PRODUCT_QUALITY_AXES.includes(axis.id))) }),
  });
  const maturity = developSelectedProductConcept({ brief: compiled.brief, candidate, explorationReceipt: exploration.receipt });
  return {
    ...maturity, target, discovery, brief: compiled.brief, ideaPortfolio: seeds, explorationReceipt: exploration.receipt,
    worldModels: [proposal.worldModel], selectedWorldModel: maturity.ok ? proposal.worldModel : null,
  };
}

export async function resumeLeanProductFactory({ request, failure, evaluator }) {
  const target = resolveProductTarget(request?.targetProduct);
  const compiled = compileFactoryBrief({ request, discovery: failure?.discovery });
  const proposal = { candidate: failure?.candidates?.[0], worldModel: failure?.worldModels?.[0] };
  if (!target || !compiled.ok || !failure?.explorationReceipt || !proposal.candidate || !proposal.worldModel) return {
    ok: false,
    diagnostics: [diagnostic("factory.resume.invalid", "Resume requires discovery, selected candidate, World Model and exploration receipt", "productFailure")],
    target, discovery: failure?.discovery || null, candidates: [], selectionReceipt: null, productContract: null, brief: compiled.brief,
  };
  const proposalDiagnostics = auditWorldModel(proposal.worldModel, target);
  if (proposalDiagnostics.length) return { ...failure, ok: false, diagnostics: proposalDiagnostics, target, brief: compiled.brief };
  if (proposal.candidate?.stressTest?.axes?.length && proposal.candidate?.factoryQuality?.axes?.length) {
    const maturity = developSelectedProductConcept({ brief: compiled.brief, candidate: proposal.candidate, explorationReceipt: failure.explorationReceipt });
    return {
      ...maturity, target, discovery: failure.discovery, brief: compiled.brief, ideaPortfolio: failure.ideaPortfolio || failure.explorationReceipt.seeds,
      explorationReceipt: failure.explorationReceipt, worldModels: [proposal.worldModel], selectedWorldModel: maturity.ok ? proposal.worldModel : null,
    };
  }
  const foundedCandidate = compileFactoryCandidateFoundation(proposal.candidate, proposal.worldModel);
  const groundedProposal = Object.freeze({
    worldModel: proposal.worldModel,
    candidate: Object.freeze({ ...foundedCandidate, permissions: compilePermissionGrounding(proposal.worldModel, target), delivery: compileFactoryCandidateDelivery(foundedCandidate, proposal.worldModel) }),
  });
  const rubric = { candidateCount: 1, axes: [...PRODUCT_STRESS_AXES, ...FACTORY_PRODUCT_QUALITY_AXES], scoreRange: [0, 4], minimumAxisScore: 3 };
  const evaluation = await evaluator.evaluatePortfolio({ request: structuredClone(request), target: structuredClone(target), proposals: [structuredClone(groundedProposal)], rubric });
  const assessment = evaluation?.assessments?.find(item => item.candidateId === groundedProposal.candidate.id);
  if (!assessment || evaluation.assessments.length !== 1) return {
    ok: false, diagnostics: [diagnostic("factory.evaluation.invalid", "Resumed winner requires exactly one matching assessment", "assessment")],
    target, discovery: failure.discovery, candidates: [groundedProposal.candidate], selectionReceipt: null, productContract: null, brief: compiled.brief,
  };
  const candidate = Object.freeze({
    ...groundedProposal.candidate,
    stressTest: Object.freeze({ axes: Object.freeze(assessment.axes.filter(axis => PRODUCT_STRESS_AXES.includes(axis.id))) }),
    factoryQuality: Object.freeze({ axes: Object.freeze(assessment.axes.filter(axis => FACTORY_PRODUCT_QUALITY_AXES.includes(axis.id))) }),
  });
  const maturity = developSelectedProductConcept({ brief: compiled.brief, candidate, explorationReceipt: failure.explorationReceipt });
  return {
    ...maturity, target, discovery: failure.discovery, brief: compiled.brief, ideaPortfolio: failure.ideaPortfolio || failure.explorationReceipt.seeds,
    explorationReceipt: failure.explorationReceipt, worldModels: [proposal.worldModel], selectedWorldModel: maturity.ok ? proposal.worldModel : null,
  };
}

export async function developProductFactory({ request, generator, evaluator }) {
  const requestDiagnostics = validateFactoryRequest(request);
  if (requestDiagnostics.length) return {
    ok: false, diagnostics: requestDiagnostics, target: null, discovery: null,
    candidates: [], selectionReceipt: null, productContract: null, brief: null,
  };
  const target = resolveProductTarget(request.targetProduct);
  if (request.strategy === "mimicry") {
    const profile = resolveReferenceProfile(target.mimicryProfileId);
    const audit = profile ? auditReferenceProfile(profile) : { ready: false, blockers: ["reference profile is missing"] };
    if (!audit.ready) return {
      ok: false,
      diagnostics: audit.blockers.map((message, index) => diagnostic(
        "factory.reference.not-ready", message, `target.reference.blockers[${index}]`,
      )),
      target, discovery: null, candidates: [], selectionReceipt: null, productContract: null, brief: null,
    };
  }
  if (!generator || typeof generator.generatePortfolio !== "function") return {
    ok: false,
    diagnostics: [diagnostic("factory.generator.required", "A product factory generator must implement generatePortfolio({ request, target, rubric })", "generator")],
    target, discovery: null, candidates: [], selectionReceipt: null, productContract: null, brief: null,
  };
  if (!evaluator || typeof evaluator.evaluatePortfolio !== "function") return {
    ok: false,
    diagnostics: [diagnostic("factory.evaluator.required", "An independent product evaluator must implement evaluatePortfolio({ request, target, proposals, rubric })", "evaluator")],
    target, discovery: null, candidates: [], selectionReceipt: null, productContract: null, brief: null,
  };

  const rubric = {
    candidateCount: PRODUCT_FACTORY_CANDIDATE_COUNT,
    axes: [...PRODUCT_STRESS_AXES, ...FACTORY_PRODUCT_QUALITY_AXES],
    scoreRange: [0, 4],
    minimumAxisScore: 3,
    productFirstPermissionRule: request.capabilityPolicy === "all"
      ? "The delivered app must implement every user-consent permission. Platform capabilities remain optional and cannot create disconnected features."
      : "Select only capabilities that naturally support an existing core or supporting action.",
  };
  if (typeof generator.discoverProduct === "function" && typeof generator.generateIdeaPortfolio === "function"
      && typeof generator.expandIdea === "function" && typeof evaluator.selectIdeaPortfolio === "function") {
    return developLeanProductFactory({ request, target, generator, evaluator, rubric });
  }

  const generated = await generator.generatePortfolio({
    request: structuredClone(request),
    target: structuredClone(target),
    rubric,
  });
  const compiled = compileFactoryBrief({ request, discovery: generated?.discovery });
  if (!compiled.ok) return {
    ok: false, diagnostics: compiled.diagnostics, target, discovery: generated?.discovery || null,
    candidates: (generated?.proposals || []).map(item => item?.candidate).filter(Boolean), selectionReceipt: null, productContract: null, brief: null,
  };
  const proposals = Array.isArray(generated?.proposals) ? generated.proposals : [];
  const proposalDiagnostics = [];
  if (proposals.length !== PRODUCT_FACTORY_CANDIDATE_COUNT) proposalDiagnostics.push(diagnostic(
    "factory.proposals.count", `Product factory requires exactly ${PRODUCT_FACTORY_CANDIDATE_COUNT} World Model proposals`, "proposals",
  ));
  for (const [index, proposal] of proposals.entries()) {
    if (proposal?.candidate?.permissions !== undefined || proposal?.candidate?.stressTest !== undefined || proposal?.candidate?.factoryQuality !== undefined) proposalDiagnostics.push(diagnostic(
      "factory.proposal.self-assessment", "Proposal generator cannot provide permission grounding or stress scores; World Model and independent evaluator own them", `proposals[${index}].candidate`,
    ));
    proposalDiagnostics.push(...auditWorldModel(proposal?.worldModel, target).map(item => Object.freeze({
      ...item,
      path: `proposals[${index}].${item.path}`,
    })));
    if (proposal?.candidate?.id && proposal?.worldModel?.id !== proposal.candidate.id) proposalDiagnostics.push(diagnostic(
      "factory.world.identity-drift", "World Model id must equal its candidate id", `proposals[${index}].worldModel.id`,
    ));
  }
  if (proposalDiagnostics.length) return {
    ok: false,
    diagnostics: proposalDiagnostics,
    target,
    discovery: generated.discovery,
    candidates: proposals.map(item => item?.candidate).filter(Boolean),
    selectionReceipt: null,
    productContract: null,
    brief: compiled.brief,
    worldModels: proposals.map(item => item?.worldModel).filter(Boolean),
  };
  const groundedProposals = proposals.map(proposal => Object.freeze({
    worldModel: proposal.worldModel,
    candidate: Object.freeze({
      ...proposal.candidate,
      permissions: compilePermissionGrounding(proposal.worldModel, target),
      delivery: compileFactoryCandidateDelivery(proposal.candidate, proposal.worldModel),
    }),
  }));
  const evaluation = await evaluator.evaluatePortfolio({
    request: structuredClone(request),
    target: structuredClone(target),
    proposals: structuredClone(groundedProposals),
    rubric: {
      candidateCount: PRODUCT_FACTORY_CANDIDATE_COUNT,
      axes: [...PRODUCT_STRESS_AXES, ...FACTORY_PRODUCT_QUALITY_AXES],
      scoreRange: [0, 4],
      minimumAxisScore: 3,
    },
  });
  const assessments = Array.isArray(evaluation?.assessments) ? evaluation.assessments : [];
  const assessmentIds = new Set();
  const assessmentDiagnostics = [];
  for (const [index, assessment] of assessments.entries()) {
    if (assessmentIds.has(assessment.candidateId)) assessmentDiagnostics.push(diagnostic(
      "factory.evaluation.duplicate", `Duplicate assessment for ${assessment.candidateId}`, `assessments[${index}].candidateId`,
    ));
    assessmentIds.add(assessment.candidateId);
    if (!groundedProposals.some(item => item.candidate.id === assessment.candidateId)) assessmentDiagnostics.push(diagnostic(
      "factory.evaluation.unknown", `Assessment references unknown candidate ${assessment.candidateId}`, `assessments[${index}].candidateId`,
    ));
  }
  for (const proposal of groundedProposals) if (!assessmentIds.has(proposal.candidate.id)) assessmentDiagnostics.push(diagnostic(
    "factory.evaluation.missing", `Candidate ${proposal.candidate.id} has no independent assessment`, "assessments",
  ));
  if (assessmentDiagnostics.length) return {
    ok: false, diagnostics: assessmentDiagnostics, target, discovery: generated.discovery,
    candidates: groundedProposals.map(item => item.candidate), selectionReceipt: null, productContract: null,
    brief: compiled.brief, worldModels: proposals.map(item => item.worldModel),
  };
  const assessmentByCandidate = new Map(assessments.map(item => [item.candidateId, item]));
  const candidates = groundedProposals.map(proposal => Object.freeze({
    ...proposal.candidate,
    stressTest: Object.freeze({ axes: Object.freeze((assessmentByCandidate.get(proposal.candidate.id)?.axes || []).filter(axis => PRODUCT_STRESS_AXES.includes(axis.id))) }),
    factoryQuality: Object.freeze({ axes: Object.freeze((assessmentByCandidate.get(proposal.candidate.id)?.axes || []).filter(axis => FACTORY_PRODUCT_QUALITY_AXES.includes(axis.id))) }),
  }));
  const maturity = await developProductConcept({
    brief: compiled.brief,
    generator: { async generateCandidates() { return candidates; } },
  });
  const selectedWorldModel = maturity.selectionReceipt?.selectedCandidateId
    ? proposals.find(item => item.candidate.id === maturity.selectionReceipt.selectedCandidateId)?.worldModel || null
    : null;
  return {
    ...maturity,
    target,
    discovery: generated.discovery,
    brief: compiled.brief,
    worldModels: proposals.map(item => item.worldModel),
    selectedWorldModel,
  };
}
