#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const launcher = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(launcher, "..");
const required = ["CAMO_DEVELOPMENT_TEAM", "CAMO_BUNDLE_ID"];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`TestFlight archive requires: ${missing.join(", ")}`);
  process.exit(2);
}

execFileSync(process.execPath, [join(launcher, "gen", "gen-launcher.mjs")], {
  cwd: root,
  env: { ...process.env, CAMO_DISTRIBUTION: "testflight" },
  stdio: "inherit",
});
const build = join(launcher, "build");
execFileSync("/usr/bin/xcodebuild", [
  "-project", join(build, "Camo.xcodeproj"),
  "-scheme", "Camo",
  "-configuration", "Release",
  "-destination", "generic/platform=macOS",
  "-archivePath", join(build, "Camo.xcarchive"),
  "archive",
], { cwd: build, stdio: "inherit" });
console.log(`✓ TestFlight archive: ${join(build, "Camo.xcarchive")}`);
