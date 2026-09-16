import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, readSpec } from "./lib.mjs";

const failures = [];
const messengerAccents = new Set();

for (const slug of ["stol", "podacha", "shtrikh"]) {
  const spec = readSpec(slug);
  const tabs = new Set((spec.tabs || []).map((tab) => tab.id));
  const screens = new Set(spec.screens.map((screen) => screen.id));
  const permissions = new Map(spec.permissions.map((permission) => [permission.key, permission]));
  const entities = new Set((spec.product?.world?.entities || []).map((entity) => entity.id));
  const actions = new Set((spec.product?.world?.actions || []).map((action) => action.id));
  const productActions = spec.product?.world?.actions || [];

  if (!tabs.has("chats")) failures.push(`${slug}: нет постоянной вкладки чатов`);
  for (const screen of ["chats", "conversation"]) if (!screens.has(screen)) failures.push(`${slug}: нет экрана ${screen}`);
  for (const entity of ["conversation", "message"]) if (!entities.has(entity)) failures.push(`${slug}: нет сущности ${entity}`);
  if (!actions.has("send-message")) failures.push(`${slug}: отправка сообщения не описана как действие продукта`);
  if (!productActions.some((action) => (action.capabilities || []).includes("voip"))) failures.push(`${slug}: VoIP не связан с действием продуктового мира`);

  const commnotif = permissions.get("commnotif");
  if (!commnotif || commnotif.plist !== "com.apple.developer.usernotifications.communication") {
    failures.push(`${slug}: Communication Notifications не привязаны к корректному entitlement`);
  }
  if (!permissions.has("push")) failures.push(`${slug}: сообщения не имеют обычных push-уведомлений`);
  if (!permissions.has("mic")) failures.push(`${slug}: голосовые сообщения не имеют доступа к микрофону`);
  if (!permissions.has("voip")) failures.push(`${slug}: звонок не имеет честного VoIP-сценария`);

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
  const topbar = conversation.match(/<header[^>]*chat-top[^>]*>([\s\S]*?)<\/header>/)?.[1] || "";
  if (!/data-ask="mic\+voip\|conversation\|conversation"/.test(topbar)) failures.push(`${slug}: звонок в топбаре не запрашивает микрофон перед VoIP`);
  if (/data-activate="commnotif\|conversation"/.test(topbar)) failures.push(`${slug}: уведомления ошибочно вынесены в топбар разговора`);
  const settingsSources = ["settings", "meters"].filter((id) => screens.has(id)).map((id) => readFileSync(join(ROOT, "concepts", slug, "screens", `${id}.html`), "utf8")).join("\n");
  if (!/data-activate="commnotif\|settings"/.test(settingsSources)) failures.push(`${slug}: именные уведомления нельзя включить в настройках`);
  if (!/data-switch="commnotif"/.test(settingsSources)) failures.push(`${slug}: переключатель именных уведомлений не отражает состояние доступа`);
  if (!/data-show-granted="voip"/.test(conversation)) failures.push(`${slug}: после запуска звонка нет состояния результата`);

  const styles = readFileSync(join(ROOT, "concepts", slug, "styles.css"), "utf8");
  const prefix = { stol: "st", podacha: "p", shtrikh: "s" }[slug];
  const accent = styles.match(new RegExp(`--${prefix}-chat-accent:\\s*(#[0-9a-f]{6})`, "i"))?.[1].toLowerCase();
  if (!accent) failures.push(`${slug}: цвет мессенджера не закреплён токеном концепта`);
  else messengerAccents.add(accent);
  const tokenUses = (styles.match(new RegExp(`var\\(--${prefix}-chat-accent\\)`, "g")) || []).length;
  if (tokenUses < 4) failures.push(`${slug}: цвет мессенджера не проведён через интерактивные состояния`);
  if (slug === "podacha" && accent !== "#0077ff") failures.push("podacha: управляющие состояния мимикрии ВК должны использовать VK-синий #0077ff");

  for (const screen of spec.screens) {
    if (["settings", "meters"].includes(screen.id)) continue;
    const source = readFileSync(join(ROOT, "concepts", slug, "screens", `${screen.id}.html`), "utf8");
    if (/data-activate="commnotif\|/.test(source)) failures.push(`${slug}/${screen.id}: управление уведомлениями находится вне настроек`);
  }

  const rootScreens = (spec.tabs || []).map((tab) => tab.id);
  for (const id of rootScreens) {
    const source = readFileSync(join(ROOT, "concepts", slug, "screens", `${id}.html`), "utf8");
    const tabCount = (source.match(/class="tab(?:\s|\")/g) || []).length;
    if (!source.includes('data-go="chats"')) failures.push(`${slug}/${id}: из tabbar нельзя открыть чаты`);
    if (tabCount < 5) failures.push(`${slug}/${id}: tabbar содержит меньше пяти вкладок`);
  }
}

if (messengerAccents.size !== 3) failures.push("мессенджеры снова используют один и тот же акцентный цвет");

const shtrikh = readSpec("shtrikh");
const voip = shtrikh.permissions.find((permission) => permission.key === "voip");
if (!voip || !/звон|аудиоразбор/i.test([voip.feature, voip.gesture, voip.grounding].join(" "))) {
  failures.push("shtrikh: VoIP всё ещё маскирует статус, а не реальный звонок");
}
const shtrikhConversation = readFileSync(join(ROOT, "concepts", "shtrikh", "screens", "conversation.html"), "utf8");
if (/s-critique-call/.test(shtrikhConversation)) failures.push("shtrikh: звонок дублируется отдельной карточкой в ленте");

if (failures.length) {
  console.error(`three-messaging: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}
console.log("three-messaging: OK · 3 inbox · 3 contextual conversations · permissions are honest");
