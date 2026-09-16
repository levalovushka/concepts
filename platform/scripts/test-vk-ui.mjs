import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";
import { build } from "./build.mjs";

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error(
    "укажите концепты: node scripts/test-vk-ui.mjs stol podacha shtrikh",
  );
  process.exit(1);
}

const iconSource = await readFile(join(ROOT, "kernel", "icons.svg"), "utf8");
const iconIds = new Set(
  [...iconSource.matchAll(/id="i-([^"]+)"/g)].map((match) => match[1]),
);
const failures = [];

for (const slug of slugs) {
  build(slug);
  const screenDir = join(ROOT, "concepts", slug, "screens");
  const files = (await readdir(screenDir)).filter((file) =>
    file.endsWith(".html"),
  );
  const source = (
    await Promise.all(
      files.map((file) => readFile(join(screenDir, file), "utf8")),
    )
  ).join("\n");

  const missingIcons = [
    ...new Set(
      [...source.matchAll(/href="#i-([^"]+)"/g)].map((match) => match[1]),
    ),
  ].filter((id) => !iconIds.has(id));
  if (missingIcons.length)
    failures.push(`${slug}: отсутствуют иконки ${missingIcons.join(", ")}`);

  const terminalDots = [...source.matchAll(/[А-Яа-яЁё0-9»”)]\.(?=\s*<)/g)];
  if (terminalDots.length)
    failures.push(`${slug}: точки в конце UI-фраз — ${terminalDots.length}`);

  const dist = await readFile(join(ROOT, "dist", slug, "index.html"), "utf8");
  const settings =
    dist.match(
      /data-screen="settings"[\s\S]*?(?=<div class="screen|<\/template>)/,
    )?.[0] ?? "";
  const accountEntries = settings.match(/data-go="account"/g)?.length ?? 0;
  if (accountEntries > 1)
    failures.push(`${slug}: дублирующиеся входы в аккаунт — ${accountEntries}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `vk-ui: OK · ${slugs.length} концепта · иконки, копирайт и вход в аккаунт`,
);
