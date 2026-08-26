#!/usr/bin/env node
// Критик как шаг конвейера, а не промпт.
//
// Раньше «оценить UI» означало посадить человека смотреть кадры. Теперь
// детерминированные ворота считают то, что считается, а балл собирается
// по осям рубрики (QUALITY-BY-CONSTRUCTION.md): балл поверхности — минимум
// по осям, потому что одна провальная ось не прячется за пятью хорошими.
//
// Модельная критика (gen/critic.md) работает ПОСЛЕ этого шага и разбирает
// то, что машина не формализует: продуктовый смысл экрана и характер копии.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { reviewProductUI } from "../lib/product-ui-critic.mjs";
import { effectiveQualityFloor } from "../lib/quality-policy.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: critic.mjs <slug>"); process.exit(1); }
const adapterIndex = process.argv.indexOf("--adapter");
const adapterPath = adapterIndex >= 0 ? process.argv[adapterIndex + 1] : null;

function run(script, args = []) {
  try {
    const out = execFileSync(process.execPath, [join(__dir, script), slug, ...args], {
      encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    });
    return { ok: true, out };
  } catch (error) {
    return { ok: false, out: String(error.stdout || "") + String(error.stderr || "") };
  }
}

function blockerCount(out) {
  const match = out.match(/БЛОКЕРЫ:\s*(\d+)/);
  if (match) return Number(match[1]);
  const marks = out.match(/^\s*✗/gm);
  return marks ? marks.length : 0;
}

function warningCount(out) {
  const marks = out.match(/^\s*[!]/gm);
  return marks ? marks.length : 0;
}

// Ось = ворота + вес дефекта. Блокер стоит три балла: это то, что нельзя
// показывать. Замечание — повод посмотреть, а не дефект, поэтому весит 0,2
// и в сумме не может увести ось больше чем на два балла.
const AXES = [
  { id: "mimicry", title: "Мимикрия", script: "audit-mimicry.mjs" },
  { id: "navigation", title: "Навигация", script: "audit-nav.mjs" },
  { id: "interface", title: "Интерфейс и типографика", script: "audit-ui.mjs" },
  { id: "actions", title: "Действия", script: "audit-actions.mjs" },
  { id: "capabilities", title: "Доступы и возможности", script: "audit-permissions.mjs" },
  { id: "surface", title: "Плотность и композиция", script: "audit-shots.mjs" },
];

const results = AXES.map(axis => {
  const { ok, out } = run(axis.script);
  const blockers = ok ? 0 : blockerCount(out);
  const warnings = warningCount(out);
  const score = Math.max(0, 10 - blockers * 3 - Math.min(2, warnings * 0.2));
  return { ...axis, ok, blockers, warnings, score: Math.round(score * 10) / 10, out };
});

// Состояния: доля объявленных, снятых из свежей сборки.
let stateLine = null;
try {
  const compiled = execFileSync(process.execPath, [join(__dir, "compile-concept.mjs"), slug], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
  const manifest = JSON.parse(compiled.slice(compiled.indexOf("{")));
  const declared = manifest.verification?.states?.filter(s => s.method === "screenshot").length || 0;
  const shots = join(NATIVE, "artifacts", slug, "shots");
  const taken = existsSync(shots)
    ? execFileSync("/bin/sh", ["-c", `ls "${shots}" | wc -l`], { encoding: "utf8" }).trim()
    : "0";
  const ratio = declared ? Number(taken) / declared : 0;
  stateLine = {
    id: "states", title: "Состояния", ok: ratio >= 1,
    blockers: ratio >= 1 ? 0 : 1, warnings: 0,
    score: Math.round(Math.min(10, ratio * 10) * 10) / 10,
    out: `снято ${taken} из ${declared} объявленных`,
  };
} catch (error) {
  stateLine = { id: "states", title: "Состояния", ok: false, blockers: 1, warnings: 0, score: 0, out: String(error).slice(0, 200) };
}
results.push(stateLine);

const total = Math.min(...results.map(r => r.score));

const pad = (s, n) => String(s).padEnd(n);
console.log(`Критика концепта «${slug}»\n`);
console.log(`  ${pad("ось", 26)}${pad("балл", 7)}блокеры / замечания`);
for (const r of results) {
  console.log(`  ${pad(r.title, 26)}${pad(r.score, 7)}${r.blockers} / ${r.warnings}`);
}
console.log(`\n  ИТОГ (минимум по осям): ${total}`);

const report = [
  `# Критика «${slug}»`,
  "",
  `Собрано ${new Date().toISOString().slice(0, 16).replace("T", " ")} командой \`npm run native:critic ${slug}\`.`,
  "Балл поверхности — минимум по осям: одна провальная ось не прячется за пятью хорошими.",
  "",
  "| Ось | Балл | Блокеры | Замечания |",
  "|---|---|---|---|",
  ...results.map(r => `| ${r.title} | ${r.score} | ${r.blockers} | ${r.warnings} |`),
  "",
  `**Итог: ${total} из 10.**`,
  "",
  "## Что сказали ворота",
  "",
  ...results.flatMap(r => ["### " + r.title, "", "```", r.out.trim().split("\n").slice(-24).join("\n"), "```", ""]),
  "## Дальше",
  "",
  "Модельная критика (`gen/critic.md`) разбирает то, что машина не формализует:",
  "продуктовый смысл экрана, характер копии, узнаваемость композиции. Она",
  "запускается только на сборке, прошедшей ворота выше.",
  "",
].join("\n");

const outDir = join(NATIVE, "artifacts", slug);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "critique.md"), report);
console.log(`\n  отчёт → native/artifacts/${slug}/critique.md`);

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));
const floor = effectiveQualityFloor(spec.native?.design?.qualityFloor);
if (total < floor) {
  console.log(`\nНиже планки концепта (${floor}): сборка не показывается человеку.`);
  process.exit(1);
}
console.log(`\nДетерминированная планка ${floor} взята.`);

function captureFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? captureFiles(path) : entry.name.endsWith(".png") ? [path] : [];
  });
}

const shotsDirectory = join(NATIVE, "artifacts", slug, "shots");
const captures = captureFiles(shotsDirectory).sort().map(path => ({
  id: path.slice(shotsDirectory.length + 1).replaceAll("/", ".").replace(/\.png$/, ""),
  path,
  sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
}));

let reviewer = null;
if (adapterPath) {
  const absolute = isAbsolute(adapterPath) ? adapterPath : resolve(process.cwd(), adapterPath);
  const module = await import(pathToFileURL(absolute));
  reviewer = module.productUICritic || module.default;
}
const independent = await reviewProductUI({ concept: spec, captures, reviewer });
const requestPath = join(outDir, "product-ui-review-request.json");
writeFileSync(requestPath, JSON.stringify(independent.request || {
  schemaVersion: 1, slug, captures,
  requirement: "Connect an independent reviewer adapter; deterministic audits are not product/UI criticism.",
}, null, 2) + "\n");
if (independent.receipt) writeFileSync(join(outDir, "product-ui-review-receipt.json"), JSON.stringify(independent.receipt, null, 2) + "\n");
if (!independent.ok) {
  for (const item of independent.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  console.error(`\nНезависимая продуктовая/UI-критика не пройдена. Запрос → ${requestPath}`);
  process.exit(1);
}
console.log(`Независимая критика: ЧИСТО · ${independent.receipt.receiptId}`);
