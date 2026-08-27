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
import { DIST, readSpec, readMarkup, listConcepts } from './lib.mjs';
import { prepareEmailRegistration } from './build.mjs';

async function run(slug) {
  const sourceSpec = readSpec(slug);
  const spec = prepareEmailRegistration(sourceSpec, readMarkup(slug, sourceSpec)).spec;
  const file = join(DIST, slug, 'index.html');
  if (!existsSync(file)) throw new Error(`${slug}: сначала соберите — node scripts/build.mjs ${slug}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  page.setDefaultTimeout(5000);
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
  for (const sourcePrototype of sourceSpec.prototypes || []) {
    if (sourcePrototype.hero || sourcePrototype.start === 'phone' || ['code', 'codefail'].includes(sourcePrototype.start)) continue;
    const effectivePrototype = spec.prototypes.find((prototype) => prototype.id === sourcePrototype.id);
    ok(`${sourcePrototype.id}: сценарий сохраняет старт «${sourcePrototype.start}»`, effectivePrototype?.start === sourcePrototype.start);
  }
  const externalAuth = await page.evaluate((h) => {
    const auth = document.querySelector(h + ' [data-screen="phone"]');
    return !!auth?.querySelector('[class*="google"], .auth-apple, [data-activate^="applesignin|"]');
  }, H);
  ok('регистрация предлагает только почту', !externalAuth && !spec.permissions.some((p) => p.key === 'applesignin'));
  ok('регистрация использует настоящий email input', !!(await page.$(`${H} [data-screen="phone"] input[type="email"]`)));

  await page.click(`${H} ~ .controls [data-state="empty"]`);
  ok('empty формы = пустой input без оверлея', await page.evaluate((h) => {
    const phone = document.querySelector(h + ' [data-screen="phone"]');
    return phone?.querySelector('input[type="email"]')?.value === '' && !document.querySelector(h + ' .prototype-state.is-on');
  }, H));
  await page.click(`${H} ~ .controls [data-state="error"]`);
  ok('error формы = невалидный input и inline-текст без оверлея', await page.evaluate((h) => {
    const phone = document.querySelector(h + ' [data-screen="phone"]');
    return phone?.querySelector('input[aria-invalid="true"]') && phone.querySelector('[data-prototype-form-message]') && !document.querySelector(h + ' .prototype-state.is-on');
  }, H));
  await page.click(`${H} ~ .controls [data-state="loading"]`);
  ok('loading формы остаётся внутри формы', await page.evaluate((h) => {
    const phone = document.querySelector(h + ' [data-screen="phone"]');
    return phone?.querySelector('[aria-disabled="true"].prototype-button-loading') && !document.querySelector(h + ' .prototype-state.is-on');
  }, H));
  await page.click(`${H} ~ .controls [data-state="default"]`);

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

  /* Галерея экранов не считается пользовательским маршрутом. Строим граф
     реальных переходов от start и убеждаемся, что для каждого доступа есть
     хотя бы один достижимый UI-триггер. Иначе permission формально лежит в
     разметке, но получить его внутри продукта невозможно. */
  const routePermissions = await page.evaluate(({ h, start, parent }) => {
    const root = document.querySelector(h);
    const screens = [...root.querySelectorAll('[data-screen]')];
    const known = new Set(screens.map((e) => e.dataset.screen));
    const graph = Object.fromEntries([...known].map((id) => [id, new Set()]));
    const add = (from, to) => { if (from && known.has(to)) graph[from].add(to); };

    for (const screen of screens) {
      const from = screen.dataset.screen;
      screen.querySelectorAll('[data-go],[data-jump]').forEach((e) => add(from, e.dataset.go || e.dataset.jump));
      screen.querySelectorAll('[data-ask]').forEach((e) => {
        const [, grant, deny] = e.dataset.ask.split('|');
        add(from, grant); add(from, deny);
      });
      screen.querySelectorAll('[data-activate]').forEach((e) => add(from, e.dataset.activate.split('|')[1]));
      screen.querySelectorAll('[data-toast]').forEach((e) => add(from, e.dataset.toast.split('|')[1]));
      if (screen.querySelector('[data-back]')) add(from, parent[from]);
    }

    const reached = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const from = queue.shift();
      for (const to of graph[from] || []) if (!reached.has(to)) { reached.add(to); queue.push(to); }
    }

    const triggers = {};
    for (const screen of screens) {
      const id = screen.dataset.screen;
      screen.querySelectorAll('[data-ask]').forEach((e) => {
        e.dataset.ask.split('|')[0].split('+').forEach((key) => (triggers[key] ||= new Set()).add(id));
      });
      screen.querySelectorAll('[data-activate]').forEach((e) => {
        const key = e.dataset.activate.split('|')[0];
        (triggers[key] ||= new Set()).add(id);
      });
    }
    return {
      reached: [...reached],
      triggers: Object.fromEntries(Object.entries(triggers).map(([key, ids]) => [key, [...ids]])),
    };
  }, { h: H, start: spec.start, parent: Object.fromEntries(spec.screens.map((s) => [s.id, s.parent])) });
  for (const p of spec.permissions) {
    const triggerScreens = routePermissions.triggers[p.key] || [];
    const available = triggerScreens.filter((id) => routePermissions.reached.includes(id));
    ok(`${p.key}: UI-триггер достижим от «${spec.start}»` + (available.length ? ` через «${available.join(', ')}»` : ` → триггеры только на: ${triggerScreens.join(', ') || 'нет'}`), available.length > 0);
  }

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

  /* —— сквозной маршрут кликами, без служебных переходов ——
     Проверки выше открывают экраны через галерею и поэтому не ловят доступ,
     до которого в живом продукте не дойти. Здесь маршрут строится из самой
     разметки: обход в ширину от старта, затем клик по каждому шагу пути.
     Раньше такой маршрут был выписан руками для двух концептов — остальные
     оставались без него, а выписанный расходился с разметкой при первой правке. */
  {
    const plan = await page.evaluate(({ h, start }) => {
      const r = document.querySelector(h);
      const screens = [...r.querySelectorAll('[data-screen]')];
      const known = new Set(screens.map((e) => e.dataset.screen));
      const sel = (e) => {
        const s = e.closest('.screen').dataset.screen;
        const a = ['data-go', 'data-jump', 'data-ask', 'data-activate', 'data-toast'].find((x) => e.hasAttribute(x));
        return `[data-screen="${s}"] [${a}="${e.getAttribute(a)}"]`;
      };
      const edges = {};
      for (const s of screens) {
        const from = s.dataset.screen; edges[from] ||= [];
        const add = (to, e) => { if (known.has(to)) edges[from].push({ to, sel: sel(e) }); };
        s.querySelectorAll('[data-go],[data-jump]').forEach((e) => add(e.dataset.go || e.dataset.jump, e));
        s.querySelectorAll('[data-ask]').forEach((e) => add(e.dataset.ask.split('|')[1], e));
        s.querySelectorAll('[data-activate]').forEach((e) => add(e.dataset.activate.split('|')[1], e));
        s.querySelectorAll('[data-toast]').forEach((e) => { const t = e.dataset.toast.split('|')[1]; if (t) add(t, e); });
      }
      const prev = { [start]: null }; const queue = [start];
      while (queue.length) {
        const from = queue.shift();
        for (const { to, sel } of edges[from] || []) if (!(to in prev)) { prev[to] = { from, sel }; queue.push(to); }
      }
      const route = (id) => { const out = []; let c = id; while (prev[c]) { out.unshift(prev[c].sel); c = prev[c].from; } return out; };
      const trig = {};
      for (const s of screens) {
        s.querySelectorAll('[data-ask]').forEach((e) => e.dataset.ask.split('|')[0].split('+')
          .forEach((k) => (trig[k] ||= []).push({ s: s.dataset.screen, sel: sel(e) })));
        s.querySelectorAll('[data-activate]').forEach((e) => {
          const k = e.dataset.activate.split('|')[0];
          (trig[k] ||= []).push({ s: s.dataset.screen, sel: sel(e) });
        });
      }
      const out = {};
      for (const k of Object.keys(trig)) {
        const t = trig[k].find((x) => x.s in prev);
        out[k] = t ? { route: route(t.s), sel: t.sel } : null;
      }
      return out;
    }, { h: H, start: spec.start });

    const grantAll = async () => {
      for (let i = 0; i < 4; i++) {
        if (!(await alertOn())) return;
        await answer('grant'); await page.waitForTimeout(50);
      }
    };
    for (const perm of spec.permissions) {
      const step = plan[perm.key];
      if (!step) { ok(`${perm.key}: маршрут кликами доходит до запроса`, false); continue; }
      await reset();
      let broke = false;
      for (const s of [...step.route, step.sel]) {
        const el = await page.$(`${H} ${s}`);
        if (!el) { broke = true; break; }
        await el.click(); await page.waitForTimeout(45); await grantAll();
      }
      const granted = broke ? false : await page.evaluate((t) => {
        const row = [...document.querySelectorAll('#perms .perm')]
          .find((e) => e.querySelector('.perm-name')?.textContent.trim() === t);
        return row?.dataset.state === 'granted';
      }, perm.plist);
      ok(`${perm.key}: маршрут кликами доходит до запроса`, granted);
    }
    await reset();
  }

  await browser.close();
  return res;
}

const slugs = process.argv[2] ? [process.argv[2]] : listConcepts();
/* Каждый концепт поднимает свой браузер: последовательно это двадцать минут
   на полном наборе. Пул держит несколько прогонов разом, вывод по-прежнему
   идёт в порядке слагов, чтобы отчёт не превращался в чересполосицу. */
const LANES = Math.min(Number(process.env.LANES) || 4, slugs.length || 1);
const results = new Array(slugs.length);
let next = 0;
await Promise.all(Array.from({ length: LANES }, async () => {
  while (next < slugs.length) {
    const i = next++;
    try { results[i] = await run(slugs[i]); }
    catch (e) { results[i] = [{ name: `прогон упал: ${e.message}`, pass: false }]; }
  }
}));
let failed = 0;
slugs.forEach((slug, i) => {
  const res = results[i] || [];
  const bad = res.filter((r) => !r.pass);
  console.log(`\n=== ${slug} · ${res.length - bad.length}/${res.length} ===`);
  for (const r of res) if (!r.pass) console.log('  FAIL  ' + r.name);
  if (!bad.length) console.log('  всё зелёное');
  failed += bad.length;
});
process.exit(failed ? 1 : 0);
