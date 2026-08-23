#!/usr/bin/env node
// Конвейер концепта одной командой: спека → манифест → проект → сборка →
// съёмка состояний → ворота → критик.
//
// Смысл в порядке и в остановке: каждый шаг падает там, где дефект родился,
// а не на глазах человека через три фазы. Ниже планки наружу не выходит
// ничего — это и есть обещание «не искать косяки руками».

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: pipeline.mjs <slug>"); process.exit(1); }

const appName = slug[0].toUpperCase() + slug.slice(1);
const projectDir = join(NATIVE, "build", slug);

const steps = [
  {
    title: "компиляция спеки",
    run: () => execFileSync(process.execPath, [join(__dir, "compile-concept.mjs"), slug], { stdio: ["ignore", "ignore", "pipe"] }),
    hint: "манифест не собрался: диагностика выше показывает, какое поле спеки виновато",
  },
  {
    title: "генерация проекта",
    run: () => execFileSync(process.execPath, [join(__dir, "gen-project.mjs"), slug], { stdio: ["ignore", "ignore", "pipe"] }),
    hint: "Info.plist и entitlements собираются из манифеста — смотреть возможности",
  },
  {
    title: "сборка",
    run: () => execFileSync("/usr/bin/xcodebuild", [
      "-project", join(projectDir, `${appName}.xcodeproj`), "-target", appName,
      "-sdk", "iphonesimulator", "-configuration", "Debug", "build",
    ], { cwd: projectDir, stdio: ["ignore", "pipe", "pipe"] }),
    hint: "приложение не собралось",
  },
  {
    title: "съёмка состояний",
    run: () => execFileSync(process.execPath, [join(__dir, "shots.mjs"), slug], { stdio: ["ignore", "pipe", "pipe"] }),
    hint: "не все объявленные состояния сняты: у каждого должен быть драйвер",
  },
  {
    title: "критика",
    run: () => execFileSync(process.execPath, [join(__dir, "critic.mjs"), slug], { stdio: "inherit" }),
    hint: "балл ниже планки концепта — отчёт в native/artifacts/<slug>/critique.md",
  },
];

console.log(`Конвейер «${slug}»\n`);

for (const [index, step] of steps.entries()) {
  process.stdout.write(`  ${index + 1}/${steps.length} ${step.title}… `);
  try {
    step.run();
    console.log("ок");
  } catch (error) {
    console.log("не прошло\n");
    const output = String(error.stdout || "") + String(error.stderr || "");
    const tail = output.trim().split("\n").slice(-18).join("\n");
    if (tail) console.log(tail + "\n");
    console.log(`Остановились на шаге «${step.title}»: ${step.hint}`);
    process.exit(1);
  }
}

console.log(`\nКонцепт «${slug}» прошёл конвейер целиком.`);
