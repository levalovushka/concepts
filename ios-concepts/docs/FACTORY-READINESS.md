# Factory readiness: native iOS

Factory-ready означает не «тесты зелёные», а одновременно:

1. product contract компилируется без доменных подмен;
2. visual language проходит semantic drift gate;
3. primary interactions имеют предсказуемый outcome;
4. permissions/capabilities материализуются в build artifacts;
5. current и small-phone captures свежие и проверены глазами;
6. clean regeneration и обе Xcode builds воспроизводимы;
7. независимый критик закрыл product/visual rubric;
8. физическое устройство и VoiceOver проверены человеком.

Команды:

```bash
npm run check:all
npm run build -- looks
npm run build -- dvor
npm run matrix
npm run readiness
npm run readiness:gate
```

Последняя команда намеренно остаётся красной до закрытия manual gates.
Источником human score служит `native/factory-readiness-input.json`, а не число
пройденных тестов. Machine-readable результат — `docs/factory-readiness.json`.

## Physical device / VoiceOver checklist

- Установить обе Debug-сборки на поддерживаемый iPhone с iOS 26.x.
- С чистым TCC пройти camera, photos, microphone, location, notifications,
  Face ID/Touch ID, local network и credential flows; сверить request point и fallback.
- Включить VoiceOver: проверить порядок чтения root header → content → tab bar,
  labels/badges пяти Looks и четырёх Dvor tabs, rotor Actions, announcements для
  loading/error/success и отсутствие дублированного имени у icon-only controls.
- На Larger Text / Accessibility XXXL проверить auth, home, search mosaic,
  chat, cards/forms, pushed navigation chrome и отсутствие обрезки.
- Проверить Liquid Glass tab bar на светлом, grouped и immersive фоне,
  selected/unselected Lucide в обоих VK-mimicry концептах.
- Приложить device model, iOS build, locale, color scheme, recording/screenshots,
  имя проверяющего и дату; только после этого поменять manual gate на `complete`.

Симуляторные XCUI не выдаются за VoiceOver или physical-device automation.
