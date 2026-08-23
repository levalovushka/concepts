#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const nativeRoot = join(here, "..");
const platformRoot = join(nativeRoot, "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: compile-concept.mjs <slug> [--write]");
  process.exit(1);
}

const concept = JSON.parse(readFileSync(join(platformRoot, "concepts", slug, "concept.json"), "utf8"));
const result = compileNativeConcept(concept);

for (const item of result.diagnostics) {
  const mark = item.severity === "error" ? "✗" : "!";
  console.error(`${mark} ${item.code} · ${item.path}\n  ${item.message}`);
}

if (process.argv.includes("--write")) {
  const out = join(nativeRoot, "build", slug, "native-manifest.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(result.manifest, null, 2) + "\n");
  console.log(`native manifest → ${out}`);
} else {
  process.stdout.write(JSON.stringify(result.manifest, null, 2) + "\n");
}

if (!result.ok) process.exit(1);
