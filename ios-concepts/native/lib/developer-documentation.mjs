import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function items(value) {
  return Array.isArray(value) ? value.filter(item => item !== null && item !== undefined && String(item).trim() !== "") : [];
}

function text(value) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

function tableCell(value) {
  const rendered = Array.isArray(value)
    ? value.map(item => typeof item === "string" ? item : Object.values(item).map(text).join(": ")).join("<br>")
    : text(value);
  return rendered.replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function bullets(values) {
  return items(values).map(item => `- ${typeof item === "string" ? item : Object.entries(item).map(([key, value]) => `${key}: ${text(value)}`).join("; ")}`).join("\n");
}

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

const DOCUMENT_NAMES = [
  "00-overview", "01-product-vision", "02-domain-glossary", "03-personas-and-jobs",
  "04-core-loop-and-flows", "05-navigation", "06-screen-state-action-matrix",
  "07-state-handling", "08-design-system", "09-localization", "10-acceptance-scenarios",
  "11-fixtures", "12-permissions", "13-architecture", "14-data-and-integrations",
  "15-service-states", "16-privacy-and-trust", "17-accessibility-and-localization",
  "18-analytics", "19-testing-and-evidence", "20-setup-build-run", "21-file-map",
  "22-risks-and-acceptance", "23-app-store",
];
const DOCUMENT_BYTE_BUDGET = 20_000;
const TABLE_ROWS_PER_FILE = 32;

function splitLargeSection(source) {
  const lines = source.trim().split("\n");
  const tableStart = lines.findIndex(line => line.trim().startsWith("|"));
  if (tableStart < 0) return [source.trim() + "\n"];
  let tableEnd = tableStart;
  while (tableEnd < lines.length && lines[tableEnd].trim().startsWith("|")) tableEnd += 1;
  const table = lines.slice(tableStart, tableEnd);
  if (table.length <= TABLE_ROWS_PER_FILE + 2 && Buffer.byteLength(source) <= DOCUMENT_BYTE_BUDGET) {
    return [source.trim() + "\n"];
  }
  const before = lines.slice(0, tableStart);
  const after = lines.slice(tableEnd);
  const heading = before.find(line => line.startsWith("## ")) || "";
  const header = table.slice(0, 2);
  const rows = table.slice(2);
  const chunks = [];
  for (let start = 0; start < rows.length; start += TABLE_ROWS_PER_FILE) {
    const prefix = start === 0 ? before : [heading, ""];
    const suffix = start + TABLE_ROWS_PER_FILE >= rows.length ? after : [];
    chunks.push([...prefix, ...header, ...rows.slice(start, start + TABLE_ROWS_PER_FILE), ...suffix]
      .join("\n").trim() + "\n");
  }
  return chunks;
}

function compileDocumentFiles(markdown) {
  const lines = markdown.trim().split("\n");
  const sections = [];
  let current = [];
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current.length) sections.push(current.join("\n").trim() + "\n");
      current = [];
    }
    current.push(line);
  }
  if (current.length) sections.push(current.join("\n").trim() + "\n");
  return sections.flatMap((source, sectionIndex) => {
    const chunks = splitLargeSection(source);
    const base = DOCUMENT_NAMES[sectionIndex] || `${String(sectionIndex).padStart(2, "0")}-section`;
    return chunks.map((content, chunkIndex) => ({
      fileName: `${base}${chunks.length > 1 ? `-${String(chunkIndex + 1).padStart(2, "0")}` : ""}.md`,
      markdown: content,
    }));
  });
}

function requireArray(diagnostics, value, path) {
  if (!items(value).length) diagnostics.push(diagnostic(
    "developer-docs.source-empty",
    `Required developer documentation source ${path} is empty`,
    path,
  ));
}

function requireText(diagnostics, value, path) {
  if (typeof value !== "string" || value.trim().length < 3) diagnostics.push(diagnostic(
    "developer-docs.source-empty",
    `Required developer documentation source ${path} is empty`,
    path,
  ));
}

export function compileDeveloperDocumentation({ concept, manifest }) {
  const diagnostics = [];
  const contract = manifest?.product?.contract;
  const ux = manifest?.uxSpecification;
  const delivery = contract?.delivery;
  if (!contract) return {
    ok: false,
    diagnostics: [diagnostic("developer-docs.contract-required", "Product Contract is required", "manifest.product.contract")],
    markdown: "", documents: [],
  };
  if (!ux) return {
    ok: false,
    diagnostics: [diagnostic("developer-docs.ux-required", "UX Specification is required", "manifest.uxSpecification")],
    markdown: "", documents: [],
  };

  const requiredArrays = [
    [delivery?.domainGlossary, "delivery.domainGlossary"],
    [delivery?.personas, "delivery.personas"],
    [delivery?.criticalFlows, "delivery.criticalFlows"],
    [delivery?.architecture?.modules, "delivery.architecture.modules"],
    [delivery?.architecture?.boundaries, "delivery.architecture.boundaries"],
    [delivery?.data?.entities, "delivery.data.entities"],
    [delivery?.data?.state, "delivery.data.state"],
    [delivery?.data?.persistence, "delivery.data.persistence"],
    [delivery?.data?.integrations, "delivery.data.integrations"],
    [delivery?.accessibility, "delivery.accessibility"],
    [delivery?.localization?.locales, "delivery.localization.locales"],
    [delivery?.localization?.requirements, "delivery.localization.requirements"],
    [delivery?.analytics?.events, "delivery.analytics.events"],
    [delivery?.analytics?.successMetrics, "delivery.analytics.successMetrics"],
    [delivery?.testing?.levels, "delivery.testing.levels"],
    [delivery?.testing?.evidencePlan, "delivery.testing.evidencePlan"],
    [delivery?.testing?.capturePlan, "delivery.testing.capturePlan"],
    [delivery?.setup?.prerequisites, "delivery.setup.prerequisites"],
    [delivery?.setup?.build, "delivery.setup.build"],
    [delivery?.setup?.run, "delivery.setup.run"],
    [delivery?.ownership?.generated, "delivery.ownership.generated"],
    [delivery?.ownership?.owned, "delivery.ownership.owned"],
    [delivery?.limitations, "delivery.limitations"],
    [contract?.risks, "risks"],
    [delivery?.acceptanceCriteria, "delivery.acceptanceCriteria"],
    [delivery?.appStoreNotes, "delivery.appStoreNotes"],
    [ux?.navigation?.nodes, "ux.navigation.nodes"],
    [ux?.screens, "ux.screens"],
    [ux?.design?.semanticComponentRoles, "ux.design.semanticComponentRoles"],
    [ux?.localization?.catalog, "ux.localization.catalog"],
    [ux?.acceptanceScenarios, "ux.acceptanceScenarios"],
    [ux?.fixtures, "ux.fixtures"],
  ];
  for (const [value, path] of requiredArrays) requireArray(diagnostics, value, path);
  for (const state of ["loading", "empty", "error", "denied", "offline"]) requireText(
    diagnostics, delivery?.experienceStates?.[state], `delivery.experienceStates.${state}`,
  );
  requireText(diagnostics, contract.productThesis, "productThesis");
  requireText(diagnostics, contract.job?.outcome, "job.outcome");
  requireArray(diagnostics, manifest.navigation?.tabs, "manifest.navigation.tabs");
  requireArray(diagnostics, manifest.surfaces, "manifest.surfaces");
  requireArray(diagnostics, manifest.permissions, "manifest.permissions");

  if (diagnostics.length) return { ok: false, diagnostics, markdown: "", documents: [] };

  const actionIndex = new Map();
  for (const action of manifest.interactions?.actions || []) {
    const current = actionIndex.get(action.surface) || [];
    current.push(`${action.label} → ${action.outcome?.type}${action.outcome?.target ? `:${action.outcome.target}` : ""}${action.outcome?.state ? `:${action.outcome.state}` : ""}`);
    actionIndex.set(action.surface, current);
  }
  const permissionPlan = new Map((manifest.capabilities?.plans || []).map(plan => [plan.permissionKey, plan]));
  const entitlements = (manifest.capabilities?.entitlements || []).map(item => item.key);
  const generatedOwnership = delivery.ownership.generated.map(item => text(item)
    .replace(/concepts\/([^/]+)\/docs\/developer-guide\.md/g, "concepts/$1/docs/"));

  const markdown = [
    `# ${concept.name}: developer product guide`,
    "",
    `> Generated from Product Contract \`${contract.contractId}\` and the compiled native manifest. Do not edit by hand.`,
    `> UX Specification: \`${ux.uxSpecificationId}\`; source: \`${ux.source}\`.`,
    `> Contract status: \`${contract.status}\`; maturity floor: \`${contract.maturity.minimumAxisScore}/4\`.`,
    "",
    section("Product vision and scope", [
      `**Thesis.** ${contract.productThesis}`,
      `**Audience.** ${contract.audience.primary}`,
      `**Situation.** ${items(contract.context.situations).join("; ")}`,
      `**Job.** ${contract.job.actor} wants to ${contract.job.motivation} so that ${contract.job.outcome}.`,
      `**Wedge.** ${contract.wedge.mechanism}`,
      `**Observable differentiation.** ${contract.observableDifferentiation.behavior}; measured by ${contract.observableDifferentiation.measurement}; threshold: ${contract.observableDifferentiation.threshold}.`,
      "**In scope**",
      bullets([contract.contentModel.primaryUnit, ...contract.permissions.map(item => item.productValue)]),
      "**Non-goals**",
      bullets(contract.nonGoals),
    ].join("\n\n")),
    section("Domain glossary", [
      "| Term | Definition |",
      "|---|---|",
      ...delivery.domainGlossary.map(item => `| ${tableCell(item.term)} | ${tableCell(item.definition)} |`),
    ].join("\n")),
    section("Personas and jobs", [
      "| Persona | Context | Job |",
      "|---|---|---|",
      ...delivery.personas.map(item => `| ${tableCell(item.name)} | ${tableCell(item.context)} | ${tableCell(item.job)} |`),
    ].join("\n")),
    section("Core loop and critical flows", [
      `**Core loop:** ${contract.coreLoop.trigger} → ${contract.coreLoop.action} → ${contract.coreLoop.reward} → ${contract.coreLoop.contribution}.`,
      `**Habit loop:** ${contract.habitLoop.cue} → ${contract.habitLoop.routine} → ${contract.habitLoop.reward}; cadence: ${contract.habitLoop.frequency}.`,
      `**Activation:** ${contract.activation.moment}; signal: ${contract.activation.signal}; window: ${contract.activation.window}.`,
      "",
      "| Flow | Trigger | Steps | Outcome |",
      "|---|---|---|---|",
      ...delivery.criticalFlows.map(flow => `| ${tableCell(flow.name)} | ${tableCell(flow.trigger)} | ${tableCell(flow.steps)} | ${tableCell(flow.outcome)} |`),
    ].join("\n")),
    section("Information architecture and navigation", [
      `**Navigation model.** ${contract.reference.mentalModel}`,
      `**Reference fit.** ${contract.reference.naturalFit}`,
      "",
      `**Deep links:** ${ux.navigation.deepLinks.length ? ux.navigation.deepLinks.map(item => `\`${item.pattern}\` → \`${item.target}\``).join(", ") : "None declared."}`,
      "",
      "| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |",
      "|---|---|---|---|---|---|---|",
      ...ux.navigation.nodes.map(node => `| ${tableCell(node.id)} | ${tableCell(node.presentation)} | ${tableCell(node.parent || "—")} | ${tableCell(node.entries.map(item => `${item.type}:${item.source}`))} | ${tableCell(node.exits.map(item => `${item.type}:${item.action}`))} | ${tableCell(node.guards.length ? node.guards : ["none"])} | ${tableCell(`${node.back.type}:${node.back.destination || "none"}${node.dismiss ? `; ${node.dismiss.type}:${node.dismiss.destination || "none"}` : ""}`)} |`),
    ].join("\n")),
    section("Screen, state, and action matrix", [
      "| Surface | Product task | Presentation | States | Actions |",
      "|---|---|---|---|---|",
      ...manifest.surfaces.map(surface => `| ${tableCell(surface.id)} | ${tableCell(surface.purpose)} | ${tableCell(surface.presentation)} | ${tableCell(surface.states)} | ${tableCell(actionIndex.get(surface.id) || ["System/contract-owned outcome"])} |`),
    ].join("\n")),
    section("Canonical UX state handling", [
      "Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.",
      "",
      "| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |",
      "|---|---|---:|---|---|---|---|---|",
      ...ux.screens.flatMap(screen => screen.states.map(state => `| ${tableCell(screen.id)} | ${tableCell(state.id)} | ${state.applicable ? "yes" : "N/A"} | ${tableCell(state.applicable ? state.content.bodyKey : state.rationale)} | ${tableCell(state.availableActions || [])} | ${tableCell((state.transitions || []).map(item => `${item.action}:${item.outcome?.type}${item.outcome?.target ? `→${item.outcome.target}` : ""}`))} | ${tableCell(state.recovery?.guidanceKey || "—")} | ${tableCell(state.content?.fixtureIds || [])} |`)),
    ].join("\n")),
    section("Design tokens and semantic component roles", [
      `**SwiftUI environment:** \`${ux.design.swiftUIConsumption.environment}\`. ${ux.design.swiftUIConsumption.rule}`,
      "",
      "| Token | Value |",
      "|---|---|",
      ...Object.entries(ux.design.tokens).map(([key, value]) => `| ${tableCell(key)} | ${tableCell(value)} |`),
      "",
      "| Surface | Semantic component roles |",
      "|---|---|",
      ...ux.screens.map(screen => `| ${tableCell(screen.id)} | ${tableCell(screen.componentRoles)} |`),
    ].join("\n")),
    section("Localization string catalog", [
      "All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.",
      "",
      "| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |",
      "|---|---|---|---|---|---|",
      ...ux.localization.catalog.map(item => `| ${tableCell(item.key)} | ${tableCell(item.source)} | ${tableCell([...(item.placeholders || []), item.pluralization ? JSON.stringify(item.pluralization) : "none"])} | ${tableCell(item.context)} | ${tableCell(item.screens)} | ${tableCell(item.usage)} |`),
    ].join("\n")),
    section("Executable acceptance scenarios", [
      "| Scenario | Critical flow | Coverage | Given | When | Then |",
      "|---|---|---|---|---|---|",
      ...ux.acceptanceScenarios.map(item => `| ${tableCell(item.id)} | ${tableCell(item.flowId)} | ${tableCell(item.coverage)} | ${tableCell(item.given.map(step => `${step.type}:${step.id}`))} | ${tableCell(item.when.map(step => `${step.type}:${step.id}`))} | ${tableCell(item.then.map(step => `${step.type}:${step.id}`))} |`),
    ].join("\n")),
    section("Deterministic fixture catalog", [
      "Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.",
      "",
      "| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |",
      "|---|---|---|---|---|---|",
      ...ux.fixtures.map(item => `| ${tableCell(item.id)} | ${tableCell(`${item.surface} / ${item.state}`)} | ${tableCell(item.deterministicIds)} | ${tableCell(item.edgeCases)} | ${tableCell(`${item.provenance.kind}: ${item.provenance.source}`)} | ${tableCell(item.media.length ? item.media.map(media => `${media.assetId}: ${media.provenance}; ${media.license}`) : ["no media"])} |`),
    ].join("\n")),
    section("Permissions, capabilities, and entitlements", [
      "| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |",
      "|---|---|---|---|---|---|",
      ...contract.permissions.map(permission => `| ${tableCell(permission.key)} | ${tableCell(permission.productValue)} | ${tableCell(permission.requestMoment)} | ${tableCell(permission.flow)} | ${tableCell(permission.deniedFallback)} | ${tableCell(permissionPlan.get(permission.key)?.activation || "contract-owned")} |`),
      "",
      `**Entitlements:** ${entitlements.length ? entitlements.map(item => `\`${item}\``).join(", ") : "None."}`,
      `**Extension targets:** ${items(manifest.capabilities?.extensionTargets).map(item => `\`${item}\``).join(", ") || "None."}`,
    ].join("\n")),
    section("Architecture and module boundaries", [
      "| Module | Responsibility | Owns |",
      "|---|---|---|",
      ...delivery.architecture.modules.map(item => `| ${tableCell(item.name)} | ${tableCell(item.responsibility)} | ${tableCell(item.owns)} |`),
      "",
      "**Boundaries**",
      bullets(delivery.architecture.boundaries),
    ].join("\n")),
    section("Data, state, persistence, and integrations", [
      "**Entities**",
      bullets(delivery.data.entities),
      "**State**",
      bullets(delivery.data.state),
      "**Persistence**",
      bullets(delivery.data.persistence),
      "**Integrations**",
      bullets(delivery.data.integrations),
    ].join("\n\n")),
    section("Loading, empty, error, denied, and offline states", [
      "| State | Required behavior |",
      "|---|---|",
      ...["loading", "empty", "error", "denied", "offline"].map(state => `| ${state} | ${tableCell(delivery.experienceStates[state])} |`),
    ].join("\n")),
    section("Privacy, security, and trust", [
      "**Data inventory**",
      bullets(contract.privacy.data),
      "**Privacy principles**",
      bullets(contract.privacy.principles),
      `**Retention.** ${contract.privacy.retention}`,
      "**Trust and safety risks**",
      bullets(contract.trustSafety.risks),
      "**Controls**",
      bullets(contract.trustSafety.controls),
      `**Reporting.** ${contract.trustSafety.reporting}`,
    ].join("\n\n")),
    section("Accessibility and localization", [
      "**Accessibility**",
      bullets(delivery.accessibility),
      `**Locales:** ${delivery.localization.locales.join(", ")}`,
      "**Localization requirements**",
      bullets(delivery.localization.requirements),
    ].join("\n\n")),
    section("Analytics event plan and success metrics", [
      "**Events**",
      bullets(delivery.analytics.events),
      "**Success metrics**",
      bullets(delivery.analytics.successMetrics),
      `**Core-loop hypothesis.** ${contract.coreLoop.hypothesis}`,
      `**Validation plan.** ${contract.coreLoop.testPlan}`,
    ].join("\n\n")),
    section("Testing, evidence, and capture plan", [
      "**Levels**",
      bullets(delivery.testing.levels),
      "**Evidence**",
      bullets(delivery.testing.evidencePlan),
      "**Capture identifiers**",
      bullets(delivery.testing.capturePlan),
      "**Evidence provenance**",
      bullets(contract.evidence.map(item => `${item.id} · ${item.type} · ${item.status} · ${item.source}`)),
    ].join("\n\n")),
    section("Setup, build, and run", [
      "**Prerequisites**",
      bullets(delivery.setup.prerequisites),
      "**Build**",
      bullets(delivery.setup.build.map(item => `\`${item}\``)),
      "**Run and verify**",
      bullets(delivery.setup.run.map(item => `\`${item}\``)),
    ].join("\n\n")),
    section("Generated and owned file map", [
      "| Generated — do not hand-edit | Product-owned source |",
      "|---|---|",
      `| ${tableCell(generatedOwnership)} | ${tableCell(delivery.ownership.owned)} |`,
    ].join("\n")),
    section("Limitations, risks, and acceptance criteria", [
      "**Limitations**",
      bullets(delivery.limitations),
      "**Risks**",
      bullets(contract.risks),
      "**Assumptions still requiring evidence**",
      bullets(contract.assumptions),
      "**Acceptance criteria**",
      bullets(delivery.acceptanceCriteria),
    ].join("\n\n")),
    section("App Store notes", bullets(delivery.appStoreNotes)),
  ].join("\n").trim() + "\n";

  return { ok: true, diagnostics: [], markdown, documents: compileDocumentFiles(markdown) };
}

export function developerDocumentationPath(root, slug) {
  return join(root, "concepts", slug, "docs");
}

export function writeDeveloperDocumentation({ root, concept, manifest }) {
  const result = compileDeveloperDocumentation({ concept, manifest });
  if (!result.ok) return { ...result, path: developerDocumentationPath(root, concept.slug) };
  const path = developerDocumentationPath(root, concept.slug);
  mkdirSync(path, { recursive: true });
  for (const file of readdirSync(path)) {
    if (file === "developer-guide.md" || /^\d{2}-.*\.md$/.test(file)) rmSync(join(path, file));
  }
  for (const document of result.documents) writeFileSync(join(path, document.fileName), document.markdown);
  return { ...result, path, paths: result.documents.map(item => join(path, item.fileName)) };
}

export function auditDeveloperDocumentation({ root, concept, manifest }) {
  const result = compileDeveloperDocumentation({ concept, manifest });
  if (!result.ok) return result;
  const path = developerDocumentationPath(root, concept.slug);
  if (!existsSync(path)) return {
    ok: false,
    diagnostics: [diagnostic("developer-docs.missing", `Generated documentation directory is missing: ${path}`, path)],
    markdown: result.markdown,
  };
  const diagnostics = [];
  if (existsSync(join(path, "developer-guide.md"))) diagnostics.push(diagnostic(
    "developer-docs.monolith-forbidden", "Monolithic developer-guide.md must not be present", join(path, "developer-guide.md"),
  ));
  const expected = new Set(result.documents.map(item => item.fileName));
  const generated = readdirSync(path).filter(file => /^\d{2}-.*\.md$/.test(file));
  for (const document of result.documents) {
    const filePath = join(path, document.fileName);
    if (!existsSync(filePath)) diagnostics.push(diagnostic("developer-docs.missing", `Generated document is missing: ${filePath}`, filePath));
    else if (readFileSync(filePath, "utf8") !== document.markdown) diagnostics.push(diagnostic(
      "developer-docs.drift", `Generated document has drifted from Product Contract: ${filePath}`, filePath,
    ));
  }
  for (const file of generated) if (!expected.has(file)) diagnostics.push(diagnostic(
    "developer-docs.stale", `Stale generated document must be removed: ${join(path, file)}`, join(path, file),
  ));
  return { ok: diagnostics.length === 0, diagnostics, markdown: result.markdown, documents: result.documents, path };
}
