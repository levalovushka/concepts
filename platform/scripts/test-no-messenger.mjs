#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readSpec } from './lib.mjs';

const policy = {
  druzya: ['messages', 'conversation', 'voice', 'call', 'lockscreen'],
  dvor: ['chats', 'chat', 'voice', 'call', 'lockscreen'],
  klass: ['messages', 'conversation', 'voice', 'call', 'lockscreen'],
  looks: ['chats', 'chat', 'voice', 'call'],
  nakat: ['chat', 'call', 'lockscreen'],
  pereezd: ['comms', 'call'],
  peresmenka: ['chat', 'call', 'lockscreen'],
  rodnya: ['chats', 'chat', 'voice', 'call', 'lockscreen'],
  tails: ['chats', 'chat', 'voice', 'call'],
  today: ['chats', 'chat', 'voice', 'call'],
  vypusk: ['messages', 'conversation', 'voice', 'call', 'lockscreen'],
  zemlyaki: ['messages', 'conversation', 'call', 'incoming'],
};

/* Communication-related platform capabilities may remain only when they are
   rebound to a bounded product feature (intercom, scheduled broadcast,
   structured service update), never to a free-form chat or addressable call. */
const requiredCapabilities = {
  druzya: ['mic', 'commnotif', 'voip'],
  dvor: ['mic', 'speech', 'commnotif', 'voip'],
  klass: ['commnotif', 'voip'],
  looks: ['commnotif', 'voip'],
  nakat: ['commnotif', 'voip'],
  pereezd: ['mic', 'push', 'commnotif', 'voip'],
  peresmenka: ['commnotif', 'voip'],
  rodnya: ['commnotif', 'voip'],
  tails: ['commnotif', 'voip'],
  today: ['commnotif', 'voip'],
  vypusk: ['commnotif', 'voip'],
  zemlyaki: ['commnotif', 'voip'],
};

const errors = [];
const staleCopy = /личн(?:ые|ых|ое) сообщения|группов(?:ые|ых) (?:разговоры|сообщения)|голосов(?:ые|ых) сообщения|сообщения между|рядом с сообщениями|сообщения и звонки/i;
for (const [slug, bannedIds] of Object.entries(policy)) {
  const spec = readSpec(slug);
  const source = readFileSync(join(ROOT, 'concepts', slug, 'concept.json'), 'utf8');
  if (staleCopy.test(source)) errors.push(`${slug}: в описании осталась механика мессенджера`);
  const banned = new Set(bannedIds);
  const declared = new Set(spec.permissions.map((permission) => permission.key));
  for (const key of requiredCapabilities[slug] || []) if (!declared.has(key)) errors.push(`${slug}: потерян переиспользованный доступ ${key}`);
  for (const screen of spec.screens) if (banned.has(screen.id)) errors.push(`${slug}: экран ${screen.id} остался в спеке`);
  for (const tab of spec.tabs || []) if (banned.has(tab.id) || /messages|chat/i.test(tab.role || '')) errors.push(`${slug}: коммуникационная вкладка ${tab.id}`);
  for (const permission of spec.permissions) {
    if (banned.has(permission.screen) || banned.has(permission.target)) errors.push(`${slug}: ${permission.key} ведёт в удалённый экран`);
    if (['commnotif', 'voip'].includes(permission.key) && /чат|переписк|личн(?:ый|ые) звон|позвонить пользователю/i.test(permission.feature || '')) {
      errors.push(`${slug}: ${permission.key} снова описан как мессенджер`);
    }
  }
  for (const prototype of spec.prototypes || []) {
    for (const id of [prototype.start, ...(prototype.screens || []), ...(prototype.stops || [])]) if (banned.has(id)) errors.push(`${slug}/${prototype.id}: ссылка на ${id}`);
  }
  for (const frame of spec.appStore?.assets?.screens || []) if (banned.has(frame.screen)) errors.push(`${slug}: App Store всё ещё использует ${frame.screen}`);
  for (const entity of spec.product?.world?.entities || []) if (/^(chat|message|conversation|call)$/i.test(entity.id || '')) errors.push(`${slug}: сущность мира ${entity.id}`);
  for (const action of spec.product?.world?.actions || []) if (banned.has(action.screen)) errors.push(`${slug}: действие мира ${action.name}`);

  const screenDir = join(ROOT, 'concepts', slug, 'screens');
  for (const screen of spec.screens) {
    const file = join(screenDir, `${screen.id}.html`);
    const html = readFileSync(file, 'utf8');
    if (staleCopy.test(html)) errors.push(`${slug}/${screen.id}: в интерфейсе остался текст мессенджера`);
    for (const id of banned) if (new RegExp(`data-(?:go|ask|activate|toast)="[^"]*(?:\\||^)${id}(?:\\||")`).test(html) || html.includes(`data-go="${id}"`)) errors.push(`${slug}/${screen.id}: переход в ${id}`);
  }

  if (slug === 'dvor') {
    const nativeDir = join(ROOT, 'native-apps', slug, 'Sources');
    if (existsSync(nativeDir)) {
      const swift = readdirSync(nativeDir).filter((file) => file.endsWith('.swift')).map((file) => readFileSync(join(nativeDir, file), 'utf8')).join('\n');
      if (/\b(?:ChatsView|ChatView|VoiceMessageView|UserCallView)\b/.test(swift)) errors.push('dvor: мессенджер остался в SwiftUI');
      for (const key of requiredCapabilities.dvor) if (!new RegExp(`case\\s+${key}\\b`).test(swift)) errors.push(`dvor: SwiftUI не поддерживает ${key}`);
    }
  }
}

if (errors.length) {
  console.error(`no-messenger: FAIL (${errors.length})\n  · ${errors.join('\n  · ')}`);
  process.exit(1);
}
console.log(`no-messenger: OK · ${Object.keys(policy).length} концептов · 0 мессенджеров · доступы привязаны к продуктовым сценариям`);
