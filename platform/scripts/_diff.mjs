/* Сверка: собранный из платформы артефакт против рабочего прототипа. */
import { readFileSync } from 'node:fs';
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const a = readFileSync('/Users/levonlobanov/Desktop/Camo/index.html', 'utf8');
const b = readFileSync('/Users/levonlobanov/Desktop/Camo/platform/dist/petlya/index.html', 'utf8');
const grab = (s, re) => (s.match(re) || []).map(norm).sort();
for (const [name, re] of [
  ['экраны', /<div class="screen[^>]*id="scr-[a-z]+"/g],
  ['data-ask', /data-ask="[^"]+"/g],
  ['data-go', /data-go="[^"]+"/g],
  ['data-activate', /data-activate="[^"]+"/g],
  ['data-show-denied', /data-show-denied="[^"]+"/g],
  ['CSS-классы', /class="[^"]+"/g],
]) {
  const A = grab(a, re), B = grab(b, re);
  const miss = A.filter(x => !B.includes(x));
  const extra = B.filter(x => !A.includes(x));
  console.log(`${name}: старый ${A.length} / новый ${B.length}` +
    (miss.length ? ` · ПОТЕРЯНО: ${[...new Set(miss)].slice(0,4).join(' , ')}` : '') +
    (extra.length ? ` · добавлено: ${[...new Set(extra)].slice(0,4).join(' , ')}` : ''));
}
