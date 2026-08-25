import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export function parseLegacyRoot(argv) {
  const index = argv.indexOf("--legacy-root");
  const value = index === -1 ? null : argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("legacy evidence adapter requires --legacy-root <legacy-platform-root>");
  }
  const legacyRoot = resolve(value);
  const conceptsRoot = join(legacyRoot, "concepts");
  if (!existsSync(conceptsRoot) || !statSync(conceptsRoot).isDirectory()) {
    throw new Error(`--legacy-root must contain concepts/: ${legacyRoot}`);
  }
  const rest = argv.filter((_, itemIndex) => itemIndex !== index && itemIndex !== index + 1);
  const unknown = rest.find(item => item.startsWith("--"));
  if (unknown) throw new Error(`unknown legacy adapter option: ${unknown}`);
  return { legacyRoot, conceptsRoot, rest };
}
