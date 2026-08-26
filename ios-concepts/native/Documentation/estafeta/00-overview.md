# Эстафета: developer product guide

> Product Blueprint: `estafeta`; target: `vkontakte`; strategy: `mimicry`.
> Generated documentation is reproducible and must not drift from the native manifest. A separate delivery receipt proves build, XCUI and visual review; documentation generation alone never claims handoff readiness.

## Product in one paragraph

Знакомый человек передаёт небольшой выполнимый ход, участник показывает собственное продолжение и передаёт цепочку дальше.

## Developer Kit contents

1. Product vision, audience, scope and non-goals.
2. Domain glossary, entities, actions and persistence.
3. Core loop and executable critical flows.
4. Navigation graph and complete screen/state/action matrix.
5. Design tokens and semantic component rules.
6. Localization catalog and deterministic fixtures.
7. User-consent permissions and platform capabilities with real outcomes.
8. Architecture module seams and file ownership.
9. Privacy, accessibility, analytics and service-state behavior.
10. Acceptance scenarios, XCUI evidence, build and capture instructions.

## Product scale

- 13 product screens.
- 33 declared actions.
- 22 contextual iOS capabilities.
- 26 localized interface strings.
- 29 acceptance scenarios.
- 13 deterministic fixture groups.

## Primary loop

- `open_relay`: Человек видит текущий ход, условие и цепочку знакомых участников
- `accept_turn`: Текущий ход закрепляется за участником и открывает создание продолжения
- `capture_chapter`: Снятый результат становится новой видимой главой эстафеты
- `pass_turn`: Следующий знакомый получает персональный ход с готовым продолжением

## Reading order

Start with **Product vision**, then **Core loop and flows**, **Navigation**, and **Screen/state/action matrix**. Engineers implementing platform behavior should continue with **Permissions**, **Architecture**, and **Testing and evidence**.
