# Архитектура

Главный модуль — `runNativePipeline({ operation, slug })`. Он скрывает порядок компиляции контракта, генерации, семантических аудитов, Xcode-сборки и съёмки. CLI и тестовый recording adapter проходят через один интерфейс.

Основной seam: `concept.json → compiled native manifest → SwiftUI adapter → Xcode app → verified captures`. HTML может находиться только слева от этого seam как материал для анализа. Ни один HTML-файл, CSS-токен или DOM-класс не попадает в build graph.

Reference profile — отдельный модуль продукта-референса. Он считается готовым только при наличии evidence, контракта, нативных токенов и Swift-рецептов. Мимикрия с незавершённым профилем блокируется компилятором.

`NativeVisualLanguage` — единственный environment seam в SwiftUI. За ним стоят два
реальных adapter: evidence-backed `vkReference` для мимикрии и `product` для
намеренной дифференциации. Screens читают semantic palette/spacing/metrics/type/icon
roles напрямую; compatibility-проекции `Theme` и `DvorStyle` удалены.

Граница пока не идеальна: часть экранов реализована вручную, поэтому декларация композиции ещё не полностью управляет View hierarchy. Следующее углубление модуля — реестр нативных component families и runtime-проверка соответствия фактического accessibility tree манифесту.
