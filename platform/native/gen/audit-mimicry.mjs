#!/usr/bin/env node
// Ворота мимикрии. Референс-профиль перестаёт быть описанием и становится
// контрактом: его утверждения проверяются на исходниках концепта.
//
// Дефекты, из-за которых эти ворота заведены (замер 23.08, docs/quality-baseline.md):
//   · «Двор» показывал подписи под иконками таб-бара — у ВК их нет, и профиль
//     это прямо объявляет;
//   · «Меню» было списком строк вместо сетки плиток;
//   · плитка сервиса потеряла градиентную заливку и стала серым квадратом
//     сразу в двух концептах, потому что менялась в общем компоненте.
//
// Проверка идёт по исходникам: следующий шаг — мерить то же самое на
// построенном приложении через дерево доступности.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-mimicry.mjs <slug>"); process.exit(1); }

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));
const strategy = spec.native?.design?.strategy || spec.positioning?.mode;
const profileId = spec.native?.design?.referenceProfile;

if (strategy !== "mimicry") {
  console.log(`Концепт «${spec.name}» — отстройка, референс-профиль не применяется.`);
  process.exit(0);
}
if (!profileId) {
  console.error("Мимикрия без референс-профиля: проверять нечем");
  process.exit(1);
}

const profilePath = join(NATIVE, "ReferenceProfiles", profileId, "profile.json");
if (!existsSync(profilePath)) { console.error(`Профиль ${profileId} не найден`); process.exit(1); }
const profile = JSON.parse(readFileSync(profilePath, "utf8"));
const assertions = profile.assertions || [];
if (!assertions.length) {
  console.error(`У профиля ${profileId} нет утверждений: он описывает, но ничего не держит`);
  process.exit(1);
}

const appDir = join(NATIVE, "apps", slug);
const appFiles = readdirSync(appDir).filter(f => f.endsWith(".swift"))
  .map(f => [f, readFileSync(join(appDir, f), "utf8")]);
const componentsPath = join(NATIVE, "ReferenceProfiles", profileId, "Components.swift");
const components = existsSync(componentsPath) ? readFileSync(componentsPath, "utf8") : "";

// Роли поверхностей концепта: часть утверждений применима не ко всем концептам.
const roles = new Set((spec.screens || []).map(s => s.native?.role || s.ui?.pattern).filter(Boolean));

const problems = [];
const passed = [];

for (const rule of assertions) {
  const re = new RegExp(rule.pattern, "m");

  if (rule.kind === "profile-component") {
    const body = sliceComponent(components, rule.component);
    if (!body) {
      problems.push([rule, `компонент ${rule.component} не найден в профиле`]);
    } else if (!new RegExp(rule.pattern).test(body)) {
      problems.push([rule, `${rule.component} в профиле не выполняет утверждение`]);
    } else passed.push(rule);
    continue;
  }

  if (rule.requiresSurfaceRole && !rule.requiresSurfaceRole.some(role => roles.has(role))) {
    passed.push({ ...rule, title: `${rule.title} — роли нет в концепте` });
    continue;
  }

  const hits = [];
  for (const [file, text] of appFiles) {
    text.split("\n").forEach((line, i) => {
      if (re.test(line)) hits.push(`${file}:${i + 1}`);
    });
  }

  if (rule.kind === "forbid" && hits.length) {
    problems.push([rule, hits.slice(0, 4).join(", ")]);
  } else if (rule.kind === "require" && !hits.length) {
    problems.push([rule, "нет ни одного вхождения"]);
  } else passed.push(rule);
}

function sliceComponent(source, name) {
  const start = source.indexOf(`struct ${name}:`);
  if (start < 0) return null;
  const rest = source.slice(start);
  const next = rest.indexOf("\nstruct ");
  return next < 0 ? rest : rest.slice(0, next);
}

console.log(`Мимикрия «${spec.name}» по профилю ${profileId}: утверждений ${assertions.length}\n`);
for (const rule of passed) console.log(`  ✓ ${rule.id.padEnd(26)} ${rule.title}`);

if (problems.length) {
  console.log("\nПроблемы:\n");
  for (const [rule, where] of problems) {
    console.log(`  ✗ ${rule.id.padEnd(26)} ${rule.title}`);
    console.log(`    ${where}`);
    console.log(`    чинить: ${rule.fix}   (${rule.evidence})`);
  }
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
console.log("\nПрофиль выполняется: концепт читается как референс.");
