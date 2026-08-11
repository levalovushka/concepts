/* Скриншоты всех экранов концепта → concepts/<slug>/assets/screenshots.
   node scripts/capture.mjs petlya                     — все экраны
   node scripts/capture.mjs petlya scan yarn           — только указанные */
import { chromium } from 'playwright';
import { mkdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const [slug, ...only] = process.argv.slice(2);
if (!slug) { console.error('нужен slug: node scripts/capture.mjs petlya'); process.exit(1); }

const concept = JSON.parse(await readFile(join(root, 'concepts', slug, 'concept.json'), 'utf8'));
const light = Object.fromEntries(concept.screens.map((s) => [s.id, !!s.light]));
/* Снимаем с геройского прототипа — в нём есть все экраны концепта. */
const hero = (concept.prototypes || []).find((p) => p.hero) || (concept.prototypes || [])[0];
const H = `#pr-${hero.id}`;
const ids = concept.screens.map((s) => s.id).filter((id) => !only.length || only.includes(id));

const outDir = join(root, 'concepts', slug, 'assets', 'screenshots');
const html = join(root, 'dist', slug, 'index.html');

await mkdir(outDir, { recursive: true });
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

await browser.close();
console.log('готово:', outDir, '·', ids.length);
