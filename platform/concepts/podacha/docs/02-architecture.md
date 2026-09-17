# Архитектура

Основные сущности: автор, публикация, рецепт, проверка, совместная готовка, разговор и сообщение. Публикация принадлежит автору и может ссылаться на рецепт; проверка принадлежит рецепту; готовка использует зафиксированную версию шагов; разговор кухни всегда связан с готовкой и её текущим шагом.

Медиа хранится в управляемом Storage, данные — в Firestore с security rules, вход — через SDK провайдера и Keychain. Сообщения доставляются обычным push, именные Communication Notifications включаются в общих настройках, а телефон в топбаре кухни запускает настоящий групповой вызов через PushKit и CallKit. При отказе в микрофоне или VoIP вопрос остаётся доступен текстом.

## Сценарные прототипы

Полный обзор дополняют девять независимых путей: вход, публикация блюда, поиск, совместная готовка, сохранение рецепта, кухонный экран, сообщения, социальные связи и настройки доступов. Каждый прототип начинается в точке реального намерения пользователя, содержит только нужные экраны и ведёт собственный журнал разрешений.

## Отказы и приватность

Камера заменяется выбором готового фото, место — ручным вводом, распознавание шага — экранными контролами, кухонный экран — телефоном, а голосовые и звонок — обычным сообщением. Контакты сопоставляются только после явного действия; рекламный трекинг, фоновые режимы и именные уведомления включаются в настройках, а не запрашиваются при старте.

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    ├─ Пароль (password) — push, без таб-бара · открывается: «Далее»
    │   └─ Аккаунт (account) — push, без таб-бара · открывается: «Жанна Ким»
    │       └─ Удаление аккаунта (deleteaccount) — push, без таб-бара · открывается: «Удалить аккаунт»
    └─ Создать аккаунт (register) — push, без таб-бара · открывается: «Создать аккаунт»
        └─ Пароль нового аккаунта (registerpassword) — push, без таб-бара · открывается: «Далее»

Лента (feed) — tab (root) · открывается: «Продолжить без аккаунта», «Войти» … · tracking
    ├─ Публикация (post) — push · открывается: «Жанна», «Тимур» …, «Снять» (camera + mic) · photosadd
    ├─ Поиск (discover) — push · открывается: «Поиск», «Поиск рецептов»
    ├─ Новая публикация (compose) — push · открывается: «Что получилось сегодня?», «Моё» …, «Добавить 2 фото» (photos), «Добавить место», «Указать вручную» · camera, photos, location
    │   ├─ Снять блюдо (camera) — fullscreen · открывается: «Снять блюдо», «Снять блюдо» (camera) · mic
    │   ├─ Медиатека (picker) — system · открывается: «Из медиатеки» (photos), «Фото и видео»
    │   └─ Место (place) — push · открывается: «Место» (location), «Геопозиция»
    └─ Уведомления (notif) — push · открывается: «Уведомления»

Готовим вместе (cookings) — tab (root) · открывается: «Готовим сегодня»
    └─ Совместная готовка (cookalong) — push · открывается: «Вместе», «34 готовили» … · calendar, push
        └─ Шаги готовки (steps) — push · открывается: «Открыть все шаги» · speech
            └─ Кухонный экран (kitchen) — push · открывается: «Шаг готов», «Общий экран» · localnetwork
                └─ Выбор экрана (cast) — system · открывается: «Найти экран на кухне» (localnetwork) · wifiinfo

Рецепты (recipes) — tab (root) · открывается: «Мои проверки»
    └─ Проверенный рецепт (recipe) — push · открывается: «Открыть проверенный рецепт», «Проверенный рецепт» …

Профиль автора (profile) — tab (root) · открывается: «Амина Рахимова», «Жанна Ким» …
    ├─ Подписки (following) — push · открывается: «Подписки», «Контакты» · contacts
    │   └─ Знакомые (matches) — push · открывается: «Найти знакомых» (contacts)
    │       └─ Приглашение (invite) — system · открывается: «Пригласить по ссылке»
    └─ Настройки (settings) — push · открывается: «Настройки», «Изменить» · remotenotif, fetch, processing, bgtask, keychain, commnotif
        ├─ Рецепт вслух (audio) — fullscreen · открывается: «Рецепт вслух» · audio
        └─ Конфиденциальность (privacy) — push · открывается: «Конфиденциальность»

Чаты (chats) — tab (root) · открывается: вкладка таб-бара
    ├─ Разговор кухни (conversation) — push · открывается: «Открыть кухню · 4 новых сообщения», «Ужин из одной сковороды» · voip
    ├─ Жанна Ким (direct-zhanna) — push · открывается: «Жанна Ким»
    └─ Тимур Садыков (direct-timur) — push · открывается: «Тимур Садыков»
```
<!-- @end -->

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
| `feed` | «Поиск» | `discover` | — | переход |
| `feed` | «Уведомления» | `notif` | — | переход |
| `feed` | «Что получилось сегодня?», «Моё» | `compose` | — | переход |
| `feed` | «Снять блюдо» | `camera` | — | переход |
| `feed` | «Жанна», «Тимур» | `post` | — | переход |
| `feed` | «Вместе», «34 готовили» … | `cookalong` | — | переход |
| `feed` | «Настроить рекомендации» | `feed` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `post` | «Назад» | `feed` | — | возврат по IA |
| `post` | «34 готовили» | `cookalong` | — | переход |
| `post` | «Открыть проверенный рецепт» | `recipe` | — | переход |
| `post` | «Сохранить карточку в Фото» | `post` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `discover` | «Назад» | `feed` | — | возврат по IA |
| `discover` | «Найти», «Ужин за 20 минут» | `post` | — | переход |
| `discover` | «Амина Рахимова» | `profile` | — | переход |
| `discover` | «Готовим сегодня» | `cookings` | — | переход |
| `compose` | «Назад» | `feed` | — | возврат по IA |
| `compose` | «Снять блюдо» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `compose` | «Снять блюдо» | `compose` | `NSCameraUsageDescription` | отказ → fallback |
| `compose` | «Из медиатеки» | `picker` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `compose` | «Из медиатеки» | `compose` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `compose` | «Место» | `place` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `compose` | «Проверенный рецепт» | `recipe` | — | переход |
| `compose` | «Опубликовать» | `post` | — | переход |
| `camera` | «Назад» | `compose` | — | возврат по IA |
| `camera` | «Снять» | `post` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `camera` | «Снять» | `camera` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `picker` | «Назад» | `compose` | — | возврат по IA |
| `picker` | «Добавить 2 фото» | `compose` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `place` | «Назад» | `compose` | — | возврат по IA |
| `place` | «Добавить место», «Указать вручную» | `compose` | — | подтверждение |
| `cookings` | «Уведомления» | `notif` | — | переход |
| `cookings` | «19:00», «20:30» … | `cookalong` | — | переход |
| `cookalong` | «Назад» | `cookings` | — | возврат по IA |
| `cookalong` | «Открыть все шаги» | `steps` | — | переход |
| `cookalong` | «Открыть кухню · 4 новых сообщения» | `conversation` | — | переход |
| `cookalong` | «Добавить в календарь» | `cookalong` | `NSCalendarsWriteOnlyAccessUsageDescription` | доступ разрешён |
| `cookalong` | «Напомнить за 15 минут» | `cookalong` | `aps-environment` | доступ разрешён |
| `steps` | «Назад» | `cookalong` | — | возврат по IA |
| `steps` | «Надиктовать заметку» | `steps` | `NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `steps` | «Шаг готов» | `kitchen` | — | переход |
| `recipes` | «Поиск рецептов» | `discover` | — | переход |
| `recipes` | «35 мин», «20 мин» … | `recipe` | — | переход |
| `recipe` | «Назад» | `recipes` | — | возврат по IA |
| `recipe` | «Готовить по шагам» | `cookalong` | — | переход |
| `audio` | «Назад» | `settings` | — | возврат по IA |
| `audio` | «Слушать с погашенным экраном» | `audio` | `UIBackgroundModes: audio` | entitlement, без alert |
| `kitchen` | «Назад» | `steps` | — | возврат по IA |
| `kitchen` | «Найти экран на кухне» | `cast` | `NSLocalNetworkUsageDescription` | доступ разрешён |
| `kitchen` | «Найти экран на кухне» | `kitchen` | `NSLocalNetworkUsageDescription` | отказ → fallback |
| `cast` | «Назад» | `kitchen` | — | возврат по IA |
| `cast` | «Кухня · Apple TV» | `cast` | `Access WiFi Information` | entitlement, без alert |
| `profile` | «Настройки», «Изменить» | `settings` | — | переход |
| `profile` | «Опубликовать» | `compose` | — | переход |
| `profile` | «Подписки» | `following` | — | переход |
| `profile` | «Мои проверки» | `recipes` | — | переход |
| `profile` | «18 готовили» | `cookalong` | — | переход |
| `following` | «Назад» | `profile` | — | возврат по IA |
| `following` | «Жанна Ким», «Тимур Садыков» … | `profile` | — | переход |
| `following` | «Найти знакомых» | `matches` | `NSContactsUsageDescription` | доступ разрешён |
| `following` | «Найти знакомых» | `following` | `NSContactsUsageDescription` | отказ → fallback |
| `matches` | «Назад» | `following` | — | возврат по IA |
| `matches` | «Пригласить по ссылке» | `invite` | — | переход |
| `notif` | «Назад» | `feed` | — | возврат по IA |
| `notif` | «Открыть событие» | `cookalong` | — | переход |
| `chats` | «Ужин из одной сковороды» | `conversation` | — | переход |
| `chats` | «Жанна Ким» | `direct-zhanna` | — | переход |
| `chats` | «Тимур Садыков» | `direct-timur` | — | переход |
| `conversation` | «Назад» | `chats` | — | возврат по IA |
| `conversation` | «Ужин из одной сковороды», «Шаг» | `cookalong` | — | переход |
| `conversation` | «Позвонить на кухню» | `conversation` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `conversation` | «Добавить фото блюда» | `conversation` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `conversation` | «Записать голосовое» | `conversation` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `direct-zhanna` | «Назад» | `chats` | — | возврат по IA |
| `direct-zhanna` | «Жанна Ким» | `profile` | — | переход |
| `direct-zhanna` | «Позвонить Жанне» | `direct-zhanna` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `direct-zhanna` | «Добавить фото блюда» | `direct-zhanna` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `direct-zhanna` | «Записать голосовое» | `direct-zhanna` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `direct-timur` | «Назад» | `chats` | — | возврат по IA |
| `direct-timur` | «Тимур Садыков» | `profile` | — | переход |
| `direct-timur` | «Позвонить Тимуру» | `direct-timur` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `direct-timur` | «Добавить фото блюда» | `direct-timur` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `direct-timur` | «Записать голосовое» | `direct-timur` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Жанна Ким» | `account` | — | переход |
| `settings` | «Конфиденциальность» | `privacy` | — | переход |
| `settings` | «Напоминания» | `settings` | `aps-environment` | доступ разрешён |
| `settings` | «Сообщения кухни» | `settings` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `settings` | «Свежая лента к открытию» | `settings` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Подготовка рецептов» | `settings` | `UIBackgroundModes: processing` | entitlement, без alert |
| `settings` | «Защищённый вход» | `settings` | `Keychain sharing` | entitlement, без alert |
| `settings` | «Ответы авторов» | `settings` | `Remote notifications` | entitlement, без alert |
| `settings` | «Рецепт вслух» | `audio` | — | переход |
| `settings` | «Общий экран» | `kitchen` | — | переход |
| `settings` | «Проверить фоновые задачи» | `settings` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `privacy` | «Назад» | `settings` | — | возврат по IA |
| `privacy` | «Фото и видео» | `picker` | — | переход |
| `privacy` | «Геопозиция» | `place` | — | переход |
| `privacy` | «Контакты» | `following` | — | переход |
| `privacy` | «Персонализация» | `privacy` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `invite` | «Назад» | `matches` | — | возврат по IA |
<!-- @end -->
