#!/usr/bin/env node
/**
 * Кадры «Репетиции», нарисованные кодом: сцена, экран со слайдом, спикер.
 * Стоковых фото выступлений нет, а серые заглушки на месте видео читаются
 * как пустое место — поэтому кадр рисуется как данные: зал, слайд, свет.
 *
 *   node concepts/rehearsal/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

/* [фон зала, свет, акцент слайда, поза спикера, тип кадра] */
const frames = [
  ['#15171c', '#3b4a63', '#0077ff', 0, 'stage'],   // 1 — презентация продукта, сцена «Орбиты»
  ['#1a1714', '#5a4632', '#f0a24a', 1, 'stage'],   // 2 — тёплый зал, прогон в пятницу
  ['#121418', '#2f3b4a', '#4fc3a1', 2, 'room'],    // 3 — переговорная, прогон дома
  ['#181420', '#4a3a63', '#a98bff', 0, 'lesson'],  // 4 — урок «Школы выступлений»
  ['#14191a', '#2d4a4a', '#5ec8e0', 1, 'lesson'],  // 5 — урок «Камера и свет»
  ['#1b1616', '#5a3434', '#ff7a6b', 2, 'room'],    // 6 — питч-клуб
];

/* Спикер — мягкий силуэт: голова, плечи, корпус; в позе 1 рука указывает на слайд */
const speaker = (pose, x) => {
  const body = `<path d="M${x - 58} 360 C${x - 56} 290 ${x - 44} 252 ${x} 248 C${x + 44} 252 ${x + 56} 290 ${x + 58} 360 Z" fill="#0b0c0f"/>`;
  const head = `<ellipse cx="${x}" cy="214" rx="25" ry="29" fill="#0b0c0f"/><path d="M${x - 26} 206 C${x - 24} 180 ${x + 24} 178 ${x + 27} 204 C${x + 14} 196 ${x - 10} 196 ${x - 26} 206 Z" fill="#16181d"/>`;
  const arm = pose === 1 ? `<path d="M${x + 36} 270 C${x + 70} 250 ${x + 96} 226 ${x + 112} 206" fill="none" stroke="#0b0c0f" stroke-width="20" stroke-linecap="round"/>`
    : pose === 2 ? `<path d="M${x - 40} 282 C${x - 30} 300 ${x - 8} 304 ${x + 10} 296" fill="none" stroke="#0b0c0f" stroke-width="18" stroke-linecap="round"/>` : '';
  return body + arm + head;
};
const slide = (accent, kind) => kind === 'room'
  ? `<rect x="360" y="56" width="220" height="132" rx="8" fill="#e9ecf2"/><rect x="382" y="80" width="116" height="12" rx="6" fill="${accent}"/><rect x="382" y="104" width="172" height="8" rx="4" fill="#9aa3b2"/><rect x="382" y="122" width="140" height="8" rx="4" fill="#9aa3b2"/><rect x="382" y="152" width="60" height="20" rx="4" fill="${accent}" opacity=".7"/>`
  : `<rect x="268" y="40" width="320" height="184" rx="6" fill="#f2f4f8"/><rect x="294" y="68" width="150" height="16" rx="8" fill="${accent}"/><rect x="294" y="98" width="240" height="10" rx="5" fill="#9aa3b2"/><rect x="294" y="118" width="200" height="10" rx="5" fill="#9aa3b2"/><path d="M294 200 L344 172 L394 186 L444 148 L494 162 L548 128" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`;

frames.forEach(([bg, light, accent, pose, kind], i) => {
  const lesson = kind === 'lesson';
  const x = lesson ? 160 : 196;
  const audience = kind === 'stage' ? Array.from({ length: 10 }, (_, n) => `<ellipse cx="${20 + n * 68}" cy="${352 + (n % 2) * 6}" rx="30" ry="34" fill="#060709"/>`).join('') : '';
  const body = `<defs><radialGradient id="l${i}" cx="${lesson ? 25 : 35}%" cy="10%" r="80%"><stop offset="0" stop-color="${light}" stop-opacity=".95"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient></defs>
<rect width="640" height="360" fill="${bg}"/><rect width="640" height="360" fill="url(#l${i})"/>
${kind === 'stage' ? `<ellipse cx="${x}" cy="356" rx="150" ry="18" fill="${light}" opacity=".4"/>` : `<rect y="300" width="640" height="60" fill="#0f1013" opacity=".7"/>`}
${slide(accent, kind)}${speaker(pose, x)}${audience}`;
  writeFileSync(join(out, `frame-${i + 1}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">${body}</svg>`);
});
console.log('медиа готово:', out);
