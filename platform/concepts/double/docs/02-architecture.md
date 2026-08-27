# Архитектура

AVCaptureSession пишет локальный файл. Vision/Core ML извлекает точки тела на устройстве, TimelineEngine синхронизирует фазы. Core Data хранит метрики, FileManager — исходники. Публичной загрузки видео нет.

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `phone` | Регистрация по почте | старт, без таб-бара | — |
| `ads` | Бесплатные наборы | onboarding | tracking |
| `home` | Практика | tab (root) | location |
| `library` | Движения | tab (root) | — |
| `reference` | Референс | push | localnet, mic, camera, photo, audio (activate), domains (activate) |
| `camera` | Попытка | fullscreen | — |
| `analysis` | Разбор | push | photoadd |
| `retry` | Повтор фрагмента | fullscreen | — |
| `result` | Результат | push | — |
| `upload` | Импорт видео | system picker | — |
| `cast` | На большой экран | sheet | — |
| `background` | Счёт в фоне | system | — |
| `deeplink` | Движение по ссылке | system handoff | — |
| `nearby` | Площадки рядом | push | — |
| `progress` | Прогресс | tab (root) | push |
| `profile` | Профиль | tab (root) | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSPhotoLibraryAddUsageDescription` | «Сохранить сравнение» в результате | Разбор | Сравнение остаётся в истории практики | Низкий |
| `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | «На экран» в референсе | Референс | Референс остаётся рядом с камерой на iPhone | Низкий |
| `NSMicrophoneUsageDescription` | «Снять попытку» в референсе | Референс | Запись запускается трёхсекундным таймером | Низкий |
| `NSLocationWhenInUseUsageDescription` | «Площадки рядом» на главной | Практика | Открывается список площадок выбранного города | **Условный** — JIT после явного выбора |
| `NSUserTrackingUsageDescription` | «Продолжить бесплатно» после входа | Бесплатные наборы | Контекстные объявления по дисциплине | **Условный** — ATT после объяснения |
| `NSCameraUsageDescription` | «Снять попытку» в референсе | Референс | Можно импортировать готовую попытку | Низкий |
| `NSPhotoLibraryUsageDescription` | «Импортировать попытку» в референсе | Референс | Можно записать новую попытку камерой | Низкий |
| `UIBackgroundModes: audio` | «Счёт в фоне» в референсе | Референс | Счёт останавливается при блокировке | **Условный** — AVAudioSession, Now Playing и remote-команды |
| `aps-environment (Push Notifications capability)` | Свитч «Напоминать о серии» в прогрессе | Прогресс | Серия видна внутри приложения | **Условный** — Локальные уведомления и APNs для новых наборов |
| `com.apple.developer.associated-domains` | «Поделиться движением» в референсе | Референс | Открывается публичная страница движения | **Условный** — AASA для /move/* |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Регистрация по почте (phone) — старт, без таб-бара · открывается: старт
    └─ Бесплатные наборы (ads) — onboarding · открывается: «Создать аккаунт» · tracking

Практика (home) — tab (root) · открывается: «Продолжить бесплатно» (tracking) · location
    └─ Площадки рядом (nearby) — push · открывается: «Площадки рядом» (location)

Движения (library) — tab (root) · открывается: вкладка таб-бара
    └─ Референс (reference) — push · открывается: «08 СЕК · 3 ФАЗЫ», «Повторить перенос» … · localnet, mic, camera, photo, audio, domains
        ├─ Попытка (camera) — fullscreen · открывается: «Снять попытку» (camera), «Старт по хлопку» (mic)
        │   └─ Разбор (analysis) — push · открывается: «Начать запись», «Далее» · photoadd
        │       └─ Повтор фрагмента (retry) — fullscreen · открывается: «Повторить фрагмент»
        │           └─ Результат (result) — push · открывается: «Записать повтор»
        ├─ Импорт видео (upload) — system picker · открывается: «Импортировать попытку» (photo)
        ├─ На большой экран (cast) — sheet · открывается: «На большой экран» (localnet)
        ├─ Счёт в фоне (background) — system · открывается: «Счёт в фоне · 84 BPM» (audio)
        └─ Движение по ссылке (deeplink) — system handoff · открывается: «Поделиться движением» (domains)

Прогресс (progress) — tab (root) · открывается: «Готово» · push

Профиль (profile) — tab (root) · открывается: вкладка таб-бара
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `phone` | «Создать аккаунт» | `ads` | — | переход |
| `ads` | «Назад» | `phone` | — | возврат по IA |
| `ads` | «Продолжить бесплатно» | `home` | `NSUserTrackingUsageDescription` | доступ разрешён |
| `home` | «08 СЕК · 3 ФАЗЫ», «Повторить перенос» … | `reference` | — | переход |
| `home` | «Площадки рядом» | `nearby` | `NSLocationWhenInUseUsageDescription` | доступ разрешён |
| `home` | «Площадки рядом» | `home` | `NSLocationWhenInUseUsageDescription` | отказ → fallback |
| `library` | «00:08», «00:06» | `reference` | — | переход |
| `reference` | «Назад» | `library` | — | возврат по IA |
| `reference` | «Поделиться движением» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `reference` | «Снять попытку» | `camera` | `NSCameraUsageDescription` | доступ разрешён |
| `reference` | «Снять попытку» | `reference` | `NSCameraUsageDescription` | отказ → fallback |
| `reference` | «На большой экран» | `cast` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | доступ разрешён |
| `reference` | «На большой экран» | `reference` | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` | отказ → fallback |
| `reference` | «Импортировать попытку» | `upload` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `reference` | «Импортировать попытку» | `reference` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `reference` | «Старт по хлопку» | `camera` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `reference` | «Старт по хлопку» | `reference` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `reference` | «Счёт в фоне · 84 BPM» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `camera` | «Закрыть камеру» | `reference` | — | возврат по IA |
| `camera` | «Начать запись» | `analysis` | — | переход |
| `analysis` | «Назад» | `camera` | — | возврат по IA |
| `analysis` | «Повторить фрагмент» | `retry` | — | переход |
| `analysis` | «Сохранить сравнение» | `analysis` | `NSPhotoLibraryAddUsageDescription` | доступ разрешён |
| `retry` | «Назад» | `analysis` | — | возврат по IA |
| `retry` | «Записать повтор» | `result` | — | переход |
| `result` | «Готово» | `progress` | — | переход |
| `upload` | «Далее» | `analysis` | — | переход |
| `cast` | «Продолжить на iPhone» | `reference` | — | возврат по IA |
| `background` | — | — | — | дальше переходов нет |
| `deeplink` | «Начать практику» | `reference` | — | переход |
| `nearby` | «Назад» | `home` | — | возврат по IA |
| `progress` | «Напоминать о серии» | `progress` | `aps-environment (Push Notifications capability)` | доступ разрешён |
| `profile` | — | — | — | дальше переходов нет |
<!-- @end -->

## Действия на экранах

Каждый интерактивный элемент прототипа: что он делает, куда ведёт и какой ключ при этом запрашивается. В отличие от таблицы переходов выше, вкладки таб-бара, кнопки возврата и подтверждения без перехода тоже здесь — раздел выводится из разметки и отвечает на вопрос «что делает эта кнопка», не заставляя открывать HTML.

<!-- @generated:actions -->
| Экран | Элемент | Роль | Что делает | Ведёт на | При отказе | Ключ |
|---|---|---|---|---|---|---|
| `phone` | Создать аккаунт | элемент экрана | открывает экран | Бесплатные наборы (ads) | — | — |
| `phone` | Помощь | элемент экрана | показывает подтверждение «Помощь · double.fit/help» | остаётся на экране | — | — |
| `phone` | Поддержка | элемент экрана | показывает подтверждение «Поддержка · alex@inbox.ru» | остаётся на экране | — | — |
| `phone` | Пользовательское соглашение | элемент экрана | показывает подтверждение «Соглашение · double.fit/terms» | остаётся на экране | — | — |
| `ads` | Назад | кнопка «назад» | возвращает к родительскому экрану | Регистрация по почте (phone) | — | — |
| `ads` | Продолжить бесплатно | элемент экрана | спрашивает доступ tracking | Практика (home) | Практика (home) | `NSUserTrackingUsageDescription` |
| `home` | 08 СЕК · 3 ФАЗЫ | элемент экрана | открывает экран | Референс (reference) | — | — |
| `home` | Повторить перенос | элемент экрана | открывает экран | Референс (reference) | — | — |
| `home` | 00:06 | элемент экрана | открывает экран | Референс (reference) | — | — |
| `home` | Площадки рядом | элемент экрана | спрашивает доступ location | Площадки рядом (nearby) | Практика (home) | `NSLocationWhenInUseUsageDescription` |
| `home` | Раздел Практика | вкладка | переключает вкладку таб-бара | Практика (home) | — | — |
| `home` | Раздел Движения | вкладка | переключает вкладку таб-бара | Движения (library) | — | — |
| `home` | Раздел Прогресс | вкладка | переключает вкладку таб-бара | Прогресс (progress) | — | — |
| `home` | Раздел Профиль | вкладка | переключает вкладку таб-бара | Профиль (profile) | — | — |
| `library` | 00:08 | элемент экрана | открывает экран | Референс (reference) | — | — |
| `library` | 00:06 | элемент экрана | открывает экран | Референс (reference) | — | — |
| `library` | Раздел Практика | вкладка | переключает вкладку таб-бара | Практика (home) | — | — |
| `library` | Раздел Движения | вкладка | переключает вкладку таб-бара | Движения (library) | — | — |
| `library` | Раздел Прогресс | вкладка | переключает вкладку таб-бара | Прогресс (progress) | — | — |
| `library` | Раздел Профиль | вкладка | переключает вкладку таб-бара | Профиль (profile) | — | — |
| `reference` | Назад | кнопка «назад» | возвращает к родительскому экрану | Движения (library) | — | — |
| `reference` | Поделиться движением | элемент экрана | включает entitlement domains, системного alert нет | Движение по ссылке (deeplink) | — | `com.apple.developer.associated-domains` |
| `reference` | Снять попытку | элемент экрана | спрашивает доступ camera | Попытка (camera) | Референс (reference) | `NSCameraUsageDescription` |
| `reference` | На большой экран | элемент экрана | спрашивает доступ localnet | На большой экран (cast) | Референс (reference) | `NSLocalNetworkUsageDescription (+ NSBonjourServices)` |
| `reference` | Импортировать попытку | элемент экрана | спрашивает доступ photo | Импорт видео (upload) | Референс (reference) | `NSPhotoLibraryUsageDescription` |
| `reference` | Старт по хлопку | элемент экрана | спрашивает доступ mic | Попытка (camera) | Референс (reference) | `NSMicrophoneUsageDescription` |
| `reference` | Счёт в фоне · 84 BPM | элемент экрана | включает entitlement audio, системного alert нет | Счёт в фоне (background) | — | `UIBackgroundModes: audio` |
| `camera` | Закрыть камеру | кнопка «назад» | возвращает к родительскому экрану | Референс (reference) | — | — |
| `camera` | Начать запись | элемент экрана | открывает экран | Разбор (analysis) | — | — |
| `analysis` | Назад | кнопка «назад» | возвращает к родительскому экрану | Попытка (camera) | — | — |
| `analysis` | Повторить фрагмент | элемент экрана | открывает экран | Повтор фрагмента (retry) | — | — |
| `analysis` | Сохранить сравнение | элемент экрана | спрашивает доступ photoadd | Разбор (analysis) | Разбор (analysis) | `NSPhotoLibraryAddUsageDescription` |
| `retry` | Назад | кнопка «назад» | возвращает к родительскому экрану | Разбор (analysis) | — | — |
| `retry` | Записать повтор | элемент экрана | открывает экран | Результат (result) | — | — |
| `result` | Готово | элемент экрана | открывает экран | Прогресс (progress) | — | — |
| `upload` | Далее | элемент экрана | открывает экран | Разбор (analysis) | — | — |
| `cast` | Продолжить на iPhone | кнопка «назад» | возвращает к родительскому экрану | Референс (reference) | — | — |
| `background` | — | — | интерактивных элементов нет | — | — | — |
| `deeplink` | Начать практику | элемент экрана | открывает экран | Референс (reference) | — | — |
| `nearby` | Назад | кнопка «назад» | возвращает к родительскому экрану | Практика (home) | — | — |
| `progress` | Напоминать о серии | элемент экрана | спрашивает доступ push | Прогресс (progress) | Прогресс (progress) | `aps-environment (Push Notifications capability)` |
| `progress` | Раздел Практика | вкладка | переключает вкладку таб-бара | Практика (home) | — | — |
| `progress` | Раздел Движения | вкладка | переключает вкладку таб-бара | Движения (library) | — | — |
| `progress` | Раздел Прогресс | вкладка | переключает вкладку таб-бара | Прогресс (progress) | — | — |
| `progress` | Раздел Профиль | вкладка | переключает вкладку таб-бара | Профиль (profile) | — | — |
| `profile` | Раздел Практика | вкладка | переключает вкладку таб-бара | Практика (home) | — | — |
| `profile` | Раздел Движения | вкладка | переключает вкладку таб-бара | Движения (library) | — | — |
| `profile` | Раздел Прогресс | вкладка | переключает вкладку таб-бара | Прогресс (progress) | — | — |
| `profile` | Раздел Профиль | вкладка | переключает вкладку таб-бара | Профиль (profile) | — | — |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Анализ позы | Vision и Core ML работают на устройстве |
| Каталог движений | Подписанный статический пакет на CDN |
| Хранение попыток | Файлы приложения и Core Data |
| Ссылки | Статические страницы double.fit и AASA |
<!-- @end -->
