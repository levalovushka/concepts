/** Небольшой build-time renderer для документации концептов.
 * Поддерживает тот Markdown, который реально используется в docs/: заголовки,
 * абзацы, ссылки, списки, цитаты, fenced code и pipe-таблицы.
 */
const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const inline = (source) => {
  const tokens = [];
  const hold = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
  let text = String(source).replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHtml(code)}</code>`));
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const cleanHref = href.replace(/^\.\//, '');
    const markdown = cleanHref.match(/(?:^|\/)([^/#]+)\.md(?:#(.+))?$/);
    const target = markdown
      ? `#doc-${markdown[1].replace(/[^a-z0-9-]/gi, '-')}${markdown[2] ? `-${markdown[2]}` : ''}`
      : escapeHtml(href);
    const external = /^https?:\/\//.test(href) ? ' target="_blank" rel="noreferrer"' : '';
    return `<a href="${target}"${external}>${label}</a>`;
  });
  text = text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
};

const cells = (line) => {
  const source = line.trim().replace(/^\||\|$/g, '');
  const out = [];
  let cell = '';
  let code = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '`') code = !code;
    if (char === '|' && source[index - 1] !== '\\' && !code) {
      out.push(cell.trim().replace(/\\\|/g, '|'));
      cell = '';
    } else cell += char;
  }
  out.push(cell.trim().replace(/\\\|/g, '|'));
  return out;
};
const isTableDivider = (line = '') => /^\s*\|?\s*:?-{3,}/.test(line) && line.includes('|');
const startsBlock = (line, next) => !line.trim()
  || /^#{1,6}\s/.test(line)
  || /^```/.test(line)
  || /^>\s?/.test(line)
  || /^\s*(?:[-*+] |\d+\. )/.test(line)
  || (line.includes('|') && isTableDivider(next));

export function renderMarkdown(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').replace(/<!--(?:[\s\S]*?)-->/g, '').split('\n');
  const out = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(/^```\s*([\w-]*)/);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
      if (i < lines.length) i += 1;
      out.push(`<pre data-language="${escapeHtml(fence[1] || 'text')}"><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const label = heading[2].replace(/\s+#+\s*$/, '');
      const id = label.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '');
      out.push(`<h${level} id="${escapeHtml(id)}">${inline(label)}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.includes('|') && isTableDivider(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
      out.push(`<div class="table-wrap"><table class="doc-table"><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${quote.map(inline).join('<br>')}</blockquote>`);
      continue;
    }

    const list = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = /\d+\./.test(list[1]);
      const items = [];
      while (i < lines.length) {
        const item = lines[i].match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
        if (!item || /\d+\./.test(item[1]) !== ordered) break;
        items.push(item[2]);
        i += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (i < lines.length && !startsBlock(lines[i], lines[i + 1])) paragraph.push(lines[i++].trim());
    out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return out.join('\n');
}
