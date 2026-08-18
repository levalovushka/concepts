# Архитектура

Клиентский каталог выступлений приходит статическим пакетом. История, подписки и моменты хранятся в Core Data; черновики — в FileManager. AVPlayer, Cast SDK, APNs provider и AASA закрывают системные сценарии без собственного сервера.

## Навигация

Четыре root-раздела: `home`, `clips`, `subscriptions`, `profile`. Экран `create` не является вкладкой: он открывается из `+` на главной и закрывается обратно на `home`. Камера и медиатека возвращаются в `create`; публикация после обоих путей также возвращается в `create`, а успешная публикация ведёт в `clips`.

Основной просмотр: `home → watch → moment`. Канал артиста открывается из подписок и городской афиши. Cast, фоновое воспроизведение и universal link являются системными ответвлениями плеера и возвращаются в `watch`.

## Доступы и fallback

- `tracking`: после объяснения бесплатной модели; отказ оставляет контекстную рекламу на главной.
- `location`: только по нажатию «Рядом»; отказ открывает городскую афишу с ручным городом.
- `localnet`: только из Cast; отказ продолжает просмотр на iPhone.
- `photoadd`: только при экспорте момента; отказ сохраняет его внутри «Сцены».
- `camera + mic`: последовательная JIT-цепочка после «Снять клип»; отказ на любом шаге оставляет импорт.
- `photo`: только после «Выбрать видео»; отказ оставляет съёмку.
- `push`: только из переключателя напоминаний; отказ сохраняет расписание внутри приложения.
- `audio` и `domains`: entitlements без системного alert, активируются действиями плеера.

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход | старт | — |
| `code` | Код из SMS | push | — |
| `codefail` | Неверный код | push | — |
| `ads` | Бесплатный просмотр | onboarding | tracking |
| `home` | Главная | tab (root) | location |
| `nearby` | Рядом | push | — |
| `watch` | Концерт | push | localnet, audio (activate), domains (activate) |
| `moment` | Момент | push | photoadd |
| `background` | Экран погас | system | — |
| `cast` | На телевизоре | sheet | — |
| `deeplink` | По ссылке | system handoff | — |
| `clips` | Клипы | tab (root) | — |
| `create` | Создать клип | modal task | mic, camera, photo |
| `camera` | Камера | fullscreen | — |
| `upload` | Выбор видео | system picker | — |
| `publish` | Публикация | push | — |
| `subscriptions` | Подписки | tab (root) | push |
| `artist` | Артист | push | — |
| `profile` | Профиль | tab (root) | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSPhotoLibraryAddUsageDescription` | «Сохранить в Фото» в моменте | Момент | Момент остаётся в коллекции «Сцены» | Низкий |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | Кнопка Cast в плеере | Концерт | Концерт продолжает играть на iPhone | Низкий |
| `NSMicrophoneUsageDescription` | «Снять клип» после разрешения камеры | Создать клип | Можно импортировать готовое видео | Низкий |
| `NSLocationWhenInUseUsageDescription` | Чип «Рядом» на главной | Главная | Показывается афиша выбранного города | **Условный** — JIT-запрос после выбора Рядом |
| `NSUserTrackingUsageDescription` | «Смотреть бесплатно» после входа | Бесплатный просмотр | Контекстная реклама без трекинга | **Условный** — ATT после объяснения |
| `NSCameraUsageDescription` | «Снять клип» в экране создания | Создать клип | Остаётся импорт готовой записи | Низкий |
| `NSPhotoLibraryUsageDescription` | «Выбрать из медиатеки» | Создать клип | Можно снять новый момент камерой | Низкий |
| `UIBackgroundModes: audio` | «Слушать в фоне» в плеере | Концерт | Видео останавливается при блокировке | **Условный** — AVPlayer, Now Playing и remote-команды |
| `aps-environment (Push Notifications capability)` | Свитч «Премьеры» в подписках | Подписки | Премьеры отмечаются внутри вкладки | **Условный** — APNs topics артистов |
| `com.apple.developer.associated-domains` | «Поделиться» в плеере | Концерт | Открывается публичная веб-страница | **Условный** — AASA для /show/* и /moment/* |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Вход (phone) — старт · открывается: старт
    └─ Код из SMS (code) — push · открывается: «Продолжить»
        ├─ Неверный код (codefail) — push · открывается: «Код из четырёх цифр»
        └─ Бесплатный просмотр (ads) — onboarding · открывается: «Войти» · tracking

Главная (home) — tab (root) · открывается: «Смотреть бесплатно» (tracking) · location
    ├─ Рядом (nearby) — push · открывается: «Рядом» (location)
    ├─ Концерт (watch) — push · открывается: «ПРЕМЬЕРА СЕГОДНЯ», «58:12» … · localnet, audio, domains
    │   ├─ Момент (moment) — push · открывается: «Момент», «18:42» … · photoadd
    │   ├─ Экран погас (background) — system · открывается: entitlement (audio)
    │   ├─ На телевизоре (cast) — sheet · открывается: «Смотреть на телевизоре» (localnet)
    │   └─ По ссылке (deeplink) — system handoff · открывается: entitlement (domains)
    └─ Создать клип (create) — modal task · открывается: «Добавить видео» · mic, camera, photo
        ├─ Камера (camera) — fullscreen · открывается: «Снять клип» (camera + mic)
        ├─ Выбор видео (upload) — system picker · открывается: «Выбрать видео» (photo), «Открыть медиатеку»
        └─ Публикация (publish) — push · открывается: «Начать запись», «Далее»

Клипы (clips) — tab (root) · открывается: «Опубликовать клип»

Подписки (subscriptions) — tab (root) · открывается: вкладка таб-бара · push
    └─ Артист (artist) — push · открывается: «14», «LIVE»

Профиль (profile) — tab (root) · открывается: вкладка таб-бара
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Продолжить» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «Код из четырёх цифр» | `codefail` | — | переход |
| `code` | «Войти» | `ads` | — | переход |
| `codefail` | «Назад» | `code` | — | возврат по IA |
| `ads` | «Назад» | `code` | — | возврат по IA |
| `ads` | «Смотреть бесплатно» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `home` | «Добавить видео» | `create` | — | переход |
| `home` | «Рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Рядом» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «ПРЕМЬЕРА СЕГОДНЯ», «58:12» … | `watch` | — | переход |
| `nearby` | «Назад» | `home` | — | возврат по IA |
| `nearby` | «14» | `artist` | — | переход |
| `watch` | «Назад» | `home` | — | возврат по IA |
| `watch` | «Смотреть на телевизоре» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `watch` | «Смотреть на телевизоре» | `watch` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `watch` | entitlement | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `watch` | «Момент», «18:42» | `moment` | — | переход |
| `watch` | entitlement | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `moment` | «Назад» | `watch` | — | возврат по IA |
| `moment` | «Сохранить в Фото» | `moment` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `background` | — | — | — | дальше переходов нет |
| `cast` | «Закрыть» | `watch` | — | возврат по IA |
| `deeplink` | «Открыть в «Сцене»» | `watch` | — | переход |
| `clips` | «Сохранить момент» | `moment` | — | переход |
| `clips` | «Свет остаётся — финал» | `watch` | — | переход |
| `create` | «Закрыть» | `home` | — | возврат по IA |
| `create` | «Снять клип» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `create` | «Снять клип» | `create` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `create` | «Выбрать видео» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Выбрать видео» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `camera` | «Закрыть» | `create` | — | возврат по IA |
| `camera` | «Начать запись» | `publish` | — | переход |
| `camera` | «Открыть медиатеку» | `upload` | — | переход |
| `upload` | «Далее» | `publish` | — | переход |
| `publish` | «Назад» | `create` | — | возврат по IA |
| `publish` | «Опубликовать клип» | `clips` | — | подтверждение |
| `subscriptions` | «Напоминания о премьерах» | `subscriptions` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `subscriptions` | «LIVE» | `artist` | — | переход |
| `subscriptions` | «СЕГОДНЯ · 21:00» | `watch` | — | переход |
| `artist` | «Назад» | `subscriptions` | — | возврат по IA |
| `artist` | «LIVE», «1:24:08» | `watch` | — | переход |
| `profile` | «Электрический сад» | `watch` | — | переход |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Каталог выступлений | Статический редакционный пакет и CDN только на чтение |
| Публикация моментов | Локальный черновик и системный share sheet |
| Подписки и премьеры | Core Data и APNs topics провайдера |
| Ссылки | Статические страницы scene.video и AASA |
<!-- @end -->
