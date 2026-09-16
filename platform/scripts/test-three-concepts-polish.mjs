import { chromium } from "playwright";
import { join } from "node:path";
import { ROOT, readSpec } from "./lib.mjs";
import { build } from "./build.mjs";

const cases = [
  { slug: "stol", screen: "feed", top: ".st-top.is-root", media: ".st-media > .ph" },
  { slug: "podacha", screen: "feed", top: ".p-top", media: ".p-media.ph" },
  { slug: "shtrikh", screen: "home", top: ".s-vkbar", media: ".s-sketch > .ph", maxMediaRatio: 0.72 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const failures = [];

for (const item of cases) {
  build(item.slug);
  const spec = readSpec(item.slug);
  const hero = spec.prototypes.find((prototype) => prototype.hero) ?? spec.prototypes[0];
  await page.goto(`file://${join(ROOT, "dist", item.slug, "index.html")}`);
  const root = `#pr-${hero.id}`;
  await page.evaluate(
    ({ root, screen }) => {
      const prototype = document.querySelector(root);
      prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
      prototype.querySelector(`[data-screen="${screen}"]`).classList.add("is-on");
    },
    { root, screen: item.screen },
  );

  const result = await page.evaluate(
    ({ root, screen, top, media }) => {
      const scope = document.querySelector(`${root} [data-screen="${screen}"]`);
      const topbar = scope.querySelector(top);
      const topIcons = [...topbar.querySelectorAll("button svg")].map((icon) => icon.getBoundingClientRect().width);
      const mediaNodes = [...scope.querySelectorAll(media)].map((node) => {
        const style = getComputedStyle(node);
        const after = getComputedStyle(node, "::after");
        const rect = node.getBoundingClientRect();
        return {
          backgroundImage: style.backgroundImage,
          backgroundColor: style.backgroundColor,
          afterDisplay: after.display,
          afterContent: after.content,
          ratio: rect.height / rect.width,
        };
      });
      const tabbar = scope.parentElement.querySelector(".tabbar");
      const tabbarRect = tabbar?.getBoundingClientRect();
      const tabs = tabbar
        ? [...tabbar.querySelectorAll(":scope > .tab")].map((tab) => {
            const rect = tab.getBoundingClientRect();
            const label = tab.querySelector(".tab-label") ?? tab.lastElementChild;
            const labelRect = label.getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, labelBottom: labelRect.bottom };
          })
        : [];
      return {
        topIcons,
        mediaNodes,
        tabbar: tabbarRect ? { top: tabbarRect.top, bottom: tabbarRect.bottom, height: tabbarRect.height } : null,
        tabs,
      };
    },
    { root, screen: item.screen, top: item.top, media: item.media },
  );

  if (result.topIcons.some((width) => width < 24)) failures.push(`${item.slug}: иконки topbar меньше 24px`);
  if (result.mediaNodes.some((node) => node.backgroundImage !== "none" || node.backgroundColor !== "rgb(229, 231, 235)" || node.afterDisplay !== "none")) {
    failures.push(`${item.slug}: медиаблок не является нейтральным серым плейсхолдером`);
  }
  if (item.maxMediaRatio && result.mediaNodes.some((node) => node.ratio > item.maxMediaRatio)) {
    failures.push(`${item.slug}: медиаблок чрезмерно высокий относительно ширины`);
  }
  if (!result.tabbar || result.tabbar.height < 80 || result.tabs.some((tab) => tab.labelBottom > result.tabbar.top + 51)) {
    failures.push(`${item.slug}: сломана геометрия tabbar`);
  }
}

build("stol");
await page.goto(`file://${join(ROOT, "dist", "stol", "index.html")}`);
const stolSpec = readSpec("stol");
const stolHero = stolSpec.prototypes.find((prototype) => prototype.hero) ?? stolSpec.prototypes[0];
const avatarRatios = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  prototype.querySelector('[data-screen="table"]').classList.add("is-on");
  return [...prototype.querySelectorAll('[data-screen="table"] .st-member-row .st-avatar')].map((node) => {
    const rect = node.getBoundingClientRect();
    return rect.width / rect.height;
  });
}, `#pr-${stolHero.id}`);
if (avatarRatios.some((ratio) => Math.abs(1 - ratio) > 0.05)) failures.push("stol: аватары участников растянуты");

build("podacha");
await page.goto(`file://${join(ROOT, "dist", "podacha", "index.html")}`);
const podachaSpec = readSpec("podacha");
const podachaHero = podachaSpec.prototypes.find((prototype) => prototype.hero) ?? podachaSpec.prototypes[0];
const recipeSearches = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  prototype.querySelector('[data-screen="recipes"]').classList.add("is-on");
  return prototype.querySelectorAll('[data-screen="recipes"] [aria-label="Поиск рецептов"]').length;
}, `#pr-${podachaHero.id}`);
if (recipeSearches !== 1) failures.push(`podacha: на экране рецептов ${recipeSearches} одинаковых кнопки поиска`);

const shtrikhJoin = await import("node:fs/promises").then(({ readFile }) =>
  readFile(join(ROOT, "concepts", "shtrikh", "screens", "join.html"), "utf8"),
);
if (!shtrikhJoin.includes("s-onboarding")) failures.push("shtrikh: первые экраны всё ещё используют чужой универсальный onboarding");

build("shtrikh");
await page.goto(`file://${join(ROOT, "dist", "shtrikh", "index.html")}`);
const shtrikhReactionSurface = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  prototype.querySelector('[data-screen="home"]').classList.add("is-on");
  return [...prototype.querySelectorAll('[data-screen="home"] .s-reactions button')].map(
    (node) => getComputedStyle(node).backgroundColor,
  );
}, `#pr-${(readSpec("shtrikh").prototypes.find((prototype) => prototype.hero) ?? readSpec("shtrikh").prototypes[0]).id}`);
if (shtrikhReactionSurface.some((color) => color !== "rgba(0, 0, 0, 0)")) {
  failures.push("shtrikh: техническая зона нажатия реакций видна как огромная таблетка");
}

for (const slug of ["stol", "podacha", "shtrikh"]) {
  build(slug);
  const spec = readSpec(slug);
  const hero = spec.prototypes.find((prototype) => prototype.hero) ?? spec.prototypes[0];
  await page.goto(`file://${join(ROOT, "dist", slug, "index.html")}`);
  const typography = await page.evaluate((root) => {
    const prototype = document.querySelector(root);
    const bad = [];
    prototype.querySelectorAll(".screen").forEach((screen) => screen.classList.add("is-on"));
    prototype.querySelectorAll("h1,h2,h3,p,b,strong,small,span,button,input,textarea").forEach((node) => {
      if (!node.closest(".screen")) return;
      const family = getComputedStyle(node).fontFamily.toLowerCase();
      if (family.includes("georgia") || family.includes("manrope") || family.includes("geist") || family.includes("jetbrains")) {
        bad.push({ text: node.textContent.trim().slice(0, 30), family });
      }
    });
    return bad;
  }, `#pr-${hero.id}`);
  if (typography.length) failures.push(`${slug}: используется посторонняя типографика (${typography[0].family})`);

  const geometry = await page.evaluate((root) => {
    const prototype = document.querySelector(root);
    prototype.querySelectorAll(".screen").forEach((screen) => screen.classList.add("is-on"));
    const roundSelectors = [
      ".s-avatar", ".s-avatar > .ph", ".s-profile-avatar", ".s-profile-avatar > .ph",
      ".p-avatar", ".p-profile-avatar", ".p-account-avatar", ".p-stories i.ph",
      ".st-avatar", ".st-avatar .ph", ".st-profile-avatar", ".st-profile-avatar .ph",
      ".st-seat-avatar", ".st-seat-avatar .ph",
    ].join(",");
    const distortedRounds = [...prototype.querySelectorAll(roundSelectors)].flatMap((node) => {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return [];
      return Math.abs(rect.width / rect.height - 1) > 0.05
        ? [{ className: node.className, width: rect.width, height: rect.height }]
        : [];
    });
    return { distortedRounds };
  }, `#pr-${hero.id}`);
  if (geometry.distortedRounds.length) {
    const node = geometry.distortedRounds[0];
    failures.push(`${slug}: круглый компонент растянут (${node.className}: ${node.width}×${node.height})`);
  }
}

build("stol");
await page.goto(`file://${join(ROOT, "dist", "stol", "index.html")}`);
const stolCellGeometry = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  prototype.querySelector('[data-screen="cast"]').classList.add("is-on");
  const starts = [...prototype.querySelectorAll('[data-screen="cast"] .st-device-copy')].map(
    (node) => Math.round(node.getBoundingClientRect().left),
  );
  return { starts, borders: [...prototype.querySelectorAll('[data-screen="cast"] .st-round-card')].map((node) => getComputedStyle(node).borderTopWidth) };
}, `#pr-${stolHero.id}`);
if (new Set(stolCellGeometry.starts).size > 1) failures.push("stol: текст одинаковых device-cell не выровнен по одной оси");
if (stolCellGeometry.borders.some((width) => width !== "0px")) failures.push("stol: у grouped surface осталась лишняя обводка");

build("podacha");
await page.goto(`file://${join(ROOT, "dist", "podacha", "index.html")}`);
const podachaLayout = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  const screenIds = ["steps", "cast", "audio", "kitchen", "cookings"];
  const buttons = [];
  for (const id of screenIds) {
    prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
    const screen = prototype.querySelector(`[data-screen="${id}"]`);
    screen.classList.add("is-on");
    const screenRect = screen.getBoundingClientRect();
    const button = screen.querySelector(".p-scroll > .btn-filled");
    if (!button) continue;
    const rect = button.getBoundingClientRect();
    buttons.push({ id, left: rect.left - screenRect.left, right: screenRect.right - rect.right, height: rect.height });
  }
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  const tabScreen = prototype.querySelector('[data-screen="cookings"]');
  tabScreen.classList.add("is-on");
  const iconTops = [...tabScreen.querySelectorAll(".p-tabs .ico")].map((node) => Math.round(node.getBoundingClientRect().top));
  const labelTops = [...tabScreen.querySelectorAll(".p-tabs .tab-label")].map((node) => Math.round(node.getBoundingClientRect().top));
  return { buttons, iconTops, labelTops };
}, `#pr-${podachaHero.id}`);
if (podachaLayout.buttons.some((button) => Math.abs(button.left - 14) > 1 || Math.abs(button.right - 14) > 1 || button.height < 44)) {
  failures.push("podacha: основные CTA не используют единый full-width шаблон");
}
if (new Set(podachaLayout.iconTops).size > 1 || new Set(podachaLayout.labelTops).size > 1) {
  failures.push("podacha: элементы tabbar стоят на разных вертикальных осях");
}

build("shtrikh");
await page.goto(`file://${join(ROOT, "dist", "shtrikh", "index.html")}`);
const shtrikhSpec = readSpec("shtrikh");
const shtrikhHero = shtrikhSpec.prototypes.find((prototype) => prototype.hero) ?? shtrikhSpec.prototypes[0];
const shtrikhLayout = await page.evaluate((root) => {
  const prototype = document.querySelector(root);
  const ids = ["guest", "meters", "background", "neighbors", "settings", "ads", "passwords"];
  const barBottoms = [];
  for (const id of ids) {
    prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
    const screen = prototype.querySelector(`[data-screen="${id}"]`);
    screen.classList.add("is-on");
    const screenRect = screen.getBoundingClientRect();
    const bar = screen.querySelector(".s-top, .s-pushbar");
    barBottoms.push({ id, bottom: Math.round(bar.getBoundingClientRect().bottom - screenRect.top) });
  }
  prototype.querySelectorAll(".screen").forEach((node) => node.classList.remove("is-on"));
  const settings = prototype.querySelector('[data-screen="settings"]');
  settings.classList.add("is-on");
  const switchRows = [...settings.querySelectorAll(".s-list-section > button:has(.switch)")].map((row) => {
    const copy = row.children[1].getBoundingClientRect();
    const control = row.querySelector(".switch").getBoundingClientRect();
    return Math.abs((copy.top + copy.height / 2) - (control.top + control.height / 2));
  });
  return { barBottoms, switchRows };
}, `#pr-${shtrikhHero.id}`);
if (new Set(shtrikhLayout.barBottoms.map((bar) => bar.bottom)).size > 1) {
  failures.push(`shtrikh: detail topbar имеют разную высоту (${shtrikhLayout.barBottoms.map((bar) => `${bar.id}:${bar.bottom}`).join(", ")})`);
}
if (shtrikhLayout.switchRows.some((delta) => delta > 1)) failures.push("shtrikh: switch не выровнен по центру строки");

const sources = await Promise.all(
  ["stol", "podacha", "shtrikh"].map(async (slug) => {
    const { readFile, readdir } = await import("node:fs/promises");
    const dir = join(ROOT, "concepts", slug, "screens");
    const files = await readdir(dir);
    const chunks = await Promise.all(files.filter((file) => file.endsWith(".html")).map((file) => readFile(join(dir, file), "utf8")));
    return chunks.join("\n");
  }),
);
if (sources.some((source) => /[А-ЯЁ]{3,}/u.test(source))) {
  failures.push("три концепта: в UI вернулся капс");
}
const foreignBrandChecks = [
  { slug: "stol", source: sources[0], pattern: /(?:Подача|Штрих|Двор)/u },
  { slug: "podacha", source: sources[1], pattern: /(?:Штрих|Двор)/u },
  { slug: "shtrikh", source: sources[2], pattern: /(?:Подача|Открыть Двор|приложение «Двор»)/u },
];
for (const check of foreignBrandChecks) {
  if (check.pattern.test(check.source)) failures.push(`${check.slug}: в UI остался след чужого продукта`);
}

await browser.close();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("three-concepts-polish: OK");
