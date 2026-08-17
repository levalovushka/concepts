# iOS Chrome — канон для всех концептов

> Общий референс системного хрома. Живёт в ядре платформы (`platform/kernel/`), не в концепте.
> Визуальный стенд: открой [`chrome-gallery.html`](./chrome-gallery.html) рядом с этим файлом.
> Источники: [Apple HIG — Status bars](https://developer.apple.com/design/human-interface-guidelines/status-bars), [Toolbars / Navigation](https://developer.apple.com/design/human-interface-guidelines/toolbars), [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets).

Прототипы **не изобретают** статус-бар, навбар, таб-бар, sheet, alert, switch, list row. Они копируют систему. Бренд — только accent и контент.

---

> **Источник компонентов — [`components.html`](../../components.html) в корне репозитория.**
> Это сторибук системных компонентов iOS: статус-бар, кнопки, нав-бар, таб-бар, ячейки и списки,
> контролы, алерты, шиты, плеер, снекбар. Компонентный слой `kernel/base.css` перенесён оттуда.
>
> **Правило: сначала ищи компонент в `components.html`, потом рисуй.** Если нужного нет —
> добавь его туда, а не в экран концепта. Иконки — из спрайта Lucide (`kernel/icons.svg`,
> генерится `scripts/gen-icons.mjs`): `<svg class="ico-svg"><use href="#i-<name>"/></svg>`.
> Своих SVG-путей в экранах быть не должно.

## 0a. Вход по номеру — всегда первый

Первые два экрана любого концепта: `phone` (номер) → `code` (SMS-код). Компоненты в ядре — `.auth-mark`, `.auth-cc`, `.auth-num`, `.otp` / `.otp-cell`. Таб-бара и permission-алертов на них нет.

Диплинков (`associated-domains`, приём чужих ссылок, превью по Open Graph) в концептах **не бывает**.

---

## 0a2. Картинки

Любое изображение в концепте — плейсхолдер `.ph`: серое поле с иконкой камеры, на тёмном
`.ph.on-dark`. Не генерируем визуал, не ищем его, не пишем код для его генерации.
Исключение — данные, нарисованные кодом (схема, этикетка, карта): это содержимое, а не картинка.

---

## 0. Фрейм устройства

Канон платформы — **iPhone X-class** (X / XS / 11 Pro / 13 mini), logical **375 × 812** (@3×).
Контейнер (`.phone` / `.device`): всегда ровно **375 × 812**, без сжатия.

| Зона | Значение | Токен |
|---|---|---|
| Ширина / высота | **375 × 812** | `--device-w` / `--device-h` |
| Top safe area (notch) | **47 pt** | `--safe-top` |
| Bottom safe area (Home Indicator) | **34 pt** | `--safe-bottom` |
| Content margin | **16 pt** | `--margin` |
| Min touch target | **44 × 44 pt** | `.tap`, `.icon-btn` |

Другие аппаратные варианты (для справки, не для текущего фрейма):

| Аппарат | Top inset | Примечание |
|---|---|---|
| iPhone SE (без notch) | 20 | Классический статус-бар |
| iPhone X-class 375×812 | **47** | ← наш фрейм |
| iPhone 13/14 390×844 | 47 | Шире/выше |
| iPhone 14 Pro+ (Dynamic Island) | ~59 | Другой силуэт статус-бара |

Не хардкодить `54`. Все overlays (`.navbar`, `.lv-top`, `.cam-top`, `.status`) отсчитываются от `--safe-top`.

---

## 1. Status bar

**Что это.** Прозрачная полоса у верхнего края: время, сотовая/Wi-Fi, батарея. Фон всегда прозрачный — читаемость даёт контент под ним или scroll-edge blur.

**Поведение (HIG):**
- Не класть интерактив под статус-бар.
- Можно временно скрывать на full-screen media; постоянно — нельзя.
- Светлый контент → светлые чернила; светлый фон → `.status.dark-ink` (чёрные чернила).

**Наш макет:**

| Параметр | Значение |
|---|---|
| Высота зоны | `--safe-top` = 47 |
| Padding | **16** top · **27** sides | `.status` |
| Время | SF-like Semibold **15 / 1**, leading ~27 |
| Иконки справа | gap 6, trailing ~16–27 |
| Класс | `.status` / `.status.dark-ink` |

Светлые экраны (`LIGHT` в `concept.json`) обязаны включать `.dark-ink` через движок.

---

## 2. Navigation bar

**Анатомия (iOS):** leading (Back / Close) · center title · trailing actions. Высота **content row = 44 pt** поверх safe-top.

### Inline title (push / modal)

| Параметр | Значение | Класс |
|---|---|---|
| Title | 17 / 22, Semibold (600), center | `.navbar .title` |
| Back | chevron + **название предыдущего экрана** (не «Назад») | `.btn-plain` |
| Close / Cancel | текст leading, accent | `.btn-plain` |
| Trailing action | accent, Semibold для primary («Добавить») | `.btn-plain` |
| Боковой spacer | ~72 pt, балансирует title | `.nav-spacer` |
| Padding | `padding-top: var(--safe-top)` | `.navbar` |

HIG: предпочитать стандартный Back; не писать слово «Back» / «Назад» без chevron; title < ~15 символов, иначе ellipsis.

### Large title (только root tab)

| Параметр | Значение | Класс |
|---|---|---|
| Title | **34 / 41, Bold (700)**, tracking −0.03em, left | `.navbar .title.large` |
| Когда | корни вкладок: Уроки / Проекты / Профиль | `.navbar.is-large` |
| Когда нет | push, modal, sheet, immersive | inline |

В системе large title схлопывается в inline при скролле. В прототипе схлопывание не анимируем — но **не ставим large title на push-экраны**.

---

## 3. Tab bar

| Параметр | Значение |
|---|---|
| Content height | **49 pt** (`--tab-h`) |
| + Home Indicator | **+34** → итого `calc(49px + 34px)` |
| Tabs | 2–5 (у нас 3); без overflow More |
| Icon | ~25–28 pt, filled SF-like |
| Label | **10 / 12**, Medium; одно слово |
| Selected | accent (light) / white (dark immersive) |
| Material | blur 40 + saturate 180; тёмный / `.tabbar.light` |

HIG:
- Tab bar — **навигация**, не действия.
- Не прятать и не disable вкладки.
- Сохранять стек внутри вкладки (у нас — `presentedFrom` + PARENT).
- На push/fullscreen поверх таба tab bar скрыт — это нормально.

iOS 26 вводит floating Liquid Glass tab bar. Для концептов Review-эпохи держим классический edge-to-edge translucent bar — он совпадает с ментальной моделью ревьюера и большинством shipping-приложений. Liquid Glass — отдельная ветка, когда понадобится.

---

## 4. Lists (Inset Grouped)

| Параметр | Значение | Класс |
|---|---|---|
| Фон экрана | `#f2f2f7` grouped | `.ios-surface` |
| Карточка списка | `#fff`, radius **12** | `.ios-list` |
| Row min-height | **44** | `.row` |
| Row padding | 12 × 16 | `.row` |
| Separator | 0.5 pt, inset после leading media | `.row::after` |
| Section header | 13 / 18, secondary, над карточкой | `.group-head` |
| Body / Headline | 17 / 22 | `.t-body` / `.t-headline` |
| Caption | 12 / 16, tertiary | `.t-caption` |
| Chevron | tertiary, › | `.ios-disclosure` |
| Media thumb | **74×56**, r10, duration badge | `.lrow-thumb` / `.dur` |
| Media row | pad 8×16, sep inset 102, title ≤2 lines | `.row.has-media` |
| Blank / gone | no OG / dead link | `.is-blank` / `.is-gone` |
| Switch | **51 × 31**, knob 27 | `.switch` |

---

## 5. Sheets & modals

| Параметр | Значение | Класс |
|---|---|---|
| Grabber | **36 × 5**, radius pill, `rgba(60,60,67,.18)` | `.grabber` |
| Top radius | 14 (классический sheet) | `.sheet` |
| Bottom pad | ≥ `--safe-bottom` (34) | `.sheet-body` |
| Sheet title | ~22 / 28 Bold (не large title 34) | `.sheet-title` |
| Dimmed backdrop | затемнённый предыдущий экран, не чёрная пустота | сцена + opacity |

Закрытие: grabber / «Готово» / «Закрыть» → `data-back` (архитектурный родитель).

---

## 5a. Camera (capture chrome)

Структура, не набор кнопок продукта. Три слоя:

| Слой | Спека | Класс |
|---|---|---|
| Preview | full-bleed, чёрный | `.cam` / `.cam-preview` |
| Top | от `--safe-top`, min-h **60**, slots leading · mid · trailing, hit **44** | `.cam-top` |
| Bottom | pad-bottom `--safe-bottom` **34** | `.cam-bottom` |

Два варианта низа (взаимоисключающие):

| Вариант | Состав | Класс |
|---|---|---|
| Controls | gallery thumb **48** · shutter **72** · flip 44 | `.cam-controls` / `.cam-shutter` |
| Actions | колонка CTA — продукт подставляет лейблы | `.cam-actions` |

Overlays (опционально): `.progress-rec`, mid timer + `.rec-dot`, `.cam-hint`.  
Не хром: scan-corners, found-card, brand pills.

Dismiss в capture: **×** или Cancel — нормально (в отличие от sheet).

---

## 6. System alert (permission)

| Параметр | Значение |
|---|---|
| Ширина | ~ inset 44 с краёв устройства |
| Card radius | 14 |
| Material | vibrancy / blur (`--bar`) |
| Title | 17 Semibold, center |
| Message | 13 Regular, secondary |
| Actions | 17; Grant = Semibold; divider 0.5 |
| ATT | свои лейблы «Запретить отслеживание» / «Разрешить» |

Класс: `.sysask` / `.sysask-card`. Не стилизовать под бренд — это система.

---

## 7. Кнопки и контролы

| Роль | Спека | Класс |
|---|---|---|
| Filled (primary) | min-height **50**, 17 Semibold, capsule | `.btn-filled` |
| Tinted | min-height **44**, 15 Semibold | `.btn-tinted` |
| Plain / nav text | 17 Regular, accent | `.btn-plain` |
| Icon hit | **44 × 44** | `.icon-btn` |
| Snackbar | light: white blur `.92` + soft shadow; dark: `#3a3a3c` + hairline; r12, min-h 48, inset 16, bottom 99; 15 + action «Настройки»; ok = green 22 ✓, 2,6 с | `.snackbar` / `.is-ok` / `.on-dark` |

---

## 7a. Ошибки и ручной ввод

Отказ доступа — это снекбар и fallback. **Сбой самой фичи** (не распозналось, не прочиталось, не нашлось) — отдельное состояние на экране: что случилось, почему, и что делать дальше.

| Параметр | Значение | Класс |
|---|---|---|
| Баннер ошибки | radius 12, тёплая заливка + 0.5 hairline | `.errbox` |
| Иконка | 26 × 26, оптический вес как у текста | `.errbox-ico` |
| Заголовок / причина | 17 Semibold + 13 Regular | `.t-headline` + `.t-footnote` |
| Жёсткая ошибка | красный вместо оранжевого | `.errbox.is-hard` |
| Строка формы | лейбл 88 слева, значение справа | `.field-label` / `.field-input` |
| Невалидное поле | текст и рамка `#d70015` вместо чёрного/системного | `.field-label.is-error` / `.field-input.is-error` / `.auth-field.is-error` / `.otp-cell.is-error` |
| Подпись под невалидным полем | 13pt, тот же красный | `.field-caption` / `.field-caption.is-error` |

Правила: одна причина человеческим языком, без кодов; **ровно один** способ повторить попытку и **ровно один** обходной путь; ручной ввод повторяет те же поля, что даёт автоматика. Ошибка ввода (неверный код, невалидное поле формы) — это состояние **поля**, а не отдельный `.errbox`: баннер `.errbox` остаётся за отказами доступа и сбоями фичи (камера, скан, сеть), `.is-error` на самом поле — за тем, что ввёл пользователь.

Когда ошибка занимает **весь** экран (операция не начиналась или прервалась целиком), вместо баннера — центрированный блок:

| Параметр | Значение | Класс |
|---|---|---|
| Контейнер | flex по центру, gap 14, padding 24×32 | `.state` |
| Иконка | круг 60, тёплая заливка; красная — для необратимого | `.state-ico` / `.state-ico.is-hard` |
| Заголовок | 22 / 28 Bold, `text-wrap: balance` | `.state .t-title` |
| Пояснение | 15 Regular secondary, ≤ 28ch | `.t-subhead` |
| Кнопки | колонка внизу экрана, не в центре | `.state-actions` |
| Загрузка | тот же `.state`, спиннер 34 вместо иконки | `.spinner` |

Загрузка и ошибка — один макет: пользователь видит, что ничего не «прыгнуло», сменились только иконка и текст.

### Тост подтверждения

Успех живёт в той же полоске, что и отказ (`.snackbar`), но с галочкой и **без** ссылки в Настройки — класс `.snackbar.is-ok`, в разметке `data-toast="Текст|экран"`. Держится 2,6 с против 4 с у отказа: подтверждение читают мельком, ошибку — вдумчиво.

---

## 8. Типографика (системная шкала → наши классы)

Default Dynamic Type size. В прототипе гарнитура бренда (Outfit) **имитирует метрики** SF, не заменяет семантику.

| Text style (iOS) | Size / weight | Наш класс |
|---|---|---|
| Large Title | 34 Bold | `.title.large` |
| Title 1 | 28 Bold | `.t-title` (sheet/hero) |
| Headline | 17 Semibold | `.t-headline`, `.navbar .title` |
| Body | 17 Regular | `.t-body` |
| Subheadline | 15 Regular | `.t-subhead` |
| Footnote | 13 Regular | `.t-footnote` |
| Caption 1 | 12 Regular | `.t-caption` |
| Tab label | 10 Medium | `.tabbar > div` |
| Status time | 15 Semibold | `.status` |

Минимум читаемого текста — **11 pt**. Данные (таймкоды, партии, ряды) — mono + `tabular-nums`.

---

## 9. Правила для агента

1. **Не копировать хром в концепт.** Меняй только `styles.css` концепта и разметку экранов; статус/nav/tab/alert/switch/row — из `base.css`.
2. **Перед правкой отступов** открой `chrome-gallery.html` и сверься с образцом.
3. **Large title — только tab roots.** Push = inline title + Back с именем родителя.
4. **Safe areas только через токены** `--safe-top` / `--safe-bottom`.
5. **Светлый экран → `.dark-ink`** на статус-баре (через `light` в `concept.json`).
6. Если дефект повторяется на 3+ экранах — правь ядро, не экземпляры.

---

## 10. Чеклист приёмки хрома

- [ ] Время и иконки статус-бара не перекрыты контентом
- [ ] На светлом фоне статус чёрный (`.dark-ink`)
- [ ] Inline title по центру, large — слева, 34 Bold
- [ ] Back = ‹ + имя родителя; закрытие модалки = «Закрыть»/«Отмена»
- [ ] Tab bar: 3 вкладки, label 10pt, selected = accent, снизу 34 pt
- [ ] Sheet: grabber 36×5, нижний pad ≥ 34
- [ ] Row ≥ 44, separator inset после превью
- [ ] Alert выглядит системно, не брендово
- [ ] Нет хардкода `54px` / `top:54`
