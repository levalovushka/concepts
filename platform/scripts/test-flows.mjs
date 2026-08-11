#!/usr/bin/env node
/**
 * Проверки прототипа, выведенные из спеки. Ничего не хардкодим: список экранов,
 * доступов и fallback-ов берётся из concept.json, поэтому покрытие не зависит
 * от того, вспомнил ли автор дописать проверку.
 *
 *   node scripts/test-flows.mjs petlya
 *   node scripts/test-flows.mjs            # все концепты
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, readSpec, listConcepts } from './lib.mjs';

async function run(slug) {
  const spec = readSpec(slug);
  const file = join(DIST, slug, 'index.html');
  if (!existsSync(file)) throw new Error(`${slug}: сначала соберите — node scripts/build.mjs ${slug}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' || /нет экрана|нет доступа/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await page.goto('file://' + file, { waitUntil: 'networkidle' });

  const res = [];
  const ok = (name, cond) => res.push({ name, pass: !!cond });
  /* Все флоу-проверки идут по геройскому прототипу — он содержит все экраны. */
  const hero = (spec.prototypes || []).find((p) => p.hero) || (spec.prototypes || [])[0];
  const H = `#pr-${hero.id}`;
  const cur = () => page.evaluate((h) => document.querySelector(h + ' .screen.is-on')?.dataset.screen, H);
  const alertOn = () => page.evaluate((h) => document.querySelector(h + ' .sysask').classList.contains('is-on'), H);
  const answer = (a) => page.click(`${H} [data-answer="${a}"]`);
  const reset = async () => { await page.click(`${H} ~ .controls [data-act="reset"]`); await page.waitForTimeout(50); };
  const goto = async (id) => {
    await page.click('[data-tab="screens"]');
    await page.click(`[data-shot-go="${id}"]`);
    await page.waitForTimeout(80);
  };

  /* —— структура —— */
  ok(`старт = ${spec.start}`, (await cur()) === spec.start);
  ok('журнал пуст на старте', (await page.$$('#perms .perm:not([data-state="idle"])')).length === 0);
  ok('на старте нет промпта', !(await alertOn()));

  const missing = await page.evaluate(
    ({ ids, h }) => ids.filter((id) => !document.querySelector(h + ` [data-screen="${id}"]`)),
    { ids: spec.screens.map((s) => s.id), h: H }
  );
  ok(`все ${spec.screens.length} экранов спеки есть в разметке` + (missing.length ? ` → нет: ${missing}` : ''), !missing.length);

  const broken = await page.evaluate((h) => {
    const bad = [];
    const root = document.querySelector(h);
    const known = new Set([...root.querySelectorAll('[data-screen]')].map((e) => e.dataset.screen));
    const miss = (id) => id && !known.has(id);
    root.querySelectorAll('[data-go],[data-jump]').forEach((e) => {
      const id = e.dataset.go || e.dataset.jump;
      if (miss(id)) bad.push('go:' + id);
    });
    root.querySelectorAll('[data-ask]').forEach((e) => {
      const [, a, b] = e.dataset.ask.split('|');
      [a, b].filter(Boolean).forEach((id) => { if (miss(id)) bad.push('ask:' + id); });
    });
    root.querySelectorAll('[data-activate]').forEach((e) => {
      const a = e.dataset.activate.split('|')[1];
      if (miss(a)) bad.push('act:' + a);
    });
    root.querySelectorAll('[data-toast]').forEach((e) => {
      const a = e.dataset.toast.split('|')[1];
      if (miss(a)) bad.push('toast:' + a);
    });
    return [...new Set(bad)];
  }, H);
  ok('нет битых переходов' + (broken.length ? ` → ${broken}` : ''), !broken.length);

  /* —— доступы: достижимость —— */
  const reachable = await page.evaluate((h) => {
    const s = new Set();
    const root = document.querySelector(h);
    root.querySelectorAll('[data-ask]').forEach((e) => e.dataset.ask.split('|')[0].split('+').forEach((k) => s.add(k)));
    root.querySelectorAll('[data-activate]').forEach((e) => s.add(e.dataset.activate.split('|')[0]));
    return [...s];
  }, H);
  for (const p of spec.permissions) ok(`доступ ${p.key} достижим из UI`, reachable.includes(p.key));
  const stray = reachable.filter((k) => !spec.permissions.some((p) => p.key === k));
  ok('в разметке нет доступов вне спеки' + (stray.length ? ` → ${stray}` : ''), !stray.length);

  /* —— доступы: отказ ведёт на видимый fallback —— */
  for (const p of spec.permissions) {
    if (p.activate) {
      await reset();
      const el = await page.$(`[data-activate^="${p.key}|"]`);
      if (!el) { ok(`${p.key}: есть триггер activate`, false); continue; }
      const scr = await page.evaluate(({ k, h }) => document.querySelector(h + ` [data-activate^="${k}|"]`).closest('.screen').dataset.screen, { k: p.key, h: H });
      await goto(scr);
      await page.click(`${H} [data-screen="${scr}"] [data-activate^="${p.key}|"]`);
      await page.waitForTimeout(60);
      ok(`${p.key}: entitlement без системного alert`, !(await alertOn()));
      continue;
    }

    /* Проверяем КАЖДЫЙ триггер доступа, а не первый попавшийся: один и тот же
       ключ часто просят с нескольких экранов, и fallback нужен на каждом. */
    const triggers = await page.evaluate(({ k, h }) =>
      [...document.querySelectorAll(h + ' [data-ask]')]
        .filter((e) => e.dataset.ask.split('|')[0].split('+').includes(k))
        .map((e) => ({ screen: e.closest('.screen').dataset.screen, ask: e.dataset.ask })), { k: p.key, h: H });
    if (!triggers.length) { ok(`${p.key}: есть триггер запроса`, false); continue; }

    for (const t of triggers) {
      const chain = t.ask.split('|')[0].split('+');
      const idx = chain.indexOf(p.key);
      await reset();
      await goto(t.screen);
      await page.click(`${H} [data-screen="${t.screen}"] [data-ask="${t.ask}"]`);
      await page.waitForTimeout(60);
      for (let i = 0; i < idx; i++) { await answer('grant'); await page.waitForTimeout(50); }
      if (!(await alertOn())) { ok(`${p.key} с «${t.screen}»: показан alert`, false); continue; }
      await answer('deny');
      await page.waitForTimeout(80);

      /* Fallback должен быть виден там, куда нас привёл отказ, — иначе он лежит
         на экране, до которого при отказе как раз и не доходят. */
      const shown = await page.evaluate(({ k, h }) => {
        const scr = document.querySelector(h + ' .screen.is-on');
        if (!scr) return false;
        const vis = (e) => e && !e.classList.contains('perm-hidden') && e.offsetParent !== null;
        const note = [...scr.querySelectorAll('[data-show-denied]')]
          .some((e) => e.dataset.showDenied.split(',').map((s) => s.trim()).includes(k) && vis(e));
        const sw = [...scr.querySelectorAll(`[data-switch="${k}"]`)].some((e) => !e.classList.contains('is-on'));
        return note || sw;
      }, { k: p.key, h: H });
      ok(`${p.key}: отказ с «${t.screen}» → виден fallback на «${await cur()}»`, shown);
    }
    await reset();
  }

  /* —— цепочки: отказ на первом шаге не спрашивает второй —— */
  const chains = await page.evaluate(() =>
    [...document.querySelectorAll('[data-ask]')].map((e) => e.dataset.ask.split('|')[0]).filter((c) => c.includes('+'))
  );
  for (const chain of [...new Set(chains)]) {
    const [first, second] = chain.split('+');
    await reset();
    const scr = await page.evaluate(({ c, h }) => document.querySelector(h + ` [data-ask^="${c}|"]`).closest('.screen').dataset.screen, { c: chain, h: H });
    await goto(scr);
    await page.click(`${H} [data-screen="${scr}"] [data-ask^="${chain}|"]`);
    await page.waitForTimeout(60);
    await answer('grant'); await page.waitForTimeout(60);
    ok(`цепочка ${chain}: второй alert показан сразу`, await alertOn());
    await reset();
    await goto(scr);
    await page.click(`${H} [data-screen="${scr}"] [data-ask^="${chain}|"]`);
    await page.waitForTimeout(60);
    await answer('deny'); await page.waitForTimeout(80);
    const asked = await page.evaluate(() => [...document.querySelectorAll('#perms .perm:not([data-state="idle"])')].length);
    ok(`цепочка ${chain}: отказ на ${first} не спрашивает ${second}`, asked === 1);
  }

  /* —— повторный вход не переспрашивает —— */
  await reset();
  const p0 = spec.permissions.find((p) => !p.activate);
  if (p0) {
    const scr = await page.evaluate(({ k, h }) => {
      const el = [...document.querySelectorAll(h + ' [data-ask]')].find((e) => e.dataset.ask.split('|')[0].split('+').includes(k));
      return el ? el.closest('.screen').dataset.screen : null;
    }, { k: p0.key, h: H });
    if (!scr) {
      ok(`${p0.key}: в разметке нет триггера запроса`, false);
    } else {
      await goto(scr);
      const sel = `${H} [data-screen="${scr}"] [data-ask]`;
      await page.click(sel); await page.waitForTimeout(60);
      while (await alertOn()) { await answer('grant'); await page.waitForTimeout(60); }
      await goto(scr);
      await page.click(sel); await page.waitForTimeout(80);
      ok('повторный вход без системного alert', !(await alertOn()));
    }
  }

  /* —— возврат по IA: закрыть экран = оказаться у родителя из спеки —— */
  for (const s of spec.screens) {
    if (!s.parent) continue;
    const hasBack = await page.evaluate(({ id, h }) => !!document.querySelector(h + ` [data-screen="${id}"] [data-back]`), { id: s.id, h: H });
    if (!hasBack) continue;
    await reset();
    await goto(s.id);
    await page.click(`${H} [data-screen="${s.id}"] [data-back]`);
    await page.waitForTimeout(60);
    const landed = await cur();
    ok(`«${s.title}» → назад ведёт на «${s.parent}»` + (landed === s.parent ? '' : ` → попали на ${landed}`), landed === s.parent);
  }
  await reset();

  /* —— HIG —— */
  const small = await page.evaluate((h) => {
    const bad = [];
    document.querySelectorAll(`${h} [data-go],${h} [data-ask],${h} [data-back],${h} [data-activate],${h} [data-jump],${h} [data-toast]`).forEach((e) => {
      const scr = e.closest('.screen'); if (!scr) return;
      const was = scr.classList.contains('is-on');
      if (!was) scr.classList.add('is-on');
      const r = e.getBoundingClientRect();
      if (r.width && r.height < 44 && !e.classList.contains('tap')) bad.push((e.textContent || e.ariaLabel || '?').trim().slice(0, 24));
      if (!was) scr.classList.remove('is-on');
    });
    return bad;
  }, H);
  ok('хит-таргеты ≥ 44pt' + (small.length ? ` → ${small.slice(0, 4)}` : ''), !small.length);
  ok('консоль чистая' + (errs.length ? ` → ${errs.slice(0, 3)}` : ''), !errs.length);

  await browser.close();
  return res;
}

const slugs = process.argv[2] ? [process.argv[2]] : listConcepts();
let failed = 0;
for (const slug of slugs) {
  const res = await run(slug);
  const bad = res.filter((r) => !r.pass);
  console.log(`\n=== ${slug} · ${res.length - bad.length}/${res.length} ===`);
  for (const r of res) if (!r.pass) console.log('  FAIL  ' + r.name);
  if (!bad.length) console.log('  всё зелёное');
  failed += bad.length;
}
process.exit(failed ? 1 : 0);
