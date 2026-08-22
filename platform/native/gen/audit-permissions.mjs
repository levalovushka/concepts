#!/usr/bin/env node
// Ворота доступов. Правило проекта: заявленный ключ обязан иметь достижимую фичу
// в этой же сборке. Скрипт сверяет concept.json с исходниками приложения.
//
// Проверяется:
//   1. у ключа есть точка запроса в коде (perms.request(.key) или activate-фича);
//   2. точка запроса ровно одна — «один доступ, одна точка запроса»;
//   3. экран-цель из спеки существует в приложении;
//   4. usage-строка попала в Info.plist (для ключей с NS…UsageDescription).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-permissions.mjs <slug>"); process.exit(1); }

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));
const appDir = join(NATIVE, "apps", slug);
const sources = readdirSync(appDir).filter(f => f.endsWith(".swift"))
  .map(f => readFileSync(join(appDir, f), "utf8")).join("\n");

const plistPath = join(NATIVE, "build", slug, "Info.plist");
const plist = existsSync(plistPath) ? readFileSync(plistPath, "utf8") : "";

const problems = [];
const ok = [];

for (const p of spec.permissions || []) {
  const key = p.key;
  const isEntitlement = !!p.activate;

  // 1–2. точки запроса
  const re = new RegExp(`request\\(\\.${key}\\)`, "g");
  const hits = (sources.match(re) || []).length;

  // 3. экран-цель
  const target = p.target || "";
  const targetExists = !target || new RegExp(`case\\s+"${target}"|\\.${target}\\b|${target[0]?.toUpperCase()}${target.slice(1)}Screen`).test(sources);

  // 4. usage-строка
  const usageKeys = (p.plist || "").split(" + ").map(s => s.trim()).filter(s => /^NS.*UsageDescription$/.test(s));
  const usageOk = usageKeys.every(k => plist.includes(`<key>${k}</key>`));

  if (!isEntitlement && hits === 0) {
    problems.push(`✗ ${key.padEnd(12)} нет точки запроса в коде — фича «${p.feature}» недостижима`);
  } else if (hits > 1) {
    problems.push(`✗ ${key.padEnd(12)} ${hits} точек запроса — правило «один доступ, одна точка»`);
  } else if (isEntitlement && hits === 0 && !new RegExp(key, "i").test(sources)) {
    problems.push(`✗ ${key.padEnd(12)} entitlement заявлен, но в приложении нет фичи «${p.feature}»`);
  } else if (!targetExists) {
    problems.push(`✗ ${key.padEnd(12)} экран-цель «${target}» не найден в приложении`);
  } else if (usageKeys.length && !usageOk) {
    problems.push(`✗ ${key.padEnd(12)} usage-строка не попала в Info.plist`);
  } else {
    ok.push(`✓ ${key.padEnd(12)} ${p.feature}`);
  }
}

console.log(`Доступы концепта «${spec.name}»: ${spec.permissions.length}\n`);
for (const l of ok) console.log("  " + l);
if (problems.length) {
  console.log("\nПроблемы:\n");
  for (const l of problems) console.log("  " + l);
  console.log(`\nБЛОКЕРЫ: ${problems.length} из ${spec.permissions.length}`);
  console.log("Правило: ключ без достижимой фичи не заявляется. Либо фича, либо ключ снимается.");
  process.exit(1);
}
console.log("\nВсе заявленные доступы отработаны.");
