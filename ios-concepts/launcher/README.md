# Camo — лаунчер концептов (macOS)

Держит библиотеку концептов, собирает и запускает их в симуляторе, показывает
документацию и снимки экранов.

```bash
npm run launcher
cd launcher/build
xcodebuild -project Camo.xcodeproj -target Camo -configuration Debug build
open build/Debug/Camo.app
```

## Что внутри

| Раздел | Что показывает |
|---|---|
| Обзор | режим (мимикрия / отстройка), целевой набор, счётчики |
| Доступы | таблица `permissions[]` из спеки: ключ, фича, экран, риск, ключ Info.plist |
| Экраны | снимки из `native/artifacts/<slug>/shots` |
| Документы | доки концепта в Markdown |
| Журнал | вывод сборки в реальном времени |

Кнопка **Запустить** делает полный цикл: `gen-project.mjs` → `xcodebuild` →
`simctl install` → `simctl launch`, с выбором устройства.

Библиотека читает только корень `ios-concepts/`: путь можно задать через
`IOS_CONCEPTS_ROOT` или выбрать в настройках. `concept.json` — источник правды,
а launcher не обращается к legacy `platform/`.

## Распространение: почему не Mac App Store

**Лаунчер не может жить в Mac App Store.** Песочница, обязательная для MAS,
запрещает запускать `xcrun` и `simctl` — а без них лаунчер бессмыслен: он именно
для того и нужен, чтобы собирать и гонять концепты в симуляторе.

Рабочая схема:

1. **Developer ID Application** — подпись сертификатом аккаунта разработчика.
2. **Hardened Runtime** включён (`ENABLE_HARDENED_RUNTIME = YES`), песочница
   выключена в `Camo.entitlements`.
3. **Нотаризация** через `notarytool`, затем `stapler staple`.
4. **Обновления** — свой appcast: приложение читает манифест версий и предлагает
   обновиться (`Updater.swift`). Подключение Sparkle — следующий шаг, схема та же:
   Sparkle читает тот же appcast и ставит обновление сам.

```bash
# подпись и нотаризация релиза
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Release archive \
  -archivePath Camo.xcarchive
xcodebuild -exportArchive -archivePath Camo.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath export
xcrun notarytool submit export/Camo.zip --keychain-profile CAMO --wait
xcrun stapler staple export/Camo.app
```

`appcast.json` публикуется рядом со сборкой:

```json
{ "version": "1.1", "notes": "Что нового", "url": "https://…/Camo-1.1.zip" }
```

Адрес манифеста задаётся в `Updater.appcastURL` — заменить на свой перед релизом.
