import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { HTML_CONCEPT_PATTERN_CATALOG, resolveHTMLConceptPatterns } from "../lib/html-concept-patterns.mjs";

test("HTML knowledge is curated data without web implementation dependencies", () => {
  assert.ok(HTML_CONCEPT_PATTERN_CATALOG.length >= 8);
  assert.ok(HTML_CONCEPT_PATTERN_CATALOG.every(item => item.evidence.length > 0));
  assert.ok(HTML_CONCEPT_PATTERN_CATALOG.every(item => !JSON.stringify(item).includes("platform/concepts/")));
  const visualEvidence = HTML_CONCEPT_PATTERN_CATALOG.flatMap(item => item.evidence).filter(item => item.image);
  assert.ok(visualEvidence.length >= 10);
  assert.ok(visualEvidence.every(item => existsSync(new URL(`../HTMLPatterns/${item.image}`, import.meta.url))));
  assert.ok(resolveHTMLConceptPatterns("ownedProfile").some(item => item.id === "profile-from-topbar"));
  assert.ok(resolveHTMLConceptPatterns("settings").some(item => item.id === "capability-inside-feature"));
});
