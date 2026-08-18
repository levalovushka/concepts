# Склейка — карта экранов и архитектура

Архитектура принципиально локальная: Core Data хранит описание и edit history, FileManager — исходники, proxy, draft и export. Блоки `@generated:*` пересобираются из спеки.

## Информационная архитектура

Дерево выведено из `parent` и реальных UI-переходов. Старт — локальные проекты; входа по номеру и аккаунта нет.

<!-- @generated:ia-tree -->
```
Локальные проекты (projects) — tab (root) · открывается: старт
    ├─ Новое событие (create) — push · открывается: «Создать событие», «Выбрать место» … · location
    │   └─ Место события (place) — system · открывается: «Место», «Повторить» (location), «Ввести вручную»
    └─ Выходные у озера (project) — push · открывается: «38 ВИДЕО», «Алматы, длинные выходные» … · camera, mic, photo
        ├─ Запросить материалы (invite) — modal · открывается: «Попросить видео»
        │   └─ Поделиться запросом (share) — system · открывается: «Поделиться запросом», «Отправить файл» …
        ├─ Камера (camera) — fullscreen · открывается: «Снять» (camera + mic), «Продолжить»
        ├─ Выбрать видео (import) — system · открывается: «Из Фото» (photo), «Из Файлов», «Добавить» …
        ├─ Сборка черновика (processing) — push · открывается: «Собрать черновик»
        └─ Черновик готов (draft) — push · открывается: «День рождения Леры», «Открыть черновик» …
            ├─ Порядок фрагментов (editor) — push · открывается: «Править порядок»
            └─ Просмотр фильма (viewer) — fullscreen · открывается: «Финал летнего концерта», «НЕДАВНО СОХРАНЁН» … · localnet, audio
                ├─ Смотреть на телевизоре (cast) — system · открывается: «Смотреть на телевизоре», «Повторить» (localnet), «iPhone»
                ├─ Экран погашен (background) — system · открывается: «Слушать с погашенным экраном» (audio)
                └─ Экспорт (export) — push · открывается: «Поделиться фильмом», «Экспортировать» · photoadd
                    └─ Фильм сохранён (saved) — state · открывается: «Сохранить в Фото», «Повторить» (photoadd)

Настройки (settings) — tab (root) · открывается: вкладка таб-бара

Архив (archive) — tab (root) · открывается: «Готовые фильмы»
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `projects` | Локальные проекты | tab (root) | — |
| `settings` | Настройки | tab (root) | — |
| `archive` | Архив | tab (root) | — |
| `create` | Новое событие | push | location |
| `place` | Место события | system | — |
| `project` | Выходные у озера | push | camera, mic, photo |
| `invite` | Запросить материалы | modal | — |
| `share` | Поделиться запросом | system | — |
| `camera` | Камера | fullscreen | — |
| `import` | Выбрать видео | system | — |
| `processing` | Сборка черновика | push | — |
| `draft` | Черновик готов | push | — |
| `editor` | Порядок фрагментов | push | — |
| `viewer` | Просмотр фильма | fullscreen | localnet, audio (activate) |
| `cast` | Смотреть на телевизоре | system | — |
| `background` | Экран погашен | system | — |
| `export` | Экспорт | push | photoadd |
| `saved` | Фильм сохранён | state | — |
<!-- @end -->

## Переходы: откуда куда и чем

Каждая строка — элемент, который есть в прототипе. Вкладки таб-бара опущены: они ведут в корни разделов и одинаковы на всех экранах.

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `projects` | «Создать событие» | `create` | — | переход |
| `projects` | «38 ВИДЕО», «Алматы, длинные выходные» | `project` | — | переход |
| `projects` | «День рождения Леры» | `draft` | — | переход |
| `projects` | «Финал летнего концерта» | `viewer` | — | переход |
| `settings` | «Готовые фильмы» | `archive` | — | переход |
| `archive` | «НЕДАВНО СОХРАНЁН», «Открыть последний фильм» … | `viewer` | — | переход |
| `create` | «Назад» | `projects` | — | возврат по IA |
| `create` | «Место», «Повторить» | `place` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `create` | «Место», «Повторить» | `create` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `create` | «Ввести вручную» | `place` | — | переход |
| `create` | «Создать событие» | `project` | — | переход |
| `place` | «Закрыть» | `create` | — | возврат по IA |
| `place` | «Выбрать место», «Ввести адрес вручную» … | `create` | — | переход |
| `project` | «Назад» | `projects` | — | возврат по IA |
| `project` | «Попросить видео» | `invite` | — | переход |
| `project` | «Снять» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `project` | «Снять» | `project` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `project` | «Из Фото» | `import` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `project` | «Из Фото» | `project` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `project` | «Из Файлов», «Добавить» | `import` | — | переход |
| `project` | «Продолжить» | `camera` | — | переход |
| `project` | «Собрать черновик» | `processing` | — | переход |
| `invite` | «Назад» | `project` | — | возврат по IA |
| `invite` | «Поделиться запросом» | `share` | — | переход |
| `share` | — | — | — | дальше переходов нет |
| `camera` | «Закрыть» | `project` | — | возврат по IA |
| `camera` | «Записать фрагмент» | `project` | — | переход |
| `camera` | «Импортировать видео» | `import` | — | переход |
| `import` | «Назад» | `project` | — | возврат по IA |
| `import` | «Готово» | `project` | — | переход |
| `processing` | «Назад» | `project` | — | возврат по IA |
| `processing` | «Открыть черновик» | `draft` | — | переход |
| `draft` | «Назад» | `project` | — | возврат по IA |
| `draft` | «На весь экран», «Воспроизвести» … | `viewer` | — | переход |
| `draft` | «Править порядок» | `editor` | — | переход |
| `editor` | «Назад» | `draft` | — | возврат по IA |
| `editor` | «Готово» | `draft` | — | переход |
| `viewer` | «Закрыть» | `draft` | — | возврат по IA |
| `viewer` | «Смотреть на телевизоре», «Повторить» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `viewer` | «Смотреть на телевизоре», «Повторить» | `viewer` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `viewer` | «Поделиться фильмом», «Экспортировать» | `export` | — | переход |
| `viewer` | «Слушать с погашенным экраном» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `cast` | «iPhone», «Гостиная» … | `viewer` | — | переход |
| `background` | «Пауза» | `viewer` | — | возврат по IA |
| `background` | «iPhone» | `cast` | — | переход |
| `export` | «Назад» | `viewer` | — | возврат по IA |
| `export` | «Сохранить в Фото», «Повторить» | `saved` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `export` | «Сохранить в Фото», «Повторить» | `export` | `NSPhotoLibraryAddUsageDescription` | отказ → fallback |
| `export` | «Отправить файл» | `share` | — | переход |
| `saved` | «Вернуться в проект» | `project` | — | переход |
| `saved` | «Отправить фильм» | `share` | — | переход |
<!-- @end -->

## Матрица доступов

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSCameraUsageDescription` | «Снять» в локальном проекте | Выходные у озера | Остаётся импорт готового видео и переход в Настройки | Низкий |
| `NSMicrophoneUsageDescription` | «Снять» в локальном проекте | Выходные у озера | Камера записывает немое видео; микрофон можно включить в Настройках | Низкий |
| `NSPhotoLibraryUsageDescription` | «Из Фото» в локальном проекте | Выходные у озера | Остаются камера и импорт из Files через системный document picker | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Моё местоположение» при создании | Новое событие | Место вводится вручную; группировка по времени и metadata продолжает работать | Средний |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | Кнопка Cast в плеере | Просмотр фильма | Фильм продолжает играть на iPhone; локальный файл и редактор доступны | Средний |
| `UIBackgroundModes: audio` | «Слушать с погашенным экраном» | Просмотр фильма | Пока экран активен, локальный плеер работает без фонового режима | **Условный** — AVAudioSession playback, Now Playing и remote commands |
| `NSPhotoLibraryAddUsageDescription` | «Сохранить в Фото» | Экспорт | Готовый файл остаётся в локальном проекте и доступен через Share Sheet или Files | Низкий |
<!-- @end -->

## Почему здесь нет бэкенда

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Хранение проекта и истории изменений | Core Data для описания; FileManager для исходников, proxy, draft и экспортов в контейнере приложения |
| Получение роликов от друзей | AirDrop, сообщения и другие системные каналы работают вне приложения; владелец вручную импортирует полученные файлы из Photos или Files |
| Группировка и черновой монтаж | AVFoundation, ImageIO metadata, Vision и Core ML на устройстве; основная ценность доступна в авиарежиме |
| Запрос и отправка материалов | UIActivityViewController передаёт статичную карточку-инструкцию; приложение не знает получателей, доставку или ответы |
<!-- @end -->

## Правила IA

Карточка запроса не создаёт удалённую сущность. Photos и Files отдают только выбранные файлы. Denied всегда оставляет второй локальный источник или повтор через Settings. Processing и export не требуют сети.
