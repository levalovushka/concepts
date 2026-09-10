#!/usr/bin/env node
/**
 * Regenerates the two full, web-only VK access concepts.
 * This intentionally writes HTML prototypes and concept manifests only; there is no SwiftUI output.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../concepts/", import.meta.url).pathname;
const recipes = {
  auth: ["default", "loading", "error"],
  collection: ["default", "empty"],
  detail: ["default"],
  task: ["default", "error"],
  player: ["default", "loading", "error"],
  capture: ["default", "denied"],
  editor: ["default", "error", "success"],
  settings: ["default"],
  state: ["default"],
  system: ["default"],
};

const ui = (
  pattern,
  navigation,
  purpose,
  primaryAction,
  density = "medium",
) => ({
  pattern,
  navigation,
  purpose,
  primaryAction,
  hierarchy: {
    primary: "Главный объект сценария и его актуальное состояние",
    secondary: "Контекст, последствия действия и доступный запасной путь",
  },
  states: recipes[pattern],
  density,
  contentCases: [
    {
      kind: "typical",
      example:
        "Карточка «Корпус лампы» показывает автора, срок 20:10 и доступное действие",
    },
    {
      kind: "stress",
      example:
        "Несколько одновременных событий, длинные имена и перенесённое время",
    },
    {
      kind: "failure",
      example:
        "Нет сети или системного доступа, но локальный запасной путь остаётся видимым",
    },
  ],
});

const screen = (
  id,
  title,
  parent,
  pattern,
  navigation,
  purpose,
  primaryAction,
  light,
  density = "medium",
) => ({
  id,
  title,
  type: navigation === "root" ? "tab (root)" : navigation,
  light,
  ...(parent ? { parent } : {}),
  meta: purpose,
  ui: ui(pattern, navigation, purpose, primaryAction, density),
});

const permission = (
  key,
  plist,
  title,
  text,
  feature,
  gesture,
  screenId,
  target,
  opts = {},
) => ({
  key,
  plist,
  alert: { title, text },
  feature,
  gesture,
  screen: screenId,
  target,
  ...(opts.activate ? { activate: true } : {}),
  fallback:
    opts.fallback ||
    "Функция остаётся доступна вручную внутри приложения без системной интеграции",
  snack:
    opts.snack || "Системная функция недоступна — используйте ручной вариант",
  risk: opts.risk || "medium",
  anchor: !!opts.anchor,
  conditional: !!opts.conditional,
  ...(opts.requires ? { requires: opts.requires } : {}),
  grounding:
    opts.grounding ||
    "Нативный iOS API вызывается только после явного действия пользователя",
});

const icon = (name) => {
  const aliases = {
    hammer: "wrench",
    "share-2": "share",
    "graduation-cap": "book-open",
    tool: "wrench",
    "circle-help": "info",
    layers: "layout-grid",
    "map-pin-check": "map-pin",
    contact: "users",
    "refresh-cw": "repeat-2",
    "badge-dollar-sign": "banknote",
    lamp: "zap",
    "check-circle": "circle-check",
    anchor: "navigation",
    radio: "audio-lines",
    wind: "gauge",
    sailboat: "navigation",
  };
  return `<svg class="ico-svg"><use href="#i-${aliases[name] || name}"/></svg>`;
};
const denied = (keys, text) =>
  `<div class="cx-denied perm-hidden" data-show-denied="${keys}"><b>Можно продолжить</b><span>${text}</span></div>`;
const row = (iconName, title, subtitle, action = "") =>
  `<button class="cx-row tap" ${action}>${icon(iconName)}<span><b>${title}</b><small>${subtitle}</small></span>${icon("chevron-right")}</button>`;
const chip = (text, on = false) =>
  `<button class="cx-chip tap${on ? " is-on" : ""}" data-toast="Фильтр: ${text}">${text}</button>`;
const section = (title, body, meta = "") =>
  `<section class="cx-section"><header><h2>${title}</h2>${meta ? `<span>${meta}</span>` : ""}</header>${body}</section>`;
const cleanLintMarkers = (source) =>
  source
    .replace(
      /<span\b(?=[^>]*class="(?:pc-page|vs-tabs))[^>]*><\/span>\s*/gs,
      "",
    )
    .replace(
      /<template\b(?=[^>]*class="(?:pc-page|vs-tabs))[^>]*><\/template>\s*/gs,
      "",
    );

function tabbar(kind, active) {
  const defs =
    kind === "vs"
      ? [
          ["feed", "hammer", "Сегодня"],
          ["discussions", "message-circle", "Обсуждения"],
          ["projects", "layers", "Проекты"],
          ["profile", "user", "Профиль"],
        ]
      : [
          ["feed", "anchor", "Выходы"],
          ["discussions", "radio", "Эфир"],
          ["fleet", "sailboat", "Флот"],
          ["profile", "user", "Профиль"],
        ];
  return `<div class="tabbar ${kind === "vs" ? "light " : ""}${kind}-tabs" aria-label="Основная навигация">${defs.map(([id, ico, label]) => `<div class="tab tap${active === id ? " is-on" : ""}" ${active === id ? 'aria-current="page" ' : ""}data-go="${id}" aria-label="Раздел ${label}"><span class="ico">${icon(ico)}</span><span class="tab-label">${label}</span></div>`).join("")}</div>`;
}

function shell(
  kind,
  id,
  title,
  body,
  { parent = false, rootTab = null, primary = null, dark = false } = {},
) {
  const back = parent
    ? `<div class="navbar cx-nav"><div class="nav-leading"><button class="btn-plain tap" data-back aria-label="Назад"><svg class="ios-back" viewBox="0 0 12 21" fill="none"><path d="M10.25 1.75L1.75 10.5l8.5 8.75" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="title">${title}</div></div>`
    : "";
  return `<div class="screen ${kind}-page cx-page${dark ? " cx-night" : ""}" id="scr-${id}">${back}<div class="body-scroll cx-scroll${parent ? "" : ` ${kind}-safe`}">${!parent ? `<header class="cx-top"><div><span>${kind === "vs" ? "МАСТЕРСКАЯ НА ЛЕСНОЙ" : "МАРИНА · СЕВЕРНЫЙ ПИРС"}</span><h1>${title}</h1></div></header>` : ""}${body}${primary || ""}</div>${rootTab ? tabbar(kind, rootTab) : ""}<div class="home-ind" aria-hidden="true"></div></div>`;
}

function writeConcept(slug, mutate, screensHtml) {
  const dir = join(root, slug);
  const source = readFileSync(join(dir, "concept.json"), "utf8");
  let spec;
  try {
    spec = JSON.parse(source);
  } catch {
    // Recovery for the single interrupted expansion that left one extra brace.
    spec = JSON.parse(
      source.replace(
        /\n\s*}\n\s*}\n\s*],\n\s*"screens"/,
        '\n    }\n  ],\n  "screens"',
      ),
    );
  }
  mutate(spec);
  writeFileSync(
    join(dir, "concept.json"),
    JSON.stringify(spec, null, 2) + "\n",
  );
  const screenDir = join(dir, "screens");
  mkdirSync(screenDir, { recursive: true });
  for (const [id, html] of Object.entries(screensHtml))
    writeFileSync(join(screenDir, `${id}.html`), html + "\n");
}

const vsScreens = [
  screen(
    "phone",
    "Вход",
    null,
    "auth",
    "push",
    "Войти или продолжить без аккаунта",
    "Далее",
    true,
    "low",
  ),
  screen(
    "feed",
    "Сегодня в мастерской",
    null,
    "collection",
    "root",
    "Показать текущие работы и людей на месте",
    "Отметиться в мастерской",
    true,
    "high",
  ),
  screen(
    "discussions",
    "Обсуждения",
    null,
    "collection",
    "root",
    "Собрать вопросы по работам и зонам",
    "Последний проход по кромке",
    true,
    "high",
  ),
  screen(
    "projects",
    "Проекты",
    null,
    "collection",
    "root",
    "Показать активные работы и передачи",
    "Новый этап",
    true,
    "high",
  ),
  screen(
    "profile",
    "Профиль участника",
    null,
    "settings",
    "root",
    "Управлять идентичностью и интеграциями",
    "Аккаунт",
    true,
    "high",
  ),
  screen(
    "checkin",
    "Отметка присутствия",
    "feed",
    "task",
    "push",
    "Выбрать зону и подтвердить присутствие",
    "Подтвердить присутствие",
    true,
  ),
  screen(
    "present",
    "Присутствие подтверждено",
    "checkin",
    "detail",
    "push",
    "Показать результат проверки присутствия",
    "Проверить сеть",
    true,
  ),
  screen(
    "thread",
    "Помощь с фрезером",
    "discussions",
    "detail",
    "push",
    "Ответить на предметный вопрос по операции",
    "Предложить помощь",
    true,
    "high",
  ),
  screen(
    "project",
    "Полка для винила",
    "projects",
    "detail",
    "push",
    "Собрать этапы, файлы и следующую передачу",
    "Передать работу",
    true,
    "high",
  ),
  screen(
    "create",
    "Новый этап",
    "projects",
    "editor",
    "modal",
    "Создать публикацию о ходе проекта",
    "Камера",
    true,
  ),
  screen(
    "camera",
    "Камера этапа",
    "create",
    "capture",
    "fullscreen",
    "Снять новый кадр этапа работы",
    "Использовать кадр",
    true,
    "low",
  ),
  screen(
    "library",
    "Медиатека",
    "create",
    "system",
    "system",
    "Выбрать готовые фотографии проекта",
    "Выбрать 3 фото",
    true,
    "low",
  ),
  screen(
    "voice",
    "Передача работы",
    "project",
    "capture",
    "modal",
    "Надиктовать состояние незаконченной работы",
    "Записать передачу",
    true,
    "low",
  ),
  screen(
    "schedule",
    "Бронь фрезера",
    "project",
    "task",
    "push",
    "Добавить бронь оборудования в календарь",
    "Добавить бронь в календарь",
    true,
  ),
  screen(
    "briefing",
    "Инструктаж",
    "project",
    "detail",
    "push",
    "Подготовить безопасную операцию по шагам",
    "Слушать инструктаж",
    true,
  ),
  screen(
    "nowplaying",
    "Инструктаж играет",
    "briefing",
    "player",
    "fullscreen",
    "Управлять фоновым инструктажем",
    "Вернуться к проекту",
    true,
    "low",
  ),
  screen(
    "sync",
    "Фоновое обновление",
    "profile",
    "settings",
    "push",
    "Управлять обновлением ленты и расписания",
    "Тихие push-обновления",
    true,
    "high",
  ),
  screen(
    "widget",
    "Виджет мастерской",
    "profile",
    "settings",
    "push",
    "Подключить виджет и общую сессию",
    "Общие данные",
    true,
  ),
  screen(
    "credentials",
    "Пароли мастерской",
    "profile",
    "settings",
    "push",
    "Подключить автозаполнение порталов",
    "Включить автозаполнение",
    true,
  ),
  screen(
    "network",
    "Сеть мастерской",
    "profile",
    "task",
    "push",
    "Добавить гостевую сеть по известной конфигурации",
    "Подключиться к сети",
    true,
  ),
  screen(
    "lock",
    "Приватные материалы",
    "profile",
    "settings",
    "push",
    "Закрыть сметы и чертежи биометрией",
    "Включить Face ID",
    true,
  ),
  screen(
    "alerts",
    "Оповещения",
    "discussions",
    "settings",
    "push",
    "Настроить ответы и освобождение станков",
    "Ответы и станки",
    true,
    "high",
  ),
  screen(
    "sponsors",
    "Партнёрские предложения",
    "profile",
    "settings",
    "push",
    "Объяснить персонализацию рекламы отдельно от функций",
    "Показывать подходящее",
    true,
  ),
];

const vsHtml = {
  discussions: shell(
    "vs",
    "discussions",
    "Обсуждения",
    `${section("Нужна помощь", row("tool", "Последний проход по кромке", "Лена · фрезерная · 4 ответа", 'data-primary data-go="thread"') + row("circle-help", "Как закрепить тонкую фанеру?", "Олег · лазер · 2 ответа", 'data-go="thread"'))}${section("По зонам", `<div class="cx-chips">${chip("Фрезер", true)}${chip("Лазер")}${chip("Сборка")}</div>`)}${row("bell", "Оповещения", "Ответы и освободившиеся станки", 'data-go="alerts"')}`,
    { rootTab: "discussions" },
  ),
  projects: shell(
    "vs",
    "projects",
    "Проекты",
    `${section("В работе", row("layers", "Полка для винила", "5 этапов · следующий: передача", 'data-go="project"') + row("lamp", "Корпус лампы", "Фрезеровка · готово 72%", 'data-go="project"'))}${section("Черновики", `<div class="cx-project-card"><span>СЕГОДНЯ · 18:42</span><b>Тест посадки шипа</b><p>Без медиа · сохранено на этом iPhone</p></div>`)}`,
    {
      rootTab: "projects",
      primary: `<button class="cx-fab tap" data-primary data-go="create" aria-label="Новый этап"><span>Новый этап</span>${icon("plus")}</button>`,
    },
  ),
  profile: shell(
    "vs",
    "profile",
    "Профиль",
    `<div class="cx-profile"><div class="cx-avatar ph"></div><h2>Алексей Морозов</h2><p>дерево · фрезер · сборка</p><div><b>14</b><span>работ</span><b>6</b><span>помощей</span></div></div>${section("Люди", row("contact", "Найти знакомых", "Сопоставление только после вашего действия", 'data-ask="contacts|profile|profile"') + denied("contacts", "Ищите участников мастерской по имени."))}${section("Интеграции", row("refresh-cw", "Фон и синхронизация", "Лента, push и плановые задачи", 'data-go="sync"') + row("layout-grid", "Виджет мастерской", "Ближайшая бронь на экране Домой", 'data-go="widget"') + row("key", "Пароли мастерской", "Автозаполнение учебных порталов", 'data-go="credentials"') + row("wifi", "Гостевая сеть", "Подключение по конфигурации стенда", 'data-go="network"') + row("lock", "Приватные материалы", "Сметы и чертежи под Face ID", 'data-go="lock"') + row("badge-dollar-sign", "Партнёры", "Настройка бесплатной модели", 'data-go="sponsors"'))}${row("user", "Аккаунт", "Телефон, выход и удаление данных", 'data-primary data-go="account"')}`,
    { rootTab: "profile" },
  ),
  thread: shell(
    "vs",
    "thread",
    "Помощь с фрезером",
    `<article class="cx-feature"><span>ЛЕНА · ФРЕЗЕРНАЯ</span><h1>Нужна вторая пара рук</h1><p>На последнем проходе надо удержать шаблон десять минут. Начну в 19:10.</p><div class="cx-media ph"></div></article>${section("Ответы", `<div class="cx-comment"><b>Марат</b><p>Буду свободен в 19:20, могу подойти.</p></div><div class="cx-comment"><b>Алексей</b><p>Я рядом со сборочным столом.</p></div>`)}<button class="cx-primary tap" data-primary data-toast="Лена увидит, что вы подойдёте">Предложить помощь</button>`,
    { parent: true },
  ),
  project: shell(
    "vs",
    "project",
    "Полка для винила",
    `<div class="cx-hero-media ph"></div><div class="cx-title"><span>АКТИВНЫЙ ПРОЕКТ · 72%</span><h1>Полка для винила</h1><p>Сборочный стол 2 · до 21:30</p></div>${section("Следующий шаг", row("mic", "Передать работу", "Что сделано и что нельзя трогать", 'data-primary data-go="voice"') + row("calendar", "Бронь фрезера", "Завтра · 18:30–19:15", 'data-go="schedule"') + row("headphones", "Инструктаж", "Фрезеровка паза · 4:18", 'data-go="briefing"'))}${section("Файлы", row("file-text", "Чертёж v4", "PDF · обновлён сегодня", 'data-toast="Чертёж открыт"'))}`,
    { parent: true },
  ),
  create: shell(
    "vs",
    "create",
    "Новый этап",
    `<div class="cx-compose"><label><span>Что изменилось</span><textarea placeholder="Например, собрал корпус и оставил струбцины до утра"></textarea></label><div class="cx-media-slots"><div>+</div><div>+</div><div>+</div></div></div>${denied("camera", "Добавьте текст или выберите готовый снимок.")}${denied("photos", "Сделайте новый кадр или опубликуйте только текст.")}${row("camera", "Камера", "Снять состояние прямо сейчас", 'data-primary data-ask="camera|camera|create"')}${row("image", "Медиатека", "Выбрать готовые кадры", 'data-ask="photos|library|create"')}${row("share-2", "Из другого приложения", "Share Extension создаст черновик", 'data-activate="shareext|create"')}`,
    { parent: true },
  ),
  camera: shell(
    "vs",
    "camera",
    "Камера этапа",
    `<div class="cx-camera ph"><span>СБОРКА · ЭТАП 5</span><i></i></div><p class="cx-hint">Совместите край детали с направляющей. Оригинал останется в черновике.</p><button class="cx-primary tap" data-primary data-go="create">Использовать кадр</button>`,
    { parent: true, dark: true },
  ),
  library: shell(
    "vs",
    "library",
    "Медиатека",
    `<div class="cx-system-note">Системный PHPicker · приложение увидит только выбранные файлы</div><div class="cx-grid">${Array.from({ length: 9 }, (_, i) => `<button class="ph tap" data-toast="Фото ${i + 1} выбрано" aria-label="Выбрать фото ${i + 1}"></button>`).join("")}</div><button class="cx-primary tap" data-primary data-go="create">Выбрать 3 фото</button>`,
    { parent: true },
  ),
  voice: shell(
    "vs",
    "voice",
    "Передача работы",
    `<div class="cx-recorder">${icon("mic")}<span>00:00</span><div>${Array.from({ length: 18 }, (_, i) => `<i style="height:${10 + (i % 5) * 5}px"></i>`).join("")}</div><p>Скажите, что завершено, что сохнет и с какого шага продолжать.</p></div>${denied("mic,speech", "Напишите передачу текстом; проект и чек-лист сохранятся.")}<button class="cx-primary tap" data-primary data-ask="mic+speech|voice|voice">Записать передачу</button>`,
    { parent: true },
  ),
  schedule: shell(
    "vs",
    "schedule",
    "Бронь фрезера",
    `<div class="cx-ticket"><span>ЗАВТРА</span><h1>18:30–19:15</h1><p>Фрезерный стол · паз под заднюю стенку</p></div>${section("Участники", row("user", "Алексей Морозов", "Владелец проекта", 'data-toast="Профиль открыт"'))}${denied("calendar", "Бронь останется в расписании мастерской.")}<button class="cx-primary tap" data-primary data-ask="calendar|schedule|schedule">Добавить бронь в календарь</button>`,
    { parent: true },
  ),
  briefing: shell(
    "vs",
    "briefing",
    "Инструктаж",
    `<div class="cx-audio-cover"><span>04:18</span>${icon("headphones")}<h1>Фрезеровка паза</h1><p>7 шагов · автор: мастер Илья</p></div>${section("Перед стартом", `<ol class="cx-steps"><li>Проверьте цангу и упор</li><li>Сделайте пробный проход</li><li>Работайте против подачи</li></ol>`)}<button class="cx-primary tap" data-primary data-activate="audio|nowplaying">Слушать инструктаж</button>`,
    { parent: true },
  ),
  nowplaying: shell(
    "vs",
    "nowplaying",
    "Инструктаж играет",
    `<div class="cx-player"><div class="cx-album">ВР<b>05</b></div><span>ШАГ 2 ИЗ 7</span><h1>Сделайте пробный проход</h1><div class="cx-progress"><i></i></div><div class="cx-controls"><button class="tap" data-toast="Назад 15 секунд" aria-label="Назад 15 секунд">−15</button><button class="tap" data-toast="Пауза" aria-label="Пауза">${icon("pause")}</button><button class="tap" data-toast="Вперёд 15 секунд" aria-label="Вперёд 15 секунд">+15</button></div></div><button class="cx-primary tap" data-primary data-go="project">Вернуться к проекту</button>`,
    { parent: true, dark: true },
  ),
  sync: shell(
    "vs",
    "sync",
    "Фоновое обновление",
    `${section("Состояние", `<div class="cx-status"><b>Лента свежая</b><span>Последнее обновление · 18:46</span><i></i></div>`)}${row("bell", "Тихие push-обновления", "Занятость зон при закрытом приложении", 'data-primary data-activate="remotenotif|sync"')}${row("refresh-cw", "Готовить ленту заранее", "Небольшой снимок перед открытием", 'data-activate="fetch|sync"')}${row("clock", "Плановое обслуживание", "Очистка старых черновиков", 'data-activate="bgtask|sync"')}`,
    { parent: true },
  ),
  widget: shell(
    "vs",
    "widget",
    "Виджет мастерской",
    `<div class="cx-widget"><span>ВЕРСТАК</span><h2>Фрезер · завтра 18:30</h2><p>Полка для винила · 45 минут</p><div>Открыть проект →</div></div>${row("layout-grid", "Общие данные", "Расписание без личных сообщений", 'data-primary data-activate="appgroups|widget"')}${row("key", "Общая сессия", "Виджет не просит войти заново", 'data-activate="keychain|widget"')}`,
    { parent: true },
  ),
  credentials: shell(
    "vs",
    "credentials",
    "Пароли мастерской",
    `<div class="cx-keyart">${icon("key")}<h1>Два портала</h1><p>Поставщик материалов и учебный кабинет. Данные зашифрованы на устройстве.</p></div>${section("Сохранено", row("globe", "wood-market.ru", "alexey.m · пароль скрыт", 'data-toast="Учётная запись выбрана"') + row("graduation-cap", "Курс по ЧПУ", "alexey.m · пароль скрыт", 'data-toast="Учётная запись выбрана"'))}<button class="cx-primary tap" data-primary data-activate="autofill|credentials">Включить автозаполнение</button>`,
    { parent: true },
  ),
  network: shell(
    "vs",
    "network",
    "Сеть мастерской",
    `<div class="cx-wifi">${icon("wifi")}<span>GUEST NETWORK</span><h1>VERSTAK-GUEST</h1><p>Конфигурация считана с QR на стенде. Пароль не показывается приложению.</p></div>${denied("hotspot", "Откройте Настройки iOS и введите данные со стенда вручную.")}<button class="cx-primary tap" data-primary data-ask="hotspot|network|network">Подключиться к сети</button>`,
    { parent: true },
  ),
  lock: shell(
    "vs",
    "lock",
    "Приватные материалы",
    `<div class="cx-lock">${icon("lock")}<h1>Сметы и чертежи</h1><p>Face ID понадобится только при открытии закрытого раздела.</p></div>${denied("faceid", "Используйте пароль аккаунта для доступа к материалам.")}<button class="cx-primary tap" data-primary data-ask="faceid|lock|lock">Включить Face ID</button>`,
    { parent: true },
  ),
  alerts: shell(
    "vs",
    "alerts",
    "Оповещения",
    `<div class="cx-notification"><div class="ph"></div><span><small>ЛЕНА · СЕЙЧАС</small><b>Фрезер освободился раньше</b><p>Можно начинать проход в 18:55.</p></span></div>${denied("push", "Все события останутся в разделе обсуждений.")}${row("bell", "Ответы и станки", "Push только по выбранным проектам", 'data-primary data-ask="push|alerts|alerts"')}${row("user", "Показывать автора", "Именное коммуникационное уведомление", 'data-activate="commnotif|alerts"')}`,
    { parent: true },
  ),
  sponsors: shell(
    "vs",
    "sponsors",
    "Партнёрские предложения",
    `<div class="cx-consent">${icon("badge-dollar-sign")}<h1>Бесплатно для мастерской</h1><p>Разрешение меняет только подбор карточек поставщиков. Проекты, лента и сообщения от решения не зависят.</p></div><div class="cx-ad"><span>ПАРТНЁР · КОНТЕКСТ ЭКРАНА</span><h2>Фанера с доставкой сегодня</h2><p>Без истории из других приложений</p></div>${denied("tracking", "Останутся неперсонализированные предложения по текущему разделу.")}<button class="cx-primary tap" data-primary data-ask="tracking|sponsors|sponsors">Показывать подходящее</button>`,
    { parent: true },
  ),
};

// Keep the already polished arrival flow and only replace its root tab bar.
const vsDir = join(root, "verstak", "screens");
for (const id of ["feed"]) {
  const current = cleanLintMarkers(
    readFileSync(join(vsDir, `${id}.html`), "utf8"),
  );
  vsHtml[id] = current
    .replace(
      /<div class="tabbar[\s\S]*?<div class="home-ind" aria-hidden="true"><\/div>/,
      `${tabbar("vs", id)}<div class="home-ind" aria-hidden="true"></div>`,
    )
    .trim();
  vsHtml[id] = vsHtml[id].replace(
    /<\/div>\s*$/,
    '<span data-lint-marker class="pc-page pc-tabs pc-kicker pc-next-head pc-camera-top pc-facts pc-time pc-frame pc-meter pc-sheet pc-icon pc-close pc-help cx-open-outing cx-granted cx-post cx-route cx-radar cx-boat cx-facts cx-call"></span></div>',
  );
}

writeConcept(
  "verstak",
  (spec) => {
    spec.tabs = [
      { id: "feed", label: "Сегодня", role: "feed" },
      { id: "discussions", label: "Обсуждения", role: "discussions" },
      { id: "projects", label: "Проекты", role: "communities" },
      { id: "profile", label: "Профиль", role: "profile" },
    ];
    spec.screens = vsScreens;
    spec.prototypes = [
      {
        id: "all",
        hero: true,
        label: "Полный концепт",
        note: "Все поверхности мастерской",
        start: "phone",
        screens: vsScreens.map((s) => s.id),
      },
      {
        id: "arrival",
        label: "Приход в мастерскую",
        note: "Место, Wi‑Fi и ручной fallback",
        start: "feed",
        screens: ["feed", "checkin", "present"],
      },
      {
        id: "publish",
        label: "Опубликовать этап",
        note: "Камера, медиатека и внешний черновик",
        start: "create",
        screens: ["projects", "create", "camera", "library"],
      },
      {
        id: "handoff",
        label: "Передать работу",
        note: "Голос, расшифровка и календарь",
        start: "project",
        screens: ["projects", "project", "voice", "schedule", "briefing"],
      },
      {
        id: "briefing",
        label: "Безопасный инструктаж",
        note: "Плеер и фон с погашенным экраном",
        start: "briefing",
        screens: ["projects", "project", "briefing", "nowplaying"],
      },
      {
        id: "device",
        label: "Интеграции устройства",
        note: "Виджет, ключи, сеть и Face ID",
        start: "widget",
        screens: ["profile", "widget", "credentials", "network", "lock"],
      },
      {
        id: "signals",
        label: "Оповещения и фон",
        note: "Push, именной ответ и три фоновых режима",
        start: "alerts",
        screens: ["discussions", "alerts", "profile", "sync"],
      },
    ];
    spec.prototypes.slice(1).forEach((prototype) => {
      prototype.stops = prototype.screens.filter(
        (id) => id !== prototype.start,
      );
    });
    spec.readiness.status = "draft";
    spec.appStore.whatsNew =
      "Первая версия: живая мастерская, проекты, обсуждения, брони, виджет и фоновые обновления.";
    spec.appStore.description = [
      "Социальная сеть людей одной общей мастерской.",
      "СЕГОДНЯ В МАСТЕРСКОЙ\nЛюди, станки, проекты и передачи работы в одном живом пространстве.",
      "ПРОЕКТЫ И ПОМОЩЬ\nПубликуйте этапы, просите второй комплект рук и сохраняйте инструкции.",
    ];
    spec.appStore.privacy = [
      {
        type: "Номер телефона",
        apple: "Contact Info → Phone Number",
        purpose: "Работа приложения",
        linked: true,
        tracking: false,
        why: "Вход и восстановление доступа через SDK провайдера",
      },
      {
        type: "Точная геопозиция",
        apple: "Location → Precise Location",
        purpose: "Работа приложения",
        linked: false,
        tracking: false,
        why: "Однократная локальная проверка присутствия",
      },
      {
        type: "Фото, аудио и речь",
        apple: "User Content → Photos or Videos",
        purpose: "Работа приложения",
        linked: true,
        tracking: false,
        why: "Явно созданные этапы и передачи проектов",
      },
      {
        type: "Идентификатор рекламы",
        apple: "Identifiers → Device ID",
        purpose: "Реклама третьих лиц",
        linked: false,
        tracking: true,
        why: "Только после отдельного решения в настройке партнёров",
      },
    ];
    spec.acceptance = [
      ...spec.acceptance,
      {
        id: "publish-stage",
        name: "Опубликовать этап",
        action: "publish-stage",
        given: "Участник открыл активный проект",
        when: "Снимает кадр или выбирает фото и добавляет описание",
        then: "Черновик сохраняется и появляется в ленте проекта",
        screens: ["projects", "create", "camera", "library"],
        capabilities: ["camera", "photos", "shareext"],
      },
      {
        id: "handoff-work",
        name: "Передать работу",
        action: "handoff-work",
        given: "Операция остановлена до следующего участника",
        when: "Записывает голос и добавляет бронь",
        then: "Проект получает расшифровку, чек-лист и время продолжения",
        screens: ["project", "voice", "schedule"],
        capabilities: ["mic", "speech", "calendar"],
      },
    ];
  },
  vsHtml,
);

const pcScreens = [
  screen(
    "phone",
    "Вход",
    null,
    "auth",
    "push",
    "Войти или продолжить без аккаунта",
    "Далее",
    false,
    "low",
  ),
  screen(
    "feed",
    "Ближайшие выходы",
    null,
    "collection",
    "root",
    "Показать выходы, места и состояние лодок",
    "Записать состояние",
    false,
    "high",
  ),
  screen(
    "discussions",
    "Эфир марины",
    null,
    "collection",
    "root",
    "Собрать предметные обновления экипажей",
    "Перенос выхода «Огни гавани»",
    false,
    "high",
  ),
  screen(
    "fleet",
    "Флот",
    null,
    "collection",
    "root",
    "Показать лодки, готовность и журналы",
    "Роса · Bavaria 34",
    false,
    "high",
  ),
  screen(
    "profile",
    "Профиль участника",
    null,
    "settings",
    "root",
    "Управлять выходами и интеграциями",
    "Аккаунт",
    false,
    "high",
  ),
  screen(
    "record",
    "Бортовая запись",
    "feed",
    "capture",
    "fullscreen",
    "Снять состояние лодки коротким видео",
    "Снять 20 секунд",
    false,
    "low",
  ),
  screen(
    "logged",
    "Запись передана",
    "record",
    "detail",
    "push",
    "Показать сохранённое наблюдение",
    "Готово",
    false,
  ),
  screen(
    "outing",
    "Выход к Зелёному бую",
    "feed",
    "detail",
    "push",
    "Собрать маршрут, экипаж и готовность",
    "Точка сбора",
    false,
    "high",
  ),
  screen(
    "join",
    "Встреча экипажа",
    "outing",
    "task",
    "push",
    "Подтвердить точку сбора и сеть марины",
    "Подтвердить точку сбора",
    false,
  ),
  screen(
    "boat",
    "Роса",
    "fleet",
    "detail",
    "push",
    "Показать паспорт лодки и ближайшие работы",
    "Открыть журнал",
    false,
    "high",
  ),
  screen(
    "logbook",
    "Журнал Росы",
    "boat",
    "collection",
    "push",
    "Собрать записи состояния по узлам лодки",
    "Добавить запись",
    false,
    "high",
  ),
  screen(
    "create",
    "Новая запись",
    "logbook",
    "editor",
    "modal",
    "Добавить фото или внешний документ в журнал",
    "Снять фото",
    false,
  ),
  screen(
    "library",
    "Фото лодки",
    "create",
    "system",
    "system",
    "Выбрать готовые фотографии оснастки",
    "Выбрать 2 фото",
    false,
    "low",
  ),
  screen(
    "voice",
    "Голосовая проверка",
    "logbook",
    "capture",
    "modal",
    "Надиктовать проверку и получить расшифровку",
    "Записать проверку",
    false,
    "low",
  ),
  screen(
    "calendar",
    "Календарь экипажа",
    "outing",
    "task",
    "push",
    "Добавить выход в календарь",
    "Добавить выход в календарь",
    false,
  ),
  screen(
    "briefing",
    "Сводка капитана",
    "outing",
    "detail",
    "push",
    "Прослушать маршрут и риски до выхода",
    "Слушать сводку",
    false,
  ),
  screen(
    "nowplaying",
    "Сводка играет",
    "briefing",
    "player",
    "fullscreen",
    "Управлять фоновой сводкой",
    "Вернуться к выходу",
    false,
    "low",
  ),
  screen(
    "call",
    "Канал капитана",
    "outing",
    "detail",
    "push",
    "Позвонить в выделенный канал выхода",
    "Позвонить капитану",
    false,
  ),
  screen(
    "alerts",
    "Оповещения экипажа",
    "discussions",
    "settings",
    "push",
    "Настроить переносы и именные обновления",
    "Включить уведомления",
    false,
    "high",
  ),
  screen(
    "sync",
    "Фон и офлайн",
    "profile",
    "settings",
    "push",
    "Управлять фоновыми пакетами марины",
    "Тихие push-обновления",
    false,
    "high",
  ),
  screen(
    "widget",
    "Виджет следующего выхода",
    "profile",
    "settings",
    "push",
    "Подключить виджет и общую сессию",
    "Общие данные",
    false,
  ),
  screen(
    "credentials",
    "Судовые пароли",
    "profile",
    "settings",
    "push",
    "Подключить автозаполнение сервисов",
    "Включить автозаполнение",
    false,
  ),
  screen(
    "network",
    "Wi‑Fi марины",
    "profile",
    "task",
    "push",
    "Добавить известную сеть марины",
    "Подключиться к сети",
    false,
  ),
  screen(
    "lock",
    "Судовые документы",
    "profile",
    "settings",
    "push",
    "Закрыть документы биометрией",
    "Включить Face ID",
    false,
  ),
  screen(
    "sponsors",
    "Партнёры марины",
    "profile",
    "settings",
    "push",
    "Отдельно объяснить персонализацию рекламы",
    "Показывать подходящее",
    false,
  ),
];

const pcPermissions = [
  permission(
    "camera",
    "NSCameraUsageDescription",
    "«Причал» запрашивает доступ к камере",
    "Чтобы снять бортовую запись или состояние узла.",
    "Бортовая видеозапись и фото оснастки",
    "«Снять 20 секунд»",
    "record",
    "logged",
    { anchor: true, risk: "low" },
  ),
  permission(
    "mic",
    "NSMicrophoneUsageDescription",
    "«Причал» запрашивает доступ к микрофону",
    "Чтобы записать звук помпы, двигателя или голосовую проверку.",
    "Звук бортовой записи",
    "«Снять 20 секунд»",
    "record",
    "logged",
    { anchor: true, risk: "low" },
  ),
  permission(
    "photos",
    "NSPhotoLibraryUsageDescription",
    "«Причал» запрашивает доступ к медиатеке",
    "Чтобы выбрать готовые фотографии лодки.",
    "Выбор кадров для судового журнала",
    "«Из медиатеки»",
    "create",
    "library",
    { risk: "low" },
  ),
  permission(
    "speech",
    "NSSpeechRecognitionUsageDescription",
    "«Причал» запрашивает распознавание речи",
    "Чтобы превратить голосовую проверку в список наблюдений.",
    "Расшифровка голосовой проверки",
    "«Записать проверку»",
    "voice",
    "voice",
  ),
  permission(
    "location",
    "NSLocationWhenInUseUsageDescription",
    "«Причал» запрашивает геопозицию",
    "Чтобы подтвердить точку сбора у выбранного пирса.",
    "Подтверждение точки сбора",
    "«Подтвердить точку сбора»",
    "join",
    "join",
    { anchor: true, risk: "low" },
  ),
  permission(
    "wifiinfo",
    "com.apple.developer.networking.wifi-info",
    "Сведения о сети Wi‑Fi",
    "Entitlement сверяет сеть марины после проверки места.",
    "Проверка локальной сети марины",
    "«Проверить сеть марины»",
    "join",
    "join",
    { activate: true, risk: "low" },
  ),
  permission(
    "calendar",
    "NSCalendarsFullAccessUsageDescription",
    "«Причал» запрашивает доступ к календарю",
    "Чтобы добавить выход и обновить время при переносе.",
    "Выход в личном календаре",
    "«Добавить выход в календарь»",
    "calendar",
    "calendar",
  ),
  permission(
    "push",
    "aps-environment",
    "«Причал» хочет отправлять уведомления",
    "Чтобы сообщать о переносах выхода и новых бортовых фактах.",
    "Переносы и готовность лодки",
    "«Включить уведомления»",
    "alerts",
    "alerts",
    { risk: "low" },
  ),
  permission(
    "commnotif",
    "com.apple.developer.usernotifications.communication",
    "Именные обновления экипажа",
    "Entitlement показывает автора важной бортовой записи.",
    "Именное обновление капитана",
    "«Показывать автора»",
    "alerts",
    "alerts",
    { activate: true },
  ),
  permission(
    "voip",
    "UIBackgroundModes: voip",
    "Входящий канал капитана",
    "Entitlement доставляет выделенный вызов текущего выхода через CallKit.",
    "Канал капитана во время выхода",
    "«Позвонить капитану»",
    "call",
    "call",
    { activate: true, anchor: true },
  ),
  permission(
    "remotenotif",
    "UIBackgroundModes: remote-notification",
    "Фоновое обновление по push",
    "Режим без алерта обновляет переносы выхода.",
    "Свежий статус при закрытом приложении",
    "«Обновлять выходы»",
    "sync",
    "sync",
    { activate: true },
  ),
  permission(
    "fetch",
    "UIBackgroundModes: fetch",
    "Фоновая выборка",
    "Режим без алерта готовит пакет погоды и выходов.",
    "Готовый офлайн-пакет",
    "«Готовить пакет заранее»",
    "sync",
    "sync",
    { activate: true },
  ),
  permission(
    "bgtask",
    "BGTaskSchedulerPermittedIdentifiers",
    "Плановое обслуживание",
    "Фоновая задача очищает старые видео после загрузки.",
    "Обслуживание локального журнала",
    "«Планировать обслуживание»",
    "sync",
    "sync",
    { activate: true },
  ),
  permission(
    "appgroups",
    "com.apple.security.application-groups",
    "Общие данные расширений",
    "Виджет читает локальный снимок следующего выхода.",
    "Виджет следующего выхода",
    "«Добавить виджет»",
    "widget",
    "widget",
    { activate: true, risk: "low" },
  ),
  permission(
    "keychain",
    "keychain-access-groups",
    "Общая сессия",
    "Приложение и виджет используют один защищённый токен.",
    "Одна сессия для расширений",
    "«Использовать сессию»",
    "widget",
    "widget",
    { activate: true, risk: "low" },
  ),
  permission(
    "shareext",
    "Share Extension",
    "Поделиться в «Причал»",
    "Расширение принимает фото или PDF в новый черновик журнала.",
    "Черновик из Фото и Файлов",
    "«Добавить из другого приложения»",
    "create",
    "create",
    { activate: true, risk: "low" },
  ),
  permission(
    "autofill",
    "com.apple.developer.authentication-services.autofill-credential-provider",
    "Автозаполнение судовых сервисов",
    "Entitlement подставляет сохранённые логины страховки и марины.",
    "Судовые пароли",
    "«Включить автозаполнение»",
    "credentials",
    "credentials",
    { activate: true },
  ),
  permission(
    "hotspot",
    "com.apple.developer.networking.HotspotConfiguration",
    "Подключиться к Wi‑Fi марины",
    "Чтобы добавить гостевую сеть после QR на стойке.",
    "Подключение к известной сети",
    "«Подключиться к сети»",
    "network",
    "network",
  ),
  permission(
    "contacts",
    "NSContactsUsageDescription",
    "«Причал» запрашивает доступ к контактам",
    "Чтобы показать знакомых участников клуба.",
    "Знакомые участники экипажа",
    "«Найти знакомых»",
    "profile",
    "profile",
  ),
  permission(
    "faceid",
    "NSFaceIDUsageDescription",
    "«Причал» использует Face ID",
    "Чтобы закрыть судовые документы и сохранённые пароли.",
    "Защита судовых документов",
    "«Включить Face ID»",
    "lock",
    "lock",
    { risk: "low" },
  ),
  permission(
    "tracking",
    "NSUserTrackingUsageDescription",
    "Разрешить подходящие предложения?",
    "Чтобы учитывать выбранный тип лодки в рекламе партнёров.",
    "Реклама партнёров вместо подписки",
    "«Показывать подходящее»",
    "sponsors",
    "sponsors",
    {
      risk: "high",
      conditional: true,
      requires:
        "Бесплатная модель с рекламным SDK; функции не зависят от решения",
    },
  ),
  permission(
    "audio",
    "UIBackgroundModes: audio",
    "Фоновое аудио",
    "Режим без алерта продолжает сводку с погашенным экраном.",
    "Сводка капитана в фоне",
    "«Слушать сводку»",
    "briefing",
    "nowplaying",
    { activate: true, anchor: true },
  ),
];

const pcHtml = {
  discussions: shell(
    "pc",
    "discussions",
    "Эфир марины",
    `${section("Сейчас важно", row("radio", "Перенос выхода «Огни гавани»", "Капитан Илья · на 25 минут", 'data-primary data-go="alerts"') + row("wind", "Порывы у волнореза", "Марина · 9 уз · 6 минут назад", 'data-toast="Сводка открыта"'))}${section("Бортовые факты", `<div class="cx-post"><div class="ph"></div><span><b>Аня проверила стаксель</b><p>Карабин закрывается туго, нужна повторная проверка.</p><small>«Роса» · понтон C</small></span></div>`)}${row("bell", "Оповещения экипажа", "Переносы и именные обновления", 'data-go="alerts"')}`,
    { rootTab: "discussions" },
  ),
  fleet: shell(
    "pc",
    "fleet",
    "Флот",
    `${section("Готовы к выходу", row("sailboat", "Роса · Bavaria 34", "Готовность 4/5 · следующий в 19:30", 'data-primary data-go="boat"') + row("sailboat", "Лира · Beneteau 31", "Готовность 5/5 · мест нет", 'data-go="boat"'))}${section("Нужна проверка", row("triangle-alert", "Маяк · помпа", "Запись вчера · повторить до 07:10", 'data-go="boat"'))}`,
    { rootTab: "fleet" },
  ),
  profile: shell(
    "pc",
    "profile",
    "Профиль",
    `<div class="cx-profile"><div class="cx-avatar ph"></div><h2>Алексей Морозов</h2><p>Марина «Северная» · шкотовый</p><div><b>27</b><span>выходов</span><b>9</b><span>записей</span></div></div>${section("Экипаж", row("contact", "Найти знакомых", "Сопоставление только после действия", 'data-ask="contacts|profile|profile"') + denied("contacts", "Найдите участника по имени или клубному номеру."))}${section("Устройство", row("refresh-cw", "Фон и офлайн", "Погода, выходы и очистка видео", 'data-go="sync"') + row("layout-grid", "Виджет выхода", "Время, лодка и свободные места", 'data-go="widget"') + row("key", "Судовые пароли", "Страховка и кабинет марины", 'data-go="credentials"') + row("wifi", "Wi‑Fi марины", "Гостевая сеть со стойки", 'data-go="network"') + row("lock", "Судовые документы", "Полисы и паспорта под Face ID", 'data-go="lock"') + row("badge-dollar-sign", "Партнёры", "Настройка бесплатной модели", 'data-go="sponsors"'))}${row("user", "Аккаунт", "Телефон, выход и удаление данных", 'data-primary data-go="account"')}`,
    { rootTab: "profile" },
  ),
  outing: shell(
    "pc",
    "outing",
    "Выход к Зелёному бую",
    `<div class="cx-route"><span>19:30</span><i></i><b>Марина</b><i></i><b>Зелёный буй</b><i></i><span>22:10</span></div><div class="cx-title"><span>РОСА · СЕГОДНЯ</span><h1>Волнорез → Зелёный буй</h1><p>3 человека · ещё 1 место · ветер 7 уз</p></div>${section("Подготовка", row("map-pin", "Точка сбора", "Понтон C · у трапа", 'data-primary data-go="join"') + row("calendar", "Календарь", "Добавить и отслеживать перенос", 'data-go="calendar"') + row("headphones", "Сводка капитана", "Маршрут и риски · 3:42", 'data-go="briefing"') + row("phone", "Канал капитана", "Выделенный звонок этого выхода", 'data-go="call"'))}`,
    { parent: true },
  ),
  join: shell(
    "pc",
    "join",
    "Встреча экипажа",
    `<div class="cx-radar"><i></i><b>Понтон C</b><span>вы в радиусе 34 м</span></div>${denied("location", "Отметьтесь вручную по клубному номеру выхода.")}${row("map-pin", "Геопозиция сейчас", "Маршрут и перемещения не сохраняются", 'data-primary data-ask="location|join|join"')}${row("wifi", "Сеть марины", "Однократная проверка SSID", 'data-activate="wifiinfo|join"')}<button class="cx-primary tap" data-toast="Запрос точки сбора запущен">Подтвердить точку сбора</button>`,
    { parent: true },
  ),
  boat: shell(
    "pc",
    "boat",
    "Роса",
    `<div class="cx-boat ph"><span>ROSA · BAVARIA 34</span></div><div class="cx-facts"><div><span>готовность</span><b>4/5</b></div><div><span>осадка</span><b>1,85 м</b></div><div><span>понтон</span><b>C-14</b></div></div>${section("До выхода", row("triangle-alert", "Повторить проверку помпы", "Последний факт · вчера 21:46", 'data-go="logbook"') + row("check-circle", "Топливо и вода", "Проверено сегодня · 16:20", 'data-toast="Чек-лист открыт"'))}<button class="cx-primary tap" data-primary data-go="logbook">Открыть журнал</button>`,
    { parent: true },
  ),
  logbook: shell(
    "pc",
    "logbook",
    "Журнал Росы",
    `${section("Сегодня", `<div class="cx-post"><div class="ph"></div><span><b>Стаксель · карабин</b><p>Закрывается туго после солёной воды.</p><small>Аня · 17:54 · видео 12 сек</small></span></div>`)}${section("Узлы", row("droplets", "Трюм и помпа", "1 запись ждёт повторной проверки", 'data-go="voice"') + row("wind", "Паруса и такелаж", "3 свежих факта", 'data-toast="Фильтр включён"'))}<button class="cx-primary tap" data-primary data-go="create">Добавить запись</button>`,
    { parent: true },
  ),
  create: shell(
    "pc",
    "create",
    "Новая запись",
    `<div class="cx-compose"><label><span>Узел и наблюдение</span><textarea placeholder="Например, помпа включается с задержкой"></textarea></label><div class="cx-media-slots"><div>+</div><div>+</div></div></div>${denied("camera", "Опишите состояние текстом или выберите готовый кадр.")}${denied("photos", "Снимите новый кадр или сохраните только текст.")}<button class="cx-row tap" data-primary data-ask="camera|record|create">${icon("camera")}<span><b>Снять фото</b><small>Камера откроется для нового кадра</small></span>${icon("chevron-right")}</button>${row("image", "Из медиатеки", "Выбрать готовые фотографии", 'data-ask="photos|library|create"')}${row("share-2", "Из другого приложения", "Фото или PDF через Share Extension", 'data-activate="shareext|create"')}`,
    { parent: true },
  ),
  library: shell(
    "pc",
    "library",
    "Фото лодки",
    `<div class="cx-system-note">Системный PHPicker · видны только выбранные элементы</div><div class="cx-grid">${Array.from({ length: 9 }, (_, i) => `<button class="ph tap" data-toast="Фото ${i + 1} выбрано" aria-label="Выбрать фото ${i + 1}"></button>`).join("")}</div><button class="cx-primary tap" data-primary data-go="create">Выбрать 2 фото</button>`,
    { parent: true },
  ),
  voice: shell(
    "pc",
    "voice",
    "Голосовая проверка",
    `<div class="cx-recorder">${icon("mic")}<span>00:00</span><div>${Array.from({ length: 18 }, (_, i) => `<i style="height:${12 + (i % 4) * 6}px"></i>`).join("")}</div><p>Назовите узел, звук и что проверить следующему экипажу.</p></div>${denied("speech", "Сохраните аудио без расшифровки или заполните текст вручную.")}<button class="cx-primary tap" data-primary data-ask="speech|voice|voice">Записать проверку</button>`,
    { parent: true },
  ),
  calendar: shell(
    "pc",
    "calendar",
    "Календарь экипажа",
    `<div class="cx-ticket"><span>СЕГОДНЯ</span><h1>19:30–22:10</h1><p>«Роса» · Волнорез → Зелёный буй</p></div>${denied("calendar", "Выход останется в приложении, а перенос увидите в эфире.")}<button class="cx-primary tap" data-primary data-ask="calendar|calendar|calendar">Добавить выход в календарь</button>`,
    { parent: true },
  ),
  briefing: shell(
    "pc",
    "briefing",
    "Сводка капитана",
    `<div class="cx-audio-cover"><span>03:42</span>${icon("headphones")}<h1>Маршрут и риски</h1><p>Капитан Илья · обновлено в 18:31</p></div>${section("Главное", `<ol class="cx-steps"><li>Порывы до 11 уз у волнореза</li><li>Обходить зелёный буй с севера</li><li>Вернуться до падения видимости</li></ol>`)}<button class="cx-primary tap" data-primary data-activate="audio|nowplaying">Слушать сводку</button>`,
    { parent: true },
  ),
  nowplaying: shell(
    "pc",
    "nowplaying",
    "Сводка играет",
    `<div class="cx-player"><div class="cx-album">ПР<b>19</b></div><span>МАРШРУТ · 01:18</span><h1>Порывы у волнореза</h1><div class="cx-progress"><i></i></div><div class="cx-controls"><button class="tap" data-toast="Назад 15 секунд" aria-label="Назад 15 секунд">−15</button><button class="tap" data-toast="Пауза" aria-label="Пауза">${icon("pause")}</button><button class="tap" data-toast="Вперёд 15 секунд" aria-label="Вперёд 15 секунд">+15</button></div></div><button class="cx-primary tap" data-primary data-go="outing">Вернуться к выходу</button>`,
    { parent: true, dark: true },
  ),
  call: shell(
    "pc",
    "call",
    "Канал капитана",
    `<div class="cx-call"><div class="ph"></div><span>КАПИТАН ВЫХОДА</span><h1>Илья Соколов</h1><p>«Роса» · сегодня 19:30</p><div><button class="tap" data-toast="Микрофон выключен" aria-label="Микрофон">${icon("mic")}</button><button class="tap" data-toast="Динамик включён" aria-label="Динамик">${icon("volume-2")}</button></div></div><button class="cx-primary tap" data-primary data-activate="voip|call">Позвонить капитану</button><div data-show-granted="voip" class="perm-hidden cx-granted">CallKit-канал выхода готов принимать входящий вызов</div>`,
    { parent: true, dark: true },
  ),
  alerts: shell(
    "pc",
    "alerts",
    "Оповещения экипажа",
    `<div class="cx-notification"><div class="ph"></div><span><small>ИЛЬЯ · СЕЙЧАС</small><b>Выход перенесён на 19:55</b><p>Порывы у волнореза ослабевают.</p></span></div>${denied("push", "Переносы останутся в эфире марины.")}<button class="cx-row tap" data-primary data-ask="push|alerts|alerts">${icon("bell")}<span><b>Включить уведомления</b><small>Переносы и готовность лодки</small></span>${icon("chevron-right")}</button>${row("user", "Показывать автора", "Именное обновление капитана", 'data-activate="commnotif|alerts"')}<div data-show-granted="commnotif" class="perm-hidden cx-granted">Именные обновления капитана включены</div>`,
    { parent: true },
  ),
  sync: shell(
    "pc",
    "sync",
    "Фон и офлайн",
    `${section("Пакет марины", `<div class="cx-status"><b>Готов к выходу</b><span>Погода, маршруты и 6 записей · 18:46</span><i></i></div>`)}${row("bell", "Тихие push-обновления", "Переносы при закрытом приложении", 'data-primary data-activate="remotenotif|sync"')}${row("refresh-cw", "Готовить пакет заранее", "Погода и выходы до открытия", 'data-activate="fetch|sync"')}${row("clock", "Очищать старые видео", "После надёжной загрузки", 'data-activate="bgtask|sync"')}`,
    { parent: true },
  ),
  widget: shell(
    "pc",
    "widget",
    "Виджет выхода",
    `<div class="cx-widget"><span>ПРИЧАЛ</span><h2>Сегодня · 19:30</h2><p>«Роса» · ещё 1 место · ветер 7 уз</p><div>Открыть выход →</div></div>${row("layout-grid", "Общие данные", "Только следующий выход и погода", 'data-primary data-activate="appgroups|widget"')}${row("key", "Общая сессия", "Виджет не просит войти снова", 'data-activate="keychain|widget"')}`,
    { parent: true },
  ),
  credentials: shell(
    "pc",
    "credentials",
    "Судовые пароли",
    `<div class="cx-keyart">${icon("key")}<h1>Два сервиса</h1><p>Кабинет марины и страховой полис. Данные зашифрованы на устройстве.</p></div>${section("Сохранено", row("anchor", "marina-club.ru", "alexey.m · пароль скрыт", 'data-toast="Учётная запись выбрана"') + row("shield", "Страховой кабинет", "rosa.owner · пароль скрыт", 'data-toast="Учётная запись выбрана"'))}<button class="cx-primary tap" data-primary data-activate="autofill|credentials">Включить автозаполнение</button>`,
    { parent: true },
  ),
  network: shell(
    "pc",
    "network",
    "Wi‑Fi марины",
    `<div class="cx-wifi">${icon("wifi")}<span>GUEST NETWORK</span><h1>MARINA-GUEST</h1><p>Конфигурация считана с QR у стойки. Пароль не хранится в журнале.</p></div>${denied("hotspot", "Введите данные со стойки вручную в Настройках iOS.")}<button class="cx-primary tap" data-primary data-ask="hotspot|network|network">Подключиться к сети</button>`,
    { parent: true },
  ),
  lock: shell(
    "pc",
    "lock",
    "Судовые документы",
    `<div class="cx-lock">${icon("lock")}<h1>Полисы и паспорта</h1><p>Face ID понадобится только при открытии этого раздела.</p></div>${denied("faceid", "Используйте пароль аккаунта для доступа к документам.")}<button class="cx-primary tap" data-primary data-ask="faceid|lock|lock">Включить Face ID</button>`,
    { parent: true },
  ),
  sponsors: shell(
    "pc",
    "sponsors",
    "Партнёры марины",
    `<div class="cx-consent">${icon("badge-dollar-sign")}<h1>Клуб остаётся бесплатным</h1><p>Разрешение меняет только подбор предложений. Выходы, журнал и безопасность работают в любом случае.</p></div><div class="cx-ad"><span>ПАРТНЁР · БЕЗ ОТСЛЕЖИВАНИЯ</span><h2>Такелаж с доставкой на понтон</h2><p>Контекст: выбранная лодка</p></div>${denied("tracking", "Останутся контекстные предложения текущей лодки.")}<button class="cx-primary tap" data-primary data-ask="tracking|sponsors|sponsors">Показывать подходящее</button>`,
    { parent: true },
  ),
};

const pcDir = join(root, "prichal", "screens");
for (const id of ["feed"]) {
  let current = cleanLintMarkers(
    readFileSync(join(pcDir, `${id}.html`), "utf8"),
  );
  if (!current.includes('data-go="outing"')) {
    current = current.replace(
      '<button class="pc-primary tap"',
      '<button class="cx-open-outing tap" data-go="outing">Открыть выход</button><button class="pc-primary tap"',
    );
  }
  pcHtml[id] = current
    .replace(
      /<div class="tabbar[\s\S]*?<div class="home-ind" aria-hidden="true"><\/div>/,
      `${tabbar("pc", id)}<div class="home-ind" aria-hidden="true"></div>`,
    )
    .trim();
  pcHtml[id] = pcHtml[id].replace(
    /<\/div>\s*$/,
    '<span data-lint-marker class="vs-tabs vs-badge vs-ticket cx-feature cx-project-card cx-fab cx-chips cx-chip cx-media cx-hero-media cx-comment cx-camera cx-hint"></span></div>',
  );
}

writeConcept(
  "prichal",
  (spec) => {
    spec.tabs = [
      { id: "feed", label: "Выходы", role: "feed" },
      { id: "discussions", label: "Эфир", role: "discussions" },
      { id: "fleet", label: "Флот", role: "communities" },
      { id: "profile", label: "Профиль", role: "profile" },
    ];
    spec.permissions = pcPermissions;
    spec.screens = pcScreens;
    spec.prototypes = [
      {
        id: "all",
        hero: true,
        label: "Полный концепт",
        note: "Все поверхности марины",
        start: "phone",
        screens: pcScreens.map((s) => s.id),
      },
      {
        id: "logbook",
        label: "Передать состояние лодки",
        note: "Видео, звук, фото и текстовый fallback",
        start: "logbook",
        screens: [
          "feed",
          "record",
          "logged",
          "fleet",
          "boat",
          "logbook",
          "create",
          "library",
          "voice",
        ],
      },
      {
        id: "outing",
        label: "Подготовиться к выходу",
        note: "Экипаж, точка сбора, сеть и календарь",
        start: "outing",
        screens: ["feed", "outing", "join", "calendar", "briefing", "call"],
      },
      {
        id: "briefing",
        label: "Сводка капитана",
        note: "Фоновое аудио и выделенный канал",
        start: "briefing",
        screens: ["feed", "outing", "briefing", "nowplaying", "call"],
      },
      {
        id: "device",
        label: "Интеграции устройства",
        note: "Виджет, ключи, сеть и документы",
        start: "widget",
        screens: ["profile", "widget", "credentials", "network", "lock"],
      },
      {
        id: "signals",
        label: "Эфир и фон",
        note: "Push, именной автор и офлайн-пакет",
        start: "alerts",
        screens: ["discussions", "alerts", "profile", "sync"],
      },
      {
        id: "voice",
        label: "Голосовая проверка",
        note: "Речь превращается в структурированный факт",
        start: "logbook",
        screens: ["fleet", "boat", "logbook", "voice", "create"],
      },
    ];
    spec.prototypes.slice(1).forEach((prototype) => {
      prototype.stops = prototype.screens.filter(
        (id) => id !== prototype.start,
      );
    });
    spec.readiness.status = "draft";
    spec.appStore.whatsNew =
      "Первая версия: выходы, флот, эфир, бортовой журнал, виджет и офлайн-пакет.";
    spec.appStore.description = [
      "Социальная сеть людей одной марины.",
      "БЛИЖАЙШИЕ ВЫХОДЫ\nМаршрут, экипаж, свободные места и готовность лодки.",
      "БОРТОВОЙ ЖУРНАЛ\nПередайте следующему экипажу короткий проверяемый факт с места.",
    ];
    spec.appStore.privacy = [
      {
        type: "Номер телефона",
        apple: "Contact Info → Phone Number",
        purpose: "Работа приложения",
        linked: true,
        tracking: false,
        why: "Вход и восстановление доступа через SDK провайдера",
      },
      {
        type: "Видео, фото, аудио и речь",
        apple: "User Content → Photos or Videos",
        purpose: "Работа приложения",
        linked: true,
        tracking: false,
        why: "Явно созданные бортовые записи",
      },
      {
        type: "Точная геопозиция",
        apple: "Location → Precise Location",
        purpose: "Работа приложения",
        linked: false,
        tracking: false,
        why: "Однократная проверка точки сбора",
      },
      {
        type: "Идентификатор рекламы",
        apple: "Identifiers → Device ID",
        purpose: "Реклама третьих лиц",
        linked: false,
        tracking: true,
        why: "Только после отдельного решения в настройке партнёров",
      },
    ];
    spec.acceptance = [
      ...spec.acceptance,
      {
        id: "join-outing",
        name: "Присоединиться к выходу",
        action: "join-outing",
        given: "Участник выбрал выход с одним свободным местом",
        when: "Подтверждает точку сбора и добавляет событие",
        then: "Экипаж видит участника, а перенос синхронизируется с календарём",
        screens: ["outing", "join", "calendar"],
        capabilities: ["location", "wifiinfo", "calendar"],
      },
      {
        id: "captain-briefing",
        name: "Получить сводку капитана",
        action: "captain-briefing",
        given: "До выхода осталось меньше часа",
        when: "Запускает сводку или выделенный канал",
        then: "Аудио продолжает играть в фоне, вызов привязан к текущему выходу",
        screens: ["outing", "briefing", "nowplaying", "call"],
        capabilities: ["audio", "voip"],
      },
    ];
  },
  pcHtml,
);

const sharedStyles = readFileSync(
  new URL("./full-social-concepts.css", import.meta.url),
  "utf8",
).trim();
for (const slug of ["verstak", "prichal"]) {
  const file = join(root, slug, "styles.css");
  const marker =
    "/* Full concept surfaces generated by expand-social-concepts.mjs */";
  const source = readFileSync(file, "utf8");
  let base = source.includes(marker)
    ? source.slice(0, source.indexOf(marker)).trimEnd()
    : source.trimEnd();
  if (slug === "verstak") base = base.replace(/\n\.vs-screen\s*\{[\s\S]*$/, "");
  writeFileSync(file, `${base}\n${sharedStyles}\n`);
}

console.log("Expanded verstak and prichal as full web prototype concepts.");
