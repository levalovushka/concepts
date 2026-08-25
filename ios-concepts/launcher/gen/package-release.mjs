#!/usr/bin/env node

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const launcher = join(here, "..");
const root = join(launcher, "..");
const build = join(launcher, "build");
const derivedData = join(build, "ReleaseDerivedData");
const app = join(derivedData, "Build", "Products", "Release", "Camo.app");
const dist = join(launcher, "dist");
const archive = join(dist, "Camo-macOS.zip");

const identity = process.env.CAMO_DEVELOPER_ID;
const notaryProfile = process.env.CAMO_NOTARY_PROFILE;
if (!identity || !notaryProfile) {
  console.error("Release blocked: set CAMO_DEVELOPER_ID and CAMO_NOTARY_PROFILE.");
  console.error("Only a Developer ID signed and Apple-notarized build may become Camo-macOS.zip.");
  process.exit(2);
}

const run = (command, args, options = {}) => execFileSync(command, args, {
  cwd: root,
  stdio: "inherit",
  ...options,
});

run(process.execPath, [join(here, "gen-launcher.mjs")]);
rmSync(derivedData, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
rmSync(archive, { force: true });

run("xcodebuild", [
  "-project", join(build, "Camo.xcodeproj"),
  "-scheme", "Camo",
  "-configuration", "Release",
  "-derivedDataPath", derivedData,
  "CODE_SIGNING_ALLOWED=NO",
  "build",
]);

if (!existsSync(app)) throw new Error(`Release app was not built: ${app}`);
run("codesign", [
  "--force", "--deep", "--options", "runtime", "--timestamp",
  "--entitlements", join(build, "Camo.entitlements"),
  "--sign", identity,
  app,
]);
run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", app]);

run("ditto", ["-c", "-k", "--keepParent", app, archive]);
run("xcrun", [
  "notarytool", "submit", archive,
  "--keychain-profile", notaryProfile,
  "--wait",
]);
run("xcrun", ["stapler", "staple", app]);
run("spctl", ["--assess", "--type", "execute", "--verbose=2", app]);

rmSync(archive, { force: true });
run("ditto", ["-c", "-k", "--keepParent", app, archive]);
console.log(`✓ Release asset: ${archive}`);
