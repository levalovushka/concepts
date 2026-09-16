import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, readSpec } from "./lib.mjs";

const failures = [];

for (const slug of ["stol", "podacha", "shtrikh"]) {
  const spec = readSpec(slug);
  const tabs = new Set((spec.tabs || []).map((tab) => tab.id));
  const screens = new Set(spec.screens.map((screen) => screen.id));
  const permissions = new Map(spec.permissions.map((permission) => [permission.key, permission]));
  const entities = new Set((spec.product?.world?.entities || []).map((entity) => entity.id));
  const actions = new Set((spec.product?.world?.actions || []).map((action) => action.id));

  if (!tabs.has("chats")) failures.push(`${slug}: нет постоянной вкладки чатов`);
  for (const screen of ["chats", "conversation"]) if (!screens.has(screen)) failures.push(`${slug}: нет экрана ${screen}`);
  for (const entity of ["conversation", "message"]) if (!entities.has(entity)) failures.push(`${slug}: нет сущности ${entity}`);
  if (!actions.has("send-message")) failures.push(`${slug}: отправка сообщения не описана как действие продукта`);

  const commnotif = permissions.get("commnotif");
  if (!commnotif || commnotif.plist !== "com.apple.developer.usernotifications.communication") {
    failures.push(`${slug}: Communication Notifications не привязаны к корректному entitlement`);
  }
  if (!permissions.has("push")) failures.push(`${slug}: сообщения не имеют обычных push-уведомлений`);
  if (!permissions.has("mic")) failures.push(`${slug}: голосовые сообщения не имеют доступа к микрофону`);

  const chatsFile = join(ROOT, "concepts", slug, "screens", "chats.html");
  const conversationFile = join(ROOT, "concepts", slug, "screens", "conversation.html");
  let chats = "";
  let conversation = "";
  try {
    chats = readFileSync(chatsFile, "utf8");
    conversation = readFileSync(conversationFile, "utf8");
  } catch {
    failures.push(`${slug}: отсутствуют исходники экранов сообщений`);
    continue;
  }
  if (!/data-go="conversation"/.test(chats)) failures.push(`${slug}: inbox не открывает разговор`);
  if (!/data-message-context/.test(conversation)) failures.push(`${slug}: разговор не показывает продуктовый контекст`);
  if (!/data-ask="mic\|conversation\|conversation"/.test(conversation)) failures.push(`${slug}: голосовое сообщение не запрашивает микрофон по жесту`);
  if (!/data-activate="commnotif\|conversation"/.test(conversation)) failures.push(`${slug}: уведомления разговора нельзя включить из интерфейса`);
  if (!/data-show-granted="commnotif"/.test(conversation)) failures.push(`${slug}: после включения Communication Notifications нет состояния результата`);

  const rootScreens = (spec.tabs || []).map((tab) => tab.id);
  for (const id of rootScreens) {
    const source = readFileSync(join(ROOT, "concepts", slug, "screens", `${id}.html`), "utf8");
    const tabCount = (source.match(/class="tab(?:\s|\")/g) || []).length;
    if (!source.includes('data-go="chats"')) failures.push(`${slug}/${id}: из tabbar нельзя открыть чаты`);
    if (tabCount < 5) failures.push(`${slug}/${id}: tabbar содержит меньше пяти вкладок`);
  }
}

const shtrikh = readSpec("shtrikh");
const voip = shtrikh.permissions.find((permission) => permission.key === "voip");
if (!voip || !/звон|аудиоразбор/i.test([voip.feature, voip.gesture, voip.grounding].join(" "))) {
  failures.push("shtrikh: VoIP всё ещё маскирует статус, а не реальный звонок");
}

if (failures.length) {
  console.error(`three-messaging: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}
console.log("three-messaging: OK · 3 inbox · 3 contextual conversations · permissions are honest");
