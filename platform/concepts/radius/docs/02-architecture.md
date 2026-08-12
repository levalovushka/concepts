# Радиус — карта экранов и архитектура

Заполняется по PLAYBOOK.md. Блоки `@generated:*` пересобираются командой `npm run docs -- radius` — внутрь них руками не пишем.

## Информационная архитектура

Дерево выведено из разметки экранов и `concept.json`: вложенность — по `parent`, подпись «открывается» — реальный элемент прототипа. Первые два узла всегда одни и те же: вход по номеру (`phone` → `code`).

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    └─ Код из SMS (code) — push · открывается: «Получить код»
        └─ Бесплатная версия (ads) — onboarding · открывается: «Войти» · tracking

Главная (home) — tab (root) · открывается: «Продолжить бесплатно» (tracking), «Не сейчас» · location
    ├─ Рядом (nearby) — push · открывается: «Рядом · 20 мин» (location)
    └─ Видео (watch) — push · открывается: «Открыть видео Летний кинотеатр», «Старый центр» … · photoadd, localnet, audio, domains
        ├─ Экран погас (background) — system · открывается: «Слушать» (audio)
        ├─ Смотреть на телевизоре (cast) — sheet · открывается: «Смотреть на телевизоре» (localnet)
        └─ Видео по ссылке (deeplink) — system handoff · открывается: «Поделиться» (domains)

Клипы (clips) — tab (root) · открывается: вкладка таб-бара

Создать (create) — tab (root) · открывается: переход · mic, camera, photo
    ├─ Камера (camera) — fullscreen · открывается: «Снять видео» (camera + mic)
    │   └─ Публикация (publish) — push · открывается: «Черновик», «Начать запись» …
    └─ Выбор видео (upload) — system picker · открывается: «Выбрать видео» (photo)

Подписки (subscriptions) — tab (root) · открывается: вкладка таб-бара · push
    └─ Канал (channel) — push · открывается: «СП», «КР» …

Профиль (profile) — tab (root) · открывается: «Сохранить», «Опубликовать»
    └─ Сохранённые (saved) — push · открывается: «Сохранённые»
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход по номеру | старт, без таб-бара | — |
| `code` | Код из SMS | push | — |
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
| `phone` | «Получить код» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «Войти» | `ads` | — | переход |
| `ads` | «Продолжить бесплатно» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Не сейчас» | `home` | — | переход |
| `home` | «Рядом · 20 мин» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Рядом · 20 мин» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «Открыть видео Летний кинотеатр», «Старый центр» … | `watch` | — | переход |
| `nearby` | «Назад» | `home` | — | возврат по IA |
| `nearby` | «18:42», «0:46» … | `watch` | — | переход |
| `watch` | «Назад» | `home` | — | возврат по IA |
| `watch` | «Смотреть на телевизоре» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `watch` | «Смотреть на телевизоре» | `watch` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `watch` | «СП» | `channel` | — | переход |
| `watch` | «Сохранить» | `watch` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `watch` | «Слушать» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `watch` | «Поделиться» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `watch` | «12:08» | `watch` | — | переход |
| `background` | — | — | — | дальше переходов нет |
| `cast` | — | — | — | дальше переходов нет |
| `deeplink` | «Смотреть» | `watch` | — | переход |
| `clips` | «КР» | `channel` | — | переход |
| `create` | «Снять видео» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `create` | «Снять видео» | `create` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `create` | «Выбрать видео» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Выбрать видео» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `create` | «Черновик» | `publish` | — | переход |
| `camera` | «Начать запись» | `publish` | — | переход |
| `upload` | «Далее» | `publish` | — | переход |
| `publish` | переход | `create` | — | переход |
| `publish` | «Сохранить», «Опубликовать» | `profile` | — | переход |
| `subscriptions` | «СП», «УТ» … | `channel` | — | переход |
| `subscriptions` | «Уведомлять о новых видео» | `subscriptions` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `subscriptions` | «Улица Тихая», «Северное побережье» | `watch` | — | переход |
| `channel` | «12:08», «8:16» | `watch` | — | переход |
| `profile` | «Сохранённые» | `saved` | — | переход |
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
