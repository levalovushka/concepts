#!/usr/bin/env node
import { chromium } from 'playwright';
import { join } from 'node:path';
import { DIST, listConcepts, readSpec } from './lib.mjs';

const AUTH_SIGNATURES = {
  double: ['db-auth', 'db-auth-copy', 'db-phone'],
  dvor: ['d-hero', 'd-card', 'd-cta'],
  liga: ['lx-auth2', 'lx-authhero', 'lx-phone-field'],
  looks: ['lk-auth', 'lk-auth-intro', 'lk-auth-form'],
  radius: ['rd-auth', 'rd-auth-copy', 'rd-phone-field'],
  scene: ['sc-auth', 'sc-auth-copy', 'sc-input'],
  set: ['cx-auth-head', 'cx-auth-body', 'cx-phone-field'],
  shellac: ['sm-login-body', 'sm-login-brand', 'sm-phone-field'],
  strochka: ['st-auth', 'st-auth-main', 'st-phone-field'],
  tails: ['tl-auth', 'tl-auth-mark', 'tl-auth-field'],
  today: ['td-auth', 'td-auth-mark', 'td-field'],
};

const browser = await chromium.launch();
const failures = [];
let custom = 0;

for (const slug of listConcepts()) {
  const signature = AUTH_SIGNATURES[slug] || [];
  if (signature.length) custom += 1;
  const spec = readSpec(slug);
  const hero = (spec.prototypes || []).find((prototype) => prototype.hero) || spec.prototypes?.[0];
  const page = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
  await page.goto(`file://${join(DIST, slug, 'index.html')}`, { waitUntil: 'networkidle' });
  const result = await page.evaluate(({ heroId, expected }) => {
    const device = document.querySelector(`#pr-${heroId}`);
    const phone = device?.querySelector('[data-screen="phone"]');
    const status = device?.querySelector('.status');
    const body = phone?.querySelector('.unified-auth-body');
    const first = body?.firstElementChild || phone?.querySelector([
      'h1', '.auth-mark', '.db-logo', '.lk-auth-head', '.lx-logo', '.rd-wordmark',
      '.sc-auth-brand', '.cx-wordmark', '.sm-login-brand', '.st-auth-brand',
      '.tl-auth-mark', '.td-logo',
    ].join(','));
    const phoneClasses = new Set([...phone?.querySelectorAll('[class]') || []]
      .flatMap((node) => [...node.classList]));
    const retained = expected.filter((token) => phoneClasses.has(token));
    const gap = status && first ? first.getBoundingClientRect().top - status.getBoundingClientRect().bottom : -1;
    return { retained, gap };
  }, { heroId: hero.id, expected: signature });
  if (signature.length && result.retained.length < 2) failures.push(`${slug}: потеряна исходная auth-композиция (${signature.join(', ')})`);
  if (result.gap < 8) failures.push(`${slug}: контент вторгается в status bar, отступ ${Math.round(result.gap)}px`);
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(`auth visual: FAIL · индивидуальных auth-паттернов ${custom}`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}
console.log(`auth visual: OK · индивидуальных auth-паттернов ${custom}`);
