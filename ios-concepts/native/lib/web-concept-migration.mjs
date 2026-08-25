import { developProductConcept, PRODUCT_STRESS_AXES } from "./product-maturity.mjs";
import { compileUXSpecification } from "./ux-specification.mjs";

const TYPE_PRESENTATION = new Map([
  ["tab (root)", "tab"], ["tab root", "tab"], ["push", "push"],
  ["modal", "sheet"], ["modal (ошибка)", "sheet"], ["sheet", "sheet"],
  ["fullscreen", "cover"], ["fullscreen camera", "cover"],
  ["fullscreen audio", "cover"], ["system", "system"],
  ["system handoff", "system"], ["state", "state"], ["старт", "root"],
  ["старт, без таб-бара", "root"],
]);

const PATTERN_FAMILIES = Object.freeze({
  auth: ["auth-form", "primary-action"],
  collection: ["collection", "filters"],
  feed: ["social-feed", "post"],
  form: ["task-intro", "form", "primary-action"],
  detail: ["summary", "content", "next-action"],
  chat: ["chat", "message-list", "composer"],
  services: ["service-list"],
});

const TAB_SEMANTICS = Object.freeze({
  tails: {
    home: { role: "feed", systemImage: "house" },
    nearby: { role: "discovery", systemImage: "location" },
    create: { role: "short-video", systemImage: "plus.circle" },
    chats: { role: "messaging", systemImage: "message" },
    profile: { role: "services", systemImage: "person.crop.circle" },
  },
  today: {
    home: { role: "home", systemImage: "sun.max" },
    nearby: { role: "nearby", systemImage: "person.2" },
    create: { role: "create", systemImage: "plus.circle" },
    chats: { role: "plans", systemImage: "calendar" },
    profile: { role: "profile", systemImage: "person.crop.circle" },
  },
  nakat: {
    lessons: { role: "lessons", systemImage: "calendar" },
    theory: { role: "theory", systemImage: "book.closed" },
    menu: { role: "menu", systemImage: "ellipsis" },
  },
  peresmenka: {
    shifts: { role: "shifts", systemImage: "calendar" },
    swaps: { role: "swaps", systemImage: "arrow.left.arrow.right" },
    people: { role: "people", systemImage: "person.2" },
    menu: { role: "menu", systemImage: "ellipsis" },
  },
});

function text(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function patternFor(screen) {
  if (["phone", "code", "codefail"].includes(screen.id)) return "auth";
  if (/chat|voice|call/i.test(screen.id)) return "chat";
  if (/create|record|shoot|scan|join|manual|reschedule|handover|note/i.test(screen.id)) return "form";
  if (/settings|menu|profile|people|chats|lessons|theory|shifts|swaps|nearby|home/i.test(screen.id)) return "collection";
  return screen.type?.includes("tab") ? "collection" : "detail";
}

function normalizeScreens(web) {
  const screenById = new Map((web.screens || []).map(screen => [screen.id, screen]));
  const childByParent = new Map();
  for (const screen of web.screens || []) if (screen.parent) {
    const rows = childByParent.get(screen.parent) || [];
    rows.push(screen.id);
    childByParent.set(screen.parent, rows);
  }
  const tabIds = new Set((web.tabs || []).map(tab => tab.id));
  return (web.screens || []).map(screen => {
    const presentation = screen.id === web.start ? "root"
      : tabIds.has(screen.id) ? "tab"
      : TYPE_PRESENTATION.get(screen.type) || "push";
    const pattern = patternFor(screen);
    const child = (childByParent.get(screen.id) || [])[0];
    const childTitle = child ? text(screenById.get(child)?.title, child) : null;
    const label = text(screen.ui?.primaryAction, child ? `Открыть «${childTitle}»` : `Продолжить`);
    const outcome = child
      ? { type: "navigate", target: child }
      : { type: "mutate", state: `${screen.id}.completed` };
    const interactive = !["system", "external", "state"].includes(presentation);
    const actions = interactive ? [{
      id: child ? `open-${child}` : `complete-${screen.id}`,
      label,
      outcome,
      execution: "sync",
      persistence: outcome.type === "mutate" ? "local" : "none",
      variant: "primary",
      placement: "body",
      enabledWhen: "always",
    }] : [];
    return {
      ...screen,
      parent: screen.id === web.start || tabIds.has(screen.id) ? null : (screen.parent || web.start),
      native: {
        ...(screen.native || {}),
        presentation,
        states: [...new Set([...(screen.ui?.states || ["default"]), "loading", "error", "offline"])],
      },
      ui: {
        pattern,
        purpose: text(screen.ui?.purpose, text(screen.meta, `Выполнить задачу «${screen.title}»`)),
        primaryAction: interactive ? label : null,
        hierarchy: { primary: screen.title, secondary: text(screen.meta, "Контекст и восстановление") },
        states: [...new Set([...(screen.ui?.states || ["default"]), "loading", "error", "offline"])],
        density: "high",
        componentFamilies: PATTERN_FAMILIES[pattern],
        contentCases: [
          { kind: "typical", example: `Обычные данные для «${screen.title}»` },
          { kind: "stress", example: `Длинные русские данные и граничные значения для «${screen.title}»` },
          { kind: "failure", example: `Недоступные данные с сохранённым контекстом «${screen.title}»` },
        ],
        actions,
      },
    };
  });
}

function permissionContract(permission) {
  return {
    key: permission.key,
    productValue: text(permission.feature, `Поддержать заявленную возможность ${permission.key}`),
    flow: `Сценарий «${text(permission.feature, permission.key)}» на поверхности ${permission.screen}`,
    requestMoment: `Только после действия «${text(permission.gesture, permission.feature)}»`,
    deniedFallback: text(permission.fallback, "Сохранить задачу доступной ручным способом"),
    role: permission.anchor ? "core" : "supporting",
  };
}

function deliveryFor(web, descriptor) {
  const flows = (web.prototypes || []).slice(0, 3).map((flow, index) => ({
    id: flow.id || `flow-${index + 1}`,
    name: flow.label || flow.title || `Критический сценарий ${index + 1}`,
    trigger: flow.start || web.start,
    steps: (flow.screens || []).slice(0, 8).length >= 3 ? (flow.screens || []).slice(0, 8) : [web.start, web.product.verticalSlice.entry, web.product.verticalSlice.result],
    outcome: flow.note || descriptor.outcome,
  }));
  while (flows.length < 3) flows.push({
    id: `core-flow-${flows.length + 1}`,
    name: `${descriptor.unit}: сценарий ${flows.length + 1}`,
    trigger: web.product.situation,
    steps: [web.start, web.product.verticalSlice.entry, web.product.verticalSlice.result],
    outcome: descriptor.outcome,
  });
  return {
    domainGlossary: descriptor.glossary,
    personas: [
      { name: "Основной участник", context: web.product.situation, job: descriptor.outcome },
      { name: "Контрагент", context: descriptor.relationship, job: `Ответить на ${descriptor.unit.toLowerCase()} и закрыть следующий шаг` },
      { name: "Возвращающийся участник", context: web.product.returnReasons[0], job: `Продолжить незавершённый ${descriptor.unit.toLowerCase()}` },
    ],
    criticalFlows: flows,
    architecture: {
      modules: [
        { name: "Product domain", responsibility: `Владеет сущностями и состояниями ${descriptor.unit}`, owns: `native/apps/${web.slug}` },
        { name: "Native runtime", responsibility: "Владеет системными разрешениями и lifecycle", owns: "native/Runtime" },
        { name: "Visual language", responsibility: "Владеет семантической визуальной грамматикой", owns: web.positioning.mode === "mimicry" ? "native/ReferenceProfiles/vk-ios" : "native/DesignSystem" },
      ],
      boundaries: ["Продуктовое состояние не живёт в визуальных примитивах", "Разрешения доступны только через причинное действие", "Web evidence не входит в native build graph"],
    },
    data: {
      entities: descriptor.glossary.map(item => item.term),
      state: ["Текущая сессия", `Жизненный цикл ${descriptor.unit}`, "Состояния разрешений и восстановления"],
      persistence: ["Локальный черновик переживает перезапуск", "Защищённые значения используют системное хранилище только по capability contract"],
      integrations: (web.backendless || []).map(item => `${item.needs}: ${item.solution}`),
    },
    experienceStates: {
      loading: "Сохранять контекст задачи и блокировать повторную отправку.",
      empty: `Объяснить отсутствие ${descriptor.unit.toLowerCase()} и предложить первое полезное действие.`,
      error: "Назвать неуспешную операцию, сохранить ввод и дать повтор или альтернативу.",
      denied: "Продолжить задачу через объявленный denied fallback.",
      offline: "Показать сохранённые данные и явно отделить их от свежих.",
    },
    accessibility: ["VoiceOver labels и логичный порядок чтения", "Hit targets не меньше 44 pt", "Accessibility XXXL без обрезания", "Reduce Motion", "Контраст и различимость без опоры только на цвет"],
    localization: { locales: ["ru"], requirements: ["Все пользовательские строки в каталоге", "Проверять длинный русский текст и plural forms", "Permission copy совпадает с App Store notes"] },
    analytics: {
      events: ["product_opened", "activation_completed", "core_loop_completed", "permission_requested", "permission_denied_fallback_used"],
      successMetrics: [descriptor.measurement, "Повтор основного цикла", "Завершение задачи после denied fallback"],
    },
    testing: {
      levels: ["Product artifact reproduction", "UX graph and state gates", "SwiftUI build", "Capture and independent review"],
      evidencePlan: ["Не выдавать web implementation за пользовательское исследование", "Проверить ключевые предположения на реальных участниках"],
      capturePlan: (web.screens || []).map(screen => `${screen.id}--default`),
    },
    setup: { prerequisites: ["Node 22", "Xcode и iOS simulator"], build: [`npm run build -- ${web.slug}`], run: [`npm run check -- ${web.slug}`, `npm run capture -- ${web.slug}`] },
    ownership: { generated: [`native/build/${web.slug}`, `concepts/${web.slug}/docs/developer-guide.md`], owned: [`concepts/${web.slug}/concept.json`, `native/apps/${web.slug}`] },
    limitations: ["Market demand ещё не подтверждён", "Web screens являются migration evidence, а не native layout", "Медиа требуют отдельной проверки лицензии", "Physical device и VoiceOver остаются ручными воротами"],
    acceptanceCriteria: ["Победитель воспроизводится из трёх кандидатов", "Все поверхности достижимы", "Каждое действие имеет исход", "Каждое разрешение имеет timing и fallback", "Critical flows покрыты сценариями"],
    appStoreNotes: ["Заявленные разрешения соответствуют достижимым функциям", "Privacy labels не обещают отсутствующую инфраструктуру", "Никаких скрытых назначений доступов", text(web.appStore?.description?.[0], web.deck)],
  };
}

function candidateFor(web, descriptor, index) {
  const webEvidence = `${web.slug}-web-evidence`;
  const assumptionEvidence = `${web.slug}-market-assumption`;
  const permissionRows = (web.permissions || []).map(permissionContract);
  const axes = PRODUCT_STRESS_AXES.map(axis => ({
    id: axis,
    score: descriptor.failAxis === axis ? 2 : 3,
    rationale: descriptor.failAxis === axis
      ? `${descriptor.name} не проходит ось ${axis}: ${descriptor.rejectionReason}`
      : `${descriptor.name}: ось ${axis} связана с единицей «${descriptor.unit}», наблюдаемым действием и явно отмеченной проверкой предположения.`,
    evidenceRefs: [axis === "evidence" ? assumptionEvidence : webEvidence],
    failureModes: [descriptor.failAxis === axis ? descriptor.rejectionReason : `Пересмотреть ${axis}, если полевое исследование противоречит web evidence.`],
  }));
  return {
    schemaVersion: 1,
    id: descriptor.id,
    name: descriptor.name,
    productThesis: descriptor.thesis,
    insight: { claim: descriptor.insight, evidenceRefs: [webEvidence] },
    job: { actor: web.product.audience, situation: web.product.situation, motivation: descriptor.motivation, outcome: descriptor.outcome },
    wedge: { audience: web.product.audience, situation: descriptor.wedgeSituation, mechanism: descriptor.mechanism },
    observableDifferentiation: { kind: "behavior", behavior: descriptor.behavior, comparator: descriptor.comparator, measurement: descriptor.measurement, threshold: descriptor.threshold, experiment: descriptor.experiment, coreLoopStep: descriptor.coreAction, evidenceRefs: [webEvidence, assumptionEvidence] },
    valueExchange: { userGives: [descriptor.contribution, "Контекст и подтверждение результата"], userGets: [descriptor.outcome, "Явный следующий шаг"] },
    contentModel: { primaryUnit: descriptor.unit, relationships: descriptor.relationships },
    contentSupply: { coldStartSources: descriptor.seedSources, ongoingSources: descriptor.ongoingSources, contributorIncentives: [descriptor.contribution, "Полученная польза снижает стоимость следующего участия"], qualityControls: ["Идентифицированный автор", "Срок жизни и удаление дублей", "Жалоба и блокировка"] },
    socialGraphLeverage: { relationship: descriptor.relationship, mechanism: descriptor.graphMechanism, valueWithoutGraph: descriptor.firstValue },
    coldStart: { firstSessionValue: descriptor.firstValue, seededContent: descriptor.seedSources.join("; "), emptyStateAction: descriptor.emptyAction },
    activation: { moment: descriptor.activation, signal: `${descriptor.id}_activated`, window: "Первые семь дней" },
    coreLoop: { trigger: descriptor.trigger, action: descriptor.coreAction, reward: descriptor.outcome, contribution: descriptor.contribution, hypothesis: descriptor.hypothesis, successMetric: descriptor.measurement, testPlan: descriptor.experiment, evidenceRefs: [webEvidence, assumptionEvidence] },
    habitLoop: { cue: descriptor.trigger, routine: descriptor.coreAction, reward: descriptor.outcome, frequency: descriptor.frequency },
    retention: { reasons: web.product.returnReasons, leadingIndicators: [descriptor.measurement, "Повторное полезное действие", "Возврат к незавершённому состоянию"] },
    permissions: permissionRows,
    trustSafety: { risks: ["Злоупотребление взаимодействием", "Ложные или устаревшие данные", "Нежелательный контакт"], controls: ["Идентифицированный профиль", "Жалоба и блокировка", "Ограничение видимости и срока"], reporting: "Жалоба сохраняет контекст единицы и позволяет немедленно прекратить контакт." },
    privacy: { data: [`Продуктовая единица «${descriptor.unit}»`, "Профиль и выбранные связи", "Локальные состояния разрешений"], principles: ["Минимизация собираемых данных", "Причинный запрос системного доступа", "Равноправный fallback при отказе"], retention: "Хранить данные только пока существует продуктовая задача или обязательный спорный период." },
    businessLogic: { model: descriptor.businessModel, payer: descriptor.payer, value: descriptor.businessValue, viabilitySignal: descriptor.viability, constraints: "Без оплаты безопасности, восстановления и базового завершения задачи." },
    nonGoals: web.product.nonGoals,
    risks: [{ risk: descriptor.marketRisk, mitigation: descriptor.experiment, killSignal: descriptor.killSignal }, { risk: "Набор разрешений окажется шире реальной ценности", mitigation: "Проверять каждое разрешение через достижимый flow", killSignal: "Разрешение нельзя защитить наблюдаемым исходом" }],
    assumptions: [{ claim: descriptor.hypothesis, risk: "high", validation: descriptor.experiment, status: "needs-validation" }, { claim: descriptor.supplyAssumption, risk: "high", validation: "Проверить supply и completion на пилотной когорте", status: "needs-validation" }],
    evidence: [
      { id: webEvidence, type: "user-input", source: `platform/concepts/${web.slug}/concept.json and screens`, status: "observed", supports: ["существующее продуктовое направление", "наблюдаемые экранные задачи", "существующая карта разрешений"] },
      { id: `${web.slug}-reference`, type: "reference-profile", source: web.positioning.mode === "mimicry" ? "native/ReferenceProfiles/vk-ios/profile.json" : "approved differentiation strategy", status: "approved", supports: ["reference constraints", "visual strategy only"] },
      { id: assumptionEvidence, type: "assumption", source: "curated migration portfolio; real research not yet supplied", status: "needs-validation", supports: ["неподтверждённый пользовательский спрос", "непроверенное контентное снабжение", "гипотеза повторного использования", "непроверенная жизнеспособность бизнеса"] },
    ],
    referenceFit: {
      profileId: web.positioning.mode === "mimicry" ? "vk-ios" : "vk-family-category-context",
      mentalModel: web.positioning.mode === "mimicry" ? "Идентифицированные люди публикуют социальные единицы, отвечают, переписываются и возвращаются через знакомую плотную структуру VK." : "Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.",
      naturalFit: descriptor.referenceFit,
      borrowedPatterns: web.positioning.referencePatterns || web.positioning.familiarPatterns,
      productMapping: descriptor.productMapping,
      tensions: descriptor.tensions,
      evidenceRefs: [`${web.slug}-reference`],
    },
    stressTest: { axes },
    delivery: deliveryFor(web, descriptor),
  };
}

function normalizedNative(web) {
  const mimicry = web.positioning.mode === "mimicry";
  return {
    schemaVersion: 1,
    platform: { minimumVersion: "26.0" },
    actionContractVersion: 3,
    design: {
      strategy: web.positioning.mode,
      ...(mimicry ? { referenceProfile: "vk-ios" } : {}),
      density: mimicry ? "reference" : "product",
      colorScheme: "light",
      qualityFloor: 8,
      tokens: {
        accent: web.brand?.accent || (mimicry ? "#0077FF" : "#5B5FC7"), background: "#FFFFFF",
        groupedBackground: "#F2F3F5", fill: "#E7E8EC", separator: "#D7D8DC",
        textPrimary: "#000000", textSecondary: "#818C99", badge: "#FF3347",
      },
    },
    navigation: {
      tabs: (web.tabs || []).map(tab => ({
        ...tab,
        screen: tab.screen || tab.id,
        role: TAB_SEMANTICS[web.slug]?.[tab.id]?.role || tab.role || tab.id,
        systemImage: TAB_SEMANTICS[web.slug]?.[tab.id]?.systemImage || tab.systemImage,
      })),
    },
  };
}

/**
 * Deep migration module. Its interface accepts only reviewed product evidence
 * and three curated proposition descriptors. HTML/CSS/DOM never cross it.
 */
export async function migrateWebConcept({ webConcept, portfolio, deliveryIdentity }) {
  if (!webConcept || webConcept.targetSet !== "vkontakte") throw new Error("web migration accepts only targetSet=vkontakte");
  if (!Array.isArray(portfolio) || portfolio.length !== 3) throw new Error("web migration requires exactly three curated candidates");
  if (!deliveryIdentity?.fixture || !deliveryIdentity?.firstFrame || !deliveryIdentity?.coreSurfaces?.length) {
    throw new Error("web migration requires reviewed product identity anchors and deterministic fixture content");
  }
  const screens = normalizeScreens(webConcept);
  const permissions = (webConcept.permissions || []).map(item => ({ ...item, key: item.key || item.id }));
  const native = { ...normalizedNative(webConcept), deliveryIdentity };
  const brief = {
    schemaVersion: 1,
    id: `${webConcept.slug}-native-product-selection`,
    request: `Перенести проверенное продуктовое направление «${webConcept.name}» из web evidence в самостоятельный native SwiftUI-продукт без HTML mapping.`,
    audience: { primary: webConcept.product.audience, needs: [webConcept.product.problem, webConcept.product.promise], exclusions: webConcept.product.nonGoals.slice(0, 2) },
    context: { situations: [webConcept.product.situation, webConcept.insight], constraints: ["Web служит evidence, а не layout source", "Разрешения запрашиваются только из причинного действия", "Market assumptions не выдаются за evidence"] },
    reference: { strategy: webConcept.positioning.mode, family: "vk-family", ...(webConcept.positioning.mode === "mimicry" ? { profileId: "vk-ios" } : {}) },
    permissions: permissions.map(item => ({ key: item.key, priority: item.anchor ? "required" : "optional", constraint: `${text(item.feature, item.key)}; fallback: ${text(item.fallback, "ручной путь")}` })),
    candidateCount: 3,
  };
  const candidates = portfolio.map((descriptor, index) => candidateFor({ ...webConcept, permissions }, descriptor, index));
  const development = await developProductConcept({ brief, generator: { async generateCandidates() { return candidates; } } });
  if (!development.ok) return { ok: false, diagnostics: development.diagnostics, concept: null, development };
  const productDevelopment = { schemaVersion: 1, brief, candidates, selectionReceipt: development.selectionReceipt, productContract: development.productContract };
  const base = { ...webConcept, qualityContractVersion: 2, uiContractVersion: 3, screens, permissions, native, productDevelopment };
  const generated = compileUXSpecification(base, development.productContract);
  const explicitSpecification = {
    ...generated.specification,
    fixtures: generated.specification.fixtures.map(fixture => ({
      ...fixture,
      provenance: {
        kind: "web-migration-evidence",
        source: `platform/concepts/${webConcept.slug}/concept.json + curated native portfolio`,
        note: "Deterministic Russian fixture compiled for native verification; it is neither market research nor production data.",
      },
    })),
  };
  const { uxSpecificationId, productContractId, source, actions, migrationLimitations, ...ux } = explicitSpecification;
  const concept = { ...base, ux };
  const verified = compileUXSpecification(concept, development.productContract);
  return { ok: verified.ok, diagnostics: [...development.diagnostics, ...verified.diagnostics], concept, development };
}
