#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrateWebConcept } from "../lib/web-concept-migration.mjs";
import { VKONTAKTE_PORTFOLIOS } from "./vkontakte-portfolios.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const iosRoot = join(here, "..", "..");
const repositoryRoot = join(iosRoot, "..");
const requested = process.argv.slice(2);
const slugs = requested.length ? requested : Object.keys(VKONTAKTE_PORTFOLIOS);

for (const slug of slugs) {
  const portfolio = VKONTAKTE_PORTFOLIOS[slug];
  if (!portfolio) throw new Error(`unsupported VK web migration: ${slug}`);
  const sourcePath = join(repositoryRoot, "platform", "concepts", slug, "concept.json");
  const webConcept = JSON.parse(readFileSync(sourcePath, "utf8"));
  const result = await migrateWebConcept({ webConcept, portfolio });
  if (!result.ok) {
    for (const item of result.diagnostics) if (item.severity === "error") {
      console.error(`✗ ${slug} · ${item.code} · ${item.path}\n  ${item.message}`);
    }
    process.exitCode = 1;
    continue;
  }
  const directory = join(iosRoot, "concepts", slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "concept.json"), JSON.stringify(result.concept, null, 2) + "\n");
  console.log(`✓ ${slug}: ${result.concept.productDevelopment.selectionReceipt.receiptId}`);
}
