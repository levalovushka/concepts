# Camo Native Concept Pipeline v2

> Этот README описывает ветку `codex/native-concept-pipeline-v2`.

Ветка содержит pipeline для разработки настоящих SwiftUI-концептов под заданный
набор iOS-доступов. Он проверяет продуктовую модель и платформенные факты, но не
генерирует интерфейс из шаблонов: навигация, композиция экранов и визуальный язык
пишутся для каждого приложения вручную.

Текущий эталон — **«Полка»**, социальное приложение в грамматике ВКонтакте для
передачи вещей между друзьями. В нём 9 продуктовых экранов и все 22 доступа
набора `vkontakte`, распределённые по достижимым фичам.

## Главное за минуту

```text
platform/concepts/<slug>/concept.json
          │
          ├── npm run spec ──→ UX-спека и проверки продукта
          │
          ├── npm run app ───→ Info.plist, entitlements, fixtures, Xcode project
          │
platform/native-apps/<slug>/Sources/*.swift
          │
          └── npm run app:run → сборка, установка и запуск в Simulator
```

Seam нового pipeline проходит между продуктовым контрактом и интерфейсом:

- `concept.json` отвечает, **что существует в продукте**;
- authored SwiftUI отвечает, **как продукт устроен и выглядит**;
- native platform отвечает, **как приложение собирается и работает с iOS**.

Генератора экранов, screen recipes и обязательного общего UI kit в активном
нативном пути нет.

## Что есть в репозитории

| Путь | Назначение | Править руками |
|---|---|---|
| `platform/concepts/<slug>/concept.json` | Модель мира, действия, экраны, переходы, доступы, acceptance и fixtures | Да |
| `platform/native-apps/<slug>/Sources/` | Авторский SwiftUI конкретного продукта | Да |
| `platform/native-runtime/` | Общие реальные adapters системных доступов | При добавлении capability |
| `platform/native/capability-map.json` | Plist, entitlements, background modes и frameworks | При добавлении capability |
| `platform/scripts/ux-spec.mjs` | Проверка и компиляция продуктового контракта | Обычно нет |
| `platform/scripts/build-app.mjs` | Генерация Xcode-проекта и platform configuration | Обычно нет |
| `platform/scripts/run-app.mjs` | Сборка, установка и запуск в Simulator | Обычно нет |
| `platform/native-dist/<slug>/` | Сгенерированный Xcode-проект и build-продукты | Нет, каталог игнорируется Git |
| `ios-concepts/launcher/` | macOS-лаунчер библиотеки концептов | При развитии лаунчера |
| `permission-sets/` | Исходные наборы iOS-доступов | При изменении задания |
| `platform/kernel/` и HTML старых концептов | Существующая браузерная витрина | Не участвуют в новом SwiftUI UI |

Предыдущий нативный pipeline «Эстафеты» из `ios-concepts/native/` удалён. Старые
Product Blueprint, Product UI Contract и Native Kernel больше не являются
публичными интерфейсами ветки.

## Текущие нативные приложения

| Приложение | Слаг | Состояние | Экраны | Доступы |
|---|---|---|---:|---:|
| Полка | `polka` | основной эталон pipeline | 9 | 22/22 |
| Двор | `dvor` | перенесённый authored SwiftUI | 29 | 20/20 |

- [`platform/native-apps/polka`](platform/native-apps/polka) — UI «Полки»;
- [`platform/concepts/polka/concept.json`](platform/concepts/polka/concept.json) — её продуктовый контракт;
- [`platform/native-apps/dvor`](platform/native-apps/dvor) — UI «Двора».

## Требования

- macOS;
- Xcode 26 с установленным iOS Simulator;
- Node.js 20 или новее;
- симулятор `iPhone 17 Pro` либо имя устройства в `CAMO_DEVICE`.

Для нативной сборки npm-зависимости не нужны. Playwright нужен только старой
браузерной витрине.

## Собрать и запустить приложение

Все команды выполняются из `platform/`:

```bash
cd platform

# Проверить продуктовый граф и coverage доступов
npm run spec -- polka

# Создать platform/native-dist/polka/polka.xcodeproj
npm run app -- polka

# Собрать, установить и открыть приложение в Simulator
npm run app:run -- polka
```

Другой симулятор и детерминированные ветки доступов:

```bash
CAMO_DEVICE="iPhone 17 Pro Max" npm run app:run -- polka
npm run app:run -- polka -grant:camera,photos
npm run app:run -- polka -deny:location
```

Launch arguments выбирают предсказуемый adapter для демонстрации и визуальной
приёмки. В обычном запуске используются системные APIs там, где они доступны;
фиктивного успеха по умолчанию нет.

## Добавить новое нативное приложение

1. Создать `platform/concepts/<slug>/concept.json`.
2. Описать модель мира и действия, затем экраны, переходы и acceptance-сценарии.
3. Связать каждый capability с действием, экраном, жестом и fallback.
4. Выполнить `npm run spec -- <slug>` и закрыть все `gaps`.
5. Создать `platform/native-apps/<slug>/Sources/` и спроектировать SwiftUI с нуля.
6. Подключать доступы через authored `Access`, а не техническую витрину кнопок.
7. Выполнить `npm run app:run -- <slug>`, пройти сценарии и проверить UI глазами.

Минимальный interface нового приложения — продуктовый контракт и каталог
SwiftUI-исходников. Xcode project, plist, entitlements и fixtures руками не
создаются.

## Как проверяются доступы

`npm run app -- <slug>` работает fail-closed. Для каждого ключа он проверяет:

1. capability есть в `concept.json` и связан с действием модели мира;
2. ключ объявлен в authored `Access` приложения;
3. SwiftUI вызывает его из продуктовой фичи;
4. `AccessRuntime` содержит явный adapter;
5. `capability-map.json` знает необходимые platform facts.

Ожидаемый результат для «Полки»:

```text
screens: 9
permissions: 22
coveredCapabilities: 22
usageKeys: 9
entitlements: 8
backgroundModes: remote-notification, fetch, audio, voip
UX gaps: 0
```

APNs, Universal Links/AASA, Wi-Fi Info, Hotspot Configuration и некоторые
entitlements окончательно проверяются только на подписанном физическом устройстве.

## macOS-лаунчер

Лаунчер читает тот же `platform/concepts`, собирает тот же
`platform/native-apps` и запускает проекты из `platform/native-dist`. Отдельного
скрытого pipeline у него нет.

```bash
cd ios-concepts
npm run launcher
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Debug \
  -derivedDataPath LocalDerivedData CODE_SIGNING_ALLOWED=NO build
open LocalDerivedData/Build/Products/Debug/Camo.app
```

Если корень не найден автоматически, задайте
`CAMO_REPOSITORY_ROOT=/path/to/concepts`.

- [`ios-concepts/launcher/README.md`](ios-concepts/launcher/README.md) — работа лаунчера;
- [`ios-concepts/launcher/RELEASE.md`](ios-concepts/launcher/RELEASE.md) — подписанный релиз;
- [`ios-concepts/launcher/TESTFLIGHT.md`](ios-concepts/launcher/TESTFLIGHT.md) — каталог для TestFlight.

## Проверки перед коммитом

Нативное приложение:

```bash
cd platform
npm run spec -- <slug>
npm run app -- <slug>
npm run app:run -- <slug>
npm run test:spec
```

Лаунчер:

```bash
cd ios-concepts
npm run check
xcodebuild -project launcher/build/Camo.xcodeproj -scheme Camo \
  -configuration Debug -derivedDataPath launcher/build/LocalDerivedData \
  CODE_SIGNING_ALLOWED=NO build
```

`npm run check` внутри `platform/` проверяет весь исторический портфель, включая
HTML-концепты. Readiness-ошибки незавершённых старых концептов не означают сбой
нативной сборки; новый нативный контур проверяется командами выше.

## Документация

- [`platform/NATIVE-PIPELINE-V2-CHANGES.md`](platform/NATIVE-PIPELINE-V2-CHANGES.md) — отличие от «Эстафеты»;
- [`platform/native-apps/README.md`](platform/native-apps/README.md) — правила authored SwiftUI;
- [`platform/CONTEXT-MAP.md`](platform/CONTEXT-MAP.md) — продуктовые контексты;
- [`PLAYBOOK.md`](PLAYBOOK.md) — методика работы с наборами доступов;
- [`platform/README.md`](platform/README.md) — документация браузерной витрины.

## Архитектурный принцип

Pipeline успешен не тогда, когда генерирует больше Swift-кода, а когда новый
продукт можно свободно спроектировать и визуально довести, не меняя генератор
экранов.

Если меняется продукт — правятся `concept.json` и authored SwiftUI. Если
добавляется системный capability — один раз расширяются platform map и runtime
adapter. Так сложность iOS-сборки остаётся внутри глубокого native platform
module, а его interface остаётся маленьким.
