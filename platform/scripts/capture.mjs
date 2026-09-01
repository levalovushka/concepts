/* Скриншоты всех экранов концепта → concepts/<slug>/assets/screenshots.
   node scripts/capture.mjs petlya                     — все экраны
   node scripts/capture.mjs petlya scan yarn           — только указанные */
import { chromium } from 'playwright';
import { mkdir, readFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { ROOT, readSpec, readMarkup } from './lib.mjs';
import { build, prepareEmailRegistration } from './build.mjs';

const [slug, ...args] = process.argv.slice(2);
const sheet = args.includes('--sheet');
const only = args.filter((arg) => arg !== '--sheet');
if (!slug) { console.error('нужен slug: node scripts/capture.mjs petlya'); process.exit(1); }

/* PNG должны соответствовать текущим исходникам, а не случайно оставшейся
   сборке в dist. Это также гарантирует актуальный общий iOS chrome. */
build(slug);
const source = readSpec(slug);
const concept = prepareEmailRegistration(source, readMarkup(slug, source)).spec;
const light = Object.fromEntries(concept.screens.map((s) => [s.id, !!s.light]));
/* Снимаем с геройского прототипа — в нём есть все экраны концепта. */
const hero = (concept.prototypes || []).find((p) => p.hero) || (concept.prototypes || [])[0];
const H = `#pr-${hero.id}`;
const ids = concept.screens.map((s) => s.id).filter((id) => !only.length || only.includes(id));

const outDir = join(ROOT, 'concepts', slug, 'assets', 'screenshots');
const html = join(ROOT, 'dist', slug, 'index.html');

await mkdir(outDir, { recursive: true });
/* Полная пересъёмка также убирает PNG экранов, которых больше нет
   в спецификации. При точечном capture остальные файлы не трогаем. */
if (!only.length) {
  const current = new Set(concept.screens.map((screen) => `${screen.id}.png`));
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.png') && file !== 'overview.png' && !current.has(file)) {
      await unlink(join(outDir, file));
      console.log('удалён устаревший', file);
    }
  }
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
await page.goto('file://' + html, { waitUntil: 'networkidle' });

const device = page.locator(H);
await device.waitFor({ state: 'visible' });

for (const id of ids) {
  await page.evaluate(({ screenId, dark, h }) => {
    const root = document.querySelector(h);
    root.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-on'));
    root.querySelector(`[data-screen="${screenId}"]`)?.classList.add('is-on');
    root.querySelector('.sysask').classList.remove('is-on');
    root.querySelector('.snackbar').classList.remove('is-on');
    root.querySelector('.status').classList.toggle('dark-ink', dark);
  }, { screenId: id, dark: light[id], h: H });
  await page.waitForTimeout(140);
  await device.screenshot({ path: join(outDir, `${id}.png`) });
  console.log('ok', id);
}

if (sheet) {
  const cards = await Promise.all(ids.map(async (id) => {
    const png = await readFile(join(outDir, `${id}.png`));
    return `<figure><img src="data:image/png;base64,${png.toString('base64')}" alt=""><figcaption>${id}</figcaption></figure>`;
  }));
  const overview = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  await overview.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;padding:32px;background:#e9e9e7;color:#171717;font-family:Inter,Arial,sans-serif}
    h1{margin:0 0 24px;font-size:28px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:24px;align-items:start}
    figure{margin:0;min-width:0}img{display:block;width:100%;height:auto;border-radius:26px;box-shadow:0 1px 2px rgba(0,0,0,.12)}
    figcaption{padding:8px 4px 0;font-size:13px;font-weight:600;color:#555}
  </style></head><body><h1>${concept.name} · все экраны</h1><main class="grid">${cards.join('')}</main></body></html>`, { waitUntil: 'load' });
  await overview.screenshot({ path: join(outDir, 'overview.png'), fullPage: true });
  console.log('ok overview');
}

await browser.close();
console.log('готово:', outDir, '·', ids.length);
