#!/usr/bin/env node
import assert from 'node:assert/strict';
import { assetPlan, DEVICE_TARGETS, TEMPLATES } from './app-store-assets.mjs';
import { listConcepts, readSpec } from './lib.mjs';

const spec = {
  slug: 'sample', name: 'Пример', targetSet: 'vk-video', tagline: 'Короткое обещание продукта',
  product: { verticalSlice: { action: 'watch', result: 'moment' } },
  positioning: { evidenceScreens: ['home', 'watch', 'moment'] },
  screens: [
    { id: 'home', title: 'Главная', meta: 'Каталог' },
    { id: 'watch', title: 'Плеер', meta: 'Просмотр' },
    { id: 'moment', title: 'Момент', meta: 'Сохранение' },
  ],
  appStore: {
    name: 'Пример', subtitle: 'Видео без лишнего',
    description: ['Пример — видеосервис.', 'СМОТРИТЕ СРАЗУ\nГлавное видео уже на первом экране.'],
  },
};

const plan = assetPlan(spec);
assert.equal(plan.template, 'studio');
assert.deepEqual(plan.devices, ['iphone-6.9', 'iphone-6.5', 'iphone-6.3', 'iphone-6.1', 'ipad-13-landscape']);
assert.deepEqual(plan.screens.map((item) => item.screen), ['home', 'watch', 'moment']);
assert.equal(plan.screens[0].headline, 'Смотрите сразу');
assert.equal(plan.screens[0].body, 'Главное видео уже на первом экране');
assert.equal(plan.tone, 'dark');
assert.equal(DEVICE_TARGETS['iphone-6.9'].width, 1320);
assert.equal(DEVICE_TARGETS['iphone-6.9'].height, 2868);
assert.equal(DEVICE_TARGETS['iphone-6.5'].width, 1284);
assert.equal(DEVICE_TARGETS['iphone-6.5'].height, 2778);
assert.equal(DEVICE_TARGETS['iphone-6.3'].width, 1206);
assert.equal(DEVICE_TARGETS['iphone-6.3'].height, 2622);
assert.equal(DEVICE_TARGETS['iphone-6.1'].width, 1170);
assert.equal(DEVICE_TARGETS['iphone-6.1'].height, 2532);
assert.equal(DEVICE_TARGETS['ipad-13-landscape'].width, 2752);
assert.equal(DEVICE_TARGETS['ipad-13-landscape'].height, 2064);
assert.deepEqual(TEMPLATES, ['studio']);

const configured = assetPlan({
  ...spec,
  appStore: { ...spec.appStore, assets: {
    locale: 'en-US', template: 'studio', tone: 'light', devices: ['iphone-6.9'],
    screens: [{ screen: 'moment', headline: 'Keep the best part', body: 'Return to it any time.' }],
  } },
});
assert.equal(configured.locale, 'en-US');
assert.equal(configured.template, 'studio');
assert.equal(configured.tone, 'light');
assert.deepEqual(configured.devices, ['iphone-6.9']);
assert.equal(configured.screens[0].headline, 'Keep the best part');

const internalJargon = /\b(?:IA|Photo Library|PHPicker|UIDocumentPicker|Location|MapKit|MKLocalSearch|aps-environment|Core Data|FileManager|MPNowPlayingInfoCenter|FTS|ID3|MP4|SDK|API|root|metadata|asset|Files|Photos|tempo|mood tags|play\/shuffle)\b/i;
for (const slug of listConcepts()) {
  const frames = assetPlan(readSpec(slug)).screens;
  assert.ok(frames.length >= 3 && frames.length <= 10, `${slug}: серия должна содержать 3–10 кадров`);
  for (const frame of frames) {
    assert.notEqual(frame.headline, 'Всё главное на одном экране', `${slug}/${frame.screen}: нужен конкретный заголовок`);
    assert.ok(!internalJargon.test(`${frame.headline} ${frame.body}`), `${slug}/${frame.screen}: в App Store copy попал внутренний термин`);
  }
}

console.log('app-store assets: ok');
