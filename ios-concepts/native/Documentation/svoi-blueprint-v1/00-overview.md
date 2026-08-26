# Свои: developer product guide

> Product Blueprint: `svoi-blueprint-v1`; target: `vkontakte`; strategy: `mimicry`.
> Generated documentation is reproducible and must not drift from the native manifest. A separate delivery receipt proves build, XCUI and visual review; documentation generation alone never claims handoff readiness.

## Product in one paragraph

Знакомая авторская лента, в которой люди и сообщества публично доводят небольшие дела до результата: объявляют конкретный итог, получают помощь, показывают ход работы, завершают доказательством и передают продолжение другим.

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

- 15 product screens.
- 52 declared actions.
- 22 contextual iOS capabilities.
- 53 localized interface strings.
- 15 acceptance scenarios.
- 11 deterministic fixture groups.

## Primary loop

- `create_deed`: Создан черновик дела.
- `edit_deed_text`: Сохранены результат и описание дела.
- `publish_deed`: Дело опубликовано в ленте со статусом active.
- `support_deed`: Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз.

## Reading order

Start with **Product vision**, then **Core loop and flows**, **Navigation**, and **Screen/state/action matrix**. Engineers implementing platform behavior should continue with **Permissions**, **Architecture**, and **Testing and evidence**.
