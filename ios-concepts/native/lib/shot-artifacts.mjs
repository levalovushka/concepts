import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// Current behaviour, captured behind a seam so the disappearing-artifact bug
// can be reproduced and fixed with a deterministic regression test.
export function shotArtifactDirectory(nativeRoot, slug, variant = null) {
  return join(nativeRoot, "artifacts", slug, variant ? `shots-${variant}` : "shots");
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
    // Partial recaptures intentionally preserve unrelated verified frames. A
    // distinctness pass must compare every available pair without requiring
    // artifacts outside the selected capture set to exist.
    const buffers = group
      .map(name => [name, join(directory, `${name}.png`)])
      .filter(([, path]) => existsSync(path))
      .map(([name, path]) => [name, readFileSync(path)]);
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
