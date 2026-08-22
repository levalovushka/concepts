#!/usr/bin/env node
// Ворота навигации. Заказчик: «много навигационных косяков и дыр».
// Скрипт разбирает исходники приложения и держит четыре правила:
//
//   1. у каждого маршрута есть экран (case в destination);
//   2. у каждого маршрута есть вход из интерфейса — режим съёмки не считается,
//      он не то, чем пользуется человек;
//   3. переключений вкладки из экрана нет: прыжок в чужую вкладку рвёт стек
//      и «назад» уводит не туда, откуда пришли;
//   4. вход в профиль — только мини-аватар слева сверху, и он на каждой
//      корневой вкладке, кроме полноэкранных «Клипов».
//
// Дубли входов сами по себе не ошибка (в «Создать» у ВК их несколько),
// поэтому они не блокируют, а печатаются: их читает человек.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-nav.mjs <slug>"); process.exit(1); }

const appDir = join(NATIVE, "apps", slug);
const files = readdirSync(appDir).filter(f => f.endsWith(".swift"));
const src = Object.fromEntries(files.map(f => [f, readFileSync(join(appDir, f), "utf8")]));

const app = src["App.swift"] || "";
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
const shotStart = app.indexOf("private func applyShotMode()");
const shotEnd = app.indexOf("@ViewBuilder private func tabContent");
const uiSources = Object.entries(src).map(([f, text]) =>
  [f, f === "App.swift" ? text.slice(0, shotStart) + text.slice(shotEnd) : text]);

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
    if (/\bnav\.tab\s*=/.test(line)) tabJumps.push(at);
    if (/avatarAction:/.test(line)) avatarEntries.push(file);
  });
}

const problems = [];

for (const r of routes) {
  if (!destinations.has(r)) problems.push(`✗ ${r.padEnd(10)} нет экрана в destination()`);
  else if (!entries[r].length) problems.push(`✗ ${r.padEnd(10)} недостижим из интерфейса — дыра в навигации`);
}
for (const at of tabJumps) problems.push(`✗ переключение вкладки из экрана — ${at}`);

// корневые вкладки со своим топбаром обязаны нести мини-аватар
const rootTabs = [...app.matchAll(/case\s+\d+:\s*(\w+)Screen\(\)|default:\s*(\w+)Screen\(\)/g)]
  .map(m => m[1] || m[2]);
for (const screen of rootTabs) {
  const file = files.find(f => new RegExp(`struct ${screen}Screen`).test(src[f]));
  if (!file) continue;
  const full = /ignoresSafeArea|tabViewStyle\(\.page/.test(src[file]);
  if (!full && !avatarEntries.includes(file)) {
    problems.push(`✗ ${screen}: в топбаре нет мини-аватара — вход в профиль потерян (${file})`);
  }
}

console.log(`Навигация концепта «${slug}»: маршрутов ${routes.length}\n`);
for (const r of routes) {
  const e = entries[r] || [];
  const mark = e.length ? "✓" : "✗";
  console.log(`  ${mark} ${r.padEnd(10)} ${e.length ? e.join(", ") : "входа нет"}`);
}

if (problems.length) {
  console.log("\nПроблемы:\n");
  for (const l of problems) console.log("  " + l);
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
console.log("\nДыр и тупиков нет: каждый маршрут достижим, вкладки не прыгают.");
