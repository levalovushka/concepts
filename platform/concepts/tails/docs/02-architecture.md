# Хвосты — архитектура

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
| `home` | Главная | tab (root) | location |
| `pet` | Профиль питомца | push | speech |
| `nearby` | Рядом | tab (root) | — |
| `walk` | Прогулка | push | push, remotenotif (activate), wifiinfo (activate) |
| `create` | Новый момент | tab (root) | camera, photos |
| `camera` | Камера | fullscreen | — |
| `media` | Фото | system picker | — |
| `groups` | Сообщества | push | — |
| `chats` | Сообщения | tab (root) | — |
| `chat` | Чат | push | mic, commnotif (activate), voip (activate) |
| `voice` | Голосовое | modal | — |
| `profile` | Профиль | tab (root) | appgroups (activate), contacts |
| `settings` | Настройки | push | fetch (activate), autofill (activate), faceid, shareext (activate) |
| `system` | Системные функции | task | bgtask (activate), keychain (activate) |
| `mates` | Контакты в «Хвостах» | push | — |
| `ads` | Реклама вместо подписки | modal | tracking |
| `lock` | Замок на ветпаспорте | push | — |
| `vetnote` | Заметка о самочувствии | push | — |
| `course` | Курс послушания | push | audio (activate) |
| `background` | Экран погас | fullscreen | — |
| `call` | Звонок догситтеру | fullscreen | — |
| `vaccine` | Прививки и обработки | push | calendar |
| `netqr` | Сеть площадки по QR | modal | hotspot |
| `shareext` | Поделиться в «Хвосты» | modal | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSCameraUsageDescription` | «Снять» | Новый момент | Можно выбрать готовый снимок | Низкий |
| `NSPhotoLibraryUsageDescription` | «Из Фото» | Новый момент | Можно снять новый кадр камерой | Низкий |
| `NSMicrophoneUsageDescription` | «Записать голосовое» | Чат | Остаются текст и фото | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Кто гуляет рядом» | Главная | Район выбирается вручную | Низкий |
| `aps-environment` | «Следить» | Прогулка | Обновления помечаются точкой внутри приложения | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.developer.usernotifications.communication` | «Сообщения с аватаром» | Чат | Обычное уведомление без аватара | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: remote-notification` | «Обновлять состав» | Прогулка | Состав обновляется при открытии | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `UIBackgroundModes: fetch` | «Обновлять ленту в фоне» | Настройки | Лента обновится после открытия | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `BGTaskSchedulerPermittedIdentifiers` | «Проверить фоновые функции» | Системные функции | Без задачи обновление только вручную | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `com.apple.security.application-groups` | «Добавить виджет» | Профиль | Расписание остаётся внутри приложения | Низкий |
| `keychain-access-groups` | «Добавить виджет» | Системные функции | Виджет открывает приложение для входа | Низкий |
| `com.apple.developer.authentication-services.autofill-credential-provider` | «Автозаполнение на сайте» | Настройки | Вход по коду из SMS | Низкий |
| `com.apple.developer.networking.wifi-info` | «Я на месте» | Прогулка | Отметка по кнопке без автоматической проверки | **Условный** — Функция активируется только явным действием пользователя и имеет видимый fallback |
| `NSContactsUsageDescription` | «Найти среди контактов» | Профиль | Остаётся поиск по кличке и ссылка-приглашение | Низкий |
| `NSUserTrackingUsageDescription` | «Продолжить» | Реклама вместо подписки | Реклама остаётся, но перестаёт быть персональной | Средний |
| `NSFaceIDUsageDescription` | «Замок Face ID» | Настройки | Остаётся код-пароль устройства | Низкий |
| `NSSpeechRecognitionUsageDescription` | «Надиктовать заметку» — цепочкой с микрофоном | Профиль питомца | Заметка остаётся звуком: её можно слушать, но не искать словом | Низкий |
| `UIBackgroundModes: audio` | «Слушать» | Курс послушания | Без entitlement звук обрывается — не ship | **Условный** — Реальный playback, заполненный MPNowPlayingInfoCenter и remote-команды |
| `UIBackgroundModes: voip` | «Позвонить» | Чат | Остаётся переписка в чате | **Условный** — PushKit + CallKit: входящий звонок поднимается системным экраном вызова, иначе ключ не заявляется |
| `NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription` | «Добавить в Календарь» | Прививки и обработки | Срок остаётся в карточке питомца и в напоминании приложения | Низкий |
| `NSExtensionPointIdentifier: com.apple.share-services` | «Поделиться» в другом приложении | Настройки | Остаётся создание записи внутри приложения | **Условный** — Отдельный target расширения; черновик кладётся в общий контейнер App Group |
| `com.apple.developer.networking.HotspotConfiguration` | «Подключиться» | Сеть площадки по QR | Сеть выбирается вручную в Настройках | Низкий |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Вход (phone) — старт · открывается: старт
    └─ Код (code) — push · открывается: «Получить код»
        ├─ Неверный код (codefail) — push · открывается: «2»
        └─ Главная (home) — tab (root) · открывается: «Войти», «Закрыть» … · location
            ├─ Профиль питомца (pet) — push · открывается: «Ксения и Трюфель», «Открыть профиль Трюфеля» …, «Сохранить в карточку» · speech
            │   ├─ Заметка о самочувствии (vetnote) — push · открывается: «Надиктовать заметку» (mic + speech), «Надиктовать заметку о самочувствии»
            │   └─ Прививки и обработки (vaccine) — push · открывается: «Прививки и обработки», «19 мая, 09:15 — Мария Тенищева» · calendar
            ├─ Рядом (nearby) — tab (root) · открывается: «Кто гуляет рядом» (location)
            │   └─ Прогулка (walk) — push · открывается: «Спокойный круг у пруда», «Быстро по набережной» … · push, remotenotif, wifiinfo
            │       └─ Сеть площадки по QR (netqr) — modal · открывается: «Подключиться к сети площадки» · hotspot
            ├─ Сообщества (groups) — push · открывается: «Сообщества», «Мои сообщества»
            └─ Курс послушания (course) — push · открывается: «Курс послушания · «Подзыв в парке с отвлече…» · audio
                └─ Экран погас (background) — fullscreen · открывается: «Слушать» (audio)

Новый момент (create) — tab (root) · открывается: «Сохранить в черновик» · camera, photos
    ├─ Камера (camera) — fullscreen · открывается: «Снять» (camera)
    └─ Фото (media) — system picker · открывается: «Из Фото» (photos)

Сообщения (chats) — tab (root) · открывается: «Отправить в переписку»
    └─ Чат (chat) — push · открывается: «Написать», «Ксения и Трюфель» … · mic, commnotif, voip
        ├─ Голосовое (voice) — modal · открывается: «Записать голосовое» (mic)
        └─ Звонок догситтеру (call) — fullscreen · открывается: «Позвонить» (voip)

Профиль (profile) — tab (root) · открывается: «Готово» (keychain), «Продолжить» (tracking) · appgroups, contacts
    ├─ Настройки (settings) — push · открывается: «Настройки» · fetch, autofill, faceid, shareext
    │   ├─ Системные функции (system) — task · открывается: «Обновлять состав» (remotenotif), «Добавить виджет» (appgroups), «Обновлять ленту в фоне» (fetch) … · bgtask, keychain
    │   ├─ Реклама вместо подписки (ads) — modal · открывается: «Реклама и подписка» · tracking
    │   ├─ Замок на ветпаспорте (lock) — push · открывается: «Замок Face ID» (faceid)
    │   └─ Поделиться в «Хвосты» (shareext) — modal · открывается: «Поделиться в «Хвосты»» (shareext)
    └─ Контакты в «Хвостах» (mates) — push · открывается: «Найти среди контактов» (contacts)
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Получить код» | `code` | — | переход |
| `code` | «Назад» | `phone` | — | возврат по IA |
| `code` | «2» | `codefail` | — | переход |
| `code` | «Войти» | `home` | — | переход |
| `codefail` | «Назад» | `code` | — | возврат по IA |
| `home` | «Сообщества» | `groups` | — | переход |
| `home` | «Кто гуляет рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Кто гуляет рядом» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `home` | «Ксения и Трюфель», «Открыть профиль Трюфеля» | `pet` | — | переход |
| `home` | «Курс послушания · «Подзыв в парке с отвлече…» | `course` | — | переход |
| `pet` | «Назад» | `home` | — | возврат по IA |
| `pet` | «Написать» | `chat` | — | переход |
| `pet` | «Прививки и обработки» | `vaccine` | — | переход |
| `pet` | «Надиктовать заметку» | `vetnote` | `NSMicrophoneUsageDescription + NSSpeechRecognitionUsageDescription` | доступ разрешён |
| `nearby` | «Спокойный круг у пруда», «Быстро по набережной» … | `walk` | — | переход |
| `walk` | «Назад» | `nearby` | — | возврат по IA |
| `walk` | «Я иду · следить» | `walk` | `aps-environment` | доступ разрешён |
| `walk` | «Я на площадке» | `walk` | `com.apple.developer.networking.wifi-info` | entitlement, без alert |
| `walk` | «Подключиться к сети площадки» | `netqr` | — | переход |
| `walk` | «Обновлять состав» | `system` | `UIBackgroundModes: remote-notification` | entitlement, без alert |
| `create` | «Закрыть» | `home` | — | переход |
| `create` | «Снять» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `create` | «Снять» | `create` | `NSCameraUsageDescription` | отказ → fallback |
| `create` | «Из Фото» | `media` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `create` | «Из Фото» | `create` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `camera` | «Закрыть» | `create` | — | возврат по IA |
| `camera` | «Снять фото» | `home` | — | переход |
| `media` | «Закрыть» | `create` | — | возврат по IA |
| `media` | «Готово» | `home` | — | переход |
| `groups` | «Назад» | `home` | — | возврат по IA |
| `chats` | «Ксения и Трюфель», «Прогулка у пруда» | `chat` | — | переход |
| `chat` | «Назад» | `chats` | — | возврат по IA |
| `chat` | «Позвонить» | `call` | `UIBackgroundModes: voip` | entitlement, без alert |
| `chat` | «Сообщения с аватаром» | `chat` | `com.apple.developer.usernotifications.communication` | entitlement, без alert |
| `chat` | «Записать голосовое» | `voice` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `chat` | «Записать голосовое» | `chat` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `voice` | «Закрыть», «Удалить» | `chat` | — | возврат по IA |
| `voice` | «Отправить» | `chat` | — | переход |
| `profile` | «Настройки» | `settings` | — | переход |
| `profile` | «Добавить виджет» | `system` | `com.apple.security.application-groups` | entitlement, без alert |
| `profile` | «Найти среди контактов» | `mates` | `NSContactsUsageDescription` | доступ разрешён |
| `settings` | «Назад» | `profile` | — | возврат по IA |
| `settings` | «Обновлять ленту в фоне» | `system` | `UIBackgroundModes: fetch` | entitlement, без alert |
| `settings` | «Вход на tails.social» | `system` | `com.apple.developer.authentication-services.autofill-credential-provider` | entitlement, без alert |
| `settings` | «Поделиться в «Хвосты»» | `shareext` | `NSExtensionPointIdentifier: com.apple.share-services` | entitlement, без alert |
| `settings` | «Мои сообщества» | `groups` | — | переход |
| `settings` | «Замок Face ID» | `lock` | `NSFaceIDUsageDescription` | доступ разрешён |
| `settings` | «Реклама и подписка» | `ads` | — | переход |
| `system` | «Проверить фоновую задачу» | `system` | `BGTaskSchedulerPermittedIdentifiers` | entitlement, без alert |
| `system` | «Готово» | `profile` | `keychain-access-groups` | entitlement, без alert |
| `mates` | «Назад» | `profile` | — | возврат по IA |
| `mates` | «Влада · Барни, лабрадор», «Ксения · Трюфель, ретривер» | `pet` | — | переход |
| `mates` | «Отправить в переписку» | `chats` | — | переход |
| `ads` | «Закрыть» | `settings` | — | возврат по IA |
| `ads` | «Продолжить» | `profile` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `lock` | «Назад» | `settings` | — | возврат по IA |
| `vetnote` | «Назад» | `pet` | — | возврат по IA |
| `vetnote` | «Сохранить в карточку» | `pet` | — | переход |
| `vetnote` | «19 мая, 09:15 — Мария Тенищева» | `vaccine` | — | переход |
| `course` | «Назад» | `home` | — | возврат по IA |
| `course` | «Слушать» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `background` | — | — | — | дальше переходов нет |
| `call` | «Завершить звонок» | `chat` | — | возврат по IA |
| `vaccine` | «Назад» | `pet` | — | возврат по IA |
| `vaccine` | «Добавить в Календарь» | `vaccine` | `NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription` | доступ разрешён |
| `vaccine` | «Надиктовать заметку о самочувствии» | `vetnote` | — | переход |
| `netqr` | «Закрыть» | `walk` | — | возврат по IA |
| `netqr` | «Подключиться» | `netqr` | `com.apple.developer.networking.HotspotConfiguration` | доступ разрешён |
| `netqr` | «Вернуться к отметке» | `walk` | — | переход |
| `shareext` | «Отмена» | `settings` | — | возврат по IA |
| `shareext` | «Сохранить в черновик» | `create` | — | подтверждение |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Лента и профили | Статический контент-пак и локальные действия в прототипе |
| Сообщения и уведомления | Firebase SDK и APNs без собственного API |
| Прогулки рядом | MapKit и статический каталог парков |
<!-- @end -->
