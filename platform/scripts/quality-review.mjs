#!/usr/bin/env node
/**
 * Deep acceptance seam for HTML concepts.
 *
 * Generation stays unconstrained. This module only collects objective failures,
 * produces evidence-backed aesthetic signals and verifies human review evidence.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync,
} from 'node:fs';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { CONCEPTS, DIST, ROOT, conceptDir, readMarkup, readSpec } from './lib.mjs';
import { build, prepareEmailRegistration } from './build.mjs';
import { runScriptStage } from './pipeline-runner.mjs';
import {
  CONSISTENCY_FAMILIES, requiresPreviousReview, sameJson, validateHumanReview, validateIterationReview, VISUAL_LENSES,
} from './quality-review-contract.mjs';

export { CONSISTENCY_FAMILIES, validateHumanReview, validateIterationReview, VISUAL_LENSES } from './quality-review-contract.mjs';

export const QUALITY_CONTRACT_VERSION = 3;
export const DETECTOR_VERSIONS = {
  objective: '1.1.0', copy: '1.0.0', surfaces: '1.1.0', rhythm: '1.1.0', consistency: '1.1.0',
};

const sha = (value) => createHash('sha256').update(value).digest('hex');
const hashFile = (file) => sha(readFileSync(file));
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const safeId = (value) => String(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const isoRunId = () => new Date().toISOString().replace(/[:.]/g, '-');

export function classifyScreens(spec) {
  const system = [], product = [];
  for (const screen of spec.screens || []) {
    const isSystem = screen.ui?.navigation === 'system'
      || screen.ui?.pattern === 'auth'
      || /^(phone|password|register|registerpassword|account|deleteaccount|code|codefail)$/.test(screen.id);
    (isSystem ? system : product).push(screen.id);
  }
  return { product, system };
}

/** Pure detector used by browser capture and characterization fixtures. */
export function detectHeuristicSignals(snapshot) {
  const signals = [];
  const add = (kind, element, explanation, extra = {}) => signals.push({ kind, element, explanation, ...extra });
  const elements = snapshot.elements || [];
  for (const el of elements) {
    const text = (el.text || '').trim().replace(/\s+/g, ' ');
    const letters = text.replace(/[^A-Za-zА-Яа-яЁё]/g, '');
    if (letters.length > 5 && letters === letters.toUpperCase() && /[A-ZА-ЯЁ]/.test(letters)) {
      add('all-caps-copy', el, 'Видимая строка набрана капсом и требует проверки на аббревиатуру или намеренный акцент.');
    }
    if (text.length > 1 && text.length <= 64 && /\.$/.test(text) && ['button', 'heading', 'label', 'menuitem'].includes(el.role)) {
      add('terminal-control-period', el, 'Короткий control/label заканчивается точкой; нужен reviewer judgment.');
    }
    if (/(?:этот экран|на экране|концепт|пользовател(?:ь|я|ю)|интерфейс показывает)/i.test(text)) {
      add('author-voice', el, 'Текст похож на комментарий автора об интерфейсе, а не на язык продукта.');
    }
    if (el.surfaceDepth >= 2 && el.hasBorder) add('nested-surfaces', el, 'Окантованная surface вложена в другую surface; это может быть иерархией или лишней рамкой.');
    const separators = Number(el.hasBorder) + Number(el.hasShadow) + Number(el.hasSurfaceFill) + Number(el.hasRadius);
    if (separators >= 4 && el.area > 5000) add('border-pressure', el, 'Один блок одновременно разделён border, shadow, fill и radius; reviewer решает, оправдано ли это ролью.');
    if (el.effect && !el.interactive && !el.stateful && !el.depthRole) add('effect-without-role', el, 'Визуальный эффект не связан с видимой ролью, состоянием или depth.');
  }
  for (const group of snapshot.textGroups || []) {
    if (group.texts?.length >= 3 && group.signatureCount === 1 && group.uniqueCount > 1) {
      add('formula-copy', group, 'Три или более описательных строк имеют одну синтаксическую форму.');
    }
  }
  for (const drift of snapshot.alignmentDrifts || []) add('alignment-drift', drift, 'Край элемента одиночно отклоняется от устойчивой направляющей более чем на 2 px.');
  for (const drift of snapshot.baselineDrifts || []) add('baseline-drift', drift, 'Иконка и соседний текст имеют подозрительное расхождение baseline.');
  for (const spacing of snapshot.spacingOutliers || []) add('spacing-outlier', spacing, 'Значение spacing встречается один раз среди сопоставимых элементов.');
  const borderedSurfaces = elements.filter((el) => el.hasBorder && el.hasRadius && el.area > 3000);
  if (borderedSurfaces.length >= 4) {
    add('repeated-bordered-surfaces', {
      selector: borderedSurfaces.slice(0, 4).map((el) => el.selector).join(', '),
      bbox: { x: 0, y: 0, width: 0, height: 0 }, count: borderedSurfaces.length,
    }, 'На экране повторяется серия окантованных surfaces; reviewer проверяет, выражают ли они разные роли.');
  }
  return signals;
}

export function detectCrossScreenSignals(records, groups, spec) {
  const byId = new Map(records.map((record) => [record.screen, record.summary || {}]));
  const productEntry = spec.auth?.entryTarget && groups.product.includes(spec.auth.entryTarget) ? spec.auth.entryTarget : groups.product[0];
  const systemEntry = groups.system[0];
  const system = byId.get(systemEntry), product = byId.get(productEntry);
  if (!system || !product) return [];
  const signals = [];
  if (Number.isFinite(system.surfaceLuminance) && Number.isFinite(product.surfaceLuminance)
      && Math.abs(system.surfaceLuminance - product.surfaceLuminance) > .55) {
    signals.push({ kind: 'cross-screen-surface-shift', screen: productEntry, evidenceScreens: [systemEntry, productEntry], element: { selector: '[data-screen]', bbox: { x: 0, y: 0, width: 0, height: 0 } }, explanation: 'Между системным входом и первой продуктовой поверхностью резко меняется светлота. Это может быть намеренным режимом, но требует проверки связности journey.' });
  }
  if (system.primary && product.primary) {
    const radiusDelta = Math.abs(system.primary.radius - product.primary.radius);
    const heightDelta = Math.abs(system.primary.height - product.primary.height);
    if (radiusDelta > 8 || heightDelta > 8) signals.push({ kind: 'cross-screen-primary-geometry', screen: productEntry, evidenceScreens: [systemEntry, productEntry], element: { selector: '[data-primary]', bbox: product.primary.bbox }, explanation: 'Главные действия auth и product заметно расходятся по радиусу или высоте; reviewer проверяет функциональную причину.' });
  }
  const productRecords = records.filter((record) => groups.product.includes(record.screen));
  const headings = productRecords.filter((record) => record.summary?.heading);
  if (headings.length > 1) {
    const sizes = headings.map((record) => record.summary.heading.size);
    const weights = headings.map((record) => record.summary.heading.weight);
    if (Math.max(...sizes) - Math.min(...sizes) > 8 || Math.max(...weights) - Math.min(...weights) > 300) signals.push({ kind: 'cross-screen-semantic-typography', screen: headings[0].screen, evidenceScreens: headings.map((record) => record.screen), element: { selector: 'h1', bbox: { x: 0, y: 0, width: 0, height: 0 } }, explanation: 'Одинаковая роль h1 заметно меняет типографику между product screens; reviewer проверяет смысловую причину.' });
  }
  const actionsByTarget = new Map();
  for (const record of productRecords) for (const action of record.summary?.actions || []) {
    const list = actionsByTarget.get(action.target) || [];
    list.push({ screen: record.screen, ...action }); actionsByTarget.set(action.target, list);
  }
  for (const [target, actions] of actionsByTarget) {
    if (actions.length < 2) continue;
    const labels = new Set(actions.map((action) => action.label).filter(Boolean));
    if (labels.size > 1) signals.push({ kind: 'cross-screen-object-naming', screen: actions[0].screen, evidenceScreens: actions.map((action) => action.screen), element: { selector: `[data-go="${target}"]`, bbox: { x: 0, y: 0, width: 0, height: 0 } }, explanation: 'Переход к одному объекту или экрану подписан по-разному; reviewer проверяет терминологическую цельность.' });
    const heights = actions.map((action) => action.height), radii = actions.map((action) => action.radius), states = new Set(actions.map((action) => action.disabled));
    if (Math.max(...heights) - Math.min(...heights) > 8 || Math.max(...radii) - Math.min(...radii) > 8 || states.size > 1) signals.push({ kind: 'cross-screen-control-consistency', screen: actions[0].screen, evidenceScreens: actions.map((action) => action.screen), element: { selector: `[data-go="${target}"]`, bbox: { x: 0, y: 0, width: 0, height: 0 } }, explanation: 'Контролы одного перехода расходятся по geometry или state; reviewer проверяет, меняется ли их функциональная роль.' });
  }
  return signals;
}

function sourceHashes(slug, spec) {
  const dir = conceptDir(slug);
  const screenHashes = {};
  for (const screen of spec.screens) {
    const file = join(dir, 'screens', `${screen.id}.html`);
    screenHashes[screen.id] = existsSync(file) ? hashFile(file) : 'generated-by-kernel';
  }
  const supporting = {};
  for (const name of ['styles.css', 'sections.html', 'media.mjs']) {
    const file = join(dir, name);
    if (existsSync(file)) supporting[name] = hashFile(file);
  }
  const shared = {};
  for (const name of ['page.html', 'base.css', 'tablet.css', 'icons.svg', 'engine.js']) shared[`kernel/${name}`] = hashFile(join(ROOT, 'kernel', name));
  for (const name of [
    'build.mjs', 'lib.mjs', 'paths.mjs', 'pipeline-runner.mjs', 'screen-map.mjs', 'concept-quality.mjs', 'markdown.mjs',
    'quality-review.mjs', 'quality-review-contract.mjs', 'lint-concept.mjs',
    'audit-visual.mjs', 'audit-grid.mjs', 'test-flows.mjs',
  ]) shared[`scripts/${name}`] = hashFile(join(ROOT, 'scripts', name));
  for (const name of ['package.json', 'package-lock.json']) if (existsSync(join(ROOT, name))) shared[name] = hashFile(join(ROOT, name));
  return { spec: hashFile(join(dir, 'concept.json')), screens: screenHashes, supporting, shared };
}

function pngHashes(dir, root = dir, out = {}) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) pngHashes(file, root, out);
    else if (entry.isFile() && entry.name.endsWith('.png')) out[relative(root, file)] = hashFile(file);
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

function browserProbe() {
  const device = document.querySelector('.hero-device .device, .device');
  const rootBox = device.getBoundingClientRect();
  const shown = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
  };
  const rgb = (value) => {
    const raw = (value.match(/[\d.]+/g) || []).map(Number);
    if (/^color\(/.test(value)) return raw.slice(0, 3).map((part) => Math.round(part * 255)).concat(raw.slice(3));
    return raw.slice(0, 4);
  };
  const luminance = ([r, g, b]) => {
    const f = (n) => { n /= 255; return n <= .03928 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  };
  const selector = (el) => {
    if (el.id) return `#${el.id}`;
    const cls = [...el.classList].slice(0, 2).map((c) => `.${c}`).join('');
    return `${el.tagName.toLowerCase()}${cls}`;
  };
  const solidBackground = (el, boundary) => {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== 'none') return null;
      const value = rgb(style.backgroundColor);
      const alpha = value[3] ?? 1;
      if (value.length >= 3 && alpha > .01) {
        layers.unshift({ value: value.slice(0, 3), alpha });
        if (alpha >= .99) break;
      }
      if (node === boundary) break;
    }
    if (!layers.length || layers[0].alpha < .99) return null;
    let result = layers[0].value;
    for (const layer of layers.slice(1)) result = result.map((part, index) => layer.value[index] * layer.alpha + part * (1 - layer.alpha));
    return result;
  };
  const shape = (text) => text.replace(/[\d«»"'(),.—–-]/g, ' ').trim().split(/\s+/).map(() => 'W').join('');
  return ({ screenId, expectedPrimary, navigation }) => {
    device.querySelectorAll('[data-screen]').forEach((el) => el.classList.remove('is-on'));
    const screen = device.querySelector(`[data-screen="${screenId}"]`);
    if (!screen) return { objective: [{ kind: 'no-screen', selector: screenId }], snapshot: { elements: [] } };
    screen.classList.add('is-on');
    device.querySelector('.sysask')?.classList.remove('is-on');
    device.querySelector('.snackbar')?.classList.remove('is-on');
    const objective = [], elements = [], positions = [], spaces = [];
    for (const el of screen.querySelectorAll('*')) {
      if (!shown(el) || el.closest('.perm-hidden')) continue;
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      const box = { x: Math.round(r.left - rootBox.left), y: Math.round(r.top - rootBox.top), width: Math.round(r.width), height: Math.round(r.height) };
      const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').trim().replace(/\s+/g, ' ');
      const role = el.getAttribute('role') || ({ BUTTON: 'button', H1: 'heading', H2: 'heading', H3: 'heading', LABEL: 'label' }[el.tagName] || 'text');
      const item = { selector: selector(el), text: text.slice(0, 100), role, bbox: box };
      if (text || /^(BUTTON|LABEL|H1|H2|H3)$/.test(el.tagName)) {
        const fg = rgb(cs.color), directBg = rgb(cs.backgroundColor), bg = solidBackground(el, screen);
        if (text && fg.length >= 3 && bg && cs.textShadow === 'none') {
          const a = luminance(fg), b = luminance(bg), contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          const fontSize = parseFloat(cs.fontSize), fontWeight = parseFloat(cs.fontWeight) || 400;
          const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
          const minimumContrast = largeText ? 3 : 4.5;
          if (contrast < minimumContrast) objective.push({ kind: 'low-contrast', ...item, computed: { color: cs.color, backgroundColor: cs.backgroundColor, contrast: contrast.toFixed(2), minimumContrast } });
        }
        const border = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].some((v) => parseFloat(v) > 0);
        const surfaceParent = el.parentElement?.closest('.card,.ios-card,.tile,[class*="-card"],[class*="surface"]');
        Object.assign(item, {
          hasBorder: border, hasShadow: cs.boxShadow !== 'none', hasRadius: parseFloat(cs.borderRadius) > 0,
          hasSurfaceFill: (directBg[3] ?? 0) > .05, effect: cs.boxShadow !== 'none' || cs.filter !== 'none' || cs.backgroundImage !== 'none',
          interactive: el.matches('button,a,[data-go],[data-ask],[data-back],[data-toast]'), stateful: !!el.getAttribute('aria-pressed'),
          depthRole: cs.position === 'fixed' || cs.position === 'sticky', surfaceDepth: surfaceParent ? 2 : (el.matches('.card,.ios-card,.tile,[class*="-card"],[class*="surface"]') ? 1 : 0),
          area: Math.round(r.width * r.height), computed: { border: cs.border, boxShadow: cs.boxShadow, background: cs.backgroundColor, borderRadius: cs.borderRadius },
        });
        elements.push(item);
      }
      if (text && r.width > 20) positions.push({ ...item, x: Math.round(r.left - rootBox.left) });
      for (const prop of ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'gap']) {
        const value = Math.round(parseFloat(cs[prop]));
        if (value >= 3 && value <= 64) spaces.push({ value, selector: item.selector, prop, bbox: box });
      }
      if (text && cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) objective.push({ kind: 'truncated', ...item, computed: { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth } });
      if (box.x < -1 || box.x + box.width > 376) objective.push({ kind: 'overflow-x', ...item });
      if (el.matches('button,a,[role="button"],[data-go],[data-ask],[data-back],[data-activate],[data-jump],[data-toast]') && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.classList.contains('tap') && (r.width < 43.5 || r.height < 43.5)) objective.push({ kind: 'small-tap', ...item });
    }
    const primary = [...screen.querySelectorAll('[data-primary]')].filter(shown);
    if (expectedPrimary && primary.length !== 1) objective.push({ kind: 'primary-count', selector: screenId, computed: { count: primary.length } });
    const tabbars = screen.querySelectorAll('.tabbar').length;
    if ((navigation === 'root' && tabbars !== 1) || (navigation !== 'root' && tabbars)) objective.push({ kind: 'navigation-contract', selector: screenId, computed: { navigation, tabbars } });
    const clusters = new Map();
    for (const pos of positions) {
      const key = [...clusters.keys()].find((x) => Math.abs(x - pos.x) <= 2) ?? pos.x;
      const list = clusters.get(key) || []; list.push(pos); clusters.set(key, list);
    }
    const stable = [...clusters.entries()].filter(([, list]) => list.length >= 3).map(([x]) => x);
    const alignmentDrifts = positions.filter((p) => stable.length && !stable.some((x) => Math.abs(x - p.x) <= 2) && stable.some((x) => Math.abs(x - p.x) <= 8)).slice(0, 12);
    const counts = spaces.reduce((out, item) => (out[item.value] = (out[item.value] || 0) + 1, out), {});
    /* Одиночный value имеет смысл только в достаточно богатом ритме;
       иначе любой небольшой экран рождает шум из каждого padding. */
    const spacingOutliers = spaces.length >= 24
      ? spaces.filter((item) => counts[item.value] === 1 && item.value % 2 !== 0).slice(0, 4)
      : [];
    const baselineDrifts = [];
    for (const row of screen.querySelectorAll('button,[class*="row"],li')) {
      const icon = row.querySelector('svg,img'), textEl = row.querySelector('span,strong,p');
      if (!icon || !textEl || !shown(icon) || !shown(textEl)) continue;
      const a = icon.getBoundingClientRect(), b = textEl.getBoundingClientRect();
      const delta = Math.abs((a.top + a.height / 2) - (b.top + b.height / 2));
      if (delta > 3) baselineDrifts.push({ selector: selector(row), delta: Math.round(delta), bbox: { x: Math.round(row.getBoundingClientRect().left - rootBox.left), y: Math.round(row.getBoundingClientRect().top - rootBox.top), width: Math.round(row.getBoundingClientRect().width), height: Math.round(row.getBoundingClientRect().height) } });
    }
    const textGroups = [...screen.querySelectorAll('ul,ol,[class*="list"]')].map((list) => {
      const texts = [...list.children].map((row) => (row.querySelector('small,p,span')?.textContent || '').trim()).filter((t) => t.length > 8 && !/\d/.test(t));
      return { selector: selector(list), texts: texts.slice(0, 8), signatureCount: new Set(texts.map(shape)).size, uniqueCount: new Set(texts).size, bbox: { x: 0, y: 0, width: 0, height: 0 } };
    }).filter((g) => g.texts.length >= 3);
    const rootStyle = getComputedStyle(screen);
    const rootRgb = rgb(rootStyle.backgroundColor);
    const primaryEl = primary[0];
    const primaryBox = primaryEl?.getBoundingClientRect();
    const primaryStyle = primaryEl ? getComputedStyle(primaryEl) : null;
    const summary = {
      surfaceLuminance: rootRgb.length >= 3 && (rootRgb[3] ?? 1) > .98 ? luminance(rootRgb) : null,
      heading: (() => {
        const heading = screen.querySelector('h1');
        if (!heading || !shown(heading)) return null;
        const style = getComputedStyle(heading);
        return { size: Math.round(parseFloat(style.fontSize)), weight: parseFloat(style.fontWeight) || 400 };
      })(),
      primary: primaryEl ? {
        height: Math.round(primaryBox.height), radius: Math.round(parseFloat(primaryStyle.borderRadius)),
        bbox: { x: Math.round(primaryBox.left - rootBox.left), y: Math.round(primaryBox.top - rootBox.top), width: Math.round(primaryBox.width), height: Math.round(primaryBox.height) },
      } : null,
      actions: [...screen.querySelectorAll('[data-go]')].filter(shown).map((control) => {
        const box = control.getBoundingClientRect(), style = getComputedStyle(control);
        return {
          target: control.dataset.go, label: (control.getAttribute('aria-label') || control.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          height: Math.round(box.height), radius: Math.round(parseFloat(style.borderRadius)), disabled: control.disabled || control.getAttribute('aria-disabled') === 'true',
        };
      }),
    };
    return { objective, snapshot: { elements, alignmentDrifts, baselineDrifts, spacingOutliers, textGroups, guides: stable }, summary };
  };
}

async function makeContactSheet(browser, title, ids, screensDir, output) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  const columns = Math.max(1, Math.min(5, ids.length));
  const cards = await Promise.all(ids.map(async (id) => `<figure><img src="data:image/png;base64,${(await readFile(join(screensDir, `${id}.png`))).toString('base64')}" alt="${escapeHtml(id)}"><figcaption>${escapeHtml(id)}</figcaption></figure>`));
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#e9e9e7;color:#171717;font:14px Inter,Arial,sans-serif}h1{margin:0 0 24px;font-size:28px}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:24px;align-items:start}figure{margin:0}img{display:block;width:100%;border-radius:26px;box-shadow:0 1px 3px #0002}figcaption{padding:8px 4px 0;font-weight:650;color:#555}</style><h1>${escapeHtml(title)}</h1><main class="grid">${cards.join('')}</main>`);
  await page.screenshot({ path: output, fullPage: true });
  await page.close();
}

async function captureEvidence(slug, spec, runDir) {
  const screensDir = join(runDir, 'screens'), cropsDir = join(runDir, 'crops'), overlaysDir = join(runDir, 'overlays');
  await mkdir(screensDir, { recursive: true }); await mkdir(cropsDir, { recursive: true }); await mkdir(overlaysDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(DIST, slug, 'index.html')).href, { waitUntil: 'networkidle' });
  const device = page.locator('.hero-device .device, .device').first();
  await device.waitFor({ state: 'visible' });
  const findings = { hardFailures: [], signals: [], auditStages: [] };
  const records = [];
  let n = 0;
  for (const screen of spec.screens) {
    const result = await page.evaluate(
      ([args, source]) => new Function(`return (${source})`)()()(args),
      [{ screenId: screen.id, expectedPrimary: screen.ui?.primaryAction, navigation: screen.ui?.navigation }, browserProbe.toString()],
    );
    await page.waitForTimeout(80);
    records.push({ screen: screen.id, summary: result.summary });
    const png = join(screensDir, `${screen.id}.png`);
    await device.screenshot({ path: png });
    await page.evaluate((guides) => {
      const root = document.querySelector('.hero-device .device, .device');
      for (const x of guides) {
        const line = document.createElement('i');
        line.className = 'quality-guide-overlay';
        line.style.cssText = `position:absolute;z-index:99999;pointer-events:none;top:0;bottom:0;left:${x}px;width:1px;background:#ff2d55aa`;
        root.appendChild(line);
      }
    }, result.snapshot.guides || []);
    await device.screenshot({ path: join(overlaysDir, `${screen.id}.png`) });
    await page.evaluate(() => document.querySelectorAll('.quality-guide-overlay').forEach((el) => el.remove()));
    await mkdir(join(conceptDir(slug), 'assets', 'screenshots'), { recursive: true });
    await copyFile(png, join(conceptDir(slug), 'assets', 'screenshots', `${screen.id}.png`));
    for (const failure of result.objective) findings.hardFailures.push({ id: `hard-${++n}`, screen: screen.id, ...failure });
    for (const signal of detectHeuristicSignals(result.snapshot)) {
      const id = `signal-${++n}`;
      const record = { id, screen: screen.id, ...signal };
      findings.signals.push(record);
      const box = signal.element?.bbox;
      if (box?.width > 0 && box?.height > 0) {
        const deviceBox = await device.boundingBox();
        if (deviceBox) {
          const clip = { x: Math.max(0, deviceBox.x + box.x - 12), y: Math.max(0, deviceBox.y + box.y - 12), width: Math.min(page.viewportSize().width, box.width + 24), height: Math.min(page.viewportSize().height, box.height + 24) };
          if (clip.x + clip.width > page.viewportSize().width) clip.width = page.viewportSize().width - clip.x;
          if (clip.y + clip.height > page.viewportSize().height) clip.height = page.viewportSize().height - clip.y;
          if (clip.width > 0 && clip.height > 0) { await page.screenshot({ path: join(cropsDir, `${id}.png`), clip }); record.crop = `crops/${id}.png`; }
        }
      }
    }
  }
  const groups = classifyScreens(spec);
  for (const signal of detectCrossScreenSignals(records, groups, spec)) findings.signals.push({ id: `signal-${++n}`, ...signal, evidence: 'journey-contact-sheet.png' });
  await makeContactSheet(browser, `${spec.name} · product surfaces`, groups.product, screensDir, join(runDir, 'product-contact-sheet.png'));
  await makeContactSheet(browser, `${spec.name} · auth / system surfaces`, groups.system, screensDir, join(runDir, 'system-contact-sheet.png'));
  const productEntry = spec.auth?.entryTarget && groups.product.includes(spec.auth.entryTarget) ? spec.auth.entryTarget : groups.product[0];
  const sliceResult = spec.product?.verticalSlice?.result;
  const journeyScreens = [...new Set([groups.system[0], productEntry, sliceResult].filter((id) => id && (groups.system.includes(id) || groups.product.includes(id))))];
  await makeContactSheet(browser, `${spec.name} · auth → product`, journeyScreens, screensDir, join(runDir, 'journey-contact-sheet.png'));
  await page.close(); await browser.close();
  return { findings, groups };
}

function latestRun(slug) {
  const qualityDir = join(conceptDir(slug), 'artifacts', 'quality');
  const pointer = join(qualityDir, 'latest.json');
  if (!existsSync(pointer)) throw new Error(`${slug}: нет quality evidence; сначала npm run review -- ${slug}`);
  const { runId } = json(pointer);
  const runDir = join(qualityDir, runId);
  if (!existsSync(runDir)) throw new Error(`${slug}: latest quality run ${runId} отсутствует`);
  return { runId, runDir };
}

export async function prepareQualityReview(slug, options = {}) {
  const sourceSpec = readSpec(slug);
  const spec = prepareEmailRegistration(sourceSpec, readMarkup(slug, sourceSpec)).spec;
  const runId = options.runId || isoRunId();
  const runDir = join(conceptDir(slug), 'artifacts', 'quality', runId);
  mkdirSync(runDir, { recursive: true });
  build(slug);
  const { findings, groups } = await captureEvidence(slug, spec, runDir);
  /* Раздел «Экраны» в dist ссылается на PNG, поэтом после capture
     нужна вторая сборка до browser flows. */
  build(slug);
  const auditStages = [
    runScriptStage('lint-concept.mjs', [slug]), runScriptStage('audit-visual.mjs', [slug]),
    runScriptStage('audit-grid.mjs', [slug]), runScriptStage('test-flows.mjs', [slug]),
  ];
  findings.auditStages = auditStages;
  auditStages.filter((stage) => !stage.ok && stage.script !== 'audit-grid.mjs').forEach((stage) => findings.hardFailures.push({ id: `hard-stage-${safeId(basename(stage.script, '.mjs'))}`, screen: null, kind: 'objective-audit-failed', selector: stage.script, detail: stage.output.slice(-4000) }));
  const gridStage = auditStages.find((stage) => stage.script === 'audit-grid.mjs');
  if (gridStage && !gridStage.ok) findings.signals.push({ id: `signal-grid-${safeId(slug)}`, screen: null, kind: 'alignment-drift', element: { selector: 'cross-screen list grid' }, explanation: 'Отдельный geometry audit нашёл строки вне устойчивого столбца.', detail: gridStage.output.slice(-4000) });
  writeJson(join(runDir, 'automated-findings.json'), findings);
  const screenshots = Object.fromEntries(spec.screens.map((screen) => [screen.id, hashFile(join(runDir, 'screens', `${screen.id}.png`))]));
  const manifest = {
    contractVersion: QUALITY_CONTRACT_VERSION, slug, runId,
    createdAt: new Date().toISOString(), commit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim(),
    dirty: Boolean(spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim()),
    viewport: { page: { width: 1100, height: 1100 }, device: { width: 375, height: 812 }, deviceScaleFactor: 1 },
    hashes: { sources: sourceHashes(slug, sourceSpec), screenshots, pngEvidence: pngHashes(runDir) },
    screens: groups, detectors: DETECTOR_VERSIONS,
  };
  writeJson(join(runDir, 'manifest.json'), manifest);
  const manifestHash = hashFile(join(runDir, 'manifest.json'));
  const review = {
    contractVersion: QUALITY_CONTRACT_VERSION, runId, manifestHash,
    reviewer: { role: 'critic', id: '', method: '' },
    product: { verdict: 'pending', strengths: [], opportunities: [], noChangeRationale: '' },
    visual: {
      verdict: 'pending',
      contactSheetJudgment: { firstImpression: '', strongestScreen: '', weakestScreen: '', repetitionRisk: '' },
      lenses: VISUAL_LENSES.map((lens) => ({ lens, verdict: 'pending', evidenceScreens: [], observation: '', decision: '' })),
      screenReviews: groups.product.map((screen) => ({ screen, verdict: 'pending', evidence: '', hierarchy: '', typography: '', color: '', composition: '' })),
      consistency: CONSISTENCY_FAMILIES.map((family) => ({ family, verdict: 'pending', systemScreens: [], productScreens: [], observation: '', decision: '' })),
      systemScreensReviewed: [], systemFit: '', findings: [], noFindingsRationale: '',
    },
    iteration: { outcome: 'pending', previousRunId: null, changes: [] },
    signals: findings.signals.map((signal) => ({ id: signal.id, decision: null, reason: '' })),
  };
  writeJson(join(runDir, 'review.json'), review);
  writeJson(join(conceptDir(slug), 'artifacts', 'quality', 'latest.json'), { runId });
  return { slug, runId, runDir, manifest, findings, review, ok: findings.hardFailures.length === 0 };
}

export function verifyQualityReview(slug, options = {}) {
  const sourceSpec = readSpec(slug);
  if ((sourceSpec.qualityContractVersion || 1) < QUALITY_CONTRACT_VERSION) return { ok: true, legacy: true, issues: [] };
  const spec = prepareEmailRegistration(sourceSpec, readMarkup(slug, sourceSpec)).spec;
  const { runId, runDir } = options.runId ? { runId: options.runId, runDir: join(conceptDir(slug), 'artifacts', 'quality', options.runId) } : latestRun(slug);
  const files = ['manifest.json', 'automated-findings.json', 'review.json', 'product-contact-sheet.png', 'system-contact-sheet.png', 'journey-contact-sheet.png'];
  const issues = files.filter((file) => !existsSync(join(runDir, file))).map((file) => `нет ${file}`);
  if (issues.length) return { ok: false, legacy: false, runId, runDir, issues };
  const manifest = json(join(runDir, 'manifest.json')), findings = json(join(runDir, 'automated-findings.json')), review = json(join(runDir, 'review.json'));
  if (manifest.slug !== slug || manifest.runId !== runId || review.runId !== runId) issues.push('runId/slug не связаны с текущим bundle');
  if (review.manifestHash !== hashFile(join(runDir, 'manifest.json'))) issues.push('review.json не связан с текущим manifest hash');
  if (!sameJson(manifest.hashes?.sources, sourceHashes(slug, sourceSpec))) issues.push('review stale: concept.json, screen HTML, styles или supporting source изменились');
  if (!sameJson(manifest.hashes?.pngEvidence, pngHashes(runDir))) issues.push('review stale: один из PNG evidence изменился');
  for (const screen of spec.screens) {
    const file = join(runDir, 'screens', `${screen.id}.png`);
    if (!existsSync(file)) issues.push(`${screen.id}: нет PNG evidence`);
    else if (manifest.hashes?.screenshots?.[screen.id] !== hashFile(file)) issues.push(`${screen.id}: PNG hash не совпадает`);
  }
  if (findings.hardFailures?.length) issues.push(`objective hard failures: ${findings.hardFailures.length}`);
  issues.push(...validateHumanReview(manifest, findings, review));
  const previousRunId = review.iteration?.previousRunId;
  if (requiresPreviousReview(review) && !previousRunId) issues.push('iteration.previousRunId: исправленный blocker/major требует critique bundle и нового capture');
  if (previousRunId != null && previousRunId !== '') {
    if (basename(previousRunId) !== previousRunId) issues.push('iteration.previousRunId: нужен безопасный id предыдущего critique run');
    else {
    const previousDir = join(conceptDir(slug), 'artifacts', 'quality', previousRunId);
    const previousManifestFile = join(previousDir, 'manifest.json'), previousReviewFile = join(previousDir, 'review.json');
    if (!existsSync(previousManifestFile) || !existsSync(previousReviewFile)) issues.push('iteration.previousRunId: critique bundle не найден');
    else issues.push(...validateIterationReview(json(previousManifestFile), json(previousReviewFile), manifest, review));
    }
  }
  return { ok: issues.length === 0, legacy: false, runId, runDir, issues, manifest, review, findings };
}

async function cli() {
  const [commandOrSlug, maybeSlug] = process.argv.slice(2);
  const command = commandOrSlug === 'verify' ? 'verify' : 'prepare';
  const slug = command === 'verify' ? maybeSlug : commandOrSlug;
  if (!slug) throw new Error('использование: quality-review.mjs [verify] <slug>');
  if (command === 'prepare') {
    const result = await prepareQualityReview(slug);
    const { generateAppStoreAssets } = await import('./app-store-assets.mjs');
    await generateAppStoreAssets(slug);
    console.log(`\n${slug}: review bundle ${relative(ROOT, result.runDir)}`);
    console.log('  app-store: iPhone/iPad assets, gallery and ZIP generated');
    console.log(`  product: ${result.manifest.screens.product.length} · system/auth: ${result.manifest.screens.system.length} · signals: ${result.findings.signals.length} · hard failures: ${result.findings.hardFailures.length}`);
    if (!result.ok) process.exitCode = 1;
  } else {
    const result = verifyQualityReview(slug);
    if (!result.ok) { console.error(`${slug}: quality evidence не принято\n  · ${result.issues.join('\n  · ')}`); process.exitCode = 1; }
    else console.log(`${slug}: quality evidence accepted · ${result.legacy ? 'legacy mode' : result.runId}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) cli().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
