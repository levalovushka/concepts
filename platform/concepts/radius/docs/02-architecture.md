# Радиус — карта экранов и архитектура

Заполняется по PLAYBOOK.md. Блоки `@generated:*` пересобираются командой `npm run docs -- radius` — внутрь них руками не пишем.

## Информационная архитектура

Дерево выведено из разметки экранов и `concept.json`: вложенность — по `parent`, подпись «открывается» — реальный элемент прототипа. Первые два узла всегда одни и те же: вход по номеру (`phone` → `code`).

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    └─ Код из SMS (code) — push · открывается: «Продолжить»
        ├─ Неверный код (codefail) — push · открывается: «Код из SMS»
        └─ Бесплатная версия (ads) — onboarding · открывается: «Войти» · tracking

Главная (home) — tab (root) · открывается: «Настроить рекламу» (tracking), «Продолжить без отслеживания» · location
    ├─ Рядом (nearby) — push · открывается: «Поиск», «Рядом» (location)
    └─ Видео (watch) — push · открывается: «18:42», «12:08» … · photoadd, localnet, audio, domains
        ├─ Экран погас (background) — system · открывается: entitlement (audio)
        ├─ Смотреть на телевизоре (cast) — sheet · открывается: «Смотреть на телевизоре» (localnet)
        └─ Видео по ссылке (deeplink) — system handoff · открывается: entitlement (domains)

Клипы (clips) — tab (root) · открывается: вкладка таб-бара

Создать (create) — tab (root) · открывается: переход · mic, camera, photo
    ├─ Камера (camera) — fullscreen · открывается: «Создать клип», «Начать трансляцию» (camera + mic)
    │   └─ Публикация (publish) — push · открывается: «Начать запись», «Далее»
    │       └─ Слишком длинное название (publishfail) — push · открывается: «Название»
    └─ Выбор видео (upload) — system picker · открывается: «Загрузить видео» (photo)

Подписки (subscriptions) — tab (root) · открывается: вкладка таб-бара · push
    └─ Канал (channel) — push · открывается: «СП», «КР» …

Профиль (profile) — tab (root) · открывается: «Сохранить», «Опубликовать»
    └─ Сохранённые (saved) — push · открывается: «Все», «27:10» …
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход по номеру | старт, без таб-бара | — |
| `code` | Код из SMS | push | — |
| `codefail` | Неверный код | push | — |
| `ads` | Бесплатная версия | onboarding | tracking |
| `home` | Главная | tab (root) | location |
| `nearby` | Рядом | push | — |
| `watch` | Видео | push | photoadd, localnet, audio (activate), domains (activate) |
| `background` | Экран погас | system | — |
| `cast` | Смотреть на телевизоре | sheet | — |
| `deeplink` | Видео по ссылке | system handoff | — |
| `clips` | Клипы | tab (root) | — |
| `create` | Создать | tab (root) | mic, camera, photo |
| `camera` | Камера | fullscreen | — |
| `upload` | Выбор видео | system picker | — |
| `publish` | Публикация | push | — |
| `publishfail` | Слишком длинное название | push | — |
| `subscriptions` | Подписки | tab (root) | push |
| `channel` | Канал | push | — |
| `profile` | Профиль | tab (root) | — |
| `saved` | Сохранённые | push | — |
<!-- @end -->

## Переходы: откуда куда и чем

Каждая строка — элемент, который есть в прототипе. Вкладки таб-бара опущены: они ведут в корни разделов и одинаковы на всех экранах.

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Продолжить» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «Код из SMS» | `codefail` | — | переход |
| `code` | «Войти» | `ads` | — | переход |
| `codefail` | «Назад» | `code` | — | возврат по IA |
| `ads` | «Настроить рекламу» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Продолжить без отслеживания» | `home` | — | переход |
| `home` | «Поиск» | `nearby` | — | переход |
| `home` | «Рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Рядом» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «18:42», «12:08» … | `watch` | — | переход |
| `nearby` | «Назад» | `home` | — | возврат по IA |
| `nearby` | «18:42», «0:46» … | `watch` | — | переход |
| `watch` | «Назад» | `home` | — | возврат по IA |
| `watch` | «Смотреть на телевизоре» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `watch` | «Смотреть на телевизоре» | `watch` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `watch` | «СП» | `channel` | — | переход |
| `watch` | entitlement | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `watch` | запрос доступа | `watch` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `watch` | entitlement | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `watch` | «12:08» | `watch` | — | переход |
| `background` | «Среда, 12 августа» | `watch` | — | переход |
| `cast` | — | — | — | дальше переходов нет |
| `deeplink` | «Смотреть» | `watch` | — | переход |
| `clips` | «КР» | `channel` | — | переход |
| `create` | «Загрузить видео» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Загрузить видео» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `create` | «Создать клип», «Начать трансляцию» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `create` | «Создать клип», «Начать трансляцию» | `create` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `create` | «Отмена» | `create` | — | переход |
| `camera` | «Начать запись» | `publish` | — | переход |
| `upload` | «Далее» | `publish` | — | переход |
| `publish` | переход | `create` | — | переход |
| `publish` | «Сохранить», «Опубликовать» | `profile` | — | переход |
| `publish` | «Название» | `publishfail` | — | переход |
| `publishfail` | — | — | — | дальше переходов нет |
| `subscriptions` | «СП», «УТ» | `channel` | — | переход |
| `subscriptions` | «Уведомления о новых видео» | `subscriptions` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `subscriptions` | «12:08» | `watch` | — | переход |
| `channel` | «12:08», «8:16» | `watch` | — | переход |
| `profile` | «18:42», «12:08» | `watch` | — | переход |
| `profile` | «Все», «27:10» … | `saved` | — | переход |
| `saved` | «18:42», «12:08» … | `watch` | — | переход |
<!-- @end -->

## Матрица доступов

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSPhotoLibraryAddUsageDescription` | «Сохранить» под видео | Видео | Видео остаётся доступно в разделе «Сохранённые» внутри приложения | Низкий |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | Кнопка телевизора в плеере | Видео | Видео продолжает играть на iPhone; в листе устройств есть переход в Настройки | Низкий |
| `NSMicrophoneUsageDescription` | «Снять видео» на вкладке «Создать» | Создать | Можно загрузить готовое видео или снять клип без звука | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Рядом · 20 минут» на главной | Главная | Остаётся общая редакционная лента; город можно выбрать вручную | **Условный** — CLLocationManager запрашивается только после выбора режима «Рядом» |
| `NSUserTrackingUsageDescription` | «Продолжить бесплатно» после входа | Бесплатная версия | Показывается неперсонализированная реклама, все видео доступны | **Условный** — ATT показывается после собственного объяснения; IDFA передаётся только рекламному SDK |
| `NSCameraUsageDescription` | «Снять видео» на вкладке «Создать» | Создать | Остаётся загрузка готового видео из медиатеки | Низкий |
| `NSPhotoLibraryUsageDescription` | «Выбрать из медиатеки» | Создать | Можно снять новое видео камерой | Низкий |
| `UIBackgroundModes: audio` | «Слушать в фоне» в плеере | Видео | Без capability воспроизведение останавливается при блокировке — функция не поставляется | **Условный** — AVPlayer действительно воспроизводит контент, MPNowPlayingInfoCenter заполнен, remote-команды работают |
| `aps-environment (Push Notifications capability)` | Свитч «Новые видео» в «Подписках» | Подписки | Новые публикации отмечаются точкой внутри вкладки | **Условный** — Регистрация в APNs и отправка из панели провайдера по выбранным темам |
| `com.apple.developer.associated-domains` | «Поделиться ссылкой» под видео | Видео | Ссылка открывается в браузере на публичной странице видео | **Условный** — Статический apple-app-site-association обслуживает только /v/* и /place/* |
<!-- @end -->

## Почему здесь нет бэкенда

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Каталог и рекомендации | Статический редакционный пакет для прототипа; история просмотра и веса тем хранятся локально |
| Загрузка видео | В прототипе создаётся локальный черновик; production-версия передаёт файл в SDK видеопровайдера |
| Подписки | Выбранные авторы и места хранятся в Core Data; уведомления — темы FCM из панели провайдера |
| Публичные ссылки | Статические страницы radius.video и apple-app-site-association; собственного API нет |
<!-- @end -->

## Правила IA

Дописать словами то, чего в таблицах не видно: почему экран открывается именно отсюда, что убирает fallback, где сбой фичи отличается от отказа в доступе.
