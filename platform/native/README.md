# Нативный контур (пайплайн v4)

`concept.json` → SwiftUI Xcode-проект → сборка в симуляторе. Реализация направления из
[../../PIPELINE-V4.md](../../PIPELINE-V4.md).

```
Kernel/      SwiftUI-ядро (рукописное, под iOS — не зеркало base.css)
gen/         генератор: concept.json → Xcode-проект
build/       сгенерированные проекты (в .gitignore, не коммитятся)
```

## Собрать концепт

```bash
node native/gen/gen-content.mjs petlya    # concept.json + content.domain.json -> content.json
node native/gen/gen-app.mjs petlya        # content.json -> Xcode-проект
cd native/build/petlya
xcodebuild -project Petlya.xcodeproj -target Petlya -sdk iphonesimulator -configuration Debug build
```

## Как собирается контент (шаг A: уйти от ручной работы)

`gen-content.mjs` выводит `content.json` из спеки, разделяя по риску:

- **Детерминированно из `concept.json`:** выбор layout'а по роли экрана и всё
  наполнение экранов, несущих доступы — «Материалы» проекта, «Настройки»,
  «Реклама/ATT», «Съёмка», «Устройства», «Магазины». Строится из `permissions[]`
  (жест → заголовок, фича → подпись, иконка по ключу, target → переход) и
  `appStore`. Технический жаргон (`PiP`, `Bonjour`, `IDFA`) вычищается санитайзером.
- **Домен из `content.domain.json`:** только то, что нельзя вывести — названия
  уроков, счётчик рядов, заметки, магазины. Маленький файл; его пишет автор или
  генерирует LLM из продуктовых полей спеки (`product`, `appStore.description`).

Разработчик правит спеку и крошечный доменный файл — полный `content.json` со
всей разводкой доступов и навигации собирается сам. `content.json` — артефакт
сборки, в git не коммитится.

Запуск в симуляторе:

```bash
xcrun simctl boot "iPhone 17 Pro"
APP=$(find native/build/petlya -name "*.app" -type d | head -1)
xcrun simctl install "iPhone 17 Pro" "$APP"
xcrun simctl launch "iPhone 17 Pro" com.camo.petlya
```

## Что детерминированно (кодом), что — агентом

- **Кодом:** `Info.plist` из `permissions[]` дословно, слой доступов (реальные iOS API), навигация
  (`TabView`/`NavigationStack`/`.sheet`/`.fullScreenCover`) из типов экранов, вход, токены.
- **Агентом (следующий шаг):** тела экранов — сейчас `ScreenScaffold` рендерит каркас из спеки
  (заголовок, точки запроса доступов, переходы, fallback). Наполнение заменяется под ворота.

## Разделение мимикрии и отстройки

`positioning.mode` прокидывается в `AppSpec.mode`. `differentiation` — своя визуальная система
(как «Петля»). `mimicry` — почти полная визуальная копия сервиса ВК: применяется визуальный
архетип референса (`referenceArchetype` = targetSet). Архетипы под мимикрию — следующий шаг.

## Ядро (SwiftUI)

| Файл | Что |
|---|---|
| `Tokens.swift` | акцент, сетка 16/44/72, цвет из HEX |
| `Components.swift` | `Row`, `SectionCard`, `Placeholder`, `DownloadRow` |
| `Model.swift` | `AppSpec` — то, что описано в concept.json |
| `Permissions.swift` | `PermissionManager` поверх реальных iOS API + журнал промптов |
| `Router.swift` | навигация из типов экранов |
| `Screen.swift` | `PermissionGate`, `ScreenScaffold` (data-driven экран) |
| `AuthFlow.swift` | вход номер/почта → код, один на все концепты |
| `AppShell.swift` | вход → TabView + NavigationStack на вкладку |
