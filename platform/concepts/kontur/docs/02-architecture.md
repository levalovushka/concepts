# Контур — архитектура

Клиент iOS использует BaaS SDK для входа, социального графа и синхронизации. Собственного серверного обработчика нет. Core Data хранит партии и очередь офлайн; FileManager — локальные миниатюры; Keychain — сессию.

## Информационная архитектура

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    ├─ Пароль (password) — push, без таб-бара · открывается: «Далее»
    │   └─ Аккаунт (account) — push, без таб-бара · открывается: «Настройки входа»
    │       └─ Удаление аккаунта (deleteaccount) — push, без таб-бара · открывается: «Удалить аккаунт»
    └─ Создать аккаунт (register) — push, без таб-бара · открывается: «Создать аккаунт»
        └─ Пароль нового аккаунта (registerpassword) — push, без таб-бара · открывается: «Далее»

Лента (feed) — tab (root) · открывается: «Продолжить без аккаунта», «Войти» … · fetch
    ├─ Контакт-лист (post) — push · открывается: «Дана Садыкова», «Тимур Ким» …
    │   ├─ Профиль фотографа (photographer) — push · открывается: «Алия», «Марат» …
    │   └─ Передача материалов (handoff) — push · открывается: «Передать автору материал», «Серия «После дождя»» …
    └─ Новый контакт-лист (compose) — modal · открывается: «Создать контакт-лист», «Сохранить скан» … · camera, photos
        ├─ Скан контакт-листа (camera) — fullscreen · открывается: «Сканировать лист» (camera)
        └─ Выбор сканов (picker) — system · открывается: «Выбрать из Фото» (photos)

Фотопрогулки (walks) — tab (root) · открывается: «Сегодня», «Геопозиция и Календарь» · location
    └─ Детали прогулки (walk) — push · открывается: «Открыть ближайшую прогулку», «Открыть сбор» …, «Добавить в календарь» (calendar)
        ├─ Маршрут (route) — push · открывается: «Найти рядом» (location), «Маршрут»
        └─ Календарь прогулки (calendar) — push · открывается: «Время» · calendar

Лаборатория (lab) — tab (root) · открывается: «В лабе», «Lab-Red»
    ├─ Партия проявки (batch) — push · открывается: «Проявка», «в процессе · 06:42» …
    │   ├─ Таймер проявки (timer) — fullscreen · открывается: «Запустить таймер»
    │   ├─ Скан контакт-листа (scan) — fullscreen · открывается: «Portra 400 · K-185», «Сканировать лист»
    │   └─ Голосовая заметка (voice) — push · открывается: «Голосовая заметка», «Микрофон и распознавание» · mic, speech
    ├─ Материалы (materials) — push · открывается: «Ilford MG RC · 18 листов», «Материалы»
    └─ Сеть лаборатории (labnet) — push · открывается: «Сеть лаборатории», «Wi-Fi и подключение» · wifiinfo, hotspot

Профиль (profile) — tab (root) · открывается: «Персонализировать предложения» (tracking), «Оставить неперсональными»
    ├─ Знакомые фотографы (contacts) — push · открывается: «Знакомые фотографы», «Контакты» · contacts
    ├─ Уведомления (notifications) — push · открывается: «Уведомления», «Уведомления и тихие статусы» · push, remotenotif, commnotif
    ├─ Фоновая работа (background) — push · открывается: «Фоновая работа», «Фоновая обработка» · bgtask
    ├─ Виджет (widget) — system · открывается: «Виджет», «Общий контейнер виджета» · appgroups, keychain
    ├─ Защита и вход (security) — push · открывается: «Защита и вход», «Защита сессии и Face ID» · autofill, faceid
    ├─ Предложения мастерских (ads) — push · открывается: «Предложения мастерских», «Персонализация предложений» · tracking
    └─ Доступы (permissions) — push · открывается: «Открыть доступы»
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Далее» | `password` | — | переход |
| `phone` | «Создать аккаунт» | `register` | — | переход |
| `phone` | «Продолжить без аккаунта» | `feed` | — | переход |
| `password` | «Назад» | `phone` | — | возврат по IA |
| `password` | «Войти» | `feed` | — | переход |
| `register` | «Назад» | `phone` | — | возврат по IA |
| `register` | «Далее» | `registerpassword` | — | переход |
| `register` | «Уже есть аккаунт? Войти» | `phone` | — | переход |
| `registerpassword` | «Назад» | `register` | — | возврат по IA |
| `registerpassword` | «Создать аккаунт» | `feed` | — | переход |
| `account` | «Назад» | `password` | — | возврат по IA |
| `account` | «Выйти» | `phone` | — | переход |
| `account` | «Удалить аккаунт» | `deleteaccount` | — | переход |
| `deleteaccount` | «Назад» | `account` | — | возврат по IA |
| `deleteaccount` | «Удалить аккаунт» | `phone` | — | переход |
| `feed` | «Создать контакт-лист» | `compose` | — | переход |
| `feed` | «Алия», «Марат» | `photographer` | — | переход |
| `feed` | «Сегодня» | `walks` | — | переход |
| `feed` | «В лабе» | `lab` | — | переход |
| `feed` | «Дана Садыкова», «Тимур Ким» | `post` | — | переход |
| `feed` | «Обновлять ленту в фоне» | `feed` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `post` | «Назад» | `feed` | — | возврат по IA |
| `post` | «Дана Садыкова», «Открыть практику Даны» | `photographer` | — | переход |
| `post` | «Передать автору материал» | `handoff` | — | переход |
| `photographer` | «Назад» | `post` | — | возврат по IA |
| `photographer` | «Открыть ближайшую прогулку» | `walk` | — | переход |
| `photographer` | «Olympus XA» | `post` | — | переход |
| `photographer` | «Серия «После дождя»» | `handoff` | — | переход |
| `compose` | «Назад» | `feed` | — | возврат по IA |
| `compose` | «Сканировать лист» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `compose` | «Сканировать лист» | `compose` | `NSCameraUsageDescription` | отказ → fallback |
| `compose` | «Выбрать из Фото» | `picker` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `compose` | «Выбрать из Фото» | `compose` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `compose` | «Проявка» | `batch` | — | переход |
| `camera` | «Закрыть камеру» | `compose` | — | возврат по IA |
| `camera` | «Сохранить скан» | `compose` | — | переход |
| `picker` | «Готово» | `compose` | — | переход |
| `walks` | «Найти рядом» | `route` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `walks` | «Найти рядом» | `walks` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `walks` | «Открыть сбор», «Ранний рынок» … | `walk` | — | переход |
| `walk` | «Назад» | `walks` | — | возврат по IA |
| `walk` | «Маршрут» | `route` | — | переход |
| `walk` | «Время» | `calendar` | — | переход |
| `walk` | «После прогулки» | `post` | — | переход |
| `route` | «Назад» | `walk` | — | возврат по IA |
| `route` | «Арбат», «Открыть сбор» | `walk` | — | переход |
| `route` | «Lab-Red» | `lab` | — | переход |
| `calendar` | «Назад» | `walk` | — | возврат по IA |
| `calendar` | «Добавить в календарь» | `walk` | `NSCalendarsFullAccessUsageDescription` | доступ разрешён |
| `calendar` | «Добавить в календарь» | `calendar` | `NSCalendarsFullAccessUsageDescription` | отказ → fallback |
| `handoff` | «Назад» | `post` | — | возврат по IA |
| `lab` | «Сеть лаборатории» | `labnet` | — | переход |
| `lab` | «в процессе · 06:42», «Fomapan 200 · K-186» | `batch` | — | переход |
| `lab` | «Portra 400 · K-185» | `scan` | — | переход |
| `lab` | «Ilford MG RC · 18 листов», «Материалы» | `materials` | — | переход |
| `batch` | «Назад» | `lab` | — | возврат по IA |
| `batch` | «Запустить таймер» | `timer` | — | переход |
| `batch` | «Голосовая заметка» | `voice` | — | переход |
| `batch` | «Сканировать лист» | `scan` | — | переход |
| `timer` | «Закрыть таймер» | `batch` | — | возврат по IA |
| `scan` | «Закрыть сканер» | `batch` | — | возврат по IA |
| `scan` | «Сканировать лист» | `batch` | — | переход |
| `materials` | «Назад» | `lab` | — | возврат по IA |
| `materials` | «Ilford MG RC 13×18» | `handoff` | — | переход |
| `voice` | «Назад» | `batch` | — | возврат по IA |
| `voice` | «Записать голосом» | `voice` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `voice` | «Распознать запись» | `voice` | `NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `labnet` | «Назад» | `lab` | — | возврат по IA |
| `labnet` | «Проверить сеть» | `labnet` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `labnet` | «Подключиться к Lab-Red» | `labnet` | `com.apple.developer.networking.HotspotConfiguration` | доступ разрешён |
| `profile` | «Настройки входа» | `account` | — | переход |
| `profile` | «Открыть доступы» | `permissions` | — | переход |
| `profile` | «Знакомые фотографы» | `contacts` | — | переход |
| `profile` | «Уведомления» | `notifications` | — | переход |
| `profile` | «Предложения мастерских» | `ads` | — | переход |
| `profile` | «Фоновая работа» | `background` | — | переход |
| `profile` | «Виджет» | `widget` | — | переход |
| `profile` | «Защита и вход» | `security` | — | переход |
| `contacts` | «Назад» | `profile` | — | возврат по IA |
| `contacts` | «Найти в контактах» | `contacts` | `NSContactsUsageDescription` | доступ разрешён |
| `contacts` | «Ренат Мусин», «Лиза Вэй» … | `photographer` | — | переход |
| `notifications` | «Назад» | `profile` | — | возврат по IA |
| `notifications` | «Разрешить уведомления» | `notifications` | `aps-environment` | доступ разрешён |
| `notifications` | «Обновлять статусы заранее» | `notifications` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
| `notifications` | «Показывать участника передачи» | `notifications` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `background` | «Назад» | `profile` | — | возврат по IA |
| `background` | «Обрабатывать на зарядке» | `background` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `widget` | «Назад» | `profile` | — | возврат по IA |
| `widget` | «Добавить виджет» | `widget` | `com.apple.security.application-groups` | entitlement, без alert |
| `widget` | «Открыть виджет без повторного входа» | `widget` | `keychain-access-groups` | entitlement, без alert |
| `security` | «Назад» | `profile` | — | возврат по IA |
| `security` | «Включить Face ID» | `security` | `NSFaceIDUsageDescription` | доступ разрешён |
| `security` | «Вход на сайте» | `security` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `ads` | «Назад» | `profile` | — | возврат по IA |
| `ads` | «Персонализировать предложения» | `profile` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Персонализировать предложения» | `ads` | `NSUserTrackingUsageDescription` | отказ → fallback |
| `ads` | «Оставить неперсональными» | `profile` | — | переход |
| `permissions` | «Назад» | `profile` | — | возврат по IA |
| `permissions` | «Открыть создание», «Камера и Фото» | `compose` | — | переход |
| `permissions` | «Геопозиция и Календарь» | `walks` | — | переход |
| `permissions` | «Микрофон и распознавание» | `voice` | — | переход |
| `permissions` | «Wi-Fi и подключение» | `labnet` | — | переход |
| `permissions` | «Уведомления и тихие статусы» | `notifications` | — | переход |
| `permissions` | «Фоновая обработка» | `background` | — | переход |
| `permissions` | «Защита сессии и Face ID» | `security` | — | переход |
| `permissions` | «Персонализация предложений» | `ads` | — | переход |
| `permissions` | «Контакты» | `contacts` | — | переход |
| `permissions` | «Общий контейнер виджета» | `widget` | — | переход |
<!-- @end -->

## Доступы

PermissionsService — единственная точка JIT-запросов. Один ключ имеет один триггер. При отказе пользователь остаётся в том же процессе с видимым fallback.

## Не заявлено

Associated Domains исключён: диплинков в концепте нет. VoIP и Audio background исключены: ядровая функция не требует звонков или фонового аудио.
