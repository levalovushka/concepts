import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const detail = readFileSync(join(root, "launcher", "App", "Detail.swift"), "utf8");
const markdown = readFileSync(join(root, "launcher", "App", "Markdown.swift"), "utf8");
const documentation = readFileSync(join(root, "launcher", "App", "Documentation.swift"), "utf8");
const model = readFileSync(join(root, "launcher", "App", "Model.swift"), "utf8");

test("launcher indexes physical docs and opens only the selected file", () => {
  assert.match(documentation, /static func title\(for name: String\)/);
  assert.match(detail, /List\(concept\.docs, selection: \$selectedID\)/);
  assert.match(detail, /String\(contentsOf: selected\.url/);
  assert.match(detail, /\.task\(id: selectedID\)/);
  assert.doesNotMatch(detail, /DocumentationIndex\.groups/);
  assert.doesNotMatch(detail, /MarkdownView\(source: source\)\s*\.textSelection/);
});

test("launcher renders markdown lazily with stable positional identities", () => {
  assert.match(markdown, /LazyVStack\(alignment: \.leading/);
  assert.match(markdown, /ForEach\(Array\(blocks\.enumerated\(\)\), id: \\.offset\)/);
  assert.doesNotMatch(markdown, /UUID\(\)\.uuidString/);
});

test("isolation roots can never poison the persisted launcher library", () => {
  assert.match(model, /isEphemeralRoot/);
  assert.match(model, /standardized\.hasPrefix\("\/private\/tmp\/"\)/);
  assert.match(model, /if !Self\.isEphemeralRoot\(rootPath\)/);
  assert.match(model, /configured \?\? stored \?\? Self\.defaultProjectRoot\(\)/);
});
