/* Визуальный аудит собранного концепта.
 *
 * Линтер смотрит в разметку и CSS, тест — в переходы и доступы. Между ними
 * живёт целый класс дефектов, который виден только после раскладки: рамка
 * агента у <button class="row">, растянутое флексом превью, срезанный кнопкой
 * контент, шрифт мельче минимума, утёкший со страницы стиль заголовка.
 * Все они уже случались, и все прошли и линтер, и тест, и беглый взгляд на PNG.
 *
 *   node scripts/audit-visual.mjs [slug ...]
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, listConcepts, readSpec } from './lib.mjs';

const MIN_FONT = 11;      // ios-chrome.md §8: «минимум читаемого текста — 11 pt»
const MIN_TAP = 44;       // HIG
const W = 375, H = 812;

/** Что проверяем внутри одного экрана. Выполняется в браузере. */
function probe(scr, cfg) {
  const dev = document.querySelector('.device');
  const s = dev.querySelector('[data-screen="' + scr + '"]');
  if (!s) return [{ kind: 'no-screen', what: scr }];
  dev.querySelectorAll('[data-screen]').forEach((e) => e.classList.remove('is-on'));
  s.classList.add('is-on');
  s.querySelectorAll('.perm-hidden').forEach((e) => (e.dataset.auditHidden = '1'));

  const base = dev.getBoundingClientRect();
  const out = [];
  const label = (el) => {
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 42);
    const c = el.className.toString().split(' ').slice(0, 2).join('.');
    return (c ? '.' + c : el.tagName.toLowerCase()) + (t ? ' «' + t + '»' : '');
  };

  const els = [...s.querySelectorAll('*')];
  for (const el of els) {
    if (el.closest('.perm-hidden')) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || !r.width || !r.height) continue;
    const top = r.top - base.top, left = r.left - base.left;
    const bottom = top + r.height, right = left + r.width;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

    // 1. рамка агента у кнопки-строки
    if (el.tagName === 'BUTTON' && cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none'
        && !el.matches('.cam-shutter, .pt-shutter, .otp-cell')) {
      out.push({ kind: 'button-border', what: label(el), detail: cs.borderTopWidth + ' ' + cs.borderTopStyle });
    }
    // 2а. текст, слившийся с подложкой
    //     Светлый текст на белой карточке внутри тёмного экрана виден только
    //     глазами на PNG: линтер про цвета ничего не знает, а тест кликает.
    //     Текст поверх фотографии, градиента или с тенью не считаем: там
    //     подложка не сплошная и вычислить её нечем.
    if (own) {
      /* rgb() отдаёт 0–255, а color(srgb …) от color-mix — доли: без нормализации
         светлая подложка читается как чёрная и проверка врёт. */
      const nums = (v) => {
        const raw = (v.match(/[\d.]+/g) || []).map(Number);
        if (/^color\(/.test(v)) return raw.slice(0, 3).map((x) => Math.round(x * 255)).concat(raw.slice(3));
        return raw;
      };
      const lum = ([r, g, b]) => {
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      /* Подложка складывается из слоёв: полупрозрачная плашка поверх серого
         плейсхолдера читается иначе, чем каждый слой по отдельности. */
      let overMedia = cs.textShadow !== 'none';
      const layers = [];
      for (let a = el; a && a !== s && !overMedia; a = a.parentElement) {
        const c = getComputedStyle(a);
        if (c.backgroundImage && c.backgroundImage !== 'none') { overMedia = true; break; }
        const v = nums(c.backgroundColor);
        if (v.length < 3) continue;
        const alpha = v[3] ?? 1;
        if (alpha <= 0.01) continue;
        layers.unshift({ rgb: v.slice(0, 3), alpha });
        if (alpha >= 0.99) break;
      }
      let bg = null;
      if (layers.length && layers[0].alpha >= 0.99) {
        bg = layers[0].rgb;
        for (const l of layers.slice(1)) bg = bg.map((c, i) => l.rgb[i] * l.alpha + c * (1 - l.alpha));
      }
      if (bg && !overMedia) {
        const fg = nums(cs.color).slice(0, 3);
        if (fg.length === 3) {
          const l1 = lum(fg), l2 = lum(bg);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          if (ratio < 1.8) out.push({ kind: 'low-contrast', what: label(el), detail: ratio.toFixed(2) + ':1' });
        }
      }
    }
    // 2. мелкий шрифт на видимом тексте
    if (own) {
      const px = parseFloat(cs.fontSize);
      // .tab-label — системные 10 pt из HIG, это не нарушение шкалы
      if (px < cfg.minFont && !el.matches('.tab-label, .dur')) out.push({ kind: 'tiny-font', what: label(el), detail: px + 'px' });
    }
    // 3. текст, который не поместился
    if (own && cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      out.push({ kind: 'truncated', what: label(el), detail: el.scrollWidth + '>' + el.clientWidth });
    }
    // 4. вылез за края устройства по горизонтали
    // (ленты чипов и каруселей скроллятся вбок — это не выход за края)
    let inScrollX = false;
    for (let a = el.parentElement; a && a !== s; a = a.parentElement) {
      const o = getComputedStyle(a).overflowX;
      if ((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth + 1) { inScrollX = true; break; }
    }
    if (!inScrollX && (left < -1 || right > cfg.w + 1)) {
      out.push({ kind: 'overflow-x', what: label(el), detail: Math.round(left) + '…' + Math.round(right) });
    }
    // 5. интерактив мельче хит-таргета (без .tap, который добивает область)
    if (el.matches('[data-go],[data-ask],[data-back],[data-activate],[data-jump],[data-toast]')
        && !el.classList.contains('tap') && (r.height < cfg.minTap - .5 || r.width < cfg.minTap - .5)) {
      out.push({ kind: 'small-tap', what: label(el), detail: Math.round(r.width) + '×' + Math.round(r.height) });
    }
  }

  if (cfg.uiV3) {
    const primary = [...s.querySelectorAll('[data-primary]')].filter((el) => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width && r.height && cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    if (cfg.primaryAction && primary.length !== 1) out.push({ kind: 'primary-count', what: scr, detail: `найдено ${primary.length}` });
    const bars = s.querySelectorAll('.tabbar').length;
    if (cfg.navigation === 'root' && bars !== 1) out.push({ kind: 'tabbar-contract', what: scr, detail: `root: tabbar ${bars}` });
    if (cfg.navigation !== 'root' && bars) out.push({ kind: 'tabbar-contract', what: scr, detail: `${cfg.navigation}: tabbar ${bars}` });

    for (const el of s.querySelectorAll('.card,.ios-card,.tile,[class*="-card"]')) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.height < 220 || cs.display === 'none') continue;
      const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
      const hasMedia = el.querySelector('img,video,canvas') || (cs.backgroundImage && cs.backgroundImage !== 'none');
      if (text.length < 32 && !hasMedia) out.push({ kind: 'empty-monolith', what: label(el), detail: `${Math.round(r.height)}px / ${text.length} chars` });
    }
  }

  // 6. подписи одного списка, написанные по одному шаблону
  //
  // Таблица данных ОБЯЗАНА быть однородной: «41 сторона · 1907–1928» рядом с
  // «27 сторонъ · 1910–1924» — это правильно. Слоп начинается там, где по
  // шаблону написана ПРОЗА: «Опушки · звонкая трель», «Подлесок · нисходящая
  // трель», «Кустарник · флейтовый напев» — три строки, отличающиеся только
  // эпитетом. Поэтому цифры из проверки исключены: их наличие и есть признак
  // строки данных.
  const shape = (t) => t
    .replace(/[«»"'(),.—–-]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => (/^[·|/]$/.test(w) ? w : 'W'))
    .join('');
  for (const list of s.querySelectorAll('.pt-list,.ios-list,.rh-card,.rk-card,.d-card,ul,ol')) {
    const subs = [...list.children]
      .map((row) => [...row.querySelectorAll('span,small,.t-footnote,.rh-ft,.t-caption')]
        .map((e) => (e.textContent || '').trim())
        .find((t) => t.length > 8 && t.length < 64 && /[а-яё]/i.test(t) && !/\d/.test(t)))
      .filter(Boolean);
    if (subs.length < 3) continue;
    const groups = {};
    for (const t of subs) (groups[shape(t)] ??= []).push(t);
    for (const [sh, list2] of Object.entries(groups)) {
      // Пара из двух слов («Kolos · матовый») — почти всегда данные, а не проза.
      // Одинаковые строки — это повторённый контрол («Копировать»), тоже не проза.
      const words = (sh.match(/W/g) || []).length;
      const identical = new Set(list2).size === 1;
      if (list2.length >= 3 && words >= 3 && !identical) {
        out.push({ kind: 'formula-prose', what: list2.slice(0, 3).join(' | '), detail: '×' + list2.length });
      }
    }
  }

  // 7. прижатый к низу блок перекрывает конец прокрутки
  const dock = s.querySelector('.rh-dock, .cta-col, .pt-dock, .state-foot, .sheet-footer');
  const scroll = s.querySelector('.body-scroll, .rh-scroll');
  if (dock && scroll) {
    const d = dock.getBoundingClientRect(), sc = scroll.getBoundingClientRect();
    if (d.top < sc.bottom - 2 && getComputedStyle(dock).position === 'absolute') {
      out.push({ kind: 'dock-overlap', what: label(dock), detail: 'перекрывает конец списка' });
    }
  }
  return out;
}

const KIND = {
  'no-screen': 'экран не найден',
  'button-border': 'рамка агента у кнопки',
  'tiny-font': 'шрифт мельче минимума',
  truncated: 'текст усечён',
  'overflow-x': 'вылезает за края',
  'small-tap': 'хит-таргет < 44',
  'dock-overlap': 'подвал перекрывает список',
  'formula-prose': 'подписи по одному шаблону',
  'primary-count': 'главное действие не единственное',
  'tabbar-contract': 'нарушен контракт навигации',
  'empty-monolith': 'крупный малосодержательный блок',
};

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : listConcepts();
const browser = await chromium.launch();
let total = 0;

for (const slug of slugs) {
  const spec = readSpec(slug);
  const file = join(DIST, slug, 'index.html');
  if (!existsSync(file)) { console.log(`\n=== ${slug} ===\n  не собран — сначала npm run build -- ${slug}`); continue; }
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto('file://' + file);
  await page.waitForTimeout(300);
  const screens = await page.evaluate(() =>
    [...document.querySelector('.device').querySelectorAll('[data-screen]')].map((e) => e.dataset.screen));

  const found = [];
  for (const scr of screens) {
    const hits = await page.evaluate(
      ([s, cfg, src]) => new Function('return ' + src)()(s, cfg),
      [scr, { minFont: MIN_FONT, minTap: MIN_TAP, w: W, h: H, uiV3: spec.uiContractVersion >= 3, navigation: spec.screens.find((s) => s.id === scr)?.ui?.navigation, primaryAction: spec.screens.find((s) => s.id === scr)?.ui?.primaryAction }, probe.toString()],
    );
    for (const h of hits) found.push({ scr, ...h });
  }
  if (spec.uiContractVersion >= 3) {
    const signatures = await page.evaluate(() => [...document.querySelectorAll('.device [data-screen]')]
      .filter((screen) => screen.querySelector('.tabbar'))
      .map((screen) => ({ id: screen.dataset.screen, signature: [...screen.querySelectorAll('.tabbar .tab')].map((tab) => `${tab.dataset.go}:${(tab.textContent || '').trim()}`).join('|') })));
    const unique = new Set(signatures.map((item) => item.signature));
    if (unique.size > 1) found.push({ scr: 'root', kind: 'tabbar-contract', what: signatures.map((item) => item.id).join(', '), detail: `${unique.size} разных tabbar` });
  }
  await page.close();

  console.log(`\n=== ${slug} ===`);
  if (!found.length) { console.log('  чисто'); continue; }
  total += found.length;
  const byKind = new Map();
  for (const f of found) (byKind.get(f.kind) ?? byKind.set(f.kind, []).get(f.kind)).push(f);
  for (const [kind, list] of byKind) {
    console.log(`  ${KIND[kind] ?? kind} — ${list.length}`);
    for (const f of list.slice(0, 12)) console.log(`    ${f.scr}: ${f.what}${f.detail ? '  [' + f.detail + ']' : ''}`);
    if (list.length > 12) console.log(`    … ещё ${list.length - 12}`);
  }
}

await browser.close();
if (total) { console.log(`\nвсего замечаний: ${total}`); process.exitCode = 1; }
