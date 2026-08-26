# Camo — лаунчер концептов (macOS)

Держит библиотеку концептов, собирает и запускает их в симуляторе, показывает
документацию и снимки экранов.

```bash
npm run launcher
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Debug \
  -derivedDataPath LocalDerivedData CODE_SIGNING_ALLOWED=NO build
open LocalDerivedData/Build/Products/Debug/Camo.app
```

## Что внутри

| Раздел | Что показывает |
|---|---|
| Обзор | режим (мимикрия / отстройка), целевой набор, счётчики |
| Доступы | таблица `permissions[]` из спеки: ключ, фича, экран, риск, ключ Info.plist |
| Экраны | снимки из `native/artifacts/<slug>/shots` |
| Документы | отдельные тематические Markdown-файлы; читается только выбранный файл |
| Файлы | исходники концепта, сгенерированный Xcode-проект и текстовый preview |
| Журнал | вывод сборки в реальном времени |

Кнопка **Запустить** делает полный цикл: `gen-project.mjs` → `xcodebuild` →
`simctl install` → `simctl launch`, с выбором устройства.

Библиотека читает только корень repository: путь можно задать через
`IOS_CONCEPTS_ROOT` или выбрать в настройках. `concept.json` — источник правды,
а launcher не обращается к legacy `platform/`.

## Распространение

Локальная сборка без песочницы запускает `xcrun` и `simctl` напрямую. Для
TestFlight генерируется отдельная песоченная конфигурация: она содержит полный
Developer Kit, позволяет скачать документацию и исходники, а запуск передаёт
в Xcode. Подробности и команды — в [TESTFLIGHT.md](TESTFLIGHT.md).

Публичный ZIP для кнопки в корневом README собирается fail-closed командой
`npm run launcher:package`. Полная инструкция — в [RELEASE.md](RELEASE.md).

Схема прямого распространения локального runner:

1. **Developer ID Application** — подпись сертификатом аккаунта разработчика.
2. **Hardened Runtime** включён (`ENABLE_HARDENED_RUNTIME = YES`), песочница
   выключена в `Camo.entitlements`.
3. **Нотаризация** через `notarytool`, затем `stapler staple`.
4. **Обновления** — свой appcast: приложение читает манифест версий и предлагает
   обновиться (`Updater.swift`). Подключение Sparkle — следующий шаг, схема та же:
   Sparkle читает тот же appcast и ставит обновление сам.

Ручные команды заменены одним скриптом, который проверяет подпись,
нотариализацию, stapling и Gatekeeper до создания финального ZIP.

`appcast.json` публикуется рядом со сборкой:

```json
{ "version": "1.1", "notes": "Что нового", "url": "https://…/Camo-1.1.zip" }
```

Адрес манифеста задаётся в `Updater.appcastURL` — заменить на свой перед релизом.
