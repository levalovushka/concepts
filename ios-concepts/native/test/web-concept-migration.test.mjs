import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { migrateWebConcept } from "../lib/web-concept-migration.mjs";
import { VKONTAKTE_PORTFOLIOS } from "../migrations/vkontakte-portfolios.mjs";
import { verifyProductDevelopmentArtifact } from "../lib/product-maturity.mjs";

const winners = Object.freeze({
  tails: "compatible-walk-network",
  today: "today-intent-match",
  nakat: "finite-driving-course",
  peresmenka: "verified-shift-ledger",
});

function webConcept(slug) {
  return JSON.parse(readFileSync(new URL(`../../../platform/concepts/${slug}/concept.json`, import.meta.url), "utf8"));
}

test("remaining VK web concepts compile into reproducible mature native deliveries", async () => {
  for (const [slug, portfolio] of Object.entries(VKONTAKTE_PORTFOLIOS)) {
    const result = await migrateWebConcept({ webConcept: webConcept(slug), portfolio });
    assert.equal(result.ok, true, `${slug}: ${result.diagnostics.map(item => item.code).join(", ")}`);
    assert.equal(result.concept.productDevelopment.selectionReceipt.selectedCandidateId, winners[slug]);
    assert.equal(verifyProductDevelopmentArtifact(result.concept.productDevelopment).filter(item => item.severity === "error").length, 0);
    assert.equal(result.concept.ux.schemaVersion, 1);
    assert.ok(result.concept.ux.navigation.nodes.length >= result.concept.screens.length);
    assert.ok(result.concept.ux.localization.catalog.length > result.concept.screens.length);
    assert.doesNotMatch(JSON.stringify(result.concept.ux), /HTML|DOM|CSS mapping/i);
    const committed = JSON.parse(readFileSync(new URL(`../../concepts/${slug}/concept.json`, import.meta.url), "utf8"));
    assert.deepEqual(result.concept, committed, `${slug}: committed native concept drifted from migration compiler`);
  }
});

test("web migration fails closed outside the evidence-ready VK family", async () => {
  const source = { ...webConcept("tails"), targetSet: "vk-video" };
  await assert.rejects(
    () => migrateWebConcept({ webConcept: source, portfolio: VKONTAKTE_PORTFOLIOS.tails }),
    /only targetSet=vkontakte/,
  );
});

test("web migration requires a comparative three-candidate portfolio", async () => {
  await assert.rejects(
    () => migrateWebConcept({ webConcept: webConcept("today"), portfolio: VKONTAKTE_PORTFOLIOS.today.slice(0, 2) }),
    /exactly three curated candidates/,
  );
});
