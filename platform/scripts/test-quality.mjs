#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONCEPTS, listConcepts, readSpec, validate } from './lib.mjs';

for (const slug of listConcepts()) readSpec(slug);

const dvor = readSpec('dvor');
const rejects = (mutate, pattern) => {
  const candidate = structuredClone(dvor);
  mutate(candidate);
  assert.throws(() => validate(candidate, 'dvor'), pattern);
};

rejects((spec) => { spec.product.returnReasons = ['Только одна']; }, /returnReasons/);
rejects((spec) => { spec.product.verticalSlice.result = 'missing'; }, /verticalSlice\.result/);
rejects((spec) => { spec.positioning.evidenceScreens = ['home', 'chats', 'missing']; }, /evidenceScreens/);
rejects((spec) => { spec.positioning.referencePatterns[0] = 'unknown-pattern'; }, /referencePatterns/);
rejects((spec) => { spec.appStore.category = { primary: 'Utilities', secondary: 'Lifestyle' }; }, /Social Networking/);

const template = readFileSync(join(CONCEPTS, '_template', 'concept.json'), 'utf8');
const materialize = (mode, targetSet, category, patterns) => JSON.parse(template
  .replaceAll('__SLUG__', `smoke-${mode}`)
  .replaceAll('__NAME__', 'Проверка')
  .replaceAll('__TARGET_SET__', targetSet)
  .replaceAll('__POSITIONING_MODE__', mode)
  .replaceAll('__APP_STORE_CATEGORY__', category)
  .replaceAll('__REFERENCE_PATTERN_1__', patterns[0])
  .replaceAll('__REFERENCE_PATTERN_2__', patterns[1])
  .replaceAll('__REFERENCE_PATTERN_3__', patterns[2]));

validate(materialize('mimicry', 'vk-video', 'Photo & Video', ['video-feed', 'vertical-clips', 'immersive-player']), 'smoke-mimicry');
validate(materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']), 'smoke-differentiation');

const badDensity = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
badDensity.screens[0].ui.density = 'high';
assert.throws(() => validate(badDensity, 'smoke-differentiation'), /density/);
const missingState = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
missingState.screens[0].ui.states = ['default'];
assert.throws(() => validate(missingState, 'smoke-differentiation'), /требует состояние/);

console.log(`контракт качества: ${listConcepts().length} концептов · 7 негативных evals · 2 режима скаффолда`);
