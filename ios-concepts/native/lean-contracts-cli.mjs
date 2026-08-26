#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { compileProductBlueprint } from "./lib/lean-native-factory.mjs";
import { auditLeanDeveloperDocumentation, writeLeanDeveloperDocumentation } from "./lib/lean-developer-documentation.mjs";
import { compileLeanProductUIContract, verifyLeanProductUIContract } from "./lib/lean-product-ui-contract.mjs";

const slug = process.argv[2];
if (!slug) { console.error("usage: node native/lean-contracts-cli.mjs <product-id>"); process.exit(1); }
const root = resolve(import.meta.dirname, "..");
const blueprintPath = join(root, "native", "ProductBlueprints", `${slug}-vk.json`);
if (!existsSync(blueprintPath)) { console.error(`missing Product Blueprint ${blueprintPath}`); process.exit(1); }
const blueprint = JSON.parse(readFileSync(blueprintPath, "utf8"));
const compiled = compileProductBlueprint(blueprint, { bundleId: `com.camo.${slug.replace(/[-_]/g, "")}` });
if (!compiled.ok) {
  for (const item of compiled.diagnostics) console.error(`${item.code}: ${item.message}`);
  process.exit(1);
}
const contract = compileLeanProductUIContract(blueprint, compiled.manifest);
const verification = verifyLeanProductUIContract(contract, blueprint);
if (!verification.passed) { for (const problem of verification.problems) console.error(problem); process.exit(1); }
const contractPath = join(root, "native", "ProductUIContracts", `${slug}.json`);
mkdirSync(dirname(contractPath), { recursive: true });
writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
const documentation = writeLeanDeveloperDocumentation({ projectRoot: root, blueprint, manifest: compiled.manifest });
const audit = auditLeanDeveloperDocumentation({ projectRoot: root, blueprint, manifest: compiled.manifest });
if (!audit.passed) { for (const problem of audit.problems) console.error(problem); process.exit(1); }
console.log(`✓ ${slug}: ${contract.contractId}; ${documentation.files.length} documentation files`);

