# Архитектура

14 экранов, четыре корневых раздела: «Главная», «Обзор», «Моё», «Профиль». Detail и search открываются push‑переходом, player — полноэкранно, result — как завершение player. Back возвращает на непосредственного родителя; root‑табы не складываются в стек.

Музыка и метаданные поставляются подписанным статическим content pack через CDN. Сохранённые сессии и история живут в CoreData с опциональной синхронизацией CloudKit private database.

Background audio и Universal Links — capabilities, а не пользовательские разрешения. Камера запрашивается только из «Визуала сессии»; кадр анализируется локально и не сохраняется. PHPicker получает только выбранное фото и не требует доступа ко всей медиатеке. Push запрашивается только после явного действия в профиле.

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `home` | Сейчас | tab (root, start) | — |
| `discover` | Поиск | tab (root) | — |
| `detail` | Тихий берег | push | — |
| `player` | Тихий берег | fullscreen | audio (activate) |
| `background` | Экран погас | system | — |
| `library` | Моё | tab (root) | — |
| `studio` | Визуал сессии | push | camera, photo |
| `capture` | Считать свет комнаты | fullscreen | — |
| `pick` | Фото | system picker | — |
| `result` | Сессия завершена | modal | — |
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
| `NSCameraUsageDescription` | Считать свет комнаты | Визуал сессии | Ручной ввод и выбор из «Фото» остаются доступны | Низкий |
| `NSPhotoLibraryUsageDescription` | Выбрать цвет из фото | Визуал сессии | PHPicker не требует доступа ко всей библиотеке; камера и стандартный визуал остаются | Низкий |
| `UIBackgroundModes: audio` | «Слушать в фоне» в плеере | Тихий берег | Плеер предупредит, что экран должен оставаться активным | **Условный** — AVAudioSession .playback + Now Playing + remote commands |
| `aps-environment` | Свитч «Новое для меня» | Профиль | Новинки видны в главной витрине | **Условный** — Реальная регистрация APNs |
| `com.apple.developer.associated-domains` | «Проверить ссылку» в профиле | Профиль | Та же страница откроется в Safari | Высокий |
<!-- @end -->

## Информационная архитектура

Дерево выведено из разметки экранов, а не нарисовано руками: рукописная схема расходится с прототипом первой же правкой.

<!-- @generated:ia-tree -->
```
Сейчас (home) — tab (root, start) · открывается: старт
    ├─ Поиск (discover) — tab (root) · открывается: «Все», «Обзор»
    │   └─ Результаты (search) — push · открывается: «Состояние, настроение или звук», «Успокоиться» …
    ├─ Тихий берег (detail) — push · открывается: «СЕССИЯ НА СЕЙЧАС · 8 МИН», «3» …
    │   └─ Тихий берег (player) — fullscreen · открывается: «Окно ночью», «Начать сессию» · audio
    │       ├─ Экран погас (background) — system · открывается: «Слушать в фоне», «Фоновое аудио» (audio)
    │       └─ Сессия завершена (result) — modal · открывается: «Завершить»
    ├─ Моё (library) — tab (root) · открывается: «История», «Моё» …
    ├─ Визуал сессии (studio) — push · открывается: «Визуал», «Настроить» … · camera, photo
    │   ├─ Считать свет комнаты (capture) — fullscreen · открывается: «Считать свет камерой» (camera)
    │   ├─ Фото (pick) — system picker · открывается: «Выбрать цвет из фото» (photo)
    │   └─ Нужен доступ (denied) — state · открывается: «Как используются доступы»
    └─ Профиль (profile) — tab (root) · открывается: «Профиль» · push, domains
        └─ Открыто по ссылке (deeplink) — modal · открывается: «Проверить ссылку» (domains)
```
<!-- @end -->

## Переходы

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `home` | «Профиль» | `profile` | — | переход |
| `home` | «СЕССИЯ НА СЕЙЧАС · 8 МИН», «3» … | `detail` | — | переход |
| `home` | «Все», «Обзор» | `discover` | — | переход |
| `home` | «История», «Моё» | `library` | — | переход |
| `home` | «Окно ночью» | `player` | — | переход |
| `home` | «Главная» | `home` | — | переход |
| `discover` | «Состояние, настроение или звук», «Успокоиться» … | `search` | — | переход |
| `discover` | «После дождя», «Тёплый воздух» … | `detail` | — | переход |
| `discover` | «Главная» | `home` | — | переход |
| `discover` | «Обзор» | `discover` | — | переход |
| `discover` | «Моё» | `library` | — | переход |
| `discover` | «Профиль» | `profile` | — | переход |
| `detail` | «Назад» | `home` | — | возврат по IA |
| `detail` | «Начать сессию» | `player` | — | переход |
| `detail` | «Визуал» | `studio` | — | переход |
| `player` | «Закрыть» | `detail` | — | возврат по IA |
| `player` | «Слушать в фоне» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `player` | «Завершить» | `result` | — | переход |
| `background` | — | — | — | дальше переходов нет |
| `library` | «Настроить» | `studio` | — | переход |
| `library` | «Тихий берег», «После дождя» … | `detail` | — | переход |
| `library` | «Главная» | `home` | — | переход |
| `library` | «Обзор» | `discover` | — | переход |
| `library` | «Моё» | `library` | — | переход |
| `library` | «Профиль» | `profile` | — | переход |
| `studio` | «Назад» | `home` | — | возврат по IA |
| `studio` | «Считать свет камерой» | `capture` | `NSCameraUsageDescription` | доступ разрешён |
| `studio` | «Считать свет камерой» | `studio` | `NSCameraUsageDescription` | отказ → fallback |
| `studio` | «Выбрать цвет из фото» | `pick` | `NSPhotoLibraryUsageDescription` | доступ разрешён |
| `studio` | «Выбрать цвет из фото» | `studio` | `NSPhotoLibraryUsageDescription` | отказ → fallback |
| `studio` | «Как используются доступы» | `denied` | — | переход |
| `capture` | «Назад» | `studio` | — | возврат по IA |
| `capture` | «Применить свет» | `studio` | — | переход |
| `pick` | «Готово» | `studio` | — | переход |
| `result` | «Сохранить в «Моё»» | `library` | — | переход |
| `result` | «На главную» | `home` | — | переход |
| `profile` | «Напоминания» | `profile` | `aps-environment` | доступ разрешён |
| `profile` | «Визуал сессии» | `studio` | — | переход |
| `profile` | «Фоновое аудио» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `profile` | «Проверить ссылку» | `deeplink` | `com.apple.developer.associated-domains` | entitlement, без alert |
| `profile` | «Главная» | `home` | — | переход |
| `profile` | «Обзор» | `discover` | — | переход |
| `profile` | «Моё» | `library` | — | переход |
| `profile` | «Профиль» | `profile` | — | переход |
| `deeplink` | «Назад» | `profile` | — | возврат по IA |
| `deeplink` | «Открыть сессию» | `detail` | — | переход |
| `denied` | «Назад» | `studio` | — | возврат по IA |
| `denied` | «Оставить стандартный визуал» | `studio` | — | переход |
| `search` | «Назад» | `discover` | — | возврат по IA |
| `search` | «Тихий берег», «После дождя» … | `detail` | — | переход |
<!-- @end -->

## Граница «без бэкенда»

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Каталог и аудио | Подписанный статический content pack + CDN |
| Личная библиотека | CoreData и CloudKit private database |
| Обработка камеры | Vision/Core Image на устройстве; кадр не уходит в сеть |
| Push | APNs через дашборд провайдера |
| Universal Links | Статический AASA на breath.space |
<!-- @end -->
