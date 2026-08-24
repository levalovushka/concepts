# Нативные iOS-концепты

Это самостоятельный проект SwiftUI-концептов. Он не запускает HTML, не копирует DOM/CSS в приложение и не зависит от launcher/kernel старой платформы.

## Один вход

```sh
npm test
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

`concepts/<slug>/concept.json` — продуктовый контракт. `native/apps/<slug>` — его SwiftUI-адаптер. Генерируемый Xcode-проект и снимки находятся в игнорируемых `native/build` и `native/artifacts`.

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
- `docs/` — актуальные правила переноса, качества и профилей.

Старый `platform/` остаётся снаружи как архив и источник миграционных свидетельств. Он не является зависимостью этого проекта.
