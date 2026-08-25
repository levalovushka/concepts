import test from "node:test";
import assert from "node:assert/strict";
import { resolveExtension } from "../lib/extension-catalog.mjs";

test("generated Looks targets cannot contain Dvor domain language", () => {
  const context = { productName: "Образы", slug: "looks", bundleId: "com.camo.looks" };
  const source = ["credential-provider", "share-extension", "widget"]
    .map(id => resolveExtension(id, context).source).join("\n");
  assert.doesNotMatch(source, /Двор|Dvor-Guest|квартир|домофон/i);
  assert.match(source, /Образ дня/);
  assert.match(source, /completeRequest/);
});
