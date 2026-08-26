# Документация нативной фабрики

Нативный iOS-пайплайн изолирован от старой HTML-платформы. Начинать следует не
с `concept.json` и не со SwiftUI, а с короткого Factory Request.

## Маршрут чтения

1. [PRODUCT-FACTORY-CONTRACT.md](PRODUCT-FACTORY-CONTRACT.md) — что принимает и
   что обязана вернуть фабрика.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — глубокие модули, interfaces и seams.
3. [PRODUCT-MATURITY.md](PRODUCT-MATURITY.md) — кандидаты, maturity gates и
   Selection Receipt.
4. [UX-SPECIFICATION.md](UX-SPECIFICATION.md) — граф, состояния, строки,
   fixtures и сценарии приёмки.
5. [VISUAL-DIRECTION-CONTRACT.md](VISUAL-DIRECTION-CONTRACT.md) — три направления,
   калибровка, нативные рецепты и независимый visual critic.
6. [REFERENCE-PROFILES.md](REFERENCE-PROFILES.md) — готовность VK, VK Музыки,
   VK Видео и Одноклассников.
7. [QUALITY-GATES.md](QUALITY-GATES.md) — автоматические и независимые ворота.
8. [NATIVE-PIPELINE-REFACTOR.md](NATIVE-PIPELINE-REFACTOR.md) — текущее
   состояние рефакторинга.

`concepts/<slug>/docs/` — сгенерированная документация конкретного приложения.
Она не является документацией самого пайплайна.
