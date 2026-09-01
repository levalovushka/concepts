import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const KERNEL = join(ROOT, 'kernel');
export const CONCEPTS = join(ROOT, 'concepts');
export const DIST = join(ROOT, 'dist');
export const SCRIPTS = join(ROOT, 'scripts');
