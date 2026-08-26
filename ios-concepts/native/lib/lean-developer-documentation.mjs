import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const json = value => `\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
const table = (headers, rows) => [
  `| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`,
  ...rows.map(row => `| ${row.map(value => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", "<br>")).join(" | ")} |`),
].join("\n");

function documents(blueprint, manifest) {
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

export function writeLeanDeveloperDocumentation({ projectRoot, blueprint, manifest }) {
  const directory = join(projectRoot, "native", "apps", blueprint.id, "Documentation");
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
  const directory = join(projectRoot, "native", "apps", blueprint.id, "Documentation");
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
