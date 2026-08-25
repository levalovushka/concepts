#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyNativeDelivery } from "../lib/native-delivery.mjs";

const slug = process.argv[2];
if (!slug) { console.error("usage: gate-delivery.mjs <slug>"); process.exit(1); }
const root = join(import.meta.dirname, "../..");
const concept = JSON.parse(readFileSync(join(root, "concepts", slug, "concept.json"), "utf8"));
const result = verifyNativeDelivery(concept, join(root, "native", "apps", slug));
for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
if (!result.ok) process.exit(1);
console.log(`✓ native delivery ${slug} · product identity and owned realization verified`);
