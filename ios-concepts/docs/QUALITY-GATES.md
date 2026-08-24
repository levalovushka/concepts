# Ворота качества

## Что блокируется автоматически

- неполный `concept.json`, UI-контракт или неизвестная композиция;
- действие без результата, хранения, error/retry для async;
- action contract v3 без семантического variant, совместимого placement,
  явного enablement и полного async fallback/success outcome;
- недостижимый маршрут и случайный переход между вкладками;
- capability без Info.plist/entitlement/extension/runtime lifecycle;
- декоративные плейсхолдеры, случайный капс, запрещённые градиенты и мелкий текст;
- screenshot state без capture driver и объявленные различия с одинаковыми PNG;
- мимикрия по незавершённому reference profile;
- Xcode build, который не собирается.
- compatibility `Theme`, `DvorStyle` и app-local `Color(hex:)`: бюджет равен нулю;
- любое primary action Looks без replay-сценария с outcome assertion;
- direct-launch capture `event`/`swap`, не подтвердивший ненулевую верхнюю safe area.
- прямые SF Symbols для повторяющихся back/disclosure/more/search/notification
  ролей вне `NativeVisualLanguage`;
- SF Symbols в VK-mimicry root tab bar (Looks/Dvor) или Lucide в
  differentiation/platform actions;
- Lucide source без pinned version, ISC license, безопасного 24pt SVG и
  детерминированных regular/selected template assets.

## Что нельзя честно доказать regex-тестом

Композицию, визуальный ритм, оптическое выравнивание, ясность продукта и сходство с референсом оценивают по свежим снимкам полного flow. Итоговая рубрика имеет пять независимых осей: продукт, иерархия, консистентность, визуальная точность, предсказуемость поведения. Наличие кода или зелёных unit tests не повышает оценку автоматически.

Детерминированный interaction replay проверяет продуктовый outcome через те же
seams, что runtime: capability adapter, navigation, mutation и persistence. Он
покрывает failure → retry → success, disabled → enabled, denied → fallback и
persist/restore без хрупкой привязки к координатам SwiftUI.

Граница: replay не проверяет UIKit hit-testing, TCC transition,
accessibility tree и Dynamic Type. Это делает тонкий Looks XCUI smoke-layer:
`npm run smoke -- looks`. Он собирается как отдельный generated target и не
запускается в обычном `build`. TCC-диалог не автоматизируется:
launch-environment adapter подтверждает факт правильного permission request.

## Factory readiness

`npm run readiness` всегда пишет `docs/factory-readiness.json` и не маскирует
ручные blockers. `npm run readiness:gate` — строгие ворота: они падают, пока не
закрыты automated evidence, независимое product/visual review, физическое
устройство и VoiceOver. Automated confidence и human score — разные поля;
зелёные тесты не изменяют human score.

`npm run matrix` прогоняет Looks и Dvor на `iPhone 17 Pro` и small-phone
`iPhone 16e`: XCUI smoke с Accessibility XXXL и целевые root captures. Tab bar
остаётся системным SwiftUI `TabView`, поэтому Liquid Glass не симулируется
кастомной панелью.
