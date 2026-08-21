#!/usr/bin/env node
/**
 * Сверка слоёв (фаза 10 плейбука), механически.
 *
 * Доки, прототип и спека расходятся всегда — особенно если правки шли после
 * того, как доки написаны. Здесь ловится то, что глазами не ловится.
 *
 *   node scripts/lint-concept.mjs petlya
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { DIST, KERNEL, conceptDir, readSpec, listConcepts } from './lib.mjs';
import { screenActions } from './screen-map.mjs';

const read = (f) => readFileSync(f, 'utf8');

/** Классы верхнего уровня — для поиска мёртвых правил. Lookbehind отсекает «base.css». */
const classesIn = (css) =>
  new Set([...css.matchAll(/(?<![\w-])\.([a-z][a-z0-9-]+)(?=[\s,.:{>[])/g)].map((m) => m[1]));

/**
 * Классы, которые правило объявляет «с нуля»: селектор — ровно `.name`.
 * `.photo.p1` или `.row.row-media` — это расширение ядра, а не конфликт.
 */
const bareClassesIn = (css) =>
  new Set([...css.matchAll(/(?:^|[},])\s*((?:\.[a-z][a-z0-9-]+\s*,\s*)*\.[a-z][a-z0-9-]+)\s*\{/g)]
    .flatMap((m) => m[1].split(',').map((s) => s.trim().slice(1))));

/** Все имена классов, включая модификаторы в составных селекторах (.photo.p11). */
const allClassTokens = (css) =>
  new Set([...css.matchAll(/\.([a-z][a-z0-9-]+)(?=[\s,.:{>[])/g)].map((m) => m[1]));

/** Ядро общее: класс мёртв, только если его не использует НИ ОДИН концепт. */
function lintKernel() {
  const css = read(join(KERNEL, 'base.css'));
  const built = listConcepts()
    .map((s) => join(DIST, s, 'index.html'))
    .filter(existsSync)
    .map(read)
    .join('\n');
  if (!built) return ['ни один концепт не собран — нечего сверять'];
  const out = [];
  for (const c of classesIn(css)) {
    if (!new RegExp('[\'"\\s.]' + c + '[\'"\\s.,{:\\]]').test(built)) out.push(`мёртвый класс ядра: .${c}`);
  }
  for (const m of css.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)) {
    if (!new RegExp('var\\(\\s*' + m[1] + '\\b').test(built)) out.push(`мёртвый токен ядра: ${m[1]}`);
  }
  return [...new Set(out)];
}

function lint(slug) {
  const spec = readSpec(slug);
  const dir = conceptDir(slug);
  const built = join(DIST, slug, 'index.html');
  const problems = [];
  const P = (msg) => problems.push(msg);

  if (!existsSync(built)) return [`не собрано — сначала node scripts/build.mjs ${slug}`];
  const html = read(built);

  /* —— спека против разметки —— */
  /* Экран рендерится в каждый прототип, где он есть: id уникален на странице. */
  const inHtml = new Set([...html.matchAll(/data-screen="([a-z-]+)"/g)].map((m) => m[1]));
  for (const s of spec.screens) if (!inHtml.has(s.id)) P(`экран ${s.id} есть в спеке, но не в разметке`);
  for (const id of inHtml) if (!spec.screens.some((s) => s.id === id)) P(`экран ${id} есть в разметке, но не в спеке`);
  for (const p of spec.prototypes || []) {
    if (!html.includes(`data-proto="${p.id}"`)) P(`прототип ${p.id} не собран в файл`);
  }
  for (const p of spec.permissions) if (!html.includes(p.plist)) P(`ключ ${p.plist} не попал в собранный файл`);

  /* —— ссылки на ассеты и доки —— */
  const outDir = dirname(built);
  /* Пути внутри <script> собираются в рантайме — статически их не проверить. */
  const markup = html.replace(/<script>[\s\S]*?<\/script>/g, '');
  const refs = [...new Set([...markup.matchAll(/(?:src|href)="(?!https?:|#|data:)([^"]+)"/g)].map((m) => m[1]))];
  for (const r of refs) {
    const clean = r.split(/[?#]/)[0];
    if (!existsSync(join(outDir, clean))) P(`битая ссылка: ${r}`);
  }
  for (const d of spec.docs || []) if (!existsSync(join(dir, 'docs', d.file))) P(`нет файла доки: ${d.file}`);

  /* —— мёртвый код —— */
  /* Проверяем только СВОИ стили концепта: ядро общее, и класс, не нужный
     одному концепту, вполне нужен другому. Ядро линтуется отдельно (--kernel). */
  const ownCss = existsSync(join(dir, 'styles.css')) ? read(join(dir, 'styles.css')) : '';
  /* Всё после стилей: разметка + движок. Классы вроде .dark-ink живут только
     в JS (classList.toggle), поэтому искать надо и там. */
  const usage = html.slice(html.indexOf('</style>'));
  for (const c of classesIn(ownCss)) {
    if (!new RegExp('[\'"\\s.]' + c + '[\'"\\s.,{:\\]]').test(usage)) P(`мёртвый класс в styles.css: .${c}`);
  }
  /* Обратный дрейф опаснее: элемент в разметке есть, стиля нет — и он молча
     рендерится без оформления. */
  const allCss = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const declared = allClassTokens(allCss);
  const used = new Set();
  for (const m of markup.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => c && used.add(c));
  for (const c of used) if (!declared.has(c)) P(`класс без стиля: .${c}`);

  /* —— anti-slop contract новых концептов —— */
  if (spec.uiContractVersion >= 3 && spec.readiness?.status === 'reviewed') {
    for (const screen of spec.screens) {
      const source = read(join(dir, 'screens', `${screen.id}.html`));
      if (/\sstyle="/.test(source)) P(`${screen.id}: inline-style запрещён в UI v3 — правило должно жить в styles.css`);
      /* Фотографии и иллюстрации в концептах намеренно не производятся:
         обязательная поверхность для них — ядровой .ph. Визуальное правило
         «placeholder не становится героем композиции» проверяется по captures,
         а запрещать сам .ph здесь противоречило deliverable.md и PLAYBOOK.md. */
      if (/\p{Extended_Pictographic}/u.test(source.replace(/<svg[\s\S]*?<\/svg>/g, ''))) P(`${screen.id}: emoji нельзя использовать как продуктовый ассет или иконку`);
      for (const button of source.matchAll(/<(?:button|div)\b([^>]*(?:data-go|data-ask|data-back|data-activate)[^>]*)>([\s\S]*?)<\/(?:button|div)>/g)) {
        const attrs = button[1], body = button[2].replace(/<[^>]+>/g, '').trim();
        if (/<svg\b/.test(button[2]) && !body && !/aria-label="[^"]+"/.test(attrs)) P(`${screen.id}: icon-only control без aria-label`);
      }
    }
  }

  /* Навигационные шевроны — часть общего iOS chrome. Текстовые глифы и
     обычный ico-svg дают другую толщину и посадку. */
  for (const screen of spec.screens) {
    const source = read(join(dir, 'screens', `${screen.id}.html`));
    if (/[‹›❮❯〈〉＜＞]/.test(source)) P(`${screen.id}: текстовый шеврон запрещён — используйте SVG из ядра`);
    if (/<svg class="ico-svg"><use href="#i-chevron-left"\/><\/svg>/.test(source)) {
      P(`${screen.id}: back-chevron должен иметь класс .ios-back`);
    }
    if (/<svg class="ios-back"><use href="#i-chevron-left"\/><\/svg>/.test(source)) {
      P(`${screen.id}: .ios-back должен использовать единую SF-геометрию 12×21, а не общий icon-symbol`);
    }
  }
  if (/content\s*:\s*["'][‹›❮❯〈〉＜＞]["']/.test(ownCss)) {
    P('styles.css: текстовый шеврон в CSS запрещён — используйте .ios-back');
  }

  /* —— подписи интерактивных элементов —— */
  /* Таблица «Действия на экранах» выводится из разметки, и подпись элемента в
     ней — это его aria-label или первая строка текста. Кнопка, у которой ни
     того ни другого нет, попадает в справку как «2» или «элемент экрана»:
     разработке приходится лезть в разметку ровно за тем, что справка и должна
     была ответить. Поэтому подпись обязательна. */
  {
    const markup = {};
    for (const s of spec.screens) {
      const f = join(dir, 'screens', `${s.id}.html`);
      if (existsSync(f)) markup[s.id] = read(f);
    }
    for (const { screen, rows } of screenActions(spec, markup)) {
      for (const r of rows) {
        const l = String(r.label || '').trim();
        if (!l || l.length < 3 || /^[\d\s·+\u2014-]+$/.test(l) || l === 'элемент экрана') {
          P(`${screen.id}: элемент без внятной подписи («${l}») — добавьте aria-label`);
        }
      }
    }
  }

  /* —— сценарные срезы —— */
  /* Прототип-срез, повторяющий полный список экранов, — это не сценарий, а копия:
     разработке по нему не понять, какие экраны относятся к какому пути, а страница
     показывает одно и то же устройство несколько раз. */
  {
    const protos = spec.prototypes || [];
    const heroId = (protos.find((x) => x.hero) || protos[0] || {}).id;
    const seen = new Map();
    for (const pr of protos) {
      const key = [...pr.screens].sort().join('|');
      if (seen.has(key) && seen.get(key) !== pr.id) P(`прототипы ${seen.get(key)} и ${pr.id} состоят из одних и тех же экранов`);
      seen.set(key, pr.id);
      if (pr.id !== heroId && pr.screens.length === spec.screens.length) {
        P(`прототип ${pr.id} содержит все ${spec.screens.length} экранов — это не сценарный срез`);
      }
    }
  }

  /* —— пустышки —— */
  /* Шеврон в строке — обещание экрана. Строка без триггера, которая его рисует,
     врёт: пользователь жмёт и ничего не происходит. Либо действие, либо без стрелки. */
  {
    const VOIDT = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','use','path','rect','circle','ellipse','line','polygon','polyline','stop']);
    const TAGRE = /<(\/?)([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>/gi;
    const TRIGRE = /\bdata-(go|jump|ask|activate|toast|back|answer|act|switch|primary)\b/;
    const CHEVRE = /i-chevron-right|ios-disclosure|caret/;
    const ROWRE = /class="[^"]*\b(row|setting|nav-row|community-row|list-row|d-row|pm-row|tl-setting|td-nav-row|sk-project-row|lk-row)\b/;
    for (const screen of spec.screens) {
      const file = join(dir, 'screens', `${screen.id}.html`);
      if (!existsSync(file)) continue;
      const html = read(file);
      const found = []; const stack = [];
      let mm; TAGRE.lastIndex = 0;
      while ((mm = TAGRE.exec(html))) {
        const [full, closing, raw, attrs = '', self] = mm;
        const tag = raw.toLowerCase();
        if (closing) { while (stack.length) { const t = stack.pop(); if (t.rec) { t.rec.from = t.start; t.rec.to = mm.index; found.push(t.rec); } if (t.tag === tag) break; } continue; }
        let rec = null;
        if ((tag === 'button' || ROWRE.test(attrs)) && !TRIGRE.test(attrs)) rec = { attrs };
        if (self || VOIDT.has(tag)) continue;
        stack.push({ tag, rec, start: mm.index + full.length });
      }
      for (const r of found) {
        const inner = html.slice(r.from, r.to);
        if (!CHEVRE.test(inner) || ROWRE.test(inner)) continue;
        const label = (r.attrs.match(/aria-label="([^"]+)"/) || [])[1]
          || inner.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
        P(`${screen.id}: строка «${label}» рисует стрелку, но никуда не ведёт`);
      }
    }
  }

  /* —— карточка App Store —— */
  /* Лимиты Apple жёсткие: перебор ловится только при загрузке в App Store Connect,
     то есть в самый неудобный момент. Считаем здесь. */
  const a = spec.appStore;
  if (!a) P('нет блока appStore — карточку стора заполняем всегда');
  else {
    const LIMITS = { name: 30, subtitle: 30, promo: 170, keywords: 100 };
    for (const [field, max] of Object.entries(LIMITS)) {
      const len = [...String(a[field] ?? '')].length;
      if (!len) P(`appStore.${field} пуст`);
      else if (len > max) P(`appStore.${field}: ${len} символов при лимите ${max}`);
    }
    if (/,\s/.test(a.keywords || '')) P('appStore.keywords: пробел после запятой съедает символ из лимита');
    /* Слово из названия Apple индексирует и так — в keywords оно тратит место впустую. */
    const titleWords = new Set(`${a.name} ${a.subtitle}`.toLowerCase().match(/[а-яёa-z]{4,}/g) || []);
    const dupes = (a.keywords || '').split(',').map((k) => k.trim().toLowerCase()).filter((k) => titleWords.has(k));
    if (dupes.length) P(`appStore.keywords дублирует Name/Subtitle: ${dupes.join(', ')}`);
    if (!a.reviewAccount?.phone && !a.reviewAccount?.email && !a.reviewAccount?.provider) P('нет appStore.reviewAccount — ревьюер упрётся в экран входа');
    /* Трекинг в лейблах обязан совпадать с наличием ключа ATT. */
    const hasATT = spec.permissions.some((p) => p.key === 'tracking');
    const labelsTrack = (a.privacy || []).some((x) => x.tracking);
    if (hasATT !== labelsTrack) P(`ATT в наборе (${hasATT}) и трекинг в privacy-лейблах (${labelsTrack}) расходятся`);
  }

  /* —— коллизии имён с ядром —— */
  /* Класс, объявленный и в ядре, и в концепте, молча ломает страницу:
     кто последний в <style>, тот и выиграл. Ловим до того, как заметим глазами. */
  const kernelBare = bareClassesIn(read(join(KERNEL, 'base.css')));
  for (const c of bareClassesIn(ownCss)) {
    if (kernelBare.has(c)) P(`класс .${c} объявлен с нуля и в ядре, и в styles.css — переименуйте один`);
  }

  /* —— неиспользуемые ассеты —— */
  const assetsDir = join(dir, 'assets', 'media');
  if (existsSync(assetsDir)) {
    for (const f of readdirSync(assetsDir)) {
      if (!html.includes(f)) P(`ассет не используется ни одним экраном: assets/media/${f}`);
    }
  }

  /* —— следы других концептов —— */
  /* Комментарии попадают в собранный HTML вместе с CSS/JS, но не являются
     пользовательским интерфейсом. Не считаем совпадения внутри них утечкой
     бренда: иначе экран «Сегодня» даёт ложный конфликт с одноимённым концептом. */
  const renderedHtml = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\n)\s*\/\/[^\n]*/g, '$1');
  for (const other of listConcepts()) {
    if (other === slug) continue;
    const o = readSpec(other);
    /* Обычное слово может совпасть с именем концепта («радиус карточки»).
       Имя считаем брендом только в кавычках; домен остаётся точным маркером. */
    const brandedName = renderedHtml.includes(`«${o.name}»`) || renderedHtml.includes(`“${o.name}”`);
    if (brandedName || (o.domain && renderedHtml.includes(o.domain))) P(`след другого концепта: ${o.name} / ${o.domain}`);
  }

  /* —— числа сходятся —— */
  const n = spec.permissions.length;
  const declaredN = html.match(/(\d+)\s+ключ/);
  if (declaredN && Number(declaredN[1]) !== n) P(`в тексте «${declaredN[1]} ключей», в спеке ${n}`);

  return problems;
}

const args = process.argv.slice(2);
let total = 0;

if (args.includes('--kernel')) {
  const p = lintKernel();
  total += p.length;
  console.log('\n=== ядро ===');
  if (!p.length) console.log('  мёртвого кода нет');
  else p.forEach((x) => console.log('  · ' + x));
}

for (const slug of (args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : (args.includes('--kernel') ? [] : listConcepts()))) {
  const p = lint(slug);
  total += p.length;
  console.log(`\n=== ${slug} ===`);
  if (!p.length) console.log('  расхождений нет');
  else p.forEach((x) => console.log('  · ' + x));
}
process.exit(total ? 1 : 0);
