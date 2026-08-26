# Product Factory Contract

## Цель

Один короткий запрос должен приводить к работающему нативному приложению без
собственного backend: с обязательной авторизацией, локальной persistence,
достижимыми действиями, всеми состояниями, системными доступами, Xcode-проектом
и документацией разработчика.

Onboarding и App Store marketing materials не входят в delivery.

## Внешний interface

```json
{
  "schemaVersion": 1,
  "id": "style-community",
  "request": "Социальное приложение о цельных образах и ситуациях, в которых люди действительно их носят",
  "targetProduct": "vkontakte",
  "strategy": "mimicry",
  "preferences": ["Главная ценность должна быть понятна в первом экране"]
}
```

Обязательны только:

- тема и желаемая ценность в `request`;
- целевой продукт: `vkontakte`, `vk-music`, `vk-video` или `ok`;
- стратегия: `mimicry` или `differentiation`.

Пользователь не перечисляет аудиторию, запреты и системные доступы. Фабрика
сама выводит аудиторию и ситуации, а из `native/ProductTargets/catalog.json`
получает доступный capability pool — это не обязательный checklist.

Расширения и другие обязательства поставки принадлежат target profile, но
хранятся отдельно от системных доступов: Share Extension не маскируется под
permission и проверяется собственным delivery gate.

## Неподвижные инварианты

1. Сначала создаётся цельный продуктовый механизм, затем в него встраиваются
   доступы. Экран или функция только ради permission запрещены.
2. Системные возможности выбираются только после продуктового механизма. Их
   количество не повышает оценку; возможность без причинной связи с уже
   существующим core/supporting действием блокирует кандидат.
3. Авторизация обязательна во всех приложениях и сохраняет локальную сессию.
4. Собственного backend нет. Социальные и сетевые эффекты реализуются явными
   локальными demo adapters, сохраняются и имеют offline/error/retry состояния.
5. Мимикрия остаётся визуально и продуктово близкой к выбранному продукту.
   Наличие паттерна у референса не оправдывает ненужную функцию в концепте.
6. Отстройка строится преимущественно на системной навигации и нативных
   компонентах. Отличие создаётся продуктовой моделью и композицией.
7. Каждое действие приводит к route, mutation, persistence, permission request,
   системному handoff или явному failure/recovery outcome.
8. Для выпуска требуются loading, populated, empty, error, offline и применимые
   permission states с реалистичными данными.
9. Permission grant не является результатом действия. Каждый capability flow
   обязан выполнить системную операцию и записать результат в поле конкретной
   сущности; отказ ведёт в реально исполняемый fallback, а не только показывает toast.

## Запрещённая визуальная автоматика

- декоративные градиенты по умолчанию;
- цветные иконки-заглушки;
- пустые hero-карточки;
- универсальное «Готово» вместо продуктового результата;
- одинаковая карточная композиция у разных продуктов;
- случайные размеры, радиусы и цвета вне semantic visual language;
- компонент референса без естественного соответствия продуктовой сущности.

## Product seam

```text
Factory Request
  → inferred audience and situations
  → target-owned required permission profile
  → five product-first candidates
  → World Model per candidate (entities, relations, actions, rules, runtime)
  → capability-to-action binding audit
  → independent evidence and product evaluation
  → Selection Receipt
  → Product Contract
```

Внешний interface реализации:

```js
const result = await developProductFactory({ request, generator, evaluator });
```

`generator` создаёт discovery, пять proposals и их World Models, но не имеет
права возвращать permission grounding или stress scores. Отдельный `evaluator`
владеет оценками и получает все пять вариантов через отдельный model call.

Текущий `developProductConcept({ brief, generator })` остаётся внутренним
compatibility seam. Новый вызывающий код не должен собирать Product Brief руками.

World Model — источник истины до появления экранов. `domainGlossary`, дерево
навигации, action contracts, persistence и permission flows компилируются из
него; визуальная структура не имеет права изобретать новую продуктовую сущность
или действие. Каноническая схема: `native/schemas/world-model.schema.json`.

## Delivery seam

Целевой seam следующего этапа:

```text
Product Contract
  → selected World Model verification
  → Product Integrity / Experience Contract v2
    (auth, canonical content/media, navigation ownership, actions,
     semantic screen anatomy, per-screen states, acceptance journeys)
  → UX Specification
  → three Visual Direction candidates
  → selected Visual Direction Contract
  → proven composition/component recipes
  → generated SwiftUI hierarchy
  → interaction replay and captures
  → up to three independent critic/revision iterations
```

Product Integrity / Experience Contract находится до визуального проектирования
и не содержит цветов, иконок, SwiftUI types или геометрии. Это один глубокий
module вместо набора поздних эвристик. Он фиксирует достижимые поверхности,
связь с World Model actions, обязательную авторизацию, переходы, persistence,
девять канонических состояний, единые записи сущностей и владельцев медиа,
основные/вторичные точки входа, семантическую анатомию каждого экрана и минимум
три исполняемых acceptance journey. Renderer и vision-критик обязаны потребить
тот же контракт; свободно переименовать сущность, заменить её фотографию или
добавить конкурирующую кнопку после этой стадии нельзя.

Visual Direction — отдельный deep module: generator создаёт ровно три
направления, независимый evaluator оценивает каждую ось, а стабильный Selection
Receipt выбирает только вариант без оценки ниже 8,5. Полный контракт —
[VISUAL-DIRECTION-CONTRACT.md](VISUAL-DIRECTION-CONTRACT.md).

Новый release interface — `releaseFactoryProduct({ factoryArtifact,
experienceContract, visualDevelopment, renderer, critic, reviser })`. Renderer обязан снять каждый
применимый screen/state; critic не может усреднить провальную ось; reviser имеет
не более двух исправлений после первой сборки.

Внешний агрегирующий interface — `runFactoryPipeline({ request, adapters })`.
CLI `factory:run` останавливается на первом провальном seam и физически сохраняет
все успешно созданные предыдущие артефакты, поэтому диагностика не требует
повторять закрытые стадии.

Минимальный выпускной floor — 8,5/10 по каждой независимой продуктовой и
визуальной оси. Среднее не скрывает провал. После трёх неуспешных итераций
фабрика останавливается с адресными blockers, а не продолжает бесконечную
косметическую переработку.

## Throughput benchmark

`npm run factory:benchmark -- <request.json> --adapter <adapter.mjs> --out <dir>`
делает cold-start прогон и сохраняет `06-benchmark.json`. Метрика включает
wall-clock, длительность каждой стадии, число автоматических ревизий и число
ручных вмешательств. Успешным считается только новый концепт, который с короткого
запроса дошёл до Xcode-проекта, двух device matrices, документации и clean
product/UI receipt при `manualInterventions = 0`. Любая ручная правка продукта,
SwiftUI, текстов или визуальной системы обнуляет результат прогона.

## Reference readiness

Обычный VK имеет evidence-backed profile. VK Музыка, VK Видео и
Одноклассники остаются fail-closed для мимикрии до появления собственных
снимков, mental model, visual contract, tokens и native recipes. Отстройка для
этих target products может исследоваться раньше, но не объявляется проверенной
мимикрией.
