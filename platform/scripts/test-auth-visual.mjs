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
  const enforceVkBlue = ['vk-video', 'vk-music'].includes(spec.targetSet);
  const result = await page.evaluate(({ heroId, expected, slug }) => {
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
    const phonePrimary = phone?.querySelector('[data-primary]');
    const password = device?.querySelector('[data-screen="password"]');
    const product = [...device?.querySelectorAll('.screen') || []].find((screen) => !['phone', 'password', 'register', 'registerpassword', 'account', 'deleteaccount'].includes(screen.dataset.screen));
    const passwordTitle = password?.querySelector('h1');
    const primary = password?.querySelector('[data-primary]');
    const back = password?.querySelector('.unified-auth-back');
    const authScreenNames = ['phone', 'password', 'register', 'registerpassword', 'account', 'deleteaccount'];
    const authScreens = Object.fromEntries(authScreenNames.map((name) => [
      name,
      device?.querySelector(`[data-screen="${name}"]`) || null,
    ]));
    const dvorRequired = {
      password: ['.d-top', '.d-card', '.d-field', '.d-cta', '.d-btn'],
      register: ['.d-top', '.d-card', '.d-field', '.d-cta', '.d-btn'],
      registerpassword: ['.d-top', '.d-card', '.d-field', '.d-cta', '.d-btn'],
      account: ['.d-top', '.d-card', '.d-row'],
      deleteaccount: ['.d-top', '.d-card', '.d-cta', '.d-btn'],
    };
    const dvorComponentMisses = slug === 'dvor'
      ? Object.entries(dvorRequired).flatMap(([name, selectors]) => selectors
        .filter((selector) => !authScreens[name]?.querySelector(selector))
        .map((selector) => `${name}:${selector}`))
      : [];
    const dvorInternalLogos = slug === 'dvor'
      ? authScreenNames.slice(1).filter((name) => authScreens[name]?.querySelector('.auth-mark,.auth-app-icon'))
      : [];
    const internalLogoSelector = [
      '.auth-mark', '.auth-app-icon', '.db-logo', '.lx-logo', '.lk-logo', '.rd-mark',
      '.sc-logo', '.sm-login-brand', '.st-auth-logo', '.tl-auth-mark', '.td-auth-mark',
    ].join(',');
    const internalAuthLogos = authScreenNames.slice(1)
      .filter((name) => authScreens[name]?.querySelector(internalLogoSelector));
    const dvorGenericLeaks = slug === 'dvor'
      ? authScreenNames.slice(1).flatMap((name) => [
        '.unified-auth-field', '.unified-account-card', '.unified-auth-title',
      ].filter((selector) => authScreens[name]?.querySelector(selector)).map((selector) => `${name}:${selector}`))
      : [];
    return {
      retained,
      gap,
      authWeight: passwordTitle ? Number(getComputedStyle(passwordTitle).fontWeight) : null,
      phoneBackground: phone ? getComputedStyle(phone).backgroundColor : null,
      passwordBackground: password ? getComputedStyle(password).backgroundColor : null,
      phonePrimaryColor: phonePrimary ? getComputedStyle(phonePrimary).backgroundColor : null,
      primaryColor: primary ? getComputedStyle(primary).backgroundColor : null,
      primaryOpacity: primary ? Number(getComputedStyle(primary).opacity) : null,
      backColor: back ? getComputedStyle(back).color : null,
      hasClose: Boolean(phone?.querySelector('[aria-label="Закрыть"], use[href="#i-x"]')),
      productAccent: product ? getComputedStyle(product).getPropertyValue('--accent').trim().toLowerCase() : null,
      exceptionalActionColors: [...device?.querySelectorAll('.rh-primary,.lx-primary2,.lx-opbtn.primary,.lx-create-action.primary i') || []]
        .map((node) => getComputedStyle(node).backgroundColor),
      dvorHasStartLogo: slug !== 'dvor' || Boolean(authScreens.phone?.querySelector('.auth-mark .auth-app-icon')),
      dvorComponentMisses,
      dvorInternalLogos,
      dvorGenericLeaks,
      internalAuthLogos,
    };
  }, { heroId: hero.id, expected: signature, slug });
  if (signature.length && result.retained.length < 2) failures.push(`${slug}: потеряна исходная auth-композиция (${signature.join(', ')})`);
  if (result.gap < 8) failures.push(`${slug}: контент вторгается в status bar, отступ ${Math.round(result.gap)}px`);
  if (result.authWeight > 700) failures.push(`${slug}: заголовок авторизации слишком жирный (${result.authWeight})`);
  if (result.hasClose) failures.push(`${slug}: на корневом экране входа осталась кнопка закрытия`);
  if (!result.primaryColor || result.primaryColor === 'rgba(0, 0, 0, 0)' || result.primaryOpacity < 0.95) failures.push(`${slug}: кнопка входа невидима (${result.primaryColor}, opacity ${result.primaryOpacity})`);
  if (signature.length && result.phoneBackground !== result.passwordBackground) failures.push(`${slug}: экраны номера и пароля имеют разные поверхности (${result.phoneBackground} / ${result.passwordBackground})`);
  if (enforceVkBlue && result.phonePrimaryColor !== 'rgb(0, 119, 255)') failures.push(`${slug}: кнопка первого шага не VK-синяя (${result.phonePrimaryColor})`);
  if (enforceVkBlue && !['#0077ff', 'rgb(0, 119, 255)'].includes(result.productAccent)) failures.push(`${slug}: продуктовый акцент не VK-синий (${result.productAccent})`);
  if (enforceVkBlue && result.exceptionalActionColors.some((color) => color !== 'rgb(0, 119, 255)')) failures.push(`${slug}: локальная action-кнопка перетирает VK-синий (${result.exceptionalActionColors.join(', ')})`);
  if (enforceVkBlue && result.primaryColor !== 'rgb(0, 119, 255)') failures.push(`${slug}: основная auth-кнопка не VK-синяя (${result.primaryColor})`);
  if (enforceVkBlue && result.backColor !== 'rgb(0, 119, 255)') failures.push(`${slug}: auth-навигация не VK-синяя (${result.backColor})`);
  if (!result.dvorHasStartLogo) failures.push(`${slug}: на стартовом экране входа потерян логотип`);
  if (result.dvorComponentMisses.length) failures.push(`${slug}: внутренние auth-экраны не переиспользуют компоненты Двора (${result.dvorComponentMisses.join(', ')})`);
  if (result.dvorInternalLogos.length) failures.push(`${slug}: логотип остался на внутренних auth-экранах (${result.dvorInternalLogos.join(', ')})`);
  if (result.dvorGenericLeaks.length) failures.push(`${slug}: на внутренних auth-экранах остались общие компоненты (${result.dvorGenericLeaks.join(', ')})`);
  if (result.internalAuthLogos.length) failures.push(`${slug}: логотип должен быть только на стартовом экране (${result.internalAuthLogos.join(', ')})`);
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(`auth visual: FAIL · индивидуальных auth-паттернов ${custom}`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}
console.log(`auth visual: OK · индивидуальных auth-паттернов ${custom}`);
