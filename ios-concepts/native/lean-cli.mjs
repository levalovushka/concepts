#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compileNativeConcept } from "./lib/compile-concept.mjs";
import { createLeanDeliveryProof, selectCoreProofSurfaces } from "./lib/lean-delivery-proof.mjs";
import { shotArtifactDirectory } from "./lib/shot-artifacts.mjs";

const nativeRoot = dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
const shouldProve = process.argv.includes("--prove");
const shouldBuild = process.argv.includes("--build") || shouldProve;

if (!slug) {
  console.error("usage: npm run native:lean -- <slug> [--build] [--prove]");
  process.exit(1);
}

function blueprintPathFor(value) {
  const directory = join(nativeRoot, "ProductBlueprints");
  const exact = join(directory, `${value}.json`);
  if (existsSync(exact)) return exact;
  const match = readdirSync(directory)
    .filter(name => name.endsWith(".json"))
    .map(name => join(directory, name))
    .find(path => JSON.parse(readFileSync(path, "utf8")).id === value);
  if (match) return match;
  const targetQualified = join(directory, `${value}-vk.json`);
  return existsSync(targetQualified) ? targetQualified : null;
}

const blueprintPath = blueprintPathFor(slug);
if (!blueprintPath) {
  console.error(`Product Blueprint for ${slug} was not found`);
  process.exit(1);
}

const blueprint = JSON.parse(readFileSync(blueprintPath, "utf8"));
const result = compileNativeConcept(blueprint, { bundleId: `com.camo.${slug.replace(/[-_]/g, "")}` });
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}

const generation = spawnSync(process.execPath, [join(nativeRoot, "gen", "gen-project.mjs"), slug], {
  cwd: join(nativeRoot, ".."), stdio: "inherit",
});
if (generation.status !== 0) process.exit(generation.status || 1);

for (const gate of ["audit-lean-product.mjs", "audit-nav.mjs", "audit-ui.mjs", "audit-permissions.mjs", "audit-interface-anatomy.mjs"]) {
  const audit = spawnSync(process.execPath, [join(nativeRoot, "gen", gate), slug], {
    cwd: join(nativeRoot, ".."), stdio: "inherit",
  });
  if (audit.status !== 0) process.exit(audit.status || 1);
}

if (shouldBuild) {
  const startedAt = Date.now();
  const name = slug[0].toUpperCase() + slug.slice(1);
  const buildRoot = join(nativeRoot, "build", slug);
  const build = spawnSync("xcodebuild", [
    "-quiet", "-project", join(buildRoot, `${name}.xcodeproj`), "-scheme", name,
    "-sdk", "iphonesimulator", "-destination", "platform=iOS Simulator,name=iPhone 17 Pro",
    "-derivedDataPath", join(buildRoot, "DerivedData"), "CODE_SIGNING_ALLOWED=NO", "build",
  ], { stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status || 1);

  if (shouldProve) {
    const coreSurfaces = selectCoreProofSurfaces(result.manifest);
    if (coreSurfaces.length < 3) {
      console.error("для core proof нужно минимум три смысловых экрана в Product Blueprint");
      process.exit(1);
    }
    const capture = spawnSync(process.execPath, [
      join(nativeRoot, "gen", "shots.mjs"), slug, ...coreSurfaces, "--reuse-build",
    ], { cwd: join(nativeRoot, ".."), stdio: "inherit" });
    if (capture.status !== 0) process.exit(capture.status || 1);

    const source = JSON.parse(readFileSync(join(nativeRoot, "apps", slug, "capture.json"), "utf8"));
    const drivers = new Map(source.drivers.map(item => [item.surface, item]));
    const directory = shotArtifactDirectory(nativeRoot, slug);
    const proof = createLeanDeliveryProof({
      manifest: result.manifest,
      buildReceipt: { passed: true, configuration: "Debug", simulator: "iPhone 17 Pro" },
      captures: coreSurfaces.map(surface => ({
        id: `${surface}--${drivers.get(surface)?.state || "populated/default"}`,
        surface,
        path: join(directory, `${drivers.get(surface)?.artifact}.png`),
      })),
      durationMs: Date.now() - startedAt,
    });
    const receiptPath = join(directory, "core-proof.json");
    writeFileSync(receiptPath, `${JSON.stringify(proof, null, 2)}\n`);
    if (!proof.passed) {
      for (const item of proof.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
      process.exit(1);
    }
    console.log(`✓ core proof: ${proof.captures.length} свежих кадра, ${proof.durationMs} ms → ${receiptPath}`);
    console.log("• independent visual review: required before developer handoff");
  }
}

console.log(`✓ ${result.manifest.name}: ${result.manifest.surfaces.length} screens, ${result.manifest.permissions.length} capabilities${shouldBuild ? ", build passed" : ""}${shouldProve ? ", core proof passed" : ""}`);
