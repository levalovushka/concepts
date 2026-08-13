#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { DIST, listConcepts } from './lib.mjs';

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
  const cards = page.locator('.card');
  assert.equal(await cards.count(), concepts.length, 'в лаунчере должен быть каждый концепт');

  for (const card of await cards.all()) {
    const href = await card.getAttribute('href');
    const image = await card.locator('img').getAttribute('src');
    assert.ok(href, 'у карточки нет ссылки');
    assert.ok(image, 'у карточки нет скриншота');
    assert.ok(existsSync(fileURLToPath(new URL(href, page.url()))), `нет страницы ${href}`);
    assert.ok(existsSync(fileURLToPath(new URL(image, page.url()))), `нет скриншота ${image}`);
  }

  for (const button of await page.locator('[data-filter]:not([data-filter="all"])').all()) {
    const targetSet = await button.getAttribute('data-filter');
    const expected = await page.locator(`.card[data-target-set="${targetSet}"]`).count();
    await button.click();
    assert.equal(await page.locator('.card:visible').count(), expected, `неверная выдача фильтра ${targetSet}`);
    assert.equal(new URL(page.url()).searchParams.get('set'), targetSet, 'фильтр не сохранился в URL');
    await page.reload();
    assert.equal(await page.locator('.card:visible').count(), expected, `фильтр ${targetSet} не восстановился из URL`);
  }

  assert.deepEqual(errors, [], `ошибки в консоли: ${errors.join('; ')}`);
  console.log(`лаунчер: ${concepts.length} карточек · ссылки и скриншоты на месте · фильтры зелёные`);
} finally {
  await browser.close();
}
