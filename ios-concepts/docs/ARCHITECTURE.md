# Архитектура

Главный delivery-модуль — `runNativePipeline({ operation, slug })`. Он скрывает порядок maturity gate, компиляции Product Contract и UX Specification, проверки developer docs, native delivery identity, генерации, семантических аудитов, Xcode-сборки и съёмки. CLI и тестовый recording adapter проходят через один интерфейс.

До него работает продуктовый глубокий модуль `developProductConcept({ brief, generator })`. Внешний интерфейс состоит из Product Brief и одного generator adapter; validation, Product Stress Test, hard gates, comparison, стабильный Selection Receipt и компиляция Product Contract скрыты внутри. Provider-neutral `createStructuredModelProductGenerator` и явный fixture adapter делают seam реальным, не подменяя модель фиктивной логикой.

Между Product Contract и SwiftUI стоит второй глубокий модуль `compileUXSpecification(concept, productContract)`. Он компилирует граф экранов, канонические состояния и переходы, tokens/component roles, localization catalog, acceptance DSL и deterministic fixtures. SwiftUI не дублируется в спеке и остаётся adapter/implementation layer; HTML mapping отсутствует полностью.

Основной seam: `Product Brief → Concept Candidates → selected Product Contract → UX Specification → compiled native manifest → SwiftUI adapter → Xcode app → verified captures`. HTML может находиться только слева от delivery seam как материал для анализа. Ни один HTML-файл, CSS-токен или DOM-класс не попадает в build graph.

Reference profile — отдельный модуль продукта-референса. Он считается готовым только при наличии evidence, контракта, нативных токенов и Swift-рецептов. Мимикрия с незавершённым профилем блокируется компилятором.

`verifyNativeDelivery(concept, appDirectory)` — малый внешний интерфейс границы между спекой и реальным продуктом. Он блокирует выпуск generic manifest renderer, чужие fixtures, нереализованные core surfaces и первый кадр без продуктового обещания. Для strategy `differentiation` использование VK shell является блокером; Today, Nakat и Peresmenka обязаны иметь собственную композицию. Tails, Looks и Dvor используют evidence-backed `vk-ios` только там, где их продуктовая модель естественно живёт в социальной ментальной модели.

`reviewProductUI({ concept, captures, reviewer })` — отдельный seam независимого критика. Без реального reviewer adapter он fail-closed; никакой фиктивный «модельный» verdict не генерируется. Одна провальная ось или blocker finding блокируют receipt без усреднения.

`NativeVisualLanguage` — единственный environment seam в SwiftUI. За ним стоят два
реальных adapter: evidence-backed `vkReference` для мимикрии и `product` для
намеренной дифференциации. Screens читают semantic palette/spacing/metrics/type/icon
roles напрямую; compatibility-проекции `Theme` и `DvorStyle` удалены.

Граница пока не идеальна: часть экранов реализована вручную, поэтому декларация композиции ещё не полностью управляет View hierarchy. Следующее углубление модуля — реестр нативных component families и runtime-проверка соответствия фактического accessibility tree манифесту.
