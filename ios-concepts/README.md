# Нативные iOS-концепты

Это самостоятельный проект SwiftUI-концептов. Он не запускает HTML, не копирует DOM/CSS в приложение и не зависит от launcher/kernel старой платформы.

[![Скачать Camo для macOS](https://img.shields.io/badge/Скачать_Camo-для_macOS-0A84FF?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/levalovushka/concepts/releases/latest/download/Camo-macOS.zip)

Лаунчер показывает нативные концепты, разбитую по разделам документацию и исходные файлы. Публичная сборка публикуется только после подписи Developer ID и нотариализации Apple; инструкция для релиз-инженера — [launcher/RELEASE.md](launcher/RELEASE.md).

## Один вход

```sh
npm test
npm run factory:run -- native/fixtures/product-factory/request.example.json --adapter path/to/factory-pipeline-adapter.mjs --out path/to/artifacts
npm run factory:develop -- native/fixtures/product-factory/request.example.json --adapter path/to/factory-adapter.mjs --out path/to/product-development.json
npm run factory:experience -- path/to/factory-artifact.json --adapter path/to/experience-adapter.mjs --out path/to/experience-contract.json
npm run factory:visual -- path/to/factory-artifact.json path/to/experience-contract.json --adapter path/to/visual-adapter.mjs --out path/to/visual-development.json
npm run factory:release -- path/to/factory-artifact.json path/to/experience-contract.json path/to/visual-development.json --adapter path/to/release-adapter.mjs --out path/to/release-receipt.json
npm run product:develop -- path/to/brief.json --adapter path/to/real-adapter.mjs --out path/to/development.json
npm run product:verify -- path/to/development.json
npm run product:gate -- dvor
npm run docs -- dvor
npm run check -- dvor
npm run build -- dvor
npm run capture -- dvor
npm run release -- dvor
npm run smoke -- looks
npm run check:all
npm run isolation
npm run profiles
npm run matrix
npm run readiness
npm run readiness:gate
npm run launcher
```

Канонический новый вход — короткий Factory Request: тема, целевой продукт и
стратегия. Аудиторию, ситуации и World Models выводит generator, а отдельный
evaluator независимо оценивает пять proposals. Permission profile компилируется
из capability-to-action bindings выбранного продукта. Контракт и пример —
[docs/PRODUCT-FACTORY-CONTRACT.md](docs/PRODUCT-FACTORY-CONTRACT.md).

Основной поток запускается одной командой `factory:run` и сохраняет пять
физически разделённых артефактов: запрос, product development, Experience
Contract, visual development и release. Поэтапные команды остаются открытыми
для диагностики конкретного seam.

Старый `product:develop` остаётся compatibility interface для уже созданных
Product Brief и воспроизводимых fixtures.

Для нового продукта входом служит Product Brief: adapter реальной модели выдаёт несколько кандидатов, fail-closed stress test формирует Selection Receipt и только победитель становится каноническим Product Contract. Полный контракт — [docs/PRODUCT-MATURITY.md](docs/PRODUCT-MATURITY.md).

Между Product Contract и SwiftUI обязателен канонический UX Specification: граф, состояния/переходы, semantic design roles, localization catalog, acceptance scenarios и fixtures. Полностью — [docs/UX-SPECIFICATION.md](docs/UX-SPECIFICATION.md).

`concepts/<slug>/concept.json` связывает воспроизводимый Product Development artifact,
канонический Product Contract и явную UX Specification с delivery-спекой поверхностей.
`native/apps/<slug>` — его SwiftUI-адаптер. Генерируемый Xcode-проект и снимки
находятся в игнорируемых `native/build` и `native/artifacts`. Looks/Dvor и
перенесённые из web evidence Tails/Today/Nakat/Peresmenka содержат курируемые
портфели из трёх кандидатов; их evidence честно отделяет принятое продуктовое
направление и наблюдаемую реализацию от ещё не проведённого market research.

Оставшиеся концепты семейства `vkontakte` можно воспроизводимо обновить только
через optional legacy evidence adapter с явным внешним входом:

```sh
npm run legacy:migrate:vk -- --legacy-root /path/to/legacy/platform
```

Normal pipeline не ищет соседний `platform/`. Adapter принимает только явно
указанный проверенный web concept и три курируемых продуктовых предложения;
HTML/CSS/DOM не входят в native contract.

Проверка сборки не объявляется визуальным ревью. Финальный выпуск требует свежих снимков всех состояний и отдельной оценки по продукту, композиции, консистентности, деталям и поведению.

`matrix` прогоняет Looks и Dvor как VK-mimicry на current и small-phone
симуляторах. `readiness` пишет машинный отчёт, а строгий `readiness:gate`
остаётся красным до независимого visual/product review, physical iPhone и
VoiceOver manual pass. Этот локальный отчёт игнорируется Git: canonical source
не хранит machine-local paths или устаревшие receipts.

## Структура

- `concepts/` — только нативные концепты и их контент.
- `native/DesignSystem/` — общие нативные примитивы.
- `native/Runtime/` — системные адаптеры iOS.
- `native/ReferenceProfiles/` — доказанные грамматики мимикрии.
- `native/VisualCalibrations/` — golden grammar и нативный baseline без переноса продуктовых шаблонов.
- `native/apps/` — продуктовые SwiftUI-модули.
- `native/lib/native-pipeline.mjs` — единый интерфейс пайплайна.
- `native/lib/project-paths.mjs` — project-root seam для всех рабочих и output paths.
- `native/gates/isolation.mjs` — executable isolation gate со standalone-copy прогоном.
- `native/legacy-adapter/` — единственный optional adapter к старым HTML-свидетельствам.
- `native/lib/product-maturity.mjs` — глубокий модуль brief → candidates → receipt → contract.
- `native/lib/factory-pipeline.mjs` — единый короткий interface нового потока.
- `native/lib/ux-specification.mjs` — глубокий UX compiler перед SwiftUI.
- `native/schemas/` — детерминированные схемы продуктового и UX seams.
- `docs/` — актуальные правила переноса, качества и профилей; индекс —
  [docs/README.md](docs/README.md).
- `launcher/` — самостоятельный macOS launcher для этой native-библиотеки.

Старый `platform/` остаётся снаружи как архив и может быть только явным входом
legacy adapter. Он не является зависимостью этого проекта; `ios-concepts/`
можно копировать и проверять отдельно.
