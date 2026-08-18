/* Контактный лист концепта: все экраны сеткой, один PNG на концепт. */
import { chromium } from 'playwright';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
const root = '/Users/vladshukurov/333в/repo/platform';
const out = '/private/tmp/claude-501/-Users-vladshukurov-333-/8b906872-241f-4297-8aca-0170d3cfb337/scratchpad';
const slugs = process.argv.slice(2);
const b = await chromium.launch();
for (const slug of slugs) {
  const dir = `${root}/concepts/${slug}/assets/screenshots`;
  if (!existsSync(dir)) { console.log(slug, '— нет скриншотов'); continue; }
  const files = readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  const cols = Math.min(6, Math.ceil(Math.sqrt(files.length)));
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#e9ebef;font:12px/1.3 -apple-system,sans-serif}
    .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;padding:10px}
    figure{margin:0;background:#fff;border-radius:6px;overflow:hidden}
    img{width:100%;display:block}
    figcaption{padding:4px 6px;color:#444}
  </style><div class="g">${files.map(f => `<figure><img src="file://${dir}/${f}"><figcaption>${f.replace('.png','')}</figcaption></figure>`).join('')}</div>`;
  const tmp = `${out}/sheet-${slug}.html`;
  writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width: cols * 250, height: 800 } });
  await p.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${out}/sheet-${slug}.png`, fullPage: true });
  await p.close();
  console.log(slug, '·', files.length, 'экранов');
}
await b.close();
