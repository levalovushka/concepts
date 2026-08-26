# Архитектура

Основной путь для нового iOS-концепта — `runLeanNativeFactory({ request, architect, builder, reviewer })`.
Он создаёт один Product Blueprint, детерминированно привязывает его к Reference UI kit,
один раз собирает SwiftUI и один раз проверяет реальные пиксели/действия. Модуль не
перегенерирует всё при локальной ошибке. Полный контракт описан в `docs/LEAN-NATIVE-FACTORY.md`.

Описанный ниже `runFactoryPipeline` сохранён как compatibility interface для старых
артефактов и воспроизводимых аудитов; он не является default entrypoint.

Главный delivery-модуль — `runNativePipeline({ operation, slug })`. Он скрывает порядок maturity gate, компиляции Product Contract и UX Specification, проверки developer docs, native delivery identity, генерации, семантических аудитов, Xcode-сборки и съёмки. CLI и тестовый recording adapter проходят через один интерфейс.

Внешний seam всего проекта — команды `test`, `check`, `build`, `capture`,
`release`, `launcher`. Их рабочий каталог и все generated/build/artifact paths
разрешаются через корень repository; module не предполагает форму или даже
наличие родительского репозитория. `npm run isolation` проверяет этот interface и
повторяет `npm test` + non-Xcode `check:all` в отдельной копии без `platform/`.

Новый внешний продуктовый seam — `developProductFactory({ request, generator, evaluator })`.
Factory Request содержит только тему, target product и стратегию. Модуль выводит
аудиторию/ситуации, строит World Model, компилирует принадлежащий target product
permission profile из capability bindings и отдаёт пять proposals отдельному
evaluator до сравнительного отбора.

Следующий глубокий module — `developExperienceContract({ factoryArtifact,
planner })`. Его interface скрывает проверку выбранной World Model,
авторизации, достижимости графа, action ownership, persistence, permission
fallbacks и полного screen-state matrix. Визуальный слой не может добавлять
новые продуктовые действия после этого seam.

`developVisualDirection` — отдельный глубокий module между Experience Contract
и renderer. Он скрывает три варианта, независимое сравнение, calibration catalog,
семантические токены, icon policy и полные экранные component recipes.

Новый factory release изолирован от legacy-команды `release` и проходит через
`releaseFactoryProduct({ factoryArtifact, experienceContract, visualDevelopment,
renderer, critic, reviser })`: свежая сборка и полный capture matrix проверяются до независимого
review, а заблокированная версия пересобирается не более двух раз.

`runFactoryPipeline({ request, adapters })` — единый внешний deep interface.
Он последовательно закрывает product → experience → visual → release и не
позволяет adapter пропустить промежуточный verifier.

Существующие приложения входят через отдельный adoption seam, а не через
неявную конвертацию. `native/FactoryAdoption/catalog.json` фиксирует порядок и
исходные Product Contract ids. Пока полный набор из пяти factory-артефактов не
прошёл release, compatibility source нельзя изменять или помечать factory-native.
«Двор» идёт первым; «Образы» остаются visual calibration source; «Сегодня» и
«Накат» требуют продуктовой переработки и не считаются golden concepts.

Существующий глубокий модуль `developProductConcept({ brief, generator })`
остаётся внутри как compatibility interface для уже зафиксированных Product
Brief. Validation, Product Stress Test, hard gates, comparison, стабильный
Selection Receipt и компиляция Product Contract скрыты за этими interfaces.
Provider-neutral structured-model adapters и явные fixture adapters делают
seams реальными, не подменяя модель фиктивной логикой.

Между Product Contract и SwiftUI стоит второй глубокий модуль `compileUXSpecification(concept, productContract)`. Он компилирует граф экранов, канонические состояния и переходы, tokens/component roles, localization catalog, acceptance DSL и deterministic fixtures. SwiftUI не дублируется в спеке и остаётся adapter/implementation layer; HTML mapping отсутствует полностью.

Основной seam: `Product Brief → Concept Candidates → selected Product Contract → UX Specification → compiled native manifest → SwiftUI adapter → Xcode app → verified captures`. HTML может находиться только слева от delivery seam как материал для анализа. Ни один HTML-файл, CSS-токен или DOM-класс не попадает в build graph.

Legacy evidence — отдельный optional adapter за `--legacy-root`. Только его
entrypoints могут читать старый concept tree. Normal delivery module не импортирует
adapter, а canonical media, нужные для сборки, vendored внутри `concepts/`.

Reference profile — отдельный модуль продукта-референса. Он считается готовым только при наличии evidence, контракта, нативных токенов и Swift-рецептов. Мимикрия с незавершённым профилем блокируется компилятором.

`verifyNativeDelivery(concept, appDirectory)` — малый внешний интерфейс границы между спекой и реальным продуктом. Он блокирует выпуск generic manifest renderer, чужие fixtures, нереализованные core surfaces и первый кадр без продуктового обещания. Для strategy `differentiation` использование VK shell является блокером; Today, Nakat и Peresmenka обязаны иметь собственную композицию. Tails, Looks и Dvor используют evidence-backed `vk-ios` только там, где их продуктовая модель естественно живёт в социальной ментальной модели.

`reviewProductUI({ concept, captures, reviewer })` — отдельный seam независимого критика. Без реального reviewer adapter он fail-closed; никакой фиктивный «модельный» verdict не генерируется. Одна провальная ось или blocker finding блокируют receipt без усреднения.

`NativeVisualLanguage` — единственный environment seam в SwiftUI. За ним стоят два
реальных adapter: evidence-backed `vkReference` для мимикрии и `product` для
намеренной дифференциации. Screens читают semantic palette/spacing/metrics/type/icon
roles напрямую; compatibility-проекции `Theme` и `DvorStyle` удалены.

Граница пока не идеальна: часть экранов реализована вручную, поэтому декларация композиции ещё не полностью управляет View hierarchy. Следующее углубление модуля — реестр нативных component families и runtime-проверка соответствия фактического accessibility tree манифесту.
