# Архитектура «Стола»

## Слои

- UI: пять корневых вкладок, социальная лента, карточки партий, контекстные разговоры, профиль, композер и сервисные секционные списки.
- Domain: Player, Game, Session, Seat, Post, Conversation, Message, GroupCall.
- Services: Phone Auth, Firestore/Storage, Core Location, EventKit, Speech, AVAudioSession, APNs, Communication Notifications, PushKit/CallKit, Bonjour/Cast, Keychain.
- Local data: черновики, скачанные памятки и офлайн-счёт.

## Потоки

- Лента → композер → камера/фото/место → публикация.
- Столы → партия → место → календарь/оповещение.
- Партия → счёт → голосовой ввод → общий экран.
- Игры → памятка → фоновое аудио.
- Стол → чат → сообщение или групповой звонок; именные уведомления настраиваются только в общих настройках.

## Сценарные прототипы

Помимо полного обзорного устройства, вкладка «Прототипы» содержит семь независимых кликабельных путей: вход, публикацию партии, занятие места, ведение счёта, вывод табло, сообщения и настройки доступов. У каждого пути собственный старт, ограниченный набор экранов и отдельный журнал запрошенных разрешений.

## Auth

Исходный первый экран несёт уникальную композицию зарезервированного места за деревянным столом. Сборщик сохраняет классы этой поверхности на состояниях телефона, пароля, регистрации, нового пароля, аккаунта и удаления. Функциональный контракт остаётся общим: номер, пароль, регистрация, гостевой проход, помощь, legal и удаление аккаунта.

## Отказоустойчивость

Каждый доступ имеет ручной путь: текст без медиа, место строкой, дата из карточки, кнопки ± для счёта, табло на телефоне, текстовые правила и отдельный вход в расширении. При недоступном звонке договорённость продолжается сообщениями; без Communication Notifications новые сообщения остаются во вкладке «Чаты».

<!-- @generated:ia-tree -->
```
Вход по номеру (phone) — старт, без таб-бара · открывается: старт
    ├─ Пароль (password) — push, без таб-бара · открывается: «Далее»
    │   └─ Аккаунт (account) — push, без таб-бара · открывается: «Саша Руденко»
    │       └─ Удаление аккаунта (deleteaccount) — push, без таб-бара · открывается: «Удалить аккаунт»
    └─ Создать аккаунт (register) — push, без таб-бара · открывается: «Создать аккаунт»
        └─ Пароль нового аккаунта (registerpassword) — push, без таб-бара · открывается: «Далее»

Лента (feed) — tab (root) · открывается: «Продолжить без аккаунта», «Войти» …
    ├─ Новая запись (compose) — push · открывается: «Создать запись», «Создать» … · camera, photos, location
    └─ Публикация (post) — push · открывается: «Открыть публикацию Маши», «Открыть партию Лесные союзы» …

Игры (games) — tab (root) · открывается: вкладка таб-бара
    └─ Памятка (audio) — push · открывается: «Открыть игру Лесные союзы» · audio

Столы (tables) — tab (root) · открывается: вкладка таб-бара
    └─ Стол (table) — push · открывается: «Сегодня», «Суббота» … · calendar, push
        └─ Счёт (score) — push · открывается: «Открыть счёт» · speech, mic
            └─ Общий экран (cast) — push · открывается: «Показать на общем экране», «Показать на экране» · localnetwork, wifiinfo

Профиль (profile) — tab (root) · открывается: «Саша Руденко»
    └─ Настройки (settings) — push · открывается: «Открыть настройки» · keychain, commnotif

Чаты (chats) — tab (root) · открывается: вкладка таб-бара
    ├─ Разговор стола (conversation) — push · открывается: «Открыть чат стола», «Лесные союзы · сегодня» … · voip
    └─ Саша Руденко (direct-sasha) — push · открывается: «Саша Руденко»
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
| `feed` | «Создать запись», «Создать» | `compose` | — | переход |
| `feed` | «Сегодня», «Суббота» … | `table` | — | переход |
| `feed` | «Открыть публикацию Маши» | `post` | — | переход |
| `games` | «Открыть игру Лесные союзы» | `audio` | — | переход |
| `tables` | «Собрать стол» | `compose` | — | переход |
| `tables` | «Открыть стол Лесные союзы», «Открыть стол Городские линии» … | `table` | — | переход |
| `profile` | «Открыть настройки» | `settings` | — | переход |
| `profile` | «Открыть партию Лесные союзы», «Открыть партию Городские линии» … | `post` | — | переход |
| `compose` | «Назад» | `feed` | — | возврат по IA |
| `compose` | «Готово» | `post` | — | переход |
| `compose` | «Камера» | `compose` | `NSCameraUsageDescription` | доступ разрешён |
| `compose` | «Фото» | `compose` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `compose` | «Место» | `compose` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `post` | «Назад» | `feed` | — | возврат по IA |
| `post` | «Открыть связанный стол» | `table` | — | переход |
| `table` | «Назад» | `tables` | — | возврат по IA |
| `table` | «Открыть счёт» | `score` | — | переход |
| `table` | «Открыть чат стола» | `conversation` | — | переход |
| `table` | «Добавить в календарь» | `table` | `NSCalendarsFullAccessUsageDescription` | доступ разрешён |
| `table` | «Следить за столом» | `table` | `aps-environment` | доступ разрешён |
| `score` | «Назад» | `table` | — | возврат по IA |
| `score` | «Показать на общем экране», «Показать на экране» | `cast` | — | переход |
| `score` | «Назвать счёт» | `score` | `NSSpeechRecognitionUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `audio` | «Назад» | `games` | — | возврат по IA |
| `audio` | «Слушать памятку» | `audio` | `UIBackgroundModes: audio` | entitlement, без alert |
| `cast` | «Назад» | `score` | — | возврат по IA |
| `cast` | «Проверить сеть» | `cast` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `cast` | «Экран у большого стола», «Проектор клуба» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices: _googlecast._tcp)` | доступ разрешён |
| `chats` | «Лесные союзы · сегодня», «Маршруты Севера» | `conversation` | — | переход |
| `chats` | «Саша Руденко» | `direct-sasha` | — | переход |
| `conversation` | «Назад» | `chats` | — | возврат по IA |
| `conversation` | «Лесные союзы», «19:30» | `table` | — | переход |
| `conversation` | «Позвонить игрокам» | `conversation` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `conversation` | «Добавить фото» | `conversation` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `conversation` | «Записать голосовое» | `conversation` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `direct-sasha` | «Назад» | `chats` | — | возврат по IA |
| `direct-sasha` | «Саша Руденко» | `profile` | — | переход |
| `direct-sasha` | «Позвонить Саше» | `direct-sasha` | `NSMicrophoneUsageDescription + UIBackgroundModes: voip` | доступ разрешён |
| `direct-sasha` | «Добавить фото» | `direct-sasha` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `direct-sasha` | «Записать голосовое» | `direct-sasha` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Саша Руденко» | `account` | — | переход |
| `settings` | «Оповещения» | `settings` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `settings` | «Общая сессия» | `settings` | `keychain-access-groups` | entitlement, без alert |
<!-- @end -->
