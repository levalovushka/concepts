import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createCodexCLIStructuredModel, restoreOptionalProperties, toStrictOutputSchema,
} from "../lib/codex-cli-structured-model.mjs";

test("optional contract properties become strict nullable output and restore to omission", () => {
  const source = {
    type: "object", additionalProperties: false, required: ["id", "parent"],
    properties: {
      id: { type: "string" },
      parent: { anyOf: [{ type: "string" }, { type: "null" }] },
      note: { type: "string" },
    },
  };
  const strict = toStrictOutputSchema(source);
  assert.deepEqual(strict.required, ["id", "parent", "note"]);
  assert.deepEqual(strict.properties.note.anyOf[1], { type: "null" });
  assert.deepEqual(restoreOptionalProperties({ id: "a", parent: null, note: null }, source), { id: "a", parent: null });
});

test("strict conversion rejects unbounded object-shaped model output", () => {
  assert.throws(() => toStrictOutputSchema({ type: "object" }), /open object/);
});

test("strict conversion infers primitive types for const-only contract fields", () => {
  assert.deepEqual(toStrictOutputSchema({ const: 1 }), { const: 1, type: "integer" });
  assert.deepEqual(toStrictOutputSchema({ enum: ["a", "b"] }), { enum: ["a", "b"], type: "string" });
});

test("nested contract definitions are inlined so refs remain valid after composition", () => {
  const strict = toStrictOutputSchema({
    type: "object", required: ["candidate"], properties: {
      candidate: {
        type: "object", required: ["evidence"],
        $defs: { refs: { type: "array", items: { type: "string" } } },
        properties: { evidence: { $ref: "#/$defs/refs" } },
      },
    },
  });
  assert.deepEqual(strict.properties.candidate.properties.evidence, { type: "array", items: { type: "string" } });
  assert.equal(JSON.stringify(strict).includes("$ref"), false);
});

test("Codex CLI adapter constrains output and keeps model stages read-only", async () => {
  const root = mkdtempSync(join(tmpdir(), "camo-codex-adapter-test-"));
  const image = join(root, "frame.png");
  writeFileSync(image, "fixture");
  const calls = [];
  const model = createCodexCLIStructuredModel({
    clientId: "product-generator",
    projectRoot: root,
    run: async call => {
      calls.push(call);
      const outputIndex = call.args.indexOf("--output-last-message") + 1;
      writeFileSync(call.args[outputIndex], JSON.stringify({ answer: "ok" }));
    },
  });
  const schema = { type: "object", required: ["answer"], properties: { answer: { type: "string" } } };
  assert.deepEqual(await model.generateStructured({ operation: "generate", input: { request: "x" }, schema }), { answer: "ok" });
  assert.deepEqual(await model.reviewStructuredVisuals({
    operation: "review", input: { captures: [{ path: image }] }, schema,
  }), { answer: "ok" });
  assert.equal(calls.length, 2);
  assert.equal(calls.every(call => call.args.includes("read-only") && call.args.includes("--output-schema")), true);
  assert.equal(calls.every(call => call.args.includes("--ignore-user-config")), true);
  assert.equal(calls[1].args.includes("--image"), true);
  assert.match(calls[1].stdin, /attached images correspond in order/);
});

test("visual review fails closed without pixels", async () => {
  const model = createCodexCLIStructuredModel({ clientId: "vision-reviewer", run: async () => {} });
  await assert.rejects(model.reviewStructuredVisuals({ operation: "review", input: { captures: [] }, schema: {} }), /capture image paths/);
});
