#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, listConcepts } from './lib.mjs';

const slugs = listConcepts();
assert.ok(slugs.length > 0, 'портфель не должен быть пустым');
assert.ok(slugs.includes('dvor'), 'портфель должен содержать эталонный концепт dvor');

for (const slug of slugs) {
  const file = join(DIST, slug, 'ux-spec.json');
  assert.ok(existsSync(file), `${slug}: build:all не создал ux-spec.json`);
  const spec = JSON.parse(readFileSync(file, 'utf8'));
  const serialized = JSON.stringify(spec);

  assert.equal(spec.navigation.start, 'phone', `${slug}: cold start должен вести на вход`);
  assert.equal(spec.navigation.screens[0]?.title, 'Вход по номеру', `${slug}: неверный первый экран`);
  assert.deepEqual(spec.navigation.screens.slice(0, 6).map((screen) => screen.id), ['phone', 'password', 'register', 'registerpassword', 'account', 'deleteaccount'], `${slug}: неполный auth-flow`);
  assert.ok(!spec.navigation.screens.some((screen) => ['code', 'codefail'].includes(screen.id)), `${slug}: OTP-экраны попали в UX-спеку`);
  assert.doesNotMatch(serialized, /Продолжить с Google|Войти с Apple|Код из письма|Неверный код/i, `${slug}: внешний провайдер или OTP попал в UX-спеку`);
  assert.deepEqual(spec.navigation.problems, [], `${slug}: битый граф навигации`);
  assert.equal(spec.compliance.auth.scope, 'camouflage', `${slug}: регистрация должна быть явно отделена от целевого сервиса`);
  assert.equal(spec.compliance.auth.targetServiceTransition, false, `${slug}: нельзя заявлять несуществующий переход в целевой сервис`);
  assert.equal(spec.compliance.auth.optional, true, `${slug}: вход и регистрация должны быть опциональны`);
  assert.equal(spec.compliance.auth.accountDeletion.available, true, `${slug}: нет удаления аккаунта`);
  assert.equal(spec.compliance.auth.consent.loggingRequired, true, `${slug}: не зафиксировано журналирование согласия`);
  assert.deepEqual(spec.compliance.privacyDocuments.map((document) => document.id), ['terms', 'privacy'], `${slug}: нужны два отдельных правовых документа`);
  if (slug !== 'dvor') {
    assert.equal(spec.compliance.ageRating, '13+', `${slug}: рейтинг должен быть не ниже 13+`);
    assert.equal(spec.compliance.targetAgeRating, '13+', `${slug}: рейтинг целевого сервиса должен быть 13+`);
    const authActions = spec.navigation.screens.find((screen) => screen.id === 'registerpassword')?.actions.map((action) => action.label) || [];
    assert.ok(authActions.includes('пользовательское соглашение'), `${slug}: соглашение должно быть встроенной ссылкой в юридической строке`);
    assert.ok(authActions.includes('политику конфиденциальности'), `${slug}: политика должна быть встроенной ссылкой в юридической строке`);
    const startActions = spec.navigation.screens.find((screen) => screen.id === 'phone')?.actions.map((action) => action.label) || [];
    assert.ok(startActions.includes('Помощь и поддержка'), `${slug}: помощь и поддержка должны быть одной вторичной точкой`);
    assert.ok(!startActions.includes('Помощь') && !startActions.includes('Поддержка'), `${slug}: отдельные ссылки помощи перегружают футер`);
  }

  for (const screen of spec.navigation.screens) {
    for (const state of screen.states.required) {
      assert.ok(screen.states.declared.includes(state), `${slug}/${screen.id}: нет обязательного состояния ${state}`);
    }
    assert.ok(screen.states.declared.every((state) => [...screen.states.required, 'success'].includes(state)), `${slug}/${screen.id}: неизвестное состояние`);
    assert.deepEqual(screen.states.missingRequired, [], `${slug}/${screen.id}: не хватает обязательных состояний`);
  }
}

const dvor = JSON.parse(readFileSync(join(DIST, 'dvor', 'ux-spec.json'), 'utf8'));
assert.deepEqual(dvor.gaps, [], 'Двор: эталонная UX-спека не должна содержать пробелов');
assert.equal(dvor.counts.screens, 29, 'Двор: HTML и UX-спека должны видеть одинаковые 29 экранов без мессенджера');
assert.equal(dvor.world?.entities?.length, 13, 'Двор: потеряна эталонная модель мира');
assert.equal(dvor.world?.actions?.length, 18, 'Двор: потеряны эталонные продуктовые действия');
assert.equal(dvor.acceptance?.length, 17, 'Двор: потеряны сценарии приёмки');

console.log(`UX-спеки: ${slugs.length} концептов · phone/password + optional account · состояния и графы согласованы`);
