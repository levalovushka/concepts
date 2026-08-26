# Native Concept Pipeline v2

Native Pipeline v2 переносит процесс HTML-концептов в SwiftUI, не перенося их web-runtime. Модель помогает исследовать и конкретизировать продукт; Swift, маршруты, reducers, permission wiring, capture и XCUI компилируются детерминированно.

## Обычный режим: один глубокий модуль

Публичный интерфейс V2 принимает один `ConceptSpec` и возвращает готовый native
handoff. Product Core, capability grounding, slice/full contracts и Kernel
остаются внутренней реализацией: вызывающему коду не нужно знать их порядок или
подключать adapters.

```sh
npm run native:v2 -- native/ConceptSpecs/estafeta.json
```

После build, XCUI и screenshots в `native/artifacts/<id>/visual-review-request.json`
появляется короткий пакет для просмотра глазами. Он содержит только
реальные captures, карту продукта, 11 критериев и вопросы к ревьюеру.
Для пользователя это всё ещё один запуск: агент сам открывает captures, делает
один bounded repair и повторяет сборку. Формат `--review` остаётся внутренним протоколом
для CI и независимой release-приёмки:

```sh
npm run native:v2 -- native/ConceptSpecs/estafeta.json --review review.json
```

Для iteration нужно не меньше 8/10, для release — 8.5/10 по каждой оси, без
усреднения blockers. Release-review должен выполнить независимый человек или
vision-capable ревьюер. Неудачная проверка возвращает bounded repair brief; не более
двух итераций до повторной продуктовой развилки.
Операционный цикл агента закреплён в `native/AGENT-PIPELINE-V2.md`.

## Что перенесено из HTML-концептов

`native/lib/html-concept-patterns.mjs` извлекает не CSS, а продуктовые композиции:
социальный контекст перед лентой из VK/ОК-мимикрий, прогресс и сроки как факты,
continue-hero и постоянный media context из музыкальных концептов, а также цельный
media subject из видео-концептов. Отстройка делается предметной моделью и одним
узнаваемым domain component, а не случайным декором. SwiftUI recipes наследуют эти правила,
а review packet обязан проверить их по реальным экранам.

`capabilities: "all"` автоматически разворачивает полный набор выбранного
Product Target. Пользовательские разрешения получают контекстные действия,
lifecycle-возможности подключаются к приложению, build capabilities становятся
Info.plist, entitlements и extension targets. Документация выводится из того же
скомпилированного manifest.

## Внутренний порядок

1. Studio предлагает ровно три разных продуктовых механизма и отдельно оценивает каждый.
2. Пайплайн останавливается до явного выбора человеком.
3. Product Core v2 фиксирует аудиторию, ситуацию, проблему, механизм, сущности, действия, return loop, non-goals и трёхшаговое product proof. Экраны и permissions здесь запрещены.
4. Capability Plan связывает каждый доступ с существующим действием, сущностью, моментом запроса, platform effect, продуктовым outcome, fallback и granted/denied-тестом.
5. Experience Planner проектирует вертикальный срез `entry → action → result` с каноническим контентом и только применимыми состояниями.
6. Native Kernel компилирует SwiftUI из проверенных Looks/VK recipes. Модель не пишет shell, маршруты, reducers или permission code.
7. Xcode build, XCUI, screenshots и документация обязательны до review. Reviewer может вернуть типизированные blockers; разрешено не больше двух локальных ремонтов без регенерации Product Core.
8. Expander после принятого среза возвращает только типизированный Full Contract:
   пять root tabs, поверхности, владение действиями, journeys и capture matrix.
   Полный SwiftUI-код снова компилируется локальным Kernel v2, а не моделью.

Медиа не являются обязательным входом. Если изображений нет, медиа-зависимый
экран должен иметь детерминированный серый placeholder с понятным смыслом; это
проверяется до Swift и на visual review.

## Разрешения

`Permissions` отвечает только за authorization. Platform operation является отдельной частью capability binding. Например, камера после granted открывает `UIImagePickerController`, возвращает изображение и только затем выполняет `capture_result`. Denied сохраняет продуктовый fallback. XCUI проверяет обе ветки через тот же seam без управления приватным TCC-интерфейсом.

## Расширенный orchestrated-режим

Первый запуск возвращает три варианта и останавливается:

```sh
npm run native:v2:orchestrated -- request.json --adapter ./adapters.mjs --out native/artifacts/v2/exploration.json
```

После выбора:

```sh
npm run native:v2:orchestrated -- request.json --adapter ./adapters.mjs --select candidate-id --mode slice --out native/artifacts/v2/slice.json
```

Adapter module владеет только творческими seams: `studio`, `capabilityPlanner`,
`experiencePlanner`, `reviewer`, `repairer` и `expander`. CLI всегда подменяет
`kernel.buildSlice` и `kernel.buildFull` детерминированным локальным Kernel v2.

## Fail-closed правила

- Нельзя начать Swift до выбранного и проверенного Product Core.
- Permission не может изобрести сущность или отдельный «экран доступов».
- Один жест не владеет двумя capabilities.
- Screenshot без подтверждённого runtime state не считается evidence.
- Formatter не заменяет Xcode typecheck.
- Build без XCUI granted/denied и свежих captures не считается доставкой.
- На iOS 26 пять root tabs обязаны оставаться видимыми на root-экранах; на внутренних экранах они скрываются.
- Release без полного visual-review packet и независимой оценки всех captures запрещён.
- Существующий app directory без marker Native Pipeline v2 никогда не перезаписывается.
