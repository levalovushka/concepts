#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { migrateWebConcept } from "../lib/web-concept-migration.mjs";
import { assertPathInside, NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";
import { VKONTAKTE_PORTFOLIOS } from "../migrations/vkontakte-portfolios.mjs";
import { VKONTAKTE_DELIVERY_IDENTITIES } from "../migrations/vkontakte-delivery-identities.mjs";
import { parseLegacyRoot } from "./arguments.mjs";

try {
  const { conceptsRoot, rest } = parseLegacyRoot(process.argv.slice(2));
  const slugs = rest.length ? rest : Object.keys(VKONTAKTE_PORTFOLIOS);

  for (const slug of slugs) {
    const portfolio = VKONTAKTE_PORTFOLIOS[slug];
    if (!portfolio) throw new Error(`unsupported VK web migration: ${slug}`);
    const sourcePath = join(conceptsRoot, slug, "concept.json");
    const webConcept = JSON.parse(readFileSync(sourcePath, "utf8"));
    const result = await migrateWebConcept({
      webConcept,
      portfolio,
      deliveryIdentity: VKONTAKTE_DELIVERY_IDENTITIES[slug],
    });
    if (!result.ok) {
      for (const item of result.diagnostics) if (item.severity === "error") {
        console.error(`✗ ${slug} · ${item.code} · ${item.path}\n  ${item.message}`);
      }
      process.exitCode = 1;
      continue;
    }
    const directory = assertPathInside(
      NATIVE_PROJECT_ROOT,
      join(NATIVE_PROJECT_ROOT, "concepts", slug),
      `migration output for ${slug}`,
    );
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "concept.json"), JSON.stringify(result.concept, null, 2) + "\n");
    console.log(`✓ ${slug}: ${result.concept.productDevelopment.selectionReceipt.receiptId}`);
  }
} catch (error) {
  console.error(error.message);
  console.error("usage: npm run legacy:migrate:vk -- --legacy-root /path/to/legacy/platform [slug ...]");
  process.exit(1);
}
