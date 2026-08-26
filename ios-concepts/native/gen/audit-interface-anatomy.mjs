#!/usr/bin/env node
import { join } from "node:path";
import { auditNativeInterface } from "../lib/interface-anatomy.mjs";
import { NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: audit-interface-anatomy.mjs <slug>");
  process.exit(1);
}

const result = auditNativeInterface(join(NATIVE_PROJECT_ROOT, "native", "apps", slug));
if (!result.ok) {
  for (const issue of result.diagnostics) console.error(`✗ ${issue.file} [${issue.rule}] ${issue.message}`);
  process.exit(1);
}
console.log(`✓ ${slug}: interface anatomy`);
