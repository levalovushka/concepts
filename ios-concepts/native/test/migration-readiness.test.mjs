import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { auditLegacyConcept } from "../lib/migration-readiness.mjs";
import { NATIVE_PROJECT_ROOT } from "../lib/native-pipeline.mjs";

test("legacy HTML is evidence, not a native implementation", () => {
  const result = auditLegacyConcept(join(NATIVE_PROJECT_ROOT, "concepts", "dvor"), NATIVE_PROJECT_ROOT);
  assert.equal(result.legacyEvidence.htmlScreens, 0);
  assert.equal(result.ready, true, result.blockers.join("\n"));
});
