# Радиус — карта экранов и архитектура

Заполняется по PLAYBOOK.md. Блоки `@generated:*` пересобираются командой `npm run docs -- radius` — внутрь них руками не пишем.

## Информационная архитектура

Дерево выведено из разметки экранов и `concept.json`: вложенность — по `parent`, подпись «открывается» — реальный элемент прототипа. Первые два узла всегда одни и те же: вход по номеру (`phone` → `code`).

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    └─ Код из SMS (code) — push · открывается: «Продолжить»
        └─ Бесплатный просмотр (ads) — onboarding · открывается: «4» · tracking

Игровой день (home) — tab (root) · открывается: «Продолжить» (tracking), «Не сейчас», «Создать матч» · location
    ├─ Матчи рядом (nearby) — push · открывается: «Рядом» (location)
    └─ Прямой эфир (watch) — push · открывается: «● В ЭФИРЕ · 68′», «620 м» … · photoadd, localnet, audio, domains
        ├─ Экран погас (background) — system · открывается: «Слушать» (audio)
        ├─ Смотреть на телевизоре (cast) — sheet · открывается: запрос доступа (localnet)
        └─ Матч по ссылке (deeplink) — system handoff · открывается: «Поделиться» (domains)

Клипы (clips) — tab (root) · открывается: вкладка таб-бара

Создать (create) — tab (root) · открывается: «Закрыть» · mic, camera, photo
    ├─ Операторская камера (camera) — fullscreen · открывается: «Начать трансляцию» (camera + mic)
    │   └─ Настройка матча (publish) — push · открывается: «Создать матч», «Завершить» …
    └─ Выбор видео (upload) — system picker · открывается: «Загрузить видео» (photo)

Подписки (subscriptions) — tab (root) · открывается: вкладка таб-бара · push
    └─ Команда (channel) — push · открывается: «19:30», «С» …

Профиль (profile) — tab (root) · открывается: вкладка таб-бара
    └─ Мои видео (saved) — push · открывается: «Мои видео»
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход по номеру | старт, без таб-бара | — |
| `code` | Код из SMS | push | — |
| `ads` | Бесплатный просмотр | onboarding | tracking |
| `home` | Игровой день | tab (root) | location |
| `nearby` | Матчи рядом | push | — |
| `watch` | Прямой эфир | push | photoadd, localnet, audio (activate), domains (activate) |
| `background` | Экран погас | system | — |
| `cast` | Смотреть на телевизоре | sheet | — |
| `deeplink` | Матч по ссылке | system handoff | — |
| `clips` | Клипы | tab (root) | — |
| `create` | Создать | tab (root) | mic, camera, photo |
| `camera` | Операторская камера | fullscreen | — |
| `upload` | Выбор видео | system picker | — |
| `publish` | Настройка матча | push | — |
| `subscriptions` | Подписки | tab (root) | push |
| `channel` | Команда | push | — |
| `profile` | Профиль | tab (root) | — |
| `saved` | Мои видео | push | — |
<!-- @end -->

## Переходы: откуда куда и чем

Каждая строка — элемент, который есть в прототипе. Вкладки таб-бара опущены: они ведут в корни разделов и одинаковы на всех экранах.

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Продолжить» | `code` | — | переход |
| `code` | «4» | `ads` | — | переход |
| `ads` | «Продолжить» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Не сейчас» | `home` | — | переход |
| `home` | «Рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Рядом» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «● В ЭФИРЕ · 68′» | `watch` | — | переход |
| `home` | «19:30» | `channel` | — | переход |
| `nearby` | «620 м» | `watch` | — | переход |
| `watch` | запрос доступа | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `watch` | отказ | `watch` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `watch` | «Сохранить» | `watch` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `watch` | «Слушать» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `watch` | «Поделиться» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `watch` | «С» | `channel` | — | переход |
| `background` | — | — | — | дальше переходов нет |
| `cast` | «Отмена» | `watch` | — | возврат по IA |
| `deeplink` | «Открыть в «Лиге»» | `watch` | — | переход |
| `clips` | «Поделиться» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `create` | «Начать трансляцию» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `create` | «Начать трансляцию» | `create` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `create` | «Загрузить видео» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Загрузить видео» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `create` | «Создать матч» | `publish` | — | переход |
| `camera` | «Закрыть» | `create` | — | переход |
| `camera` | «Завершить» | `publish` | — | переход |
| `upload` | «Далее» | `publish` | — | переход |
| `publish` | «Создать матч» | `home` | — | переход |
| `subscriptions` | «СФ» | `channel` | — | переход |
| `subscriptions` | «Напоминать о матчах» | `subscriptions` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `subscriptions` | «Север — Порт» | `watch` | — | переход |
| `channel` | «● В ЭФИРЕ · 68′» | `watch` | — | переход |
| `profile` | «Мои видео» | `saved` | — | переход |
| `saved` | «42:18» | `watch` | — | переход |
<!-- @end -->

## Матрица доступов

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSPhotoLibraryAddUsageDescription` | «Сохранить момент» в эфире | Прямой эфир | Момент остаётся в разделе «Мои видео» | Низкий |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | Кнопка телевизора в плеере | Прямой эфир | Эфир продолжает играть на iPhone | Низкий |
| `NSMicrophoneUsageDescription` | «Начать трансляцию» | Создать | Можно начать эфир без звука или загрузить запись | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Рядом» на главной | Игровой день | Открывается расписание выбранного города | **Условный** — Запрос только после выбора фильтра «Рядом» |
| `NSUserTrackingUsageDescription` | «Продолжить бесплатно» после входа | Бесплатный просмотр | Показывается неперсонализированная реклама | **Условный** — ATT после собственного объяснения |
| `NSCameraUsageDescription` | «Начать трансляцию» | Создать | Остаётся загрузка готового видео | Низкий |
| `NSPhotoLibraryUsageDescription` | «Выбрать видео» на вкладке «Создать» | Создать | Можно снять новое видео камерой | Низкий |
| `UIBackgroundModes: audio` | «Слушать» под плеером | Прямой эфир | Без capability эфир останавливается при блокировке | **Условный** — AVPlayer, Now Playing и remote-команды реально работают |
| `aps-environment (Push Notifications capability)` | Свитч «Начало матчей» в подписках | Подписки | Начало матчей отмечается внутри вкладки | **Условный** — APNs topics для выбранных команд |
| `com.apple.developer.associated-domains` | «Поделиться» под эфиром | Прямой эфир | Ссылка открывается на публичной странице матча | **Условный** — apple-app-site-association обслуживает /match/* и /clip/* |
<!-- @end -->

## Почему здесь нет бэкенда

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Каталог турниров и матчей | Статический пакет демо; production получает расписание из API видеопровайдера |
| Live ingest и запись | В прототипе локальная запись; production передаёт поток в SDK видеопровайдера |
| Синхронизация протокола | В демо события предзаписаны; production использует real-time room матча |
| Публичные ссылки | Статические страницы liga.video и apple-app-site-association |
<!-- @end -->

## Правила IA

Дописать словами то, чего в таблицах не видно: почему экран открывается именно отсюда, что убирает fallback, где сбой фичи отличается от отказа в доступе.
