import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAFE_SVG = /^<svg[^>]*viewBox="0 0 24 24"[^>]*fill="none"[^>]*stroke="currentColor"[^>]*>[\s\S]*<\/svg>\s*$/;

export function loadLucideSource(version = "0.525.0", root = nativeRoot) {
  const directory = join(root, "IconSources", "lucide", version);
  const manifestPath = join(directory, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`нет Lucide source manifest ${version}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || manifest.version !== version || manifest.license !== "ISC") {
    throw new Error("Lucide manifest не закрепляет schema/version/license");
  }
  if (!existsSync(join(directory, "LICENSE"))) throw new Error("нет Lucide LICENSE");
  const icons = Object.fromEntries(manifest.icons.map(name => {
    const source = readFileSync(join(directory, `${name}.svg`), "utf8").trim();
    if (!SAFE_SVG.test(source) || /<script|(?:href|src)="https?:|url\(|<image/i.test(source)) {
      throw new Error(`Lucide ${name}: небезопасный или не-24pt SVG`);
    }
    return [name, source];
  }));
  return { directory, manifest, icons };
}

export function materializeLucideTabAssets(assetCatalog, config, root = nativeRoot) {
  if (!config || config.productChrome !== "lucide-assets") return [];
  const source = loadLucideSource(config.version, root);
  const allowed = new Set(source.manifest.icons);
  const generated = [];
  for (const name of new Set(Object.values(config.tabRoles || {}))) {
    if (!allowed.has(name)) throw new Error(`Lucide tab role ссылается на незакреплённую иконку ${name}`);
    for (const variant of ["regular", "selected"]) {
      const stroke = source.manifest.stroke[variant];
      const assetName = `lucide.tab.${name}.${variant}`;
      const directory = join(assetCatalog, `${assetName}.imageset`);
      const filename = `${assetName}.svg`;
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, filename), source.icons[name].replace('stroke-width="2"', `stroke-width="${stroke}"`) + "\n");
      writeFileSync(join(directory, "Contents.json"), JSON.stringify({
        images: [{ filename, idiom: "universal" }],
        info: { author: "camo-lucide-generator", version: 1 },
        properties: {
          "preserves-vector-representation": true,
          "template-rendering-intent": "template",
        },
      }, null, 2) + "\n");
      generated.push(assetName);
    }
  }
  return generated.sort();
}
