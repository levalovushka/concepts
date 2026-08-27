#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { DIST, listConcepts, readSpec } from './lib.mjs';

const launcherPath = join(DIST, 'index.html');
assert.ok(existsSync(launcherPath), 'сначала соберите лаунчер: npm run build:all');

const errors = [];
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(pathToFileURL(launcherPath).href);

  const concepts = listConcepts();
  const modes = Object.fromEntries(concepts.map((slug) => [slug, readSpec(slug).positioning.mode]));
  const modeCounts = Object.values(modes).reduce((out, mode) => ({ ...out, [mode]: (out[mode] || 0) + 1 }), {});
  assert.ok(modeCounts.mimicry > 0, 'в портфеле должна быть хотя бы одна мимикрия');
  assert.ok(modeCounts.differentiation > 0, 'в портфеле должна быть хотя бы одна отстройка');
  assert.equal(Object.values(modeCounts).reduce((sum, count) => sum + count, 0), concepts.length, 'каждый концепт должен принадлежать одной стратегии');
  const cards = page.locator('.card');
  assert.equal(await cards.count(), concepts.length, 'в лаунчере должен быть каждый концепт');
  const conceptUrls = [];

  for (const card of await cards.all()) {
    const href = await card.getAttribute('href');
    const image = await card.locator('img').getAttribute('src');
    assert.ok(href, 'у карточки нет ссылки');
    assert.ok(image, 'у карточки нет скриншота');
    assert.ok(existsSync(fileURLToPath(new URL(href, page.url()))), `нет страницы ${href}`);
    assert.ok(existsSync(fileURLToPath(new URL(image, page.url()))), `нет скриншота ${image}`);
    conceptUrls.push(new URL(href, page.url()).href);
  }

  await cards.first().click();
  const back = page.locator('.topbar-back');
  assert.equal(await back.getAttribute('href'), '../index.html', 'у концепта должна быть ссылка назад в лаунчер');

  await page.click('[data-tab="docs"]');
  const rawMarkdownLinks = await page.locator('.docs-links a[href$=".md"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href'))
  );
  assert.deepEqual(rawMarkdownLinks, [], `документы не должны уводить на сырой Markdown: ${rawMarkdownLinks.join(', ')}`);
  assert.ok(await page.locator('[data-doc-view]').count(), 'документы должны читаться внутри страницы концепта');
  const architectureButton = page.locator('[data-doc="02-architecture"]');
  await architectureButton.click();
  assert.equal(await architectureButton.getAttribute('aria-pressed'), 'true', 'выбранный документ не отмечен активным');
  assert.ok(await page.locator('[data-doc-view="02-architecture"].is-on h1').count(), 'Markdown-заголовок не отрендерился');
  assert.ok(await page.locator('[data-doc-view="02-architecture"].is-on table').count(), 'Markdown-таблица не отрендерилась');

  await back.click();
  assert.equal(await page.locator('.card').count(), concepts.length, 'кнопка назад не вернула в лаунчер');

  for (const url of conceptUrls) {
    await page.goto(url);
    await page.click('[data-tab="docs"]');
    assert.equal(await page.locator('.docs-links a[href$=".md"]').count(), 0, `${url}: ссылка на сырой Markdown`);
    assert.ok(await page.locator('[data-doc-view]').count(), `${url}: нет встроенного чтения документов`);
  }
  await page.goto(pathToFileURL(launcherPath).href);

  for (const button of await page.locator('[data-mode-filter]:not([data-mode-filter="all"])').all()) {
    const mode = await button.getAttribute('data-mode-filter');
    const expected = await page.locator(`.card[data-mode="${mode}"]`).count();
    await button.click();
    assert.equal(await page.locator('.card:visible').count(), expected, `неверная выдача стратегии ${mode}`);
    assert.equal(new URL(page.url()).searchParams.get('mode'), mode, 'стратегия не сохранилась в URL');
    await page.reload();
    assert.equal(await page.locator('.card:visible').count(), expected, `стратегия ${mode} не восстановилась из URL`);
    await page.locator('[data-mode-filter="all"]').click();
  }

  for (const targetSet of await page.locator('[data-set-filter] option:not([value="all"])').evaluateAll((options) => options.map((option) => option.value))) {
    const expected = await page.locator(`.card[data-target-set="${targetSet}"]`).count();
    await page.locator('[data-set-filter]').selectOption(targetSet);
    assert.equal(await page.locator('.card:visible').count(), expected, `неверная выдача фильтра ${targetSet}`);
    const groupedCount = await page.locator('[data-mode-group]:visible [data-group-count]').allTextContents();
    assert.equal(groupedCount.reduce((sum, value) => sum + Number(value), 0), expected, `счётчики секций не обновились для ${targetSet}`);
    assert.equal(new URL(page.url()).searchParams.get('set'), targetSet, 'фильтр не сохранился в URL');
    await page.reload();
    assert.equal(await page.locator('.card:visible').count(), expected, `фильтр ${targetSet} не восстановился из URL`);
    await page.locator('[data-set-filter]').selectOption('all');
  }

  assert.deepEqual(errors, [], `ошибки в консоли: ${errors.join('; ')}`);
  console.log(`лаунчер: ${concepts.length} карточек · ссылки и скриншоты на месте · фильтры зелёные`);
} finally {
  await browser.close();
}
