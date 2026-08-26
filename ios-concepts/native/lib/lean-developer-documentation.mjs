import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const json = value => `\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
const table = (headers, rows) => [
  `| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`,
  ...rows.map(row => `| ${row.map(value => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", "<br>")).join(" | ")} |`),
].join("\n");

function technicalDocuments(blueprint, manifest) {
  const actions = new Map(blueprint.world.actions.map(action => [action.id, action]));
  const states = new Map(blueprint.states.map(item => [item.screenId, item.variants]));
  const consentKeys = new Set(["camera", "photos", "photo", "mic", "speech", "location", "push", "tracking", "contacts", "calendar", "faceid", "localnet", "hotspot"]);
  const consentCapabilities = blueprint.capabilities.filter(item => consentKeys.has(item.key));
  const platformCapabilities = blueprint.capabilities.filter(item => !consentKeys.has(item.key));
  const capabilityPlans = new Map((manifest.capabilities?.plans || []).map(item => [item.permissionKey, item]));
  const capabilityTable = items => table(
    ["Доступ", "Действие", "Зачем", "Момент", "Системный эффект", "Результат", "Fallback", "Runtime / проверка"],
    items.map(item => {
      const plan = capabilityPlans.get(item.key);
      return [item.key, item.actionId, item.purpose, item.requestMoment, item.platformEffect, item.observableResult, item.fallback,
        plan ? `${plan.runtimeAdapter} / ${plan.verification}` : "—"];
    }),
  );
  return [
    ["00-overview.md", `# ${blueprint.name}: Developer Kit\n\n${blueprint.thesis}\n\nЦелевая семья: **${blueprint.targetProduct}** · стратегия: **${blueprint.strategy}**.\n\nЭтот пакет сгенерирован из Product Blueprint и проверенной нативной сборки. Файлы документации не редактируются вручную.\n`],
    ["01-product-world.md", `# Продуктовая модель\n\n## Аудитория\n\n${blueprint.audience.who}\n\n## Потребность\n\n${blueprint.audience.need}\n\n## Сущности${json(blueprint.world.entities)}\n## Действия${json(blueprint.world.actions)}\n## Основной цикл\n\n${blueprint.coreLoop.actionIds.map(id => `- ${id}: ${actions.get(id)?.outcome}`).join("\n")}\n\nПричина возвращения: ${blueprint.coreLoop.returnReason}\n`],
    ["02-navigation-and-flows.md", `# Граф экранов и навигации\n\n${table(["Экран", "Тип", "Родитель", "Действия"], blueprint.navigation.screens.map(screen => [screen.id, screen.presentation, screen.parent, screen.actionIds.join(", ")]))}\n\n## Корневые вкладки${json(blueprint.navigation.rootTabs)}\n## Скомпилированные переходы\n\n${table(["ID", "Экран", "Тип", "Цель", "Размещение"], manifest.interactions.actions.map(item => [item.id, item.surface, item.outcome?.type, item.outcome?.target, item.placement]))}\n`],
    ["03-screen-states.md", `# Поэкранные состояния\n\n${table(["Экран", "Состояния", "Назначение"], manifest.surfaces.map(surface => [surface.id, (states.get(surface.id) || []).join(", "), surface.purpose]))}\n\nКаждый экран обязан реализовать loading, populated/default, empty, error и offline; permission-denied проверяется в capability-сценарии владельца.\n`],
    ["04-design-system.md", `# Дизайн-система и состав экранов\n\n## Токены${json(manifest.design.tokens)}\n## Контракты поверхностей${json(manifest.design.surfaceContracts)}\n## Правила\n\n- Для VK-мимикрии используются approved VK-компоненты и Lucide product chrome.\n- Liquid Glass принадлежит системному TabView; случайное стекло в контенте запрещено.\n- SF Symbols остаются для платформенных действий.\n- Декоративные селекторы, цветные иконки-плейсхолдеры и оторванные панели действий запрещены.\n`],
    ["05-localization.md", `# Локализация\n\n${table(["Ключ", "Русская строка", "Контекст", "Экраны"], (blueprint.localization || manifest.uxSpecification.localization.catalog).map(item => [item.key, item.source, item.context, (item.screenIds || []).join(", ")]))}\n\nRenderer не должен изобретать пользовательские термины вне этого каталога. Fixture-контент хранится отдельно от UI copy.\n`],
    ["06-permissions-user-consent.md", `# Пользовательские доступы iOS\n\n${capabilityTable(consentCapabilities)}\n\nЗапрос доступа разрешён только из контекстного продуктового действия. Granted и denied ветки должны завершаться понятным продуктовым результатом.\n`],
    ["07-platform-capabilities.md", `# Платформенные возможности\n\n${capabilityTable(platformCapabilities)}\n\n## Сводка build-контракта\n\n- Info.plist: ${(manifest.capabilities?.plans || []).flatMap(item => item.usageKeys || []).join(", ") || "нет"}\n- Background modes: ${(manifest.capabilities?.backgroundModes || []).join(", ") || "нет"}\n- Extension targets: ${(manifest.capabilities?.extensionTargets || []).join(", ") || "нет"}\n- Frameworks: ${(manifest.capabilities?.frameworks || []).join(", ") || "нет"}\n`],
    ["08-acceptance-scenarios.md", `# Сценарии приёмки\n\n${table(["Сценарий", "Старт", "Действия", "Результат", "Восстановление"], (blueprint.acceptanceScenarios || []).map(item => [item.title, item.startScreenId, item.actionIds.join(" → "), item.observableResult, item.failureRecovery]))}\n\n## Доступы\n\n${blueprint.capabilities.map(item => `- **${item.key}**: ${item.testScenario}; при отказе: ${item.fallback}`).join("\n")}\n\n## Обязательные проверки\n\n- Вход принимает любой полный четырёхзначный локальный код.\n- Каждая кнопка имеет один предсказуемый outcome.\n- Комментарий открывает тред, ответ изменяет исходный пост.\n- Все root и pushed экраны достижимы и возвращаются предсказуемо.\n`],
    ["08-fixtures-and-data.md", `# Мок-данные и локальное состояние\n\n## Сущности${json(blueprint.world.entities)}\n## Детерминированные fixture-записи${json(blueprint.fixtures || manifest.uxSpecification.fixtures)}\n## Хранение\n\nСостояние концепта локальное и детерминированное. Поля capability outcomes принадлежат указанным сущностям и сохраняются после успешного действия. Backend не требуется.\n`],
    ["09-accessibility.md", `# Accessibility\n\n${(blueprint.delivery?.accessibility || []).map(item => `- ${item}`).join("\n")}\n\nФинальный handoff требует автоматизированных accessibility identifiers; физический VoiceOver review остаётся отдельным evidence gate.\n`],
    ["10-privacy-analytics-risks.md", `# Privacy, analytics и риски\n\n## Данные\n\n${(blueprint.delivery?.privacy?.data || []).map(item => `- ${item}`).join("\n")}\n\n## Принципы\n\n${(blueprint.delivery?.privacy?.principles || []).map(item => `- ${item}`).join("\n")}\n\n**Хранение:** ${blueprint.delivery?.privacy?.retention || "Локальное хранение концепта"}\n\n## События аналитики\n\n${(blueprint.delivery?.analytics?.events || []).map(item => `- ${item}`).join("\n")}\n\n## Метрики успеха\n\n${(blueprint.delivery?.analytics?.successMetrics || []).map(item => `- ${item}`).join("\n")}\n\n## Риски\n\n${(blueprint.delivery?.risks || []).map(item => `- ${item}`).join("\n")}\n\n## Допущения\n\n${(blueprint.delivery?.assumptions || []).map(item => `- ${item}`).join("\n")}\n`],
    ["11-architecture-build-run.md", `# Архитектура, файлы и запуск\n\n## Границы\n\n- Product Blueprint владеет продуктом, графом, действиями и состояниями.\n- Runtime владеет реальными iOS capability adapters.\n- Reference Profile и DesignSystem владеют визуальной грамматикой.\n- App source владеет сущностями, продуктовой логикой и SwiftUI-композицией.\n- XCUI владеет доказательством сценариев, а screenshot gates — геометрией и визуальным качеством.\n\n## Пути\n\n- Product Blueprint: \`native/ProductBlueprints/${blueprint.id}-vk.json\`\n- Swift source: \`native/apps/${blueprint.id}\`\n- Xcode project: \`native/build/${blueprint.id}\`\n- Captures: \`native/artifacts/${blueprint.id}\`\n\n## Запуск\n\n\`npm run build -- ${blueprint.id}\`\n\n\`npm run capture -- ${blueprint.id}\`\n\n\`npm run smoke -- ${blueprint.id}\`\n`],
  ];
}

const MAX_ROWS = 28;
const MAX_BYTES = 20_000;

function chunkTableDocument(name, heading, intro, headers, rows) {
  const chunks = [];
  const size = Math.max(1, Math.min(MAX_ROWS, Math.ceil(rows.length / Math.max(1, Math.ceil(
    Buffer.byteLength(table(headers, rows)) / MAX_BYTES,
  )))));
  for (let index = 0; index < rows.length || index === 0; index += size) {
    const part = rows.slice(index, index + size);
    const suffix = rows.length > size ? `-${String(chunks.length + 1).padStart(2, "0")}` : "";
    chunks.push([`${name}${suffix}.md`, `# ${heading}${rows.length > size ? ` · ${chunks.length + 1}` : ""}\n\n${intro}\n\n${table(headers, part)}\n`]);
  }
  return chunks;
}

function documents(blueprint, manifest) {
  const technical = new Map(technicalDocuments(blueprint, manifest));
  const actions = new Map(blueprint.world.actions.map(action => [action.id, action]));
  const capabilities = new Map(blueprint.capabilities.map(item => [item.key, item]));
  const localization = blueprint.localization || manifest.uxSpecification?.localization?.catalog || [];
  const scenarios = blueprint.acceptanceScenarios || manifest.uxSpecification?.acceptanceScenarios || [];
  const fixtures = blueprint.fixtures || manifest.uxSpecification?.fixtures || [];
  const screenRows = blueprint.navigation.screens.map(screen => [
    screen.id, screen.title, screen.presentation, screen.parent,
    (blueprint.states.find(item => item.screenId === screen.id)?.variants || []).join(", "),
    screen.actionIds.map(id => `${id}: ${actions.get(id)?.outcome || "—"}`).join("<br>"),
  ]);
  const stateRows = blueprint.navigation.screens.flatMap(screen =>
    (blueprint.states.find(item => item.screenId === screen.id)?.variants || []).map(state => [
      screen.id, state, state === "populated/default" ? "Канонические fixture-данные" : `Явная ${state}-вариация`,
      screen.actionIds.join(", "), state === "error" || state === "offline" ? "Повторить без потери локального состояния" : "—",
    ]));
  const localizationRows = localization.map(item => [item.key, item.source, item.context, (item.screenIds || item.screens || []).join(", ")]);
  const scenarioRows = scenarios.map(item => [
    item.id, item.title || item.flowId, item.startScreenId || item.given?.[0]?.id,
    (item.actionIds || item.when?.map(step => step.id) || []).join(" → "),
    item.observableResult || item.then?.map(step => step.id).join(", "), item.failureRecovery || "Повторить целевое действие",
  ]);
  const fixtureRows = fixtures.map(item => [item.id, item.entityId || item.surface, item.purpose || item.state,
    (item.values || Object.entries(item).filter(([key]) => !["id", "entityId", "surface"].includes(key)).map(([key, value]) => ({ key, value: JSON.stringify(value) })))
      .map(value => `${value.key}: ${value.value}`).join("<br>")]);
  const entityRows = blueprint.world.entities.map(entity => [entity.id, entity.name,
    Object.entries(entity).filter(([key]) => !["id", "name"].includes(key)).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("<br>")]);
  const capabilityRows = blueprint.capabilities.map(item => [item.key, item.actionId, item.purpose, item.requestMoment,
    item.observableResult, item.fallback, manifest.capabilities.plans.find(plan => plan.permissionKey === item.key)?.verification || "—"]);
  const actionRows = blueprint.world.actions.map(action => [action.id, action.actorId || action.actor, action.entityId || action.target,
    action.intent, action.outcome, action.persistence || "local-model"]);
  const assumptions = blueprint.delivery?.assumptions || [];
  const risks = blueprint.delivery?.risks || [];
  const criticalFlows = scenarios.filter(item =>
    (item.actionIds || item.when?.map(step => step.id) || []).some(id => blueprint.coreLoop.actionIds.includes(id)));

  return [
    ["00-overview.md", `# ${blueprint.name}: developer product guide\n\n> Product Blueprint: \`${blueprint.id}\`; target: \`${blueprint.targetProduct}\`; strategy: \`${blueprint.strategy}\`.\n> Generated documentation is reproducible and must not drift from the native manifest. A separate delivery receipt proves build, XCUI and visual review; documentation generation alone never claims handoff readiness.\n\n## Product in one paragraph\n\n${blueprint.thesis}\n\n## Developer Kit contents\n\n1. Product vision, audience, scope and non-goals.\n2. Domain glossary, entities, actions and persistence.\n3. Core loop and executable critical flows.\n4. Navigation graph and complete screen/state/action matrix.\n5. Design tokens and semantic component rules.\n6. Localization catalog and deterministic fixtures.\n7. User-consent permissions and platform capabilities with real outcomes.\n8. Architecture module seams and file ownership.\n9. Privacy, accessibility, analytics and service-state behavior.\n10. Acceptance scenarios, XCUI evidence, build and capture instructions.\n\n## Product scale\n\n- ${blueprint.navigation.screens.length} product screens.\n- ${blueprint.world.actions.length} declared actions.\n- ${blueprint.capabilities.length} contextual iOS capabilities.\n- ${localization.length} localized interface strings.\n- ${scenarios.length} acceptance scenarios.\n- ${fixtures.length} deterministic fixture groups.\n\n## Primary loop\n\n${blueprint.coreLoop.actionIds.map(id => `- \`${id}\`: ${actions.get(id)?.outcome || "declared product outcome"}`).join("\n")}\n\n## Reading order\n\nStart with **Product vision**, then **Core loop and flows**, **Navigation**, and **Screen/state/action matrix**. Engineers implementing platform behavior should continue with **Permissions**, **Architecture**, and **Testing and evidence**.\n`],
    ["01-product-vision.md", `# Product vision and scope\n\n## Product thesis\n\n${blueprint.thesis}\n\n## Audience\n\n**Who:** ${blueprint.audience.who}\n\n**Need:** ${blueprint.audience.need}\n\n## Product boundary\n\nThe concept is a complete local application without backend dependencies. Product behavior, native capability outcomes, state recovery and deterministic demo data are in scope. Onboarding and App Store materials are out of scope.\n`],
    ...chunkTableDocument("02-domain-glossary", "Domain glossary", "Canonical product nouns. Swift types, copy and documentation must use the same meanings.", ["Entity", "Name", "Contract"], entityRows),
    ["03-personas-and-jobs.md", `# Personas and jobs\n\n## Primary actor\n\n${blueprint.audience.who}\n\n## Job\n\n${blueprint.audience.need}\n\n## Observable progress\n\n${blueprint.coreLoop.returnReason}\n`],
    ["04-core-loop-and-flows.md", `# Core loop and critical flows\n\n**Core loop:** ${blueprint.coreLoop.actionIds.map(id => `${id} — ${actions.get(id)?.outcome}`).join(" → ")}\n\n**Return reason:** ${blueprint.coreLoop.returnReason}\n\n${table(["Flow", "Start", "Actions", "Outcome"], criticalFlows.map(item => [item.title || item.flowId, item.startScreenId || item.given?.[0]?.id, (item.actionIds || item.when?.map(step => step.id) || []).join(" → "), item.observableResult || item.then?.map(step => step.id).join(", ")]))}\n`],
    ["05-navigation.md", technical.get("02-navigation-and-flows.md")],
    ...chunkTableDocument("06-screen-state-action-matrix", "Screen, state and action matrix", "Every visible control maps to one declared action and one observable outcome.", ["Screen", "Title", "Presentation", "Parent", "States", "Actions / outcomes"], screenRows),
    ...chunkTableDocument("07-state-handling", "Canonical state handling", "Loading, populated, empty, error and offline are explicit per screen. Permission denial belongs to the owning capability journey.", ["Screen", "State", "Content", "Actions", "Recovery"], stateRows),
    ["08-design-system.md", technical.get("04-design-system.md")],
    ...chunkTableDocument("09-localization", "Localization catalog", "All product UI copy has a stable key. Fixture content remains separate from interface copy.", ["Key", "Russian source", "Context", "Screens"], localizationRows),
    ...chunkTableDocument("10-acceptance-scenarios", "Executable acceptance scenarios", "XCUI must execute the action IDs in order and assert the observable result, not merely open screens.", ["ID", "Scenario", "Start", "Actions", "Expected result", "Recovery"], scenarioRows),
    ...chunkTableDocument("11-fixtures", "Deterministic fixture catalog", "Fixtures use stable IDs and power captures, edge cases and acceptance flows.", ["Fixture", "Entity", "Purpose", "Values"], fixtureRows),
    ...chunkTableDocument("12-permissions", "Permissions and native capabilities", "Every capability begins from a product gesture and has granted and denied outcomes.", ["Capability", "Action", "Product value", "Request moment", "Observable result", "Denied fallback", "Evidence"], capabilityRows),
    ["13-architecture.md", `# Architecture and module seams\n\n- **Product Blueprint module:** entities, actions, invariants, navigation and states.\n- **Native Shell Compiler module:** auth, session, theme, Liquid Glass TabView, Lucide product chrome and capture instrumentation.\n- **Capability Runtime module:** real iOS requests, platform operation and persisted product outcome.\n- **Product UI module:** SwiftUI screen bodies and product reducers only.\n- **Documentation Compiler module:** this reproducible handoff kit.\n- **Evidence module:** XCUI journeys, screenshots, geometry and visual review receipts.\n\nThe app-specific renderer may not redeclare shell or platform infrastructure.\n`],
    ...chunkTableDocument("14-data-and-actions", "Data, actions and persistence", "The local world model is the source of truth for reducers and fixture storage.", ["Action", "Actor", "Entity", "Intent", "Outcome", "Persistence"], actionRows),
    ["15-service-states.md", technical.get("03-screen-states.md")],
    ["16-privacy-and-trust.md", `# Privacy, security and trust\n\n## Data\n\n${(blueprint.delivery?.privacy?.data || []).map(item => `- ${item}`).join("\n")}\n\n## Principles\n\n${(blueprint.delivery?.privacy?.principles || []).map(item => `- ${item}`).join("\n")}\n\n## Retention\n\n${blueprint.delivery?.privacy?.retention || "Local deterministic concept data."}\n`],
    ["17-accessibility-and-localization.md", `# Accessibility and localization requirements\n\n${(blueprint.delivery?.accessibility || []).map(item => `- ${item}`).join("\n")}\n\n- Dynamic Type must preserve hierarchy without horizontal escape.\n- Every meaningful control has a stable accessibility label and identifier.\n- VoiceOver order follows visual and task order.\n- Russian copy is canonical; no forced uppercase or renderer-invented terminology.\n`],
    ["18-analytics.md", `# Analytics event plan and success metrics\n\n## Events\n\n${(blueprint.delivery?.analytics?.events || []).map(item => `- ${item}`).join("\n")}\n\n## Success metrics\n\n${(blueprint.delivery?.analytics?.successMetrics || []).map(item => `- ${item}`).join("\n")}\n`],
    ["19-testing-and-evidence.md", `# Testing and evidence plan\n\n- Unit tests verify world invariants, reducers, documentation drift and deterministic compilers.\n- XCUI executes every acceptance scenario and granted/denied capability branch.\n- Every screen is captured in populated/default; canonical non-default states are captured where applicable.\n- Geometry audit rejects content outside the viewport or behind persistent chrome.\n- Pixel audit checks status-bar continuity and duplicate state captures.\n- Independent product/UI review cannot pass without real pixels.\n`],
    ["20-setup-build-run.md", technical.get("11-architecture-build-run.md")],
    ["21-file-map.md", `# File map and ownership\n\n| Path | Owner | Purpose |\n|---|---|---|\n| \`native/ProductBlueprints/${blueprint.id}-vk.json\` | Product pipeline | Canonical specification |\n| \`native/apps/${blueprint.id}\` | Native builder | Product Swift source |\n| \`native/apps/${blueprint.id}/Documentation\` | Documentation compiler | Developer handoff |\n| \`native/build/${blueprint.id}\` | Project generator | Generated Xcode project |\n| \`native/artifacts/${blueprint.id}\` | Evidence pipeline | Captures and receipts |\n`],
    ["22-risks-and-acceptance.md", `# Risks, assumptions and final acceptance\n\n## Risks\n\n${risks.map(item => `- ${item}`).join("\n")}\n\n## Assumptions\n\n${assumptions.map(item => `- ${item}`).join("\n")}\n\n## Handoff gate\n\n- Build and XCUI receipts pass.\n- Every declared action has one real control and observable result.\n- Every capability performs a real platform operation and a product mutation.\n- Documentation drift audit passes.\n- Independent visual review has no axis below 8.5/10.\n`],
  ];
}

export function writeLeanDeveloperDocumentation({ projectRoot, blueprint, manifest }) {
  const directory = join(projectRoot, "native", "Documentation", blueprint.id);
  mkdirSync(directory, { recursive: true });
  for (const file of readdirSync(directory)) if (/^\d{2}-.*\.md$/.test(file) || file === "developer-guide.md") rmSync(join(directory, file));
  const files = documents(blueprint, manifest);
  for (const [name, source] of files) writeFileSync(join(directory, name), source.endsWith("\n") ? source : `${source}\n`);
  const hash = createHash("sha256");
  for (const [name] of files) hash.update(name).update(readFileSync(join(directory, name)));
  return Object.freeze({ passed: true, directory, files: files.map(([name]) => join(directory, name)), sha256: hash.digest("hex") });
}

export function auditLeanDeveloperDocumentation({ projectRoot, blueprint, manifest }) {
  const expected = documents(blueprint, manifest);
  const directory = join(projectRoot, "native", "Documentation", blueprint.id);
  const problems = [];
  if (!existsSync(directory)) return { passed: false, directory, problems: ["documentation directory is missing"] };
  if (existsSync(join(directory, "developer-guide.md"))) problems.push("monolithic developer-guide.md is forbidden");
  for (const [name, source] of expected) {
    const path = join(directory, name);
    if (!existsSync(path)) problems.push(`${name} is missing`);
    else if (readFileSync(path, "utf8") !== (source.endsWith("\n") ? source : `${source}\n`)) problems.push(`${name} drifted from Product Blueprint`);
  }
  return { passed: problems.length === 0, directory, files: expected.map(([name]) => join(directory, name)), problems };
}
