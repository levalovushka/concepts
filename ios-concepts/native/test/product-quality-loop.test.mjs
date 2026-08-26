import test from "node:test";
import assert from "node:assert/strict";
import { runProductQualityLoop } from "../lib/product-quality-loop.mjs";

test("blocked delivery is revised at most twice and rejected after the third review", async () => {
  const reviews = [];
  const revisions = [];
  const result = await runProductQualityLoop({
    initialDelivery: { revision: 0 },
    reviewer: { async review({ attempt, delivery }) {
      reviews.push({ attempt, revision: delivery.revision });
      return { ok: false, receipt: { attempt }, diagnostics: [{ code: "critic.visual-craft", message: "Weak hierarchy" }] };
    } },
    reviser: { async revise({ attempt, delivery, diagnostics }) {
      revisions.push({ attempt, diagnostics });
      return { revision: delivery.revision + 1 };
    } },
  });

  assert.equal(result.ok, false);
  assert.equal(result.attempts.length, 3);
  assert.deepEqual(reviews, [
    { attempt: 1, revision: 0 },
    { attempt: 2, revision: 1 },
    { attempt: 3, revision: 2 },
  ]);
  assert.equal(revisions.length, 2);
  assert.equal(result.diagnostics.some(item => item.code === "quality.iterations.exhausted"), true);
});
