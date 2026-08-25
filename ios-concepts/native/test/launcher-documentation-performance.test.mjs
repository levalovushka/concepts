import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "../..");

test("generated documentation is physically split into bounded files", () => {
  for (const slug of ["dvor", "looks", "nakat", "peresmenka", "tails", "today"]) {
    const directory = join(root, "concepts", slug, "docs");
    assert.equal(existsSync(join(directory, "developer-guide.md")), false, `${slug} still has a monolith`);
    const files = readdirSync(directory).filter(file => file.endsWith(".md"));
    assert.ok(files.length >= 24, `${slug} has only ${files.length} documentation files`);
    for (const file of files) {
      const bytes = Buffer.byteLength(readFileSync(join(directory, file)));
      assert.ok(bytes <= 20_000, `${slug}/${file} exceeds render budget: ${bytes} bytes`);
    }
  }
});
