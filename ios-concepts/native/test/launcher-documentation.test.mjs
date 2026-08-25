import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const detail = readFileSync(join(root, "launcher", "App", "Detail.swift"), "utf8");
const markdown = readFileSync(join(root, "launcher", "App", "Markdown.swift"), "utf8");
const documentation = readFileSync(join(root, "launcher", "App", "Documentation.swift"), "utf8");

test("launcher indexes a large guide into selectable pages", () => {
  assert.match(documentation, /struct DocumentationPage/);
  assert.match(documentation, /trimmed\.hasPrefix\("## "\)/);
  assert.match(documentation, /inCodeFence\.toggle\(\)/);
  assert.match(detail, /ForEach\(group\.pages\)/);
  assert.match(detail, /MarkdownView\(source: page\.source\)/);
  assert.doesNotMatch(detail, /String\(contentsOf: doc\.url/);
});

test("launcher renders markdown lazily with stable positional identities", () => {
  assert.match(markdown, /LazyVStack\(alignment: \.leading/);
  assert.match(markdown, /ForEach\(Array\(blocks\.enumerated\(\)\), id: \\.offset\)/);
  assert.doesNotMatch(markdown, /UUID\(\)\.uuidString/);
});
