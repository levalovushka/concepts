#!/usr/bin/env node
import { auditLegacySource } from "../lib/migration-readiness.mjs";
import { NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";
import { parseLegacyRoot } from "./arguments.mjs";

try {
  const { conceptsRoot, rest } = parseLegacyRoot(process.argv.slice(2));
  if (rest.length) throw new Error("legacy audit accepts no positional arguments");
  const rows = auditLegacySource(conceptsRoot, NATIVE_PROJECT_ROOT);
  for (const row of rows) {
    console.log(`${row.ready ? "✓" : "○"} ${row.name} · HTML evidence ${row.legacyEvidence.htmlScreens}/${row.legacyEvidence.declaredScreens}`);
    for (const blocker of row.blockers) console.log(`  — ${blocker}`);
  }
  console.log(`\nГотово к нативному выпуску: ${rows.filter(row => row.ready).length}/${rows.length}`);
} catch (error) {
  console.error(error.message);
  console.error("usage: npm run legacy:audit -- --legacy-root /path/to/legacy/platform");
  process.exit(1);
}
