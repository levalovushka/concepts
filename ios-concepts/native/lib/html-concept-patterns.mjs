import { readFileSync } from "node:fs";

const source = JSON.parse(readFileSync(
  new URL("../HTMLPatterns/catalog.json", import.meta.url),
  "utf8",
));

function freezePattern(pattern) {
  return Object.freeze({
    ...pattern,
    recipes: Object.freeze([...pattern.recipes]),
    evidence: Object.freeze(pattern.evidence.map(item => Object.freeze({ ...item }))),
  });
}

export const HTML_CONCEPT_PATTERN_CATALOG = Object.freeze(source.patterns.map(freezePattern));

export function resolveHTMLConceptPatterns(recipe) {
  return Object.freeze(HTML_CONCEPT_PATTERN_CATALOG
    .filter(pattern => pattern.recipes.includes(recipe))
    .map(pattern => Object.freeze({
      id: pattern.id,
      rule: pattern.rule,
      evidence: pattern.evidence,
    })));
}
