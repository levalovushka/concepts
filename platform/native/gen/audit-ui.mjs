#!/usr/bin/env node
// Ворота интерфейса. Ловят то, что не видно ни на кадре, ни в навигации:
//
//   1. кнопка-иконка без подписи — в справку по экранам она попадает как
//      «элемент экрана», а VoiceOver читает имя символа;
//   2. кегль мельче 11 pt — на устройстве это нечитаемо;
//   3. кто ещё висит на слое совместимости Legacy.swift, если он вернётся
//      (не блокирует, показывает остаток работы по мимикрии).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-ui.mjs <slug>"); process.exit(1); }

const appDir = join(NATIVE, "apps", slug);
const dsDir = join(NATIVE, "DesignSystem");
const files = [
  ...readdirSync(appDir).filter(f => f.endsWith(".swift")).map(f => ["apps/" + f, join(appDir, f)]),
  ...readdirSync(dsDir).filter(f => f.endsWith(".swift")).map(f => ["ds/" + f, join(dsDir, f)]),
];

// Слой совместимости снят: файла больше нет, но ворота остаются —
// если он вернётся, отчёт снова покажет, кто на нём висит.
const legacyPath = join(dsDir, "Legacy.swift");
const legacyNames = existsSync(legacyPath)
  ? [...readFileSync(legacyPath, "utf8").matchAll(/^struct\s+(\w+)/gm)].map(m => m[1])
  : [];

const problems = [];
const legacyUse = {};

for (const [name, path] of files) {
  const lines = readFileSync(path, "utf8").split("\n");

  lines.forEach((line, i) => {
    // 2. кегль. Иконку это правило не касается: 9 pt у глифа галочки — норма,
    // нечитаем мелкий ТЕКСТ.
    const iconLine = /Image\(systemName:/.test(line) || /Image\(systemName:/.test(lines[i - 1] || "");
    for (const m of line.matchAll(/\.font\(\.system\(size:\s*(\d+(?:\.\d+)?)/g)) {
      if (!iconLine && Number(m[1]) < 11) {
        problems.push(`✗ ${name}:${i + 1} кегль ${m[1]} — мельче 11 pt`);
      }
    }
    // 3. слой совместимости
    if (name.startsWith("apps/")) {
      for (const l of legacyNames) {
        if (new RegExp(`\\b${l}\\b`).test(line)) {
          (legacyUse[name] ||= new Set()).add(l);
        }
      }
    }
  });

  // 1. кнопка-иконка без подписи: смотрим тело кнопки до её закрытия
  lines.forEach((line, i) => {
    if (!/\bButton\s*[({]/.test(line)) return;
    const body = lines.slice(i, i + 16).join("\n");
    const hasIcon = /Image\(systemName:/.test(body);
    const hasText = /Text\(|Label\(|VKRow\(|VKPill\(|VKOutlineCapsule\(|VKSoundCapsule\(|VKMedia\(|Avatar\(/.test(body);
    const named = /accessibilityLabel\(/.test(body) || /Button\("/.test(line);
    if (hasIcon && !hasText && !named) {
      problems.push(`✗ ${name}:${i + 1} кнопка-иконка без accessibilityLabel`);
    }
  });
}

console.log(`Интерфейс концепта «${slug}»: файлов ${files.length}\n`);

const legacyRows = Object.entries(legacyUse).sort();
if (legacyRows.length) {
  console.log("  Слой совместимости Legacy.swift ещё в ходу:");
  for (const [f, set] of legacyRows) {
    console.log(`    · ${f.padEnd(22)} ${[...set].sort().join(", ")}`);
  }
  console.log("");
}

if (problems.length) {
  console.log("Проблемы:\n");
  for (const p of problems) console.log("  " + p);
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
console.log("Подписи на месте, кегль не мельче 11 pt.");
