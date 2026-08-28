#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, listConcepts } from './lib.mjs';

const slugs = listConcepts();
assert.equal(slugs.length, 30, 'портфель должен содержать 30 концептов');

for (const slug of slugs) {
  const file = join(DIST, slug, 'ux-spec.json');
  assert.ok(existsSync(file), `${slug}: build:all не создал ux-spec.json`);
  const spec = JSON.parse(readFileSync(file, 'utf8'));
  const serialized = JSON.stringify(spec);

  assert.equal(spec.navigation.start, 'phone', `${slug}: cold start должен вести в регистрацию`);
  assert.equal(spec.navigation.screens[0]?.title, 'Регистрация по почте', `${slug}: неверный первый экран`);
  assert.ok(!spec.navigation.screens.some((screen) => ['code', 'codefail'].includes(screen.id)), `${slug}: OTP-экраны попали в UX-спеку`);
  assert.doesNotMatch(serialized, /Продолжить с Google|Войти с Apple|Код из письма|Неверный код/i, `${slug}: внешний провайдер или OTP попал в UX-спеку`);
  assert.deepEqual(spec.navigation.problems, [], `${slug}: битый граф навигации`);

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
assert.equal(dvor.counts.screens, 29, 'Двор: HTML и UX-спека должны видеть одинаковые 29 экранов');
assert.equal(dvor.world?.entities?.length, 15, 'Двор: потеряна эталонная модель мира');
assert.equal(dvor.world?.actions?.length, 18, 'Двор: потеряны эталонные действия');
assert.equal(dvor.acceptance?.length, 17, 'Двор: потеряны сценарии приёмки');

console.log(`UX-спеки: ${slugs.length} концептов · email-only · состояния и графы согласованы`);
