# Радиус — карта экранов и архитектура

Заполняется по PLAYBOOK.md. Блоки `@generated:*` пересобираются командой `npm run docs -- radius` — внутрь них руками не пишем.

## Информационная архитектура

Дерево выведено из разметки экранов и `concept.json`: вложенность — по `parent`, подпись «открывается» — реальный элемент прототипа. Первые два узла всегда одни и те же: вход по номеру (`phone` → `code`).

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    └─ Код из SMS (code) — push · открывается: «Продолжить»
        ├─ Неверный код (codefail) — push · открывается: переход
        └─ Бесплатный просмотр (ads) — onboarding · открывается: «Войти» · tracking

Главная (home) — tab (root) · открывается: «Настроить рекламу» (tracking), «Продолжить без отслеживания», «Матч настроен» · location
    ├─ Матчи рядом (nearby) — push · открывается: «Рядом», «Рядом с вами» (location)
    ├─ Прямой эфир (watch) — push · открывается: «68′», «0:24» …, «Телевизор в гостиной», «VK Капсула» · photoadd, localnet, audio, domains
    │   ├─ Экран погас (background) — system · открывается: entitlement (audio)
    │   ├─ Смотреть на телевизоре (cast) — sheet · открывается: «Смотреть на телевизоре» (localnet)
    │   └─ Матч по ссылке (deeplink) — system handoff · открывается: entitlement (domains)
    └─ Поиск (search) — push · открывается: «Поиск»

Моменты (clips) — tab (root) · открывается: «00:08»

Создать (create) — tab (root) · открывается: «Закрыть» · mic, camera, photo
    ├─ Операторская камера (camera) — fullscreen · открывается: «Начать трансляцию», «Снять момент» (camera + mic)
    │   └─ Настройка матча (publish) — push · открывается: «Завершить», «Далее»
    └─ Выбор видео (upload) — system picker · открывается: «Загрузить видео» (photo)

Подписки (subscriptions) — tab (root) · открывается: вкладка таб-бара · push
    └─ Команда (channel) — push · открывается: «19:30», «СФ»

Профиль (profile) — tab (root) · открывается: вкладка таб-бара
    ├─ Мои видео (saved) — push · открывается: «Все», «42:18»
    ├─ Сохранённые моменты (moments) — push · открывается: «0:24», «Сохранённое»
    └─ Команды и роли (teams) — push · открывается: «Каналы и роли»
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход по номеру | старт, без таб-бара | — |
| `code` | Код из SMS | push | — |
| `codefail` | Неверный код | push | — |
| `ads` | Бесплатный просмотр | onboarding | tracking |
| `home` | Главная | tab (root) | location |
| `nearby` | Матчи рядом | push | — |
| `watch` | Прямой эфир | push | photoadd, localnet, audio (activate), domains (activate) |
| `background` | Экран погас | system | — |
| `cast` | Смотреть на телевизоре | sheet | — |
| `deeplink` | Матч по ссылке | system handoff | — |
| `clips` | Моменты | tab (root) | — |
| `create` | Создать | tab (root) | mic, camera, photo |
| `camera` | Операторская камера | fullscreen | — |
| `upload` | Выбор видео | system picker | — |
| `publish` | Настройка матча | push | — |
| `subscriptions` | Подписки | tab (root) | push |
| `channel` | Команда | push | — |
| `profile` | Профиль | tab (root) | — |
| `saved` | Мои видео | push | — |
| `moments` | Сохранённые моменты | push | — |
| `teams` | Команды и роли | push | — |
| `search` | Поиск | push | — |
<!-- @end -->

## Переходы: откуда куда и чем

Каждая строка — элемент, который есть в прототипе. Вкладки таб-бара опущены: они ведут в корни разделов и одинаковы на всех экранах.

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Продолжить» | `code` | — | переход |
| `code` | переход | `codefail` | — | переход |
| `code` | «Войти» | `ads` | — | переход |
| `codefail` | — | — | — | дальше переходов нет |
| `ads` | «Назад» | `code` | — | возврат по IA |
| `ads` | «Настроить рекламу» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Продолжить без отслеживания» | `home` | — | переход |
| `home` | «Поиск» | `search` | — | переход |
| `home` | «Рядом», «Рядом с вами» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Рядом», «Рядом с вами» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «68′», «0:24» … | `watch` | — | переход |
| `home` | «19:30» | `channel` | — | переход |
| `nearby` | «620 М · LIVE» | `watch` | — | переход |
| `watch` | «Назад» | `home` | — | возврат по IA |
| `watch` | «Смотреть на телевизоре» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `watch` | «Смотреть на телевизоре» | `watch` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `watch` | «СФ» | `channel` | — | переход |
| `watch` | entitlement | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `watch` | запрос доступа | `watch` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `watch` | entitlement | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `background` | «Север — Порт · 1:1» | `watch` | — | переход |
| `cast` | «Телевизор в гостиной», «VK Капсула» | `watch` | — | подтверждение |
| `deeplink` | «Открыть матч в «Лиге»» | `watch` | — | переход |
| `clips` | entitlement | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `create` | «Начать трансляцию», «Снять момент» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `create` | «Начать трансляцию», «Снять момент» | `create` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `create` | «Загрузить видео» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Загрузить видео» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `camera` | «Закрыть» | `create` | — | переход |
| `camera` | «Завершить» | `publish` | — | переход |
| `upload` | «Далее» | `publish` | — | переход |
| `publish` | «Матч настроен» | `home` | — | переход |
| `subscriptions` | «Не пропускать новые эфиры» | `subscriptions` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `subscriptions` | «68′», «0:24» | `watch` | — | переход |
| `channel` | «LIVE · 68′» | `watch` | — | переход |
| `profile` | «Все», «42:18» | `saved` | — | переход |
| `profile` | «0:24», «Сохранённое» | `moments` | — | переход |
| `profile` | «Каналы и роли» | `teams` | — | переход |
| `saved` | «12.08» | `watch` | — | переход |
| `moments` | «51′» | `watch` | — | переход |
| `moments` | «00:08» | `clips` | — | переход |
| `teams` | «СФ» | `channel` | — | переход |
| `search` | «СФ» | `channel` | — | переход |
| `search` | «LIVE» | `watch` | — | переход |
<!-- @end -->

## Матрица доступов

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSPhotoLibraryAddUsageDescription` | «Сохранить момент» в эфире | Прямой эфир | Момент остаётся в разделе «Мои видео» | Низкий |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | Кнопка телевизора в плеере | Прямой эфир | Эфир продолжает играть на iPhone | Низкий |
| `NSMicrophoneUsageDescription` | «Начать трансляцию» | Создать | Можно начать эфир без звука или загрузить запись | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Рядом» на главной | Главная | Открывается расписание выбранного города | **Условный** — Запрос только после выбора фильтра «Рядом» |
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
