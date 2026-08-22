#!/usr/bin/env node
// Снимает каждый экран концепта в симуляторе и складывает PNG в build/<slug>/shots.
// Обход детерминированный: приложение запускается сразу на нужном экране
// (launch-аргумент -shot <screen>), без эмуляции тапов.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: shots.mjs <slug> [screen ...]"); process.exit(1); }

const DEVICE = process.env.DEVICE || "iPhone 17 Pro";
const OUT = join(NATIVE, "build", slug, "shots");
const bundleId = `com.camo.${slug.replace(/[-_]/g, "")}`;

const SCREENS = process.argv.slice(3).length ? process.argv.slice(3) : [
  "auth", "feed", "services", "chats", "chat", "clips",
  "profile", "outfit", "nearby", "wardrobe", "mates", "settings", "event", "create",
];

const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const simctl = (...a) => { try { return sh("xcrun", ["simctl", ...a]); } catch (e) { return e.stdout || ""; } };
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const app = sh("/bin/sh", ["-c",
  `find "${join(NATIVE, "build", slug)}" -name "*.app" -type d | head -1`]).trim();
if (!app) { console.error("сборки нет — сначала xcodebuild"); process.exit(1); }

simctl("boot", DEVICE);
simctl("bootstatus", DEVICE, "-b");
simctl("uninstall", DEVICE, bundleId);
simctl("install", DEVICE, app);

for (const screen of SCREENS) {
  simctl("terminate", DEVICE, bundleId);
  sleep(250);
  simctl("launch", DEVICE, bundleId, "-shot", screen);
  sleep(1700);
  simctl("io", DEVICE, "screenshot", join(OUT, `${screen}.png`));
  console.log(`  ✓ ${screen}`);
}
simctl("terminate", DEVICE, bundleId);

console.log(`\n${SCREENS.length} кадров → ${OUT}`);
