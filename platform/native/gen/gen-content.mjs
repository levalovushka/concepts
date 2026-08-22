#!/usr/bin/env node
// Генератор контента: concept.json (+ маленький content.domain.json) -> content.json.
//
// Граница по риску, как и в остальном пайплайне:
//  • СТРУКТУРА и экраны, несущие доступы, выводятся ДЕТЕРМИНИРОВАННО из concept.json
//    (permissions[] уже содержит жест, фичу, экран, target, fallback — этого хватает
//    на настоящие продуктовые экраны: проект, настройки, реклама, съёмка, устройства);
//  • ДОМЕННОЕ наполнение (названия уроков, заметки, магазины) берётся из content.domain.json —
//    маленького файла, который пишет автор или генерирует LLM из продуктовых полей спеки.
//
// Итог: разработчик правит спеку и крошечный доменный файл, а полный content.json —
// со всей разводкой доступов и навигации — собирается сам.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: gen-content.mjs <slug>"); process.exit(1); }

const dir = join(ROOT, "concepts", slug);
const spec = JSON.parse(readFileSync(join(dir, "concept.json"), "utf8"));
const domainPath = join(dir, "content.domain.json");
const domain = existsSync(domainPath) ? JSON.parse(readFileSync(domainPath, "utf8")) : {};

const perms = spec.permissions || [];
const permByKey = k => perms.find(p => p.key === k);
const permsOnScreen = id => perms.filter(p => p.screen === id);
const permTargeting = id => perms.find(p => p.target === id);
const screenById = id => (spec.screens || []).find(s => s.id === id);

// Санитайзер технических терминов: правила UX-копирайтинга соблюдаются даже
// если в concept.json просочился жаргон (feature/gesture пишет автор спеки).
const TERMS = [
  [/\bPicture in Picture\b/gi, "плавающее окно"],
  [/\bPiP\b/g, "плавающее окно"],
  [/\bBonjour\b/gi, "локальная сеть"],
  [/\bLocal Network\b/gi, "локальная сеть"],
  [/\bIDFA\b/g, "рекламный идентификатор"],
  [/\bNow Playing\b/gi, "экран воспроизведения"],
];
const clean = s => TERMS.reduce((a, [re, to]) => a.replace(re, to), String(s ?? "")).replace(/\s+—\s+$/,"").trim();

const ICON = {
  camera: "video", photo: "photo", speech: "waveform", mic: "mic",
  location: "location", push: "bell", tracking: "hand.raised",
  localnet: "tv", audio: "speaker.wave.2",
};

// --- вывод layout'а по роли экрана ---
const tabIds = new Set((spec.tabs || []).map(t => t.id));
const slice = spec.product?.verticalSlice || {};
const mimicry = spec.positioning?.mode === "mimicry";

function resolveLayout(s) {
  const t = (s.type || "").toLowerCase();
  const onScreen = permsOnScreen(s.id);
  const target = permTargeting(s.id);
  const hasCamera = onScreen.some(p => p.key === "camera");
  const isTab = tabIds.has(s.id) || t.includes("tab");
  const tag = (s.id + " " + (s.title || "") + " " + (s.meta || "")).toLowerCase();

  // Мимикрия под соцсеть ВК: лента, мессенджер, профиль
  if (mimicry) {
    if (isTab && s.id === slice.entry) return "feed";
    if (isTab && /chat|messag|сообщ|диалог/.test(tag)) return "chatlist";
    if (isTab && /profile|профил/.test(tag)) return "profile";
    if (t.includes("push") && /chat|сообщ|диалог|thread/.test(tag)) return "thread";
  }

  if (s.id === slice.action && t.includes("fullscreen")) return "cockpit";
  const cameraHere = hasCamera || permTargeting(s.id)?.key === "camera" || /camera/i.test(s.meta || "");
  if (t.includes("fullscreen") && cameraHere) return "capture";
  if (onScreen.some(p => p.key === "tracking")) return "notice";
  if (target && (target.key === "localnet" || target.key === "location")) return "finder";
  if (isTab && s.id === slice.entry) return "home";
  if (isTab && (onScreen.some(p => ["push","tracking"].includes(p.key)) || permTargeting(s.id))) return "settings";
  if (isTab) return "catalog";
  // push-экран с дочерними экранами доступов -> детальная карточка
  if (t.includes("push")) return "detail";
  if (t.includes("modal") || t.includes("sheet")) return "detail";
  return null;
}

// --- деривация контента, несущего доступы ---

// Проект / детальная карточка: материалы = доступы этого экрана, заметки = домен
function deriveDetail(s, dom) {
  const rows = permsOnScreen(s.id).map(p => ({
    title: clean(p.gesture.replace(/[«»]/g, "").split(" / ")[0]),
    subtitle: clean(p.feature),
    icon: ICON[p.key] || "circle",
    permission: p.key,
    opens: p.target && p.target !== s.id ? p.target : undefined,
    chevron: true,
  }));
  const groups = [];
  if (dom?.header) { /* header handled below */ }
  if (rows.length) groups.push({ header: dom?.materialsTitle || "Материалы", rows });
  if (dom?.notes?.length) {
    groups.push({
      header: dom.notesTitle || "Заметки",
      footer: dom.notesFooter,
      rows: dom.notes.map(n => ({ title: n.text, value: n.at })),
    });
  }
  for (const g of (dom?.groups || [])) groups.push(g);
  return {
    layout: "detail",
    headerTitle: dom?.header?.title,
    headerSubtitle: dom?.header?.subtitle,
    groups,
  };
}

// Настройки: профиль + разделы по доступам + «о приложении»
function deriveSettings(s, dom) {
  const groups = [];
  const phone = spec.appStore?.reviewAccount?.phone;
  if (phone) groups.push({ header: "Профиль", rows: [
    { title: phone, subtitle: dom?.profileSubtitle || "Номер входа" },
  ]});

  const playback = perms.filter(p => ["localnet","audio"].includes(p.key));
  if (playback.length) groups.push({ header: "Воспроизведение", rows: playback.map(p => ({
    title: clean(p.gesture.replace(/[«»]/g, "").split(" / ")[0]),
    subtitle: clean(p.feature),
    permission: p.key,
    ...(p.key === "audio" ? { toggle: true } : { opens: p.target !== s.id ? p.target : undefined, chevron: true }),
  }))});

  const push = permByKey("push");
  if (push) groups.push({ header: "Уведомления", footer: dom?.pushFooter, rows: [
    { title: clean(push.feature), permission: "push", toggle: true },
  ]});

  const tracking = permByKey("tracking");
  if (tracking) groups.push({ header: "Приватность", rows: [
    { title: clean(tracking.feature), subtitle: dom?.trackingSubtitle || "Можно отключить в любой момент",
      permission: "tracking", opens: tracking.screen !== s.id ? tracking.screen : undefined, chevron: true },
  ]});

  const about = { header: "О приложении", rows: [
    { title: "Помощь", chevron: true },
    { title: "Поддержка", chevron: true },
    { title: "Пользовательское соглашение", chevron: true },
    { title: "Версия", value: spec.appStore ? "1.0" : undefined },
  ].filter(r => r.title !== "Версия" || r.value) };
  groups.push(about);
  return { layout: "settings", groups };
}

// Съёмка: из доступа к камере
function deriveCapture(s, dom) {
  const cam = permsOnScreen(s.id).find(p => p.key === "camera") || permByKey("camera");
  const isScan = /скан|этикет|barcode/i.test((s.title || "") + (s.meta || ""));
  return {
    layout: "capture",
    hint: dom?.hint || cam?.feature || "Наведите камеру",
    shutter: isScan ? (dom?.shutter || "Сканировать") : "",
    scanFrame: isScan,
    permission: "camera",
    manualScreen: isScan ? (dom?.manualScreen || null) : null,
  };
}

// Реклама / ATT: экран-объяснение перед системным запросом
function deriveNotice(s, dom) {
  const tr = permByKey("tracking");
  return {
    layout: "notice",
    icon: dom?.icon || "sparkles.tv",
    title: dom?.title || "Бесплатно с рекламой",
    paragraphs: dom?.paragraphs || [clean(tr?.feature), "Разрешение показывает рекламу по интересам. Без него — обычная, приложение работает так же"].filter(Boolean),
    primary: dom?.primary || "Разрешить рекламу по интересам",
    primaryPermission: "tracking",
    primaryTarget: tr?.target || null,
    secondary: dom?.secondary || "Обычная реклама",
    secondaryTarget: tr?.target || null,
  };
}

// Устройства / магазины: пустой каркас из фичи, результаты — домен
function deriveFinder(s, dom) {
  const tgt = permTargeting(s.id);
  return {
    layout: "finder",
    note: dom?.note || tgt?.reviewNote || "Показано найденное поблизости",
    actionLabel: dom?.actionLabel || (tgt?.key === "location" ? "Маршрут" : "Показать"),
    results: dom?.results || [],
  };
}

// --- сборка ---
const content = {};
for (const s of (spec.screens || [])) {
  if (["phone","code","codefail"].includes(s.id)) continue;
  const layout = resolveLayout(s);
  const dom = domain[s.id] || {};
  if (layout === "home" || layout === "catalog") {
    // структура домашнего/каталога — домен (hero + секции), но layout выведен
    if (dom.sections) content[s.id] = { layout: "catalog", ...(dom.hero ? { hero: dom.hero } : {}), sections: dom.sections };
  } else if (layout === "cockpit") {
    const localnet = permByKey("localnet");
    content[s.id] = {
      layout: "cockpit",
      project: dom.project, lessonTitle: dom.lessonTitle, lessonMeta: dom.lessonMeta,
      current: dom.current ?? 0, goal: dom.goal,
      castTarget: dom.castTarget || localnet?.feature || "Телевизор",
      schemaCaption: dom.schemaCaption || "",
    };
  } else if (layout === "settings") {
    content[s.id] = deriveSettings(s, dom);
  } else if (layout === "detail") {
    const d = deriveDetail(s, dom);
    if (d.groups.length || d.headerTitle) content[s.id] = d; // пустую детальную не добавляем
  } else if (layout === "capture") {
    content[s.id] = deriveCapture(s, dom);
  } else if (layout === "notice") {
    content[s.id] = deriveNotice(s, dom);
  } else if (layout === "finder") {
    content[s.id] = deriveFinder(s, dom);
  } else if (layout === "feed") {
    if (dom.posts) content[s.id] = { layout: "feed", posts: dom.posts };
  } else if (layout === "chatlist") {
    if (dom.chats) content[s.id] = { layout: "chatlist", chats: dom.chats };
  } else if (layout === "thread") {
    if (dom.messages) content[s.id] = { layout: "thread", peer: dom.peer || s.title, messages: dom.messages };
  } else if (layout === "profile") {
    if (dom.name) content[s.id] = { layout: "profile", name: dom.name, status: dom.status || "", stats: dom.stats || [], posts: dom.posts ?? 9 };
  }
}

writeFileSync(join(dir, "content.json"), JSON.stringify(content, null, 2) + "\n");
const derived = Object.keys(content).length;
console.log(`✓ content.json собран из спеки: ${derived} экранов`);
console.log(`  доменных подсказок в content.domain.json: ${Object.keys(domain).length}`);
