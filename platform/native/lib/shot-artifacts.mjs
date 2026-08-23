import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// Current behaviour, captured behind a seam so the disappearing-artifact bug
// can be reproduced and fixed with a deterministic regression test.
export function shotArtifactDirectory(nativeRoot, slug) {
  return join(nativeRoot, "artifacts", slug, "shots");
}

export function prepareShotArtifacts(directory, screens) {
  mkdirSync(directory, { recursive: true });
  for (const screen of screens) {
    const target = join(directory, `${screen}.png`);
    if (existsSync(target)) rmSync(target, { force: true });
  }
}

export function findIndistinguishableArtifacts(directory, groups) {
  const failures = [];
  for (const group of groups) {
    const buffers = group.map(name => [name, readFileSync(join(directory, `${name}.png`))]);
    for (let index = 0; index < buffers.length; index += 1) {
      for (let other = index + 1; other < buffers.length; other += 1) {
        if (buffers[index][1].equals(buffers[other][1])) {
          failures.push([buffers[index][0], buffers[other][0]]);
        }
      }
    }
  }
  return failures;
}
