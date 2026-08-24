# Нативные iOS-концепты

Это самостоятельный проект SwiftUI-концептов. Он не запускает HTML, не копирует DOM/CSS в приложение и не зависит от launcher/kernel старой платформы.

## Один вход

```sh
npm test
npm run product:develop -- path/to/brief.json --adapter path/to/real-adapter.mjs --out path/to/development.json
npm run product:verify -- path/to/development.json
npm run product:gate -- dvor
npm run docs -- dvor
npm run check -- dvor
npm run build -- dvor
npm run capture -- dvor
npm run smoke -- looks
npm run check:all
npm run profiles
npm run matrix
npm run readiness
npm run readiness:gate
```

Для нового продукта входом служит Product Brief: adapter реальной модели выдаёт несколько кандидатов, fail-closed stress test формирует Selection Receipt и только победитель становится каноническим Product Contract. Полный контракт — [docs/PRODUCT-MATURITY.md](docs/PRODUCT-MATURITY.md).

Между Product Contract и SwiftUI обязателен канонический UX Specification: граф, состояния/переходы, semantic design roles, localization catalog, acceptance scenarios и fixtures. Полностью — [docs/UX-SPECIFICATION.md](docs/UX-SPECIFICATION.md).

`concepts/<slug>/concept.json` связывает воспроизводимый Product Development artifact,
канонический Product Contract и явную UX Specification с delivery-спекой поверхностей.
`native/apps/<slug>` — его SwiftUI-адаптер. Генерируемый Xcode-проект и снимки
находятся в игнорируемых `native/build` и `native/artifacts`. Looks/Dvor содержат
курируемые портфели из трёх кандидатов; их evidence честно отделяет принятое
продуктовое направление и наблюдаемую реализацию от ещё не проведённого market research.

Проверка сборки не объявляется визуальным ревью. Финальный выпуск требует свежих снимков всех состояний и отдельной оценки по продукту, композиции, консистентности, деталям и поведению.

`matrix` прогоняет Looks и Dvor как VK-mimicry на current и small-phone
симуляторах. `readiness` пишет машинный отчёт, а строгий `readiness:gate`
остаётся красным до независимого visual/product review, physical iPhone и
VoiceOver manual pass.

## Структура

- `concepts/` — только нативные концепты и их контент.
- `native/DesignSystem/` — общие нативные примитивы.
- `native/Runtime/` — системные адаптеры iOS.
- `native/ReferenceProfiles/` — доказанные грамматики мимикрии.
- `native/apps/` — продуктовые SwiftUI-модули.
- `native/lib/native-pipeline.mjs` — единый интерфейс пайплайна.
- `native/lib/product-maturity.mjs` — глубокий модуль brief → candidates → receipt → contract.
- `native/lib/ux-specification.mjs` — глубокий UX compiler перед SwiftUI.
- `native/schemas/` — детерминированные схемы продуктового и UX seams.
- `docs/` — актуальные правила переноса, качества и профилей.

Старый `platform/` остаётся снаружи как архив и источник миграционных свидетельств. Он не является зависимостью этого проекта.
