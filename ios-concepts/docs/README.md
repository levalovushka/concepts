# Документация нативной фабрики

Нативный iOS-пайплайн изолирован от старой HTML-платформы. Начинать следует не
с `concept.json` и не со SwiftUI, а с короткого Factory Request.

## Маршрут чтения

1. [IOS-PIPELINE-GUIDE.md](IOS-PIPELINE-GUIDE.md) — практический путь от короткого
   запроса до Xcode build, captures, visual review и developer handoff.
2. [PRODUCT-FACTORY-CONTRACT.md](PRODUCT-FACTORY-CONTRACT.md) — что принимает и
   что обязана вернуть фабрика.
3. [ARCHITECTURE.md](ARCHITECTURE.md) — глубокие модули, interfaces и seams.
4. [PRODUCT-MATURITY.md](PRODUCT-MATURITY.md) — кандидаты, maturity gates и
   Selection Receipt.
5. [UX-SPECIFICATION.md](UX-SPECIFICATION.md) — граф, состояния, строки,
   fixtures и сценарии приёмки.
6. [VISUAL-DIRECTION-CONTRACT.md](VISUAL-DIRECTION-CONTRACT.md) — три направления,
   калибровка, нативные рецепты и независимый visual critic.
7. [REFERENCE-PROFILES.md](REFERENCE-PROFILES.md) — готовность VK, VK Музыки,
   VK Видео и Одноклассников.
8. [QUALITY-GATES.md](QUALITY-GATES.md) — автоматические и независимые ворота.
9. [NATIVE-PIPELINE-REFACTOR.md](NATIVE-PIPELINE-REFACTOR.md) — текущее
   состояние рефакторинга.

`concepts/<slug>/docs/` — сгенерированная документация конкретного приложения.
Она не является документацией самого пайплайна.
