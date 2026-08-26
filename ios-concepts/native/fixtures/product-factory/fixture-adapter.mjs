// Deterministic structural tracer bullet. It proves factory wiring only and is
// deliberately not product research, a visual reference, or a golden concept.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { productGenerator } from "../product-development/fixture-generator.mjs";

const productBrief = JSON.parse(readFileSync(join(import.meta.dirname, "../product-development/strong-brief.json"), "utf8"));

function action(id, target, intent) {
  return {
    id, actor: "resident", target, intent,
    preconditions: ["Пользователь открыл конкретную соседскую задачу"],
    effects: [intent],
    failures: ["Изменение не потеряно и доступно для явного повтора"],
    offlineBehavior: "Локальное изменение сохраняется и помечается ожидающим синхронизации",
  };
}

function worldModel(candidateId) {
  return {
    schemaVersion: 1,
    id: candidateId,
    entities: [
      { id: "resident", name: "Житель", ownership: "user", states: ["signed-out", "signed-in"] },
      { id: "request", name: "Задача дома", ownership: "shared", states: ["draft", "open", "committed", "closed"] },
      { id: "media", name: "Материал задачи", ownership: "user", states: ["local", "attached"] },
    ],
    relationships: [
      { id: "resident-owns-request", from: "resident", to: "request", cardinality: "one-to-many", meaning: "Житель создаёт и закрывает ограниченные задачи" },
    ],
    actions: [
      action("authenticate", "resident", "Создать и сохранить локальную сессию жителя"),
      action("capture-contribution", "media", "Добавить актуальное фото к конкретной задаче"),
      action("choose-existing-media", "media", "Выбрать существующий материал для задачи"),
      action("play-voice-context", "request", "Прослушать сохранённый голосовой контекст задачи"),
      action("follow-request", "request", "Подписаться на наблюдаемый результат выбранной задачи"),
      action("open-shared-request", "request", "Открыть конкретную задачу из поддерживаемой ссылки"),
    ],
    coreActions: ["capture-contribution"],
    invariants: ["Системный доступ не создаёт отдельный раздел или самостоятельную фичу"],
    authentication: { required: true, method: "phone-code", sessionEntity: "resident", persistence: "Keychain-backed local demo session" },
    runtime: {
      persistence: [{ entity: "request", store: "SwiftData" }],
      demoAdapters: [{ id: "house-network-demo", simulates: "Ответы соседей и синхронизацию задачи", states: ["loading", "populated", "empty", "error", "offline"] }],
    },
    capabilityBindings: [
      { key: "camera", action: "capture-contribution", purpose: "Добавить актуальное фото к выбранной задаче", requestMoment: "После нажатия «Снять фото» в задаче", deniedOutcome: "Продолжить с текстом или выбрать существующее фото", observableResult: "Фото появилось в черновике задачи" },
      { key: "photos", action: "choose-existing-media", purpose: "Добавить существующий материал к задаче", requestMoment: "После нажатия «Выбрать фото»", deniedOutcome: "Продолжить без вложения", observableResult: "Выбранное фото появилось в черновике" },
      { key: "audio", action: "play-voice-context", purpose: "Не прерывать начатый голосовой контекст", requestMoment: "После явного запуска записи в задаче", deniedOutcome: "Показывать расшифровку и остановить звук в фоне", observableResult: "Состояние воспроизведения видно в задаче" },
      { key: "push", action: "follow-request", purpose: "Сообщить об изменении выбранной задачи", requestMoment: "После явной подписки на задачу", deniedOutcome: "Показывать непрочитанное изменение во входящих", observableResult: "Подписка отмечена на экране задачи" },
      { key: "associateddomains", action: "open-shared-request", purpose: "Открыть присланную соседскую задачу", requestMoment: "При переходе по поддерживаемой ссылке", deniedOutcome: "Открыть безопасный поиск по номеру задачи", observableResult: "Открыта соответствующая задача" },
    ],
    deliveryBindings: [],
  };
}

export const productFactoryGenerator = {
  async generatePortfolio() {
    const base = await productGenerator.generateCandidates({ brief: productBrief, rubric: { minimumAxisScore: 3 } });
    const candidates = base;
    const proposals = candidates.map(candidate => {
      const proposal = structuredClone(candidate);
      delete proposal.permissions;
      delete proposal.stressTest;
      return { candidate: proposal, worldModel: worldModel(proposal.id) };
    });
    return {
      discovery: {
        audience: { primary: "Жители многоквартирного дома с ограниченной бытовой задачей", needs: ["Закрыть одну задачу через понятное обязательство и результат"] },
        context: { situations: ["До короткой задачи дома", "При завершении обещанного соседского действия"], constraints: ["Fixture не является пользовательским исследованием"] },
      },
      proposals,
    };
  },
};

export const productFactoryEvaluator = {
  async evaluatePortfolio({ proposals, rubric }) {
    return {
      assessments: proposals.map((proposal, candidateIndex) => ({
        candidateId: proposal.candidate.id,
        axes: rubric.axes.map(id => ({
          id,
          score: candidateIndex === 0 ? 4 : 3,
          rationale: `Fixture evaluator checks ${id} independently for the structured tracer bullet.`,
          evidenceRefs: [id === "reference-fit" ? "vk-reference" : "brief-observation"],
          failureModes: [`${id} requires real evidence before production use`],
        })),
      })),
    };
  },
};

const experienceStates = [
  "loading", "populated/default", "empty", "error", "offline",
  "permission-needed", "permission-denied", "permission-restricted", "permission-limited",
];

function integrityFields(model, actionIds) {
  const detailActions = model.actions.filter(item => item.id !== "authenticate");
  const coreAction = actionIds[model.coreActions[0]];
  const supportingAction = actionIds[detailActions.find(item => item.id !== model.coreActions[0])?.id || model.coreActions[0]];
  return {
    content: {
      records: [
        { id: "resident-main", entityId: "resident", displayName: "Анна", facts: [{ key: "role", value: "Житель дома" }], mediaIds: [] },
        { id: "request-main", entityId: "request", displayName: "Свет у второго подъезда", facts: [{ key: "status", value: "Открыта" }, { key: "place", value: "Вход со двора" }], mediaIds: ["request-photo"] },
        { id: "media-main", entityId: "media", displayName: "Фото задачи", facts: [{ key: "status", value: "Добавлено локально" }], mediaIds: [] },
      ],
      media: [{ id: "request-photo", ownerRecordId: "request-main", role: "evidence", semanticDescription: "Тёмный вход у второго подъезда вечером" }],
      screenBindings: [
        { screenId: "auth", recordIds: ["resident-main"], mediaIds: [] },
        { screenId: "home", recordIds: ["request-main"], mediaIds: ["request-photo"] },
        { screenId: "detail", recordIds: ["request-main", "media-main"], mediaIds: ["request-photo"] },
      ],
    },
    entryPoints: [],
    screenBlueprints: [
      { screenId: "auth", primaryRecordId: "resident-main", contentOrder: ["identity", "credentials", "recovery"], primaryActionId: actionIds.authenticate, secondaryActionIds: [], prohibitedPatterns: ["No undeclared identity provider"] },
      { screenId: "home", primaryRecordId: "request-main", contentOrder: ["context", "request-feed", "observable-status"], primaryActionId: "open-detail", secondaryActionIds: [], prohibitedPatterns: ["No detached generic call to action"] },
      { screenId: "detail", primaryRecordId: "request-main", contentOrder: ["request-context", "evidence", "task-actions", "result"], primaryActionId: coreAction, secondaryActionIds: [supportingAction], prohibitedPatterns: ["No action without visible result"] },
    ],
    journeys: [
      { id: "sign-in-and-complete", title: "Войти и закрыть задачу", startScreenId: "auth", actionIds: [actionIds.authenticate, "open-detail", coreAction], observableResult: "В задаче виден сохранённый результат основного действия", failureRecovery: "Ошибка оставляет задачу и предлагает повторить действие" },
      { id: "open-current-request", title: "Открыть актуальную задачу", startScreenId: "home", actionIds: ["open-detail", supportingAction], observableResult: "Открыта выбранная задача и показан результат действия", failureRecovery: "Без сети показывается сохранённая задача с явным повтором" },
      {
        id: "repeat-core-action", title: "Проверить доступы и повторить действие", startScreenId: "detail",
        actionIds: [...new Set([
          coreAction,
          ...model.capabilityBindings.flatMap(binding => [actionIds[binding.action], `fallback-${binding.key}`]),
        ])],
        observableResult: "Изменения доступов и продукта заметны на экране", failureRecovery: "Отказ оставляет понятный ручной путь и повтор",
      },
    ],
  };
}

export const fixtureExperiencePlanner = {
  async planExperience({ productContract, worldModel: model }) {
    const actionIds = Object.fromEntries(model.actions.map(item => [item.id, `perform-${item.id}`]));
    const actions = model.actions.map(item => ({
      id: actionIds[item.id], worldActionId: item.id,
      surface: item.id === "authenticate" ? "auth" : "detail",
      label: item.intent,
      outcome: item.id === "authenticate" ? { type: "navigate", target: "home" } : { type: "mutate", state: `${item.id}-completed` },
      persistence: item.id === "authenticate" ? "session" : "local-model",
    }));
    actions.push({ id: "open-detail", worldActionId: null, surface: "home", label: "Открыть задачу", outcome: { type: "navigate", target: "detail" }, persistence: "none" });
    for (const binding of model.capabilityBindings) actions.push({
      id: `fallback-${binding.key}`, worldActionId: null, surface: "detail", label: binding.deniedOutcome,
      outcome: { type: "mutate", state: `${binding.key}-fallback` }, persistence: "local-model",
    });
    const statePolicy = (screenId, defaultAction) => ({
      screenId,
      variants: experienceStates.map(id => ({
        id, applicable: true, productMeaning: `${id} имеет наблюдаемый смысл для экрана ${screenId}`,
        availableActions: id === "populated/default" && defaultAction ? [defaultAction] : [],
        recoveryActionId: ["error", "offline"].includes(id) ? defaultAction : null,
      })),
    });
    return {
      schemaVersion: 2,
      productContractId: productContract.contractId,
      worldModelId: model.id,
      authentication: { required: true, entrySurface: "auth", successSurface: "home", restoreSession: true },
      navigation: {
        roots: ["auth"],
        nodes: [
          { id: "auth", title: "Вход", purpose: "Восстановить или создать обязательную сессию", presentation: "root", parent: null, entityIds: ["resident"], actionIds: [actionIds.authenticate] },
          { id: "home", title: "Главная", purpose: "Увидеть актуальные ограниченные задачи", presentation: "root", parent: null, entityIds: ["request"], actionIds: ["open-detail"] },
          { id: "detail", title: "Задача", purpose: "Выполнить действие и увидеть его результат", presentation: "push", parent: "home", entityIds: ["request", "media"], actionIds: actions.filter(item => item.surface === "detail").map(item => item.id) },
        ],
      },
      actions,
      states: [statePolicy("auth", actionIds.authenticate), statePolicy("home", "open-detail"), statePolicy("detail", actionIds[model.coreActions[0]])],
      permissionFlows: model.capabilityBindings.map(binding => ({
        key: binding.key, worldActionId: binding.action, surface: "detail",
        triggerActionId: actionIds[binding.action], deniedActionId: `fallback-${binding.key}`,
      })),
      ...integrityFields(model, actionIds),
    };
  },
};

const visualAxes = [
  "product-hierarchy", "native-coherence", "cross-screen-consistency",
  "state-completeness", "strategy-integrity", "visual-risk",
];
const visualForbidden = [
  "decorative-gradients", "colored-icon-placeholders", "generic-hero-cards",
  "universal-done-copy", "card-stack-default",
];

export const fixtureVisualGenerator = {
  async generateDirections({ experienceContract, strategy, calibration }) {
    const screenIds = experienceContract.navigation.nodes.map(item => item.id);
    return [0, 1, 2].map(index => ({
      schemaVersion: 1,
      id: `fixture-native-direction-${index}`,
      name: `Fixture native direction ${index}`,
      strategy,
      rationale: `Structural fixture direction ${index} exercises native visual selection without claiming product or visual evidence.`,
      composition: {
        chrome: strategy === "mimicry" ? "reference-flat" : "system",
        density: ["content-led", "compact-list", "sectioned-flow"][index],
        contentRhythm: `Fixture rhythm ${index} follows task hierarchy and observable state`,
        screenFamilies: [{ id: `fixture-family-${index}`, screens: screenIds, structure: `fixture-system-structure-${index}`, primaryRole: "product-task" }],
      },
      tokens: {
        accent: ["#2457D6", "#146C5A", "#7A3E00"][index], background: "#FFFFFF",
        groupedBackground: "#F2F2F7", surface: "#FFFFFF", fill: "#F2F2F7",
        separator: "#C6C6C8", textPrimary: "#000000", textSecondary: "#6C6C70",
      },
      iconography: { productChromeSource: strategy === "mimicry" ? "lucide-assets" : "sf-symbols", weight: "semibold", tabRoles: [] },
      componentRecipes: screenIds.map(screen => ({
        role: `screen:${screen}`, nativePrimitive: screen === "auth" ? "Form" : "ScrollView",
        anatomy: ["system-header", "primary-content", "contextual-actions"],
        states: experienceContract.states.find(item => item.screenId === screen).variants.filter(item => item.applicable).map(item => item.id),
        prohibitions: ["No decorative placeholder container", "No action outside Experience Contract"],
      })),
      rules: { allowedPatterns: ["system-navigation", "semantic-sections"], forbiddenPatterns: visualForbidden },
      evidenceRefs: ["selected-product-contract", "verified-experience-contract", `calibration:${calibration.id}`],
    }));
  },
};

export const fixtureVisualEvaluator = {
  async evaluateDirections({ directions, rubric }) {
    if (JSON.stringify(rubric.axes) !== JSON.stringify(visualAxes)) throw new Error("fixture visual rubric drift");
    return { assessments: directions.map((direction, index) => ({
      directionId: direction.id,
      axes: rubric.axes.map(id => ({ id, score: index === 0 ? 9.2 : 8.7, rationale: `Independent fixture rationale for ${id} in ${direction.id}.` })),
    })) };
  },
};

// Canonical adapter names used by factory:run. Named fixture exports remain
// available to focused tests so no stage is hidden behind the aggregate seam.
export const experiencePlanner = fixtureExperiencePlanner;
export const visualDirectionGenerator = fixtureVisualGenerator;
export const visualDirectionEvaluator = fixtureVisualEvaluator;

export const factoryRenderer = {
  async render({ factoryArtifact, experienceContract, visualDevelopment, revision, attempt }) {
    const visual = visualDevelopment.visualDirectionContract;
    return {
      productContractId: factoryArtifact.productDevelopment.productContract.contractId,
      experienceContractId: experienceContract.experienceContractId,
      visualDirectionContractId: visual.visualDirectionContractId,
      contentManifest: structuredClone(experienceContract.content),
      consumedBlueprintScreenIds: experienceContract.screenBlueprints.map(item => item.screenId),
      consumedRecipeRoles: visual.direction.componentRecipes.map(item => item.role),
      concept: {
        slug: "factory-fixture",
        native: {
          design: {
            strategy: factoryArtifact.factoryRequest.strategy,
            qualityFloor: 8.5,
            visualDirectionContractId: visual.visualDirectionContractId,
            tokens: visual.direction.tokens,
            iconography: visual.direction.iconography,
          },
          deliveryIdentity: { coreSurfaces: experienceContract.navigation.nodes.map(item => item.id) },
        },
        productDevelopment: { productContract: factoryArtifact.productDevelopment.productContract },
      },
      testMatrix: { devices: [
        { id: "current", name: "iPhone 17 Pro", class: "current" },
        { id: "small", name: "iPhone 16e", class: "small-phone" },
      ] },
      buildReceipt: { passed: true, xcodeProjectPath: "native/build/factory-fixture/FactoryFixture.xcodeproj", sha256: `fixture-build-${attempt}` },
      interactionReceipts: experienceContract.journeys.map(journey => ({
        journeyId: journey.id, actionIds: journey.actionIds, passed: true,
        evidencePath: `journeys/${journey.id}.json`, sha256: `fixture-journey-${attempt}-${journey.id}`,
      })),
      permissionReceipts: experienceContract.permissionFlows
        .filter(flow => ["camera", "photos", "push"].includes(flow.key))
        .map(flow => ({
          permissionKey: flow.key, promptMode: "system-dialog",
          grantedTestName: `test_${flow.key}_granted`, deniedTestName: `test_${flow.key}_denied`,
          devices: ["current", "small"].map(deviceId => ({
            deviceId, grantedPassed: true, deniedPassed: true,
            evidencePath: `permissions/${deviceId}-${flow.key}.xcresult`, sha256: `fixture-permission-${attempt}-${deviceId}-${flow.key}`,
          })),
        })),
      captures: ["current", "small"].flatMap(deviceId => experienceContract.states.flatMap(policy => policy.variants.filter(item => item.applicable).map(state => ({
        id: `${deviceId}--${policy.screenId}--${state.id}`,
        deviceId,
        surface: policy.screenId,
        state: state.id,
        path: `shots-${deviceId}/${policy.screenId}--${state.id}--attempt-${attempt}.png`,
        sha256: `fixture-${attempt}-${revision?.id || "initial"}-${deviceId}-${policy.screenId}-${state.id}`,
      })))),
    };
  },
};

export const productUICritic = {
  async review(request) {
    return {
      reviewer: { kind: "fixture", name: "independent-pipeline-fixture", independentFromGenerator: true, captureInspection: "vision" },
      verdict: "clean",
      axes: request.rubric.axes.map(id => ({ id, score: 9, rationale: `Fixture visible rationale for ${id} across the product.`, evidence: "Observed fixture capture pixels" })),
      reviews: request.captures.map(capture => ({
        captureId: capture.id,
        summary: `Fixture capture ${capture.id} has a clear product hierarchy and task.`,
        evidence: "Observed fixture capture pixels",
        findings: [],
      })),
    };
  },
};

export const productRevisionAdapter = {
  async revise({ attempt }) { return { id: `fixture-revision-${attempt}` }; },
};
