#!/usr/bin/env node
/** Быстрые продуктовые ворота до дорогой сборки и браузерных тестов. */
import { listConcepts, readSpec } from './lib.mjs';
import { qualitySummary } from './concept-quality.mjs';

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : listConcepts();

for (const slug of slugs) {
  const spec = readSpec(slug);
  const proof = qualitySummary(spec);
  const slice = `${proof.verticalSlice.entry} → ${proof.verticalSlice.action} → ${proof.verticalSlice.result}`;
  const reference = proof.referencePatterns ? ` · паттернов референса ${proof.referencePatterns}` : '';
  console.log(`${slug}: ${proof.mode} · ${proof.reference} · ${proof.category} · возвратов ${proof.returnReasons} · срез ${slice} · доказательств ${proof.evidenceScreens}${reference} · UI ${proof.uiContract}`);
}

console.log(`\n✓ Продуктовые ворота: ${slugs.length}/${slugs.length}`);
