# Factory readiness: native iOS

Factory-ready означает не «тесты зелёные», а одновременно:

1. Product Brief прошёл maturity gates, а Product Contract связан со стабильным Selection Receipt;
2. UX Specification полон, достижим и покрыт acceptance scenarios/fixtures;
3. developer guide дословно соответствует Product Contract, UX Specification и native manifest;
4. visual language проходит semantic drift gate;
5. primary interactions имеют предсказуемый outcome;
6. permissions/capabilities материализуются в build artifacts;
7. current и small-phone captures свежие и проверены глазами;
8. clean regeneration и обе Xcode builds воспроизводимы;
9. независимый критик закрыл product/visual rubric;
10. физическое устройство и VoiceOver проверены человеком.

Команды:

```bash
npm run check:all
npm run build -- looks
npm run build -- dvor
npm run matrix
npm run readiness
npm run readiness:gate
```

`check:all` для каждого концепта начинает с product maturity, затем компилирует
Product Contract + UX Specification, проверяет developer guide и только после
этого генерирует проект и запускает семантические аудиты.

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
