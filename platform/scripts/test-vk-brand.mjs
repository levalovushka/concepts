import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { ROOT, readSpec } from "./lib.mjs";

const slugs = process.argv.slice(2);
const failures = [];

if (!slugs.length) {
  console.error("укажите концепты: node scripts/test-vk-brand.mjs ryadom uzel");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const slug of slugs) {
  const spec = readSpec(slug);
  if (spec.targetSet !== "vkontakte" || spec.positioning?.mode !== "mimicry") {
    failures.push(`${slug}: концепт не заявлен как мимикрия ВКонтакте`);
    continue;
  }
  if (spec.brand?.accent?.toLowerCase() !== "#0077ff") {
    failures.push(`${slug}: brand.accent должен быть #0077FF, сейчас ${spec.brand?.accent || "не задан"}`);
  }

  const styles = readFileSync(join(ROOT, "concepts", slug, "styles.css"), "utf8").toLowerCase();
  for (const stale of ["#b63e00", "#ff985c", "#7d2bd2", "#b88bff"]) {
    if (styles.includes(stale)) failures.push(`${slug}: в CSS остался небрандовый акцент ${stale}`);
  }

  const icon = readFileSync(join(ROOT, "concepts", slug, "assets", "app-icon.png"));
  const source = readFileSync(join(ROOT, "concepts", slug, "assets", "app-store", "app-icon-source.png"));
  if (!icon.equals(source)) failures.push(`${slug}: иконка концепта и исходник App Store различаются`);
  const dataUrl = `data:image/png;base64,${icon.toString("base64")}`;
  const image = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
    const corners = [[0, 0], [img.width - 1, 0], [0, img.height - 1], [img.width - 1, img.height - 1]]
      .map(([x, y]) => [...context.getImageData(x, y, 1, 1).data]);
    return { width: img.width, height: img.height, corners };
  }, dataUrl);
  if (image.width !== 1024 || image.height !== 1024) {
    failures.push(`${slug}: app-icon.png должен быть 1024×1024, сейчас ${image.width}×${image.height}`);
  }
  if (image.corners.some(([red, green, blue, alpha]) => alpha !== 255 || red > 40 || green < 90 || green > 160 || blue < 220)) {
    failures.push(`${slug}: иконка должна иметь сплошной синий фон до углов без скруглений`);
  }
}

await browser.close();

if (failures.length) {
  console.error(`vk-brand: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}

console.log(`vk-brand: OK · ${slugs.length} концепта · #0077FF, иконки 1024×1024 без скруглений`);
