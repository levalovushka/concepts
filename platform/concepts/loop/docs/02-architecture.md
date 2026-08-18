# Архитектура

14 экранов, четыре корневых раздела. Контент — статический пак; личные данные — CoreData/CloudKit.

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `home` | Главная | tab (root, start) | — |
| `discover` | Поиск | tab (root) | — |
| `detail` | Velvet Steps | push | — |
| `player` | Velvet Steps | fullscreen | audio (activate) |
| `background` | Экран погас | system | — |
| `library` | Моя музыка | tab (root) | — |
| `studio` | Студия | tab (root) | camera, photo, mic |
| `capture` | Источник звука | fullscreen | — |
| `pick` | Фото | system picker | — |
| `result` | Луп готов | modal | — |
| `profile` | Профиль | tab (root) | push, domains (activate) |
| `deeplink` | Открыто по ссылке | modal | — |
| `denied` | Нужен доступ | state | — |
| `search` | Результаты | push | — |
<!-- @end -->

## Матрица доступов

Каждая строка читается так: пользователь делает жест — система спрашивает — при отказе остаётся рабочий путь.

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSCameraUsageDescription` | «Снять и записать» | Студия | Ручной ввод и выбор из «Фото» остаются доступны | Низкий |
| `NSPhotoLibraryUsageDescription` | Выбрать обложку | Студия | Камера и ручная настройка остаются | Низкий |
| `NSMicrophoneUsageDescription` | «Записать без камеры» или «Снять источник звука» | Студия | Каталог и конструктор из готовых лупов остаются доступны | Низкий |
| `UIBackgroundModes: audio` | «Фоновый режим» в редакторе | Velvet Steps | Плеер предупредит, что экран должен оставаться активным | **Условный** — AVAudioSession .playback + Now Playing + remote commands |
| `aps-environment` | Свитч «Новое для меня» | Профиль | Новинки видны в главной витрине | **Условный** — Реальная регистрация APNs |
| `com.apple.developer.associated-domains` | «Проверить ссылку» в профиле | Профиль | Та же страница откроется в Safari | Высокий |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Главная (home) — tab (root, start) · открывается: старт
    ├─ Поиск (discover) — tab (root) · открывается: «Радио», «Обзор» …
    │   └─ Результаты (search) — push · открывается: «Поиск», «Лупы, паки и авторы» …
    ├─ Velvet Steps (detail) — push · открывается: «ЛУП», «ПАК» …
    │   └─ Velvet Steps (player) — fullscreen · открывается: «Играть микс», «Morning Objects» … · audio
    │       └─ Экран погас (background) — system · открывается: «Фоновый режим», «Фоновое аудио» (audio)
    ├─ Моя музыка (library) — tab (root) · открывается: «Моя музыка», «Моя» …
    ├─ Студия (studio) — tab (root) · открывается: «Мои миксы», «Студия» … · camera, photo, mic
    │   ├─ Источник звука (capture) — fullscreen · открывается: «Снять и записать» (camera + mic), «Записать без камеры» (mic)
    │   │   └─ Луп готов (result) — modal · открывается: «Записать», «Готово» …
    │   ├─ Фото (pick) — system picker · открывается: «Выбрать обложку» (photo)
    │   └─ Нужен доступ (denied) — state · открывается: «Как работают доступы»
    └─ Профиль (profile) — tab (root) · открывается: «Профиль», «В» · push, domains
        └─ Открыто по ссылке (deeplink) — modal · открывается: «Открыть тестовую ссылку» (domains)
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `home` | «Профиль» | `profile` | — | переход |
| `home` | «Поиск» | `search` | — | переход |
| `home` | «Мои миксы», «Студия» | `studio` | — | переход |
| `home` | «Моя музыка», «Моя» | `library` | — | переход |
| `home` | «Радио», «Обзор» … | `discover` | — | переход |
| `home` | «Играть микс», «Morning Objects» … | `player` | — | переход |
| `home` | «ЛУП», «ПАК» | `detail` | — | переход |
| `home` | «Главная» | `home` | — | переход |
| `discover` | «В», «Профиль» | `profile` | — | переход |
| `discover` | «Лупы, паки и авторы», «Neo-soul» … | `search` | — | переход |
| `discover` | «Cup Clicks», «Patch Bloom» | `detail` | — | переход |
| `discover` | «Главная» | `home` | — | переход |
| `discover` | «Поиск» | `discover` | — | переход |
| `discover` | «Студия» | `studio` | — | переход |
| `discover` | «Моя» | `library` | — | переход |
| `detail` | «Назад» | `home` | — | возврат по IA |
| `detail` | «Добавить в новый микс», «Tape Motion» … | `player` | — | переход |
| `detail` | «Все» | `discover` | — | переход |
| `player` | «Закрыть редактор» | `detail` | — | возврат по IA |
| `player` | «Фоновый режим» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `background` | — | — | — | дальше переходов нет |
| `library` | «УМНЫЙ ШАФЛ», «Morning Objects» … | `player` | — | переход |
| `library` | «Patch Bloom», «Tape Motion» … | `detail` | — | переход |
| `library` | «Все», «Поиск» | `discover` | — | переход |
| `library` | «Главная» | `home` | — | переход |
| `library` | «Студия» | `studio` | — | переход |
| `library` | «Моя» | `library` | — | переход |
| `library` | «Профиль» | `profile` | — | переход |
| `studio` | «В», «Профиль» | `profile` | — | переход |
| `studio` | «Начать микс» | `player` | — | переход |
| `studio` | «Снять и записать» | `capture` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | доступ разрешён |
| `studio` | «Снять и записать» | `studio` | `NSCameraUsageDescription + NSMicrophoneUsageDescription` | отказ → fallback |
| `studio` | «Выбрать обложку» | `pick` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `studio` | «Выбрать обложку» | `studio` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `studio` | «Записать без камеры» | `capture` | `NSMicrophoneUsageDescription` | доступ разрешён |
| `studio` | «Записать без камеры» | `studio` | `NSMicrophoneUsageDescription` | отказ → fallback |
| `studio` | «Как работают доступы» | `denied` | — | переход |
| `studio` | «Главная» | `home` | — | переход |
| `studio` | «Поиск» | `discover` | — | переход |
| `studio` | «Студия» | `studio` | — | переход |
| `studio` | «Моя» | `library` | — | переход |
| `capture` | «Закрыть» | `studio` | — | возврат по IA |
| `capture` | «Записать» | `result` | — | переход |
| `pick` | «Готово», «1» | `result` | — | переход |
| `result` | «Назад» | `capture` | — | возврат по IA |
| `result` | «Добавить в микс» | `player` | — | переход |
| `result` | «Сохранить в коллекцию» | `library` | — | переход |
| `profile` | «Новое для меня» | `profile` | `aps-environment` | доступ разрешён |
| `profile` | «Открыть тестовую ссылку» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `profile` | «Фоновое аудио» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `profile` | «Главная» | `home` | — | переход |
| `profile` | «Поиск» | `discover` | — | переход |
| `profile` | «Студия» | `studio` | — | переход |
| `profile` | «Моя» | `library` | — | переход |
| `profile` | «Профиль» | `profile` | — | переход |
| `deeplink` | «Назад» | `profile` | — | возврат по IA |
| `deeplink` | «Открыть и добавить» | `detail` | — | переход |
| `denied` | «Назад» | `studio` | — | возврат по IA |
| `denied` | «Вернуться в Студию» | `studio` | — | переход |
| `search` | «Назад» | `discover` | — | возврат по IA |
| `search` | «Velvet Steps», «Tape Motion» … | `detail` | — | переход |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Каталог и аудио | Подписанный статический content pack + CDN |
| Личная библиотека | CoreData и CloudKit private database |
| Обработка камеры | Vision/Core Image на устройстве; кадр не уходит в сеть |
| Push | APNs через дашборд провайдера |
| Universal Links | Статический AASA на loop.audio |
<!-- @end -->
