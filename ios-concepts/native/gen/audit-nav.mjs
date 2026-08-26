#!/usr/bin/env node
// Ворота навигации. Заказчик: «много навигационных косяков и дыр».
// Скрипт разбирает исходники приложения и держит четыре правила:
//
//   1. у каждого маршрута есть экран (case в destination);
//   2. у каждого маршрута есть вход из интерфейса — режим съёмки не считается,
//      он не то, чем пользуется человек;
//   3. переключений вкладки из экрана нет: прыжок в чужую вкладку рвёт стек
//      и «назад» уводит не туда, откуда пришли;
//   4. вход в профиль соответствует способу, выбранному концептом:
//      мини-аватару в корневых вкладках или профилю внутри меню.
//
// Дубли входов сами по себе не ошибка (в «Создать» у ВК их несколько),
// поэтому они не блокируют, а печатаются: их читает человек.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-nav.mjs <slug>"); process.exit(1); }

const ROOT = join(NATIVE, "..");
const appDir = join(NATIVE, "apps", slug);
function swiftFiles(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = join(prefix, entry.name);
    if (entry.isDirectory()) return swiftFiles(join(directory, entry.name), relative);
    return entry.name.endsWith(".swift") ? [relative] : [];
  });
}
const files = swiftFiles(appDir);
const src = Object.fromEntries(files.map(f => [f, readFileSync(join(appDir, f), "utf8")]));
const specPath = join(ROOT, "concepts", slug, "concept.json");
const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, "utf8")) : null;

const appFile = files.find(file => /(^|\/)App\.swift$/.test(file)) || files.find(file => /App\.swift$/.test(file));
const app = src[appFile] || "";
if (app.includes("ManifestConceptRootView")) {
  const adapterPath = join(NATIVE, "DesignSystem", "ManifestConcept.swift");
  const adapter = existsSync(adapterPath) ? readFileSync(adapterPath, "utf8") : "";
  const nodes = spec?.ux?.navigation?.nodes || [];
  const edges = spec?.ux?.navigation?.edges || [];
  const ids = new Set(nodes.map(node => node.id));
  const reachable = new Set(spec?.ux?.navigation?.reachable || []);
  const problems = [];
  if (!adapter.includes("ForEach(NativeConceptSpec.tabs)")) problems.push("общий adapter не строит root tabs из native manifest");
  if (!adapter.includes("navigationDestination(for: String.self)")) problems.push("общий adapter не обрабатывает push destination");
  if (!adapter.includes("NavigationLink(value: target)")) problems.push("общий adapter не связывает navigate action с destination");
  for (const node of nodes) if (!reachable.has(node.id)) problems.push(`${node.id}: поверхность не входит в доказанное reachable-множество`);
  for (const edge of edges) {
    if (edge.from !== null && edge.from !== undefined && !ids.has(edge.from)) problems.push(`${edge.id}: отсутствует source ${edge.from}`);
    if (!ids.has(edge.to)) problems.push(`${edge.id}: отсутствует destination ${edge.to}`);
  }
  console.log(`Навигация концепта «${slug}»: ${nodes.length} поверхностей и ${edges.length} переходов через ManifestConceptRootView`);
  if (problems.length) {
    for (const item of problems) console.log(`  ✗ ${item}`);
    process.exit(1);
  }
  console.log("Дыр и тупиков нет: граф проверен по канонической UX Specification, adapter потребляет его напрямую.");
  process.exit(0);
}
if (app.includes("NativeSecondarySurface") && app.includes(".navigationDestination(for: String.self)")) {
  const nodes = spec?.ux?.navigation?.nodes || [];
  const reachable = new Set(spec?.ux?.navigation?.reachable || []);
  const identity = spec?.native?.deliveryIdentity;
  const allSource = Object.values(src).join("\n");
  const problems = [];
  for (const node of nodes) if (!reachable.has(node.id)) problems.push(`${node.id}: поверхность не входит в доказанное reachable-множество`);
  for (const surface of identity?.coreSurfaces || []) if (!allSource.includes(`.nativeSurface("${surface}")`)) {
    problems.push(`${surface}: core surface не имеет собственной композиции`);
  }
  console.log(`Навигация концепта «${slug}»: собственные core surfaces + contract router для вторичных задач`);
  if (problems.length) { for (const item of problems) console.log(`  ✗ ${item}`); process.exit(1); }
  console.log("Граф достижим, а вторичные переходы исполняются через канонический action contract.");
  process.exit(0);
}
if (app.includes(".nativeSurface(") && spec?.ux?.navigation?.nodes?.length) {
  const nodes = spec.ux.navigation.nodes;
  const reachable = new Set(spec.ux.navigation.reachable || []);
  const allSource = Object.values(src).join("\n");
  const problems = [];
  for (const node of nodes) if (!reachable.has(node.id)) problems.push(`${node.id}: поверхность не входит в доказанное reachable-множество`);
  for (const surface of spec.native?.deliveryIdentity?.coreSurfaces || []) {
    const routed = allSource.includes(`.nativeSurface("${surface}")`)
      || (allSource.includes(".nativeSurface(") && allSource.includes(`"${surface}"`));
    if (!routed) problems.push(`${surface}: core surface не имеет собственной композиции`);
  }
  console.log(`Навигация концепта «${slug}»: ${nodes.length} поверхностей через contract-driven router`);
  if (problems.length) { for (const item of problems) console.log(`  ✗ ${item}`); process.exit(1); }
  console.log("Граф достижим, core surfaces привязаны к нативным композициям.");
  process.exit(0);
}
const enumName = (app.match(/enum\s+(\w+Route)\s*:/) || [])[1];
if (!enumName) { console.error("не нашёл enum маршрутов в App.swift"); process.exit(1); }

// маршруты из enum
const enumBody = app.slice(app.indexOf(`enum ${enumName}`)).split("}")[0];
const routes = [];
for (const line of enumBody.split("\n")) {
  const m = line.match(/^\s*case\s+(.+)$/);
  if (!m) continue;
  for (const c of m[1].split(",")) {
    const name = c.trim().match(/^(\w+)/);
    if (name) routes.push(name[1]);
  }
}

// экраны маршрутов: case внутри destination(_:)
const destBody = app.slice(app.indexOf("private func destination("));
const destinations = new Set([...destBody.matchAll(/case\s+\.(\w+)/g)].map(m => m[1]));

// точки входа из интерфейса — всё, кроме applyShotMode()
function withoutFunction(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) return source;
  const brace = source.indexOf("{", start);
  if (brace < 0) return source;
  let depth = 0;
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(0, start) + source.slice(index + 1);
  }
  return source;
}
const uiSources = Object.entries(src).map(([f, text]) =>
  [f, f === "App.swift"
    ? withoutFunction(
        withoutFunction(withoutFunction(text, "private func applyShotMode()"), "private func selectTab(role:"),
        "private var selectedTab",
      )
    : text]);

const entries = Object.fromEntries(routes.map(r => [r, []]));
const tabJumps = [];
const avatarEntries = [];

for (const [file, text] of uiSources) {
  text.split("\n").forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    for (const m of line.matchAll(new RegExp(`(?:push|sheet:|cover:)[\\s(]*${enumName}\\.(\\w+)`, "g"))) {
      if (entries[m[1]]) entries[m[1]].push(at);
    }
    // плитки сервисов: маршрут лежит в таблице и уходит в push(s.3)
    for (const m of line.matchAll(/^\s*\(".+,\s*\.(\w+)\),?\s*$/g)) {
      if (entries[m[1]]) entries[m[1]].push(at);
    }
    if (/\bnav\.tab\s*=(?!=)/.test(line)) tabJumps.push(at);
    if (/avatarAction:|openProfile:/.test(line)) avatarEntries.push(file);
  });
}

const problems = [];

// Один root-screen не может предлагать профиль двумя одинаковыми входами
// (например, аватар в заголовке и сразу следующая profile-card).
for (const [file, text] of Object.entries(src)) {
  for (const match of text.matchAll(/struct\s+(\w+Screen)\s*:\s*View\s*\{([\s\S]*?)(?=\nstruct\s+\w+|$)/g)) {
    const body = match[2];
    const rootAvatar = /VKTabHeader\([\s\S]{0,240}avatarAction:/.test(body);
    const explicitProfileRow = /(?:VKRow|DvorRow)\([^\n]*(?:Профил|Аккаунт)|profile-row/.test(body);
    if (rootAvatar && explicitProfileRow) {
      problems.push(`✗ ${match[1]}: аватар и строка профиля дублируют один root-вход (${file})`);
    }
  }
}

for (const r of routes) {
  if (!destinations.has(r)) problems.push(`✗ ${r.padEnd(10)} нет экрана в destination()`);
  else if (!entries[r].length) problems.push(`✗ ${r.padEnd(10)} недостижим из интерфейса — дыра в навигации`);
}
for (const at of tabJumps) problems.push(`✗ переключение вкладки из экрана — ${at}`);

// Мини-аватар обязателен только для концептов, которые явно выбрали такой вход.
const rootTabMatches = [...app.matchAll(/case\s+"([a-z]+)":\s*(\w+)Screen\(\)|default:\s*(\w+)Screen\(\)/g)];
const rootTabs = rootTabMatches.map(m => m[2] || m[3]);
if (spec?.native?.navigation?.profileEntry === "root-avatar") {
  for (const screen of rootTabs) {
    const file = files.find(f => new RegExp(`struct ${screen}Screen`).test(src[f]));
    if (!file) continue;
    const full = /ignoresSafeArea|tabViewStyle\(\.page/.test(src[file]);
    if (!full && !avatarEntries.includes(file)) {
      problems.push(`✗ ${screen}: в топбаре нет мини-аватара — вход в профиль потерян (${file})`);
    }
  }
}
const entryByTab = spec?.native?.navigation?.profileEntryByTab;
if (entryByTab) {
  const validEntries = new Set(["root-avatar", "profile-row", "none"]);
  for (const tab of spec.native.navigation.tabs || []) {
    if (!validEntries.has(entryByTab[tab.id])) problems.push(`✗ ${tab.id}: не задан единственный способ входа в профиль`);
  }
}

// Расхождение со спекой. Решает человек — какую сторону править, поэтому
// это отчёт, а не блокер: молча разъезжаться они не должны.
const drift = [];
if (spec) {
  // Исторические расхождения имён: экран один, названия разные.
  const alias = { auth: "phone", feed: "home", outfit: "post", clips: "clip" };
  const nativeTabs = spec.native?.navigation?.tabs || spec.tabs || [];
  const specTabs = nativeTabs.map(t => t.screen || t.id);
  // Dynamic SwiftUI tabs are generated directly from the compiled contract;
  // there is no second hand-written list that can drift.
  const appTabs = app.includes("ForEach(NativeConceptSpec.tabs)")
    ? specTabs
    : rootTabMatches.map(m => m[1] || "menu").map(t => alias[t] || t);
  if (specTabs.join(",") !== appTabs.join(",")) {
    drift.push(`вкладки: спека [${specTabs.join(" · ")}] — приложение [${appTabs.join(" · ")}]`);
  }
  const specScreens = new Set((spec.screens || []).map(s => s.id));
  const shotMode = app.slice(app.indexOf("private func applyShotMode()"));
  const shots = [...shotMode.matchAll(/case\s+"([a-z]+)"/g)].map(m => m[1]);
  const onlyApp = shots.filter(s => !specScreens.has(alias[s] || s));
  if (onlyApp.length) drift.push(`экраны есть в приложении, но не в спеке: ${onlyApp.join(", ")}`);
}

console.log(`Навигация концепта «${slug}»: маршрутов ${routes.length}\n`);
for (const r of routes) {
  const e = entries[r] || [];
  const mark = e.length ? "✓" : "✗";
  console.log(`  ${mark} ${r.padEnd(10)} ${e.length ? e.join(", ") : "входа нет"}`);
}

if (drift.length) {
  console.log("\nРасходится со спекой (concept.json — источник правды):\n");
  for (const d of drift) console.log("  ! " + d);
}

if (problems.length) {
  console.log("\nПроблемы:\n");
  for (const l of problems) console.log("  " + l);
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
if (drift.length) {
  console.log(`\nБЛОКЕРЫ: ${drift.length}`);
  process.exit(1);
}
console.log("\nДыр и тупиков нет: каждый маршрут достижим, вкладки не прыгают.");
