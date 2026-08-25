#!/usr/bin/env node
// Ворота по снятым кадрам. Ловят то, что до сих пор ловилось только глазами
// и только когда глаза доходили до конкретного экрана.
//
// Дефекты, из-за которых заведены (замер 23.08, docs/quality-baseline.md):
//   · серая полоса под статус-баром на трёх корневых вкладках «Двора» —
//     шапка ехала внутри скролла;
//   · экраны, заканчивающиеся на 40–70 % высоты: события двумя строками,
//     уведомления тремя, профиль соседа визиткой;
//   · три чата на дом из 146 квартир — список короче, чем у живого человека;
//   · «Хроника» с двенадцатью одинаковыми плитками одного и того же кадра.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: audit-shots.mjs <slug>"); process.exit(1); }

const shots = join(NATIVE, "artifacts", slug, "shots");
if (!existsSync(shots)) {
  console.error(`кадров нет: ${shots}\nсначала node gen/shots.mjs ${slug}`);
  process.exit(1);
}

const raw = execFileSync("python3", [join(__dir, "visual-probe.py"), shots], {
  encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
});
const { frames } = JSON.parse(raw);

const LIMITS = {
  emptyTail: 45,      // % высоты — больше похоже на макет, а не на экран
  textLines: 6,       // меньше строк на рабочем экране — список из трёх
  repeatedBlocks: 8,  // одинаковых клеток сетки — повтор одного кадра
};

const blockers = [];
const warnings = [];

for (const f of frames) {
  if (!f.statusBarMatchesHeader) {
    blockers.push(`${f.screen}: под статус-баром другой цвет, чем у шапки — шапка внутри скролла`);
  }
  if (f.emptyTailPercent > LIMITS.emptyTail) {
    // Состояние и модальная задача пустыми бывают по существу: пустой список
    // — это и есть состояние, а композер ждёт ввода.
    const line = `${f.screen}: пустой низ ${f.emptyTailPercent} % высоты`;
    (f.isState || f.isSheet ? warnings : blockers).push(line);
  }
  if (!f.isState && f.textLines < LIMITS.textLines) {
    warnings.push(`${f.screen}: строк текста ${f.textLines} — список короче, чем у живого человека`);
  }
  if (f.repeatedBlocks > LIMITS.repeatedBlocks) {
    warnings.push(`${f.screen}: ${f.repeatedBlocks} одинаковых блоков — повтор одного кадра или заглушки`);
  }
}

console.log(`Кадры концепта «${slug}»: ${frames.length}\n`);
const worst = [...frames].sort((a, b) => b.emptyTailPercent - a.emptyTailPercent).slice(0, 5);
console.log("  самые пустые:");
for (const f of worst) {
  console.log(`    ${f.screen.padEnd(26)} ${String(f.emptyTailPercent).padStart(3)} %   строк ${f.textLines}`);
}

if (warnings.length) {
  console.log("\nЗамечания:\n");
  for (const w of warnings) console.log("  ! " + w);
}

if (blockers.length) {
  console.log("\nПроблемы:\n");
  for (const b of blockers) console.log("  ✗ " + b);
  console.log(`\nБЛОКЕРЫ: ${blockers.length}`);
  process.exit(1);
}
console.log("\nКадры чистые: статус-бар одного цвета с шапкой, пустых экранов нет.");
