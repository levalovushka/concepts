# Сегодня — архитектура

## Root navigation

Пять разделов стабильны на всех root-экранах: `Сегодня`, `Совпадения`, `Создать`, `Планы`, `Вы`. Переключение root-разделов не создаёт push-стек; дочерние экраны возвращаются к объявленному parent через `data-back`.

## Сценарии

1. `phone → code → home` — вход без публичного профиля.
2. `home → nearby → pet → walk` — желание, совпадение, приватный план.
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
| `pet` | Совпадение | push | — |
| `nearby` | Совпадения | tab (root) | — |
| `walk` | План | push | push, remotenotif (activate), wifiinfo (activate) |
| `create` | Новый план | tab (root) | camera, photos |
| `camera` | Камера | fullscreen | — |
| `media` | Фото | system picker | — |
| `groups` | Друзья | push | — |
| `chats` | Планы | tab (root) | — |
| `chat` | Группа плана | push | mic, commnotif (activate) |
| `voice` | Голосовое | modal | — |
| `profile` | Вы | tab (root) | appgroups (activate) |
| `settings` | Настройки | push | fetch (activate), autofill (activate) |
| `system` | Системные функции | task | bgtask (activate), keychain (activate) |
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
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Вход (phone) — старт · открывается: старт
    └─ Код (code) — push · открывается: «Получить код»
        ├─ Неверный код (codefail) — push · открывается: «2»
        └─ Сегодня (home) — tab (root) · открывается: «Продолжить» · location
            ├─ Совпадение (pet) — push · открывается: «Миша · кино», «Аня · кино и поесть»
            ├─ Совпадения (nearby) — tab (root) · открывается: «Кино», «Прогулка» … (location)
            │   └─ План (walk) — push · открывается: «Открыть план», «Собрать план» … · push, remotenotif, wifiinfo
            └─ Друзья (groups) — push · открывается: «Близкие друзья», «Кто видит мои планы»

Новый план (create) — tab (root) · открывается: «Снять фото», «Выбрать» … · camera, photos
    ├─ Камера (camera) — fullscreen · открывается: «Снять» (camera)
    └─ Фото (media) — system picker · открывается: «Из Фото» (photos)

Планы (chats) — tab (root) · открывается: «Отправить приглашение»
    └─ Группа плана (chat) — push · открывается: «Написать Мише», «Кино сегодня» … · mic, commnotif
        └─ Голосовое (voice) — modal · открывается: «Записать голосовое» (mic)

Вы (profile) — tab (root) · открывается: «Готово» (keychain) · appgroups
    └─ Настройки (settings) — push · открывается: «Настройки» · fetch, autofill
        └─ Системные функции (system) — task · открывается: «Обновлять состав» (remotenotif), «Виджет ближайшего плана» (appgroups), «Обновлять планы в фоне» (fetch) … · bgtask, keychain
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
| `home` | «Открыть план» | `walk` | — | переход |
| `pet` | «Назад» | `home` | — | возврат по IA |
| `pet` | «Собрать план» | `walk` | — | переход |
| `pet` | «Написать Мише» | `chat` | — | переход |
| `nearby` | «Близкие друзья» | `groups` | — | переход |
| `nearby` | «Миша · кино», «Аня · кино и поесть» | `pet` | — | переход |
| `walk` | «Назад» | `nearby` | — | возврат по IA |
| `walk` | «Подтвердить план» | `walk` | `aps-environment` | доступ разрешён |
| `walk` | «Я на месте» | `walk` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `walk` | «Обновлять состав» | `system` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
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
| `chats` | «Ужин после работы» | `walk` | — | переход |
| `chat` | «Назад» | `chats` | — | возврат по IA |
| `chat` | «Уведомления» | `chat` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `chat` | «Записать голосовое» | `voice` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `chat` | «Записать голосовое» | `chat` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `voice` | «Закрыть» | `chat` | — | возврат по IA |
| `voice` | «Отправить» | `chat` | — | переход |
| `profile` | «Настройки» | `settings` | — | переход |
| `profile` | «Близкие друзья» | `groups` | — | переход |
| `profile` | «Виджет ближайшего плана» | `system` | `com.apple.security.application-groups` | entitlement, без alert |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Кто видит мои планы» | `groups` | — | переход |
| `settings` | «Обновлять планы в фоне» | `system` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Автозаполнение на сайте» | `system` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `system` | «Проверить фоновую задачу» | `system` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `system` | «Готово» | `profile` | `keychain-access-groups` | entitlement, без alert |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Статусы друзей | Статический демо-граф и локальные статусы в прототипе |
| Подбор места | MapKit local search на устройстве |
| Сообщения | Firebase SDK без собственного API |
<!-- @end -->
