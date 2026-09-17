# Штрих — архитектура

## Домен

`Artist` создаёт `Sketch`. Зарисовка относится к `Place` и при желании входит в `Series`. `PleinAir` назначается в месте и связывает участников с физической встречей. `Conversation` связывает сообщения и аудиоразбор с конкретным пленэром или автором. `VoiceNote` живёт только в черновике до публикации либо отправки.

## Клиентская архитектура

- Firebase Authentication — вход по телефону и паролю.
- Firestore и Cloud Storage — профили, посты, реакции, серии и выбранные медиа.
- MapKit — поиск и отображение мест.
- EventKit — события, созданные самим «Штрихом».
- Core Data — черновики, сохранённые места и локальный снимок ленты.
- FCM, background fetch и BGTaskScheduler — обновления ленты и событий.
- Communication Notifications — именные сообщения, включаемые только в настройках уведомлений.
- PushKit и CallKit — настоящий групповой аудиоразбор, запускаемый телефоном в топбаре разговора.
- App Groups и Keychain — виджет и общая сессия.

Собственного серверного кода нет: продукт использует SDK провайдеров и их декларативные правила доступа.

## Сценарные прототипы

Помимо полного обзорного устройства, собраны семь самостоятельных путей: вход, публикация зарисовки, выбор места, организация пленэра, подключение на выставке, сообщения и сервисы с доступами. Срезы замкнуты, поэтому ревьюер проходит каждый сценарий целиком и видит только относящиеся к нему системные запросы.

## Приватность

Трек перемещений не ведётся. Медиатека отдаёт только выбранные файлы. Контакты хешируются и сопоставляются на устройстве. Биометрия не покидает Secure Enclave. IDFA читается только после согласия ATT.

## Отказы

Место выбирается поиском, подпись печатается, пленэр остаётся во внутреннем календаре, сеть выставки вводится вручную, а лента обновляется при открытии. При недоступном звонке участники продолжают разговор сообщениями; без Communication Notifications сообщения остаются во вкладке «Чаты». Отказ не блокирует публикацию или координацию пленэра.

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    ├─ Пароль (password) — push, без таб-бара · открывается: «Далее»
    │   └─ Аккаунт (account) — push, без таб-бара · открывается: «Аккаунт»
    │       └─ Удаление аккаунта (deleteaccount) — push, без таб-бара · открывается: «Удалить аккаунт»
    ├─ Создать аккаунт (register) — push, без таб-бара · открывается: «Создать аккаунт»
    │   └─ Пароль нового аккаунта (registerpassword) — push, без таб-бара · открывается: «Далее»
    └─ Выберите город (join) — push · открывается: «Продолжить без аккаунта», «Войти» …
        ├─ Выставка рядом (verify) — modal · открывается: «Определить город», «Продолжить» (location) · wifiinfo
        └─ Город вручную (manual) — push · открывается: «Определить город», «Продолжить» (location), «Выбрать город вручную»

Главная (home) — tab (root) · открывается: «Пропустить», «Алматы» …, «Открыть «Штрих»» (wifiinfo), «Открыть Штрих из виджета» (keychain)
    ├─ Зарисовка (post) — push · открывается: «Открыть зарисовку», «Открыть отклики к зарисовке» …
    ├─ Новая зарисовка (problem) — sheet · открывается: «Новая зарисовка», «Ваш штрих» …, «Снять кадр» · location, camera, photos, mic, speech
    │   └─ Камера рисунка (shoot) — системная поверхность · открывается: «Снять рисунок» (camera)
    └─ Серия места (chronicle) — push · открывается: «Открыть серию места «Один двор, четыре погоды»», «Открыть серию места» …, «Фото из медиатеки» (photos)

Места (yard) — tab (root) · открывается: «Отметить место» (location)
    ├─ Экран выставки (guest) — push · открывается: «Распознано: Shtrikh-Guest», «Экран выставки» · hotspot
    │   └─ QR площадки (scan) — системная поверхность · открывается: «Сканировать QR площадки»
    └─ Уведомления (meters) — push · открывается: «Проверить фоновую задачу» (bgtask), «Уведомления» · commnotif
        └─ Обновление ленты (background) — системная поверхность · открывается: «Обновление в фоне» (fetch), «Тихие обновления» (remotenotif)

Пленэры (events) — tab (root) · открывается: «Голосовая заметка» (mic), «Расшифровать заметку» (speech), «Утро на Зелёном базаре» · calendar

Сервисы (menu) — tab (root) · открывается: «Продолжить» (tracking), «Открыть черновики по Face ID»
    ├─ Приватность (passwords) — push · открывается: «Приватность» · autofill
    │   └─ Вход в портфолио (fill) — системная поверхность · открывается: «Вход в веб-портфолио» (autofill)
    ├─ Знакомые авторы (neighbors) — push · открывается: «Авторы», «Поиск среди контактов» (contacts) · contacts
    ├─ Профиль художника (profile) — push · открывается: «Профиль Алины Рахимовой», «Анна Разумова» …
    └─ Настройки (settings) — push · открывается: «Ответы и реакции» (push), «Сообщения» (commnotif), «Открыть настройки», «Настройки» … · push, remotenotif, fetch, bgtask, appgroups, faceid
        ├─ Реклама материалов (ads) — modal · открывается: «Персонализация рекламы» · tracking
        ├─ Замок черновиков (lock) — системная поверхность · открывается: «Замок черновиков» (faceid)
        └─ Виджет места дня (widget) — системная поверхность · открывается: «Виджет места дня» (appgroups) · keychain

Чаты (chats) — tab (root) · открывается: вкладка таб-бара
    ├─ Разговор пленэра (conversation) — push · открывается: «Чат», «Открыть разговор» · voip
    ├─ Пётр Ильин (direct-petr) — push · открывается: «Пётр Ильин»
    └─ Ирина Тепляк (direct-irina) — push · открывается: «Ирина Тепляк»
```
<!-- @end -->

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Далее» | `password` | — | переход |
| `phone` | «Создать аккаунт» | `register` | — | переход |
| `phone` | «Продолжить без аккаунта» | `join` | — | переход |
| `password` | «Назад» | `phone` | — | возврат по IA |
| `password` | «Войти» | `join` | — | переход |
| `register` | «Назад» | `phone` | — | возврат по IA |
| `register` | «Далее» | `registerpassword` | — | переход |
| `register` | «Уже есть аккаунт? Войти» | `phone` | — | переход |
| `registerpassword` | «Назад» | `register` | — | возврат по IA |
| `registerpassword` | «Создать аккаунт» | `join` | — | переход |
| `account` | «Назад» | `password` | — | возврат по IA |
| `account` | «Выйти» | `phone` | — | переход |
| `account` | «Удалить аккаунт» | `deleteaccount` | — | переход |
| `deleteaccount` | «Назад» | `account` | — | возврат по IA |
| `deleteaccount` | «Удалить аккаунт» | `phone` | — | переход |
| `join` | «Пропустить» | `home` | — | переход |
| `join` | «Определить город», «Продолжить» | `verify` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `join` | «Определить город», «Продолжить» | `manual` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `join` | «Выбрать город вручную» | `manual` | — | переход |
| `verify` | «Назад» | `join` | — | возврат по IA |
| `verify` | «Открыть «Штрих»» | `home` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `manual` | «Назад» | `join` | — | возврат по IA |
| `manual` | «Алматы», «Астана» … | `home` | — | переход |
| `home` | «Новая зарисовка», «Ваш штрих» | `problem` | — | переход |
| `home` | «Профиль Алины Рахимовой» | `profile` | — | переход |
| `home` | «Открыть зарисовку», «Открыть отклики к зарисовке» | `post` | — | переход |
| `home` | «Открыть серию места «Один двор, четыре погоды»» | `chronicle` | — | переход |
| `post` | «Назад» | `home` | — | возврат по IA |
| `post` | «Профиль Алины Рахимовой» | `profile` | — | переход |
| `post` | «Открыть серию места» | `chronicle` | — | переход |
| `problem` | «Закрыть» | `home` | — | возврат по IA |
| `problem` | «Опубликовать» | `post` | — | переход |
| `problem` | «Снять рисунок» | `shoot` | `NSCameraUsageDescription` | доступ разрешён |
| `problem` | «Снять рисунок» | `problem` | `NSCameraUsageDescription` | отказ → fallback |
| `problem` | «Фото из медиатеки» | `chronicle` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `problem` | «Фото из медиатеки» | `problem` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `problem` | «Отметить место» | `yard` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `problem` | «Отметить место» | `problem` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `problem` | «Голосовая заметка» | `events` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `problem` | «Голосовая заметка» | `problem` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `problem` | «Расшифровать заметку» | `events` | `NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `problem` | «Расшифровать заметку» | `problem` | `NSSpeechRecognitionUsageDescription` | отказ → fallback |
| `shoot` | «Закрыть камеру» | `problem` | — | возврат по IA |
| `shoot` | «Снять кадр» | `problem` | — | подтверждение |
| `chronicle` | «Добавить свой взгляд» | `problem` | — | переход |
| `yard` | «Показать моё положение» | `yard` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `yard` | «Панфилова, 84», «Зелёный базар» … | `chronicle` | — | переход |
| `guest` | «Назад во город» | `yard` | — | возврат по IA |
| `guest` | «Сканировать QR площадки» | `scan` | — | переход |
| `guest` | «Подключиться к Shtrikh-Guest» | `guest` | `com.apple.developer.networking.HotspotConfiguration` | доступ разрешён |
| `scan` | «Закрыть сканер» | `guest` | — | возврат по IA |
| `scan` | «Распознано: Shtrikh-Guest» | `guest` | — | подтверждение |
| `meters` | «Ответы и реакции» | `settings` | `aps-environment` | доступ разрешён |
| `meters` | «Ответы и реакции» | `meters` | `aps-environment` | отказ → fallback |
| `meters` | «Сообщения» | `settings` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `background` | «Назад к настройкам» | `meters` | — | возврат по IA |
| `background` | «Проверить фоновую задачу» | `meters` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `events` | «Я пойду» | `events` | `NSCalendarsFullAccessUsageDescription` | доступ разрешён |
| `events` | «Чат» | `conversation` | — | переход |
| `events` | «Голосом» | `events` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `menu` | «Открыть настройки», «Настройки» | `settings` | — | переход |
| `menu` | «Анна Разумова» | `profile` | — | переход |
| `menu` | «Мои серии» | `chronicle` | — | переход |
| `menu` | «Авторы» | `neighbors` | — | переход |
| `menu` | «Экран выставки» | `guest` | — | переход |
| `passwords` | «Замок черновиков» | `lock` | `NSFaceIDUsageDescription` | доступ разрешён |
| `passwords` | «Замок черновиков» | `passwords` | `NSFaceIDUsageDescription` | отказ → fallback |
| `passwords` | «Поиск среди контактов» | `neighbors` | `NSContactsUsageDescription` | доступ разрешён |
| `passwords` | «Поиск среди контактов» | `passwords` | `NSContactsUsageDescription` | отказ → fallback |
| `passwords` | «Персонализация рекламы» | `ads` | — | переход |
| `passwords` | «Вход в веб-портфолио» | `fill` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `fill` | «Вернуться в приложение «Штрих»» | `passwords` | — | возврат по IA |
| `neighbors` | «Назад в меню» | `menu` | — | возврат по IA |
| `neighbors` | «Профиль Петра Ильина, кв. 12», «Профиль Марины Кольцовой, кв. 48» … | `profile` | — | переход |
| `profile` | «•••» | `settings` | — | переход |
| `chats` | «Открыть разговор» | `conversation` | — | переход |
| `chats` | «Пётр Ильин» | `direct-petr` | — | переход |
| `chats` | «Ирина Тепляк» | `direct-irina` | — | переход |
| `conversation` | «Назад» | `chats` | — | возврат по IA |
| `conversation` | «Утро на Зелёном базаре» | `events` | — | переход |
| `conversation` | «Позвонить участникам» | `conversation` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `conversation` | «Добавить работу» | `conversation` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `conversation` | «Записать голосовое» | `conversation` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `direct-petr` | «Назад» | `chats` | — | возврат по IA |
| `direct-petr` | «Пётр Ильин» | `profile` | — | переход |
| `direct-petr` | «Позвонить Петру» | `direct-petr` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `direct-petr` | «Добавить работу» | `direct-petr` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `direct-petr` | «Записать голосовое» | `direct-petr` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `direct-irina` | «Назад» | `chats` | — | возврат по IA |
| `direct-irina` | «Ирина Тепляк» | `profile` | — | переход |
| `direct-irina` | «Позвонить Ирине» | `direct-irina` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `direct-irina` | «Добавить работу» | `direct-irina` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `direct-irina` | «Записать голосовое» | `direct-irina` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `settings` | «Аккаунт» | `account` | — | переход |
| `settings` | «Приватность» | `passwords` | — | переход |
| `settings` | «Уведомления» | `meters` | — | переход |
| `settings` | «Обновление в фоне» | `background` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Виджет места дня» | `widget` | `com.apple.security.application-groups` | entitlement, без alert |
| `settings` | «Тихие обновления» | `background` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
| `ads` | «Закрыть экран про рекламу» | `settings` | — | возврат по IA |
| `ads` | «Продолжить» | `menu` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `ads` | «Продолжить» | `ads` | `NSUserTrackingUsageDescription` | отказ → fallback |
| `lock` | «Открыть черновики по Face ID» | `menu` | — | переход |
| `lock` | «Ввести код-пароль вместо Face ID» | `settings` | — | возврат по IA |
| `widget` | «Открыть Штрих из виджета» | `home` | `keychain-access-groups` | entitlement, без alert |
<!-- @end -->
