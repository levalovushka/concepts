/**
 * Карта экранов, выведенная из данных, а не написанная руками.
 *
 * Источник — тот же, что у прототипа: разметка экранов (data-go / data-jump /
 * data-ask / data-activate / data-toast / data-back) и concept.json (parent,
 * tabs, start, permissions). Поэтому карта не может разойтись с прототипом:
 * разъезжаться нечему, это одни и те же байты.
 *
 * Отсюда же берутся проверки достижимости: экран, в который не ведёт ни один
 * переход, в собранном файле выглядит как полноценный экран — и его нельзя
 * увидеть иначе, чем через раздел «Экраны».
 */
import { esc } from './lib.mjs';

/* Теги без содержимого: в балансировке не участвуют. */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr', 'use', 'path', 'rect',
  'circle', 'ellipse', 'line', 'polygon', 'polyline', 'stop']);

const TAG = /<(\/?)([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>/gi;

const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? m[1] : null;
};

/**
 * Подпись перехода — первая строка элемента, а не весь его текст: строка списка
 * несёт заголовок и два подзаголовка, и склеенные вместе они нечитаемы.
 */
const textOf = (inner) => {
  const lines = inner
    .replace(/<[^>]*>/g, '\n')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const first = lines[0] || '';
  return first.length > 44 ? first.slice(0, 43).trimEnd() + '…' : first;
};

const TRIGGER_ATTRS = ['data-go', 'data-jump', 'data-ask', 'data-activate', 'data-toast', 'data-back'];

/**
 * Все триггеры одного экрана, в порядке разметки. Разбор поточный: заодно
 * известно, лежит ли элемент внутри таб-бара — вкладки чужих разделов это
 * структура, а не действие на экране, и в таблицу действий они не идут.
 */
export function triggersOf(screenId, html) {
  const found = [];
  const stack = [];
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(html))) {
    const [full, closing, rawTag, attrs = '', selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      while (stack.length) {
        const top = stack.pop();
        if (top.rec) top.rec.inner = html.slice(top.contentStart, m.index);
        if (top.tag === tag) break;
      }
      continue;
    }
    const isTrigger = TRIGGER_ATTRS.some((a) => new RegExp(`\\b${a}(=|[\\s>])`).test(attrs));
    let rec = null;
    if (isTrigger) {
      rec = {
        screen: screenId,
        attrs,
        index: m.index,
        openLength: full.length,
        tagName: tag,
        label: attr(attrs, 'aria-label') || '',
        inTab: stack.some((s) => s.inTab),
        inner: '',
      };
      found.push(rec);
    }
    if (selfClose || VOID.has(tag)) continue;
    stack.push({
      tag,
      rec,
      contentStart: m.index + full.length,
      inTab: stack.some((s) => s.inTab) || /class="[^"]*\btabbar\b/.test(attrs),
    });
  }
  /* Незакрытые теги: содержимое — до конца экрана. */
  for (const s of stack) if (s.rec) s.rec.inner = html.slice(s.contentStart);
  for (const r of found) if (!r.label) r.label = textOf(r.inner);
  return found;
}

/**
 * Граф концепта: узлы = экраны спеки, рёбра = переходы из разметки.
 *
 *   kind: tab      вкладка таб-бара (структура, не действие экрана)
 *         go/jump  обычный переход
 *         ask      доступ разрешён → куда ведёт фича
 *         denied   доступ отклонён → где лежит fallback
 *         activate entitlement без системного alert
 *         toast    подтверждение и переход туда, где результат виден
 *         back     возврат по IA к родителю из спеки
 */
export function screenGraph(spec, markup) {
  const byId = new Map(spec.screens.map((s) => [s.id, s]));
  const permByKey = new Map(spec.permissions.map((p) => [p.key, p]));
  const edges = [];

  for (const s of spec.screens) {
    const html = markup[s.id];
    if (html == null) continue;
    for (const t of triggersOf(s.id, html)) {
      const base = { from: s.id, label: t.label, inTab: t.inTab };
      const go = attr(t.attrs, 'data-go');
      const jump = attr(t.attrs, 'data-jump');
      const ask = attr(t.attrs, 'data-ask');
      const activate = attr(t.attrs, 'data-activate');
      const toast = attr(t.attrs, 'data-toast');

      if (go) edges.push({ ...base, to: go, kind: t.inTab ? 'tab' : 'go' });
      if (jump) edges.push({ ...base, to: jump, kind: 'jump' });
      if (ask) {
        const [keys, then, other] = ask.split('|');
        const list = keys.split('+');
        if (then) edges.push({ ...base, to: then, kind: 'ask', keys: list });
        if (other && other !== then) edges.push({ ...base, to: other, kind: 'denied', keys: list });
      }
      if (activate) {
        const [key, to] = activate.split('|');
        if (to) edges.push({ ...base, to, kind: 'activate', keys: [key] });
      }
      if (toast) {
        const [msg, to] = toast.split('|');
        if (to) edges.push({ ...base, to, kind: 'toast', label: t.label || msg });
      }
      if (/\bdata-back(=|[\s>])/.test(t.attrs) && s.parent) {
        edges.push({ ...base, to: s.parent, kind: 'back' });
      }
    }
  }

  const nodes = spec.screens.map((s) => ({
    id: s.id,
    title: s.title,
    type: s.type || '',
    meta: s.meta || '',
    parent: s.parent || null,
    isTab: (spec.tabs || []).some((t) => t.id === s.id),
    isStart: s.id === spec.start,
    perms: spec.permissions.filter((p) => p.screen === s.id),
    out: edges.filter((e) => e.from === s.id),
    in: edges.filter((e) => e.to === s.id),
  }));

  /* Дерево по объявленному родителю: он же считает возврат в движке. */
  const kidsOf = (id) => nodes.filter((n) => n.parent === id);
  const roots = nodes.filter((n) => !n.parent);

  /* Достижимость — обходом графа от старта, включая ветки отказа. */
  const reached = new Set([spec.start]);
  for (const queue = [spec.start]; queue.length;) {
    const cur = queue.shift();
    for (const e of edges) {
      if (e.from !== cur || reached.has(e.to)) continue;
      if (!byId.has(e.to)) continue;
      reached.add(e.to);
      queue.push(e.to);
    }
  }

  const problems = [];
  for (const e of edges) {
    if (!byId.has(e.to)) problems.push(`переход ${e.from} → ${e.to}: такого экрана нет в спеке`);
  }
  for (const n of nodes) {
    if (!reached.has(n.id)) problems.push(`экран ${n.id} недостижим из старта ${spec.start}: в него не ведёт ни один переход`);
  }
  /* Fallback должен лежать там, куда приводит отказ, — иначе его не увидят. */
  for (const e of edges) {
    if (e.kind !== 'denied' || !markup[e.to]) continue;
    const shown = [...markup[e.to].matchAll(/data-show-denied="([^"]*)"/g)]
      .flatMap((m) => m[1].split(',').map((s) => s.trim()));
    const sw = [...markup[e.to].matchAll(/data-switch="([^"]*)"/g)].map((m) => m[1]);
    for (const k of e.keys || []) {
      if (!shown.includes(k) && !sw.includes(k)) {
        problems.push(`отказ в ${k} с «${e.from}» ведёт на ${e.to}, а fallback (data-show-denied) там не объявлен`);
      }
    }
  }

  return { nodes, edges, roots, kidsOf, reached, problems, byId, permByKey, start: spec.start };
}

/* ——— представления ——— */

const KIND_WORD = {
  go: 'переход', jump: 'переход', ask: 'запрос доступа', denied: 'отказ',
  activate: 'entitlement', toast: 'подтверждение', back: 'возврат', tab: 'вкладка',
};

const keysLabel = (g, e) => (e.keys || []).map((k) => g.permByKey.get(k)?.plist || k).join(' + ');

/**
 * Рёбра, одинаковые по смыслу (та же цель, тот же тип, те же ключи), — одной
 * записью: четыре строки каталога ведут в один урок, и четыре строки в карте
 * говорят ровно то же, что одна.
 */
function mergeEdges(list) {
  const map = new Map();
  for (const e of list) {
    const k = [e.to, e.kind, (e.keys || []).join('+')].join('|');
    if (!map.has(k)) map.set(k, { ...e, labels: [] });
    const rec = map.get(k);
    if (e.label && !rec.labels.includes(e.label)) rec.labels.push(e.label);
  }
  return [...map.values()];
}

const labelsOf = (e, max = 2) => {
  const l = e.labels || (e.label ? [e.label] : []);
  if (!l.length) return '';
  return l.slice(0, max).map((s) => `«${s}»`).join(', ') + (l.length > max ? ' …' : '');
};

/**
 * Как экран открывается. Петля в себя не вход: отказ в доступе часто оставляет
 * на том же экране, и в списке входов это выглядело бы как способ туда попасть.
 */
function entryLabel(g, node) {
  const from = mergeEdges(node.in.filter((e) =>
    e.kind !== 'back' && e.kind !== 'tab' && e.from !== node.id));
  if (!from.length) return node.isTab ? 'вкладка таб-бара' : '';
  return from.slice(0, 3).map((e) => {
    const what = labelsOf(e) || KIND_WORD[e.kind];
    return what + (e.keys ? ` (${e.keys.join(' + ')})` : '');
  }).join(', ') + (from.length > 3 ? ' …' : '');
}

/**
 * Дерево IA: где экран лежит и чем открывается. Иерархия — по parent из спеки,
 * рёбра в чужие ветки показаны отдельной строкой, иначе структура превращается
 * в паутину, по которой ничего не прочитать.
 */
export function iaTree(g) {
  const node = (n, depth) => {
    const kids = g.kidsOf(n.id);
    const kidIds = new Set(kids.map((k) => k.id));
    const side = mergeEdges(n.out.filter((e) =>
      e.kind !== 'back' && e.kind !== 'tab' && !kidIds.has(e.to) && e.to !== n.id));
    const badges = [
      n.isStart ? '<span class="ia-badge">старт</span>' : '',
      n.isTab ? '<span class="ia-badge">вкладка</span>' : '',
    ].join('');
    /* Корень таба тоже чем-то открывается: «Войти» после кода из SMS. */
    const entry = n.isStart ? '' : entryLabel(g, n);
    return `<li class="ia-node">
      <div class="ia-card">
        <div class="ia-head"><span class="ia-name">${esc(n.title)}</span><code class="ia-id">${esc(n.id)}</code>${badges}</div>
        <div class="ia-type">${esc(n.type)}</div>
        ${entry ? `<div class="ia-entry">открывается: ${esc(entry)}</div>` : ''}
        ${n.perms.length ? `<div class="ia-keys">${n.perms.map((p) =>
          `<span class="ia-key">${esc(p.key)}${p.activate ? ' · activate' : ''}</span>`).join('')}</div>` : ''}
        ${side.length ? `<div class="ia-side">${side.map((e) =>
          `<span class="ia-jump">→ ${esc(g.byId.get(e.to)?.title || e.to)}${labelsOf(e, 1) ? ` <i>${esc(labelsOf(e, 1))}</i>` : ''}</span>`).join('')}</div>` : ''}
      </div>
      ${kids.length ? `<ul class="ia-kids">${kids.map((k) => node(k, depth + 1)).join('')}</ul>` : ''}
    </li>`;
  };
  return `<ul class="iamap">${g.roots.map((r) => node(r, 0)).join('')}</ul>`;
}

const KIND_TEXT = {
  denied: 'отказ → fallback',
  back: 'возврат по IA',
  activate: 'entitlement, без alert',
  ask: 'доступ разрешён',
  toast: 'подтверждение',
};
const kindText = (kind) => KIND_TEXT[kind] || 'переход';

/** Полная текстовая карта: что можно сделать на экране и куда это ведёт. */
export function transitionTable(g) {
  const rows = [];
  for (const n of g.nodes) {
    const own = mergeEdges(n.out.filter((e) => e.kind !== 'tab'));
    if (!own.length) { rows.push([n, null]); continue; }
    for (const e of own) rows.push([n, e]);
  }
  const cells = rows.map(([n, e], i) => {
    const first = i === 0 || rows[i - 1][0].id !== n.id;
    const span = rows.filter((r) => r[0].id === n.id).length;
    const head = first
      ? `<th scope="row" rowspan="${span}"><span class="ia-cell-name">${esc(n.title)}</span><code>${esc(n.id)}</code></th>`
      : '';
    if (!e) return `      <tr>${head}<td colspan="4" class="ia-cell-none">дальше переходов нет</td></tr>`;
    const act = labelsOf(e) ? esc(labelsOf(e)) : esc(KIND_WORD[e.kind]);
    const keys = e.keys ? `<code>${esc(keysLabel(g, e))}</code>` : '—';
    return `      <tr>${head}<td>${act}</td><td>${esc(g.byId.get(e.to)?.title || e.to)} <code>${esc(e.to)}</code></td><td>${keys}</td><td>${kindText(e.kind)}</td></tr>`;
  });
  return `<div class="table-wrap">
  <table class="doc-table ia-table">
    <thead><tr><th>Экран</th><th>Что можно сделать</th><th>Ведёт на</th><th>Доступ</th><th>Тип перехода</th></tr></thead>
    <tbody>
${cells.join('\n')}
    </tbody>
  </table>
</div>`;
}

/* ——— то же в markdown, для docs/02-architecture.md ——— */

const mdCell = (s) => String(s ?? '').replace(/\|/g, '\\|');

export function iaTreeMd(g) {
  const out = [];
  const walk = (n, prefix, last, depth) => {
    const kids = g.kidsOf(n.id);
    const entry = n.isStart ? 'старт' : entryLabel(g, n);
    const tail = [n.type, entry && `открывается: ${entry}`, n.perms.length && n.perms.map((p) => p.key).join(', ')]
      .filter(Boolean).join(' · ');
    out.push(depth === 0
      ? `${n.title} (${n.id})${tail ? ` — ${tail}` : ''}`
      : `${prefix}${last ? '└─ ' : '├─ '}${n.title} (${n.id})${tail ? ` — ${tail}` : ''}`);
    kids.forEach((k, i) => walk(k, depth === 0 ? '    ' : prefix + (last ? '    ' : '│   '), i === kids.length - 1, depth + 1));
  };
  g.roots.forEach((r) => { walk(r, '', true, 0); out.push(''); });
  return ['```', ...out.filter((l, i, a) => !(l === '' && i === a.length - 1)), '```'];
}

export function transitionTableMd(g) {
  const lines = ['| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |', '|---|---|---|---|---|'];
  for (const n of g.nodes) {
    const own = mergeEdges(n.out.filter((e) => e.kind !== 'tab'));
    if (!own.length) { lines.push(`| \`${n.id}\` | — | — | — | дальше переходов нет |`); continue; }
    for (const e of own) {
      const act = labelsOf(e) ? mdCell(labelsOf(e)) : KIND_WORD[e.kind];
      lines.push(`| \`${n.id}\` | ${act} | \`${e.to}\` | ${e.keys ? '`' + mdCell(keysLabel(g, e)) + '`' : '—'} | ${kindText(e.kind)} |`);
    }
  }
  return lines;
}

/* ——— действия экрана: каждый элемент, а не только переходы ——— */

/**
 * Таблица переходов схлопывает одинаковые по смыслу рёбра и намеренно
 * выбрасывает вкладки: как карта это правильно, как справка разработчику — нет.
 * Здесь наоборот: перечислены ВСЕ интерактивные элементы экрана в порядке
 * разметки, включая вкладки чужих разделов, кнопку возврата и подтверждения,
 * которые никуда не ведут. Иначе «что делает эта кнопка» приходится выяснять
 * руками по разметке.
 */
const ROLE_WORD = {
  tab: 'вкладка',
  back: 'кнопка «назад»',
  control: 'элемент экрана',
};

export function screenActions(spec, markup) {
  const permByKey = new Map(spec.permissions.map((p) => [p.key, p]));
  const titleOf = (id) => spec.screens.find((s) => s.id === id)?.title || id;
  const out = [];
  for (const s of spec.screens) {
    const html = markup[s.id];
    if (html == null) continue;
    const rows = [];
    for (const t of triggersOf(s.id, html)) {
      const go = attr(t.attrs, 'data-go');
      const jump = attr(t.attrs, 'data-jump');
      const ask = attr(t.attrs, 'data-ask');
      const activate = attr(t.attrs, 'data-activate');
      const toast = attr(t.attrs, 'data-toast');
      const isBack = /\bdata-back(=|[\s>])/.test(t.attrs);
      const role = t.inTab ? 'tab' : isBack ? 'back' : 'control';
      const label = t.label || (toast ? toast.split('|')[0] : '') || ROLE_WORD[role];

      if (ask) {
        const [keys, then, other] = ask.split('|');
        const list = keys.split('+');
        const plists = list.map((k) => permByKey.get(k)?.plist || k);
        rows.push({
          label, role,
          does: list.length > 1
            ? `спрашивает доступы цепочкой: ${list.join(' → ')}`
            : `спрашивает доступ ${list[0]}`,
          to: then ? `${titleOf(then)} (${then})` : '—',
          onDeny: other && other !== then ? `${titleOf(other)} (${other})` : (then ? `${titleOf(then)} (${then})` : '—'),
          keys: plists.join(' + '),
        });
        continue;
      }
      if (activate) {
        const [key, to] = activate.split('|');
        rows.push({
          label, role,
          does: `включает entitlement ${key}, системного alert нет`,
          to: to === s.id ? 'остаётся на экране' : `${titleOf(to)} (${to})`,
          onDeny: '—',
          keys: permByKey.get(key)?.plist || key,
        });
        continue;
      }
      if (toast) {
        const [msg, to] = toast.split('|');
        rows.push({
          label, role,
          does: `показывает подтверждение «${msg}»`,
          to: to ? `${titleOf(to)} (${to})` : 'остаётся на экране',
          onDeny: '—', keys: '—',
        });
        continue;
      }
      if (go || jump) {
        const to = go || jump;
        rows.push({
          label, role,
          does: role === 'tab' ? 'переключает вкладку таб-бара' : 'открывает экран',
          to: `${titleOf(to)} (${to})`,
          onDeny: '—', keys: '—',
        });
        continue;
      }
      if (isBack) {
        rows.push({
          label, role,
          does: 'возвращает к родительскому экрану',
          to: s.parent ? `${titleOf(s.parent)} (${s.parent})` : '—',
          onDeny: '—', keys: '—',
        });
      }
    }
    out.push({ screen: s, rows });
  }
  return out;
}

export function screenActionsMd(spec, markup) {
  const lines = ['| Экран | Элемент | Роль | Что делает | Ведёт на | При отказе | Ключ |', '|---|---|---|---|---|---|---|'];
  for (const { screen, rows } of screenActions(spec, markup)) {
    if (!rows.length) { lines.push(`| \`${screen.id}\` | — | — | интерактивных элементов нет | — | — | — |`); continue; }
    for (const r of rows) {
      lines.push(`| \`${screen.id}\` | ${mdCell(r.label)} | ${ROLE_WORD[r.role]} | ${mdCell(r.does)} | ${mdCell(r.to)} | ${mdCell(r.onDeny)} | ${r.keys === '—' ? '—' : '`' + mdCell(r.keys) + '`'} |`);
    }
  }
  return lines;
}

export function screenActionsHtml(spec, markup) {
  const rowsHtml = [];
  for (const { screen, rows } of screenActions(spec, markup)) {
    const span = Math.max(rows.length, 1);
    const head = `<th scope="row" rowspan="${span}"><span class="ia-cell-name">${esc(screen.title)}</span><code>${esc(screen.id)}</code></th>`;
    if (!rows.length) { rowsHtml.push(`      <tr>${head}<td colspan="6" class="ia-cell-none">интерактивных элементов нет</td></tr>`); continue; }
    rows.forEach((r, i) => {
      rowsHtml.push(`      <tr>${i === 0 ? head : ''}<td>${esc(r.label)}</td><td>${esc(ROLE_WORD[r.role])}</td><td>${esc(r.does)}</td><td>${esc(r.to)}</td><td>${esc(r.onDeny)}</td><td>${r.keys === '—' ? '—' : `<code>${esc(r.keys)}</code>`}</td></tr>`);
    });
  }
  return `<div class="table-wrap">
  <table class="doc-table ia-table">
    <thead><tr><th>Экран</th><th>Элемент</th><th>Роль</th><th>Что делает</th><th>Ведёт на</th><th>При отказе</th><th>Ключ</th></tr></thead>
    <tbody>
${rowsHtml.join('\n')}
    </tbody>
  </table>
</div>`;
}
