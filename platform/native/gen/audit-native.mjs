#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
if (!slug) {
  console.error("usage: audit-native.mjs <slug>");
  process.exit(1);
}

for (const gate of ["audit-nav.mjs", "audit-ui.mjs", "audit-actions.mjs", "audit-permissions.mjs", "audit-mimicry.mjs", "audit-shots.mjs"]) {
  execFileSync(process.execPath, [join(here, gate), slug], { stdio: "inherit" });
}
