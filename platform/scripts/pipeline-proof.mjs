#!/usr/bin/env node
/** Быстрые продуктовые ворота до дорогой сборки и браузерных тестов. */
import { listConcepts, readSpec } from './lib.mjs';
import { assessConceptReadiness, qualitySummary } from './concept-quality.mjs';
import { verifyQualityReview } from './quality-review.mjs';

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : listConcepts();

for (const slug of slugs) {
  const spec = readSpec(slug);
  if (spec.qualityContractVersion >= 3) {
    const evidence = verifyQualityReview(slug);
    if (!evidence.ok) {
      console.error(`\n${slug}: quality evidence не принято`);
      evidence.issues.forEach((issue) => console.error(`  · ${issue}`));
      process.exitCode = 1;
      continue;
    }
  }
  const readiness = assessConceptReadiness(spec);
  if (readiness.issues.length) {
    console.error(`\n${slug}: не готов к полной сборке`);
    readiness.issues.forEach((issue) => console.error(`  · ${issue}`));
    process.exitCode = 1;
    continue;
  }
  const proof = qualitySummary(spec);
  const slice = `${proof.verticalSlice.entry} → ${proof.verticalSlice.action} → ${proof.verticalSlice.result}`;
  const reference = proof.referencePatterns ? ` · паттернов референса ${proof.referencePatterns}` : '';
  const reviewed = proof.readiness ? ` · research ${proof.readiness.research} · critique ${proof.readiness.critiques} · visual ${proof.readiness.passes}` : '';
  console.log(`${slug}: ${proof.mode} · ${proof.reference} · ${proof.category} · возвратов ${proof.returnReasons} · срез ${slice} · доказательств ${proof.evidenceScreens}${reference} · UI ${proof.uiContract}${reviewed}`);
}

if (!process.exitCode) console.log(`\n✓ Продуктовые ворота: ${slugs.length}/${slugs.length}`);
