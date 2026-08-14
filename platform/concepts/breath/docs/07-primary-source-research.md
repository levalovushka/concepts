# Первичные источники: музыкальные дыхательные сессии

Дата проверки: 14 августа 2026. Источники ниже — только официальные страницы продуктов, App Store, VKUI и Apple Developer. Выводы отделены от фактов: формулировки «следует», «для концепта» и «решение» — продуктовая интерпретация для `breath`, а не цитата источника.

## Короткий вывод

`Дыхание` стоит строить не как каталог медитаций и не как генератор абстрактных «миров», а как музыкальный сервис состояний: выбрать нужный эффект → увидеть понятную карточку с длительностью, техникой, уровнем и музыкальным характером → запустить иммерсивную сессию → получить спокойное завершение и сохранить её. Грамматику VK Музыки дают плотная персональная витрина, горизонтальные подборки, ясная коллекция и полноценный плеер; самостоятельность бренда создают сценарий дыхания, фазовые подсказки и реактивный звук.

Главная техническая поправка: камера, уведомления и расширенный доступ к медиатеке действительно имеют authorization/deny-состояния. `UIBackgroundModes: audio` и Associated Domains — capabilities/entitlements без пользовательского системного запроса. `PHPickerViewController` для выбора одного изображения вообще не требует доступа ко всей фотобиблиотеке. Поэтому нельзя показывать фальшивые iOS permission alerts для «Слушать в фоне», Universal Links или обычного выбора фото.

## Что брать из продуктовой грамматики VK

### VK Музыка

Официальная [страница VK Музыки в App Store](https://apps.apple.com/ru/app/vk-%D0%BC%D1%83%D0%B7%D1%8B%D0%BA%D0%B0-%D0%BF%D0%B5%D1%81%D0%BD%D0%B8-%D0%B8-%D0%B0%D1%83%D0%B4%D0%B8%D0%BE%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8/id1054372220) фиксирует актуальную информационную архитектуру сервиса:

- «Обзор» отвечает за новинки, чарты и редакционные подборки; «Моя музыка» объединяет лайки, историю, альбомы, плейлисты, радиостанции и загрузки.
- Рекомендации можно быстро уточнять по настроению, узнаваемости и языку; сниппеты снижают цену знакомства с новым контентом.
- Полноэкранный плеер хранит очередь, текст, like/dislike и переход к похожему контенту; музыка работает офлайн и при выключенном экране.

Решение для `breath`:

- Корневых разделов достаточно четырёх: `Сейчас`, `Найти`, `Сохранённое`, `Профиль`. Настройка конкретной сессии — не root tab, а шаг между detail и player.
- `Сейчас` должен быть плотной витриной: один быстрый старт, затем компактные ряды «Под ваше состояние», «5 минут», «Для сна», «Новые сессии». Не превращать каждый ряд в крупную промо-карточку.
- `Найти` фильтрует не жанры артистов, а эффект (`успокоиться`, `сфокусироваться`, `уснуть`, `взбодриться`), длительность и интенсивность. Поиск остаётся отдельным, предсказуемым сценарием.
- `Сохранённое` объединяет избранные сессии, недавние и загрузки. История — секция коллекции, а не самостоятельный мир продукта.
- Музыкальная сессия должна ощущаться настоящим плеером: play/pause, таймлайн, elapsed/remaining, громкость/микс голоса и музыки, очередь/следующая фаза, выход и сворачивание. Дыхательная подсказка дополняет, но не заменяет базовые audio controls.

### VKUI: навигация, плотность и компоненты

Официальная [схема навигации VKUI](https://vkui.io/overview/navigation/) рекомендует `Epic` + `Tabbar` для верхнеуровневых мобильных разделов, `View` для сценария внутри раздела и `PanelHeaderBack` для возврата. `Epic` переключает root-разделы без анимации и сохраняет более глубокую иерархию внутри каждой истории. Это подходящая модель для независимых стеков `Сейчас`, `Найти`, `Сохранённое`, `Профиль`.

Официальная документация [`Epic`/`Tabbar`](https://vkui.io/components/epic/) указывает 28 px как типичный размер иконки `TabbarItem`; активный раздел должен иметь явное selected-состояние. Tab bar — навигация, не место для действия «начать дыхание».

Официальный [`PanelHeader`](https://vkui.io/components/panel-header/) задаёт ожидаемую платформенную шапку и back-поведение. На мобильных для header actions рекомендованы иконки 28 px. Разделитель после шапки не нужен, когда визуальную границу уже создают search, tabs или banner; это поддерживает минимализм без лишних линий.

[`AppRoot`](https://vkui.io/components/app-root/) инкапсулирует scroll, safe-area и порталы. Его документация отдельно требует учитывать `safe-area-inset-*`; положение прокрутки сохраняется при переходах между `Panel`. Для прототипа это означает: один scroll-контейнер на экран, content inset под tab bar/mini-player и отсутствие второго вложенного вертикального скролла.

[`Button`](https://vkui.io/components/button/) разделяет primary/secondary/tertiary действия, имеет loading/disabled-состояния и рекомендует иконки 12/16/24 px для кнопок S/M/L. Иконки без текста обязаны иметь доступное имя. Для `breath`: один акцентный CTA на экран; иконки player controls — единая оптическая серия, не смесь размеров.

VKUI использует [дизайн-токены](https://vkui.io/overview/design-tokens/) для отступов, цветов, типографики и тем, а не локальные произвольные значения. [`Spacing`](https://vkui.io/components/spacing/) прямо поддерживает шкалу токенов, где `xs` = 4 px. Практический ритм для макетов 376×812: шаг 4 px; gutter 16 px; gap внутри плотной строки 8–12 px; между смысловыми секциями 24–32 px; touch target не меньше 44×44 px.

## Сильные аналоги дыхательных сессий под музыку

### Othership — прямой категорийный ориентир

Официальные [App Store](https://apps.apple.com/us/app/othership-guided-breathwork/id1590348936), [Google Play](https://play.google.com/store/apps/details?id=com.breathwork.othership&hl=en-US) и [страница приложения Othership](https://www.othership.us/app) называют продукт music-driven breathwork и описывают 500+ сессий от 60 секунд до 60 минут, музыкальные soundscapes, ведущих, weekly releases, прогресс, challenges и Apple Health Mindful Minutes. Каталог организован по желаемому сдвигу состояния: `UP`, `DOWN`, `ALL AROUND`, `BODY`, `BRAIN`; ежедневные UP/DOWN уменьшают время выбора.

На официальных store screenshots видны пять root tabs (`Home`, `Explore`, `Favorites`, `Journeys`, `Profile`) и плотный медиа-плеер: полноэкранная обложка, заголовок и эффект, elapsed/remaining timeline, крупная pause, ±15 секунд, favorite/cast/download/share. Это визуальное наблюдение, а не утверждение о скрытом поведении интерфейса.

Выводы для `breath`:

- Эффект сессии должен быть главным названием категории, а не поэтический арт. «Снять напряжение» понятнее, чем «Тихий берег» без контекста; поэтическое имя можно оставить вторым уровнем бренда.
- На каждой карточке нужны длительность, эффект/интенсивность и тип сопровождения. В detail — техника дыхания, голос/без голоса, музыкальный характер и противопоказания, если техника интенсивная.
- Один персональный «Сейчас» снижает decision fatigue; каталог остаётся ниже, не конкурируя с быстрым стартом.
- Арт работает как обложка сессии, но не должен превращаться в декоративную пустую карточку. Текст и действие остаются видимыми без чтения изображения.

### Breathwrk — мультисенсорное руководство и настройка

Официальные [сайт Breathwrk](https://www.breathwrk.com/), [App Store](https://apps.apple.com/us/app/breathwrk-breathing-exercises/id1481804500) и [Google Play](https://play.google.com/store/apps/details?id=com.breathwrk.android&hl=en_US) описывают короткие комбинации inhale/exhale/hold, совмещённые с музыкой, голосом, визуальной подсказкой и haptics. Пользователь может настроить voice guide, sound guide, haptics и длительность; продукт разделяет короткие exercises и более длинные coach-led classes, имеет напоминания, offline и прогресс. Актуальное описание Google Play подчёркивает возможность заниматься с закрытыми глазами благодаря одновременным voice, music и haptic cues.

Выводы для `breath`:

- До старта показать короткий preview ритма: например, `вдох 4 · выдох 6`, общую длительность и уровень.
- В player одновременно достаточно одного доминирующего cue (`Вдох`, `Задержка`, `Выдох`) и спокойной фазовой анимации; таймер и controls вторичны. Не дублировать фазу в трёх конкурирующих визуализациях.
- Настройки звука должны быть прикладными: `Музыка`, `Голос`, `Сигналы`, `Вибрация`; sensible defaults позволяют начать без конфигурации.
- Для reduce motion/haptics off должна оставаться полноценная аудио- и текстовая подсказка.

### Open — ежедневная практика и премиальная редактура

Официальные [App Store Open](https://apps.apple.com/us/app/open-breathwork-meditation/id1482725254), [сайт](https://o-p-e-n.com/global) и [FAQ](https://o-p-e-n.com/faq) описывают библиотеку 5–60-минутных breathwork/meditation/movement classes, персональную daily practice, программы, свежие классы, reminders/progress и иммерсивное сочетание музыки, звука, дыхания, движения и visuals. В App Store отдельно указано, что запись Mindful Minutes в Apple Health опциональна.

Выводы для `breath`:

- Главная должна давать конкретную ежедневную рекомендацию и одну причину выбора: «8 минут · мягкий выдох · после рабочего дня».
- Серии и программы полезны только после доказанного одиночного core loop; на первом проходе не заставлять выбирать challenge, streak или аккаунт.
- Высокое качество ощущается через редактуру контента, типографику и звук, а не через множество glass-карточек, свечений и декоративных градиентов.

## Player/session: рекомендуемая композиция 376×812

Порядок сверху вниз:

1. Safe-area + компактная session header: закрыть/назад, название, sound settings. Иконки одного семейства и оптического размера; tap area ≥ 44 px.
2. Обложка/ambient background как слой атмосферы, не как отдельная большая карточка.
3. Центральный breath cue: одна мягко масштабируемая форма, фаза крупным текстом, короткая инструкция. Анимация не должна быть единственным носителем информации.
4. Компактная фазовая дорожка или подпись `2 из 3`; не отдельный тяжёлый progress-card.
5. Время и scrubber. Scrubbing можно отключить для структурированной техники, но тогда это должно быть ясно, а прогресс остаётся видимым.
6. Основной control play/pause 56–64 px; adjacent controls 44–48 px. Кнопки mix, captions/voice и more не смешивать с root navigation.
7. Bottom safe-area. Root tab bar на полноэкранной активной сессии скрыт; после выхода возвращается тот же tab и scroll position.

Состояния, которые должны быть отрисованы, а не подразумеваться: loading/buffering, playing, paused, interrupted (звонок/другая аудиосессия), offline unavailable, completed, reduced motion, voice muted. Завершение показывает фактический результат (`8 минут`, сохранение/повтор), а не медицинские метрики без измерения.

Apple [Playing audio HIG](https://developer.apple.com/design/human-interface-guidelines/playing-audio) добавляет обязательные поведенческие детали: уважать системную громкость, сразу ставить playback на паузу при отключении наушников, корректно обрабатывать interruptions и предоставлять внешние/Control Center controls только для актуального playing context. Дыхательные команды нельзя передавать только звуком: визуальный текстовый cue и явный play/pause сохраняют сценарий при выключенном голосе и для пользователей с нарушениями слуха.

## Permissions и platform capabilities

### Камера

Apple требует явное разрешение перед первым доступом к capture device; приложение обязано дать `NSCameraUsageDescription`, проверить `authorizationStatus`, запросить доступ только при `.notDetermined` и обработать `.denied`/`.restricted`. Система запоминает ответ, повторный запрос не показывает alert. Источник: [Requesting authorization to capture and save media](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media).

Для `breath`: pre-permission экран допустим только после тапа `Считать свет комнаты`, с одной конкретной пользой и CTA. Deny fallback остаётся на том же экране: ручная палитра и выбор изображения; отдельный dead-end экран не обязателен. Для уже denied — `Открыть настройки` + `Продолжить вручную`, без повторной имитации системного prompt.

### Фото

Apple прямо указывает, что системный [`PHPickerViewController`](https://developer.apple.com/documentation/photokit/selecting-photos-and-videos-in-ios) работает в отдельном процессе и не требует permission к фотобиблиотеке; приложение получает только выбранные пользователем assets. Расширенная библиотека PhotoKit нужна лишь для browsing/collections/editing и имеет `limited`, `authorized`, `denied`, `restricted` состояния ([PhotoKit privacy](https://developer.apple.com/documentation/photokit/delivering-an-enhanced-privacy-experience-in-your-photos-app)).

Для текущего действия `Выбрать цвет из фото` нужен PHPicker без собственного permission alert и без `NSPhotoLibraryUsageDescription`. Cancel возвращает в studio без ошибки. Только если продукт начнёт сам просматривать медиатеку, появляется системное разрешение и limited-library UI.

### Фоновое аудио

Это не пользовательское разрешение. Apple требует `AVAudioSession` category `.playback` и Background Modes → Audio/AirPlay/Picture in Picture; после этого аудио может продолжаться при блокировке и уходе в другое приложение. Источники: [Configuring your app for media playback](https://developer.apple.com/documentation/avfoundation/configuring-your-app-for-media-playback) и [Configuring background execution modes](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes).

Для `breath`: убрать activation/deny alert «Фоновое аудио». Пункт в player — обычный понятный статус или настройка, но базовое ожидание музыкального приложения — продолжить playback автоматически. Реальные fallback-состояния: audio interruption, route change, network/offline и невозможность загрузить трек. Системные Now Playing и remote controls должны отражать название сессии, play/pause и прогресс; основа — [MPRemoteCommandCenter](https://developer.apple.com/documentation/mediaplayer/remote-command-center-events).

### Уведомления

Apple рекомендует [запрашивать authorization в контексте](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications), когда польза уже понятна, а не на первом запуске. Первый ответ запоминается; далее приложение обязано читать текущие settings. HIG требует объяснить тип уведомлений и дать управление ими внутри приложения: [Managing notifications](https://developer.apple.com/design/human-interface-guidelines/managing-notifications).

Для `breath`: запрос появляется после явного включения `Напоминать о вечерней сессии` или создания первого расписания. Если denied, switch возвращается в off и рядом появляется `Разрешить в настройках`; главная и библиотека полностью работают без push.

### Universal Links / Associated Domains

Это capability и серверная ассоциация, не пользовательский permission. Apple описывает entitlement + AASA; установленное приложение открывает соответствующий контент, а без приложения тот же HTTPS URL открывается в браузере: [Allowing apps and websites to link to your content](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/). Входящие параметры нужно валидировать; link не должен выполнять разрушительное действие: [Supporting universal links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app).

Для `breath`: убрать alert и действие `Проверить ссылку` из permissions/profile. Нужен обычный deeplink entry: валидная сессия → detail; недоступная/удалённая → понятный not-found с CTA `На главную`; web fallback — страница той же сессии.

## Onboarding, типографика и spacing

Apple HIG рекомендует делать [onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) быстрым, интерактивным и опциональным, откладывать необязательную настройку и спрашивать private access в момент функции. Для `breath` лучший onboarding — запустить короткий 60-секундный preview; выбор уведомлений, камеры и оформления перенести в контекст.

По [Apple Typography HIG](https://developer.apple.com/design/human-interface-guidelines/typography) базовый размер iOS — 17 pt, минимум — 11 pt; следует избегать Light/Thin, сохранять иерархию и адаптироваться к Dynamic Type. Рабочая шкала прототипа: session title 24–28/semibold, page title 28–32/bold, section 19–22/semibold, body 16–17/regular, metadata 13–15/medium, microcopy не меньше 12. Один sans-serif UI family; декоративный шрифт — максимум в wordmark, не в controls.

По [Apple Layout HIG](https://developer.apple.com/design/human-interface-guidelines/layout) контент должен уважать safe areas, system bars и margins. По [Accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) рекомендуемый touch target на iOS — 44×44 pt, а расстояние между controls так же важно, как их размер. Для 376×812: 16 px side gutter, CTA не касается края, scroll content получает нижний inset `tabbar + mini-player + safe-area`, fixed controls не закрывают последнюю строку.

Минимум бордеров: разделять иерархией фона, расстоянием и типографикой. Бордер допустим для focus/selected/error или когда соседние интерактивные зоны иначе сливаются. Не оборачивать каждую строку в карточку.

## Проверяемая схема переходов

- Root tab tap → соответствующий независимый стек, без анимации; повторный tap → root/scroll top по выбранному продуктовому правилу.
- `Сейчас/Найти/Сохранённое → detail → setup → player → result`; системный back идёт строго в обратном порядке.
- Player close → detail или исходный список с сохранённым scroll; completed → result; `Готово` → исходный root.
- Deeplink валидной сессии → detail; back → предыдущий app context, а при cold start → `Сейчас`.
- Camera granted → capture → studio; denied/restricted → studio с ручным fallback и Settings CTA.
- PHPicker selected → studio с палитрой; cancel → studio без toast об ошибке.
- Notifications allowed → switch on; denied → switch off + Settings CTA; весь продукт продолжает работать.
- Offline saved session → player; offline unsaved → detail с состоянием unavailable и CTA к сохранённым.
- Tab bar скрывается только в иммерсивном player; на остальных уровнях остаётся стабильным. Apple также определяет tab bar как навигацию между top-level sections и рекомендует сохранять его предсказуемость: [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars).

## Что сознательно не копировать

- Не копировать VK blue, логотип, названия разделов или карточки буквально. Брать структурную грамматику: плотность, ясный header/back, устойчивые root tabs, коллекцию и player conventions.
- Не брать у wellness-аналогов эзотерический jargon, ложные медицинские обещания, streak pressure и paywall до первой полезной сессии.
- Не выдавать декоративную реакцию фона за измерение дыхания, если нет реального sensor input. Без микрофона/камеры фазы задаются таймингом; интерфейс должен честно говорить «следуйте ритму», а не «мы слышим ваше дыхание».
- Не использовать emoji как иконки, абстрактные wireframe-заглушки, случайные glow/gradient blobs, огромные пустые hero-карточки и бордер вокруг каждого блока.

## Приоритеты редизайна

1. Исправить модель permissions: убрать фальшивые prompts для background audio, PHPicker и Universal Links.
2. Перестроить IA на `Сейчас / Найти / Сохранённое / Профиль`; перенести session setup в flow.
3. Сделать detail информативным и player полноценным музыкальным плеером с breath cue.
4. Свести карточки к плотным контентным форматам с duration/effect/intensity; оставить один hero quick start.
5. Пройти все back/root/deeplink/deny/offline/interruption состояния и safe-area на 376×812.
