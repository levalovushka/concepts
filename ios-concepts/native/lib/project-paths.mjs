import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const NATIVE_PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function isPathInside(root, candidate, { allowRoot = true } = {}) {
  const canonicalRoot = resolve(root);
  const canonicalCandidate = resolve(candidate);
  const offset = relative(canonicalRoot, canonicalCandidate);
  if (offset === "") return allowRoot;
  return offset !== ".." && !offset.startsWith(`..${sep}`) && !isAbsolute(offset);
}

export function assertPathInside(root, candidate, label = "path", options = {}) {
  if (!isPathInside(root, candidate, options)) {
    throw new Error(`${label} escapes native project root: ${candidate}`);
  }
  return resolve(candidate);
}

export function projectPath(...segments) {
  return assertPathInside(NATIVE_PROJECT_ROOT, resolve(NATIVE_PROJECT_ROOT, ...segments), "project path");
}

export function canonicalProjectPath(root, candidate) {
  const path = assertPathInside(root, candidate, "canonical path");
  const offset = relative(resolve(root), path).split(sep).join("/");
  return offset ? `$PROJECT_ROOT/${offset}` : "$PROJECT_ROOT";
}
