#!/usr/bin/env node
import { resolve } from "node:path";
import { auditLegacySource } from "./lib/migration-readiness.mjs";
import { NATIVE_PROJECT_ROOT } from "./lib/native-pipeline.mjs";

const source = process.argv[2];
if (!source) {
  console.error("usage: node native/migration-cli.mjs <legacy-concept-or-concepts-directory>");
  process.exit(1);
}
const rows = auditLegacySource(resolve(source), NATIVE_PROJECT_ROOT);
for (const row of rows) {
  console.log(`${row.ready ? "✓" : "○"} ${row.name} · HTML evidence ${row.legacyEvidence.htmlScreens}/${row.legacyEvidence.declaredScreens}`);
  for (const blocker of row.blockers) console.log(`  — ${blocker}`);
}
console.log(`\nГотово к нативному выпуску: ${rows.filter(row => row.ready).length}/${rows.length}`);
