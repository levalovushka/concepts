# __NAME__ — quality evidence

Этот файл объясняет workflow. Каноническое evidence живёт в `artifacts/quality/<run-id>/` и связано с spec, HTML, CSS и PNG хешами. `readiness.visualPasses` не используется.

## Первичные источники

Для каждого источника: точная ссылка или название официального приложения/гайда → наблюдаемое поведение → решение в концепте. Не записывать абстрактные «вдохновение» и «визуальный стиль».

## Product critique

Минимум три сильных возражения: почему это может быть фичей, почему пользователь не вернётся, где мимикрия не попадает в категорию. Для каждого — изменение продукта и экраны-доказательства.

## Product review

Зафиксировать strengths и concrete opportunities: problem → proposal → evidence screens → resolution.
Указать `reviewer.role = critic`, устойчивый id проверяющего и метод просмотра: автор и критик не являются одной ролью.

## Visual review

Сначала вынести конкретный вердикт по product contact sheet: первое впечатление, сильнейший экран, слабейший экран, риск повторяемости.

Затем пройти каждый product PNG в полном размере и заполнить его `screenReview`: evidence, hierarchy, typography, color, composition. После этого сделать поперечный проход `hierarchy / typography / color / composition / cohesion`, указав экраны-доказательства, наблюдение и решение. Это не design score: автоматика проверяет полноту evidence, эстетический вердикт остаётся за reviewer.

Auth/system contact sheet просматривается отдельно на согласованность с продуктом и не участвует в оценке оригинальности. Записать `systemFit` и полный список просмотренных system screens.

На journey sheet `auth → product` сравнить только три повторяющихся семейства: primary action, navigation chrome, surface language. Резкий скачок светлоты, геометрии primary action, semantic typography, состояния одинакового control или названия одного перехода создаёт signal, но не автоматический запрет: различие разрешено, если связано с ролью и явно обосновано.

Каждый finding содержит screen, severity, problem, видимое evidence, status и resolution для исправленного дефекта. Пустой findings требует содержательного `noFindingsRationale`. Каждый heuristic signal получает отдельное решение reviewer; решение `defect` связывается через `signalId` с исправленным visual finding.

## Repeat

Если review нашёл blocker/major, завершить run как `revise`. После правки снова запустить `npm run review -- <slug>` и заполнить новый `review.json`; `proof` проверит ссылку на critique run и изменение source hashes. Если первый полный review чистый, придумывать дефект ради второго run не нужно.

## Interaction pass

Root tabs, push/back, fullscreen, каждый permission grant/deny и fallback.
