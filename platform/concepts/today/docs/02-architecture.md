# Сегодня — архитектура

Клиентское приложение без своего бэкенда: аккаунты, планы и сообщения живут на SDK провайдера. Набор доступов — ВКонтакте, заявлено 22 ключа. Правило, из которого выведена матрица ниже: **доступ заявляется только там, где за ним стоит фича, до которой пользователь доходит за 2–3 тапа.**

## Root navigation

Пять разделов стабильны на всех root-экранах: `Сегодня`, `Совпадения`, `Создать`, `Планы`, `Вы`. Переключение root-разделов не создаёт push-стек; дочерние экраны возвращаются к объявленному parent через `data-back`.

## Сценарии

1. `phone → code → home` — вход без публичного профиля.
2. `home → nearby → match → plan` — желание, совпадение, приватный план.
3. `create → camera | media → create → chats` — создание приглашения и необязательная обложка.
4. `chats → chat → voice → chat` — временная группа конкретного плана.
5. `profile → settings → system → profile` — выбранный круг и системные функции.

Статус на сегодня истекает ночью. MapKit/CoreLocation предлагают удобные места, но deny fallback оставляет ручной выбор района. APNs нужны только для совпадений и изменений плана. Виджет получает минимальный snapshot ближайшего приватного плана через `group.app.today`; публичного endpoint или внешнего профиля нет.

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход | старт | — |
| `code` | Код | push | — |
| `codefail` | Неверный код | push | — |
| `home` | Сегодня | tab (root) | location |
| `match` | Совпадение | push | — |
| `nearby` | Совпадения | tab (root) | — |
| `plan` | План | push | push, remotenotif (activate), wifiinfo (activate), calendar |
| `create` | Новый план | tab (root) | camera, photos, speech |
| `camera` | Камера | fullscreen | — |
| `media` | Фото | system picker | — |
| `groups` | Друзья | push | — |
| `chats` | Планы | tab (root) | — |
| `chat` | Группа плана | push | mic, commnotif (activate), voip (activate) |
| `voice` | Голосовое | modal | — |
| `profile` | Вы | tab (root) | appgroups (activate), contacts |
| `settings` | Настройки | push | fetch (activate), autofill (activate), faceid, shareext (activate) |
| `system` | Системные функции | task | bgtask (activate), keychain (activate) |
| `mates` | Контакты в «Сегодня» | push | — |
| `ads` | Реклама вместо подписки | modal | tracking |
| `lock` | Замок на планах | push | — |
| `sayplan` | План голосом | push | — |
| `onway` | По дороге | push | audio (activate) |
| `background` | Экран погас | fullscreen | — |
| `call` | Созвон по плану | fullscreen | — |
| `netqr` | Сеть места по QR | modal | hotspot |
| `shareext` | Поделиться в «Сегодня» | modal | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSCameraUsageDescription` | «Снять» | Новый план | Можно выбрать готовый снимок | Низкий |
| `NSPhotoLibraryUsageDescription` | «Из Фото» | Новый план | Можно снять новый кадр камерой | Низкий |
| `NSMicrophoneUsageDescription` | «Записать голосовое» | Группа плана | Остаются текст и фото | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Показать совпадения» | Сегодня | Район выбирается вручную | Низкий |
| `aps-environment` | «Следить» | План | Обновления помечаются точкой внутри приложения | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.developer.usernotifications.communication` | «Сообщения с аватаром» | Группа плана | Обычное уведомление без аватара | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: remote-notification` | «Обновлять состав» | План | Состав обновляется при открытии | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: fetch` | «Обновлять планы в фоне» | Настройки | Планы обновятся после открытия | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `BGTaskSchedulerPermittedIdentifiers` | «Проверить фоновые функции» | Системные функции | Без задачи обновление только вручную | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.security.application-groups` | «Добавить виджет» | Вы | Расписание остаётся внутри приложения | Низкий |
| `keychain-access-groups` | «Добавить виджет» | Системные функции | Виджет открывает приложение для входа | Низкий |
| `com.apple.developer.authentication-services.autofill-credential-provider` | «Автозаполнение на сайте» | Настройки | Вход по коду из SMS | Низкий |
| `com.apple.developer.networking.wifi-info` | «Я на месте» | План | Отметка по кнопке без автоматической проверки | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription` | «Добавить в Календарь» | План | Время остаётся в карточке плана и в напоминании приложения | Низкий |
| `NSContactsUsageDescription` | «Найти среди контактов» | Вы | Остаётся поиск по имени и ссылка-приглашение | Низкий |
| `NSFaceIDUsageDescription` | «Замок Face ID» | Настройки | Остаётся код-пароль устройства | Низкий |
| `NSSpeechRecognitionUsageDescription` | «Сказать план» — цепочкой с микрофоном | Новый план | Время и место выбираются списком, как раньше | Низкий |
| `NSUserTrackingUsageDescription` | «Продолжить» | Реклама вместо подписки | Подборки остаются, но перестают подбираться под вас | Средний |
| `NSExtensionPointIdentifier: com.apple.share-services` | «Поделиться» в другом приложении | Настройки | Место добавляется поиском внутри приложения | **Условный** — Отдельный target расширения; место кладётся в общий контейнер App Group |
| `com.apple.developer.networking.HotspotConfiguration` | «Подключиться» | Сеть места по QR | Сеть выбирается вручную в Настройках | Низкий |
| `UIBackgroundModes: voip` | «Позвонить» | Группа плана | Остаётся переписка в плане | **Условный** — PushKit + CallKit: входящий звонок поднимается системным экраном вызова, иначе ключ не заявляется |
| `UIBackgroundModes: audio` | «Слушать подряд» | По дороге | Без entitlement очередь обрывается на первом сообщении — не ship | **Условный** — Реальный playback очереди, заполненный MPNowPlayingInfoCenter и remote-команды |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Вход (phone) — старт · открывается: старт
    └─ Код (code) — push · открывается: «Получить код»
        ├─ Неверный код (codefail) — push · открывается: «2»
        └─ Сегодня (home) — tab (root) · открывается: «Продолжить» · location
            ├─ Совпадение (match) — push · открывается: «Миша · кино», «Аня · кино и поесть»
            ├─ Совпадения (nearby) — tab (root) · открывается: «Кино», «Прогулка» … (location)
            │   └─ План (plan) — push · открывается: «Открыть план», «Собрать план» …, «Собрать план», «Добавить в план» · push, remotenotif, wifiinfo, calendar
            │       ├─ По дороге (onway) — push · открывается: «Голосовые по дороге · 4» · audio
            │       │   └─ Экран погас (background) — fullscreen · открывается: «Слушать подряд» (audio)
            │       └─ Сеть места по QR (netqr) — modal · открывается: «Подключиться к сети места» · hotspot
            └─ Друзья (groups) — push · открывается: «Близкие друзья», «Кто видит мои планы» …

Новый план (create) — tab (root) · открывается: «Снять фото», «Выбрать» … · camera, photos, speech
    ├─ Камера (camera) — fullscreen · открывается: «Снять» (camera)
    ├─ Фото (media) — system picker · открывается: «Из Фото» (photos)
    └─ План голосом (sayplan) — push · открывается: «Сказать план» (mic + speech)

Планы (chats) — tab (root) · открывается: «Отправить приглашение», «Отправить в переписку»
    └─ Группа плана (chat) — push · открывается: «Написать Мише», «Кино сегодня» … · mic, commnotif, voip
        ├─ Голосовое (voice) — modal · открывается: «Записать голосовое» (mic)
        └─ Созвон по плану (call) — fullscreen · открывается: «Позвонить» (voip)

Вы (profile) — tab (root) · открывается: «Готово» (keychain), «Продолжить» (tracking) · appgroups, contacts
    ├─ Настройки (settings) — push · открывается: «Настройки» · fetch, autofill, faceid, shareext
    │   ├─ Системные функции (system) — task · открывается: «Обновлять состав» (remotenotif), «Виджет ближайшего плана» (appgroups), «Обновлять планы в фоне» (fetch) … · bgtask, keychain
    │   ├─ Реклама вместо подписки (ads) — modal · открывается: «Реклама и подписка» · tracking
    │   ├─ Замок на планах (lock) — push · открывается: «Замок Face ID» (faceid)
    │   └─ Поделиться в «Сегодня» (shareext) — modal · открывается: «Поделиться в «Сегодня»» (shareext)
    └─ Контакты в «Сегодня» (mates) — push · открывается: «Найти среди контактов» (contacts)
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Получить код» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «2» | `codefail` | — | переход |
| `code` | «Продолжить» | `home` | — | переход |
| `codefail` | «Назад» | `code` | — | возврат по IA |
| `home` | «Близкие друзья» | `groups` | — | переход |
| `home` | «Кино», «Прогулка» … | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Кино», «Прогулка» … | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «Открыть план» | `plan` | — | переход |
| `match` | «Назад» | `home` | — | возврат по IA |
| `match` | «Собрать план» | `plan` | — | переход |
| `match` | «Написать Мише» | `chat` | — | переход |
| `nearby` | «Близкие друзья» | `groups` | — | переход |
| `nearby` | «Миша · кино», «Аня · кино и поесть» | `match` | — | переход |
| `plan` | «Назад» | `nearby` | — | возврат по IA |
| `plan` | «Подтвердить план» | `plan` | `aps-environment` | доступ разрешён |
| `plan` | «Я на месте» | `plan` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `plan` | «Обновлять состав» | `system` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
| `plan` | «Подключиться к сети места» | `netqr` | — | переход |
| `plan` | «Голосовые по дороге · 4» | `onway` | — | переход |
| `create` | «Сказать план» | `sayplan` | `NSMicrophoneUsageDescription + NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `create` | «Снять» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `create` | «Снять» | `create` | `NSCameraUsageDescription` | отказ → fallback |
| `create` | «Из Фото» | `media` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Из Фото» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `create` | «Отправить приглашение» | `chats` | — | переход |
| `camera` | «Закрыть» | `create` | — | возврат по IA |
| `camera` | «Снять фото» | `create` | — | переход |
| `media` | «Закрыть» | `create` | — | возврат по IA |
| `media` | «Выбрать» | `create` | — | переход |
| `groups` | «Назад» | `home` | — | возврат по IA |
| `chats` | «Создать план» | `create` | — | переход |
| `chats` | «Кино сегодня» | `chat` | — | переход |
| `chats` | «Ужин после работы» | `plan` | — | переход |
| `chat` | «Назад» | `chats` | — | возврат по IA |
| `chat` | «Позвонить» | `call` | `UIBackgroundModes: voip` | entitlement, без alert |
| `chat` | «Уведомления» | `chat` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `chat` | «Записать голосовое» | `voice` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `chat` | «Записать голосовое» | `chat` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `voice` | «Закрыть» | `chat` | — | возврат по IA |
| `voice` | «Отправить» | `chat` | — | переход |
| `profile` | «Настройки» | `settings` | — | переход |
| `profile` | «Близкие друзья» | `groups` | — | переход |
| `profile` | «Найти среди контактов» | `mates` | `NSContactsUsageDescription` | доступ разрешён |
| `profile` | «Виджет ближайшего плана» | `system` | `com.apple.security.application-groups` | entitlement, без alert |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Кто видит мои планы» | `groups` | — | переход |
| `settings` | «Замок Face ID» | `lock` | `NSFaceIDUsageDescription` | доступ разрешён |
| `settings` | «Обновлять планы в фоне» | `system` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Автозаполнение на сайте» | `system` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `settings` | «Поделиться в «Сегодня»» | `shareext` | `NSExtensionPointIdentifier: com.apple.share-services` | entitlement, без alert |
| `settings` | «Реклама и подписка» | `ads` | — | переход |
| `system` | «Проверить фоновую задачу» | `system` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `system` | «Готово» | `profile` | `keychain-access-groups` | entitlement, без alert |
| `mates` | «Назад» | `profile` | — | возврат по IA |
| `mates` | «Миша Ковалёв» | `groups` | — | переход |
| `mates` | «Отправить в переписку» | `chats` | — | переход |
| `ads` | «Закрыть» | `settings` | — | возврат по IA |
| `ads` | «Продолжить» | `profile` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `lock` | «Назад» | `settings` | — | возврат по IA |
| `sayplan` | «Назад» | `create` | — | возврат по IA |
| `sayplan` | «Открыть план» | `plan` | — | переход |
| `sayplan` | «Собрать план» | `plan` | — | подтверждение |
| `onway` | «Назад» | `plan` | — | возврат по IA |
| `onway` | «Слушать подряд» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `background` | — | — | — | дальше переходов нет |
| `call` | «Завершить звонок» | `chat` | — | возврат по IA |
| `netqr` | «Закрыть» | `plan` | — | возврат по IA |
| `netqr` | «Подключиться» | `netqr` | `com.apple.developer.networking.HotspotConfiguration` | доступ разрешён |
| `netqr` | «Вернуться к отметке «Я на месте»» | `plan` | — | переход |
| `shareext` | «Отмена» | `settings` | — | возврат по IA |
| `shareext` | «Добавить в план» | `plan` | — | подтверждение |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Статусы друзей | Статический демо-граф и локальные статусы в прототипе |
| Подбор места | MapKit local search на устройстве |
| Сообщения | Firebase SDK без собственного API |
<!-- @end -->
