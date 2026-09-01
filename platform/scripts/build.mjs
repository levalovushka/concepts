#!/usr/bin/env node
/**
 * Сборка одного концепта: спека + экраны + ядро → самодостаточный index.html.
 *
 *   node scripts/build.mjs petlya
 *
 * Артефакт монолитный намеренно: открывается по file://, отдаётся
 * разработчикам как есть, деплоится копированием.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { KERNEL, DIST, conceptDir, readSpec, readMarkup, validateUiMarkup, engineData, fill, esc, RISK_LABEL, POSITIONING_MODES, listConcepts } from './lib.mjs';
import { screenGraph, iaTree, transitionTable, screenActionsHtml } from './screen-map.mjs';
import { archetypeFor } from './concept-quality.mjs';
import { renderMarkdown } from './markdown.mjs';

const read = (f) => readFileSync(f, 'utf8');

/*
 * Единый auth-контракт HTML-прототипов. Старые phone → code →
 * codefail больше не попадают в сборку. `auth.entryTarget` в concept.json
 * задаёт первый экран после создания аккаунта.
 */
const LEGACY_AUTH = new Set(['code', 'codefail']);
const FORM_STATES = ['default', 'loading', 'empty', 'error'];
/* UI-контракт исходных concept.json исторически называет это denied;
   ux-spec канонизирует имя в permission для внешних потребителей. */
const CONTENT_STATES = [...FORM_STATES, 'offline', 'denied'];

const firstGoOutsideAuth = (html = '') => [...html.matchAll(/data-go="([a-z]+)"/g)]
  .map((match) => match[1]).find((id) => !LEGACY_AUTH.has(id) && id !== 'phone');

const registrationIcon = (spec) => spec.iconPlaceholder
  ? '<span class="auth-app-icon app-icon-placeholder"></span>'
  : existsSync(join(conceptDir(spec.slug), 'assets', 'app-icon.png'))
  ? '<img class="auth-app-icon" src="assets/app-icon.png" alt="">'
  : spec.brand?.authIcon
  ? `<svg class="auth-brand-glyph" aria-hidden="true"><use href="#i-${esc(spec.brand.authIcon)}"/></svg>`
  : null;

const authLegalFooter = (spec) => {
  const host = spec.domain || `${spec.slug}.app`;
  return `<p class="auth-legal">Нажимая «Создать аккаунт», вы принимаете <button class="auth-legal-link" data-toast="Соглашение · ${host}/terms">пользовательское соглашение</button> и <button class="auth-legal-link" data-toast="Политика · ${host}/privacy">политику конфиденциальности</button>.</p><div class="auth-support"><button class="auth-support-link" data-toast="Справка · ${host}/help · support@${host}">Помощь и поддержка</button></div>`;
};

const authUsageFooter = (spec) => {
  const host = spec.domain || `${spec.slug}.app`;
  return `<p class="auth-legal">Продолжая, вы принимаете <button class="auth-legal-link" data-toast="Соглашение · ${host}/terms">пользовательское соглашение</button> и <button class="auth-legal-link" data-toast="Политика · ${host}/privacy">политику конфиденциальности</button>.</p>`;
};

const AUTH_SCREENS = ['phone', 'password', 'register', 'registerpassword', 'account', 'deleteaccount'];

const authBack = '<button class="unified-auth-back tap" data-back aria-label="Назад"><svg class="ios-back" viewBox="0 0 12 21" fill="none"><path d="M10.25 1.75L1.75 10.5l8.5 8.75" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Назад</span></button>';

const authField = ({ label, type, value, autocomplete }) => `<label class="unified-auth-field">
      <span>${label}</span>
      <input type="${type}" value="${value}" autocomplete="${autocomplete}" aria-label="${label}">
    </label>`;

const accountAuthScreens = (spec, target, light = true, sourceClasses = '') => {
  const surface = light ? ' ios-surface' : '';
  const inherited = sourceClasses.split(/\s+/).filter((name) => name && !['screen', 'is-on'].includes(name)).join(' ');
  const rootClass = `screen unified-auth auth-${spec.slug}${surface}${inherited ? ` ${inherited}` : ''}`;
  const icon = registrationIcon(spec) || '<span class="auth-app-icon app-icon-placeholder"></span>';
  const phone = authField({ label: 'Номер телефона', type: 'tel', value: '+7 900 123-45-67', autocomplete: 'tel' });
  const password = authField({ label: 'Пароль', type: 'password', value: 'sotki2026', autocomplete: 'current-password' });
  const newPassword = authField({ label: 'Придумайте пароль', type: 'password', value: 'sotki2026', autocomplete: 'new-password' });
  const host = spec.domain || `${spec.slug}.app`;
  return {
    phone: `<div class="${rootClass}" id="scr-phone" data-pattern="auth"><div class="unified-auth-body">
      <div class="auth-mark" aria-hidden="true">${icon}</div>
      <h1>С возвращением</h1>
      <p class="unified-auth-lede">Введите номер телефона, чтобы продолжить в «${esc(spec.name)}».</p>
      ${phone}
      <div class="unified-auth-actions"><button class="btn-filled tap" data-primary data-go="password">Далее</button>
      <button class="unified-auth-link tap" data-go="register">Создать аккаунт</button>
      <button class="unified-auth-link tap" data-auth-target data-go="${target}">Продолжить без аккаунта</button>
      ${authUsageFooter(spec)}</div>
      <button class="unified-auth-help tap" data-toast="Справка · ${host}/help · support@${host}">Помощь и поддержка</button>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
    password: `<div class="${rootClass}" id="scr-password" data-pattern="auth"><div class="unified-auth-body">${authBack}
      <h1>Пароль</h1><p class="unified-auth-lede">Аккаунт +7 900 123-45-67</p>${password}
      <div class="unified-auth-actions"><button class="btn-filled tap" data-primary data-auth-target data-go="${target}">Войти</button>
      <button class="unified-auth-link tap" data-toast="Ссылка для восстановления отправлена">Забыли пароль?</button></div>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
    register: `<div class="${rootClass}" id="scr-register" data-pattern="auth"><div class="unified-auth-body">${authBack}
      <h1>Создать аккаунт</h1><p class="unified-auth-lede">Номер нужен для входа и восстановления доступа. Пользоваться приложением можно и без аккаунта.</p>${phone}
      <div class="unified-auth-actions"><button class="btn-filled tap" data-primary data-go="registerpassword">Далее</button>
      <button class="unified-auth-link tap" data-go="phone">Уже есть аккаунт? Войти</button></div>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
    registerpassword: `<div class="${rootClass}" id="scr-registerpassword" data-pattern="auth"><div class="unified-auth-body">${authBack}
      <h1>Придумайте пароль</h1><p class="unified-auth-lede">Для аккаунта +7 900 123-45-67</p>${newPassword}
      <div class="unified-auth-actions"><button class="btn-filled tap" data-primary data-auth-target data-go="${target}">Создать аккаунт</button>${authLegalFooter(spec)}</div>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
    account: `<div class="${rootClass}" id="scr-account"><div class="unified-auth-body">${authBack}
      <h1 class="unified-account-title">Профиль и аккаунт</h1><div class="unified-account-card"><div><span>Телефон</span><strong>+7 900 123-45-67</strong></div>
      <button class="unified-auth-link tap" data-go="phone">Выйти</button>
      <button class="unified-auth-danger tap" data-primary data-go="deleteaccount">Удалить аккаунт</button></div>
      <p class="unified-auth-note">Без аккаунта основные функции приложения останутся доступны.</p>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
    deleteaccount: `<div class="${rootClass}" id="scr-deleteaccount"><div class="unified-auth-body">${authBack}
      <h1>Удалить аккаунт?</h1><p class="unified-auth-lede">Профиль и связанные с ним данные будут удалены. Это действие нельзя отменить.</p>
      <div class="unified-auth-actions"><button class="unified-delete-confirm tap" data-primary data-go="phone">Удалить аккаунт</button>
      <button class="unified-auth-link tap" data-back>Отмена</button></div>
    </div><div class="home-ind" aria-hidden="true"></div></div>`,
  };
};

function installRegistrationIcon(source, spec) {
  const appIcon = registrationIcon(spec);
  if (!appIcon) return source;
  if (spec.slug === 'set' && /class="[^"]*\bcx-wordmark\b/.test(source)) {
    return source.replace(
      /(<span[^>]*class="[^"]*\bcx-wordmark\b[^"]*"[^>]*>)\s*<i[^>]*><\/i>/,
      `$1${appIcon}`,
    );
  }
  const logoClasses = [
    'auth-mark', 'db-logo', 'lx-logo', 'lk-logo', 'rd-mark', 'sc-logo',
    'sm-login-brand', 'st-auth-logo', 'tl-auth-mark', 'td-auth-mark',
  ];
  let out = source;
  for (const className of logoClasses) {
    const logo = new RegExp(`<([a-z]+)([^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*)>[\\s\\S]*?<\\/\\1>`);
    if (!logo.test(out)) continue;
    out = out.replace(logo, `<$1$2>${appIcon}</$1>`);
    break;
  }
  if (spec.slug === 'today') {
    out = out.replace(/<div[^>]*class="[^"]*\btd-logo\b[^"]*"[^>]*>[\s\S]*?<\/div>/, '');
  }
  return out;
}

/* Меняем только семантику auth-формы, а её классы, композицию и брендовый
   copy оставляем концепту. */
function adaptRegistrationScreen(source, target, spec) {
  let out = source.replace(/id="scr-phone"/, 'id="scr-phone" data-pattern="auth"');
  out = out.replace(/<(button|div)(?=[^>]*(?:class="[^"]*(?:google|auth-apple)[^"]*"|data-activate="applesignin\|[^"]+"))[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<([a-z]+)([^>]*data-go="code"[^>]*)>[\s\S]*?<\/\1>/, (match, tag, attrs) => {
    const clean = attrs.replace(/\sdata-go="code"/, '').replace(/\sdata-primary(?:="[^"]*")?/, '');
    return `<${tag}${clean} data-primary data-go="${target}">Создать аккаунт</${tag}>`;
  });
  out = out
    .replace(/<([a-z]+)([^>]*)>\s*\+7\s*<\/\1\s*>/g, '')
    .replace(/type="tel"/g, 'type="email"')
    .replace(/inputmode="tel"/g, 'inputmode="email"')
    .replace(/type="text" value="\+?7?\s?900[^\"]*"/g, 'type="email" value="alex@inbox.ru"')
    .replace(/value="900[^\"]*"/g, 'value="alex@inbox.ru"')
    .replace(/\breadonly\b/g, '')
    .replace(/aria-label="Номер телефона"/g, 'aria-label="Электронная почта"')
    .replace(/<input([^>]*aria-label="Электронная почта"[^>]*)>/g, (match, attrs) => {
      let next = /class="/.test(attrs)
        ? attrs.replace(/class="([^"]*)"/, 'class="$1 auth-email-input"')
        : `${attrs} class="auth-email-input"`;
      if (!/\stype="/.test(next)) next = ` type="email"${next}`;
      return `<input${next}>`;
    })
    .replace(/Номер телефона/g, 'Электронная почта')
    .replace(/\+7\s?900\s?123-45-67/g, 'alex@inbox.ru')
    .replace(/900\s?123-45-67/g, 'alex@inbox.ru')
    .replace(/701\s?456-21-08/g, 'alex@inbox.ru')
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, 'alex@inbox.ru')
    .replace(/Пришлём код в (?:SMS|письме)\.[^<]*/g, 'Почта создаст аккаунт сразу, без OTP и подтверждения.')
    .replace(/Код придёт письмом\.[^<]*/g, 'Аккаунт создастся сразу; письмо ждать не нужно.')
    .replace(/Войдите по номеру/g, 'Создайте аккаунт по почте')
    .replace(/Войдите по почте/g, 'Создайте аккаунт по почте')
    .replace(/Войдите, чтобы/g, 'Создайте аккаунт, чтобы')
    .replace(/Номер сохранит/g, 'Почта сохранит')
    .replace(/Пришлём SMS\.[^<]*/g, 'Без OTP и подтверждения почты.')
    .replace(/<h1([^>]*)>Вход<\/h1>/g, '<h1$1>Регистрация</h1>')
    .replace(/Войдите в /g, 'Регистрация в ')
    .replace(/Вход в «/g, 'Регистрация в «');
  if (!/<input\b[^>]*type="email"/.test(out)) {
    out = out.replace(/<(span|b|strong)([^>]*)>alex@inbox\.ru<\/\1>/, (match, tag, attrs) => {
      const next = /class="/.test(attrs)
        ? attrs.replace(/class="([^"]*)"/, 'class="$1 auth-email-input"')
        : `${attrs} class="auth-email-input"`;
      return `<input${next} type="email" value="alex@inbox.ru" autocomplete="email" aria-label="Электронная почта">`;
    });
  }
  if (spec.slug !== 'dvor') {
    out = out.replace(/<([a-z]+)([^>]*class="[^"]*(?:auth-legal|db-legal|lk-auth-note|lx-legal2|sc-legal|tl-auth-legal|t-footnote)[^"]*"[^>]*)>[\s\S]*?<\/\1>/gi, '');
    if (/class="auth-links"/.test(out)) {
      out = out.replace(/<div class="auth-links">[\s\S]*?<\/div>/, authLegalFooter(spec));
    } else {
      const footer = authLegalFooter(spec);
      if (spec.slug === 'set') {
        out = out.replace('</small></div></div><div class="home-ind"', `</small>${footer}</div></div><div class="home-ind"`);
      } else {
        out = out.replace('<div class="home-ind"', `${footer}<div class="home-ind"`);
      }
    }
  }
  return installRegistrationIcon(out, spec);
}

/* Концепты с собственной композицией входа сохраняют исходный DOM и CSS.
   Меняем только продуктовую семантику: телефон → пароль, гостевой проход,
   регистрация и юридические ссылки. */
const CUSTOM_AUTH = new Set([
  'double', 'dvor', 'liga', 'looks', 'radius', 'scene',
  'set', 'shellac', 'strochka', 'tails', 'today',
]);

const removeClassElement = (html, className) => html.replace(
  new RegExp(`<([a-z]+)([^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*)>[\\s\\S]*?<\\/\\1>`, 'gi'),
  '',
);

function customPhoneAuthScreen(source, target, spec) {
  const host = spec.domain || `${spec.slug}.app`;
  let out = source
    .replace(/class="([^"]*)\bis-on\b\s*([^"]*)"/, 'class="$1$2"')
    .replace(/id="scr-phone"/, 'id="scr-phone" data-pattern="auth"')
    .replace(/<div class="auth-links">[\s\S]*?<\/div>/g, '')
    .replace(/<(button|div)(?=[^>]*(?:class="[^"]*(?:google|auth-apple)[^"]*"|data-activate="applesignin\|[^"]+"))[^>]*>[\s\S]*?<\/\1>/gi, '');

  const legalClasses = {
    double: ['db-legal'], dvor: ['center'], liga: ['lx-legal2'], looks: ['lk-auth-note'],
    radius: ['rd-legal'], scene: ['sc-legal'], tails: ['tl-auth-legal'],
  }[spec.slug] || [];
  legalClasses.forEach((className) => { out = removeClassElement(out, className); });

  out = out
    .replace(/Электронная почта/g, 'Номер телефона')
    .replace(/Войдите по почте/g, 'Войдите по номеру')
    .replace(/Почта нужна/g, 'Номер нужен')
    .replace(/Почта сохранит/g, 'Номер сохранит')
    .replace(/почта нужна/g, 'номер нужен')
    .replace(/Пришлём код в письме\.[^<]*/g, 'Пароль вводится на следующем экране.')
    .replace(/Код придёт письмом\.[^<]*/g, 'Пароль вводится на следующем экране.')
    .replace(/Пришлём SMS\.[^<]*/g, 'Пароль вводится на следующем экране. ')
    .replace(/type="email"/g, 'type="tel"')
    .replace(/type="text"/g, 'type="tel"')
    .replace(/inputmode="email"/g, 'inputmode="tel"')
    .replace(/\sreadonly\b/g, '')
    .replace(/value="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"/gi, 'value="+7 900 123-45-67"')
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '+7 900 123-45-67')
    .replaceAll('#i-mail', '#i-phone');

  if (spec.slug === 'double') {
    out = out.replace(
      /<div class="db-phone">[\s\S]*?<\/div>/,
      '<div class="db-phone"><input class="auth-phone-input" type="tel" value="+7 900 123-45-67" autocomplete="tel" aria-label="Номер телефона"></div>',
    );
  }
  if (spec.slug === 'scene') {
    out = out.replace(
      /<div><b>\+7<\/b><i><\/i><strong>900 123-45-67<\/strong><\/div>/,
      '<div><input class="auth-phone-input" type="tel" value="+7 900 123-45-67" autocomplete="tel" aria-label="Номер телефона"></div>',
    );
  }

  if (spec.slug === 'set') {
    out = out.replace(
      'data-back aria-label="Закрыть"',
      `data-auth-target data-go="${target}" aria-label="Продолжить без аккаунта"`,
    );
  }

  if (!/<input\b[^>]*type="tel"/i.test(out)) {
    out = out.replace(
      /<(span|b|strong)([^>]*)>\s*\+7\s*900\s*123-45-67\s*<\/\1>/,
      '<$1$2><input class="auth-phone-input" type="tel" value="+7 900 123-45-67" autocomplete="tel" aria-label="Номер телефона"></$1>',
    );
  }
  out = out.replace(/<input([^>]*)>/, (match, attrs) => {
    let next = attrs;
    if (!/\stype=/.test(next)) next += ' type="tel"';
    if (!/\sautocomplete=/.test(next)) next += ' autocomplete="tel"';
    return `<input${next}>`;
  });

  const secondary = `<div class="unified-auth-secondary-cluster">
    <button class="unified-auth-link tap" data-go="register">Создать аккаунт</button>
    <button class="unified-auth-link tap" data-auth-target data-go="${target}">Продолжить без аккаунта</button>
    ${authUsageFooter(spec)}
    <button class="unified-auth-help tap" data-toast="Справка · ${host}/help · support@${host}">Помощь и поддержка</button>
  </div>`;
  out = out.replace(/<([a-z]+)([^>]*data-go="code"[^>]*)>[\s\S]*?<\/\1>/, (match, tag, attrs) => {
    const clean = attrs.replace(/\sdata-go="code"/, '').replace(/\sdata-primary(?:="[^"]*")?/, '');
    return `<${tag}${clean} data-primary data-go="password">Далее</${tag}>${secondary}`;
  });
  return installRegistrationIcon(out, spec);
}

function applyLegalSafeguards(spec, sourceMarkup) {
  const markup = { ...sourceMarkup };
  if (spec.slug === 'tails') {
    markup.pet = markup.pet
      .replace('>Здоровье<', '>Документы и наблюдения<')
      .replace('>Заметка о самочувствии<', '>Наблюдение владельца<');
    markup.lock = markup.lock
      .replace('>Диагнозы и назначения<', '>Документы из клиники<');
    markup.vetnote = markup.vetnote
      .replace('>Заметка о самочувствии<', '>Наблюдение владельца<')
      .replace('<div class="body-scroll tl-list">', '<div class="body-scroll tl-list"><div class="tl-fallback" style="display:block;background:#eef6ff;color:#435267">Это личные записи владельца, а не диагноз или рекомендация по лечению. При симптомах обратитесь к ветеринару.</div>');
    markup.vaccine = markup.vaccine
      .replace('<div class="body-scroll tl-list">', '<div class="body-scroll tl-list"><div class="tl-fallback" style="display:block;background:#eef6ff;color:#435267">Сроки переписаны из ветпаспорта. Схему вакцинации и препараты подтверждает ветеринар.</div>')
      .replace('>Надиктовать заметку о самочувствии<', '>Добавить наблюдение владельца<')
      .replace('доза Bravecto считается от 20 до 40 кг', 'вес записан на приёме; назначения хранит клиника');
  }
  if (spec.slug === 'rasklad') {
    for (const id of ['home', 'deck', 'profile', 'phone']) {
      if (!markup[id]) continue;
      markup[id] = markup[id]
        .replaceAll('прогресс по колоде', 'история колоды')
        .replaceAll('Прогресс по колоде', 'История колоды')
        .replaceAll('серия размышлений', 'подборка размышлений');
    }
  }
  if (spec.slug === 'double') {
    for (const id of Object.keys(markup)) {
      markup[id] = markup[id]
        .replaceAll('Прогресс', 'История')
        .replaceAll('прогрессе', 'истории')
        .replaceAll('ПРОДОЛЖИТЬ · ДЕНЬ 4', 'ПРОДОЛЖИТЬ')
        .replaceAll('5 дней подряд', 'История практики')
        .replaceAll('Напоминать о серии', 'Напомнить о практике')
        .replaceAll('Серия останется', 'История останется');
    }
    const progress = spec.screens.find((screen) => screen.id === 'progress');
    if (progress) {
      progress.title = 'История';
      if (progress.ui?.primaryAction === 'Напоминать о серии') progress.ui.primaryAction = 'Напомнить о практике';
    }
    const tab = spec.tabs?.find((item) => item.id === 'progress');
    if (tab) tab.label = 'История';
  }
  return markup;
}

export function prepareEmailRegistration(sourceSpec, sourceMarkup) {
  const spec = structuredClone(sourceSpec);
  const target = spec.auth?.entryTarget || firstGoOutsideAuth(sourceMarkup.code)
    || (sourceSpec.start === 'phone' ? null : sourceSpec.start);
  if (!target || !sourceSpec.screens.some((screen) => screen.id === target)) {
    throw new Error(`${spec.slug}: auth.entryTarget не задан и не выводится из legacy auth`);
  }
  spec.auth = {
    mode: 'phone-password', confirmation: false, optional: true, entryTarget: target,
    accountDeletion: { available: true, confirmationRequired: true },
    scope: 'camouflage', targetServiceTransition: false,
    consent: { action: 'Создать аккаунт', documents: ['terms', 'privacy'], loggingRequired: true },
  };
  spec.permissions = spec.permissions.filter((permission) => permission.key !== 'applesignin');

  const sourcePhone = spec.screens.find((screen) => screen.id === 'phone');
  const accountSurfaceId = ['settings', 'menu', 'profile'].find((id) => sourceSpec.screens.some((screen) => screen.id === id))
    || (spec.slug === 'ptitsy' ? 'season' : spec.slug === 'volna' ? 'library' : null);
  const darkAuth = new Set(['liga', 'radius', 'scene', 'set', 'shellac', 'strochka']);
  const authLight = darkAuth.has(spec.slug) ? false : sourcePhone?.light ?? true;
  const sourceAuthClasses = sourceMarkup.phone?.match(/<div class="([^"]*)"[^>]*id="scr-phone"/)?.[1] || '';
  const cases = spec.uiContractVersion >= 3
    ? [
      { kind: 'typical', example: 'Корректный российский номер телефона' },
      { kind: 'stress', example: 'Номер вставлен с пробелами и скобками' },
      { kind: 'failure', example: 'Номер или пароль неверен либо сеть недоступна' },
    ]
    : ['Корректный российский номер телефона', 'Номер вставлен с пробелами и скобками', 'Номер или пароль неверен либо сеть недоступна'];
  const authScreen = (id, title, purpose, primaryAction, parent = null) => ({
    ...(id === 'phone' ? sourcePhone || {} : {}), id, title,
    type: id === 'phone' ? 'старт, без таб-бара' : 'push, без таб-бара', light: authLight,
    ...(parent ? { parent } : {}),
    meta: 'Телефон и пароль · аккаунт опционален',
    ui: {
      pattern: id === 'account' || id === 'deleteaccount' ? 'account' : 'auth', navigation: 'push', purpose, primaryAction,
      hierarchy: { primary: title, secondary: 'Альтернативное действие и понятный возврат' },
      states: id === 'account' || id === 'deleteaccount' ? [...CONTENT_STATES] : [...FORM_STATES], density: 'low', contentCases: cases,
    },
  });
  const generatedScreens = [
    authScreen('phone', 'Вход по номеру', 'Ввести телефон или продолжить без аккаунта', 'Далее'),
    authScreen('password', 'Пароль', 'Ввести пароль отдельно от номера телефона', 'Войти', 'phone'),
    authScreen('register', 'Создать аккаунт', 'Начать отдельную ветку регистрации по номеру телефона', 'Далее', 'phone'),
    authScreen('registerpassword', 'Пароль нового аккаунта', 'Создать пароль отдельно от ввода номера', 'Создать аккаунт', 'register'),
    authScreen('account', 'Аккаунт', 'Управлять сессией и удалением аккаунта', 'Удалить аккаунт', 'password'),
    authScreen('deleteaccount', 'Удаление аккаунта', 'Подтвердить необратимое удаление аккаунта', 'Удалить аккаунт', 'account'),
  ];
  spec.screens = spec.screens.filter((screen) => !AUTH_SCREENS.includes(screen.id) && !LEGACY_AUTH.has(screen.id));
  spec.screens.unshift(...generatedScreens);
  spec.screens.forEach((screen) => { if (LEGACY_AUTH.has(screen.parent)) screen.parent = 'phone'; });
  spec.start = 'phone';

  spec.permissions.forEach((permission) => {
    if (LEGACY_AUTH.has(permission.screen)) permission.screen = 'phone';
    if (LEGACY_AUTH.has(permission.target)) permission.target = target;
  });

  const replacement = (id) => LEGACY_AUTH.has(id) ? target : id;
  if (spec.product?.verticalSlice) {
    const slice = spec.product.verticalSlice;
    slice.entry = 'phone'; slice.action = replacement(slice.action); slice.result = replacement(slice.result);
    if (slice.action === slice.entry) slice.action = target;
    if (slice.result === slice.action || slice.result === slice.entry) {
      slice.result = spec.screens.find((screen) => ![slice.entry, slice.action].includes(screen.id))?.id || slice.result;
    }
  }
  if (spec.positioning?.evidenceScreens) {
    spec.positioning.evidenceScreens = [...new Set(spec.positioning.evidenceScreens.map(replacement))];
    for (const screen of spec.screens) {
      if (spec.positioning.evidenceScreens.length >= 3) break;
      if (!spec.positioning.evidenceScreens.includes(screen.id)) spec.positioning.evidenceScreens.push(screen.id);
    }
  }
  for (const row of spec.positioning?.referenceEvidence || []) row.screen = replacement(row.screen);

  for (const action of spec.product?.world?.actions || []) {
    if (action.screen) action.screen = replacement(action.screen);
  }
  for (const scenario of spec.acceptance || []) {
    scenario.screens = [...new Set((scenario.screens || []).map(replacement))];
  }

  spec.prototypes = (spec.prototypes || []).map((prototype) => {
    const sourceScreens = prototype.screens || [];
    const startsWithAuth = prototype.start === 'phone' || LEGACY_AUTH.has(prototype.start);
    const carriesAuth = sourceScreens.some((id) => id === 'phone' || LEGACY_AUTH.has(id));
    let remaining = sourceScreens.filter((id) => !AUTH_SCREENS.includes(id) && !LEGACY_AUTH.has(id));
    const firstProductScreen = remaining[0] || target;

    /* Полный продукт по-прежнему показывает cold start, отдельный auth-срез —
       регистрацию. Остальные сценарии сохраняют исходные старт и состав: экран
       регистрации не должен подменять «Публикацию», «Разговор» или «Архив». */
    const carriesUnifiedAuth = prototype.hero || startsWithAuth || carriesAuth;
    if (carriesUnifiedAuth) {
      if (!remaining.includes(firstProductScreen)) remaining.push(firstProductScreen);
      remaining.unshift(...AUTH_SCREENS);
    } else if (accountSurfaceId && remaining.includes(accountSurfaceId)) {
      remaining.push(...AUTH_SCREENS);
    }
    const start = carriesUnifiedAuth ? 'phone' : prototype.start;

    const normalized = {
      ...prototype,
      start,
      screens: remaining,
      stops: (prototype.stops || []).filter((id) => !LEGACY_AUTH.has(id) && id !== 'phone'),
    };
    if (carriesUnifiedAuth || (accountSurfaceId && remaining.includes(accountSurfaceId))) normalized.authTarget = firstProductScreen;
    if (prototype.hero) {
      normalized.note = `${spec.screens.length} экранов и ${spec.permissions.length} доступов`;
    }
    if (!prototype.hero && prototype.id === 'signin') {
      normalized.label = 'Вход и регистрация';
      normalized.note = 'Телефон и пароль вводятся отдельно; аккаунт можно пропустить или удалить';
    }
    return normalized;
  });
  const prototypeShapes = new Set();
  spec.prototypes = spec.prototypes.filter((prototype) => {
    const shape = [...prototype.screens].sort().join('|');
    if (prototypeShapes.has(shape)) return false;
    prototypeShapes.add(shape);
    return true;
  });

  if (spec.appStore?.privacy && !spec.appStore.privacy.some((row) => /Phone Number/i.test(row.apple || ''))) {
    spec.appStore.privacy.push({ type: 'Номер телефона', apple: 'Contact Info → Phone Number', linked: true, tracking: false, why: 'Опциональные вход, регистрация и восстановление доступа' });
  }
  if (spec.appStore?.reviewAccount) spec.appStore.reviewAccount = {
    phone: '+7 900 123-45-67', password: 'review2026',
    note: 'Телефон и пароль вводятся на разных экранах. Продукт доступен и через «Продолжить без аккаунта».',
  };
  for (const row of spec.backendless || []) {
    if (/вход|регистрац/i.test(row.needs || '')) {
      row.needs = 'Опциональные вход и регистрация по номеру телефона';
      row.solution = 'SDK провайдера аутентификации, пароль и токен сессии в Keychain';
    }
  }
  for (const permission of spec.permissions || []) {
    if (permission.key === 'keychain' && permission.grounding) {
      permission.grounding = permission.grounding.replace(/входа по номеру/gi, 'сессии аккаунта');
    }
  }

  let markup = { ...sourceMarkup, ...accountAuthScreens(spec, target, authLight, sourceAuthClasses) };
  if (CUSTOM_AUTH.has(spec.slug) && sourceMarkup.phone) {
    markup.phone = customPhoneAuthScreen(sourceMarkup.phone, target, spec);
  }
  if (accountSurfaceId && markup[accountSurfaceId]) {
    markup[accountSurfaceId] = markup[accountSurfaceId]
      .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '+7 900 123-45-67')
      .replaceAll('вход по почте, код приходит письмом', 'вход по номеру и паролю')
      .replaceAll('Вход с Apple привязан к этому аккаунту', 'Пароль можно изменить в управлении аккаунтом')
      .replaceAll('Привязать вход с Apple', 'Изменить пароль')
      .replaceAll('Вход с Apple', 'Пароль аккаунта')
      .replaceAll('не привязан · привяжите, чтобы входить без письма', 'используется для входа после номера телефона')
      .replaceAll('>Привязать<', '>Изменить<')
      .replaceAll('#i-mail', '#i-phone')
      .replaceAll('#i-apple', '#i-lock');
    const accountEntry = `<section class="unified-settings-account" aria-label="Профиль и аккаунт"><div><span>Профиль и аккаунт</span><strong>+7 900 123-45-67</strong></div><button class="tap" data-go="account">Открыть</button></section>`;
    if (accountSurfaceId === 'settings' || accountSurfaceId === 'menu') {
      markup[accountSurfaceId] = /<div class="body-scroll[^>]*>/.test(markup[accountSurfaceId])
        ? markup[accountSurfaceId].replace(/(<div class="body-scroll[^>]*>)/, `$1${accountEntry}`)
        : markup[accountSurfaceId].replace('<div class="home-ind"', `${accountEntry}<div class="home-ind"`);
    } else if (accountSurfaceId === 'profile') {
      markup.profile = markup.profile.replace(/<(button|div)([^>]*)>\s*<svg([^>]*)><use href="#i-settings"/, (match, tag, attrs, svgAttrs) => {
        const clean = attrs.replace(/\sdata-toast="[^"]*"/, '').replace(/\sdata-go="[^"]*"/, '');
        return `<${tag}${clean} data-go="account"><svg${svgAttrs}><use href="#i-settings"`;
      });
      markup.profile = markup.profile.replace(/<(button|div)([^>]*aria-label="Настройки"[^>]*)>/, (match, tag, attrs) => {
        const clean = attrs.replace(/\sdata-toast="[^"]*"/, '').replace(/\sdata-go="[^"]*"/, '');
        return `<${tag}${clean} data-go="account">`;
      });
      if (!/data-go="account"/.test(markup.profile)) markup.profile = markup.profile.replace('data-go="phone" aria-label=', 'data-go="account" aria-label=');
      if (!/data-go="account"/.test(markup.profile) && /class="settings-list"/.test(markup.profile)) {
        markup.profile = markup.profile.replace('<div class="settings-list">', '<div class="settings-list"><button data-go="account"><span class="setting-icon"><svg><use href="#i-user"/></svg></span><span><strong>Профиль и аккаунт</strong><small>Телефон, выход и удаление</small></span><svg><use href="#i-chevron-right"/></svg></button>');
      }
      if (!/data-go="account"/.test(markup.profile) && spec.slug === 'rasklad') {
        markup.profile = markup.profile.replace('<div class="list-stack tight">', `<div class="list-stack tight">${accountEntry}`);
      }
      if (!/data-go="account"/.test(markup.profile) && spec.slug === 'seans') {
        markup.profile = markup.profile.replace('</div>\n  </div>\n\n  <div class="body-scroll', '<div class="se-act tap" data-go="account" aria-label="Аккаунт"><svg class="ico-svg"><use href="#i-settings"/></svg></div></div>\n  </div>\n\n  <div class="body-scroll');
      }
    } else if (spec.slug === 'ptitsy') {
      markup.season = markup.season.replace('<div class="icon-btn tap" data-go="releases"', '<div class="icon-btn tap" data-go="account" aria-label="Аккаунт"><svg class="ico-svg"><use href="#i-settings"/></svg></div><div class="icon-btn tap" data-go="releases"');
    } else if (spec.slug === 'volna') {
      markup.library = markup.library.replace('<button class="vl-icon tap" data-go="import"', '<button class="vl-icon tap" data-go="account" aria-label="Аккаунт"><svg><use href="#i-settings"/></svg></button><button class="vl-icon tap" data-go="import"');
    }
  }
  delete markup.code; delete markup.codefail;
  markup = applyLegalSafeguards(spec, markup);

  /* Один и тот же контракт используют витрина и ux-spec: формы получают
     inline-состояния полей, контентные экраны — ещё offline и permission. */
  for (const screen of spec.screens) {
    const html = markup[screen.id] || '';
    const isForm = screen.ui?.pattern === 'auth'
      || /<(?:form|textarea|select)\b|contenteditable|<input\b(?![^>]*type="search")/i.test(html);
    const extraStates = (screen.ui?.states || []).filter((state) => state === 'success');
    screen.ui = {
      ...(screen.ui || {}),
      states: isForm ? [...FORM_STATES] : [...new Set([...CONTENT_STATES, ...extraStates])],
    };
  }
  return { spec, markup };
}

/* ——— генерируемые из спеки блоки страницы ——— */

const permMatrix = (spec) => `<div class="table-wrap">
  <table class="doc-table">
    <thead><tr><th>Ключ</th><th>Жест пользователя</th><th>Экран</th><th>Если отказ</th><th>Риск Review</th></tr></thead>
    <tbody>
${spec.permissions.map((p) => {
  const risk = p.conditional
    ? `<strong>Условный</strong> — ${esc(p.requires)}`
    : RISK_LABEL[p.risk] || p.risk;
  return `      <tr><td><code>${esc(p.plist)}</code></td><td>${esc(p.gesture)}</td><td>${esc(titleOf(spec, p.screen))}</td><td>${esc(p.fallback)}</td><td>${risk}</td></tr>`;
}).join('\n')}
    </tbody>
  </table>
</div>`;

const backendlessTable = (spec) => `<div class="table-wrap">
  <table class="doc-table">
    <thead><tr><th>Нужно было бы серверу</th><th>Решение без сервера</th></tr></thead>
    <tbody>
${spec.backendless.map((b) => `      <tr><td>${b.needs}</td><td>${b.solution}</td></tr>`).join('\n')}
    </tbody>
  </table>
</div>`;

const screenTable = (spec) => `<div class="table-wrap">
  <table class="doc-table">
    <thead><tr><th>Экран</th><th>Тип</th><th>Доступы</th></tr></thead>
    <tbody>
${spec.screens.map((s) => {
  const on = spec.permissions.filter((p) => p.screen === s.id)
    .map((p) => p.key + (p.activate ? ' (activate)' : '')).join(', ') || '—';
  return `      <tr><td>${s.id}</td><td>${esc(s.type)}</td><td>${esc(on)}</td></tr>`;
}).join('\n')}
    </tbody>
  </table>
</div>`;

const featGrid = (spec) => `<div class="feat-grid">
${spec.permissions.map((p) =>
  `  <div class="feat"><b>${esc(p.feature)}</b><span>${esc(p.grounding || '')}<code> ${esc(p.plist)}</code></span></div>`
).join('\n')}
</div>`;

const productContract = (spec) => {
  const titles = Object.fromEntries(spec.screens.map((screen) => [screen.id, screen.title]));
  const slice = spec.product.verticalSlice;
  const archetype = archetypeFor(spec.targetSet);
  const referencePatterns = (spec.positioning.referencePatterns || []).map((id) => archetype?.patterns[id] || id);
  return `<div class="product-contract">
  <div class="product-facts">
    <div><b>Стратегия</b><span>${esc(POSITIONING_MODES[spec.positioning.mode].label)}</span></div>
    <div><b>Категория</b><span>${esc(spec.appStore.category.primary)}</span></div>
    <div><b>Для кого</b><span>${esc(spec.product.audience)}</span></div>
    <div><b>Ситуация</b><span>${esc(spec.product.situation)}</span></div>
    <div><b>Проблема</b><span>${esc(spec.product.problem)}</span></div>
    <div><b>Обещание</b><span>${esc(spec.product.promise)}</span></div>
    <div><b>Отличие</b><span>${esc(spec.product.differentiator)}</span></div>
  </div>
  <div class="product-loop">
    <b>Ядровой цикл</b>
    <ol>${spec.product.coreLoop.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
    <b>Знакомые паттерны</b>
    <ul>${spec.positioning.familiarPatterns.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    <b>Отстройка</b>
    <ul>${spec.positioning.distinctions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    ${referencePatterns.length ? `<b>Паттерны референса</b><ul>${referencePatterns.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
    <b>Вертикальный срез</b>
    <ol><li>${esc(titles[slice.entry])}</li><li>${esc(titles[slice.action])}</li><li>${esc(titles[slice.result])}</li></ol>
    <b>Почему возвращаются</b>
    <ul>${spec.product.returnReasons.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    <b>Доказано экранами</b>
    <ul>${spec.positioning.evidenceScreens.map((id) => `<li>${esc(titles[id])}</li>`).join('')}</ul>
    <b>Не делаем</b>
    <ul>${spec.product.nonGoals.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
  </div>
</div>`;
};

const docId = (file) => file.replace(/\.md$/i, '').replace(/[^a-z0-9-]/gi, '-');

const docsLinks = (spec) =>
  (spec.docs || []).map((d, index) => `<button type="button" data-doc="${docId(d.file)}" aria-pressed="${index === 0}">${esc(d.label)}</button>`).join('\n      ') +
  `\n      <a class="zip" href="docs/${spec.slug}-docs.zip" download>Скачать все (ZIP)</a>`;

const docsContent = (spec, dir) => (spec.docs || []).map((doc, index) => {
  const file = join(dir, 'docs', doc.file);
  if (!existsSync(file)) throw new Error(`${spec.slug}: нет документа ${doc.file}`);
  return `<article class="doc-reader${index === 0 ? ' is-on' : ''}" data-doc-view="${docId(doc.file)}" aria-hidden="${index === 0 ? 'false' : 'true'}">
    ${renderMarkdown(read(file))}
  </article>`;
}).join('\n');

const titleOf = (spec, id) => spec.screens.find((s) => s.id === id)?.title || id;

/**
 * «Скачать все (ZIP)» должен содержать те же документы, что лежат рядом, плюс
 * скриншоты экранов папкой `screenshots/`: экраны в index.html живут разметкой,
 * а не картинками, поэтому унести кадр в презентацию или в тикет можно только
 * из архива. Пути внутри архива берутся от cwd, поэтому zip запускается из
 * каталога, содержимое которого попадёт в архив.
 */
function packDocs(slug, dir) {
  const docs = join(dir, 'docs');
  if (!existsSync(docs)) return;
  const zip = `${slug}-docs.zip`;
  try {
    rmSync(join(docs, zip), { force: true });
    execFileSync('zip', ['-q', zip, ...readdirSync(docs).filter((f) => f.endsWith('.md'))], { cwd: docs });
    const assets = join(dir, 'assets');
    if (existsSync(join(assets, 'screenshots'))) {
      execFileSync('zip', ['-r', '-q', join(docs, zip), 'screenshots'], { cwd: assets });
    }
  } catch {
    console.warn(`внимание: не удалось пересобрать ${zip} — нужен CLI zip`);
  }
}

/** Бренд-переопределения поверх нейтральных дефолтов ядра. */
const brandCss = (b) => `
/* —— бренд концепта —— */
:root { --accent:${b.accent}; --accent-fill:${b.accent}; }
@media (prefers-color-scheme: dark) { :root { --accent:${b.accentDark}; --accent-fill:${b.accent}; } }
:root[data-theme="dark"] { --accent:${b.accentDark}; --accent-fill:${b.accent}; }
:root[data-theme="light"] { --accent:${b.accent}; --accent-fill:${b.accent}; }`;

/* ——— прототипы ——— */

/**
 * Разметка экрана, привязанная к конкретному прототипу: ids уникальны на странице.
 * В сценарном срезе вкладки чужих разделов гасятся — они показывают, где мы,
 * но никуда не ведут. Любая другая утечка за границы сценария — ошибка сборки.
 */
function screenFor(proto, id, markup, own, isStop) {
  let out = markup.replace(/id="scr-([a-z]+)"/, `id="pr-${proto.id}-$1" data-screen="$1"`);
  if (proto.authTarget) out = out.replace(/data-auth-target data-go="[a-z]+"/g, `data-auth-target data-go="${proto.authTarget}"`);
  if (isStop) return asStop(out);
  if (!own) return out;
  return out.replace(/<div class="tabbar[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/, (bar) =>
    bar.replace(/<div class="([^"]*)"([^>]*?)\sdata-go="([a-z]+)"([^>]*)>/g, (m, cls, mid, target, tail) =>
      own.has(target) ? m : `<div class="${cls} is-off"${mid}${tail}>`));
}

/** Вкладки таб-бара, отключённые в срезе, не считаются переходами. */
/**
 * Убрать таб-бар из сценарного среза. Вкладки чужих разделов — структура
 * приложения, а не шаг сценария, и тянуть за собой весь продукт они не должны.
 * Разметка таб-бара в концептах разная: `div.tabbar`, `nav.tabbar`, `nav.xx-tabs`,
 * — поэтому вырезаем по балансу тегов, а не шаблоном.
 */
const stripTabbar = (markup) => {
  const re = /<(div|nav)\b[^>]*class="[^"]*(?:\btabbar\b|[a-z]+-tabs\b)[^"]*"[^>]*>/g;
  let out = markup, m;
  while ((m = re.exec(out))) {
    const tag = m[1];
    const open = new RegExp(`<${tag}\\b`, 'g');
    const close = new RegExp(`</${tag}>`, 'g');
    let depth = 1, i = m.index + m[0].length;
    while (depth > 0 && i < out.length) {
      open.lastIndex = i; close.lastIndex = i;
      const o = open.exec(out), c = close.exec(out);
      if (!c) break;
      if (o && o.index < c.index) { depth++; i = o.index + o[0].length; }
      else { depth--; i = c.index + c[0].length; }
    }
    out = out.slice(0, m.index) + out.slice(i);
    re.lastIndex = 0;
  }
  return out;
};

/**
 * Тупиковый экран сценария: показываем, куда ведёт строка, но дальше не пускаем.
 * Так срез остаётся замкнутым, не втягивая всё приложение.
 */
const asStop = (markup) => markup
  .replace(/ data-(?:go|jump|back|ask|activate|toast)="[^"]*"/g, '')
  .replace(/ class="([^"]*)\btap\b([^"]*)"/g, ' class="$1$2"');

/** Все цели переходов, встречающиеся в разметке экрана. */
function targetsIn(markup) {
  const out = [];
  const push = (v) => { if (v) out.push(v); };
  for (const m of markup.matchAll(/data-(?:go|jump)="([a-z]+)"/g)) push(m[1]);
  for (const m of markup.matchAll(/data-ask="[^"]*?\|([a-z]*)\|?([a-z]*)"/g)) { push(m[1]); push(m[2]); }
  for (const m of markup.matchAll(/data-activate="[^"|]*\|([a-z]+)"/g)) push(m[1]);
  for (const m of markup.matchAll(/data-toast="[^"|]*\|([a-z]+)"/g)) push(m[1]);
  return out;
}

const deviceShell = (proto, screensHtml, ledgerId) => `<div class="device" id="pr-${proto.id}" data-proto="${proto.id}" data-start="${proto.start}"${ledgerId ? ` data-ledger="${ledgerId}"` : ''}>
          <div class="status">
            <span>9:41</span>
            <span class="status-right" aria-hidden="true">
              <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="4.5" y="5" width="3" height="7" rx="0.5"/><rect x="9" y="2.5" width="3" height="9.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity=".35"/></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 3.6c2.1 0 4 1 5.3 2.5l-1.2 1.2A5.5 5.5 0 0 0 8 5.4c-1.5 0-2.9.6-3.9 1.6L2.9 5.8A7.6 7.6 0 0 1 8 3.6zm0 3.2c1.2 0 2.3.5 3.1 1.3L9.9 9.3A2.7 2.7 0 0 0 8 8.4c-.8 0-1.5.3-2 .8L4.9 8.1A4.5 4.5 0 0 1 8 6.8zM8 10.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor"><rect x="0" y="1" width="21" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="22" y="3.5" width="2" height="5" rx="0.6"/><rect x="2" y="3" width="15" height="6" rx="1"/></svg>
            </span>
          </div>
          <div class="screens">
${screensHtml}
          </div>
          <div class="prototype-state" aria-live="polite" aria-hidden="true">
            <div class="prototype-state-loading" aria-label="Загрузка">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="prototype-state-card">
              <span class="prototype-state-icon" aria-hidden="true"><svg class="ico-svg"><use href="#i-circle-alert"/></svg></span>
              <h2></h2><p></p>
              <button type="button" class="btn-filled" data-state-retry>Повторить</button>
            </div>
          </div>
          <div class="sysask">
            <div class="sysask-card" role="alertdialog" aria-modal="true">
              <div class="sysask-body">
                <div class="sysask-title"></div>
                <div class="sysask-text"></div>
              </div>
              <div class="sysask-actions">
                <button type="button" data-answer="deny">Запретить</button>
                <button type="button" data-answer="grant">Разрешить</button>
              </div>
            </div>
          </div>
          <div class="snackbar" role="status" aria-live="polite">
            <span class="snackbar-ok" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
            </span>
            <div class="snackbar-text"></div>
            <div class="snackbar-action">Настройки</div>
          </div>
        </div>`;

const controls = `<div class="controls">
          <button class="ctl" type="button" data-act="hints" aria-pressed="false">Показать, что нажимается</button>
          <button class="ctl" type="button" data-act="reset">Начать заново</button>
          <div class="state-controls" role="group" aria-label="Состояние экрана">
            <span>Состояние</span>
            <button class="ctl is-on" type="button" data-state="default" aria-pressed="true">Обычное</button>
            <button class="ctl" type="button" data-state="loading" aria-pressed="false">Загрузка</button>
            <button class="ctl" type="button" data-state="empty" aria-pressed="false">Пусто</button>
            <button class="ctl" type="button" data-state="error" aria-pressed="false">Ошибка</button>
            <button class="ctl" type="button" data-state="offline" aria-pressed="false">Офлайн</button>
            <button class="ctl" type="button" data-state="permission" aria-pressed="false">Доступ</button>
          </div>
        </div>`;

/* ——— сборка ——— */

export function build(slug, { outDir } = {}) {
  const sourceSpec = readSpec(slug);
  const dir = conceptDir(slug);

  const sourceMarkup = readMarkup(slug, sourceSpec);
  const { spec, markup } = prepareEmailRegistration(sourceSpec, sourceMarkup);
  validateUiMarkup(spec, markup);

  /* Карта экранов — из тех же байтов, что прототип. Экран, в который не ведёт
     ни один переход, в собранном файле выглядит полноценным: увидеть его можно
     только через раздел «Экраны», а пройти — никак. Это ошибка сборки. */
  const graph = screenGraph(spec, markup);
  if (graph.problems.length) {
    throw new Error(`${slug}: карта экранов не сходится —\n  · ` + graph.problems.join('\n  · '));
  }

  const protos = spec.prototypes || [];
  const hero = protos.find((p) => p.hero) || protos[0];
  if (!hero) throw new Error(`${slug}: в спеке нет ни одного прототипа`);

  /* Сценарный прототип обязан быть замкнут: переход в отсутствующий экран —
     это тупик, который в собранном файле уже не виден. */
  for (const p of protos) {
    const own = new Set(p.screens);
    const stops = new Set(p.stops || []);
    if (!own.has(p.start)) throw new Error(`${slug}/${p.id}: стартовый экран ${p.start} не входит в сценарий`);
    for (const s of stops) if (!own.has(s)) throw new Error(`${slug}/${p.id}: тупик ${s} не входит в сценарий`);
    if (stops.has(p.start)) throw new Error(`${slug}/${p.id}: стартовый экран не может быть тупиком`);
    const dangling = new Set();
    for (const id of p.screens) {
      if (!markup[id]) throw new Error(`${slug}/${p.id}: экрана ${id} нет в спеке`);
      if (stops.has(id)) continue;
      const bound = p.authTarget
        ? markup[id].replace(/data-auth-target data-go="[a-z]+"/g, `data-auth-target data-go="${p.authTarget}"`)
        : markup[id];
      const body = p.hero ? bound : stripTabbar(bound);
      for (const t of targetsIn(body)) if (!own.has(t)) dangling.add(`${id}→${t}`);
    }
    if (dangling.size) throw new Error(`${slug}/${p.id}: переходы за пределы сценария — ${[...dangling].join(', ')}`);
  }

  const heroDevice = deviceShell(hero, hero.screens.map((id) => screenFor(hero, id, markup[id])).join('\n\n'), 'perms')
    + '\n        ' + controls;

  const protoCards = protos.filter((p) => p !== hero).map((p) => `<div class="proto-card">
        <div class="proto-head">
          <div class="proto-label">${esc(p.label)}</div>
          <div class="proto-note">${esc(p.note || '')}</div>
        </div>
        ${deviceShell(p, p.screens.map((id) => screenFor(p, id, markup[id], new Set(p.screens), (p.stops || []).includes(id))).join('\n\n'))}
        <div class="proto-count is-zero">Доступы пока не запрашивались</div>
        ${controls}
      </div>`).join('\n      ');

  const styles = existsSync(join(dir, 'styles.css')) ? read(join(dir, 'styles.css')) : '';
  const rawSections = existsSync(join(dir, 'sections.html')) ? read(join(dir, 'sections.html')) : '';
  const hasAppIcon = existsSync(join(dir, 'assets', 'app-icon.png'));
  const useIconPlaceholder = Boolean(spec.iconPlaceholder);
  const grab = (name) => {
    const m = rawSections.match(new RegExp(`<!-- @overview:${name} -->([\\s\\S]*?)<!-- @end -->`));
    return m ? m[1].trim() : '';
  };
  const sections = rawSections.replace(/<!-- @overview:[a-z]+ -->[\s\S]*?<!-- @end -->/g, '').trim();
  const viewToggle = spec.targetSet === 'vk-video' ? `<div class="view-switch" data-view-switch role="group" aria-label="Размер устройства">
    <button type="button" data-view="phone" aria-pressed="true">Phone</button>
    <button type="button" data-view="ipad" aria-pressed="false">iPad</button>
  </div>` : '';

  const html = fill(read(join(KERNEL, 'page.html')), {
    NAME: esc(spec.name),
    SLUG: spec.slug,
    APP_ICON_HEAD: hasAppIcon && !useIconPlaceholder ? '<link rel="icon" type="image/png" href="assets/app-icon.png">' : '',
    APP_ICON_TOPBAR: useIconPlaceholder ? '<span class="topbar-app-icon app-icon-placeholder"></span>' : hasAppIcon ? `<img class="topbar-app-icon" src="assets/app-icon.png" alt="">` : '',
    HERO_TITLE: esc(spec.heroTitle || spec.name),
    TAGLINE_SENTENCE: esc(spec.heroDeck || spec.tagline),
    EYEBROW: esc(spec.eyebrow || spec.name),
    DECK: esc(spec.deck || spec.tagline),
    FONT_QUERY: spec.brand.fonts,
    CSS: [read(join(KERNEL, 'base.css')), brandCss(spec.brand), styles, read(join(KERNEL, 'tablet.css'))].join('\n'),
    ICON_SPRITE: read(join(KERNEL, 'icons.svg')).trim(),
    HERO_DEVICE: heroDevice,
    VIEW_TOGGLE: viewToggle,
    PROTO_CARDS: protoCards,
    VISION_BODY: grab('vision'),
    PRODUCT_CONTRACT: productContract(spec),
    ARCH_BODY: grab('arch'),
    DOCS_LINKS: docsLinks(spec),
    DOCS_CONTENT: docsContent(spec, dir),
    LEDGER_INTRO: `${spec.permissions.length} ключей. Каждый запрашивается в момент действия и стоит за фичей, которую видно в интерфейсе. Домен ссылок — только <code style="font-family:var(--mono);font-size:12px">${esc(spec.domain)}</code>.`,
    SECTIONS: sections,
    PERM_MATRIX: permMatrix(spec),
    BACKENDLESS: backendlessTable(spec),
    SCREEN_TABLE: screenTable(spec),
    IA_MAP: iaTree(graph),
    TRANSITIONS: transitionTable(graph),
    SCREEN_ACTIONS: screenActionsHtml(spec, markup),
    FEAT_GRID: featGrid(spec),
    TAGLINE: esc(spec.tagline),
    INSIGHT: esc(spec.insight),
    CONCEPT_DATA: JSON.stringify(engineData(spec)),
    ENGINE: read(join(KERNEL, 'engine.js')),
  });

  const left = html.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error(`${slug}: незаполненные слоты — ${[...new Set(left)].join(', ')}`);

  packDocs(slug, dir);

  const out = outDir || join(DIST, slug);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  for (const sub of ['assets', 'docs']) {
    if (existsSync(join(dir, sub))) cpSync(join(dir, sub), join(out, sub), { recursive: true });
  }
  return { spec, out, bytes: html.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('нужен slug. доступны:', listConcepts().join(', '));
    process.exit(1);
  }
  const r = build(slug);
  console.log(`собран ${slug}: ${r.out} · ${(r.bytes / 1024).toFixed(0)} КБ · ${r.spec.screens.length} экранов · `
    + `${(r.spec.prototypes || []).length} прототипов · ${r.spec.permissions.length} доступов`);
}
