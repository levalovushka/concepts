/**
 * Примитивы генерации медиа, общие для всех концептов.
 *
 * Всё медиа рисуется кодом — стоковых фото в проекте нет, поэтому вопросов
 * по правам не возникает. Псевдослучай детерминированный: пересборка даёт
 * побайтово тот же результат.
 */
/* ——— цвет ——— */

export const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
export const toHex = (rgb) => '#' + rgb.map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
export const dark = (c, t) => mix(c, '#000000', t);
export const lite = (c, t) => mix(c, '#ffffff', t);


export const seeded = (s) => () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
