# Образы — архитектура

Клиентское приложение без своего бэкенда: аккаунты, лента, сообщества и сообщения живут на SDK провайдера, медиа — в его же хранилище. Ни один заявленный ключ не требует писать и разворачивать свой обработчик.

Набор доступов — ВКонтакте, заявлено 22 ключа. Правило, из которого выведена вся таблица ниже: **доступ заявляется только там, где за ним стоит фича, до которой пользователь доходит за 2–3 тапа.** Причина живёт в review-notes, фича — в сборке, а проверяют фичу.

---

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Вход | старт | — |
| `code` | Код | push | — |
| `codefail` | Неверный код | push | — |
| `home` | Лента | tab (root) | location |
| `post` | Публикация | push | — |
| `nearby` | Сообщества | tab (root) | — |
| `clip` | Клип-примерка | push | push |
| `create` | Новый образ | push | camera, photos, speech |
| `camera` | Камера | fullscreen | — |
| `media` | Фото | system picker | — |
| `groups` | Сообщество | push | — |
| `chats` | Сообщения | tab (root) | — |
| `chat` | Диалог | push | mic, commnotif (activate), voip (activate) |
| `voice` | Голосовое сообщение | modal | — |
| `profile` | Профиль автора | tab (root) | appgroups (activate), contacts |
| `settings` | Настройки | push | remotenotif (activate), fetch (activate), autofill (activate), faceid, shareext (activate) |
| `system` | Системные функции | task | bgtask (activate), keychain (activate) |
| `mates` | Контакты в «Образах» | push | — |
| `ads` | Реклама вместо подписки | modal | tracking |
| `lock` | Замок на «Сохранённом» | push | — |
| `subtitles` | Субтитры к клипу | push | — |
| `talk` | Разбор голосом | push | audio (activate) |
| `background` | Экран погас | fullscreen | — |
| `call` | Звонок по свопу | fullscreen | — |
| `swap` | Своп в Новой Голландии | push | calendar |
| `checkin` | Отметка на свопе | push | wifiinfo (activate) |
| `netqr` | Сеть площадки по QR | modal | hotspot |
| `shareext` | Поделиться в «Образы» | modal | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSCameraUsageDescription` | «Снять» | Новый образ | Можно выбрать готовый снимок | Низкий |
| `NSPhotoLibraryUsageDescription` | «Из Фото» | Новый образ | Можно снять новый кадр камерой | Низкий |
| `NSMicrophoneUsageDescription` | «Записать голосовое» | Диалог | Остаются текст и фото | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Кто гуляет рядом» | Лента | Район выбирается вручную | Низкий |
| `aps-environment` | «Следить» | Клип-примерка | Обновления помечаются точкой внутри приложения | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.developer.usernotifications.communication` | «Сообщения с аватаром» | Диалог | Обычное уведомление без аватара | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: remote-notification` | «Обновление клипов» | Настройки | Состав обновляется при открытии | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: fetch` | «Обновлять ленту в фоне» | Настройки | Лента обновится после открытия | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `BGTaskSchedulerPermittedIdentifiers` | «Проверить фоновые функции» | Системные функции | Без задачи обновление только вручную | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.security.application-groups` | «Добавить виджет» | Профиль автора | Расписание остаётся внутри приложения | Низкий |
| `keychain-access-groups` | «Добавить виджет» | Системные функции | Виджет открывает приложение для входа | Низкий |
| `com.apple.developer.authentication-services.autofill-credential-provider` | «Автозаполнение на сайте» | Настройки | Вход по коду из SMS | Низкий |
| `com.apple.developer.networking.wifi-info` | «Отметиться на свопе» | Отметка на свопе | Остаётся отметка вручную — её подтверждает организатор | **Условный** — CNCopyCurrentNetworkInfo плюс выданная геопозиция — иначе SSID приходит пустым |
| `NSContactsUsageDescription` | «Найти среди контактов» | Профиль автора | Остаётся поиск по имени и ссылка-приглашение | Низкий |
| `NSUserTrackingUsageDescription` | «Продолжить» | Реклама вместо подписки | Реклама остаётся, но перестаёт быть персональной | Средний |
| `NSFaceIDUsageDescription` | «Замок Face ID» | Настройки | Остаётся код-пароль устройства | Низкий |
| `NSSpeechRecognitionUsageDescription` | «Озвучить клип» — цепочкой с микрофоном | Новый образ | Субтитры набираются вручную | Низкий |
| `UIBackgroundModes: audio` | «Слушать» | Разбор голосом | Без entitlement звук обрывается — не ship | **Условный** — Реальный playback, заполненный MPNowPlayingInfoCenter и remote-команды |
| `UIBackgroundModes: voip` | «Позвонить» | Диалог | Остаётся переписка в чате | **Условный** — PushKit + CallKit: входящий звонок поднимается системным экраном вызова, иначе ключ не заявляется |
| `NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription` | «Добавить в Календарь» | Своп в Новой Голландии | Дата остаётся в карточке свопа и в напоминании приложения | Низкий |
| `NSExtensionPointIdentifier: com.apple.share-services` | «Поделиться» в другом приложении | Настройки | Остаётся сохранение внутри приложения | **Условный** — Отдельный target расширения; черновик кладётся в общий контейнер App Group |
| `com.apple.developer.networking.HotspotConfiguration` | «Подключиться» | Сеть площадки по QR | Сеть выбирается вручную в Настройках | Низкий |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Вход (phone) — старт · открывается: старт
    └─ Код (code) — push · открывается: «Продолжить»
        ├─ Неверный код (codefail) — push · открывается: «2»
        └─ Лента (home) — tab (root) · открывается: «Продолжить», «Опубликовать» … · location
            ├─ Публикация (post) — push · открывается: «4 вещи отмечены», «Комментарии» …
            ├─ Сообщества (nearby) — tab (root) · открывается: «Рядом» (location)
            │   ├─ Клип-примерка (clip) — push · открывается: «Уведомления», «Опубликовать клип» · push
            │   │   └─ Своп в Новой Голландии (swap) — push · открывается: «Своп в Новой Голландии» · calendar
            │   │       └─ Отметка на свопе (checkin) — push · открывается: «Отметиться на свопе», «Вернуться к отметке» · wifiinfo
            │   │           └─ Сеть площадки по QR (netqr) — modal · открывается: «Подключиться по QR» · hotspot
            │   └─ Сообщество (groups) — push · открывается: «Все», «Петербургский минимализм» …
            ├─ Новый образ (create) — push · открывается: «Создать публикацию», «+» … · camera, photos, speech
            │   ├─ Камера (camera) — fullscreen · открывается: «Снять» (camera)
            │   ├─ Фото (media) — system picker · открывается: «Выбрать фото» (photos), «Открыть фото»
            │   └─ Субтитры к клипу (subtitles) — push · открывается: «Озвучить клип» (mic + speech)
            └─ Разбор голосом (talk) — push · открывается: «Все 9», «Разобрать шкаф за один вечер» … · audio
                └─ Экран погас (background) — fullscreen · открывается: «Слушать» (audio)

Сообщения (chats) — tab (root) · открывается: «Отправить в переписку»
    └─ Диалог (chat) — push · открывается: «Открыть диалог», «Лера Савина» … · mic, commnotif, voip
        ├─ Голосовое сообщение (voice) — modal · открывается: «Записать голосовое» (mic)
        └─ Звонок по свопу (call) — fullscreen · открывается: «Позвонить» (voip)

Профиль автора (profile) — tab (root) · открывается: «Вернуться в профиль» (keychain), «Лера Савина», «Даша Ильина» …, «Продолжить» (tracking) · appgroups, contacts
    ├─ Настройки (settings) — push · открывается: «Настройки» · remotenotif, fetch, autofill, faceid, shareext
    │   ├─ Системные функции (system) — task · открывается: «Добавить виджет» (appgroups), «Фоновая лента» (fetch), «Обновление клипов» (remotenotif) … · bgtask, keychain
    │   ├─ Реклама вместо подписки (ads) — modal · открывается: «Реклама и подписка» · tracking
    │   ├─ Замок на «Сохранённом» (lock) — push · открывается: «Замок Face ID» (faceid)
    │   └─ Поделиться в «Образы» (shareext) — modal · открывается: «Поделиться в «Образы»» (shareext)
    └─ Контакты в «Образах» (mates) — push · открывается: «Найти среди контактов» (contacts)
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Продолжить» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «2» | `codefail` | — | переход |
| `code` | «Продолжить» | `home` | — | переход |
| `codefail` | «Назад» | `code` | — | возврат по IA |
| `home` | «Создать публикацию», «+» | `create` | — | переход |
| `home` | «Рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «4 вещи отмечены», «Комментарии» … | `post` | — | переход |
| `home` | «Все 9», «Разобрать шкаф за один вечер» … | `talk` | — | переход |
| `home` | переход | `clip` | — | переход |
| `post` | «Назад» | `home` | — | возврат по IA |
| `post` | «Открыть диалог» | `chat` | — | переход |
| `nearby` | «Все», «Петербургский минимализм» … | `groups` | — | переход |
| `clip` | «Назад» | `nearby` | — | возврат по IA |
| `clip` | «Подписаться» | `clip` | `aps-environment` | доступ разрешён |
| `clip` | «Своп в Новой Голландии» | `swap` | — | переход |
| `create` | «Закрыть» | `home` | — | возврат по IA |
| `create` | «Опубликовать» | `home` | — | переход |
| `create` | «Снять» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `create` | «Снять» | `create` | `NSCameraUsageDescription` | отказ → fallback |
| `create` | «Выбрать фото» | `media` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Выбрать фото» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `create` | «Озвучить клип» | `subtitles` | `NSMicrophoneUsageDescription + NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `camera` | «Закрыть камеру», «Снять фото» | `create` | — | возврат по IA |
| `camera` | «Открыть фото» | `media` | — | переход |
| `media` | «Закрыть» | `create` | — | возврат по IA |
| `media` | «Добавить фото», «Выбрать первое фото» … | `create` | — | переход |
| `groups` | «Назад» | `nearby` | — | возврат по IA |
| `groups` | переход | `clip` | — | переход |
| `chats` | «Лера Савина», «Своп в субботу» … | `chat` | — | переход |
| `chat` | «Назад» | `chats` | — | возврат по IA |
| `chat` | «Позвонить» | `call` | `UIBackgroundModes: voip` | entitlement, без alert |
| `chat` | «Уведомления с аватаром» | `chat` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `chat` | «Записать голосовое» | `voice` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `chat` | «Записать голосовое» | `chat` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `voice` | «Закрыть» | `chat` | — | возврат по IA |
| `voice` | «Отправить» | `chat` | — | переход |
| `profile` | «Создать публикацию» | `create` | — | переход |
| `profile` | «Настройки» | `settings` | — | переход |
| `profile` | «Добавить виджет» | `system` | `com.apple.security.application-groups` | entitlement, без alert |
| `profile` | «Найти среди контактов» | `mates` | `NSContactsUsageDescription` | доступ разрешён |
| `profile` | «Открыть публикацию» | `post` | — | переход |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Камера и фотографии» | `create` | — | переход |
| `settings` | «Микрофон» | `chat` | — | переход |
| `settings` | «Геопозиция» | `home` | — | переход |
| `settings` | «Уведомления» | `clip` | — | переход |
| `settings` | «Фоновая лента» | `system` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Обновление клипов» | `system` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
| `settings` | «Реклама и подписка» | `ads` | — | переход |
| `settings` | «Замок Face ID» | `lock` | `NSFaceIDUsageDescription` | доступ разрешён |
| `settings` | «Поделиться в «Образы»» | `shareext` | `NSExtensionPointIdentifier: com.apple.share-services` | entitlement, без alert |
| `settings` | «Вход на сайте» | `system` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `system` | «Назад» | `settings` | — | возврат по IA |
| `system` | «Проверить фоновую задачу» | `system` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `system` | «Вернуться в профиль» | `profile` | `keychain-access-groups` | entitlement, без alert |
| `mates` | «Назад» | `profile` | — | возврат по IA |
| `mates` | «Лера Савина», «Даша Ильина» … | `profile` | — | переход |
| `mates` | «Отправить в переписку» | `chats` | — | переход |
| `ads` | «Закрыть» | `settings` | — | возврат по IA |
| `ads` | «Продолжить» | `profile` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `lock` | «Назад» | `settings` | — | возврат по IA |
| `subtitles` | «Назад» | `create` | — | возврат по IA |
| `subtitles` | «Опубликовать клип» | `clip` | — | подтверждение |
| `talk` | «Назад» | `home` | — | возврат по IA |
| `talk` | «Слушать» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `background` | — | — | — | дальше переходов нет |
| `call` | «Завершить звонок» | `chat` | — | возврат по IA |
| `swap` | «Назад» | `clip` | — | возврат по IA |
| `swap` | «Добавить в Календарь» | `swap` | `NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription` | доступ разрешён |
| `swap` | «Отметиться на свопе» | `checkin` | — | переход |
| `swap` | «Петербургский минимализм» | `groups` | — | переход |
| `checkin` | «Назад» | `swap` | — | возврат по IA |
| `checkin` | «Отметиться на свопе» | `checkin` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `checkin` | «Подключиться по QR» | `netqr` | — | переход |
| `checkin` | «Напомнить организатору» | `checkin` | — | подтверждение |
| `netqr` | «Закрыть» | `checkin` | — | возврат по IA |
| `netqr` | «Подключиться» | `netqr` | `com.apple.developer.networking.HotspotConfiguration` | доступ разрешён |
| `netqr` | «Вернуться к отметке» | `checkin` | — | переход |
| `shareext` | «Отмена» | `settings` | — | возврат по IA |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Лента и профили | Статический контент-пак и локальные реакции в прототипе |
| Распознавание вещей | Vision на устройстве с ручным подтверждением |
| Уведомления | APNs через SDK провайдера |
<!-- @end -->
