#!/usr/bin/env node
// Ворота интерфейса. Ловят то, что не видно ни на кадре, ни в навигации:
//
//   1. кнопка-иконка без подписи — в справку по экранам она попадает как
//      «элемент экрана», а VoiceOver читает имя символа;
//   2. кегль мельче 11 pt — на устройстве это нечитаемо;
//   2а. кегль текста, назначенный числом мимо шкалы ролей: промежуточные
//       размеры — первый признак сгенерированного макета и первый разъезд
//       мимикрии (шкала — DesignSystem/Typography.swift);
//   3. интерактивный элемент с пустым action — мёртвая статика;
//   4. кто ещё висит на слое совместимости Legacy.swift, если он вернётся
//      (не блокирует, показывает остаток работы по мимикрии).
//   5. продуктовые тексты не кричат капсом: регистр задаёт автор строки,
//      экран не имеет права применять uppercased() как декорацию.
//   6. TextEditor внутри формы имеет ограниченную высоту и не может
//      самовольно вытеснить остальные действия за пределы первого экрана.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-ui.mjs <slug>"); process.exit(1); }

const appDir = join(NATIVE, "apps", slug);
const dsDir = join(NATIVE, "DesignSystem");
const profilesDir = join(NATIVE, "ReferenceProfiles");
function swiftFiles(root, label) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return swiftFiles(path, `${label}/${entry.name}`);
    return entry.name.endsWith(".swift") ? [[`${label}/${entry.name}`, path]] : [];
  });
}
const files = [
  ...readdirSync(appDir).filter(f => f.endsWith(".swift")).map(f => ["apps/" + f, join(appDir, f)]),
  ...readdirSync(dsDir).filter(f => f.endsWith(".swift")).map(f => ["ds/" + f, join(dsDir, f)]),
  ...swiftFiles(profilesDir, "profiles"),
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
    if (/dropdown:\s*true/.test(line)) {
      problems.push(`✗ ${name}:${i + 1} декоративный шеврон не связан с действием`);
    }
    if (name.startsWith("apps/") && /\.uppercased\(\)/.test(line)) {
      problems.push(`✗ ${name}:${i + 1} продуктовый текст принудительно переведён в капс`);
    }
    if (name.startsWith("apps/")) {
      for (const match of line.matchAll(/"([^"\n]+)"/g)) {
        const letters = [...match[1]].filter(character => /[А-ЯЁа-яё]/.test(character));
        const hasLowercase = letters.some(character => /[а-яё]/.test(character));
        if (letters.length >= 2 && !hasLowercase) {
          problems.push(`✗ ${name}:${i + 1} продуктовый текст написан капсом: «${match[1]}»`);
        }
      }
    }
    if (/\bButton\s*\{\s*\}/.test(line) || /\blink\([^\n]+\)\s*\{\s*\}/.test(line)) {
      problems.push(`✗ ${name}:${i + 1} интерактивный элемент с пустым action`);
    }
    if (/\bButton\([^\n]*\)\s*\{\s*\}/.test(line) && !/role:\s*\.cancel/.test(line)) {
      problems.push(`✗ ${name}:${i + 1} интерактивный элемент с пустым action`);
    }
    if (/\b\w*[Bb]utton\([^\n]*\)\s*\{\s*\}/.test(line) && !/\bButton\(/.test(line)) {
      problems.push(`✗ ${name}:${i + 1} компонент-кнопка с пустым action`);
    }
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

  // 2а. кегль текста мимо шкалы ролей
  if (name.startsWith("apps/")) {
    lines.forEach((line, i) => {
      const isText = /Text\(/.test(line) || (i && /Text\(/.test(lines[i - 1]) && !/Image\(/.test(lines[i - 1]));
      if (isText && /\.font\(\.system\(size:/.test(line)) {
        problems.push(`✗ ${name}:${i + 1} кегль текста числом мимо шкалы — нужна роль (.font(.role(…)) или .textStyle(…))`);
      }
    });
  }

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

  // Многострочный редактор на отдельном навигационном экране может занимать
  // всё доступное место. В составной форме высота обязана быть явной.
  lines.forEach((line, i) => {
    if (!/TextEditor\s*\(/.test(line)) return;
    const neighborhood = lines.slice(i, i + 9).join("\n");
    const standaloneEditor = /\.navigationTitle\s*\(/.test(neighborhood);
    const bounded = /\.frame\s*\(\s*height\s*:/.test(neighborhood)
      || /\.frame\s*\([^\n]*maxHeight\s*:/.test(neighborhood);
    if (!standaloneEditor && !bounded) {
      problems.push(`✗ ${name}:${i + 1} TextEditor в форме не ограничен по высоте`);
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
