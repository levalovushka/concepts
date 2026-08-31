# Quality pipeline v4: свободная генерация, строгая приёмка

Статус: implementation-ready proposal
Ветка: `codex/html-quality-pipeline`
Область: HTML-концепты. Native pipeline не входит в эту работу.

## 1. Зачем меняем пайплайн

Текущий pipeline хорошо проверяет полноту спеки, навигацию, разрешения, кликабельность и часть геометрии. Он не гарантирует, что результат является сильным продуктом и хорошо спроектированным мобильным интерфейсом.

Главный провал: зелёный технический check легко принимает аккуратно собранный, но безликий UI из одинаковых карточек, строк, divider и поясняющего текста. Поля `readiness.visualPasses` при этом являются самодекларацией, не связанной с фактически просмотренными PNG.

Новый pipeline должен одновременно:

- повышать продуктовую и интерфейсную планку;
- находить и устранять признаки нейрослопа;
- не диктовать автору композицию;
- не превращаться в новый генератор шаблонов;
- оставлять проверяемое доказательство реальной визуальной приёмки.

## 2. Основной принцип

> Генерация полностью свободна. Ограничивается не способ решения, а качество результата.

Pipeline не вводит обязательные:

- layout recipes глубже существующих семантических типов экрана;
- visual fingerprint;
- композиционные семейства;
- количество карточек, секций или экранов;
- долю fold для конкретного объекта;
- цветовую тему, радиусы или тип визуальной метафоры;
- обязательное отличие от портфеля ради самого отличия.

Автор может использовать divider, border, капс, асимметрию или необычную сетку, если они выглядят намеренно и улучшают интерфейс. Эвристика не имеет права самостоятельно запретить эстетическое решение.

## 3. Два независимых качества

### 3.1. Усиление

Критик обязан искать не только ошибки, но и упущенный потенциал:

- является ли концепт самостоятельным продуктом, а не одной фичей;
- понятны ли аудитория, ситуация и обещанный результат;
- есть ли честная причина вернуться;
- не раздут ли продукт лишними экранами и возможностями;
- естественно ли permissions следуют из действий;
- можно ли сократить путь к результату;
- выражает ли UI механизм продукта непосредственно;
- какие изменения дадут наибольший прирост полезности, ясности и характера.

Результат — конкретные opportunities, привязанные к продуктовым решениям и экранам. Общие советы вроде «улучшить иерархию» не принимаются.

### 3.2. Очистка

Критик и инструменты ищут дефекты исполнения:

- случайные divider и borders;
- рамку вокруг каждого смыслового блока и вложенные cards;
- капс вне настоящих аббревиатур;
- терминальную точку в коротких labels, headings, buttons, menu items и field labels;
- съезд с направляющих и случайные различия spacing;
- несовпадение baseline текста и иконок;
- формульную прозу и повторяющиеся карточки;
- декоративные pills, badges, gradients, shadows и акценты без функции;
- слабую иерархию, несколько равных primary actions;
- мелкий текст, плохой contrast, overflow, truncation и hit targets меньше 44 pt;
- пустые крупные контейнеры с объяснением интерфейса вместо полезного объекта;
- несогласованность одного и того же элемента между экранами.

## 4. Политика решений: ошибки, сигналы, критика

### 4.1. Hard failures

Машина блокирует только объективные ошибки:

- отсутствующий или недостижимый экран;
- поломанный сценарий;
- overflow и непредусмотренное truncation;
- недопустимый contrast;
- недоступный control или hit target меньше минимума;
- заявленный primary action отсутствует или неоднозначен;
- несовпадение root navigation;
- stale или неполное review evidence;
- открытый blocker/major после визуальной приёмки.

### 4.2. Heuristic signals

Эстетические признаки никогда не падают сами по себе. Детектор формирует сигнал с evidence:

- selector или фрагмент текста;
- экран;
- bounding box;
- computed styles;
- screenshot crop, если применимо;
- объяснение, почему сигнал подозрителен.

Примеры: `decorative-divider`, `border-pressure`, `nested-surfaces`, `all-caps-copy`, `terminal-control-period`, `alignment-drift`, `spacing-outlier`, `baseline-drift`, `effect-without-role`, `formula-copy`.

Визуальный критик переводит сигнал в одно из решений:

- `defect` — требуется исправление;
- `intentional` — решение полезно и остаётся, с коротким объяснением;
- `false-positive` — детектор ошибся, с данными для будущей настройки.

Так border в системном alert не запрещается, а декоративная сетка divider на главной не проходит незамеченной.

### 4.3. Visual and product judgment

Следующие вопросы решает критик, а не CSS-lint:

- понятен ли продукт за пять секунд;
- сильна ли визуальная и смысловая иерархия;
- выглядит ли контент настоящим;
- ощущается ли интерфейс собранным по направляющим;
- цельны ли типографика, поверхности, цвета и motion intent;
- похожи ли экраны на одно приложение;
- является ли UI выразителем продукта, а не набором универсальных блоков;
- выглядит ли результат зрелым мобильным интерфейсом.

## 5. Архитектура: один глубокий модуль приёмки

Новый модуль `quality-review` располагается на seam между собранным концептом и публикацией.

Его внешний interface намеренно мал:

```js
prepareQualityReview(slug, options?) => ReviewBundle
verifyQualityReview(slug, options?)  => QualityResult
```

CLI:

```bash
npm run review -- <slug>
npm run proof -- <slug>
```

`prepareQualityReview` скрывает внутри:

1. validate и build;
2. захват каждого экрана и contact sheet;
3. разделение product и auth/system surfaces;
4. существующие lint, geometry и flow audits;
5. новые visual-language detectors;
6. вычисление hashes входной спеки, HTML, CSS и PNG;
7. формирование review bundle.

`verifyQualityReview` скрывает внутри:

1. проверку полноты review;
2. проверку соответствия hashes текущей сборке;
3. проверку покрытия всех product screens;
4. проверку решений по heuristic signals;
5. проверку lifecycle всех defects;
6. отказ при открытых blocker/major;
7. передачу управления существующим proof/check.

Сложность не размазывается по `build.mjs`, `capture.mjs`, `proof.mjs` и агентским инструкциям. Эти инструменты вызывают один interface модуля.

## 6. Review bundle и evidence

Каждый запуск создаёт:

```text
concepts/<slug>/artifacts/quality/<run-id>/
  manifest.json
  product-contact-sheet.png
  system-contact-sheet.png
  screens/<screen-id>.png
  crops/<signal-id>.png
  automated-findings.json
  review.json
```

`manifest.json` содержит:

- slug и run id;
- commit и dirty-state marker;
- viewport/device configuration;
- hashes спеки, screen HTML, styles и каждого PNG;
- список product и system screens;
- версии detectors.

`review.json` содержит:

```json
{
  "runId": "...",
  "product": {
    "verdict": "revise",
    "strengths": [],
    "opportunities": [
      {
        "id": "product-01",
        "impact": "major",
        "problem": "Наблюдаемая проблема",
        "proposal": "Конкретное усиление",
        "evidenceScreens": ["home", "result"],
        "resolution": "implemented"
      }
    ]
  },
  "visual": {
    "verdict": "revise",
    "screensReviewed": ["home", "action", "result"],
    "findings": [
      {
        "id": "visual-01",
        "screen": "home",
        "severity": "major",
        "problem": "Конкретный видимый дефект",
        "fix": "Что было изменено",
        "status": "fixed"
      }
    ]
  },
  "signals": [
    {
      "id": "signal-12",
      "decision": "intentional",
      "reason": "Почему решение улучшает экран"
    }
  ]
}
```

Числового рейтинга нет: среднее 8.5/10 не должно скрывать один major-дефект.

Review становится stale после любого изменения входных HTML, CSS, spec или PNG. Нельзя скопировать старое `review.json` в новый концепт или отметить непросмотренные экраны как готовые.

## 7. Новый review loop

```text
свободная авторская версия
  → product critique
  → продуктовые и сценарные улучшения
  → build + capture всех экранов
  → objective audits + heuristic signals
  → визуальный review каждого PNG
  → исправления
  → новый полный capture
  → повторный review с нуля
  → proof
```

Минимум двух проходов не задаётся числом в контракте. Повтор выполняется столько раз, сколько требуется для закрытия blocker/major. Если первый проход не нашёл проблем, reviewer обязан явно подтвердить просмотр каждого product screen; pipeline не выдумывает искусственные дефекты ради счётчика.

## 8. Детекторы первой версии

### 8.1. Copy hygiene

- caps-строки в видимом продуктовой UI, исключая аббревиатуры и системные константы;
- точки в конце коротких controls и labels, исключая body copy, юридический текст и многострочные сообщения;
- одинаковая синтаксическая форма трёх и более описательных строк;
- авторская речь про «этот экран», «концепт», «пользователя» и устройство UI.

### 8.2. Surface hygiene

- количество видимых borders/dividers и их площадь/длина;
- последовательности однотипных bordered containers;
- вложенность surface внутри surface;
- эффекты без изменения роли, состояния или depth;
- несколько одновременных способов разделения: border + shadow + background + radius.

Все результаты — signals, не hard failures.

### 8.3. Alignment and rhythm

Для каждого экрана detector собирает геометрию видимых элементов и:

- кластеризует left/right edges с допуском 2 px;
- находит одиночные отклонения от устойчивых направляющих;
- сравнивает inset однотипных элементов;
- проверяет baseline соседних icon/text;
- находит spacing values, встречающиеся один раз без очевидной причины;
- генерирует screenshot overlay направляющих.

Центрированная, edge-to-edge и намеренно асимметричная композиция не считаются ошибкой автоматически.

### 8.4. Cross-screen consistency

- один semantic role не должен менять typography без причины;
- одинаковые controls должны иметь одинаковую геометрию и states;
- один объект не должен называться по-разному;
- root navigation должна быть стабильной;
- изменение surface language между экранами формирует сигнал для review.

## 9. Что переиспользуем

Оставляем и подключаем за новым interface:

- `validate()` и UI contract;
- `lint-concept.mjs`;
- `audit-visual.mjs`;
- `audit-grid.mjs`;
- browser flow tests;
- `capture.mjs`;
- product brief, vertical slice и readiness research.

Удаляем из readiness самодекларируемые `visualPasses` после миграции на hash-bound review evidence.

## 10. План реализации

### Milestone 1. Characterization

- Зафиксировать текущий результат `proof` и `check` тестами.
- Добавить fixtures хорошего намеренного border/divider и очевидного слопа.
- Гарантировать, что 34 существующих концепта продолжают собираться без миграции.

### Milestone 2. Deep module

- Создать `scripts/quality-review.mjs` и внутренние modules для bundle, hashes и findings.
- Подключить `npm run review -- <slug>`.
- Покрыть внешний interface тестами; внутренние seams не публиковать.

### Milestone 3. Detectors

- Реализовать copy hygiene.
- Реализовать surface hygiene.
- Расширить geometry probe направляющими, baseline и spacing outliers.
- Научить capture разделять product и system sheets.

### Milestone 4. Evidence gate

- Ввести manifest и schema review.
- Проверять hashes, покрытие экранов и defect lifecycle.
- Подключить `verifyQualityReview` к `proof`.
- Сохранить legacy mode для 34 концептов; новый `_template` использует quality contract v3.

### Milestone 5. Agent workflow

- Обновить PLAYBOOK и scaffold instructions.
- Дать reviewer один цельный prompt: сначала усиление, затем очистка, затем экранный verdict.
- Запретить общие замечания без screen/evidence/proposal.

### Milestone 6. Pilot

- Создать новый концепт на произвольную тему и с любым из четырёх target sets.
- Пройти полный цикл от пустого scaffold до accepted review.
- Сравнить число итераций, найденные дефекты и итоговую визуальную зрелость с текущим процессом.
- По результатам пилота настроить detectors; не добавлять новые layout constraints.

## 11. Acceptance criteria

- Генератор не получает новых обязательных композиционных полей.
- Ни border, ни divider, ни caps, ни асимметрия не блокируются без review judgment.
- Объективные дефекты остаются hard failures.
- Каждый product screen связан с актуальным PNG hash и review verdict.
- Изменение HTML/CSS/spec делает старый review непригодным.
- Открытый blocker/major блокирует proof.
- Любой heuristic signal имеет evidence и явное решение.
- Product review содержит конкретные усиления или доказательное объяснение, почему дополнительных изменений не требуется.
- Auth/system не участвуют в оценке оригинальности product UI.
- Все 34 существующих концепта продолжают собираться.
- Новый pilot concept проходит полный цикл и демонстрирует отсутствие незакрытых blocker/major.

## 12. Не делаем

- не создаём универсальный визуальный стиль;
- не выбираем за автора layout;
- не вводим design score;
- не оптимизируем интерфейс под прохождение метрик;
- не делаем screenshot similarity самостоятельным блокером;
- не заставляем каждый концепт быть визуально эксцентричным;
- не смешиваем эту работу с native generator.

Итоговый критерий один: pipeline помогает свободному автору получить значительно более сильный продукт и интерфейс, но не подменяет дизайн набором удобных для машины решений.
