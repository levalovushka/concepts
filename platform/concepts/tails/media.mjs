#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const out = join(fileURLToPath(new URL('.', import.meta.url)), 'assets', 'media');
mkdirSync(out, { recursive: true });
const svg = (name, body) => writeFileSync(join(out, name), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${body}</svg>`);

svg('map.svg', '<rect width="800" height="800" fill="#E8EFE5"/><path d="M-60 185Q220 290 460 120T860 165M-40 635Q240 500 420 655T840 590" fill="none" stroke="#fff" stroke-width="72"/><path d="M130-30Q230 235 185 830M620-30Q530 260 665 830" fill="none" stroke="#fff" stroke-width="48"/><circle cx="445" cy="385" r="38" fill="#0077FF"/><circle cx="445" cy="385" r="13" fill="#fff"/>');

console.log('медиа готово:', out);
